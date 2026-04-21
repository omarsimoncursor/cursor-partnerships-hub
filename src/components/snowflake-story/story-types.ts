export type ActId =
  | 'the-wall'
  | 'the-quote'
  | 'diagnosis'
  | 'first-asset'
  | 'proof-and-review'
  | 'scale'
  | 'morning-after';

export interface ActTheme {
  bg: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  moodLabel?: string;
  tone: 'dark' | 'light';
}

export interface ActMeta {
  id: ActId;
  number: number;
  title: string;
  subtitle: string;
  eyebrow: string;
  duration: string;
  theme: ActTheme;
}

export const ACTS: ActMeta[] = [
  {
    id: 'the-wall',
    number: 1,
    title: 'The CFO won&rsquo;t sign the GSI&rsquo;s $18M quote',
    subtitle: 'Set the stage. Meet the wall, the deadline and the rejected proposal.',
    eyebrow: 'Wednesday morning. The data team has 9 days to come back with a credible alternative.',
    duration: '~1 min',
    theme: {
      bg: '#0F1521',
      primary: '#F59E0B',
      secondary: '#29B5E8',
      text: '#F3F4F6',
      muted: 'rgba(243,244,246,0.6)',
      moodLabel: 'Cold open',
      tone: 'dark',
    },
  },
  {
    id: 'the-quote',
    number: 2,
    title: 'Cursor reads ten years of legacy in four minutes',
    subtitle: 'Scan the 911-asset portfolio. Map every dialect quirk. Pick a starting asset.',
    eyebrow:
      'The GSI quoted six months for the discovery phase. Cursor reads every script before the team finishes a coffee.',
    duration: '~2 min',
    theme: {
      bg: '#0B1220',
      primary: '#7DD3F5',
      secondary: '#29B5E8',
      text: '#E6EDF3',
      muted: 'rgba(230,237,243,0.6)',
      moodLabel: 'Discover',
      tone: 'dark',
    },
  },
  {
    id: 'diagnosis',
    number: 3,
    title: 'Cursor drafts the migration plan. The reviewer pushes back.',
    subtitle: 'Plan first. Code never. The reviewer absorbs the override.',
    eyebrow:
      'Cursor proposes the target shape; the principal flags the rounding behavior; the agent absorbs the correction in minutes.',
    duration: '~2 min',
    theme: {
      bg: '#FAF8F3',
      primary: '#F59E0B',
      secondary: '#29B5E8',
      text: '#111827',
      muted: 'rgba(17,24,39,0.6)',
      moodLabel: 'Design',
      tone: 'light',
    },
  },
  {
    id: 'first-asset',
    number: 4,
    title: 'Cursor rewrites the BTEQ as a Snowflake-native dbt model',
    subtitle: 'Watch a 214-line BTEQ become a 132-line dbt model. Codex auto-patches the gaps.',
    eyebrow:
      'Two weeks of senior data-engineering work — translation, tests, security review — done in 37 agent-minutes.',
    duration: '~2 min',
    theme: {
      bg: '#0D1117',
      primary: '#29B5E8',
      secondary: '#7EE787',
      text: '#E6EDF3',
      muted: 'rgba(230,237,243,0.55)',
      moodLabel: 'Build',
      tone: 'dark',
    },
  },
  {
    id: 'proof-and-review',
    number: 5,
    title: 'Two streams flow in. One verdict comes out.',
    subtitle: 'Cortex semantic diff + 1% row-equivalence. FinOps approves the credit budget.',
    eyebrow:
      'Cursor proves the new model is numerically identical to the legacy one before asking for an approval.',
    duration: '~2 min',
    theme: {
      bg: '#060A12',
      primary: '#A78BFA',
      secondary: '#29B5E8',
      text: '#F3F4F6',
      muted: 'rgba(243,244,246,0.6)',
      moodLabel: 'Verify',
      tone: 'dark',
    },
  },
  {
    id: 'scale',
    number: 6,
    title: 'Cursor orchestrates the cutover. The reliability lead holds the rollback lever.',
    subtitle: 'Canary 0 → 1 → 10 → 50 → 100% on the daily revenue rollup.',
    eyebrow:
      'Cursor wrote the runbook overnight. The data-reliability lead approves each canary step.',
    duration: '~2 min',
    theme: {
      bg: '#030712',
      primary: '#10B981',
      secondary: '#29B5E8',
      text: '#F9FAFB',
      muted: 'rgba(249,250,251,0.6)',
      moodLabel: 'Operate',
      tone: 'dark',
    },
  },
  {
    id: 'morning-after',
    number: 7,
    title: 'Asset #1 of 911 ships. Here&rsquo;s the receipts.',
    subtitle: 'Open every artifact the reviewers signed off on. See the full acceleration ledger.',
    eyebrow:
      'The Teradata renewal is 7 months out. At Cursor&rsquo;s cadence the portfolio finishes 4 months early. At the GSI&rsquo;s cadence: 28 months late.',
    duration: '~1 min',
    theme: {
      bg: 'linear-gradient(180deg, #FAFBFC 0%, #EEF2F6 100%)',
      primary: '#29B5E8',
      secondary: '#16A34A',
      text: '#0F172A',
      muted: 'rgba(15,23,42,0.6)',
      moodLabel: 'Portfolio',
      tone: 'light',
    },
  },
];

export const SNOWFLAKE_BLUE = '#29B5E8';
export const SNOWFLAKE_NAVY = '#11567F';
export const SNOWFLAKE_PALE = '#E5F6FB';

export type StoryArtifact = 'snowsight' | 'jira' | 'pr' | 'triage';

export interface ActComponentProps {
  onAdvance: () => void;
  onOpenArtifact: (artifact: StoryArtifact) => void;
  isActive: boolean;
}
