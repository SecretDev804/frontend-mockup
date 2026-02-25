"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Package, Utensils, Users, Clock, AlertTriangle, Info, MapPin, RefreshCw, Heart, Sparkles, CheckCircle2, Zap, Shield, Star } from "lucide-react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import InventoryFilters from "@/components/inventory/InventoryFilters";
import Pagination from "@/components/ui/Pagination";
import type { FoodItem, PedestalItem, BoosterItem, BoosterType } from "@/lib/api";
import { useCountdown } from "@/hooks/useCountdown";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { formatTimeAgo, formatLastUpdated } from "@/lib/format";

const ACCESS_MODE_LABELS: Record<string, { label: string; color: string }> = {
  owner: { label: "Owner Only", color: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]" },
  all: { label: "Public", color: "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]" },
  group: { label: "Group", color: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]" },
};

const PEDESTAL_STATUS_CONFIG: Record<string, { label: string; color: string; bgColor: string; icon: typeof Heart }> = {
  available: {
    label: "Available",
    color: "text-[var(--moss)]",
    bgColor: "bg-[rgba(45,93,49,0.12)]",
    icon: Heart
  },
  breeding: {
    label: "Breeding",
    color: "text-[var(--ember)]",
    bgColor: "bg-[rgba(218,165,32,0.22)]",
    icon: Sparkles
  },
  consumed: {
    label: "Decorative",
    color: "text-[rgba(17,24,39,0.5)]",
    bgColor: "bg-[rgba(17,24,39,0.08)]",
    icon: CheckCircle2
  },
};

const BOOSTER_TYPE_CONFIG: Record<BoosterType, {
  label: string;
  description: string;
  color: string;
  bgColor: string;
  iconBg: string;
  icon: typeof Zap;
}> = {
  resurrect: {
    label: "Resurrect Booster",
    description: "Revives creatures that died from starvation",
    color: "text-[var(--moss)]",
    bgColor: "bg-[rgba(45,93,49,0.12)]",
    iconBg: "bg-gradient-to-br from-[rgba(45,93,49,0.15)] to-[rgba(34,197,94,0.1)]",
    icon: Shield,
  },
  forever: {
    label: "Forever Booster",
    description: "Transforms dead creatures into Forever Beautiful decorative",
    color: "text-[rgba(178,135,20,1)]",
    bgColor: "bg-[rgba(218,165,32,0.15)]",
    iconBg: "bg-gradient-to-br from-[rgba(218,165,32,0.2)] to-[rgba(245,158,11,0.1)]",
    icon: Star,
  },
  eternalz: {
    label: "Eternalz Potion",
    description: "Grants eternal life - creature never dies",
    color: "text-[rgba(8,145,178,1)]",
    bgColor: "bg-[rgba(6,182,212,0.12)]",
    iconBg: "bg-gradient-to-br from-[rgba(6,182,212,0.15)] to-[rgba(14,165,233,0.1)]",
    icon: Zap,
  },
};

function LoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-24 rounded bg-gray-200" />
              <div className="h-3 w-32 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-2 w-full rounded-full bg-gray-200" />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="h-3 w-20 rounded bg-gray-200" />
            <div className="h-3 w-16 rounded bg-gray-200" />
          </div>
        </div>
      ))}
    </div>
  );
}

function PedestalLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-pink-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-100 p-3">
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-3 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function SummarySkeleton() {
  return (
    <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
          <div className="h-8 w-12 rounded bg-gray-200" />
          <div className="mt-2 h-3 w-16 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function InventoryPageSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <h1 className="font-display text-3xl">Inventory</h1>
        <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">Loading...</p>
        <SummarySkeleton />
      </header>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Heart className="h-5 w-5 text-pink-500" />
          <h2 className="text-lg font-semibold">Heart Pedestals</h2>
        </div>
        <PedestalLoadingSkeleton />
      </section>
      <section>
        <div className="mb-4 flex items-center gap-2">
          <Utensils className="h-5 w-5 text-[var(--moss)]" />
          <h2 className="text-lg font-semibold">Food Items</h2>
        </div>
        <LoadingSkeleton />
      </section>
    </div>
  );
}

function FoodCard({ food }: { food: FoodItem }) {
  const accessConfig = ACCESS_MODE_LABELS[food.access_mode] || ACCESS_MODE_LABELS.owner;
  const fillPercentage = (food.remaining_feedings / food.total_feedings) * 100;

  let progressColor = "bg-[var(--moss)]";
  if (fillPercentage <= 20) progressColor = "bg-[var(--ember)]";
  else if (fillPercentage <= 50) progressColor = "bg-[rgba(218,165,32,0.8)]";

  const progressAriaLabel = `${food.remaining_feedings} of ${food.total_feedings} feedings remaining`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/95 p-5 transition ${
        food.is_depleted
          ? "border-[rgba(17,24,39,0.12)] opacity-60"
          : food.is_active
          ? "border-[rgba(16,25,21,0.08)] hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]"
          : "border-[rgba(17,24,39,0.12)] opacity-75"
      }`}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        {food.is_depleted && (
          <span className="rounded-full bg-[rgba(17,24,39,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(17,24,39,0.6)]">
            Depleted
          </span>
        )}
        {!food.is_active && !food.is_depleted && (
          <span className="rounded-full bg-[rgba(17,24,39,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(17,24,39,0.6)]">
            In Storage
          </span>
        )}
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${accessConfig.color}`}>
          {accessConfig.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
          <Utensils className="h-6 w-6 text-[var(--moss)]" />
        </div>
        <div>
          <h3 className="font-semibold text-[rgba(16,25,21,0.9)]">{food.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[rgba(16,25,21,0.5)]">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {food.sl_region}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[rgba(16,25,21,0.6)]">Remaining Feedings</span>
          <span className="font-semibold text-[rgba(16,25,21,0.8)]">
            {food.remaining_feedings} / {food.total_feedings}
          </span>
        </div>
        <div
          role="progressbar"
          aria-valuenow={food.remaining_feedings}
          aria-valuemin={0}
          aria-valuemax={food.total_feedings}
          aria-label={progressAriaLabel}
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(16,25,21,0.08)]"
        >
          <div
            className={`h-full rounded-full transition-all ${progressColor}`}
            style={{ width: `${fillPercentage}%` }}
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.6)]">
          <Users className="h-3.5 w-3.5" aria-hidden="true" />
          <span>Fed {food.creatures_fed_count} creatures</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.6)]">
          <Clock className="h-3.5 w-3.5" aria-hidden="true" />
          <span>{formatTimeAgo(food.last_feeding_at)}</span>
        </div>
      </div>

      {food.remaining_feedings <= 2 && food.remaining_feedings > 0 && (
        <div className="mt-4 flex items-center gap-2 rounded-lg bg-[rgba(196,107,46,0.1)] px-3 py-2">
          <AlertTriangle className="h-4 w-4 text-[var(--ember)]" aria-hidden="true" />
          <span className="text-xs font-medium text-[var(--ember)]">Running low on food</span>
        </div>
      )}
    </div>
  );
}

function PedestalCard({ pedestal }: { pedestal: PedestalItem }) {
  const statusConfig = PEDESTAL_STATUS_CONFIG[pedestal.status] ?? PEDESTAL_STATUS_CONFIG.available;
  const { cfg } = useGameConfig();
  const breedingDurationMs = (cfg("breeding_duration_days") as number) * 86400000;
  const countdown = useCountdown(pedestal.breeding_info?.end_date, breedingDurationMs);

  const countdownString = countdown.isComplete
    ? "Ready!"
    : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`;

  const breedingProgressAriaLabel = `Breeding ${Math.round(countdown.progress)}% complete, ${countdownString} remaining`;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/95 p-5 transition ${
        pedestal.status === "consumed"
          ? "border-[rgba(17,24,39,0.12)] opacity-60"
          : pedestal.status === "breeding"
          ? "border-[rgba(218,165,32,0.3)] hover:border-[rgba(218,165,32,0.5)] hover:shadow-[0_4px_12px_rgba(218,165,32,0.1)]"
          : "border-[rgba(16,25,21,0.08)] hover:border-[rgba(45,93,49,0.3)] hover:shadow-[0_4px_12px_rgba(45,93,49,0.08)]"
      }`}
    >
      <div className="absolute right-4 top-4">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusConfig.bgColor} ${statusConfig.color}`}>
          {statusConfig.label}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
          pedestal.status === "available"
            ? "bg-gradient-to-br from-[rgba(236,72,153,0.15)] to-[rgba(45,93,49,0.1)]"
            : pedestal.status === "breeding"
            ? "bg-gradient-to-br from-[rgba(236,72,153,0.2)] to-[rgba(218,165,32,0.15)]"
            : "bg-[rgba(17,24,39,0.06)]"
        }`}>
          <Heart className={`h-6 w-6 ${
            pedestal.status === "available"
              ? "text-pink-500"
              : pedestal.status === "breeding"
              ? "text-[var(--ember)]"
              : "text-[rgba(17,24,39,0.4)]"
          }`} fill={pedestal.status === "consumed" ? "currentColor" : "none"} aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-[rgba(16,25,21,0.9)]">{pedestal.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[rgba(16,25,21,0.5)]">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {pedestal.sl_region}
          </p>
        </div>
      </div>

      {pedestal.status === "breeding" && pedestal.breeding_info && (
        <div className="mt-4 rounded-xl bg-[rgba(218,165,32,0.08)] p-3">
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--ember)]">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Breeding in progress</span>
          </div>
          <div className="mt-2 space-y-2">
            <p className="text-xs text-[rgba(16,25,21,0.7)]">
              <span className="font-medium">{pedestal.breeding_info.parent1_name}</span>
              {" + "}
              <span className="font-medium">{pedestal.breeding_info.parent2_name}</span>
            </p>

            <div
              role="progressbar"
              aria-valuenow={Math.round(countdown.progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={breedingProgressAriaLabel}
              className="h-2 w-full overflow-hidden rounded-full bg-[rgba(218,165,32,0.2)]"
            >
              <div
                className="h-full rounded-full bg-[var(--ember)] transition-all duration-1000"
                style={{ width: `${countdown.progress}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`font-medium ${countdown.isComplete ? "text-[var(--moss)]" : "text-[rgba(16,25,21,0.6)]"}`}>
                {countdownString}
              </span>
              <span className="font-semibold text-[var(--ember)]">
                {pedestal.breeding_info.success_rate}% success rate
              </span>
            </div>
          </div>
        </div>
      )}

      {pedestal.status === "consumed" && pedestal.consumed_at && (
        <div className="mt-4 rounded-xl bg-[rgba(17,24,39,0.04)] p-3">
          <div className="flex items-center gap-2 text-xs text-[rgba(17,24,39,0.5)]">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>Used for breeding • Now decorative</span>
          </div>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.4)]">
            Consumed {formatTimeAgo(pedestal.consumed_at)}
          </p>
        </div>
      )}

      {pedestal.status === "available" && (
        <div className="mt-4 rounded-xl bg-[rgba(45,93,49,0.06)] p-3">
          <div className="flex items-center gap-2 text-xs text-[var(--moss)]">
            <Heart className="h-3.5 w-3.5" aria-hidden="true" />
            <span className="font-medium">Ready for breeding</span>
          </div>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
            {cfg("babiez_chance_pedestal") as number}% success rate when used for breeding
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Added {formatTimeAgo(pedestal.created_at)}</span>
      </div>
    </div>
  );
}

function BoosterLoadingSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {[1, 2, 3].map((i) => (
        <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-5">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl bg-cyan-100" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-gray-200" />
              <div className="h-3 w-24 rounded bg-gray-200" />
            </div>
          </div>
          <div className="mt-4 rounded-xl bg-gray-100 p-3">
            <div className="h-3 w-full rounded bg-gray-200" />
          </div>
          <div className="mt-4 h-3 w-24 rounded bg-gray-200" />
        </div>
      ))}
    </div>
  );
}

function BoosterCard({ booster }: { booster: BoosterItem }) {
  const typeConfig = BOOSTER_TYPE_CONFIG[booster.booster_type as BoosterType] ?? {
    label: booster.booster_type,
    description: "",
    color: "text-[rgba(17,24,39,0.6)]",
    bgColor: "bg-[rgba(17,24,39,0.08)]",
    iconBg: "bg-[rgba(17,24,39,0.08)]",
    icon: Zap,
  };
  const IconComponent = typeConfig.icon;
  const isConsumed = booster.status === "consumed";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/95 p-5 transition ${
        isConsumed
          ? "border-[rgba(17,24,39,0.12)] opacity-60"
          : "border-[rgba(16,25,21,0.08)] hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]"
      }`}
    >
      <div className="absolute right-4 top-4 flex gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
          isConsumed
            ? "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.5)]"
            : `${typeConfig.bgColor} ${typeConfig.color}`
        }`}>
          {isConsumed ? "Consumed" : "Active"}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${
          isConsumed ? "bg-[rgba(17,24,39,0.06)]" : typeConfig.iconBg
        }`}>
          <IconComponent className={`h-6 w-6 ${
            isConsumed ? "text-[rgba(17,24,39,0.4)]" : typeConfig.color
          }`} aria-hidden="true" />
        </div>
        <div>
          <h3 className="font-semibold text-[rgba(16,25,21,0.9)]">{typeConfig.label}</h3>
          <p className="flex items-center gap-1 text-xs text-[rgba(16,25,21,0.5)]">
            <MapPin className="h-3 w-3" aria-hidden="true" />
            {booster.sl_region}
          </p>
        </div>
      </div>

      {isConsumed && booster.target_creature_name && (
        <div className="mt-4 rounded-xl bg-[rgba(17,24,39,0.04)] p-3">
          <div className="flex items-center gap-2 text-xs text-[rgba(17,24,39,0.5)]">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
            <span>
              Used on <span className="font-medium text-[rgba(16,25,21,0.7)]">{booster.target_creature_name}</span>
            </span>
          </div>
          {booster.consumed_at && (
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.4)]">
              {formatTimeAgo(booster.consumed_at)}
            </p>
          )}
        </div>
      )}

      {!isConsumed && (
        <div className={`mt-4 rounded-xl p-3 ${
          booster.booster_type === "resurrect"
            ? "bg-[rgba(45,93,49,0.06)]"
            : booster.booster_type === "forever"
            ? "bg-[rgba(218,165,32,0.06)]"
            : "bg-[rgba(6,182,212,0.06)]"
        }`}>
          <p className={`text-xs font-medium ${typeConfig.color}`}>
            {typeConfig.description}
          </p>
        </div>
      )}

      <div className="mt-4 flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
        <Clock className="h-3.5 w-3.5" aria-hidden="true" />
        <span>Added {formatTimeAgo(booster.created_at)}</span>
      </div>
    </div>
  );
}

function InventoryPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { cfg } = useGameConfig();

  const {
    foodItems,
    summary,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetch,
    pagination,
    page,
    pageSize,
    setPage,
    setPageSize,
    pedestals,
    pedestalSummary,
    pedestalLoading,
    pedestalError,
    refetchPedestals,
    boosters,
    boosterSummary,
    boosterLoading,
    boosterError,
    refetchBoosters,
  } = useInventoryContext();

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

  const handleRefresh = async () => {
    await Promise.all([refetch(), refetchPedestals(), refetchBoosters()]);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Inventory</h1>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              Manage your food items, heart pedestals, boosters, and supplies
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              disabled={isLoading || isRefreshing || pedestalLoading || boosterLoading}
              className="flex items-center gap-2 rounded-full border border-[rgba(17,24,39,0.1)] px-3 py-2 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} aria-hidden="true" />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {(isLoading && pedestalLoading) ? (
          <SummarySkeleton />
        ) : (
          <div className="mt-6">
            <div className="mb-3 flex items-center gap-2">
              <Utensils className="h-4 w-4 text-[var(--moss)]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[rgba(16,25,21,0.6)]">Food Items</span>
            </div>
            {summary && (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-[rgba(45,93,49,0.08)] p-4">
                  <p className="text-2xl font-semibold text-[var(--moss)]">{summary.total}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Total Food</p>
                </div>
                <div className="rounded-2xl bg-[rgba(45,93,49,0.08)] p-4">
                  <p className="text-2xl font-semibold text-[var(--moss)]">{summary.active}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Active</p>
                </div>
                <div className="rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                  <p className="text-2xl font-semibold text-[rgba(17,24,39,0.6)]">{summary.inStorage}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">In Storage</p>
                </div>
                <div className="rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                  <p className="text-2xl font-semibold text-[rgba(17,24,39,0.6)]">{summary.depleted}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Depleted</p>
                </div>
              </div>
            )}

            <div className="mb-3 mt-5 flex items-center gap-2">
              <Heart className="h-4 w-4 text-pink-500" aria-hidden="true" />
              <span className="text-xs font-semibold text-[rgba(16,25,21,0.6)]">Heart Pedestals</span>
            </div>
            {pedestalSummary ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl bg-[rgba(236,72,153,0.08)] p-4">
                  <p className="text-2xl font-semibold text-pink-600">{pedestalSummary.total}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Total Pedestals</p>
                </div>
                <div className="rounded-2xl bg-[rgba(45,93,49,0.08)] p-4">
                  <p className="text-2xl font-semibold text-[var(--moss)]">{pedestalSummary.available}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Available</p>
                </div>
                <div className="rounded-2xl bg-[rgba(218,165,32,0.12)] p-4">
                  <p className="text-2xl font-semibold text-[var(--ember)]">{pedestalSummary.breeding}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Breeding</p>
                </div>
                <div className="rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                  <p className="text-2xl font-semibold text-[rgba(17,24,39,0.6)]">{pedestalSummary.consumed}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Decorative</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                    <div className="h-8 w-12 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-16 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            )}

            <div className="mb-3 mt-5 flex items-center gap-2">
              <Zap className="h-4 w-4 text-[rgba(8,145,178,1)]" aria-hidden="true" />
              <span className="text-xs font-semibold text-[rgba(16,25,21,0.6)]">Boosters & Potions</span>
            </div>
            {boosterSummary ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-[rgba(6,182,212,0.08)] p-4">
                  <p className="text-2xl font-semibold text-[rgba(8,145,178,1)]">{boosterSummary.total}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Total Boosters</p>
                </div>
                <div className="rounded-2xl bg-[rgba(45,93,49,0.08)] p-4">
                  <p className="text-2xl font-semibold text-[var(--moss)]">{boosterSummary.active}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Active</p>
                </div>
                <div className="rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                  <p className="text-2xl font-semibold text-[rgba(17,24,39,0.6)]">{boosterSummary.consumed}</p>
                  <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">Consumed</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-2xl bg-[rgba(17,24,39,0.05)] p-4">
                    <div className="h-8 w-12 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-16 rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {lastUpdated && !isLoading && (
          <p className="mt-4 text-xs text-[rgba(16,25,21,0.4)]">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        )}
      </header>

      {error && !isLoading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
          <p className="mt-2 font-semibold text-red-700">Failed to load inventory</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      )}

      <section aria-labelledby="pedestals-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-pink-500" aria-hidden="true" />
            <h2 id="pedestals-heading" className="text-lg font-semibold">Heart Pedestals</h2>
            {!pedestalLoading && (
              <span className="rounded-full bg-[rgba(236,72,153,0.12)] px-2 py-0.5 text-xs font-semibold text-pink-600">
                {pedestals.length}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[rgba(236,72,153,0.2)] bg-[rgba(236,72,153,0.04)] p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-pink-500" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-pink-600">About Heart Pedestals</p>
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
              Heart Pedestals increase breeding success rate to {cfg("babiez_chance_pedestal") as number}%. Each pedestal can only be used once
              and becomes decorative after successful breeding. Place two creatures on the pedestal in Second Life to start breeding.
            </p>
          </div>
        </div>

        {pedestalLoading && <PedestalLoadingSkeleton />}

        {pedestalError && !pedestalLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
            <p className="mt-2 font-semibold text-red-700">Failed to load pedestals</p>
            <p className="mt-1 text-sm text-red-600">{pedestalError}</p>
            <button
              onClick={refetchPedestals}
              className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!pedestalLoading && !pedestalError && pedestals.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[rgba(236,72,153,0.3)] bg-white/70 p-12 text-center">
            <Heart className="mx-auto h-12 w-12 text-[rgba(236,72,153,0.3)]" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No Heart Pedestals found
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Rez Heart Pedestals in Second Life to see them here.
            </p>
          </div>
        )}

        {!pedestalLoading && !pedestalError && pedestals.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {pedestals.map((pedestal) => (
              <PedestalCard key={pedestal.pedestal_id} pedestal={pedestal} />
            ))}
          </div>
        )}
      </section>

      <section aria-labelledby="boosters-heading">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-[rgba(8,145,178,1)]" aria-hidden="true" />
            <h2 id="boosters-heading" className="text-lg font-semibold">Boosters & Potions</h2>
            {!boosterLoading && (
              <span className="rounded-full bg-[rgba(6,182,212,0.12)] px-2 py-0.5 text-xs font-semibold text-[rgba(8,145,178,1)]">
                {boosters.length}
              </span>
            )}
          </div>
        </div>

        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[rgba(6,182,212,0.2)] bg-[rgba(6,182,212,0.04)] p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[rgba(8,145,178,1)]" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[rgba(8,145,178,1)]">About Boosters & Potions</p>
            <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
              Boosters and potions are single-use items. Resurrect Boosters revive starved creatures,
              Forever Boosters transform dead creatures into decorative items, and Eternalz Potions grant
              eternal life. Each item is consumed after use.
            </p>
          </div>
        </div>

        {boosterLoading && <BoosterLoadingSkeleton />}

        {boosterError && !boosterLoading && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertTriangle className="mx-auto h-8 w-8 text-red-500" aria-hidden="true" />
            <p className="mt-2 font-semibold text-red-700">Failed to load boosters</p>
            <p className="mt-1 text-sm text-red-600">{boosterError}</p>
            <button
              onClick={refetchBoosters}
              className="mt-4 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
            >
              Try Again
            </button>
          </div>
        )}

        {!boosterLoading && !boosterError && boosters.length === 0 && (
          <div className="rounded-2xl border border-dashed border-[rgba(6,182,212,0.3)] bg-white/70 p-12 text-center">
            <Zap className="mx-auto h-12 w-12 text-[rgba(6,182,212,0.3)]" aria-hidden="true" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No boosters or potions found
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Rez booster items in Second Life to see them here.
            </p>
          </div>
        )}

        {!boosterLoading && !boosterError && boosters.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2">
            {boosters.map((booster) => (
              <BoosterCard key={booster.booster_id} booster={booster} />
            ))}
          </div>
        )}
      </section>

      {!error && (
        <section aria-labelledby="food-heading">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Utensils className="h-5 w-5 text-[var(--moss)]" aria-hidden="true" />
              <h2 id="food-heading" className="text-lg font-semibold">Food Items</h2>
              {!isLoading && summary && (
                <span className="rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-xs font-semibold text-[var(--moss)]">
                  {summary.total}
                </span>
              )}
            </div>
          </div>

          {!isLoading && (
            <div className="mb-4 rounded-2xl bg-white/90 p-4 shadow-[0_4px_12px_rgba(16,25,21,0.04)]">
              <InventoryFilters />
            </div>
          )}

          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[var(--moss)]">About Food Items</p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
                Each food item has {cfg("food_item_feedings") as number} feedings and restores {cfg("food_feeding_amount") as number} munchiez per feeding.
                Creatures must be within {cfg("food_feeding_range") as number} meters to eat. Food can be purchased with Great Beyond Points ({Number(cfg("food_cost_gbp")).toLocaleString()} GBP each).
              </p>
            </div>
          </div>

          {isLoading && <LoadingSkeleton />}

          {!isLoading && foodItems.length === 0 && (
            <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-12 text-center">
              <Package className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.25)]" aria-hidden="true" />
              <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
                No food items found
              </p>
              <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
                Rez food items in Second Life to see them here, or adjust your filters.
              </p>
            </div>
          )}

          {!isLoading && foodItems.length > 0 && (
            <>
              <div className={`grid gap-4 sm:grid-cols-2 ${isRefreshing ? "opacity-60" : ""}`}>
                {foodItems.map((food) => (
                  <FoodCard key={food.food_id} food={food} />
                ))}
              </div>

              {pagination && pagination.totalPages > 1 && (
                <div className="mt-6 rounded-2xl bg-white/90 p-4 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
                  <Pagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                    pageSize={pagination.pageSize}
                    totalItems={pagination.totalItems}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    isLoading={isRefreshing}
                    ariaLabel="Food items pagination"
                  />
                </div>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}

// Wrap in Suspense for useSearchParams (required by Next.js App Router)
export default function InventoryContent() {
  return (
    <Suspense fallback={<InventoryPageSkeleton />}>
      <InventoryPageContent />
    </Suspense>
  );
}
