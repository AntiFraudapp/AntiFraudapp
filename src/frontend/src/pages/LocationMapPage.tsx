/**
 * LocationMapPage — standalone map page at /location-map
 *
 * Always works independently of any session. Requests GPS permission,
 * displays user's current location, and prepares the map for future
 * session participant display.
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, MapPin, Navigation, RefreshCw } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

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
  flyTo: (latlng: [number, number], zoom: number) => void;
}

interface LTileLayer {
  addTo: (map: LMap) => void;
}

interface LCircleMarker {
  addTo: (map: LMap) => void;
  setLatLng: (latlng: [number, number]) => void;
  bindPopup: (content: string) => LCircleMarker;
  openPopup: () => void;
}

type GpsState = "idle" | "waiting" | "success" | "denied" | "error";

export default function LocationMapPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<LMap | null>(null);
  const userMarkerRef = useRef<LCircleMarker | null>(null);
  const retryRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState("");

  // ── Initialize Leaflet map after DOM is ready ──────────────────────────────
  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled) return;
      if (!mapContainerRef.current) return;
      if (leafletMapRef.current) return; // already initialized
      if (!window.L) return; // library not ready yet

      const L = window.L;
      const map = L.map(mapContainerRef.current).setView(
        [38.7169, -9.1399],
        13,
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

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
      setTimeout(() => {
        if (!cancelled && leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 800);
      setTimeout(() => {
        if (!cancelled && leafletMapRef.current) {
          leafletMapRef.current.invalidateSize();
        }
      }, 2000);

      // Add test markers if no GPS yet (Lisboa and Porto)
      if (window.L) {
        const testMarkerLisboa = window.L.circleMarker([38.7169, -9.1399], {
          radius: 8,
          fillColor: "#e74c3c",
          color: "#c0392b",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        });
        testMarkerLisboa.bindPopup("📍 Lisboa — Marcador de teste");
        testMarkerLisboa.addTo(map);

        const testMarkerPorto = window.L.circleMarker([41.1579, -8.6291], {
          radius: 8,
          fillColor: "#3498db",
          color: "#2980b9",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.7,
        });
        testMarkerPorto.bindPopup("📍 Porto — Marcador de teste");
        testMarkerPorto.addTo(map);
      }

      // Clear the retry interval once initialized
      if (retryRef.current) {
        clearInterval(retryRef.current);
        retryRef.current = null;
      }

      // Request GPS immediately after map is ready
      requestGps();
    }

    // Retry every 200ms until window.L is available
    retryRef.current = setInterval(tryInit, 200);
    tryInit(); // attempt immediately too

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

  // ── Request GPS permission and track user location ─────────────────────────
  const requestGps = () => {
    if (!("geolocation" in navigator)) {
      setGpsState("error");
      setErrorMessage("Geolocalização não suportada neste navegador.");
      return;
    }

    setGpsState("waiting");
    setErrorMessage("");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });
        setGpsState("success");

        const map = leafletMapRef.current;
        if (!map || !window.L) return;

        // Move map to user location
        map.flyTo([latitude, longitude], 15);

        // Update or create user marker
        if (userMarkerRef.current) {
          userMarkerRef.current.setLatLng([latitude, longitude]);
        } else {
          const marker = window.L.circleMarker([latitude, longitude], {
            radius: 10,
            fillColor: "#2563eb",
            color: "#1d4ed8",
            weight: 2,
            opacity: 1,
            fillOpacity: 0.85,
          });
          marker.bindPopup("📍 A sua localização atual");
          marker.addTo(map);
          marker.openPopup();
          userMarkerRef.current = marker;
        }

        // Recalculate layout after fly animation
        setTimeout(() => {
          if (leafletMapRef.current) {
            leafletMapRef.current.invalidateSize();
          }
        }, 600);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setGpsState("denied");
          setErrorMessage(
            "Permissão de localização negada. Active o GPS nas definições do navegador e tente novamente.",
          );
        } else if (error.code === error.TIMEOUT) {
          setGpsState("error");
          setErrorMessage(
            "Tempo esgotado ao obter localização. Verifique o sinal GPS.",
          );
        } else {
          setGpsState("error");
          setErrorMessage(
            "Não foi possível obter a localização. Tente novamente.",
          );
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 30000,
      },
    );
  };

  const handleRetryGps = () => {
    requestGps();
  };

  return (
    <main
      className="flex flex-col min-h-screen bg-background"
      data-ocid="location_map.page"
    >
      {/* Page header */}
      <div className="container mx-auto px-4 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <div className="p-2 rounded-full bg-primary/10">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Mapa de Localização
            </h1>
            <p className="text-sm text-muted-foreground">
              Visualize a sua posição atual no mapa
            </p>
          </div>
        </div>
      </div>

      {/* GPS status bar */}
      <div className="container mx-auto px-4 pb-3">
        {gpsState === "waiting" && (
          <Alert className="bg-blue-50 border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <AlertDescription className="text-blue-700 text-sm">
              A aguardar permissão GPS e localização…
            </AlertDescription>
          </Alert>
        )}
        {(gpsState === "denied" || gpsState === "error") && (
          <Alert variant="destructive" data-ocid="location_map.error_state">
            <AlertDescription className="text-sm">
              {errorMessage}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Map container */}
      <div className="container mx-auto px-4 pb-4 flex-1">
        <Card className="overflow-hidden border border-border shadow-sm">
          <div
            id="location-map-standalone"
            ref={mapContainerRef}
            style={{ height: "450px", minHeight: "450px", width: "100%" }}
            className="h-[450px]"
            data-ocid="location_map.map_marker"
          />
        </Card>
      </div>

      {/* GPS info card */}
      <div className="container mx-auto px-4 pb-6">
        <Card data-ocid="location_map.gps_info">
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <Navigation className="w-4 h-4 text-primary" />
              Informação de Localização
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            {gpsState === "idle" && (
              <p className="text-sm text-muted-foreground">
                A inicializar GPS…
              </p>
            )}
            {gpsState === "waiting" && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>A obter coordenadas GPS…</span>
              </div>
            )}
            {gpsState === "success" && coords && (
              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-muted rounded-lg p-2.5 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Latitude
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {coords.lat.toFixed(6)}
                    </p>
                  </div>
                  <div className="bg-muted rounded-lg p-2.5 text-center">
                    <p className="text-xs text-muted-foreground mb-0.5">
                      Longitude
                    </p>
                    <p className="text-sm font-mono font-semibold text-foreground">
                      {coords.lng.toFixed(6)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  ✅ Localização obtida com sucesso
                </p>
              </div>
            )}
            {(gpsState === "denied" || gpsState === "error") && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">{errorMessage}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRetryGps}
                  className="w-full"
                >
                  <RefreshCw className="w-3 h-3 mr-2" />
                  Tentar novamente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Map attribution footer */}
      <div className="container mx-auto px-4 pb-4 text-center">
        <p className="text-xs text-muted-foreground">
          Leaflet • OpenStreetMap • AntiFraud
        </p>
      </div>
    </main>
  );
}
