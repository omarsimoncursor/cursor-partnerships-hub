'use client';

import {
  GitMerge,
  GitPullRequest,
  Check,
  MessageSquare,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Book,
} from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">
              cursor-for-enterprise
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Public</span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">12</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">341</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="3" />
          <NavTab label="Pull requests" count="2" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            feat(modernize): extract OrdersService → Lambda + Aurora Serverless v2 (1/38)
            <span className="text-[#7d8590] ml-2 font-light">#482</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A371F7] text-white text-[13px] font-medium">
            <GitMerge className="w-4 h-4" />
            Merged
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> merged{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">17 commits</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              main
            </span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              feat/modernize-orders-service
            </span>{' '}
            <span className="text-[#7d8590]">· 22 days · 4 review gates · senior code review at merge</span>
          </p>
        </div>
      </div>

      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="38" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="17" />
          <PrTab label="Checks" count="6" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="11" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="2 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Extract the{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">OrdersService</code>{' '}
                  bounded context from the WebSphere 8.5 + Oracle 12c monolith into a CDK-managed stack of Lambda (Node.js 20, AWS SDK v3, Powertools) + Aurora Serverless v2, with IAM least-privilege, Secrets Manager rotation, and VPC endpoints for Secrets Manager + RDS Data API. Eight boundary violations collapsed. <strong>1 / 38 bounded contexts shipped to prod in 22 calendar days, 4 / 4 human review gates passed.</strong> Est. portfolio finish: 18 months (vs GSI baseline 5 years).
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Timeline · 22 calendar days</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold w-[110px]">Day</th>
                        <th className="px-3 py-2 text-left font-semibold">Milestone</th>
                        <th className="px-3 py-2 text-left font-semibold w-[160px]">Owner</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <TimelineRow day="Day 1" who="Cursor agent" what="AWS Knowledge MCP intake · Bedrock decomposition · Composer drafts handler + CDK + PG migration + tests" />
                      <TimelineRow day="Day 2" who="Cursor agent" what="Codex IAM/VPC/cost audit · Composer iteration v2 · cdk synth + diff clean" />
                      <TimelineRow day="Day 2 PM" who="AWS SA + customer architect" what="Architecture review (gate 1/4) ✓" gate />
                      <TimelineRow day="Day 3" who="Cursor agent" what="cdk deploy --profile dev · sam local + integration tests · 4h CW soak" />
                      <TimelineRow day="Day 4" who="SecOps" what="Security review (gate 2/4) ✓ — IAM least-priv, Secrets Manager rotation, KMS, no public Aurora" gate />
                      <TimelineRow day="Day 6" who="FinOps" what="FinOps review (gate 3/4) ✓ — $6.3K/yr steady-state approved; reserved capacity deferred to wave 3" gate />
                      <TimelineRow day="Day 7–10" who="Cursor agent" what="cdk deploy --profile stage · k6 load test 2× peak prod · 3-day stage soak" />
                      <TimelineRow day="Day 11" who="Joint go/no-go" what="Cutover review (gate 4/4) ✓ — 5d dual-write window, traffic shift 5/25/50/100 over 36h" gate />
                      <TimelineRow day="Day 12–17" who="Cursor agent" what="Dual-write enabled · 3-day parity soak (100% reservation + revenue parity) · cutover complete" />
                      <TimelineRow day="Day 18–21" who="On-call" what="Hyper-care window · CW alarms quiet · 0 rollback events" />
                      <TimelineRow day="Day 22 AM" who="Senior engineer" what="Code review · 2 reviewers · 4 inline comments resolved · approved · merged" gate />
                    </tbody>
                  </table>
                </div>
                <p className="text-[12px] text-[#7d8590] mt-1">
                  Traditional baseline for the same context: <span className="line-through">~16 weeks</span>. Cursor compresses agent-doable work; review gates and load/soak windows are real wall-clock and surfaced explicitly.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Human review gates</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li><strong>Day 2 PM — Architecture review (gate 1/4)</strong> · AWS SA J. Park + customer architect S. Kim. Note: prefer RDS Data API over RDS Proxy for wave 1, revisit at wave 5.</li>
                  <li><strong>Day 4 — Security review (gate 2/4)</strong> · SecOps R. Davis. Codex-pre-screened policy held up. One follow-up filed: enforce CloudTrail S3 bucket policy (CUR-5310, Sev-3).</li>
                  <li><strong>Day 6 — FinOps review (gate 3/4)</strong> · FinOps M. Chen. $6,340/yr steady-state approved; reserved Aurora capacity deferred to wave 3.</li>
                  <li><strong>Day 11 — Cutover review (gate 4/4)</strong> · Joint go/no-go (customer architect + AWS SA). Approved 5d dual-write + 36h traffic shift.</li>
                  <li><strong>Day 22 — Senior code review</strong> · 2 reviewers @ acme-platform-eng. Approved.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Before / after run cost</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Line item</th>
                        <th className="px-3 py-2 text-right font-semibold">On-prem (slice)</th>
                        <th className="px-3 py-2 text-right font-semibold">AWS managed</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Compute</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">WebSphere 8.5 / Oracle 12c idle capacity</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">Lambda · $1,240/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−98%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Database</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">Oracle EE · $148K/yr (slice)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">Aurora Serverless v2 · $3,800/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−97%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Observability</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">Splunk + custom · $42K/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">CloudWatch · $820/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−98%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Secrets</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">bespoke vault · $28K/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">Secrets Manager · $480/yr</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−98%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Total annual (this slice)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">~$220,000</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">~$6,340</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−97%</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-[12px] text-[#7d8590] mt-1">
                  Portfolio progress: <strong className="text-[#FF9900]">1 / 38 bounded contexts extracted</strong>. Est. portfolio finish: 18 months.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Boundary violations collapsed</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Shared Oracle connection pool → isolated Aurora cluster per bounded context.</li>
                  <li>
                    JNDI lookup from handler → IAM role + AWS SDK v3 client.
                  </li>
                  <li>Synchronous cross-service stored proc → Lambda + Step Functions (async where safe).</li>
                  <li>WebSphere-specific EclipseLink properties → RDS Data API + PostgreSQL dialect.</li>
                  <li>Checked-exception leakage (NamingException, SQLException) → Powertools structured error handling.</li>
                  <li>
                    Oracle{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">REF_CURSOR</code>{' '}
                    out-parameter → Aurora PG{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">SETOF</code>{' '}
                    stored function{' '}
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">pg_reserve_inventory</code>.
                  </li>
                  <li>Oracle SEQUENCE.NEXTVAL → PG identity columns.</li>
                  <li>SYSDATE / session-NLS dependencies → UTC-normalized columns.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Well-Architected citations</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li><strong>OPS 05</strong> — automated deployment via CDK synth + CloudFormation change sets.</li>
                  <li><strong>SEC 02</strong> — IAM least-priv, Secrets Manager with rotation, no public Aurora endpoint.</li>
                  <li><strong>REL 09</strong> — Lambda retries, Aurora multi-AZ, dead-letter queue on failure.</li>
                  <li><strong>PERF 04</strong> — Aurora Serverless v2 autoscaling 0.5 → 8 ACU.</li>
                  <li><strong>COST 06</strong> — usage-based Lambda + Aurora ACUs + CW log retention 30d.</li>
                  <li><strong>SUS 03</strong> — managed services over idle on-prem capacity.</li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview — Java EE @Stateless → TS Lambda handler</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span className="bg-[#301216] text-[#f85149]">{`- @Stateless
- @TransactionAttribute(TransactionAttributeType.REQUIRED)
- public class OrdersService {
-     @PersistenceContext(unitName = "orders-pu")
-     private EntityManager em;
-     @Resource(mappedName = "jdbc/OracleDS")
-     private DataSource oracleDs;
-
-     public long reserveInventory(long orderId, String sku, int qty)
-             throws NamingException, SQLException {
-         Context ctx = new InitialContext();
-         DataSource ds = (DataSource) ctx.lookup(
-             "java:comp/env/jdbc/OracleDS");
-         CallableStatement cs = ds.getConnection()
-             .prepareCall("{ call SP_RESERVE_INVENTORY(?, ?, ?, ?) }");
-         cs.registerOutParameter(4, Types.REF_CURSOR);
-         ...
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+ // services/orders/src/handlers/create-order.ts
+ import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
+ import { RDSDataClient, ExecuteStatementCommand } from '@aws-sdk/client-rds-data';
+ import { Logger } from '@aws-lambda-powertools/logger';
+ import { Tracer } from '@aws-lambda-powertools/tracer';
+
+ const logger = new Logger({ serviceName: 'orders' });
+ const tracer = new Tracer({ serviceName: 'orders' });
+ const rds = tracer.captureAWSv3Client(new RDSDataClient({}));
+
+ export const handler: APIGatewayProxyHandlerV2 = async (event) => {
+   const { orderId, sku, qty } = JSON.parse(event.body ?? '{}');
+   const res = await rds.send(new ExecuteStatementCommand({
+     resourceArn: process.env.ORDERS_CLUSTER_ARN!,
+     secretArn:  process.env.ORDERS_SECRET_ARN!,
+     database:   'orders',
+     sql:        'SELECT * FROM pg_reserve_inventory(:oid, :sku, :qty)',
+     parameters: [
+       { name: 'oid', value: { longValue: orderId } },
+       { name: 'sku', value: { stringValue: sku } },
+       { name: 'qty', value: { longValue: qty } },
+     ],
+   }));
+   logger.info('reserved', { orderId, sku, qty });
+   return { statusCode: 200, body: JSON.stringify({ reservationId: res.records?.[0]?.[0] }) };
+ };
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">CDK stack (excerpt)</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span className="text-[#e6edf3]">{`// services/orders/infra/orders-stack.ts
const cluster = new rds.DatabaseCluster(this, 'OrdersCluster', {
  engine: rds.DatabaseClusterEngine.auroraPostgres({ version: AuroraPostgresEngineVersion.VER_15_4 }),
  serverlessV2MinCapacity: 0.5,
  serverlessV2MaxCapacity: 8,
  vpc, vpcSubnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
  storageEncrypted: true, enableDataApi: true,
});

const secret = cluster.secret!;
const fn = new lambda.NodejsFunction(this, 'CreateOrderFn', {
  runtime: Runtime.NODEJS_20_X, memorySize: 512, timeout: Duration.seconds(10),
  environment: {
    ORDERS_CLUSTER_ARN: cluster.clusterArn,
    ORDERS_SECRET_ARN:  secret.secretArn,
    POWERTOOLS_SERVICE_NAME: 'orders',
  },
  tracing: lambda.Tracing.ACTIVE,
});
secret.grantRead(fn);
cluster.grantDataApiAccess(fn);

new ec2.InterfaceVpcEndpoint(this, 'SecretsManagerEndpoint', {
  vpc, service: InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
  subnets: { subnetType: SubnetType.PRIVATE_ISOLATED },
});
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>AWS Knowledge MCP recommendation: <span className="font-mono text-[12.5px] text-[#4493f8]">sop/java-ee-to-lambda</span> + <span className="font-mono text-[12.5px] text-[#4493f8]">sop/oracle-to-aurora-pg</span></li>
                  <li>CloudFormation stack: <span className="text-[#4493f8] font-mono text-[12.5px]">orders-dev</span> · CREATE_COMPLETE · 3m 47s</li>
                  <li>CloudWatch dashboard (first hour): p99 340ms · error rate 0% · cold start 872ms</li>
                  <li>IAM policy advisor: <span className="text-[#3fb950]">0 over-privileged actions · 0 public resources · least-priv ✓</span></li>
                  <li>sam local invoke: <span className="text-[#3fb950]">✓ 200 · 412ms · reservation_id 1001</span></li>
                  <li>Typecheck · Lint · cdk synth · cdk diff: <span className="text-[#3fb950]">✓</span></li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius at merge: 1 bounded context · 11 net-new files · 0 destroyed.</li>
                  <li>
                    Dual-write window (Day 12–17): observed 100% reservation parity + 100% revenue ledger parity over 3 days. 0 DLQ messages.
                  </li>
                  <li>
                    Cutover (Day 17): traffic shift 5 → 25 → 50 → 100% over 36h, monolith reads disabled at 100%. Hyper-care closed Day 21.
                  </li>
                  <li>
                    Instant rollback during dual-write: flip <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">orders.dual_write</code> = false.
                  </li>
                  <li>
                    Post-cutover rollback: traffic shift back to monolith via the same flag (rehearsed in cutover review).
                  </li>
                </ul>
              </section>
            </div>
          </PrComment>

          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· least-priv IAM · Well-Architected 6-pillar</span>
            </p>
          </div>

          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show all checks</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="4s" />
              <CheckRow name="lint" detail="eslint + prettier" duration="3s" />
              <CheckRow name="cdk-synth" detail="1 stack synthesized — orders-dev" duration="9s" />
              <CheckRow name="cdk-diff" detail="+4 resources · 0 destroyed · no drift" duration="5s" />
              <CheckRow name="integration" detail="sam local invoke · 200 · 412ms" duration="12s" />
              <CheckRow name="iam-least-priv" detail="0 over-privileged actions · 0 public resources" duration="2s" />
            </div>
          </PrComment>

          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#A371F7]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  Merged by acme-platform-eng on Day 22 · 4 / 4 review gates passed · prod cutover Day 17
                </p>
                <p className="text-[12.5px] text-[#7d8590]">
                  Verified by Cursor agent · least-priv IAM · Well-Architected 6-pillar · 22 calendar days end-to-end.
                </p>
              </div>
              <span className="px-3.5 py-1.5 rounded-md bg-[#A371F7]/15 border border-[#A371F7]/40 text-[#D2A8FF] text-[13.5px] font-medium">
                Merged
              </span>
            </div>
          </PrComment>
        </div>

        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#FF9900" label="modernize" />
              <Label color="#4C9AFF" label="lambda" />
              <Label color="#A371F7" label="aurora" />
              <Label color="#00A86B" label="cdk" />
              <Label color="#7D8590" label="map-credit" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-5302 (Jira)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">orders-dev (CloudFormation)</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Milestone">
            <p className="text-[#e6edf3]">AWS Modernization · Wave 1</p>
            <p className="text-[#7d8590]">1 / 38 bounded contexts</p>
          </SidebarSection>
          <SidebarSection title="2 participants">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </div>
    </div>
  );
}

function TimelineRow({
  day,
  who,
  what,
  gate,
}: {
  day: string;
  who: string;
  what: string;
  gate?: boolean;
}) {
  return (
    <tr>
      <td className={`px-3 py-2 font-mono text-[12.5px] ${gate ? 'text-[#FF9900] font-semibold' : 'text-[#4493f8]'}`}>
        {day}
      </td>
      <td className="px-3 py-2 text-[#e6edf3]">
        {gate && (
          <span className="text-[10px] font-mono text-[#FF9900] uppercase tracking-wider mr-1.5">
            human ·
          </span>
        )}
        {what}
      </td>
      <td className="px-3 py-2 text-[#7d8590]">{who}</td>
    </tr>
  );
}

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrTab({
  label,
  count,
  active,
  icon,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">{children}</div>
  );
}

function PrCommentHeader({
  author,
  bot,
  label,
  time,
}: {
  author: string;
  bot?: boolean;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">bot</span>}
        <span className="text-[#7d8590]">
          {label} · {time}
        </span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({ name, detail, duration }: { name: string; detail: string; duration: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Check className="w-4 h-4 text-[#3fb950] shrink-0" />
      <span className="font-mono text-[12.5px] text-[#e6edf3] font-medium">{name}</span>
      <span className="text-[#7d8590] truncate">{detail}</span>
      <span className="ml-auto text-[#7d8590] font-mono text-[11.5px]">{duration}</span>
      <span className="text-[#4493f8] text-[11.5px] hover:underline cursor-pointer">Details</span>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#30363d] pb-4">
      <div className="flex items-center justify-between mb-2 text-[#7d8590]">
        <span className="font-semibold">{title}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

function SidebarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px]">{children}</div>;
}

function Label({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}
