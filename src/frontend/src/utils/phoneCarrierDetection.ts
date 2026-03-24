/**
 * Heuristic carrier and country detection for E.164 phone numbers.
 * All detection is deterministic and client-side with no API calls.
 */

import callingCodesData from "@/data/country-calling-codes.json";

export interface CarrierDetectionResult {
  carrier: string;
  country: string;
  callingCode: string;
}

// Portuguese carrier prefix mapping (+351)
// +351 91x → Vodafone PT
// +351 92x → NOS
// +351 93x → MEO/Altice
// +351 96x → NOS
// +351 96x → Vodafone PT (some ranges)
const PT_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  { prefix: "+35191", carrier: "Vodafone PT" },
  { prefix: "+35196", carrier: "Vodafone PT" },
  { prefix: "+35192", carrier: "NOS" },
  { prefix: "+35195", carrier: "NOS" },
  { prefix: "+35193", carrier: "MEO/Altice PT" },
  { prefix: "+35194", carrier: "NOS" },
  { prefix: "+35197", carrier: "MEO/Altice PT" },
  { prefix: "+35198", carrier: "MEO/Altice PT" },
  { prefix: "+35199", carrier: "Vodafone PT" },
];

// Brazilian carrier prefix mapping (+55)
// São Paulo area code 11
// +55 11 9xxxx → Claro BR (mobile)
// +55 11 8xxxx → Vivo
// +55 11 7xxxx → TIM
// +55 11 6xxxx → Oi
const BR_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  { prefix: "+55119", carrier: "Claro BR" },
  { prefix: "+55118", carrier: "Vivo" },
  { prefix: "+55117", carrier: "TIM" },
  { prefix: "+55116", carrier: "Oi" },
  // Rio de Janeiro area code 21
  { prefix: "+55219", carrier: "Claro BR" },
  { prefix: "+55218", carrier: "Vivo" },
  { prefix: "+55217", carrier: "TIM" },
  // Belo Horizonte area code 31
  { prefix: "+55319", carrier: "Claro BR" },
  { prefix: "+55318", carrier: "Vivo" },
  // Generic Brazil mobile
  { prefix: "+559", carrier: "Claro BR" },
];

// Spanish carrier prefix mapping (+34)
const ES_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  { prefix: "+346", carrier: "Movistar ES" },
  { prefix: "+347", carrier: "Vodafone ES" },
  { prefix: "+348", carrier: "Orange ES" },
];

// UK carrier prefix mapping (+44)
const UK_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  { prefix: "+447", carrier: "EE/O2/Vodafone UK" },
  { prefix: "+448", carrier: "BT UK" },
];

// US/Canada carrier prefix mapping (+1)
const US_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  { prefix: "+1", carrier: "AT&T/Verizon/T-Mobile US" },
];

// All carrier prefix tables combined (longer prefixes first for best match)
const ALL_CARRIER_PREFIXES: Array<{ prefix: string; carrier: string }> = [
  ...PT_CARRIER_PREFIXES,
  ...BR_CARRIER_PREFIXES,
  ...ES_CARRIER_PREFIXES,
  ...UK_CARRIER_PREFIXES,
  ...US_CARRIER_PREFIXES,
];

/**
 * Derive country name from E.164 phone number using the calling codes dataset.
 * Returns the best (longest) match.
 */
function deriveCountryFromCallingCode(e164: string): {
  country: string;
  callingCode: string;
} {
  const codes = callingCodesData as Array<{
    country: string;
    code: string;
    iso: string;
  }>;

  let bestMatch: { country: string; code: string } | null = null;

  for (const entry of codes) {
    // Normalize code: remove any sub-region suffix like "+1-684" → "+1684"
    const normalizedCode = entry.code.replace("-", "");
    if (e164.startsWith(normalizedCode)) {
      if (
        !bestMatch ||
        normalizedCode.length > bestMatch.code.replace("-", "").length
      ) {
        bestMatch = { country: entry.country, code: entry.code };
      }
    }
  }

  return bestMatch
    ? { country: bestMatch.country, callingCode: bestMatch.code }
    : { country: "Unknown", callingCode: "" };
}

/**
 * Detect carrier from E.164 phone number using prefix tables.
 * Returns the best (longest prefix) match.
 */
function detectCarrierFromPrefix(e164: string): string | null {
  // Normalize: remove spaces/dashes
  const normalized = e164.replace(/[\s\-]/g, "");

  // Sort by prefix length descending for best match
  const sorted = [...ALL_CARRIER_PREFIXES].sort(
    (a, b) => b.prefix.length - a.prefix.length,
  );

  for (const entry of sorted) {
    if (normalized.startsWith(entry.prefix)) {
      return entry.carrier;
    }
  }

  return null;
}

/**
 * Main carrier detection function.
 * Accepts an E.164 phone number and returns carrier, country, and calling code.
 */
export function detectCarrier(phoneE164: string): CarrierDetectionResult {
  const normalized = phoneE164.replace(/[\s\-\(\)]/g, "");

  const { country, callingCode } = deriveCountryFromCallingCode(normalized);
  const detectedCarrier = detectCarrierFromPrefix(normalized);

  const carrier = detectedCarrier ?? `Unknown Carrier (${country})`;

  return {
    carrier,
    country,
    callingCode,
  };
}
