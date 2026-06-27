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
    <div className={cn("flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[var(--signal)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-[var(--ink)] md:text-4xl">
          {title}
        </h2>
        {description ? <p className="mt-3 text-sm leading-6 text-[var(--steel)] md:text-base">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
}
