"use client";

import { useState } from "react";
import {
  Baby,
  ChevronDown,
  Clock,
  Drumstick,
  Gem,
  Gift,
  Heart,
  HelpCircle,
  Info,
  Mail,
  Package,
  PawPrint,
  Percent,
  Shield,
  Sparkles,
  Store,
  Swords,
  Timer,
  Utensils,
  Zap,
} from "lucide-react";
import { useGameConfig } from "@/contexts/GameConfigContext";

type FaqItem = {
  q: string;
  a: string;
};

type GuideSection = {
  id: string;
  title: string;
  icon: React.ReactNode;
  accent: string;
  content: React.ReactNode;
};

function Accordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="divide-y divide-[rgba(17,24,39,0.06)]">
      {items.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left text-sm font-semibold text-[rgba(16,25,21,0.8)] transition hover:text-[var(--moss)]"
              aria-expanded={isOpen}
            >
              <span>{item.q}</span>
              <ChevronDown
                className={`h-4 w-4 flex-shrink-0 text-[rgba(17,24,39,0.35)] transition-transform ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            {isOpen && (
              <div className="pb-4 text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
                {item.a}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatRow({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-[rgba(16,25,21,0.6)]">{label}</span>
      <div className="text-right">
        <span className="text-sm font-semibold">{value}</span>
        {note && (
          <p className="mt-0.5 text-xs text-[rgba(16,25,21,0.45)]">{note}</p>
        )}
      </div>
    </div>
  );
}

function DropTable({
  title,
  rows,
}: {
  title: string;
  rows: { item: string; rate: string; highlight?: boolean }[];
}) {
  return (
    <div className="rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] p-4">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.15em] text-[rgba(16,25,21,0.5)]">
        {title}
      </h4>
      <div className="space-y-1.5">
        {rows.map((row) => (
          <div
            key={row.item}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-[rgba(16,25,21,0.65)]">{row.item}</span>
            <span
              className={`font-mono text-xs font-semibold ${
                row.highlight
                  ? "text-[var(--ember)]"
                  : "text-[rgba(16,25,21,0.75)]"
              }`}
            >
              {row.rate}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SectionCard({ section }: { section: GuideSection }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="dashboard-card overflow-hidden rounded-2xl">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-[rgba(17,24,39,0.02)]"
        aria-expanded={expanded}
      >
        <div
          className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-2xl ${section.accent}`}
        >
          {section.icon}
        </div>
        <h2 className="flex-1 text-base font-semibold">{section.title}</h2>
        <ChevronDown
          className={`h-5 w-5 text-[rgba(17,24,39,0.3)] transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && (
        <div className="border-t border-[rgba(17,24,39,0.06)] px-5 pb-5 pt-4">
          {section.content}
        </div>
      )}
    </section>
  );
}

const iconClass = "h-5 w-5";

function buildGuideSections(cfg: (key: string) => number | boolean): GuideSection[] {
  const n = (key: string) => Number(cfg(key));

  return [
    {
      id: "lifecycle",
      title: "Creature Lifecycle",
      icon: <PawPrint className={`${iconClass} text-[var(--moss)]`} />,
      accent: "bg-[rgba(45,93,49,0.12)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Every Goobiez creature has a lifespan measured in active days. A
            creature ages {n("age_increase_per_day")} day for each real day it is rezzed and active in
            Second Life. When a creature is picked up into your inventory, its
            timer pauses completely — no aging, no hunger.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow label="Maximum Age" value={`${n("creature_max_age")} days`} />
            <StatRow label="Aging Rate" value={`${n("age_increase_per_day")} day / active day`} />
            <StatRow
              label="Death"
              value="Old age or starvation"
              note={`Creature dies at age ${n("creature_max_age")} or ${n("munchiez_death")}% munchiez`}
            />
            <StatRow
              label="Inactive Threshold"
              value={`${Math.round(n("inactive_threshold") / 60)} minutes`}
              note={`Creature pauses if not polled for ${Math.round(n("inactive_threshold") / 60)} min`}
            />
            <StatRow label="Stats Poll Interval" value={`Every ${Math.round(n("stats_poll_interval") / 60)} minutes`} />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--moss)]" />
            <p className="text-xs text-[rgba(16,25,21,0.6)]">
              Creatures stored in your SL inventory are completely frozen. They
              resume aging and hunger exactly where they left off when rezzed
              again.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "feeding",
      title: "Feeding & Munchiez",
      icon: <Utensils className={`${iconClass} text-[var(--ember)]`} />,
      accent: "bg-[rgba(196,107,46,0.15)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Munchiez is your creature&apos;s hunger level. It decreases daily
            while active. Keep your creatures fed to prevent starvation! Place
            food within range and creatures will eat automatically when hungry.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow label="Max Munchiez" value={`${n("munchiez_max")}%`} />
            <StatRow
              label="Daily Decrease"
              value={`${n("munchiez_decrease")}% / day`}
              note="While creature is active"
            />
            <StatRow
              label="Hunger Warning"
              value={`Below ${n("munchiez_warning")}%`}
              note="Critical level — feed soon!"
            />
            <StatRow
              label="Starvation Death"
              value={`${n("munchiez_death")}%`}
              note="Creature dies if munchiez reaches zero"
            />
            <StatRow
              label="Feeding Threshold"
              value={`Below ${n("food_feeding_threshold")}%`}
              note="Creature will eat when munchiez drops below this"
            />
            <StatRow label="Restore per Feeding" value={`${n("food_munchiez_per_feeding")}%`} />
            <StatRow label="Feedings per Food" value={`${n("food_total_feedings")} uses`} />
            <StatRow
              label="Feeding Range"
              value={`${n("food_feeding_range")} meters`}
              note="Max distance between creature and food"
            />
            <StatRow label="Food Cost" value={`${n("food_cost_points").toLocaleString()} GBP`} />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.1)] p-3">
            <Drumstick className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gold)]" />
            <p className="text-xs text-[rgba(16,25,21,0.6)]">
              Food trays are collectible decor when empty. You can refill them
              directly or send them to the Great Beyond for points.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "breeding",
      title: "Breeding System",
      icon: <Heart className={`${iconClass} text-[#c46b2e]`} />,
      accent: "bg-[rgba(196,107,46,0.15)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Breeding happens automatically when two eligible creatures are
            within 10 meters of each other in Second Life, or manually using a
            Heart Pedestal. Breeding lasts {n("breeding_duration_days")} days and the outcome depends on
            whether a pedestal was used.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow
              label="Minimum Age"
              value={`${n("breeding_min_age")} days`}
              note={`Creature must be at least ${n("breeding_min_age")} active days old`}
            />
            <StatRow
              label="Cooldown"
              value={`${n("breeding_cooldown")} days`}
              note="Wait time between breeding attempts"
            />
            <StatRow label="Breeding Duration" value={`${n("breeding_duration_days")} days (${n("breeding_duration_days") * 24} hours)`} />
            <StatRow
              label="Base Success Rate"
              value={`${n("babiez_chance_base")}%`}
              note="Without Heart Pedestal"
            />
            <StatRow
              label="Pedestal Success Rate"
              value={`${n("babiez_chance_pedestal")}%`}
              note="With Heart Pedestal"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4 text-[#c46b2e]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgba(16,25,21,0.5)]">
                  With Pedestal
                </h4>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--moss)]">
                {n("babiez_chance_pedestal")}%
              </p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
                Success chance
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] p-4">
              <div className="flex items-center gap-2">
                <Swords className="h-4 w-4 text-[rgba(17,24,39,0.4)]" />
                <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgba(16,25,21,0.5)]">
                  Without Pedestal
                </h4>
              </div>
              <p className="mt-2 text-2xl font-semibold text-[var(--ember)]">
                {n("babiez_chance_base")}%
              </p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
                Success chance
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-3">
            <Info className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--moss)]" />
            <p className="text-xs text-[rgba(16,25,21,0.6)]">
              You can cancel an active breeding session from the Breeding page.
              If a Heart Pedestal was used, it will be returned upon
              cancellation.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "deliveries",
      title: "Deliveries & Drop Rates",
      icon: <Gift className={`${iconClass} text-[var(--gold)]`} />,
      accent: "bg-[rgba(218,165,32,0.16)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Active creatures produce deliveries every {n("delivery_interval")} active days. Deliveries
            are sent to your mailbox (max {n("mailbox_capacity")} items) and can be claimed from the
            in-world mailbox object. What you receive depends on the creature type.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow label="Delivery Interval" value={`Every ${n("delivery_interval")} active days`} />
            <StatRow label="Mailbox Capacity" value={`${n("mailbox_capacity")} items`} />
            <StatRow label="Items Expire" value={cfg("mailbox_items_expire") ? "Yes" : "No"} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <DropTable
              title="Goobiez Drop Rates"
              rows={[
                { item: "Friend Visit", rate: `${n("drop_goobiez_friend")}%` },
                { item: "Family Visit", rate: `${n("drop_goobiez_family")}%` },
                { item: "Token", rate: `${n("drop_goobiez_token")}%` },
                { item: "SLox", rate: `${n("drop_goobiez_slox")}%` },
                { item: "Monthly Special", rate: `${n("drop_goobiez_monthly")}%` },
                { item: "Stranger", rate: `${n("drop_goobiez_stranger")}%` },
                { item: "Fuggiez", rate: `${n("drop_goobiez_fuggiez")}%` },
                { item: "Babiez", rate: `${n("drop_goobiez_babiez")}%`, highlight: true },
                { item: "Rare Token", rate: `${n("drop_goobiez_rare_token")}%`, highlight: true },
              ]}
            />
            <DropTable
              title="Fuggiez Drop Rates"
              rows={[
                { item: "Fuggiez", rate: `${n("drop_fuggiez_fuggiez")}%` },
                { item: "Token", rate: `${n("drop_fuggiez_token")}%` },
                { item: "SLox", rate: `${n("drop_fuggiez_slox")}%` },
                { item: "Monthly Special", rate: `${n("drop_fuggiez_monthly")}%` },
                { item: "Stranger", rate: `${n("drop_fuggiez_stranger")}%` },
                { item: "Fuggiez Baby", rate: `${n("drop_fuggiez_babiez")}%` },
                { item: "Goobiez", rate: `${n("drop_fuggiez_goobiez")}%`, highlight: true },
                { item: "Rare Token", rate: `${n("drop_fuggiez_rare_token")}%`, highlight: true },
              ]}
            />
          </div>
        </div>
      ),
    },

    {
      id: "great-beyond",
      title: "Great Beyond & Points",
      icon: <Sparkles className={`${iconClass} text-[var(--gold)]`} />,
      accent: "bg-[rgba(218,165,32,0.16)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Send creatures to the Great Beyond to earn Great Beyond Points (GBP).
            Points are based on the creature&apos;s age and type. Any creature can
            be sent to the Great Beyond at any time — they don&apos;t need to die
            first.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow
              label="Points per Age Day"
              value={`${n("great_beyond_points_per_age")} GBP / day`}
              note={`Max ${n("creature_max_age")} GBP for old age death`}
            />
            <StatRow
              label="Starvation Death"
              value={`${n("starvation_death_points")} GBP`}
              note="Reduced points for neglect"
            />
            <StatRow label="Babiez" value={`${n("gb_points_babiez").toLocaleString()} GBP`} />
            <StatRow label="Forever Creature" value={`${n("gb_points_forever").toLocaleString()} GBP`} />
            <StatRow label="HUT Creature" value={`${n("gb_points_hut").toLocaleString()} GBP`} />
            <StatRow label="Containers" value={`${n("container_gb_points")} GBP`} />
            <StatRow
              label="Memorial Chance"
              value={`${n("memorial_chance")}%`}
              note="Headstone/casket from old age deaths only"
            />
          </div>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow
              label="HUT Creature Cost"
              value={`${n("hut_creature_cost").toLocaleString()} GBP`}
              note="Create via HUT Factory"
            />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.1)] p-3">
            <Sparkles className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--gold)]" />
            <p className="text-xs text-[rgba(16,25,21,0.6)]">
              Tip: A creature that lives to the full {n("creature_max_age")} days and dies of old age
              earns the maximum {n("creature_max_age")} GBP — plus a {n("memorial_chance")}% chance at a rare memorial
              item.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "boosters",
      title: "Boosters & Resurrection",
      icon: <Zap className={`${iconClass} text-[var(--ember)]`} />,
      accent: "bg-[rgba(196,107,46,0.15)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Boosters are special items that can be applied to your creatures.
            Touch the creature, select the boosters menu, and choose a booster to
            apply. If you don&apos;t confirm within 60 seconds, the action
            automatically cancels.
          </p>
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgba(16,25,21,0.5)]">
            Resurrect Booster
          </h4>
          <p className="text-sm text-[rgba(16,25,21,0.65)]">
            Bring deceased creatures back to life with the Resurrect booster.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow
              label="Munchiez After Resurrect"
              value={`${n("resurrect_munchiez_reset")}%`}
              note="Creature returns hungry — feed quickly!"
            />
            <StatRow
              label="Cooldown"
              value={`${n("resurrect_cooldown_days")} days`}
              note="Before creature can be resurrected again"
            />
            <StatRow
              label="Max Resurrections"
              value={`${n("resurrect_max_per_creature")} per creature`}
              note="Lifetime limit"
            />
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.08)] p-3">
            <Shield className="mt-0.5 h-4 w-4 flex-shrink-0 text-[var(--ember)]" />
            <p className="text-xs text-[rgba(16,25,21,0.6)]">
              Boosters are applied by touching the creature in Second Life and
              selecting from the booster menu. There is a 60-second timeout for
              safety.
            </p>
          </div>
        </div>
      ),
    },

    {
      id: "mailbox",
      title: "Mailbox System",
      icon: <Mail className={`${iconClass} text-[var(--moss)]`} />,
      accent: "bg-[rgba(45,93,49,0.12)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            Your mailbox stores delivery items from your creatures. Place the
            mailbox object in Second Life to claim items. Items are stored on the
            server and rezzed from the mailbox when claimed.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow label="Max Capacity" value={`${n("mailbox_capacity")} items`} />
            <StatRow label="Items Expire" value={cfg("mailbox_items_expire") ? "Yes" : "No"} />
          </div>
          <h4 className="text-xs font-bold uppercase tracking-[0.15em] text-[rgba(16,25,21,0.5)]">
            Delivery Containers
          </h4>
          <p className="text-sm text-[rgba(16,25,21,0.65)]">
            Items arrive in themed containers. All containers are collectible
            decor and can also be sent to the Great Beyond for {n("container_gb_points")} GBP each.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Friend Suitcase",
              "Family Suitcase",
              "Stranger Suitcase",
              "Babiez Carriage",
              "Fuggiez Cage",
              "Coin Pouch",
              "Token Pouch",
              "SLox",
            ].map((name) => (
              <span
                key={name}
                className="rounded-full bg-[rgba(17,24,39,0.05)] px-3 py-1.5 text-xs font-medium text-[rgba(16,25,21,0.6)]"
              >
                {name}
              </span>
            ))}
          </div>
        </div>
      ),
    },

    {
      id: "slox",
      title: "SLox System",
      icon: <Package className={`${iconClass} text-[var(--moss)]`} />,
      accent: "bg-[rgba(45,93,49,0.12)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            SLox is a rotating pool of exclusive collectible items. The pool
            refreshes periodically with new items to discover.
          </p>
          <div className="divide-y divide-[rgba(17,24,39,0.06)] rounded-xl border border-[rgba(17,24,39,0.06)] bg-[rgba(17,24,39,0.02)] px-4">
            <StatRow
              label="Pool Rotation"
              value={`Every ${n("slox_rotation_days")} days`}
              note="New items each rotation"
            />
            <StatRow
              label="Items per Pool"
              value={`${n("slox_items_count")} items`}
              note="Collectible exclusives"
            />
          </div>
        </div>
      ),
    },

    {
      id: "economy",
      title: "Tokens & Economy",
      icon: <Gem className={`${iconClass} text-[var(--gold)]`} />,
      accent: "bg-[rgba(218,165,32,0.16)]",
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed text-[rgba(16,25,21,0.65)]">
            The Goobiez economy revolves around three currencies earned through
            creature care and deliveries.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-[rgba(218,165,32,0.3)] bg-[rgba(218,165,32,0.08)] p-4 text-center">
              <Sparkles className="mx-auto h-6 w-6 text-[var(--gold)]" />
              <p className="mt-2 text-sm font-semibold">GBP</p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
                Great Beyond Points — earned from sending creatures &amp; items to
                the Great Beyond
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(196,107,46,0.3)] bg-[rgba(196,107,46,0.08)] p-4 text-center">
              <Store className="mx-auto h-6 w-6 text-[var(--ember)]" />
              <p className="mt-2 text-sm font-semibold">Coins</p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
                From deliveries — {n("drop_goobiez_token")}% drop rate from Goobiez and Fuggiez
              </p>
            </div>
            <div className="rounded-xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.08)] p-4 text-center">
              <Gem className="mx-auto h-6 w-6 text-[var(--moss)]" />
              <p className="mt-2 text-sm font-semibold">Rare Tokens</p>
              <p className="mt-1 text-xs text-[rgba(16,25,21,0.5)]">
                From rare deliveries — {n("drop_goobiez_rare_token")}% drop rate, highly valuable
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];
}

function buildFaqItems(cfg: (key: string) => number | boolean): FaqItem[] {
  const n = (key: string) => Number(cfg(key));

  return [
    {
      q: "How do I feed my creature?",
      a: `Place a food item within ${n("food_feeding_range")} meters of your creature in Second Life. When your creature's munchiez drops below ${n("food_feeding_threshold")}%, it will automatically eat from the nearest food source. Each food item has ${n("food_total_feedings")} feedings before it runs out.`,
    },
    {
      q: "What happens when my creature is in my SL inventory?",
      a: "When a creature is picked up into your Second Life inventory, all its timers pause completely. It won't age, get hungry, or produce deliveries. Everything resumes exactly where it left off when you rez it again.",
    },
    {
      q: "How does breeding work?",
      a: `Place two eligible creatures within 10 meters of each other and they'll automatically start breeding. Alternatively, use a Heart Pedestal for a much higher success rate (${n("babiez_chance_pedestal")}% vs ${n("babiez_chance_base")}%). Creatures must be at least ${n("breeding_min_age")} days old with a ${n("breeding_cooldown")}-day cooldown between attempts. Breeding takes ${n("breeding_duration_days")} days.`,
    },
    {
      q: "Can I cancel a breeding session?",
      a: "Yes! Visit the Breeding page on the web portal to cancel active breeding sessions. If a Heart Pedestal was used, it will be returned to you upon cancellation.",
    },
    {
      q: "How do I earn Great Beyond Points?",
      a: `Send creatures or containers to the Great Beyond. Creatures earn ${n("great_beyond_points_per_age")} GBP per active day of age (max ${n("creature_max_age")}). Decorative creatures like Babiez earn ${n("gb_points_babiez")} GBP, Forever and HUT creatures earn ${n("gb_points_forever").toLocaleString()} GBP each. Containers earn ${n("container_gb_points")} GBP.`,
    },
    {
      q: "What is the HUT Factory?",
      a: `The HUT Factory lets you create special HUT creatures using ${n("hut_creature_cost").toLocaleString()} Great Beyond Points. These are unique creatures that earn ${n("gb_points_hut").toLocaleString()} GBP when eventually sent to the Great Beyond.`,
    },
    {
      q: "How do deliveries work?",
      a: `Active creatures produce a delivery every ${n("delivery_interval")} active days. Deliveries are sent to your mailbox (up to ${n("mailbox_capacity")} items). Claim them from the in-world mailbox object. Items don't expire, so there's no rush.`,
    },
    {
      q: "Can I resurrect a dead creature?",
      a: `Yes, using a Resurrect booster. The creature returns with ${n("resurrect_munchiez_reset")}% munchiez (feed it quickly!). Each creature can be resurrected up to ${n("resurrect_max_per_creature")} times total, with a ${n("resurrect_cooldown_days")}-day cooldown between resurrections.`,
    },
    {
      q: "How do I rename my creature?",
      a: "You can rename creatures from the creature detail page on the web portal. Click on a creature, then use the rename option. The name will also update on the creature's hover text in Second Life.",
    },
    {
      q: "Can I send a living creature to the Great Beyond?",
      a: "Yes! Any creature can be sent to the Great Beyond at any time — they don't need to die first. However, the creature will be permanently gone, so choose wisely.",
    },
    {
      q: "What happens if my mailbox is full?",
      a: `Your mailbox can hold up to ${n("mailbox_capacity")} items. If it's full, new deliveries won't be stored until you claim some items. Make sure to check your mailbox regularly!`,
    },
    {
      q: "Where do I manage my display name?",
      a: "Your display name and SL avatar are managed through Second Life. The web portal shows your avatar name as linked to your account but cannot change it.",
    },
  ];
}

export default function HelpContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const { cfg, isLoading } = useGameConfig();

  const guideSections = buildGuideSections(cfg);
  const faqItems = buildFaqItems(cfg);

  const filteredSections = searchQuery.trim()
    ? guideSections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : guideSections;

  const filteredFaqs = searchQuery.trim()
    ? faqItems.filter(
        (f) =>
          f.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.a.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : faqItems;

  const n = (key: string) => Number(cfg(key));

  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-gray-200" />
          <div className="mt-5 h-10 w-full animate-pulse rounded-xl bg-gray-200" />
        </section>
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="dashboard-chip rounded-xl p-4">
              <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mt-2 h-5 w-24 animate-pulse rounded bg-gray-200" />
            </div>
          ))}
        </section>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="dashboard-card rounded-2xl p-5">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl">Help &amp; Guide</h1>
        <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
          Everything you need to know about caring for your Goobiez
        </p>

        <div className="relative mt-5">
          <HelpCircle className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(17,24,39,0.35)]" />
          <input
            type="text"
            placeholder="Search help topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-[rgba(16,25,21,0.15)] bg-white py-2.5 pl-11 pr-4 text-sm transition focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </section>

      {!searchQuery && (
        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="dashboard-chip flex items-center gap-3 rounded-xl p-4">
            <Timer className="h-5 w-5 text-[var(--moss)]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">Lifespan</p>
              <p className="text-sm font-semibold">{n("creature_max_age")} days</p>
            </div>
          </div>
          <div className="dashboard-chip flex items-center gap-3 rounded-xl p-4">
            <Clock className="h-5 w-5 text-[var(--ember)]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">Deliveries</p>
              <p className="text-sm font-semibold">Every {n("delivery_interval")} days</p>
            </div>
          </div>
          <div className="dashboard-chip flex items-center gap-3 rounded-xl p-4">
            <Heart className="h-5 w-5 text-[#c46b2e]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">Breeding</p>
              <p className="text-sm font-semibold">{n("breeding_duration_days")}-day cycle</p>
            </div>
          </div>
          <div className="dashboard-chip flex items-center gap-3 rounded-xl p-4">
            <Percent className="h-5 w-5 text-[var(--gold)]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.5)]">Pedestal Rate</p>
              <p className="text-sm font-semibold">{n("babiez_chance_pedestal")}% success</p>
            </div>
          </div>
        </section>
      )}

      {filteredSections.length > 0 ? (
        <div className="space-y-3">
          {!searchQuery && (
            <h2 className="px-1 text-xs font-bold uppercase tracking-[0.18em] text-[rgba(16,25,21,0.45)]">
              Game Guide
            </h2>
          )}
          {filteredSections.map((section) => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>
      ) : (
        searchQuery && (
          <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.15)] p-8 text-center">
            <p className="text-sm text-[rgba(16,25,21,0.5)]">
              No guide sections match your search.
            </p>
          </div>
        )
      )}

      {filteredFaqs.length > 0 && (
        <section className="dashboard-card rounded-2xl p-6">
          <div className="flex items-center gap-3 pb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(45,93,49,0.12)]">
              <HelpCircle className="h-5 w-5 text-[var(--moss)]" />
            </div>
            <h2 className="text-base font-semibold">
              Frequently Asked Questions
            </h2>
          </div>
          <Accordion items={filteredFaqs} />
        </section>
      )}

      <section className="dashboard-card rounded-2xl p-6">
        <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-[rgba(45,93,49,0.12)]">
            <Baby className="h-7 w-7 text-[var(--moss)]" />
          </div>
          <div className="flex-1">
            <h3 className="font-display text-lg">Still need help?</h3>
            <p className="mt-1 text-sm text-[rgba(16,25,21,0.6)]">
              If you can&apos;t find the answer you&apos;re looking for, reach
              out to our support team or visit our in-world help station.
            </p>
          </div>
          <a
            href="https://goobiez.com/support"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 rounded-full bg-[var(--moss)] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--moss-strong)]"
          >
            Contact Support
          </a>
        </div>
      </section>

      <div className="flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
        <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
        <p className="text-xs text-[rgba(16,25,21,0.6)]">
          All game values are loaded from the live game configuration. Game
          parameters may be adjusted for balance. Creature interactions
          (feeding, breeding, boosters) happen in Second Life — the web portal
          lets you monitor and manage your account.
        </p>
      </div>
    </div>
  );
}
