import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "h-11 w-full rounded-lg border border-[var(--line)] bg-white px-3 text-sm text-[var(--ink)] shadow-none outline-none transition placeholder:text-[var(--muted)] hover:border-[var(--line-strong)] focus:border-[var(--signal)] focus:ring-4 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
