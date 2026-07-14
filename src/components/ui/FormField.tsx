import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Option = { label: string; value: string };
type BaseProps = { label: string; hint?: string; error?: string };

const control = "w-full rounded-lg border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)] shadow-none outline-none placeholder:text-[var(--muted)] hover:border-[var(--line-strong)] focus:border-[var(--signal)] focus:shadow-[var(--focus-ring)]";

export function FormField({ label, hint, error, className, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return <label className="grid gap-2"><span className="text-xs font-extrabold text-[var(--ink)]">{label}</span><input className={cn(control, className)} {...props} />{hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}{error ? <span className="text-xs font-semibold text-[var(--danger)]">{error}</span> : null}</label>;
}

export function TextAreaField({ label, hint, error, className, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <label className="grid gap-2"><span className="text-xs font-extrabold text-[var(--ink)]">{label}</span><textarea className={cn(control, "min-h-28 resize-y", className)} {...props} />{hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}{error ? <span className="text-xs font-semibold text-[var(--danger)]">{error}</span> : null}</label>;
}

export function SelectField({ label, hint, error, options, className, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return <label className="grid gap-2"><span className="text-xs font-extrabold text-[var(--ink)]">{label}</span><select className={cn(control, className)} {...props}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}{error ? <span className="text-xs font-semibold text-[var(--danger)]">{error}</span> : null}</label>;
}
