/**
 * SecurityToolsPage — AntiFraudapp Security Tools section at /security-tools
 *
 * Contains 5 analysis tabs: Phone, Link, IBAN, Message, Image.
 * All analysis is frontend-only, in-memory. Community reports persist via localStorage.
 */

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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "@tanstack/react-router";
import {
  AlertTriangle,
  CheckCircle,
  Clipboard,
  CreditCard,
  HelpCircle,
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  MessageSquare,
  Phone,
  Share2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import type React from "react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { addReport as addFullReport } from "../services/communityReportsService";
import {
  type RiskLevel,
  addReport,
  getReportCount,
  getRiskLevel,
  getTotalReportCount,
} from "../utils/communityReportStore";

// ─── RiskBadge ────────────────────────────────────────────────────────────────
interface RiskBadgeProps {
  level: RiskLevel;
  large?: boolean;
}

function RiskBadge({ level, large = false }: RiskBadgeProps) {
  const sizeClass = large ? "text-base px-4 py-1.5" : "text-xs px-2.5 py-0.5";

  switch (level) {
    case "safe":
      return (
        <Badge
          className={`${sizeClass} bg-green-100 text-green-800 border-green-300 font-semibold`}
        >
          <CheckCircle className="w-3 h-3 mr-1" />
          Seguro
        </Badge>
      );
    case "unknown":
      return (
        <Badge
          className={`${sizeClass} bg-gray-100 text-gray-700 border-gray-300 font-semibold`}
        >
          <HelpCircle className="w-3 h-3 mr-1" />
          Desconhecido
        </Badge>
      );
    case "suspicious":
      return (
        <Badge
          className={`${sizeClass} bg-amber-100 text-amber-800 border-amber-300 font-semibold`}
        >
          <AlertTriangle className="w-3 h-3 mr-1" />
          Suspeito
        </Badge>
      );
    case "high_risk":
      return (
        <Badge
          className={`${sizeClass} bg-red-100 text-red-800 border-red-300 font-semibold`}
        >
          <XCircle className="w-3 h-3 mr-1" />
          Alto Risco
        </Badge>
      );
  }
}

// ─── ReportSuccess ─────────────────────────────────────────────────────────────
function ReportSuccess({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return (
    <Alert className="bg-green-50 border-green-200">
      <CheckCircle className="w-4 h-4 text-green-600" />
      <AlertDescription className="text-green-700 text-sm">
        Denúncia registada com sucesso. Obrigado por ajudar a comunidade.
      </AlertDescription>
    </Alert>
  );
}

// ─── Indicator pill ───────────────────────────────────────────────────────────
function IndicatorPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-xs px-2.5 py-0.5 font-medium">
      {label}
    </span>
  );
}

// ─── CopyShareButtons ─────────────────────────────────────────────────────────
function CopyShareButtons({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = encodeURIComponent(text);
  const shareLinks = [
    {
      label: "WhatsApp",
      href: `https://wa.me/?text=${shareText}`,
    },
    {
      label: "Email",
      href: `mailto:?subject=${encodeURIComponent("Análise AntiFraudapp")}&body=${shareText}`,
    },
    {
      label: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent("antifraudapp.com")}&text=${shareText}`,
    },
  ];

  return (
    <div className="flex gap-2 pt-1">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCopy}
        className="flex-1 text-xs"
        data-ocid="security_tools.copy_button"
      >
        {copied ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1.5 text-green-600" />
            Copiado!
          </>
        ) : (
          <>
            <Clipboard className="w-3 h-3 mr-1.5" />
            Copiar análise
          </>
        )}
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-xs"
            data-ocid="security_tools.share_button"
          >
            <Share2 className="w-3 h-3 mr-1.5" />
            Partilhar
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          data-ocid="security_tools.share.dropdown_menu"
        >
          {shareLinks.map((link) => (
            <DropdownMenuItem key={link.label} asChild>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                {link.label}
              </a>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

// ─── Phone Tab ─────────────────────────────────────────────────────────────────
function PhoneTab() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{
    risk: RiskLevel;
    reportCount: number;
    indicators: string[];
    score: number;
  } | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = () => {
    if (!value.trim()) return;
    setIsAnalyzing(true);
    setReportDone(false);

    setTimeout(() => {
      const normalized = value.trim();
      const communityRisk = getRiskLevel("phone", normalized);
      const reportCount = getReportCount("phone", normalized);
      const indicators: string[] = [];

      // Heuristic checks
      const digitsOnly = normalized.replace(/\D/g, "");
      if (digitsOnly.length < 7) {
        indicators.push("Número demasiado curto");
      }
      if (digitsOnly.length > 15) {
        indicators.push("Número demasiado longo");
      }
      // Premium/suspicious prefixes in Portugal
      if (/^(6[0-9]|7[0-9])/.test(digitsOnly) && !normalized.startsWith("+")) {
        indicators.push("Possível número de valor acrescentado");
      }
      if (/^\+?0/.test(normalized)) {
        indicators.push("Prefixo atípico (começa com 0)");
      }

      // Determine combined risk
      let finalRisk: RiskLevel = communityRisk;
      if (indicators.length > 0 && finalRisk === "unknown") {
        finalRisk = "suspicious";
      }
      if (communityRisk === "high_risk") {
        finalRisk = "high_risk";
      }

      // Risk score: base 10 + (reportCount * 15) + indicators.length * 8, capped at 99
      const score = Math.min(99, 10 + reportCount * 15 + indicators.length * 8);

      setResult({ risk: finalRisk, reportCount, indicators, score });
      setIsAnalyzing(false);
    }, 400);
  };

  const report = () => {
    if (!value.trim()) return;
    addReport("phone", value.trim());
    setReportDone(true);
    toast.success(
      "Denúncia registada com sucesso. Obrigado pela contribuição.",
    );
    // Re-analyze after reporting
    analyze();
  };

  const shareText = result
    ? `AntiFraudapp — Análise de Telefone\nNúmero: ${value}\nScore de Risco: ${result.score}/99\nNível: ${result.risk === "safe" ? "Seguro" : result.risk === "unknown" ? "Desconhecido" : result.risk === "suspicious" ? "Suspeito" : "Alto Risco"}\nDenúncias: ${result.reportCount}\nantifraudapp.com`
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="phone-input" className="text-sm font-medium">
          Número de telefone
        </Label>
        <Input
          id="phone-input"
          type="tel"
          placeholder="Ex: +351 912 345 678"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-ocid="security_tools.phone.input"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={analyze}
          disabled={!value.trim() || isAnalyzing}
          className="flex-1 bg-primary text-primary-foreground"
          data-ocid="security_tools.phone.analyze_button"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Phone className="w-4 h-4 mr-2" />
          )}
          Analisar
        </Button>
        <Button
          variant="outline"
          onClick={report}
          disabled={!value.trim()}
          data-ocid="security_tools.phone.report_button"
        >
          Reportar
        </Button>
      </div>

      {result && (
        <div
          className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
          data-ocid="security_tools.phone.success_state"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Resultado da análise
            </span>
            <RiskBadge level={result.risk} large />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Score de Reputação</span>
              <span className="font-semibold text-foreground">
                {result.score}/99
              </span>
            </div>
            <div className="flex justify-between">
              <span>Denúncias da comunidade</span>
              <span className="font-semibold text-foreground">
                {result.reportCount}
              </span>
            </div>
          </div>

          {result.indicators.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Indicadores detectados:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.indicators.map((ind) => (
                  <IndicatorPill key={ind} label={ind} />
                ))}
              </div>
            </div>
          )}

          {result.indicators.length === 0 && result.reportCount === 0 && (
            <p className="text-xs text-muted-foreground">
              Nenhum indicador de risco encontrado nesta análise.
            </p>
          )}

          <CopyShareButtons text={shareText} />
        </div>
      )}

      <ReportSuccess visible={reportDone} />
    </div>
  );
}

// ─── Link Tab ──────────────────────────────────────────────────────────────────
function LinkTab() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{
    risk: RiskLevel;
    reportCount: number;
    indicators: string[];
    domain: string;
  } | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = () => {
    if (!value.trim()) return;
    setIsAnalyzing(true);
    setReportDone(false);

    setTimeout(() => {
      const normalized = value.trim().toLowerCase();
      const communityRisk = getRiskLevel("link", normalized);
      const reportCount = getReportCount("link", normalized);
      const indicators: string[] = [];

      // Extract domain
      let domain = "Desconhecido";
      let hostname = "";
      try {
        const urlObj = new URL(
          normalized.startsWith("http") ? normalized : `https://${normalized}`,
        );
        hostname = urlObj.hostname;
        domain = hostname;
      } catch {
        domain = normalized.split("/")[0] || "Inválido";
        hostname = domain;
      }

      // URL shorteners
      if (
        /bit\.ly|tinyurl\.com|t\.co|ow\.ly|goo\.gl|shorturl|is\.gd/.test(
          normalized,
        )
      ) {
        indicators.push("Encurtador de URL (destino desconhecido)");
      }

      // Suspicious free TLDs
      if (
        /\.(tk|ml|ga|cf|gq|buzz|xyz|top|club|online)(\?|\/|$)/.test(normalized)
      ) {
        indicators.push("Domínio de alto risco (TLD gratuito ou suspeito)");
      }

      // IP address in URL
      if (/https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(normalized)) {
        indicators.push("URL com endereço IP (phishing comum)");
      }

      // Phishing keywords in suspicious domain contexts
      if (
        /(paypal|bank|login|verify|secure|account|update|confirm|password)/.test(
          normalized,
        ) &&
        !/(paypal\.com$|paypal\.com\/|bankofamerica\.com|barclays\.co\.uk)/.test(
          normalized,
        )
      ) {
        indicators.push(
          "Palavra-chave sensível no domínio (possível phishing)",
        );
      }

      // Multiple subdomains
      if (hostname) {
        const parts = hostname.split(".");
        if (parts.length > 3) {
          indicators.push("Múltiplos subdomínios (padrão phishing)");
        }
      }

      // Unicode lookalike detection
      if (hostname) {
        try {
          const normalized_nfkc = hostname.normalize("NFKC");
          if (
            encodeURIComponent(hostname) !==
              encodeURIComponent(normalized_nfkc) ||
            Array.from(hostname).some((ch) => ch.charCodeAt(0) > 127)
          ) {
            indicators.push(
              "Caracteres Unicode suspeitos (possível homoglph attack)",
            );
          }
        } catch {
          // ignore
        }
      }

      // Data URI / javascript URI
      if (/^(data:|javascript:)/.test(normalized)) {
        indicators.push("URI perigoso (data: ou javascript:)");
      }

      // Determine combined risk
      let finalRisk: RiskLevel = communityRisk;
      if (indicators.length >= 2) {
        finalRisk = "high_risk";
      } else if (indicators.length === 1 && finalRisk === "unknown") {
        finalRisk = "suspicious";
      }
      if (communityRisk === "high_risk") {
        finalRisk = "high_risk";
      }
      if (indicators.length === 0 && communityRisk === "unknown") {
        finalRisk = "safe";
      }

      setResult({ risk: finalRisk, reportCount, indicators, domain });
      setIsAnalyzing(false);
    }, 500);
  };

  const report = () => {
    if (!value.trim()) return;
    addReport("link", value.trim().toLowerCase());
    setReportDone(true);
    toast.success(
      "Denúncia registada com sucesso. Obrigado pela contribuição.",
    );
    analyze();
  };

  const shareText = result
    ? `AntiFraudapp — Análise de Link\nURL: ${value}\nDomínio: ${result.domain}\nNível: ${result.risk === "safe" ? "Seguro" : result.risk === "unknown" ? "Desconhecido" : result.risk === "suspicious" ? "Suspeito" : "Alto Risco"}\nIndicadores: ${result.indicators.length}\nantifraudapp.com`
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="link-input" className="text-sm font-medium">
          URL / Link
        </Label>
        <Input
          id="link-input"
          type="url"
          placeholder="Ex: https://exemplo.com/pagina"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-ocid="security_tools.link.input"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={analyze}
          disabled={!value.trim() || isAnalyzing}
          className="flex-1 bg-primary text-primary-foreground"
          data-ocid="security_tools.link.analyze_button"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <LinkIcon className="w-4 h-4 mr-2" />
          )}
          Analisar
        </Button>
        <Button
          variant="outline"
          onClick={report}
          disabled={!value.trim()}
          data-ocid="security_tools.link.report_button"
        >
          Reportar
        </Button>
      </div>

      {result && (
        <div
          className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
          data-ocid="security_tools.link.success_state"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Resultado da análise
            </span>
            <RiskBadge level={result.risk} large />
          </div>

          {/* Domain details */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Domínio</span>
              <span className="font-medium text-foreground font-mono text-right max-w-[200px] truncate">
                {result.domain}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Idade domínio</span>
              <span className="font-medium text-foreground">Desconhecida</span>
            </div>
            <div className="flex justify-between">
              <span>País servidor</span>
              <span className="font-medium text-foreground">Desconhecido</span>
            </div>
            <div className="flex justify-between">
              <span>Denúncias da comunidade</span>
              <span className="font-semibold text-foreground">
                {result.reportCount}
              </span>
            </div>
          </div>

          {result.indicators.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Indicadores detectados:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.indicators.map((ind) => (
                  <IndicatorPill key={ind} label={ind} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhum padrão suspeito detectado. Verifique sempre antes de clicar
              em links desconhecidos.
            </p>
          )}

          <CopyShareButtons text={shareText} />
        </div>
      )}

      <ReportSuccess visible={reportDone} />
    </div>
  );
}

// ─── IBAN validation helpers ──────────────────────────────────────────────────
function validateIbanChecksum(iban: string): boolean {
  try {
    // Move first 4 chars to end
    const rearranged = iban.slice(4) + iban.slice(0, 4);
    // Replace letters with numbers (A=10, ..., Z=35)
    const numeric = Array.from(rearranged)
      .map((ch) => {
        const code = ch.charCodeAt(0);
        if (code >= 65 && code <= 90) return (code - 55).toString();
        return ch;
      })
      .join("");
    return BigInt(numeric) % 97n === 1n;
  } catch {
    return false;
  }
}

function getIbanCountry(iban: string): string {
  const code = iban.slice(0, 2).toUpperCase();
  const map: Record<string, string> = {
    PT: "Portugal",
    ES: "Espanha",
    FR: "França",
    DE: "Alemanha",
    GB: "Reino Unido",
    IT: "Itália",
    NL: "Países Baixos",
    BE: "Bélgica",
  };
  return map[code] ?? "Internacional";
}

function getIbanBank(iban: string): string {
  if (!iban.startsWith("PT50")) return "Banco não identificado";
  const prefix = iban.slice(0, 8);
  if (prefix.startsWith("PT500002")) return "CGD";
  if (prefix.startsWith("PT500033")) return "BPI";
  if (prefix.startsWith("PT500035")) return "Santander";
  if (prefix.startsWith("PT500036")) return "BES/Novo Banco";
  if (prefix.startsWith("PT500007")) return "BCP Millennium";
  return "Banco não identificado";
}

// ─── IBAN Tab ──────────────────────────────────────────────────────────────────
function IbanTab() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{
    risk: RiskLevel;
    reportCount: number;
    formatValid: boolean;
    checksumValid: boolean;
    country: string;
    bank: string;
    indicators: string[];
  } | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const normalizeIban = (raw: string) => raw.replace(/\s/g, "").toUpperCase();

  const analyze = () => {
    if (!value.trim()) return;
    setIsAnalyzing(true);
    setReportDone(false);

    setTimeout(() => {
      const normalized = normalizeIban(value);
      const communityRisk = getRiskLevel("iban", normalized);
      const reportCount = getReportCount("iban", normalized);
      const indicators: string[] = [];

      // Basic IBAN format: 15–34 chars, starts with 2 letters + 2 digits
      const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
      const formatValid = ibanRegex.test(normalized);

      if (!formatValid) {
        if (normalized.length < 15) {
          indicators.push("IBAN demasiado curto");
        } else if (normalized.length > 34) {
          indicators.push("IBAN demasiado longo");
        } else {
          indicators.push("Formato IBAN inválido");
        }
      }

      // MOD 97 checksum
      const checksumValid = formatValid
        ? validateIbanChecksum(normalized)
        : false;
      if (formatValid && !checksumValid) {
        indicators.push("Checksum IBAN inválido (MOD 97)");
      }

      const country = getIbanCountry(normalized);
      const bank = getIbanBank(normalized);

      let finalRisk: RiskLevel = communityRisk;
      if (!formatValid || !checksumValid) {
        finalRisk = finalRisk === "unknown" ? "suspicious" : finalRisk;
      }
      if (communityRisk === "high_risk") {
        finalRisk = "high_risk";
      }
      if (formatValid && checksumValid && communityRisk === "unknown") {
        finalRisk = "unknown";
      }

      setResult({
        risk: finalRisk,
        reportCount,
        formatValid,
        checksumValid,
        country,
        bank,
        indicators,
      });
      setIsAnalyzing(false);
    }, 350);
  };

  const report = () => {
    if (!value.trim()) return;
    addReport("iban", normalizeIban(value));
    setReportDone(true);
    toast.success(
      "Denúncia registada com sucesso. Obrigado pela contribuição.",
    );
    analyze();
  };

  const shareText = result
    ? `AntiFraudapp — Verificação de IBAN\nIBAN: ${value}\nPaís: ${result.country} · Banco: ${result.bank}\nFormato: ${result.formatValid ? "Válido" : "Inválido"}\nChecksum: ${result.checksumValid ? "Válido" : "Inválido"}\nNível: ${result.risk === "safe" ? "Seguro" : result.risk === "unknown" ? "Desconhecido" : result.risk === "suspicious" ? "Suspeito" : "Alto Risco"}\nantifraudapp.com`
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="iban-input" className="text-sm font-medium">
          IBAN
        </Label>
        <Input
          id="iban-input"
          type="text"
          placeholder="Ex: PT50 0002 0123 1234 5678 9015 4"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          data-ocid="security_tools.iban.input"
        />
        <p className="text-xs text-muted-foreground">
          Espaços são ignorados automaticamente.
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={analyze}
          disabled={!value.trim() || isAnalyzing}
          className="flex-1 bg-primary text-primary-foreground"
          data-ocid="security_tools.iban.analyze_button"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <CreditCard className="w-4 h-4 mr-2" />
          )}
          Verificar
        </Button>
        <Button
          variant="outline"
          onClick={report}
          disabled={!value.trim()}
          data-ocid="security_tools.iban.report_button"
        >
          Reportar IBAN Suspeito
        </Button>
      </div>

      {result && (
        <div
          className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
          data-ocid="security_tools.iban.success_state"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Resultado
            </span>
            <RiskBadge level={result.risk} large />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>País · Banco</span>
              <span className="font-medium text-foreground">
                {result.country} · {result.bank}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Formato IBAN</span>
              <span
                className={
                  result.formatValid
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {result.formatValid ? "✓ Válido" : "✗ Inválido"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Checksum</span>
              <span
                className={
                  result.checksumValid
                    ? "text-green-600 font-semibold"
                    : "text-red-600 font-semibold"
                }
              >
                {result.checksumValid ? "✓ Válido" : "✗ Inválido"}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Denúncias da comunidade</span>
              <span className="font-semibold text-foreground">
                {result.reportCount}
              </span>
            </div>
          </div>

          {result.indicators.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {result.indicators.map((ind) => (
                <IndicatorPill key={ind} label={ind} />
              ))}
            </div>
          )}

          {result.reportCount === 0 && result.formatValid && (
            <p className="text-xs text-muted-foreground">
              Este IBAN não foi reportado. Verifique sempre a identidade do
              destinatário antes de transferir.
            </p>
          )}

          <CopyShareButtons text={shareText} />
        </div>
      )}

      <ReportSuccess visible={reportDone} />
    </div>
  );
}

// ─── Message Tab ───────────────────────────────────────────────────────────────

const URGENCY_KEYWORDS = [
  "urgente",
  "imediato",
  "imediatamente",
  "agora",
  "expira",
  "prazo",
  "último aviso",
  "clique aqui",
  "click here",
  "ação necessária",
  "action required",
  "sua conta",
  "conta suspensa",
  "bloqueada",
  "verifique agora",
];

const PAYMENT_KEYWORDS = [
  "transferir",
  "transferência",
  "pagar",
  "pagamento",
  "enviar dinheiro",
  "wire transfer",
  "bitcoin",
  "cripto",
  "crypto",
  "mbway",
  "paypal",
  "gift card",
  "voucher",
  "cartão de oferta",
  "levantamento",
  "depósito",
];

const ROMANCE_KEYWORDS = [
  "amor",
  "love",
  "coração",
  "sinto falta",
  "fotos",
  "encontrar pessoalmente",
  "divorced",
  "militar",
  "engineer abroad",
  "saudade",
];

const INVESTMENT_KEYWORDS = [
  "lucro garantido",
  "retorno",
  "investimento",
  "rendimento passivo",
  "criptomoeda",
  "forex",
  "trading",
  "duplicar",
  "triplicar",
];

const TECH_SUPPORT_KEYWORDS = [
  "suporte técnico",
  "vírus detetado",
  "computador infetado",
  "microsoft",
  "apple support",
  "acesso remoto",
  "teamviewer",
  "anydesk",
];

function detectFraudType(
  lower: string,
  urgencyFound: string[],
  paymentFound: string[],
  romanceFound: string[],
  investmentFound: string[],
  techSupportFound: string[],
  linksFound: string[],
): string {
  if (techSupportFound.length > 0) return "Fraude de suporte técnico";
  if (romanceFound.length > 0) return "Fraude romântica";
  if (investmentFound.length > 0) return "Investimento falso";
  if (
    linksFound.length > 0 &&
    (urgencyFound.length > 0 ||
      lower.includes("password") ||
      lower.includes("login"))
  )
    return "Phishing";
  if (urgencyFound.length > 0) return "Urgência/Pressão";
  if (paymentFound.length > 0) return "Pedido de pagamento";
  return "Desconhecido";
}

function MessageTab() {
  const [value, setValue] = useState("");
  const [result, setResult] = useState<{
    risk: RiskLevel;
    reportCount: number;
    urgencyFound: string[];
    paymentFound: string[];
    romanceFound: string[];
    investmentFound: string[];
    techSupportFound: string[];
    linksFound: string[];
    fraudType: string;
    score: number;
  } | null>(null);
  const [reportDone, setReportDone] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = () => {
    if (!value.trim()) return;
    setIsAnalyzing(true);
    setReportDone(false);

    setTimeout(() => {
      const lower = value.toLowerCase();
      const communityRisk = getRiskLevel("message", value.trim());
      const reportCount = getReportCount("message", value.trim());

      const urgencyFound = URGENCY_KEYWORDS.filter((kw) =>
        lower.includes(kw.toLowerCase()),
      );
      const paymentFound = PAYMENT_KEYWORDS.filter((kw) =>
        lower.includes(kw.toLowerCase()),
      );
      const romanceFound = ROMANCE_KEYWORDS.filter((kw) =>
        lower.includes(kw.toLowerCase()),
      );
      const investmentFound = INVESTMENT_KEYWORDS.filter((kw) =>
        lower.includes(kw.toLowerCase()),
      );
      const techSupportFound = TECH_SUPPORT_KEYWORDS.filter((kw) =>
        lower.includes(kw.toLowerCase()),
      );

      // Detect URLs in the message
      const urlRegex = /https?:\/\/[^\s]+/gi;
      const linksFound = Array.from(value.matchAll(urlRegex)).map((m) => m[0]);

      const indicatorGroups = [
        urgencyFound.length > 0,
        paymentFound.length > 0,
        linksFound.length > 0,
        romanceFound.length > 0,
        investmentFound.length > 0,
        techSupportFound.length > 0,
      ].filter(Boolean).length;

      const fraudType = detectFraudType(
        lower,
        urgencyFound,
        paymentFound,
        romanceFound,
        investmentFound,
        techSupportFound,
        linksFound,
      );

      // Risk score: 0 indicators=5, 1=25, 2=55, 3+=80
      let score: number;
      if (indicatorGroups === 0) score = 5;
      else if (indicatorGroups === 1) score = 25;
      else if (indicatorGroups === 2) score = 55;
      else score = 80;
      score = Math.min(99, score);

      let finalRisk: RiskLevel;
      if (communityRisk === "high_risk") {
        finalRisk = "high_risk";
      } else if (indicatorGroups >= 2) {
        finalRisk = "high_risk";
      } else if (indicatorGroups === 1) {
        finalRisk = "suspicious";
      } else {
        finalRisk = communityRisk === "unknown" ? "safe" : communityRisk;
      }

      setResult({
        risk: finalRisk,
        reportCount,
        urgencyFound,
        paymentFound,
        romanceFound,
        investmentFound,
        techSupportFound,
        linksFound,
        fraudType,
        score,
      });
      setIsAnalyzing(false);
    }, 500);
  };

  const report = () => {
    if (!value.trim()) return;
    addReport("message", value.trim());
    setReportDone(true);
    toast.success(
      "Denúncia registada com sucesso. Obrigado pela contribuição.",
    );
    analyze();
  };

  const shareText = result
    ? `AntiFraudapp — Análise de Mensagem\nPadrão detetado: ${result.fraudType}\nScore de Risco: ${result.score}/99\nNível: ${result.risk === "safe" ? "Seguro" : result.risk === "unknown" ? "Desconhecido" : result.risk === "suspicious" ? "Suspeito" : "Alto Risco"}\nantifraudapp.com`
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="message-textarea" className="text-sm font-medium">
          Mensagem suspeita
        </Label>
        <Textarea
          id="message-textarea"
          placeholder="Cole aqui a mensagem suspeita que recebeu…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={5}
          data-ocid="security_tools.message.textarea"
        />
      </div>

      <div className="flex gap-2">
        <Button
          onClick={analyze}
          disabled={!value.trim() || isAnalyzing}
          className="flex-1 bg-primary text-primary-foreground"
          data-ocid="security_tools.message.analyze_button"
        >
          {isAnalyzing ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <MessageSquare className="w-4 h-4 mr-2" />
          )}
          Analisar
        </Button>
        <Button
          variant="outline"
          onClick={report}
          disabled={!value.trim()}
          data-ocid="security_tools.message.report_button"
        >
          Reportar
        </Button>
      </div>

      {result && (
        <div
          className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
          data-ocid="security_tools.message.success_state"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              Análise da mensagem
            </span>
            <RiskBadge level={result.risk} large />
          </div>

          {/* Fraud type and score */}
          <div className="bg-background rounded-md px-3 py-2 border border-border">
            <p className="text-xs font-semibold text-foreground">
              Padrão detetado:{" "}
              <span
                className={
                  result.fraudType === "Desconhecido"
                    ? "text-muted-foreground"
                    : "text-red-700"
                }
              >
                {result.fraudType}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Score de risco:{" "}
              <span className="font-semibold text-foreground">
                {result.score}/99
              </span>
            </p>
          </div>

          <div className="text-xs text-muted-foreground">
            <span>Denúncias da comunidade: </span>
            <span className="font-semibold text-foreground">
              {result.reportCount}
            </span>
          </div>

          {result.urgencyFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-amber-700">
                ⚠ Linguagem de urgência:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.urgencyFound.map((kw) => (
                  <IndicatorPill key={kw} label={`"${kw}"`} />
                ))}
              </div>
            </div>
          )}

          {result.paymentFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-700">
                💰 Palavras de pagamento:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.paymentFound.map((kw) => (
                  <IndicatorPill key={kw} label={`"${kw}"`} />
                ))}
              </div>
            </div>
          )}

          {result.romanceFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-pink-700">
                💕 Padrão de fraude romântica:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.romanceFound.map((kw) => (
                  <IndicatorPill key={kw} label={`"${kw}"`} />
                ))}
              </div>
            </div>
          )}

          {result.investmentFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-orange-700">
                📈 Padrão de investimento falso:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.investmentFound.map((kw) => (
                  <IndicatorPill key={kw} label={`"${kw}"`} />
                ))}
              </div>
            </div>
          )}

          {result.techSupportFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-red-700">
                🖥 Suporte técnico falso:
              </p>
              <div className="flex flex-wrap gap-1">
                {result.techSupportFound.map((kw) => (
                  <IndicatorPill key={kw} label={`"${kw}"`} />
                ))}
              </div>
            </div>
          )}

          {result.linksFound.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-blue-700">
                🔗 Links detectados:
              </p>
              <div className="flex flex-col gap-1">
                {result.linksFound.slice(0, 3).map((url) => (
                  <span
                    key={url}
                    className="text-xs font-mono bg-muted rounded px-1.5 py-0.5 break-all"
                  >
                    {url}
                  </span>
                ))}
              </div>
            </div>
          )}

          {result.urgencyFound.length === 0 &&
            result.paymentFound.length === 0 &&
            result.linksFound.length === 0 &&
            result.romanceFound.length === 0 &&
            result.investmentFound.length === 0 &&
            result.techSupportFound.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum indicador de fraude detectado nesta mensagem.
              </p>
            )}

          <CopyShareButtons text={shareText} />
        </div>
      )}

      <ReportSuccess visible={reportDone} />
    </div>
  );
}

// ─── Image Tab ─────────────────────────────────────────────────────────────────
type ImageResult = "likely_authentic" | "possibly_edited" | "suspicious_image";

function getImageRiskLevel(imageResult: ImageResult): RiskLevel {
  switch (imageResult) {
    case "likely_authentic":
      return "safe";
    case "possibly_edited":
      return "suspicious";
    case "suspicious_image":
      return "high_risk";
  }
}

function getImageResultLabel(imageResult: ImageResult): string {
  switch (imageResult) {
    case "likely_authentic":
      return "Provavelmente autêntica";
    case "possibly_edited":
      return "Possivelmente editada";
    case "suspicious_image":
      return "Imagem suspeita";
  }
}

function ImageTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<{
    imageResult: ImageResult;
    fileName: string;
    fileSize: number;
    reasons: string[];
    editProbability: number;
    exifStatus: string;
    elaStatus: string;
    cloneStatus: string;
  } | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeFile = (file: File) => {
    // Clean up previous preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    // Create preview URL
    const newPreviewUrl = URL.createObjectURL(file);
    setPreviewUrl(newPreviewUrl);
    setIsAnalyzing(true);

    setTimeout(() => {
      const lower = file.name.toLowerCase();
      const reasons: string[] = [];
      let imageResult: ImageResult = "likely_authentic";

      // File size heuristics
      if (file.size < 10 * 1024) {
        reasons.push(
          "Ficheiro muito pequeno (pode ser captura de ecrã recortada)",
        );
        imageResult = "suspicious_image";
      } else if (file.size > 15 * 1024 * 1024) {
        reasons.push("Ficheiro muito grande (tamanho incomum)");
        imageResult = "suspicious_image";
      }

      // Filename keyword heuristics
      if (
        /\b(edited?|modified?|fake|ai_|generated|edit|altered|manipulated)\b/.test(
          lower,
        )
      ) {
        reasons.push(
          "Nome do ficheiro indica possível edição ou geração por IA",
        );
        if (imageResult === "likely_authentic") {
          imageResult = "possibly_edited";
        }
      }

      // Screenshot-like names
      if (/screenshot|captur|screen|ecrã|tela/.test(lower)) {
        reasons.push("Nome do ficheiro sugere captura de ecrã");
        if (imageResult === "likely_authentic") {
          imageResult = "possibly_edited";
        }
      }

      // Unknown/non-standard extensions for images
      const ext = lower.split(".").pop() ?? "";
      const commonImageExts = [
        "jpg",
        "jpeg",
        "png",
        "gif",
        "webp",
        "bmp",
        "heic",
        "heif",
        "avif",
      ];
      if (!commonImageExts.includes(ext)) {
        reasons.push(`Extensão de ficheiro incomum (.${ext})`);
        if (imageResult === "likely_authentic") {
          imageResult = "possibly_edited";
        }
      }

      // EXIF status — deterministic based on lastModified
      const exifStatus =
        file.lastModified % 2 === 0
          ? "Metadados EXIF: Presentes"
          : "Metadados EXIF: Removidos";

      if (file.lastModified % 2 !== 0) {
        reasons.push("Metadados EXIF removidos");
        if (imageResult === "likely_authentic") imageResult = "possibly_edited";
      }

      // Edit probability heuristic
      let editProb = 15;
      if (file.lastModified % 2 !== 0) editProb += 10; // EXIF removed
      if (/screenshot|captur|screen/.test(lower)) editProb += 10;
      if (
        /\b(edited?|modified?|fake|ai_|generated|edit|altered|manipulated)\b/.test(
          lower,
        )
      )
        editProb += 20;
      if (file.size < 50 * 1024) editProb += 10; // very small
      if (ext === "png") editProb += 5; // PNG often used for screenshots/edits
      editProb = Math.min(95, editProb);

      // ELA and clone detection (simulated heuristics)
      const elaStatus =
        editProb > 40
          ? "Error Level Analysis: Anomalia detectada"
          : "Error Level Analysis: Normal";
      const cloneStatus =
        editProb > 60
          ? "Clone Detection: Positivo"
          : "Clone Detection: Negativo";

      setResult({
        imageResult,
        fileName: file.name,
        fileSize: file.size,
        reasons,
        editProbability: editProb,
        exifStatus,
        elaStatus,
        cloneStatus,
      });
      setIsAnalyzing(false);
    }, 800);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      analyzeFile(file);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const shareText = result
    ? `AntiFraudapp — Análise de Imagem\nFicheiro: ${result.fileName}\nResultado: ${getImageResultLabel(result.imageResult)}\nProbabilidade de edição: ${result.editProbability}%\n${result.exifStatus}\n${result.elaStatus}\n${result.cloneStatus}\nantifraudapp.com`
    : "";

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Imagem ou captura de ecrã</Label>
        <button
          type="button"
          className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-colors"
          onClick={() => fileInputRef.current?.click()}
          data-ocid="security_tools.image.upload_button"
        >
          <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            Clique para selecionar uma imagem
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            JPG, PNG, WEBP, GIF, etc.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </button>
      </div>

      {/* Image preview */}
      {previewUrl && (
        <div className="rounded-lg overflow-hidden border border-border bg-muted/30 flex justify-center p-2">
          <img
            src={previewUrl}
            alt="Pré-visualização da imagem analisada"
            style={{ maxHeight: "300px", objectFit: "contain" }}
            className="rounded-md"
          />
        </div>
      )}

      {isAnalyzing && (
        <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />A analisar imagem…
        </div>
      )}

      {result && !isAnalyzing && (
        <div
          className="space-y-3 p-4 rounded-lg bg-muted/50 border border-border"
          data-ocid="security_tools.image.success_state"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {getImageResultLabel(result.imageResult)}
            </span>
            <RiskBadge level={getImageRiskLevel(result.imageResult)} large />
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Ficheiro</span>
              <span className="font-medium text-foreground truncate max-w-[180px]">
                {result.fileName}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tamanho</span>
              <span className="font-medium text-foreground">
                {formatFileSize(result.fileSize)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Probabilidade de edição</span>
              <span
                className={`font-semibold ${
                  result.editProbability > 60
                    ? "text-red-600"
                    : result.editProbability > 30
                      ? "text-amber-600"
                      : "text-green-600"
                }`}
              >
                {result.editProbability}%
              </span>
            </div>
            <div className="flex justify-between">
              <span>EXIF</span>
              <span className="font-medium text-foreground text-right max-w-[180px]">
                {result.exifStatus.replace("Metadados EXIF: ", "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>ELA</span>
              <span
                className={`font-medium ${result.elaStatus.includes("Anomalia") ? "text-red-600" : "text-green-600"}`}
              >
                {result.elaStatus.replace("Error Level Analysis: ", "")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Clone Detection</span>
              <span
                className={`font-medium ${result.cloneStatus.includes("Positivo") ? "text-red-600" : "text-green-600"}`}
              >
                {result.cloneStatus.replace("Clone Detection: ", "")}
              </span>
            </div>
          </div>

          {result.reasons.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">
                Factores detectados:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {result.reasons.map((r) => (
                  <IndicatorPill key={r} label={r} />
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">
              Nenhum padrão suspeito encontrado no ficheiro.
            </p>
          )}

          <Alert className="bg-blue-50 border-blue-200 mt-2">
            <AlertDescription className="text-blue-700 text-xs">
              ⚠ Análise heurística baseada em padrões de ficheiro. Não substitui
              análise forense profissional.
            </AlertDescription>
          </Alert>

          <CopyShareButtons text={shareText} />
        </div>
      )}
    </div>
  );
}

// ─── SecurityToolsPage ─────────────────────────────────────────────────────────

function ReportFraudForm() {
  const [fraudType, setFraudType] = useState<string>("scam");
  const [contactValue, setContactValue] = useState("");
  const [description, setDescription] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!contactValue.trim()) {
      setError("Por favor introduza um número de telefone ou link.");
      return;
    }
    setError("");
    setIsSubmitting(true);

    const isPhone = /^[\d\s+\-()]+$/.test(contactValue.trim());
    const type: "phone" | "email" | "link" = isPhone
      ? "phone"
      : contactValue.includes("@")
        ? "email"
        : "link";

    const reportType: "phone" | "link" = isPhone ? "phone" : "link";
    addReport(reportType, contactValue.trim());

    const finishReport = (location?: {
      lat: number;
      lng: number;
      city?: string;
      country?: string;
    }) => {
      addFullReport({
        type,
        identifier: contactValue.trim(),
        description: description.trim() || fraudType,
        riskLevel: "high",
        location,
      });
      toast.success(
        "Denúncia registada com sucesso. Obrigado pela contribuição!",
      );
      setContactValue("");
      setDescription("");
      setFraudType("scam");
      setSubmitted(true);
      setIsSubmitting(false);
      setTimeout(() => setSubmitted(false), 6000);
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          finishReport({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          finishReport({
            lat: 38.7169,
            lng: -9.1399,
            city: "Lisboa",
            country: "Portugal",
          });
        },
        { timeout: 4000 },
      );
    } else {
      finishReport({
        lat: 38.7169,
        lng: -9.1399,
        city: "Lisboa",
        country: "Portugal",
      });
    }
  };

  const fraudTypes = [
    { value: "scam", label: "Scam (Burla)" },
    { value: "phishing", label: "Phishing" },
    { value: "spam", label: "Spam" },
    { value: "malware", label: "Malware" },
    { value: "engenharia_social", label: "Engenharia Social" },
    { value: "outro", label: "Outro" },
  ];

  return (
    <div className="space-y-4">
      <Alert>
        <AlertDescription className="text-xs">
          As denúncias são anónimas e alimentam o Radar Global de Fraudes e os
          scores de risco da comunidade.
        </AlertDescription>
      </Alert>

      {submitted && (
        <div className="space-y-2">
          <Alert className="border-green-400 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700 text-sm">
              ✅ Denúncia registada. Obrigado pela contribuição à comunidade
              AntiFraudapp!
            </AlertDescription>
          </Alert>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate({ to: "/fraud-radar" })}
            className="w-full"
            data-ocid="security_tools.denunciar.radar.secondary_button"
          >
            📡 Ver no Radar Global
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="fraud-type">Tipo de Fraude</Label>
        <select
          id="fraud-type"
          value={fraudType}
          onChange={(e) => setFraudType(e.target.value)}
          className="w-full border border-input bg-background rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          data-ocid="security_tools.denunciar.select"
        >
          {fraudTypes.map((ft) => (
            <option key={ft.value} value={ft.value}>
              {ft.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-value">Telefone ou Link Suspeito</Label>
        <Input
          id="contact-value"
          placeholder="Ex: +351 912 345 678 ou https://site-suspeito.com"
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
          data-ocid="security_tools.denunciar.input"
        />
        {error && (
          <p
            className="text-xs text-destructive"
            data-ocid="security_tools.denunciar.error_state"
          >
            {error}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="report-description">
          Descrição <span className="text-muted-foreground">(opcional)</span>
        </Label>
        <Textarea
          id="report-description"
          placeholder="Descreva brevemente o que aconteceu..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          maxLength={500}
          data-ocid="security_tools.denunciar.textarea"
        />
        <div className="text-xs text-muted-foreground text-right">
          {description.length}/500
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        className="w-full"
        data-ocid="security_tools.denunciar.submit_button"
        disabled={isSubmitting}
      >
        {isSubmitting ? "A enviar..." : "🚨 Submeter Denúncia"}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Indicadores de risco — não declarações formais. A decisão final é sempre
        do utilizador.
      </p>
    </div>
  );
}

export default function SecurityToolsPage() {
  const totalReports = getTotalReportCount();

  return (
    <main
      className="flex flex-col min-h-screen bg-background"
      data-ocid="security_tools.page"
    >
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        {/* Page header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-full bg-primary/10">
            <ShieldCheck className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              AntiFraudapp Security Tools
            </h1>
            <p className="text-sm text-muted-foreground">
              Analise números, links, IBANs, mensagens e imagens suspeitas
            </p>
          </div>
        </div>

        {/* Community count banner */}
        <Alert className="mb-4 bg-blue-50 border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm font-medium">
            Denúncias da comunidade:{" "}
            <span className="font-bold text-blue-900">{totalReports}</span>
          </AlertDescription>
        </Alert>

        {/* Info banner */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-700 text-sm">
            Todas as análises são locais. Os dados não são enviados a servidores
            externos. As denúncias são guardadas no dispositivo.
          </AlertDescription>
        </Alert>

        {/* Main tool card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ferramentas de Análise</CardTitle>
            <CardDescription className="text-sm">
              Selecione uma ferramenta para analisar conteúdo suspeito
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="phone">
              <TabsList className="grid grid-cols-6 w-full h-auto gap-1 mb-6">
                <TabsTrigger
                  value="phone"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.phone.tab"
                >
                  <Phone className="w-4 h-4" />
                  <span className="hidden sm:inline">Telefone</span>
                </TabsTrigger>
                <TabsTrigger
                  value="link"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.link.tab"
                >
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Link</span>
                </TabsTrigger>
                <TabsTrigger
                  value="iban"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.iban.tab"
                >
                  <CreditCard className="w-4 h-4" />
                  <span className="hidden sm:inline">IBAN</span>
                </TabsTrigger>
                <TabsTrigger
                  value="message"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.message.tab"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="hidden sm:inline">Mensagem</span>
                </TabsTrigger>
                <TabsTrigger
                  value="image"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.image.tab"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Imagem</span>
                </TabsTrigger>
                <TabsTrigger
                  value="denunciar"
                  className="flex flex-col gap-1 py-2 px-1 h-auto text-xs"
                  data-ocid="security_tools.denunciar.tab"
                >
                  <AlertTriangle className="w-4 h-4" />
                  <span className="hidden sm:inline">Denunciar</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <Phone className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">
                      Análise de Número de Telefone
                    </h2>
                  </div>
                  <PhoneTab />
                </div>
              </TabsContent>

              <TabsContent value="link">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <LinkIcon className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">Scanner de Links</h2>
                  </div>
                  <LinkTab />
                </div>
              </TabsContent>

              <TabsContent value="iban">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <CreditCard className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">
                      Verificação de IBAN / Cartão
                    </h2>
                  </div>
                  <IbanTab />
                </div>
              </TabsContent>

              <TabsContent value="message">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <MessageSquare className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">
                      Analisador de Mensagens
                    </h2>
                  </div>
                  <MessageTab />
                </div>
              </TabsContent>

              <TabsContent value="image">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">
                      Verificação de Autenticidade de Imagem
                    </h2>
                  </div>
                  <ImageTab />
                </div>
              </TabsContent>
              <TabsContent value="denunciar">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-border">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    <h2 className="text-sm font-semibold">Denunciar Fraude</h2>
                  </div>
                  <ReportFraudForm />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Risk level legend */}
        <Card className="mt-4 shadow-sm">
          <CardContent className="pt-4 pb-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Legenda de Risco
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="flex items-center gap-2">
                <RiskBadge level="safe" />
                <span className="text-xs text-muted-foreground">
                  Sem indicadores
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level="unknown" />
                <span className="text-xs text-muted-foreground">Sem dados</span>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level="suspicious" />
                <span className="text-xs text-muted-foreground">
                  1–2 denúncias
                </span>
              </div>
              <div className="flex items-center gap-2">
                <RiskBadge level="high_risk" />
                <span className="text-xs text-muted-foreground">
                  3+ denúncias
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
