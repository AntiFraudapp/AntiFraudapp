import { useEffect, useState } from "react";

const CONSENT_KEY = "antifraud_consent";
const CURRENT_TERMS_VERSION = 1; // Increment when terms change
const EFFECTIVE_DATE = "2024-04-27";

interface ConsentData {
  accepted: boolean;
  timestamp: number;
  version: number;
}

export function useConsentGate() {
  const [needsConsent, setNeedsConsent] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CONSENT_KEY);
      if (stored) {
        const data: ConsentData = JSON.parse(stored);
        // Require re-consent if version changed
        if (data.accepted && data.version === CURRENT_TERMS_VERSION) {
          setNeedsConsent(false);
        }
      }
    } catch (error) {
      console.error("Error loading consent state:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const giveConsent = () => {
    const data: ConsentData = {
      accepted: true,
      timestamp: Date.now(),
      version: CURRENT_TERMS_VERSION,
    };
    localStorage.setItem(CONSENT_KEY, JSON.stringify(data));
    setNeedsConsent(false);
  };

  return {
    needsConsent,
    isLoading,
    giveConsent,
    currentVersion: CURRENT_TERMS_VERSION,
    effectiveDate: EFFECTIVE_DATE,
  };
}
