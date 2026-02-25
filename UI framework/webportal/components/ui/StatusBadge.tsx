import type { Creature } from "@/lib/api";

export const STATUS_STYLES: Record<string, string> = {
  Healthy: "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]",
  "Needs Food": "bg-[rgba(218,165,32,0.22)] text-[var(--ember)]",
  Critical: "bg-[rgba(196,107,46,0.2)] text-[var(--ember)]",
  "End of Life": "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  Deceased: "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]",
  Decorative: "bg-[rgba(139,69,19,0.12)] text-[var(--ember)]",
  "Forever Beautiful": "bg-[rgba(218,165,32,0.15)] text-[rgba(178,135,20,1)]",
  "Eternal Life": "bg-[rgba(6,182,212,0.12)] text-[rgba(8,145,178,1)]",
  "Great Beyond": "bg-[rgba(139,92,246,0.12)] text-[rgba(109,40,217,1)]",
};

export function getStatusLabel(
  creature: Creature,
  endOfLifeAge: number,
): string {
  if (creature.sent_to_beyond) return "Great Beyond";
  if (!creature.is_alive && creature.decorative_type === "forever")
    return "Forever Beautiful";
  if (!creature.is_alive) return "Deceased";
  if (creature.is_decorative && creature.decorative_type === "eternalz")
    return "Eternal Life";
  if (creature.is_decorative) return "Decorative";
  if (creature.munchiez <= 0) return "Critical";
  if (creature.is_hungry) return "Needs Food";
  if (creature.age >= endOfLifeAge) return "End of Life";
  return "Healthy";
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
        STATUS_STYLES[status] ??
        "bg-[rgba(17,24,39,0.08)] text-[rgba(17,24,39,0.6)]"
      }`}
    >
      {status}
    </span>
  );
}
