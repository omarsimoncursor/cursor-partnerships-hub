'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { CheckCircle2, Rocket, GitBranch, Server } from 'lucide-react';

const DEPLOY_STAGES = [
  { name: 'Build', duration: '1m 23s' },
  { name: 'Test', duration: '3m 12s' },
  { name: 'Deploy', duration: '0m 48s' },
];

const DEPLOY_LOG_LINES = [
  'Deploying to production...',
  'Pulling image registry.gitlab.com/acme/orders:48291-fix...',
  'Running health checks...',
  'Instance 1/3: healthy',
  'Instance 2/3: healthy',
  'Instance 3/3: healthy',
  'Deployment successful. All instances running.',
];

export function DeployScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [animatedStages, setAnimatedStages] = useState<number[]>([]);
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployLines, setDeployLines] = useState<number>(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-deploy-pipeline]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
          onEnter: () => {
            // Animate stages turning green one by one
            DEPLOY_STAGES.forEach((_, i) => {
              setTimeout(() => {
                setAnimatedStages(prev => [...prev, i]);
                if (i === DEPLOY_STAGES.length - 1) {
                  setTimeout(() => {
                    setShowDeploy(true);
                    // Type deploy log lines
                    DEPLOY_LOG_LINES.forEach((_, j) => {
                      setTimeout(() => setDeployLines(prev => prev + 1), j * 400);
                    });
                  }, 600);
                }
              }, 800 + i * 600);
            });
          },
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-deploy-success]', {
        scrollTrigger: {
          trigger: '[data-deploy-success]',
          start: 'top 85%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.8,
        delay: 4,
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
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Pipeline Goes Green</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          The fix is pushed, the pipeline re-runs, and every stage passes. The merge request auto-deploys to production.
        </p>

        {/* Re-run pipeline */}
        <div data-deploy-pipeline className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden mb-8">
          {/* Pipeline header */}
          <div className="flex items-center justify-between px-6 py-3 border-b border-dark-border bg-dark-bg">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded bg-[#FC6D26] flex items-center justify-center">
                <GitBranch className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm text-text-secondary">GitLab CI/CD</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-tertiary">
              <span className="font-mono">#48292 (retry)</span>
            </div>
          </div>

          {/* Pipeline stages */}
          <div className="px-6 py-6">
            <div className="flex items-center gap-3">
              {DEPLOY_STAGES.map((stage, i) => {
                const isAnimated = animatedStages.includes(i);
                return (
                  <div key={i} className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all duration-500 ${
                        isAnimated
                          ? 'bg-accent-green/10 border-accent-green/20'
                          : 'bg-dark-bg border-dark-border'
                      }`}
                    >
                      {isAnimated ? (
                        <CheckCircle2 className="w-4 h-4 text-accent-green" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border-2 border-text-tertiary border-t-transparent animate-spin" />
                      )}
                      <div>
                        <p className={`text-sm font-medium transition-colors duration-500 ${
                          isAnimated ? 'text-accent-green' : 'text-text-tertiary'
                        }`}>{stage.name}</p>
                        <p className="text-[10px] text-text-tertiary">{isAnimated ? stage.duration : 'running...'}</p>
                      </div>
                    </div>
                    {i < DEPLOY_STAGES.length - 1 && (
                      <div className={`w-8 h-[2px] transition-colors duration-500 ${
                        isAnimated ? 'bg-accent-green/30' : 'bg-dark-border'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Deploy log */}
          {showDeploy && (
            <div className="mx-4 mb-4 rounded-lg bg-dark-bg border border-dark-border overflow-hidden">
              <div className="px-4 py-2 border-b border-dark-border flex items-center gap-2">
                <Rocket className="w-3 h-3 text-accent-green" />
                <span className="text-[10px] text-text-tertiary uppercase tracking-wider">Deploy Output</span>
              </div>
              <div className="p-4">
                {DEPLOY_LOG_LINES.slice(0, deployLines).map((line, i) => (
                  <div key={i} className="font-mono text-xs leading-5">
                    <span className={
                      line.includes('successful') ? 'text-accent-green font-semibold' :
                      line.includes('healthy') ? 'text-accent-green' :
                      'text-text-secondary'
                    }>
                      {line}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Success banner */}
        <div data-deploy-success className="glass-card p-8 text-center border-accent-green/20">
          <div className="flex items-center justify-center gap-4 mb-4">
            <CheckCircle2 className="w-8 h-8 text-accent-green" />
            <Rocket className="w-8 h-8 text-[#FC6D26]" />
          </div>
          <h3 className="text-xl font-bold text-text-primary mb-2">Deployed to Production</h3>
          <p className="text-sm text-text-secondary max-w-md mx-auto">
            From failing pipeline to production deploy in under 10 minutes. The race condition is resolved and the order processing system is back to full reliability.
          </p>
          <div className="flex items-center justify-center gap-6 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-green">4/4</p>
              <p className="text-[10px] text-text-tertiary">Tests passing</p>
            </div>
            <div className="w-px h-8 bg-dark-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-accent-green">3/3</p>
              <p className="text-[10px] text-text-tertiary">Instances healthy</p>
            </div>
            <div className="w-px h-8 bg-dark-border" />
            <div className="text-center">
              <p className="text-2xl font-bold text-[#FC6D26]">&lt;10m</p>
              <p className="text-[10px] text-text-tertiary">Total resolution time</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
