"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { fetchCreatureStats, type Creature } from "@/lib/api";

type UseCreatureOptions = {
  refreshInterval?: number; // milliseconds, default 1 minute
  enabled?: boolean;
};

type UseCreatureResult = {
  creature: Creature | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  lastUpdated: Date | null;
};

const DEFAULT_REFRESH_INTERVAL = 60 * 1000; // 1 minute

export function useCreature(
  creatureId: string | null,
  options: UseCreatureOptions = {}
): UseCreatureResult {
  const { refreshInterval = DEFAULT_REFRESH_INTERVAL, enabled = true } = options;

  const [creature, setCreature] = useState<Creature | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Fetch creature data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!creatureId) return;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const data = await fetchCreatureStats(creatureId);

        if (!isMountedRef.current) return;

        setCreature(data);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load creature.";
        setError(message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [creatureId]
  );

  // Initial fetch
  useEffect(() => {
    if (!creatureId || !enabled) {
      setCreature(null);
      setIsLoading(false);
      return;
    }
    fetchData(false);
  }, [creatureId, enabled, fetchData]);

  // Polling interval
  useEffect(() => {
    if (!creatureId || !enabled || refreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      fetchData(true); // background refresh
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [creatureId, enabled, refreshInterval, fetchData]);

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
    creature,
    isLoading,
    isRefreshing,
    error,
    refetch,
    lastUpdated,
  };
}
