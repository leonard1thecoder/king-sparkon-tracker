"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  acceptAllConsent,
  clearConsent,
  COOKIE_CONSENT_EVENT,
  DEFAULT_CONSENT_STATE,
  getConsent,
  rejectNonEssentialConsent,
  setConsent,
} from "@/lib/cookies";
import type {
  ConsentState,
  ConsentStatus,
  CookieCategory,
  StoredConsent,
} from "@/lib/cookies";

interface ConsentContextValue {
  /** Lifecycle of the visitor's choice. `pending` until the client has read the cookie. */
  status: ConsentStatus;
  /** Last stored record, or `null` when there is no valid consent. */
  stored: StoredConsent | null;
  /** Effective choices: stored consent, or privacy-safe defaults pre-decision. */
  consent: ConsentState;
  /** Single-category check (drives conditional script loading). */
  hasCategory: (category: CookieCategory) => boolean;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (state: ConsentState) => void;
  /** Forget the choice and bring the banner back. */
  resetConsent: () => void;
  /** Settings dialog visibility. */
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

function effectiveFrom(stored: StoredConsent | null): ConsentState {
  if (!stored) return { ...DEFAULT_CONSENT_STATE };
  return {
    necessary: true,
    preferences: stored.preferences,
    analytics: stored.analytics,
    marketing: stored.marketing,
  };
}

export function ConsentProvider({
  initialConsent = null,
  children,
}: {
  /** Server-read consent (via `getServerConsent`) for instant correct state. */
  initialConsent?: StoredConsent | null;
  children: ReactNode;
}) {
  const [stored, setStored] = useState<StoredConsent | null>(initialConsent);
  const [status, setStatus] = useState<ConsentStatus>(initialConsent ? "decided" : "pending");
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Hydration-safe sync: the authoritative read always happens on the
  // client after mount, so server and client render identically first.
  useEffect(() => {
    const current = getConsent();
    setStored(current);
    setStatus(current ? "decided" : "undecided");
  }, []);

  // Stay in sync when another tab (or `clearConsent` elsewhere) changes state.
  useEffect(() => {
    const sync = () => {
      const current = getConsent();
      setStored(current);
      setStatus((previous) => {
        if (previous === "pending") return current ? "decided" : "undecided";
        return current ? "decided" : "undecided";
      });
    };
    window.addEventListener(COOKIE_CONSENT_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const acceptAll = useCallback(() => {
    setStored(acceptAllConsent());
    setStatus("decided");
    setSettingsOpen(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    setStored(rejectNonEssentialConsent());
    setStatus("decided");
    setSettingsOpen(false);
  }, []);

  const savePreferences = useCallback((state: ConsentState) => {
    setStored(setConsent(state));
    setStatus("decided");
    setSettingsOpen(false);
  }, []);

  const resetConsent = useCallback(() => {
    clearConsent();
    setStored(null);
    setStatus("undecided");
    setSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo<ConsentContextValue>(() => {
    const consent = effectiveFrom(stored);
    return {
      status,
      stored,
      consent,
      hasCategory: (category) => consent[category],
      acceptAll,
      rejectNonEssential,
      savePreferences,
      resetConsent,
      settingsOpen,
      openSettings,
      closeSettings,
    };
  }, [status, stored, settingsOpen, acceptAll, rejectNonEssential, savePreferences, resetConsent, openSettings, closeSettings]);

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

/** Access consent state. Must be used inside `<ConsentProvider>`. */
export function useConsent(): ConsentContextValue {
  const context = useContext(ConsentContext);
  if (!context) throw new Error("useConsent must be used within a ConsentProvider.");
  return context;
}

/** Nullable variant for components (e.g. footer buttons) that may render outside the provider. */
export function useConsentOptional(): ConsentContextValue | null {
  return useContext(ConsentContext);
}
