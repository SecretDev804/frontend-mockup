"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { RefreshCw, AlertTriangle, PawPrint, Trees, ArrowLeft } from "lucide-react";
import { useVorestContext } from "@/contexts/VorestContext";
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

function VorestCreaturesPageSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <h1 className="font-display text-3xl">Vorest Creatures</h1>
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

function VorestCreaturesPageContent() {
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
  } = useVorestContext();

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

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setPage(newPage);
  };

  const handlePageSizeChange = (newSize: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("pageSize", newSize.toString());
    params.set("page", "1");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
    setPageSize(newSize);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
          <h1 className="font-display text-3xl">Vorest Creatures</h1>
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
          <div className="flex items-center gap-3">
            <Link
              href="/vorest"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(16,25,21,0.12)] transition hover:bg-[rgba(16,25,21,0.04)]"
            >
              <ArrowLeft className="h-4 w-4 text-[rgba(16,25,21,0.6)]" />
            </Link>
            <h1 className="font-display text-3xl">Vorest Creatures</h1>
          </div>
        </header>
        <div className="rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--ember)]" />
            <p className="text-sm text-[rgba(16,25,21,0.8)]">{error}</p>
          </div>
          <button
            onClick={() => refetch()}
            className="mt-4 rounded-full bg-[var(--moss)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
        <Link href="/dashboard" className="transition hover:text-[var(--moss)]">
          Dashboard
        </Link>
        <span>/</span>
        <Link href="/vorest" className="transition hover:text-[var(--moss)]">
          Vorest
        </Link>
        <span>/</span>
        <span className="font-semibold text-[rgba(16,25,21,0.8)]">Creatures</span>
      </nav>

      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/vorest"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(16,25,21,0.12)] transition hover:bg-[rgba(16,25,21,0.04)]"
            >
              <ArrowLeft className="h-4 w-4 text-[rgba(16,25,21,0.6)]" />
            </Link>
            <div>
              <h1 className="font-display text-3xl">Vorest Creatures</h1>
              <p className="mt-1 text-sm text-[rgba(16,25,21,0.6)]">
                {summary
                  ? `${summary.total} creatures (${summary.alive} alive)`
                  : "Manage your creatures living in the Virtual Forest."}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-[rgba(16,25,21,0.5)]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => refetch()}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)] disabled:opacity-50"
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
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-12 text-center">
          <Trees className="h-12 w-12 text-[rgba(45,93,49,0.4)]" />
          <div>
            <p className="font-display text-2xl">
              {Object.keys(filters).length > 0
                ? "No creatures match your filters"
                : "No creatures in the Vorest"}
            </p>
            <p className="mt-1 text-sm text-[rgba(16,25,21,0.5)]">
              {Object.keys(filters).length > 0
                ? "Try adjusting your filters to see more creatures."
                : "Send creatures from Second Life to start building your virtual forest."}
            </p>
          </div>
          {Object.keys(filters).length > 0 ? (
            <button
              onClick={() => setFilters({})}
              className="rounded-full border border-[rgba(45,93,49,0.35)] px-6 py-2.5 text-sm font-semibold text-[var(--moss)] transition hover:bg-[rgba(45,93,49,0.08)]"
            >
              Clear Filters
            </button>
          ) : (
            <Link
              href="/vorest/transfer"
              className="rounded-full bg-[var(--moss)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(45,93,49,0.85)]"
            >
              Transfer Creatures
            </Link>
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
                  href={`/vorest/creatures/${creature.creature_id}`}
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

                  {/* Breeding indicator */}
                  {creature.is_paired && (
                    <div className="absolute left-3 top-3 z-10 rounded-full bg-[rgba(139,69,19,0.85)] px-2 py-1 shadow-sm">
                      <span className="text-[10px] font-semibold text-white">
                        Breeding
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
                        <p className="text-sm font-semibold group-hover:text-[var(--moss)]">
                          {creature.name}
                        </p>
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

                    {/* Munchiez bar */}
                    {!creature.is_decorative && creature.is_alive && (
                      <div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[rgba(16,25,21,0.5)]">Munchiez</span>
                          <span className="font-semibold text-[rgba(16,25,21,0.7)]">
                            {creature.munchiez}%
                          </span>
                        </div>
                        <div
                          className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[rgba(16,25,21,0.08)]"
                          role="progressbar"
                          aria-valuenow={creature.munchiez}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`Munchiez: ${creature.munchiez}%`}
                        >
                          <div
                            className={`h-full rounded-full transition-all ${
                              creature.munchiez <= 20
                                ? "bg-[rgba(196,107,46,0.8)]"
                                : creature.munchiez <= 50
                                ? "bg-[rgba(218,165,32,0.8)]"
                                : "bg-[rgba(45,93,49,0.7)]"
                            }`}
                            style={{ width: `${Math.min(creature.munchiez, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Mini stats */}
                    {!creature.is_decorative && (
                      <div className="flex gap-4 text-xs text-[rgba(16,25,21,0.6)]">
                        <span>Age: {creature.age} days</span>
                        {creature.is_alive && creature.delivery_days !== undefined && (
                          <span>Delivery: {creature.delivery_days}d</span>
                        )}
                      </div>
                    )}

                    <p className="text-xs text-[rgba(16,25,21,0.55)]">
                      {creature.sent_to_beyond
                        ? "Sent to the Great Beyond"
                        : creature.is_decorative
                        ? creature.decorative_type === "forever"
                          ? "Forever Beautiful"
                          : creature.decorative_type === "eternalz"
                          ? "Eternal Life"
                          : "Decorative creature"
                        : creature.is_alive
                        ? creature.is_paired
                          ? "Breeding in progress"
                          : creature.delivery_days !== undefined
                          ? `Next delivery in ${creature.delivery_days} days`
                          : "Living in the Vorest"
                        : `Died: ${creature.death_reason?.replace("_", " ") || "Unknown"}`}
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
                ariaLabel="Vorest creatures pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function VorestCreaturesContent() {
  return (
    <Suspense fallback={<VorestCreaturesPageSkeleton />}>
      <VorestCreaturesPageContent />
    </Suspense>
  );
}
