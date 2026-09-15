"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  acceptAllConsent,
  clearConsent,
  deriveConsentStatus,
  getConsent,
  rejectNonEssentialConsent,
  setConsent,
} from "@/lib/cookies/consent";
import { COOKIE_CONSENT_CHANGE_EVENT, COOKIE_CONSENT_SYNC_KEY, DEFAULT_CONSENT_STATE } from "@/lib/cookies/constants";
import type { ConsentState, ConsentStatus, CookieCategory, StoredConsent } from "@/lib/cookies/types";

interface CookieConsentContextValue {
  /** Lifecycle: unknown (prompt) / accepted / rejected / custom. */
  status: ConsentStatus;
  /** Last stored record, or `null` when there is no valid consent. */
  stored: StoredConsent | null;
  /** Effective choices: stored consent, or privacy-safe defaults pre-decision. */
  consent: ConsentState;
  /** Category check. Never treats missing consent as permission. */
  hasConsent: (category: CookieCategory) => boolean;
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

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null);

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
  /** Server-read consent (via `getServerConsent`) used as a fast path. */
  initialConsent?: StoredConsent | null;
  children: ReactNode;
}) {
  const [stored, setStored] = useState<StoredConsent | null>(initialConsent);
  const [settingsOpen, setSettingsOpen] = useState(false);
  // Guard against double initialization under StrictMode double-effects.
  const syncedRef = useRef(false);

  // Hydration-safe sync: the authoritative cookie read happens on the
  // client after mount, so server and client render identically first.
  // Banner/dialog/scripts additionally render nothing until mounted.
  useEffect(() => {
    if (syncedRef.current) return;
    syncedRef.current = true;
    const current = getConsent();
    setStored((previous) =>
      JSON.stringify(previous) === JSON.stringify(current) ? previous : current,
    );
  }, []);

  // Cross-tab + same-tab synchronization. The cookie is authoritative:
  // on any notification, re-read it and update state. Registered once.
  useEffect(() => {
    const syncFromCookie = () => {
      const current = getConsent();
      setStored((previous) =>
        JSON.stringify(previous) === JSON.stringify(current) ? previous : current,
      );
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key === COOKIE_CONSENT_SYNC_KEY) syncFromCookie();
    };
    window.addEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncFromCookie);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(COOKIE_CONSENT_CHANGE_EVENT, syncFromCookie);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const acceptAll = useCallback(() => {
    setStored(acceptAllConsent());
    setSettingsOpen(false);
  }, []);

  const rejectNonEssential = useCallback(() => {
    setStored(rejectNonEssentialConsent());
    setSettingsOpen(false);
  }, []);

  const savePreferences = useCallback((state: ConsentState) => {
    setStored(setConsent(state));
    setSettingsOpen(false);
  }, []);

  const resetConsent = useCallback(() => {
    clearConsent();
    setStored(null);
    setSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => setSettingsOpen(true), []);
  const closeSettings = useCallback(() => setSettingsOpen(false), []);

  const value = useMemo<CookieConsentContextValue>(() => {
    const consent = effectiveFrom(stored);
    return {
      status: deriveConsentStatus(stored),
      stored,
      consent,
      hasConsent: (category) => (stored ? stored[category] === true : false),
      acceptAll,
      rejectNonEssential,
      savePreferences,
      resetConsent,
      settingsOpen,
      openSettings,
      closeSettings,
    };
  }, [stored, settingsOpen, acceptAll, rejectNonEssential, savePreferences, resetConsent, openSettings, closeSettings]);

  return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>;
}

/** Access consent state. Must be used inside `<ConsentProvider>`. */
export function useCookieConsent(): CookieConsentContextValue {
  const context = useContext(CookieConsentContext);
  if (!context) throw new Error("useCookieConsent must be used within a ConsentProvider.");
  return context;
}

/** Nullable variant for components (e.g. footer buttons) that may render outside the provider. */
export function useConsentOptional(): CookieConsentContextValue | null {
  return useContext(CookieConsentContext);
}
