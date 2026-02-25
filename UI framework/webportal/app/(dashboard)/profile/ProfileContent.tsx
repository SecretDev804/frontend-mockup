"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  Coins,
  Copy,
  Gem,
  Key,
  Mail,
  PawPrint,
  Shield,
  Sparkles,
  User,
} from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { useCreatureContext } from "@/contexts/CreatureContext";

const statusConfig: Record<string, { label: string; style: string }> = {
  verified: {
    label: "Verified",
    style: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
  },
  sl_only: {
    label: "SL Only",
    style: "bg-[rgba(218,165,32,0.22)] text-[var(--gold)]",
  },
  pending: {
    label: "Pending",
    style: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  },
};

function truncateId(id: string): string {
  if (id.length <= 16) return id;
  return `${id.slice(0, 8)}...${id.slice(-4)}`;
}

export default function ProfileContent() {
  const {
    avatarName,
    email,
    accountStatus,
    ownerKey,
    userId,
    gbpBalance,
    tokens,
    rareTokens,
    isLoading,
    error,
  } = useUserContext();

  const {
    summary,
    isLoading: creaturesLoading,
  } = useCreatureContext();

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const status = statusConfig[accountStatus || "pending"] || statusConfig.pending;

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-48 animate-pulse rounded bg-gray-200" />
        </section>
        <section className="dashboard-card rounded-2xl p-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
            <div className="space-y-3">
              <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </section>
        <section className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="dashboard-card rounded-2xl p-5">
              <div className="h-12 w-12 animate-pulse rounded-2xl bg-gray-200" />
              <div className="mt-3 h-6 w-20 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <h1 className="font-display text-3xl">Profile</h1>
        </section>
        <div className="flex items-center gap-3 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] p-6">
          <Shield className="h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <p className="text-sm font-medium text-[var(--ember)]">{error}</p>
        </div>
      </div>
    );
  }

  const initial = avatarName ? avatarName.charAt(0).toUpperCase() : "?";

  const economyStats = [
    {
      label: "GBP Balance",
      value: gbpBalance.toLocaleString(),
      helper: "Great Beyond Points",
      tone: "bg-[rgba(218,165,32,0.2)] text-[var(--gold)]",
      accent: "border-t-[rgba(218,165,32,0.6)]",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Tokens",
      value: tokens.toLocaleString(),
      helper: "From deliveries",
      tone: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]",
      accent: "border-t-[rgba(139,69,19,0.5)]",
      icon: <Coins className="h-5 w-5" />,
    },
    {
      label: "Rare Tokens",
      value: rareTokens.toLocaleString(),
      helper: "From rare deliveries",
      tone: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
      accent: "border-t-[rgba(45,93,49,0.5)]",
      icon: <Gem className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
          {avatarName || "Your account overview"}
        </p>
      </section>

      {/* Profile Info Card */}
      <section className="dashboard-card rounded-2xl p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
          {/* Avatar initial */}
          <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(45,93,49,0.12)] text-3xl font-bold text-[var(--moss)]">
            {initial}
          </div>

          <div className="min-w-0 flex-1 space-y-4">
            {/* Name and status */}
            <div className="flex flex-wrap items-center gap-3">
              <h2 className="font-display text-2xl">
                {avatarName || "Unknown"}
              </h2>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${status.style}`}
              >
                {status.label}
              </span>
            </div>

            {/* Details grid */}
            <div className="grid gap-3 sm:grid-cols-2">
              {/* Email */}
              {email && (
                <div className="flex items-center gap-2 text-sm text-[rgba(17,24,39,0.6)]">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{email}</span>
                </div>
              )}

              {/* SL Avatar Key */}
              {ownerKey && (
                <div className="flex items-center gap-2 text-sm text-[rgba(17,24,39,0.6)]">
                  <Key className="h-4 w-4 flex-shrink-0" />
                  <span className="font-mono text-xs">
                    {truncateId(ownerKey)}
                  </span>
                  <button
                    onClick={() => handleCopy(ownerKey, "ownerKey")}
                    className="flex-shrink-0 rounded p-1 transition hover:bg-[rgba(17,24,39,0.05)]"
                    aria-label="Copy SL avatar key"
                  >
                    {copiedField === "ownerKey" ? (
                      <Check className="h-3.5 w-3.5 text-[var(--moss)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[rgba(17,24,39,0.4)]" />
                    )}
                  </button>
                </div>
              )}

              {/* User ID */}
              {userId && (
                <div className="flex items-center gap-2 text-sm text-[rgba(17,24,39,0.6)]">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="font-mono text-xs">
                    {truncateId(userId)}
                  </span>
                  <button
                    onClick={() => handleCopy(userId, "userId")}
                    className="flex-shrink-0 rounded p-1 transition hover:bg-[rgba(17,24,39,0.05)]"
                    aria-label="Copy user ID"
                  >
                    {copiedField === "userId" ? (
                      <Check className="h-3.5 w-3.5 text-[var(--moss)]" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-[rgba(17,24,39,0.4)]" />
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Economy Overview */}
      <section className="grid gap-4 md:grid-cols-3">
        {economyStats.map((stat) => (
          <div
            key={stat.label}
            className={`dashboard-card flex items-center gap-4 rounded-2xl border-t-4 p-5 transition hover:border-[rgba(17,24,39,0.15)] ${stat.accent}`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${stat.tone}`}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
                {stat.label}
              </p>
              <p className="mt-3 text-2xl font-semibold">{stat.value}</p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.55)]">
                {stat.helper}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Creature Summary */}
      <section className="dashboard-card rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
              <PawPrint className="h-5 w-5" />
            </div>
            <h3 className="font-display text-xl">Creature Summary</h3>
          </div>
          <Link
            href="/creatures"
            className="text-sm font-semibold text-[var(--moss)] transition hover:text-[var(--moss-strong)]"
          >
            View All
          </Link>
        </div>

        {creaturesLoading ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="dashboard-chip rounded-xl p-3">
                <div className="h-3 w-16 animate-pulse rounded bg-gray-200" />
                <div className="mt-3 h-6 w-10 animate-pulse rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : summary ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="dashboard-chip rounded-xl p-3">
              <p className="text-xs text-[rgba(16,25,21,0.55)]">Total</p>
              <p className="mt-2 text-lg font-semibold">{summary.total}</p>
            </div>
            <div className="dashboard-chip rounded-xl p-3">
              <p className="text-xs text-[rgba(16,25,21,0.55)]">Alive</p>
              <p className="mt-2 text-lg font-semibold text-[var(--moss)]">
                {summary.alive}
              </p>
            </div>
            <div className="dashboard-chip rounded-xl p-3">
              <p className="text-xs text-[rgba(16,25,21,0.55)]">Deceased</p>
              <p className="mt-2 text-lg font-semibold text-[rgba(17,24,39,0.5)]">
                {summary.dead}
              </p>
            </div>
            <div className="dashboard-chip rounded-xl p-3">
              <p className="text-xs text-[rgba(16,25,21,0.55)]">
                Breeding Ready
              </p>
              <p className="mt-2 text-lg font-semibold text-[var(--ember)]">
                {summary.breeding_ready}
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
            <p className="text-sm text-[rgba(16,25,21,0.6)]">
              No creature data available.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
