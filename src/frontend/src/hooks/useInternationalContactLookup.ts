import type { ExtendedContactDetails } from "@/backend";
import type { ContactType } from "@/utils/contactInputHeuristics";
import { useState } from "react";
import { useActor } from "./useActor";

export function useInternationalContactLookup() {
  const { actor } = useActor();
  const [data, setData] = useState<ExtendedContactDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const lookup = async (
    normalizedContact: string,
    contactType: ContactType,
  ) => {
    if (!actor) {
      setError(new Error("Actor not available"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setData(null);

    try {
      // Use normalized contact as lookup key
      const result = await actor.getLookupDetails(normalizedContact);

      if (result) {
        setData(result);
      } else {
        // No data found - create a safe empty result
        setData({
          content: normalizedContact,
          contactType: { __kind__: "custom", custom: contactType },
          details: {
            id: normalizedContact,
            type: contactType,
            country: "Unknown",
            verified: "false",
            riskLevel: "Unknown",
            riskScore: "N/A",
            reports: "0",
            trustScore: "N/A",
            riskScoreDescription: "No data available for this contact.",
          },
        });
      }
    } catch (err) {
      console.error("International lookup error:", err);
      setError(err instanceof Error ? err : new Error("Lookup failed"));
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return {
    lookup,
    data,
    isLoading,
    error,
    reset,
  };
}
