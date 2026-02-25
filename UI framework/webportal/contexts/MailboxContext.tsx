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
  fetchMailbox,
  claimMailboxItem,
  claimAllMailboxItems,
  type MailboxItem,
  type ClaimMailboxItemResponse,
  type ClaimAllMailboxResponse,
} from "@/lib/api";
import { useUserContext } from "./UserContext";

type MailboxContextType = {
  items: MailboxItem[];
  itemCount: number;
  capacity: number;
  isFull: boolean;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  lastUpdated: Date | null;
  refetch: () => Promise<void>;
  claimItem: (itemId: string) => Promise<ClaimMailboxItemResponse>;
  claimAll: () => Promise<ClaimAllMailboxResponse>;
};

const MailboxContext = createContext<MailboxContextType | null>(null);

const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

type MailboxProviderProps = {
  children: ReactNode;
};

export function MailboxProvider({ children }: MailboxProviderProps) {
  const { ownerKey, isLoading: userLoading } = useUserContext();

  const [items, setItems] = useState<MailboxItem[]>([]);
  const [itemCount, setItemCount] = useState(0);
  const [capacity, setCapacity] = useState(20);
  const [isFull, setIsFull] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isMountedRef = useRef(true);

  // Fetch mailbox data
  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!ownerKey) return;

      if (isBackground) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await fetchMailbox(ownerKey);

        if (!isMountedRef.current) return;

        const mailbox = response.mailbox;
        setItems(mailbox.items);
        setItemCount(mailbox.item_count);
        setCapacity(mailbox.capacity);
        setIsFull(mailbox.is_full);
        setLastUpdated(new Date());
        setError(null);
      } catch (err) {
        if (!isMountedRef.current) return;
        const message =
          err instanceof Error ? err.message : "Failed to load mailbox.";
        setError(message);
      } finally {
        if (isMountedRef.current) {
          setIsLoading(false);
          setIsRefreshing(false);
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
      return;
    }

    fetchData(false);
  }, [ownerKey, userLoading, fetchData]);

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

  const claimItem = useCallback(
    async (itemId: string): Promise<ClaimMailboxItemResponse> => {
      if (!ownerKey) throw new Error("Not authenticated");
      const result = await claimMailboxItem(ownerKey, itemId);
      await fetchData(false);
      return result;
    },
    [ownerKey, fetchData]
  );

  const claimAll = useCallback(async (): Promise<ClaimAllMailboxResponse> => {
    if (!ownerKey) throw new Error("Not authenticated");
    const result = await claimAllMailboxItems(ownerKey);
    await fetchData(false);
    return result;
  }, [ownerKey, fetchData]);

  const value = useMemo<MailboxContextType>(
    () => ({
      items,
      itemCount,
      capacity,
      isFull,
      isLoading,
      isRefreshing,
      error,
      lastUpdated,
      refetch,
      claimItem,
      claimAll,
    }),
    [items, itemCount, capacity, isFull, isLoading, isRefreshing, error, lastUpdated, refetch, claimItem, claimAll]
  );

  return (
    <MailboxContext.Provider value={value}>{children}</MailboxContext.Provider>
  );
}

export function useMailboxContext() {
  const context = useContext(MailboxContext);
  if (!context) {
    throw new Error("useMailboxContext must be used within a MailboxProvider");
  }
  return context;
}
