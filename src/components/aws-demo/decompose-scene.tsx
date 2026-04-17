'use client';

import { useEffect, useRef } from 'react';
import { gsap } from '@/lib/gsap-init';
import { Shield, Database, ShoppingCart, Package, Bell, ArrowRight } from 'lucide-react';

const SERVICES = [
  {
    name: 'Auth Service',
    icon: Shield,
    aws: 'Amazon Cognito + ECS',
    detail: '23 files extracted',
    connections: ['Orders', 'Payments'],
  },
  {
    name: 'Payment Service',
    icon: Database,
    aws: 'ECS Fargate + RDS',
    detail: '41 files extracted',
    connections: ['Orders'],
  },
  {
    name: 'Order Service',
    icon: ShoppingCart,
    aws: 'ECS Fargate + DynamoDB',
    detail: '38 files extracted',
    connections: ['Inventory', 'Notifications'],
  },
  {
    name: 'Inventory Service',
    icon: Package,
    aws: 'ECS Fargate + RDS',
    detail: '29 files extracted',
    connections: [],
  },
  {
    name: 'Notification Service',
    icon: Bell,
    aws: 'Lambda + SQS + SES',
    detail: '18 files extracted',
    connections: [],
  },
];

const CONNECTIONS = [
  { from: 'Auth Service', to: 'Order Service', label: 'JWT validation' },
  { from: 'Auth Service', to: 'Payment Service', label: 'Token verify' },
  { from: 'Order Service', to: 'Payment Service', label: 'REST API' },
  { from: 'Order Service', to: 'Inventory Service', label: 'gRPC' },
  { from: 'Order Service', to: 'Notification Service', label: 'SQS events' },
];

export function DecomposeScene() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-decompose-card]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
        opacity: 0,
        scale: 0.85,
        y: 20,
        stagger: 0.12,
        duration: 0.6,
        ease: 'back.out(1.3)',
      });

      gsap.from('[data-decompose-arrow]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 55%',
        },
        opacity: 0,
        scaleX: 0,
        transformOrigin: 'left',
        stagger: 0.08,
        duration: 0.5,
        delay: 0.8,
        ease: 'power3.out',
      });

      gsap.from('[data-api-gateway]', {
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 60%',
        },
        opacity: 0,
        y: -20,
        duration: 0.6,
        delay: 0.4,
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
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Decomposition in Action</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor extracts each module into an independent microservice with its own data store, API contracts, and AWS deployment target.
        </p>

        {/* API Gateway header */}
        <div data-api-gateway className="rounded-xl border border-[#FF9900]/30 bg-[#FF9900]/5 p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#FF9900]/20 flex items-center justify-center">
              <span className="text-sm font-bold text-[#FF9900]">GW</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-text-primary">Amazon API Gateway</p>
              <p className="text-[10px] text-text-tertiary">Routes traffic to individual services</p>
            </div>
          </div>
          <span className="text-xs font-mono text-[#FF9900]">api.example.com</span>
        </div>

        {/* Service cards */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          {SERVICES.map((service, i) => {
            const Icon = service.icon;
            return (
              <div key={i} data-decompose-card className="glass-card p-4 flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-xl bg-[#FF9900]/10 border border-[#FF9900]/20 flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-[#FF9900]" />
                </div>
                <p className="text-xs font-semibold text-text-primary mb-1">{service.name}</p>
                <p className="text-[10px] text-[#FF9900] font-mono mb-2">{service.aws}</p>
                <p className="text-[10px] text-text-tertiary">{service.detail}</p>
              </div>
            );
          })}
        </div>

        {/* Connection map */}
        <div className="glass-card p-6">
          <p className="text-xs font-mono text-text-tertiary uppercase tracking-wider mb-4">Service Communication Map</p>
          <div className="space-y-3">
            {CONNECTIONS.map((conn, i) => (
              <div key={i} data-decompose-arrow className="flex items-center gap-3 text-xs">
                <span className="text-text-primary font-mono w-32 text-right shrink-0">{conn.from}</span>
                <div className="flex items-center gap-1 text-[#FF9900]">
                  <div className="w-12 h-[1px] bg-[#FF9900]/40" />
                  <ArrowRight className="w-3 h-3" />
                </div>
                <span className="text-text-primary font-mono w-36 shrink-0">{conn.to}</span>
                <span className="text-text-tertiary text-[10px] px-2 py-0.5 rounded bg-cta-bg">{conn.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
