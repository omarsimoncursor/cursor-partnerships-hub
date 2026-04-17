import { ChapterOrchestrator } from '@/components/snowflake-story/chapter-orchestrator';

export const metadata = {
  title: 'Snowflake × Cursor — Live Migration',
  description:
    'A seven-act story about modernizing a decade of Teradata BTEQ, T-SQL, and Informatica into a Snowflake-native dbt + Cortex project.',
};

export default function SnowflakeDemoPage() {
  return <ChapterOrchestrator />;
}
