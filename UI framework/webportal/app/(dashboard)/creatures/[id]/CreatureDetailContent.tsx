"use client";

import { useState } from "react";
import {
  RefreshCw,
  AlertTriangle,
  PawPrint,
  Pencil,
  X,
  Check,
  Loader2,
  Skull,
  Sparkles,
} from "lucide-react";
import { useCreature } from "@/hooks/useCreature";
import { useUserContext } from "@/contexts/UserContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { getStatusLabel, STATUS_STYLES } from "@/components/ui/StatusBadge";
import { formatDate, formatLastUpdated } from "@/lib/format";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { use } from "react";
import {
  renameCreature,
  sendToGreatBeyond,
  type Creature,
  type SendToGreatBeyondResponse,
} from "@/lib/api";

function getDecorativeLabel(creature: Creature): string {
  if (creature.decorative_type === "forever") return "Forever Beautiful";
  if (creature.decorative_type === "eternalz") return "Eternal Life";
  if (creature.decorative_type === "babiez") return "Babiez";
  return "Yes";
}

function getDeliveryProgress(deliveryDays: number, deliveryInterval: number): number {
  const progress = ((deliveryInterval - deliveryDays) / deliveryInterval) * 100;
  return Math.max(0, Math.min(100, progress));
}

function canSendToBeyond(creature: Creature): boolean {
  if (creature.sent_to_beyond) return false;
  if (creature.is_decorative && creature.decorative_type === "eternalz") return false;
  if (creature.can_send_to_gb === false) return false;
  if (creature.breeding_status === "breeding") return false;
  return true;
}

// Alive non-decorative creatures show a destructive warning when sending to Great Beyond
function isAliveCreature(creature: Creature): boolean {
  return creature.is_alive && !creature.is_decorative;
}

function estimatePoints(
  creature: Creature,
  cfg: (key: string) => number | boolean
): string {
  const maxAge = cfg("creature_max_age") as number;
  if (creature.is_decorative) {
    if (creature.decorative_type === "forever")
      return Number(cfg("gb_points_forever")).toLocaleString();
    if (creature.decorative_type === "babiez")
      return String(cfg("gb_points_babiez"));
    return String(cfg("container_gb_points"));
  }
  if (creature.death_reason === "old_age")
    return String(Math.min(creature.age, maxAge));
  // Alive creatures sent voluntarily get age-based points
  if (creature.is_alive) return String(Math.min(creature.age, maxAge));
  return String(cfg("starvation_death_points"));
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="h-6 w-12 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
          <div className="space-y-2">
            <div className="h-8 w-32 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
            <div className="h-5 w-20 animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
          </div>
        </div>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-[rgba(16,25,21,0.08)] bg-white/95">
            <div className="h-64 w-full animate-pulse bg-[rgba(16,25,21,0.08)]" />
            <div className="space-y-4 p-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-full animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
                  <div className="h-2 w-full animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="h-96 animate-pulse rounded-3xl bg-[rgba(16,25,21,0.08)]" />
      </div>
    </div>
  );
}

export default function CreatureDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params as Promise<{ id: string }>);
  const [activeTab, setActiveTab] = useState<"stats" | "deliveries" | "breeding">(
    "stats"
  );
  const { ownerKey, refreshBalance } = useUserContext();
  const { cfg } = useGameConfig();

  const maxAge = cfg("creature_max_age") as number;
  const deliveryInterval = cfg("delivery_interval") as number;
  const endOfLifeAge = maxAge - 10;
  const memorialChance = cfg("memorial_chance") as number;
  const gbPointsForever = Number(cfg("gb_points_forever")).toLocaleString();

  const { creature, isLoading, isRefreshing, error, refetch, lastUpdated } =
    useCreature(resolvedParams.id, {
      refreshInterval: 60 * 1000,
    });

  const [isRenaming, setIsRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState("");
  const [renameLoading, setRenameLoading] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);

  const [showBeyondConfirm, setShowBeyondConfirm] = useState(false);
  const [beyondLoading, setBeyondLoading] = useState(false);
  const [beyondResult, setBeyondResult] = useState<SendToGreatBeyondResponse | null>(null);
  const [beyondError, setBeyondError] = useState<string | null>(null);

  const handleStartRename = () => {
    if (!creature) return;
    setRenameValue(creature.name);
    setRenameError(null);
    setIsRenaming(true);
  };

  const handleCancelRename = () => {
    setIsRenaming(false);
    setRenameValue("");
    setRenameError(null);
  };

  const handleSubmitRename = async () => {
    if (!creature || !ownerKey) return;
    const trimmed = renameValue.trim();
    if (!trimmed) {
      setRenameError("Name cannot be empty");
      return;
    }
    if (trimmed.length > 50) {
      setRenameError("Name must be 50 characters or less");
      return;
    }
    if (trimmed === creature.name) {
      setIsRenaming(false);
      return;
    }
    setRenameLoading(true);
    setRenameError(null);
    try {
      await renameCreature(creature.creature_id, trimmed, ownerKey);
      await refetch();
      setIsRenaming(false);
      setRenameValue("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to rename creature";
      setRenameError(message);
    } finally {
      setRenameLoading(false);
    }
  };

  const handleRenameKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmitRename();
    if (e.key === "Escape") handleCancelRename();
  };

  const handleSendToBeyond = async () => {
    if (!creature || !ownerKey) return;
    setBeyondLoading(true);
    setBeyondError(null);
    try {
      const result = await sendToGreatBeyond(creature.creature_id, ownerKey);
      setBeyondResult(result);
      setShowBeyondConfirm(false);
      await Promise.all([refetch(), refreshBalance()]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to send to Great Beyond";
      setBeyondError(message);
    } finally {
      setBeyondLoading(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error || !creature) {
    return (
      <div className="space-y-6">
        <Breadcrumbs items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Creatures", href: "/creatures" },
          { label: "Not Found" },
        ]} />
        <div className="rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--ember)]" />
            <p className="text-sm text-[rgba(16,25,21,0.8)]">
              {error || "Creature not found."}
            </p>
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

  const status = getStatusLabel(creature, endOfLifeAge);
  const deliveryProgress = getDeliveryProgress(creature.delivery_days, deliveryInterval);
  const halfLife = Math.round(maxAge / 2);

  const lifecycleSteps = creature.is_decorative
    ? [
        {
          title: "Birth",
          subtitle: `Creature was born on ${formatDate(creature.birth_date)}`,
          active: true,
        },
        {
          title: "Stats Frozen",
          subtitle:
            creature.decorative_type === "eternalz"
              ? "Eternal Life — this creature never ages or requires food"
              : "This is a decorative creature — its stats do not change over time",
          active: true,
        },
      ]
    : [
        {
          title: "Birth",
          subtitle: `Creature was born on ${formatDate(creature.birth_date)}`,
          active: true,
        },
        {
          title: `First Delivery (Day ${deliveryInterval})`,
          subtitle: `Creatures deliver items every ${deliveryInterval} days to your mailbox`,
          active: creature.age >= deliveryInterval,
        },
        {
          title: `Maturity (Day ${halfLife})`,
          subtitle: "Halfway through lifespan",
          active: creature.age >= halfLife,
        },
        {
          title: `End of Life (Day ${maxAge})`,
          subtitle: "Creature becomes inactive",
          active: creature.age >= maxAge || !creature.is_alive,
        },
      ];

  const deliveryInfo = [
    {
      label: "Next delivery",
      value: creature.is_alive
        ? `${creature.delivery_days} days`
        : "N/A",
    },
    {
      label: "Delivery progress",
      value: creature.is_alive ? `${Math.round(deliveryProgress)}%` : "N/A",
    },
    {
      label: "Status",
      value: creature.is_alive ? "Active" : "Inactive",
    },
  ];

  const breedingInfo = [
    {
      label: "Can Breed",
      value: creature.can_breed ? "Yes" : "No",
    },
    {
      label: "Breeding Status",
      value:
        creature.breeding_status === "ready"
          ? "Ready"
          : creature.breeding_status === "breeding"
          ? "Currently Breeding"
          : creature.breeding_status === "cooldown"
          ? `Cooldown (${creature.breeding_cooldown_days} days)`
          : creature.breeding_status === "too_young"
          ? "Too Young"
          : "Not Eligible",
    },
    {
      label: "Type",
      value: creature.is_decorative ? getDecorativeLabel(creature) : "Breedable",
    },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[
        { label: "Dashboard", href: "/dashboard" },
        { label: "Creatures", href: "/creatures" },
        { label: creature.name },
      ]} />

      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div>
            {isRenaming ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={handleRenameKeyDown}
                  maxLength={50}
                  autoFocus
                  aria-label="New creature name"
                  className="rounded-xl border border-[rgba(45,93,49,0.35)] bg-white px-3 py-1.5 font-display text-2xl focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[rgba(45,93,49,0.2)]"
                />
                <button
                  onClick={handleSubmitRename}
                  disabled={renameLoading}
                  aria-label="Confirm rename"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--moss)] text-white transition hover:bg-[var(--moss-strong)] disabled:opacity-50"
                >
                  {renameLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={handleCancelRename}
                  disabled={renameLoading}
                  aria-label="Cancel rename"
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(17,24,39,0.15)] text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="font-display text-3xl">{creature.name}</h1>
                <button
                  onClick={handleStartRename}
                  aria-label="Rename creature"
                  className="flex h-7 w-7 items-center justify-center rounded-full text-[rgba(16,25,21,0.4)] transition hover:bg-[rgba(16,25,21,0.08)] hover:text-[var(--moss)]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
            {renameError && (
              <p className="mt-1 text-xs text-[var(--ember)]">{renameError}</p>
            )}
            <div className="mt-2 flex items-center gap-2">
              <span className="inline-flex rounded-full bg-[rgba(47,91,72,0.12)] px-3 py-1 text-xs font-semibold text-[var(--moss)]">
                {creature.creature_type}
              </span>
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                  STATUS_STYLES[status] || STATUS_STYLES.Healthy
                }`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <span className="text-xs text-[rgba(16,25,21,0.5)]">
              Updated {formatLastUpdated(lastUpdated)}
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
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-[rgba(16,25,21,0.08)] bg-white/95">
            <div className="flex h-64 w-full items-center justify-center bg-gradient-to-br from-[rgba(45,93,49,0.15)] to-[rgba(218,165,32,0.15)]">
              {creature.is_alive ? (
                <PawPrint className={`h-16 w-16 text-[var(--moss)] ${creature.is_decorative ? "" : "animate-gentle-pulse"}`} />
              ) : (
                <PawPrint className="h-16 w-16 text-[rgba(17,24,39,0.2)]" />
              )}
            </div>
            <div className="space-y-4 p-5">
              {creature.is_decorative && (
                <div className={`flex items-center gap-2 rounded-xl p-3 text-xs font-medium ${
                  creature.decorative_type === "forever"
                    ? "bg-[rgba(218,165,32,0.1)] text-[rgba(178,135,20,1)]"
                    : creature.decorative_type === "eternalz"
                    ? "bg-[rgba(6,182,212,0.08)] text-[rgba(8,145,178,1)]"
                    : "bg-[rgba(17,24,39,0.05)] text-[rgba(17,24,39,0.6)]"
                }`}>
                  <span>
                    {creature.decorative_type === "forever"
                      ? "Stats frozen - Forever Beautiful creature"
                      : creature.decorative_type === "eternalz"
                      ? "Eternal Life - Never dies, stats frozen"
                      : "Decorative creature - Stats frozen"}
                  </span>
                </div>
              )}
              {creature.sent_to_beyond && (
                <div className="flex items-center gap-2 rounded-xl bg-[rgba(139,92,246,0.08)] p-3 text-xs font-medium text-[rgba(109,40,217,1)]">
                  <span>Sent to the Great Beyond</span>
                </div>
              )}

              <div className="space-y-3 text-xs text-[rgba(16,25,21,0.65)]">
                <div>
                  <div className="flex items-center justify-between">
                    <span>Age</span>
                    <span className="font-semibold text-[var(--moss)]">
                      {creature.age}{creature.is_decorative ? "" : `/${maxAge}`} days
                    </span>
                  </div>
                  <div className="mt-2 h-2 w-full rounded-full bg-[rgba(16,25,21,0.1)]">
                    <div
                      className="h-2 rounded-full bg-[var(--moss)]"
                      style={{
                        width: `${Math.min(
                          100,
                          (creature.age / maxAge) * 100
                        )}%`,
                      }}
                    />
                  </div>
                </div>
                {!creature.is_decorative && (
                  <div>
                    <div className="flex items-center justify-between">
                      <span>Munchiez</span>
                      <span className="font-semibold text-[var(--gold)]">
                        {creature.munchiez}%
                      </span>
                    </div>
                    <div className="mt-2 h-2 w-full rounded-full bg-[rgba(16,25,21,0.1)]">
                      <div
                        className="h-2 rounded-full bg-[var(--gold)]"
                        style={{ width: `${creature.munchiez}%` }}
                      />
                    </div>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between">
                    <span>Delivery</span>
                    <span className="font-semibold text-[rgb(196,107,46)]">
                      {creature.is_decorative ? "N/A" : `${Math.round(deliveryProgress)}%`}
                    </span>
                  </div>
                  {!creature.is_decorative && (
                    <div className="mt-2 h-2 w-full rounded-full bg-[rgba(16,25,21,0.1)]">
                      <div
                        className="h-2 rounded-full bg-[rgb(196,107,46)]"
                        style={{ width: `${deliveryProgress}%` }}
                      />
                    </div>
                  )}
                </div>
                <p className="pt-2 text-[rgba(16,25,21,0.55)]">
                  {creature.sent_to_beyond
                    ? "Sent to the Great Beyond"
                    : creature.is_decorative
                    ? creature.decorative_type === "forever"
                      ? `Forever Beautiful - Can send to Great Beyond for ${gbPointsForever} pts`
                      : creature.decorative_type === "eternalz"
                      ? `Eternal Life - Cannot be sent to Great Beyond`
                      : "Decorative creature"
                    : creature.is_alive
                    ? `Next delivery in ${creature.delivery_days} days`
                    : `Died from ${creature.death_reason?.replace("_", " ")}`}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-5">
            <h3 className="text-lg font-semibold">Quick Info</h3>
            <div className="mt-4 space-y-3 text-sm text-[rgba(16,25,21,0.7)]">
              <div className="flex items-center justify-between">
                <span>UUID</span>
                <span className="max-w-[120px] truncate font-mono text-xs font-semibold">
                  {creature.creature_id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Birth Date</span>
                <span className="font-semibold">
                  {formatDate(creature.birth_date)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Type</span>
                <span className="font-semibold">{creature.creature_type}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Decorative</span>
                <span className={`font-semibold ${
                  creature.decorative_type === "forever" ? "text-[rgba(178,135,20,1)]" :
                  creature.decorative_type === "eternalz" ? "text-[rgba(8,145,178,1)]" : ""
                }`}>
                  {creature.is_decorative ? getDecorativeLabel(creature) : "No"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Alive</span>
                <span className="font-semibold">
                  {creature.is_alive ? "Yes" : "No"}
                </span>
              </div>
              {creature.sent_to_beyond && (
                <div className="flex items-center justify-between">
                  <span>Great Beyond</span>
                  <span className="font-semibold text-[rgba(109,40,217,1)]">Sent</span>
                </div>
              )}
              {creature.can_send_to_gb && creature.is_decorative && !creature.sent_to_beyond && (
                <div className="flex items-center justify-between">
                  <span>Great Beyond</span>
                  <span className="font-semibold text-[var(--moss)]">Eligible ({gbPointsForever} pts)</span>
                </div>
              )}
            </div>
          </div>

          {creature && canSendToBeyond(creature) && !beyondResult && (
            <div className="rounded-3xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.15)] text-[rgba(109,40,217,1)]">
                  <Skull className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[rgba(109,40,217,1)]">
                    Send to Great Beyond
                  </h3>
                  <p className="text-xs text-[rgba(16,25,21,0.6)]">
                    Earn {estimatePoints(creature, cfg)} GBP
                    {!creature.is_decorative && (creature.death_reason === "old_age" || creature.is_alive)
                      ? ` (${creature.age} days lived)`
                      : ""}
                  </p>
                </div>
              </div>
              {beyondError && (
                <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgba(196,107,46,0.12)] p-2 text-xs text-[var(--ember)]">
                  <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                  {beyondError}
                </div>
              )}
              <button
                onClick={() => setShowBeyondConfirm(true)}
                className="mt-4 w-full rounded-full border border-[rgba(139,92,246,0.4)] px-4 py-2 text-xs font-semibold text-[rgba(109,40,217,1)] transition hover:bg-[rgba(139,92,246,0.12)]"
              >
                Send to Great Beyond
              </button>
            </div>
          )}

          {beyondResult && (
            <div className="rounded-3xl border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.08)] p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.15)] text-[rgba(109,40,217,1)]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h3 className="text-sm font-semibold text-[rgba(109,40,217,1)]">
                  Sent to the Great Beyond!
                </h3>
              </div>
              <div className="mt-4 space-y-2 text-sm text-[rgba(16,25,21,0.7)]">
                <div className="flex justify-between">
                  <span>Points Earned</span>
                  <span className="font-semibold text-[rgba(109,40,217,1)]">
                    +{beyondResult.points_awarded} GBP
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Total Points</span>
                  <span className="font-semibold">
                    {beyondResult.total_points.toLocaleString()} GBP
                  </span>
                </div>
                {beyondResult.memorial_won && (
                  <div className="mt-3 rounded-xl bg-[rgba(218,165,32,0.15)] p-3">
                    <p className="text-xs font-semibold text-[var(--ember)]">
                      Memorial Won!{" "}
                      {beyondResult.memorial_type === "headstone"
                        ? "Headstone"
                        : "Casket"}
                    </p>
                    <p className="mt-1 text-xs text-[rgba(16,25,21,0.6)]">
                      {beyondResult.memorial_delivered
                        ? "Delivered to your mailbox!"
                        : "Will be delivered when mailbox has space."}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-5">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { id: "stats", label: "Stats" },
                ...(!creature.is_decorative
                  ? [{ id: "deliveries", label: "Deliveries" }]
                  : []),
                { id: "breeding", label: "Breeding" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  className={`rounded-full px-4 py-2 text-xs font-semibold ${
                    activeTab === tab.id
                      ? "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                      : "text-[rgba(16,25,21,0.6)] hover:bg-[rgba(16,25,21,0.05)]"
                  }`}
                  onClick={() =>
                    setActiveTab(tab.id as "stats" | "deliveries" | "breeding")
                  }
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 space-y-4">
              {activeTab === "stats" && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Creature Lifecycle</h3>
                  <div className="space-y-4">
                    {lifecycleSteps.map((step) => (
                      <div key={step.title} className="flex gap-3">
                        <span
                          className={`mt-1 h-3 w-3 rounded-full ${
                            step.active
                              ? "bg-[var(--moss)]"
                              : "bg-[rgba(16,25,21,0.2)]"
                          }`}
                        />
                        <div>
                          <p className="text-sm font-semibold">{step.title}</p>
                          <p className="text-xs text-[rgba(16,25,21,0.6)]">
                            {step.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.08)] p-4 text-sm text-[rgba(17,24,39,0.7)]">
                    Live data from Second Life. Updates occur when your creature
                    is active in-world. Auto-refreshes every minute.
                  </div>
                </div>
              )}

              {activeTab === "deliveries" && (
                <div className="space-y-3">
                  {deliveryInfo.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-[rgba(16,25,21,0.04)] p-3 text-sm"
                    >
                      <span className="text-[rgba(16,25,21,0.6)]">
                        {item.label}
                      </span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "breeding" && (
                <div className="space-y-3">
                  {breedingInfo.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-xl bg-[rgba(16,25,21,0.04)] p-3 text-sm"
                    >
                      <span className="text-[rgba(16,25,21,0.6)]">
                        {item.label}
                      </span>
                      <span className="font-semibold">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.08)] p-4 text-sm text-[rgba(17,24,39,0.7)]">
            AWS integration active. Creature stats, deliveries, and transactions
            are validated server-side. Last sync{" "}
            {formatLastUpdated(lastUpdated)}.
          </div>
        </div>
      </div>

      {showBeyondConfirm && creature && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-3xl border border-[rgba(139,92,246,0.2)] bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(139,92,246,0.15)] text-[rgba(109,40,217,1)]">
                <Skull className="h-5 w-5" />
              </div>
              <h3 className="font-display text-xl font-semibold">
                Send to Great Beyond
              </h3>
            </div>

            <div className="mt-4 space-y-3 text-sm text-[rgba(16,25,21,0.7)]">
              <p>
                Are you sure you want to send{" "}
                <span className="font-semibold text-[rgba(16,25,21,0.9)]">
                  {creature.name}
                </span>{" "}
                ({creature.creature_type}) to the Great Beyond?
              </p>

              <div className="rounded-xl bg-[rgba(139,92,246,0.06)] p-3">
                <div className="flex justify-between">
                  <span>Estimated Points</span>
                  <span className="font-semibold text-[rgba(109,40,217,1)]">
                    +{estimatePoints(creature, cfg)} GBP
                  </span>
                </div>
                {!creature.is_decorative && creature.death_reason === "old_age" && (
                  <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
                    {memorialChance}% chance to win a memorial (headstone or casket)
                  </p>
                )}
              </div>

              {isAliveCreature(creature) && (
                <div className="flex items-start gap-2 rounded-xl bg-[rgba(220,38,38,0.08)] p-3">
                  <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-600" />
                  <p className="text-xs font-semibold text-red-600">
                    This creature is still alive. Sending it will end its life
                    permanently. This cannot be undone.
                  </p>
                </div>
              )}

              <div className="flex items-start gap-2 rounded-xl bg-[rgba(196,107,46,0.08)] p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--ember)]" />
                <p className="text-xs text-[var(--ember)]">
                  This action cannot be undone. The creature will be permanently
                  sent to the Great Beyond.
                </p>
              </div>
            </div>

            {beyondError && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-[rgba(196,107,46,0.12)] p-2 text-xs text-[var(--ember)]">
                <AlertTriangle className="h-3.5 w-3.5 flex-shrink-0" />
                {beyondError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  setShowBeyondConfirm(false);
                  setBeyondError(null);
                }}
                disabled={beyondLoading}
                className="flex-1 rounded-full border border-[rgba(17,24,39,0.15)] px-4 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSendToBeyond}
                disabled={beyondLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[rgba(109,40,217,1)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(91,33,182,1)] disabled:opacity-50"
              >
                {beyondLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Confirm"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
