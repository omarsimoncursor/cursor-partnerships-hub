export type FigmaActId = 1 | 2 | 3 | 4 | 5 | 6;

export interface FigmaActTheme {
  id: FigmaActId;
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

/**
 * Figma journey palette. Heavy use of the Figma brand purple (#A259FF / #6C3CE0)
 * with complementary neutrals. Acts progress tonally from "dark, worried" →
 * "clean, collaborative" → "bright, aligned."
 */
export const FIGMA_ACT_THEMES: Record<FigmaActId, FigmaActTheme> = {
  1: {
    id: 1,
    key: 'fear',
    label: 'Fear',
    title: 'The Headline',
    subtitle: 'The designer\'s existential Tuesday',
    bg: '#0B0A14',
    primary: '#F87171',
    secondary: '#A259FF',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.55)',
    mood: 'tense, dark, noisy',
  },
  2: {
    id: 2,
    key: 'drift',
    label: 'Drift',
    title: 'AI Without Figma',
    subtitle: 'What hallucination costs',
    bg: '#0F0D1A',
    primary: '#F59E0B',
    secondary: '#F87171',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.55)',
    mood: 'uncanny, wrong',
  },
  3: {
    id: 3,
    key: 'handshake',
    label: 'Handshake',
    title: 'Figma in the Loop',
    subtitle: 'The Figma MCP call, live',
    bg: '#110E1F',
    primary: '#A259FF',
    secondary: '#60A5FA',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.6)',
    mood: 'aligned, plugged-in',
  },
  4: {
    id: 4,
    key: 'design-mode',
    label: 'Design Mode',
    title: 'The Designer Steers',
    subtitle: 'Annotate once, ship exactly that',
    bg: '#F6F3FF',
    primary: '#6C3CE0',
    secondary: '#A259FF',
    text: '#14112A',
    muted: 'rgba(20, 17, 42, 0.6)',
    mood: 'hands-on, collaborative, bright',
  },
  5: {
    id: 5,
    key: 'loop',
    label: 'SDLC Loop',
    title: 'Figma, Back in the Loop',
    subtitle: 'The AI-native SDLC — with designers at the center',
    bg: '#0E0A1F',
    primary: '#A259FF',
    secondary: '#4ADE80',
    text: '#F3F4F6',
    muted: 'rgba(243, 244, 246, 0.6)',
    mood: 'orchestrated, whole',
  },
  6: {
    id: 6,
    key: 'verdict',
    label: 'Verdict',
    title: 'Better Together',
    subtitle: 'Figma + Cursor: the co-sell motion',
    bg: 'linear-gradient(180deg, #FAFAFF 0%, #EDE6FF 100%)',
    primary: '#6C3CE0',
    secondary: '#16A34A',
    text: '#0F0A1F',
    muted: 'rgba(15, 10, 31, 0.6)',
    mood: 'bright, forward',
  },
};

export const FIGMA_ACT_ORDER: FigmaActId[] = [1, 2, 3, 4, 5, 6];
