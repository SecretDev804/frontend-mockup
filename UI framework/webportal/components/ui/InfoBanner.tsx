import { Info, AlertTriangle } from "lucide-react";

type BannerVariant = "info" | "warning" | "error";

const variants = {
  info: {
    border: "border-[rgba(45,93,49,0.2)]",
    bg: "bg-[rgba(45,93,49,0.06)]",
    iconColor: "text-[var(--moss)]",
    titleColor: "text-[var(--moss)]",
    Icon: Info,
  },
  warning: {
    border: "border-[rgba(218,165,32,0.3)]",
    bg: "bg-[rgba(218,165,32,0.08)]",
    iconColor: "text-[var(--ember)]",
    titleColor: "text-[var(--ember)]",
    Icon: AlertTriangle,
  },
  error: {
    border: "border-[rgba(196,107,46,0.35)]",
    bg: "bg-[rgba(196,107,46,0.12)]",
    iconColor: "text-[var(--ember)]",
    titleColor: "text-[var(--ember)]",
    Icon: AlertTriangle,
  },
};

export function InfoBanner({
  title,
  children,
  variant = "info",
}: {
  title: string;
  children: React.ReactNode;
  variant?: BannerVariant;
}) {
  const v = variants[variant];
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border ${v.border} ${v.bg} p-4`}
    >
      <v.Icon className={`mt-0.5 h-5 w-5 flex-shrink-0 ${v.iconColor}`} />
      <div>
        <p className={`text-sm font-semibold ${v.titleColor}`}>{title}</p>
        <div className="mt-1 text-xs text-[rgba(17,24,39,0.65)]">
          {children}
        </div>
      </div>
    </div>
  );
}
