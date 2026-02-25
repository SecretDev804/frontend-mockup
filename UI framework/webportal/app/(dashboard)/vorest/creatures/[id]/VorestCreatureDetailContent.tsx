"use client";

import { useState, useMemo, useRef, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  PawPrint,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  UtensilsCrossed,
  Heart,
  Sparkles,
  Shield,
  Crown,
  ArrowLeftRight,
  Check,
  X,
  Loader2,
} from "lucide-react";
import { useVorestContext } from "@/contexts/VorestContext";
import { useUserContext } from "@/contexts/UserContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { getStatusLabel, STATUS_STYLES } from "@/components/ui/StatusBadge";
import {
  consumeVorestFood,
  applyVorestBooster,
  startVorestBreeding,
  retrieveCreatureFromVorest,
  type Creature,
  type VorestFoodItem,
  type VorestBooster,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type DetailTab = "stats" | "feed" | "breed" | "actions";

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-4 w-48 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
          <div className="space-y-2">
            <div className="h-8 w-40 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
            <div className="h-4 w-24 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
          </div>
        </div>
      </header>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-9 w-20 animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
        ))}
      </div>
      <div className="h-96 animate-pulse rounded-3xl bg-[rgba(16,25,21,0.08)]" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Confirm Modal (generic)
// ---------------------------------------------------------------------------

function ConfirmModal({
  title,
  description,
  confirmLabel,
  isProcessing,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,25,21,0.2)]"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-start justify-between">
          <h2 className="font-semibold text-[rgba(16,25,21,0.85)]">{title}</h2>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(17,24,39,0.4)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-[rgba(16,25,21,0.6)]">
          {description}
        </p>
        <div className="mt-5 flex gap-3">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="flex-1 rounded-full border border-[rgba(17,24,39,0.12)] px-4 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {confirmLabel}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stats Tab
// ---------------------------------------------------------------------------

function StatsTab({ creature, maxAge }: { creature: Creature; maxAge: number }) {
  const munchiez = creature.munchiez;
  const agePercent = Math.min((creature.age / maxAge) * 100, 100);

  const stats = [
    { label: "Age", value: `${creature.age} days`, percent: agePercent },
    ...(creature.is_alive && !creature.is_decorative
      ? [{ label: "Munchiez", value: `${munchiez}%`, percent: munchiez }]
      : []),
  ];

  return (
    <div className="space-y-6">
      {/* Progress bars */}
      {stats.map((stat) => (
        <div key={stat.label}>
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-[rgba(16,25,21,0.7)]">{stat.label}</span>
            <span className="font-semibold text-[rgba(16,25,21,0.85)]">{stat.value}</span>
          </div>
          <div
            className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-[rgba(16,25,21,0.08)]"
            role="progressbar"
            aria-valuenow={Math.round(stat.percent)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`${stat.label}: ${stat.value}`}
          >
            <div
              className={`h-full rounded-full transition-all ${
                stat.label === "Munchiez"
                  ? stat.percent <= 20
                    ? "bg-[rgba(196,107,46,0.8)]"
                    : stat.percent <= 50
                    ? "bg-[rgba(218,165,32,0.8)]"
                    : "bg-[rgba(45,93,49,0.7)]"
                  : stat.percent >= 90
                  ? "bg-[rgba(196,107,46,0.8)]"
                  : "bg-[rgba(45,93,49,0.7)]"
              }`}
              style={{ width: `${Math.min(stat.percent, 100)}%` }}
            />
          </div>
        </div>
      ))}

      {/* Info grid */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { label: "Type", value: creature.creature_type },
          { label: "Status", value: creature.is_alive ? "Alive" : "Dead" },
          { label: "Decorative", value: creature.is_decorative ? (creature.decorative_type || "Yes") : "No" },
          { label: "Can Breed", value: creature.can_breed ? "Yes" : "No" },
          { label: "Location", value: "Vorest" },
          { label: "Paired", value: creature.is_paired ? "Yes" : "No" },
          ...(creature.breeding_status ? [{ label: "Breeding Status", value: creature.breeding_status }] : []),
          ...(creature.death_reason ? [{ label: "Death Reason", value: creature.death_reason.replace("_", " ") }] : []),
        ].map((item) => (
          <div key={item.label} className="rounded-xl border border-[rgba(16,25,21,0.06)] bg-[rgba(16,25,21,0.02)] p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[rgba(16,25,21,0.45)]">
              {item.label}
            </p>
            <p className="mt-1 text-sm font-medium capitalize text-[rgba(16,25,21,0.8)]">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Feed Tab
// ---------------------------------------------------------------------------

function FeedTab({
  creature,
  foodItems,
  foodLoading,
  ownerKey,
  onSuccess,
}: {
  creature: Creature;
  foodItems: VorestFoodItem[];
  foodLoading: boolean;
  ownerKey: string;
  onSuccess: (msg: string) => void;
}) {
  const [selectedFood, setSelectedFood] = useState<VorestFoodItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedError, setFeedError] = useState<string | null>(null);

  const availableFood = useMemo(
    () => foodItems.filter((f) => !f.is_depleted && f.remaining_feedings > 0),
    [foodItems]
  );

  const canFeed = creature.is_alive && !creature.is_decorative;

  const handleFeed = async () => {
    if (!selectedFood) return;
    setIsProcessing(true);
    setFeedError(null);

    try {
      const result = await consumeVorestFood(selectedFood.food_id, creature.creature_id, ownerKey);
      onSuccess(
        `Fed ${creature.name}! Munchiez is now ${result.new_munchiez}%. Food has ${result.remaining_feedings} feedings left.`
      );
      setSelectedFood(null);
    } catch (err) {
      setFeedError(err instanceof Error ? err.message : "Failed to feed creature.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!canFeed) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
        <UtensilsCrossed className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
        <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
          Cannot feed this creature
        </p>
        <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
          {!creature.is_alive
            ? "This creature is dead. Use a Resurrect booster first."
            : "Decorative creatures don't need food."}
        </p>
      </div>
    );
  }

  if (foodLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-4">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-[rgba(16,25,21,0.08)]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-[rgba(16,25,21,0.08)]" />
                <div className="h-3 w-48 rounded bg-[rgba(16,25,21,0.08)]" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Current munchiez */}
      <div className="rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-[rgba(16,25,21,0.6)]">Current Munchiez</span>
          <span className={`font-bold ${creature.munchiez <= 20 ? "text-[var(--ember)]" : "text-[var(--moss)]"}`}>
            {creature.munchiez}%
          </span>
        </div>
        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(16,25,21,0.08)]"
          role="progressbar"
          aria-valuenow={creature.munchiez}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Munchiez: ${creature.munchiez}%`}
        >
          <div
            className={`h-full rounded-full ${
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

      {feedError && (
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-3 text-xs text-[var(--ember)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {feedError}
        </div>
      )}

      {availableFood.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
          <UtensilsCrossed className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
          <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
            No food available
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
            Purchase food from the Vorest Shop to feed your creatures.
          </p>
          <Link
            href="/vorest/shop"
            className="mt-4 inline-block rounded-full bg-[var(--moss)] px-5 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)]"
          >
            Go to Shop
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {availableFood.map((food) => (
            <div
              key={food.food_id}
              className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)]"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(218,165,32,0.12)] text-[var(--ember)]">
                <UtensilsCrossed className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[rgba(16,25,21,0.85)]">
                  {food.name || "Food Tray"}
                </p>
                <p className="mt-0.5 text-xs text-[rgba(16,25,21,0.5)]">
                  {food.remaining_feedings} feedings left &middot; +{food.munchiez_per_feeding} munchiez each
                </p>
              </div>
              <button
                onClick={() => setSelectedFood(food)}
                disabled={isProcessing}
                className="rounded-full bg-[var(--moss)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Feed
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Feed confirm */}
      {selectedFood && (
        <ConfirmModal
          title={`Feed ${creature.name}?`}
          description={`Use 1 feeding from "${selectedFood.name || "Food Tray"}" to restore ${selectedFood.munchiez_per_feeding} munchiez. ${selectedFood.remaining_feedings} feedings remaining.`}
          confirmLabel="Feed"
          isProcessing={isProcessing}
          onConfirm={handleFeed}
          onCancel={() => !isProcessing && setSelectedFood(null)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Breed Tab
// ---------------------------------------------------------------------------

function BreedTab({
  creature,
  allCreatures,
  ownerKey,
  onSuccess,
}: {
  creature: Creature;
  allCreatures: Creature[];
  ownerKey: string;
  onSuccess: (msg: string) => void;
}) {
  const [selectedPartner, setSelectedPartner] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [breedError, setBreedError] = useState<string | null>(null);

  const canBreed = creature.is_alive && creature.can_breed && !creature.is_paired && !creature.is_decorative;

  const eligiblePartners = useMemo(() => {
    if (!canBreed) return [];
    return allCreatures.filter(
      (c) =>
        c.creature_id !== creature.creature_id &&
        c.is_alive &&
        c.can_breed &&
        !c.is_paired &&
        !c.is_decorative
    );
  }, [allCreatures, creature, canBreed]);

  const handleStartBreeding = async () => {
    if (!selectedPartner) return;
    setIsProcessing(true);
    setBreedError(null);

    try {
      await startVorestBreeding(creature.creature_id, selectedPartner, ownerKey);
      const partner = allCreatures.find((c) => c.creature_id === selectedPartner);
      onSuccess(
        `Breeding started between ${creature.name} and ${partner?.name || "partner"}!`
      );
      setShowConfirm(false);
      setSelectedPartner("");
    } catch (err) {
      setBreedError(err instanceof Error ? err.message : "Failed to start breeding.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!creature.is_alive) {
    return (
      <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
        <Heart className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
        <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
          Cannot breed
        </p>
        <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
          This creature is dead. Use a Resurrect booster first.
        </p>
      </div>
    );
  }

  if (!canBreed) {
    const reason = creature.is_paired
      ? "This creature is currently breeding."
      : creature.is_decorative
      ? "Decorative creatures cannot breed."
      : !creature.can_breed
      ? creature.breeding_status === "cooldown"
        ? `Breeding cooldown: ${creature.breeding_cooldown_days} days remaining.`
        : creature.breeding_status === "too_young"
        ? "This creature is too young to breed."
        : "This creature is not eligible to breed."
      : "This creature cannot breed.";

    return (
      <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
        <Heart className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
        <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
          Cannot breed
        </p>
        <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">{reason}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Breeding eligibility status */}
      <div className="flex items-center gap-2 rounded-xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-3">
        <Check className="h-4 w-4 text-[var(--moss)]" />
        <span className="text-xs font-medium text-[var(--moss)]">
          {creature.name} is eligible to breed
        </span>
      </div>

      {breedError && (
        <div className="flex items-center gap-2 rounded-xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-3 text-xs text-[var(--ember)]">
          <AlertTriangle className="h-4 w-4 flex-shrink-0" />
          {breedError}
        </div>
      )}

      {eligiblePartners.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-8 text-center">
          <Heart className="mx-auto h-10 w-10 text-[rgba(16,25,21,0.2)]" />
          <p className="mt-3 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
            No eligible partners
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.45)]">
            You need at least one other breedable creature in the Vorest.
          </p>
        </div>
      ) : (
        <>
          {/* Partner selector */}
          <div className="rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4">
            <label className="text-xs font-semibold text-[rgba(16,25,21,0.6)]">
              Select a partner
            </label>
            <select
              value={selectedPartner}
              onChange={(e) => setSelectedPartner(e.target.value)}
              className="mt-2 w-full rounded-xl border border-[rgba(16,25,21,0.12)] bg-white px-3 py-2.5 text-sm text-[rgba(16,25,21,0.8)] transition focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[rgba(45,93,49,0.2)]"
            >
              <option value="">Choose a creature...</option>
              {eligiblePartners.map((p) => (
                <option key={p.creature_id} value={p.creature_id}>
                  {p.name} ({p.creature_type}) — Age {p.age}, Munchiez {p.munchiez}%
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowConfirm(true)}
            disabled={!selectedPartner || isProcessing}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Heart className="h-4 w-4" />
            Start Breeding
          </button>
        </>
      )}

      {showConfirm && selectedPartner && (
        <ConfirmModal
          title="Start breeding?"
          description={`Pair ${creature.name} with ${eligiblePartners.find((p) => p.creature_id === selectedPartner)?.name || "partner"}. Both creatures will be unavailable for other actions during the breeding period.`}
          confirmLabel="Start Breeding"
          isProcessing={isProcessing}
          onConfirm={handleStartBreeding}
          onCancel={() => !isProcessing && setShowConfirm(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Actions Tab
// ---------------------------------------------------------------------------

function ActionsTab({
  creature,
  boosters,
  boosterLoading,
  ownerKey,
  onSuccess,
}: {
  creature: Creature;
  boosters: VorestBooster[];
  boosterLoading: boolean;
  ownerKey: string;
  onSuccess: (msg: string) => void;
}) {
  const router = useRouter();

  const [selectedBooster, setSelectedBooster] = useState<VorestBooster | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applyError, setApplyError] = useState<string | null>(null);

  const [showRetrieveConfirm, setShowRetrieveConfirm] = useState(false);
  const [isRetrieving, setIsRetrieving] = useState(false);
  const [retrieveError, setRetrieveError] = useState<string | null>(null);
  const retrieveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (retrieveTimerRef.current) clearTimeout(retrieveTimerRef.current);
    };
  }, []);

  // Filter applicable boosters
  const applicableBoosters = useMemo(() => {
    const unused = boosters.filter((b) => !b.is_used);
    return unused.filter((b) => {
      if (b.booster_type === "resurrect") return !creature.is_alive && !creature.sent_to_beyond;
      if (b.booster_type === "forever") return creature.is_alive && !creature.is_decorative;
      if (b.booster_type === "eternalz") return creature.is_alive && !creature.is_decorative;
      return false;
    });
  }, [boosters, creature]);

  const canRetrieve = creature.is_alive && !creature.is_paired;

  const handleApplyBooster = async () => {
    if (!selectedBooster) return;
    setIsApplying(true);
    setApplyError(null);

    try {
      const result = await applyVorestBooster(selectedBooster.booster_id, creature.creature_id, ownerKey);
      onSuccess(result.effect_applied);
      setSelectedBooster(null);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : "Failed to apply booster.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRetrieve = async () => {
    setIsRetrieving(true);
    setRetrieveError(null);

    try {
      await retrieveCreatureFromVorest(creature.creature_id, ownerKey);
      onSuccess(`${creature.name} has been retrieved from the Vorest!`);
      setShowRetrieveConfirm(false);
      // Redirect after brief delay for toast
      retrieveTimerRef.current = setTimeout(() => {
        router.push("/vorest/creatures");
      }, 1500);
    } catch (err) {
      setRetrieveError(err instanceof Error ? err.message : "Failed to retrieve creature.");
    } finally {
      setIsRetrieving(false);
    }
  };

  const boosterIcon = (type: string) => {
    if (type === "resurrect") return Heart;
    if (type === "forever") return Crown;
    return Shield;
  };

  const boosterLabel = (type: string) => {
    if (type === "resurrect") return "Resurrect";
    if (type === "forever") return "Forever Beautiful";
    return "Eternalz";
  };

  return (
    <div className="space-y-6">
      {/* Apply Booster section */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[rgba(16,25,21,0.7)]">
          <Sparkles className="h-4 w-4" />
          Apply Booster
        </h3>

        {applyError && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-3 text-xs text-[var(--ember)]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {applyError}
          </div>
        )}

        {boosterLoading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-4">
                <div className="h-10 w-32 rounded bg-[rgba(16,25,21,0.08)]" />
              </div>
            ))}
          </div>
        ) : applicableBoosters.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-6 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-[rgba(16,25,21,0.2)]" />
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.55)]">
              No applicable boosters available.
            </p>
            <Link
              href="/vorest/shop"
              className="mt-3 inline-block text-xs font-semibold text-[var(--moss)] hover:underline"
            >
              Buy boosters in the shop
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {applicableBoosters.map((booster) => {
              const Icon = boosterIcon(booster.booster_type);
              return (
                <div
                  key={booster.booster_id}
                  className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)]"
                >
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(139,69,19,0.12)] text-[rgba(139,69,19,0.8)]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[rgba(16,25,21,0.85)]">
                      {boosterLabel(booster.booster_type)}
                    </p>
                    <p className="mt-0.5 text-xs text-[rgba(16,25,21,0.5)]">
                      Purchased with {booster.purchased_with === "vbucks" ? "Vbucks" : "GBP"}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedBooster(booster)}
                    disabled={isApplying}
                    className="rounded-full bg-[rgba(139,69,19,0.8)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgba(139,69,19,0.9)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Apply
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-[rgba(16,25,21,0.08)]" />

      {/* Retrieve from Vorest */}
      <div>
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-[rgba(16,25,21,0.7)]">
          <ArrowLeftRight className="h-4 w-4" />
          Retrieve from Vorest
        </h3>

        {retrieveError && (
          <div className="mb-3 flex items-center gap-2 rounded-xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-3 text-xs text-[var(--ember)]">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {retrieveError}
          </div>
        )}

        {canRetrieve ? (
          <div className="rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4">
            <p className="text-xs text-[rgba(16,25,21,0.55)]">
              Send {creature.name} back to Second Life. Age and stats will be preserved.
            </p>
            <button
              onClick={() => setShowRetrieveConfirm(true)}
              disabled={isRetrieving}
              className="mt-3 flex items-center gap-2 rounded-full border border-[rgba(218,165,32,0.35)] px-4 py-2 text-xs font-semibold text-[var(--ember)] transition hover:bg-[rgba(218,165,32,0.08)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeftRight className="h-3.5 w-3.5" />
              Retrieve to Second Life
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-6 text-center">
            <p className="text-sm text-[rgba(16,25,21,0.55)]">
              {!creature.is_alive
                ? "Dead creatures cannot be retrieved. Use a Resurrect booster first."
                : "This creature is currently breeding and cannot be retrieved."}
            </p>
          </div>
        )}
      </div>

      {/* Booster confirm */}
      {selectedBooster && (
        <ConfirmModal
          title={`Apply ${boosterLabel(selectedBooster.booster_type)}?`}
          description={
            selectedBooster.booster_type === "resurrect"
              ? `Bring ${creature.name} back to life with 20% munchiez. This will consume the booster.`
              : selectedBooster.booster_type === "forever"
              ? `Transform ${creature.name} into a Forever Beautiful creature. It will become immortal and decorative. This cannot be undone.`
              : `Grant ${creature.name} eternal immunity. It will be immune to aging and starvation. This will consume the booster.`
          }
          confirmLabel="Apply Booster"
          isProcessing={isApplying}
          onConfirm={handleApplyBooster}
          onCancel={() => !isApplying && setSelectedBooster(null)}
        />
      )}

      {/* Retrieve confirm */}
      {showRetrieveConfirm && (
        <ConfirmModal
          title={`Retrieve ${creature.name}?`}
          description={`${creature.name} will leave the Vorest and return to Second Life. Current age (${creature.age} days) and munchiez (${creature.munchiez}%) will be preserved.`}
          confirmLabel="Retrieve"
          isProcessing={isRetrieving}
          onConfirm={handleRetrieve}
          onCancel={() => !isRetrieving && setShowRetrieveConfirm(false)}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VorestCreatureDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params as Promise<{ id: string }>);
  const creatureId = resolvedParams.id;

  const { ownerKey } = useUserContext();
  const { cfg } = useGameConfig();
  const maxAge = cfg("creature_max_age") as number;
  const endOfLifeAge = maxAge - 10;

  const {
    creatures,
    isLoading,
    isRefreshing,
    error,
    refetch,
    foodItems,
    foodLoading,
    boosters,
    boosterLoading,
    refetchFood,
    refetchBoosters,
  } = useVorestContext();

  const [activeTab, setActiveTab] = useState<DetailTab>("stats");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  const creature = useMemo(
    () => creatures.find((c) => c.creature_id === creatureId) || null,
    [creatures, creatureId]
  );

  const handleActionSuccess = async (msg: string) => {
    setSuccessMessage(msg);
    await Promise.allSettled([refetch(), refetchFood(), refetchBoosters()]);
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (isLoading) {
    return <DetailSkeleton />;
  }

  if (error) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
          <Link href="/vorest" className="transition hover:text-[var(--moss)]">Vorest</Link>
          <span>/</span>
          <Link href="/vorest/creatures" className="transition hover:text-[var(--moss)]">Creatures</Link>
          <span>/</span>
          <span className="font-semibold text-[rgba(16,25,21,0.8)]">Error</span>
        </nav>
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

  if (!creature) {
    return (
      <div className="space-y-6">
        <nav className="flex items-center gap-2 text-xs text-[rgba(16,25,21,0.5)]">
          <Link href="/vorest" className="transition hover:text-[var(--moss)]">Vorest</Link>
          <span>/</span>
          <Link href="/vorest/creatures" className="transition hover:text-[var(--moss)]">Creatures</Link>
          <span>/</span>
          <span className="font-semibold text-[rgba(16,25,21,0.8)]">Not Found</span>
        </nav>
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] bg-white/70 p-12 text-center">
          <PawPrint className="h-12 w-12 text-[rgba(16,25,21,0.2)]" />
          <p className="font-display text-xl">Creature not found</p>
          <p className="text-sm text-[rgba(16,25,21,0.5)]">
            This creature may have been retrieved from the Vorest or doesn&apos;t exist.
          </p>
          <Link
            href="/vorest/creatures"
            className="rounded-full bg-[var(--moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)]"
          >
            Back to Creatures
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatusLabel(creature, endOfLifeAge);

  const tabs: { key: DetailTab; label: string; icon: typeof PawPrint }[] = [
    { key: "stats", label: "Stats", icon: PawPrint },
    { key: "feed", label: "Feed", icon: UtensilsCrossed },
    { key: "breed", label: "Breed", icon: Heart },
    { key: "actions", label: "Actions", icon: Sparkles },
  ];

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
        <Link href="/vorest/creatures" className="transition hover:text-[var(--moss)]">
          Creatures
        </Link>
        <span>/</span>
        <span className="font-semibold text-[rgba(16,25,21,0.8)]">{creature.name}</span>
      </nav>

      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/vorest/creatures"
              className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(16,25,21,0.12)] transition hover:bg-[rgba(16,25,21,0.04)]"
            >
              <ArrowLeft className="h-4 w-4 text-[rgba(16,25,21,0.6)]" />
            </Link>
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[rgba(45,93,49,0.15)] to-[rgba(218,165,32,0.1)]">
              {creature.is_alive ? (
                <PawPrint className={`h-7 w-7 text-[var(--moss)] ${creature.is_decorative ? "" : "animate-gentle-pulse"}`} />
              ) : (
                <PawPrint className="h-7 w-7 text-[rgba(17,24,39,0.2)]" />
              )}
            </div>
            <div>
              <h1 className="font-display text-2xl">{creature.name}</h1>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm text-[rgba(16,25,21,0.6)]">{creature.creature_type}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    STATUS_STYLES[status] || "bg-[rgba(47,91,72,0.12)] text-[var(--moss)]"
                  }`}
                >
                  {status}
                </span>
                {creature.is_paired && (
                  <span className="rounded-full bg-[rgba(139,69,19,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(139,69,19,0.8)]">
                    Breeding
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)] disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </header>

      {/* Success banner */}
      {successMessage && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.08)] p-4">
          <Check className="h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
          <p className="flex-1 text-sm font-medium text-[var(--moss)]">
            {successMessage}
          </p>
          <button
            onClick={() => setSuccessMessage(null)}
            aria-label="Dismiss"
            className="text-[rgba(45,93,49,0.5)] hover:text-[var(--moss)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? "bg-[var(--moss)] text-white shadow-[0_2px_8px_rgba(45,93,49,0.3)]"
                  : "border border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.6)] hover:bg-[rgba(17,24,39,0.05)]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="rounded-3xl bg-white/90 p-6 shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
        {activeTab === "stats" && <StatsTab creature={creature} maxAge={maxAge} />}
        {activeTab === "feed" && ownerKey && (
          <FeedTab
            creature={creature}
            foodItems={foodItems}
            foodLoading={foodLoading}
            ownerKey={ownerKey}
            onSuccess={handleActionSuccess}
          />
        )}
        {activeTab === "breed" && ownerKey && (
          <BreedTab
            creature={creature}
            allCreatures={creatures}
            ownerKey={ownerKey}
            onSuccess={handleActionSuccess}
          />
        )}
        {activeTab === "actions" && ownerKey && (
          <ActionsTab
            creature={creature}
            boosters={boosters}
            boosterLoading={boosterLoading}
            ownerKey={ownerKey}
            onSuccess={handleActionSuccess}
          />
        )}
      </div>
    </div>
  );
}
