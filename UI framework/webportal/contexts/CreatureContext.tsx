"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
  type ReactNode,
} from "react";
import {
  fetchCreatureList,
  type Creature,
  type CreatureSummary,
  type CreatureFilters,
  type CreatureSort,
  type PaginationMeta,
  type PaginationParams,
} from "@/lib/api";
import { useUserContext } from "./UserContext";

type CreatureContextType = {
  creatures: Creature[];
  summary: CreatureSummary | null;
  needsAttention: number;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: CreatureFilters;
  setFilters: (filters: CreatureFilters) => void;
  sort: CreatureSort;
  setSort: (sort: CreatureSort) => void;
  refetch: () => Promise<void>;
  // Pagination
  pagination: PaginationMeta | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
};

const CreatureContext = createContext<CreatureContextType | null>(null);

const DEFAULT_SORT: CreatureSort = { field: "name", order: "asc" };
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

type CreatureProviderProps = {
  children: ReactNode;
};

export function CreatureProvider({ children }: CreatureProviderProps) {
  // Derive ownerKey from UserContext — no duplicate /api/auth/me or /user/status calls
  const { ownerKey, isLoading: userLoading } = useUserContext();

  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [summary, setSummary] = useState<CreatureSummary | null>(null);
  const [needsAttention, setNeedsAttention] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFiltersState] = useState<CreatureFilters>({ is_alive: true });
  const [sort, setSortState] = useState<CreatureSort>(DEFAULT_SORT);

  // Pagination state
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(25);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Wrapper for setFilters that resets page to 1
  const setFilters = useCallback((newFilters: CreatureFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  // Wrapper for setSort that resets page to 1
  const setSort = useCallback((newSort: CreatureSort) => {
    setSortState(newSort);
    setPageState(1);
  }, []);

  // Wrapper for setPage
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  // Wrapper for setPageSize that resets page to 1
  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1);
  }, []);

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
        // is_decorative is not yet supported server-side — strip it and filter client-side
        const { is_decorative: decorativeFilter, ...apiFilters } = filters;
        const serverFilters =
          Object.keys(apiFilters).length > 0 ? apiFilters : undefined;

        let fetchedCreatures: Creature[];
        let fetchedSummary: CreatureSummary;
        let fetchedPagination: PaginationMeta | null;

        if (decorativeFilter) {
          // Backend ignores is_decorative — fetch all pages and filter client-side
          const allCreatures: Creature[] = [];
          let currentPage = 1;
          let firstSummary: CreatureSummary | null = null;

          while (true) {
            const response = await fetchCreatureList(
              ownerKey,
              serverFilters,
              sort,
              { page: currentPage, pageSize: 100 }
            );

            if (!isMountedRef.current) return;

            allCreatures.push(...response.creatures);
            if (currentPage === 1) firstSummary = response.summary;
            if (!response.pagination?.hasNextPage) break;
            currentPage++;
          }

          fetchedCreatures = allCreatures.filter((c) => c.is_decorative);
          fetchedSummary = firstSummary!;
          fetchedPagination = null; // suppress — totals would be inaccurate
        } else {
          const response = await fetchCreatureList(
            ownerKey,
            serverFilters,
            sort,
            { page, pageSize }
          );

          if (!isMountedRef.current) return;

          fetchedCreatures = response.creatures;
          fetchedSummary = response.summary;
          fetchedPagination = response.pagination || null;
        }

        setCreatures(fetchedCreatures);
        setSummary(fetchedSummary);
        setPagination(fetchedPagination);
        setLastUpdated(new Date());
        setError(null);

        // Use pre-calculated unfiltered count from Lambda
        setNeedsAttention(fetchedSummary.hungry);
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
    [ownerKey, filters, sort, page, pageSize]
  );

  // Stop loading spinner once UserContext finishes but ownerKey is still null
  useEffect(() => {
    if (!userLoading && !ownerKey) {
      setIsLoading(false);
    }
  }, [userLoading, ownerKey]);

  // Initial fetch when ownerKey is available
  useEffect(() => {
    if (!ownerKey) return;
    fetchData(false);
  }, [ownerKey, fetchData]);

  // Polling interval
  useEffect(() => {
    if (!ownerKey) return;

    intervalRef.current = setInterval(() => {
      fetchData(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ownerKey, fetchData]);

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

  const value = useMemo<CreatureContextType>(
    () => ({
      creatures,
      summary,
      needsAttention,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      filters,
      setFilters,
      sort,
      setSort,
      refetch,
      pagination,
      page,
      pageSize,
      setPage,
      setPageSize,
    }),
    [
      creatures,
      summary,
      needsAttention,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      filters,
      setFilters,
      sort,
      setSort,
      refetch,
      pagination,
      page,
      pageSize,
      setPage,
      setPageSize,
    ]
  );

  return (
    <CreatureContext.Provider value={value}>
      {children}
    </CreatureContext.Provider>
  );
}

export function useCreatureContext() {
  const context = useContext(CreatureContext);
  if (!context) {
    throw new Error("useCreatureContext must be used within a CreatureProvider");
  }
  return context;
}
