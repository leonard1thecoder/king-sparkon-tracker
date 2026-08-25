import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--signal)] bg-[var(--signal)] text-white hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white hover:shadow-[0_8px_20px_rgba(249,115,22,0.18)]",
  secondary:
    "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white hover:shadow-[0_6px_16px_rgba(249,115,22,0.12)]",
  quiet:
    "border-transparent bg-white text-[var(--ink)] hover:border-[var(--line)] hover:bg-[var(--signal-soft)] hover:text-[var(--signal-strong)]",
  danger:
    "border-[var(--danger)]/20 bg-[var(--danger)]/5 text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white hover:shadow-[0_6px_16px_rgba(220,38,38,0.18)]",
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
