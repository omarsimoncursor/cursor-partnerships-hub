'use client';

import type { StageProps } from './types';

const DLT_CODE = `# bronze_orders.py · Delta Live Tables
import dlt
from pyspark.sql.functions import col

@dlt.table(comment="Raw orders from S3 landing zone, schema-on-read")
def bronze_orders():
  return (
    spark.readStream
      .format("cloudFiles")
      .option("cloudFiles.format", "json")
      .load("s3://{account}-landing/orders/")
  )

@dlt.table
@dlt.expect_or_fail("valid_amount", "amount > 0")
def silver_orders():
  return (dlt.read_stream("bronze_orders")
    .withColumn("amount_cents", (col("amount") * 100).cast("int")))`;

export function DatabricksStage({ activeStep, status, account, brand }: StageProps) {
  const isComplete = status === 'complete';
  const showCode = activeStep >= 1;
  const showLineage = activeStep >= 3 || isComplete;

  return (
    <div className="rounded-xl border border-dark-border bg-dark-bg overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-dark-border bg-dark-surface">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-[10px] font-mono text-text-tertiary truncate">
          {account.toLowerCase()}.cloud.databricks.com / pipelines / oracle-migration
        </span>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded" style={{ background: `${brand}33`, color: '#ffb59a' }}>
          DATABRICKS
        </span>
      </div>

      <div className="grid grid-cols-2 divide-x divide-dark-border">
        <div>
          <div className="flex items-center gap-2 px-3 py-1.5 border-b border-dark-border bg-dark-surface">
            <span className="text-[9px] font-mono uppercase tracking-wider text-text-tertiary">
              {showCode ? 'notebook · bronze_orders.py' : 'awaiting agent…'}
            </span>
            <span className="ml-auto text-[9px] font-mono" style={{ color: brand }}>DLT</span>
          </div>
          {!showCode ? (
            <div className="p-6 flex flex-col items-center justify-center h-full text-text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full mb-2 animate-pulse" style={{ background: brand }} />
              <p className="text-[10px] font-mono">cursor.parse(oracleGlob)</p>
            </div>
          ) : (
            <pre className="p-3 text-[10.5px] font-mono leading-relaxed text-text-secondary overflow-x-auto whitespace-pre">
              {DLT_CODE.replace('{account}', account.toLowerCase())}
            </pre>
          )}
        </div>

        <div className="p-3">
          <p className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary mb-2">
            unity catalog lineage
          </p>
          <div className="space-y-1.5">
            {[
              { name: 's3:/landing/orders', kind: 'source', col: '#a3a3a3' },
              { name: 'bronze_orders', kind: 'bronze', col: '#cb785c' },
              { name: 'silver_orders', kind: 'silver', col: '#9ca3af' },
              { name: 'gold_daily_revenue', kind: 'gold', col: '#fbbf24' },
            ].map((node, i) => {
              const visible = showLineage || i <= activeStep;
              return (
                <div
                  key={node.name}
                  className="rounded-md border px-2 py-1.5 transition-all"
                  style={{
                    borderColor: visible ? `${node.col}55` : 'rgba(237,236,236,0.06)',
                    background: visible ? `${node.col}11` : 'transparent',
                    opacity: visible ? 1 : 0.3,
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: node.col }} />
                    <span className="text-[11px] font-mono text-text-primary truncate">{node.name}</span>
                    <span className="ml-auto text-[9px] font-mono uppercase tracking-wider" style={{ color: node.col }}>{node.kind}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-mono">
            <div className="rounded border border-dark-border p-2">
              <p className="text-text-tertiary uppercase">UC grants</p>
              <p className={showLineage ? 'text-accent-green' : 'text-text-secondary'}>
                {showLineage ? '147 / 147 mapped' : 'mapping…'}
              </p>
            </div>
            <div className="rounded border border-dark-border p-2">
              <p className="text-text-tertiary uppercase">Lineage parity</p>
              <p className={showLineage ? 'text-accent-green' : 'text-text-secondary'}>
                {showLineage ? '100% match' : 'pending'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
