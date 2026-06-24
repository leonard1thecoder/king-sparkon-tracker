import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary: "border-[var(--signal)] bg-[var(--signal)] text-white hover:bg-transparent hover:text-[var(--signal)]",
  secondary: "border-[var(--ink)] bg-[var(--ink)] text-white hover:bg-transparent hover:text-[var(--ink)]",
  quiet: "border-[var(--line)] bg-transparent text-[var(--ink)] hover:border-[var(--ink)]",
  danger: "border-[var(--signal)] bg-transparent text-[var(--signal)] hover:bg-[var(--signal)] hover:text-white",
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
        "inline-flex min-h-11 items-center justify-center gap-2 border px-4 py-2 text-sm font-semibold uppercase tracking-[0.08em] disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
