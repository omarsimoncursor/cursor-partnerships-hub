import { promises as fs } from 'node:fs';
import path from 'node:path';

/**
 * Reads the two legacy assets (PL/SQL stored procedure + Informatica mapping XML)
 * from disk, counts lines, and tags the vendor-specific idioms a Databricks
 * migration needs to rewrite. Pure server-side; never import from client code.
 */

const LEGACY_DIR = path.join(process.cwd(), 'src', 'lib', 'demo', 'legacy-oracle');
const PLSQL_FILE = 'customer_rfm_segmentation.sql';
const INFORMATICA_FILE = 'wf_m_customer_rfm.xml';

export type LegacyIdiom =
  | 'cursor loops'
  | 'global temp tables'
  | 'MERGE'
  | 'CONNECT BY'
  | 'ROWNUM'
  | 'NVL/DECODE'
  | 'TO_CHAR date fmt';

interface IdiomMatcher {
  idiom: LegacyIdiom;
  test: (src: string) => boolean;
}

const PLSQL_IDIOMS: IdiomMatcher[] = [
  { idiom: 'cursor loops',     test: s => /\bCURSOR\s+\w+\s+IS\b/i.test(s) || /\bOPEN\s+\w+[\s\S]*?\bFETCH\b/i.test(s) },
  { idiom: 'global temp tables', test: s => /GLOBAL\s+TEMPORARY\s+TABLE/i.test(s) },
  { idiom: 'MERGE',            test: s => /\bMERGE\s+INTO\b/i.test(s) },
  { idiom: 'CONNECT BY',       test: s => /\bCONNECT\s+BY\b/i.test(s) },
  { idiom: 'ROWNUM',           test: s => /\bROWNUM\b/i.test(s) },
  { idiom: 'NVL/DECODE',       test: s => /\bNVL\s*\(/i.test(s) || /\bDECODE\s*\(/i.test(s) },
  { idiom: 'TO_CHAR date fmt', test: s => /TO_CHAR\s*\(\s*\w+\s*,\s*'[YM]+/i.test(s) },
];

export interface LegacyReadResult {
  plsql: {
    filename: string;
    loc: number;
    content: string;
    idioms: LegacyIdiom[];
  };
  informatica: {
    filename: string;
    loc: number;
    content: string;
    transforms: string[];
  };
}

function detectIdioms(src: string): LegacyIdiom[] {
  return PLSQL_IDIOMS.filter(m => m.test(src)).map(m => m.idiom);
}

function detectInformaticaTransforms(xml: string): string[] {
  const matches = Array.from(xml.matchAll(/<TRANSFORMATION[^>]*TYPE="([^"]+)"/gi));
  const seen = new Set<string>();
  for (const m of matches) seen.add(m[1]);
  return [...seen];
}

function countLines(src: string): number {
  if (!src) return 0;
  return src.split(/\r?\n/).length;
}

export async function readLegacyAssets(): Promise<LegacyReadResult> {
  const plsqlPath = path.join(LEGACY_DIR, PLSQL_FILE);
  const infaPath = path.join(LEGACY_DIR, INFORMATICA_FILE);

  const [plsqlContent, infaContent] = await Promise.all([
    fs.readFile(plsqlPath, 'utf8'),
    fs.readFile(infaPath, 'utf8'),
  ]);

  return {
    plsql: {
      filename: PLSQL_FILE,
      loc: countLines(plsqlContent),
      content: plsqlContent,
      idioms: detectIdioms(plsqlContent),
    },
    informatica: {
      filename: INFORMATICA_FILE,
      loc: countLines(infaContent),
      content: infaContent,
      transforms: detectInformaticaTransforms(infaContent),
    },
  };
}

export const LEGACY_FILE_PATHS = {
  plsql: `src/lib/demo/legacy-oracle/${PLSQL_FILE}`,
  informatica: `src/lib/demo/legacy-oracle/${INFORMATICA_FILE}`,
};
