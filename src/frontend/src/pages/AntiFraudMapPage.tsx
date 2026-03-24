/**
 * AntiFraudMapPage — Mapa AntiFraud at /antifraud-map
 *
 * Shows a Leaflet + OpenStreetMap map centered on Europe with predefined
 * fraud report markers for major cities. Uses the same window.L pattern as
 * LocationMapPage.tsx.
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, MapPin } from "lucide-react";
import { useEffect, useRef } from "react";
import { getTotalReportCount } from "../utils/communityReportStore";

declare const window: Window & {
  L?: {
    map: (el: HTMLElement, options?: object) => LMap;
    tileLayer: (url: string, options?: object) => LTileLayer;
    circleMarker: (latlng: [number, number], options?: object) => LCircleMarker;
  };
};

interface LMap {
  setView: (latlng: [number, number], zoom: number) => LMap;
  addLayer: (layer: LTileLayer | LCircleMarker) => void;
  invalidateSize: () => void;
  remove: () => void;
}

interface LTileLayer {
  addTo: (map: LMap) => void;
}

interface LCircleMarker {
  addTo: (map: LMap) => void;
  bindPopup: (content: string) => LCircleMarker;
}

// Predefined fraud report markers for demo
const CITY_MARKERS: {
  name: string;
  lat: number;
  lng: number;
  count: number;
  type: string;
  risk: string;
}[] = [
  {
    name: "Lisboa",
    lat: 38.7,
    lng: -9.1,
    count: 4,
    type: "Telefone",
    risk: "Alto",
  },
  {
    name: "Porto",
    lat: 41.1,
    lng: -8.6,
    count: 2,
    type: "Link",
    risk: "Médio",
  },
  {
    name: "Madrid",
    lat: 40.4,
    lng: -3.7,
    count: 2,
    type: "IBAN",
    risk: "Alto",
  },
  {
    name: "Paris",
    lat: 48.8,
    lng: 2.3,
    count: 6,
    type: "Mensagem",
    risk: "Alto",
  },
  {
    name: "Londres",
    lat: 51.5,
    lng: -0.1,
    count: 3,
    type: "Telefone",
    risk: "Médio",
  },
  {
    name: "Berlim",
    lat: 52.5,
    lng: 13.4,
    count: 2,
    type: "Link",
    risk: "Médio",
  },
  {
    name: "Roma",
    lat: 41.9,
    lng: 12.5,
    count: 1,
    type: "IBAN",
    risk: "Médio",
  },
  {
    name: "Amsterdam",
    lat: 52.4,
    lng: 4.9,
    count: 3,
    type: "Mensagem",
    risk: "Alto",
  },
];

const TOTAL_DEMO_COUNT = CITY_MARKERS.reduce((sum, c) => sum + c.count, 0);

export default function AntiFraudMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LMap | null>(null);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const communityTotal = getTotalReportCount();

  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (!mapContainerRef.current) return;
      if (leafletMapRef.current) return; // already initialized
      if (!window.L) return; // library not ready yet

      const L = window.L;

      // Center on Europe
      const map = L.map(mapContainerRef.current).setView([48.0, 8.0], 5);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Add predefined city markers
      for (const city of CITY_MARKERS) {
        const marker = L.circleMarker([city.lat, city.lng], {
          radius: 8 + city.count,
          fillColor: "#dc2626",
          color: "#991b1b",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.75,
        });
        marker
          .bindPopup(
            `<strong>📍 ${city.name}</strong><br/>Fraude reportada<br/>Tipo: ${city.type}<br/>Denúncias: ${city.count}<br/>Risco: ${city.risk}`,
          )
          .addTo(map);
      }

      leafletMapRef.current = map;

      // Force Leaflet to recalculate layout
      setTimeout(() => {
        if (!cancelled && leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 150);
      setTimeout(() => {
        if (!cancelled && leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 500);

      // Clear the retry interval once initialized
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
    }

    // Retry every 200ms until window.L is available
    retryRef.current = setInterval(tryInit, 200);
    tryInit(); // attempt immediately

    return () => {
      cancelled = true;
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }
      if (leafletMapRef.current) {
        try {
          leafletMapRef.current.remove();
        } catch {
          // ignore cleanup errors
        }
        leafletMapRef.current = null;
      }
    };
  }, []);

  return (
    <main
      className="flex flex-col min-h-screen bg-background"
      data-ocid="antifraud_map.page"
    >
      {/* Page header */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-full bg-primary/10">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Mapa AntiFraud
            </h1>
            <p className="text-sm text-muted-foreground">
              Denúncias geográficas da comunidade
            </p>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="container mx-auto px-4 pb-4">
        <Card className="bg-blue-50 border-blue-200 shadow-sm">
          <CardContent className="py-3 px-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="text-sm font-semibold text-blue-800">
                  Denúncias da comunidade:{" "}
                  <span className="text-blue-900">
                    {TOTAL_DEMO_COUNT + communityTotal}
                  </span>
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {CITY_MARKERS.slice(0, 4).map((city) => (
                  <span
                    key={city.name}
                    className="inline-flex items-center gap-1 text-xs bg-white border border-blue-200 rounded-full px-2.5 py-0.5 text-blue-700"
                  >
                    📍 {city.name} – {city.count}
                  </span>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Map container */}
      <div className="container mx-auto px-4 pb-4 flex-1">
        <Card className="overflow-hidden border border-border shadow-sm">
          <div
            id="antifraud-map-container"
            ref={mapContainerRef}
            style={{ height: "60vh", minHeight: "300px", width: "100%" }}
            data-ocid="antifraud_map.map_marker"
          />
        </Card>
      </div>

      {/* City list */}
      <div className="container mx-auto px-4 pb-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              Denúncias por Cidade
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {CITY_MARKERS.map((city) => (
                <div
                  key={city.name}
                  className="flex items-center justify-between bg-muted/50 rounded-lg px-3 py-2"
                >
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {city.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{city.type}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      city.risk === "Alto"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {city.count}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend + disclaimer */}
      <div className="container mx-auto px-4 pb-6 text-center space-y-1">
        <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-600 opacity-75" />
            Alto Risco
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-red-400 opacity-75" />
            Médio Risco
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Localização aproximada. Dados simulados para demonstração.
        </p>
        <p className="text-xs text-muted-foreground">
          Leaflet • OpenStreetMap • AntiFraud
        </p>
      </div>
    </main>
  );
}
