"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchCreatureList,
  type Creature,
  type CreatureSummary,
} from "@/lib/api";
import { useUserContext } from "@/contexts/UserContext";

type UseCollectionCreaturesReturn = {
  creatures: Creature[];
  summary: CreatureSummary | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
};

export function useCollectionCreatures(): UseCollectionCreaturesReturn {
  const { ownerKey, isLoading: userLoading } = useUserContext();

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [summary, setSummary] = useState<CreatureSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  const fetchAll = useCallback(async () => {
    if (!ownerKey) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch all creatures across all pages (no is_alive filter) sorted by type
      const allCreatures: Creature[] = [];
      let currentPage = 1;
      let firstSummary: CreatureSummary | null = null;

      while (true) {
        const response = await fetchCreatureList(
          ownerKey,
          undefined,
          { field: "creature_type", order: "asc" },
          { page: currentPage, pageSize: 100 }
        );

        if (!isMountedRef.current) return;

        allCreatures.push(...response.creatures);
        if (currentPage === 1) firstSummary = response.summary;
        if (!response.pagination?.hasNextPage) break;
        currentPage++;
      }

      setCreatures(allCreatures);
      setSummary(firstSummary);
    } catch (err) {
      if (!isMountedRef.current) return;
      setError(
        err instanceof Error ? err.message : "Failed to load collection."
      );
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [ownerKey]);

  useEffect(() => {
    if (!userLoading && !ownerKey) {
      setIsLoading(false);
    }
  }, [userLoading, ownerKey]);

  useEffect(() => {
    if (ownerKey) {
      fetchAll();
    }
  }, [ownerKey, fetchAll]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { creatures, summary, isLoading, error, refetch: fetchAll };
}
