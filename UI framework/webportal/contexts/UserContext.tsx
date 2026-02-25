"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { fetchUserStatus, type UserStatus } from "@/lib/api";

type UserContextType = {
  cognitoSub: string | null;
  userId: string | null; // user_id from users table
  ownerKey: string | null; // sl_avatar_key for backend calls
  avatarName: string | null; // Display name
  email: string | null; // Email from Cognito JWT
  accountStatus: string | null; // 'pending' | 'sl_only' | 'verified'
  gbpBalance: number; // Great Beyond Points
  tokens: number; // Tokens from deliveries
  rareTokens: number; // Rare tokens from deliveries
  vbucks: number; // Vbucks for Vorest purchases
  isLoading: boolean;
  error: string | null;
  refreshBalance: () => Promise<void>; // Refresh balance after transactions
};

const UserContext = createContext<UserContextType | null>(null);

type UserProviderProps = {
  children: ReactNode;
};

export function UserProvider({ children }: UserProviderProps) {
  const [cognitoSub, setCognitoSub] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [ownerKey, setOwnerKey] = useState<string | null>(null);
  const [avatarName, setAvatarName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [accountStatus, setAccountStatus] = useState<string | null>(null);
  const [gbpBalance, setGbpBalance] = useState<number>(0);
  const [tokens, setTokens] = useState<number>(0);
  const [rareTokens, setRareTokens] = useState<number>(0);
  const [vbucks, setVbucks] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isMountedRef = useRef(true);

  // Phase 1: Get Cognito sub and email from session
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (isMountedRef.current) {
          setCognitoSub(data.sub || null);
          setEmail(data.email || null);
        }
      })
      .catch(() => {
        if (isMountedRef.current) {
          setCognitoSub(null);
          setIsLoading(false);
        }
      });
  }, []);

  // Phase 2: Get owner_key from user status
  useEffect(() => {
    if (!cognitoSub) return;

    fetchUserStatus(cognitoSub)
      .then((status) => {
        if (!isMountedRef.current) return;

        if (status.sl_avatar_key) {
          setUserId(status.user_id || null);
          setOwnerKey(status.sl_avatar_key);
          setAvatarName(status.sl_avatar_name || null);
          setAccountStatus(status.status || null);
          setGbpBalance(status.great_beyond_points || 0);
          setTokens(status.tokens || 0);
          setRareTokens(status.rare_tokens || 0);
          setVbucks(status.vbucks || 0);
        } else {
          setError("SL account not linked. Please verify in Second Life.");
        }
      })
      .catch((err) => {
        if (!isMountedRef.current) return;
        setError(err.message || "Failed to get user status.");
      })
      .finally(() => {
        if (isMountedRef.current) {
          setIsLoading(false);
        }
      });
  }, [cognitoSub]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Refresh balance after transactions (e.g., sending creature to Great Beyond)
  const refreshBalance = useCallback(async () => {
    if (!cognitoSub) return;
    try {
      const status = await fetchUserStatus(cognitoSub);
      if (isMountedRef.current) {
        setGbpBalance(status.great_beyond_points || 0);
        setTokens(status.tokens || 0);
        setRareTokens(status.rare_tokens || 0);
        setVbucks(status.vbucks || 0);
      }
    } catch (err) {
      console.error("Failed to refresh balance:", err);
    }
  }, [cognitoSub]);

  const value = useMemo<UserContextType>(
    () => ({
      cognitoSub,
      userId,
      ownerKey,
      avatarName,
      email,
      accountStatus,
      gbpBalance,
      tokens,
      rareTokens,
      vbucks,
      isLoading,
      error,
      refreshBalance,
    }),
    [cognitoSub, userId, ownerKey, avatarName, email, accountStatus, gbpBalance, tokens, rareTokens, vbucks, isLoading, error, refreshBalance]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be used within a UserProvider");
  }
  return context;
}
