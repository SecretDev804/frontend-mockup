"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { AlertTriangle, RefreshCw, Share2, Star } from "lucide-react";
import { useCollectionCreatures } from "@/hooks/useCollectionCreatures";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { CollectionCard } from "@/components/creatures/CollectionCard";
import Pagination from "@/components/ui/Pagination";
import type { Creature } from "@/lib/api";

const CREATURE_TYPES = [
  "Goobiez",
  "Fuggiez",
  "Friend",
  "Family",
  "Stranger",
  "Babiez",
  "Forever",
] as const;

type StatusFilter = "all" | "alive" | "dead" | "decorative";

const STATUS_STYLES: Record<string, string> = {
  Healthy: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
  "Needs Food": "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]",
  Critical: "bg-[rgba(196,107,46,0.2)] text-[var(--ember)]",
  "End of Life": "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  Deceased: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  Decorative: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]",
  "Forever Beautiful": "bg-[rgba(218,165,32,0.15)] text-[rgba(178,135,20,1)]",
  "Eternal Life": "bg-[rgba(6,182,212,0.12)] text-[rgba(8,145,178,1)]",
  "Great Beyond": "bg-[rgba(139,92,246,0.12)] text-[rgba(109,40,217,1)]",
};

const FEATURED_KEY = "goobiez_collection_featured";

function resolveStatus(creature: Creature, endOfLifeAge: number): string {
  if (creature.sent_to_beyond) return "Great Beyond";
  if (!creature.is_alive && creature.decorative_type === "forever") return "Forever Beautiful";
  if (!creature.is_alive) return "Deceased";
  if (creature.is_decorative && creature.decorative_type === "eternalz") return "Eternal Life";
  if (creature.is_decorative) return "Decorative";
  if (creature.munchiez <= 0) return "Critical";
  if (creature.is_hungry) return "Needs Food";
  if (creature.age >= endOfLifeAge) return "End of Life";
  return "Healthy";
}

function loadFeatured(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(FEATURED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveFeatured(ids: Set<string>): void {
  try {
    localStorage.setItem(FEATURED_KEY, JSON.stringify([...ids]));
  } catch {
    // localStorage unavailable — silently skip
  }
}

function CollectionSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <h1 className="font-display text-3xl">My Collection</h1>
        <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">Loading...</p>
      </header>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="h-28 animate-pulse rounded-2xl bg-white/70"
          />
        ))}
      </div>
    </div>
  );
}

export default function CollectionContent() {
  const { creatures, summary, isLoading, error, refetch } =
    useCollectionCreatures();
  const { cfg } = useGameConfig();
  const endOfLifeAge = (cfg("creature_max_age") as number) - 10;

  const [activeType, setActiveType] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("alive");
  const [featuredIds, setFeaturedIds] = useState<Set<string>>(loadFeatured);
  const [collectionPage, setCollectionPage] = useState(1);
  const [collectionPageSize, setCollectionPageSize] = useState(24);

  const toggleFeatured = useCallback((id: string) => {
    setFeaturedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      saveFeatured(next);
      return next;
    });
  }, []);

  const typeCount = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const c of creatures) {
      counts[c.creature_type] = (counts[c.creature_type] ?? 0) + 1;
    }
    return counts;
  }, [creatures]);

  const filtered = useMemo(() => {
    return creatures.filter((c) => {
      if (activeType !== "All" && c.creature_type !== activeType) return false;
      if (statusFilter === "alive" && !c.is_alive) return false;
      if (statusFilter === "dead" && c.is_alive) return false;
      if (statusFilter === "decorative" && !c.is_decorative) return false;
      return true;
    });
  }, [creatures, activeType, statusFilter]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCollectionPage(1);
  }, [activeType, statusFilter]);

  const showcased = useMemo(
    () => filtered.filter((c) => featuredIds.has(c.creature_id)),
    [filtered, featuredIds]
  );
  const rest = useMemo(
    () => filtered.filter((c) => !featuredIds.has(c.creature_id)),
    [filtered, featuredIds]
  );

  const totalPages = Math.ceil(rest.length / collectionPageSize);
  const paginatedRest = useMemo(() => {
    const start = (collectionPage - 1) * collectionPageSize;
    return rest.slice(start, start + collectionPageSize);
  }, [rest, collectionPage, collectionPageSize]);

  if (isLoading) return <CollectionSkeleton />;

  if (error) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
          <h1 className="font-display text-3xl">My Collection</h1>
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
            <h1 className="font-display text-3xl">My Collection</h1>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              {summary
                ? `${summary.total} creatures — ${summary.alive} alive, ${summary.dead} in the beyond`
                : "Browse and showcase your Goobiez creatures."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetch}
              className="flex items-center gap-2 rounded-full border border-[rgba(47,91,72,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(47,91,72,0.6)] hover:bg-[rgba(47,91,72,0.08)]"
            >
              <RefreshCw className="h-3 w-3" />
              Refresh
            </button>
            <button
              disabled
              title="Coming soon — share your public collection"
              className="flex cursor-not-allowed items-center gap-2 rounded-full border border-[rgba(16,25,21,0.12)] px-4 py-2 text-xs font-semibold text-[rgba(16,25,21,0.35)]"
            >
              <Share2 className="h-3 w-3" />
              Share
            </button>
          </div>
        </div>

        {/* Summary stats */}
        {summary && (
          <div className="mt-4 flex flex-wrap gap-3">
            <div className="rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.08)] px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(16,25,21,0.5)]">
                Total
              </p>
              <p className="text-xl font-semibold text-[var(--moss)]">
                {summary.total}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.08)] px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(16,25,21,0.5)]">
                Alive
              </p>
              <p className="text-xl font-semibold text-[var(--moss)]">
                {summary.alive}
              </p>
            </div>
            <div className="rounded-2xl border border-[rgba(16,25,21,0.1)] bg-[rgba(16,25,21,0.04)] px-4 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(16,25,21,0.5)]">
                Beyond
              </p>
              <p className="text-xl font-semibold text-[rgba(16,25,21,0.55)]">
                {summary.dead}
              </p>
            </div>
            {featuredIds.size > 0 && (
              <div className="rounded-2xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.12)] px-4 py-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[rgba(16,25,21,0.5)]">
                  Showcased
                </p>
                <p className="text-xl font-semibold text-[var(--ember)]">
                  {featuredIds.size}
                </p>
              </div>
            )}
          </div>
        )}
      </header>

      {/* Filter bar */}
      <div className="rounded-2xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
        <div className="flex flex-wrap items-center gap-4">
          {/* Type tabs */}
          <div className="flex flex-wrap gap-2">
            {(["All", ...CREATURE_TYPES] as const).map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  activeType === type
                    ? "bg-[var(--moss)] text-white"
                    : "border border-[rgba(16,25,21,0.12)] text-[rgba(16,25,21,0.65)] hover:border-[rgba(16,25,21,0.25)] hover:text-[rgba(16,25,21,0.85)]"
                }`}
              >
                {type}
                {type !== "All" && typeCount[type]
                  ? ` (${typeCount[type]})`
                  : ""}
              </button>
            ))}
          </div>

          <div className="h-6 w-px bg-[rgba(16,25,21,0.12)]" />

          {/* Status chips */}
          <div className="flex gap-2">
            {(["all", "alive", "dead", "decorative"] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition ${
                  statusFilter === s
                    ? "bg-[rgba(16,25,21,0.1)] text-[rgba(16,25,21,0.85)]"
                    : "text-[rgba(16,25,21,0.5)] hover:text-[rgba(16,25,21,0.8)]"
                }`}
              >
                {s === "all" ? "All Status" : s}
              </button>
            ))}
          </div>

          {/* Result count */}
          {creatures.length > 0 && (
            <span className="ml-auto text-xs text-[rgba(16,25,21,0.45)]">
              {filtered.length.toLocaleString()} of {creatures.length.toLocaleString()} creatures
            </span>
          )}
        </div>
      </div>

      {/* Showcase section */}
      {showcased.length > 0 && (
        <section>
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[rgba(16,25,21,0.8)]">
            <Star className="h-4 w-4 fill-[var(--ember)] text-[var(--ember)]" />
            Showcase ({showcased.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {showcased.map((c) => {
              const status = resolveStatus(c, endOfLifeAge);
              return (
                <CollectionCard
                  key={c.creature_id}
                  creature={c}
                  status={status}
                  statusStyle={
                    STATUS_STYLES[status] ??
                    "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                  }
                  isFeatured
                  onToggleFeatured={toggleFeatured}
                />
              );
            })}
          </div>
          <div className="my-4 border-t border-[rgba(16,25,21,0.08)]" />
        </section>
      )}

      {/* Collection grid */}
      {rest.length === 0 && showcased.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
          <p className="text-sm text-[rgba(16,25,21,0.6)]">
            {creatures.length === 0
              ? "No creatures found. Rez a creature in Second Life to get started!"
              : `No creatures match the current filters.`}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {paginatedRest.map((c) => {
              const status = resolveStatus(c, endOfLifeAge);
              return (
                <CollectionCard
                  key={c.creature_id}
                  creature={c}
                  status={status}
                  statusStyle={
                    STATUS_STYLES[status] ??
                    "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                  }
                  isFeatured={false}
                  onToggleFeatured={toggleFeatured}
                />
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="rounded-2xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
              <Pagination
                currentPage={collectionPage}
                totalPages={totalPages}
                pageSize={collectionPageSize}
                totalItems={rest.length}
                pageSizeOptions={[24, 48]}
                onPageChange={setCollectionPage}
                onPageSizeChange={(size) => {
                  setCollectionPageSize(size);
                  setCollectionPage(1);
                }}
                ariaLabel="Collection pagination"
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
