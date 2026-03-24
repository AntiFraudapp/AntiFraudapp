import { useEffect, useState } from "react";

const COOLDOWN_KEY = "pwa-install-prompt-dismissed";
const COOLDOWN_DAYS = 7;

function getDismissalTimestamp(): number | null {
  try {
    const stored = localStorage.getItem(COOLDOWN_KEY);
    return stored ? Number.parseInt(stored, 10) : null;
  } catch {
    return null;
  }
}

function setDismissalTimestamp() {
  try {
    localStorage.setItem(COOLDOWN_KEY, Date.now().toString());
  } catch {
    // Ignore storage errors
  }
}

function clearDismissalTimestamp() {
  try {
    localStorage.removeItem(COOLDOWN_KEY);
  } catch {
    // Ignore storage errors
  }
}

function isWithinCooldown(): boolean {
  const timestamp = getDismissalTimestamp();
  if (!timestamp) return false;

  const cooldownMs = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
  return Date.now() - timestamp < cooldownMs;
}

export function usePwaInstallPromptCooldown() {
  const [isDismissed, setIsDismissed] = useState(isWithinCooldown);

  useEffect(() => {
    setIsDismissed(isWithinCooldown());
  }, []);

  const dismissPrompt = () => {
    setDismissalTimestamp();
    setIsDismissed(true);
  };

  const clearDismissal = () => {
    clearDismissalTimestamp();
    setIsDismissed(false);
  };

  return {
    isDismissed,
    dismissPrompt,
    clearDismissal,
  };
}
