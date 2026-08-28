"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  AFFILIATE_AD_CONFIG,
  AFFILIATE_STORAGE_KEYS,
  type AffiliateAd,
  isSuppressedRoute,
  selectNextCreative,
  trackAffiliateEvent,
} from "./affiliate-ads";

type Eligibility =
  | { eligible: true; reason: "ok" }
  | { eligible: false; reason: "ssr" | "suppressed" | "hidden" | "modal" | "formActive" | "max" }
  | { eligible: false; reason: "closeCooldown" | "clickCooldown"; remainingMs: number };

function isModalOpen(): boolean {
  if (typeof document === "undefined") return false;
  const selectors = [
    '[role="dialog"][aria-modal="true"]',
    '[aria-modal="true"]',
    "[data-radix-dialog-overlay]",
    "[data-state='open'][role='dialog']",
  ];
  for (const sel of selectors) {
    try {
      const el = document.querySelector(sel);
      if (el && el instanceof HTMLElement) {
        const style = window.getComputedStyle(el);
        if (style.display !== "none" && style.visibility !== "hidden" && style.opacity !== "0") {
          return true;
        }
      }
    } catch {
      // ignore selector errors
    }
  }
  return false;
}

function isFormActive(): boolean {
  if (typeof document === "undefined") return false;
  const active = document.activeElement;
  if (!active || !(active instanceof HTMLElement)) return false;
  const tag = active.tagName;
  const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
  const isContentEditable = active.isContentEditable;
  if ((isInput || isContentEditable) && active.matches(":focus")) {
    // Consider major form active if focused element is inside a form or is contenteditable
    // This defers ad while user is typing, per spec 17
    return true;
  }
  return false;
}

function getSessionImpressions(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = window.sessionStorage.getItem(AFFILIATE_STORAGE_KEYS.impressions);
    const n = parseInt(raw ?? "0", 10);
    return Number.isNaN(n) ? 0 : n;
  } catch {
    return 0;
  }
}

function setSessionImpressions(value: number): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(AFFILIATE_STORAGE_KEYS.impressions, String(value));
  } catch {
    // ignore
  }
}

function getLocalTimestamp(key: string): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const n = parseInt(raw, 10);
    return Number.isNaN(n) ? null : n;
  } catch {
    return null;
  }
}

function getRemainingCooldown(lastTimestamp: number | null, cooldownMs: number): number {
  if (!lastTimestamp) return 0;
  const elapsed = Date.now() - lastTimestamp;
  const remaining = cooldownMs - elapsed;
  return remaining > 0 ? remaining : 0;
}

export function useAffiliateAd() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const [currentAd, setCurrentAd] = useState<AffiliateAd | null>(null);

  const hasInteractedRef = useRef(false);
  const initialTimerRef = useRef<number | null>(null);
  const retryIntervalRef = useRef<number | null>(null);
  const cooldownTimeoutRef = useRef<number | null>(null);
  const mountedRef = useRef(false);
  const adRef = useRef<AffiliateAd | null>(null);
  const isVisibleRef = useRef(isVisible);

  useEffect(() => {
    adRef.current = currentAd;
  }, [currentAd]);

  useEffect(() => {
    isVisibleRef.current = isVisible;
  }, [isVisible]);

  const clearAllTimers = useCallback(() => {
    if (initialTimerRef.current !== null) {
      window.clearTimeout(initialTimerRef.current);
      initialTimerRef.current = null;
    }
    if (retryIntervalRef.current !== null) {
      window.clearInterval(retryIntervalRef.current);
      retryIntervalRef.current = null;
    }
    if (cooldownTimeoutRef.current !== null) {
      window.clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = null;
    }
  }, []);

  const checkEligibility = useCallback((): Eligibility => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      return { eligible: false, reason: "ssr" };
    }
    if (isSuppressedRoute(pathname)) return { eligible: false, reason: "suppressed" };
    if (document.hidden) return { eligible: false, reason: "hidden" };
    if (isModalOpen()) return { eligible: false, reason: "modal" };
    if (isFormActive()) return { eligible: false, reason: "formActive" };
    const impressions = getSessionImpressions();
    if (impressions >= AFFILIATE_AD_CONFIG.maxSessionImpressions) return { eligible: false, reason: "max" };
    const lastClicked = getLocalTimestamp(AFFILIATE_STORAGE_KEYS.lastClicked);
    const clickRemaining = getRemainingCooldown(lastClicked, AFFILIATE_AD_CONFIG.clickCooldown);
    if (clickRemaining > 0) return { eligible: false, reason: "clickCooldown", remainingMs: clickRemaining };
    const lastClosed = getLocalTimestamp(AFFILIATE_STORAGE_KEYS.lastClosed);
    const closeRemaining = getRemainingCooldown(lastClosed, AFFILIATE_AD_CONFIG.closeCooldown);
    if (closeRemaining > 0) return { eligible: false, reason: "closeCooldown", remainingMs: closeRemaining };
    return { eligible: true, reason: "ok" };
  }, [pathname]);

  const checkEligibilityRef = useRef(checkEligibility);
  useEffect(() => {
    checkEligibilityRef.current = checkEligibility;
  }, [checkEligibility]);

  const attemptShowRef = useRef<() => boolean>(() => false);

  const attemptShow = useCallback(() => {
    const result = checkEligibilityRef.current();
    if (result.eligible) {
      let lastId: string | null = null;
      try {
        lastId = window.localStorage.getItem(AFFILIATE_STORAGE_KEYS.lastCreativeId);
      } catch {
        lastId = null;
      }
      const nextAd = selectNextCreative(lastId);
      try {
        window.localStorage.setItem(AFFILIATE_STORAGE_KEYS.lastCreativeId, nextAd.id);
        window.localStorage.setItem(AFFILIATE_STORAGE_KEYS.lastCampaign, AFFILIATE_AD_CONFIG.campaign);
      } catch {
        // ignore
      }
      setCurrentAd(nextAd);
      adRef.current = nextAd;
      setIsVisible(true);
      try {
        const cur = getSessionImpressions();
        setSessionImpressions(cur + 1);
      } catch {
        // ignore
      }
      trackAffiliateEvent("affiliate_ad_impression", {
        advertiser: nextAd.advertiser,
        campaign: AFFILIATE_AD_CONFIG.campaign,
        creativeId: nextAd.id,
      });
      if (retryIntervalRef.current !== null) {
        window.clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
      if (cooldownTimeoutRef.current !== null) {
        window.clearTimeout(cooldownTimeoutRef.current);
        cooldownTimeoutRef.current = null;
      }
      return true;
    }

    if (result.reason === "closeCooldown" || result.reason === "clickCooldown") {
      const remaining = (result as { remainingMs: number }).remainingMs;
      if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = window.setTimeout(() => {
        cooldownTimeoutRef.current = null;
        attemptShowRef.current();
      }, remaining + 500) as unknown as number;
      if (retryIntervalRef.current !== null) {
        window.clearInterval(retryIntervalRef.current);
        retryIntervalRef.current = null;
      }
    } else if (
      result.reason === "hidden" ||
      result.reason === "modal" ||
      result.reason === "suppressed" ||
      result.reason === "formActive"
    ) {
      if (retryIntervalRef.current === null) {
        retryIntervalRef.current = window.setInterval(() => {
          const r = checkEligibilityRef.current();
          if (r.eligible) {
            attemptShowRef.current();
          } else if (r.reason === "max") {
            if (retryIntervalRef.current !== null) {
              window.clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }
            if (cooldownTimeoutRef.current !== null) {
              window.clearTimeout(cooldownTimeoutRef.current);
              cooldownTimeoutRef.current = null;
            }
          } else if (r.reason === "closeCooldown" || r.reason === "clickCooldown") {
            if (retryIntervalRef.current !== null) {
              window.clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }
            const rem = (r as { remainingMs: number }).remainingMs;
            if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
            cooldownTimeoutRef.current = window.setTimeout(() => {
              cooldownTimeoutRef.current = null;
              attemptShowRef.current();
            }, rem + 500) as unknown as number;
          }
        }, 3000) as unknown as number;
      }
    } else if (result.reason === "max") {
      clearAllTimers();
    }
    return false;
  }, [clearAllTimers]);

  const scheduleInitialTimer = useCallback(() => {
    if (initialTimerRef.current !== null) return;
    const isMobile = typeof window !== "undefined" ? window.innerWidth < 768 : false;
    const delay = isMobile ? AFFILIATE_AD_CONFIG.initialDelayMobile : AFFILIATE_AD_CONFIG.initialDelayDesktop;
    initialTimerRef.current = window.setTimeout(() => {
      initialTimerRef.current = null;
      attemptShowRef.current();
    }, delay) as unknown as number;
  }, []);

  useEffect(() => {
    attemptShowRef.current = attemptShow;
  }, [attemptShow]);

  const handleInteraction = useCallback(() => {
    if (hasInteractedRef.current) return;
    hasInteractedRef.current = true;
    const eligibility = checkEligibilityRef.current();
    if (eligibility.reason === "max") return;
    if (eligibility.reason === "closeCooldown" || eligibility.reason === "clickCooldown") {
      const remaining = (eligibility as { remainingMs: number }).remainingMs;
      if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = window.setTimeout(() => {
        cooldownTimeoutRef.current = null;
        attemptShowRef.current();
      }, remaining + 500) as unknown as number;
      return;
    }
    scheduleInitialTimer();
  }, [scheduleInitialTimer]);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const events: Array<keyof WindowEventMap> = ["scroll", "pointerdown", "touchstart", "keydown", "mousemove", "click"];
    const onInteraction = () => handleInteraction();

    events.forEach((ev) => window.addEventListener(ev, onInteraction, { once: true, passive: true }));

    const onVisibilityChange = () => {
      if (!document.hidden) {
        if (retryIntervalRef.current !== null) {
          window.setTimeout(() => attemptShowRef.current(), 400);
        } else if (
          !isVisibleRef.current &&
          hasInteractedRef.current &&
          initialTimerRef.current === null &&
          cooldownTimeoutRef.current === null
        ) {
          const r = checkEligibilityRef.current();
          if (r.eligible) {
            window.setTimeout(() => attemptShowRef.current(), 500);
          } else if (
            r.reason === "hidden" ||
            r.reason === "modal" ||
            r.reason === "suppressed" ||
            r.reason === "formActive"
          ) {
            if (retryIntervalRef.current === null) {
              retryIntervalRef.current = window.setInterval(() => {
                const rr = checkEligibilityRef.current();
                if (rr.eligible) attemptShowRef.current();
              }, 3000) as unknown as number;
            }
          }
        }
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onInteraction));
      document.removeEventListener("visibilitychange", onVisibilityChange);
      clearAllTimers();
    };
  }, [handleInteraction, clearAllTimers]);

  useEffect(() => {
    if (isVisible && isSuppressedRoute(pathname)) {
      setIsVisible(false);
    }
    if (!isVisible && hasInteractedRef.current) {
      const r = checkEligibilityRef.current();
      if (
        r.reason === "suppressed" &&
        retryIntervalRef.current === null &&
        initialTimerRef.current === null &&
        cooldownTimeoutRef.current === null
      ) {
        retryIntervalRef.current = window.setInterval(() => {
          const rr = checkEligibilityRef.current();
          if (rr.eligible) {
            attemptShowRef.current();
          } else if (rr.reason === "max") {
            if (retryIntervalRef.current !== null) {
              window.clearInterval(retryIntervalRef.current);
              retryIntervalRef.current = null;
            }
          }
        }, 3000) as unknown as number;
      } else if (
        r.eligible &&
        initialTimerRef.current === null &&
        cooldownTimeoutRef.current === null &&
        retryIntervalRef.current === null
      ) {
        window.setTimeout(() => attemptShowRef.current(), 400);
      }
    }
  }, [pathname, isVisible]);

  const handleClose = useCallback(() => {
    const ad = adRef.current;
    setIsVisible(false);
    try {
      window.localStorage.setItem(AFFILIATE_STORAGE_KEYS.lastClosed, String(Date.now()));
    } catch {
      // ignore
    }
    trackAffiliateEvent("affiliate_ad_close", {
      advertiser: ad?.advertiser ?? AFFILIATE_AD_CONFIG.advertiser,
      campaign: AFFILIATE_AD_CONFIG.campaign,
      creativeId: ad?.id ?? "unknown",
    });
    const impressions = getSessionImpressions();
    if (impressions >= AFFILIATE_AD_CONFIG.maxSessionImpressions) {
      clearAllTimers();
      return;
    }
    const lastClicked = getLocalTimestamp(AFFILIATE_STORAGE_KEYS.lastClicked);
    const clickRemaining = getRemainingCooldown(lastClicked, AFFILIATE_AD_CONFIG.clickCooldown);
    if (clickRemaining > 0) {
      if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
      cooldownTimeoutRef.current = window.setTimeout(() => {
        cooldownTimeoutRef.current = null;
        attemptShow();
      }, clickRemaining + 500) as unknown as number;
      return;
    }
    if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
    cooldownTimeoutRef.current = window.setTimeout(() => {
      cooldownTimeoutRef.current = null;
      attemptShow();
    }, AFFILIATE_AD_CONFIG.closeCooldown + 200) as unknown as number;
  }, [attemptShow, clearAllTimers]);

  const handleAffiliateClick = useCallback(() => {
    const ad = adRef.current;
    try {
      window.localStorage.setItem(AFFILIATE_STORAGE_KEYS.lastClicked, String(Date.now()));
    } catch {
      // ignore
    }
    trackAffiliateEvent("affiliate_ad_click", {
      advertiser: ad?.advertiser ?? AFFILIATE_AD_CONFIG.advertiser,
      campaign: AFFILIATE_AD_CONFIG.campaign,
      creativeId: ad?.id ?? "unknown",
    });
    setIsVisible(false);
    const impressions = getSessionImpressions();
    if (impressions >= AFFILIATE_AD_CONFIG.maxSessionImpressions) {
      clearAllTimers();
      return;
    }
    if (cooldownTimeoutRef.current !== null) window.clearTimeout(cooldownTimeoutRef.current);
    cooldownTimeoutRef.current = window.setTimeout(() => {
      cooldownTimeoutRef.current = null;
      attemptShow();
    }, AFFILIATE_AD_CONFIG.clickCooldown + 200) as unknown as number;
  }, [attemptShow, clearAllTimers]);

  useEffect(() => {
    if (!isVisible) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isVisible, handleClose]);

  return {
    isVisible,
    currentAd,
    handleClose,
    handleAffiliateClick,
  };
}
