'use client';

import {
  GitMerge,
  GitPullRequest,
  Check,
  MessageSquare,
  ChevronDown,
  Eye,
  MoreHorizontal,
  Book,
} from 'lucide-react';

export function GitHubPRPreview() {
  return (
    <div className="w-full h-full bg-[#0d1117] text-[#e6edf3] overflow-y-auto font-sans">
      {/* Top header */}
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path
              fillRule="evenodd"
              d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"
            />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">
              cursor-for-enterprise
            </span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">
            Public
          </span>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d] flex items-center gap-1.5">
              <Eye className="w-3 h-3" /> Watch
              <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">12</span>
            </button>
            <button className="px-3 py-1 text-[12px] rounded-md border border-[#30363d] bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]">
              ★ Star
              <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10px]">341</span>
            </button>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-1 text-[13.5px]">
          <NavTab label="Code" />
          <NavTab label="Issues" count="3" />
          <NavTab label="Pull requests" count="2" active />
          <NavTab label="Actions" />
          <NavTab label="Projects" />
          <NavTab label="Wiki" />
          <NavTab label="Security" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      {/* PR header */}
      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            sec(zpa): scope down workforce-admin-audit-logs ALLOW rule (4,287 → 18 in scope)
            <span className="text-[#7d8590] ml-2 font-light">#213</span>
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <button className="px-3 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13px] font-medium">
              Code ▾
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1f6feb] text-white text-[13px] font-medium">
            <GitPullRequest className="w-4 h-4" />
            Open
          </span>
          <p className="text-[14px] text-[#7d8590]">
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">
              cursor-agent
            </span>{' '}
            wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              main
            </span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">
              sec/scope-down-workforce-admin-zpa
            </span>
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab
            label="Conversation"
            count="3"
            active
            icon={<MessageSquare className="w-3.5 h-3.5" />}
          />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="5" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="1" />
        </div>
      </div>

      {/* Body */}
      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        {/* Main column */}
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="2 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Add the missing <code className="ghx">SCIM_GROUP</code>,{' '}
                  <code className="ghx">POSTURE</code>, <code className="ghx">TRUSTED_NETWORK</code>, and{' '}
                  <code className="ghx">CLIENT_TYPE</code> conditions to{' '}
                  <code className="ghx">zpa_policy_access_rule.workforce_admin_audit_logs_allow</code>
                  . The application segment is unchanged. <code className="ghx">terraform plan</code>{' '}
                  shows{' '}
                  <span className="font-mono text-[#3fb950]">~ 1 to change · 0 add · 0 destroy</span>
                  . Replayed conformance probe restores deny-by-default for the four canonical
                  requests.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Before / after scope</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d]">
                  <table className="w-full text-[13px]">
                    <thead className="bg-[#151b23] text-[#7d8590] text-[11.5px] uppercase tracking-wider">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Metric</th>
                        <th className="px-3 py-2 text-right font-semibold">Before</th>
                        <th className="px-3 py-2 text-right font-semibold">After</th>
                        <th className="px-3 py-2 text-right font-semibold">Δ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#30363d]">
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Users in scope</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">4,287</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">18</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">−99.6%</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Risk score (ZPA)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">92 / 100</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">7 / 100</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">cleared</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Conformance probes</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">1 / 4</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">4 / 4</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">restored</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Unmanaged-device paths</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">1</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">closed</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Root cause</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    <code className="ghx">zpa_policy_access_rule.workforce_admin_audit_logs_allow</code>{' '}
                    declared an{' '}
                    <code className="ghx">action = &quot;ALLOW&quot;</code> with only an{' '}
                    <code className="ghx">APP</code> condition. ZPA evaluates a missing
                    SCIM/POSTURE/TRUSTED_NETWORK/CLIENT_TYPE condition as &quot;any&quot;.
                  </li>
                  <li>
                    Regression introduced in commit{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                      b7c91d2
                    </span>{' '}
                    — <em>&quot;wip: open audit logs for QA&quot;</em> (3 days ago, qa-bot). The
                    earlier version had SCIM and POSTURE conditions; QA stripped them and the
                    revert never landed.
                  </li>
                  <li>
                    Zscaler ZPA risk event{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                      evt-21794
                    </span>{' '}
                    confirms 4,287 users in scope vs intent 18.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Fix</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Add <code className="ghx">SCIM_GROUP</code> conditions for{' '}
                    <code className="ghx">security-admin</code> and{' '}
                    <code className="ghx">compliance-officer</code>, joined by <code className="ghx">OR</code>.
                  </li>
                  <li>
                    Add <code className="ghx">POSTURE</code> condition pinned to the{' '}
                    <code className="ghx">managed-compliant-corp</code> profile with{' '}
                    <code className="ghx">rhs = &quot;true&quot;</code>.
                  </li>
                  <li>
                    Add <code className="ghx">TRUSTED_NETWORK</code> condition for{' '}
                    <code className="ghx">corp-egress</code>.
                  </li>
                  <li>
                    Add <code className="ghx">CLIENT_TYPE</code> condition for{' '}
                    <code className="ghx">zpn_client_type_zapp</code> only.
                  </li>
                  <li>
                    Resource ID is unchanged. <code className="ghx">terraform plan</code> shows{' '}
                    <span className="font-mono text-[#3fb950]">in-place update only</span> —{' '}
                    no destroy, no re-create, no app-segment churn.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span className="text-[#7d8590]">{`  # infrastructure/zscaler/workforce-admin.tf

  resource "zpa_policy_access_rule" "workforce_admin_audit_logs_allow" {
    name        = "workforce-admin-audit-logs-allow"
    action      = "ALLOW"
    operator    = "AND"

    conditions {
      operator = "OR"
      operands {
        object_type = "APP"
        lhs         = "id"
        rhs         = zpa_application_segment.workforce_admin_audit_logs.id
      }
    }
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+
+   conditions {
+     operator = "OR"
+     operands {
+       object_type = "SCIM_GROUP"
+       lhs         = data.zpa_idp_controller.okta_prod.id
+       rhs         = data.zpa_scim_groups.security_admin.id
+     }
+     operands {
+       object_type = "SCIM_GROUP"
+       lhs         = data.zpa_idp_controller.okta_prod.id
+       rhs         = data.zpa_scim_groups.compliance_officer.id
+     }
+   }
+
+   conditions {
+     operator = "AND"
+     operands {
+       object_type = "POSTURE"
+       lhs         = data.zpa_posture_profile.managed_compliant.posture_udid
+       rhs         = "true"
+     }
+   }
+
+   conditions {
+     operator = "AND"
+     operands {
+       object_type = "TRUSTED_NETWORK"
+       lhs         = data.zpa_trusted_network.corp_egress.network_id
+       rhs         = "true"
+     }
+   }
+
+   conditions {
+     operator = "OR"
+     operands {
+       object_type = "CLIENT_TYPE"
+       lhs         = "id"
+       rhs         = "zpn_client_type_zapp"
+     }
+   }
`}</span>
<span className="text-[#7d8590]">{`  }
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">terraform plan</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre">
<span className="text-[#e6edf3]">{`Terraform will perform the following actions:

  # zpa_policy_access_rule.workforce_admin_audit_logs_allow will be `}</span><span className="text-[#d29922]">updated in-place</span>
<span className="text-[#d29922]">{`  ~ resource "zpa_policy_access_rule" "workforce_admin_audit_logs_allow" {
        id          = "ZTA-pol-9921"
        name        = "workforce-admin-audit-logs-allow"
        # (4 unchanged attributes hidden)

      + conditions { operator = "OR"  operands { object_type = "SCIM_GROUP"  ... } operands { ... } }
      + conditions { operator = "AND" operands { object_type = "POSTURE"        ... } }
      + conditions { operator = "AND" operands { object_type = "TRUSTED_NETWORK" ... } }
      + conditions { operator = "OR"  operands { object_type = "CLIENT_TYPE"    ... } }
    }

`}</span>
<span className="text-[#e6edf3]">{`Plan: `}</span><span className="text-[#3fb950]">0 to add</span><span className="text-[#e6edf3]">{`, `}</span><span className="text-[#d29922]">1 to change</span><span className="text-[#e6edf3]">{`, `}</span><span className="text-[#3fb950]">0 to destroy</span><span className="text-[#e6edf3]">.</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Conformance probe (replayed)</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span>{`request                                            expected   got      result
─────────────────────────────────────────────────  ─────────  ───────  ──────
security-admin · compliant · corp · zapp           ALLOW      ALLOW   `}</span><span className="text-[#3fb950]">{` ✓`}</span>
<span>{`
security-admin · noncompliant · corp · zapp        DENY       DENY    `}</span><span className="text-[#3fb950]">{` ✓`}</span>
<span>{`
employee · compliant · corp · zapp                 DENY       DENY    `}</span><span className="text-[#3fb950]">{` ✓`}</span>
<span>{`
anon · unmanaged · public · exporter               DENY       DENY    `}</span><span className="text-[#3fb950]">{` ✓`}</span>
<span>{`

`}</span><span className="text-[#3fb950]">{`4/4 passed · deny-by-default restored`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Zscaler ZPA risk event:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">
                      evt-21794
                    </span>{' '}
                    · score 92/100 → 7/100
                  </li>
                  <li>
                    Okta reconciliation:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">
                      sec-admin (12) + compliance-officer (6) = 18
                    </span>
                  </li>
                  <li>
                    ServiceNow:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer">
                      SIR0005712
                    </span>
                  </li>
                  <li>
                    <code className="ghx">terraform validate</code>:{' '}
                    <span className="text-[#3fb950]">✓</span> ·{' '}
                    <code className="ghx">terraform plan</code>:{' '}
                    <span className="text-[#3fb950]">~1 / +0 / -0</span> · tfsec / checkov:{' '}
                    <span className="text-[#3fb950]">✓</span>
                  </li>
                  <li>
                    Conformance probe:{' '}
                    <span className="text-[#3fb950]">✓ 4 / 4 passed, deny-by-default restored</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 1 file · +24 −1</li>
                  <li>
                    Plan shape: <span className="font-mono text-[#3fb950]">in-place update only</span> — app segment, IDs, and connector groups unchanged.
                  </li>
                  <li>
                    Rollback:{' '}
                    <code className="ghx">git revert HEAD &amp;&amp; terraform apply</code> — no SCIM, no IdP, no infra side effects.
                  </li>
                  <li>
                    18 in-scope users (security-admin + compliance-officer) confirmed via Okta SCIM data source.
                  </li>
                </ul>
              </section>
            </div>
          </PrComment>

          {/* Review timeline event */}
          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          {/* Checks summary */}
          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">
                  All checks have passed
                </span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">
                Show all checks
              </button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="terraform-fmt" detail="terraform fmt -check -recursive" duration="1s" />
              <CheckRow name="terraform-validate" detail="zscaler/zpa ~> 4.4 · ✓" duration="3s" />
              <CheckRow
                name="terraform-plan"
                detail="~ 1 to change · 0 add · 0 destroy"
                duration="9s"
              />
              <CheckRow
                name="tfsec + checkov"
                detail="AVD-ZPA-001 (broad scope) → resolved · 0 high · 0 medium"
                duration="6s"
              />
              <CheckRow
                name="zpa-policy-conformance"
                detail="4 / 4 simulated requests · deny-by-default ✓"
                duration="5s"
              />
            </div>
          </PrComment>

          {/* Merge box */}
          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  This branch has no conflicts with the base branch
                </p>
                <p className="text-[12.5px] text-[#7d8590]">
                  Atlantis will run <code className="ghx">terraform apply</code> on merge.
                </p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        {/* Right sidebar */}
        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
            </SidebarRow>
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#0079D5]/20 flex items-center justify-center">
                <span className="text-[#65B5F2] text-[10px] font-bold">R</span>
              </div>
              <span className="text-[#e6edf3]">@risk-ops</span>
              <span className="ml-auto text-[#7d8590]">requested</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Assignees">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <span className="text-[#e6edf3]">cursor-agent</span>
            </SidebarRow>
          </SidebarSection>
          <SidebarSection title="Labels">
            <div className="flex flex-wrap gap-1.5">
              <Label color="#0079D5" label="zero-trust" />
              <Label color="#7B42BC" label="terraform" />
              <Label color="#F5A623" label="sec-p1" />
              <Label color="#2188ff" label="auto-fix" />
              <Label color="#7D8590" label="zscaler-triage" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to an issue</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">
                SIR0005712 (ServiceNow)
              </p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">evt-21794 (Zscaler)</p>
            </div>
          </SidebarSection>
          <SidebarSection title="Milestone">
            <p className="text-[#7d8590]">No milestone</p>
          </SidebarSection>
          <SidebarSection title="2 participants">
            <div className="flex gap-1">
              <div className="w-6 h-6 rounded-full bg-accent-blue/20 flex items-center justify-center">
                <span className="text-accent-blue text-[10px] font-bold">C</span>
              </div>
              <div className="w-6 h-6 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
            </div>
          </SidebarSection>
        </aside>
      </div>

      <style jsx>{`
        .ghx {
          padding: 1px 4px;
          border-radius: 4px;
          background: #151b23;
          border: 1px solid #30363d;
          font-family: ui-monospace, monospace;
          font-size: 12.5px;
        }
      `}</style>
    </div>
  );
}

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">
          {count}
        </span>
      )}
    </button>
  );
}

function PrTab({
  label,
  count,
  active,
  icon,
}: {
  label: string;
  count?: string;
  active?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <button
      className={`px-4 py-3 flex items-center gap-1.5 border-b-2 ${
        active
          ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
          : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && (
        <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">
          {count}
        </span>
      )}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">{children}</div>
  );
}

function PrCommentHeader({
  author,
  bot,
  label,
  time,
}: {
  author: string;
  bot?: boolean;
  label: string;
  time: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-[#30363d] bg-[#151b23]">
      <div className="flex items-center gap-2 text-[13px]">
        <div className="w-5 h-5 rounded-full bg-accent-blue/20 flex items-center justify-center">
          <span className="text-accent-blue text-[10px] font-bold">{author[0].toUpperCase()}</span>
        </div>
        <span className="font-semibold text-[#e6edf3]">{author}</span>
        {bot && (
          <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">
            bot
          </span>
        )}
        <span className="text-[#7d8590]">
          {label} · {time}
        </span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({
  name,
  detail,
  duration,
}: {
  name: string;
  detail: string;
  duration: string;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <Check className="w-4 h-4 text-[#3fb950] shrink-0" />
      <span className="font-mono text-[12.5px] text-[#e6edf3] font-medium">{name}</span>
      <span className="text-[#7d8590] truncate">{detail}</span>
      <span className="ml-auto text-[#7d8590] font-mono text-[11.5px]">{duration}</span>
      <span className="text-[#4493f8] text-[11.5px] hover:underline cursor-pointer">Details</span>
    </div>
  );
}

function SidebarSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-[#30363d] pb-4">
      <div className="flex items-center justify-between mb-2 text-[#7d8590]">
        <span className="font-semibold">{title}</span>
        <ChevronDown className="w-3.5 h-3.5" />
      </div>
      {children}
    </div>
  );
}

function SidebarRow({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-2 text-[13px]">{children}</div>;
}

function Label({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[11px] font-medium border"
      style={{
        backgroundColor: `${color}22`,
        borderColor: `${color}55`,
        color,
      }}
    >
      {label}
    </span>
  );
}
