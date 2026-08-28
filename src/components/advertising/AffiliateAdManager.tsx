"use client";

import { AffiliateAdPopup } from "./AffiliateAdPopup";
import { useAffiliateAd } from "./useAffiliateAd";

export function AffiliateAdManager() {
  const { isVisible, currentAd, handleClose, handleAffiliateClick } = useAffiliateAd();

  if (!isVisible || !currentAd) return null;

  return <AffiliateAdPopup ad={currentAd} onClose={handleClose} onAffiliateClick={handleAffiliateClick} />;
}
