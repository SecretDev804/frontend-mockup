"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { confirmSignUp, signUpUser } from "@/lib/cognito";
import { fetchUserStatus } from "@/lib/api";

const steps = [
  { id: 1, label: "Details" },
  { id: 2, label: "Terms" },
  { id: 3, label: "Email" },
  { id: 4, label: "SL Verify" },
];

export default function RegisterContent() {
  const [step, setStep] = useState(1);
  const [slName, setSlName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationExpiresAt, setVerificationExpiresAt] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isResendingEmail, setIsResendingEmail] = useState(false);
  const [isConfirmingEmail, setIsConfirmingEmail] = useState(false);
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [slVerified, setSlVerified] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);
  const [slNotice, setSlNotice] = useState("");

  const handleContinue = () => {
    if (!slName || !email || !password || !confirmPassword) {
      setError("Please complete all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setStep(2);
  };

  const requestVerificationCode = async (userSub: string) => {
    const apiBaseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ||
      "https://3w4cqxw8y1.execute-api.eu-north-1.amazonaws.com/dev";

    const response = await fetch(`${apiBaseUrl}/verification/code`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cognito_sub: userSub,
        email,
        sl_avatar_name: slName,
      }),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || "Failed to request verification code.");
    }

    const data = await response.json();
    setVerificationCode(data.verification_code || "");
    if (data.verification_expires) {
      setVerificationExpiresAt(Number(data.verification_expires));
    }
  };

  const handleCreateAccount = async () => {
    if (!acceptedTerms) {
      setError("Please accept the terms to continue.");
      return;
    }
    setError("");
    setIsLoading(true);
    try {
      const result = await signUpUser(email, password);

      if (typeof window !== "undefined") {
        localStorage.setItem("goobiez_sl_name", slName);
        localStorage.setItem("goobiez_cognito_sub", result.userSub);
      }
      setEmailConfirmed(false);
      setStep(3);
    } catch (err) {
      const code = (err as { code?: string })?.code;
      if (code === "UsernameExistsException") {
        setError("Account already exists. Please log in instead.");
        return;
      }
      const message =
        err instanceof Error ? err.message : "Registration failed.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmEmail = async () => {
    if (!confirmationCode) {
      setError("Enter the confirmation code from your email.");
      return;
    }
    setError("");
    setIsConfirmingEmail(true);
    try {
      await confirmSignUp(email, confirmationCode);
      setEmailConfirmed(true);
      const storedSub = typeof window !== "undefined"
        ? localStorage.getItem("goobiez_cognito_sub")
        : null;
      if (!storedSub) {
        throw new Error("Missing account session. Please log in again.");
      }
      await requestVerificationCode(storedSub);
      setStep(4);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Email confirmation failed.";
      setError(message);
    } finally {
      setIsConfirmingEmail(false);
    }
  };

  const handleRegenerate = async () => {
    if (!verificationCode) {
      setError("Register first to generate a code.");
      return;
    }
    setError("");
    setIsRegenerating(true);
    try {
      const storedSub = typeof window !== "undefined"
        ? localStorage.getItem("goobiez_cognito_sub")
        : null;
      if (!storedSub) {
        throw new Error("Missing account session. Please log in again.");
      }
      await requestVerificationCode(storedSub);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to regenerate code.";
      setError(message);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleTeleport = () => {
    const slurl =
      process.env.NEXT_PUBLIC_SL_VERIFICATION_URL ||
      "secondlife://YOUR_REGION/227/30/1594";
    if (typeof window !== "undefined") {
      window.open(slurl, "_blank");
    }
  };

  const handleResendEmail = async () => {
    setError("");
    setIsResendingEmail(true);
    try {
      const { resendConfirmationCode } = await import("../../../lib/cognito");
      await resendConfirmationCode(email);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to resend confirmation.";
      setError(message);
    } finally {
      setIsResendingEmail(false);
    }
  };

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

  useEffect(() => {
    if (step !== 4) {
      return;
    }

    let poller: ReturnType<typeof setInterval> | null = null;

    const checkStatus = async () => {
      try {
        const storedSub = typeof window !== "undefined"
          ? localStorage.getItem("goobiez_cognito_sub")
          : null;
        if (!storedSub) {
          throw new Error("Missing account session. Please log in again.");
        }
        const status = await fetchUserStatus(storedSub);
        if (status.status === "verified") {
          setSlVerified(true);
          setSlNotice("SL verification complete. Redirecting to dashboard...");
          if (poller) {
            clearInterval(poller);
          }
          setTimeout(() => {
            window.location.href = "/dashboard";
          }, 2500);
        } else {
          setSlNotice("Waiting for SL verification...");
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
  }, [step]);

  useEffect(() => {
    if (!slVerified) {
      return;
    }
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [slVerified]);

  useEffect(() => {
    if (step !== 4) {
      return;
    }
    if (!verificationExpiresAt || secondsLeft === null) {
      return;
    }
    if (secondsLeft > 0 || isRegenerating) {
      return;
    }
    handleRegenerate();
  }, [secondsLeft, verificationExpiresAt, isRegenerating, step]);

  useEffect(() => {
    if (emailConfirmed && step === 3) {
      setStep(4);
    }
  }, [emailConfirmed, step]);

  return (
    <div className="auth-card animate-rise w-full max-w-lg rounded-3xl p-8 sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fog)] text-[var(--moss)]">
          <span className="text-2xl">G</span>
        </div>
        <h1 className="font-display mt-6 text-3xl text-[var(--ink)]">
          Create your account
        </h1>
        <p className="mt-2 text-sm text-[color:rgba(16,25,21,0.68)]">
          Start building your Goobiez collection.
        </p>
      </div>

      <div className="mt-8">
        <div className="relative">
          <div
            className="absolute top-4 z-0 h-1 rounded-full bg-[rgba(16,25,21,0.12)]"
            style={{ left: "12.5%", right: "12.5%" }}
          />
          <div
            className="absolute top-4 z-0 h-1 rounded-full bg-[var(--moss)] transition-all"
            style={{
              left: "12.5%",
              width: `${((step - 1) / (steps.length - 1)) * 75}%`,
            }}
          />
          <div className="flex items-center justify-between gap-2">
            {steps.map((item) => {
              const isActive = item.id === step;
              const isDone = item.id < step;
              return (
                <div key={item.id} className="flex flex-1 flex-col items-center">
                  <div
                    className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                      isActive
                        ? "border-[var(--moss)] bg-white text-[var(--moss)] shadow-[0_0_0_4px_rgba(45,93,49,0.1)]"
                        : isDone
                        ? "border-[var(--moss)] bg-[var(--moss)] text-white"
                        : "border-[rgba(16,25,21,0.2)] bg-white text-[rgba(16,25,21,0.45)]"
                    }`}
                  >
                    {item.id}
                  </div>
                  <span className="mt-2 text-xs text-[rgba(16,25,21,0.6)]">
                    {item.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error ? (
        <div className="mt-6 rounded-2xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
          {error}
        </div>
      ) : null}

      {step === 1 && (
        <form className="mt-8 space-y-4">
          <div className="space-y-2">
            <label className="auth-label" htmlFor="sl-name">
              Second Life name
            </label>
            <input
              id="sl-name"
              name="slName"
              placeholder="YourName Resident"
              className="auth-input"
              value={slName}
              onChange={(event) => setSlName(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="auth-label" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              className="auth-input"
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
              placeholder="Create a password"
              className="auth-input"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="auth-label" htmlFor="confirm-password">
              Confirm password
            </label>
            <input
              id="confirm-password"
              name="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              className="auth-input"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="button"
            className="auth-button mt-4 w-full rounded-full py-3 text-sm font-semibold uppercase tracking-wide"
            onClick={handleContinue}
          >
            Continue
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="mt-8 space-y-6">
          <div className="rounded-2xl bg-[rgba(16,25,21,0.04)] p-4 text-sm text-[rgba(16,25,21,0.7)]">
            After registration, verify your Second Life account at the portal
            terminal to link your creatures.
          </div>

          <label className="flex items-start gap-3 text-sm text-[rgba(16,25,21,0.65)]">
            <input
              type="checkbox"
              className="mt-1 h-4 w-4 rounded"
              checked={acceptedTerms}
              onChange={(event) => setAcceptedTerms(event.target.checked)}
            />
            I agree to the Terms of Service and Privacy Policy.
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="w-full rounded-full border border-[rgba(16,25,21,0.2)] py-2 text-sm font-semibold text-[rgba(16,25,21,0.7)]"
              onClick={() => setStep(1)}
            >
              Back
            </button>
            <button
              type="button"
              className="auth-button w-full rounded-full py-2 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleCreateAccount}
              disabled={isLoading}
            >
              {isLoading ? "Creating..." : "Create account"}
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="mt-8 space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fog)] text-[var(--moss)]">
            <span className="text-base font-semibold">OK</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              Account created
            </h2>
            <p className="mt-1 text-sm text-[rgba(16,25,21,0.7)]">
              Confirm your email first, then verify in Second Life.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div className="rounded-2xl border border-[rgba(16,25,21,0.12)] bg-white/70 p-4 text-sm text-[rgba(16,25,21,0.7)]">
              We sent a confirmation code to your email. Enter it below to
              unlock SL verification.
            </div>
            <div className="space-y-2">
              <label className="auth-label" htmlFor="confirm-code">
                Email confirmation code
              </label>
              <input
                id="confirm-code"
                name="confirmCode"
                className="auth-input"
                placeholder="Enter code"
                value={confirmationCode}
                onChange={(event) => setConfirmationCode(event.target.value)}
              />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="auth-button w-full rounded-full py-2 text-sm font-semibold uppercase tracking-wide disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleConfirmEmail}
                disabled={isConfirmingEmail}
              >
                {isConfirmingEmail ? "Confirming..." : "Confirm email"}
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[rgba(16,25,21,0.2)] py-2 text-sm font-semibold text-[rgba(16,25,21,0.7)]"
                onClick={handleResendEmail}
                disabled={isResendingEmail}
              >
                {isResendingEmail ? "Resending..." : "Resend email"}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="mt-8 space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--fog)] text-[var(--moss)]">
            <span className="text-base font-semibold">OK</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[var(--ink)]">
              {slVerified ? "Verification complete" : "Verify in Second Life"}
            </h2>
            <p className="mt-1 text-sm text-[rgba(16,25,21,0.7)]">
              {slVerified
                ? "You're all set. Redirecting you to the dashboard."
                : "Use this code at the verification terminal."}
            </p>
          </div>

          {!slVerified ? (
            <>
              <div className="rounded-2xl border border-dashed border-[rgba(16,25,21,0.2)] bg-white/70 px-6 py-5 text-xl font-semibold tracking-[0.3em] text-[var(--ink)]">
                {verificationCode || "CODE-PENDING"}
              </div>
              <div className="text-xs text-[rgba(16,25,21,0.6)]">
                {secondsLeft !== null
                  ? `Expires in ${Math.floor(secondsLeft / 60)}:${String(secondsLeft % 60).padStart(2, "0")}`
                  : "Waiting for verification code."}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-[rgba(45,93,49,0.25)] bg-[rgba(45,93,49,0.08)] px-6 py-5 text-sm text-[rgba(16,25,21,0.7)]">
              Redirecting in {redirectCountdown}s
            </div>
          )}

          {slNotice ? (
            <div className="rounded-2xl border border-[rgba(47,91,72,0.3)] bg-[rgba(47,91,72,0.1)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
              {slNotice}
            </div>
          ) : null}

          {!slVerified ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                className="auth-button w-full rounded-full py-2 text-sm font-semibold uppercase tracking-wide"
                onClick={handleTeleport}
              >
                Teleport to terminal
              </button>
              <button
                type="button"
                className="w-full rounded-full border border-[rgba(16,25,21,0.2)] py-2 text-sm font-semibold text-[rgba(16,25,21,0.7)]"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? "Regenerating..." : "Regenerate code"}
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="auth-button w-full rounded-full py-2 text-sm font-semibold uppercase tracking-wide"
              >
                Continue to dashboard
              </Link>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 text-center text-sm text-[rgba(16,25,21,0.7)]">
        Already have an account?{" "}
        <Link className="font-semibold text-[var(--moss)]" href="/login">
          Log in
        </Link>
      </div>
    </div>
  );
}
