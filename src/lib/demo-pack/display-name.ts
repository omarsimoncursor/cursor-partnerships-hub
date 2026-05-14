export function prospectDisplayName(domain: string, displayName?: string): string {
  if (displayName?.trim()) return displayName.trim();
  const clean = domain.split('.')[0] ?? domain;
  if (!clean) return domain;
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}
