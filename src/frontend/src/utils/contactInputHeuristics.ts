// Frontend-only contact input heuristics for phone/email detection and validation
// Provides basic format checks and normalization for Advanced Contact Lookup

export type ContactType = "phone" | "email" | "unknown";

export interface ContactValidation {
  type: ContactType;
  isValid: boolean;
  normalized: string;
  normalizedValue: string; // Alias for compatibility
  error?: string;
}

// Basic email regex pattern
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number patterns (international formats)
const PHONE_PATTERN = /^[\d\s\+\-\(\)]+$/;

/**
 * Detect whether input is phone or email based on format
 */
export function detectContactType(input: string): ContactType {
  const trimmed = input.trim();

  if (!trimmed) return "unknown";

  // Check for @ symbol (email indicator)
  if (trimmed.includes("@")) {
    return "email";
  }

  // Check if it looks like a phone number (digits, spaces, +, -, parentheses)
  if (PHONE_PATTERN.test(trimmed)) {
    return "phone";
  }

  return "unknown";
}

/**
 * Normalize phone number by removing spaces, dashes, parentheses
 */
export function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-\(\)]/g, "");
}

/**
 * Normalize email by trimming and lowercasing
 */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Normalize contact input based on detected type
 */
export function normalizeContactInput(
  input: string,
  type: ContactType,
): string {
  if (type === "phone") {
    return normalizePhone(input);
  }
  if (type === "email") {
    return normalizeEmail(input);
  }
  return input.trim();
}

/**
 * Validate and normalize contact input
 */
export function validateContact(
  input: string,
  language = "pt",
): ContactValidation {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      type: "unknown",
      isValid: false,
      normalized: "",
      normalizedValue: "",
      error: getErrorMessage("empty", language),
    };
  }

  const type = detectContactType(trimmed);

  if (type === "email") {
    const normalized = normalizeEmail(trimmed);
    const isValid = EMAIL_PATTERN.test(normalized);

    return {
      type: "email",
      isValid,
      normalized,
      normalizedValue: normalized,
      error: isValid ? undefined : getErrorMessage("invalidEmail", language),
    };
  }

  if (type === "phone") {
    const normalized = normalizePhone(trimmed);
    const isValid = normalized.length >= 7 && normalized.length <= 20;

    return {
      type: "phone",
      isValid,
      normalized,
      normalizedValue: normalized,
      error: isValid ? undefined : getErrorMessage("invalidPhone", language),
    };
  }

  return {
    type: "unknown",
    isValid: false,
    normalized: trimmed,
    normalizedValue: trimmed,
    error: getErrorMessage("unknownFormat", language),
  };
}

/**
 * Analyze contact input - wrapper for validateContact with compatible interface
 */
export function analyzeContactInput(
  input: string,
  language = "pt",
): ContactValidation {
  return validateContact(input, language);
}

function getErrorMessage(errorType: string, language: string): string {
  const messages: Record<string, Record<string, string>> = {
    empty: {
      pt: "Por favor, insira um número de telefone ou email.",
      en: "Please enter a phone number or email.",
      es: "Por favor, ingrese un número de teléfono o correo electrónico.",
      fr: "Veuillez saisir un numéro de téléphone ou un e-mail.",
      zh: "请输入电话号码或电子邮件。",
      ar: "الرجاء إدخال رقم هاتف أو بريد إلكتروني.",
      ru: "Пожалуйста, введите номер телефона или адрес электронной почты.",
    },
    invalidEmail: {
      pt: "Formato de email inválido.",
      en: "Invalid email format.",
      es: "Formato de correo electrónico inválido.",
      fr: "Format d'e-mail invalide.",
      zh: "电子邮件格式无效。",
      ar: "تنسيق البريد الإلكتروني غير صالح.",
      ru: "Неверный формат электронной почты.",
    },
    invalidPhone: {
      pt: "Formato de telefone inválido.",
      en: "Invalid phone format.",
      es: "Formato de teléfono inválido.",
      fr: "Format de téléphone invalide.",
      zh: "电话格式无效。",
      ar: "تنسيق الهاتف غير صالح.",
      ru: "Неверный формат телефона.",
    },
    unknownFormat: {
      pt: "Formato não reconhecido. Insira um email ou telefone válido.",
      en: "Format not recognized. Enter a valid email or phone.",
      es: "Formato no reconocido. Ingrese un correo electrónico o teléfono válido.",
      fr: "Format non reconnu. Entrez un e-mail ou un téléphone valide.",
      zh: "格式无法识别。输入有效的电子邮件或电话。",
      ar: "التنسيق غير معروف. أدخل بريدًا إلكترونيًا أو هاتفًا صالحًا.",
      ru: "Формат не распознан. Введите действительный адрес электронной почты или телефон.",
    },
  };

  return (
    messages[errorType]?.[language] ||
    messages[errorType]?.en ||
    "Invalid input"
  );
}
