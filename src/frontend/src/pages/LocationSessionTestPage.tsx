import React, { useEffect, useRef, useState } from "react";

export default function LocationSessionTestPage() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const [status, setStatus] = useState<"loading" | "ok" | "fallback">(
    "loading",
  );

  useEffect(() => {
    if (!mapContainerRef.current || leafletMapRef.current) return;

    const L = (window as any).L;
    if (!L) {
      setStatus("fallback");
      return;
    }

    const LISBON: [number, number] = [38.7169, -9.1399];

    const map = L.map(mapContainerRef.current).setView(LISBON, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);
    leafletMapRef.current = map;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          map.setView([latitude, longitude], 15);

          const icon = L.divIcon({
            html: `<div style="background:#2563eb;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 0 8px rgba(37,99,235,0.7)"></div>`,
            className: "",
            iconSize: [18, 18],
            iconAnchor: [9, 9],
          });
          L.marker([latitude, longitude], { icon })
            .addTo(map)
            .bindPopup("A sua localização atual")
            .openPopup();

          setStatus("ok");
        },
        () => {
          // fallback — keep Lisbon view
          setStatus("fallback");
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    } else {
      setStatus("fallback");
    }

    return () => {
      map.remove();
      leafletMapRef.current = null;
    };
  }, []);

  return (
    <div
      className="min-h-screen flex flex-col bg-background"
      data-ocid="test_map.page"
    >
      {/* Header */}
      <div className="px-4 py-3 border-b bg-card">
        <h1 className="text-base font-semibold text-foreground">
          Mapa de Teste — Localização Atual
        </h1>
        {status === "loading" && (
          <p
            className="text-xs text-muted-foreground mt-0.5"
            data-ocid="test_map.loading_state"
          >
            A obter localização GPS…
          </p>
        )}
        {status === "ok" && (
          <p
            className="text-xs text-green-600 mt-0.5"
            data-ocid="test_map.success_state"
          >
            Localização obtida com sucesso.
          </p>
        )}
        {status === "fallback" && (
          <p
            className="text-xs text-amber-600 mt-0.5"
            data-ocid="test_map.error_state"
          >
            Não foi possível obter a localização GPS. A mostrar Lisboa como
            fallback.
          </p>
        )}
      </div>

      {/* Map */}
      <div
        ref={mapContainerRef}
        className="flex-1 w-full"
        style={{ minHeight: "400px" }}
        data-ocid="test_map.canvas_target"
      />

      {/* Footer */}
      <div className="px-4 py-2 border-t bg-card text-center">
        <p className="text-xs text-muted-foreground">
          Leaflet &bull; OpenStreetMap &bull; AntiFraud
        </p>
      </div>
    </div>
  );
}
