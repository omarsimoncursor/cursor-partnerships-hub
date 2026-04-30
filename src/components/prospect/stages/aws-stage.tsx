'use client';

import type { StageProps } from './types';

const SERVICES = [
  { name: 'OrdersService',    target: 'Lambda + Aurora SLv2',     loc: 14_200, color: '#a78bfa' },
  { name: 'InventoryService', target: 'Lambda + DynamoDB',         loc:  9_800, color: '#60a5fa' },
  { name: 'BillingService',   target: 'ECS Fargate + Aurora PG',   loc: 22_100, color: '#34d399' },
  { name: 'ShippingService',  target: 'Lambda + Step Functions',   loc:  8_400, color: '#fbbf24' },
  { name: 'CatalogService',   target: 'Lambda + OpenSearch SL',    loc: 18_600, color: '#f472b6' },
];

export function AwsStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  // The monolith "blob" shrinks as services peel off.
  const peeled = activeStep < 0 ? 0 : Math.min(SERVICES.length, Math.max(0, activeStep));
  const monolithSize = isComplete ? 28 : 100 - peeled * (72 / SERVICES.length);
  const showCdk = activeStep >= 2 || isComplete;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          console.aws.amazon.com / {account.toLowerCase()} / cursor-migration
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#ffd6a8' }}>
          AWS
        </span>
      </div>

      <div className="grid grid-cols-[1.1fr_1fr] divide-x divide-dark-border">
        {/* LEFT: monolith decomposition diagram */}
        <div className="p-4">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-2">
            websphere monolith {'\u2192'} aws-native services
          </p>
          <div className="relative h-56 rounded-lg border border-dark-border bg-dark-surface overflow-hidden">
            {/* Monolith blob */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl flex items-center justify-center transition-all duration-700 ease-out"
              style={{
                width: `${monolithSize}%`,
                height: `${monolithSize * 0.72}%`,
                background: `linear-gradient(135deg, #4a4032 0%, #2a2520 100%)`,
                border: '1px solid rgba(255,153,0,0.25)',
                opacity: monolithSize > 30 ? 1 : 0.5,
              }}
            >
              <div className="text-center">
                <p className="text-[10px] font-mono uppercase tracking-wider" style={{ color: brand }}>{isComplete ? 'retired' : 'monolith'}</p>
                <p className="text-[10px] font-mono text-text-tertiary mt-0.5">1.18M LoC · WAS 8.5</p>
              </div>
            </div>

            {/* Service nodes orbiting out */}
            {SERVICES.map((svc, i) => {
              const visible = i < peeled || isComplete;
              const angle = (i / SERVICES.length) * Math.PI * 2 - Math.PI / 2;
              const radius = 38;
              const cx = 50 + Math.cos(angle) * radius;
              const cy = 50 + Math.sin(angle) * radius * 0.8;
              return (
                <div
                  key={svc.name}
                  className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                  style={{
                    left: `${cx}%`,
                    top: `${cy}%`,
                    opacity: visible ? 1 : 0,
                    transform: `translate(-50%, -50%) scale(${visible ? 1 : 0.4})`,
                  }}
                >
                  <div
                    className="rounded-md px-2 py-1 border text-center min-w-[88px]"
                    style={{
                      background: `${svc.color}1a`,
                      borderColor: `${svc.color}66`,
                      boxShadow: visible ? `0 0 14px ${svc.color}55` : 'none',
                    }}
                  >
                    <p className="text-[9.5px] font-mono font-bold" style={{ color: svc.color }}>{svc.name}</p>
                    <p className="text-[8.5px] font-mono text-text-tertiary">{svc.target.split(' + ')[0]}</p>
                  </div>
                </div>
              );
            })}

            {/* Connection lines (faint) */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {SERVICES.map((svc, i) => {
                const visible = i < peeled || isComplete;
                if (!visible) return null;
                const angle = (i / SERVICES.length) * Math.PI * 2 - Math.PI / 2;
                const radius = 38;
                const cx = 50 + Math.cos(angle) * radius;
                const cy = 50 + Math.sin(angle) * radius * 0.8;
                return (
                  <line
                    key={i}
                    x1="50" y1="50" x2={cx} y2={cy}
                    stroke={svc.color}
                    strokeOpacity="0.35"
                    strokeWidth="0.3"
                    strokeDasharray="1.2 1.2"
                  />
                );
              })}
            </svg>
          </div>
          <p className="text-[10px] font-mono text-text-tertiary mt-2">
            {isComplete
              ? `${SERVICES.length} bounded contexts extracted · monolith retired`
              : peeled === 0
                ? 'cursor scanning bounded contexts…'
                : `${peeled} / ${SERVICES.length} bounded contexts identified`}
          </p>
        </div>

        {/* RIGHT: CDK code preview */}
        <div className="bg-dark-bg">
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-dark-surface">
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">
              {showCdk ? 'cursor / orders-stack.ts' : 'awaiting plan…'}
            </span>
            <span className="ml-auto text-[9px] font-mono text-text-tertiary">cdk · typescript</span>
          </div>
          {!showCdk ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full mb-2 animate-pulse" style={{ background: brand }} />
              <p className="text-[10px] font-mono">cursor.plan.boundedContexts()</p>
            </div>
          ) : (
            <pre className="p-3 text-[10.5px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
{`export class OrdersStack extends Stack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const db = new ServerlessCluster(this, 'OrdersDb', {
      engine: DatabaseClusterEngine.AURORA_POSTGRES,
      scaling: { autoPause: Duration.minutes(10) },
    });

    const fn = new NodejsFunction(this, 'OrdersFn', {
      runtime: Runtime.NODEJS_20_X,
      memorySize: 1024,
      environment: { DB_SECRET: db.secret!.secretArn },
    });

    new HttpApi(this, 'OrdersApi', {
      defaultIntegration: new HttpLambdaIntegration('h', fn),
    });
  }
}`}
            </pre>
          )}
          <div className="border-t border-dark-border px-3 py-2 grid grid-cols-3 gap-3 text-[10px] font-mono">
            <div>
              <p className="text-text-tertiary uppercase tracking-wider">Annual TCO</p>
              <p className={isComplete ? 'text-accent-green' : 'text-text-primary'}>
                {isComplete ? '$2.1M' : '$8.4M'}
              </p>
            </div>
            <div>
              <p className="text-text-tertiary uppercase tracking-wider">MAP credits</p>
              <p className="text-accent-green">eligible</p>
            </div>
            <div>
              <p className="text-text-tertiary uppercase tracking-wider">GSI quote</p>
              <p className="text-text-primary">{isComplete ? '18 mo' : '5 yr'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
