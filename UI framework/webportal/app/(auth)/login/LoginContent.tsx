"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { resendConfirmationCode, signInUser } from "@/lib/cognito";
import { decodeJwt } from "@/lib/auth";
import { fetchUserStatus } from "@/lib/api";

function LoginForm() {
  const [rememberMe, setRememberMe] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  const noticeParam = searchParams.get("notice");
  const [notice, setNotice] = useState(
    noticeParam === "password_reset"
      ? "Password reset successfully. Please sign in with your new password."
      : ""
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      const session = await signInUser(email, password);
      const sessionResponse = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken: session.accessToken,
          idToken: session.idToken,
          refreshToken: session.refreshToken,
          rememberMe,
        }),
      });

      if (!sessionResponse.ok) {
        throw new Error("Failed to create session.");
      }

      const payload = decodeJwt(session.idToken);
      if (payload?.sub) {
        const status = await fetchUserStatus(payload.sub);
        if (status.status !== "verified") {
          router.push("/verify-required");
          return;
        }
      }
      router.push("/dashboard");
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "UserNotConfirmedException") {
        setNeedsConfirmation(true);
        setNotice("Email not confirmed. Please confirm to continue.");
        return;
      }
      const message =
        err instanceof Error ? err.message : "Unable to sign in.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      setError("Enter your email to resend the confirmation.");
      return;
    }
    setError("");
    setNotice("");
    setIsResending(true);
    try {
      await resendConfirmationCode(email);
      setNotice("Confirmation email sent. Check your inbox.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend confirmation.";
      setError(message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="auth-card animate-rise w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fog)] text-[var(--moss)]">
          <span className="text-2xl">G</span>
        </div>
        <h1 className="font-display mt-6 text-3xl text-[var(--ink)]">
          Goobiez Portal
        </h1>
        <p className="mt-2 text-sm text-[color:rgba(16,25,21,0.68)]">
          Welcome back to your creatures and mailbox.
        </p>
      </div>

      {notice ? (
        <div className="mt-6 rounded-2xl border border-[rgba(47,91,72,0.3)] bg-[rgba(47,91,72,0.1)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-6 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {error}
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="you@example.com"
            className="auth-input"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="auth-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            className="auth-input"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="flex items-center justify-between text-sm text-[rgba(16,25,21,0.7)]">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="h-4 w-4 rounded border-[rgba(16,25,21,0.3)]"
            />
            Remember me
          </label>
          <Link
            href="/forgot-password"
            className="text-sm font-semibold text-[var(--moss)]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="auth-button w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isLoading ? "Signing in..." : "Log in"}
        </button>
      </form>

      {needsConfirmation ? (
        <div className="mt-6 rounded-2xl border border-[rgba(16,25,21,0.12)] bg-white/70 p-4 text-sm text-[rgba(16,25,21,0.7)]">
          <p className="font-semibold text-[var(--ink)]">
            Email confirmation required
          </p>
          <p className="mt-1">
            Please confirm your email to finish login.
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleResendConfirmation}
              className="rounded-full border border-[rgba(16,25,21,0.2)] px-4 py-2 text-xs font-semibold"
              disabled={isResending}
            >
              {isResending ? "Resending..." : "Resend confirmation"}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/confirm?email=${encodeURIComponent(email)}`)}
              className="rounded-full border border-[rgba(16,25,21,0.2)] px-4 py-2 text-xs font-semibold"
            >
              Confirm now
            </button>
          </div>
        </div>
      ) : null}

      <div className="mt-8 text-center text-sm text-[rgba(16,25,21,0.7)]">
        <span>New here? </span>
        <Link className="font-semibold text-[var(--moss)]" href="/register">
          Create an account
        </Link>
      </div>

      <div className="mt-6 border-t border-[rgba(16,25,21,0.08)] pt-6 text-center text-xs text-[rgba(16,25,21,0.55)]">
        Manage breeding, deliveries, and portal rewards from one place.
      </div>
    </div>
  );
}

export default function LoginContent() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
