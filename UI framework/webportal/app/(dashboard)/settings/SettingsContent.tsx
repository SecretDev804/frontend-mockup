"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Check,
  Info,
  Loader2,
  Lock,
  LogOut,
  Mail,
  Shield,
} from "lucide-react";
import { useUserContext } from "@/contexts/UserContext";
import { changePassword } from "@/lib/cognito";

const statusLabels: Record<string, string> = {
  verified: "Verified",
  sl_only: "SL Only",
  pending: "Pending Verification",
};

export default function SettingsContent() {
  const router = useRouter();
  const { email, accountStatus, isLoading } = useUserContext();

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // Sign out state
  const [isSigningOut, setIsSigningOut] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess(false);

    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    if (!email) {
      setPasswordError("Email not found. Please sign in again.");
      return;
    }

    setIsChangingPassword(true);

    try {
      await changePassword(email, currentPassword, newPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to change password.";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  const inputClass =
    "w-full rounded-xl border border-[rgba(16,25,21,0.15)] bg-white px-4 py-2.5 text-sm transition focus:border-[var(--moss)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]";

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        <section className="dashboard-surface rounded-3xl p-6 md:p-8">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-gray-200" />
        </section>
        {[1, 2, 3].map((i) => (
          <section key={i} className="dashboard-card rounded-2xl p-6">
            <div className="h-5 w-40 animate-pulse rounded bg-gray-200" />
            <div className="mt-4 h-10 w-full animate-pulse rounded bg-gray-200" />
          </section>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="dashboard-surface rounded-3xl p-6 md:p-8">
        <h1 className="font-display text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
          Manage your account and security
        </p>
      </section>

      {/* Account Information */}
      <section className="dashboard-card rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Shield className="h-5 w-5 text-[var(--moss)]" />
          Account Information
        </h2>

        <div className="mt-4 space-y-3">
          {/* Email */}
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(17,24,39,0.03)] px-4 py-3">
            <Mail className="h-4 w-4 flex-shrink-0 text-[rgba(17,24,39,0.4)]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.55)]">Email</p>
              <p className="text-sm font-medium">{email || "Not available"}</p>
            </div>
          </div>

          {/* Account Status */}
          <div className="flex items-center gap-3 rounded-xl bg-[rgba(17,24,39,0.03)] px-4 py-3">
            <Check className="h-4 w-4 flex-shrink-0 text-[rgba(17,24,39,0.4)]" />
            <div>
              <p className="text-xs text-[rgba(16,25,21,0.55)]">
                Account Status
              </p>
              <p className="text-sm font-medium">
                {statusLabels[accountStatus || "pending"] || accountStatus}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] p-4">
          <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--moss)]" />
          <p className="text-xs text-[rgba(16,25,21,0.65)]">
            Your display name and SL avatar are managed through Second Life.
            Email is linked to your Cognito account.
          </p>
        </div>
      </section>

      {/* Change Password */}
      <section className="dashboard-card rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Lock className="h-5 w-5 text-[var(--moss)]" />
          Change Password
        </h2>

        <form onSubmit={handlePasswordChange} className="mt-4 space-y-4">
          {/* Success message */}
          {passwordSuccess && (
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(45,93,49,0.3)] bg-[rgba(45,93,49,0.1)] px-4 py-3 text-sm text-[var(--moss)]">
              <Check className="h-4 w-4 flex-shrink-0" />
              Password changed successfully.
            </div>
          )}

          {/* Error message */}
          {passwordError && (
            <div className="flex items-center gap-2 rounded-xl border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.12)] px-4 py-3 text-sm text-[rgba(16,25,21,0.8)]">
              <AlertTriangle className="h-4 w-4 flex-shrink-0 text-[var(--ember)]" />
              {passwordError}
            </div>
          )}

          <div className="space-y-2">
            <label
              htmlFor="currentPassword"
              className="text-sm font-semibold text-[rgba(16,25,21,0.78)]"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              className={inputClass}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="newPassword"
              className="text-sm font-semibold text-[rgba(16,25,21,0.78)]"
            >
              New Password
            </label>
            <input
              id="newPassword"
              type="password"
              className={inputClass}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
            <p className="text-xs text-[rgba(16,25,21,0.5)]">
              Minimum 8 characters
            </p>
          </div>

          <div className="space-y-2">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-semibold text-[rgba(16,25,21,0.78)]"
            >
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              className={inputClass}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={isChangingPassword}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[var(--moss)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--moss-strong)] disabled:opacity-50"
          >
            {isChangingPassword ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Changing Password...
              </>
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </section>

      {/* Sign Out */}
      <section className="dashboard-card rounded-2xl p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <LogOut className="h-5 w-5 text-[rgba(17,24,39,0.6)]" />
          Sign Out
        </h2>
        <p className="mt-1 text-sm text-[rgba(17,24,39,0.6)]">
          Sign out of your account on this device.
        </p>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-[rgba(17,24,39,0.1)] px-4 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.7)] transition hover:border-[rgba(196,107,46,0.35)] hover:bg-[rgba(196,107,46,0.05)] hover:text-[var(--ember)] disabled:opacity-50"
        >
          {isSigningOut ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing Out...
            </>
          ) : (
            <>
              <LogOut className="h-4 w-4" />
              Sign Out
            </>
          )}
        </button>
      </section>

      {/* Danger Zone */}
      <section className="dashboard-card rounded-2xl border-l-4 border-l-[rgba(196,107,46,0.5)] p-6 opacity-60">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--ember)]" />
          <div>
            <h3 className="text-sm font-semibold text-[var(--ember)]">
              Delete Account
            </h3>
            <p className="mt-1 text-xs text-[rgba(17,24,39,0.6)]">
              Permanently delete your account and all associated data. This
              action cannot be undone.
            </p>
            <button
              disabled
              className="mt-4 cursor-not-allowed rounded-full border border-[rgba(196,107,46,0.35)] bg-[rgba(196,107,46,0.05)] px-4 py-2 text-xs font-semibold text-[var(--ember)] opacity-50"
            >
              Delete Account (Coming Soon)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
