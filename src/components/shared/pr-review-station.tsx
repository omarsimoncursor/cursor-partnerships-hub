'use client';

import { useEffect, useRef } from 'react';
import { Cloud, GitPullRequest, CheckCircle2, FileCode, User, Github, Zap } from 'lucide-react';
import { gsap } from '@/lib/gsap-init';
import { FlowPipe } from './flow-pipe';
import { SystemNode } from './system-node';
import { MacBookFrame } from './macbook-frame';

interface PRFile {
  name: string;
  additions: number;
  deletions: number;
  status: 'modified' | 'added';
}

interface CICheck {
  name: string;
  status: 'passed' | 'approved';
  duration: string;
}

interface PRReviewStationProps {
  prTitle: string;
  prNumber: string;
  prDescription: string;
  prFiles: PRFile[];
  additions: number;
  deletions: number;
  ciChecks: CICheck[];
  accentColor?: string;
  /** Partner brand color used at the source (Cloud Agent side) */
  sourceColor?: string;
}

export function PRReviewStation({
  prTitle,
  prNumber,
  prDescription,
  prFiles,
  additions,
  deletions,
  ciChecks,
  accentColor = '#60A5FA',
  sourceColor = '#A259FF',
}: PRReviewStationProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-prrs-node]', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 70%' },
        opacity: 0, scale: 0.6, stagger: 0.2, duration: 0.6, ease: 'back.out(1.5)',
      });
      gsap.from('[data-prrs-macbook]', {
        scrollTrigger: { trigger: containerRef.current, start: 'top 65%' },
        opacity: 0, y: 40, scale: 0.95, duration: 1, delay: 0.4, ease: 'power3.out',
      });
      gsap.from('[data-prrs-ci-chip]', {
        scrollTrigger: { trigger: '[data-prrs-macbook]', start: 'top 75%' },
        opacity: 0, y: 10, stagger: 0.1, duration: 0.4, delay: 1.0, ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative">
      {/* Top: flow diagram Cloud Agent -> GitHub -> MacBook */}
      {/* pt-10 pb-8 gives status dots, pulse halos, and the glow aura breathing room since overflow-x-auto implicitly clips y per CSS spec */}
      <div className="flex items-center justify-center gap-0 mb-12 overflow-x-auto pt-10 pb-8">
        <div data-prrs-node className="shrink-0">
          <SystemNode
            icon={Cloud}
            label="Cursor Cloud Agent"
            sublabel="Multi-model pipeline"
            color={sourceColor}
            size="md"
            status="success"
          />
        </div>

        <div className="shrink-0">
          <FlowPipe
            width={140}
            height={60}
            color={sourceColor}
            label="git push"
            packetCount={2}
            duration={2.2}
          />
        </div>

        <div data-prrs-node className="shrink-0">
          <SystemNode
            icon={Github}
            label="GitHub"
            sublabel="Pull request opened"
            color="#e6edf3"
            size="md"
            status="success"
          />
        </div>

        <div className="shrink-0">
          <FlowPipe
            width={140}
            height={60}
            color={accentColor}
            label="review"
            packetCount={2}
            duration={2.2}
          />
        </div>

        <div data-prrs-node className="shrink-0">
          <SystemNode
            icon={User}
            label="Engineer"
            sublabel="Human-in-the-loop"
            color={accentColor}
            size="md"
            pulse
            status="active"
          />
        </div>
      </div>

      {/* MacBook with PR UI */}
      <div data-prrs-macbook className="flex justify-center mb-12">
        <MacBookFrame finish="space-black" width={720} label="Engineer's Workstation" labelColor={accentColor}>
          <div className="h-full w-full bg-[#0d1117] overflow-hidden">
            {/* Browser-ish title bar */}
            <div className="h-7 bg-[#161b22] flex items-center px-3 gap-1.5 border-b border-[#30363d]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e]" />
              <div className="w-2.5 h-2.5 rounded-full bg-[#28c840]" />
              <div className="ml-4 flex-1 max-w-xs mx-auto">
                <div className="bg-[#0d1117] border border-[#30363d] rounded px-2.5 py-0.5 text-[9px] text-[#8b949e] font-mono truncate flex items-center gap-1.5">
                  <Github className="w-2.5 h-2.5" />
                  github.com/acme/api/pull/{prNumber.replace('#', '')}
                </div>
              </div>
            </div>

            {/* PR header */}
            <div className="px-4 py-3 border-b border-[#30363d] bg-[#161b22]">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="px-2 py-0.5 rounded-full bg-[#1f6feb]/20 border border-[#1f6feb]/40 text-[9px] font-semibold text-[#58a6ff] flex items-center gap-1">
                  <GitPullRequest className="w-2.5 h-2.5" />
                  Open
                </div>
                <span className="text-[9px] text-[#8b949e] font-mono">{prNumber}</span>
                <span className="text-[9px] text-[#8b949e]">opened by</span>
                <span className="text-[9px] text-[#58a6ff] font-mono flex items-center gap-1">
                  <Zap className="w-2.5 h-2.5" />
                  cursor-cloud-agent
                </span>
                <span className="ml-auto text-[9px] text-[#8b949e]">2 minutes ago</span>
              </div>
              <h3 className="text-[13px] font-semibold text-[#e6edf3]">{prTitle}</h3>
            </div>

            {/* PR body split: description + files */}
            <div className="flex text-[10px]">
              {/* Left: description */}
              <div className="flex-1 p-4 border-r border-[#30363d]">
                <p className="text-[#8b949e] leading-relaxed mb-3">{prDescription}</p>
                <div className="flex items-center gap-3 pt-2 border-t border-[#30363d] text-[9px] text-[#8b949e]">
                  <span className="flex items-center gap-1">
                    <FileCode className="w-2.5 h-2.5" />
                    {prFiles.length} files
                  </span>
                  <span className="text-[#3fb950]">+{additions}</span>
                  <span className="text-[#f85149]">-{deletions}</span>
                </div>
              </div>

              {/* Right: files */}
              <div className="w-[44%] bg-[#0d1117]">
                <div className="px-3 py-1.5 border-b border-[#30363d] text-[9px] font-mono text-[#8b949e] uppercase tracking-wider">
                  Files changed
                </div>
                {prFiles.map((file, i) => (
                  <div key={i} className="px-3 py-1.5 flex items-center gap-2 border-b border-[#30363d] last:border-b-0 hover:bg-[#161b22]">
                    <span
                      className="text-[8px] font-mono px-1 py-0.5 rounded"
                      style={{
                        background: file.status === 'added' ? '#3fb95020' : '#d29922' + '20',
                        color: file.status === 'added' ? '#3fb950' : '#d29922',
                      }}
                    >
                      {file.status === 'added' ? 'A' : 'M'}
                    </span>
                    <span className="text-[#c9d1d9] font-mono truncate flex-1 text-[9px]">{file.name}</span>
                    <span className="text-[#3fb950] text-[8px]">+{file.additions}</span>
                    {file.deletions > 0 && <span className="text-[#f85149] text-[8px]">-{file.deletions}</span>}
                  </div>
                ))}
              </div>
            </div>

            {/* CI checks strip at bottom */}
            <div className="border-t border-[#30363d] px-4 py-2 bg-[#161b22]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <CheckCircle2 className="w-3 h-3 text-[#3fb950]" />
                <span className="text-[9px] font-semibold text-[#3fb950]">All checks have passed</span>
                <span className="text-[9px] text-[#8b949e] ml-auto">{ciChecks.length} successful checks</span>
              </div>
              <div data-prrs-ci className="flex items-center gap-2 overflow-x-auto">
                {ciChecks.map((check, i) => (
                  <div
                    key={i}
                    data-prrs-ci-chip
                    className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[8px] font-mono whitespace-nowrap"
                    style={{
                      background: check.status === 'approved' ? '#1f6feb20' : '#3fb95020',
                      color: check.status === 'approved' ? '#58a6ff' : '#3fb950',
                      border: `1px solid ${check.status === 'approved' ? '#1f6feb40' : '#3fb95040'}`,
                    }}
                  >
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{check.name}</span>
                    <span className="opacity-60">{check.duration}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Merge button */}
            <div className="px-4 py-2.5 bg-[#0d1117] flex items-center gap-2">
              <button
                className="px-3 py-1 rounded-md text-[10px] font-semibold text-white"
                style={{ background: '#238636', border: '1px solid #2ea04333' }}
              >
                Merge pull request
              </button>
              <span className="text-[9px] text-[#8b949e]">Approved by 1 review &middot; All conversations resolved</span>
            </div>
          </div>
        </MacBookFrame>
      </div>
    </div>
  );
}
