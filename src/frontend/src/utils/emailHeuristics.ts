/**
 * Email fraud detection utility.
 * Returns all 8 required schema fields with risk_score capped at 99.
 * Never returns '100% seguro', '100% safe', or 'instalar app' language.
 */

import { normalizeForMatching } from "./antifraudTextNormalize";

export interface EmailAnalysisResult {
  risk_level: "LOW" | "MEDIUM" | "HIGH";
  risk_score: number; // 0-99, never 100
  status: "GREEN" | "YELLOW" | "RED";
  visual_text: string;
  explanation: string; // 2 sentences in Portuguese
  recommendation: string;
  report_invite: string; // always 'Reportar à comunidade?'
  // Legacy fields
  riskLevel?: string;
  riskScore?: number;
  details?: string;
}

const GREEN_PRECAUTION =
  "Nenhum risco conhecido encontrado. Se não reconhecer:\n• Verifique por canal oficial\n• Não forneça dados pessoais\n• Em dúvida: PSP 112";

const SUSPICIOUS_DOMAINS = [
  "tempmail",
  "guerrillamail",
  "mailinator",
  "throwam",
  "yopmail",
  "sharklasers",
  "guerrillamailblock",
  "grr.la",
  "spam4.me",
  "trashmail",
  "dispostable",
  "maildrop",
  "fakeinbox",
  "spamgourmet",
  "mytemp",
];

const PHISHING_KEYWORDS = [
  "verify your account",
  "confirm your password",
  "update your billing",
  "suspended",
  "unusual activity",
  "click here",
  "act now",
  "limited time",
  "winner",
  "congratulations",
  "selected",
  "prize",
  "reward",
  "verifique sua conta",
  "confirme sua senha",
  "atualize seu pagamento",
  "suspensa",
  "atividade incomum",
  "clique aqui",
  "aja agora",
  "vencedor",
  "parabens",
  "selecionado",
  "premio",
  "recompensa",
  "conta bloqueada",
  "acesso restrito",
  "dados bancarios",
];

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

export function analyzeEmail(email: string): EmailAnalysisResult {
  if (!email || email.trim().length === 0) {
    return {
      risk_level: "LOW",
      risk_score: 0,
      status: "GREEN",
      visual_text: "✅ Sem conteúdo para analisar",
      explanation:
        "Nenhum endereço de email foi fornecido para análise. Introduza um email para verificar.",
      recommendation: GREEN_PRECAUTION,
      report_invite: "Reportar à comunidade?",
    };
  }

  const normalized = normalizeForMatching(email);
  let score = 0;
  const detectedPatterns: string[] = [];

  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    score += 20;
    detectedPatterns.push("formato inválido");
  }

  // Suspicious/disposable domain detection
  const domain = email.split("@")[1]?.toLowerCase() || "";
  const isSuspiciousDomain = SUSPICIOUS_DOMAINS.some((d) => domain.includes(d));
  if (isSuspiciousDomain) {
    score += 40;
    detectedPatterns.push("domínio descartável");
  }

  // Phishing keyword detection in email address
  const phishingMatches = PHISHING_KEYWORDS.filter((kw) =>
    normalized.includes(normalizeForMatching(kw)),
  );
  if (phishingMatches.length > 0) {
    score += Math.min(phishingMatches.length * 15, 45);
    detectedPatterns.push(...phishingMatches.slice(0, 3));
  }

  // Suspicious patterns in local part
  const localPart = email.split("@")[0]?.toLowerCase() || "";
  const suspiciousLocalPatterns = [
    /noreply/i,
    /no-reply/i,
    /donotreply/i,
    /admin\d+/i,
    /support\d+/i,
    /security\d+/i,
    /verify\d+/i,
    /update\d+/i,
  ];
  const suspiciousLocal = suspiciousLocalPatterns.some((p) =>
    p.test(localPart),
  );
  if (suspiciousLocal) {
    score += 10;
    detectedPatterns.push("padrão suspeito no remetente");
  }

  // Homograph/typosquatting detection for common brands
  const brandTypos = [
    { brand: "paypal", typos: ["paypa1", "paypai", "paypa-l", "pay-pal"] },
    { brand: "google", typos: ["g00gle", "gooogle", "googie"] },
    { brand: "microsoft", typos: ["micros0ft", "microsooft", "microsofft"] },
    { brand: "amazon", typos: ["amaz0n", "amazoon", "arnazon"] },
    { brand: "apple", typos: ["app1e", "appie", "aple"] },
    { brand: "banco", typos: ["banc0", "bancoo"] },
    { brand: "cgd", typos: ["cgd-", "-cgd"] },
    { brand: "millennium", typos: ["mi11ennium", "millenium"] },
  ];
  for (const { typos } of brandTypos) {
    if (typos.some((t) => domain.includes(t))) {
      score += 35;
      detectedPatterns.push("possível typosquatting de marca");
      break;
    }
  }

  // Cap at 99
  score = Math.min(Math.round(score), 99);

  const risk_level = getRiskLevel(score);
  const status = getStatus(score);

  let visual_text: string;
  if (status === "RED") visual_text = `🚨 Email de Alto Risco (${score}/99)`;
  else if (status === "YELLOW") visual_text = `⚠️ Email Suspeito (${score}/99)`;
  else visual_text = `✅ Email sem risco conhecido (${score}/99)`;

  // Explanation: exactly 2 sentences in Portuguese
  let explanation: string;
  if (isSuspiciousDomain) {
    explanation =
      "Este email utiliza um domínio descartável ou temporário frequentemente associado a fraudes. Não forneça dados pessoais nem clique em links provenientes deste endereço.";
  } else if (phishingMatches.length > 0) {
    explanation = `Foram detetadas ${phishingMatches.length} expressão(ões) típicas de phishing neste email. Verifique a autenticidade do remetente antes de responder ou clicar em qualquer link.`;
  } else if (score >= 35) {
    explanation =
      "Este email apresenta características suspeitas que podem indicar tentativa de fraude. Proceda com cautela e verifique a identidade do remetente por canal oficial.";
  } else {
    explanation =
      "Nenhum padrão de risco elevado foi detetado neste endereço de email. Mantenha sempre precaução ao partilhar dados pessoais.";
  }

  let recommendation: string;
  if (status === "RED") {
    recommendation =
      "Não responda nem clique em links. Marque como spam e reporte às autoridades (PSP 112 ou CNCS). Nunca forneça dados pessoais ou bancários.";
  } else if (status === "YELLOW") {
    recommendation =
      "Verifique a autenticidade do remetente por canal oficial antes de responder. Em caso de dúvida, contacte as autoridades (PSP 112).";
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
    riskLevel: risk_level,
    riskScore: score,
    details:
      detectedPatterns.length > 0
        ? `Padrões detetados: ${detectedPatterns.slice(0, 5).join(", ")}`
        : undefined,
  };
}

export default analyzeEmail;
