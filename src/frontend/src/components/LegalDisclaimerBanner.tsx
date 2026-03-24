interface LegalDisclaimerBannerProps {
  variant?: "compact" | "full";
}

export function LegalDisclaimerBanner({
  variant = "compact",
}: LegalDisclaimerBannerProps) {
  if (variant === "compact") {
    return (
      <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800 flex items-start gap-1.5">
        <span className="flex-shrink-0">⚖️</span>
        <span>
          Os resultados representam estimativas preventivas baseadas em dados
          públicos e contributos da comunidade. Não constituem prova de
          atividade criminosa nem substituem decisões das autoridades.
        </span>
      </div>
    );
  }

  return (
    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800 space-y-2">
      <div className="flex items-center gap-2 font-semibold">
        <span>⚖️</span>
        <span>Aviso Legal</span>
      </div>
      <p>
        Os resultados apresentados pela AntiFraudapp representam estimativas
        preventivas baseadas em dados públicos e contributos da comunidade.
      </p>
      <ul className="space-y-1 list-disc list-inside text-xs">
        <li>Não constituem prova de atividade criminosa</li>
        <li>Não representam acusações formais</li>
        <li>Não substituem decisões das autoridades competentes</li>
        <li>Devem ser interpretados apenas como alertas preventivos</li>
      </ul>
      <p className="text-xs">
        Em caso de suspeita real de crime, contacte as autoridades:{" "}
        <strong>PSP / GNR — 112</strong>
      </p>
    </div>
  );
}

export default LegalDisclaimerBanner;
