import { ChapterOrchestrator } from '@/components/skills-subagents-demo/chapter-orchestrator';

export const metadata = {
  title: 'Skills & Subagents — Enterprise Memory for AI Coding Agents',
  description:
    'A six-chapter story about the fundamental enterprise problem with AI coding agents (no historical context) and how Cursor skills + subagents solve it.',
};

export default function SkillsAndSubagentsJourney() {
  return <ChapterOrchestrator />;
}
