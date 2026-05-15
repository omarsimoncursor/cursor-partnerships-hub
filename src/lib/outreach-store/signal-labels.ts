const SIGNAL_LABELS: Record<string, string> = {
  golden_signup: 'Signed up for Cursor',
  job_change: 'Started a new job',
  title_change: 'Title changed',
  team_admin_signup: 'Team admin signup',
};

const RAW_FIELD_LABELS: Record<string, string> = {
  signup_email: 'Signup email',
  signup_source: 'How we found them',
  signup_email_type: 'Email type',
  signup_email_matches_employer: 'Email matches company',
  intent_signal_id: 'Signal reference',
};

const SOURCE_LABELS: Record<string, string> = {
  golden_list: 'Priority signup list',
};

export function formatSignalType(type: string): string {
  const key = type.trim().toLowerCase();
  if (SIGNAL_LABELS[key]) return SIGNAL_LABELS[key]!;
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function formatSignalRawValue(key: string, value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (key === 'signup_source' && typeof value === 'string') {
    return SOURCE_LABELS[value] ?? value.replace(/_/g, ' ');
  }
  if (key === 'signup_email_type' && typeof value === 'string') {
    return value === 'work' ? 'Work email' : value === 'personal' ? 'Personal email' : value;
  }
  return String(value);
}

export function formatSignalRawFieldLabel(key: string): string {
  return RAW_FIELD_LABELS[key] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Omit internal ids from the friendly signal detail panel. */
export function isUserFacingSignalField(key: string): boolean {
  return key !== 'intent_signal_id';
}

export function formatPriorityTier(tier: string): string {
  if (tier === 'hot') return 'Hot — reach out soon';
  if (tier === 'warm') return 'Warm — good fit';
  if (tier === 'nurture') return 'Nurture — lower urgency';
  return tier;
}

export function formatEmailStatus(status: string): string {
  if (status === 'drafted') return 'Draft ready';
  if (status === 'no_work_email') return 'No email on file';
  if (status === 'skipped_no_demo_url') return 'Skipped (no demo)';
  return status.replace(/_/g, ' ');
}
