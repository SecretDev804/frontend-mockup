"use client";

import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Baby,
  Check,
  Clock,
  Heart,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  X,
  XCircle,
} from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import {
  fetchBreedingSessions,
  cancelBreeding as cancelBreedingApi,
  type ActiveBreeding,
  type CompletedBreeding,
  type BreedingSessionsResponse,
} from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { formatDateTime } from "@/lib/format";

const FAILURE_REASONS: Record<string, string> = {
  genetic_incompatibility: "Genetic Incompatibility",
  unsuccessful_mating: "Unsuccessful Mating",
  environmental_stress: "Environmental Stress",
  cancelled_by_owner: "Cancelled by Owner",
  creature_deleted: "Creature No Longer Exists",
  creature_died: "Creature Died",
};

type HistoryFilter = "all" | "completed" | "failed" | "cancelled";

const HISTORY_STATUS_CONFIG: Record<
  string,
  { label: string; style: string }
> = {
  success: {
    label: "Success",
    style: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
  },
  failed: {
    label: "Failed",
    style: "bg-[rgba(196,107,46,0.2)] text-[var(--ember)]",
  },
  cancelled: {
    label: "Cancelled",
    style: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  },
};

function getHistoryStatus(breeding: CompletedBreeding) {
  if (breeding.status === "cancelled") return "cancelled";
  if (breeding.status === "completed" && breeding.result?.successful) return "success";
  return "failed";
}

function ActiveBreedingCard({
  breeding,
  onCancel,
}: {
  breeding: ActiveBreeding;
  onCancel: (breeding: ActiveBreeding) => void;
}) {
  const { cfg } = useGameConfig();
  const countdown = useCountdown(breeding.endDate, (cfg("breeding_duration_days") as number) * 86400000);

  const countdownString = countdown.isComplete
    ? "Ready!"
    : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;

  const progressAriaLabel = `Breeding ${Math.round(countdown.progress)}% complete, ${countdownString} remaining`;

  return (
    <div className="dashboard-card overflow-hidden rounded-2xl border-[rgba(218,165,32,0.3)] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[rgba(16,25,21,0.9)]">
            {breeding.parent1.name}{" "}
            <span className="font-normal text-[rgba(16,25,21,0.5)]">+</span>{" "}
            {breeding.parent2.name}
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
            {breeding.parent1.type}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          {breeding.usedPedestal && (
            <span className="rounded-full bg-[rgba(236,72,153,0.12)] px-2.5 py-1 text-[10px] font-semibold text-[rgba(190,24,93,1)]">
              Heart Pedestal
            </span>
          )}
          <span className="rounded-full bg-[rgba(218,165,32,0.22)] px-2.5 py-1 text-[10px] font-semibold text-[var(--ember)]">
            {breeding.successRate}% chance
          </span>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-[rgba(218,165,32,0.08)] p-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[var(--ember)]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Breeding in progress</span>
        </div>

        <div className="mt-2 space-y-2">
          <div
            role="progressbar"
            aria-valuenow={Math.round(countdown.progress)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={progressAriaLabel}
            className="h-2 w-full overflow-hidden rounded-full bg-[rgba(218,165,32,0.2)]"
          >
            <div
              className="h-full rounded-full bg-[var(--ember)] transition-all duration-1000"
              style={{ width: `${countdown.progress}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs">
            <span
              className={`font-medium ${
                countdown.isComplete
                  ? "text-[var(--moss)]"
                  : "text-[rgba(16,25,21,0.6)]"
              }`}
            >
              {countdownString}
            </span>
            <span className="text-[rgba(16,25,21,0.5)]">
              Started {formatDateTime(breeding.startDate)}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => onCancel(breeding)}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(196,107,46,0.35)] px-4 py-2 text-xs font-semibold text-[var(--ember)] transition hover:bg-[rgba(196,107,46,0.08)]"
      >
        <X className="h-3.5 w-3.5" />
        Cancel Breeding
      </button>
    </div>
  );
}

function HistoryCard({ breeding }: { breeding: CompletedBreeding }) {
  const historyStatus = getHistoryStatus(breeding);
  const config = HISTORY_STATUS_CONFIG[historyStatus] ?? {
    label: "Unknown",
    style: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  };

  return (
    <div className="dashboard-card rounded-2xl p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-[rgba(16,25,21,0.9)]">
            {breeding.parent1.name}{" "}
            <span className="font-normal text-[rgba(16,25,21,0.5)]">+</span>{" "}
            {breeding.parent2.name}
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
            {breeding.parent1.type}
          </p>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${config.style}`}
        >
          {config.label}
        </span>
      </div>

      {breeding.result?.reason && historyStatus !== "success" && (
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgba(196,107,46,0.08)] p-2.5 text-xs text-[rgba(16,25,21,0.65)]">
          <XCircle className="h-3.5 w-3.5 flex-shrink-0 text-[var(--ember)]" />
          {FAILURE_REASONS[breeding.result.reason] || breeding.result.reason}
        </div>
      )}

      {breeding.result?.offspring &&
        breeding.result.offspring.length > 0 && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgba(45,93,49,0.08)] p-2.5 text-xs text-[var(--moss)]">
            <Baby className="h-3.5 w-3.5 flex-shrink-0" />
            <span>
              Offspring:{" "}
              <span className="font-semibold">
                {breeding.result.offspring[0].name}
              </span>{" "}
              ({breeding.result.offspring[0].type})
            </span>
          </div>
        )}

      <div className="mt-3 flex items-center gap-2 text-xs text-[rgba(16,25,21,0.45)]">
        <Clock className="h-3 w-3" />
        {formatDateTime(breeding.startDate)} → {formatDateTime(breeding.completedDate)}
      </div>
    </div>
  );
}

export default function BreedingContent() {
  const { ownerKey, isLoading: userLoading } = useUserContext();
  const { cfg } = useGameConfig();

  const [data, setData] = useState<BreedingSessionsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [historyFilter, setHistoryFilter] = useState<HistoryFilter>("all");

  const [cancelTarget, setCancelTarget] = useState<ActiveBreeding | null>(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchData = useCallback(
    async (background = false) => {
      if (!ownerKey) return;

      if (background) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const result = await fetchBreedingSessions(ownerKey);
        setData(result);
        setError(null);
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Failed to load breeding sessions.";
        setError(message);
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [ownerKey]
  );

  useEffect(() => {
    if (ownerKey) {
      fetchData();
    }
  }, [ownerKey, fetchData]);

  const handleCancel = async () => {
    if (!cancelTarget || !ownerKey) return;

    setCancelLoading(true);
    setCancelError(null);

    try {
      await cancelBreedingApi(cancelTarget.id, ownerKey);
      setCancelTarget(null);
      setSuccessMsg(
        `Breeding between ${cancelTarget.parent1.name} and ${cancelTarget.parent2.name} has been cancelled.`
      );
      setTimeout(() => setSuccessMsg(null), 5000);
      await fetchData(true);
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to cancel breeding.";
      setCancelError(message);
    } finally {
      setCancelLoading(false);
    }
  };

  const filteredHistory =
    data?.completedBreedings.filter((b) => {
      if (historyFilter === "all") return true;
      if (historyFilter === "completed") {
        return b.status === "completed" && b.result?.successful;
      }
      if (historyFilter === "failed") {
        return (b.status === "completed" && !b.result?.successful) || b.status === "failed";
      }
      return b.status === historyFilter;
    }) ?? [];

  const activeCount = data?.activeBreedings.length ?? 0;
  const completedCount =
    data?.completedBreedings.filter(
      (b) => b.status === "completed" && b.result?.successful
    ).length ?? 0;

  if (isLoading || userLoading) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dashboard-card rounded-2xl p-5">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-8 w-16 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="dashboard-card rounded-2xl p-5">
              <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
              <div className="mt-4 h-2 w-full animate-pulse rounded bg-gray-200" />
              <div className="mt-3 h-4 w-32 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <h1 className="font-display text-3xl">Breeding</h1>
        </section>
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-6">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <p className="text-sm font-medium text-[var(--ember)]">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Breeding</h1>
            <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
              {activeCount > 0
                ? `${activeCount} active breeding session${activeCount !== 1 ? "s" : ""}`
                : "No active breeding sessions"}
            </p>
          </div>
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </section>

      {successMsg && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.1)] p-4">
          <Check className="h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
          <p className="text-sm font-medium text-[var(--moss)]">{successMsg}</p>
        </div>
      )}

      <section className="animate-stagger grid gap-4 md:grid-cols-3">
        <div className="dashboard-card flex items-center gap-4 rounded-2xl border-t-4 border-t-[rgba(218,165,32,0.6)] p-5 transition hover:border-[rgba(17,24,39,0.15)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(218,165,32,0.2)] text-[var(--gold)]">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
              Active
            </p>
            <p className="mt-3 text-2xl font-semibold">{activeCount}</p>
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.55)]">
              In progress
            </p>
          </div>
        </div>

        <div className="dashboard-card flex items-center gap-4 rounded-2xl border-t-4 border-t-[rgba(45,93,49,0.5)] p-5 transition hover:border-[rgba(17,24,39,0.15)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
            <Baby className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
              Successful
            </p>
            <p className="mt-3 text-2xl font-semibold">{completedCount}</p>
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.55)]">
              Offspring delivered
            </p>
          </div>
        </div>

        <div className="dashboard-card flex items-center gap-4 rounded-2xl border-t-4 border-t-[rgba(139,69,19,0.5)] p-5 transition hover:border-[rgba(17,24,39,0.15)]">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[rgba(139,69,19,0.12)] text-[var(--ember)]">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
              Total
            </p>
            <p className="mt-3 text-2xl font-semibold">
              {data?.totalBreedings ?? 0}
            </p>
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.55)]">
              All time
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3">
          <h2 className="font-display text-2xl">Active Breedings</h2>
          {activeCount > 0 && (
            <span className="rounded-full bg-[rgba(218,165,32,0.22)] px-2.5 py-1 text-[10px] font-bold text-[var(--ember)]">
              {activeCount}
            </span>
          )}
        </div>

        {data && data.activeBreedings.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {data.activeBreedings.map((breeding) => (
              <ActiveBreedingCard
                key={breeding.id}
                breeding={breeding}
                onCancel={setCancelTarget}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
            <Heart className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.2)]" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No active breeding sessions
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Place two eligible creatures near each other in Second Life to
              start breeding.
            </p>
          </div>
        )}
      </section>

      <section>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl">History</h2>
          <div className="flex items-center gap-2">
            {(
              [
                { id: "all", label: "All" },
                { id: "completed", label: "Successful" },
                { id: "failed", label: "Failed" },
                { id: "cancelled", label: "Cancelled" },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setHistoryFilter(tab.id)}
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  historyFilter === tab.id
                    ? "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                    : "text-[rgba(16,25,21,0.6)] hover:bg-[rgba(16,25,21,0.05)]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {filteredHistory.map((breeding) => (
              <HistoryCard key={breeding.id} breeding={breeding} />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
            <Clock className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
            <p className="mt-4 text-sm text-[rgba(16,25,21,0.6)]">
              {historyFilter === "all"
                ? "No breeding history yet."
                : `No ${historyFilter} breedings found.`}
            </p>
          </div>
        )}
      </section>

      <section className="flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--moss)]">
            How Breeding Works
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
            Breeding is initiated in Second Life when two eligible creatures of
            the same type are within 10 meters of each other. Using a Heart
            Pedestal increases the success rate from {cfg("babiez_chance_base") as number}% to{" "}
            {cfg("babiez_chance_pedestal") as number}%. Breeding takes{" "}
            {cfg("breeding_duration_days") as number} days, and offspring are delivered to your mailbox.
          </p>
        </div>
      </section>

      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-[rgba(196,107,46,0.2)] bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(196,107,46,0.15)] text-[var(--ember)]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                Cancel Breeding
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[rgba(16,25,21,0.7)]">
              <p>
                Are you sure you want to cancel the breeding between{" "}
                <span className="font-semibold text-[rgba(16,25,21,0.9)]">
                  {cancelTarget.parent1.name}
                </span>{" "}
                and{" "}
                <span className="font-semibold text-[rgba(16,25,21,0.9)]">
                  {cancelTarget.parent2.name}
                </span>
                ?
              </p>

              <div className="rounded-xl bg-[rgba(17,24,39,0.04)] p-3 text-xs text-[rgba(16,25,21,0.65)]">
                <p>Both creatures will be unpaired and can breed again.</p>
                {cancelTarget.usedPedestal && (
                  <p className="mt-1 font-medium text-[var(--moss)]">
                    The Heart Pedestal will be returned to your inventory.
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 rounded-xl bg-[rgba(196,107,46,0.08)] p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--ember)]" />
                <p className="text-xs font-semibold text-[var(--ember)]">
                  This action cannot be undone. All breeding progress will be
                  lost.
                </p>
              </div>
            </div>

            {cancelError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgba(196,107,46,0.12)] p-2 text-xs text-[var(--ember)]">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setCancelTarget(null);
                  setCancelError(null);
                }}
                disabled={cancelLoading}
                className="flex-1 rounded-full border border-[rgba(17,24,39,0.15)] px-4 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
              >
                Go Back
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--ember)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgb(111,55,15)] disabled:opacity-50"
              >
                {cancelLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel Breeding"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
