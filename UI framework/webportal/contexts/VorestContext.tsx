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
  fetchVorestCreatureList,
  fetchVorestFoodList,
  fetchVorestBoosterList,
  type Creature,
  type CreatureSummary,
  type CreatureFilters,
  type CreatureSort,
  type PaginationMeta,
  type PaginationParams,
  type VorestFoodItem,
  type VorestFoodSummary,
  type VorestBooster,
  type VorestBoosterSummary,
} from "@/lib/api";
import { useUserContext } from "./UserContext";

type VorestContextType = {
  // Creatures
  creatures: Creature[];
  summary: CreatureSummary | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  filters: CreatureFilters;
  setFilters: (filters: CreatureFilters) => void;
  sort: CreatureSort;
  setSort: (sort: CreatureSort) => void;
  refetch: () => Promise<void>;
  pagination: PaginationMeta | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Food
  foodItems: VorestFoodItem[];
  foodSummary: VorestFoodSummary | null;
  foodLoading: boolean;
  refetchFood: () => Promise<void>;
  // Boosters
  boosters: VorestBooster[];
  boosterSummary: VorestBoosterSummary | null;
  boosterLoading: boolean;
  refetchBoosters: () => Promise<void>;
  // Vbucks (from UserContext, exposed for convenience)
  vbucks: number;
};

const VorestContext = createContext<VorestContextType | null>(null);

const DEFAULT_SORT: CreatureSort = { field: "name", order: "asc" };
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

type VorestProviderProps = {
  children: ReactNode;
};

export function VorestProvider({ children }: VorestProviderProps) {
  const { ownerKey, vbucks, isLoading: userLoading } = useUserContext();

  // Creature state
  const [creatures, setCreatures] = useState<Creature[]>([]);
  const [summary, setSummary] = useState<CreatureSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [filters, setFiltersState] = useState<CreatureFilters>({ is_alive: true });
  const [sort, setSortState] = useState<CreatureSort>(DEFAULT_SORT);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(25);

  // Food state
  const [foodItems, setFoodItems] = useState<VorestFoodItem[]>([]);
  const [foodSummary, setFoodSummary] = useState<VorestFoodSummary | null>(null);
  const [foodLoading, setFoodLoading] = useState(true);

  // Booster state
  const [boosters, setBoosters] = useState<VorestBooster[]>([]);
  const [boosterSummary, setBoosterSummary] = useState<VorestBoosterSummary | null>(null);
  const [boosterLoading, setBoosterLoading] = useState(true);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Wrappers
  const setFilters = useCallback((newFilters: CreatureFilters) => {
    setFiltersState(newFilters);
    setPageState(1);
  }, []);

  const setSort = useCallback((newSort: CreatureSort) => {
    setSortState(newSort);
    setPageState(1);
  }, []);

  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1);
  }, []);

  // Fetch Vorest creatures
  const fetchCreatures = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetchVorestCreatureList(
          ownerKey,
          filters,
          sort,
          { page, pageSize }
        );

        if (!isMountedRef.current) return;

        setCreatures(response.creatures);
        setSummary(response.summary);
        setPagination(response.pagination || null);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message = err instanceof Error ? err.message : "Failed to load Vorest creatures.";
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

  // Fetch Vorest food
  const fetchFood = useCallback(async () => {
    if (!ownerKey) return;
    setFoodLoading(true);

    try {
      const response = await fetchVorestFoodList(ownerKey);
      if (!isMountedRef.current) return;
      setFoodItems(response.food_items);
      setFoodSummary(response.summary);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Failed to load Vorest food:", err);
    } finally {
      if (isMountedRef.current) {
        setFoodLoading(false);
      }
    }
  }, [ownerKey]);

  // Fetch Vorest boosters
  const fetchBoosters = useCallback(async () => {
    if (!ownerKey) return;
    setBoosterLoading(true);

    try {
      const response = await fetchVorestBoosterList(ownerKey);
      if (!isMountedRef.current) return;
      setBoosters(response.boosters);
      setBoosterSummary(response.summary);
    } catch (err) {
      if (!isMountedRef.current) return;
      console.error("Failed to load Vorest boosters:", err);
    } finally {
      if (isMountedRef.current) {
        setBoosterLoading(false);
      }
    }
  }, [ownerKey]);

  // Stop loading spinner once UserContext finishes but ownerKey is still null
  useEffect(() => {
    if (!userLoading && !ownerKey) {
      setIsLoading(false);
      setFoodLoading(false);
      setBoosterLoading(false);
    }
  }, [userLoading, ownerKey]);

  // Initial fetch when ownerKey is available
  useEffect(() => {
    if (!ownerKey) return;
    fetchCreatures(false);
    fetchFood();
    fetchBoosters();
  }, [ownerKey, fetchCreatures, fetchFood, fetchBoosters]);

  // Polling interval
  useEffect(() => {
    if (!ownerKey) return;

    intervalRef.current = setInterval(() => {
      fetchCreatures(true);
      fetchFood();
      fetchBoosters();
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ownerKey, fetchCreatures, fetchFood, fetchBoosters]);

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
    await fetchCreatures(false);
  }, [fetchCreatures]);

  const refetchFood = useCallback(async () => {
    await fetchFood();
  }, [fetchFood]);

  const refetchBoosters = useCallback(async () => {
    await fetchBoosters();
  }, [fetchBoosters]);

  const value = useMemo<VorestContextType>(
    () => ({
      creatures,
      summary,
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
      foodItems,
      foodSummary,
      foodLoading,
      refetchFood,
      boosters,
      boosterSummary,
      boosterLoading,
      refetchBoosters,
      vbucks,
    }),
    [
      creatures,
      summary,
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
      foodItems,
      foodSummary,
      foodLoading,
      refetchFood,
      boosters,
      boosterSummary,
      boosterLoading,
      refetchBoosters,
      vbucks,
    ]
  );

  return (
    <VorestContext.Provider value={value}>
      {children}
    </VorestContext.Provider>
  );
}

export function useVorestContext() {
  const context = useContext(VorestContext);
  if (!context) {
    throw new Error("useVorestContext must be used within a VorestProvider");
  }
  return context;
}
