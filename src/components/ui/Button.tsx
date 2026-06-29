import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-[var(--signal)] bg-[var(--signal)] text-white shadow-[0_18px_42px_rgba(29,92,131,0.24)] hover:border-[var(--gold)] hover:bg-[var(--ink)] hover:text-white",
  secondary: "border-[var(--ink)] bg-[var(--ink)] text-white hover:border-[var(--gold)] hover:bg-[var(--ink-2)] hover:text-white",
  quiet: "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--gold)] hover:bg-[var(--surface)]",
  danger: "border-[var(--danger)] bg-white text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white",
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
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-5 py-2 text-sm font-black uppercase tracking-[0.08em] disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
