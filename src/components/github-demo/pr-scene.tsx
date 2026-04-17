'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { AlertTriangle, MessageSquare, GitPullRequest, Eye } from 'lucide-react';

const PR_FILES = [
  { name: 'src/services/auth/session-manager.ts', additions: 47, deletions: 12, status: 'modified' },
  { name: 'src/services/auth/token-store.ts', additions: 23, deletions: 8, status: 'modified' },
  { name: 'src/middleware/rate-limiter.ts', additions: 89, deletions: 3, status: 'modified' },
  { name: 'src/api/users/profile.ts', additions: 15, deletions: 31, status: 'modified' },
  { name: 'src/utils/cache.ts', additions: 62, deletions: 0, status: 'added' },
  { name: 'src/services/auth/legacy-auth.ts', additions: 0, deletions: 145, status: 'deleted' },
];

const REVIEW_COMMENTS = [
  {
    file: 'session-manager.ts',
    line: 34,
    author: 'sarah-eng',
    avatar: 'S',
    body: 'This session refresh logic duplicates what we have in token-store.ts. Can we consolidate these into a single source of truth?',
    type: 'warning',
  },
  {
    file: 'rate-limiter.ts',
    line: 17,
    author: 'alex-lead',
    avatar: 'A',
    body: 'The rate limiting config is hardcoded here. We should pull this from the shared config and make it consistent across all middleware.',
    type: 'warning',
  },
  {
    file: 'cache.ts',
    line: 8,
    author: 'sarah-eng',
    avatar: 'S',
    body: 'This cache implementation doesn\'t handle TTL expiration. Also, the eviction strategy needs to match our existing pattern in redis-client.ts.',
    type: 'warning',
  },
];

const CODE_DIFF = [
  { type: 'context', content: 'export class SessionManager {' },
  { type: 'context', content: '  private store: TokenStore;' },
  { type: 'context', content: '' },
  { type: 'deletion', content: '  async refresh(sessionId: string) {' },
  { type: 'deletion', content: '    const token = await this.store.get(sessionId);' },
  { type: 'deletion', content: '    if (token.isExpired()) {' },
  { type: 'deletion', content: '      const newToken = await this.issueToken(token.userId);' },
  { type: 'deletion', content: '      await this.store.set(sessionId, newToken);' },
  { type: 'deletion', content: '      return newToken;' },
  { type: 'deletion', content: '    }' },
  { type: 'deletion', content: '    return token;' },
  { type: 'deletion', content: '  }' },
  { type: 'addition', content: '  async refresh(sessionId: string) {' },
  { type: 'addition', content: '    const token = await this.store.get(sessionId);' },
  { type: 'addition', content: '    if (!token) throw new SessionNotFoundError(sessionId);' },
  { type: 'addition', content: '    if (token.isExpired()) {' },
  { type: 'addition', content: '      const refreshed = await this.tokenRefreshService.rotate(token);' },
  { type: 'addition', content: '      await this.store.set(sessionId, refreshed);' },
  { type: 'addition', content: '      this.emit("session:refreshed", { sessionId });' },
  { type: 'addition', content: '      return refreshed;' },
  { type: 'addition', content: '    }' },
  { type: 'addition', content: '    return token;' },
  { type: 'addition', content: '  }' },
  { type: 'context', content: '' },
  { type: 'context', content: '  async revoke(sessionId: string) {' },
];

export function PrScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-pr-header]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-pr-file]', {
        scrollTrigger: {
          trigger: '[data-pr-files]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -10,
        stagger: 0.06,
        duration: 0.4,
        delay: 0.4,
        ease: 'power3.out',
      });

      gsap.from('[data-pr-diff-line]', {
        scrollTrigger: {
          trigger: '[data-pr-diff]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -5,
        stagger: 0.02,
        duration: 0.3,
        delay: 0.6,
        ease: 'power3.out',
      });

      gsap.from('[data-pr-comment]', {
        scrollTrigger: {
          trigger: '[data-pr-comments]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 15,
        stagger: 0.15,
        duration: 0.5,
        delay: 0.3,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 1</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">PR Review Flags Issues</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          A complex pull request lands for review. Team leads flag duplicated logic, inconsistent patterns, and missing functionality across multiple files.
        </p>

        {/* GitHub PR mockup */}
        <div data-pr-header className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          {/* PR header bar */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-[#0d1117]">
            <div className="flex items-center gap-3">
              <GitPullRequest className="w-5 h-5 text-[#238636]" />
              <div>
                <span className="text-sm font-semibold text-white">refactor: consolidate auth session handling</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#238636] border border-[#238636]/30">#347</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-xs text-[#8b949e]">
              <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> 2 reviewers</span>
              <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" /> 3 comments</span>
            </div>
          </div>

          {/* PR status bar */}
          <div className="px-6 py-2 border-b border-dark-border bg-[#161b22] flex items-center gap-4 text-xs text-[#8b949e]">
            <span className="text-[#238636]">+236</span>
            <span className="text-[#da3633]">-199</span>
            <span>6 files changed</span>
            <div className="flex-1" />
            <span className="flex items-center gap-1 text-[#d29922]">
              <AlertTriangle className="w-3 h-3" />
              Changes requested
            </span>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Files changed list */}
            <div data-pr-files className="w-full md:w-72 border-b md:border-b-0 md:border-r border-dark-border p-4 bg-[#0d1117]">
              <p className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-3 px-1">Files changed</p>
              {PR_FILES.map((file, i) => (
                <div
                  key={i}
                  data-pr-file
                  className="flex items-center justify-between py-1.5 px-2 rounded text-xs hover:bg-[#161b22] cursor-pointer group"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${
                      file.status === 'added' ? 'bg-[#238636]' : file.status === 'deleted' ? 'bg-[#da3633]' : 'bg-[#d29922]'
                    }`} />
                    <span className="text-[#c9d1d9] truncate font-mono">{file.name.split('/').pop()}</span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    {file.additions > 0 && <span className="text-[#238636]">+{file.additions}</span>}
                    {file.deletions > 0 && <span className="text-[#da3633]">-{file.deletions}</span>}
                  </div>
                </div>
              ))}
              {/* Additions/deletions bar */}
              <div className="mt-3 flex gap-[2px] px-2">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-sm ${i < 12 ? 'bg-[#238636]' : 'bg-[#da3633]'}`}
                  />
                ))}
              </div>
            </div>

            {/* Diff view */}
            <div className="flex-1 overflow-hidden">
              <div data-pr-diff className="overflow-x-auto">
                <div className="px-4 py-2 border-b border-dark-border bg-[#161b22] text-xs font-mono text-[#8b949e]">
                  src/services/auth/session-manager.ts
                </div>
                <pre className="p-0 text-xs leading-5">
                  {CODE_DIFF.map((line, i) => (
                    <div
                      key={i}
                      data-pr-diff-line
                      className={`flex px-4 ${
                        line.type === 'addition'
                          ? 'bg-[#238636]/10'
                          : line.type === 'deletion'
                          ? 'bg-[#da3633]/10'
                          : ''
                      }`}
                    >
                      <span className="w-8 inline-block text-right pr-3 select-none text-[#484f58]">
                        {line.type === 'addition' ? '' : line.type === 'deletion' ? '' : i + 1}
                      </span>
                      <span className={`w-4 inline-block text-center select-none ${
                        line.type === 'addition' ? 'text-[#238636]' : line.type === 'deletion' ? 'text-[#da3633]' : 'text-[#484f58]'
                      }`}>
                        {line.type === 'addition' ? '+' : line.type === 'deletion' ? '-' : ' '}
                      </span>
                      <code className={`font-mono ${
                        line.type === 'addition' ? 'text-[#aff5b4]' : line.type === 'deletion' ? 'text-[#ffa198]' : 'text-[#c9d1d9]'
                      }`}>
                        {line.content || ' '}
                      </code>
                    </div>
                  ))}
                </pre>
              </div>
            </div>
          </div>

          {/* Review comments */}
          <div data-pr-comments className="border-t border-dark-border p-4 bg-[#0d1117] space-y-3">
            <p className="text-xs text-[#8b949e] uppercase tracking-wider mb-2">Review Comments</p>
            {REVIEW_COMMENTS.map((comment, i) => (
              <div key={i} data-pr-comment className="rounded-lg border border-[#30363d] bg-[#161b22] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2 border-b border-[#30363d] bg-[#1c2128]">
                  <div className="w-5 h-5 rounded-full bg-[#d29922]/20 flex items-center justify-center text-[10px] font-bold text-[#d29922]">
                    {comment.avatar}
                  </div>
                  <span className="text-xs font-semibold text-[#c9d1d9]">{comment.author}</span>
                  <span className="text-[10px] text-[#8b949e] font-mono">{comment.file}:{comment.line}</span>
                  <div className="flex-1" />
                  <AlertTriangle className="w-3 h-3 text-[#d29922]" />
                </div>
                <div className="px-4 py-3">
                  <p className="text-xs text-[#c9d1d9] leading-relaxed">{comment.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
