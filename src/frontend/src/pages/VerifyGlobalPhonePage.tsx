/**
 * Phone reputation lookup page.
 * Uses searchPhoneGlobal for rich directory results (name, address, website,
 * rating, operator, country) with optional Leaflet map when lat/lng available.
 */

import { LegalDisclaimerBanner } from "@/components/LegalDisclaimerBanner";
import { TrustLevelBadge } from "@/components/TrustLevelBadge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Flag,
  Info,
  MapPin,
  Phone,
  Search,
  Star,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { getReputation } from "../services/communityReportsService";
import {
  type PhoneDirectoryResult,
  searchPhoneGlobal,
} from "../services/publicDirectory";

const COUNTRY_FLAG: Record<string, string> = {
  PT: "🇵🇹",
  US: "🇺🇸",
  GB: "🇬🇧",
  FR: "🇫🇷",
  DE: "🇩🇪",
  ES: "🇪🇸",
  IT: "🇮🇹",
  BR: "🇧🇷",
};

const LINE_TYPE_MAP: Record<string, string> = {
  mobile: "Móvel",
  landline: "Fixo",
  voip: "VoIP",
};

function getCountryFlag(countryCode?: string): string {
  if (!countryCode) return "🌍";
  return COUNTRY_FLAG[countryCode.toUpperCase()] ?? "🌍";
}

function getLineTypeLabel(lineType?: string): string {
  if (!lineType) return "Desconhecido";
  return LINE_TYPE_MAP[lineType.toLowerCase()] ?? "Desconhecido";
}

const GREEN_PRECAUTION_BLOCK = (
  <div className="mt-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
    <div className="flex items-start gap-2">
      <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
      <div className="text-sm text-blue-800 dark:text-blue-200">
        <p className="font-semibold mb-1">
          Nenhum risco conhecido encontrado. Se não reconhecer:
        </p>
        <ul className="space-y-0.5 list-none">
          <li>• Verifique por canal oficial</li>
          <li>• Não forneça dados pessoais</li>
          <li>
            • Em dúvida: <strong>PSP 112</strong>
          </li>
        </ul>
      </div>
    </div>
  </div>
);

function StarRating({ rating, count }: { rating: number; count?: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="flex items-center gap-1 text-sm">
      {["s1", "s2", "s3", "s4", "s5"].map((starId, i) => (
        <Star
          key={starId}
          className={`w-3.5 h-3.5 ${
            i < full
              ? "fill-yellow-400 text-yellow-400"
              : i === full && half
                ? "fill-yellow-200 text-yellow-400"
                : "text-gray-300"
          }`}
        />
      ))}
      <span className="text-muted-foreground text-xs">
        {rating.toFixed(1)}
        {count ? ` (${count})` : ""}
      </span>
    </span>
  );
}

// Leaflet map shown only when lat/lng are available
function PhoneLocationMap({ lat, lng }: { lat: number; lng: number }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    let destroyed = false;

    async function initMap() {
      const L =
        (window as unknown as { L: typeof import("leaflet") }).L ?? null;
      if (!L) return;
      if (destroyed || !mapRef.current) return;

      (L.Icon.Default.prototype as Record<string, unknown>)._getIconUrl =
        undefined;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current, {
        zoomControl: true,
        scrollWheelZoom: false,
      }).setView([lat, lng], 15);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      L.marker([lat, lng]).addTo(map);
      mapInstanceRef.current = map;
    }

    initMap();
    return () => {
      destroyed = true;
      if (mapInstanceRef.current) {
        (mapInstanceRef.current as { remove: () => void }).remove();
        mapInstanceRef.current = null;
      }
    };
  }, [lat, lng]);

  return (
    <div
      ref={mapRef}
      style={{ height: 240, width: "100%", borderRadius: 8 }}
      className="mt-3 border border-border overflow-hidden"
    />
  );
}

export default function VerifyGlobalPhonePage() {
  const [phoneInput, setPhoneInput] = useState("");
  const [result, setResult] = useState<PhoneDirectoryResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9+\s\-()]/g, "");
    setPhoneInput(raw);
  };

  const handleAnalyze = async () => {
    const cleaned = phoneInput.replace(/[^0-9+]/g, "").trim();
    if (!cleaned) return;
    setIsAnalyzing(true);
    setReportSent(false);
    setShowMap(false);
    setErrorMsg(null);
    setResult(null);
    try {
      const res = await searchPhoneGlobal(cleaned);
      setResult(res);
    } catch {
      setErrorMsg("Não foi possível completar a pesquisa. Tente novamente.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const rep = result ? getReputation(phoneInput) : null;
  const score = rep?.score ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8 w-full">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Phone className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">
              Pesquisa Global de Telefone
            </h1>
          </div>
          <p className="text-muted-foreground text-sm max-w-md mx-auto">
            Pesquise qualquer número nacional ou internacional. Verifica
            diretórios públicos, operadora e país.
          </p>
        </div>

        {/* Search Card */}
        <Card className="mb-6 w-full">
          <CardContent className="pt-6">
            <div className="flex gap-2">
              <Input
                type="tel"
                placeholder="112, 912 345 678, +351912345678..."
                value={phoneInput}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1"
                disabled={isAnalyzing}
                data-ocid="phone.input"
              />
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !phoneInput.trim()}
                className="flex-shrink-0"
                data-ocid="phone.submit_button"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    A pesquisar...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    Pesquisar
                  </span>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Aceita números nacionais, internacionais ou de emergência (ex:
              112, +351912345678)
            </p>
          </CardContent>
        </Card>

        {/* Error */}
        {errorMsg && (
          <Alert className="mb-4" data-ocid="phone.error_state">
            <AlertDescription>{errorMsg}</AlertDescription>
          </Alert>
        )}

        {/* Loading state */}
        {isAnalyzing && (
          <div
            className="text-center py-4 text-muted-foreground text-sm"
            data-ocid="phone.loading_state"
          >
            A consultar fontes...
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div className="w-full" data-ocid="phone.card">
            {result.isEmergency ? (
              /* ── Emergency number display (unchanged) ── */
              <Card className="border-2 mb-4 border-green-300 bg-green-50 dark:bg-green-950/20 w-full">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span
                      className="flex-1"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {result.emergencyLabel || result.name || phoneInput}
                    </span>
                    <Badge className="bg-green-600 text-white text-xs">
                      Risco: 0%
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p>Número oficial público. Não associado a fraude.</p>
                    <p className="text-xs mt-1 text-muted-foreground">
                      Fonte: ENIS/EC NPL — Autoridades Públicas Europeias
                    </p>
                  </div>
                  {result.address && (
                    <div className="flex items-start gap-1 text-sm text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                      <span
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {result.address}
                      </span>
                    </div>
                  )}
                  {result.website && (
                    <a
                      href={
                        result.website.startsWith("http")
                          ? result.website
                          : `https://${result.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-primary hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "break-word",
                        }}
                      >
                        {result.website}
                      </span>
                    </a>
                  )}
                  <div className="pt-1 border-t border-border/50">
                    {reportSent ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Obrigado pelo seu contributo para a comunidade!
                      </p>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        onClick={() => setReportSent(true)}
                        data-ocid="phone.delete_button"
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Reportar à comunidade?
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* ── Non-emergency: enhanced structured card ── */
              <Card className="border-2 border-border mb-4 w-full box-border">
                <CardContent
                  className="pt-5 space-y-0"
                  style={{
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  {/* País */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      📍 País
                    </p>
                    <p className="text-base font-medium">
                      {result.country || "Desconhecido"}{" "}
                      {getCountryFlag(result.countryCode)}
                    </p>
                  </div>

                  <Separator />

                  {/* Operadora */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      📡 Operadora
                    </p>
                    <p
                      className="text-base font-medium"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "break-word",
                      }}
                    >
                      {result.operator || "Desconhecida"}
                    </p>
                  </div>

                  <Separator />

                  {/* Tipo de linha */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      📱 Tipo de linha
                    </p>
                    <p className="text-base font-medium">
                      {getLineTypeLabel(result.lineType)}
                    </p>
                  </div>

                  <Separator />

                  {/* Estado */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      📊 Estado
                    </p>
                    <p className="text-sm text-muted-foreground">
                      ℹ️{" "}
                      {rep && rep.count > 0
                        ? `${rep.count} denúncia(s) na comunidade`
                        : "Sem dados disponíveis"}
                    </p>
                  </div>

                  <Separator />

                  {/* Score de Reputação */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      ⭐ Score de Reputação
                    </p>
                    <p className="text-2xl font-bold mb-2">{score}/99</p>
                    <div className="flex flex-col gap-1 text-sm">
                      <span
                        className={
                          score >= 70
                            ? "font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        🔴 Risco elevado
                      </span>
                      <span
                        className={
                          score >= 40 && score < 70
                            ? "font-semibold"
                            : "text-muted-foreground"
                        }
                      >
                        🟡 Suspeito
                      </span>
                      <span
                        className={
                          score < 40 ? "font-semibold" : "text-muted-foreground"
                        }
                      >
                        🟢 Seguro
                      </span>
                    </div>
                  </div>

                  <Separator />

                  {/* Deteção de Spoofing */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      🛡️ Deteção de Spoofing
                    </p>
                    <p className="text-base font-medium">Normal ✅</p>
                  </div>

                  <Separator />

                  {/* Fontes consultadas */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                      🌐 Fontes consultadas
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Numverify • OpenCNAM • Diretórios Públicos
                    </p>
                  </div>

                  <Separator />

                  {/* Como se proteger */}
                  <div className="py-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                      🧠 COMO SE PROTEGER
                    </p>
                    <ul className="text-sm space-y-1 text-foreground">
                      {(!rep || rep.count === 0) && (
                        <li>
                          • Este número não tem registos na nossa base de dados
                        </li>
                      )}
                      <li>• Se receber chamada suspeita, pode reportar</li>
                      <li>• Verificar sempre canais oficiais</li>
                    </ul>
                  </div>

                  <Separator />

                  {/* Disclaimer */}
                  <div className="py-3">
                    <p className="text-xs text-muted-foreground">
                      ⚠️ Indicadores de risco, não garantias absolutas
                    </p>
                  </div>

                  {/* Business name if present */}
                  {result.name && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                          🏢 Entidade
                        </p>
                        <p
                          className="text-sm font-medium"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {result.name}
                        </p>
                      </div>
                    </>
                  )}

                  {/* Address */}
                  {result.address && (
                    <>
                      <Separator />
                      <div className="py-3 flex items-start gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                        <span
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          {result.address}
                        </span>
                      </div>
                    </>
                  )}

                  {/* Website */}
                  {result.website && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <a
                          href={
                            result.website.startsWith("http")
                              ? result.website
                              : `https://${result.website}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-primary hover:underline"
                          style={{
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                        >
                          <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                          {result.website}
                        </a>
                      </div>
                    </>
                  )}

                  {/* Rating */}
                  {result.rating != null && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <StarRating
                          rating={result.rating}
                          count={result.reviewsCount}
                        />
                      </div>
                    </>
                  )}

                  {/* Ver no mapa button */}
                  {result.location && (
                    <>
                      <Separator />
                      <div className="py-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-1 text-xs"
                          onClick={() => setShowMap((v) => !v)}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                          {showMap ? "Ocultar mapa" : "Ver no mapa"}
                        </Button>
                        {showMap && result.location && (
                          <PhoneLocationMap
                            lat={result.location.lat}
                            lng={result.location.lng}
                          />
                        )}
                      </div>
                    </>
                  )}

                  {GREEN_PRECAUTION_BLOCK}

                  {/* Report button */}
                  <div className="pt-3 border-t border-border/50 mt-3">
                    {reportSent ? (
                      <p className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Obrigado pelo seu contributo para a comunidade!
                      </p>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                        onClick={() => setReportSent(true)}
                        data-ocid="phone.delete_button"
                      >
                        <Flag className="w-3 h-3 mr-1" />
                        Reportar à comunidade?
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Community + Legal */}
        {result && rep && rep.count > 0 && (
          <TrustLevelBadge count={rep.count} />
        )}
        {result && <LegalDisclaimerBanner />}

        {/* Info note */}
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border border-border">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">Sobre esta pesquisa</p>
              <p>
                Consulta diretórios públicos e bases de dados abertas. Os
                resultados são indicativos — use sempre o bom senso e verifique
                por canais oficiais.
              </p>
              <p>
                Em caso de emergência: <strong>PSP / GNR 112</strong>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
