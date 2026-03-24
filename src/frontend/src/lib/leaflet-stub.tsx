/**
 * leaflet-stub.tsx — CDN-based React wrappers for Leaflet
 * Leaflet is loaded from CDN in index.html (window.L).
 * No npm dependency on 'leaflet' or 'react-leaflet'.
 */
import {
  type CSSProperties,
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createRoot } from "react-dom/client";

type LMap = any;
type LLayer = any;

const MapCtx = createContext<LMap | null>(null);
const LayerCtx = createContext<LLayer | null>(null);

function getL(): any {
  return (window as any).L;
}

// ─── useMap ───────────────────────────────────────────────────────────────────
export function useMap(): LMap {
  return useContext(MapCtx);
}

// ─── MapContainer ─────────────────────────────────────────────────────────────
interface MapContainerProps {
  center: [number, number];
  zoom: number;
  style?: CSSProperties;
  children?: ReactNode;
  scrollWheelZoom?: boolean;
  maxZoom?: number;
  minZoom?: number;
}

export function MapContainer({
  center,
  zoom,
  style,
  children,
  scrollWheelZoom = true,
  maxZoom,
  minZoom,
}: MapContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [map, setMap] = useState<LMap | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount init
  useEffect(() => {
    let cancelled = false;
    let timerId: ReturnType<typeof setTimeout>;

    const tryInit = () => {
      if (cancelled) return;
      const L = getL();
      if (!containerRef.current) return;
      // already initialised
      if ((containerRef.current as any)._leaflet_id) return;

      if (!L) {
        timerId = setTimeout(tryInit, 200);
        return;
      }

      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:
          "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      });

      const m = L.map(containerRef.current, {
        center,
        zoom,
        scrollWheelZoom,
        maxZoom,
        minZoom,
      });
      mapRef.current = m;
      setMap(m);
    };

    tryInit();

    return () => {
      cancelled = true;
      clearTimeout(timerId);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMap(null);
      }
    };
  }, []);

  return (
    <div ref={containerRef} style={style}>
      {map && <MapCtx.Provider value={map}>{children}</MapCtx.Provider>}
    </div>
  );
}

// ─── TileLayer ────────────────────────────────────────────────────────────────
interface TileLayerProps {
  url: string;
  attribution?: string;
}

export function TileLayer({ url, attribution }: TileLayerProps) {
  const map = useContext(MapCtx);

  useEffect(() => {
    const L = getL();
    if (!L || !map) return;
    const layer = L.tileLayer(url, { attribution });
    layer.addTo(map);
    return () => {
      layer.remove();
    };
  }, [map, url, attribution]);

  return null;
}

// ─── Marker ───────────────────────────────────────────────────────────────────
interface MarkerProps {
  position: [number, number];
  icon?: any;
  children?: ReactNode;
}

export function Marker({ position, icon, children }: MarkerProps) {
  const map = useContext(MapCtx);
  const [layer, setLayer] = useState<LLayer | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount per map
  useEffect(() => {
    const L = getL();
    if (!L || !map) return;
    const opts = icon ? { icon } : {};
    const m = L.marker(position, opts).addTo(map);
    setLayer(m);
    return () => {
      m.remove();
      setLayer(null);
    };
  }, [map]);

  useEffect(() => {
    if (layer) layer.setLatLng(position);
  }, [layer, position]);

  if (!layer) return null;
  return <LayerCtx.Provider value={layer}>{children}</LayerCtx.Provider>;
}

// ─── CircleMarker ─────────────────────────────────────────────────────────────
interface CircleMarkerProps {
  center: [number, number];
  radius?: number;
  pathOptions?: Record<string, any>;
  eventHandlers?: Record<string, (...args: any[]) => void>;
  children?: ReactNode;
}

export function CircleMarker({
  center,
  radius = 8,
  pathOptions,
  eventHandlers,
  children,
}: CircleMarkerProps) {
  const map = useContext(MapCtx);
  const [layer, setLayer] = useState<LLayer | null>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional one-time mount per map
  useEffect(() => {
    const L = getL();
    if (!L || !map) return;
    const m = L.circleMarker(center, { radius, ...pathOptions });
    if (eventHandlers) {
      for (const [evt, handler] of Object.entries(eventHandlers)) {
        m.on(evt, handler);
      }
    }
    m.addTo(map);
    setLayer(m);
    return () => {
      m.remove();
      setLayer(null);
    };
  }, [map]);

  useEffect(() => {
    if (layer) layer.setLatLng(center);
  }, [layer, center]);

  if (!layer) return null;
  return <LayerCtx.Provider value={layer}>{children}</LayerCtx.Provider>;
}

// ─── Popup ────────────────────────────────────────────────────────────────────
interface PopupProps {
  children?: ReactNode;
}

export function Popup({ children }: PopupProps) {
  const layer = useContext(LayerCtx);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const rootRef = useRef<any>(null);

  useEffect(() => {
    if (!layer) return;
    if (!containerRef.current) {
      containerRef.current = document.createElement("div");
    }
    if (!rootRef.current) {
      rootRef.current = createRoot(containerRef.current);
    }
    rootRef.current.render(children);
    layer.bindPopup(containerRef.current);
    return () => {
      layer.unbindPopup?.();
    };
  }, [layer, children]);

  return null;
}

// ─── Polyline ─────────────────────────────────────────────────────────────────
interface PolylineProps {
  positions: [number, number][];
  pathOptions?: Record<string, any>;
}

export function Polyline({ positions, pathOptions }: PolylineProps) {
  const map = useContext(MapCtx);

  useEffect(() => {
    const L = getL();
    if (!L || !map) return;
    const line = L.polyline(positions, pathOptions).addTo(map);
    return () => {
      line.remove();
    };
  }, [map, positions, pathOptions]);

  return null;
}
