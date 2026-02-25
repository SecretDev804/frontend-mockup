"use client";

import { useState, useCallback, useEffect } from "react";
import {
  Store,
  RefreshCw,
  Sparkles,
  ShoppingCart,
  Info,
  AlertTriangle,
  Check,
  X,
  Loader2,
  Clock,
  ArrowDownRight,
  Minus,
  Plus,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useUserContext } from "@/contexts/UserContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import {
  purchaseStoreItem,
  fetchTransactionHistory,
  type Transaction,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

// ---------------------------------------------------------------------------
// Store catalog types & data
// ---------------------------------------------------------------------------

type StoreCategory = "all" | "consumables" | "creatures" | "special";

type StoreItem = {
  id: string;
  name: string;
  description: string;
  category: Exclude<StoreCategory, "all">;
  priceKey: string;
  fallbackPrice: number;
  icon: string;
  stock: "unlimited" | "limited" | "out_of_stock";
  maxQuantity: number;
  popular?: boolean;
  comingSoon?: boolean;
  details: string[];
};

const STORE_CATALOG: StoreItem[] = [
  {
    id: "food_tray",
    name: "Food Tray",
    description:
      "A food tray with 12 feedings to keep your creatures well-fed and happy.",
    category: "consumables",
    priceKey: "food_cost_points",
    fallbackPrice: 2000,
    icon: "🍖",
    stock: "unlimited",
    maxQuantity: 10,
    popular: true,
    details: [
      "12 feedings per tray",
      "Restores 30 Munchiez per feeding",
      "Place in Second Life near your creatures",
      "Becomes decorative after use",
    ],
  },
  {
    id: "hut_creature",
    name: "Goobiez HUT Creation",
    description:
      "Create a unique custom decorative Goobiez creature using the HUT Factory in Second Life.",
    category: "creatures",
    priceKey: "hut_creature_cost",
    fallbackPrice: 5000,
    icon: "🏠",
    stock: "unlimited",
    maxQuantity: 1,
    details: [
      "Custom decorative creature",
      "Permanent & unique to you",
      "Non-breedable (decorative only)",
      "Worth 1,000 GBP if sent to Great Beyond",
    ],
  },
  {
    id: "special_monthly_goobiez",
    name: "Monthly Special Goobiez",
    description:
      "A limited-edition special Goobiez creature available this month. Check back regularly for new rotating specials!",
    category: "special",
    priceKey: "",
    fallbackPrice: 0,
    icon: "✨",
    stock: "out_of_stock",
    maxQuantity: 1,
    comingSoon: true,
    details: [
      "Rotating monthly creature",
      "Limited availability",
      "Unique traits each month",
    ],
  },
  {
    id: "special_monthly_fuggiez",
    name: "Monthly Special Fuggiez",
    description:
      "A limited-edition special Fuggiez creature available this month. A rare visitor from the Fuggiez world!",
    category: "special",
    priceKey: "",
    fallbackPrice: 0,
    icon: "🌟",
    stock: "out_of_stock",
    maxQuantity: 1,
    comingSoon: true,
    details: [
      "Rotating monthly creature",
      "Limited availability",
      "Exclusive Fuggiez variant",
    ],
  },
];

const CATEGORIES: { value: StoreCategory; label: string; icon: string }[] = [
  { value: "all", label: "All Items", icon: "🛒" },
  { value: "consumables", label: "Consumables", icon: "🍖" },
  { value: "creatures", label: "Creatures", icon: "🐾" },
  { value: "special", label: "Special", icon: "✨" },
];

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
      </header>
      <div className="animate-pulse rounded-2xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] p-5">
        <div className="h-4 w-32 rounded bg-gray-200" />
        <div className="mt-3 h-8 w-24 rounded bg-gray-200" />
      </div>
      <div className="flex gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-24 animate-pulse rounded-full bg-gray-200"
          />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white/95 p-5">
            <div className="flex items-center gap-3">
              <div className="h-14 w-14 rounded-xl bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 rounded bg-gray-200" />
                <div className="h-3 w-48 rounded bg-gray-200" />
              </div>
            </div>
            <div className="mt-4 h-3 w-full rounded bg-gray-200" />
            <div className="mt-2 h-3 w-3/4 rounded bg-gray-200" />
            <div className="mt-4 h-10 w-full rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Category tabs
// ---------------------------------------------------------------------------

function CategoryTabs({
  active,
  onChange,
  counts,
}: {
  active: StoreCategory;
  onChange: (cat: StoreCategory) => void;
  counts: Record<StoreCategory, number>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold transition ${
            active === cat.value
              ? "bg-[var(--moss)] text-white shadow-[0_2px_8px_rgba(45,93,49,0.3)]"
              : "border border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.6)] hover:bg-[rgba(17,24,39,0.05)]"
          }`}
        >
          <span className="text-sm">{cat.icon}</span>
          {cat.label}
          <span
            className={`ml-1 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
              active === cat.value
                ? "bg-white/25 text-white"
                : "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.5)]"
            }`}
          >
            {counts[cat.value]}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Store item card
// ---------------------------------------------------------------------------

function StoreItemCard({
  item,
  price,
  balance,
  onPurchase,
}: {
  item: StoreItem;
  price: number;
  balance: number;
  onPurchase: (item: StoreItem, quantity: number) => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const totalCost = price * quantity;
  const canAfford = balance >= totalCost;
  const isAvailable = item.stock !== "out_of_stock" && !item.comingSoon;

  return (
    <div className="group flex flex-col rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-5 transition hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_8px_24px_rgba(16,25,21,0.06)]">
      {/* Top row: icon + badges */}
      <div className="flex items-start justify-between">
        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[rgba(218,165,32,0.12)] text-2xl transition group-hover:scale-105">
          {item.icon}
        </div>
        <div className="flex flex-wrap gap-1">
          {item.popular && (
            <span className="rounded-full bg-[rgba(218,165,32,0.22)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ember)]">
              Popular
            </span>
          )}
          {item.comingSoon && (
            <span className="rounded-full bg-[rgba(17,24,39,0.08)] px-2 py-0.5 text-[10px] font-semibold text-[rgba(17,24,39,0.5)]">
              Coming Soon
            </span>
          )}
          {item.stock === "unlimited" && !item.comingSoon && (
            <span className="rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-[10px] font-semibold text-[var(--moss)]">
              In Stock
            </span>
          )}
          {item.stock === "limited" && !item.comingSoon && (
            <span className="rounded-full bg-[rgba(196,107,46,0.15)] px-2 py-0.5 text-[10px] font-semibold text-[var(--ember)]">
              Limited
            </span>
          )}
        </div>
      </div>

      {/* Name & description */}
      <h3 className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.85)]">
        {item.name}
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
        {item.description}
      </p>

      {/* Item details */}
      <ul className="mt-3 space-y-1">
        {item.details.map((detail, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-[11px] text-[rgba(16,25,21,0.5)]"
          >
            <span className="mt-1 h-1 w-1 flex-shrink-0 rounded-full bg-[rgba(16,25,21,0.25)]" />
            {detail}
          </li>
        ))}
      </ul>

      {/* Spacer to push bottom content down */}
      <div className="flex-1" />

      {/* Price */}
      <div className="mt-4 flex items-baseline gap-1.5">
        {isAvailable ? (
          <>
            <span className="text-lg font-semibold text-[var(--ember)]">
              {(price * quantity).toLocaleString()}
            </span>
            <span className="text-xs font-medium text-[rgba(196,107,46,0.7)]">
              GBP
            </span>
            {quantity > 1 && (
              <span className="ml-1 text-[10px] text-[rgba(17,24,39,0.4)]">
                ({price.toLocaleString()} each)
              </span>
            )}
          </>
        ) : (
          <span className="text-sm font-medium text-[rgba(17,24,39,0.4)]">
            Price TBA
          </span>
        )}
      </div>

      {/* Quantity selector (only if maxQuantity > 1 and available) */}
      {isAvailable && item.maxQuantity > 1 && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-xs text-[rgba(17,24,39,0.5)]">Qty:</span>
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,24,39,0.12)] text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Minus className="h-3 w-3" />
          </button>
          <span className="w-6 text-center text-sm font-semibold text-[rgba(16,25,21,0.8)]">
            {quantity}
          </span>
          <button
            onClick={() =>
              setQuantity((q) => Math.min(item.maxQuantity, q + 1))
            }
            disabled={quantity >= item.maxQuantity}
            aria-label="Increase quantity"
            className="flex h-7 w-7 items-center justify-center rounded-full border border-[rgba(17,24,39,0.12)] text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Plus className="h-3 w-3" />
          </button>
          <span className="ml-auto text-[10px] text-[rgba(17,24,39,0.35)]">
            Max {item.maxQuantity}
          </span>
        </div>
      )}

      {/* Purchase button */}
      <button
        onClick={() => onPurchase(item, quantity)}
        disabled={!isAvailable || !canAfford}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--moss-strong)] disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ShoppingCart className="h-4 w-4" />
        {item.comingSoon
          ? "Coming Soon"
          : !canAfford
            ? "Insufficient Balance"
            : "Purchase"}
      </button>

      {/* Insufficient balance warning */}
      {isAvailable && !canAfford && (
        <p className="mt-1.5 text-center text-[10px] text-[var(--ember)]">
          You need {(totalCost - balance).toLocaleString()} more GBP
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Purchase confirmation modal
// ---------------------------------------------------------------------------

function PurchaseConfirmModal({
  item,
  price,
  quantity,
  balance,
  isProcessing,
  onConfirm,
  onCancel,
}: {
  item: StoreItem;
  price: number;
  quantity: number;
  balance: number;
  isProcessing: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const totalCost = price * quantity;
  const balanceAfter = balance - totalCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div
        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-[0_24px_60px_rgba(16,25,21,0.2)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-modal-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[rgba(218,165,32,0.12)] text-2xl">
              {item.icon}
            </div>
            <div>
              <h2
                id="purchase-modal-title"
                className="font-semibold text-[rgba(16,25,21,0.85)]"
              >
                Confirm Purchase
              </h2>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">{item.name}</p>
            </div>
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

        {/* Item description */}
        <p className="mt-4 text-xs leading-relaxed text-[rgba(16,25,21,0.55)]">
          {item.description}
        </p>

        {/* Price breakdown */}
        <div className="mt-5 space-y-2.5 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-[rgba(17,24,39,0.02)] p-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Price per item</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">
              {price.toLocaleString()} GBP
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
              {totalCost.toLocaleString()} GBP
            </span>
          </div>
          <div className="border-t border-[rgba(17,24,39,0.08)]" />
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">Current balance</span>
            <span className="font-medium text-[rgba(16,25,21,0.8)]">
              {balance.toLocaleString()} GBP
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-[rgba(17,24,39,0.55)]">After purchase</span>
            <span
              className={`font-semibold ${balanceAfter >= 0 ? "text-[var(--moss)]" : "text-red-500"}`}
            >
              {balanceAfter.toLocaleString()} GBP
            </span>
          </div>
        </div>

        {/* Actions */}
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
            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--moss-strong)] disabled:cursor-not-allowed disabled:opacity-50"
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
// Purchase transaction row
// ---------------------------------------------------------------------------

function PurchaseTransactionRow({
  transaction,
}: {
  transaction: Transaction;
}) {
  const desc = (() => {
    if (transaction.source === "food_purchase") return "Purchased Food Tray";
    if (transaction.source === "hut_factory") return "Created HUT Creature";
    if (transaction.source_details?.creature_name)
      return `Purchased ${transaction.source_details.creature_name}`;
    return `Store purchase`;
  })();

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)]">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[rgba(196,107,46,0.12)] text-[var(--ember)]">
        <ArrowDownRight className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[rgba(16,25,21,0.8)]">
          {desc}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[rgba(16,25,21,0.5)]">
          <Clock className="h-3 w-3" />
          {formatDate(transaction.created_at)} at{" "}
          {formatTime(transaction.created_at)}
        </p>
      </div>
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-semibold text-[var(--ember)]">
          -{transaction.amount.toLocaleString()} pts
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// ---------------------------------------------------------------------------
// Main content component
// ---------------------------------------------------------------------------

export default function MarketplaceContent() {
  const {
    ownerKey,
    userId,
    gbpBalance,
    isLoading: userLoading,
    refreshBalance,
  } = useUserContext();
  const { cfg } = useGameConfig();

  // UI state
  const [activeCategory, setActiveCategory] = useState<StoreCategory>("all");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Purchase flow
  const [selectedItem, setSelectedItem] = useState<StoreItem | null>(null);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [purchaseError, setPurchaseError] = useState<string | null>(null);

  // Transaction history
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Price resolver
  // ---------------------------------------------------------------------------
  const getPrice = useCallback(
    (item: StoreItem): number => {
      if (!item.priceKey) return item.fallbackPrice;
      const configPrice = cfg(item.priceKey);
      return typeof configPrice === "number" ? configPrice : item.fallbackPrice;
    },
    [cfg]
  );

  // ---------------------------------------------------------------------------
  // Catalog filtering
  // ---------------------------------------------------------------------------
  const filteredItems =
    activeCategory === "all"
      ? STORE_CATALOG
      : STORE_CATALOG.filter((item) => item.category === activeCategory);

  const categoryCounts: Record<StoreCategory, number> = {
    all: STORE_CATALOG.length,
    consumables: STORE_CATALOG.filter((i) => i.category === "consumables")
      .length,
    creatures: STORE_CATALOG.filter((i) => i.category === "creatures").length,
    special: STORE_CATALOG.filter((i) => i.category === "special").length,
  };

  // ---------------------------------------------------------------------------
  // Purchase handlers
  // ---------------------------------------------------------------------------
  const handlePurchaseClick = (item: StoreItem, quantity: number) => {
    setSelectedItem(item);
    setSelectedQuantity(quantity);
    setPurchaseError(null);
  };

  const handleConfirmPurchase = async () => {
    if (!ownerKey || !selectedItem) return;
    setIsProcessing(true);
    setPurchaseError(null);

    try {
      const result = await purchaseStoreItem(
        ownerKey,
        selectedItem.id,
        selectedQuantity
      );
      setSuccessMessage(
        `Successfully purchased ${selectedQuantity}x ${selectedItem.name} for ${result.points_spent.toLocaleString()} GBP!`
      );
      setSelectedItem(null);
      await refreshBalance();
      loadTransactions();
      setTimeout(() => setSuccessMessage(null), 5000);
    } catch (err) {
      setPurchaseError(
        err instanceof Error ? err.message : "Purchase failed. Please try again."
      );
      setSelectedItem(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPurchase = () => {
    if (!isProcessing) {
      setSelectedItem(null);
    }
  };

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------
  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    await loadTransactions();
    setIsRefreshing(false);
  };

  // ---------------------------------------------------------------------------
  // Transaction history
  // ---------------------------------------------------------------------------
  const loadTransactions = useCallback(async () => {
    if (!userId) return;
    setTxLoading(true);
    setTxError(null);
    try {
      const result = await fetchTransactionHistory(userId, 50);
      const purchaseTx = result.transactions.filter(
        (tx) =>
          tx.source === "purchase" ||
          tx.source === "food_purchase" ||
          tx.source === "hut_factory"
      );
      setTransactions(purchaseTx);
    } catch (err) {
      setTxError(
        err instanceof Error ? err.message : "Failed to load purchase history"
      );
    } finally {
      setTxLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) loadTransactions();
  }, [userId, loadTransactions]);

  // ---------------------------------------------------------------------------
  // Loading state
  // ---------------------------------------------------------------------------
  if (userLoading) {
    return <LoadingSkeleton />;
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
                <Store className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl">Marketplace</h1>
            </div>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              Spend your Great Beyond Points on food, creatures, and exclusive
              items for your collection.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* GBP balance chip */}
            <div className="flex items-center gap-2 rounded-full border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] px-4 py-2">
              <Sparkles className="h-4 w-4 text-[var(--ember)]" />
              <span className="text-sm font-semibold text-[var(--ember)]">
                {gbpBalance.toLocaleString()} GBP
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-[rgba(17,24,39,0.1)] px-3 py-2 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
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
      {purchaseError && !selectedItem && (
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.08)] p-4">
          <AlertTriangle className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
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

      {/* Balance card */}
      <div className="rounded-2xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] p-5 transition-shadow hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
              Your Balance
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--ember)]">
              {gbpBalance.toLocaleString()}{" "}
              <span className="text-sm font-medium text-[rgba(196,107,46,0.7)]">
                GBP
              </span>
            </p>
          </div>
          <Link
            href="/great-beyond"
            className="flex items-center gap-1 text-xs font-semibold text-[var(--ember)] transition hover:underline"
          >
            Earn more points
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Category tabs */}
      <section>
        <CategoryTabs
          active={activeCategory}
          onChange={setActiveCategory}
          counts={categoryCounts}
        />
      </section>

      {/* Store items grid */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
            {activeCategory === "all"
              ? "All Items"
              : CATEGORIES.find((c) => c.value === activeCategory)?.label}
          </h2>
          <span className="text-xs text-[rgba(17,24,39,0.4)]">
            {filteredItems.length} item{filteredItems.length !== 1 && "s"}
          </span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-12 text-center">
            <Store className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.25)]" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No items in this category
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Check back soon for new items!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <StoreItemCard
                key={item.id}
                item={item}
                price={getPrice(item)}
                balance={gbpBalance}
                onPurchase={handlePurchaseClick}
              />
            ))}
          </div>
        )}
      </section>

      {/* In-World Store info banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
        <div>
          <p className="text-sm font-semibold text-[var(--moss)]">
            In-World Store (Second Life)
          </p>
          <p className="mt-1 text-xs leading-relaxed text-[rgba(16,25,21,0.65)]">
            Some items are only available for purchase with Linden Dollars (L$)
            inside Second Life. This includes Limited Edition creatures, Boosters
            (Resurrect, Forever, Heart Pedestal, Eternalz), Society of Shadows
            membership, and special seasonal items. Visit the in-world store to
            browse these exclusive items.
          </p>
        </div>
      </div>

      {/* Recent Purchases */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
            Recent Purchases
          </h2>
          {!txLoading && transactions.length > 0 && (
            <span className="text-xs text-[rgba(17,24,39,0.4)]">
              {transactions.length} purchase
              {transactions.length !== 1 && "s"}
            </span>
          )}
        </div>

        {txLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl bg-white p-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 rounded bg-gray-200" />
                    <div className="h-3 w-24 rounded bg-gray-200" />
                  </div>
                  <div className="h-5 w-16 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : txError ? (
          <div className="rounded-2xl border border-dashed border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.05)] p-8 text-center">
            <p className="text-sm text-[var(--ember)]">{txError}</p>
            <button
              onClick={() => loadTransactions()}
              className="mt-3 text-xs font-semibold text-[var(--moss)] hover:underline"
            >
              Try again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-12 text-center">
            <ShoppingCart className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.25)]" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No purchases yet
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Your purchase history will appear here after you buy your first
              item.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <PurchaseTransactionRow
                key={tx.transaction_id}
                transaction={tx}
              />
            ))}
          </div>
        )}
      </section>

      {/* Purchase confirmation modal */}
      {selectedItem && (
        <PurchaseConfirmModal
          item={selectedItem}
          price={getPrice(selectedItem)}
          quantity={selectedQuantity}
          balance={gbpBalance}
          isProcessing={isProcessing}
          onConfirm={handleConfirmPurchase}
          onCancel={handleCancelPurchase}
        />
      )}
    </div>
  );
}
