"use client";

import {
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Info,
  ChevronRight,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react";
import { useUserContext } from "@/contexts/UserContext";
import {
  fetchTransactionHistory,
  type Transaction,
  type TransactionType,
} from "@/lib/api";
import { formatDate } from "@/lib/format";

// Transaction type configuration
const TYPE_CONFIG: Record<
  TransactionType,
  { icon: React.ReactNode; color: string; prefix: string }
> = {
  earned: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    color: "text-[var(--moss)] bg-[rgba(45,93,49,0.12)]",
    prefix: "+",
  },
  spent: {
    icon: <ArrowDownRight className="h-4 w-4" />,
    color: "text-[var(--ember)] bg-[rgba(196,107,46,0.12)]",
    prefix: "-",
  },
};

function formatDescription(tx: Transaction): string {
  const details = tx.source_details;
  if (tx.source === "great_beyond" && details) {
    const name = details.creature_name || "a creature";
    if (details.death_reason === "old_age") {
      return `Sent ${name} to the Great Beyond (old age)`;
    } else if (details.death_reason === "starvation") {
      return `Sent ${name} to the Great Beyond (starvation)`;
    }
    if (details.is_decorative) {
      return `Sent ${name} to the Great Beyond (decorative)`;
    }
    return `Sent ${name} to the Great Beyond`;
  }
  if (tx.source === "token_conversion") {
    return `Redeemed coins/tokens for ${tx.amount} points`;
  }
  if (tx.source === "purchase") {
    return `Spent ${tx.amount} points on purchase`;
  }
  return `${tx.type === "earned" ? "Earned" : "Spent"} ${tx.amount} points`;
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

// Loading Skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Balance Cards Skeleton */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse rounded-2xl bg-white p-6">
            <div className="h-4 w-24 rounded bg-gray-200" />
            <div className="mt-3 h-8 w-20 rounded bg-gray-200" />
            <div className="mt-2 h-3 w-32 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      {/* Transaction Skeleton */}
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
    </div>
  );
}

// Balance Card Component
function BalanceCard({
  title,
  value,
  subtitle,
  icon,
  accentColor,
  action,
  isLoading,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  accentColor: "gold" | "moss";
  action?: {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
  };
  isLoading?: boolean;
}) {
  const colorClasses = {
    gold: {
      border: "border-[rgba(218,165,32,0.3)]",
      bg: "bg-[rgba(218,165,32,0.08)]",
      iconBg: "bg-[rgba(218,165,32,0.22)]",
      text: "text-[var(--ember)]",
      button:
        "border-[rgba(139,69,19,0.45)] text-[var(--ember)] hover:bg-[rgba(218,165,32,0.12)]",
    },
    moss: {
      border: "border-[rgba(45,93,49,0.2)]",
      bg: "bg-[rgba(45,93,49,0.06)]",
      iconBg: "bg-[rgba(45,93,49,0.12)]",
      text: "text-[var(--moss)]",
      button:
        "border-[rgba(45,93,49,0.35)] text-[var(--moss)] hover:bg-[rgba(45,93,49,0.08)]",
    },
  };

  const colors = colorClasses[accentColor];

  return (
    <div
      className={`rounded-2xl border ${colors.border} ${colors.bg} p-5 transition-shadow hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${colors.iconBg} ${colors.text}`}
        >
          {icon}
        </div>
      </div>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
        {title}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${colors.text}`}>
        {isLoading ? "..." : value}
      </p>
      <p className="mt-1 text-xs text-[rgba(17,24,39,0.5)]">{subtitle}</p>
      {action && (
        <button
          onClick={action.onClick}
          disabled={action.disabled || action.loading}
          className={`mt-4 flex w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${colors.button}`}
        >
          {action.loading ? (
            <>
              <Loader2 className="h-3 w-3 animate-spin" />
              Redeeming...
            </>
          ) : (
            action.label
          )}
        </button>
      )}
    </div>
  );
}

// Earn Info Card Component
function EarnInfoCard({
  icon,
  title,
  points,
  linkHref,
  linkLabel,
}: {
  icon: string;
  title: string;
  points: string[];
  linkHref: string;
  linkLabel: string;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-5">
      <div className="flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        <h3 className="font-semibold text-[rgba(17,24,39,0.8)]">{title}</h3>
      </div>
      <ul className="mt-3 space-y-1.5">
        {points.map((point, i) => (
          <li
            key={i}
            className="flex items-start gap-2 text-xs text-[rgba(17,24,39,0.6)]"
          >
            <span className="mt-0.5 h-1 w-1 flex-shrink-0 rounded-full bg-[rgba(17,24,39,0.3)]" />
            {point}
          </li>
        ))}
      </ul>
      <Link
        href={linkHref}
        className="mt-4 flex items-center gap-1 text-xs font-semibold text-[var(--moss)] transition hover:underline"
      >
        {linkLabel}
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  );
}

// Transaction Row Component
function TransactionRow({ transaction }: { transaction: Transaction }) {
  const config = TYPE_CONFIG[transaction.type] || TYPE_CONFIG.earned;

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-[rgba(16,25,21,0.08)] bg-white/95 p-4 transition hover:border-[rgba(16,25,21,0.15)] hover:shadow-[0_4px_12px_rgba(16,25,21,0.06)]">
      {/* Icon */}
      <div
        className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${config.color}`}
      >
        {config.icon}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-[rgba(16,25,21,0.8)]">
          {formatDescription(transaction)}
        </p>
        <p className="mt-0.5 flex items-center gap-1.5 text-xs text-[rgba(16,25,21,0.5)]">
          <Clock className="h-3 w-3" />
          {formatDate(transaction.created_at)} at{" "}
          {formatTime(transaction.created_at)}
        </p>
      </div>

      {/* Amount */}
      <div className="flex-shrink-0 text-right">
        <p className={`text-sm font-semibold ${config.color.split(" ")[0]}`}>
          {config.prefix}
          {transaction.amount} pts
        </p>
      </div>
    </div>
  );
}

export default function GreatBeyondContent() {
  const {
    userId,
    ownerKey,
    gbpBalance,
    tokens,
    rareTokens,
    isLoading: userLoading,
    refreshBalance,
  } = useUserContext();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRedeemingTokens, setIsRedeemingTokens] = useState(false);
  const [isRedeemingRare, setIsRedeemingRare] = useState(false);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txError, setTxError] = useState<string | null>(null);
  const [lastKey, setLastKey] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadTransactions = useCallback(
    async (append = false, paginationKey?: string) => {
      if (!userId) return;
      try {
        if (append) {
          setLoadingMore(true);
        } else {
          setTxLoading(true);
          setTxError(null);
        }
        const result = await fetchTransactionHistory(
          userId,
          10,
          paginationKey
        );
        setTransactions((prev) =>
          append ? [...prev, ...result.transactions] : result.transactions
        );
        setLastKey(result.lastKey);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load transactions";
        if (!append) setTxError(message);
      } finally {
        setTxLoading(false);
        setLoadingMore(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    if (userId) {
      loadTransactions();
    }
  }, [userId, loadTransactions]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    await loadTransactions();
    setIsRefreshing(false);
  };

  const handleLoadMore = () => {
    if (lastKey && !loadingMore) {
      loadTransactions(true, lastKey);
    }
  };

  const handleRedeemTokens = async () => {
    if (tokens <= 0) return;
    setIsRedeemingTokens(true);
    // TODO: Call redeemTokens API
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await refreshBalance();
    setIsRedeemingTokens(false);
  };

  const handleRedeemRareTokens = async () => {
    if (rareTokens <= 0) return;
    setIsRedeemingRare(true);
    // TODO: Call redeemTokens API with rare_token type
    await new Promise((resolve) => setTimeout(resolve, 1000));
    await refreshBalance();
    setIsRedeemingRare(false);
  };

  if (userLoading) {
    return (
      <div className="space-y-6">
        <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-gray-200" />
        </header>
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-3xl bg-white/90 p-6 shadow-[0_18px_50px_rgba(16,25,21,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(218,165,32,0.22)] text-[var(--ember)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h1 className="font-display text-3xl">Great Beyond</h1>
            </div>
            <p className="mt-2 text-sm text-[rgba(16,25,21,0.6)]">
              Earn points by sending creatures to the afterlife and redeem
              coins and tokens from deliveries.
            </p>
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
      </header>

      {/* Balance Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <BalanceCard
          title="Great Beyond Points"
          value={`${gbpBalance.toLocaleString()} GBP`}
          subtitle="Total points earned"
          icon={<Sparkles className="h-5 w-5" />}
          accentColor="gold"
          isLoading={userLoading}
        />
        <BalanceCard
          title="Coins"
          value={tokens.toString()}
          subtitle={`= ${tokens * 10} points`}
          icon={<span className="text-lg">🪙</span>}
          accentColor="gold"
          isLoading={userLoading}
          action={{
            label: tokens > 0 ? `Redeem All (${tokens * 10} pts)` : "No coins",
            onClick: handleRedeemTokens,
            disabled: tokens <= 0,
            loading: isRedeemingTokens,
          }}
        />
        <BalanceCard
          title="Tokens"
          value={rareTokens.toString()}
          subtitle={`= ${rareTokens * 100} points`}
          icon={<span className="text-lg">💎</span>}
          accentColor="gold"
          isLoading={userLoading}
          action={{
            label:
              rareTokens > 0
                ? `Redeem All (${rareTokens * 100} pts)`
                : "No tokens",
            onClick: handleRedeemRareTokens,
            disabled: rareTokens <= 0,
            loading: isRedeemingRare,
          }}
        />
      </div>

      {/* How to Earn Section */}
      <section>
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
          How to Earn Points
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <EarnInfoCard
            icon="💀"
            title="Send to Great Beyond"
            points={[
              "Old age death: 1 point per day lived (max 100)",
              "Starvation death: 25 points",
              "5% chance to win a memorial item",
            ]}
            linkHref="/creatures"
            linkLabel="View your creatures"
          />
          <EarnInfoCard
            icon="🎁"
            title="Creature Deliveries"
            points={[
              "Creatures deliver items every 12 days",
              "Coin = 10 points",
              "Token = 100 points",
            ]}
            linkHref="/mailbox"
            linkLabel="Check your mailbox"
          />
        </div>
      </section>

      {/* Marketplace Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
        <div className="flex-1">
          <p className="text-sm font-semibold text-[var(--ember)]">
            Spend Your Points
          </p>
          <p className="mt-1 text-xs text-[rgba(16,25,21,0.65)]">
            Visit the Marketplace to spend your Great Beyond Points on food,
            creatures, and exclusive items.
          </p>
          <Link
            href="/marketplace"
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[var(--ember)] transition hover:underline"
          >
            Go to Marketplace
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
      </div>

      {/* Transaction History */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-[rgba(17,24,39,0.5)]">
            Transaction History
          </h2>
          {!txLoading && (
            <span className="text-xs text-[rgba(17,24,39,0.4)]">
              {transactions.length} transaction{transactions.length !== 1 && "s"}
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
            <Clock className="mx-auto h-12 w-12 text-[rgba(16,25,21,0.25)]" />
            <p className="mt-4 text-sm font-semibold text-[rgba(16,25,21,0.6)]">
              No transactions yet
            </p>
            <p className="mt-2 text-xs text-[rgba(16,25,21,0.5)]">
              Send creatures to the Great Beyond or redeem coins and tokens to see your
              history.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map((tx) => (
              <TransactionRow key={tx.transaction_id} transaction={tx} />
            ))}
          </div>
        )}

        {/* Load More */}
        {lastKey && !txLoading && (
          <div className="mt-4 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="rounded-full border border-[rgba(17,24,39,0.1)] px-6 py-2 text-sm font-semibold text-[rgba(17,24,39,0.6)] transition hover:bg-[rgba(17,24,39,0.05)] disabled:opacity-50"
            >
              {loadingMore ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
