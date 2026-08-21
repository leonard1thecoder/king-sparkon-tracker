"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils/cn";

export type FaqItem = { question: string; answer: string };

export function Faq({ items, jsonLd = true }: { items: FaqItem[]; jsonLd?: boolean }) {
  const [open, setOpen] = useState<number | null>(0);

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };

  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}
      <div className="divide-y divide-[var(--line)] rounded-xl border border-[var(--line)] bg-white shadow-[var(--shadow-soft)]">
        {items.map((item, idx) => {
          const isOpen = open === idx;
          return (
            <div key={item.question} className="group">
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : idx)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left md:px-6"
              >
                <span className="text-sm font-extrabold leading-6 text-[var(--ink)] md:text-base">{item.question}</span>
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-lg border bg-white transition",
                    isOpen ? "rotate-180 border-[var(--signal)] text-[var(--signal)]" : "border-[var(--line)] text-[var(--muted)] group-hover:border-[var(--line-strong)]",
                  )}
                >
                  <ChevronDown className="h-4 w-4" />
                </span>
              </button>
              <div className={cn("grid transition-all", isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0")}>
                <div className="overflow-hidden">
                  <p className="px-5 pb-5 text-sm leading-7 text-[var(--steel)] md:px-6 md:text-[15px]">{item.answer}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
