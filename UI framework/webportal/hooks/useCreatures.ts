"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCreatureList,
  fetchUserStatus,
  type Creature,
  type CreatureListResponse,
  type CreatureSummary,
  type CreatureFilters,
  type CreatureSort,
} from "@/lib/api";

type UseCreaturesOptions = {
  refreshInterval?: number; // milliseconds, default 5 minutes
  enabled?: boolean;
};

type UseCreaturesResult = {
  creatures: Creature[];
  summary: CreatureSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
  filters: CreatureFilters;
  setFilters: (filters: CreatureFilters) => void;
  sort: CreatureSort;
  setSort: (sort: CreatureSort) => void;
};

const DEFAULT_SORT: CreatureSort = { field: "name", order: "asc" };
const DEFAULT_REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

export function useCreatures(
  cognitoSub: string | null,
  options: UseCreaturesOptions = {}
): UseCreaturesResult {
  const { refreshInterval = DEFAULT_REFRESH_INTERVAL, enabled = true } = options;

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [summary, setSummary] = useState<CreatureSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const [filters, setFilters] = useState<CreatureFilters>({});
  const [sort, setSort] = useState<CreatureSort>(DEFAULT_SORT);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Get owner_key from user status
  useEffect(() => {
    if (!cognitoSub || !enabled) {
      setOwnerKey(null);
      return;
    }

    fetchUserStatus(cognitoSub)
      .then((status) => {
        if (!isMountedRef.current) return;
        if (status.sl_avatar_key) {
          setOwnerKey(status.sl_avatar_key);
        } else {
          setError("SL account not linked. Please verify in Second Life.");
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(err.message || "Failed to get user status.");
        setIsLoading(false);
      });
  }, [cognitoSub, enabled]);

  // Fetch creature data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response: CreatureListResponse = await fetchCreatureList(
          ownerKey,
          Object.keys(filters).length > 0 ? filters : undefined,
          sort
        );

        if (!isMountedRef.current) return;

        setCreatures(response.creatures);
        setSummary(response.summary);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load creatures.";
        setError(message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [ownerKey, filters, sort]
  );

  // Initial fetch when owner_key is available
  useEffect(() => {
    if (!ownerKey || !enabled) return;
    fetchData(false);
  }, [ownerKey, enabled, fetchData]);

  // Polling interval
  useEffect(() => {
    if (!ownerKey || !enabled || refreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      fetchData(true); // background refresh
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ownerKey, enabled, refreshInterval, fetchData]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const refetch = useCallback(async () => {
    await fetchData(false);
  }, [fetchData]);

  return {
    creatures,
    summary,
    isLoading,
    isRefreshing,
    error,
    refetch,
    lastUpdated,
    filters,
    setFilters,
    sort,
    setSort,
  };
}
