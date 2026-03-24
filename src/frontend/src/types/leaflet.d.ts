// Type shim for leaflet — loaded at runtime. Covers the APIs used in this project.
declare module "leaflet" {
  interface MapOptions {
    zoomControl?: boolean;
    scrollWheelZoom?: boolean;
    [key: string]: unknown;
  }
  interface TileLayerOptions {
    attribution?: string;
    maxZoom?: number;
    [key: string]: unknown;
  }
  interface CircleMarkerOptions {
    radius?: number;
    fillColor?: string;
    color?: string;
    weight?: number;
    opacity?: number;
    fillOpacity?: number;
    [key: string]: unknown;
  }
  interface MarkerOptions {
    icon?: DivIcon | IconInstance;
    [key: string]: unknown;
  }
  interface IconOptions {
    iconRetinaUrl?: string;
    iconUrl?: string;
    shadowUrl?: string;
    [key: string]: unknown;
  }
  interface DivIconOptions {
    html?: string;
    className?: string;
    iconSize?: [number, number];
    iconAnchor?: [number, number];
    [key: string]: unknown;
  }
  interface PopupOptions {
    [key: string]: unknown;
  }
  interface TooltipOptions {
    permanent?: boolean;
    direction?: string;
    [key: string]: unknown;
  }

  type LatLngTuple = [number, number];

  interface LatLngBounds {
    [key: string]: unknown;
  }

  interface Layer {
    addTo(map: Map): this;
    remove(): void;
    bindPopup(content: string, options?: PopupOptions): this;
  }

  interface Marker extends Layer {
    setLatLng(latlng: LatLngTuple): this;
    bindTooltip(content: string, options?: TooltipOptions): this;
    on(event: string, handler: () => void): this;
  }

  interface CircleMarker extends Layer {
    bindPopup(content: string, options?: PopupOptions): this;
  }

  interface TileLayer extends Layer {}

  interface DivIcon {
    [key: string]: unknown;
  }
  interface IconInstance {
    [key: string]: unknown;
  }

  interface IconDefaultStatic {
    prototype: Record<string, unknown>;
    mergeOptions(options: IconOptions): void;
  }

  interface IconConstructor {
    Default: IconDefaultStatic;
    new (options: IconOptions): IconInstance;
  }

  interface Map {
    setView(center: LatLngTuple, zoom: number): this;
    remove(): void;
    invalidateSize(): void;
    fitBounds(
      bounds: LatLngBounds | LatLngTuple[],
      options?: Record<string, unknown>,
    ): void;
  }

  const Icon: IconConstructor;

  function map(el: HTMLElement | string, options?: MapOptions): Map;
  function tileLayer(
    urlTemplate: string,
    options?: TileLayerOptions,
  ): TileLayer;
  function marker(latlng: LatLngTuple, options?: MarkerOptions): Marker;
  function circleMarker(
    latlng: LatLngTuple,
    options?: CircleMarkerOptions,
  ): CircleMarker;
  function icon(options: IconOptions): IconInstance;
  function divIcon(options?: DivIconOptions): DivIcon;
  function latLngBounds(latlngs: LatLngTuple[]): LatLngBounds;

  export {
    map,
    tileLayer,
    marker,
    circleMarker,
    icon,
    divIcon,
    latLngBounds,
    Icon,
    type Map,
    type Marker,
    type CircleMarker,
    type TileLayer,
    type Layer,
    type LatLngTuple,
    type LatLngBounds,
    type DivIcon,
  };
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
