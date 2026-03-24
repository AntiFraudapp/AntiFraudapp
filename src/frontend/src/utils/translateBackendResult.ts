// Frontend-only dictionary-based translation utility
// Converts Portuguese backend analysis results to target languages
// without modifying the original text

const translations: Record<"pt" | "en", Record<string, string>> = {
  pt: {
    // Portuguese is the source language, no translation needed
  },
  en: {
    // Risk levels
    "Risco Baixo": "Low Risk",
    "Risco Médio": "Medium Risk",
    "Risco Elevado": "High Risk",
    Baixo: "Low",
    Médio: "Medium",
    Elevado: "High",

    // Common phrases
    "A mensagem parece segura": "The message appears safe",
    "Tenha cuidado": "Be careful",
    "Não confie nesta mensagem": "Do not trust this message",
    "Verifique a autenticidade": "Verify authenticity",
    "Não partilhe informações pessoais": "Do not share personal information",
    "Contacte diretamente a entidade": "Contact the entity directly",

    // Indicators
    urgência: "urgency",
    ameaça: "threat",
    "pedido de dinheiro": "money request",
    "link suspeito": "suspicious link",
    "endereço de criptomoeda": "cryptocurrency address",
  },
};

/**
 * Translate a Portuguese text to target language using dictionary
 */
export function translateBackendResult(
  text: string,
  targetLanguage: string,
): string {
  // If target is Portuguese or unsupported, return original
  if (targetLanguage === "pt" || !(targetLanguage in translations)) {
    return text;
  }

  const dictionary = translations[targetLanguage as "en"];
  let translated = text;

  // Replace each phrase in the dictionary
  for (const [pt, target] of Object.entries(dictionary)) {
    const regex = new RegExp(pt, "gi");
    translated = translated.replace(regex, target);
  }

  return translated;
}
