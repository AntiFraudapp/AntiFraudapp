import countryData from "@/data/country-calling-codes.json";

export interface CountryCallingCode {
  country: string;
  code: string;
  iso: string;
}

/**
 * Get all country calling codes
 */
export function getAllCountries(): CountryCallingCode[] {
  return countryData;
}

/**
 * Search countries by name, ISO code, or calling code
 */
export function searchCountries(query: string): CountryCallingCode[] {
  if (!query || query.trim() === "") {
    return countryData;
  }

  const normalizedQuery = query.toLowerCase().trim();

  return countryData.filter((country) => {
    const matchesName = country.country.toLowerCase().includes(normalizedQuery);
    const matchesIso = country.iso.toLowerCase().includes(normalizedQuery);
    const matchesCode =
      country.code.toLowerCase().includes(normalizedQuery) ||
      country.code.replace("+", "").includes(normalizedQuery);

    return matchesName || matchesIso || matchesCode;
  });
}

/**
 * Get country by ISO code
 */
export function getCountryByIso(iso: string): CountryCallingCode | undefined {
  return countryData.find(
    (country) => country.iso.toUpperCase() === iso.toUpperCase(),
  );
}

/**
 * Get country by calling code
 */
export function getCountryByCode(code: string): CountryCallingCode | undefined {
  const normalizedCode = code.startsWith("+") ? code : `+${code}`;
  return countryData.find((country) => country.code === normalizedCode);
}
