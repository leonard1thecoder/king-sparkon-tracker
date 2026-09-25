"use client";

import { useEffect, useState, type JSX } from "react";
import { AlertCircle, Loader2 } from "lucide-react";
import {
  OAUTH_PROVIDERS,
  oauthAuthorizationUrl,
  oauthErrorMessage,
  type OAuthProviderId,
  type OAuthProviderStatus,
} from "@/lib/auth/oauth";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.5h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.7 3.5 2.7.2.1c2.2-2 3.8-5 3.8-9.5z" />
      <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.7.1-3 2.4v.7C3.5 21.3 7.4 24 12 24z" />
      <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.2-1.7.4-2.4l-.1-.8-2.9-2.3-.4.1C1.1 7.9 0 9.8 0 12s1.1 4.1 2.8 5.4l2.4-3z" />
      <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.7 1.1 15.2 0 12 0 7.4 0 3.5 2.7 1.8 6.6l3.4 2.7c1-2.9 3.7-4.6 6.8-4.6z" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="#1877F2" d="M24 12a12 12 0 1 0-13.9 11.9v-8.4h-3V12h3V9.4c0-3 1.8-4.7 4.5-4.7 1.3 0 2.7.2 2.7.2v3h-1.5c-1.5 0-2 1-2 1.9V12h3.3l-.5 3.5h-2.8v8.4A12 12 0 0 0 24 12z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M18.9 1.2h3.7l-8.1 9.2L24 22.8h-7.5l-5.9-7.6-6.7 7.6H.2l8.6-9.9L0 1.2h7.7l5.3 7 5.9-7zm-1.3 19.4h2L6.6 3.3H4.4l13.2 17.3z" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" aria-hidden="true">
      <path fill="currentColor" d="M21 8.6a6.4 6.4 0 0 1-4.6-1.9v8.1a6 6 0 1 1-6-6c.3 0 .7 0 1 .1v3.2a2.9 2.9 0 1 0 2 2.7V1.4h3.2a6.4 6.4 0 0 0 4.4 4.1v3.1z" />
    </svg>
  );
}

const providerIcons: Record<OAuthProviderId, () => JSX.Element> = {
  google: GoogleIcon,
  facebook: FacebookIcon,
  x: XIcon,
  tiktok: TikTokIcon,
};

export function OAuthButtons({ errorCode }: { errorCode?: string }) {
  const [providers, setProviders] = useState<OAuthProviderStatus[] | null>(null);
  const [pendingProvider, setPendingProvider] = useState<OAuthProviderId | null>(null);
  const friendlyError = oauthErrorMessage(errorCode);

  useEffect(() => {
    let cancelled = false;
    async function loadProviders() {
      try {
        const response = await fetch("/api/auth/oauth/providers", { credentials: "same-origin" });
        if (!response.ok) return;
        const body = (await response.json()) as OAuthProviderStatus[];
        if (!cancelled && Array.isArray(body)) setProviders(body);
      } catch {
        return;
      }
    }
    loadProviders();
    return () => {
      cancelled = true;
    };
  }, []);

  const enabledProviders = OAUTH_PROVIDERS.filter((provider) => {
    if (providers === null) return true;
    return providers.some((status) => status.id === provider.id && status.enabled);
  });

  if (providers !== null && enabledProviders.length === 0) {
    return null;
  }

  function startOAuth(provider: OAuthProviderId) {
    if (pendingProvider) return;
    const url = oauthAuthorizationUrl(provider);
    if (!url) return;
    setPendingProvider(provider);
    window.location.href = url;
  }

  return (
    <div className="grid gap-3">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-[var(--line)]" />
        <span className="font-mono text-[0.68rem] font-black uppercase tracking-[0.16em] text-[var(--muted)]">OR</span>
        <span className="h-px flex-1 bg-[var(--line)]" />
      </div>

      {friendlyError ? (
        <div aria-live="polite" role="alert" className="flex gap-3 rounded-[var(--radius-xl)] border border-[var(--danger)] bg-[var(--danger)]/10 px-4 py-3 text-sm font-semibold leading-6 text-[var(--danger)]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{friendlyError}</span>
        </div>
      ) : null}

      {enabledProviders.map((provider) => {
        const Icon = providerIcons[provider.id];
        const pending = pendingProvider === provider.id;
        return (
          <button
            key={provider.id}
            type="button"
            onClick={() => startOAuth(provider.id)}
            disabled={pendingProvider !== null}
            className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[var(--radius-xl)] border border-[var(--line)] bg-white px-6 py-2.5 text-sm font-black text-[var(--ink)] shadow-[var(--shadow-soft)] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:border-[var(--signal)] disabled:cursor-wait disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Icon />}
            {pending ? "Redirecting..." : `Continue with ${provider.displayName}`}
          </button>
        );
      })}
    </div>
  );
}
