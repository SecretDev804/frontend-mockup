"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  isLoading?: boolean;
  ariaLabel?: string;
};

/**
 * Generate page numbers with ellipsis
 * Follows pattern: 1 ... current-1 current current+1 ... last
 */
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages: (number | "...")[] = [];

  // Always show first page
  pages.push(1);

  if (current <= 3) {
    // Near start: 1 2 3 4 5 ... last
    pages.push(2, 3, 4, 5, "...", total);
  } else if (current >= total - 2) {
    // Near end: 1 ... last-4 last-3 last-2 last-1 last
    pages.push("...", total - 4, total - 3, total - 2, total - 1, total);
  } else {
    // Middle: 1 ... current-1 current current+1 ... last
    pages.push("...", current - 1, current, current + 1, "...", total);
  }

  return pages;
}

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalItems,
  pageSizeOptions = [10, 25, 50],
  onPageChange,
  onPageSizeChange,
  isLoading = false,
  ariaLabel = "Pagination",
}: PaginationProps) {
  // Don't render pagination if there's nothing to paginate
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // Calculate showing range
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const isPrevDisabled = currentPage === 1 || isLoading;
  const isNextDisabled = currentPage === totalPages || isLoading;

  return (
    <nav
      role="navigation"
      aria-label={ariaLabel}
      className={`relative flex flex-col items-center gap-3 sm:flex-row sm:justify-between ${
        isLoading ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {/* Showing text */}
      <p className="text-sm text-[rgba(16,25,21,0.6)]">
        Showing <span className="font-semibold">{startItem}</span> to{" "}
        <span className="font-semibold">{endItem}</span> of{" "}
        <span className="font-semibold">{totalItems}</span> items
      </p>

      <div className="flex items-center gap-4">
        {/* Page navigation */}
        <ul className="flex items-center gap-1">
          {/* Previous button */}
          <li>
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={isPrevDisabled}
              aria-label="Go to previous page"
              aria-disabled={isPrevDisabled}
              tabIndex={isPrevDisabled ? -1 : 0}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                isPrevDisabled
                  ? "cursor-not-allowed border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.02)] text-[rgba(17,24,39,0.3)]"
                  : "border-[rgba(17,24,39,0.1)] bg-white text-[rgba(17,24,39,0.7)] hover:border-[rgba(17,24,39,0.2)] hover:bg-[rgba(17,24,39,0.05)]"
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </li>

          {/* Page numbers */}
          {pageNumbers.map((pageNum, index) =>
            pageNum === "..." ? (
              <li key={`ellipsis-${index}`}>
                <span
                  className="flex h-9 w-9 items-center justify-center text-sm text-[rgba(17,24,39,0.4)]"
                  aria-hidden="true"
                >
                  ...
                </span>
              </li>
            ) : (
              <li key={pageNum}>
                <button
                  onClick={() => onPageChange(pageNum)}
                  disabled={isLoading}
                  aria-label={
                    pageNum === currentPage
                      ? `Page ${pageNum}, Current page`
                      : `Go to page ${pageNum}`
                  }
                  aria-current={pageNum === currentPage ? "page" : undefined}
                  className={`flex h-9 min-w-[2.25rem] items-center justify-center rounded-lg border px-2 text-sm font-medium transition ${
                    pageNum === currentPage
                      ? "border-[var(--moss)] bg-[rgba(45,93,49,0.1)] text-[var(--moss)]"
                      : "border-[rgba(17,24,39,0.1)] bg-white text-[rgba(17,24,39,0.7)] hover:border-[rgba(17,24,39,0.2)] hover:bg-[rgba(17,24,39,0.05)]"
                  }`}
                >
                  {pageNum}
                </button>
              </li>
            )
          )}

          {/* Next button */}
          <li>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={isNextDisabled}
              aria-label="Go to next page"
              aria-disabled={isNextDisabled}
              tabIndex={isNextDisabled ? -1 : 0}
              className={`flex h-9 w-9 items-center justify-center rounded-lg border transition ${
                isNextDisabled
                  ? "cursor-not-allowed border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.02)] text-[rgba(17,24,39,0.3)]"
                  : "border-[rgba(17,24,39,0.1)] bg-white text-[rgba(17,24,39,0.7)] hover:border-[rgba(17,24,39,0.2)] hover:bg-[rgba(17,24,39,0.05)]"
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </li>
        </ul>

        {/* Page size selector */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="page-size"
            className="text-sm text-[rgba(16,25,21,0.6)]"
          >
            Show
          </label>
          <select
            id="page-size"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            disabled={isLoading}
            className="h-9 rounded-lg border border-[rgba(17,24,39,0.1)] bg-white px-2 text-sm font-medium text-[rgba(17,24,39,0.7)] transition hover:border-[rgba(17,24,39,0.2)] focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[rgba(45,93,49,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      </div>
    </nav>
  );
}
