import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type Option = { label: string; value: string };

type BaseProps = {
  label: string;
  hint?: string;
  error?: string;
};

export function FormField({ label, hint, error, className, ...props }: BaseProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--steel)]">{label}</span>
      <input className={cn("border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]", className)} {...props} />
      {hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}
      {error ? <span className="text-xs font-semibold text-[var(--signal)]">{error}</span> : null}
    </label>
  );
}

export function TextAreaField({ label, hint, error, className, ...props }: BaseProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--steel)]">{label}</span>
      <textarea className={cn("min-h-28 border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]", className)} {...props} />
      {hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}
      {error ? <span className="text-xs font-semibold text-[var(--signal)]">{error}</span> : null}
    </label>
  );
}

export function SelectField({ label, hint, error, options, className, ...props }: BaseProps & SelectHTMLAttributes<HTMLSelectElement> & { options: Option[] }) {
  return (
    <label className="grid gap-2">
      <span className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[var(--steel)]">{label}</span>
      <select className={cn("border border-[var(--line)] bg-white px-3 py-3 text-sm text-[var(--ink)]", className)} {...props}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {hint ? <span className="text-xs text-[var(--steel)]">{hint}</span> : null}
      {error ? <span className="text-xs font-semibold text-[var(--signal)]">{error}</span> : null}
    </label>
  );
}
