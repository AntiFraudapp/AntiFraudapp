import { useQuery } from "@tanstack/react-query";
import type { TermsDocument } from "../backend";
import { useActor } from "./useActor";

export function useTermsDocument() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<TermsDocument | null>({
    queryKey: ["termsDocument"],
    queryFn: async () => {
      if (!actor) return null;
      try {
        return await actor.getCurrentTerms();
      } catch (error) {
        console.error("Error fetching terms document:", error);
        return null;
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    termsDocument: query.data,
    isLoading: actorFetching || query.isLoading,
    error: query.error,
  };
}
