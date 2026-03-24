/**
 * SecureLocationMapPage — Mapa com dados reais do canister
 * Canister: sodv3-uiaaa-aaaak-qxubq-cai (localização)
 * Canister: 7w5qg-6aaaa-aaaab-ael4a-cai (denúncias/marcadores)
 */
import { Button } from "@/components/ui/button";
import React from "react";
import { useFraudData } from "../context/FraudDataContext";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
} from "../lib/leaflet-stub";
import { useSimpleRouter } from "../router/useSimpleRouter";

// ─── Local Error Boundary ─────────────────────────────────────────────────────
class SecureLocationErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error) {
    console.error("[SecureLocationMapPage] ErrorBoundary caught:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
          <div className="text-center space-y-4 max-w-md">
            <p className="text-5xl">🗺️</p>
            <h2 className="text-xl font-bold text-red-600">
              Erro na Localização Segura
            </h2>
            <p className="text-sm text-gray-600">
              O mapa não pôde ser carregado. Por favor, tente recarregar a
              página.
            </p>
            {this.state.error && (
              <p className="text-xs text-gray-400 font-mono bg-gray-100 px-3 py-2 rounded">
                {this.state.error}
              </p>
            )}
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function SecureLocationMapContent() {
  const { reports, lastSync, loading, error } = useFraudData();
  const { navigate } = useSimpleRouter();

  const validReports = reports.filter(
    (r) =>
      r.lat &&
      r.lon &&
      !Number.isNaN(Number(r.lat)) &&
      !Number.isNaN(Number(r.lon)),
  );

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50 px-4 py-6">
      <div className="max-w-2xl w-full space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h1 className="text-xl font-bold">🗺️ Localização Segura</h1>
            <p className="text-xs text-muted-foreground">
              Denúncias reais do canister ICP
            </p>
          </div>
          <Button
            onClick={() => navigate("/sala")}
            data-ocid="secure-location.primary_button"
          >
            🔐 Entrar na Sala Segura
          </Button>
        </div>

        {/* Canister badges */}
        <div className="bg-slate-800 rounded-lg px-3 py-2 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Canister Localização</span>
            <span className="text-xs font-mono text-green-400">
              sodv3-uiaaa-aaaak-qxubq-cai
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400">Canister Denúncias</span>
            <span className="text-xs font-mono text-green-400">
              7w5qg-6aaaa-aaaab-ael4a-cai
            </span>
          </div>
        </div>

        {/* Sync status */}
        {error && (
          <div
            className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2"
            data-ocid="secure-location.error_state"
          >
            ⚠️ {error} — a tentar reconectar...
          </div>
        )}
        {loading && !error && (
          <div
            className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded px-3 py-2"
            data-ocid="secure-location.loading_state"
          >
            ⏳ A sincronizar com o canister ICP...
          </div>
        )}

        {/* Map */}
        <div
          style={{ height: "450px", width: "100%" }}
          data-ocid="secure-location.map_marker"
        >
          <MapContainer
            center={[38.7, -8.0]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {validReports.map((r, i) => {
              const lat = Number(r.lat);
              const lon = Number(r.lon);
              const score = Number(r.riskScore);
              const color =
                score >= 70 ? "#dc2626" : score >= 40 ? "#f59e0b" : "#9ca3af";
              return (
                <CircleMarker
                  key={`loc-${Number(r.id)}-${i}`}
                  center={[lat, lon]}
                  radius={7}
                  pathOptions={{
                    color,
                    fillColor: color,
                    fillOpacity: 0.6,
                    weight: 1.5,
                  }}
                >
                  <Popup>
                    <strong>{r.city || r.country}</strong>
                    <br />
                    <em>{r.reportType}</em>
                    <br />
                    Score: {score}/99
                    <br />
                    <small className="text-blue-600">Canister 7w5qg</small>
                  </Popup>
                </CircleMarker>
              );
            })}
          </MapContainer>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {lastSync ? (
            <span>
              🟢 Última sincronização: {lastSync.toLocaleTimeString("pt-PT")}
            </span>
          ) : (
            <span>⏳ A aguardar dados do canister...</span>
          )}
          <span>{validReports.length} denúncias no mapa</span>
        </div>

        {/* Info note */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
          <strong>ℹ️ Sala Segura em tempo real:</strong> Para partilhar a sua
          localização GPS com até 10 pessoas em tempo real, entre na Sala Segura
          via Firebase (servidor EU — RGPD compliant).
        </div>

        <button
          type="button"
          onClick={() => window.history.back()}
          className="text-sm text-gray-500 hover:text-gray-700 underline underline-offset-2 mx-auto block"
        >
          ← Voltar à aplicação
        </button>
      </div>
    </div>
  );
}

export default function SecureLocationMapPage() {
  return (
    <SecureLocationErrorBoundary>
      <SecureLocationMapContent />
    </SecureLocationErrorBoundary>
  );
}
