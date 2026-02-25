import Link from "next/link";

export default function DashboardFooter() {
  return (
    <footer className="border-t border-[rgba(17,24,39,0.08)] bg-white py-6">
      <div className="mx-auto flex w-full max-w-[1400px] flex-col items-center justify-between gap-4 px-6 text-xs text-[rgba(17,24,39,0.6)] md:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold text-[var(--moss)]">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(45,93,49,0.12)]">
            G
          </span>
          Goobiez Portal
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link href="/help" className="hover:text-[var(--moss)]">
            Help
          </Link>
          <Link href="/terms" className="hover:text-[var(--moss)]">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-[var(--moss)]">
            Privacy
          </Link>
          <a
            href="https://secondlife.com"
            target="_blank"
            rel="noreferrer"
            className="hover:text-[var(--moss)]"
          >
            Second Life
          </a>
        </div>
        <span>Copyright 2026 Goobiez.</span>
      </div>
    </footer>
  );
}
