export type CharacterKey = 'park' | 'chen' | 'davis' | 'kim';

export interface Character {
  key: CharacterKey;
  name: string;
  role: string;
  bio: string;
  avatar: string;
  accent: string;
}

export const CHARACTERS: Record<CharacterKey, Character> = {
  park: {
    key: 'park',
    name: 'J. Park',
    role: 'Principal Architect',
    bio: '12 yrs at Acme. Led the 2019 Oracle upgrade.',
    avatar: '/images/aws-journey/avatars/park.png',
    accent: '#FF9900',
  },
  chen: {
    key: 'chen',
    name: 'M. Chen',
    role: 'Security Engineering Lead',
    bio: 'Ex-AWS, CISSP. Owns Acme’s IAM baseline.',
    avatar: '/images/aws-journey/avatars/chen.png',
    accent: '#7EE787',
  },
  davis: {
    key: 'davis',
    name: 'R. Davis',
    role: 'FinOps Lead',
    bio: 'AWS Financial Management certified. Cut $4M/yr last year.',
    avatar: '/images/aws-journey/avatars/davis.png',
    accent: '#4DD4FF',
  },
  kim: {
    key: 'kim',
    name: 'S. Kim',
    role: 'SRE Lead',
    bio: 'On-call for the outage last Tuesday.',
    avatar: '/images/aws-journey/avatars/kim.png',
    accent: '#10B981',
  },
};

export const CHARACTER_ORDER: CharacterKey[] = ['park', 'chen', 'davis', 'kim'];
