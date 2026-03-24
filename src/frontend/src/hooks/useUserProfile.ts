import {
  type HistoryItem,
  clearUserProfile,
  getUserProfile,
  saveUserProfile,
} from "@/utils/userProfileStorage";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "./useInternetIdentity";

interface UseUserProfile {
  history: HistoryItem[];
  addHistoryItem: (item: HistoryItem) => void;
  clearHistory: () => void;
  identity: any;
}

export function useUserProfile(): UseUserProfile {
  const { identity } = useInternetIdentity();
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    if (identity) {
      const principal = identity.getPrincipal().toString();
      const profile = getUserProfile(principal);
      setHistory(profile.history);
    } else {
      setHistory([]);
    }
  }, [identity]);

  const addHistoryItem = (item: HistoryItem) => {
    if (!identity) return;

    const principal = identity.getPrincipal().toString();
    const profile = getUserProfile(principal);
    const newHistory = [item, ...profile.history].slice(0, 50);

    saveUserProfile(principal, { ...profile, history: newHistory });
    setHistory(newHistory);
  };

  const clearHistory = () => {
    if (!identity) return;

    const principal = identity.getPrincipal().toString();
    const profile = getUserProfile(principal);
    saveUserProfile(principal, { ...profile, history: [] });
    setHistory([]);
  };

  return {
    history,
    addHistoryItem,
    clearHistory,
    identity,
  };
}
