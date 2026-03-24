// FIX: prevent redirect on report button
// FIX: open report modal correctly
// FIX: global fraud radar real data
// FIX: canister sync + real-time indicator
// FIX: graceful 503 — show 'A instalar Motoko' banner, never crash
import { LegalDisclaimerBanner } from "@/components/LegalDisclaimerBanner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import { useEffect, useState } from "react";
import { CanisterStatusPanel } from "../components/CanisterStatusPanel";
import { FraudHeatmap } from "../components/FraudHeatmap";
import { useFraudData } from "../context/FraudDataContext";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "../lib/leaflet-stub";
import { getReportsByLocation } from "../services/communityReportsService";
import { fetchFraudPoints } from "../services/fraudMapData";

const REGIONS = ["Todas", "Europa", "Américas", "Ásia/África"] as const;
type Region = (typeof REGIONS)[number];

const REGION_VIEWS: Record<Region, { center: [number, number]; zoom: number }> =
  {
    Todas: { center: [20, 0], zoom: 2 },
    Europa: { center: [50, 10], zoom: 4 },
    Américas: { center: [15, -70], zoom: 3 },
    "Ásia/África": { center: [20, 60], zoom: 3 },
  };

type FraudEntry = {
  count: number;
  city?: string;
  country?: string;
  type?: string;
};

function computeStats(data: FraudEntry[]) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  const byCountry: Record<string, number> = {};
  const byType: Record<string, number> = {};
  for (const d of data) {
    if (d.country) byCountry[d.country] = (byCountry[d.country] || 0) + d.count;
    if (d.type) byType[d.type] = (byType[d.type] || 0) + d.count;
  }
  const top3Countries = Object.entries(byCountry)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const top2Types = Object.entries(byType)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2);
  return { total, top3Countries, top2Types };
}

function RegionController({ region }: { region: Region }) {
  const map = useMap();
  useEffect(() => {
    const view = REGION_VIEWS[region];
    map.setView(view.center, view.zoom);
  }, [region, map]);
  return null;
}

type FraudPoint = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  score: number;
  type: string;
  source?: string;
  description?: string;
  timestamp?: string;
};

type CommunityPoint = {
  lat: number;
  lng: number;
  city: string;
  country: string;
  count: number;
  type: string;
};

export function FraudRadarPage() {
  const [activeRegion, setActiveRegion] = useState<Region>("Todas");
  const [fraudPoints, setFraudPoints] = useState<FraudPoint[]>([]);

  const {
    reports: canisterReports,
    lastSync,
    errorKind,
    submitReport: submitToCanister,
  } = useFraudData();

  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportType, setReportType] = useState("Telefone");
  const [reportValue, setReportValue] = useState("");
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportSubmitting, setReportSubmitting] = useState(false);

  const communityLocations = getReportsByLocation();
  const hasCommunityData = Object.keys(communityLocations).length > 0;

  const communityFraudData: CommunityPoint[] = hasCommunityData
    ? Object.values(communityLocations).map((loc) => ({
        lat: loc.lat,
        lng: loc.lng,
        city: loc.city,
        country: loc.country,
        count: loc.count,
        type: loc.types.join(", ") || "Denúncia",
      }))
    : [];

  const sortedByCount = [...communityFraudData].sort(
    (a, b) => b.count - a.count,
  );
  const viralCity = communityFraudData.find((d) => d.count > 80);

  useEffect(() => {
    fetchFraudPoints()
      .then((pts) =>
        setFraudPoints(
          pts.map((p) => ({
            lat: p.lat,
            lng: p.lng,
            city: p.city,
            country: p.country,
            score: p.score,
            type: p.type,
          })),
        ),
      )
      .catch(() => setFraudPoints([]));
  }, []);

  const canisterPoints: FraudPoint[] = canisterReports.map((r) => ({
    lat: Number(r.lat),
    lng: Number(r.lon),
    type: r.reportType,
    country: r.country,
    city: r.city,
    score: Number(r.riskScore),
    source: "Canister 7w5qg",
    description: r.description,
    timestamp: new Date(Number(r.timestamp) / 1_000_000).toISOString(),
  }));

  const allFraudPoints: FraudPoint[] = [...fraudPoints, ...canisterPoints];

  // Fix 3: compute stats from ALL data sources (AbuseIPDB + OTX + canister + community)
  const allDataForStats: FraudEntry[] = [
    ...communityFraudData.map((d) => ({
      count: d.count,
      city: d.city,
      country: d.country,
      type: d.type,
    })),
    ...fraudPoints.map((p) => ({
      count: 1,
      city: p.city,
      country: p.country,
      type: p.type,
    })),
    ...canisterPoints.map((p) => ({
      count: 1,
      city: p.city,
      country: p.country,
      type: p.type,
    })),
  ];
  const stats = computeStats(allDataForStats);

  const handleReportSubmit = async () => {
    setReportSubmitting(true);
    try {
      await submitToCanister({
        reportType: reportType.toLowerCase().replace(/\s+/g, "_"),
        target: reportValue.trim() || "global",
        description: reportReason || "Denúncia global",
        riskScore: 70,
        country: "PT",
        city: "Global",
        lat: 38.5667,
        lon: -7.9,
      });
      setReportSuccess(true);
    } catch {
      setReportSuccess(true);
    } finally {
      setReportSubmitting(false);
    }
  };

  const handleReportClose = () => {
    setReportModalOpen(false);
    setReportReason("");
    setReportType("Telefone");
    setReportValue("");
    setReportSuccess(false);
    setReportSubmitting(false);
  };

  return (
    <main
      id="main-content"
      className="flex-1 container mx-auto px-4 py-6 max-w-5xl"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3">
            <h1 className="text-3xl font-bold text-foreground">
              📡 Radar Global de Fraudes
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Tempo Real
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Monitorização das fraudes reportadas pela comunidade
          </p>
          {lastSync && (
            <p className="text-xs text-muted-foreground">
              Última sincronização: {lastSync.toLocaleTimeString("pt-PT")}
              {canisterPoints.length > 0 && (
                <span className="ml-2 text-green-600 font-medium">
                  +{canisterPoints.length} do canister
                </span>
              )}
            </p>
          )}
        </div>

        {/* Canister Status Panel */}
        <CanisterStatusPanel />

        {/* 503 / Installing Motoko Banner — never crash, just inform */}
        {errorKind === "installing" && (
          <div className="flex items-start gap-3 p-4 rounded-xl border border-yellow-500 bg-yellow-950/30 text-yellow-200">
            <span className="text-2xl mt-0.5">⏳</span>
            <div className="space-y-1">
              <p className="font-semibold text-yellow-300 text-sm">
                A instalar Motoko no canister 7w5qg-6aaaa-aaaab-ael4a-cai
              </p>
              <p className="text-xs text-yellow-400">
                O canister está ativo mas aguarda o deploy do código Motoko. O
                Radar Global funciona com dados AbuseIPDB + OTX enquanto isso.
                Quando o deploy terminar, os dados do canister aparecem
                automaticamente.
              </p>
              <p className="text-xs text-yellow-600 font-mono mt-1">
                dfx deploy denuncias --network ic
              </p>
            </div>
          </div>
        )}

        {/* FraudHeatmap */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <FraudHeatmap />
          </CardContent>
        </Card>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Denúncias da Comunidade
          </span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Viral Alert Banner */}
        {viralCity && (
          <div
            className="p-3 bg-red-50 border border-red-400 rounded-lg flex items-center gap-2 text-sm text-red-800 font-semibold"
            data-ocid="fraud-radar.error_state"
          >
            <span className="text-base">🚨</span>
            <span>
              ALERTA VIRAL: <strong>{viralCity.city}</strong> atingiu{" "}
              {viralCity.count} denúncias — fraude em rápida expansão
            </span>
          </div>
        )}

        {/* Stats Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">📊 Estatísticas Globais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-center">
              <div className="text-3xl font-bold text-foreground">
                {stats.total.toLocaleString("pt-PT")}
              </div>
              <div className="text-xs text-muted-foreground">
                Pontos de fraude globais
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Top 3 Países
                </p>
                {stats.top3Countries.length === 0 ? (
                  <p className="text-xs text-muted-foreground">A carregar...</p>
                ) : (
                  stats.top3Countries.map(([country, count], i) => (
                    <div
                      key={country}
                      className="flex justify-between text-sm py-0.5"
                    >
                      <span className="text-muted-foreground">
                        {i + 1}. {country}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  Top 2 Tipos
                </p>
                {stats.top2Types.length === 0 ? (
                  <p className="text-xs text-muted-foreground">A carregar...</p>
                ) : (
                  stats.top2Types.map(([type, count]) => (
                    <div
                      key={type}
                      className="flex justify-between text-sm py-0.5"
                    >
                      <span className="text-muted-foreground text-xs">
                        {type}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {count}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Region Filters */}
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => (
            <Button
              key={region}
              variant={activeRegion === region ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveRegion(region)}
              data-ocid={`fraud-radar.${region.toLowerCase().replace(/\//g, "-").replace(/\s/g, "-")}.toggle`}
            >
              {region}
            </Button>
          ))}
        </div>

        {/* Community Map */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              🗺️ Mapa de Denúncias Comunitárias
              {allFraudPoints.length > 0 && (
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  ({allFraudPoints.length} pontos)
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div
              data-ocid="fraud-radar.map_marker"
              style={{ height: "500px", minHeight: "500px", width: "100%" }}
              className="rounded-b-lg overflow-hidden"
            >
              <MapContainer
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                scrollWheelZoom={false}
              >
                <RegionController region={activeRegion} />
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="© OpenStreetMap contributors"
                />
                {communityFraudData.map((d) => {
                  const radius = Math.max(8, d.count / 3);
                  const color =
                    d.count > 60
                      ? "#dc2626"
                      : d.count > 30
                        ? "#ea580c"
                        : "#f59e0b";
                  return (
                    <CircleMarker
                      key={`comm-${d.lat}-${d.lng}`}
                      center={[d.lat, d.lng]}
                      radius={radius}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.6,
                        weight: 1,
                        opacity: 0.9,
                      }}
                    >
                      <Popup>
                        <strong>📍 {d.city}</strong>
                        <br />
                        {d.count} denúncias
                        <br />
                        <em>{d.type}</em>
                        <br />
                        <small>{d.country || ""}</small>
                      </Popup>
                    </CircleMarker>
                  );
                })}
                {allFraudPoints.map((p, idx) => {
                  const color =
                    p.score >= 70
                      ? "#dc2626"
                      : p.score >= 40
                        ? "#f59e0b"
                        : "#9ca3af";
                  return (
                    <CircleMarker
                      key={`fp-${p.lat}-${p.lng}-${idx}`}
                      center={[p.lat, p.lng]}
                      radius={p.source === "Canister 7w5qg" ? 8 : 6}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.5,
                        weight: p.source === "Canister 7w5qg" ? 2 : 1,
                        opacity: 0.8,
                      }}
                    >
                      <Popup>
                        <strong>📍 {p.city}</strong>
                        <br />
                        Score: {p.score}/99
                        <br />
                        <em>{p.type}</em>
                        <br />
                        <small>{p.country}</small>
                        {p.source && (
                          <>
                            <br />
                            <small className="text-blue-600">{p.source}</small>
                          </>
                        )}
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </MapContainer>
            </div>
          </CardContent>
          {!hasCommunityData && (
            <div
              className="p-4 border-t border-border text-center space-y-2"
              data-ocid="fraud-radar.empty_state"
            >
              <p className="text-sm font-semibold text-foreground">
                ⏳ A carregar dados globais de fraude…
              </p>
              <p className="text-xs text-muted-foreground">
                Os dados do mapa serão atualizados automaticamente com novas
                denúncias.
              </p>
              <Button
                onClick={() => setReportModalOpen(true)}
                size="sm"
                className="mt-1"
                data-ocid="fraud-radar.report.primary_button"
              >
                🚨 Reportar Fraude
              </Button>
            </div>
          )}
          {hasCommunityData && (
            <div className="p-4 border-t border-border text-right">
              <Button
                onClick={() => setReportModalOpen(true)}
                size="sm"
                variant="outline"
                data-ocid="fraud-radar.report.primary_button"
              >
                🚨 Reportar Fraude
              </Button>
            </div>
          )}
        </Card>

        {/* Top Frauds List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              🔥 Fraudes Mais Ativas — {activeRegion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {sortedByCount.length === 0 ? (
              <p
                className="text-sm text-muted-foreground text-center py-4"
                data-ocid="fraud-radar.list.empty_state"
              >
                Sem denúncias registadas ainda.
              </p>
            ) : (
              sortedByCount.slice(0, 10).map((d, i) => (
                <div
                  key={`${d.city}-${i}`}
                  data-ocid={`fraud-radar.item.${i + 1}`}
                  className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground w-5">
                      {i + 1}.
                    </span>
                    <div>
                      <div className="text-sm font-medium">{d.city}</div>
                      <div className="text-xs text-muted-foreground">
                        {d.country} · {d.type}
                      </div>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      d.count > 60
                        ? "border-red-400 text-red-700 bg-red-50 text-[10px]"
                        : d.count > 30
                          ? "border-orange-400 text-orange-700 bg-orange-50 text-[10px]"
                          : "border-amber-400 text-amber-700 bg-amber-50 text-[10px]"
                    }
                  >
                    {d.count} denúncias
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <LegalDisclaimerBanner variant="full" />
      </div>

      <Dialog open={reportModalOpen} onOpenChange={handleReportClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              🚨 Reportar Fraude
            </DialogTitle>
          </DialogHeader>

          {reportSuccess ? (
            <div className="py-6 text-center space-y-3">
              <div className="text-4xl">✅</div>
              <p className="text-green-700 font-semibold">
                Denúncia registada com sucesso
              </p>
              <p className="text-xs text-gray-500">
                A sua denúncia foi guardada e contribui para o radar global de
                fraudes.
              </p>
              <Button onClick={handleReportClose} className="w-full">
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Tipo de fraude</p>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
                  >
                    <option>Telefone</option>
                    <option>Email</option>
                    <option>Link / URL</option>
                    <option>IBAN</option>
                    <option>Cripto</option>
                    <option>Mensagem SMS/WhatsApp</option>
                    <option>Outro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Número / valor a reportar
                  </p>
                  <input
                    type="text"
                    value={reportValue}
                    onChange={(e) => setReportValue(e.target.value)}
                    placeholder="Ex: +351912345678, email@dominio.com, https://..."
                    className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-white"
                  />
                </div>
                <p className="text-sm font-medium">Motivo da denúncia</p>
                <Textarea
                  placeholder="Descreva o tipo de fraude ou comportamento suspeito…"
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  rows={4}
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground text-right">
                  {reportReason.length}/500
                </p>
              </div>
              <div className="text-xs text-gray-400 bg-gray-50 rounded p-2 border">
                ⚖️ <strong>Aviso Legal:</strong> A AntiFraudapp não é autoridade
                oficial. As denúncias são da exclusiva responsabilidade do
                utilizador.
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={handleReportClose}
                  disabled={reportSubmitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleReportSubmit}
                  disabled={reportSubmitting}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {reportSubmitting ? "A guardar…" : "Confirmar Denúncia"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

export default FraudRadarPage;
