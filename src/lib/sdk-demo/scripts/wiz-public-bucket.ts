import type { RuntimeStep } from '../types';

export const WIZ_PUBLIC_BUCKET_SCRIPT: RuntimeStep[] = [
  {
    channel: 'sdk',
    delayMs: 250,
    label: 'Webhook received from Wiz',
    detail: 'POST /webhooks/wiz · CRITICAL issue · 1.4 GB of PII at risk',
    sdkEvent: { type: 'agent.create', payload: 'model: composer-2 · 6 MCPs configured' },
  },
  {
    channel: 'sdk',
    delayMs: 200,
    label: 'agent.send() — agent-bc-7c1a04ef',
    detail: 'cloud.repos: acme/infra-terraform@main',
    sdkEvent: { type: 'agent.send', payload: 'agentId=bc-7c1a04ef · status=PENDING' },
  },
  {
    channel: 'sdk',
    delayMs: 350,
    label: 'status.change → RUNNING',
    detail: 'workspace provisioned',
    sdkEvent: { type: 'status.change', payload: 'PENDING → RUNNING' },
  },

  {
    channel: 'wiz',
    delayMs: 500,
    label: 'Fetching Wiz issue detail',
    detail: 'issue 8a3f-9c2e · resource: arn:aws:s3:::acme-customer-exports',
    sdkEvent: { type: 'tool.call', payload: 'wiz-mcp · issues.get(8a3f-9c2e)' },
  },
  {
    channel: 'wiz',
    delayMs: 400,
    label: 'Asset Graph: blast radius computed',
    detail: '1.4 GB scanned · 412 customer records inferred · 0 access events in last 24h',
    sdkEvent: { type: 'tool.result', payload: '200 OK · blast radius: medium · exfil: not detected' },
  },

  {
    channel: 'opus',
    delayMs: 800,
    label: 'Claude Opus: forming response plan',
    detail: 'Containment first: enable PublicAccessBlock now · then narrow IAM · then PR',
    sdkEvent: { type: 'assistant', payload: '"Containment via PublicAccessBlock immediately, then IaC PR."' },
  },

  {
    channel: 'aws',
    delayMs: 600,
    label: 's3.put_public_access_block(acme-customer-exports)',
    detail: 'all 4 sub-flags = true · bucket policy allowing public read removed',
    sdkEvent: { type: 'tool.call', payload: 'aws-mcp · s3.put_public_access_block(...)' },
  },
  {
    channel: 'aws',
    delayMs: 280,
    label: 's3.delete_bucket_policy()',
    detail: 'wildcard public-read policy detached · 1 policy removed',
    sdkEvent: { type: 'tool.result', payload: '204 No Content · 277ms' },
  },
  {
    channel: 'aws',
    delayMs: 350,
    label: 'cloudtrail.lookup(last_30d)',
    detail: 'extracting actually-used s3 actions for least-privilege scope',
    sdkEvent: { type: 'tool.call', payload: 'aws-mcp · cloudtrail.lookup_events(...)' },
  },
  {
    channel: 'aws',
    delayMs: 420,
    label: 'usage analyzed · 4 actions in scope',
    detail: 's3:GetObject · s3:PutObject · s3:ListBucket · s3:GetBucketLocation',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 11 events · 4 distinct actions' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'reading terraform/modules/customer-exports.tf',
    detail: '142 lines loaded',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · contents.get(...)' },
  },
  {
    channel: 'composer',
    delayMs: 700,
    label: 'Composer: rewriting bucket policy',
    detail: 'replacing s3:* / "*" with least-privilege scope',
    sdkEvent: { type: 'assistant', payload: 'edit customer-exports.tf · -8 +21' },
  },
  {
    channel: 'composer',
    delayMs: 500,
    label: 'Composer: removing acl = "public-read"',
    detail: 'replacing with PublicAccessBlock + bucket-owner-enforced',
    sdkEvent: { type: 'assistant', payload: 'edit · 1 line' },
  },
  {
    channel: 'codex',
    delayMs: 600,
    label: 'Codex review · ✓ no behavioral change for legitimate callers',
    detail: 'Lambda batch_export + ETL job both retain required scope',
    sdkEvent: { type: 'assistant', payload: '"Reviewed against 4 known callers. Safe."' },
  },

  {
    channel: 'shell',
    delayMs: 500,
    label: 'terraform fmt · terraform validate',
    detail: '✓ formatted · ✓ valid',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 489ms' },
  },
  {
    channel: 'shell',
    delayMs: 800,
    label: 'terraform plan',
    detail: '~ aws_s3_bucket_public_access_block · - aws_s3_bucket_policy · ~ acl',
    sdkEvent: { type: 'tool.result', payload: 'exit 0 · 3 to change · 1 to destroy · 0 to add' },
  },

  {
    channel: 'github',
    delayMs: 400,
    label: 'branch.create(security/lock-customer-exports-bucket)',
    detail: 'base: main · author: cursor-agent',
    sdkEvent: { type: 'tool.call', payload: 'github-mcp · git.refs.create(...)' },
  },
  {
    channel: 'github',
    delayMs: 450,
    label: 'pulls.create #2204',
    detail: '"security: lock down customer-exports bucket (Wiz 8a3f-9c2e)"',
    sdkEvent: { type: 'tool.result', payload: '201 Created · #2204' },
  },

  {
    channel: 'jira',
    delayMs: 500,
    label: 'Creating CUR-SEC-2207',
    detail: 'P0 · Security incident · components: aws, terraform, customer-exports',
    sdkEvent: { type: 'tool.call', payload: 'jira-mcp · issues.create(...)' },
  },
  {
    channel: 'jira',
    delayMs: 320,
    label: 'CUR-SEC-2207 → Awaiting Review',
    detail: 'linked: Wiz 8a3f-9c2e · PR #2204',
    sdkEvent: { type: 'tool.result', payload: '200 OK · status transitioned' },
  },

  {
    channel: 'slack',
    delayMs: 480,
    label: 'chat.postMessage(#security-incidents)',
    detail: 'structured incident summary · @on-call paged',
    sdkEvent: { type: 'tool.call', payload: 'slack-mcp · chat.postMessage(...)' },
  },

  {
    channel: 'wiz',
    delayMs: 350,
    label: 'issues.update(status=resolved)',
    detail: 'Wiz issue 8a3f-9c2e closed · resolution attached',
    sdkEvent: { type: 'tool.result', payload: '200 OK · 348ms' },
  },

  {
    channel: 'sdk',
    delayMs: 350,
    label: 'step.complete · all 22 steps emitted',
    detail: 'cumulative billed time: 47.2s · wall time: 17.8s',
    sdkEvent: { type: 'step.complete', payload: 'final step · agent ready to wait()' },
  },
  {
    channel: 'done',
    delayMs: 280,
    label: 'agent.wait() → { status: "FINISHED" }',
    detail: 'artifacts ready for review',
    sdkEvent: { type: 'agent.wait', payload: 'status: FINISHED · 4 artifacts' },
  },
];
