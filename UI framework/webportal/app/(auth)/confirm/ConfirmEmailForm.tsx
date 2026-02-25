"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { confirmSignUp, resendConfirmationCode } from "@/lib/cognito";

export default function ConfirmEmailForm() {
  const searchParams = useSearchParams();
  const presetEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(presetEmail);
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleConfirm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!email || !code) {
      setError("Email and confirmation code are required.");
      return;
    }

    setIsSubmitting(true);
    try {
      await confirmSignUp(email, code);
      setNotice("Email confirmed. You can now log in.");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Confirmation failed.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setNotice("");
    if (!email) {
      setError("Enter your email to resend the confirmation.");
      return;
    }
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
          Confirm your email
        </h1>
        <p className="mt-2 text-sm text-[color:rgba(16,25,21,0.68)]">
          Enter the code sent to your inbox to activate your account.
        </p>
      </div>

      {notice ? (
        <div className="mt-6 rounded-2xl border border-[rgba(47,91,72,0.3)] bg-[rgba(47,91,72,0.1)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {notice}
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {error}
        </div>
      ) : null}

      <form className="mt-8 space-y-5" onSubmit={handleConfirm}>
        <div className="space-y-2">
          <label className="auth-label" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="auth-input"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <label className="auth-label" htmlFor="code">
            Confirmation code
          </label>
          <input
            id="code"
            name="code"
            className="auth-input"
            placeholder="Enter code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-button w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Confirming..." : "Confirm email"}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-[rgba(16,25,21,0.7)]">
        <button
          type="button"
          onClick={handleResend}
          disabled={isResending}
          className="rounded-full border border-[rgba(16,25,21,0.2)] px-4 py-2 text-xs font-semibold"
        >
          {isResending ? "Resending..." : "Resend email"}
        </button>
        <Link className="text-sm font-semibold text-[var(--moss)]" href="/login">
          Back to login
        </Link>
      </div>
    </div>
  );
}
