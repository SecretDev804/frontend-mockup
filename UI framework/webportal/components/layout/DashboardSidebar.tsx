"use client";

import {
  CircleHelp,
  Heart,
  LayoutDashboard,
  Library,
  Mail,
  Package,
  PawPrint,
  Settings,
  Sparkles,
  Store,
  Trees,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCreatureContext } from "@/contexts/CreatureContext";
import { useMailboxContext } from "@/contexts/MailboxContext";
import { useUserContext } from "@/contexts/UserContext";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const iconClass = "h-4 w-4";

const mainNav: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className={iconClass} />,
  },
  {
    label: "My Creatures",
    href: "/creatures",
    icon: <PawPrint className={iconClass} />,
  },
  {
    label: "Mailbox",
    href: "/mailbox",
    icon: <Mail className={iconClass} />,
  },
  {
    label: "Inventory",
    href: "/inventory",
    icon: <Package className={iconClass} />,
  },
];

const activityNav: NavItem[] = [
  {
    label: "Breeding",
    href: "/breeding",
    icon: <Heart className={iconClass} />,
  },
  {
    label: "Collection",
    href: "/collection",
    icon: <Library className={iconClass} />,
  },
  {
    label: "Marketplace",
    href: "/marketplace",
    icon: <Store className={iconClass} />,
  },
  {
    label: "Great Beyond",
    href: "/great-beyond",
    icon: <Sparkles className={iconClass} />,
  },
  {
    label: "Vorest",
    href: "/vorest",
    icon: <Trees className={iconClass} />,
  },
];

const accountNav: NavItem[] = [
  {
    label: "Profile",
    href: "/profile",
    icon: <User className={iconClass} />,
  },
  {
    label: "Settings",
    href: "/settings",
    icon: <Settings className={iconClass} />,
  },
  {
    label: "Help",
    href: "/help",
    icon: <CircleHelp className={iconClass} />,
  },
];

function NavIcon({
  active,
  icon,
}: {
  active: boolean;
  icon: React.ReactNode;
}) {
  return (
    <span
      className={`inline-flex h-7 w-7 items-center justify-center rounded-full border ${
        active
          ? "border-[rgba(45,93,49,0.4)] bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
          : "border-[rgba(17,24,39,0.1)] text-[rgba(17,24,39,0.55)]"
      }`}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}

function NavLink({
  item,
  isActive,
  badge,
}: {
  item: NavItem;
  isActive: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <Link
      href={item.href}
      className={`group relative flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-semibold transition-colors ${
        isActive
          ? "bg-[rgba(45,93,49,0.12)] text-[var(--moss)]"
          : "text-[rgba(17,24,39,0.65)] hover:bg-[rgba(17,24,39,0.05)]"
      }`}
    >
      <NavIcon active={isActive} icon={item.icon} />
      <span>{item.label}</span>
      {badge}
      {isActive && (
        <span className="absolute right-2.5 h-5 w-1 rounded-full bg-[var(--moss)]" />
      )}
    </Link>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[rgba(17,24,39,0.35)]">
      {children}
    </p>
  );
}

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { needsAttention, isLoading } = useCreatureContext();
  const { itemCount, isLoading: mailboxLoading } = useMailboxContext();
  const { gbpBalance, vbucks, isLoading: userLoading } = useUserContext();

  const getBadge = (label: string) => {
    if (label === "My Creatures" && !isLoading && needsAttention > 0) {
      return (
        <span className="ml-auto rounded-full bg-[rgba(196,107,46,0.2)] px-2 py-0.5 text-[10px] font-bold text-[var(--ember)]">
          {needsAttention}
        </span>
      );
    }
    if (label === "Mailbox" && !mailboxLoading && itemCount > 0) {
      return (
        <span className="ml-auto rounded-full bg-[rgba(45,93,49,0.12)] px-2 py-0.5 text-[10px] font-bold text-[var(--moss)]">
          {itemCount}
        </span>
      );
    }
    return undefined;
  };

  return (
    <aside className="sticky top-24 hidden h-[calc(100vh-6rem)] w-56 flex-shrink-0 flex-col justify-between rounded-3xl border border-[rgba(17,24,39,0.08)] bg-white p-3 shadow-[0_16px_32px_rgba(17,24,39,0.08)] lg:flex">
      {/* Scrollable nav area */}
      <div className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto">
        {/* Main nav */}
        <div className="flex flex-col gap-0.5">
          {mainNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname?.startsWith(item.href) ?? false}
              badge={getBadge(item.label)}
            />
          ))}
        </div>

        {/* Activities section */}
        <SectionLabel>Activities</SectionLabel>
        <div className="flex flex-col gap-0.5">
          {activityNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              isActive={pathname?.startsWith(item.href) ?? false}
            />
          ))}
        </div>

        {/* Account section */}
        <div className="mt-1 border-t border-[rgba(17,24,39,0.06)] pt-1">
          <div className="flex flex-col gap-0.5">
            {accountNav.map((item) => (
              <NavLink
                key={item.href}
                item={item}
                isActive={pathname?.startsWith(item.href) ?? false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Currency balances — always visible at bottom */}
      <div className="flex flex-shrink-0 gap-2 border-t border-[rgba(17,24,39,0.06)] pt-3">
        <Link
          href="/great-beyond"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-[rgba(218,165,32,0.25)] bg-[rgba(218,165,32,0.1)] px-2 py-2.5 transition-colors hover:bg-[rgba(218,165,32,0.18)]"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(139,69,19,0.6)]">
            GBP
          </span>
          <span className="text-sm font-bold text-[var(--ember)]">
            {userLoading ? "..." : gbpBalance.toLocaleString()}
          </span>
        </Link>
        <Link
          href="/vorest"
          className="flex flex-1 flex-col items-center gap-1 rounded-xl border border-[rgba(45,93,49,0.2)] bg-[rgba(45,93,49,0.06)] px-2 py-2.5 transition-colors hover:bg-[rgba(45,93,49,0.12)]"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-[rgba(45,93,49,0.6)]">
            Vbucks
          </span>
          <span className="text-sm font-bold text-[var(--moss)]">
            {userLoading ? "..." : vbucks.toLocaleString()}
          </span>
        </Link>
      </div>
    </aside>
  );
}
