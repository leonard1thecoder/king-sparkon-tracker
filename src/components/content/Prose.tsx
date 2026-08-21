import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

export function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "prose prose-slate max-w-none",
        "prose-headings:font-black prose-headings:tracking-[-0.03em] prose-headings:text-[var(--ink)]",
        "prose-h2:text-2xl md:prose-h2:text-3xl prose-h2:mt-10 prose-h2:mb-4",
        "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-p:text-[15px] prose-p:leading-7 prose-p:text-[var(--steel)]",
        "prose-strong:text-[var(--ink)] prose-strong:font-extrabold",
        "prose-a:font-bold prose-a:text-[var(--signal-strong)] prose-a:no-underline hover:prose-a:text-[var(--accent-hover)] hover:prose-a:underline",
        "prose-li:text-[15px] prose-li:leading-7 prose-li:text-[var(--steel)]",
        "prose-ul:list-disc prose-ol:list-decimal",
        "prose-blockquote:border-l-2 prose-blockquote:border-[var(--line-strong)] prose-blockquote:bg-[var(--signal-soft)] prose-blockquote:px-5 prose-blockquote:py-3 prose-blockquote:rounded-r-lg",
        "prose-table:w-full prose-th:text-left prose-th:font-mono prose-th:text-xs prose-th:uppercase prose-th:tracking-widest prose-th:text-[var(--muted)]",
        className,
      )}
      {...props}
    />
  );
}
