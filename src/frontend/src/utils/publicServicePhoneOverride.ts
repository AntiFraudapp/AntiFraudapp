// Isolated utility module for public-service phone override
// Detects public-service phone entities using multilingual keywords and emergency number patterns
// Returns explicit override decision with localized explanation for LOW risk (0%) classification

export interface PublicServiceOverrideResult {
  isOverride: boolean;
  override: boolean; // alias for backward compatibility
  explanation: string;
  isPublicService: boolean;
  entityName?: string;
}

// Emergency numbers that always get GREEN classification
const EMERGENCY_NUMBERS = [
  "112",
  "115",
  "117",
  "118",
  "119",
  "190",
  "192",
  "193",
  "199",
  "1415",
  "1414",
];

// Public service keywords (multilingual)
const PUBLIC_SERVICE_KEYWORDS = [
  // Portuguese
  "psp",
  "gnr",
  "bombeiros",
  "hospital",
  "urgência",
  "urgencia",
  "polícia",
  "policia",
  "segurança social",
  "seguranca social",
  "câmara municipal",
  "camara municipal",
  "junta de freguesia",
  "serviço nacional de saúde",
  "sns",
  "inem",
  "cruz vermelha",
  "proteção civil",
  "protecao civil",
  "autoridade tributária",
  "finanças",
  "financas",
  "tribunal",
  "ministério",
  "ministerio",
  "governo",
  "república",
  "republica",
  "assembleia",
  // Spanish
  "bomberos",
  "emergencias",
  // English
  "police",
  "fire brigade",
  "ambulance",
  "emergency services",
  "government",
  "municipality",
  "council",
  // French
  "pompiers",
  "urgences",
];

// Known Portuguese public service number prefixes
const PUBLIC_SERVICE_PREFIXES_PT = [
  "+351800", // Free lines (many public services)
  "+351808", // Shared cost (many public services)
  "+351217", // Lisbon area government
  "+351218", // Lisbon area government
  "+351219", // Lisbon area government
  "+351220", // Porto area government
  "+351221", // Porto area government
  "+351222", // Porto area government
];

export function isPublicServicePhone(
  phone: string,
  entityName?: string,
): PublicServiceOverrideResult {
  const normalized = phone.replace(/\s/g, "").replace(/-/g, "");
  const localNumber = normalized.replace(/^\+\d{1,3}/, "");

  // Check emergency numbers
  for (const emergency of EMERGENCY_NUMBERS) {
    const cleanEmergency = emergency.replace(/\s/g, "");
    if (
      localNumber === cleanEmergency ||
      normalized === cleanEmergency ||
      normalized.endsWith(cleanEmergency)
    ) {
      return {
        isOverride: true,
        override: true,
        explanation:
          "Número de emergência/serviço público — classificado como VERDE (baixo risco)",
        isPublicService: true,
        entityName: entityName || "Serviço de Emergência",
      };
    }
  }

  // Check public service prefixes
  for (const prefix of PUBLIC_SERVICE_PREFIXES_PT) {
    if (normalized.startsWith(prefix)) {
      return {
        isOverride: true,
        override: true,
        explanation:
          "Prefixo de serviço público português — classificado como VERDE (baixo risco)",
        isPublicService: true,
        entityName: entityName || "Serviço Público PT",
      };
    }
  }

  // Check entity name for public service keywords
  if (entityName) {
    const lowerEntity = entityName.toLowerCase();
    for (const keyword of PUBLIC_SERVICE_KEYWORDS) {
      if (lowerEntity.includes(keyword)) {
        return {
          isOverride: true,
          override: true,
          explanation: `Entidade pública identificada (${entityName}) — classificado como VERDE (baixo risco)`,
          isPublicService: true,
          entityName,
        };
      }
    }
  }

  return {
    isOverride: false,
    override: false,
    explanation: "",
    isPublicService: false,
  };
}

/**
 * Legacy alias for backward compatibility with AdvancedContactLookup.tsx
 */
export function detectPublicServicePhoneOverride(
  phoneNumber: string,
  displayName?: string,
  summary?: string,
  category?: string,
): PublicServiceOverrideResult {
  const entityName = displayName || summary || category;
  return isPublicServicePhone(phoneNumber, entityName);
}
