import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

type GlassVariant = "default" | "elevated" | "subtle" | "strong" | "interactive" | "highlighted";

const variantStyles: Record<GlassVariant, string> = {
  default:
    "bg-[rgba(10,10,20,0.72)] backdrop-blur-[16px] border-[rgba(139,92,246,0.28)] text-[var(--ink)] shadow-[var(--shadow-glass)]",
  elevated:
    "bg-[rgba(16,16,30,0.9)] backdrop-blur-[24px] border-[rgba(34,211,238,0.35)] text-[var(--ink)] shadow-[var(--shadow-glass-strong)]",
  subtle:
    "bg-[rgba(10,10,20,0.52)] backdrop-blur-[12px] border-[rgba(139,92,246,0.2)] text-[var(--ink)] shadow-[var(--shadow-soft)]",
  strong:
    "bg-black/90 backdrop-blur-[24px] border-[var(--line-strong)] text-[var(--ink)] shadow-[var(--shadow-depth)]",
  interactive:
    "bg-[rgba(10,10,20,0.72)] backdrop-blur-[16px] border-[rgba(139,92,246,0.28)] text-[var(--ink)] shadow-[var(--shadow-glass)] hover:bg-[rgba(20,20,36,0.9)] hover:border-fuchsia-400/50 hover:shadow-[0_10px_32px_rgba(236,72,153,0.28)] hover:-translate-y-0.5 cursor-pointer",
  highlighted:
    "bg-gradient-to-br from-[#12122a] via-[#0a0a14] to-[rgba(34,211,238,0.14)] backdrop-blur-[16px] border-cyan-300/25 text-[var(--ink)] shadow-[var(--shadow-glass-strong)] hover:border-yellow-300/45 hover:shadow-[0_10px_32px_rgba(250,204,21,0.22)]",
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
        "rounded-[var(--radius-xl)] border border-[rgba(139,92,246,0.28)] bg-[rgba(10,10,20,0.68)] text-[var(--ink)] backdrop-blur-[16px] shadow-[var(--shadow-glass)]",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
