"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export type SelectOption = { label: string; value: string };

function Label({ htmlFor, text, action }: { htmlFor: string; text: string; action?: ReactNode }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--ks-ink)]">
        {text}
      </label>
      {action}
    </span>
  );
}

type TextFieldProps = {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "url" | "number";
  autoComplete?: string;
  inputMode?: "text" | "numeric" | "tel" | "email" | "url";
  min?: number;
  action?: ReactNode;
};

export function TextField({ name, label, type = "text", autoComplete, inputMode, min, action }: TextFieldProps) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} text={label} action={action} />
      <input id={name} name={name} type={type} autoComplete={autoComplete} inputMode={inputMode} min={min} required className="ks-input" />
    </div>
  );
}

export function PasswordField({ name, label, autoComplete, action }: { name: string; label: string; autoComplete: string; action?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} text={label} action={action} />
      <div className="relative">
        <input id={name} name={name} type={visible ? "text" : "password"} autoComplete={autoComplete} required className="ks-input pr-12" />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--ks-muted)] transition-colors hover:bg-[var(--ks-light-green)] hover:text-[var(--ks-ink)]"
        >
          {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
}

export function SelectField({ name, label, options, value, onChange }: { name: string; label: string; options: SelectOption[]; value?: string; onChange?: (value: string) => void }) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} text={label} />
      <select id={name} name={name} required value={value} onChange={(event) => onChange?.(event.target.value)} className="ks-input">
        <option value="">Select</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function StatusNote({ tone, message }: { tone: "error" | "success"; message: string }) {
  const palette =
    tone === "error" ? "border-[#f3b8b2] bg-[#fdf0ee] text-[#b42318]" : "border-[#bfe8c7] bg-[#eef9f1] text-[#17623b]";
  return (
    <div role={tone === "error" ? "alert" : "status"} aria-live="polite" className={`rounded-[14px] border px-4 py-3 text-sm font-semibold leading-6 ${palette}`}>
      {message}
    </div>
  );
}

// Primary call to action, in the marketing style (ink pill, white text).
export const primaryButtonClass = "ks-btn ks-btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-50";
