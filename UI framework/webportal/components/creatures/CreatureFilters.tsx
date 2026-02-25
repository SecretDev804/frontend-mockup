"use client";

import { ChevronDown } from "lucide-react";
import type { CreatureFilters as CreatureFiltersType, CreatureSort } from "@/lib/api";

type CreatureFiltersProps = {
  filters: CreatureFiltersType;
  onFiltersChange: (filters: CreatureFiltersType) => void;
  sort: CreatureSort;
  onSortChange: (sort: CreatureSort) => void;
};

const CREATURE_TYPES = [
  "All Types",
  "Goobiez",
  "Fuggiez",
  "Friend",
  "Family",
  "Stranger",
  "Babiez",
  "Forever",
];

const STATUS_OPTIONS = [
  { label: "All Status", value: "all" },
  { label: "Alive", value: "alive" },
  { label: "Dead", value: "dead" },
  { label: "Decorative", value: "decorative" },
];

const BREEDING_OPTIONS = [
  { label: "All Breeding", value: "all" },
  { label: "Ready", value: "ready" },
  { label: "Not Ready", value: "not_ready" },
];

const SORT_OPTIONS = [
  { label: "Name (A-Z)", field: "name" as const, order: "asc" as const },
  { label: "Name (Z-A)", field: "name" as const, order: "desc" as const },
  { label: "Age (Youngest)", field: "age" as const, order: "asc" as const },
  { label: "Age (Oldest)", field: "age" as const, order: "desc" as const },
  { label: "Munchiez (Low)", field: "munchiez" as const, order: "asc" as const },
  { label: "Munchiez (High)", field: "munchiez" as const, order: "desc" as const },
  { label: "Type (A-Z)", field: "creature_type" as const, order: "asc" as const },
  { label: "Birth Date (Recent)", field: "birth_date" as const, order: "desc" as const },
  { label: "Birth Date (Oldest)", field: "birth_date" as const, order: "asc" as const },
];

export function CreatureFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
}: CreatureFiltersProps) {
  const handleStatusChange = (value: string) => {
    const newFilters = { ...filters };
    delete newFilters.is_alive;
    delete newFilters.is_decorative;
    if (value === "alive") {
      newFilters.is_alive = true;
    } else if (value === "dead") {
      newFilters.is_alive = false;
    } else if (value === "decorative") {
      newFilters.is_decorative = true;
    }
    onFiltersChange(newFilters);
  };

  const handleTypeChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === "All Types") {
      delete newFilters.creature_type;
    } else {
      newFilters.creature_type = value;
    }
    onFiltersChange(newFilters);
  };

  const handleBreedingChange = (value: string) => {
    const newFilters = { ...filters };
    if (value === "all") {
      delete newFilters.can_breed;
    } else {
      newFilters.can_breed = value === "ready";
    }
    onFiltersChange(newFilters);
  };

  const handleSortChange = (index: number) => {
    const option = SORT_OPTIONS[index];
    if (option) {
      onSortChange({ field: option.field, order: option.order });
    }
  };

  const getCurrentStatusValue = () => {
    if (filters.is_decorative) return "decorative";
    if (filters.is_alive === undefined) return "all";
    return filters.is_alive ? "alive" : "dead";
  };

  const getCurrentBreedingValue = () => {
    if (filters.can_breed === undefined) return "all";
    return filters.can_breed ? "ready" : "not_ready";
  };

  const getCurrentSortIndex = () => {
    return SORT_OPTIONS.findIndex(
      (opt) => opt.field === sort.field && opt.order === sort.order
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Status Filter */}
      <div className="relative">
        <select
          value={getCurrentStatusValue()}
          onChange={(e) => handleStatusChange(e.target.value)}
          className="appearance-none rounded-full border border-[rgba(16,25,21,0.12)] bg-white/95 py-2 pl-4 pr-10 text-xs font-semibold text-[rgba(16,25,21,0.75)] transition hover:border-[rgba(16,25,21,0.25)] focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(16,25,21,0.45)]" />
      </div>

      {/* Type Filter */}
      <div className="relative">
        <select
          value={filters.creature_type || "All Types"}
          onChange={(e) => handleTypeChange(e.target.value)}
          className="appearance-none rounded-full border border-[rgba(16,25,21,0.12)] bg-white/95 py-2 pl-4 pr-10 text-xs font-semibold text-[rgba(16,25,21,0.75)] transition hover:border-[rgba(16,25,21,0.25)] focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {CREATURE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(16,25,21,0.45)]" />
      </div>

      {/* Breeding Filter */}
      <div className="relative">
        <select
          value={getCurrentBreedingValue()}
          onChange={(e) => handleBreedingChange(e.target.value)}
          className="appearance-none rounded-full border border-[rgba(16,25,21,0.12)] bg-white/95 py-2 pl-4 pr-10 text-xs font-semibold text-[rgba(16,25,21,0.75)] transition hover:border-[rgba(16,25,21,0.25)] focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {BREEDING_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(16,25,21,0.45)]" />
      </div>

      {/* Divider */}
      <div className="h-6 w-px bg-[rgba(16,25,21,0.12)]" />

      {/* Sort */}
      <div className="relative">
        <select
          value={getCurrentSortIndex()}
          onChange={(e) => handleSortChange(parseInt(e.target.value))}
          className="appearance-none rounded-full border border-[rgba(16,25,21,0.12)] bg-white/95 py-2 pl-4 pr-10 text-xs font-semibold text-[rgba(16,25,21,0.75)] transition hover:border-[rgba(16,25,21,0.25)] focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        >
          {SORT_OPTIONS.map((opt, idx) => (
            <option key={idx} value={idx}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(16,25,21,0.45)]" />
      </div>
    </div>
  );
}
