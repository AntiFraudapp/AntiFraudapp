// Frontend-only public contact information lookup
// Loads and searches same-origin dataset with legal public metadata

export interface PublicContactInfo {
  displayName?: string;
  summary: string;
  details?: string;
  source: string;
  sourceUrl?: string;
  asOfDate: string;
  category?: string;
}

export interface PublicLookupResult {
  found: boolean;
  info?: PublicContactInfo;
  displayName?: string;
  summary?: string;
  category?: string;
}

let cachedData: Record<string, PublicContactInfo> | null = null;

/**
 * Load public contact lookup dataset from same-origin JSON
 */
async function loadPublicData(): Promise<Record<string, PublicContactInfo>> {
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch("/data/public-contact-lookup.json");
    if (!response.ok) {
      console.warn("Public contact lookup data not available");
      return {};
    }

    cachedData = await response.json();
    return cachedData || {};
  } catch (error) {
    console.warn("Failed to load public contact lookup data:", error);
    return {};
  }
}

/**
 * Lookup public information for a contact (phone or email)
 */
export async function lookupPublicContact(
  contact: string,
  type: "phone" | "email",
): Promise<PublicLookupResult> {
  const data = await loadPublicData();

  // Normalize lookup key
  const key = `${type}:${contact.toLowerCase()}`;

  const info = data[key];

  if (info) {
    return {
      found: true,
      info,
      displayName: info.displayName,
      summary: info.summary,
      category: info.category,
    };
  }

  return {
    found: false,
  };
}
