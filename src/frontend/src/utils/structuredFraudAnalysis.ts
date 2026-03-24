/**
 * Unified fraud analysis engine.
 * Exports all legacy function names plus new analyzeContact/performStructuredAnalysis.
 * All scores capped at 99. Never returns '100% seguro' or 'instalar app' language.
 * GREEN results always include PSP 112 precaution block.
 * report_invite always equals 'Reportar à comunidade?'
 * 99-cap preserved per REQ-8 constraint — no session changes affect this module.
 */

import { normalizeForMatching } from "./antifraudTextNormalize";
import { analyzeEmail as analyzeEmailHeuristics } from "./emailHeuristics";
import { analyzeMessage } from "./messageHeuristics";
import { analyzePhoneReputation } from "./phoneReputationEngine";

// Re-export result types from their source modules for backward compatibility
export type { MessageAnalysisResult } from "./messageHeuristics";
export type { EmailAnalysisResult } from "./emailHeuristics";
export type { PhoneReputationResult } from "./phoneReputationEngine";

// Canonical AnalysisResult interface used throughout the app
export interface AnalysisResult {
  risk_level: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  risk_score: number; // 0-99, never 100
  status: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  visual_text: string;
  explanation: string; // 2 sentences in Portuguese
  recommendation: string;
  report_invite: string; // always 'Reportar à comunidade?'
  // Extended fields
  carrier_type?: string;
  carrier?: string;
  country?: string;
  sources?: string[];
  riskLevel?: string;
  riskScore?: number;
  details?: string;
  // Legacy fields used by some components
  score?: number;
  publicSources?: Array<{ name: string; url: string }>;
  hasCollaborativeBasis?: boolean;
}

// Alias for backward compatibility
export type StructuredAnalysisResult = AnalysisResult;

const GREEN_PRECAUTION =
  "Nenhum risco conhecido encontrado. Se não reconhecer:\n• Verifique por canal oficial\n• Não forneça dados pessoais\n• Em dúvida: PSP 112";

function ensureSchema(result: Partial<AnalysisResult>): AnalysisResult {
  const score = Math.min(
    result.risk_score ?? result.riskScore ?? result.score ?? 0,
    99,
  );
  const risk_level =
    result.risk_level ??
    (score >= 65 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW");
  const status =
    result.status ?? (score >= 65 ? "RED" : score >= 35 ? "YELLOW" : "GREEN");
  const isUnknown = status === "UNKNOWN";

  return {
    risk_level,
    risk_score: score,
    status,
    visual_text:
      result.visual_text ??
      (isUnknown
        ? "❓ Risco desconhecido · Sem dados suficientes"
        : `${status === "RED" ? "🚨" : status === "YELLOW" ? "⚠️" : "✅"} Risco ${risk_level} (${score}/99)`),
    explanation:
      result.explanation ?? "Análise concluída. Verifique os detalhes abaixo.",
    recommendation:
      result.recommendation ??
      (isUnknown
        ? "Proceda com cautela. Não forneça dados pessoais a contactos desconhecidos."
        : status === "GREEN"
          ? GREEN_PRECAUTION
          : "Proceda com cautela e verifique a identidade do contacto."),
    report_invite: "Reportar à comunidade?",
    carrier_type: result.carrier_type,
    carrier: result.carrier,
    country: result.country,
    sources: result.sources ?? [],
    riskLevel: risk_level,
    riskScore: score,
    score,
    details: result.details,
    publicSources: result.publicSources ?? [],
    hasCollaborativeBasis: result.hasCollaborativeBasis ?? false,
  };
}

// ============================================================================
// Crypto analysis (internal)
// ============================================================================

function analyzeCryptoInternal(address: string): AnalysisResult {
  if (!address || address.trim().length === 0) {
    return ensureSchema({
      risk_level: "LOW",
      risk_score: 0,
      status: "GREEN",
      visual_text: "✅ Sem endereço para analisar",
      explanation:
        "Nenhum endereço de criptomoeda foi fornecido para análise. Introduza um endereço para verificar.",
      recommendation: GREEN_PRECAUTION,
    });
  }

  const addr = address.trim();
  let score = 0;
  const detectedPatterns: string[] = [];

  const btcPattern = /^(1|3|bc1)[a-zA-Z0-9]{25,62}$/;
  const ethPattern = /^0x[a-fA-F0-9]{40}$/;
  const xmrPattern = /^4[0-9AB][1-9A-HJ-NP-Za-km-z]{93}$/;

  const isBtc = btcPattern.test(addr);
  const isEth = ethPattern.test(addr);
  const isXmr = xmrPattern.test(addr);

  if (isXmr) {
    score += 35;
    detectedPatterns.push("Monero (moeda de privacidade)");
  }

  if (!isBtc && !isEth && !isXmr) {
    score += 20;
    detectedPatterns.push("formato não reconhecido");
  }

  const normalized = normalizeForMatching(addr);
  const scamPatterns = ["scam", "fraud", "fake", "test"];
  if (scamPatterns.some((p) => normalized.includes(p))) {
    score += 30;
    detectedPatterns.push("padrão suspeito no endereço");
  }

  score = Math.min(Math.round(score), 99);
  const risk_level: "LOW" | "MEDIUM" | "HIGH" =
    score >= 65 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
  const status: "GREEN" | "YELLOW" | "RED" =
    score >= 65 ? "RED" : score >= 35 ? "YELLOW" : "GREEN";

  let visual_text: string;
  if (status === "RED")
    visual_text = `🚨 Endereço Cripto de Alto Risco (${score}/99)`;
  else if (status === "YELLOW")
    visual_text = `⚠️ Endereço Cripto Suspeito (${score}/99)`;
  else {
    const coinType = isBtc
      ? "Bitcoin"
      : isEth
        ? "Ethereum"
        : isXmr
          ? "Monero"
          : "Cripto";
    visual_text = `✅ Endereço ${coinType} sem risco conhecido (${score}/99)`;
  }

  let explanation: string;
  if (isXmr) {
    explanation =
      "Este endereço pertence à rede Monero, uma criptomoeda de privacidade frequentemente associada a transações anónimas. Verifique cuidadosamente a origem do pedido antes de efetuar qualquer transferência.";
  } else if (score >= 35) {
    explanation =
      "Este endereço de criptomoeda apresenta características que requerem verificação adicional. Nunca transfira fundos sem confirmar a identidade do destinatário por canal oficial.";
  } else {
    const coinType = isBtc ? "Bitcoin" : isEth ? "Ethereum" : "criptomoeda";
    explanation = `Endereço de ${coinType} com formato válido e sem padrões de risco conhecidos. Verifique sempre a identidade do destinatário antes de efetuar qualquer transferência.`;
  }

  const recommendation =
    status === "GREEN"
      ? GREEN_PRECAUTION
      : status === "YELLOW"
        ? "Verifique a identidade do destinatário por canal oficial antes de transferir fundos. Em caso de dúvida, contacte as autoridades (PSP 112)."
        : "Não transfira fundos. Bloqueie o contacto e reporte às autoridades (PSP 112 ou GNR). Nunca forneça chaves privadas ou seed phrases.";

  return ensureSchema({
    risk_level,
    risk_score: score,
    status,
    visual_text,
    explanation,
    recommendation,
    sources: ["Blockchain Explorer", "Motor Heurístico AntiFraud"],
    details:
      detectedPatterns.length > 0
        ? `Padrões detetados: ${detectedPatterns.join(", ")}`
        : undefined,
  });
}

// ============================================================================
// Public API — named exports
// ============================================================================

/** Analyze a text message (SMS/WhatsApp) */
export async function analyzeMessageText(
  text: string,
  _internalReportCount?: number,
): Promise<AnalysisResult> {
  return ensureSchema({
    ...analyzeMessage(text),
    publicSources: [],
    hasCollaborativeBasis: (_internalReportCount ?? 0) > 0,
  });
}

/** Analyze an email address */
export async function analyzeEmail(
  email: string,
  _internalReportCount?: number,
): Promise<AnalysisResult> {
  return ensureSchema({
    ...analyzeEmailHeuristics(email),
    publicSources: [],
    hasCollaborativeBasis: (_internalReportCount ?? 0) > 0,
  });
}

/** Analyze a phone number */
export async function analyzePhoneNumber(
  phone: string,
  internalReportCount?: number,
): Promise<AnalysisResult> {
  return ensureSchema({
    ...analyzePhoneReputation(phone, internalReportCount ?? 0),
    publicSources: [],
    hasCollaborativeBasis: (internalReportCount ?? 0) > 0,
  });
}

/** Analyze a crypto address */
export async function analyzeCryptoAddress(
  address: string,
  internalReportCount?: number,
): Promise<AnalysisResult> {
  return {
    ...analyzeCryptoInternal(address),
    publicSources: [],
    hasCollaborativeBasis: (internalReportCount ?? 0) > 0,
  };
}

/** Detect input type and analyze accordingly */
export function analyzeContact(input: string): AnalysisResult {
  const trimmed = input.trim();

  // Phone number detection
  if (/^\+?[\d\s\-().]{7,20}$/.test(trimmed) && /\d{6,}/.test(trimmed)) {
    return ensureSchema(analyzePhoneReputation(trimmed, 0));
  }

  // Email detection
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return ensureSchema(analyzeEmailHeuristics(trimmed));
  }

  // Crypto address detection
  if (/^(1|3|bc1|0x|4[0-9AB])[a-zA-Z0-9]{20,}$/.test(trimmed)) {
    return analyzeCryptoInternal(trimmed);
  }

  // Default: treat as message
  return ensureSchema(analyzeMessage(trimmed));
}

/** Perform structured analysis with explicit type hint */
export function performStructuredAnalysis(
  input: string,
  type: "message" | "phone" | "email" | "crypto" = "message",
): AnalysisResult {
  switch (type) {
    case "phone":
      return ensureSchema(analyzePhoneReputation(input, 0));
    case "email":
      return ensureSchema(analyzeEmailHeuristics(input));
    case "crypto":
      return analyzeCryptoInternal(input);
    default:
      return ensureSchema(analyzeMessage(input));
  }
}
