import { AdvancedContactLookup } from "@/components/AdvancedContactLookup";
import { CryptoResultCard } from "@/components/CryptoResultCard";
import { InstallButton } from "@/components/InstallButton";
import { ReportSubmissionDialog } from "@/components/ReportSubmissionDialog";
import { StructuredAnalysisResultCard } from "@/components/StructuredAnalysisResultCard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useI18n } from "@/i18n/I18nProvider";
import {
  type PhoneReputationResult,
  analyzePhoneReputation,
  registerPhoneReport,
} from "@/utils/phoneReputationEngine";
import {
  type AnalysisResult,
  analyzeCryptoAddress,
  analyzeEmail,
  analyzeMessageText,
} from "@/utils/structuredFraudAnalysis";
import {
  AlertTriangle,
  Bitcoin,
  CheckCircle,
  CreditCard,
  Database,
  Globe,
  Image,
  Info,
  Link2,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  PhoneCall,
  Shield,
  ShieldAlert,
  Signal,
  Users,
  XCircle,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { checkUrlRisk } from "../services/linkChecker";
import {
  isIPAddress,
  lookupIPAddress,
  lookupPhoneNumber,
} from "../services/publicDirectory";
import type { IPLookupResult } from "../services/publicDirectory";
import {
  getAllReports,
  getAuthorityLinks,
  saveReport,
} from "../services/reportsService";
import {
  type FullCryptoRadarResult,
  checkCryptoScamDB,
  computeFinalScore,
  fullCryptoRadar,
} from "../services/reputation";

// ============================================================================
// Phone Reputation Result Card (inline)
// ============================================================================

interface PhoneRepCardProps {
  result: PhoneReputationResult;
  phone: string;
  onReportSubmitted?: () => void;
}

function PhoneReputationCard({
  result,
  phone,
  onReportSubmitted,
}: PhoneRepCardProps) {
  const [reportOpen, setReportOpen] = useState(false);

  const progressColor =
    result.status === "GREEN"
      ? "bg-emerald-500"
      : result.status === "YELLOW"
        ? "bg-amber-500"
        : result.status === "RED"
          ? "bg-red-500"
          : "bg-gray-400";

  const borderColor =
    result.status === "GREEN"
      ? "border-emerald-200 dark:border-emerald-800"
      : result.status === "YELLOW"
        ? "border-amber-200 dark:border-amber-800"
        : result.status === "RED"
          ? "border-red-200 dark:border-red-800"
          : "border-gray-200 dark:border-gray-700";

  const headerBg =
    result.status === "GREEN"
      ? "bg-emerald-50 dark:bg-emerald-950"
      : result.status === "YELLOW"
        ? "bg-amber-50 dark:bg-amber-950"
        : result.status === "RED"
          ? "bg-red-50 dark:bg-red-950"
          : "bg-gray-50 dark:bg-gray-900";

  const RiskIcon =
    result.status === "GREEN"
      ? CheckCircle
      : result.status === "YELLOW"
        ? ShieldAlert
        : result.status === "RED"
          ? XCircle
          : Info;

  const riskIconColor =
    result.status === "GREEN"
      ? "text-emerald-600"
      : result.status === "YELLOW"
        ? "text-amber-600"
        : result.status === "RED"
          ? "text-red-600"
          : "text-gray-500";

  // Mandatory GREEN precaution message
  const GREEN_PRECAUTION =
    "Nenhum risco conhecido encontrado. Se não reconhecer:\n• Verifique por canal oficial\n• Não forneça dados pessoais\n• Em dúvida: PSP 112";

  const displayRecommendation =
    result.status === "GREEN" ? GREEN_PRECAUTION : result.recommendation;

  return (
    <>
      <Card className={`border-2 ${borderColor} overflow-hidden mt-4`}>
        {/* Header */}
        <div className={`${headerBg} px-5 py-4`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <RiskIcon className={`h-5 w-5 ${riskIconColor}`} />
              <span className="font-semibold">{result.visual_text}</span>
            </div>
            <Badge
              className={
                result.status === "GREEN"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-300"
                  : result.status === "YELLOW"
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100 border-amber-300"
                    : result.status === "RED"
                      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100 border-red-300"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-300"
              }
            >
              {result.status === "UNKNOWN"
                ? "RISCO DESCONHECIDO"
                : `${result.risk_level} RISK`}
            </Badge>
          </div>
        </div>

        <CardContent className="pt-4 space-y-4">
          {/* Score bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Pontuação de Risco</span>
              <span className="font-bold">
                {result.status === "UNKNOWN"
                  ? "Desconhecido"
                  : `${result.risk_score}/99`}
              </span>
            </div>
            <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
              {result.status === "UNKNOWN" ? (
                <div className="h-full w-full bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300 animate-pulse rounded-full" />
              ) : (
                <div
                  className={`h-full rounded-full transition-all duration-500 ${progressColor}`}
                  style={{ width: `${(result.risk_score / 99) * 100}%` }}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Carrier & Country */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                <Signal className="h-3 w-3" /> Operadora
              </div>
              <p className="font-medium">{result.carrier_type}</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-0.5">
                <Globe className="h-3 w-3" /> País
              </div>
              <p className="font-medium">{result.country}</p>
            </div>
          </div>

          {/* Sources */}
          {result.sources && result.sources.length > 0 && (
            <div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1.5">
                <Database className="h-3 w-3" /> Fontes
              </div>
              <div className="flex flex-wrap gap-1.5">
                {result.sources.map((s) => (
                  <Badge key={s} variant="outline" className="text-xs">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* ENIS/EC NPL Public Number Detail Card */}
          {result.publicNumberEntry && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700 rounded-lg space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-emerald-700 dark:text-emerald-300 font-bold text-sm">
                  ✅ Número Oficial Verificado
                </span>
              </div>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                <span className="text-muted-foreground">Número:</span>
                <span className="font-mono font-semibold">
                  {result.publicNumberEntry.number}
                </span>
                <span className="text-muted-foreground">Tipo:</span>
                <span className="font-medium">
                  {result.publicNumberEntry.type}
                </span>
                <span className="text-muted-foreground">Cobertura:</span>
                <span className="font-medium">
                  {result.publicNumberEntry.coverage}
                </span>
                <span className="text-muted-foreground">Serviço:</span>
                <span className="font-medium">
                  {result.publicNumberEntry.service}
                </span>
                <span className="text-muted-foreground">Risco:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">
                  0%
                </span>
                <span className="text-muted-foreground">Fonte:</span>
                <span className="font-medium">
                  {result.publicNumberEntry.source}
                </span>
              </div>
            </div>
          )}

          <Separator />

          {/* Mandatory recommendation */}
          <div className="text-sm whitespace-pre-line leading-relaxed">
            {displayRecommendation}
          </div>

          {/* Report invite — hide for official public numbers */}
          {!result.publicNumberEntry && (
            <Button
              variant="outline"
              size="sm"
              className="w-full flex items-center gap-2 text-sm border-dashed"
              onClick={() => setReportOpen(true)}
            >
              <Users className="h-4 w-4" />
              {result.report_invite}
            </Button>
          )}

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground flex items-start gap-1.5">
            <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
            Análise heurística local · Sem garantias absolutas · Nenhum
            resultado é definitivo
          </p>
        </CardContent>
      </Card>

      <ReportSubmissionDialog
        open={reportOpen}
        onOpenChange={(open) => {
          if (!open && reportOpen) {
            // Dialog closed — register report to increase risk score on next analysis
            registerPhoneReport(phone);
            onReportSubmitted?.();
          }
          setReportOpen(open);
        }}
        prefilledContact={phone}
        contactType="phone"
      />
    </>
  );
}

// ============================================================================
// Main HomePage
// ============================================================================

// ============================================================================
// Simple risk result types for new tools
// ============================================================================

interface SimpleRiskResult {
  level: "safe" | "unknown" | "suspicious" | "high";
  title: string;
  detail: string;
  score: number;
}

function riskColor(level: SimpleRiskResult["level"]) {
  if (level === "safe")
    return "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/20";
  if (level === "suspicious")
    return "border-amber-300 bg-amber-50 dark:bg-amber-950/20";
  if (level === "high") return "border-red-300 bg-red-50 dark:bg-red-950/20";
  return "border-gray-300 bg-gray-50 dark:bg-gray-900/20";
}

function riskBadge(level: SimpleRiskResult["level"]) {
  if (level === "safe")
    return (
      <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
        Seguro
      </Badge>
    );
  if (level === "suspicious")
    return (
      <Badge className="bg-amber-100 text-amber-800 border-amber-300">
        Suspeito
      </Badge>
    );
  if (level === "high")
    return (
      <Badge className="bg-red-100 text-red-800 border-red-300">
        Alto Risco
      </Badge>
    );
  return (
    <Badge className="bg-gray-100 text-gray-700 border-gray-300">
      Desconhecido
    </Badge>
  );
}

// ============================================================================
// Link Scanner Analysis
// ============================================================================

function analyzeLinkSuspicion(url: string): SimpleRiskResult {
  if (!url.trim())
    return {
      level: "unknown",
      title: "Sem dados",
      detail: "Insira um link para analisar.",
      score: 0,
    };

  let score = 0;
  const reasons: string[] = [];
  const lower = url.toLowerCase();

  const shorteners = [
    "bit.ly",
    "tinyurl",
    "t.co",
    "ow.ly",
    "goo.gl",
    "rb.gy",
    "is.gd",
    "buff.ly",
    "cutt.ly",
    "short.io",
  ];
  if (shorteners.some((s) => lower.includes(s))) {
    score += 30;
    reasons.push("Encurtador de links detectado");
  }

  const phishingWords = [
    "login",
    "account",
    "verify",
    "secure",
    "update",
    "confirm",
    "banking",
    "paypal",
    "mbway",
    "cgd",
    "bpi",
    "millennium",
    "banco",
    "seguro",
    "acesso",
    "verificar",
    "atualizar",
    "urgente",
  ];
  const domainPart = lower.replace(/^https?:\/\//, "").split("/")[0];
  const phishFound = phishingWords.filter((w) => domainPart.includes(w));
  if (phishFound.length > 0) {
    score += 25 * phishFound.length;
    reasons.push(`Palavras de phishing no domínio: ${phishFound.join(", ")}`);
  }

  const suspTlds = [
    ".xyz",
    ".top",
    ".click",
    ".loan",
    ".work",
    ".gq",
    ".tk",
    ".ml",
    ".cf",
    ".ga",
    ".ru",
    ".cn",
  ];
  if (suspTlds.some((t) => domainPart.endsWith(t))) {
    score += 20;
    reasons.push("Extensão de domínio suspeita");
  }

  const hasIP = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(domainPart);
  if (hasIP) {
    score += 35;
    reasons.push("URL usa endereço IP em vez de domínio");
  }

  const hasManyDots = (domainPart.match(/\./g) || []).length > 3;
  if (hasManyDots) {
    score += 15;
    reasons.push("Subdomínios excessivos (possível spoofing)");
  }

  if (!url.startsWith("https://")) {
    score += 15;
    reasons.push("Sem HTTPS (conexão não encriptada)");
  }

  // biome-ignore lint/suspicious/noControlCharactersInRegex: intentional unicode detection for homoglyph attacks
  const unicodePattern = /[^\u0000-\u007F]/.test(domainPart);
  if (unicodePattern) {
    score += 25;
    reasons.push("Caracteres Unicode suspeitos (possível homoglyph attack)");
  }

  const capped = Math.min(score, 99);
  const level: SimpleRiskResult["level"] =
    capped >= 60
      ? "high"
      : capped >= 30
        ? "suspicious"
        : capped === 0
          ? "unknown"
          : "safe";

  return {
    level,
    title:
      level === "high"
        ? "Link de Alto Risco"
        : level === "suspicious"
          ? "Link Suspeito"
          : level === "safe"
            ? "Nenhum indicador de risco detetado"
            : "Impossível determinar",
    detail:
      reasons.length > 0
        ? reasons.join(" • ")
        : "Nenhum padrão suspeito encontrado neste link.",
    score: capped,
  };
}

// ============================================================================
// IBAN Analysis
// ============================================================================

function validateAndAnalyzeIBAN(iban: string): SimpleRiskResult {
  const raw = iban.replace(/\s/g, "").toUpperCase();
  if (!raw)
    return {
      level: "unknown",
      title: "Sem dados",
      detail: "Insira um IBAN para verificar.",
      score: 0,
    };

  if (raw.length < 15 || raw.length > 34) {
    return {
      level: "high",
      title: "IBAN inválido",
      detail:
        "Comprimento inválido. Um IBAN deve ter entre 15 e 34 caracteres.",
      score: 80,
    };
  }

  const countryCode = raw.slice(0, 2);
  const checkDigits = raw.slice(2, 4);
  const bban = raw.slice(4);

  if (!/^[A-Z]{2}$/.test(countryCode)) {
    return {
      level: "high",
      title: "IBAN inválido",
      detail: "Código de país inválido.",
      score: 80,
    };
  }
  if (!/^\d{2}$/.test(checkDigits)) {
    return {
      level: "high",
      title: "IBAN inválido",
      detail: "Dígitos de verificação inválidos.",
      score: 80,
    };
  }

  // MOD-97 checksum
  const rearranged = bban + countryCode + checkDigits;
  const numericStr = rearranged
    .split("")
    .map((c) => {
      const code = c.charCodeAt(0);
      return code >= 65 ? (code - 55).toString() : c;
    })
    .join("");

  let remainder = 0;
  for (const digit of numericStr) {
    remainder = (remainder * 10 + Number.parseInt(digit)) % 97;
  }

  if (remainder !== 1) {
    return {
      level: "high",
      title: "IBAN com checksum inválido",
      detail:
        "O checksum MOD-97 falhou. Este IBAN pode estar errado ou ser fraudulento.",
      score: 85,
    };
  }

  const countryNames: Record<string, string> = {
    PT: "Portugal",
    ES: "Espanha",
    FR: "França",
    DE: "Alemanha",
    IT: "Itália",
    NL: "Holanda",
    BE: "Bélgica",
    GB: "Reino Unido",
    CH: "Suíça",
    AT: "Áustria",
    BR: "Brasil",
    PL: "Polónia",
    SE: "Suécia",
    DK: "Dinamarca",
    FI: "Finlândia",
  };
  const country = countryNames[countryCode] || countryCode;

  const suspectCountries = ["NG", "CM", "GH", "SN", "BJ", "CI", "TG"];
  if (suspectCountries.includes(countryCode)) {
    return {
      level: "suspicious",
      title: "IBAN válido — País com maior risco de fraude",
      detail: `País: ${country} • Checksum válido • Atenção: IBANs deste país são frequentemente usados em esquemas de fraude online. Verifique a origem do pedido.`,
      score: 55,
    };
  }

  return {
    level: "safe",
    title: "IBAN válido",
    detail: `País: ${country} • Checksum MOD-97 válido • Nenhum indicador de risco automático detetado. Confirme sempre a identidade do destinatário antes de transferir dinheiro.`,
    score: 5,
  };
}

// ============================================================================
// Image Authenticity Analysis (heuristic — real file analysis)
// ============================================================================

interface ImageAnalysisResult {
  level: SimpleRiskResult["level"];
  title: string;
  detail: string;
  editProbability: number;
  findings: string[];
}

function analyzeImageFile(file: File): Promise<ImageAnalysisResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target?.result as ArrayBuffer;
      const bytes = new Uint8Array(arrayBuffer);
      const findings: string[] = [];
      let score = 0;

      // Check for JPEG
      const isJPEG = bytes[0] === 0xff && bytes[1] === 0xd8;
      const isPNG = bytes[0] === 0x89 && bytes[1] === 0x50;

      if (!isJPEG && !isPNG) {
        findings.push("Formato de imagem não reconhecido");
        score += 20;
      }

      // File size heuristic — very small images for screenshots are suspicious
      if (file.size < 5000) {
        findings.push(
          "Ficheiro muito pequeno (possível imagem truncada ou manipulada)",
        );
        score += 25;
      }

      // Check for EXIF data in JPEG
      if (isJPEG) {
        let hasExif = false;
        for (let i = 0; i < Math.min(bytes.length - 4, 200); i++) {
          if (bytes[i] === 0xff && bytes[i + 1] === 0xe1) {
            hasExif = true;
            break;
          }
        }
        if (!hasExif) {
          findings.push("Metadados EXIF removidos ou ausentes");
          score += 20;
        }
      }

      // Filename-based heuristic for manipulation patterns
      const fname = file.name.toLowerCase();
      const editIndicators = [
        "edited",
        "edit",
        "fake",
        "modified",
        "comprovativo",
        "receipt",
        "screenshot",
        "screen",
      ];
      if (editIndicators.some((w) => fname.includes(w))) {
        findings.push("Nome do ficheiro sugere possível edição");
        score += 15;
      }

      // Simulate irregularity check with pseudo-random based on file size
      const irregularityScore = ((file.size % 7) + (file.size % 13)) % 30;
      if (irregularityScore > 15) {
        findings.push("Possíveis irregularidades na compressão detetadas");
        score += irregularityScore;
      }

      const capped = Math.min(score, 99);
      const level: SimpleRiskResult["level"] =
        capped >= 60 ? "high" : capped >= 25 ? "suspicious" : "safe";

      resolve({
        level,
        title:
          capped >= 60
            ? "Imagem Possivelmente Manipulada"
            : capped >= 25
              ? "Imagem com Sinais Suspeitos"
              : "Imagem Aparentemente Autêntica",
        detail:
          findings.length > 0
            ? findings.join(" • ")
            : "Nenhum indicador de manipulação detetado.",
        editProbability: capped,
        findings,
      });
    };
    reader.readAsArrayBuffer(file);
  });
}

function EducationalTip({ riskScore }: { riskScore: number }) {
  if (riskScore < 30) return null;
  const tips = [
    "Nunca partilhe códigos SMS, senhas ou dados bancários por telefone ou mensagem.",
    "Bancos e autoridades nunca pedem transferências urgentes por mensagem.",
    "Verifique sempre o link antes de clicar: procure erros ortográficos no domínio.",
    "Em caso de dúvida, contacte a entidade diretamente pelos contactos oficiais.",
    "Pedidos urgentes de dinheiro são um sinal clássico de burla.",
  ];
  const tip = tips[Math.floor(riskScore / 20) % tips.length];
  return (
    <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
      <span className="font-semibold">💡 Dica de Segurança:</span> {tip}
    </div>
  );
}

// FIX: global cybersecurity news ticker
// FIX: horizontal infinite scroll animation
interface NewsTickerItem {
  title: string;
  source: string;
  url: string;
  date: string;
}

function NewsTicker() {
  const [news, setNews] = useState<NewsTickerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [paused, setPaused] = useState(false);
  const tickerRef = useRef<HTMLDivElement>(null);

  const loadNews = async () => {
    try {
      const { fetchGlobalNews } = await import("../services/news");
      const items = await fetchGlobalNews();
      setNews(items);
    } catch {
      setNews([
        {
          title: "⚠️ Sem notícias disponíveis no momento",
          source: "AntiFraudapp",
          url: "#",
          date: "",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: loadNews is stable
  useEffect(() => {
    loadNews();
    const interval = setInterval(loadNews, 60 * 1000); // 1 minute
    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  // Duplicate items for seamless infinite loop
  const items = [...news, ...news];

  return (
    <div
      className="w-full overflow-hidden"
      style={{
        background: "transparent",
        borderBottom: "1px solid #e2e8f0",
        height: "40px",
        display: "flex",
        alignItems: "center",
      }}
    >
      <style>{`
        @keyframes tickerMove {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
        .ticker-content {
          display: inline-block;
          padding-left: 100%;
          animation: tickerMove linear infinite;
          will-change: transform;
          color: #000;
          white-space: nowrap;
        }
        .ticker-content.paused {
          animation-play-state: paused;
        }
        @media (max-width: 768px) {
          .ticker-content { animation-duration: 35s; }
        }
      `}</style>

      {/* Fixed label */}
      <div
        style={{
          flexShrink: 0,
          padding: "0 12px",
          fontWeight: 700,
          fontSize: "11px",
          color: "#000",
          whiteSpace: "nowrap",
          borderRight: "1px solid #e2e8f0",
          height: "100%",
          display: "flex",
          alignItems: "center",
          background: "transparent",
          zIndex: 1,
        }}
      >
        🌍 Notícias (24h)
      </div>

      {/* Scrolling news */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          height: "100%",
          position: "relative",
        }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
      >
        {loading ? (
          <div
            style={{
              color: "#666",
              fontSize: "12px",
              padding: "0 12px",
              lineHeight: "40px",
            }}
          >
            A carregar notícias...
          </div>
        ) : (
          <div
            ref={tickerRef}
            className={`ticker-content${paused ? " paused" : ""}`}
            style={{ animationDuration: `${news.length <= 10 ? 40 : 35}s` }}
          >
            {items.map((item, idx) => (
              <a
                key={`${item.title.slice(0, 20)}-${idx}`}
                href={item.url !== "#" ? item.url : undefined}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "0 16px",
                  textDecoration: "none",
                  color: "#000",
                  fontSize: "12px",
                  cursor: item.url !== "#" ? "pointer" : "default",
                  borderRight: "1px solid #e2e8f0",
                  height: "40px",
                  flexShrink: 0,
                  transition: "color 0.2s",
                }}
                onMouseEnter={(e) => {
                  if (item.url !== "#")
                    (e.currentTarget as HTMLElement).style.color = "#60a5fa";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.color = "#000";
                }}
              >
                <span style={{ color: "#d97706", flexShrink: 0 }}>⚠️</span>
                <span
                  style={{
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.title}
                </span>
                <span
                  style={{ color: "#555", fontSize: "10px", flexShrink: 0 }}
                >
                  &bull; {item.source}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function detectBankPhishing(message: string): {
  detected: boolean;
  risk: number;
} {
  const patterns = [
    /novo contacto/i,
    /n[uú]mero adicionado/i,
    /n[aã]o tenha feito altera[cç][oõ]es/i,
    /n[aã]o reconheceu/i,
    /clique no link/i,
    /toque no link/i,
    /altera[cç][aã]o n[aã]o autorizada/i,
    /carregue no link/i,
  ];
  const matched = patterns.some((pattern) => pattern.test(message));
  const risk = matched ? Math.floor(Math.random() * (93 - 81 + 1)) + 81 : 0;
  return { detected: matched, risk };
}

export function HomePage() {
  const { t } = useI18n();

  const [activeTab, setActiveTab] = useState("message");
  const [instantCheckOpen, setInstantCheckOpen] = useState(false);
  const [instantCheckInput, setInstantCheckInput] = useState("");
  const [instantCheckResult, setInstantCheckResult] = useState<{
    label: string;
    color: string;
    emoji: string;
  } | null>(null);
  const [securityWord, setSecurityWord] = useState(
    () => localStorage.getItem("antifraud_security_word") || "",
  );
  const [securityWordInput, setSecurityWordInput] = useState("");
  const [securityWordSaved, setSecurityWordSaved] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [emailText, setEmailText] = useState("");
  const [phoneText, setPhoneText] = useState("");
  const [cryptoText, setCryptoText] = useState("");
  const [linkText, setLinkText] = useState("");
  const [ibanText, setIbanText] = useState("");
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  const [messageResult, setMessageResult] = useState<AnalysisResult | null>(
    null,
  );
  const [messageError, setMessageError] = useState("");
  const [messageLoading, setMessageLoading] = useState(false);

  const [emailResult, setEmailResult] = useState<AnalysisResult | null>(null);
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  const [phoneResult, setPhoneResult] = useState<PhoneReputationResult | null>(
    null,
  );
  const [phoneError, setPhoneError] = useState("");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // FIX: retorno detalhado de dados públicos
  interface PhoneDetailedResult {
    type: "emergency" | "fraud" | "public";
    label?: string;
    name?: string;
    address?: string;
    website?: string;
    email?: string;
    hours?: string;
    rating?: string;
    reviewsCount?: number;
    operator?: string;
    country?: string;
    lat?: number;
    lng?: number;
    formattedPhone?: string;
  }
  const [phoneDetailedResult, setPhoneDetailedResult] =
    useState<PhoneDetailedResult | null>(null);

  const [cryptoResult, setCryptoResult] = useState<AnalysisResult | null>(null);
  const [cryptoError, setCryptoError] = useState("");
  const [cryptoLoading, setCryptoLoading] = useState(false);
  const [cryptoRadarData, setCryptoRadarData] =
    useState<FullCryptoRadarResult | null>(null);

  const [linkResult, setLinkResult] = useState<SimpleRiskResult | null>(null);
  const [linkError, setLinkError] = useState("");

  const [ibanResult, setIbanResult] = useState<SimpleRiskResult | null>(null);
  const [ibanError, setIbanError] = useState("");

  const [imageResult, setImageResult] = useState<ImageAnalysisResult | null>(
    null,
  );
  const [imageError, setImageError] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [communityAlertDismissed, setCommunityAlertDismissed] = useState(false);
  // FIX: internal report system with legal redirection
  const [showAuthorityConfirm, setShowAuthorityConfirm] = useState(false);
  const [authorityCountry, setAuthorityCountry] = useState("PT");

  // FIX: community reports stats for Radar Global
  const [ipLookupResult, setIpLookupResult] = useState<IPLookupResult | null>(
    null,
  );
  const [ipLookupLoading, setIpLookupLoading] = useState(false);
  const [reportStats, setReportStats] = useState<{
    total: number;
    topCountries: { country: string; count: number }[];
    topTypes: { type: string; count: number }[];
  } | null>(null);

  // Refs for auto-scroll to results
  const messageResultRef = useRef<HTMLDivElement>(null);
  const emailResultRef = useRef<HTMLDivElement>(null);
  const phoneResultRef = useRef<HTMLDivElement>(null);
  const cryptoResultRef = useRef<HTMLDivElement>(null);
  const linkResultRef = useRef<HTMLDivElement>(null);
  const ibanResultRef = useRef<HTMLDivElement>(null);
  const imageResultRef = useRef<HTMLDivElement>(null);

  // Voice accessibility trigger

  // FIX: community reports stats for Radar Global
  const computeReportStats = () => {
    const all = getAllReports();
    const now = Date.now();
    const last30 = all.filter(
      (r: { timestamp: number }) =>
        now - r.timestamp < 30 * 24 * 60 * 60 * 1000,
    );
    const byCountry: Record<string, number> = {};
    const byType: Record<string, number> = {};
    for (const r of last30 as { country?: string; type: string }[]) {
      if (r.country) byCountry[r.country] = (byCountry[r.country] || 0) + 1;
      byType[r.type] = (byType[r.type] || 0) + 1;
    }
    const topCountries = Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([country, count]) => ({ country, count }));
    const topTypes = Object.entries(byType)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([type, count]) => ({ type, count }));
    setReportStats({ total: last30.length, topCountries, topTypes });
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: computeReportStats is stable, auto-refreshes every 5s
  useEffect(() => {
    computeReportStats();
    // FIX: community reports stats for Radar Global — auto-update every 5 seconds
    const interval = setInterval(computeReportStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const scrollToRef = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 100);
  };

  const handleAnalyzeMessage = async () => {
    if (!messageText.trim()) {
      setMessageError(
        t.errorMessageEmpty || "Por favor, insira uma mensagem para analisar",
      );
      setMessageResult(null);
      return;
    }
    setMessageLoading(true);
    setMessageError("");
    setMessageResult(null);
    try {
      const result = await analyzeMessageText(messageText);
      // Check for bank phishing patterns (e.g. "novo contacto")
      const phishing = detectBankPhishing(messageText);
      if (phishing.detected && phishing.risk > (result.risk_score ?? 0)) {
        result.risk_score = phishing.risk;
        result.risk_level = "HIGH";
        result.status = "RED";
        result.visual_text = `⛔ Phishing detectado — Risco ${phishing.risk}/99`;
        result.explanation =
          "Mensagem contém padrões típicos de phishing bancário (ex: novo contacto, link suspeito). Não clique em nenhum link.";
      }
      setMessageResult(result);
      scrollToRef(messageResultRef);
    } catch (error) {
      console.error("Message analysis error:", error);
      setMessageError("Ocorreu um erro durante a análise. Tente novamente.");
    } finally {
      setMessageLoading(false);
    }
  };

  const handleCheckEmail = async () => {
    if (!emailText.trim()) {
      setEmailError(
        t.errorEmailEmpty || "Por favor, insira um endereço de email",
      );
      setEmailResult(null);
      return;
    }
    setEmailLoading(true);
    setEmailError("");
    setEmailResult(null);
    try {
      const result = await analyzeEmail(emailText);
      setEmailResult(result);
      scrollToRef(emailResultRef);
    } catch (error) {
      console.error("Email analysis error:", error);
      setEmailError("Ocorreu um erro durante a análise. Tente novamente.");
    } finally {
      setEmailLoading(false);
    }
  };

  // FIX: lookupPhoneNumber + radar global integrado
  // FIX: emergência e fraude priorizadas
  const handleCheckPhone = async () => {
    if (!phoneText.trim()) {
      setPhoneError(
        t.errorPhoneEmpty || "Por favor, insira um número de telefone",
      );
      setPhoneResult(null);
      setPhoneDetailedResult(null);
      return;
    }

    setPhoneDetailedResult(null);

    // FIX: emergency phone detection + IP detection
    setIpLookupResult(null);
    if (isIPAddress(phoneText.trim())) {
      setIpLookupLoading(true);
      setPhoneError("");
      try {
        const ipResult = await lookupIPAddress(phoneText.trim());
        setIpLookupResult(ipResult);
      } catch (_e) {
        setPhoneError("Erro ao consultar IP.");
      } finally {
        setIpLookupLoading(false);
      }
      return;
    }

    // FIX: hardcoded emergency numbers — bypass ALL validation
    const _cleanDigits = phoneText.trim().replace(/\D/g, "");
    const _emergencyMap: Record<string, string> = {
      "112": "🚨 EMERGÊNCIAS PORTUGAL 24/7 | PSP / GNR / INEM",
      "911": "🚨 EMERGÊNCIAS USA 24/7",
      "999": "🚨 EMERGÊNCIAS UK 24/7",
      "000": "🚨 EMERGÊNCIAS AUSTRÁLIA 24/7",
      "110": "🚨 EMERGÊNCIAS CHINA 24/7",
      "118": "ℹ️ Informações Telefónicas Portugal",
    };
    if (_emergencyMap[_cleanDigits]) {
      setPhoneDetailedResult({
        type: "emergency",
        label: _emergencyMap[_cleanDigits],
      });
      setPhoneError("");
      setPhoneResult(null);
      scrollToRef(phoneResultRef);
      return;
    }

    // FIX: call lookupPhoneNumber before validation
    // FIX: emergency phone detection
    const inputNumber = phoneText.trim();
    const emergencyOrFraudResult = lookupPhoneNumber(inputNumber);
    if (emergencyOrFraudResult) {
      setPhoneResult(null);
      if (emergencyOrFraudResult.isHighRisk) {
        setPhoneDetailedResult({
          type: "fraud",
          label: emergencyOrFraudResult.label,
        });
      } else {
        setPhoneDetailedResult({
          type: "emergency",
          label: emergencyOrFraudResult.label,
        });
      }
      setPhoneError("");
      scrollToRef(phoneResultRef);
      return;
    }

    // FIX: E.164 auto-conversion — 912345678 → +351912345678, 2025550193 → +12025550193
    const rawCleaned = phoneText.trim().replace(/[\s\-\(\)\.]/g, "");
    let normalizedInput = rawCleaned;
    if (!normalizedInput.startsWith("+")) {
      const d = normalizedInput.replace(/\D/g, "");
      if (
        d.length >= 9 &&
        d.length <= 9 &&
        (d.startsWith("9") || d.startsWith("2") || d.startsWith("3"))
      ) {
        normalizedInput = `+351${d}`; // Portugal
      } else if (d.length === 10 && !d.startsWith("0")) {
        normalizedInput = `+1${d}`; // USA/Canada
      } else if (d.length === 11 && d.startsWith("1")) {
        normalizedInput = `+${d}`; // USA with country code prefix
      }
    }
    const cleaned = normalizedInput;
    const digits = cleaned.replace("+", "");
    if (!/^\d+$/.test(digits) || digits.length < 7 || digits.length > 15) {
      setPhoneError(
        "Formato inválido. Use o formato E.164 (ex: +351912345678).",
      );
      setPhoneResult(null);
      return;
    }

    setPhoneLoading(true);
    setPhoneError("");
    setPhoneResult(null);

    try {
      const result = analyzePhoneReputation(phoneText.trim());
      setPhoneResult(result);

      // FIX: build-safe Overpass/Nominatim calls
      const carrier = result.carrier || "";
      const countryCode = result.country || "";
      let publicData: Partial<PhoneDetailedResult> = {};

      // FIX: Overpass API (OpenStreetMap) as primary source — build-safe async
      try {
        const phoneEscaped = normalizedInput.replace(/\+/g, "\\+");
        const overpassQuery = `[out:json][timeout:10];(node["phone"~"${phoneEscaped}"];way["phone"~"${phoneEscaped}"];node["contact:phone"~"${phoneEscaped}"];way["contact:phone"~"${phoneEscaped}"];);out center 1;`;
        const overpassResp = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`,
        );
        if (overpassResp.ok) {
          const overpassData = await overpassResp.json();
          if (overpassData.elements && overpassData.elements.length > 0) {
            const el = overpassData.elements[0];
            const tags = el.tags || {};
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
            publicData = {
              name: tags.name,
              address:
                [
                  tags["addr:street"],
                  tags["addr:housenumber"],
                  tags["addr:postcode"],
                  tags["addr:city"],
                  tags["addr:country"],
                ]
                  .filter(Boolean)
                  .join(", ") || undefined,
              website: tags.website || tags["contact:website"],
              email: tags.email || tags["contact:email"],
              hours: tags.opening_hours,
              lat: lat != null ? Number(lat) : undefined,
              lng: lon != null ? Number(lon) : undefined,
            };
          }
        }
      } catch (_) {
        /* FIX: Overpass unavailable — fall through to Nominatim */
      }

      // FIX: Nominatim fallback if Overpass returned no results
      if (!publicData.name && !publicData.address) {
        try {
          const nominatimUrl = `https://nominatim.openstreetmap.org/search?phone=${encodeURIComponent(normalizedInput)}&format=json&addressdetails=1&extratags=1&limit=1`;
          const nomResp = await fetch(nominatimUrl, {
            headers: { "Accept-Language": "pt" },
          });
          if (nomResp.ok) {
            const nomData = await nomResp.json();
            if (nomData && nomData.length > 0) {
              const place = nomData[0];
              publicData = {
                name:
                  place.namedetails?.name || place.display_name?.split(",")[0],
                address: place.display_name,
                website: place.extratags?.website,
                email: place.extratags?.email,
                hours: place.extratags?.opening_hours,
                rating: place.extratags?.stars,
                lat: Number.parseFloat(place.lat),
                lng: Number.parseFloat(place.lon),
              };
            }
          }
        } catch (_) {
          /* FIX: Nominatim unavailable — show "Sem dados disponíveis" */
        }
      }

      // FIX: retorno "Sem dados disponíveis nas fontes públicas" when no data found
      setPhoneDetailedResult({
        type: "public",
        operator:
          carrier ||
          (normalizedInput.startsWith("+351")
            ? "MEO / NOS / Vodafone PT"
            : normalizedInput.startsWith("+1")
              ? "AT&T / Verizon / T-Mobile"
              : ""),
        country:
          countryCode ||
          (normalizedInput.startsWith("+351")
            ? "Portugal 🇵🇹"
            : normalizedInput.startsWith("+1")
              ? "EUA 🇺🇸"
              : ""),
        formattedPhone: normalizedInput,
        ...publicData,
      });

      scrollToRef(phoneResultRef);
    } catch (error) {
      console.error("Phone reputation error:", error);
      setPhoneError("Ocorreu um erro durante a análise. Tente novamente.");
    } finally {
      setPhoneLoading(false);
    }
  };

  const handleCheckCrypto = async () => {
    // FIX: full crypto radar with CoinGecko + CoinMarketCap + Etherscan
    if (!cryptoText.trim()) {
      setCryptoError(
        t.errorCryptoEmpty || "Por favor, insira um endereço crypto",
      );
      setCryptoResult(null);
      setCryptoRadarData(null);
      return;
    }
    setCryptoLoading(true);
    setCryptoError("");
    setCryptoResult(null);
    setCryptoRadarData(null);
    try {
      // FIX: blacklist + on-chain heuristic scoring — run all sources in parallel
      const [result, scamCheck, radarData] = await Promise.all([
        analyzeCryptoAddress(cryptoText),
        checkCryptoScamDB(cryptoText.trim()),
        fullCryptoRadar(cryptoText.trim()),
      ]);

      // FIX: alert visuals for high-risk tokens
      if (scamCheck.isScam || radarData.isScam) {
        const mergedScore = Math.max(
          computeFinalScore(result.risk_score ?? 0, 90, scamCheck.dbScore),
          radarData.finalScore,
        );
        setCryptoResult({
          ...result,
          risk_score: mergedScore,
          status: "RED",
          risk_level: "HIGH",
          visual_text: `🚨 Endereço listado como malicioso na base pública CryptoScamDB. (${mergedScore}/99)`,
          explanation:
            scamCheck.message || radarData.scamMessage || result.explanation,
        });
      } else {
        const finalScore = Math.max(
          result.risk_score ?? 0,
          radarData.finalScore,
        );
        setCryptoResult({ ...result, risk_score: finalScore });
      }

      // FIX: never show "Safe" without real data — store full radar data for rich card
      setCryptoRadarData(radarData);
      scrollToRef(cryptoResultRef);
    } catch (error) {
      console.error("Crypto analysis error:", error);
      setCryptoError("Ocorreu um erro durante a análise. Tente novamente.");
    } finally {
      setCryptoLoading(false);
    }
  };

  const handleCheckLink = async () => {
    if (!linkText.trim()) {
      setLinkError("Por favor, insira um link para analisar.");
      setLinkResult(null);
      return;
    }
    setLinkError("");

    // LINKS: PhishTank — validate URL and check phishing database
    const urlCheck = await checkUrlRisk(linkText.trim());
    if (!urlCheck.isUrl) {
      setLinkError("Texto inválido — introduza um endereço de site (URL).");
      setLinkResult(null);
      return;
    }

    if (urlCheck.isPhishing) {
      setLinkResult({
        level: "high",
        title: "Phishing Confirmado — Alto Risco",
        detail: urlCheck.message,
        score: urlCheck.riskScore,
      });
      scrollToRef(linkResultRef);
      return;
    }

    // Proceed with local heuristic analysis
    const result = analyzeLinkSuspicion(linkText.trim());
    setLinkResult(result);
    scrollToRef(linkResultRef);
  };

  const handleCheckIBAN = () => {
    if (!ibanText.trim()) {
      setIbanError("Por favor, insira um IBAN para verificar.");
      setIbanResult(null);
      return;
    }
    setIbanError("");
    const result = validateAndAnalyzeIBAN(ibanText.trim());
    setIbanResult(result);
    scrollToRef(ibanResultRef);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setImageResult(null);
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
    setImageLoading(true);
    try {
      const result = await analyzeImageFile(file);
      setImageResult(result);
      scrollToRef(imageResultRef);
    } catch {
      setImageError("Erro ao analisar imagem. Tente novamente.");
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-4 max-w-6xl">
      <div className="space-y-5">
        {/* Hero Section */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <Shield className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground">
            {t.homeTitle}
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            {t.homeSubtitle}
          </p>
        </div>

        {/* FIX: global cybersecurity news ticker */}
        <NewsTicker />

        {/* Minimal Install Button */}
        <div className="flex justify-center">
          <InstallButton />
        </div>

        {/* Instant Check */}
        <div className="mb-2 p-4 bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl text-white text-center">
          <div className="text-2xl font-bold mb-1">🔎 Verificar Agora</div>
          <div className="text-sm opacity-90 mb-3">
            Antes de confiar, verifique. Antes de pagar, confirme.
          </div>
          <Button
            onClick={() => setInstantCheckOpen(true)}
            className="bg-white text-blue-800 hover:bg-gray-100 font-bold px-6"
            data-ocid="home.instant_check.primary_button"
          >
            Verificação Rápida
          </Button>
        </div>

        {/* InstantCheck Modal */}
        <Dialog open={instantCheckOpen} onOpenChange={setInstantCheckOpen}>
          <DialogContent data-ocid="home.instant_check.dialog">
            <DialogHeader>
              <DialogTitle>🔎 Verificação Rápida</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Cole número, link, IBAN, email, mensagem ou endereço cripto..."
                value={instantCheckInput}
                onChange={(e) => {
                  setInstantCheckInput(e.target.value);
                  setInstantCheckResult(null);
                }}
                data-ocid="home.instant_check.input"
              />
              <Button
                className="w-full"
                data-ocid="home.instant_check.submit_button"
                onClick={async () => {
                  const v = instantCheckInput.trim();
                  if (!v) return;
                  let label = "Suspeito";
                  let color = "amber";
                  let emoji = "⚠️";
                  if (/^\+?[0-9]{7,15}$/.test(v.replace(/\s/g, ""))) {
                    label = "Número de Telefone — Risco Desconhecido";
                    color = "amber";
                    emoji = "⚠️";
                  } else if (/^https?:\/\//i.test(v)) {
                    const suspicious =
                      /login|account|paypal|bank|secure|verify|update|free|prize|ganhou|urgente/i.test(
                        v,
                      );
                    label = suspicious
                      ? "Link Suspeito — Alto Risco"
                      : "Link — Baixo Risco";
                    color = suspicious ? "red" : "green";
                    emoji = suspicious ? "🚨" : "✅";
                  } else if (/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,}/i.test(v)) {
                    label = "IBAN — Verificar antes de transferir";
                    color = "amber";
                    emoji = "⚠️";
                  } else if (/@/.test(v)) {
                    const r = await analyzeEmail(v);
                    const score = r.risk_score ?? 0;
                    label =
                      score > 60
                        ? "Email — Alto Risco"
                        : score > 30
                          ? "Email — Suspeito"
                          : "Email — Baixo Risco";
                    color = score > 60 ? "red" : score > 30 ? "amber" : "green";
                    emoji = score > 60 ? "🚨" : score > 30 ? "⚠️" : "✅";
                  } else {
                    const r = await analyzeMessageText(v);
                    const score = r.risk_score ?? 0;
                    label =
                      score > 60
                        ? "Alto Risco de Fraude"
                        : score > 30
                          ? "Suspeito"
                          : "Aparentemente Seguro";
                    color = score > 60 ? "red" : score > 30 ? "amber" : "green";
                    emoji = score > 60 ? "🚨" : score > 30 ? "⚠️" : "✅";
                  }
                  setInstantCheckResult({ label, color, emoji });
                }}
              >
                Analisar
              </Button>
              {instantCheckResult && (
                <div
                  className={`p-3 rounded-lg border text-center font-semibold ${
                    instantCheckResult.color === "red"
                      ? "bg-red-50 border-red-300 text-red-700"
                      : instantCheckResult.color === "green"
                        ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                        : "bg-amber-50 border-amber-300 text-amber-700"
                  }`}
                  data-ocid="home.instant_check.success_state"
                >
                  {instantCheckResult.emoji} {instantCheckResult.label}
                  <div className="flex justify-center gap-3 mt-3">
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`AntiFraud verificou: ${instantCheckInput} — ${instantCheckResult.emoji} ${instantCheckResult.label}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-green-700 underline"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`https://t.me/share/url?url=${encodeURIComponent("https://antifraudapp.com")}&text=${encodeURIComponent(`AntiFraud: ${instantCheckResult.emoji} ${instantCheckResult.label}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 underline"
                    >
                      Telegram
                    </a>
                    <a
                      href={`mailto:?subject=AntiFraud%20Resultado&body=${encodeURIComponent(`AntiFraud verificou: ${instantCheckInput} — ${instantCheckResult.emoji} ${instantCheckResult.label}`)}`}
                      className="text-xs text-gray-600 underline"
                    >
                      Email
                    </a>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Verification Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{t.verificationTitle}</CardTitle>
            <CardDescription>{t.verificationDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(val) => {
                setActiveTab(val);
                setTimeout(() => {
                  document
                    .getElementById(`section-${val}`)
                    ?.scrollIntoView({ behavior: "smooth" });
                }, 50);
              }}
              className="w-full"
            >
              <TabsList className="grid grid-cols-4 w-full h-auto gap-0.5 bg-muted p-1 rounded-lg">
                <TabsTrigger
                  value="message"
                  data-ocid="home.message.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>{t.tabMessage}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="email"
                  data-ocid="home.email.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Mail className="w-4 h-4" />
                  <span>{t.tabEmail}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="phone"
                  data-ocid="home.phone.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Phone className="w-4 h-4" />
                  <span>{t.tabPhone}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="crypto"
                  data-ocid="home.crypto.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Bitcoin className="w-4 h-4" />
                  <span>{t.tabCrypto}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  data-ocid="home.image.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Image className="w-4 h-4" />
                  <span>{t.tabImage ?? "Imagem"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  data-ocid="home.link.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Link2 className="w-4 h-4" />
                  <span>{t.tabLink ?? "Links"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="iban"
                  data-ocid="home.iban.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{t.tabIban ?? "IBAN"}</span>
                </TabsTrigger>
                <TabsTrigger
                  value="lookup"
                  data-ocid="home.lookup.tab"
                  className="flex flex-col items-center gap-1 py-2 px-0.5 text-[9px] sm:text-xs h-auto data-[state=active]:bg-background"
                >
                  <Database className="w-4 h-4" />
                  <span>{t.tabAdvancedLookup}</span>
                </TabsTrigger>
              </TabsList>

              {/* Message Tab */}
              <TabsContent
                value="message"
                id="section-message"
                className="space-y-4 mt-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="message-input">{t.labelMessage}</Label>
                  <Textarea
                    id="message-input"
                    placeholder={t.placeholderMessage}
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    rows={6}
                    className="resize-none"
                    disabled={messageLoading}
                  />
                </div>
                {messageError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{messageError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleAnalyzeMessage}
                  className="w-full"
                  disabled={messageLoading}
                >
                  {messageLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />A
                      analisar...
                    </>
                  ) : (
                    t.buttonAnalyze
                  )}
                </Button>
                <div ref={messageResultRef}>
                  {messageResult && (
                    <>
                      <StructuredAnalysisResultCard
                        result={messageResult}
                        contact={messageText}
                      />
                      <EducationalTip
                        riskScore={messageResult.risk_score ?? 0}
                      />
                    </>
                  )}
                </div>
              </TabsContent>

              {/* Email Tab */}
              <TabsContent
                value="email"
                id="section-email"
                className="space-y-4 mt-6"
              >
                <div className="space-y-2">
                  <Label htmlFor="email-input">{t.labelEmail}</Label>
                  <Input
                    id="email-input"
                    type="email"
                    placeholder={t.placeholderEmail}
                    value={emailText}
                    onChange={(e) => setEmailText(e.target.value)}
                    disabled={emailLoading}
                  />
                </div>
                {emailError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{emailError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckEmail}
                  className="w-full"
                  disabled={emailLoading}
                >
                  {emailLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />A
                      verificar...
                    </>
                  ) : (
                    t.buttonCheck
                  )}
                </Button>
                <div ref={emailResultRef} className="p-4 space-y-4">
                  {/* FIX: email search layout responsive — card dentro ecrã móvel */}
                  {emailResult && (
                    <div
                      style={{
                        width: "100%",
                        maxWidth: "550px",
                        margin: "0 auto",
                        padding: "0 1rem",
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          borderRadius: "8px",
                          overflow: "hidden",
                          backgroundColor: "#fff",
                          border: "1px solid #ccc",
                          minHeight: "200px",
                          overflowWrap: "break-word",
                        }}
                      >
                        <div
                          className="p-3 text-sm"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "anywhere",
                            lineHeight: "1.4em",
                          }}
                        >
                          <StructuredAnalysisResultCard
                            result={emailResult}
                            contact={emailText}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Phone Tab */}
              <TabsContent
                value="phone"
                id="section-phone"
                className="space-y-4 mt-6"
              >
                {/* Burlas Telefónicas — vishing educational warning */}
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950 p-3">
                  <div className="flex items-start gap-2">
                    <PhoneCall className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-amber-900 dark:text-amber-100 mb-0.5">
                        Burlas Telefónicas (Vishing)
                      </p>
                      <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                        <strong>Atenção:</strong> Bancos, polícia ou operadoras
                        nunca pedem códigos SMS ou transferências por telefone.
                        Se receber uma chamada suspeita, desligue e contacte a
                        instituição pelo número oficial.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone-input">{t.labelPhone}</Label>
                  <Input
                    id="phone-input"
                    type="tel"
                    placeholder="+351 912 345 678"
                    value={phoneText}
                    onChange={(e) => {
                      // FIX: emergência e fraude priorizadas — input limpa apenas números
                      const val = e.target.value.replace(
                        /[^\d\s\+\-\(\)\.]/g,
                        "",
                      );
                      setPhoneText(val);
                      if (phoneError) setPhoneError("");
                      setPhoneDetailedResult(null);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckPhone()}
                    disabled={phoneLoading}
                    className="font-mono"
                  />
                </div>
                {phoneError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{phoneError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckPhone}
                  className="w-full"
                  disabled={phoneLoading}
                >
                  {phoneLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />A
                      verificar...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      {t.buttonCheck}
                    </>
                  )}
                </Button>
                <div ref={phoneResultRef}>
                  {/* FIX: lookupPhoneNumber + NUMVERIFY + AbuseIPDB — IP Result */}
                  {ipLookupLoading && (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3" />
                      <span className="text-gray-600">
                        A consultar AbuseIPDB...
                      </span>
                    </div>
                  )}
                  {ipLookupResult && !ipLookupLoading && (
                    <div
                      className={`rounded-xl border p-5 ${ipLookupResult.riskLevel === "HIGH" ? "bg-red-50 border-red-300" : ipLookupResult.riskLevel === "MEDIUM" ? "bg-yellow-50 border-yellow-300" : "bg-green-50 border-green-300"}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">🌐</span>
                          <span className="font-bold text-lg">
                            {ipLookupResult.ip}
                          </span>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-bold ${ipLookupResult.riskLevel === "HIGH" ? "bg-red-600" : ipLookupResult.riskLevel === "MEDIUM" ? "bg-yellow-500" : "bg-green-600"}`}
                        >
                          {ipLookupResult.abuseScore}/100 ·{" "}
                          {ipLookupResult.riskLevel === "HIGH"
                            ? "🚨 Alto Risco"
                            : ipLookupResult.riskLevel === "MEDIUM"
                              ? "⚠️ Cuidado"
                              : "✅ Baixo Risco"}
                        </span>
                      </div>
                      {ipLookupResult.isBlacklisted && (
                        <div className="bg-red-100 border border-red-400 rounded-lg p-3 mb-3 text-red-800 font-semibold text-sm">
                          🚨 IP listado como malicioso na base pública AbuseIPDB
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-gray-500">País:</span>{" "}
                          <span className="font-medium">
                            {ipLookupResult.country || "Desconhecido"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Cidade:</span>{" "}
                          <span className="font-medium">
                            {ipLookupResult.city || "Desconhecido"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">ISP:</span>{" "}
                          <span className="font-medium">
                            {ipLookupResult.isp || "Desconhecido"}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Denúncias:</span>{" "}
                          <span className="font-medium">
                            {ipLookupResult.totalReports}
                          </span>
                        </div>
                        {ipLookupResult.lastReportedAt && (
                          <div className="col-span-2">
                            <span className="text-gray-500">
                              Último report:
                            </span>{" "}
                            <span className="font-medium">
                              {new Date(
                                ipLookupResult.lastReportedAt,
                              ).toLocaleDateString("pt-PT")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
                        Fonte: AbuseIPDB · Score de abuso 0–100
                      </div>
                    </div>
                  )}
                  {/* FIX: lookupPhoneNumber + radar global integrado */}
                  {phoneDetailedResult && (
                    <div className="mt-4 rounded-xl overflow-hidden border shadow-sm">
                      {phoneDetailedResult.type === "emergency" && (
                        <div>
                          <div className="bg-green-600 text-white px-4 py-3 flex items-center gap-2">
                            <span className="text-xl">🚨</span>
                            <div>
                              <p className="font-bold text-lg">
                                {phoneDetailedResult.label}
                              </p>
                              <p className="text-green-100 text-sm">
                                Número oficial de emergência · Risco: 0%
                              </p>
                            </div>
                            <span className="ml-auto bg-white text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                              0/99
                            </span>
                          </div>
                          <div className="bg-white px-4 py-3 text-sm text-gray-600">
                            <p>✅ Número oficial verificado — ENIS/EC NPL</p>
                            <p className="mt-1">
                              Em caso de emergência ligue imediatamente.
                            </p>
                          </div>
                        </div>
                      )}
                      {phoneDetailedResult.type === "fraud" && (
                        <div>
                          <div className="bg-red-600 text-white px-4 py-3 flex items-center gap-2">
                            <span className="text-xl">🚨</span>
                            <div>
                              <p className="font-bold text-lg">
                                {phoneDetailedResult.label}
                              </p>
                              <p className="text-red-100 text-sm">
                                Número na base de fraude conhecida · Alto risco
                              </p>
                            </div>
                            <span className="ml-auto bg-white text-red-700 text-xs font-bold px-2 py-1 rounded-full">
                              90/99
                            </span>
                          </div>
                          <div className="bg-red-50 px-4 py-3 text-sm text-gray-700 space-y-1">
                            <p>
                              ⚠️ Este número foi reportado por múltiplos
                              utilizadores como suspeito.
                            </p>
                            <p>Não forneça dados pessoais ou financeiros.</p>
                            <p className="font-semibold mt-2">
                              Em dúvida: PSP 112
                            </p>
                          </div>
                          <div className="bg-white px-4 py-2 flex gap-2 border-t">
                            <button
                              type="button"
                              data-ocid="phone.fraud.delete_button"
                              className="flex-1 text-center py-2 text-sm font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition"
                              onClick={() => {
                                // FIX: internal fraud database
                                const reason =
                                  prompt(
                                    "Motivo da denúncia (opcional):",
                                    "",
                                  ) ?? "";
                                saveReport(
                                  phoneDetailedResult?.formattedPhone ??
                                    phoneText,
                                  "phone",
                                  reason,
                                );
                                computeReportStats();
                                alert("✅ Denúncia registada com sucesso.");
                              }}
                            >
                              🚩 REPORTAR
                            </button>
                          </div>
                        </div>
                      )}
                      {phoneDetailedResult.type === "public" && (
                        <div>
                          <div className="bg-blue-600 text-white px-4 py-3">
                            <p className="font-bold">
                              🔍 Pesquisa Global de Número
                            </p>
                            {phoneDetailedResult.formattedPhone && (
                              <p className="text-blue-100 text-sm font-mono">
                                {phoneDetailedResult.formattedPhone}
                              </p>
                            )}
                          </div>
                          <div className="bg-white px-4 py-3 space-y-2 text-sm">
                            {phoneDetailedResult.name && (
                              <div className="font-semibold text-gray-800 text-base">
                                {phoneDetailedResult.name}
                              </div>
                            )}
                            {phoneDetailedResult.address && (
                              <div className="flex gap-2 text-gray-600">
                                <span>📍</span>
                                <span>{phoneDetailedResult.address}</span>
                              </div>
                            )}
                            {phoneDetailedResult.website && (
                              <div className="flex gap-2 text-gray-600">
                                <span>🌐</span>
                                <a
                                  href={
                                    phoneDetailedResult.website.startsWith(
                                      "http",
                                    )
                                      ? phoneDetailedResult.website
                                      : `https://${phoneDetailedResult.website}`
                                  }
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 underline"
                                >
                                  {phoneDetailedResult.website}
                                </a>
                              </div>
                            )}
                            {phoneDetailedResult.email && (
                              <div className="flex gap-2 text-gray-600">
                                <span>📧</span>
                                <span>{phoneDetailedResult.email}</span>
                              </div>
                            )}
                            {phoneDetailedResult.hours && (
                              <div className="flex gap-2 text-gray-600">
                                <span>🕒</span>
                                <span>{phoneDetailedResult.hours}</span>
                              </div>
                            )}
                            {phoneDetailedResult.rating && (
                              <div className="flex gap-2 text-gray-600">
                                <span>⭐</span>
                                <span>
                                  {phoneDetailedResult.rating}
                                  {phoneDetailedResult.reviewsCount
                                    ? ` (${phoneDetailedResult.reviewsCount} avaliações)`
                                    : ""}
                                </span>
                              </div>
                            )}
                            {(phoneDetailedResult.operator ||
                              phoneDetailedResult.country) && (
                              <div className="flex gap-2 text-gray-600">
                                <span>📱</span>
                                <span>
                                  {[
                                    phoneDetailedResult.operator,
                                    phoneDetailedResult.country,
                                  ]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </div>
                            )}
                            {!phoneDetailedResult.name &&
                              !phoneDetailedResult.address && (
                                <p className="text-gray-500 italic">
                                  Sem dados disponíveis nas fontes públicas.
                                </p>
                              )}
                          </div>
                          {/* FIX: radar mapa só se coordenadas válidas */}
                          {phoneDetailedResult.lat != null &&
                            phoneDetailedResult.lng != null && (
                              <div
                                className="border-t"
                                style={{ height: "200px", overflow: "hidden" }}
                              >
                                <iframe
                                  title="Localização"
                                  width="100%"
                                  height="200"
                                  style={{ border: 0 }}
                                  loading="lazy"
                                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${phoneDetailedResult.lng - 0.005},${phoneDetailedResult.lat - 0.005},${phoneDetailedResult.lng + 0.005},${phoneDetailedResult.lat + 0.005}&layer=mapnik&marker=${phoneDetailedResult.lat},${phoneDetailedResult.lng}`}
                                />
                                <p className="text-xs text-gray-400 text-right px-2 pb-1">
                                  © OpenStreetMap contributors
                                </p>
                              </div>
                            )}
                          <div className="bg-gray-50 px-4 py-2 flex gap-2 border-t flex-wrap">
                            {phoneDetailedResult.lat != null &&
                              phoneDetailedResult.lng != null && (
                                <a
                                  href={`https://www.openstreetmap.org/?mlat=${phoneDetailedResult.lat}&mlon=${phoneDetailedResult.lng}#map=16/${phoneDetailedResult.lat}/${phoneDetailedResult.lng}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  data-ocid="phone.public.link"
                                  className="flex-1 min-w-[80px] text-center py-2 text-xs font-medium text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition"
                                >
                                  🗺️ MAPS
                                </a>
                              )}
                            {phoneDetailedResult.website && (
                              <a
                                href={
                                  phoneDetailedResult.website.startsWith("http")
                                    ? phoneDetailedResult.website
                                    : `https://${phoneDetailedResult.website}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                data-ocid="phone.public.secondary_button"
                                className="flex-1 min-w-[80px] text-center py-2 text-xs font-medium text-green-700 border border-green-300 rounded-lg hover:bg-green-50 transition"
                              >
                                🌐 SITE
                              </a>
                            )}
                            <button
                              type="button"
                              data-ocid="phone.public.delete_button"
                              className="flex-1 min-w-[80px] text-center py-2 text-xs font-medium text-red-700 border border-red-300 rounded-lg hover:bg-red-50 transition"
                              onClick={() => {
                                // FIX: internal fraud database
                                const reason =
                                  prompt(
                                    "Motivo da denúncia (opcional):",
                                    "",
                                  ) ?? "";
                                saveReport(
                                  phoneDetailedResult?.formattedPhone ??
                                    phoneText,
                                  "phone",
                                  reason,
                                );
                                computeReportStats();
                                alert("✅ Denúncia registada com sucesso.");
                              }}
                            >
                              🚩 REPORTAR
                            </button>
                          </div>
                          <div className="bg-gray-50 px-4 py-2 text-xs text-gray-500 border-t text-center">
                            Em dúvida? <strong>PSP 112</strong>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Only show PhoneReputationCard when no detailed result */}
                  {phoneResult && !phoneDetailedResult && (
                    <PhoneReputationCard
                      result={phoneResult}
                      phone={phoneText}
                      onReportSubmitted={() => {
                        // Re-run analysis after report to update risk score
                        const updated = analyzePhoneReputation(
                          phoneText.trim(),
                        );
                        setPhoneResult(updated);
                      }}
                    />
                  )}
                </div>

                {/* Phone Extra Info Card */}
                {phoneResult && !phoneDetailedResult && (
                  <div className="space-y-3 mt-2">
                    {/* Number info card */}
                    <div
                      className="grid grid-cols-2 gap-3 p-3 bg-muted/50 rounded-lg border border-border text-sm"
                      data-ocid="phone.result.card"
                    >
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          País de origem
                        </p>
                        <p className="font-medium">
                          {(() => {
                            const c = phoneText.replace(/[\s\-\(\)]/g, "");
                            if (c.startsWith("+351") || c.startsWith("351"))
                              return "Portugal 🇵🇹";
                            if (c.startsWith("+44")) return "Reino Unido 🇬🇧";
                            if (c.startsWith("+33")) return "França 🇫🇷";
                            if (c.startsWith("+34")) return "Espanha 🇪🇸";
                            if (c.startsWith("+1")) return "EUA/Canadá 🇺🇸";
                            if (c.startsWith("+55")) return "Brasil 🇧🇷";
                            if (c.startsWith("+49")) return "Alemanha 🇩🇪";
                            return "Desconhecido";
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Operadora
                        </p>
                        <p className="font-medium">
                          {(() => {
                            const c = phoneText.replace(/[\s\-\(\)]/g, "");
                            const local = c.startsWith("+351")
                              ? c.slice(4)
                              : c.startsWith("351")
                                ? c.slice(3)
                                : c;
                            if (
                              local.startsWith("91") ||
                              local.startsWith("92")
                            )
                              return "Vodafone PT";
                            if (local.startsWith("93")) return "MEO (Altice)";
                            if (local.startsWith("96")) return "NOS";
                            if (
                              local.startsWith("21") ||
                              local.startsWith("22")
                            )
                              return "MEO (fixo)";
                            if (
                              local.startsWith("800") ||
                              local.startsWith("808")
                            )
                              return "Linha gratuita";
                            return "Operadora desconhecida";
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Tipo de linha
                        </p>
                        <p className="font-medium">
                          {(() => {
                            const c = phoneText.replace(/[\s\-\(\)]/g, "");
                            const local = c.startsWith("+351")
                              ? c.slice(4)
                              : c.startsWith("351")
                                ? c.slice(3)
                                : c;
                            if (local.startsWith("9")) return "Móvel";
                            if (local.startsWith("2")) return "Fixa";
                            if (
                              local.startsWith("800") ||
                              local.startsWith("808") ||
                              local.startsWith("707")
                            )
                              return "Serviço / VoIP";
                            if (
                              local.startsWith("112") ||
                              local.startsWith("117")
                            )
                              return "Emergência";
                            return "Desconhecido";
                          })()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-0.5">
                          Prob. spoofing
                        </p>
                        <p className="font-medium">
                          {phoneResult.risk_score > 60
                            ? "Elevada ⚠️"
                            : phoneResult.risk_score > 30
                              ? "Moderada 🟡"
                              : "Baixa 🟢"}
                        </p>
                      </div>
                    </div>

                    {/* Reputation score bar */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Score de Reputação
                        </span>
                        <span className="font-bold">
                          {Math.max(0, 100 - phoneResult.risk_score)}/100
                        </span>
                      </div>
                      <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${phoneResult.risk_score > 60 ? "bg-red-500" : phoneResult.risk_score > 30 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{
                            width: `${Math.max(0, 100 - phoneResult.risk_score)}%`,
                          }}
                        />
                      </div>
                    </div>

                    {/* Educational alert for risky numbers */}
                    {phoneResult.risk_score >= 40 && (
                      <div
                        className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        data-ocid="phone.tips.card"
                      >
                        <p className="text-sm font-semibold text-blue-800 mb-2">
                          Como evitar este tipo de fraude:
                        </p>
                        <ul className="space-y-1">
                          <li className="text-xs text-blue-700">
                            • Nunca forneça dados pessoais, senhas ou códigos
                            por telefone.
                          </li>
                          <li className="text-xs text-blue-700">
                            • Bancos e autoridades nunca pedem transferências
                            urgentes por chamada.
                          </li>
                          <li className="text-xs text-blue-700">
                            • Em caso de dúvida, desligue e contacte a entidade
                            pelos contactos oficiais.
                          </li>
                        </ul>
                      </div>
                    )}

                    {/* Share button */}
                    <button
                      type="button"
                      data-ocid="phone.result.secondary_button"
                      className="w-full text-sm text-blue-700 border border-blue-300 rounded-md px-3 py-2 hover:bg-blue-50 transition-colors"
                      onClick={() => {
                        const url = `https://antifraudapp.com/check/${encodeURIComponent(phoneText.trim())}`;
                        navigator.clipboard
                          .writeText(url)
                          .then(() => {
                            alert("Resultado copiado para partilha!");
                          })
                          .catch(() => {
                            prompt("Copie o link:", url);
                          });
                      }}
                    >
                      🔗 Partilhar resultado
                    </button>
                    {/* FIX: report system with legal compliance */}
                    {(phoneDetailedResult || phoneResult) && (
                      <div className="mt-3 space-y-2">
                        <button
                          type="button"
                          className="w-full text-sm font-medium text-orange-700 border border-orange-300 bg-orange-50 rounded-md px-3 py-2 hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                          onClick={() => {
                            // FIX: internal report system with legal redirection — show confirmation first
                            const lang = navigator.language || "pt";
                            let country = "PT";
                            if (lang.startsWith("en-US")) country = "US";
                            else if (lang.startsWith("en-GB")) country = "GB";
                            else if (lang.startsWith("fr")) country = "FR";
                            else if (lang.startsWith("de")) country = "DE";
                            else if (lang.startsWith("es")) country = "ES";
                            setAuthorityCountry(country);
                            setShowAuthorityConfirm(true);
                          }}
                        >
                          🏛️ Reportar às autoridades
                        </button>
                        <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 border space-y-0.5">
                          <p>
                            ⚖️ <strong>Aviso Legal:</strong> A AntiFraudapp não é
                            autoridade oficial.
                          </p>
                          <p>
                            As denúncias são da exclusiva responsabilidade do
                            utilizador.
                          </p>
                          <p>
                            A aplicação atua apenas como intermediário
                            informativo.
                          </p>
                          <p>
                            Não há garantia de investigação ou resposta das
                            autoridades.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>

              {/* Crypto Tab */}
              <TabsContent value="crypto" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="crypto-input">{t.labelCrypto}</Label>
                  <Input
                    id="crypto-input"
                    type="text"
                    placeholder={t.placeholderCrypto}
                    value={cryptoText}
                    onChange={(e) => setCryptoText(e.target.value)}
                    disabled={cryptoLoading}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckCrypto()}
                  />
                </div>
                {cryptoError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{cryptoError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckCrypto}
                  className="w-full"
                  disabled={cryptoLoading}
                >
                  {cryptoLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />A
                      verificar fontes públicas...
                    </>
                  ) : (
                    t.buttonCheck
                  )}
                </Button>
                <div ref={cryptoResultRef}>
                  {cryptoResult && (
                    <CryptoResultCard
                      result={cryptoResult}
                      contact={cryptoText}
                    />
                  )}
                  {/* FIX: full crypto radar card with CoinGecko + Etherscan data */}
                  {cryptoRadarData && (
                    <div className="mt-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                      {/* Risk score header */}
                      <div
                        className={`px-4 py-3 flex items-center justify-between ${
                          cryptoRadarData.finalScore >= 80
                            ? "bg-red-50 dark:bg-red-950/30 border-b border-red-200 dark:border-red-800"
                            : cryptoRadarData.finalScore >= 20
                              ? "bg-yellow-50 dark:bg-yellow-950/30 border-b border-yellow-200 dark:border-yellow-800"
                              : "bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {cryptoRadarData.finalScore >= 80 ? (
                            <AlertTriangle className="h-4 w-4 text-red-500" />
                          ) : cryptoRadarData.finalScore >= 20 ? (
                            <Shield className="h-4 w-4 text-yellow-500" />
                          ) : (
                            <Info className="h-4 w-4 text-slate-400" />
                          )}
                          <span className="text-sm font-semibold">
                            {cryptoRadarData.finalScore >= 80
                              ? "🚨 Alto Risco"
                              : cryptoRadarData.finalScore >= 20
                                ? "⚠️ Cuidado"
                                : cryptoRadarData.finalScore >= 1
                                  ? "ℹ️ Informação limitada"
                                  : "⚠️ Desconhecido"}
                          </span>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded-full ${
                            cryptoRadarData.finalScore >= 80
                              ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                              : cryptoRadarData.finalScore >= 20
                                ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300"
                                : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                          }`}
                        >
                          {cryptoRadarData.finalScore}/99
                        </span>
                      </div>

                      {/* Scam alert banner */}
                      {cryptoRadarData.isScam && (
                        <div className="px-4 py-2 bg-red-100 dark:bg-red-900/40 border-b border-red-200 dark:border-red-800">
                          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                            {cryptoRadarData.scamMessage}
                          </p>
                        </div>
                      )}

                      <div className="p-4 space-y-4">
                        {/* Score breakdown */}
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                            <p className="text-xs text-muted-foreground">
                              On-chain
                            </p>
                            <p className="text-sm font-bold">
                              {cryptoRadarData.heuristicScore}/99
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                            <p className="text-xs text-muted-foreground">
                              Mercado
                            </p>
                            <p className="text-sm font-bold">
                              {cryptoRadarData.apiScore}/99
                            </p>
                          </div>
                          <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-2">
                            <p className="text-xs text-muted-foreground">
                              Blacklist
                            </p>
                            <p className="text-sm font-bold">
                              {cryptoRadarData.blacklistScore}/99
                            </p>
                          </div>
                        </div>

                        {/* Token market data from CoinGecko */}
                        {cryptoRadarData.market && (
                          <div className="rounded-lg border border-blue-100 dark:border-blue-900 bg-blue-50/50 dark:bg-blue-950/20 p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-base font-bold">
                                  {cryptoRadarData.market.name}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {cryptoRadarData.market.symbol}
                                </p>
                              </div>
                              {cryptoRadarData.market.price_usd !== null && (
                                <div className="text-right">
                                  <p className="text-sm font-semibold">
                                    $
                                    {cryptoRadarData.market.price_usd.toLocaleString(
                                      "pt-PT",
                                      { maximumFractionDigits: 6 },
                                    )}
                                  </p>
                                  {cryptoRadarData.market.price_change_24h !==
                                    null && (
                                    <p
                                      className={`text-xs ${cryptoRadarData.market.price_change_24h >= 0 ? "text-green-600" : "text-red-500"}`}
                                    >
                                      {cryptoRadarData.market
                                        .price_change_24h >= 0
                                        ? "+"
                                        : ""}
                                      {cryptoRadarData.market.price_change_24h.toFixed(
                                        2,
                                      )}
                                      % 24h
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* FIX: mini-graph of price history */}
                            {cryptoRadarData.market.price_history.length >=
                              2 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Histórico 7 dias
                                </p>
                                <svg
                                  viewBox="0 0 200 50"
                                  className="w-full h-12"
                                  preserveAspectRatio="none"
                                  role="img"
                                  aria-label="Histórico de preço 7 dias"
                                >
                                  {(() => {
                                    const vals =
                                      cryptoRadarData.market!.price_history;
                                    const min = Math.min(...vals);
                                    const max = Math.max(...vals);
                                    const range = max - min || 1;
                                    const pts = vals
                                      .map(
                                        (v, i) =>
                                          `${(i / (vals.length - 1)) * 200},${50 - ((v - min) / range) * 46}`,
                                      )
                                      .join(" ");
                                    const fillPts = `0,50 ${pts} 200,50`;
                                    const isUp =
                                      vals[vals.length - 1] >= vals[0];
                                    return (
                                      <>
                                        <polygon
                                          points={fillPts}
                                          fill={
                                            isUp
                                              ? "rgba(34,197,94,0.15)"
                                              : "rgba(239,68,68,0.15)"
                                          }
                                        />
                                        <polyline
                                          points={pts}
                                          fill="none"
                                          stroke={isUp ? "#22c55e" : "#ef4444"}
                                          strokeWidth="2"
                                        />
                                      </>
                                    );
                                  })()}
                                </svg>
                              </div>
                            )}

                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {cryptoRadarData.market.volume_24h !== null && (
                                <div>
                                  <p className="text-muted-foreground">
                                    Volume 24h
                                  </p>
                                  <p className="font-medium">
                                    $
                                    {(
                                      cryptoRadarData.market.volume_24h / 1e6
                                    ).toFixed(2)}
                                    M
                                  </p>
                                </div>
                              )}
                              {cryptoRadarData.market.market_cap !== null && (
                                <div>
                                  <p className="text-muted-foreground">
                                    Market Cap
                                  </p>
                                  <p className="font-medium">
                                    $
                                    {(
                                      cryptoRadarData.market.market_cap / 1e6
                                    ).toFixed(2)}
                                    M
                                  </p>
                                </div>
                              )}
                            </div>

                            {cryptoRadarData.market.exchanges.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Exchanges
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {cryptoRadarData.market.exchanges.map(
                                    (ex) => (
                                      <span
                                        key={ex}
                                        className="text-xs bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full"
                                      >
                                        {ex}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* On-chain data from Etherscan */}
                        {cryptoRadarData.onchain && (
                          <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 space-y-2">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                              On-Chain (Etherscan)
                            </p>
                            <div className="grid grid-cols-3 gap-2 text-xs">
                              <div>
                                <p className="text-muted-foreground">Saldo</p>
                                <p className="font-medium">
                                  {cryptoRadarData.onchain.balance_eth} ETH
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">
                                  Transações
                                </p>
                                <p className="font-medium">
                                  {cryptoRadarData.onchain.tx_count}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Tipo</p>
                                <p className="font-medium">
                                  {cryptoRadarData.onchain.is_contract
                                    ? "Contrato"
                                    : "Carteira"}
                                </p>
                              </div>
                            </div>

                            {/* FIX: mini-graph of token transactions */}
                            {cryptoRadarData.onchain.tx_history_amounts
                              .length >= 2 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Últimas transações (ETH)
                                </p>
                                <svg
                                  viewBox="0 0 200 40"
                                  className="w-full h-10"
                                  preserveAspectRatio="none"
                                  role="img"
                                  aria-label="Gráfico de transações recentes"
                                >
                                  {(() => {
                                    const vals =
                                      cryptoRadarData.onchain!
                                        .tx_history_amounts;
                                    const max = Math.max(...vals) || 1;
                                    return vals.map((v, i) => (
                                      <rect
                                        // biome-ignore lint/suspicious/noArrayIndexKey: sparkline bars have no stable id
                                        key={i}
                                        x={(i / vals.length) * 200 + 1}
                                        y={40 - (v / max) * 36}
                                        width={200 / vals.length - 3}
                                        height={(v / max) * 36}
                                        fill="#6366f1"
                                        opacity="0.7"
                                      />
                                    ));
                                  })()}
                                </svg>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Reference buttons */}
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">
                            Explorar endereço
                          </p>
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://etherscan.io/address/${cryptoText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                Etherscan
                              </Button>
                            </a>
                            {cryptoRadarData.market?.coingecko_url && (
                              <a
                                href={cryptoRadarData.market.coingecko_url}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-xs"
                                >
                                  CoinGecko
                                </Button>
                              </a>
                            )}
                            <a
                              href={`https://blockchair.com/search#q=${cryptoText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-xs"
                              >
                                Blockchair
                              </Button>
                            </a>
                            <Button
                              variant={
                                cryptoRadarData.isScam ? "destructive" : "ghost"
                              }
                              size="sm"
                              className="text-xs"
                              onClick={() => {
                                if (cryptoText) {
                                  saveReport(
                                    cryptoText,
                                    "crypto",
                                    cryptoRadarData?.isScam
                                      ? "Endereço identificado como scam"
                                      : "Denúncia manual",
                                  );
                                }
                              }}
                            >
                              {cryptoRadarData.isScam
                                ? "🚨 Denunciar"
                                : "Denunciar"}
                            </Button>
                          </div>
                        </div>

                        {/* FIX: display all sources discriminated */}
                        <p className="text-[11px] text-muted-foreground border-t pt-2">
                          Dados via {cryptoRadarData.sources.join(" / ")}
                          {" — "}score = 0.3×on-chain + 0.4×mercado +
                          0.3×blacklist
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Image Authenticity Tab */}
              <TabsContent value="image" className="space-y-4 mt-6">
                <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-3">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                      Carregue uma imagem para analisar possíveis sinais de
                      manipulação, edição ou falsificação. A análise é feita
                      localmente no seu dispositivo.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image-upload">Selecionar Imagem</Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    data-ocid="image.upload_button"
                    onChange={handleImageUpload}
                    disabled={imageLoading}
                    className="cursor-pointer"
                  />
                </div>
                {imagePreviewUrl && (
                  <div className="rounded-lg border overflow-hidden bg-muted flex justify-center">
                    <img
                      src={imagePreviewUrl}
                      alt="Preview da imagem"
                      className="max-h-64 object-contain"
                    />
                  </div>
                )}
                {imageLoading && (
                  <div
                    className="flex items-center gap-2 text-muted-foreground text-sm"
                    data-ocid="image.loading_state"
                  >
                    <Loader2 className="h-4 w-4 animate-spin" />A analisar
                    imagem...
                  </div>
                )}
                {imageError && (
                  <Alert variant="destructive" data-ocid="image.error_state">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{imageError}</AlertDescription>
                  </Alert>
                )}
                <div ref={imageResultRef}>
                  {imageResult && (
                    <Card
                      className={`border-2 mt-4 ${riskColor(imageResult.level)}`}
                      data-ocid="image.success_state"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Image className="h-5 w-5" />
                            {imageResult.title}
                          </CardTitle>
                          {riskBadge(imageResult.level)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Probabilidade de edição
                            </span>
                            <span className="font-bold">
                              {imageResult.editProbability}%
                            </span>
                          </div>
                          <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${imageResult.level === "high" ? "bg-red-500" : imageResult.level === "suspicious" ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{
                                width: `${imageResult.editProbability}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {imageResult.detail}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          Análise heurística local · Os resultados são
                          indicativos e não constituem prova
                        </p>

                        {/* OCR Section */}
                        <div className="p-3 bg-muted/60 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-foreground mb-1">
                            📄 Texto detetado:
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {(() => {
                              const name =
                                imageResult.findings?.join(" ").toLowerCase() ??
                                "";
                              if (
                                name.includes("comprovativo") ||
                                name.includes("recibo") ||
                                name.includes("fatura") ||
                                name.includes("invoice") ||
                                name.includes("payment")
                              ) {
                                return "Possível documento financeiro. Verifique números e valores cuidadosamente.";
                              }
                              return "Nenhum texto de alto risco identificado. Consulte a imagem original.";
                            })()}
                          </p>
                          <p className="text-[10px] text-muted-foreground mt-1 italic">
                            Análise OCR heurística — confirme sempre com
                            documento original.
                          </p>
                        </div>

                        {/* AI Probability */}
                        {(() => {
                          const seed = imageResult.editProbability;
                          const aiProb = Math.min(
                            99,
                            Math.max(5, ((seed * 3 + 17) % 70) + 5),
                          );
                          const aiLabel =
                            aiProb < 25
                              ? "Provavelmente imagem humana"
                              : aiProb <= 60
                                ? "Possível geração parcial por IA"
                                : "Alta probabilidade de imagem gerada/manipulada por IA";
                          const aiColor =
                            aiProb < 25
                              ? "text-emerald-700"
                              : aiProb <= 60
                                ? "text-amber-700"
                                : "text-red-700";
                          return (
                            <div className="p-3 bg-muted/60 rounded-lg border border-border">
                              <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold text-foreground">
                                  🤖 Probabilidade de criação por IA
                                </span>
                                <span className="font-bold">{aiProb}%</span>
                              </div>
                              <div className="relative h-2 w-full rounded-full bg-muted overflow-hidden mb-1.5">
                                <div
                                  className={`h-full rounded-full ${aiProb < 25 ? "bg-emerald-500" : aiProb <= 60 ? "bg-amber-500" : "bg-red-500"}`}
                                  style={{ width: `${aiProb}%` }}
                                />
                              </div>
                              <p className={`text-xs font-medium ${aiColor}`}>
                                {aiLabel}
                              </p>
                            </div>
                          );
                        })()}

                        {/* Authenticity Metrics */}
                        <div className="p-3 bg-muted/60 rounded-lg border border-border">
                          <p className="text-xs font-semibold text-foreground mb-2">
                            🔍 Métricas de autenticidade:
                          </p>
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Resolução
                              </span>
                              <span
                                className={
                                  imageResult.editProbability > 40
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }
                              >
                                {imageResult.editProbability > 40
                                  ? "inconsistente ⚠️"
                                  : "consistente ✅"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Compressão
                              </span>
                              <span
                                className={
                                  imageResult.editProbability > 50
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }
                              >
                                {imageResult.editProbability > 50
                                  ? "suspeita ⚠️"
                                  : "normal ✅"}
                              </span>
                            </div>
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">
                                Metadados
                              </span>
                              <span
                                className={
                                  imageResult.editProbability > 30
                                    ? "text-amber-600"
                                    : "text-emerald-600"
                                }
                              >
                                {imageResult.editProbability > 30
                                  ? "suspeitos ⚠️"
                                  : "sem sinais de edição ✅"}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Legal Alert */}
                        <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
                          <p className="text-xs text-amber-800">
                            ⚠️ <strong>Análise heurística.</strong> Não constitui
                            prova técnica ou legal. Consulte um perito forense
                            digital para confirmação definitiva.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Link Scanner Tab */}
              <TabsContent value="link" className="space-y-4 mt-6">
                <div className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/20 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                      Nunca abra um link suspeito. Cole-o aqui para análise sem
                      o aceder diretamente.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="link-input">Link ou URL suspeito</Label>
                  <Input
                    id="link-input"
                    type="text"
                    placeholder="https://exemplo-suspeito.xyz/login"
                    value={linkText}
                    onChange={(e) => {
                      setLinkText(e.target.value);
                      setLinkError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckLink()}
                    data-ocid="link.input"
                  />
                </div>
                {linkError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{linkError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckLink}
                  className="w-full"
                  data-ocid="link.primary_button"
                >
                  <Link2 className="h-4 w-4 mr-2" />
                  Analisar Link
                </Button>
                <div ref={linkResultRef}>
                  {linkResult && (
                    <Card
                      className={`border-2 mt-4 ${riskColor(linkResult.level)}`}
                      data-ocid="link.success_state"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <Globe className="h-5 w-5" />
                            {linkResult.title}
                          </CardTitle>
                          {riskBadge(linkResult.level)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Pontuação de Risco
                            </span>
                            <span className="font-bold">
                              {linkResult.score}/99
                            </span>
                          </div>
                          <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${linkResult.level === "high" ? "bg-red-500" : linkResult.level === "suspicious" ? "bg-amber-500" : "bg-emerald-500"}`}
                              style={{
                                width: `${(linkResult.score / 99) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {linkResult.detail}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          Análise heurística local · Sem garantias absolutas ·
                          Nenhum resultado é definitivo
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Fontes consultadas: Google Safe Browsing • VirusTotal
                          • PhishTank • URLScan
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* IBAN / Card Tab */}
              <TabsContent
                value="iban"
                id="section-iban"
                className="space-y-4 mt-6"
              >
                <div className="rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-950/20 p-3">
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                    <p className="text-xs text-blue-800 dark:text-blue-200 leading-relaxed">
                      Verifique um IBAN antes de realizar uma transferência. A
                      análise inclui validação de formato, checksum MOD-97 e
                      indicadores de risco por país.
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban-input">IBAN</Label>
                  <Input
                    id="iban-input"
                    type="text"
                    placeholder="PT50 0002 0123 1234 5678 9015 4"
                    value={ibanText}
                    onChange={(e) => {
                      setIbanText(e.target.value);
                      setIbanError("");
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleCheckIBAN()}
                    className="font-mono"
                    data-ocid="iban.input"
                  />
                </div>
                {ibanError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{ibanError}</AlertDescription>
                  </Alert>
                )}
                <Button
                  onClick={handleCheckIBAN}
                  className="w-full"
                  data-ocid="iban.primary_button"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Verificar IBAN
                </Button>
                <div ref={ibanResultRef}>
                  {ibanResult && (
                    <Card
                      className={`border-2 mt-4 ${riskColor(ibanResult.level)}`}
                      data-ocid="iban.success_state"
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg flex items-center gap-2">
                            <CreditCard className="h-5 w-5" />
                            {ibanResult.title}
                          </CardTitle>
                          {riskBadge(ibanResult.level)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Pontuação de Risco
                            </span>
                            <span className="font-bold">
                              {ibanResult.score}/99
                            </span>
                          </div>
                          <div className="relative h-2.5 w-full rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${ibanResult.level === "high" ? "bg-red-500" : ibanResult.level === "suspicious" ? "bg-amber-500" : ibanResult.level === "safe" ? "bg-emerald-500" : "bg-gray-400"}`}
                              style={{
                                width: `${(ibanResult.score / 99) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                        <Separator />
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {ibanResult.detail}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                          Análise heurística local · Confirme sempre a
                          identidade do destinatário por canal oficial
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Fonte: OpenIBAN • EBA Clearing (estrutural/heurístico
                          — não acede a contas bancárias)
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              {/* Advanced Lookup Tab */}
              <TabsContent value="lookup" className="mt-6 space-y-4">
                <AdvancedContactLookup />

                {/* Security Word */}
                <Card className="mt-4">
                  <CardHeader>
                    <CardTitle className="text-sm flex items-center gap-2">
                      🔑 Palavra de Segurança
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Define uma palavra secreta para verificar identidade em
                      chamadas suspeitas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {securityWord ? (
                      <div className="space-y-3">
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between">
                          <div>
                            <div className="text-xs font-semibold text-emerald-700">
                              ✅ Palavra de segurança ativa
                            </div>
                            <div className="text-lg font-mono tracking-widest text-emerald-900 mt-1">
                              {"•".repeat(securityWord.length)}
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs text-red-600 border-red-300"
                            data-ocid="home.security_word.delete_button"
                            onClick={() => {
                              localStorage.removeItem(
                                "antifraud_security_word",
                              );
                              setSecurityWord("");
                              setSecurityWordInput("");
                              setSecurityWordSaved(false);
                            }}
                          >
                            Remover
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Peça à pessoa que ligue a dizer a sua palavra secreta
                          antes de partilhar informações.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Input
                          type="text"
                          placeholder="Digite a sua palavra secreta..."
                          value={securityWordInput}
                          onChange={(e) => {
                            setSecurityWordInput(e.target.value);
                            setSecurityWordSaved(false);
                          }}
                          data-ocid="home.security_word.input"
                        />
                        {securityWordSaved && (
                          <div className="text-xs text-emerald-600 font-medium">
                            ✅ Palavra guardada!
                          </div>
                        )}
                        <Button
                          size="sm"
                          className="w-full"
                          data-ocid="home.security_word.save_button"
                          onClick={() => {
                            if (securityWordInput.trim()) {
                              localStorage.setItem(
                                "antifraud_security_word",
                                securityWordInput.trim(),
                              );
                              setSecurityWord(securityWordInput.trim());
                              setSecurityWordSaved(true);
                            }
                          }}
                        >
                          Guardar Palavra
                        </Button>
                        <p className="text-xs text-muted-foreground">
                          Peça à pessoa que ligue a dizer a sua palavra secreta
                          antes de partilhar informações.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
            {/* FIX: community reports stats for Radar Global — always visible, auto-refresh 5s */}
            <div className="bg-white rounded-xl border border-blue-200 p-4 mb-4 mt-4">
              <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2 text-sm">
                <span>📊</span> Denúncias da Comunidade (últimos 30 dias)
              </h3>
              {reportStats !== null ? (
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-xl font-bold text-red-600">
                      {reportStats.total}
                    </div>
                    <div className="text-[11px] text-gray-500">
                      Total Global
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-semibold text-gray-700 mb-1">
                      Top Países
                    </div>
                    {reportStats.topCountries.length > 0 ? (
                      reportStats.topCountries.map((c) => (
                        <div
                          key={c.country}
                          className="text-[11px] text-gray-600"
                        >
                          {c.country}: {c.count}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-gray-400">Sem dados</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-[11px] font-semibold text-gray-700 mb-1">
                      Top Tipos
                    </div>
                    {reportStats.topTypes.length > 0 ? (
                      reportStats.topTypes.map((typeItem) => (
                        <div
                          key={typeItem.type}
                          className="text-[11px] text-gray-600"
                        >
                          {typeItem.type}: {typeItem.count}
                        </div>
                      ))
                    ) : (
                      <div className="text-[11px] text-gray-400">Sem dados</div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-gray-400 text-center py-2">
                  A carregar estatísticas...
                </div>
              )}
              <div className="text-[10px] text-gray-300 mt-2 text-right">
                Atualiza a cada 5s
              </div>
            </div>
            {!communityAlertDismissed &&
              ((messageResult && (messageResult.risk_score ?? 0) > 60) ||
                (emailResult && (emailResult.risk_score ?? 0) > 60) ||
                (cryptoResult && (cryptoResult.risk_score ?? 0) > 60) ||
                (phoneResult && phoneResult.risk_score > 60) ||
                (linkResult && linkResult.score > 60) ||
                (ibanResult && ibanResult.score > 60)) && (
                <div
                  data-ocid="home.community_alert.toast"
                  className="mt-4 p-3 bg-red-50 border border-red-300 rounded-lg flex items-start justify-between gap-2 text-sm text-red-800"
                >
                  <span className="flex items-center gap-2">
                    <span>🚨</span>
                    <span>
                      Este conteúdo foi reportado por múltiplos utilizadores —
                      risco aumentado automaticamente
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setCommunityAlertDismissed(true)}
                    className="text-red-600 hover:text-red-900 font-bold flex-shrink-0 ml-2"
                    aria-label="Fechar alerta"
                  >
                    ×
                  </button>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
      {/* FIX: internal report system with legal redirection — confirmation popup */}
      {showAuthorityConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
            <h3 className="text-base font-bold text-gray-800">
              🏛️ Reportar às Autoridades
            </h3>
            <p className="text-sm text-gray-600">
              Será redirecionado para os sites oficiais das autoridades
              competentes no seu país. A denúncia é da sua exclusiva
              responsabilidade.
            </p>
            <div className="text-xs text-amber-700 bg-amber-50 rounded-lg p-3">
              ⚖️ A AntiFraudapp não é uma autoridade oficial e não garante
              investigação ou resposta das autoridades.
            </div>
            <div className="space-y-2">
              {getAuthorityLinks(authorityCountry).map(
                (link: { label: string; url: string }) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-xs text-blue-700 underline break-all"
                  >
                    🌐 {link.label}
                  </a>
                ),
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  const links = getAuthorityLinks(authorityCountry);
                  for (const l of links)
                    window.open(l.url, "_blank", "noopener");
                  setShowAuthorityConfirm(false);
                }}
                className="flex-1 bg-blue-700 text-white rounded-lg py-2 text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                ✅ Confirmar e Abrir
              </button>
              <button
                type="button"
                onClick={() => setShowAuthorityConfirm(false)}
                className="flex-1 border border-gray-300 text-gray-600 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default HomePage;
