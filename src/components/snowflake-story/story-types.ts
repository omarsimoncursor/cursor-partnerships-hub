export type ActId =
  | 'the-wall'
  | 'the-quote'
  | 'diagnosis'
  | 'first-asset'
  | 'proof-and-review'
  | 'scale'
  | 'morning-after';

export interface ActMeta {
  id: ActId;
  number: number;
  title: string;
  subtitle: string;
  sceneImage: string;
  /** Deep near-black that anchors the scene when the photo fails or blurs out. */
  dominantColor: string;
  /**
   * Signature hue for this act — painted as a soft radial glow over the
   * blurred scene image so each chapter has an unmistakable color mood
   * (amber, crimson, cyan, purple, blue, gold) even after heavy blur.
   */
  moodColor: string;
  duration: string;
}

export const ACTS: ActMeta[] = [
  {
    id: 'the-wall',
    number: 1,
    title: 'The Wall',
    subtitle: 'Q2 revenue: 14 hours stale',
    sceneImage: '/partnerships/snowflake/scenes/01-the-wall.webp',
    dominantColor: '#0B1A2A',
    moodColor: '#F5A623', // warm amber desk-lamp
    duration: '~75s',
  },
  {
    id: 'the-quote',
    number: 2,
    title: 'The Quote',
    subtitle: '$18,000,000 · 4 years · rejected',
    sceneImage: '/partnerships/snowflake/scenes/02-the-quote.webp',
    dominantColor: '#111B24',
    moodColor: '#C9372C', // cold crimson — the rejected quote
    duration: '~60s',
  },
  {
    id: 'diagnosis',
    number: 3,
    title: 'Diagnosis',
    subtitle: '63,180 LOC · indexed in 4 minutes',
    sceneImage: '/partnerships/snowflake/scenes/03-diagnosis.webp',
    dominantColor: '#0E1D2E',
    moodColor: '#29B5E8', // Snowflake cyan — the agent lighting up the codebase
    duration: '~90s',
  },
  {
    id: 'first-asset',
    number: 4,
    title: 'First Asset',
    subtitle: 'daily_revenue_rollup.bteq → fct_daily_revenue',
    sceneImage: '/partnerships/snowflake/scenes/04-first-asset.webp',
    dominantColor: '#0C1E31',
    moodColor: '#7DD3F5', // electric cyan screen-glow
    duration: '~3m',
  },
  {
    id: 'proof-and-review',
    number: 5,
    title: 'Proof & Review',
    subtitle: 'Cortex semantic diff · 0 row delta · Jordan approves',
    sceneImage: '/partnerships/snowflake/scenes/05-proof-and-review.webp',
    dominantColor: '#0B2030',
    moodColor: '#8B5CF6', // purple dusk — review hour
    duration: '~2m',
  },
  {
    id: 'scale',
    number: 6,
    title: 'Scale',
    subtitle: '911 assets · 15 months · $16M pulled-forward credits',
    sceneImage: '/partnerships/snowflake/scenes/06-scale.webp',
    dominantColor: '#0A1929',
    moodColor: '#4C9AFF', // deep electric blue — the wall lighting up
    duration: '~3m',
  },
  {
    id: 'morning-after',
    number: 7,
    title: 'The Morning After',
    subtitle: 'Maya sleeps through the night. Samira closes the expansion.',
    sceneImage: '/partnerships/snowflake/scenes/07-morning-after.webp',
    dominantColor: '#1B2335',
    moodColor: '#FFB366', // sunrise gold
    duration: '~60s',
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
