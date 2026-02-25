"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RefreshCw, AlertTriangle, PawPrint } from "lucide-react";
import { useCreatureContext } from "@/contexts/CreatureContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { CreatureFilters } from "@/components/creatures/CreatureFilters";
import Pagination from "@/components/ui/Pagination";
import { getStatusLabel, STATUS_STYLES } from "@/components/ui/StatusBadge";

function CreatureCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95">
      <div className="h-44 w-full animate-pulse bg-[rgba(16,25,21,0.08)]" />
      <div className="space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
            <div className="h-3 w-16 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
          </div>
          <div className="h-5 w-16 animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
        </div>
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
          <div className="h-3 w-3/4 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
        </div>
      </div>
    </div>
  );
}

// Page loading skeleton for Suspense fallback
function CreaturesPageSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <h1 className="font-display text-3xl">My Creatures</h1>
        <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">Loading...</p>
      </header>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <CreatureCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function CreaturesPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { cfg } = useGameConfig();
  const endOfLifeAge = (cfg("creature_max_age") as number) - 10;

  const {
    creatures,
    summary,
    isLoading,
    isRefreshing,
    error,
    refetch,
    lastUpdated,
    filters,
    setFilters,
    sort,
    setSort,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
  } = useCreatureContext();

  const pageFromUrl = parseInt(searchParams.get("page") || "1");
  const pageSizeFromUrl = parseInt(searchParams.get("pageSize") || "25");

  // Sync URL -> Context on mount/URL change
  useEffect(() => {
    if (pageFromUrl !== page && pageFromUrl >= 1) {
      setPage(pageFromUrl);
    }
    if (pageSizeFromUrl !== pageSize && pageSizeFromUrl >= 10 && pageSizeFromUrl <= 100) {
      setPageSize(pageSizeFromUrl);
    }
  }, [pageFromUrl, pageSizeFromUrl, page, pageSize, setPage, setPageSize]);

  // Update URL when pagination changes (Context -> URL)
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newSize.toString());
    params.set("page", "1"); // Reset to page 1 when page size changes
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setPageSize(newSize);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
          <h1 className="font-display text-3xl">My Creatures</h1>
          <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">Loading...</p>
        </header>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <CreatureCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
          <h1 className="font-display text-3xl">My Creatures</h1>
        </header>
        <div className="rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--ember)]" />
            <p className="text-sm text-[rgba(16,25,21,0.8)]">{error}</p>
          </div>
          <button
            onClick={refetch}
            className="mt-4 rounded-full bg-[var(--moss)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--moss-strong)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">My Creatures</h1>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              {summary
                ? `${summary.total} creatures (${summary.alive} alive)`
                : "Track each creature profile, status, and lifecycle."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-[rgba(16,25,21,0.5)]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-[rgba(47,91,72,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(47,91,72,0.6)] hover:bg-[rgba(47,91,72,0.08)] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="rounded-2xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
        <CreatureFilters
          filters={filters}
          onFiltersChange={setFilters}
          sort={sort}
          onSortChange={setSort}
        />
        {summary && (
          <p className="mt-2 text-right text-xs text-[rgba(16,25,21,0.45)]">
            {(pagination?.totalItems ?? creatures.length).toLocaleString()} of{" "}
            {summary.total.toLocaleString()} creatures
          </p>
        )}
      </div>

      {/* Empty State */}
      {creatures.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
          <p className="text-sm text-[rgba(16,25,21,0.6)]">
            {Object.keys(filters).length > 0
              ? "No creatures match your filters."
              : "No creatures found. Rez a creature in Second Life to get started!"}
          </p>
          {Object.keys(filters).length > 0 && (
            <button
              onClick={() => setFilters({})}
              className="mt-4 text-xs font-semibold text-[var(--moss)] transition hover:text-[var(--moss-strong)]"
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Creature Grid */}
          <div className={`animate-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3 ${isRefreshing ? "opacity-60" : ""}`}>
            {creatures.map((creature) => {
              const status = getStatusLabel(creature, endOfLifeAge);
              return (
                <Link
                  key={creature.creature_id}
                  href={`/creatures/${creature.creature_id}`}
                  className="group relative overflow-hidden rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 transition-transform hover:-translate-y-1"
                >
                  {/* Alert indicator for hungry creatures */}
                  {creature.is_alive && (creature.is_hungry || creature.munchiez <= 0) && (
                    <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-[rgba(196,107,46,0.9)] px-2 py-1 shadow-sm">
                      <AlertTriangle className="h-3 w-3 text-white" />
                      <span className="text-[10px] font-semibold text-white">
                        Needs Food
                      </span>
                    </div>
                  )}
                  {/* Placeholder image */}
                  <div className="flex h-44 w-full items-center justify-center bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
                    {creature.is_alive ? (
                      <PawPrint className={`h-12 w-12 text-[var(--moss)] ${creature.is_decorative ? "" : "animate-gentle-pulse"}`} />
                    ) : (
                      <PawPrint className="h-12 w-12 text-[rgba(17,24,39,0.2)]" />
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold">{creature.name}</p>
                        <p className="text-xs text-[rgba(16,25,21,0.6)]">
                          {creature.creature_type}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                          STATUS_STYLES[status] ||
                          "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                        }`}
                      >
                        {status}
                      </span>
                    </div>

                    {/* Mini stats — hidden for decorative creatures */}
                    {!creature.is_decorative && (
                      <div className="flex gap-4 text-xs text-[rgba(16,25,21,0.6)]">
                        <span>Age: {creature.age} days</span>
                        {creature.is_alive && (
                          <span>Munchiez: {creature.munchiez}%</span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[rgba(16,25,21,0.55)]">
                      {creature.sent_to_beyond
                        ? "Sent to the Great Beyond"
                        : creature.is_decorative
                        ? creature.decorative_type === "forever"
                          ? "Forever Beautiful - Stats frozen"
                          : creature.decorative_type === "eternalz"
                          ? "Eternal Life - Never dies"
                          : "Decorative creature"
                        : creature.is_alive
                        ? `Next delivery in ${creature.delivery_days} days`
                        : `Died: ${creature.death_reason?.replace("_", " ")}`}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="rounded-2xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                isLoading={isRefreshing}
                ariaLabel="Creatures pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

// Wrap in Suspense for useSearchParams (required by Next.js App Router)
export default function CreaturesContent() {
  return (
    <Suspense fallback={<CreaturesPageSkeleton />}>
      <CreaturesPageContent />
    </Suspense>
  );
}
