import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-gradient-to-r from-cyan-400 via-violet-500 to-pink-500 text-white shadow-[0_8px_24px_rgba(139,92,246,0.35)] hover:-translate-y-0.5 hover:from-yellow-300 hover:via-pink-500 hover:to-cyan-400 hover:text-black hover:shadow-[0_10px_30px_rgba(236,72,153,0.45)]",
  secondary:
    "border-[var(--line-strong)] bg-[#0d0d1c] text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--premium-gold)] hover:bg-gradient-to-r hover:from-yellow-300/20 hover:via-pink-500/20 hover:to-cyan-400/20 hover:text-[var(--premium-gold)] hover:shadow-[0_8px_24px_rgba(250,204,21,0.22)]",
  quiet:
    "border-transparent bg-transparent text-[var(--steel)] hover:border-[var(--premium-cyan)]/40 hover:bg-[var(--signal-soft)] hover:text-[var(--premium-cyan)]",
  danger:
    "border-red-400/30 bg-gradient-to-r from-red-500/20 to-orange-500/20 text-red-200 hover:from-red-500 hover:to-orange-500 hover:text-white hover:shadow-[0_8px_24px_rgba(239,68,68,0.4)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "primary", type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        "inline-flex min-h-11 max-w-full shrink-0 items-center justify-center gap-2 whitespace-normal rounded-[var(--radius-md)] border px-5 py-2.5 text-center text-sm font-extrabold leading-tight transition-all duration-200 ease-out focus-visible:shadow-[var(--focus-ring)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
