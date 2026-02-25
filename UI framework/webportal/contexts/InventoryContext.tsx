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
  fetchFoodList,
  fetchPedestalList,
  fetchBoosterList,
  type FoodItem,
  type FoodFilters,
  type FoodSort,
  type FoodSummary,
  type PedestalItem,
  type PedestalSummary,
  type BoosterItem,
  type BoosterSummary,
  type PaginationMeta,
  type PaginationParams,
} from "@/lib/api";
import { useUserContext } from "./UserContext";

type InventoryContextType = {
  // Food state
  foodItems: FoodItem[];
  summary: FoodSummary | null;
  filters: FoodFilters;
  sort: FoodSort;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  setFilters: (filters: FoodFilters) => void;
  setSort: (sort: FoodSort) => void;
  refetch: () => Promise<void>;
  // Food pagination
  pagination: PaginationMeta | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  // Pedestal state
  pedestals: PedestalItem[];
  pedestalSummary: PedestalSummary | null;
  pedestalLoading: boolean;
  pedestalError: string | null;
  refetchPedestals: () => Promise<void>;
  // Booster state
  boosters: BoosterItem[];
  boosterSummary: BoosterSummary | null;
  boosterLoading: boolean;
  boosterError: string | null;
  refetchBoosters: () => Promise<void>;
};

const InventoryContext = createContext<InventoryContextType | null>(null);

const DEFAULT_SORT: FoodSort = { field: "created_at", order: "desc" };
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

type InventoryProviderProps = {
  children: ReactNode;
};

export function InventoryProvider({ children }: InventoryProviderProps) {
  const { ownerKey, isLoading: userLoading } = useUserContext();

  // Food state
  const [foodItems, setFoodItems] = useState<FoodItem[]>([]);
  const [summary, setSummary] = useState<FoodSummary | null>(null);
  const [filtersState, setFiltersState] = useState<FoodFilters>({});
  const [sortState, setSortState] = useState<FoodSort>(DEFAULT_SORT);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Food pagination state
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPageState] = useState(1);
  const [pageSize, setPageSizeState] = useState(25);

  // Pedestal state
  const [pedestals, setPedestals] = useState<PedestalItem[]>([]);
  const [pedestalSummary, setPedestalSummary] = useState<PedestalSummary | null>(null);
  const [pedestalLoading, setPedestalLoading] = useState(true);
  const [pedestalError, setPedestalError] = useState<string | null>(null);

  // Booster state
  const [boosters, setBoosters] = useState<BoosterItem[]>([]);
  const [boosterSummary, setBoosterSummary] = useState<BoosterSummary | null>(null);
  const [boosterLoading, setBoosterLoading] = useState(true);
  const [boosterError, setBoosterError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Wrapper for setFilters that resets page to 1
  const setFilters = useCallback((newFilters: FoodFilters) => {
    setFiltersState(newFilters);
    setPageState(1); // Reset to page 1 when filters change
  }, []);

  // Wrapper for setSort that resets page to 1
  const setSort = useCallback((newSort: FoodSort) => {
    setSortState(newSort);
    setPageState(1); // Reset to page 1 when sort changes
  }, []);

  // Wrapper for setPage
  const setPage = useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  // Wrapper for setPageSize that resets page to 1
  const setPageSize = useCallback((newSize: number) => {
    setPageSizeState(newSize);
    setPageState(1); // Reset to page 1 when page size changes
  }, []);

  // Fetch food data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const paginationParams: PaginationParams = { page, pageSize };
        const response = await fetchFoodList(
          ownerKey,
          Object.keys(filtersState).length > 0 ? filtersState : undefined,
          sortState,
          paginationParams
        );

        if (!isMountedRef.current) return;

        setFoodItems(response.food_items);
        setSummary(response.summary);
        setPagination(response.pagination || null);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load inventory.";
        setError(message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
        }
      }
    },
    [ownerKey, filtersState, sortState, page, pageSize]
  );

  // Fetch pedestal data
  const fetchPedestals = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (!isBackground) {
        setPedestalLoading(true);
      }

      try {
        const response = await fetchPedestalList(ownerKey);

        if (!isMountedRef.current) return;

        setPedestals(response.pedestals);
        setPedestalSummary(response.summary);
        setPedestalError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load pedestals.";
        setPedestalError(message);
      } finally {
        if (isMountedRef.current) {
          setPedestalLoading(false);
        }
      }
    },
    [ownerKey]
  );

  // Fetch booster data
  const fetchBoosters = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (!isBackground) {
        setBoosterLoading(true);
      }

      try {
        const response = await fetchBoosterList(ownerKey);

        if (!isMountedRef.current) return;

        setBoosters(response.boosters);
        setBoosterSummary(response.summary);
        setBoosterError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load boosters.";
        setBoosterError(message);
      } finally {
        if (isMountedRef.current) {
          setBoosterLoading(false);
        }
      }
    },
    [ownerKey]
  );

  // Initial fetch when owner_key is available
  useEffect(() => {
    if (userLoading) return; // Wait for user context to load

    if (!ownerKey) {
      setIsLoading(false);
      setPedestalLoading(false);
      setBoosterLoading(false);
      return;
    }

    fetchData(false);
    fetchPedestals(false);
    fetchBoosters(false);
  }, [ownerKey, userLoading, fetchData, fetchPedestals, fetchBoosters]);

  // Polling interval
  useEffect(() => {
    if (!ownerKey) return;

    intervalRef.current = setInterval(() => {
      fetchData(true);
      fetchPedestals(true);
      fetchBoosters(true);
    }, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [ownerKey, fetchData, fetchPedestals, fetchBoosters]);

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

  const refetchPedestals = useCallback(async () => {
    await fetchPedestals(false);
  }, [fetchPedestals]);

  const refetchBoosters = useCallback(async () => {
    await fetchBoosters(false);
  }, [fetchBoosters]);

  const value = useMemo<InventoryContextType>(
    () => ({
      // Food state
      foodItems,
      summary,
      filters: filtersState,
      sort: sortState,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      setFilters,
      setSort,
      refetch,
      // Food pagination
      pagination,
      page,
      pageSize,
      setPage,
      setPageSize,
      // Pedestal state
      pedestals,
      pedestalSummary,
      pedestalLoading,
      pedestalError,
      refetchPedestals,
      // Booster state
      boosters,
      boosterSummary,
      boosterLoading,
      boosterError,
      refetchBoosters,
    }),
    [
      foodItems, summary, filtersState, sortState, isLoading, isRefreshing,
      error, lastUpdated, setFilters, setSort, refetch,
      pagination, page, pageSize, setPage, setPageSize,
      pedestals, pedestalSummary, pedestalLoading, pedestalError, refetchPedestals,
      boosters, boosterSummary, boosterLoading, boosterError, refetchBoosters,
    ]
  );

  return (
    <InventoryContext.Provider value={value}>
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventoryContext() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error(
      "useInventoryContext must be used within an InventoryProvider"
    );
  }
  return context;
}
