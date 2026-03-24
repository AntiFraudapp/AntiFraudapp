// FIX: global phone directory lookup with Numverify + public directories

// FIX: lookupPhoneNumber + NUMVERIFY + AbuseIPDB
const ABUSEIPDB_API_KEY =
  "472cfea0e2221f44cdb563993c73abb45e26dd71a504eb855aa0da6d5b14075a74039f44d1db5898";

export interface PhoneDirectoryResult {
  name?: string;
  address?: string;
  website?: string;
  rating?: number;
  reviewsCount?: number;
  operator?: string;
  country?: string;
  countryCode?: string;
  lineType?: string;
  location?: { lat: number; lng: number } | null;
  isEmergency?: boolean;
  emergencyLabel?: string;
  score?: number;
  label?: string;
  details?: string;
  isHighRisk?: boolean;
}

// FIX: emergency phone detection — checked BEFORE any validation or API call
const EMERGENCY_NUMBERS: Record<string, PhoneDirectoryResult> = {
  "112": {
    isEmergency: true,
    emergencyLabel: "🚨 EMERGÊNCIAS PORTUGAL 24/7 | PSP / GNR / INEM",
    name: "Número de Emergência Europeu",
    country: "União Europeia",
    countryCode: "EU",
    lineType: "emergency",
    operator: "Autoridades Públicas",
  },
  "911": {
    isEmergency: true,
    emergencyLabel: "🚨 EMERGÊNCIAS USA 24/7",
    name: "Emergency Services",
    country: "United States",
    countryCode: "US",
    lineType: "emergency",
    operator: "Public Authorities",
  },
  "999": {
    isEmergency: true,
    emergencyLabel: "🚨 EMERGÊNCIAS UK 24/7",
    name: "Emergency Services",
    country: "United Kingdom",
    countryCode: "GB",
    lineType: "emergency",
    operator: "Public Authorities",
  },
  "000": {
    isEmergency: true,
    emergencyLabel: "🚨 EMERGÊNCIAS AUSTRÁLIA 24/7",
    name: "Emergency Services",
    country: "Australia",
    countryCode: "AU",
    lineType: "emergency",
    operator: "Public Authorities",
  },
  "118": {
    isEmergency: false,
    emergencyLabel: "ℹ️ Informações Telefónicas Portugal",
    name: "Serviço de Informações 118",
    country: "Portugal",
    countryCode: "PT",
    lineType: "information",
    operator: "ANACOM",
  },
  "117": {
    isEmergency: true,
    emergencyLabel: "🚨 PSP — Polícia de Segurança Pública",
    name: "PSP",
    country: "Portugal",
    countryCode: "PT",
    lineType: "emergency",
    operator: "Autoridades Públicas",
  },
};

// Detect country from phone prefix to guide directory lookup
function detectCountryFromPrefix(phone: string): string {
  const clean = phone.replace(/\D/g, "");
  if (
    clean.startsWith("351") ||
    (clean.startsWith("9") && clean.length === 9) ||
    (clean.startsWith("2") && clean.length === 9)
  )
    return "PT";
  if (clean.startsWith("1") && clean.length === 11) return "US";
  if (clean.startsWith("44")) return "GB";
  if (clean.startsWith("33")) return "FR";
  if (clean.startsWith("49")) return "DE";
  if (clean.startsWith("34")) return "ES";
  if (clean.startsWith("39")) return "IT";
  if (clean.startsWith("55")) return "BR";
  return "UNKNOWN";
}

// Convert to E.164 when possible (best-effort, not strict)
function toE164(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  // Already has country code
  if (phone.startsWith("+")) return `+${digits}`;
  // Portuguese 9-digit numbers
  if (digits.length === 9 && (digits.startsWith("9") || digits.startsWith("2")))
    return `+351${digits}`;
  // US 10-digit
  if (digits.length === 10) return `+1${digits}`;
  // Has leading 00 (international prefix)
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  return digits;
}

// 1️⃣ NUMVERIFY API KEY
const NUMVERIFY_API_KEY = "c0679c528ea80985fe1c9126e550fa57";

// 2️⃣ NOVA FUNÇÃO — fetchPhoneRealData via Numverify (dados reais de operadora)
// FIX: real phone data from Numverify API
export async function fetchPhoneRealData(
  phone: string,
): Promise<{ carrier: string; line_type: string; country: string } | null> {
  try {
    const res = await fetch(
      `https://apilayer.net/api/validate?access_key=${NUMVERIFY_API_KEY}&number=${encodeURIComponent(phone)}`,
      { signal: AbortSignal.timeout(6000) },
    );
    const data = await res.json();

    if (data?.valid) {
      return {
        carrier: data.carrier || "Desconhecido",
        line_type: data.line_type || "Desconhecido",
        country: data.country_name || "Desconhecido",
      };
    }
    return null;
  } catch {
    return null;
  }
}

// PHONE: Numverify — used by searchPhoneGlobal
async function fetchNumverify(
  phone: string,
): Promise<Partial<PhoneDirectoryResult>> {
  const result = await fetchPhoneRealData(phone);
  if (result) {
    return {
      operator: result.carrier,
      lineType: result.line_type,
      country: result.country,
    };
  }
  return {};
}

// Try OpenStreetMap Nominatim to geocode address if found
async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "pt,en", "User-Agent": "AntiFraudapp/2.2" },
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data?.[0]) {
        return {
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        };
      }
    }
  } catch {
    /* ignore */
  }
  return null;
}

// Fetch from public Portuguese directory (Infobel/PaginasAmarelas via open data)
async function fetchPTDirectory(
  phone: string,
): Promise<Partial<PhoneDirectoryResult>> {
  try {
    const url = `https://www.infobel.com/api/search?q=${encodeURIComponent(phone)}&country=PT&format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const data = await res.json();
      const entry = data?.results?.[0] || data?.[0];
      if (entry) {
        const address = [entry.address, entry.city, entry.zipcode]
          .filter(Boolean)
          .join(", ");
        const loc = address ? await geocodeAddress(address) : null;
        return {
          name: entry.name || entry.company || undefined,
          address: address || undefined,
          website: entry.website || undefined,
          rating: entry.rating ? Number.parseFloat(entry.rating) : undefined,
          reviewsCount: entry.reviews_count
            ? Number.parseInt(entry.reviews_count)
            : undefined,
          location: loc,
        };
      }
    }
  } catch {
    /* fall through */
  }
  return {};
}

// Fetch directory info for other countries via a generic public lookup
async function fetchGenericDirectory(
  phone: string,
  _countryCode: string,
): Promise<Partial<PhoneDirectoryResult>> {
  try {
    const e164 = toE164(phone);
    const url = `https://api.opencnam.com/v3/phone/${encodeURIComponent(e164)}?format=json`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (res.ok) {
      const data = await res.json();
      if (data?.name && data.name !== "UNKNOWN") {
        return { name: data.name };
      }
    }
  } catch {
    /* ignore */
  }
  return {};
}

/**
 * searchPhoneGlobal — main public API
 * 1) Detects emergency numbers first (no API call needed)
 * 2) Calls Numverify for country/operator/line type
 * 3) Based on country, calls the appropriate public directory
 * 4) Returns a unified PhoneDirectoryResult object
 */
export async function searchPhoneGlobal(
  phone: string,
): Promise<PhoneDirectoryResult> {
  const cleaned = phone.trim().replace(/[^0-9+]/g, "");
  const digitsOnly = cleaned.replace(/\D/g, "");

  // FIX: emergency phone detection — priority check
  if (EMERGENCY_NUMBERS[digitsOnly]) {
    return { ...EMERGENCY_NUMBERS[digitsOnly] };
  }

  // Step 1: get country/operator from Numverify
  const numverifyInfo = await fetchNumverify(cleaned);
  const countryCode =
    numverifyInfo.countryCode || detectCountryFromPrefix(digitsOnly);

  // Step 2: country-specific directory lookup
  let directoryInfo: Partial<PhoneDirectoryResult> = {};
  if (countryCode === "PT") {
    directoryInfo = await fetchPTDirectory(cleaned);
  } else {
    directoryInfo = await fetchGenericDirectory(cleaned, countryCode);
  }

  // Step 3: merge results
  return {
    ...numverifyInfo,
    ...directoryInfo,
    countryCode: numverifyInfo.countryCode || countryCode,
    country: numverifyInfo.country || directoryInfo.country,
  };
}

// FIX: lookupPhoneNumber + NUMVERIFY + AbuseIPDB — IP lookup interface
export interface IPLookupResult {
  ip: string;
  abuseScore: number;
  country: string;
  city: string;
  isp: string;
  totalReports: number;
  isBlacklisted: boolean;
  lastReportedAt: string | null;
  riskLevel: "HIGH" | "MEDIUM" | "LOW";
}

export async function lookupIPAddress(
  ip: string,
): Promise<IPLookupResult | null> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${encodeURIComponent(ip)}&maxAgeInDays=90&verbose`,
      {
        headers: {
          Key: ABUSEIPDB_API_KEY,
          Accept: "application/json",
        },
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    if (!res.ok) return null;
    const json = await res.json();
    const d = json?.data;
    if (!d) return null;
    const abuseScore: number = d.abuseConfidenceScore ?? 0;
    const riskLevel: "HIGH" | "MEDIUM" | "LOW" =
      abuseScore >= 75 ? "HIGH" : abuseScore >= 25 ? "MEDIUM" : "LOW";
    return {
      ip: d.ipAddress ?? ip,
      abuseScore,
      country: d.countryCode ?? "",
      city: d.usageType ?? "",
      isp: d.isp ?? "",
      totalReports: d.totalReports ?? 0,
      isBlacklisted: abuseScore >= 50,
      lastReportedAt: d.lastReportedAt ?? null,
      riskLevel,
    };
  } catch {
    return null;
  }
}

export function isIPAddress(s: string): boolean {
  // IPv4
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(s)) return true;
  // IPv6
  if (/^[0-9a-fA-F:]+$/.test(s) && s.includes(":")) return true;
  return false;
}

// Re-export the simple fraud check function for backward compatibility
export const knownFraudNumbers: string[] = [
  "+351912000000",
  "+351913000000",
  "+12025550193",
];

export function checkKnownFraudNumber(phone: string): boolean {
  return knownFraudNumbers.includes(phone);
}

// lookupPhoneNumber — kept synchronous (called without await in HomePage.tsx)
// FIX: emergency phone detection + known fraud numbers
// fetchPhoneRealData (async) is exported separately for use in async contexts
export function lookupPhoneNumber(phone: string): {
  isHighRisk: boolean;
  label: string;
  details?: string;
  score?: number;
} | null {
  const digits = phone.replace(/\D/g, "");

  // Emergency numbers — priority, no validation needed
  if (EMERGENCY_NUMBERS[digits]) {
    const e = EMERGENCY_NUMBERS[digits];
    return {
      isHighRisk: false,
      label: e.emergencyLabel || e.name || "",
      score: 0,
    };
  }

  // Known fraud numbers
  if (checkKnownFraudNumber(phone)) {
    return {
      isHighRisk: true,
      label: "🚨 Número reportado como potencial fraude",
      score: 90,
    };
  }

  // For real carrier/country data, call fetchPhoneRealData(phone) from an async context
  // or use searchPhoneGlobal(phone) which integrates Numverify automatically
  return null;
}
