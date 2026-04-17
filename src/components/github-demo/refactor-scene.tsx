'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { File, Pencil } from 'lucide-react';

interface FileChange {
  filename: string;
  language: string;
  lines: { type: 'context' | 'addition' | 'deletion'; content: string }[];
}

const FILE_CHANGES: FileChange[] = [
  {
    filename: 'src/services/auth/session-manager.ts',
    language: 'typescript',
    lines: [
      { type: 'context', content: 'export class SessionManager {' },
      { type: 'deletion', content: '  private store: TokenStore;' },
      { type: 'addition', content: '  private tokenService: TokenRefreshService;' },
      { type: 'addition', content: '  private eventBus: EventEmitter;' },
      { type: 'context', content: '' },
      { type: 'deletion', content: '  async refresh(sessionId: string) {' },
      { type: 'deletion', content: '    const token = await this.store.get(sessionId);' },
      { type: 'addition', content: '  async refresh(sessionId: string): Promise<Token> {' },
      { type: 'addition', content: '    return this.tokenService.refreshSession(sessionId);' },
      { type: 'context', content: '  }' },
    ],
  },
  {
    filename: 'src/services/auth/token-refresh.ts',
    language: 'typescript',
    lines: [
      { type: 'addition', content: 'import { TokenStore } from "./token-store";' },
      { type: 'addition', content: 'import { EventEmitter } from "@/utils/events";' },
      { type: 'addition', content: '' },
      { type: 'addition', content: 'export class TokenRefreshService {' },
      { type: 'addition', content: '  constructor(' },
      { type: 'addition', content: '    private store: TokenStore,' },
      { type: 'addition', content: '    private events: EventEmitter' },
      { type: 'addition', content: '  ) {}' },
      { type: 'addition', content: '' },
      { type: 'addition', content: '  async refreshSession(sessionId: string) {' },
      { type: 'addition', content: '    const token = await this.store.get(sessionId);' },
      { type: 'addition', content: '    if (!token) throw new SessionNotFoundError(sessionId);' },
      { type: 'addition', content: '    // ... consolidated refresh logic' },
      { type: 'addition', content: '  }' },
      { type: 'addition', content: '}' },
    ],
  },
  {
    filename: 'src/middleware/rate-limiter.ts',
    language: 'typescript',
    lines: [
      { type: 'deletion', content: 'const RATE_LIMIT = 100;' },
      { type: 'deletion', content: 'const WINDOW_MS = 60_000;' },
      { type: 'addition', content: 'import { config } from "@/utils/config";' },
      { type: 'addition', content: '' },
      { type: 'addition', content: 'const { rateLimit, windowMs } = config.middleware;' },
      { type: 'context', content: '' },
      { type: 'context', content: 'export function rateLimiter(req: Request) {' },
      { type: 'deletion', content: '  const key = getClientKey(req);' },
      { type: 'addition', content: '  const key = getClientIdentifier(req);' },
    ],
  },
  {
    filename: 'src/utils/cache.ts',
    language: 'typescript',
    lines: [
      { type: 'deletion', content: 'export class SimpleCache {' },
      { type: 'deletion', content: '  private map = new Map();' },
      { type: 'addition', content: 'import { RedisClient } from "./redis-client";' },
      { type: 'addition', content: '' },
      { type: 'addition', content: 'export class Cache {' },
      { type: 'addition', content: '  constructor(private redis: RedisClient) {}' },
      { type: 'addition', content: '' },
      { type: 'addition', content: '  async get<T>(key: string): Promise<T | null> {' },
      { type: 'addition', content: '    const entry = await this.redis.get(key);' },
      { type: 'addition', content: '    if (!entry || entry.expiredAt < Date.now()) return null;' },
      { type: 'addition', content: '    return entry.value as T;' },
      { type: 'addition', content: '  }' },
    ],
  },
  {
    filename: 'src/api/users/profile.ts',
    language: 'typescript',
    lines: [
      { type: 'deletion', content: 'import { SessionManager } from "@/services/auth/session-manager";' },
      { type: 'addition', content: 'import { TokenRefreshService } from "@/services/auth/token-refresh";' },
      { type: 'context', content: '' },
      { type: 'deletion', content: 'const session = new SessionManager();' },
      { type: 'addition', content: 'const tokenService = container.resolve(TokenRefreshService);' },
      { type: 'context', content: '' },
      { type: 'context', content: 'export async function getProfile(req: Request) {' },
    ],
  },
];

const FILE_TABS = FILE_CHANGES.map(f => f.filename.split('/').pop() || f.filename);

export function RefactorScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-refactor-editor]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      // Animate file tabs appearing
      gsap.from('[data-refactor-tab]', {
        scrollTrigger: {
          trigger: '[data-refactor-tabs]',
          start: 'top 80%',
        },
        opacity: 0,
        y: -10,
        stagger: 0.1,
        duration: 0.4,
        delay: 0.3,
        ease: 'power3.out',
      });

      // Animate each file diff block
      gsap.from('[data-refactor-file]', {
        scrollTrigger: {
          trigger: '[data-refactor-files]',
          start: 'top 80%',
        },
        opacity: 0,
        y: 20,
        stagger: 0.15,
        duration: 0.6,
        delay: 0.5,
        ease: 'power3.out',
      });

      // Animate diff lines within each file
      gsap.from('[data-refactor-line]', {
        scrollTrigger: {
          trigger: '[data-refactor-files]',
          start: 'top 75%',
        },
        opacity: 0,
        x: -5,
        stagger: 0.015,
        duration: 0.2,
        delay: 0.8,
        ease: 'power3.out',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 3</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Multi-file Refactor</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor generates a coordinated refactor across 5 files simultaneously, addressing every review comment while preserving existing behavior.
        </p>

        {/* Multi-file editor mockup */}
        <div data-refactor-editor className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center justify-between px-4 py-2 bg-dark-bg border-b border-dark-border">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <div className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <span className="ml-3 text-xs text-text-tertiary font-mono flex items-center gap-1.5">
                <Pencil className="w-3 h-3" />
                Cursor - Multi-file Edit
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#238636]/10 text-[#238636] font-mono">5 files modified</span>
          </div>

          {/* File tabs */}
          <div data-refactor-tabs className="flex overflow-x-auto border-b border-dark-border bg-[#0d1117]">
            {FILE_TABS.map((tab, i) => (
              <div
                key={i}
                data-refactor-tab
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-mono border-r border-dark-border shrink-0 cursor-pointer ${
                  i === 0 ? 'bg-dark-surface text-text-primary border-b-0' : 'text-[#8b949e] hover:bg-[#161b22]'
                }`}
              >
                <File className="w-3 h-3" />
                {tab}
                <span className="ml-1.5 w-1.5 h-1.5 rounded-full bg-[#d29922]" />
              </div>
            ))}
          </div>

          {/* All file diffs */}
          <div data-refactor-files className="divide-y divide-dark-border max-h-[500px] overflow-y-auto">
            {FILE_CHANGES.map((file, fileIdx) => (
              <div key={fileIdx} data-refactor-file>
                <div className="px-4 py-2 bg-[#161b22] text-xs font-mono text-[#8b949e] flex items-center gap-2 sticky top-0 z-10">
                  <File className="w-3 h-3" />
                  {file.filename}
                  <span className="ml-auto text-[#238636]">
                    +{file.lines.filter(l => l.type === 'addition').length}
                  </span>
                  <span className="text-[#da3633]">
                    -{file.lines.filter(l => l.type === 'deletion').length}
                  </span>
                </div>
                <pre className="text-xs leading-5">
                  {file.lines.map((line, lineIdx) => (
                    <div
                      key={lineIdx}
                      data-refactor-line
                      className={`flex px-4 ${
                        line.type === 'addition'
                          ? 'bg-[#238636]/10'
                          : line.type === 'deletion'
                          ? 'bg-[#da3633]/10'
                          : ''
                      }`}
                    >
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
            ))}
          </div>

          {/* Status bar */}
          <div className="px-4 py-2 border-t border-dark-border bg-dark-bg flex items-center justify-between text-[10px] text-text-tertiary">
            <span>5 files changed across 3 modules</span>
            <div className="flex items-center gap-4">
              <span className="text-[#238636]">+67 additions</span>
              <span className="text-[#da3633]">-29 deletions</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
