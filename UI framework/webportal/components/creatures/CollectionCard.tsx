"use client";

import Link from "next/link";
import { Star, PawPrint } from "lucide-react";
import type { Creature } from "@/lib/api";

export type CollectionCardProps = {
  creature: Creature;
  status: string;
  statusStyle: string;
  isFeatured: boolean;
  onToggleFeatured: (id: string) => void;
};

export function CollectionCard({
  creature,
  status,
  statusStyle,
  isFeatured,
  onToggleFeatured,
}: CollectionCardProps) {
  const birthMonth = creature.birth_date
    ? new Date(creature.birth_date).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : null;

  return (
    <div
      className={`group relative rounded-2xl border bg-white/95 transition-shadow hover:shadow-md ${
        creature.is_alive
          ? "border-[rgba(16,25,21,0.08)]"
          : "border-[rgba(16,25,21,0.06)] opacity-70"
      }`}
    >
      {/* Showcase toggle */}
      <button
        onClick={() => onToggleFeatured(creature.creature_id)}
        title={isFeatured ? "Remove from showcase" : "Add to showcase"}
        aria-label={isFeatured ? "Remove from showcase" : "Add to showcase"}
        className={`absolute right-2 top-2 z-10 rounded-full p-1.5 transition ${
          isFeatured
            ? "text-[var(--ember)]"
            : "text-[rgba(16,25,21,0.2)] opacity-0 group-hover:opacity-100"
        }`}
      >
        <Star
          className={`h-3.5 w-3.5 ${isFeatured ? "fill-current" : ""}`}
        />
      </button>

      <Link
        href={`/creatures/${creature.creature_id}`}
        className="block p-4"
      >
        <div className="flex items-center gap-3">
          {/* Emoji avatar */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[rgba(45,93,49,0.1)] to-[rgba(218,165,32,0.1)]">
            {creature.is_alive ? (
              <PawPrint className={`h-5 w-5 text-[var(--moss)] ${creature.is_decorative ? "" : "animate-gentle-pulse"}`} />
            ) : (
              <PawPrint className="h-5 w-5 text-[rgba(17,24,39,0.2)]" />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{creature.name}</p>
            <p className="text-xs text-[rgba(16,25,21,0.55)]">
              {creature.creature_type}
            </p>
          </div>

          <span
            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${statusStyle}`}
          >
            {status}
          </span>
        </div>

        {/* Mini stats */}
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-[rgba(16,25,21,0.5)]">
          <span>Age {creature.age}d</span>
          {creature.is_alive && !creature.is_decorative && (
            <>
              <span>·</span>
              <span>{creature.munchiez}% Munchiez</span>
            </>
          )}
          {birthMonth && (
            <>
              <span>·</span>
              <span>Born {birthMonth}</span>
            </>
          )}
        </div>
      </Link>
    </div>
  );
}
