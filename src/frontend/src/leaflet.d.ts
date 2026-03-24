// Type shims for leaflet packages not in package.json but loaded at runtime
declare module "react-leaflet" {
  import type { ReactNode } from "react";

  interface MapContainerProps {
    center?: [number, number];
    zoom?: number;
    style?: React.CSSProperties;
    maxZoom?: number;
    children?: ReactNode;
    [key: string]: any;
  }

  interface TileLayerProps {
    url: string;
    attribution?: string;
    [key: string]: any;
  }

  interface CircleMarkerProps {
    center?: [number, number];
    radius?: number;
    pathOptions?: object;
    children?: ReactNode;
    eventHandlers?: object;
    [key: string]: any;
  }

  interface PopupProps {
    children?: ReactNode;
    [key: string]: any;
  }

  export function MapContainer(props: MapContainerProps): JSX.Element;
  export function TileLayer(props: TileLayerProps): JSX.Element;
  export function CircleMarker(props: CircleMarkerProps): JSX.Element;
  export function Popup(props: PopupProps): JSX.Element;
  export function useMap(): any;
  export function Marker(props: any): JSX.Element;
  export function Polyline(props: any): JSX.Element;
}

declare module "leaflet" {
  const L: any;
  export = L;
}

declare module "leaflet/dist/leaflet.css" {
  const content: string;
  export default content;
}
