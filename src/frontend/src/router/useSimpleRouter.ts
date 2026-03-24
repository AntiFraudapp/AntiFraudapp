import { useEffect, useState } from "react";

// Module-level shared state for synchronization
let currentPath = window.location.pathname;
const listeners = new Set<() => void>();

// Custom event for navigation
const NAVIGATION_EVENT = "simple-router-navigate";

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

// Listen for custom navigation events
window.addEventListener(NAVIGATION_EVENT, () => {
  currentPath = window.location.pathname;
  notifyListeners();
});

// Listen for browser back/forward
window.addEventListener("popstate", () => {
  currentPath = window.location.pathname;
  notifyListeners();
});

export function useSimpleRouter() {
  const [route, setRoute] = useState(currentPath);

  useEffect(() => {
    const listener = () => setRoute(currentPath);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  const navigate = (path: string) => {
    if (path !== currentPath) {
      currentPath = path;
      window.history.pushState({}, "", path);
      window.dispatchEvent(new Event(NAVIGATION_EVENT));
    }
  };

  return {
    currentRoute: route,
    navigate,
  };
}
