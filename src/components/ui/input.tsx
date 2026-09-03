import * as React from "react";
import { cn } from "@/lib/utils/cn";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => (
  <input
    type={type}
    className={cn(
      "h-11 w-full rounded-[var(--radius-md)] border border-[var(--line)] bg-[#0c0c18] px-4 text-sm text-[var(--ink)] shadow-none outline-none transition-all duration-200 placeholder:text-[var(--muted)] hover:border-[var(--premium-gold)] hover:bg-[#101022] hover:shadow-[0_0_14px_rgba(250,204,21,0.12)] focus:border-[var(--premium-cyan)] focus:bg-[#0d0d1e] focus:ring-4 focus:ring-cyan-400/20 focus:shadow-[0_0_18px_rgba(34,211,238,0.25)] disabled:cursor-not-allowed disabled:opacity-60",
      className,
    )}
    ref={ref}
    {...props}
  />
));
Input.displayName = "Input";

export { Input };
