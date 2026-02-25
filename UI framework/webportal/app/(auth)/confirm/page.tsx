import type { Metadata } from "next";
import { Suspense } from "react";
import ConfirmEmailForm from "./ConfirmEmailForm";

export const metadata: Metadata = {
  title: "Confirm Email | Goobiez Portal",
  description: "Confirm your email address to activate your Goobiez Portal account.",
};

function LoadingFallback() {
  return (
    <div className="auth-card animate-rise w-full max-w-md rounded-3xl p-8 sm:p-10">
      <div className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--fog)] animate-pulse" />
        <div className="mt-6 h-8 w-48 mx-auto rounded bg-[var(--fog)] animate-pulse" />
        <div className="mt-2 h-4 w-64 mx-auto rounded bg-[var(--fog)] animate-pulse" />
      </div>
      <div className="mt-8 space-y-5">
        <div className="h-10 w-full rounded-xl bg-[var(--fog)] animate-pulse" />
        <div className="h-10 w-full rounded-xl bg-[var(--fog)] animate-pulse" />
        <div className="h-12 w-full rounded-full bg-[var(--fog)] animate-pulse" />
      </div>
    </div>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ConfirmEmailForm />
    </Suspense>
  );
}
