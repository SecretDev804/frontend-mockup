"use client";

import {
  Bell,
  CircleHelp,
  Heart,
  LayoutDashboard,
  Library,
  LogOut,
  Mail,
  Menu,
  Package,
  PawPrint,
  Settings,
  Sparkles,
  Store,
  Trees,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { useCreatureContext } from "@/contexts/CreatureContext";
import { useMailboxContext } from "@/contexts/MailboxContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Creatures", href: "/creatures" },
  { label: "Mailbox", href: "/mailbox" },
  { label: "Marketplace", href: "/marketplace" },
];

const iconClass = "h-4 w-4";

const mobileNav = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className={iconClass} /> },
  { label: "My Creatures", href: "/creatures", icon: <PawPrint className={iconClass} /> },
  { label: "Mailbox", href: "/mailbox", icon: <Mail className={iconClass} /> },
  { label: "Inventory", href: "/inventory", icon: <Package className={iconClass} /> },
  { label: "Breeding", href: "/breeding", icon: <Heart className={iconClass} /> },
  { label: "Collection", href: "/collection", icon: <Library className={iconClass} /> },
  { label: "Marketplace", href: "/marketplace", icon: <Store className={iconClass} /> },
  { label: "Great Beyond", href: "/great-beyond", icon: <Sparkles className={iconClass} /> },
  { label: "Vorest", href: "/vorest", icon: <Trees className={iconClass} /> },
  { label: "Profile", href: "/profile", icon: <User className={iconClass} /> },
  { label: "Settings", href: "/settings", icon: <Settings className={iconClass} /> },
  { label: "Help", href: "/help", icon: <CircleHelp className={iconClass} /> },
];

export default function DashboardHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const { gbpBalance, avatarName, isLoading: userLoading } = useUserContext();
  const { needsAttention } = useCreatureContext();
  const { itemCount } = useMailboxContext();

  const hasNotifications = needsAttention > 0 || itemCount > 0;

  const initials = avatarName
    ? avatarName.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("")
    : "?";

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  // Close account dropdown on outside click
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Close mobile drawer on navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-[rgba(17,24,39,0.08)] bg-white shadow-[var(--shadow-header)]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between gap-6 px-6 py-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setIsMobileOpen(true)}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.6)] transition hover:text-[var(--moss)] lg:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="h-4 w-4" />
            </button>

            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-display text-lg text-[var(--moss)]">
                GOOBIEZ
              </span>
            </Link>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-[rgba(17,24,39,0.65)] lg:flex">
            {navItems.map((item) => {
              const isActive = pathname?.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative pb-1 transition-colors ${
                    isActive
                      ? "text-[var(--moss)]"
                      : "hover:text-[var(--moss)]"
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-[var(--moss)]" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-[rgba(218,165,32,0.18)] px-4 py-2 text-xs font-semibold text-[var(--ember)] sm:flex">
              <Sparkles className="h-3.5 w-3.5" />
              {userLoading ? "..." : `${gbpBalance.toLocaleString()} GBP`}
            </div>
            <button
              type="button"
              className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(17,24,39,0.1)] bg-white text-[rgba(17,24,39,0.6)] transition hover:border-[rgba(45,93,49,0.35)] hover:text-[var(--moss)]"
              aria-label="Notifications"
            >
              <Bell className="h-4 w-4" />
              {hasNotifications && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-[var(--ember)]" />
              )}
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[rgba(17,24,39,0.1)] bg-[rgba(45,93,49,0.12)] text-xs font-bold text-[var(--moss)]"
                aria-label="Account menu"
              >
                {initials}
                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border border-white bg-[var(--moss)]" />
              </button>

              {isMenuOpen ? (
                <div className="absolute right-0 mt-3 w-44 rounded-2xl border border-[rgba(17,24,39,0.08)] bg-white p-2 shadow-[0_12px_24px_rgba(17,24,39,0.12)]">
                  <button
                    type="button"
                    onClick={() => router.push("/profile")}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[rgba(17,24,39,0.7)] transition hover:bg-[rgba(45,93,49,0.08)] hover:text-[var(--moss)]"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[rgba(17,24,39,0.7)] transition hover:bg-[rgba(196,107,46,0.12)] hover:text-[var(--ember)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile navigation drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          {/* Drawer */}
          <nav className="animate-slide-in absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-[var(--shadow-card-hover)]">
            {/* Drawer header */}
            <div className="flex items-center justify-between border-b border-[rgba(17,24,39,0.08)] px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[rgba(45,93,49,0.12)] text-[var(--moss)]">
                  <Sparkles className="h-4 w-4" />
                </div>
                <span className="font-display text-base text-[var(--moss)]">
                  GOOBIEZ
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-[rgba(17,24,39,0.5)] transition hover:bg-[rgba(17,24,39,0.05)]"
                aria-label="Close menu"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto p-3">
              <div className="flex flex-col gap-0.5">
                {mobileNav.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        isActive
                          ? "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
                          : "text-[rgba(17,24,39,0.65)] hover:bg-[rgba(17,24,39,0.05)]"
                      }`}
                    >
                      <span
                        className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
                          isActive
                            ? "border-[rgba(45,93,49,0.4)] bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
                            : "border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.55)]"
                        }`}
                      >
                        {item.icon}
                      </span>
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Drawer footer */}
            <div className="border-t border-[rgba(17,24,39,0.08)] p-3">
              <div className="flex items-center gap-2 rounded-xl bg-[rgba(218,165,32,0.12)] px-3 py-2.5 text-xs font-semibold text-[var(--ember)]">
                <Sparkles className="h-3.5 w-3.5" />
                {userLoading ? "..." : `${gbpBalance.toLocaleString()} GBP`}
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[rgba(17,24,39,0.65)] transition hover:bg-[rgba(196,107,46,0.08)] hover:text-[var(--ember)]"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
