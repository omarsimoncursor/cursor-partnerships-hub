'use client';

import { useEffect, useRef, useState } from 'react';
import { gsap } from '@/lib/gsap-init';
import { TypingAnimation } from '@/components/ui/typing-animation';
import { CodeBlock } from '@/components/ui/code-block';
import { Terminal, Cloud } from 'lucide-react';

const ECS_CODE = `resource "aws_ecs_service" "order_service" {
  name            = "order-service"
  cluster         = aws_ecs_cluster.main.id
  task_definition = aws_ecs_task_definition.order.arn
  desired_count   = 3

  load_balancer {
    target_group_arn = aws_lb_target_group.order.arn
    container_name   = "order-service"
    container_port   = 8080
  }

  network_configuration {
    subnets         = var.private_subnets
    security_groups = [aws_security_group.ecs.id]
  }
}`;

const API_GW_CODE = `resource "aws_apigatewayv2_api" "main" {
  name          = "microservices-api"
  protocol_type = "HTTP"
}

resource "aws_apigatewayv2_route" "orders" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/orders/{proxy+}"
  target    = "integrations/\${aws_apigatewayv2_integration.order.id}"
}

resource "aws_apigatewayv2_route" "payments" {
  api_id    = aws_apigatewayv2_api.main.id
  route_key = "ANY /api/payments/{proxy+}"
  target    = "integrations/\${aws_apigatewayv2_integration.payment.id}"
}`;

const RDS_CODE = `resource "aws_db_instance" "payments" {
  identifier     = "payments-db"
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.r6g.large"

  db_name  = "payments"
  username = var.db_username
  password = var.db_password

  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name

  multi_az            = true
  storage_encrypted   = true
  deletion_protection = true
}`;

const TERMINAL_LINES = [
  { text: 'Generating Terraform infrastructure code...', prefix: '>' },
  { text: 'Creating ECS task definitions for 5 services...', prefix: '>' },
  { text: '  order-service.tf', color: '#4ade80' },
  { text: '  payment-service.tf', color: '#4ade80' },
  { text: '  auth-service.tf', color: '#4ade80' },
  { text: '  inventory-service.tf', color: '#4ade80' },
  { text: '  notification-service.tf (Lambda)', color: '#4ade80' },
  { text: '', prefix: '' },
  { text: 'Creating API Gateway routes...', prefix: '>' },
  { text: '  /api/orders/* -> order-service', color: '#FF9900' },
  { text: '  /api/payments/* -> payment-service', color: '#FF9900' },
  { text: '  /api/auth/* -> auth-service', color: '#FF9900' },
  { text: '  /api/inventory/* -> inventory-service', color: '#FF9900' },
  { text: '', prefix: '' },
  { text: 'Creating RDS instances and DynamoDB tables...', prefix: '>' },
  { text: 'Generating security groups and IAM roles...', prefix: '>' },
  { text: 'Infrastructure code generation complete.', prefix: '>', color: '#4ade80' },
  { text: '  17 Terraform files generated', color: '#4ade80' },
  { text: '  43 resources defined', color: '#4ade80' },
];

const CODE_TABS = [
  { label: 'ECS Service', code: ECS_CODE, filename: 'order-service.tf' },
  { label: 'API Gateway', code: API_GW_CODE, filename: 'api-gateway.tf' },
  { label: 'RDS Instance', code: RDS_CODE, filename: 'payments-db.tf' },
];

export function InfraScene() {
  const sectionRef = useRef<HTMLElement>(null);
  const [showTyping, setShowTyping] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('[data-infra-terminal]', {
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

      gsap.from('[data-infra-code]', {
        scrollTrigger: {
          trigger: '[data-infra-code]',
          start: 'top 80%',
        },
        opacity: 0,
        x: 20,
        duration: 0.7,
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
          <span className="text-xs font-mono text-text-tertiary bg-cta-bg px-3 py-1 rounded-full">Act 4</span>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary">Infrastructure as Code, Generated</h2>
        </div>
        <p className="text-text-secondary mb-12 max-w-xl">
          Cursor generates production-ready Terraform for ECS tasks, API Gateway routes, RDS instances, and all supporting infrastructure.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Terminal */}
          <div data-infra-terminal className="rounded-xl border border-dark-border bg-dark-surface overflow-hidden">
            <div className="px-4 py-2 border-b border-dark-border bg-dark-bg flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#FF9900]" />
              <span className="text-xs text-text-tertiary">Cursor AI - Terraform Generation</span>
            </div>
            <div className="p-4 min-h-[420px]">
              {showTyping && (
                <TypingAnimation
                  lines={TERMINAL_LINES}
                  speed={18}
                  className="text-xs"
                />
              )}
            </div>
          </div>

          {/* Code output */}
          <div data-infra-code>
            {/* Tabs */}
            <div className="flex gap-1 mb-3">
              {CODE_TABS.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`px-3 py-1.5 text-xs font-mono rounded-t-lg transition-colors ${
                    activeTab === i
                      ? 'bg-dark-surface text-[#FF9900] border border-dark-border border-b-0'
                      : 'text-text-tertiary hover:text-text-secondary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <CodeBlock
              code={CODE_TABS[activeTab].code}
              filename={CODE_TABS[activeTab].filename}
              additions={Array.from({ length: CODE_TABS[activeTab].code.split('\n').length }, (_, i) => i + 1)}
            />

            {/* AWS badge */}
            <div className="mt-4 flex items-center gap-2 text-xs text-text-tertiary">
              <Cloud className="w-4 h-4 text-[#FF9900]" />
              <span>Targeting AWS us-east-1 region</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
