"use client";

import { useState, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

export type SelectOption = { label: string; value: string };

const controlClass =
  "h-12 w-full rounded-[var(--radius-md)] border border-[var(--line-strong)] bg-transparent px-4 text-sm font-medium text-[var(--ink)] outline-none transition-colors duration-150 placeholder:text-[var(--muted)] focus:border-[var(--signal)] focus:ring-2 focus:ring-[var(--signal-soft)]";

function Label({ htmlFor, text, action }: { htmlFor: string; text: string; action?: ReactNode }) {
  return (
    <span className="flex items-center justify-between gap-3">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-[var(--steel)]">
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
      <input
        id={name}
        name={name}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        min={min}
        required
        className={controlClass}
      />
    </div>
  );
}

export function PasswordField({ name, label, autoComplete, action }: { name: string; label: string; autoComplete: string; action?: ReactNode }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="grid gap-2">
      <Label htmlFor={name} text={label} action={action} />
      <div className="relative">
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete={autoComplete}
          required
          className={`${controlClass} pr-12`}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute right-1.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
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
      <select
        id={name}
        name={name}
        required
        value={value}
        onChange={(event) => onChange?.(event.target.value)}
        className={`${controlClass} appearance-none`}
      >
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
    tone === "error"
      ? "border-[var(--danger)]/40 bg-[var(--danger)]/10 text-[var(--danger)]"
      : "border-[var(--confirm)]/40 bg-[var(--confirm)]/10 text-[var(--confirm)]";
  return (
    <div role={tone === "error" ? "alert" : "status"} aria-live="polite" className={`rounded-[var(--radius-md)] border px-4 py-3 text-sm font-semibold leading-6 ${palette}`}>
      {message}
    </div>
  );
}

export const primaryButtonClass =
  "inline-flex h-12 w-full items-center justify-center rounded-[var(--radius-md)] bg-[var(--signal)] px-6 text-sm font-bold text-[#04121a] transition-all duration-150 hover:bg-[var(--signal-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--signal)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--surface)] disabled:cursor-not-allowed disabled:opacity-50";
