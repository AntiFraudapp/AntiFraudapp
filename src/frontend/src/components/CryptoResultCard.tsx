import type { StructuredAnalysisResult } from "@/components/StructuredAnalysisResultCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Flag, Shield } from "lucide-react";
import React from "react";

interface CryptoResultCardProps {
  result: StructuredAnalysisResult;
  contact?: string;
  scamMessage?: string;
}

function getRiskColor(status?: string) {
  switch (status) {
    case "RED":
      return {
        border: "border-2 border-red-200 dark:border-red-800",
        bg: "bg-red-50 dark:bg-red-950/20",
        badge: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
        icon: <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />,
        bullet: (
          <AlertTriangle className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />
        ),
      };
    case "YELLOW":
      return {
        border: "border-2 border-yellow-200 dark:border-yellow-800",
        bg: "bg-yellow-50 dark:bg-yellow-950/20",
        badge:
          "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        icon: <Shield className="w-4 h-4 text-yellow-500 shrink-0" />,
        bullet: <Shield className="w-3 h-3 text-yellow-500 shrink-0 mt-0.5" />,
      };
    default:
      return {
        border: "border-2 border-green-200 dark:border-green-800",
        bg: "bg-green-50 dark:bg-green-950/20",
        badge:
          "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
        icon: <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />,
        bullet: (
          <CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" />
        ),
      };
  }
}

export function CryptoResultCard({
  result,
  contact,
  scamMessage,
}: CryptoResultCardProps) {
  const score = result.risk_score ?? result.riskScore ?? result.score ?? 0;

  // FIX: force RED status when score >= 90
  const derivedStatus =
    score >= 90
      ? "RED"
      : (result.status ??
        (result.risk_level === "HIGH"
          ? "RED"
          : result.risk_level === "MEDIUM"
            ? "YELLOW"
            : "GREEN"));

  const visualText =
    (scamMessage || result.visual_text) ??
    (derivedStatus === "GREEN"
      ? "Endereço Cripto sem risco conhecido"
      : "Endereço Cripto com risco detetado");

  const colors = getRiskColor(derivedStatus);
  const isHighRisk = derivedStatus === "RED";

  const bullets = result.explanation
    ? result.explanation.split(". ").filter((s) => s.trim().length > 0)
    : [];

  const addr = contact?.trim() ?? "";

  return (
    <div className="max-w-[600px] mx-auto mt-4 mb-6">
      <Card className={`${colors.border} ${colors.bg} rounded-xl`}>
        <div className="px-4 py-3 flex flex-col gap-2">
          {/* Header row */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              {colors.icon}
              <span className="text-sm font-medium">{visualText}</span>
            </div>
            <span
              className={`text-[12px] px-2 py-0.5 rounded-full font-semibold ${colors.badge}`}
            >
              {score}/99
            </span>
          </div>

          {/* Scam alert banner — shown when score >= 90 */}
          {isHighRisk && scamMessage && (
            <div className="mt-1 px-3 py-2 rounded-lg bg-red-100 border border-red-300 text-red-800 text-sm font-semibold dark:bg-red-900/30 dark:border-red-700 dark:text-red-300">
              {scamMessage}
            </div>
          )}

          {/* Bullets */}
          {bullets.length > 0 && (
            <ul className="flex flex-col gap-1 pl-1">
              {bullets.map((bullet) => (
                <li
                  key={bullet.slice(0, 20)}
                  className="flex items-start gap-2"
                >
                  {colors.bullet}
                  <span className="text-sm leading-relaxed max-w-[52ch]">
                    {bullet.trim()}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* Blockchain Explorer */}
          {addr && (
            <div className="mt-3">
              <p className="text-xs text-muted-foreground mb-2">
                Blockchain Explorer / Modo AntiFraud
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`https://etherscan.io/address/${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                  >
                    Etherscan
                  </Button>
                </a>
                <a
                  href={`https://www.blockchain.com/explorer/search?search=${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                  >
                    Blockchain.com
                  </Button>
                </a>
                <a
                  href={`https://blockchair.com/search#q=${addr}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs w-full sm:w-auto"
                  >
                    Blockchair
                  </Button>
                </a>
              </div>
            </div>
          )}

          {/* Footer block */}
          <div className="mt-3 p-3 rounded-md bg-[#f7f7f7] dark:bg-muted/30 text-[13px] flex flex-col gap-1.5">
            <span className="text-muted-foreground">
              Em dúvida, contacte a{" "}
              <strong className="text-foreground">PSP — 112</strong>
            </span>
            {/* FIX: highlighted REPORTAR button for high-risk addresses */}
            {isHighRisk ? (
              <Button
                variant="destructive"
                size="sm"
                className="text-xs h-8 w-fit px-3 font-semibold"
              >
                <Flag className="w-3 h-3 mr-1" />🚨 REPORTAR
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7 w-fit px-2 -ml-2 text-muted-foreground hover:text-foreground"
              >
                <Flag className="w-3 h-3 mr-1" />
                Reportar à comunidade
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CryptoResultCard;
