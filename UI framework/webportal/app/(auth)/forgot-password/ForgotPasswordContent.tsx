"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  forgotPassword,
  confirmForgotPassword,
} from "@/lib/cognito";

export default function ForgotPasswordContent() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  // Step 1: Request verification code
  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setStep(2);
      setNotice("Verification code sent to your email.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to send reset code.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Reset password with code
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      await confirmForgotPassword(email, code, newPassword);
      router.push("/login?notice=password_reset");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to reset password.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Resend verification code
  const handleResend = async () => {
    setError("");
    setNotice("");
    setIsResending(true);

    try {
      await forgotPassword(email);
      setNotice("A new verification code has been sent.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend code.";
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
          {step === 1 ? "Reset Password" : "Enter New Password"}
        </h1>
        <p className="mt-2 text-sm text-[color:rgba(16,25,21,0.68)]">
          {step === 1
            ? "Enter your email and we'll send you a verification code."
            : "Check your email for the 6-digit verification code."}
        </p>
      </div>

      {notice && (
        <div className="mt-6 rounded-2xl border border-[rgba(47,91,72,0.3)] bg-[rgba(47,91,72,0.1)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {notice}
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {error}
        </div>
      )}

      {/* Step 1: Email */}
      {step === 1 && (
        <form className="mt-8 space-y-5" onSubmit={handleRequestCode}>
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
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Sending..." : "Send Reset Code"}
          </button>
        </form>
      )}

      {/* Step 2: Code + New Password */}
      {step === 2 && (
        <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
          <div className="space-y-2">
            <label className="auth-label" htmlFor="code">
              Verification Code
            </label>
            <input
              id="code"
              name="code"
              type="text"
              placeholder="Enter 6-digit code"
              className="auth-input"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="auth-label" htmlFor="newPassword">
              New Password
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Minimum 8 characters"
              className="auth-input"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <div className="space-y-2">
            <label className="auth-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="auth-input"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="auth-button w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-sm font-semibold text-[var(--moss)] disabled:opacity-50"
            >
              {isResending ? "Resending..." : "Resend code"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-[rgba(16,25,21,0.7)]">
        <Link className="font-semibold text-[var(--moss)]" href="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
