import { Badge } from "@/components/ui/badge";
/**
 * FraudDetailModal.tsx — AntiFraudapp
 * Modal de detalhes de uma ocorrência de fraude no mapa.
 * Dados agregados públicos — sem identificação pessoal.
 */
import { Button } from "@/components/ui/button";
import { ExternalLink, Globe, Shield, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

export interface FraudReport {
  id: string;
  lat: number;
  lng: number;
  type: "Phishing" | "Vishing" | "Crypto" | "Malware";
  score: number;
  confidence: number;
  sources: number;
  timestamp: Date;
  city: string;
  country: string;
  countryCode: "PT" | "BR" | "EU" | "USA" | "Asia";
  summary: string;
  period: "24h" | "7d" | "30d" | "historical";
}

interface FraudDetailModalProps {
  report: FraudReport | null;
  onClose: () => void;
}

const TYPE_ICONS: Record<FraudReport["type"], string> = {
  Phishing: "🎣",
  Vishing: "📞",
  Crypto: "₿",
  Malware: "🦠",
};

const TYPE_COLORS: Record<FraudReport["type"], string> = {
  Phishing: "bg-red-100 text-red-700 border-red-200",
  Vishing: "bg-orange-100 text-orange-700 border-orange-200",
  Crypto: "bg-purple-100 text-purple-700 border-purple-200",
  Malware: "bg-rose-100 text-rose-700 border-rose-200",
};

const PERIOD_LABELS: Record<FraudReport["period"], string> = {
  "24h": "Últimas 24 horas",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  historical: "Histórico",
};

function scoreColor(score: number): string {
  if (score >= 85) return "text-red-700";
  if (score >= 70) return "text-orange-600";
  return "text-yellow-600";
}

function formatDate(d: Date): string {
  return d.toLocaleString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function FraudDetailModal({ report, onClose }: FraudDetailModalProps) {
  if (!report) return null;

  const explorerUrl =
    report.type === "Crypto"
      ? "https://etherscan.io"
      : "https://www.phishtank.com";
  const explorerLabel = report.type === "Crypto" ? "Etherscan" : "PhishTank";

  return (
    <AnimatePresence>
      {report && (
        <motion.div
          key="fraud-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.55)" }}
          onClick={onClose}
          data-ocid="fraud-detail.modal"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", damping: 28, stiffness: 380 }}
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <span className="text-3xl leading-none">
                  {TYPE_ICONS[report.type]}
                </span>
                <div>
                  <Badge
                    variant="outline"
                    className={`text-sm font-semibold px-2.5 py-0.5 ${TYPE_COLORS[report.type]}`}
                  >
                    {report.type}
                  </Badge>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {PERIOD_LABELS[report.period]}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-gray-100 transition"
                data-ocid="fraud-detail.close_button"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <div className="flex items-start gap-2 text-sm">
                <span className="text-base w-5 flex-shrink-0">📅</span>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold block">
                    Data
                  </span>
                  <span className="text-gray-800 font-medium">
                    {formatDate(report.timestamp)}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <span className="text-base w-5 flex-shrink-0">📍</span>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold block">
                    Local
                  </span>
                  <span className="text-gray-800 font-medium">
                    {report.city}, {report.country}{" "}
                    <span className="text-gray-400 font-normal text-xs">
                      ({report.lat.toFixed(2)}°{report.lat >= 0 ? "N" : "S"},{" "}
                      {Math.abs(report.lng).toFixed(2)}°
                      {report.lng >= 0 ? "E" : "W"})
                    </span>
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <span className="text-base w-5 flex-shrink-0">⚠️</span>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold block">
                    Score de Risco
                  </span>
                  <span
                    className={`text-xl font-bold ${scoreColor(report.score)}`}
                  >
                    {report.score}
                    <span className="text-sm font-normal text-gray-400">
                      /99
                    </span>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <span className="text-base">📊</span>
                    <span className="text-xs text-blue-600 font-semibold uppercase tracking-wide">
                      Confiança
                    </span>
                  </div>
                  <span className="text-lg font-bold text-blue-700">
                    {report.confidence}%
                  </span>
                  <p className="text-[10px] text-blue-400 mt-0.5">
                    AbuseIPDB + OTX
                  </p>
                </div>
                <div className="bg-green-50 rounded-xl p-3">
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="w-3.5 h-3.5 text-green-600" />
                    <span className="text-xs text-green-600 font-semibold uppercase tracking-wide">
                      Fontes
                    </span>
                  </div>
                  <span className="text-lg font-bold text-green-700">
                    {report.sources}
                  </span>
                  <p className="text-[10px] text-green-400 mt-0.5">
                    bases públicas
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-sm">
                <span className="text-base w-5 flex-shrink-0">💬</span>
                <div>
                  <span className="text-gray-500 text-xs uppercase tracking-wide font-semibold block mb-1">
                    Resumo
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 rounded-lg px-3 py-2">
                    "{report.summary}"
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-base">🔗</span>
                <span className="text-xs text-gray-500 font-semibold">
                  Verificar:
                </span>
                <a
                  href={explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                  data-ocid="fraud-detail.link"
                >
                  {explorerLabel}
                  <ExternalLink className="w-3 h-3" />
                </a>
                <a
                  href="https://otx.alienvault.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 underline"
                  data-ocid="fraud-detail.link"
                >
                  OTX
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-1">
              <div className="flex items-center gap-1.5 text-[10px] text-gray-400 bg-gray-50 rounded-lg p-2 mb-3">
                <Globe className="w-3 h-3 flex-shrink-0" />
                <span>
                  Dados agregados públicos — Apenas IPs públicos e scores
                  agregados — Sem identificação pessoal — GDPR compliant
                </span>
              </div>
              <Button
                className="w-full"
                variant="outline"
                onClick={onClose}
                data-ocid="fraud-detail.cancel_button"
              >
                Fechar
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default FraudDetailModal;
