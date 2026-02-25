import Link from "next/link";
import { ChevronRight } from "lucide-react";

type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-[rgba(17,24,39,0.5)]"
    >
      {items.map((item, i) => (
        <span key={item.label} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {item.href ? (
            <Link
              href={item.href}
              className="transition hover:text-[var(--moss)]"
            >
              {item.label}
            </Link>
          ) : (
            <span className="font-semibold text-[rgba(17,24,39,0.75)]">
              {item.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
