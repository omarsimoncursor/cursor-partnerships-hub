export const PARTNER_CATEGORIES = {
  cloud: {
    title: 'Cloud Providers',
    partners: [
      { name: 'GitHub', webinar: 'Beyond Autocomplete: AI Reasoning Across Your Entire Repository', rationale: 'Copilot handles line-level. Cursor handles architecture and multi-file reasoning. Complementary, not competitive.', logo: '/logos/github_wordmark_light.svg' },
      { name: 'AWS', webinar: 'AI-Accelerated Cloud Migration', rationale: 'Cursor accelerates service refactors and API migrations. AWS customers modernizing workloads get immediate value.', logo: '/logos/aws_light.svg' },
      { name: 'Google Cloud', webinar: 'Building AI-Native Applications on GCP', rationale: "GCP's AI-first positioning aligns with Cursor's intelligent development workflow.", logo: '/logos/google-cloud.svg' },
      { name: 'Microsoft Azure', webinar: 'AI-Driven Developer Productivity on Azure', rationale: "Azure DevOps teams benefit from Cursor's codebase-aware refactoring alongside their CI/CD pipeline.", logo: '/logos/azure.svg' },
      { name: 'Vercel', webinar: 'AI-Accelerated Frontend Development', rationale: "Vercel's developer audience is already AI-forward. Natural distribution channel.", logo: '/logos/vercel_wordmark.svg' },
    ],
  },
  devtools: {
    title: 'Developer Tools',
    partners: [
      { name: 'Datadog', webinar: 'From Incident to Fix: AI-Assisted Debugging', rationale: 'Datadog detects the issue, Cursor analyzes the code and generates the fix. Seamless incident resolution.', logo: '/logos/datadog.svg' },
      { name: 'Sentry', webinar: 'AI-Assisted Debugging From Error to Patch', rationale: 'Sentry captures the error. Cursor traces it to root cause and produces the patch.', logo: '/logos/sentry.svg' },
      { name: 'GitLab', webinar: 'AI-Native DevOps: Coding, CI/CD, and Deployment', rationale: 'GitLab pipeline data combined with Cursor reasoning creates an end-to-end intelligent DevOps workflow.', logo: '/logos/gitlab.svg' },
      { name: 'Docker', webinar: 'AI-Driven Containerized Development', rationale: "Docker's developer environment integrations benefit from Cursor's codebase intelligence.", logo: '/logos/docker.svg' },
      { name: 'Cloudflare', webinar: 'AI-Assisted Edge Application Development', rationale: "Workers and edge compute benefit from Cursor's ability to reason about distributed application logic.", logo: '/logos/cloudflare.svg' },
      { name: 'MongoDB', webinar: 'AI-Native Application Development', rationale: "MongoDB's developer data platform combined with Cursor's code reasoning accelerates full-stack development.", logo: '/logos/mongodb-wordmark-light.svg' },
      { name: 'Confluent', webinar: 'AI-Accelerated Event-Driven Architecture', rationale: 'Event-driven architectures are complex. Cursor helps developers reason about async data flows at scale.', logo: '/logos/Confluent,_Inc._logo.svg' },
      { name: 'Zscaler', webinar: 'From ZPA Risk Event to Merged Terraform PR', rationale: 'Zscaler ZPA flags over-permissive access rules. Cursor reads the customer\u2019s zscaler/zpa Terraform module, writes the missing SCIM/posture/network conditions, runs terraform plan, replays the conformance probe, and submits a PR. Compresses the Risk Operations \u2194 Platform Engineering handoff from days to minutes.', logo: '/logos/zscaler.svg' },
    ],
  },
  consulting: {
    title: 'Consulting & Systems Integrators',
    partners: [
      { name: 'Deloitte', motion: 'AI-accelerated software modernization', rationale: "Deloitte's modernization practice deploys hundreds of developers. Cursor multiplies their output.", logo: '/logos/Logo_of_Deloitte.svg' },
      { name: 'Accenture', motion: 'Enterprise engineering transformation', rationale: "Accenture's technology consulting arm can embed Cursor into their delivery methodology.", logo: '/logos/Accenture.svg' },
      { name: 'Slalom', motion: 'Developer productivity transformation', rationale: "Slalom's regional presence and developer focus makes them an ideal integration partner.", logo: '/logos/Slalom_Consulting_Logo.svg' },
      { name: 'Thoughtworks', motion: 'Modern engineering practices with AI', rationale: "Thoughtworks' engineering culture and thought leadership amplifies Cursor's credibility.", logo: '/logos/Thoughtworks_logo.png' },
    ],
  },
};
