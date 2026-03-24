/**
 * Best-effort offline persistence for Advanced Contact Lookup results.
 * Uses AnalysisResult from structuredFraudAnalysis (exported as StructuredAnalysisResult alias).
 */

import type { PublicContactInfo } from "@/utils/publicContactLookup";
import type { AnalysisResult } from "@/utils/structuredFraudAnalysis";
import { useEffect, useState } from "react";

// Re-export alias for backward compatibility
export type StructuredAnalysisResult = AnalysisResult;

export interface CachedLookupResult {
  query: string;
  type: "phone" | "email";
  timestamp: number;
  antifraudResult: AnalysisResult;
  publicInfo?: PublicContactInfo;
}

const CACHE_KEY = "antifraud_contact_lookup_cache";
const MAX_CACHE_ITEMS = 50;

function loadCache(): CachedLookupResult[] {
  try {
    const stored = localStorage.getItem(CACHE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCache(cache: CachedLookupResult[]): void {
  try {
    const trimmed = cache.slice(0, MAX_CACHE_ITEMS);
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  } catch {
    // ignore
  }
}

export function useAdvancedContactLookupCache() {
  const [cache, setCache] = useState<CachedLookupResult[]>([]);

  useEffect(() => {
    setCache(loadCache());
  }, []);

  const addToCache = (result: CachedLookupResult) => {
    setCache((prev) => {
      const filtered = prev.filter(
        (item) => item.query !== result.query || item.type !== result.type,
      );
      const updated = [result, ...filtered];
      saveCache(updated);
      return updated;
    });
  };

  const getCached = (
    query: string,
    type: "phone" | "email",
  ): CachedLookupResult | undefined => {
    return cache.find((item) => item.query === query && item.type === type);
  };

  const clearCache = () => {
    setCache([]);
    localStorage.removeItem(CACHE_KEY);
  };

  // Aliases for backward compatibility
  const getCachedResult = getCached;
  const cacheResult = (
    query: string,
    type: "phone" | "email",
    result: {
      antifraudResult: AnalysisResult;
      publicInfo?: PublicContactInfo;
      fromCache?: boolean;
    },
  ) => {
    addToCache({
      query,
      type,
      timestamp: Date.now(),
      antifraudResult: result.antifraudResult,
      publicInfo: result.publicInfo,
    });
  };

  return {
    cache,
    addToCache,
    getCached,
    clearCache,
    getCachedResult,
    cacheResult,
  };
}
