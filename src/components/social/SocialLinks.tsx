import type { ReactNode } from "react";
import Link from "next/link";
import { SOCIAL_LINKS, type SocialPlatform } from "@/lib/config/social-links";

type SocialLinksVariant = "dark" | "light" | "compact";

type SocialLinksProps = {
  variant?: SocialLinksVariant;
  showLabels?: boolean;
  className?: string;
};

const iconClassName = "h-4 w-4";

const socialIcons: Record<SocialPlatform, ReactNode> = {
  Facebook: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={iconClassName}>
      <path
        fill="currentColor"
        d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5.02 3.66 9.19 8.44 9.94v-7.03H7.9v-2.91h2.54V9.84c0-2.52 1.49-3.91 3.77-3.91 1.09 0 2.23.2 2.23.2v2.47h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78l-.44 2.91h-2.34V22c4.78-.75 8.45-4.92 8.45-9.94Z"
      />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={iconClassName}>
      <path
        fill="currentColor"
        d="M7.75 2h8.5A5.76 5.76 0 0 1 22 7.75v8.5A5.76 5.76 0 0 1 16.25 22h-8.5A5.76 5.76 0 0 1 2 16.25v-8.5A5.76 5.76 0 0 1 7.75 2Zm0 2A3.75 3.75 0 0 0 4 7.75v8.5A3.75 3.75 0 0 0 7.75 20h8.5A3.75 3.75 0 0 0 20 16.25v-8.5A3.75 3.75 0 0 0 16.25 4h-8.5ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.25-2.35a1.1 1.1 0 1 1 0 2.2 1.1 1.1 0 0 1 0-2.2Z"
      />
    </svg>
  ),
  X: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={iconClassName}>
      <path
        fill="currentColor"
        d="M18.9 2.5h3.07l-6.7 7.66 7.88 10.42h-6.17l-4.83-6.31-5.53 6.31H3.55l7.17-8.2L3.16 2.5h6.33l4.36 5.77 5.05-5.77Zm-1.08 16.25h1.7L8.56 4.23H6.73l11.09 14.52Z"
      />
    </svg>
  ),
  LinkedIn: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={iconClassName}>
      <path
        fill="currentColor"
        d="M4.98 3.5C4.98 4.88 3.86 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1s2.48 1.12 2.48 2.5ZM.32 8.02h4.35V23H.32V8.02ZM8.02 8.02h4.17v2.05h.06c.58-1.1 2-2.26 4.12-2.26 4.41 0 5.23 2.9 5.23 6.67V23h-4.35v-7.55c0-1.8-.03-4.11-2.5-4.11-2.51 0-2.9 1.96-2.9 3.98V23H8.02V8.02Z"
      />
    </svg>
  ),
  GitHub: (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={iconClassName}>
      <path
        fill="currentColor"
        d="M12 .5A12 12 0 0 0 8.2 23.9c.6.11.82-.26.82-.58v-2.04c-3.34.73-4.04-1.41-4.04-1.41-.55-1.4-1.34-1.77-1.34-1.77-1.09-.75.08-.74.08-.74 1.2.09 1.84 1.24 1.84 1.24 1.08 1.84 2.82 1.31 3.51 1 .11-.78.42-1.31.76-1.61-2.67-.31-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.24-3.22-.12-.31-.54-1.56.12-3.18 0 0 1.01-.32 3.3 1.23a11.35 11.35 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.62.24 2.87.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.63-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"
      />
    </svg>
  ),
};

const variantClassNames: Record<SocialLinksVariant, string> = {
  dark: "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]",
  light: "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]",
  compact: "border-[var(--line)] bg-white text-[var(--steel)] hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]",
};

export function SocialLinks({ variant = "dark", showLabels = false, className = "" }: SocialLinksProps) {
  return (
    <div className={`flex flex-wrap items-center gap-3 ${className}`.trim()}>
      {SOCIAL_LINKS.map((social) => (
        <Link
          key={social.platform}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-bold transition-all duration-200 hover:-translate-y-1 ${
            showLabels ? "min-w-0 pr-4" : "h-11 w-11"
          } ${variantClassNames[variant]}`}
        >
          {socialIcons[social.platform]}
          {showLabels ? <span>{social.platform}</span> : <span className="sr-only">{social.platform}</span>}
        </Link>
      ))}
    </div>
  );
}
