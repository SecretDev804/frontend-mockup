"use client";

import { ChevronDown, X } from "lucide-react";
import { useInventoryContext } from "@/contexts/InventoryContext";
import type { FoodFilters, FoodSort } from "@/lib/api";

const STATUS_OPTIONS = [
  { value: "all", label: "All Items" },
  { value: "active", label: "Active" },
  { value: "depleted", label: "Depleted" },
  { value: "storage", label: "In Storage" },
];

const ACCESS_MODE_OPTIONS = [
  { value: "all", label: "All Access" },
  { value: "owner", label: "Owner Only" },
  { value: "all_access", label: "Public" },
  { value: "group", label: "Group" },
];

const SORT_OPTIONS = [
  { value: "created_at:desc", label: "Newest First" },
  { value: "created_at:asc", label: "Oldest First" },
  { value: "name:asc", label: "Name (A-Z)" },
  { value: "name:desc", label: "Name (Z-A)" },
  { value: "remaining_feedings:asc", label: "Feedings (Low to High)" },
  { value: "remaining_feedings:desc", label: "Feedings (High to Low)" },
  { value: "last_feeding_at:desc", label: "Recently Used" },
];

function SelectDropdown({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        aria-label={label}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none rounded-full border border-[rgba(17,24,39,0.1)] bg-white px-4 py-2 pr-10 text-sm font-semibold text-[rgba(17,24,39,0.7)] transition hover:border-[rgba(17,24,39,0.2)] focus:border-[var(--moss)] focus:outline-none focus:ring-1 focus:ring-[var(--moss)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[rgba(17,24,39,0.4)]" />
    </div>
  );
}

type FilterChip = {
  id: string;
  label: string;
  onRemove: () => void;
};

function FilterChipComponent({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(45,93,49,0.1)] px-3 py-1 text-xs font-semibold text-[var(--moss)]">
      {label}
      <button
        onClick={onRemove}
        aria-label={`Remove ${label} filter`}
        className="ml-0.5 rounded-full p-0.5 transition hover:bg-[rgba(45,93,49,0.2)]"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  );
}

export default function InventoryFilters() {
  const { filters, sort, setFilters, setSort, foodItems, summary } = useInventoryContext();

  // Derive status value from filters
  const getStatusValue = (): string => {
    if (filters.is_depleted === true) return "depleted";
    if (filters.is_active === true && filters.is_depleted === false) return "active";
    if (filters.is_active === false) return "storage";
    return "all";
  };

  // Derive access mode value from filters
  const getAccessModeValue = (): string => {
    if (filters.access_mode === "owner") return "owner";
    if (filters.access_mode === "all") return "all_access";
    if (filters.access_mode === "group") return "group";
    return "all";
  };

  // Derive sort value
  const getSortValue = (): string => {
    return `${sort.field}:${sort.order}`;
  };

  // Get status label for chip
  const getStatusLabel = (): string | null => {
    const value = getStatusValue();
    if (value === "all") return null;
    return STATUS_OPTIONS.find((o) => o.value === value)?.label || null;
  };

  // Get access mode label for chip
  const getAccessModeLabel = (): string | null => {
    const value = getAccessModeValue();
    if (value === "all") return null;
    return ACCESS_MODE_OPTIONS.find((o) => o.value === value)?.label || null;
  };

  // Handle status change
  const handleStatusChange = (value: string) => {
    const newFilters: FoodFilters = {};

    switch (value) {
      case "active":
        newFilters.is_active = true;
        newFilters.is_depleted = false;
        break;
      case "depleted":
        newFilters.is_depleted = true;
        break;
      case "storage":
        newFilters.is_active = false;
        break;
      // "all" - no filters
    }

    // Preserve access_mode filter
    if (filters.access_mode) {
      newFilters.access_mode = filters.access_mode;
    }

    setFilters(newFilters);
  };

  // Handle access mode change
  const handleAccessModeChange = (value: string) => {
    const newFilters: FoodFilters = { ...filters };

    if (value === "all") {
      delete newFilters.access_mode;
    } else if (value === "all_access") {
      newFilters.access_mode = "all";
    } else {
      newFilters.access_mode = value;
    }

    setFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    const [field, order] = value.split(":") as [FoodSort["field"], FoodSort["order"]];
    setSort({ field, order });
  };

  // Remove status filter
  const removeStatusFilter = () => {
    const newFilters: FoodFilters = {};
    if (filters.access_mode) {
      newFilters.access_mode = filters.access_mode;
    }
    setFilters(newFilters);
  };

  // Remove access mode filter
  const removeAccessModeFilter = () => {
    const newFilters: FoodFilters = { ...filters };
    delete newFilters.access_mode;
    setFilters(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({});
  };

  // Build active filter chips
  const activeChips: FilterChip[] = [];
  const statusLabel = getStatusLabel();
  const accessLabel = getAccessModeLabel();

  if (statusLabel) {
    activeChips.push({ id: "status", label: statusLabel, onRemove: removeStatusFilter });
  }
  if (accessLabel) {
    activeChips.push({ id: "access", label: accessLabel, onRemove: removeAccessModeFilter });
  }

  const hasActiveFilters = activeChips.length > 0;

  // Calculate result count
  const currentCount = foodItems.length;
  const totalCount = summary?.total ?? 0;

  return (
    <div className="space-y-3">
      {/* Dropdowns and Result Count Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <SelectDropdown
            label="Filter by status"
            value={getStatusValue()}
            options={STATUS_OPTIONS}
            onChange={handleStatusChange}
          />
          <SelectDropdown
            label="Filter by access mode"
            value={getAccessModeValue()}
            options={ACCESS_MODE_OPTIONS}
            onChange={handleAccessModeChange}
          />
          <SelectDropdown
            label="Sort items"
            value={getSortValue()}
            options={SORT_OPTIONS}
            onChange={handleSortChange}
          />
        </div>

        {/* Result Count */}
        <p className="text-sm text-[rgba(16,25,21,0.6)]">
          Showing{" "}
          <span className="font-semibold text-[rgba(16,25,21,0.8)]">{currentCount}</span>
          {" "}of{" "}
          <span className="font-semibold text-[rgba(16,25,21,0.8)]">{totalCount}</span>
          {" "}items
        </p>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-[rgba(16,25,21,0.5)]">Active filters:</span>
          {activeChips.map((chip) => (
            <FilterChipComponent
              key={chip.id}
              label={chip.label}
              onRemove={chip.onRemove}
            />
          ))}
          <button
            onClick={clearAllFilters}
            className="ml-2 text-xs font-semibold text-[var(--moss)] transition hover:text-[var(--moss-strong)] hover:underline"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
