/**
 * High-risk and medium-risk phrase patterns for fraud detection.
 * All phrases are stored in normalized (lowercase, accent-stripped) form.
 * Family scam phrases trigger a minimum of 53 points.
 * UPDATED v2.2: Payment pattern detection (Entidade+Referência+Montante → 81-93%)
 */

export interface PhrasePattern {
  phrase: string; // normalized (lowercase, no accents)
  originalPhrase: string; // display form
  minScore: number;
  category: string;
  explanation?: string;
}

// Family scam phrases - minimum 53 points each
export const FAMILY_SCAM_PHRASES: PhrasePattern[] = [
  {
    phrase: "ola pai",
    originalPhrase: "Olá Pai",
    minScore: 53,
    category: "family_scam",
    explanation:
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.",
  },
  {
    phrase: "ola mae",
    originalPhrase: "Olá Mãe",
    minScore: 53,
    category: "family_scam",
    explanation:
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.",
  },
  {
    phrase: "oi pai",
    originalPhrase: "Oi pai",
    minScore: 53,
    category: "family_scam",
    explanation:
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.",
  },
  {
    phrase: "oi mae",
    originalPhrase: "Oi mãe",
    minScore: 53,
    category: "family_scam",
    explanation:
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.",
  },
  {
    phrase: "fiquei sem dinheiro",
    originalPhrase: "fiquei sem dinheiro",
    minScore: 53,
    category: "family_scam",
    explanation:
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.",
  },
];

// Financial/payment high-risk phrases - minimum 53 points each
export const FINANCIAL_HIGH_RISK_PHRASES: PhrasePattern[] = [
  {
    phrase: "transfere",
    originalPhrase: "transfere",
    minScore: 53,
    category: "financial_scam",
    explanation:
      "Pedido de transferência imediata é padrão comum em burlas financeiras.",
  },
  {
    phrase: "mbway",
    originalPhrase: "MBWay",
    minScore: 53,
    category: "financial_scam",
    explanation:
      "Pedido de pagamento via MBWay é frequentemente usado em burlas.",
  },
  {
    phrase: "pix",
    originalPhrase: "Pix",
    minScore: 53,
    category: "financial_scam",
    explanation:
      "Pedido de pagamento via Pix é frequentemente usado em burlas.",
  },
];

/**
 * HIGH-RISK PAYMENT PATTERN KEYWORDS (v2.2)
 * Individual keyword weights for payment fraud patterns.
 * Dívida → >56%, Montante → >55%, Regularizar → >62%, Referência → >51%, Entidade → >52%
 */
export interface PaymentKeyword {
  normalized: string;
  originalForm: string;
  minScore: number;
}

export const PAYMENT_RISK_KEYWORDS: PaymentKeyword[] = [
  { normalized: "divida", originalForm: "Dívida", minScore: 57 },
  { normalized: "dividas", originalForm: "Dívidas", minScore: 57 },
  {
    normalized: "valor em divida",
    originalForm: "valor em dívida",
    minScore: 62,
  },
  { normalized: "montante", originalForm: "Montante", minScore: 56 },
  { normalized: "regularizar", originalForm: "Regularizar", minScore: 63 },
  { normalized: "regularize", originalForm: "Regularize", minScore: 63 },
  { normalized: "regularizacao", originalForm: "Regularização", minScore: 63 },
  { normalized: "referencia", originalForm: "Referência", minScore: 52 },
  { normalized: "entidade", originalForm: "Entidade", minScore: 53 },
  {
    normalized: "valor em aberto",
    originalForm: "valor em aberto",
    minScore: 60,
  },
  {
    normalized: "debito pendente",
    originalForm: "débito pendente",
    minScore: 62,
  },
  { normalized: "cobranca", originalForm: "Cobrança", minScore: 55 },
  { normalized: "prazo", originalForm: "Prazo", minScore: 35 },
  {
    normalized: "dias para regularizar",
    originalForm: "dias para regularizar",
    minScore: 70,
  },
  { normalized: "urgencia", originalForm: "Urgência", minScore: 55 },
  { normalized: "euros", originalForm: "EUR", minScore: 30 },
  { normalized: "eur", originalForm: "EUR", minScore: 30 },
];

/**
 * Detect payment fraud pattern: if message contains any 2 of the 3 critical keywords
 * (entidade, referencia, montante), escalate to 81-93%.
 * If all 3 are present, score is 90.
 */
export function detectPaymentFraudPattern(normalizedText: string): {
  detected: boolean;
  score: number;
  matchedKeywords: string[];
} {
  const criticalThree = [
    { key: "entidade", label: "Entidade" },
    { key: "referencia", label: "Referência" },
    { key: "montante", label: "Montante" },
  ];

  const matched = criticalThree.filter((k) => normalizedText.includes(k.key));

  // Also check for "valor em divida" or "regularizar" + "prazo" pattern
  const hasDivida =
    normalizedText.includes("divida") || normalizedText.includes("em divida");
  const hasRegularizar =
    normalizedText.includes("regularizar") ||
    normalizedText.includes("regularize");
  const hasPrazo =
    normalizedText.includes("prazo") || normalizedText.includes("dias para");
  const hasEur =
    normalizedText.includes(" eur") ||
    normalizedText.includes("euros") ||
    /\d+[,.]\d+/.test(normalizedText);

  const paymentPatternScore =
    hasDivida && hasRegularizar
      ? 85
      : hasDivida && hasEur
        ? 75
        : hasRegularizar && hasPrazo
          ? 82
          : 0;

  if (matched.length === 3) {
    return {
      detected: true,
      score: 90,
      matchedKeywords: matched.map((m) => m.label),
    };
  }
  if (matched.length === 2) {
    return {
      detected: true,
      score: 83,
      matchedKeywords: matched.map((m) => m.label),
    };
  }
  if (paymentPatternScore > 0) {
    return {
      detected: true,
      score: paymentPatternScore,
      matchedKeywords: [
        hasDivida ? "Dívida" : "",
        hasRegularizar ? "Regularizar" : "",
        hasPrazo ? "Prazo" : "",
        hasEur ? "Valor monetário" : "",
      ].filter(Boolean),
    };
  }

  return { detected: false, score: 0, matchedKeywords: [] };
}

/**
 * Score individual payment keywords.
 * Returns the highest single keyword score found.
 */
export function scorePaymentKeywords(normalizedText: string): {
  score: number;
  matched: string[];
} {
  let score = 0;
  const matched: string[] = [];
  for (const kw of PAYMENT_RISK_KEYWORDS) {
    if (normalizedText.includes(kw.normalized)) {
      matched.push(kw.originalForm);
      score = Math.max(score, kw.minScore);
    }
  }
  return { score, matched };
}

// All high-risk phrases combined
export const ALL_HIGH_RISK_PHRASES: PhrasePattern[] = [
  ...FAMILY_SCAM_PHRASES,
  ...FINANCIAL_HIGH_RISK_PHRASES,
];

// Legacy keyword arrays for backward compatibility
export const HIGH_RISK_KEYWORDS: string[] = [
  "urgente",
  "ultimo aviso",
  "acao imediata",
  "transferencia",
  "cash",
  "cartao oferta",
  "coupon",
  "premio",
  "lucrativo",
  "garantido",
  "risco",
  "recompensa",
  "critico",
  "conta bloqueada",
  "chave privada",
  "seed phrase",
  "palavra-passe",
  "password",
  "codigo de verificacao",
  "otp",
  "clique aqui",
  "link",
  "acesse agora",
  "confirme seus dados",
  "dados bancarios",
  "numero do cartao",
  "cvv",
  "pin",
  "codigo secreto",
  "ganhou",
  "parabens",
  "selecionado",
  "escolhido",
  "exclusivo",
  "oferta especial",
  "gratis",
  "free",
  "bonus",
  "desconto",
  "promocao",
  "investimento",
  "rendimento",
  "lucro",
  "retorno garantido",
  "bitcoin",
  "ethereum",
  "crypto",
  "nft",
  "wallet",
  "carteira digital",
  "saque",
  "deposito",
  "conta corrente",
  "agencia",
  "banco",
  "cpf",
  "rg",
  "identidade",
  "passaporte",
  "selfie",
  "foto",
  "documento",
  "comprovante",
  "fatura",
  "boleto",
  "pagar",
  "pagamento",
  "divida",
  "cobranca",
  "multa",
  "imposto",
  "receita federal",
  "policia",
  "tribunal",
  "processo",
  "advogado",
  "heranca",
  "testamento",
  "faleceu",
  "morreu",
  "acidente",
  "hospital",
  "emergencia",
  "socorro",
  "ajuda",
  "preciso de voce",
  "nao conte",
  "segredo",
  "confidencial",
  "sigiloso",
];

export const HIGH_RISK_KEYWORDS_ADDITIONAL: string[] = [
  "transfere",
  "mbway",
  "pix",
  "fiquei sem dinheiro",
  "ola pai",
  "ola mae",
  "oi pai",
  "oi mae",
];

export const MEDIUM_RISK_KEYWORDS: string[] = [
  "amigo",
  "friend",
  "dinheiro",
  "money",
  "preciso",
  "need",
  "ajuda",
  "help",
  "problema",
  "problem",
  "novo numero",
  "new number",
  "novo telemovel",
  "new phone",
  "perdi",
  "lost",
  "roubaram",
  "stolen",
  "quebrou",
  "broken",
];

/**
 * Detect family scam phrases in normalized text.
 * Returns matched phrases with their details.
 */
export function detectFamilyScamPhrases(
  normalizedText: string,
): PhrasePattern[] {
  return FAMILY_SCAM_PHRASES.filter((p) => normalizedText.includes(p.phrase));
}

/**
 * Detect financial high-risk phrases in normalized text.
 */
export function detectFinancialHighRiskPhrases(
  normalizedText: string,
): PhrasePattern[] {
  return FINANCIAL_HIGH_RISK_PHRASES.filter((p) =>
    normalizedText.includes(p.phrase),
  );
}

/**
 * Detect all high-risk phrases in normalized text.
 */
export function detectAllHighRiskPhrases(
  normalizedText: string,
): PhrasePattern[] {
  return ALL_HIGH_RISK_PHRASES.filter((p) => normalizedText.includes(p.phrase));
}

/**
 * Detect medium-risk keywords in normalized text.
 */
export function detectMediumRiskKeywords(normalizedText: string): string[] {
  return MEDIUM_RISK_KEYWORDS.filter((kw) => normalizedText.includes(kw));
}
