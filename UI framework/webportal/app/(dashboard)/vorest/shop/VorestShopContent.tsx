"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  UtensilsCrossed,
  Sparkles,
  RefreshCw,
  ShoppingCart,
  ArrowLeft,
  Check,
  X,
  Loader2,
  Minus,
  Plus,
  Trees,
  Heart,
  Shield,
  Crown,
} from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { useVorestContext } from "@/contexts/VorestContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import {
  purchaseVorestFood,
  purchaseVorestBooster,
  type VorestBoosterType,
} from "@/lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ShopTab = "food" | "boosters";
type Currency = "vbucks" | "gbp";

type BoosterItem = {
  type: VorestBoosterType;
  name: string;
  description: string;
  icon: typeof Heart;
  details: string[];
  priceKeyVbucks: string;
  priceKeyGbp: string;
  fallbackVbucks: number;
  fallbackGbp: number;
};

// ---------------------------------------------------------------------------
// Booster catalog
// ---------------------------------------------------------------------------

const BOOSTER_CATALOG: BoosterItem[] = [
  {
    type: "resurrect",
    name: "Resurrect",
    description: "Bring a dead Vorest creature back to life with 20% munchiez.",
    icon: Heart,
    details: [
      "Creature must be dead",
      "Cannot be used on Great Beyond creatures",
      "Restores 20% munchiez on revival",
      "Single use per booster",
    ],
    priceKeyVbucks: "vorest_resurrect_price_vbucks",
    priceKeyGbp: "vorest_resurrect_price_gbp",
    fallbackVbucks: 200,
    fallbackGbp: 2000,
  },
  {
    type: "forever",
    name: "Forever Beautiful",
    description:
      "Transform a living creature into a decorative immortal — frozen in time forever.",
    icon: Crown,
    details: [
      "Creature must be alive",
      "Cannot be decorative already",
      "Becomes immortal & decorative",
      "Cannot breed after transformation",
    ],
    priceKeyVbucks: "vorest_forever_price_vbucks",
    priceKeyGbp: "vorest_forever_price_gbp",
    fallbackVbucks: 300,
    fallbackGbp: 3000,
  },
  {
    type: "eternalz",
    name: "Eternalz",
    description:
      "Grant a creature eternal immunity — immune to aging and starvation forever.",
    icon: Shield,
    details: [
      "Creature must be alive",
      "Cannot be decorative already",
      "Immune to age and starvation",
      "Can still breed normally",
    ],
    priceKeyVbucks: "vorest_eternalz_price_vbucks",
    priceKeyGbp: "vorest_eternalz_price_gbp",
    fallbackVbucks: 150,
    fallbackGbp: 1500,
  },
];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="h-8 w-48 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
      </header>
      <div className="flex gap-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-[rgba(16,25,21,0.08)]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-5">
            <div className="h-14 w-14 rounded-xl bg-[rgba(16,25,21,0.08)]" />
            <div className="mt-4 h-4 w-32 rounded bg-[rgba(16,25,21,0.08)]" />
            <div className="mt-2 h-3 w-48 rounded bg-[rgba(16,25,21,0.08)]" />
            <div className="mt-4 h-10 w-full rounded-full bg-[rgba(16,25,21,0.08)]" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchase Confirm Modal
// ---------------------------------------------------------------------------

function PurchaseConfirmModal({
  title,
  description,
  unitPrice,
  quantity,
  currency,
  balance,
  isProcessing,
  onConfirm,
  onCancel,
}: {
  title: string;
  description: string;
  unitPrice: number;
  quantity: number;
  currency: Currency;
  balance: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const totalCost = unitPrice * quantity;
  const balanceAfter = balance - totalCost;
  const currencyLabel = currency === "vbucks" ? "Vbucks" : "GBP";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,25,21,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2
              id="purchase-modal-title"
              className="font-semibold text-[rgba(16,25,21,0.85)]"
            >
              Confirm Purchase
            </h2>
            <p className="text-xs text-[rgba(16,25,21,0.5)]">{title}</p>
          </div>
          <button
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(17,24,39,0.4)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
          {description}
        </p>

        <div className="mt-5 space-y-2.5 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.02)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Price per item</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">
              {unitPrice.toLocaleString()} {currencyLabel}
            </span>
          </div>
          {quantity > 1 && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-[rgba(17,24,39,0.55)]">Quantity</span>
              <span className="font-medium text-[rgba(16,25,21,0.8)]">
                x{quantity}
              </span>
            </div>
          )}
          <div className="border-t border-[rgba(17,24,39,0.08)]" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-[rgba(17,24,39,0.7)]">
              Total Cost
            </span>
            <span className="font-semibold text-[var(--ember)]">
              {totalCost.toLocaleString()} {currencyLabel}
            </span>
          </div>
          <div className="border-t border-[rgba(17,24,39,0.08)]" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Current balance</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">
              {balance.toLocaleString()} {currencyLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">After purchase</span>
            <span
              className={`font-semibold ${balanceAfter >= 0 ? "text-[var(--moss)]" : "text-red-500"}`}
            >
              {balanceAfter.toLocaleString()} {currencyLabel}
            </span>
          </div>
        </div>

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
            disabled={isProcessing || balanceAfter < 0}
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
                Confirm Purchase
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function VorestShopContent() {
  const {
    ownerKey,
    gbpBalance,
    isLoading: userLoading,
    refreshBalance,
  } = useUserContext();
  const { vbucks, refetchFood, refetchBoosters } = useVorestContext();
  const { cfg } = useGameConfig();

  // UI state
  const [activeTab, setActiveTab] = useState<ShopTab>("food");
  const [currency, setCurrency] = useState<Currency>("vbucks");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Food quantity
  const [foodQuantity, setFoodQuantity] = useState(1);

  // Purchase flow
  const [pendingPurchase, setPendingPurchase] = useState<{
    title: string;
    description: string;
    unitPrice: number;
    quantity: number;
    action: () => Promise<void>;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // Price helpers
  // ---------------------------------------------------------------------------

  const foodPrice = useCallback(
    (cur: Currency) => {
      const key = `vorest_food_price_${cur}`;
      const val = cfg(key);
      return typeof val === "number" ? val : cur === "vbucks" ? 50 : 500;
    },
    [cfg]
  );

  const boosterPrice = useCallback(
    (booster: BoosterItem, cur: Currency) => {
      const key = cur === "vbucks" ? booster.priceKeyVbucks : booster.priceKeyGbp;
      const val = cfg(key);
      return typeof val === "number" ? val : cur === "vbucks" ? booster.fallbackVbucks : booster.fallbackGbp;
    },
    [cfg]
  );

  const currentBalance = currency === "vbucks" ? vbucks : gbpBalance;
  const currencyLabel = currency === "vbucks" ? "Vbucks" : "GBP";

  // ---------------------------------------------------------------------------
  // Purchase handlers
  // ---------------------------------------------------------------------------

  const handleFoodPurchase = () => {
    const price = foodPrice(currency);
    setPendingPurchase({
      title: `Food Tray x${foodQuantity}`,
      description: `Purchase ${foodQuantity} Food Tray${foodQuantity > 1 ? "s" : ""} with ${foodQuantity * 12} total feedings. Each feeding restores 30 Munchiez.`,
      unitPrice: price,
      quantity: foodQuantity,
      action: async () => {
        if (!ownerKey) return;
        const result = await purchaseVorestFood(ownerKey, currency, foodQuantity);
        setSuccessMessage(
          `Purchased ${foodQuantity}x Food Tray for ${result.currency_spent.toLocaleString()} ${currencyLabel}!`
        );
        await Promise.allSettled([refreshBalance(), refetchFood()]);
      },
    });
  };

  const handleBoosterPurchase = (booster: BoosterItem) => {
    const price = boosterPrice(booster, currency);
    setPendingPurchase({
      title: `${booster.name} Booster`,
      description: booster.description,
      unitPrice: price,
      quantity: 1,
      action: async () => {
        if (!ownerKey) return;
        const result = await purchaseVorestBooster(ownerKey, booster.type, currency);
        setSuccessMessage(
          `Purchased ${booster.name} booster for ${result.currency_spent.toLocaleString()} ${currencyLabel}!`
        );
        await Promise.allSettled([refreshBalance(), refetchBoosters()]);
      },
    });
  };

  const handleConfirmPurchase = async () => {
    if (!pendingPurchase) return;
    setIsProcessing(true);
    setPurchaseError(null);

    try {
      await pendingPurchase.action();
      setPendingPurchase(null);
      setFoodQuantity(1);
      if (successTimerRef.current) clearTimeout(successTimerRef.current);
      successTimerRef.current = setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setPurchaseError(
        err instanceof Error ? err.message : "Purchase failed. Please try again."
      );
      setPendingPurchase(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPurchase = () => {
    if (!isProcessing) {
      setPendingPurchase(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------

  if (userLoading) {
    return <LoadingSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

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
        <span className="font-semibold text-[rgba(16,25,21,0.8)]">Shop</span>
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
              <h1 className="font-display text-3xl">Vorest Shop</h1>
              <p className="mt-1 text-sm text-[rgba(16,25,21,0.6)]">
                Purchase food and boosters for your Vorest creatures.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Dual balance chips */}
            <div className="flex items-center gap-2 rounded-full border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.08)] px-3 py-1.5">
              <Trees className="h-3.5 w-3.5 text-[var(--moss)]" />
              <span className="text-xs font-semibold text-[var(--moss)]">
                {vbucks.toLocaleString()} Vbucks
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[var(--ember)]" />
              <span className="text-xs font-semibold text-[var(--ember)]">
                {gbpBalance.toLocaleString()} GBP
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-[rgba(17,24,39,0.1)] px-3 py-1.5 text-xs font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
            >
              <RefreshCw className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
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

      {/* Error banner */}
      {purchaseError && !pendingPurchase && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.08)] p-4">
          <Sparkles className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <p className="flex-1 text-sm font-medium text-[var(--ember)]">
            {purchaseError}
          </p>
          <button
            onClick={() => setPurchaseError(null)}
            aria-label="Dismiss"
            className="text-[rgba(196,107,46,0.5)] hover:text-[var(--ember)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Currency toggle */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-[rgba(16,25,21,0.5)]">Pay with:</span>
        <div className="flex rounded-full border border-[rgba(16,25,21,0.12)] bg-white/90 p-1">
          <button
            onClick={() => setCurrency("vbucks")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              currency === "vbucks"
                ? "bg-[var(--moss)] text-white shadow-sm"
                : "text-[rgba(16,25,21,0.6)] hover:bg-[rgba(16,25,21,0.04)]"
            }`}
          >
            <Trees className="h-3.5 w-3.5" />
            Vbucks
          </button>
          <button
            onClick={() => setCurrency("gbp")}
            className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-semibold transition ${
              currency === "gbp"
                ? "bg-[var(--ember)] text-white shadow-sm"
                : "text-[rgba(16,25,21,0.6)] hover:bg-[rgba(16,25,21,0.04)]"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            GBP
          </button>
        </div>
        <span className="text-xs text-[rgba(16,25,21,0.4)]">
          Balance: {currentBalance.toLocaleString()} {currencyLabel}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("food")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "food"
              ? "bg-[var(--moss)] text-white shadow-[0_2px_8px_rgba(45,93,49,0.3)]"
              : "border border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.6)] hover:bg-[rgba(17,24,39,0.05)]"
          }`}
        >
          <UtensilsCrossed className="h-4 w-4" />
          Food
        </button>
        <button
          onClick={() => setActiveTab("boosters")}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            activeTab === "boosters"
              ? "bg-[var(--moss)] text-white shadow-[0_2px_8px_rgba(45,93,49,0.3)]"
              : "border border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.6)] hover:bg-[rgba(17,24,39,0.05)]"
          }`}
        >
          <Sparkles className="h-4 w-4" />
          Boosters
          <span
            className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              activeTab === "boosters"
                ? "bg-white/25 text-white"
                : "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.5)]"
            }`}
          >
            3
          </span>
        </button>
      </div>

      {/* Food tab */}
      {activeTab === "food" && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="group flex flex-col rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-5 transition hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
              {/* Icon + badge */}
              <div className="flex items-start justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(218,165,32,0.12)] text-[var(--ember)] transition group-hover:scale-105">
                  <UtensilsCrossed className="h-7 w-7" />
                </div>
                <span className="rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[var(--moss)]">
                  In Stock
                </span>
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.85)]">
                Food Tray
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
                A food tray with 12 feedings to keep your Vorest creatures well-fed and healthy.
              </p>

              <ul className="mt-3 space-y-1">
                {[
                  "12 feedings per tray",
                  "Restores 30 Munchiez per feeding",
                  "Use from creature detail page",
                  "Vorest creatures only",
                ].map((detail, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[11px] text-[rgba(16,25,21,0.5)]"
                  >
                    <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[rgba(16,25,21,0.25)]" />
                    {detail}
                  </li>
                ))}
              </ul>

              <div className="flex-1" />

              {/* Price */}
              <div className="mt-4 flex items-baseline gap-1.5">
                <span className="text-lg font-semibold text-[var(--ember)]">
                  {(foodPrice(currency) * foodQuantity).toLocaleString()}
                </span>
                <span className="text-xs font-medium text-[rgba(196,107,46,0.7)]">
                  {currencyLabel}
                </span>
                {foodQuantity > 1 && (
                  <span className="ml-1 text-[10px] text-[rgba(17,24,39,0.4)]">
                    ({foodPrice(currency).toLocaleString()} each)
                  </span>
                )}
              </div>

              {/* Quantity selector */}
              <div className="mt-3 flex items-center gap-2">
                <span className="text-xs text-[rgba(17,24,39,0.5)]">Qty:</span>
                <button
                  onClick={() => setFoodQuantity((q) => Math.max(1, q - 1))}
                  disabled={foodQuantity <= 1}
                  aria-label="Decrease quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,24,39,0.12)] text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="w-6 text-center text-sm font-semibold text-[rgba(16,25,21,0.8)]">
                  {foodQuantity}
                </span>
                <button
                  onClick={() => setFoodQuantity((q) => Math.min(10, q + 1))}
                  disabled={foodQuantity >= 10}
                  aria-label="Increase quantity"
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,24,39,0.12)] text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Plus className="h-3 w-3" />
                </button>
                <span className="ml-auto text-[10px] text-[rgba(17,24,39,0.35)]">
                  Max 10
                </span>
              </div>

              {/* Purchase button */}
              <button
                onClick={handleFoodPurchase}
                disabled={currentBalance < foodPrice(currency) * foodQuantity}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                {currentBalance < foodPrice(currency) * foodQuantity
                  ? "Insufficient Balance"
                  : "Purchase"}
              </button>

              {currentBalance < foodPrice(currency) * foodQuantity && (
                <p className="mt-1.5 text-center text-[10px] text-[var(--ember)]">
                  You need{" "}
                  {(foodPrice(currency) * foodQuantity - currentBalance).toLocaleString()}{" "}
                  more {currencyLabel}
                </p>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Boosters tab */}
      {activeTab === "boosters" && (
        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BOOSTER_CATALOG.map((booster) => {
              const price = boosterPrice(booster, currency);
              const canAfford = currentBalance >= price;
              const Icon = booster.icon;

              return (
                <div
                  key={booster.type}
                  className="group flex flex-col rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-5 transition hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_8px_24px_rgba(16,25,21,0.06)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(139,69,19,0.12)] text-[rgba(139,69,19,0.8)] transition group-hover:scale-105">
                      <Icon className="h-7 w-7" />
                    </div>
                    <span className="rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[var(--moss)]">
                      In Stock
                    </span>
                  </div>

                  <h3 className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.85)]">
                    {booster.name}
                  </h3>
                  <p className="mt-1 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
                    {booster.description}
                  </p>

                  <ul className="mt-3 space-y-1">
                    {booster.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-[11px] text-[rgba(16,25,21,0.5)]"
                      >
                        <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[rgba(16,25,21,0.25)]" />
                        {detail}
                      </li>
                    ))}
                  </ul>

                  <div className="flex-1" />

                  <div className="mt-4 flex items-baseline gap-1.5">
                    <span className="text-lg font-semibold text-[var(--ember)]">
                      {price.toLocaleString()}
                    </span>
                    <span className="text-xs font-medium text-[rgba(196,107,46,0.7)]">
                      {currencyLabel}
                    </span>
                  </div>

                  <button
                    onClick={() => handleBoosterPurchase(booster)}
                    disabled={!canAfford}
                    className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[rgba(45,93,49,0.85)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {!canAfford ? "Insufficient Balance" : "Purchase"}
                  </button>

                  {!canAfford && (
                    <p className="mt-1.5 text-center text-[10px] text-[var(--ember)]">
                      You need {(price - currentBalance).toLocaleString()} more{" "}
                      {currencyLabel}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Purchase confirmation modal */}
      {pendingPurchase && (
        <PurchaseConfirmModal
          title={pendingPurchase.title}
          description={pendingPurchase.description}
          unitPrice={pendingPurchase.unitPrice}
          quantity={pendingPurchase.quantity}
          currency={currency}
          balance={currentBalance}
          isProcessing={isProcessing}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}
    </div>
  );
}
