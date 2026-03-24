import {
  getInstallState,
  subscribe,
  triggerPWAInstall as triggerInstall,
} from "@/pwa/install";
import { useEffect, useState } from "react";

export function usePwaInstall() {
  const [state, setState] = useState(getInstallState);

  useEffect(() => {
    const unsubscribe = subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const triggerInstallPrompt = async () => {
    return await triggerInstall();
  };

  return {
    canInstall: state.canInstall,
    isInstalled: state.isInstalled,
    triggerInstall: triggerInstallPrompt,
  };
}
