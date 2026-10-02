import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-2 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="font-mono text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-[var(--signal)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-1 text-[1.25rem] font-bold leading-tight tracking-[-0.02em] text-[var(--ink)]">
          {title}
        </h2>
        {description ? <p className="mt-1 text-[0.8125rem] leading-5 text-[var(--steel)]">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
