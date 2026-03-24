// Lightweight helper to derive display country from E.164-like phone numbers
// Used for public/official phone entity display only

interface CountryCode {
  code: string;
  country: string;
}

// Common country calling codes
const COUNTRY_CODES: CountryCode[] = [
  { code: "+1", country: "USA/Canada" },
  { code: "+44", country: "United Kingdom" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+34", country: "Spain" },
  { code: "+39", country: "Italy" },
  { code: "+351", country: "Portugal" },
  { code: "+55", country: "Brazil" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+81", country: "Japan" },
  { code: "+82", country: "South Korea" },
  { code: "+61", country: "Australia" },
  { code: "+64", country: "New Zealand" },
  { code: "+27", country: "South Africa" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+45", country: "Denmark" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+48", country: "Poland" },
  { code: "+7", country: "Russia/Kazakhstan" },
  { code: "+90", country: "Turkey" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+971", country: "UAE" },
  { code: "+972", country: "Israel" },
  { code: "+20", country: "Egypt" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
  { code: "+60", country: "Malaysia" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+65", country: "Singapore" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
];

/**
 * Derive country from phone number based on leading country code
 * Returns 'Unknown' if no match found
 */
export function deriveCountryFromPhone(phone: string): string {
  if (!phone) return "Unknown";

  // Normalize phone: remove spaces, dashes, parentheses
  const normalized = phone.replace(/[\s\-\(\)]/g, "");

  // Ensure it starts with +
  const withPlus = normalized.startsWith("+") ? normalized : `+${normalized}`;

  // Find longest matching country code
  let bestMatch: CountryCode | null = null;
  for (const entry of COUNTRY_CODES) {
    if (withPlus.startsWith(entry.code)) {
      if (!bestMatch || entry.code.length > bestMatch.code.length) {
        bestMatch = entry;
      }
    }
  }

  return bestMatch ? bestMatch.country : "Unknown";
}
