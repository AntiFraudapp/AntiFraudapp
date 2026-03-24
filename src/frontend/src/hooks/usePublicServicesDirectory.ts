// Dedicated hook to fetch/cache same-origin static directory data
// Exposes filter/search state for /public-services page
// No external API calls

import { useEffect, useState } from "react";
import {
  type PublicServiceEntity,
  type PublicServicesDirectoryData,
  filterPublicServices,
  loadPublicServicesDirectory,
} from "../publicServices/publicServicesDirectory";

export function usePublicServicesDirectory() {
  const [directory, setDirectory] =
    useState<PublicServicesDirectoryData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredResults, setFilteredResults] = useState<PublicServiceEntity[]>(
    [],
  );

  // Load directory on mount
  useEffect(() => {
    let mounted = true;

    const loadDirectory = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await loadPublicServicesDirectory();

        if (mounted) {
          setDirectory(data);
          setFilteredResults(data.services);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load directory",
          );
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    loadDirectory();

    return () => {
      mounted = false;
    };
  }, []);

  // Filter results when search query changes
  useEffect(() => {
    if (directory) {
      const results = filterPublicServices(directory, searchQuery);
      setFilteredResults(results);
    }
  }, [searchQuery, directory]);

  return {
    directory,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    filteredResults,
  };
}
