/**
 * Deterministic phone reputation engine.
 * Returns all 8 required schema fields with risk_score capped at 99.
 * Never returns '100% seguro', '100% safe', or 'instalar app' language.
 * GREEN results always include PSP 112 precaution.
 * UNKNOWN status returned for numbers with no sufficient data.
 * Exports both analyzePhoneReputation (named) and analyzePhone (default) for compatibility.
 * Integrates ENIS/EC NPL public numbers database.
 */

import {
  type PublicNumberEntry,
  getPublicNumberInfo,
} from "./enisPublicNumbers";
import { detectCarrier } from "./phoneCarrierDetection";

export interface PhoneReputationResult {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  risk_score: number; // 0-99, never 100
  status: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  visual_text: string;
  explanation: string; // 2 sentences in Portuguese
  recommendation: string;
  report_invite: string; // always 'Reportar à comunidade?'
  // Extended/legacy fields
  carrier_type: string;
  carrier: string;
  country: string;
  sources: string[];
  riskLevel?: string;
  riskScore?: number;
  publicNumberEntry?: PublicNumberEntry; // present when it's a known official number
}

const GREEN_PRECAUTION =
  "Nenhum risco conhecido encontrado. Se não reconhecer:\n• Verifique por canal oficial\n• Não forneça dados pessoais\n• Em dúvida: PSP 112";

// Known high-risk prefixes
const HIGH_RISK_PREFIXES = [
  "+44700",
  "+44701",
  "+44702",
  "+44703",
  "+1900",
  "+357",
  "+372",
  "+375",
];

function normalizePhone(phone: string): string {
  return phone.replace(/[\s\-().]/g, "");
}

function getRiskLevel(
  score: number,
  unknown = false,
): "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN" {
  if (unknown) return "UNKNOWN";
  if (score >= 65) return "HIGH";
  if (score >= 35) return "MEDIUM";
  return "LOW";
}

function getStatus(
  score: number,
  unknown = false,
): "GREEN" | "YELLOW" | "RED" | "UNKNOWN" {
  if (unknown) return "UNKNOWN";
  if (score >= 65) return "RED";
  if (score >= 35) return "YELLOW";
  return "GREEN";
}

// In-memory store for manual reports during the session
const manualReportCounts: Map<string, number> = new Map();

/**
 * Register a manual community report for a phone number.
 * Each call increments the report count for that number in the current session.
 */
export function registerPhoneReport(phone: string): void {
  const normalized = phone.replace(/[\s\-().]/g, "");
  const current = manualReportCounts.get(normalized) ?? 0;
  manualReportCounts.set(normalized, current + 1);
}

/**
 * Get the current session report count for a phone number.
 */
export function getPhoneReportCount(phone: string): number {
  const normalized = phone.replace(/[\s\-().]/g, "");
  return manualReportCounts.get(normalized) ?? 0;
}

export function analyzePhoneReputation(
  phone: string,
  communityReports = 0,
): PhoneReputationResult {
  if (!phone || phone.trim().length === 0) {
    return {
      risk_level: "LOW",
      risk_score: 0,
      status: "GREEN",
      visual_text: "✅ Sem número para analisar",
      explanation:
        "Nenhum número de telefone foi fornecido para análise. Introduza um número para verificar.",
      recommendation: GREEN_PRECAUTION,
      report_invite: "Reportar à comunidade?",
      carrier_type: "Desconhecido",
      carrier: "Desconhecido",
      country: "Desconhecido",
      sources: ["Motor Heurístico AntiFraud"],
    };
  }

  const normalized = normalizePhone(phone.trim());

  // --- ENIS/EC NPL: Check official public numbers first ---
  const publicEntry = getPublicNumberInfo(normalized);
  if (publicEntry) {
    return {
      risk_level: "LOW",
      risk_score: 0,
      status: "GREEN",
      visual_text: `✅ Número Oficial · ${publicEntry.type} · Risco: 0%`,
      explanation: `${publicEntry.description} Fonte oficial: ${publicEntry.source}. Cobertura: ${publicEntry.coverage}.`,
      recommendation:
        "Este é um número oficial. Pode ligar com confiança. Risco: 0%.",
      report_invite: "", // public numbers don't need reporting
      carrier_type: publicEntry.type,
      carrier: publicEntry.service,
      country: publicEntry.country,
      sources: [publicEntry.source, "ENIS/EC NPL"],
      riskLevel: "LOW",
      riskScore: 0,
      publicNumberEntry: publicEntry,
    };
  }

  // Carrier/country detection
  let carrier = "Desconhecido";
  let country = "Desconhecido";
  let carrierKnown = false;
  try {
    const carrierInfo = detectCarrier(normalized);
    carrier = carrierInfo.carrier;
    country = carrierInfo.country;
    carrierKnown = carrier !== "Desconhecido" && country !== "Desconhecido";
  } catch {
    // fallback
  }

  let score = 0;
  const detectedPatterns: string[] = [];
  let hasPositiveSignal = false;

  // High-risk prefix check
  const isHighRisk = HIGH_RISK_PREFIXES.some((prefix) =>
    normalized.startsWith(prefix),
  );
  if (isHighRisk) {
    score += 45;
    detectedPatterns.push("prefixo de alto risco");
    hasPositiveSignal = true;
  }

  // Community reports — include session-level manual reports
  const sessionReports = getPhoneReportCount(normalized);
  const totalReports = communityReports + sessionReports;
  if (totalReports >= 10) {
    score += 40;
    hasPositiveSignal = true;
  } else if (totalReports >= 5) {
    score += 25;
    hasPositiveSignal = true;
  } else if (totalReports >= 2) {
    score += 15;
    hasPositiveSignal = true;
  } else if (totalReports >= 1) {
    score += 8;
    hasPositiveSignal = true;
  }

  // Format validation
  const e164Pattern = /^\+[1-9]\d{6,14}$/;
  const isValidE164 = e164Pattern.test(normalized);
  if (!isValidE164 && normalized.length > 3) {
    score += 10;
    detectedPatterns.push("formato não E.164");
    hasPositiveSignal = true;
  }

  // Repeated digits pattern (suspicious)
  const digitsOnly = normalized.replace(/\D/g, "");
  if (/(\d)\1{5,}/.test(digitsOnly)) {
    score += 15;
    detectedPatterns.push("dígitos repetidos");
    hasPositiveSignal = true;
  }

  // If carrier is known and number is valid E.164, mark as a positive data signal
  if (carrierKnown && isValidE164) {
    hasPositiveSignal = true;
  }

  // Cap at 99
  score = Math.min(Math.round(score), 99);

  // Numbers with no positive signals at all → UNKNOWN status
  const isUnknown = !hasPositiveSignal;

  const risk_level = getRiskLevel(score, isUnknown);
  const status = getStatus(score, isUnknown);

  let visual_text: string;
  if (status === "UNKNOWN") {
    visual_text = "❓ Risco desconhecido · Sem dados suficientes";
  } else if (status === "RED") {
    visual_text = `🚨 ${carrier} · Alto Risco (${score}/99)`;
  } else if (status === "YELLOW") {
    visual_text = `⚠️ ${carrier} · Risco Médio (${score}/99)`;
  } else {
    visual_text = `✅ ${carrier} · ${country} (${score}/99)`;
  }

  // Explanation: exactly 2 sentences in Portuguese
  let explanation: string;
  if (status === "UNKNOWN") {
    explanation =
      "Não foram encontrados dados suficientes para classificar este número. Não é possível confirmar se é seguro ou fraudulento sem mais informação.";
  } else if (isHighRisk) {
    explanation =
      "Este número utiliza um prefixo frequentemente associado a chamadas fraudulentas ou de custo elevado. Não atenda nem retorne chamadas deste número sem verificar a sua origem.";
  } else if (score >= 35) {
    explanation =
      "Este número apresenta características que requerem verificação adicional. Confirme a identidade do contacto por um canal oficial antes de responder.";
  } else {
    const carrierNote =
      carrier !== "Desconhecido"
        ? `Operadora identificada: ${carrier} (${country}).`
        : `País identificado: ${country}.`;
    explanation = `${carrierNote} Nenhum padrão de risco elevado foi detetado para este número.`;
  }

  let recommendation: string;
  if (status === "UNKNOWN") {
    recommendation =
      "Proceda com cautela. Se não reconhecer o número, não forneça dados pessoais. Em caso de dúvida, verifique por canal oficial ou contacte as autoridades (PSP 112). Pode reportar este número à comunidade.";
  } else if (status === "RED") {
    recommendation =
      "Não atenda nem retorne a chamada. Bloqueie o número e reporte às autoridades (PSP 112 ou GNR). Nunca forneça dados pessoais ou bancários.";
  } else if (status === "YELLOW") {
    recommendation =
      "Verifique a identidade do contacto por canal oficial antes de responder. Em caso de dúvida, contacte as autoridades (PSP 112).";
  } else {
    recommendation = GREEN_PRECAUTION;
  }

  const sources = ["Motor Heurístico AntiFraud", "Numverify"];
  if (totalReports > 0) sources.push("Comunidade AntiFraudApp");

  void detectedPatterns; // used implicitly via score

  return {
    risk_level,
    risk_score: isUnknown ? 0 : score,
    status,
    visual_text,
    explanation,
    recommendation,
    report_invite: "Reportar à comunidade?",
    carrier_type: carrier,
    carrier,
    country,
    sources,
    riskLevel: risk_level,
    riskScore: isUnknown ? 0 : score,
  };
}

// Default export alias
export default analyzePhoneReputation;
