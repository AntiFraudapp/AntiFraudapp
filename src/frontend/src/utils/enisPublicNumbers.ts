/**
 * ENIS/EC NPL — European Numbering and Identification Service / National Public Lines
 * Base de dados interna de números públicos oficiais globais.
 * Todos os números aqui listados têm risco 0% e nunca devem ser classificados como fraude.
 */

export interface PublicNumberEntry {
  number: string;
  country: string;
  countryCode: string;
  type:
    | "Emergência"
    | "Saúde"
    | "Polícia"
    | "Bombeiros"
    | "Informação"
    | "Apoio Social"
    | "Governo"
    | "Proteção Civil";
  service: string;
  description: string;
  coverage: string;
  risk: 0;
  source: "ENIS/EC NPL" | "Serviços Públicos PT" | "Serviços Públicos EU";
}

const PUBLIC_NUMBERS_DB: PublicNumberEntry[] = [
  // === EMERGÊNCIA EUROPEIA ===
  {
    number: "112",
    country: "União Europeia",
    countryCode: "EU",
    type: "Emergência",
    service: "Polícia, Ambulância e Bombeiros",
    description:
      "Número de emergência único europeu. Disponível em todos os países da UE, gratuito, 24 horas.",
    coverage: "União Europeia",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  // === PORTUGAL ===
  {
    number: "115",
    country: "Portugal",
    countryCode: "PT",
    type: "Apoio Social",
    service: "Linha de Apoio a Sem-Abrigo",
    description:
      "Linha de apoio social para situações de sem-abrigo em Portugal. Operada pela Segurança Social.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "116",
    country: "União Europeia",
    countryCode: "EU",
    type: "Saúde",
    service: "Serviços Harmonizados de Assistência",
    description:
      "Série de números harmonizados europeus para serviços de interesse social.",
    coverage: "União Europeia",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "116000",
    country: "União Europeia",
    countryCode: "EU",
    type: "Apoio Social",
    service: "Hotline Crianças Desaparecidas",
    description:
      "Linha europeia dedicada a denúncias e apoio em casos de crianças desaparecidas. Gratuita e disponível 24h.",
    coverage: "União Europeia",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "116123",
    country: "União Europeia",
    countryCode: "EU",
    type: "Apoio Social",
    service: "Linha de Apoio Emocional",
    description:
      "Linha de apoio emocional e prevenção do suicídio. Serviço harmonizado europeu, gratuito.",
    coverage: "União Europeia",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "117",
    country: "Portugal",
    countryCode: "PT",
    type: "Polícia",
    service: "PSP — Polícia de Segurança Pública",
    description:
      "Linha direta da PSP (Polícia de Segurança Pública) em Portugal.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "118",
    country: "Portugal",
    countryCode: "PT",
    type: "Informação",
    service: "Serviços de Informações Gerais",
    description:
      "Serviço de informações gerais (listas telefónicas) em Portugal. Operado por operadoras licenciadas.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "119",
    country: "Portugal",
    countryCode: "PT",
    type: "Saúde",
    service: "SNS 24 — Linha de Saúde",
    description:
      "Linha de apoio clínico do Serviço Nacional de Saúde (SNS). Disponível 24 horas, gratuita.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "1414",
    country: "Portugal",
    countryCode: "PT",
    type: "Saúde",
    service: "Linha Saúde 24",
    description:
      "Linha de saúde do SNS disponível 24 horas para orientação clínica em Portugal.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "1415",
    country: "Portugal",
    countryCode: "PT",
    type: "Apoio Social",
    service: "Linha Apoio à Vítima",
    description:
      "Linha de apoio a vítimas de violência doméstica e crime em Portugal.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "808242424",
    country: "Portugal",
    countryCode: "PT",
    type: "Saúde",
    service: "SNS 24",
    description:
      "Linha de apoio clínico SNS 24. Número alternativo de custo partilhado.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "80020208",
    country: "Portugal",
    countryCode: "PT",
    type: "Governo",
    service: "Linha Segura",
    description:
      "Linha segura para denúncia de conteúdos ilegais na internet. Operada pelo Ministério da Educação.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  {
    number: "14",
    country: "Portugal",
    countryCode: "PT",
    type: "Apoio Social",
    service: "Cruz Vermelha Portuguesa",
    description: "Linha de apoio da Cruz Vermelha Portuguesa.",
    coverage: "Portugal",
    risk: 0,
    source: "Serviços Públicos PT",
  },
  // === BRASIL ===
  {
    number: "190",
    country: "Brasil",
    countryCode: "BR",
    type: "Polícia",
    service: "Polícia Militar",
    description: "Número de emergência da Polícia Militar no Brasil.",
    coverage: "Brasil",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "192",
    country: "Brasil",
    countryCode: "BR",
    type: "Saúde",
    service: "SAMU — Serviço de Atendimento Móvel de Urgência",
    description:
      "SAMU — Serviço de Atendimento Móvel de Urgência. Emergências médicas no Brasil.",
    coverage: "Brasil",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "193",
    country: "Brasil",
    countryCode: "BR",
    type: "Bombeiros",
    service: "Corpo de Bombeiros",
    description: "Número de emergência do Corpo de Bombeiros no Brasil.",
    coverage: "Brasil",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "199",
    country: "Brasil",
    countryCode: "BR",
    type: "Proteção Civil",
    service: "Defesa Civil",
    description:
      "Número da Defesa Civil brasileira para emergências de proteção civil.",
    coverage: "Brasil",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "113",
    country: "Brasil / Itália",
    countryCode: "BR/IT",
    type: "Polícia",
    service: "Polícia / Carabinieri",
    description:
      "No Brasil: Polícia Federal. Na Itália: Carabinieri (Polícia Nacional).",
    coverage: "Brasil, Itália",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "18",
    country: "Brasil / França",
    countryCode: "BR/FR",
    type: "Bombeiros",
    service: "Bombeiros",
    description:
      "No Brasil: Corpo de Bombeiros. Em França: Sapeurs-Pompiers (Bombeiros).",
    coverage: "Brasil, França",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === EUA / CANADÁ ===
  {
    number: "911",
    country: "EUA / Canadá",
    countryCode: "US/CA",
    type: "Emergência",
    service: "Polícia, Ambulância e Bombeiros",
    description:
      "Número de emergência dos EUA e Canadá para polícia, ambulância e bombeiros.",
    coverage: "Estados Unidos, Canadá",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === REINO UNIDO ===
  {
    number: "999",
    country: "Reino Unido",
    countryCode: "GB",
    type: "Emergência",
    service: "Polícia, Ambulância e Bombeiros",
    description:
      "Número de emergência do Reino Unido para polícia, ambulância e bombeiros.",
    coverage: "Reino Unido",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "101",
    country: "Reino Unido",
    countryCode: "GB",
    type: "Polícia",
    service: "Linha de Polícia Não Urgente",
    description:
      "Linha de contacto com a polícia para situações não urgentes no Reino Unido.",
    coverage: "Reino Unido",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "111",
    country: "Reino Unido / Nova Zelândia",
    countryCode: "GB/NZ",
    type: "Saúde",
    service: "NHS 111 / Emergência NZ",
    description:
      "No Reino Unido: NHS 111 para aconselhamento médico urgente. Na Nova Zelândia: emergência geral.",
    coverage: "Reino Unido, Nova Zelândia",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === ALEMANHA / JAPÃO / CHINA ===
  {
    number: "110",
    country: "Alemanha / Japão / China",
    countryCode: "DE/JP/CN",
    type: "Polícia",
    service: "Polícia",
    description: "Número de emergência da polícia na Alemanha, Japão e China.",
    coverage: "Alemanha, Japão, China e outros",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  // === ÍNDIA ===
  {
    number: "108",
    country: "Índia",
    countryCode: "IN",
    type: "Saúde",
    service: "Ambulância",
    description: "Serviço de ambulância de emergência na Índia.",
    coverage: "Índia",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === ISRAEL / TURQUIA ===
  {
    number: "100",
    country: "Israel / Turquia",
    countryCode: "IL/TR",
    type: "Polícia",
    service: "Polícia",
    description: "Número de emergência da polícia em Israel e Turquia.",
    coverage: "Israel, Turquia",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === ITÁLIA ===
  {
    number: "105",
    country: "Itália",
    countryCode: "IT",
    type: "Proteção Civil",
    service: "Proteção Civil",
    description: "Número de emergência da Proteção Civil italiana.",
    coverage: "Itália",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "118",
    country: "Itália",
    countryCode: "IT",
    type: "Saúde",
    service: "Emergência Médica",
    description:
      "Número de emergência médica na Itália (SUES — Servizio di Urgenza ed Emergenza Sanitaria).",
    coverage: "Itália",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  // === ÁUSTRIA ===
  {
    number: "122",
    country: "Áustria",
    countryCode: "AT",
    type: "Bombeiros",
    service: "Bombeiros",
    description: "Número de emergência dos bombeiros na Áustria.",
    coverage: "Áustria",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "133",
    country: "Áustria",
    countryCode: "AT",
    type: "Polícia",
    service: "Polícia Federal",
    description: "Número de emergência da Polícia Federal austríaca.",
    coverage: "Áustria",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "144",
    country: "Áustria",
    countryCode: "AT",
    type: "Saúde",
    service: "Emergência Médica",
    description: "Número de emergência médica na Áustria (Rettung).",
    coverage: "Áustria",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  // === FRANÇA ===
  {
    number: "15",
    country: "França",
    countryCode: "FR",
    type: "Saúde",
    service: "SAMU",
    description:
      "SAMU — Service d'Aide Médicale Urgente. Emergência médica em França.",
    coverage: "França",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  {
    number: "17",
    country: "França",
    countryCode: "FR",
    type: "Polícia",
    service: "Police Nationale",
    description: "Número de emergência da polícia francesa.",
    coverage: "França",
    risk: 0,
    source: "ENIS/EC NPL",
  },
  // === AUSTRÁLIA ===
  {
    number: "000",
    country: "Austrália",
    countryCode: "AU",
    type: "Emergência",
    service: "Polícia, Ambulância e Bombeiros",
    description:
      "Número de emergência da Austrália para polícia, ambulância e bombeiros.",
    coverage: "Austrália",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === CHINA ===
  {
    number: "120",
    country: "China",
    countryCode: "CN",
    type: "Saúde",
    service: "Ambulância",
    description: "Número de ambulância e emergência médica na China.",
    coverage: "China",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === ANGOLA ===
  {
    number: "002",
    country: "Angola",
    countryCode: "AO",
    type: "Emergência",
    service: "Emergência Geral",
    description: "Número de emergência geral em Angola.",
    coverage: "Angola",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "1515",
    country: "Angola",
    countryCode: "AO",
    type: "Emergência",
    service: "Emergência Nacional",
    description: "Número de emergência nacional em Angola.",
    coverage: "Angola",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  // === IRLANDA ===
  {
    number: "1800",
    country: "Irlanda",
    countryCode: "IE",
    type: "Informação",
    service: "Linha Gratuita",
    description:
      "Prefixo de linhas gratuitas de apoio e informação na Irlanda.",
    coverage: "Irlanda",
    risk: 0,
    source: "Serviços Públicos EU",
  },
  {
    number: "1850",
    country: "Irlanda",
    countryCode: "IE",
    type: "Informação",
    service: "Linha de Apoio",
    description:
      "Prefixo de linhas de custo partilhado de apoio e informação na Irlanda.",
    coverage: "Irlanda",
    risk: 0,
    source: "Serviços Públicos EU",
  },
];

/**
 * Normalize a phone number for lookup (remove spaces, dashes, dots, parentheses)
 */
function normalizeForLookup(phone: string): string {
  return phone.replace(/[\s\-().+]/g, "").toLowerCase();
}

/**
 * Get public number info from the ENIS/EC NPL database.
 * Accepts numbers with or without country code prefix.
 * Returns the first match (Portugal-biased for shared numbers like 118).
 */
export function getPublicNumberInfo(phone: string): PublicNumberEntry | null {
  if (!phone) return null;
  const normalized = normalizeForLookup(phone);
  // Try exact match first
  const exact = PUBLIC_NUMBERS_DB.find(
    (entry) => normalizeForLookup(entry.number) === normalized,
  );
  if (exact) return exact;
  // Try stripping common country codes
  const strippedPT = normalized.startsWith("351")
    ? normalized.slice(3)
    : normalized;
  const strippedIntl = normalized.startsWith("00")
    ? normalized.slice(2)
    : normalized;
  return (
    PUBLIC_NUMBERS_DB.find(
      (entry) =>
        normalizeForLookup(entry.number) === strippedPT ||
        normalizeForLookup(entry.number) === strippedIntl,
    ) ?? null
  );
}

/**
 * Returns true if the number is a known official public number.
 */
export function isPublicNumber(phone: string): boolean {
  return getPublicNumberInfo(phone) !== null;
}

export default PUBLIC_NUMBERS_DB;
