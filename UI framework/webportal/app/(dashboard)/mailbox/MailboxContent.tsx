"use client";

import { useState, useCallback } from "react";
import { Mail, Package, Info, RefreshCw, AlertTriangle, Check, Loader2, PackageCheck } from "lucide-react";
import { useMailboxContext } from "@/contexts/MailboxContext";
import { formatDate, formatLastUpdated } from "@/lib/format";

// Item type configuration
const ITEM_TYPES: Record<string, { icon: string; label: string; color: string }> = {
  friend_visit: { icon: "🤝", label: "Friend Visit", color: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]" },
  family_visit: { icon: "👨‍👩‍👧", label: "Family Visit", color: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]" },
  stranger: { icon: "👤", label: "Stranger", color: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]" },
  fuggiez: { icon: "🐾", label: "Fuggiez", color: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]" },
  babiez: { icon: "🍼", label: "Babiez", color: "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]" },
  token: { icon: "🪙", label: "Coin", color: "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]" },
  rare_token: { icon: "✨", label: "Token", color: "bg-[rgba(196,107,46,0.2)] text-[var(--ember)]" },
  slox: { icon: "💎", label: "Slox", color: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]" },
  monthly_special: { icon: "🎁", label: "Monthly Special", color: "bg-[rgba(196,107,46,0.2)] text-[var(--ember)]" },
};

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-20 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-200" />
            </div>
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MailboxContent() {
  const {
    items,
    itemCount,
    capacity,
    isFull,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetch,
    claimItem,
    claimAll,
  } = useMailboxContext();

  const [claimingItemId, setClaimingItemId] = useState<string | null>(null);
  const [claimingAll, setClaimingAll] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);

  const isClaimBusy = claimingItemId !== null || claimingAll;

  const dismissFeedback = useCallback(() => {
    const timer = setTimeout(() => {
      setClaimSuccess(null);
      setClaimError(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  const handleClaimItem = async (itemId: string) => {
    setClaimingItemId(itemId);
    setClaimError(null);
    setClaimSuccess(null);
    try {
      const result = await claimItem(itemId);
      setClaimSuccess(
        `Claimed ${result.claimed_item.item_type.replace("_", " ")} from ${result.claimed_item.source_creature_name}`
      );
      dismissFeedback();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to claim item";
      if (message.includes("modified") || message.includes("CONCURRENT")) {
        setClaimError("Mailbox was updated. Refreshing...");
        await refetch();
      } else {
        setClaimError(message);
      }
      dismissFeedback();
    } finally {
      setClaimingItemId(null);
    }
  };

  const handleClaimAll = async () => {
    setClaimingAll(true);
    setClaimError(null);
    setClaimSuccess(null);
    try {
      const result = await claimAll();
      setClaimSuccess(
        `Claimed ${result.claimed_count} item${result.claimed_count !== 1 ? "s" : ""} successfully!`
      );
      dismissFeedback();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to claim items";
      if (message.includes("modified") || message.includes("CONCURRENT")) {
        setClaimError("Mailbox was updated. Refreshing...");
        await refetch();
      } else {
        setClaimError(message);
      }
      dismissFeedback();
    } finally {
      setClaimingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Mailbox</h1>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              {isLoading ? (
                <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-200" />
              ) : (
                `${itemCount} of ${capacity} items`
              )}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Claim All button */}
            {!isLoading && itemCount > 0 && (
              <button
                onClick={handleClaimAll}
                disabled={isClaimBusy}
                aria-label={`Claim all ${itemCount} mailbox items`}
                className="flex items-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--moss-strong)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {claimingAll ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Claiming...
                  </>
                ) : (
                  <>
                    <PackageCheck className="h-4 w-4" />
                    Claim All ({itemCount})
                  </>
                )}
              </button>
            )}
            {/* Refresh button */}
            <button
              onClick={refetch}
              disabled={isLoading || isRefreshing || isClaimBusy}
              className="flex items-center gap-2 rounded-full border border-[rgba(17,24,39,0.1)] px-3 py-2 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
            {/* Slots badge */}
            <div className="flex items-center gap-2 rounded-full bg-[rgba(45,93,49,0.08)] px-4 py-2">
              <Mail className="h-4 w-4 text-[var(--moss)]" />
              <span className="text-sm font-semibold text-[var(--moss)]">
                {isLoading ? "..." : `${capacity - itemCount} slots available`}
              </span>
            </div>
          </div>
        </div>
        {/* Last updated */}
        {lastUpdated && !isLoading && (
          <p className="mt-3 text-xs text-[rgba(16,25,21,0.4)]">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </header>

      {/* Info Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--moss)]">How to claim items</p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
            Items are delivered by your creatures eating/breeding every 12 days. Click &quot;Claim&quot; on individual
            items or &quot;Claim All&quot; to collect. Claimed items will appear in your Second Life
            inventory next time you rez your mailbox.
          </p>
        </div>
      </div>

      {/* Claim Success Banner */}
      {claimSuccess && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.08)] p-4">
          <Check className="h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
          <p className="text-sm font-medium text-[var(--moss)]">{claimSuccess}</p>
        </div>
      )}

      {/* Claim Error Banner */}
      {claimError && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <p className="text-sm font-medium text-[var(--ember)]">{claimError}</p>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" />
          <p className="mt-2 font-semibold text-red-700">Failed to load mailbox</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && <LoadingSkeleton />}

      {/* Items List */}
      {!isLoading && !error && items.length === 0 && (
        <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.25)]" />
          <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
            Your mailbox is empty
          </p>
          <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
            Items will appear here when your creatures deliver them.
          </p>
        </div>
      )}

      {!isLoading && !error && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => {
            const typeConfig = ITEM_TYPES[item.item_type] || {
              icon: "📦",
              label: item.item_type,
              color: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
            };

            return (
              <div
                key={item.item_id}
                className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]"
              >
                {/* Icon */}
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
                  <span className="text-2xl">{typeConfig.icon}</span>
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeConfig.color}`}>
                      {typeConfig.label}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[rgba(16,25,21,0.6)]">
                    From <span className="font-semibold text-[rgba(16,25,21,0.8)]">{item.source_creature_name || "Unknown"}</span>
                    {item.source_creature_type && (
                      <>
                        <span className="mx-1">·</span>
                        <span className="text-[rgba(16,25,21,0.5)]">{item.source_creature_type}</span>
                      </>
                    )}
                  </p>
                </div>

                {/* Date */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-xs text-[rgba(16,25,21,0.5)]">{formatDate(item.delivered_at)}</p>
                </div>

                {/* Claim Button */}
                <div className="flex-shrink-0">
                  <button
                    onClick={() => handleClaimItem(item.item_id)}
                    disabled={isClaimBusy}
                    aria-label={`Claim ${typeConfig.label} from ${item.source_creature_name}`}
                    className="rounded-full border border-[rgba(45,93,49,0.35)] px-3 py-1.5 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {claimingItemId === item.item_id ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      "Claim"
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Capacity Warning */}
      {!isLoading && isFull && (
        <div className="rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-4">
          <p className="text-sm font-semibold text-[var(--ember)]">Mailbox is full!</p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
            Claim some items in Second Life to make room for new deliveries.
            When your mailbox is full, creatures will hold onto items until space is available.
          </p>
        </div>
      )}

      {!isLoading && !isFull && itemCount >= capacity * 0.8 && (
        <div className="rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-4">
          <p className="text-sm font-semibold text-[var(--ember)]">Mailbox almost full</p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
            Claim some items in Second Life to make room for new deliveries.
            When your mailbox is full, creatures will hold onto items until space is available.
          </p>
        </div>
      )}
    </div>
  );
}
