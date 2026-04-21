export type CharacterKey = 'park' | 'chen' | 'davis' | 'kim';

export interface Character {
  key: CharacterKey;
  /** Initials-only label so we never use a personal name. */
  name: string;
  role: string;
  bio: string;
  /** Single capital initial used in the avatar circle. */
  initial: string;
  accent: string;
}

/**
 * The four named human reviewers across the Snowflake migration. Names are
 * intentionally role-titles + initial — same shape as the AWS story&rsquo;s
 * J. Park / M. Chen / R. Davis / S. Kim, but the role and bio are tuned to
 * the data-platform context.
 */
export const CHARACTERS: Record<CharacterKey, Character> = {
  park: {
    key: 'park',
    name: 'Principal · Data Platform',
    role: 'Owns the BTEQ portfolio',
    bio: '12 yrs at Acme. Built the original Teradata revenue mart. One of two people on the team who can still read the legacy dialect.',
    initial: 'P',
    accent: '#29B5E8',
  },
  chen: {
    key: 'chen',
    name: 'Senior Engineer · Reviewer',
    role: 'Holds the merge button',
    bio: 'Owns the dbt repo, the test harness, and the change-window discipline. Caught the rounding regression two cutovers ago.',
    initial: 'R',
    accent: '#A78BFA',
  },
  davis: {
    key: 'davis',
    name: 'FinOps Lead',
    role: 'Owns the Snowflake credit budget',
    bio: 'Tracks every warehouse, every credit, every dollar. Approved the modernization budget on the condition there&rsquo;s a kill-switch.',
    initial: 'F',
    accent: '#34D399',
  },
  kim: {
    key: 'kim',
    name: 'Data Reliability Lead',
    role: 'On-call for the close',
    bio: 'On-call for the Q1 close last year. Holds the rollback lever on every cutover.',
    initial: 'D',
    accent: '#10B981',
  },
};

export const CHARACTER_ORDER: CharacterKey[] = ['park', 'chen', 'davis', 'kim'];
