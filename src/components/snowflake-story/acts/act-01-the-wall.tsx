'use client';

import { useState } from 'react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { AlertOctagon, Clock, Mail, Siren } from 'lucide-react';

export function Act01TheWall(_: ActComponentProps) {
  const act = ACTS[0];
  const [, setHoveredCount] = useState(0);

  return (
    <ChapterStage act={act}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-4 w-4 text-[#F59E0B]" />
            <p className="text-[11px] font-mono uppercase tracking-[0.22em] text-[#F59E0B]">
              Acme Analytics · modernization debt
            </p>
          </div>
          <h2 className="text-[22px] font-semibold leading-tight text-white md:text-[26px]">
            Every grey square is a script only two people left in the company still understand.
          </h2>
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-white/70">
            911 legacy ELT assets across Teradata, SQL Server, Informatica and SSIS. A decade of
            business logic accreted in dialects nobody is hiring for anymore. The daily revenue
            rollup last succeeded <span className="text-[#F59E0B]">14 hours ago</span>. Q2 close
            starts Monday.
          </p>

          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)]">
            <AssetWall
              modernizedThrough={0}
              heroBrickId={0}
              interactive={true}
              onBrickHover={(b) => setHoveredCount((n) => (b ? n + 1 : n))}
            />
            <p className="mt-4 text-center text-[11px] font-mono text-white/50">
              Hover any square to see the filename and when it was last touched.{' '}
              <span className="text-[#29B5E8]">
                The one lit square is the asset Cursor tackles on Friday.
              </span>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <StatTile
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Revenue mart staleness"
              value="14h 22m"
              sub="last successful run"
              tone="#F59E0B"
            />
            <StatTile
              icon={<Siren className="h-3.5 w-3.5" />}
              label="Pages last 18 months"
              value="47"
              sub="same rollup, same two people"
              tone="#F87171"
            />
            <StatTile
              icon={<Mail className="h-3.5 w-3.5" />}
              label="People who can read BTEQ"
              value="2"
              sub="both already declined the GSI path"
              tone="#29B5E8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <EmailThread
            label="Internal thread · Acme data platform"
            tone="dark"
            messages={[
              {
                from: 'principal',
                to: 'VP Data & Analytics',
                time: 'Tue 9:42pm',
                subject: 'Daily revenue rollup failed again — 14h stale',
                body: (
                  <>
                    <p>
                      This is the same wall I&apos;ve been staring at for three years. Seventeen
                      of these rollups feed the Q2 close. If one more fails before Monday, I&apos;m
                      the one explaining it to the CFO.
                    </p>
                    <p className="mt-2">
                      We have two people on the team who can still read the BTEQ — me and one
                      contractor on PTO next week. That&apos;s the real risk. The pipeline is the
                      symptom.
                    </p>
                  </>
                ),
                attachments: [{ label: 'rollup-failures-Q1-Q2.pdf' }],
              },
              {
                from: 'vp',
                to: 'Principal Data Engineer; CFO',
                time: 'Tue 10:04pm',
                subject: 'Daily revenue rollup failed again — 14h stale',
                body: (
                  <>
                    <p>
                      Thanks for flagging. Looping in the CFO — the GSI proposal is back on her
                      desk tomorrow and she wants to hear this directly from the team.
                    </p>
                    <p className="mt-2">
                      I need one page from you by EOD Wednesday: what does a modernization actually
                      look like if our team holds the keyboard? Not a deck. A credible path.
                    </p>
                  </>
                ),
              },
              {
                from: 'principal',
                to: 'VP Data & Analytics',
                time: 'Tue 11:18pm',
                subject: 'Daily revenue rollup failed again — 14h stale',
                body: (
                  <>
                    <p>
                      If I can prove one asset end-to-end by Friday — with our reviewer gates, not
                      some vendor&apos;s — I&apos;ll put my name on a 15-month plan. If we
                      can&apos;t, I&apos;m going to tell you to sign the GSI SOW and buy more
                      Teradata support to cover the gap. I&apos;m not pretending there&apos;s a
                      middle path I can staff.
                    </p>
                  </>
                ),
              },
            ]}
          />

          <CursorValueCallout
            accent="#29B5E8"
            label="Why this is the moment for Cursor"
            headline="Cursor gives the people who already know the business the leverage of a 40-person bench."
            body="The ones who can still read the legacy code aren't the bottleneck — they're the asset. Cursor doesn't take their seat, it multiplies it: reading every dialect, drafting the plan, writing the migration, waiting for their review."
          />
        </div>
      </div>
    </ChapterStage>
  );
}

function StatTile({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: string;
}) {
  return (
    <div
      className="rounded-xl border px-4 py-3"
      style={{
        borderColor: `${tone}35`,
        background: `${tone}10`,
      }}
    >
      <div className="mb-1 flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider" style={{ color: tone }}>
        {icon}
        {label}
      </div>
      <p className="text-[18px] font-semibold text-white">{value}</p>
      <p className="text-[11px] text-white/55 mt-0.5">{sub}</p>
    </div>
  );
}
