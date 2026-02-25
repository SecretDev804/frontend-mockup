"use client";

import Link from "next/link";
import {
  AlertTriangle,
  Mail,
  PawPrint,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { useCreatureContext } from "@/contexts/CreatureContext";
import { useMailboxContext } from "@/contexts/MailboxContext";
import { useGameConfig } from "@/contexts/GameConfigContext";
import { getStatusLabel, STATUS_STYLES } from "@/components/ui/StatusBadge";

function getDeliveryProgress(deliveryDays: number, deliveryInterval: number): number {
  const progress = ((deliveryInterval - deliveryDays) / deliveryInterval) * 100;
  return Math.max(0, Math.min(100, progress));
}

const activityFeed = [
  {
    title: "Creature stats synced from Second Life",
    time: "Just now",
  },
  {
    title: "Dashboard refreshed automatically",
    time: "5 minutes ago",
  },
];

export default function DashboardContent() {
  const { creatures, summary, isLoading, isRefreshing, refetch, lastUpdated } =
    useCreatureContext();
  const { itemCount: mailboxItemCount, isLoading: mailboxLoading } = useMailboxContext();
  const { cfg } = useGameConfig();

  const maxAge = cfg("creature_max_age") as number;
  const deliveryInterval = cfg("delivery_interval") as number;
  const endOfLifeAge = maxAge - 10;

  const displayCreatures = creatures.slice(0, 3);

  const stats = [
    {
      label: "Active Creatures",
      value: isLoading ? "-" : String(summary?.alive ?? 0),
      helper: "Alive and synced",
      tone: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
      accent: "border-t-[rgba(45,93,49,0.5)]",
      icon: <PawPrint className="h-5 w-5" />,
    },
    {
      label: "Mailbox Items",
      value: mailboxLoading ? "-" : String(mailboxItemCount),
      helper: mailboxLoading ? "Loading..." : mailboxItemCount === 0 ? "All claimed" : "Unclaimed",
      tone: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]",
      accent: "border-t-[rgba(139,69,19,0.5)]",
      icon: <Mail className="h-5 w-5" />,
    },
    {
      label: "Need Feeding",
      value: isLoading ? "-" : String(summary?.hungry ?? 0),
      helper: summary?.hungry ? "Attention needed" : "All fed",
      tone: "bg-[rgba(218,165,32,0.2)] text-[var(--gold)]",
      accent: "border-t-[rgba(218,165,32,0.6)]",
      icon: <AlertTriangle className="h-5 w-5" />,
    },
    {
      label: "Breeding Ready",
      value: isLoading ? "-" : String(summary?.breeding_ready ?? 0),
      helper: "Can breed",
      tone: "bg-[rgba(218,165,32,0.2)] text-[var(--ember)]",
      accent: "border-t-[rgba(139,69,19,0.5)]",
      icon: <Sparkles className="h-5 w-5" />,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl">Dashboard</h1>
            <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
              {summary
                ? `You have ${summary.total} creature${summary.total !== 1 ? "s" : ""}`
                : "Loading your creatures..."}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lastUpdated && (
              <span className="text-xs text-[rgba(16,25,21,0.5)]">
                Updated {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={refetch}
              disabled={isRefreshing}
              className="flex items-center gap-2 rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3 w-3 ${isRefreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <Link
              href="/creatures"
              className="rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)]"
            >
              My Creatures
            </Link>
          </div>
        </div>
      </section>

      <section className="animate-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
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

      {summary && summary.hungry > 0 && (
        <section className="rounded-2xl border border-[rgba(218,165,32,0.5)] bg-[rgba(251,243,214,0.9)] p-4 shadow-[0_12px_30px_rgba(139,69,19,0.12)]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(218,165,32,0.2)] text-[var(--ember)]">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--ember)]">
                  {summary.hungry} creature{summary.hungry > 1 ? "s need" : " needs"}{" "}
                  feeding!
                </p>
                <p className="text-xs text-[rgba(17,24,39,0.65)]">
                  Feed them in Second Life before they starve.
                </p>
              </div>
            </div>
            <Link
              href="/creatures"
              className="rounded-full bg-[var(--ember)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[rgb(111,55,15)]"
            >
              View Creatures
            </Link>
          </div>
        </section>
      )}

      <section className="grid gap-6 lg:grid-cols-[2.2fr_1fr]">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">My Creatures</h2>
            <Link
              href="/creatures"
              className="text-sm font-semibold text-[var(--moss)] transition hover:text-[var(--moss-strong)]"
            >
              View All
            </Link>
          </div>

          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="dashboard-card overflow-hidden rounded-2xl"
                >
                  <div className="h-40 w-full animate-shimmer" />
                  <div className="space-y-3 p-4">
                    <div className="h-4 w-24 animate-pulse rounded bg-[rgba(16,25,21,0.08)]" />
                    <div className="space-y-2">
                      {[1, 2, 3].map((j) => (
                        <div
                          key={j}
                          className="h-2 w-full animate-pulse rounded bg-[rgba(16,25,21,0.08)]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : displayCreatures.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 p-8 text-center">
              <p className="text-sm text-[rgba(16,25,21,0.6)]">
                No creatures found. Rez a creature in Second Life to get
                started!
              </p>
            </div>
          ) : (
            <div className="animate-stagger grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {displayCreatures.map((creature) => {
                const status = getStatusLabel(creature, endOfLifeAge);
                const deliveryProgress = getDeliveryProgress(
                  creature.delivery_days,
                  deliveryInterval
                );
                return (
                  <Link
                    key={creature.creature_id}
                    href={`/creatures/${creature.creature_id}`}
                    className="dashboard-card overflow-hidden rounded-2xl transition-transform hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(16,25,21,0.12)]"
                  >
                    <div className="flex h-40 w-full items-center justify-center bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
                      {creature.is_alive ? (
                        <PawPrint className={`h-12 w-12 text-[var(--moss)] ${creature.is_decorative ? "" : "animate-gentle-pulse"}`} />
                      ) : (
                        <PawPrint className="h-12 w-12 text-[rgba(17,24,39,0.2)]" />
                      )}
                    </div>
                    <div className="space-y-3 p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold">
                            {creature.name}
                          </p>
                          <p className="text-xs text-[rgba(16,25,21,0.6)]">
                            {creature.creature_type}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                            STATUS_STYLES[status] ??
                            "bg-[rgba(16,25,21,0.08)] text-[rgba(16,25,21,0.6)]"
                          }`}
                        >
                          {status}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-[rgba(16,25,21,0.65)]">
                        <div>
                          <div className="flex items-center justify-between">
                            <span>Age</span>
                            <span className="font-semibold text-[var(--moss)]">
                              {creature.age}/{maxAge} days
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={creature.age}
                            aria-valuemin={0}
                            aria-valuemax={maxAge}
                            aria-label={`Age: ${creature.age} of ${maxAge} days`}
                            className="mt-2 h-2 w-full rounded-full bg-[rgba(17,24,39,0.12)]"
                          >
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

                        <div>
                          <div className="flex items-center justify-between">
                            <span>Munchiez</span>
                            <span className="font-semibold text-[var(--gold)]">
                              {creature.munchiez}%
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={creature.munchiez}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Munchiez: ${creature.munchiez}%`}
                            className="mt-2 h-2 w-full rounded-full bg-[rgba(17,24,39,0.12)]"
                          >
                            <div
                              className="h-2 rounded-full bg-[var(--gold)]"
                              style={{ width: `${creature.munchiez}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between">
                            <span>Delivery</span>
                            <span className="font-semibold text-[var(--ember)]">
                              {Math.round(deliveryProgress)}%
                            </span>
                          </div>
                          <div
                            role="progressbar"
                            aria-valuenow={Math.round(deliveryProgress)}
                            aria-valuemin={0}
                            aria-valuemax={100}
                            aria-label={`Delivery progress: ${Math.round(deliveryProgress)}%`}
                            className="mt-2 h-2 w-full rounded-full bg-[rgba(17,24,39,0.12)]"
                          >
                            <div
                              className="h-2 rounded-full bg-[var(--ember)]"
                              style={{ width: `${deliveryProgress}%` }}
                            />
                          </div>
                        </div>

                        <div className="pt-2 text-[rgba(16,25,21,0.55)]">
                          {creature.is_alive
                            ? `Next delivery in ${creature.delivery_days} days`
                            : `Died from ${creature.death_reason?.replace("_", " ")}`}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}

          <div className="dashboard-card rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold">Quick Actions</p>
                <p className="text-xs text-[rgba(16,25,21,0.6)]">
                  Manage your creatures from Second Life
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/creatures"
                  className="rounded-full bg-[var(--moss)] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[var(--moss-strong)]"
                >
                  View Creatures
                </Link>
                <Link
                  href="/mailbox"
                  className="rounded-full border border-[rgba(45,93,49,0.35)] px-4 py-2 text-xs font-semibold text-[var(--moss)] transition hover:border-[rgba(45,93,49,0.6)] hover:bg-[rgba(45,93,49,0.08)]"
                >
                  Check Mailbox
                </Link>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="dashboard-card rounded-2xl p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Activity Feed</h3>
              <span className="text-xs uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
                Live
              </span>
            </div>
            <div className="mt-4 space-y-4">
              {activityFeed.map((item, index) => (
                <div key={`${item.title}-${index}`} className="space-y-1">
                  <p className="text-sm text-[rgba(16,25,21,0.75)]">
                    {item.title}
                  </p>
                  <p className="text-xs text-[rgba(16,25,21,0.5)]">
                    {item.time}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="dashboard-card rounded-2xl p-5">
            <h4 className="text-sm font-semibold">Creature Statistics</h4>
            <div className="mt-4 grid gap-3">
              <div className="dashboard-chip rounded-xl p-3">
                <p className="text-xs text-[rgba(16,25,21,0.55)]">
                  Total Creatures
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {isLoading ? "-" : summary?.total ?? 0}
                </p>
                <p className="text-xs text-[rgba(47,91,72,0.8)]">
                  {summary?.alive ?? 0} alive, {summary?.dead ?? 0} deceased
                </p>
              </div>
              <div className="dashboard-chip rounded-xl p-3">
                <p className="text-xs text-[rgba(16,25,21,0.55)]">
                  Breeding Ready
                </p>
                <p className="mt-2 text-lg font-semibold">
                  {isLoading ? "-" : summary?.breeding_ready ?? 0}
                </p>
                <p className="text-xs text-[rgba(47,91,72,0.8)]">
                  Can start breeding
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
