/**
 * Message heuristics analysis for SMS/WhatsApp fraud detection.
 * Returns all 8 required schema fields with risk_score capped at 99.
 * Never returns '100% seguro' or 'instalar app' language.
 * Detects family scam phrases with minimum 53-point scoring.
 * UPDATED v2.2: Payment pattern detection (Entidade+Referência+Montante → 81-93%)
 */

import { normalizeForMatching } from "./antifraudTextNormalize";
import {
  HIGH_RISK_KEYWORDS,
  detectFamilyScamPhrases,
  detectFinancialHighRiskPhrases,
  detectMediumRiskKeywords,
  detectPaymentFraudPattern,
  scorePaymentKeywords,
} from "./highRiskPhrases";

export interface MessageAnalysisResult {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_score: number; // 0-99, never 100
  status: "GREEN" | "YELLOW" | "RED";
  visual_text: string;
  explanation: string; // exactly 2 sentences in Portuguese
  recommendation: string;
  report_invite: string; // always 'Reportar à comunidade?'
  // Legacy fields for backward compatibility
  riskLevel?: string;
  riskScore?: number;
  details?: string;
}

const GREEN_PRECAUTION =
  "Nenhum risco conhecido encontrado. Se não reconhecer:\n• Verifique por canal oficial\n• Não forneça dados pessoais\n• Em dúvida: PSP 112";

function getRiskLevel(score: number): "LOW" | "MEDIUM" | "HIGH" {
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function getStatus(score: number): "GREEN" | "YELLOW" | "RED" {
  if (score >= 65) return "RED";
  if (score >= 35) return "YELLOW";
  return "GREEN";
}

function getVisualText(score: number, status: string): string {
  if (status === "RED") return `🚨 Alto Risco (${score}/99)`;
  if (status === "YELLOW") return `⚠️ Risco Médio (${score}/99)`;
  return `✅ Baixo Risco (${score}/99)`;
}

export function analyzeMessage(text: string): MessageAnalysisResult {
  if (!text || text.trim().length === 0) {
    return {
      risk_level: "LOW",
      risk_score: 0,
      status: "GREEN",
      visual_text: "✅ Sem conteúdo para analisar",
      explanation:
        "Nenhum conteúdo foi fornecido para análise. Introduza uma mensagem SMS ou WhatsApp para verificar.",
      recommendation: GREEN_PRECAUTION,
      report_invite: "Reportar à comunidade?",
      riskLevel: "LOW",
      riskScore: 0,
    };
  }

  const normalized = normalizeForMatching(text);
  let score = 0;
  const detectedPatterns: string[] = [];
  let familyScamDetected = false;
  let familyScamExplanation = "";
  let paymentPatternDetected = false;
  let paymentPatternExplanation = "";

  // --- PAYMENT FRAUD PATTERN DETECTION (v2.2 critical check) ---
  // Entidade + Referência + Montante → 81-93%
  // Divida/Regularizar patterns → escalated score
  const paymentResult = detectPaymentFraudPattern(normalized);
  if (paymentResult.detected) {
    paymentPatternDetected = true;
    score = Math.max(score, paymentResult.score);
    detectedPatterns.push(...paymentResult.matchedKeywords);
    paymentPatternExplanation = `Padrão de cobrança fraudulenta detetado com as palavras-chave: ${paymentResult.matchedKeywords.join(", ")}. Este tipo de mensagem imita cobranças de entidades oficiais para induzir pagamentos indevidos.`;
  }

  // --- Individual payment keyword scoring ---
  const paymentKwResult = scorePaymentKeywords(normalized);
  if (paymentKwResult.score > 0) {
    // Take the higher of accumulated score or individual keyword score
    score = Math.max(score, paymentKwResult.score);
    for (const kw of paymentKwResult.matched) {
      if (!detectedPatterns.includes(kw)) detectedPatterns.push(kw);
    }
  }

  // --- Family scam phrase detection (minimum 53 points each) ---
  const familyMatches = detectFamilyScamPhrases(normalized);
  if (familyMatches.length > 0) {
    familyScamDetected = true;
    familyScamExplanation =
      familyMatches[0].explanation ||
      "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares.";
    // Ensure minimum 53 points
    score = Math.max(score, 53);
    for (const m of familyMatches) {
      detectedPatterns.push(m.originalPhrase);
      score = Math.max(score, m.minScore);
    }
  }

  // --- Financial high-risk phrase detection (minimum 53 points each) ---
  const financialMatches = detectFinancialHighRiskPhrases(normalized);
  if (financialMatches.length > 0) {
    for (const m of financialMatches) {
      detectedPatterns.push(m.originalPhrase);
      score = Math.max(score, m.minScore);
    }
    // Stack additional points for multiple financial triggers
    score += (financialMatches.length - 1) * 5;
  }

  // --- Legacy high-risk keyword detection ---
  let highRiskCount = 0;
  for (const kw of HIGH_RISK_KEYWORDS) {
    if (normalized.includes(normalizeForMatching(kw))) {
      highRiskCount++;
      detectedPatterns.push(kw);
    }
  }

  if (highRiskCount > 0) {
    score += Math.min(highRiskCount * 15, 45);
  }

  // --- Medium-risk keyword detection ---
  const mediumMatches = detectMediumRiskKeywords(normalized);
  if (mediumMatches.length > 0) {
    score += Math.min(mediumMatches.length * 5, 20);
  }

  // --- URL/link detection ---
  const urlPattern = /https?:\/\/|bit\.ly|tinyurl|t\.co|goo\.gl/i;
  if (urlPattern.test(text)) {
    score += 15;
    detectedPatterns.push("link suspeito");
  }

  // --- Urgency language detection ---
  const urgencyPatterns = [
    "agora",
    "imediatamente",
    "urgente",
    "hoje",
    "rapido",
    "depressa",
    "nao perca",
    "ultima chance",
    "expira",
    "prazo",
  ];
  const urgencyCount = urgencyPatterns.filter((p) =>
    normalized.includes(normalizeForMatching(p)),
  ).length;
  if (urgencyCount > 0) {
    score += Math.min(urgencyCount * 8, 24);
  }

  // --- Combination: family scam + financial request = escalate ---
  if (
    familyScamDetected &&
    (financialMatches.length > 0 ||
      normalized.includes("dinheiro") ||
      normalized.includes("transfere"))
  ) {
    score = Math.max(score, 65); // escalate to RED
  }

  // --- Cap at 99, never 100 ---
  score = Math.min(Math.round(score), 99);

  const risk_level = getRiskLevel(score);
  const status = getStatus(score);
  const visual_text = getVisualText(score, status);

  // --- Build explanation (exactly 2 sentences in Portuguese) ---
  let explanation: string;
  if (paymentPatternDetected) {
    explanation = paymentPatternExplanation;
  } else if (familyScamDetected) {
    explanation = `Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares. ${familyScamExplanation !== "Olá Pai/Mãe e aberturas similares são padrões conhecidos de burlas familiares." ? familyScamExplanation : "Esta mensagem apresenta características típicas de fraude familiar — nunca transfira dinheiro sem verificar a identidade por outro canal."}`;
  } else if (financialMatches.length > 0) {
    explanation =
      "Foram detetados pedidos de pagamento ou transferência que são padrões comuns em burlas. Nunca efetue pagamentos sem verificar a identidade do remetente por um canal oficial.";
  } else if (highRiskCount > 0) {
    explanation = `Foram detetadas ${highRiskCount} palavra(s) de alto risco associadas a fraudes conhecidas. Verifique a autenticidade da mensagem antes de tomar qualquer ação.`;
  } else if (score >= 35) {
    explanation =
      "Esta mensagem contém elementos que podem indicar tentativa de fraude ou engenharia social. Proceda com cautéla e verifique a identidade do remetente.";
  } else {
    explanation =
      "Nenhum padrão de risco elevado foi detetado nesta mensagem. Mantenha sempre precaução ao partilhar dados pessoais ou efetuar pagamentos.";
  }

  // --- Build recommendation ---
  let recommendation: string;
  if (status === "RED") {
    recommendation =
      "Não responda nem clique em links. Bloqueie o contacto e reporte às autoridades (PSP 112 ou GNR). Alerte familiares se suspeitar de burla familiar.";
  } else if (status === "YELLOW") {
    recommendation =
      "Verifique a identidade do remetente por um canal oficial antes de responder. Em caso de dúvida, contacte as autoridades (PSP 112).";
  } else {
    recommendation = GREEN_PRECAUTION;
  }

  return {
    risk_level,
    risk_score: score,
    status,
    visual_text,
    explanation,
    recommendation,
    report_invite: "Reportar à comunidade?",
    // Legacy fields
    riskLevel: risk_level,
    riskScore: score,
    details:
      detectedPatterns.length > 0
        ? `Padrões detetados: ${detectedPatterns.slice(0, 5).join(", ")}`
        : undefined,
  };
}

export default analyzeMessage;
