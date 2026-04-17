'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { CheckCircle2, XCircle, Clock, FlaskConical } from 'lucide-react';

const TEST_CODE_LINES = [
  { text: 'import { TokenRefreshService } from "../token-refresh";', prefix: '' },
  { text: 'import { MockTokenStore } from "./__mocks__/token-store";', prefix: '' },
  { text: '', prefix: '' },
  { text: 'describe("TokenRefreshService", () => {', prefix: '' },
  { text: '  let service: TokenRefreshService;', prefix: '' },
  { text: '  let store: MockTokenStore;', prefix: '' },
  { text: '', prefix: '' },
  { text: '  beforeEach(() => {', prefix: '' },
  { text: '    store = new MockTokenStore();', prefix: '' },
  { text: '    service = new TokenRefreshService(store, mockEvents);', prefix: '' },
  { text: '  });', prefix: '' },
  { text: '', prefix: '' },
  { text: '  it("refreshes expired tokens", async () => {', prefix: '', color: '#4ade80' },
  { text: '    store.setToken("sess_1", expiredToken);', prefix: '', color: '#4ade80' },
  { text: '    const result = await service.refreshSession("sess_1");', prefix: '', color: '#4ade80' },
  { text: '    expect(result.isExpired()).toBe(false);', prefix: '', color: '#4ade80' },
  { text: '  });', prefix: '' },
  { text: '', prefix: '' },
  { text: '  it("throws for missing sessions", async () => {', prefix: '', color: '#4ade80' },
  { text: '    await expect(service.refreshSession("bad_id"))', prefix: '', color: '#4ade80' },
  { text: '      .rejects.toThrow(SessionNotFoundError);', prefix: '', color: '#4ade80' },
  { text: '  });', prefix: '' },
  { text: '', prefix: '' },
  { text: '  it("emits event on successful refresh", async () => {', prefix: '', color: '#4ade80' },
  { text: '    store.setToken("sess_2", expiredToken);', prefix: '', color: '#4ade80' },
  { text: '    await service.refreshSession("sess_2");', prefix: '', color: '#4ade80' },
  { text: '    expect(mockEvents.emit).toHaveBeenCalledWith(', prefix: '', color: '#4ade80' },
  { text: '      "session:refreshed", { sessionId: "sess_2" }', prefix: '', color: '#4ade80' },
  { text: '    );', prefix: '', color: '#4ade80' },
  { text: '  });', prefix: '' },
  { text: '});', prefix: '' },
];

const TEST_RESULTS = [
  { name: 'refreshes expired tokens', status: 'pass', time: '12ms' },
  { name: 'throws for missing sessions', status: 'pass', time: '3ms' },
  { name: 'emits event on successful refresh', status: 'pass', time: '8ms' },
  { name: 'uses config-driven rate limits', status: 'pass', time: '5ms' },
  { name: 'cache respects TTL expiration', status: 'pass', time: '14ms' },
  { name: 'cache delegates to redis client', status: 'pass', time: '7ms' },
  { name: 'profile endpoint uses new token service', status: 'pass', time: '22ms' },
  { name: 'legacy auth migration path works', status: 'pass', time: '18ms' },
];

export function TestsScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-test-editor]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          onEnter: () => setShowTyping(true),
        },
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-test-result]', {
        scrollTrigger: {
          trigger: '[data-test-results]',
          start: 'top 80%',
        },
        opacity: 0,
        x: -10,
        stagger: 0.08,
        duration: 0.4,
        delay: 0.5,
        ease: 'power3.out',
      });

      gsap.from('[data-test-summary]', {
        scrollTrigger: {
          trigger: '[data-test-summary]',
          start: 'top 85%',
        },
        opacity: 0,
        scale: 0.95,
        duration: 0.5,
        delay: 0.8,
        ease: 'back.out(1.5)',
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="py-32 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 4</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Tests Auto-generated</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor generates a comprehensive test suite for the refactored code, covering edge cases and verifying backward compatibility.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Test file being written */}
          <div data-test-editor className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-bg">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-4 h-4 text-accent-blue" />
                <span className="text-xs text-text-tertiary font-mono">token-refresh.test.ts</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#238636]/10 text-[#238636] font-mono">new file</span>
            </div>
            <div className="p-4 min-h-[400px] max-h-[450px] overflow-y-auto">
              {showTyping && (
                <TypingAnimation
                  lines={TEST_CODE_LINES}
                  speed={15}
                  className="text-xs"
                />
              )}
            </div>
          </div>

          {/* Test results */}
          <div className="space-y-4">
            <div data-test-results className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-dark-border bg-dark-bg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#238636]" />
                  <span className="text-xs text-text-tertiary">Test Results</span>
                </div>
                <span className="text-[10px] text-[#238636] font-mono">8 passed</span>
              </div>
              <div className="p-3 space-y-1">
                {TEST_RESULTS.map((test, i) => (
                  <div
                    key={i}
                    data-test-result
                    className="flex items-center gap-2 py-1.5 px-2 rounded text-xs hover:bg-dark-bg transition-colors"
                  >
                    {test.status === 'pass' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#238636] shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-[#da3633] shrink-0" />
                    )}
                    <span className="text-[#c9d1d9] flex-1">{test.name}</span>
                    <span className="text-[#8b949e] font-mono flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {test.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Test summary card */}
            <div data-test-summary className="glass-card p-5 border-[#238636]/20">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-[#238636]/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-[#238636]" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">All tests passing</p>
                  <p className="text-[10px] text-text-tertiary">8 tests, 3 suites, 89ms total</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 mt-4">
                <div className="text-center">
                  <p className="text-lg font-bold text-[#238636]">100%</p>
                  <p className="text-[10px] text-text-tertiary">Pass rate</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">94%</p>
                  <p className="text-[10px] text-text-tertiary">Coverage</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-text-primary">89ms</p>
                  <p className="text-[10px] text-text-tertiary">Total time</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
