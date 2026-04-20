export type ActId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export interface ActTheme {
  id: ActId;
  key: string;
  label: string;
  title: string;
  subtitle: string;
  bg: string;
  primary: string;
  secondary: string;
  text: string;
  muted: string;
  mood: string;
}

export const ACT_THEMES: Record<ActId, ActTheme> = {
  1: {
    id: 1,
    key: 'wake-up',
    label: 'Wake-up call',
    title: 'Acme has 14 months to leave Oracle.',
    subtitle: 'The problem',
    bg: '#0F1521',
    primary: '#E55300',
    secondary: '#9CA3AF',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.55)',
    mood: 'tense, dark',
  },
  2: {
    id: 2,
    key: 'discovery',
    label: 'Discovery',
    title: 'Where do we even start?',
    subtitle: 'Discovery',
    bg: '#0B1220',
    primary: '#4DD4FF',
    secondary: '#FF9900',
    text: '#E5E7EB',
    muted: 'rgba(229, 231, 235, 0.55)',
    mood: 'exploratory',
  },
  3: {
    id: 3,
    key: 'architecture',
    label: 'Architecture',
    title: 'A draft on the whiteboard, before lunch.',
    subtitle: 'Architecture',
    bg: '#FAF8F3',
    primary: '#FF9900',
    secondary: '#2563EB',
    text: '#111827',
    muted: 'rgba(17, 24, 39, 0.55)',
    mood: 'sketchy, warm',
  },
  4: {
    id: 4,
    key: 'build',
    label: 'Build',
    title: 'Java, rewritten as AWS — live.',
    subtitle: 'Composer + Codex',
    bg: '#0D1117',
    primary: '#FF9900',
    secondary: '#7EE787',
    text: '#E6EDF3',
    muted: 'rgba(230, 237, 243, 0.5)',
    mood: 'IDE',
  },
  5: {
    id: 5,
    key: 'staging',
    label: 'Staging',
    title: 'Twelve thousand requests a second. Watch what breaks.',
    subtitle: 'Staging + load',
    bg: '#060A12',
    primary: '#4DD4FF',
    secondary: '#EF4444',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.55)',
    mood: 'ops, tense',
  },
  6: {
    id: 6,
    key: 'cutover',
    label: 'Cutover',
    title: 'Real customers, one percent at a time.',
    subtitle: 'Mission control',
    bg: '#030712',
    primary: '#FF9900',
    secondary: '#10B981',
    text: '#F9FAFB',
    muted: 'rgba(249, 250, 251, 0.55)',
    mood: 'mission-control',
  },
  7: {
    id: 7,
    key: 'result',
    label: 'Result',
    title: 'Fourteen months of work, done in 22 days.',
    subtitle: 'The future',
    bg: 'linear-gradient(180deg, #FAFBFC 0%, #EEF2F6 100%)',
    primary: '#FF9900',
    secondary: '#16A34A',
    text: '#0F172A',
    muted: 'rgba(15, 23, 42, 0.55)',
    mood: 'bright, forward',
  },
};

export const ACT_ORDER: ActId[] = [1, 2, 3, 4, 5, 6, 7];
