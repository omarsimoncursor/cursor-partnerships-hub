import { promises as fs } from 'node:fs';
import path from 'node:path';

// Next.js may bundle this route, so __dirname would point inside `.next/`.
// Resolve against the project root instead.
const LEGACY_DIR = path.join(process.cwd(), 'src', 'lib', 'demo', 'legacy-monolith');

export interface LegacyFileSummary {
  name: string;
  language: 'java' | 'xml' | 'sql';
  loc: number;
  bytes: number;
  boundaryViolations: string[];
}

export interface LegacyScan {
  files: LegacyFileSummary[];
  totalLoc: number;
  totalViolations: number;
}

const VIOLATION_PATTERNS: Record<
  LegacyFileSummary['language'],
  Array<{ pattern: RegExp; label: string }>
> = {
  java: [
    { pattern: /@Stateless\b/, label: 'Stateless EJB coupled to WebSphere runtime' },
    { pattern: /@PersistenceContext\b/, label: 'Container-managed EntityManager (WebSphere JTA)' },
    { pattern: /InitialContext\s*\(\s*\)\s*\.\s*lookup/, label: 'JNDI lookup inside hot path' },
    { pattern: /CallableStatement/, label: 'Direct CallableStatement to Oracle stored proc' },
    { pattern: /registerOutParameter\s*\(\s*\d+\s*,\s*Types\.REF_CURSOR/, label: 'REF_CURSOR out-parameter (Oracle-only)' },
    { pattern: /SEQ_[A-Z_]+\.NEXTVAL/, label: 'Oracle-specific SEQUENCE.NEXTVAL in application code' },
    { pattern: /SYSDATE/, label: 'Oracle SYSDATE leaking into JPA native query' },
    { pattern: /throws\s+[^{]*NamingException/, label: 'Checked NamingException leaking out of service' },
  ],
  xml: [
    { pattern: /OraclePlatform/, label: 'EclipseLink target-database pinned to Oracle' },
    { pattern: /target-server"\s+value="WebSphere/, label: 'EclipseLink target-server pinned to WebSphere' },
    { pattern: /jdbc\/OracleDS/, label: 'WebSphere JNDI DataSource (jdbc/OracleDS)' },
    { pattern: /batch-writing"\s+value="ORACLE-JDBC/, label: 'Oracle-specific JDBC batch-writing hint' },
    { pattern: /session\.customizer/, label: 'Oracle NLS session customizer' },
    { pattern: /connection-pool\.default\.max/, label: 'Monolith-sized JDBC pool (incompatible with Lambda concurrency)' },
  ],
  sql: [
    { pattern: /CREATE\s+SEQUENCE/i, label: 'Oracle SEQUENCE (no Aurora PG equivalent)' },
    { pattern: /SYS_REFCURSOR/i, label: 'REF CURSOR out-parameter streaming' },
    { pattern: /RAISE_APPLICATION_ERROR/i, label: 'Oracle RAISE_APPLICATION_ERROR in business logic' },
    { pattern: /NUMBER\s*\(/i, label: 'Oracle NUMBER precision columns (map to NUMERIC in PG)' },
    { pattern: /CHAR\s*\(\s*12\s*\)/i, label: 'Fixed-width CHAR status column' },
    { pattern: /SYSDATE/i, label: 'SYSDATE session-timezone dependency' },
    { pattern: /FROM\s+DUAL/i, label: 'Oracle DUAL pseudo-table reference' },
  ],
};

function detectLanguage(name: string): LegacyFileSummary['language'] {
  if (name.endsWith('.java')) return 'java';
  if (name.endsWith('.xml')) return 'xml';
  if (name.endsWith('.sql')) return 'sql';
  throw new Error(`Unknown legacy-monolith file: ${name}`);
}

async function readLegacyFile(name: string): Promise<{ body: string; summary: LegacyFileSummary }> {
  const full = path.join(LEGACY_DIR, name);
  const body = await fs.readFile(full, 'utf8');
  const language = detectLanguage(name);
  const loc = body.split('\n').length;
  const bytes = Buffer.byteLength(body, 'utf8');
  const violations = VIOLATION_PATTERNS[language]
    .filter(v => v.pattern.test(body))
    .map(v => v.label);
  return {
    body,
    summary: {
      name,
      language,
      loc,
      bytes,
      boundaryViolations: violations,
    },
  };
}

export async function scanLegacyMonolith(): Promise<{
  scan: LegacyScan;
  bodies: Record<string, string>;
}> {
  const names = ['OrdersService.java', 'persistence.xml', 'orders-ddl.sql'];
  const results = await Promise.all(names.map(readLegacyFile));

  const files = results.map(r => r.summary);
  const bodies: Record<string, string> = {};
  for (const r of results) {
    bodies[r.summary.name] = r.body;
  }

  const totalLoc = files.reduce((n, f) => n + f.loc, 0);
  const totalViolations = files.reduce((n, f) => n + f.boundaryViolations.length, 0);

  return {
    scan: { files, totalLoc, totalViolations },
    bodies,
  };
}
