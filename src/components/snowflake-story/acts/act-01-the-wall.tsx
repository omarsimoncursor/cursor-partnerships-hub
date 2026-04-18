'use client';

import { useState } from 'react';
import { AlertOctagon, Clock, Mail } from 'lucide-react';
import { ChapterStage } from '../chapter-stage';
import { ACTS, type ActComponentProps } from '../story-types';
import { AssetWall } from '../asset-wall';
import { EmailThread } from '../email-thread';
import { CursorValueCallout } from '../cursor-value-callout';
import { Disclosure } from '../disclosure';

export function Act01TheWall(_: ActComponentProps) {
  const act = ACTS[0];
  const [, setHoveredCount] = useState(0);

  return (
    <ChapterStage act={act}>
      <p className="mb-8 max-w-2xl text-[14px] leading-relaxed text-white/70">
        911 legacy ELT assets. A decade of business logic in dialects nobody is hiring for
        anymore. The daily revenue rollup last succeeded{' '}
        <span className="text-[#F59E0B]">14 hours ago</span>. Q2 close starts Monday.
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start">
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-white/10 bg-[#0A1221]/80 p-5 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.7)]">
            <AssetWall
              modernizedThrough={0}
              heroBrickId={0}
              interactive={true}
              onBrickHover={(b) => setHoveredCount((n) => (b ? n + 1 : n))}
            />
            <p className="mt-4 text-center text-[11.5px] text-white/55">
              Hover any square for the filename and when it was last touched.{' '}
              <span className="text-[#29B5E8]">
                The lit square is where Cursor starts on Friday.
              </span>
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <StatTile
              icon={<Clock className="h-3.5 w-3.5" />}
              label="Revenue mart staleness"
              value="14h 22m"
              sub="last successful run"
              tone="#F59E0B"
            />
            <StatTile
              icon={<AlertOctagon className="h-3.5 w-3.5" />}
              label="People who can still read BTEQ"
              value="2"
              sub="both already declined the GSI path"
              tone="#29B5E8"
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CursorValueCallout
            accent="#29B5E8"
            label="Why this is the moment for Cursor"
            headline="Cursor gives the two people who know the business the leverage of a 40-person bench."
            body="The ones who can still read the legacy code aren&rsquo;t the bottleneck — they&rsquo;re the asset. Cursor doesn&rsquo;t take their seat; it multiplies it."
          />

          <Disclosure
            label="Read the internal thread"
            meta="3 messages · Tuesday evening"
            icon={<Mail className="h-3 w-3" />}
            accent="#F59E0B"
            defaultOpen
          >
            <div className="pt-1">
              <EmailThread
                label="Inbox · Acme · #data-platform"
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
                          This is the same wall I&rsquo;ve been staring at for three years.
                          Seventeen of these rollups feed Q2 close. One more failure and I&rsquo;m
                          explaining it to the CFO on Monday.
                        </p>
                        <p className="mt-2">
                          Two people on the team can still read BTEQ — me and one contractor on
                          PTO next week. The pipeline is the symptom; the dialect is the risk.
                        </p>
                      </>
                    ),
                    attachments: [{ label: 'rollup-failures-Q1-Q2.pdf' }],
                  },
                  {
                    from: 'vp',
                    to: 'Principal Data Engineer',
                    cc: ['CFO'],
                    time: 'Tue 10:04pm',
                    subject: 'Daily revenue rollup failed again — 14h stale',
                    body: (
                      <p>
                        Looping in the CFO — the GSI proposal is back on her desk tomorrow. By
                        EOD Wednesday I need one page: what does modernization look like if{' '}
                        <em>our team</em> holds the keyboard? Not a deck. A credible path.
                      </p>
                    ),
                  },
                  {
                    from: 'principal',
                    to: 'VP Data & Analytics',
                    time: 'Tue 11:18pm',
                    subject: 'Daily revenue rollup failed again — 14h stale',
                    body: (
                      <p>
                        If I can prove one asset end-to-end by Friday — with our reviewer gates,
                        not a vendor&rsquo;s — I&rsquo;ll put my name on a 15-month plan. If not,
                        sign the GSI SOW. I&rsquo;m not pretending there&rsquo;s a middle path I
                        can staff.
                      </p>
                    ),
                  },
                ]}
              />
            </div>
          </Disclosure>
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
      <div
        className="mb-1 flex items-center gap-2 text-[10.5px] font-mono uppercase tracking-wider"
        style={{ color: tone }}
      >
        {icon}
        {label}
      </div>
      <p className="text-[18px] font-semibold text-white">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/55">{sub}</p>
    </div>
  );
}
