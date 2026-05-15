// Map the agent's seniority_tier (Manager / Leader / Executive) to
// the cold-prospects classified_level enum (Manager / Leader (Dir/VP+) /
// Executive / IC). Used at promote-to-sequence time so the prospect
// row lands with the right framing bucket.

import type { OutreachSeniorityTier } from './types';

export type ClassifiedLevel = 'Executive' | 'Leader (Dir/VP+)' | 'Manager' | 'IC';

export function mapSeniorityToClassifiedLevel(
  s: OutreachSeniorityTier,
): ClassifiedLevel {
  switch (s) {
    case 'Executive':
      return 'Executive';
    case 'Leader':
      return 'Leader (Dir/VP+)';
    case 'Manager':
      return 'Manager';
  }
}
