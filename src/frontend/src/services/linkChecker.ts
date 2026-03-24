// LINKS: PhishTank

export interface LinkRiskResult {
  isUrl: boolean;
  riskScore: number;
  isPhishing: boolean;
  message: string;
  level: "safe" | "unknown" | "suspicious" | "high";
}

// Minimal URL validation: must have a TLD (at least one dot after the domain)
function isValidUrl(input: string): boolean {
  // Starts with http:// or https:// and has a domain with TLD
  if (/^https?:\/\/[a-zA-Z0-9].*\./.test(input)) return true;
  // Looks like a domain (e.g. example.com, sub.example.com)
  if (/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+/.test(input))
    return true;
  return false;
}

export async function checkUrlRisk(input: string): Promise<LinkRiskResult> {
  const trimmed = input.trim();

  // Step 1: validate if input is a URL
  if (!isValidUrl(trimmed)) {
    return {
      isUrl: false,
      riskScore: 0,
      isPhishing: false,
      message: "Texto introduzido não é um link válido.",
      level: "unknown",
    };
  }

  // Step 2: call PhishTank public API
  try {
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const formData = new URLSearchParams();
    formData.append("url", url);
    formData.append("format", "json");

    const res = await fetch("https://checkurl.phishtank.com/checkurl/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      if (
        data?.results?.in_database === true &&
        data?.results?.valid === true
      ) {
        return {
          isUrl: true,
          riskScore: 85,
          isPhishing: true,
          message:
            "🚨 URL identificado como phishing na base pública PhishTank.",
          level: "high",
        };
      }
    }
  } catch {
    // CORS or network error — fall through to safe fallback
  }

  return {
    isUrl: true,
    riskScore: 5,
    isPhishing: false,
    message:
      "Não foi encontrado em bases públicas de phishing, mas mantenha cautela.",
    level: "safe",
  };
}
