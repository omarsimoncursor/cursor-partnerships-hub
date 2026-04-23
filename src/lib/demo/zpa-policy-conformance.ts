/**
 * Reads infrastructure/zscaler/workforce-admin.tf, extracts the access-rule
 * conditions, and evaluates four canonical requests against the rule.
 *
 * This mirrors what the Cursor agent runs in step 6 of the workflow:
 *   `terraform plan` + a policy-conformance probe.
 *
 * The parser is intentionally conservative — it only understands the subset
 * of HCL the demo .tf file uses (resource, conditions, operands, object_type,
 * lhs, rhs). It is not a general-purpose HCL parser.
 */
import { promises as fs } from 'fs';
import path from 'path';

export interface PolicyOperand {
  object_type: string;
  lhs?: string;
  rhs?: string;
  entry_values?: Array<{ lhs?: string; rhs?: string }>;
}

export interface PolicyConditionBlock {
  operator: 'AND' | 'OR';
  operands: PolicyOperand[];
}

export interface PolicyAccessRule {
  name: string;
  action: 'ALLOW' | 'DENY' | 'REQUIRE_APPROVAL';
  operator: 'AND' | 'OR';
  conditions: PolicyConditionBlock[];
}

export interface AccessRequest {
  user_id: string;
  scim_groups: string[];
  posture: 'managed-compliant' | 'managed-noncompliant' | 'unmanaged' | 'unknown';
  trusted_network: boolean;
  client_type:
    | 'zpn_client_type_zapp'
    | 'zpn_client_type_exporter'
    | 'zpn_client_type_browser_isolation'
    | 'zpn_client_type_branch_connector'
    | 'zpn_client_type_zia_inspection';
  app_segment: string;
}

export interface ConformanceResult {
  request: AccessRequest;
  allow: boolean;
  matchedConditions: string[];
  unmatchedConditions: string[];
}

export interface ScopeReport {
  inScope: number;
  intent: number;
  ratio: string;
  unmanagedDevicePaths: number;
  hasScimCondition: boolean;
  hasPostureCondition: boolean;
  hasTrustedNetworkCondition: boolean;
  hasClientTypeCondition: boolean;
}

/* ------------------------------------------------------------------ */
/* HCL parser (just-enough)                                            */
/* ------------------------------------------------------------------ */

export function parseAccessRule(hcl: string, resourceName: string): PolicyAccessRule | null {
  const headerRe = new RegExp(
    `resource\\s+"zpa_policy_access_rule"\\s+"${resourceName}"\\s*\\{`,
    'm'
  );
  const headerMatch = hcl.match(headerRe);
  if (!headerMatch) return null;

  const start = headerMatch.index! + headerMatch[0].length;
  const body = sliceBalanced(hcl, start);
  if (!body) return null;

  const name = extractScalarString(body, 'name') ?? resourceName;
  const action = (extractScalarString(body, 'action') as PolicyAccessRule['action']) ?? 'ALLOW';
  const operator = (extractScalarString(body, 'operator') as PolicyAccessRule['operator']) ?? 'AND';

  const conditions = extractBlocks(body, 'conditions').map(condBody => {
    const condOperator =
      (extractScalarString(condBody, 'operator') as PolicyConditionBlock['operator']) ?? 'OR';
    const operands = extractBlocks(condBody, 'operands').map(opBody => {
      const operand: PolicyOperand = {
        object_type: extractScalarString(opBody, 'object_type') ?? '',
      };
      const lhs = extractScalarValue(opBody, 'lhs');
      if (lhs !== null) operand.lhs = lhs;
      const rhs = extractScalarValue(opBody, 'rhs');
      if (rhs !== null) operand.rhs = rhs;
      const entries = extractBlocks(opBody, 'entry_values').map(eBody => ({
        lhs: extractScalarValue(eBody, 'lhs') ?? undefined,
        rhs: extractScalarValue(eBody, 'rhs') ?? undefined,
      }));
      if (entries.length > 0) operand.entry_values = entries;
      return operand;
    });
    return { operator: condOperator, operands };
  });

  return { name, action, operator, conditions };
}

function sliceBalanced(text: string, start: number): string | null {
  let depth = 1;
  for (let i = start; i < text.length; i++) {
    const ch = text[i];
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return text.slice(start, i);
    }
  }
  return null;
}

function extractScalarString(body: string, key: string): string | null {
  const re = new RegExp(`\\b${key}\\s*=\\s*"([^"]*)"`, 'm');
  const m = body.match(re);
  return m ? m[1] : null;
}

function extractScalarValue(body: string, key: string): string | null {
  const quoted = extractScalarString(body, key);
  if (quoted !== null) return quoted;
  const re = new RegExp(`\\b${key}\\s*=\\s*([^\\n#]+)`, 'm');
  const m = body.match(re);
  return m ? m[1].trim().replace(/,$/, '') : null;
}

function extractBlocks(body: string, key: string): string[] {
  const out: string[] = [];
  const re = new RegExp(`\\b${key}\\s*\\{`, 'g');
  let match: RegExpExecArray | null;
  while ((match = re.exec(body)) !== null) {
    const inner = sliceBalanced(body, match.index + match[0].length);
    if (inner !== null) out.push(inner);
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Evaluator                                                           */
/* ------------------------------------------------------------------ */

const REFERENCED_GROUP_HINTS = ['security-admin', 'compliance-officer'];

export function evaluateRequest(
  rule: PolicyAccessRule,
  req: AccessRequest
): ConformanceResult {
  const matched: string[] = [];
  const unmatched: string[] = [];

  // Each `conditions` block must be satisfied (joined by rule.operator AND/OR).
  // Within a block, operands are joined by the block's operator.
  const blockResults: boolean[] = [];

  for (const block of rule.conditions) {
    const operandResults = block.operands.map(op => evaluateOperand(op, req));
    const blockResult =
      block.operator === 'AND' ? operandResults.every(Boolean) : operandResults.some(Boolean);

    block.operands.forEach((op, i) => {
      const tag = `${op.object_type}${op.rhs ? `:${op.rhs}` : ''}`;
      (operandResults[i] ? matched : unmatched).push(tag);
    });

    blockResults.push(blockResult);
  }

  const ruleAllowed =
    blockResults.length === 0
      ? false
      : rule.operator === 'AND'
        ? blockResults.every(Boolean)
        : blockResults.some(Boolean);

  // ALLOW rule with no conditions = always allow (the bug shape).
  const finalAllow =
    rule.action === 'ALLOW' && (blockResults.length === 0 ? true : ruleAllowed);

  return { request: req, allow: finalAllow, matchedConditions: matched, unmatchedConditions: unmatched };
}

function evaluateOperand(op: PolicyOperand, req: AccessRequest): boolean {
  switch (op.object_type) {
    case 'APP':
      // APP id reference always evaluated as the app under test
      return true;
    case 'SCIM_GROUP': {
      const rhs = normalizeRef(op.rhs ?? '');
      const groupSlug = REFERENCED_GROUP_HINTS.find(g => rhs.includes(normalizeRef(g)));
      if (!groupSlug) return false;
      return req.scim_groups.includes(groupSlug);
    }
    case 'POSTURE':
      // RHS "true" means posture must be satisfied (managed-compliant)
      return op.rhs === 'true' ? req.posture === 'managed-compliant' : true;
    case 'TRUSTED_NETWORK':
      return op.rhs === 'true' ? req.trusted_network : true;
    case 'CLIENT_TYPE':
      return req.client_type === op.rhs;
    case 'COUNTRY_CODE':
    case 'PLATFORM':
    case 'CHROME_ENTERPRISE':
      // Evaluate as match for the demo
      return true;
    default:
      return true;
  }
}

function normalizeRef(value: string): string {
  return value.toLowerCase().replace(/_/g, '-');
}

/* ------------------------------------------------------------------ */
/* Scope summary                                                       */
/* ------------------------------------------------------------------ */

export function summarizeScope(rule: PolicyAccessRule): ScopeReport {
  const allOperands = rule.conditions.flatMap(c => c.operands);
  const types = new Set(allOperands.map(o => o.object_type));

  const hasScim = types.has('SCIM_GROUP') || types.has('SCIM') || types.has('SAML');
  const hasPosture = types.has('POSTURE');
  const hasNet = types.has('TRUSTED_NETWORK') || types.has('COUNTRY_CODE');
  const hasClient = types.has('CLIENT_TYPE');

  const wideOpen = !hasScim && !hasPosture && !hasNet && !hasClient;

  const inScope = wideOpen ? 4287 : 18;
  const intent = 18;
  const ratio = inScope > intent ? `${(inScope / intent).toFixed(1)}x` : '1.0x';
  const unmanagedDevicePaths = !hasPosture ? 1 : 0;

  return {
    inScope,
    intent,
    ratio,
    unmanagedDevicePaths,
    hasScimCondition: hasScim,
    hasPostureCondition: hasPosture,
    hasTrustedNetworkCondition: hasNet,
    hasClientTypeCondition: hasClient,
  };
}

/* ------------------------------------------------------------------ */
/* Canonical 4-request probe                                           */
/* ------------------------------------------------------------------ */

export const PROBE_REQUESTS: AccessRequest[] = [
  {
    user_id: 'alice@cursor.demo',
    scim_groups: ['security-admin'],
    posture: 'managed-compliant',
    trusted_network: true,
    client_type: 'zpn_client_type_zapp',
    app_segment: 'workforce-admin-audit-logs',
  },
  {
    user_id: 'bob@cursor.demo',
    scim_groups: ['security-admin'],
    posture: 'managed-noncompliant',
    trusted_network: true,
    client_type: 'zpn_client_type_zapp',
    app_segment: 'workforce-admin-audit-logs',
  },
  {
    user_id: 'carol@cursor.demo',
    scim_groups: ['employee'],
    posture: 'managed-compliant',
    trusted_network: true,
    client_type: 'zpn_client_type_zapp',
    app_segment: 'workforce-admin-audit-logs',
  },
  {
    user_id: 'unmanaged-device-44',
    scim_groups: [],
    posture: 'unmanaged',
    trusted_network: false,
    client_type: 'zpn_client_type_exporter',
    app_segment: 'workforce-admin-audit-logs',
  },
];

export const EXPECTED_DECISIONS: boolean[] = [true, false, false, false];

/* ------------------------------------------------------------------ */
/* Disk loader                                                         */
/* ------------------------------------------------------------------ */

export async function loadWorkforceAdminPolicy(): Promise<{
  rule: PolicyAccessRule;
  source: string;
  filePath: string;
}> {
  const filePath = path.join(
    process.cwd(),
    'infrastructure',
    'zscaler',
    'workforce-admin.tf'
  );
  const source = await fs.readFile(filePath, 'utf8');
  const rule = parseAccessRule(source, 'workforce_admin_audit_logs_allow');
  if (!rule) {
    throw new Error('Could not parse workforce_admin_audit_logs_allow from workforce-admin.tf');
  }
  return { rule, source, filePath };
}
