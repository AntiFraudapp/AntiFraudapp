// Module-level state for PWA install prompt
let deferredPrompt: any = null;
let setupCalled = false;
let isInstalled = false;

// Subscribers for state changes
type StateChangeListener = (state: {
  canInstall: boolean;
  isInstalled: boolean;
}) => void;
const listeners: Set<StateChangeListener> = new Set();

function notifyListeners() {
  const state = { canInstall: !!deferredPrompt && !isInstalled, isInstalled };
  for (const listener of listeners) {
    listener(state);
  }
}

export function subscribe(listener: StateChangeListener): () => void {
  listeners.add(listener);
  // Immediately notify with current state
  listener({ canInstall: !!deferredPrompt && !isInstalled, isInstalled });
  return () => listeners.delete(listener);
}

export function setupPWAInstall() {
  // Prevent duplicate listener registration
  if (setupCalled) return;
  setupCalled = true;

  // Check if already installed
  const checkInstalled = () => {
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    return isStandalone || isIOSStandalone;
  };

  isInstalled = checkInstalled();

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // Only mark as not installed if we receive the prompt
    isInstalled = false;
    notifyListeners();
  });

  window.addEventListener("appinstalled", () => {
    deferredPrompt = null;
    isInstalled = true;
    notifyListeners();
  });

  // Listen for display mode changes
  window
    .matchMedia("(display-mode: standalone)")
    .addEventListener("change", (e) => {
      if (e.matches) {
        isInstalled = true;
        deferredPrompt = null;
        notifyListeners();
      }
    });

  // Register service worker with skipWaiting support
  if ("serviceWorker" in navigator && typeof window !== "undefined") {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        // When a new SW is waiting, activate it immediately
        if (registration.waiting) {
          registration.waiting.postMessage({ type: "SKIP_WAITING" });
        }
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;
          newWorker.addEventListener("statechange", () => {
            if (
              newWorker.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              // New content available — activate immediately
              newWorker.postMessage({ type: "SKIP_WAITING" });
            }
          });
        });
        // When SW controller changes, reload to get latest assets
        let refreshing = false;
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          if (!refreshing) {
            refreshing = true;
            window.location.reload();
          }
        });
      })
      .catch((err) => {
        console.warn("AntiFraudapp SW registration failed:", err);
      });
  }

  // Initial notification after setup
  notifyListeners();
}

export async function triggerPWAInstall(): Promise<"prompted" | "unavailable"> {
  if (!deferredPrompt || isInstalled) return "unavailable";

  try {
    await deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;

    if (result.outcome === "accepted") {
      isInstalled = true;
      deferredPrompt = null;
      notifyListeners();
    } else {
      // User dismissed, but prompt is still available
      // Don't clear deferredPrompt yet
    }

    return "prompted";
  } catch (error) {
    console.error("PWA install prompt error:", error);
    return "unavailable";
  }
}

export function getInstallState(): {
  canInstall: boolean;
  isInstalled: boolean;
} {
  return { canInstall: !!deferredPrompt && !isInstalled, isInstalled };
}
