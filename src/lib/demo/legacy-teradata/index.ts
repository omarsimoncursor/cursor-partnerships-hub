import { readFile } from 'node:fs/promises';
import path from 'node:path';

export interface LegacyAsset {
  path: string;
  locTotal: number;
  locCode: number;
  idioms: Array<{ idiom: string; matches: number }>;
}

const BTEQ_PATH = path.join(
  process.cwd(),
  'src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq',
);
const TSQL_PATH = path.join(
  process.cwd(),
  'src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql',
);
const INFORMATICA_PATH = path.join(
  process.cwd(),
  'src/lib/demo/legacy-informatica/wf_customers_360.xml',
);

async function readLegacyFile(p: string): Promise<string> {
  return readFile(p, 'utf8');
}

function countLines(src: string): { total: number; code: number } {
  const lines = src.split('\n');
  let code = 0;
  for (const raw of lines) {
    const trimmed = raw.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith('--')) continue;
    if (trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;
    if (trimmed.startsWith('//')) continue;
    if (trimmed.startsWith('<!--')) continue;
    code += 1;
  }
  return { total: lines.length, code };
}

function countMatches(src: string, pattern: RegExp): number {
  const m = src.match(pattern);
  return m ? m.length : 0;
}

function tagBteqIdioms(src: string): Array<{ idiom: string; matches: number }> {
  return [
    { idiom: 'QUALIFY', matches: countMatches(src, /\bQUALIFY\b/gi) },
    { idiom: 'MULTISET VOLATILE', matches: countMatches(src, /MULTISET\s+VOLATILE/gi) },
    { idiom: 'COLLECT STATISTICS', matches: countMatches(src, /COLLECT\s+STATISTICS/gi) },
    { idiom: 'MERGE INTO', matches: countMatches(src, /MERGE\s+INTO/gi) },
    { idiom: 'Teradata date math', matches: countMatches(src, /\(\s*DATE\s*-\s*1\s*\)|ADD_MONTHS\s*\(/gi) },
  ].filter(i => i.matches > 0);
}

function tagTsqlIdioms(src: string): Array<{ idiom: string; matches: number }> {
  return [
    { idiom: 'CROSS APPLY / OUTER APPLY', matches: countMatches(src, /\b(?:CROSS|OUTER)\s+APPLY\b/gi) },
    { idiom: 'OPENJSON', matches: countMatches(src, /\bOPENJSON\b/gi) },
    { idiom: 'FOR JSON PATH', matches: countMatches(src, /FOR\s+JSON\s+PATH/gi) },
    { idiom: 'MERGE ... WHEN MATCHED', matches: countMatches(src, /MERGE\s+INTO/gi) },
    { idiom: 'DATETIME2', matches: countMatches(src, /\bDATETIME2\b/gi) },
    { idiom: 'SYSDATETIMEOFFSET', matches: countMatches(src, /SYSDATETIMEOFFSET|SYSUTCDATETIME/gi) },
  ].filter(i => i.matches > 0);
}

function tagInformaticaIdioms(src: string): Array<{ idiom: string; matches: number }> {
  return [
    { idiom: 'Source Qualifier', matches: countMatches(src, /Source Qualifier/g) },
    { idiom: 'Aggregator', matches: countMatches(src, /type="Aggregator"/gi) },
    { idiom: 'Lookup', matches: countMatches(src, /type="Lookup"/gi) },
    { idiom: 'Update Strategy', matches: countMatches(src, /Update Strategy/gi) },
  ].filter(i => i.matches > 0);
}

async function inspectBteq(): Promise<LegacyAsset> {
  const src = await readLegacyFile(BTEQ_PATH);
  const { total, code } = countLines(src);
  return {
    path: 'src/lib/demo/legacy-teradata/daily_revenue_rollup.bteq',
    locTotal: total,
    locCode: code,
    idioms: tagBteqIdioms(src),
  };
}

async function inspectTsql(): Promise<LegacyAsset> {
  const src = await readLegacyFile(TSQL_PATH);
  const { total, code } = countLines(src);
  return {
    path: 'src/lib/demo/legacy-sqlserver/usp_enrich_customers_360.sql',
    locTotal: total,
    locCode: code,
    idioms: tagTsqlIdioms(src),
  };
}

async function inspectInformatica(): Promise<LegacyAsset> {
  const src = await readLegacyFile(INFORMATICA_PATH);
  const { total, code } = countLines(src);
  return {
    path: 'src/lib/demo/legacy-informatica/wf_customers_360.xml',
    locTotal: total,
    locCode: code,
    idioms: tagInformaticaIdioms(src),
  };
}

export async function inspectLegacyAssets() {
  const [bteq, tsql, informatica] = await Promise.all([
    inspectBteq(),
    inspectTsql(),
    inspectInformatica(),
  ]);
  return { bteq, tsql, informatica };
}

export async function readLegacyBteqExcerpt(maxLines = 60): Promise<string> {
  const src = await readLegacyFile(BTEQ_PATH);
  return src.split('\n').slice(0, maxLines).join('\n');
}

export async function readLegacyTsqlExcerpt(maxLines = 60): Promise<string> {
  const src = await readLegacyFile(TSQL_PATH);
  return src.split('\n').slice(0, maxLines).join('\n');
}

export async function readLegacyInformaticaExcerpt(maxLines = 40): Promise<string> {
  const src = await readLegacyFile(INFORMATICA_PATH);
  return src.split('\n').slice(0, maxLines).join('\n');
}
