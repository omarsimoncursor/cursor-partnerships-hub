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
      <div className="border-b border-[#30363d] bg-[#010409]">
        <div className="max-w-[1280px] mx-auto px-5 py-3 flex items-center gap-4">
          <svg viewBox="0 0 16 16" className="w-8 h-8 fill-white">
            <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
          </svg>

          <div className="flex items-center gap-1.5 text-[14px]">
            <span className="text-[#4493f8] hover:underline cursor-pointer">cursor-demos</span>
            <span className="text-[#7d8590]">/</span>
            <span className="text-[#4493f8] hover:underline cursor-pointer font-semibold">cursor-for-enterprise</span>
          </div>

          <span className="px-2 py-0.5 rounded-full border border-[#30363d] text-[11px] text-[#7d8590]">Public</span>

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
          <NavTab label="Security" count="0" />
          <NavTab label="Insights" />
          <NavTab label="Settings" />
        </div>
      </div>

      {/* PR header */}
      <div className="max-w-[1280px] mx-auto px-5 pt-6 pb-4 border-b border-[#30363d]">
        <div className="flex items-start justify-between gap-4 mb-3">
          <h1 className="text-[26px] font-normal text-[#e6edf3] leading-tight">
            security: parameterize customer profile lookup + bump mongoose (resolves SNYK-JS-CUSTOMER-PROFILE-001, CVSS 9.8)
            <span className="text-[#7d8590] ml-2 font-light">#214</span>
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
            <span className="text-[#4493f8] hover:underline cursor-pointer font-medium">cursor-agent</span> wants to merge{' '}
            <span className="text-[#4493f8] hover:underline cursor-pointer">1 commit</span> into{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">main</span>{' '}
            from{' '}
            <span className="inline-block px-1.5 py-0.5 rounded bg-[#21262d] border border-[#30363d] font-mono text-[12.5px] text-[#4493f8]">security/patch-customer-profile-injection</span>
          </p>
        </div>
      </div>

      <div className="border-b border-[#30363d]">
        <div className="max-w-[1280px] mx-auto px-5 flex items-center gap-0 text-[13.5px]">
          <PrTab label="Conversation" count="3" active icon={<MessageSquare className="w-3.5 h-3.5" />} />
          <PrTab label="Commits" count="1" />
          <PrTab label="Checks" count="5" icon={<Check className="w-3.5 h-3.5 text-[#3fb950]" />} />
          <PrTab label="Files changed" count="2" />
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-5 py-6 grid grid-cols-[1fr_296px] gap-6">
        <div className="min-w-0 space-y-4">
          <PrComment>
            <PrCommentHeader author="cursor-agent" bot label="authored" time="2 minutes ago" />
            <div className="text-[14px] text-[#e6edf3] leading-relaxed space-y-4">
              <section>
                <h3 className="font-semibold text-[15px] mb-1">Summary</h3>
                <p>
                  Patches the NoSQL injection in{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">customer-profile.ts</code>{' '}
                  by parameterizing the selector and adding an allowlist-validated{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">ValidationError</code>.
                  Companion bump for{' '}
                  <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">mongoose@5.13.7 → 5.13.20</code>{' '}
                  resolves the high-severity prototype-pollution finding flagged by Snyk Open Source on the same path.
                </p>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Exploit replay</h3>
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
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Records leaked</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">12</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">fully blocked</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">snyk test (medium+)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">1 critical · 1 high</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">0 · 0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">cleared</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">CVSS (highest)</td>
                        <td className="px-3 py-2 text-right font-mono text-[#f85149]">9.8</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">—</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">resolved</td>
                      </tr>
                      <tr>
                        <td className="px-3 py-2 font-mono text-[#4493f8]">Validation errors raised</td>
                        <td className="px-3 py-2 text-right font-mono">0</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">100% of bad payloads</td>
                        <td className="px-3 py-2 text-right font-mono text-[#3fb950]">+gate</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Root cause</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">lookupCustomerProfile</code>{' '}
                    string-interpolated <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">query.username</code> into the Mongo selector. The canonical payload <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">{`' || '1'=='1`}</code> collapses the predicate to <em>always-true</em>.
                  </li>
                  <li>
                    Regression introduced in commit{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">5e9d3c2</span>{' '}
                    — <em>&quot;feat: add internal customer lookup&quot;</em> (11 days ago)
                  </li>
                  <li>
                    Snyk Code finding{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">SNYK-JS-CUSTOMER-PROFILE-001</span>{' '}
                    confirms the data-flow source → sink in the Snyk console.
                  </li>
                  <li>
                    Companion: Snyk Open Source flagged{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">SNYK-JS-MONGOOSE-2961688</span>{' '}
                    (prototype pollution, CVSS 7.5) on the same path.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Fix</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Pass <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">username</code> as a value into <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">parseSelector</code>; remove the string interpolation.
                  </li>
                  <li>
                    Add an allowlist regex <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">/^[a-zA-Z0-9_.-]{'{'}1,64{'}'}$/</code> and reject anything else with a typed <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">ValidationError</code>.
                  </li>
                  <li>
                    Bump <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">mongoose 5.13.7 → 5.13.20</code> (resolves the prototype-pollution finding).
                  </li>
                  <li>
                    Add a regression test that asserts <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">ValidationError</code> is thrown for the canonical injection payload.
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Diff preview</h3>
                <div className="overflow-x-auto rounded-md border border-[#30363d] bg-[#0d1117]">
                  <pre className="text-[12px] leading-relaxed font-mono p-3 whitespace-pre text-[#e6edf3]">
<span>{`  export function lookupCustomerProfile(query: ProfileQuery): CustomerRecord[] {
`}</span>
<span className="bg-[#301216] text-[#f85149]">{`-   const tainted = \`{ "username": "\${query.username}" }\`;
-   const selector = parseSelector(tainted);
`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+   if (!USERNAME_ALLOWLIST.test(query.username)) {
+     throw new ValidationError('username must be 1-64 chars [a-zA-Z0-9_.-]');
+   }
+   const selector = parseSelector({ field: 'username', value: query.username });
`}</span>
<span>{`    return CUSTOMERS.filter(record => matchesSelector(record, selector));
  }

`}</span>
<span className="bg-[#102a1a] text-[#3fb950]">{`+ const USERNAME_ALLOWLIST = /^[a-zA-Z0-9_.-]{1,64}$/;
+
+ export class ValidationError extends Error {
+   constructor(message: string) {
+     super(message);
+     this.name = 'ValidationError';
+   }
+ }
`}</span>
                  </pre>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Evidence</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>
                    Snyk issue:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">SNYK-JS-CUSTOMER-PROFILE-001</span>{' '}
                    · CWE-943 · CVSS 9.8
                  </li>
                  <li>
                    Snyk OSS:{' '}
                    <span className="text-[#4493f8] hover:underline cursor-pointer font-mono text-[12.5px]">SNYK-JS-MONGOOSE-2961688</span>{' '}
                    · upgraded to 5.13.20
                  </li>
                  <li>Jira: <span className="text-[#4493f8] hover:underline cursor-pointer">CUR-7841</span></li>
                  <li>
                    Typecheck: <span className="text-[#3fb950]">✓</span> · Lint: <span className="text-[#3fb950]">✓</span> · eslint-plugin-security <span className="text-[#3fb950]">✓</span>
                  </li>
                  <li>
                    Vitest: <span className="text-[#3fb950]">✓ 11 passed (1 new regression test)</span>
                  </li>
                  <li>
                    Live exploit replay:{' '}
                    <span className="text-[#3fb950]">✓ 12 leaked → 0 leaked, ValidationError thrown</span>
                  </li>
                  <li>
                    snyk test --severity-threshold=medium:{' '}
                    <span className="text-[#3fb950]">✓ 0 critical · 0 high · 0 medium</span>
                  </li>
                </ul>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Provenance</h3>
                <div className="rounded-md border border-[#30363d] bg-[#0d1117] p-3 text-[12.5px] font-mono leading-relaxed">
                  <div className="text-[#7d8590] mb-1">Authored by Cursor SDK run via the Stage 3 pre-merge security gate.</div>
                  <div className="grid grid-cols-[120px_1fr] gap-y-0.5">
                    <span className="text-[#7d8590]">sdk</span>
                    <span className="text-[#a371f7]">@cursor/february v1.0.7</span>
                    <span className="text-[#7d8590]">agent.agentId</span>
                    <span className="text-[#a371f7]">bc-7c09a4d2-1f48-4c1e-9c3f-0a5e4b8d3210</span>
                    <span className="text-[#7d8590]">run.id</span>
                    <span className="text-[#a371f7]">run-9a4d3f17-6e2b-4d09-a5e1-c08f4b7d2f55</span>
                    <span className="text-[#7d8590]">model</span>
                    <span className="text-[#a371f7]">composer-2</span>
                    <span className="text-[#7d8590]">tool calls</span>
                    <span className="text-[#e6edf3]">20 (snyk·5, github·4, jira·2, shell·5, edit·3, read·2)</span>
                    <span className="text-[#7d8590]">stage</span>
                    <span className="text-[#e6edf3]">3 of 5 (IDE → commit → <span className="text-[#a371f7]">PR gate</span> → nightly → prod)</span>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="font-semibold text-[15px] mb-1">Risk assessment</h3>
                <ul className="list-disc list-outside ml-5 space-y-1">
                  <li>Blast radius: 2 files · +34 −7 (1 source file + lockfile)</li>
                  <li>Type surface: unchanged for valid inputs; new typed <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">ValidationError</code> for invalid inputs</li>
                  <li>Rollback: <code className="px-1 py-0.5 rounded bg-[#151b23] border border-[#30363d] text-[12.5px] font-mono">git revert HEAD</code> — no migrations, no schema changes</li>
                </ul>
              </section>
            </div>
          </PrComment>

          <div className="flex items-start gap-3 py-2 pl-3 border-l-2 border-[#30363d]">
            <div className="w-6 h-6 -ml-[30px] rounded-full bg-[#10a37f]/20 flex items-center justify-center shrink-0">
              <Check className="w-3 h-3 text-[#3fb950]" />
            </div>
            <p className="text-[13px] text-[#7d8590]">
              <span className="text-[#e6edf3] font-semibold">codex-bot</span> approved these changes
              <span className="ml-1">· just now</span>
            </p>
          </div>

          <PrComment>
            <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-[#3fb950] bg-[#238636]/20 rounded-full p-0.5" />
                <span className="text-[14px] font-semibold text-[#e6edf3]">All checks have passed</span>
              </div>
              <button className="text-[12.5px] text-[#4493f8] hover:underline">Show all checks</button>
            </div>
            <div className="divide-y divide-[#30363d] text-[13px]">
              <CheckRow name="typecheck" detail="npx tsc --noEmit" duration="4s" />
              <CheckRow name="lint" detail="eslint + eslint-plugin-security" duration="3s" />
              <CheckRow name="unit-tests" detail="vitest · 11 passed (1 new)" duration="6s" />
              <CheckRow name="snyk-test" detail="--severity-threshold=medium · 0 issues" duration="9s" />
              <CheckRow name="semgrep" detail="javascript.lang.security · 0 findings" duration="5s" />
            </div>
          </PrComment>

          <PrComment>
            <div className="px-4 py-4 flex items-center gap-3">
              <GitMerge className="w-6 h-6 text-[#3fb950]" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-semibold text-[#e6edf3]">
                  This branch has no conflicts with the base branch
                </p>
                <p className="text-[12.5px] text-[#7d8590]">Merging can be performed automatically.</p>
              </div>
              <button className="px-3.5 py-1.5 rounded-md bg-[#238636] hover:bg-[#2ea043] text-white text-[13.5px] font-medium">
                Merge pull request
              </button>
            </div>
          </PrComment>
        </div>

        <aside className="space-y-5 text-[12.5px]">
          <SidebarSection title="Reviewers">
            <SidebarRow>
              <div className="w-5 h-5 rounded-full bg-[#10a37f]/20 flex items-center justify-center">
                <span className="text-[#10a37f] text-[10px] font-bold">X</span>
              </div>
              <span className="text-[#e6edf3]">codex-bot</span>
              <span className="ml-auto text-[#3fb950]">✓ approved</span>
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
              <Label color="#FB7185" label="security" />
              <Label color="#A371F7" label="cursor-sdk" />
              <Label color="#9F98FF" label="snyk-triage" />
              <Label color="#7D8590" label="dependencies" />
            </div>
          </SidebarSection>
          <SidebarSection title="Development">
            <div className="space-y-1 text-[#7d8590]">
              <p>Successfully links to issues</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">CUR-7841 (Jira)</p>
              <p className="text-[#4493f8] hover:underline cursor-pointer">SNYK-JS-CUSTOMER-PROFILE-001 (Snyk)</p>
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
    </div>
  );
}

function NavTab({ label, count, active }: { label: string; count?: string; active?: boolean }) {
  return (
    <button
      className={`px-3 py-3 text-[13.5px] flex items-center gap-1.5 border-b-2 ${
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:border-[#30363d]'
      }`}
    >
      {label === 'Wiki' && <Book className="w-3.5 h-3.5" />}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
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
        active ? 'border-[#fd8c73] text-[#e6edf3] font-semibold' : 'border-transparent text-[#e6edf3] hover:text-[#e6edf3]'
      }`}
    >
      {icon}
      {label}
      {count && <span className="px-1.5 py-0.5 rounded-full bg-[#30363d] text-[10.5px] text-[#e6edf3]">{count}</span>}
    </button>
  );
}

function PrComment({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-[#30363d] bg-[#0d1117] overflow-hidden">
      {children}
    </div>
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
        {bot && <span className="px-1.5 py-0.5 rounded-full border border-[#30363d] text-[10px] text-[#7d8590]">bot</span>}
        <span className="text-[#7d8590]">{label} · {time}</span>
      </div>
      <button className="text-[#7d8590] hover:text-[#e6edf3]">
        <MoreHorizontal className="w-4 h-4" />
      </button>
    </div>
  );
}

function CheckRow({ name, detail, duration }: { name: string; detail: string; duration: string }) {
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
