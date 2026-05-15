'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

// Reusable client-side pagination primitives shared across the admin
// tabs (Prospects / Sequences / Analytics). Each tab loads its full
// working set on mount + filters/sorts client-side; the pager just
// slices the filtered result into pages so the table doesn't render
// hundreds of rows at once.
//
// Pattern of use in a tab:
//
//   const PAGE_SIZE = 25;
//   const [page, setPage] = useState(0);
//   const { totalPages, currentPage, pageStart, visible } = paginate(
//     filtered, page, PAGE_SIZE,
//   );
//   // reset page when the filter set changes:
//   useEffect(() => setPage(0), [search, statusFilter, ...]);
//
//   <table> {visible.map(...)} </table>
//   <Pager page={currentPage} totalPages={totalPages}
//          pageStart={pageStart} pageSize={PAGE_SIZE}
//          totalItems={filtered.length} onPage={setPage} />
//
// `paginate()` clamps `page` against the actual page count so a
// filter that shrinks the result set never lands the table on an
// empty page-3.

export type Page<T> = {
  totalPages: number;
  currentPage: number;
  pageStart: number;
  visible: T[];
};

export function paginate<T>(items: T[], page: number, pageSize: number): Page<T> {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(0, page), totalPages - 1);
  const pageStart = currentPage * pageSize;
  const visible = items.slice(pageStart, pageStart + pageSize);
  return { totalPages, currentPage, pageStart, visible };
}

type Props = {
  page: number;
  totalPages: number;
  pageStart: number;
  pageSize: number;
  totalItems: number;
  onPage: (next: number) => void;
};

/**
 * Compact Prev / Next pager with a "Showing N–M of T" summary on the
 * left and the page indicator + nav buttons on the right. Renders a
 * single line; use inside the table card or right below it.
 *
 * Hides itself when totalPages is 1 — there's nothing to navigate.
 */
export function Pager({ page, totalPages, pageStart, pageSize, totalItems, onPage }: Props) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-text-tertiary">
      <span>
        Showing {pageStart + 1}
        {'\u2013'}
        {Math.min(pageStart + pageSize, totalItems)} of {totalItems}
      </span>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPage(Math.max(0, page - 1))}
          disabled={page === 0}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Prev
        </button>
        <span className="px-2 font-mono text-text-secondary tabular-nums">
          {page + 1} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(Math.min(totalPages - 1, page + 1))}
          disabled={page >= totalPages - 1}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-dark-border hover:border-dark-border-hover hover:bg-dark-surface transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
