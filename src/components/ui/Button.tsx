import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[0_12px_28px_rgba(74,169,223,0.2)] hover:-translate-y-0.5 hover:border-[var(--ink)] hover:bg-[var(--ink)] hover:text-white hover:shadow-[0_18px_36px_rgba(7,19,31,0.2)]",
  secondary:
    "border-[var(--ink)] bg-[var(--ink)] text-white hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--ink-2)] hover:text-white",
  quiet:
    "border-[var(--line)] bg-white text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--gold)] hover:bg-[var(--surface)]",
  danger:
    "border-[var(--danger)] bg-white text-[var(--danger)] hover:-translate-y-0.5 hover:bg-[var(--danger)] hover:text-white",
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
        "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-[1rem] border px-4 py-2 text-sm font-black uppercase tracking-[0.06em] transition duration-200 ease-out focus-visible:shadow-[var(--focus-ring)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
