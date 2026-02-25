"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchUserStatus } from "@/lib/api";

export default function VerifyRequiredContent() {
  const [status, setStatus] = useState<string>("pending");
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [sessionSub, setSessionSub] = useState<string | null>(null);
  const [isRefreshingCode, setIsRefreshingCode] = useState(false);
  const [verified, setVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const [sessionError, setSessionError] = useState("");

  // Fetch verification code from server when session is available
  useEffect(() => {
    if (!sessionSub || verified || isRefreshingCode) {
      return;
    }
    // Only fetch if we don't have a code yet
    if (verificationCode) {
      return;
    }
    setIsRefreshingCode(true);
    requestVerificationCode(sessionSub)
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Failed to get verification code.";
        setError(message);
      })
      .finally(() => setIsRefreshingCode(false));
  }, [sessionSub, verified, verificationCode, isRefreshingCode]);

  useEffect(() => {
    if (!verificationExpiresAt) {
      setSecondsLeft(null);
      return;
    }

    const updateCountdown = () => {
      const nowSeconds = Math.floor(Date.now() / 1000);
      const remaining = Math.max(0, verificationExpiresAt - nowSeconds);
      setSecondsLeft(remaining);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [verificationExpiresAt]);

  const requestVerificationCode = async (sub: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev";

    const response = await fetch(`${apiBaseUrl}/verification/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cognito_sub: sub,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to get verification code.");
    }

    const data = await response.json();
    setVerificationCode(data.verification_code || "");
    if (data.verification_expires) {
      setVerificationExpiresAt(Number(data.verification_expires));
    }
  };

  useEffect(() => {
    let poller: ReturnType<typeof setInterval> | null = null;

    const initSession = async () => {
      try {
        const sessionResponse = await fetch("/api/auth/me");
        if (!sessionResponse.ok) {
          throw new Error("No session found. Please log in again.");
        }
        const session = await sessionResponse.json();
        if (!session?.sub) {
          throw new Error("No session found. Please log in again.");
        }
        setSessionSub(session.sub);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load session.";
        setSessionError(message);
      }
    };

    initSession();

    return () => {
      if (poller) {
        clearInterval(poller);
      }
    };
  }, []);

  useEffect(() => {
    if (!sessionSub) {
      return;
    }

    let poller: ReturnType<typeof setInterval> | null = null;

    const checkStatus = async () => {
      try {
        const result = await fetchUserStatus(sessionSub);
        setStatus(result.status);
        if (result.status === "verified") {
          setVerified(true);
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to check verification.";
        setError(message);
      }
    };

    checkStatus();
    poller = setInterval(checkStatus, 12000);

    return () => {
      if (poller) {
        clearInterval(poller);
      }
    };
  }, [sessionSub]);

  useEffect(() => {
    if (!verified) {
      return;
    }
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [verified]);

  useEffect(() => {
    if (!sessionSub || secondsLeft === null || secondsLeft > 0) {
      return;
    }
    if (isRefreshingCode) {
      return;
    }
    setIsRefreshingCode(true);
    requestVerificationCode(sessionSub)
      .catch((err) => {
        const message =
          err instanceof Error ? err.message : "Failed to refresh code.";
        setError(message);
      })
      .finally(() => setIsRefreshingCode(false));
  }, [secondsLeft, sessionSub, isRefreshingCode]);

  return (
    <div className="auth-card animate-rise w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fog)] text-[var(--moss)]">
          <span className="text-2xl">G</span>
        </div>
        <h1 className="font-display mt-6 text-3xl text-[var(--ink)]">
          Verify in Second Life
        </h1>
        <p className="mt-2 text-sm text-[color:rgba(16,25,21,0.68)]">
          Your portal access unlocks after you verify in-world.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-[rgba(16,25,21,0.12)] bg-white/70 p-4 text-sm text-[rgba(16,25,21,0.7)]">
        <p className="mt-1">
          {verified
            ? "Verification complete. Redirecting you to the dashboard."
            : sessionError
            ? "Session expired. Please log in to continue verification."
            : "Waiting for SL verification. This page updates automatically."}
        </p>
      </div>

      {!verified && verificationCode && !sessionError ? (
        <div className="mt-6 rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 px-6 py-5 text-xl font-semibold tracking-[0.3em] text-[var(--ink)] text-center">
          {verificationCode}
        </div>
      ) : null}

      {!verified && !sessionError ? (
        <div className="mt-3 text-center text-xs text-[rgba(16,25,21,0.6)]">
          {isRefreshingCode
            ? "Loading verification code..."
            : secondsLeft !== null
            ? `Expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
            : "Waiting for verification code."}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {error}
        </div>
      ) : null}

      {sessionError ? (
        <div className="mt-4 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {sessionError}
        </div>
      ) : null}

      <div className="mt-6 flex flex-col gap-3">
        {verified ? (
          <Link
            href="/dashboard"
            className="auth-button w-full rounded-full py-3 text-center text-sm font-semibold uppercase tracking-wide"
          >
            Continue to dashboard
          </Link>
        ) : sessionError ? (
          <Link
            href="/login"
            className="auth-button w-full rounded-full py-3 text-center text-sm font-semibold uppercase tracking-wide"
          >
            Log in to continue
          </Link>
        ) : (
          <>
            <button
              type="button"
              className="auth-button w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide"
              onClick={() => {
                const slurl =
                  process.env.NEXT_PUBLIC_SL_VERIFICATION_URL ||
                  "secondlife://YOUR_REGION/227/30/1594";
                window.open(slurl, "_blank");
              }}
            >
              Teleport to terminal
            </button>
            <button
              type="button"
              className="w-full rounded-full border border-[rgba(16,25,21,0.2)] py-3 text-sm font-semibold text-[rgba(16,25,21,0.7)] disabled:opacity-50"
              onClick={() => {
                if (!sessionSub || isRefreshingCode) return;
                setIsRefreshingCode(true);
                setError("");
                requestVerificationCode(sessionSub)
                  .catch((err) => {
                    const message =
                      err instanceof Error ? err.message : "Failed to refresh code.";
                    setError(message);
                  })
                  .finally(() => setIsRefreshingCode(false));
              }}
              disabled={isRefreshingCode}
            >
              {isRefreshingCode ? "Loading..." : "Refresh code"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
