import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border-[var(--signal)] bg-[var(--signal)] text-white hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white hover:shadow-[0_10px_24px_rgba(249,115,22,0.18)]",
  secondary:
    "border-[var(--line-strong)] bg-white text-[var(--ink)] hover:-translate-y-0.5 hover:border-[var(--accent-hover)] hover:bg-[var(--accent-hover)] hover:text-white",
  quiet:
    "border-[var(--line)] bg-white text-[var(--ink)] hover:border-[var(--accent-hover)] hover:bg-white hover:text-[var(--accent-hover)]",
  danger:
    "border-[var(--danger)] bg-white text-[var(--danger)] hover:bg-[var(--danger)] hover:text-white",
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
        "inline-flex min-h-11 max-w-full shrink-0 items-center justify-center gap-2 whitespace-normal rounded-lg border px-4 py-2 text-center text-sm font-extrabold leading-tight transition duration-200 ease-out focus-visible:shadow-[var(--focus-ring)] active:translate-y-0 disabled:pointer-events-none disabled:opacity-55",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
});
