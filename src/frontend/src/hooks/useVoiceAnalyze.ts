import { useCallback, useEffect, useRef, useState } from "react";

const TRIGGER_WORDS: Record<string, string[]> = {
  pt: ["analisar", "analize", "analisa"],
  en: ["analyze", "analyse", "analysis"],
  es: ["analizar", "analiza"],
  fr: ["analyser", "analyse"],
  de: ["analysieren", "analysiere"],
};

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((e: any) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function useVoiceAnalyze(onTrigger: () => void, language = "pt") {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setSupported(false);
      return;
    }
    setSupported(true);
    const recognition: SpeechRecognitionLike = new SpeechRecognitionAPI();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang =
      language === "pt"
        ? "pt-PT"
        : language === "en"
          ? "en-US"
          : language === "es"
            ? "es-ES"
            : language === "fr"
              ? "fr-FR"
              : "pt-PT";
    recognition.onresult = (e: any) => {
      const results: any[] = Array.from(e.results ?? []);
      const transcript = results
        .map((r: any) => r[0]?.transcript?.toLowerCase() ?? "")
        .join(" ");
      const triggers = TRIGGER_WORDS[language] || TRIGGER_WORDS.pt;
      if (triggers.some((w) => transcript.includes(w))) {
        onTrigger();
      }
    };
    recognition.onerror = () => {
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      // Auto-restart for hands-free accessibility
      setTimeout(() => {
        try {
          recognition.start();
          setIsListening(true);
        } catch (_) {
          // ignore restart errors
        }
      }, 1000);
    };
    try {
      recognition.start();
      setIsListening(true);
    } catch (_) {
      // ignore start errors
    }
    recognitionRef.current = recognition;
  }, [language, onTrigger]);

  useEffect(() => {
    startListening();
    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (_) {
        // ignore
      }
    };
  }, [startListening]);

  return { isListening, supported };
}
