/**
 * Frontend-only phone number validation using basic pattern matching
 * This is a lightweight alternative to libphonenumber-js for offline validation
 */

export interface PhoneValidationResult {
  isValid: boolean;
  e164: string | null;
  country: string | null;
  error?: string;
}

/**
 * Basic phone number validation and E.164 normalization
 * Supports common international formats
 */
export function validateAndNormalizePhone(
  phoneInput: string,
  countryCode: string,
): PhoneValidationResult {
  try {
    // Remove all non-digit characters except +
    const cleaned = phoneInput.replace(/[^\d+]/g, "");

    // Check if already in E.164 format (starts with +)
    if (cleaned.startsWith("+")) {
      // Basic validation: must have at least 8 digits after +
      const digits = cleaned.substring(1);
      if (digits.length >= 8 && digits.length <= 15) {
        return {
          isValid: true,
          e164: cleaned,
          country: countryCode,
        };
      }
      return {
        isValid: false,
        e164: null,
        country: null,
        error: "Phone number must have 8-15 digits",
      };
    }

    // If no + prefix, prepend the country code
    const digitsOnly = cleaned.replace(/^\+/, "");

    // Basic validation: must have at least 8 digits
    if (digitsOnly.length < 8 || digitsOnly.length > 15) {
      return {
        isValid: false,
        e164: null,
        country: null,
        error: "Phone number must have 8-15 digits",
      };
    }

    // Construct E.164 format
    const e164 = `${countryCode}${digitsOnly}`;

    return {
      isValid: true,
      e164,
      country: countryCode,
    };
  } catch (_error) {
    return {
      isValid: false,
      e164: null,
      country: null,
      error: "Invalid phone number format",
    };
  }
}

/**
 * Format phone number for display
 */
export function formatPhoneForDisplay(e164: string): string {
  if (!e164.startsWith("+")) {
    return e164;
  }

  // Basic formatting: +XX XXX XXX XXX
  const digits = e164.substring(1);

  if (digits.length <= 3) {
    return e164;
  }

  // Split into groups
  const countryCode = digits.substring(0, 2);
  const remaining = digits.substring(2);

  // Group remaining digits in chunks of 3
  const groups: string[] = [];
  for (let i = 0; i < remaining.length; i += 3) {
    groups.push(remaining.substring(i, i + 3));
  }

  return `+${countryCode} ${groups.join(" ")}`;
}
