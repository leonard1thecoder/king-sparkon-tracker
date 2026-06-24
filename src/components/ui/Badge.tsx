import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "stamp-tag inline-flex items-center gap-1 px-2.5 py-1 text-[0.68rem] font-bold text-[var(--steel)]",
        className,
      )}
      {...props}
    />
  );
}
