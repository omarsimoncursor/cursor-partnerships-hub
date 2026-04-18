export type ActId =
  | 'the-wall'
  | 'the-quote'
  | 'diagnosis'
  | 'first-asset'
  | 'proof-and-review'
  | 'scale'
  | 'morning-after';

export interface ActTheme {
  /** Base page background (solid or gradient). */
  bg: string;
  /** Primary accent — drives eyebrows, active dots, buttons. */
  primary: string;
  /** Secondary accent for callouts. */
  secondary: string;
  /** Text / muted tokens for on-theme rendering. */
  text: string;
  muted: string;
  /** Optional per-act mood label (e.g. "the problem"). */
  moodLabel?: string;
  /** If the background is light we flip nav/card treatments. */
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
    title: 'The Wall',
    subtitle: '911 legacy assets. One more failure before Q2 close.',
    eyebrow: 'Tuesday 9:42pm · The data team has been here before',
    duration: '~75s',
    theme: {
      bg: '#0F1521',
      primary: '#F59E0B',
      secondary: '#29B5E8',
      text: '#F3F4F6',
      muted: 'rgba(243,244,246,0.6)',
      moodLabel: 'the problem',
      tone: 'dark',
    },
  },
  {
    id: 'the-quote',
    number: 2,
    title: 'The Quote',
    subtitle: '$18,000,000 · 4 years · the CFO says no',
    eyebrow: 'Wednesday · the GSI proposal lands in the inbox',
    duration: '~60s',
    theme: {
      bg: '#FAF8F3',
      primary: '#B91C1C',
      secondary: '#29B5E8',
      text: '#111827',
      muted: 'rgba(17,24,39,0.6)',
      moodLabel: 'the impasse',
      tone: 'light',
    },
  },
  {
    id: 'diagnosis',
    number: 3,
    title: 'Diagnosis',
    subtitle: '63,180 lines. Indexed in 4 minutes.',
    eyebrow: 'Friday 8:04am · Cursor reads every legacy script',
    duration: '~90s',
    theme: {
      bg: '#0B1220',
      primary: '#29B5E8',
      secondary: '#7DD3F5',
      text: '#E6EDF3',
      muted: 'rgba(230,237,243,0.6)',
      moodLabel: 'discovery',
      tone: 'dark',
    },
  },
  {
    id: 'first-asset',
    number: 4,
    title: 'First Asset',
    subtitle: 'daily_revenue_rollup → Snowflake · 4 hours · end-to-end',
    eyebrow: 'Friday · the agent does the work, the team keeps control',
    duration: '~3m',
    theme: {
      bg: '#0D1117',
      primary: '#29B5E8',
      secondary: '#7EE787',
      text: '#E6EDF3',
      muted: 'rgba(230,237,243,0.55)',
      moodLabel: 'the build',
      tone: 'dark',
    },
  },
  {
    id: 'proof-and-review',
    number: 5,
    title: 'Proof & Review',
    subtitle: 'Zero row delta · Cortex no-drift · reviewer approves',
    eyebrow: 'Friday 12:22pm · the review that makes it real',
    duration: '~2m',
    theme: {
      bg: '#060A12',
      primary: '#A78BFA',
      secondary: '#29B5E8',
      text: '#F3F4F6',
      muted: 'rgba(243,244,246,0.55)',
      moodLabel: 'the proof',
      tone: 'dark',
    },
  },
  {
    id: 'scale',
    number: 6,
    title: 'Scale',
    subtitle: '911 assets · 15 months · $16M pulled-forward credits',
    eyebrow: 'Asset #1 was Friday. Watch the wall light up.',
    duration: '~3m',
    theme: {
      bg: '#05101C',
      primary: '#4C9AFF',
      secondary: '#29B5E8',
      text: '#F3F4F6',
      muted: 'rgba(243,244,246,0.6)',
      moodLabel: 'compounding',
      tone: 'dark',
    },
  },
  {
    id: 'morning-after',
    number: 7,
    title: 'The Morning After',
    subtitle: 'Teradata goes dark. The data team sleeps through the night.',
    eyebrow: '15 months later · Monday 6:47am',
    duration: '~60s',
    theme: {
      bg: 'linear-gradient(180deg, #FAFBFC 0%, #EEF2F6 100%)',
      primary: '#29B5E8',
      secondary: '#16A34A',
      text: '#0F172A',
      muted: 'rgba(15,23,42,0.6)',
      moodLabel: 'the future',
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
