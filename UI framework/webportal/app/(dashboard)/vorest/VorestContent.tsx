"use client";

import Link from "next/link";
import {
  Trees,
  PawPrint,
  UtensilsCrossed,
  Sparkles,
  ArrowRightLeft,
  Heart,
  RefreshCw,
} from "lucide-react";
import { useVorestContext } from "@/contexts/VorestContext";
import { useUserContext } from "@/contexts/UserContext";

export default function VorestContent() {
  const {
    creatures,
    summary,
    isLoading,
    isRefreshing,
    error,
    lastUpdated,
    refetch,
    foodSummary,
    foodLoading,
    boosterSummary,
    boosterLoading,
    vbucks,
  } = useVorestContext();
  const { isLoading: userLoading } = useUserContext();

  const stats = [
    {
      label: "Vorest Creatures",
      value: isLoading ? "-" : String(summary?.alive ?? 0),
      helper: isLoading ? "Loading..." : summary?.alive === 0 ? "Send creatures from SL" : "Living in the Vorest",
      tone: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
      accent: "border-t-[rgba(45,93,49,0.5)]",
      icon: <PawPrint className="h-5 w-5" />,
    },
    {
      label: "Food Items",
      value: foodLoading ? "-" : String(foodSummary?.active ?? 0),
      helper: foodLoading ? "Loading..." : foodSummary?.active === 0 ? "Purchase from shop" : "Available for feeding",
      tone: "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]",
      accent: "border-t-[rgba(218,165,32,0.5)]",
      icon: <UtensilsCrossed className="h-5 w-5" />,
    },
    {
      label: "Boosters",
      value: boosterLoading ? "-" : String(boosterSummary?.unused ?? 0),
      helper: boosterLoading ? "Loading..." : "Unused boosters",
      tone: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]",
      accent: "border-t-[rgba(139,69,19,0.5)]",
      icon: <Sparkles className="h-5 w-5" />,
    },
    {
      label: "Vbucks Balance",
      value: userLoading ? "-" : vbucks.toLocaleString(),
      helper: "Purchase Vbucks in SL",
      tone: "bg-[rgba(45,93,49,0.08)] text-[var(--moss)]",
      accent: "border-t-[rgba(45,93,49,0.3)]",
      icon: <Trees className="h-5 w-5" />,
    },
  ];

  const quickActions = [
    {
      label: "View Creatures",
      description: "See all your Vorest creatures",
      href: "/vorest/creatures",
      icon: <PawPrint className="h-5 w-5" />,
    },
    {
      label: "Transfer to Vorest",
      description: "Send SL creatures to the Vorest",
      href: "/vorest/transfer",
      icon: <ArrowRightLeft className="h-5 w-5" />,
    },
    {
      label: "Vorest Shop",
      description: "Buy food and boosters",
      href: "/vorest/shop",
      icon: <UtensilsCrossed className="h-5 w-5" />,
    },
    {
      label: "Breeding",
      description: "Breed Vorest creatures together",
      href: "/vorest/breeding",
      icon: <Heart className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Vorest</h1>
            <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
              Virtual Forest — your creatures live, eat, breed, and grow here.
            </p>
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
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-2xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-4 text-sm text-[var(--ember)]">
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="animate-stagger grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-5 shadow-sm ${stat.accent} border-t-4`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[rgba(17,24,39,0.5)]">
                {stat.label}
              </p>
              <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full ${stat.tone}`}>
                {stat.icon}
              </span>
            </div>
            <p className="mt-3 text-3xl font-bold text-[var(--ink)]">{stat.value}</p>
            <p className="mt-1 text-xs text-[rgba(17,24,39,0.5)]">{stat.helper}</p>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="mb-4 font-display text-2xl">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group flex flex-col gap-3 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-5 shadow-sm transition-all hover:border-[rgba(45,93,49,0.3)] hover:shadow-md"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
                {action.icon}
              </span>
              <div>
                <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--moss)]">
                  {action.label}
                </p>
                <p className="mt-0.5 text-xs text-[rgba(17,24,39,0.5)]">
                  {action.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Vorest Creatures */}
      {!isLoading && creatures.length > 0 && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-2xl">Recent Vorest Creatures</h2>
            <Link
              href="/vorest/creatures"
              className="text-sm font-medium text-[var(--moss)] hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creatures.slice(0, 6).map((creature) => (
              <Link
                key={creature.creature_id}
                href={`/vorest/creatures/${creature.creature_id}`}
                className={`group rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-5 shadow-sm transition-all hover:border-[rgba(45,93,49,0.3)] hover:shadow-md ${
                  !creature.is_alive ? "opacity-60" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-[var(--ink)] group-hover:text-[var(--moss)]">{creature.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      creature.is_alive
                        ? "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
                        : "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.5)]"
                    }`}
                  >
                    {creature.is_alive ? "Alive" : "Dead"}
                  </span>
                </div>
                <p className="mt-1 text-xs text-[rgba(17,24,39,0.5)]">
                  {creature.creature_type}
                </p>
                <div className="mt-3 flex gap-4 text-xs text-[rgba(17,24,39,0.6)]">
                  <span>Age: {creature.age}</span>
                  <span>Munchiez: {creature.munchiez}</span>
                </div>
                {creature.is_paired && (
                  <p className="mt-2 text-xs font-medium text-[rgba(139,69,19,0.8)]">
                    Breeding in progress
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && creatures.length === 0 && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-[rgba(17,24,39,0.15)] bg-white p-12 text-center">
          <Trees className="h-12 w-12 text-[rgba(45,93,49,0.4)]" />
          <div>
            <p className="font-display text-2xl">
              Your Vorest is empty
            </p>
            <p className="mt-1 text-sm text-[rgba(17,24,39,0.5)]">
              Send creatures from Second Life to start building your virtual forest.
            </p>
          </div>
          <Link
            href="/vorest/transfer"
            className="rounded-full bg-[var(--moss)] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[rgba(45,93,49,0.85)]"
          >
            Transfer Creatures
          </Link>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <p className="text-center text-xs text-[rgba(17,24,39,0.4)]">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
