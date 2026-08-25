import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassVariant = "default" | "elevated" | "subtle" | "strong" | "interactive" | "highlighted";

const variantStyles: Record<GlassVariant, string> = {
  default:
    "bg-[rgba(255,255,255,0.72)] backdrop-blur-[16px] border-[rgba(186,230,253,0.7)] shadow-[var(--shadow-glass)]",
  elevated:
    "bg-[rgba(255,255,255,0.88)] backdrop-blur-[24px] border-[rgba(186,230,253,0.8)] shadow-[var(--shadow-glass-strong)]",
  subtle:
    "bg-[rgba(255,255,255,0.52)] backdrop-blur-[12px] border-[rgba(186,230,253,0.5)] shadow-[var(--shadow-soft)]",
  strong:
    "bg-white/95 backdrop-blur-[24px] border-[var(--line-strong)] shadow-[var(--shadow-depth)]",
  interactive:
    "bg-[rgba(255,255,255,0.72)] backdrop-blur-[16px] border-[rgba(186,230,253,0.7)] shadow-[var(--shadow-glass)] hover:bg-white/90 hover:border-[var(--line-strong)] hover:shadow-[var(--shadow-glass-strong)] hover:-translate-y-0.5 cursor-pointer",
  highlighted:
    "bg-gradient-to-br from-white via-white to-[var(--signal-soft)] backdrop-blur-[16px] border-[var(--signal)]/20 shadow-[var(--shadow-glass-strong)]",
};

type GlassCardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: GlassVariant;
  padding?: "none" | "sm" | "md" | "lg";
};

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5 md:p-6",
  lg: "p-6 md:p-8",
} as const;

export function GlassCard({
  variant = "default",
  padding = "md",
  className,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border transition-all duration-200 ease-out",
        variantStyles[variant],
        paddings[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function GlassPanel({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-xl)] border border-[rgba(186,230,253,0.6)] bg-[rgba(255,255,255,0.64)] backdrop-blur-[16px] shadow-[var(--shadow-glass)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
