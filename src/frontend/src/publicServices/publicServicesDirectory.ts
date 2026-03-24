// Isolated Public Services directory module
// Loads static JSON from same-origin and performs keyword-based filtering
// No external API calls, no GPS, no distance calculations

import {
  containsAnyKeyword,
  normalizeText,
} from "../utils/antifraudTextNormalize";

// Global keyword set for public service search (multilingual)
const _PUBLIC_SERVICE_SEARCH_KEYWORDS = [
  "hospital",
  "polícia",
  "police",
  "bombeiros",
  "fire",
  "emergência",
  "emergency",
  "serviços públicos",
  "public services",
  "governo",
  "government",
];

export interface PublicServiceEntity {
  name: string;
  contact: string;
  address: string;
  category: string;
  distanceText?: string; // Pre-authored informational text only
}

export interface PublicServicesDirectoryData {
  services: PublicServiceEntity[];
}

let cachedDirectory: PublicServicesDirectoryData | null = null;

/**
 * Load the static public services directory from same-origin JSON
 */
export async function loadPublicServicesDirectory(): Promise<PublicServicesDirectoryData> {
  if (cachedDirectory) {
    return cachedDirectory;
  }

  try {
    const response = await fetch("/data/public-services.json");
    if (!response.ok) {
      throw new Error("Failed to load public services directory");
    }

    const data = await response.json();

    // Harden: only consume known safe text fields
    const sanitizedData: PublicServicesDirectoryData = {
      services: (data.services || []).map((service: any) => ({
        name: String(service.name || ""),
        contact: String(service.contact || ""),
        address: String(service.address || ""),
        category: String(service.category || ""),
        distanceText: service.distanceText
          ? String(service.distanceText)
          : undefined,
      })),
    };

    cachedDirectory = sanitizedData;
    return sanitizedData;
  } catch (error) {
    console.error("Error loading public services directory:", error);
    // Return empty directory on error
    return { services: [] };
  }
}

/**
 * Filter public services by keyword search
 * Searches across name, contact, address, and category fields
 */
export function filterPublicServices(
  directory: PublicServicesDirectoryData,
  searchQuery: string,
): PublicServiceEntity[] {
  if (!searchQuery || searchQuery.trim().length === 0) {
    return directory.services;
  }

  const normalizedQuery = normalizeText(searchQuery);

  return directory.services.filter((service) => {
    // Include contact field in searchable text
    const searchableText = normalizeText(
      `${service.name} ${service.contact} ${service.address} ${service.category}`,
    );

    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Search public services by keyword
 * Returns filtered results based on global keyword set and user query
 */
export async function searchPublicServices(
  query: string,
): Promise<PublicServiceEntity[]> {
  const directory = await loadPublicServicesDirectory();
  return filterPublicServices(directory, query);
}
