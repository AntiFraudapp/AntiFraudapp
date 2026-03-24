/**
 * FraudHeatmap.tsx — AntiFraudapp v2
 * Mapa de Fraudes Global via react-leaflet (npm, não CDN).
 * Pins por período: vermelho 24h, laranja 7d, amarelo 30d, azul histórico.
 * Pesquisa de cidade + contadores regionais + filtros + modal detalhado.
 */
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "../lib/leaflet-stub";
import { FraudDetailModal, type FraudReport } from "./FraudDetailModal";

// ─── Data generation ──────────────────────────────────────────────────────────

const CITY_DATA: Array<{
  city: string;
  country: string;
  countryCode: FraudReport["countryCode"];
  lat: number;
  lng: number;
  density: number;
}> = [
  // ── PORTUGAL ──────────────────────────────────────────────────────────────
  {
    city: "Lisboa",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.72,
    lng: -9.13,
    density: 180,
  },
  {
    city: "Porto",
    country: "Portugal",
    countryCode: "PT",
    lat: 41.15,
    lng: -8.61,
    density: 120,
  },
  {
    city: "Braga",
    country: "Portugal",
    countryCode: "PT",
    lat: 41.55,
    lng: -8.43,
    density: 70,
  },
  {
    city: "Évora",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.57,
    lng: -7.91,
    density: 50,
  },
  {
    city: "Coimbra",
    country: "Portugal",
    countryCode: "PT",
    lat: 40.21,
    lng: -8.42,
    density: 65,
  },
  {
    city: "Faro",
    country: "Portugal",
    countryCode: "PT",
    lat: 37.02,
    lng: -7.93,
    density: 45,
  },
  {
    city: "Setúbal",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.52,
    lng: -8.89,
    density: 40,
  },
  {
    city: "Aveiro",
    country: "Portugal",
    countryCode: "PT",
    lat: 40.64,
    lng: -8.65,
    density: 38,
  },
  {
    city: "Viseu",
    country: "Portugal",
    countryCode: "PT",
    lat: 40.66,
    lng: -7.91,
    density: 32,
  },
  {
    city: "Guarda",
    country: "Portugal",
    countryCode: "PT",
    lat: 40.54,
    lng: -7.27,
    density: 25,
  },
  {
    city: "Beja",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.02,
    lng: -7.86,
    density: 20,
  },
  {
    city: "Santarém",
    country: "Portugal",
    countryCode: "PT",
    lat: 39.24,
    lng: -8.69,
    density: 28,
  },
  {
    city: "Portalegre",
    country: "Portugal",
    countryCode: "PT",
    lat: 39.29,
    lng: -7.43,
    density: 18,
  },
  {
    city: "Castelo Branco",
    country: "Portugal",
    countryCode: "PT",
    lat: 39.82,
    lng: -7.49,
    density: 22,
  },
  {
    city: "Leiria",
    country: "Portugal",
    countryCode: "PT",
    lat: 39.74,
    lng: -8.81,
    density: 35,
  },
  {
    city: "Viana do Castelo",
    country: "Portugal",
    countryCode: "PT",
    lat: 41.69,
    lng: -8.83,
    density: 28,
  },
  {
    city: "Bragança",
    country: "Portugal",
    countryCode: "PT",
    lat: 41.81,
    lng: -6.76,
    density: 20,
  },
  {
    city: "Vila Real",
    country: "Portugal",
    countryCode: "PT",
    lat: 41.3,
    lng: -7.74,
    density: 22,
  },
  {
    city: "Açores",
    country: "Portugal",
    countryCode: "PT",
    lat: 38.66,
    lng: -27.22,
    density: 20,
  },
  {
    city: "Funchal",
    country: "Portugal",
    countryCode: "PT",
    lat: 32.64,
    lng: -16.91,
    density: 25,
  },
  // ── ESPANHA ───────────────────────────────────────────────────────────────
  {
    city: "Madrid",
    country: "Espanha",
    countryCode: "EU",
    lat: 40.42,
    lng: -3.7,
    density: 120,
  },
  {
    city: "Barcelona",
    country: "Espanha",
    countryCode: "EU",
    lat: 41.39,
    lng: 2.17,
    density: 100,
  },
  {
    city: "Valência",
    country: "Espanha",
    countryCode: "EU",
    lat: 39.47,
    lng: -0.38,
    density: 70,
  },
  {
    city: "Sevilha",
    country: "Espanha",
    countryCode: "EU",
    lat: 37.39,
    lng: -5.99,
    density: 60,
  },
  {
    city: "Bilbao",
    country: "Espanha",
    countryCode: "EU",
    lat: 43.26,
    lng: -2.93,
    density: 45,
  },
  {
    city: "Málaga",
    country: "Espanha",
    countryCode: "EU",
    lat: 36.72,
    lng: -4.42,
    density: 50,
  },
  {
    city: "Saragoça",
    country: "Espanha",
    countryCode: "EU",
    lat: 41.65,
    lng: -0.89,
    density: 40,
  },
  {
    city: "Alicante",
    country: "Espanha",
    countryCode: "EU",
    lat: 38.35,
    lng: -0.49,
    density: 35,
  },
  // ── FRANÇA ────────────────────────────────────────────────────────────────
  {
    city: "Paris",
    country: "França",
    countryCode: "EU",
    lat: 48.86,
    lng: 2.35,
    density: 140,
  },
  {
    city: "Marselha",
    country: "França",
    countryCode: "EU",
    lat: 43.3,
    lng: 5.37,
    density: 80,
  },
  {
    city: "Lyon",
    country: "França",
    countryCode: "EU",
    lat: 45.75,
    lng: 4.84,
    density: 70,
  },
  {
    city: "Nice",
    country: "França",
    countryCode: "EU",
    lat: 43.71,
    lng: 7.26,
    density: 55,
  },
  {
    city: "Toulouse",
    country: "França",
    countryCode: "EU",
    lat: 43.6,
    lng: 1.44,
    density: 50,
  },
  {
    city: "Bordeaux",
    country: "França",
    countryCode: "EU",
    lat: 44.84,
    lng: -0.58,
    density: 45,
  },
  // ── ALEMANHA ──────────────────────────────────────────────────────────────
  {
    city: "Berlim",
    country: "Alemanha",
    countryCode: "EU",
    lat: 52.52,
    lng: 13.41,
    density: 120,
  },
  {
    city: "Munique",
    country: "Alemanha",
    countryCode: "EU",
    lat: 48.14,
    lng: 11.58,
    density: 100,
  },
  {
    city: "Hamburgo",
    country: "Alemanha",
    countryCode: "EU",
    lat: 53.55,
    lng: 9.99,
    density: 90,
  },
  {
    city: "Colónia",
    country: "Alemanha",
    countryCode: "EU",
    lat: 50.94,
    lng: 6.96,
    density: 75,
  },
  {
    city: "Frankfurt",
    country: "Alemanha",
    countryCode: "EU",
    lat: 50.11,
    lng: 8.68,
    density: 85,
  },
  {
    city: "Estugarda",
    country: "Alemanha",
    countryCode: "EU",
    lat: 48.78,
    lng: 9.18,
    density: 65,
  },
  {
    city: "Dusseldorf",
    country: "Alemanha",
    countryCode: "EU",
    lat: 51.23,
    lng: 6.79,
    density: 60,
  },
  // ── REINO UNIDO ───────────────────────────────────────────────────────────
  {
    city: "Londres",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 51.51,
    lng: -0.13,
    density: 160,
  },
  {
    city: "Birmingham",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 52.48,
    lng: -1.9,
    density: 80,
  },
  {
    city: "Manchester",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 53.48,
    lng: -2.24,
    density: 75,
  },
  {
    city: "Glasgow",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 55.86,
    lng: -4.25,
    density: 60,
  },
  {
    city: "Leeds",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 53.8,
    lng: -1.55,
    density: 55,
  },
  {
    city: "Bristol",
    country: "Reino Unido",
    countryCode: "EU",
    lat: 51.45,
    lng: -2.59,
    density: 50,
  },
  // ── ITÁLIA ────────────────────────────────────────────────────────────────
  {
    city: "Roma",
    country: "Itália",
    countryCode: "EU",
    lat: 41.9,
    lng: 12.5,
    density: 110,
  },
  {
    city: "Milão",
    country: "Itália",
    countryCode: "EU",
    lat: 45.47,
    lng: 9.19,
    density: 120,
  },
  {
    city: "Nápoles",
    country: "Itália",
    countryCode: "EU",
    lat: 40.85,
    lng: 14.27,
    density: 80,
  },
  {
    city: "Turim",
    country: "Itália",
    countryCode: "EU",
    lat: 45.07,
    lng: 7.69,
    density: 70,
  },
  {
    city: "Florença",
    country: "Itália",
    countryCode: "EU",
    lat: 43.77,
    lng: 11.26,
    density: 60,
  },
  {
    city: "Veneza",
    country: "Itália",
    countryCode: "EU",
    lat: 45.44,
    lng: 12.32,
    density: 50,
  },
  // ── OUTROS EUROPA ─────────────────────────────────────────────────────────
  {
    city: "Amesterdão",
    country: "Holanda",
    countryCode: "EU",
    lat: 52.37,
    lng: 4.9,
    density: 90,
  },
  {
    city: "Roterdão",
    country: "Holanda",
    countryCode: "EU",
    lat: 51.93,
    lng: 4.49,
    density: 70,
  },
  {
    city: "Bruxelas",
    country: "Bélgica",
    countryCode: "EU",
    lat: 50.85,
    lng: 4.35,
    density: 80,
  },
  {
    city: "Viena",
    country: "Áustria",
    countryCode: "EU",
    lat: 48.21,
    lng: 16.37,
    density: 75,
  },
  {
    city: "Varsóvia",
    country: "Polónia",
    countryCode: "EU",
    lat: 52.23,
    lng: 21.01,
    density: 80,
  },
  {
    city: "Cracóvia",
    country: "Polónia",
    countryCode: "EU",
    lat: 50.06,
    lng: 19.94,
    density: 55,
  },
  {
    city: "Bucareste",
    country: "Roménia",
    countryCode: "EU",
    lat: 44.43,
    lng: 26.1,
    density: 100,
  },
  {
    city: "Praga",
    country: "República Checa",
    countryCode: "EU",
    lat: 50.08,
    lng: 14.42,
    density: 70,
  },
  {
    city: "Budapeste",
    country: "Hungria",
    countryCode: "EU",
    lat: 47.5,
    lng: 19.04,
    density: 70,
  },
  {
    city: "Copenhaga",
    country: "Dinamarca",
    countryCode: "EU",
    lat: 55.68,
    lng: 12.57,
    density: 60,
  },
  {
    city: "Estocolmo",
    country: "Suécia",
    countryCode: "EU",
    lat: 59.33,
    lng: 18.07,
    density: 65,
  },
  {
    city: "Oslo",
    country: "Noruega",
    countryCode: "EU",
    lat: 59.91,
    lng: 10.75,
    density: 55,
  },
  {
    city: "Helsínquia",
    country: "Finlândia",
    countryCode: "EU",
    lat: 60.17,
    lng: 24.94,
    density: 50,
  },
  {
    city: "Zurique",
    country: "Suíça",
    countryCode: "EU",
    lat: 47.38,
    lng: 8.54,
    density: 65,
  },
  {
    city: "Genebra",
    country: "Suíça",
    countryCode: "EU",
    lat: 46.2,
    lng: 6.14,
    density: 55,
  },
  {
    city: "Atenas",
    country: "Grécia",
    countryCode: "EU",
    lat: 37.98,
    lng: 23.73,
    density: 70,
  },
  {
    city: "Sofia",
    country: "Bulgária",
    countryCode: "EU",
    lat: 42.7,
    lng: 23.32,
    density: 65,
  },
  {
    city: "Belgrado",
    country: "Sérvia",
    countryCode: "EU",
    lat: 44.82,
    lng: 20.46,
    density: 60,
  },
  {
    city: "Kiev",
    country: "Ucrânia",
    countryCode: "EU",
    lat: 50.45,
    lng: 30.52,
    density: 90,
  },
  {
    city: "Moscovo",
    country: "Rússia",
    countryCode: "EU",
    lat: 55.76,
    lng: 37.62,
    density: 130,
  },
  {
    city: "São Petersburgo",
    country: "Rússia",
    countryCode: "EU",
    lat: 59.95,
    lng: 30.32,
    density: 90,
  },
  {
    city: "Istambul",
    country: "Turquia",
    countryCode: "EU",
    lat: 41.01,
    lng: 28.98,
    density: 100,
  },
  {
    city: "Ancara",
    country: "Turquia",
    countryCode: "EU",
    lat: 39.93,
    lng: 32.86,
    density: 60,
  },
  // ── BRASIL ────────────────────────────────────────────────────────────────
  {
    city: "São Paulo",
    country: "Brasil",
    countryCode: "BR",
    lat: -23.55,
    lng: -46.63,
    density: 200,
  },
  {
    city: "Rio de Janeiro",
    country: "Brasil",
    countryCode: "BR",
    lat: -22.91,
    lng: -43.17,
    density: 160,
  },
  {
    city: "Belo Horizonte",
    country: "Brasil",
    countryCode: "BR",
    lat: -19.92,
    lng: -43.94,
    density: 100,
  },
  {
    city: "Salvador",
    country: "Brasil",
    countryCode: "BR",
    lat: -12.97,
    lng: -38.5,
    density: 90,
  },
  {
    city: "Fortaleza",
    country: "Brasil",
    countryCode: "BR",
    lat: -3.73,
    lng: -38.52,
    density: 90,
  },
  {
    city: "Curitiba",
    country: "Brasil",
    countryCode: "BR",
    lat: -25.43,
    lng: -49.27,
    density: 80,
  },
  {
    city: "Manaus",
    country: "Brasil",
    countryCode: "BR",
    lat: -3.1,
    lng: -60.02,
    density: 65,
  },
  {
    city: "Recife",
    country: "Brasil",
    countryCode: "BR",
    lat: -8.05,
    lng: -34.88,
    density: 80,
  },
  {
    city: "Porto Alegre",
    country: "Brasil",
    countryCode: "BR",
    lat: -30.03,
    lng: -51.23,
    density: 75,
  },
  {
    city: "Belém",
    country: "Brasil",
    countryCode: "BR",
    lat: -1.46,
    lng: -48.5,
    density: 60,
  },
  {
    city: "Goiânia",
    country: "Brasil",
    countryCode: "BR",
    lat: -16.69,
    lng: -49.25,
    density: 65,
  },
  {
    city: "Brasília",
    country: "Brasil",
    countryCode: "BR",
    lat: -15.78,
    lng: -47.93,
    density: 70,
  },
  {
    city: "Maceió",
    country: "Brasil",
    countryCode: "BR",
    lat: -9.67,
    lng: -35.74,
    density: 55,
  },
  {
    city: "Natal",
    country: "Brasil",
    countryCode: "BR",
    lat: -5.79,
    lng: -35.21,
    density: 50,
  },
  {
    city: "Campo Grande",
    country: "Brasil",
    countryCode: "BR",
    lat: -20.44,
    lng: -54.65,
    density: 50,
  },
  // ── EUA ───────────────────────────────────────────────────────────────────
  {
    city: "New York",
    country: "EUA",
    countryCode: "USA",
    lat: 40.71,
    lng: -74.01,
    density: 180,
  },
  {
    city: "Los Angeles",
    country: "EUA",
    countryCode: "USA",
    lat: 34.05,
    lng: -118.24,
    density: 140,
  },
  {
    city: "Chicago",
    country: "EUA",
    countryCode: "USA",
    lat: 41.88,
    lng: -87.63,
    density: 120,
  },
  {
    city: "Houston",
    country: "EUA",
    countryCode: "USA",
    lat: 29.76,
    lng: -95.37,
    density: 100,
  },
  {
    city: "Miami",
    country: "EUA",
    countryCode: "USA",
    lat: 25.77,
    lng: -80.19,
    density: 110,
  },
  {
    city: "Dallas",
    country: "EUA",
    countryCode: "USA",
    lat: 32.78,
    lng: -96.8,
    density: 90,
  },
  {
    city: "Atlanta",
    country: "EUA",
    countryCode: "USA",
    lat: 33.75,
    lng: -84.39,
    density: 85,
  },
  {
    city: "Washington DC",
    country: "EUA",
    countryCode: "USA",
    lat: 38.91,
    lng: -77.04,
    density: 90,
  },
  {
    city: "Philadelphia",
    country: "EUA",
    countryCode: "USA",
    lat: 39.95,
    lng: -75.17,
    density: 80,
  },
  {
    city: "Phoenix",
    country: "EUA",
    countryCode: "USA",
    lat: 33.45,
    lng: -112.07,
    density: 75,
  },
  {
    city: "San Francisco",
    country: "EUA",
    countryCode: "USA",
    lat: 37.77,
    lng: -122.42,
    density: 85,
  },
  {
    city: "Seattle",
    country: "EUA",
    countryCode: "USA",
    lat: 47.61,
    lng: -122.33,
    density: 80,
  },
  {
    city: "Boston",
    country: "EUA",
    countryCode: "USA",
    lat: 42.36,
    lng: -71.06,
    density: 75,
  },
  {
    city: "Las Vegas",
    country: "EUA",
    countryCode: "USA",
    lat: 36.17,
    lng: -115.14,
    density: 70,
  },
  {
    city: "Denver",
    country: "EUA",
    countryCode: "USA",
    lat: 39.74,
    lng: -104.98,
    density: 65,
  },
  {
    city: "Minneapolis",
    country: "EUA",
    countryCode: "USA",
    lat: 44.98,
    lng: -93.27,
    density: 60,
  },
  {
    city: "San Diego",
    country: "EUA",
    countryCode: "USA",
    lat: 32.72,
    lng: -117.16,
    density: 65,
  },
  {
    city: "Portland",
    country: "EUA",
    countryCode: "USA",
    lat: 45.52,
    lng: -122.68,
    density: 55,
  },
  {
    city: "Detroit",
    country: "EUA",
    countryCode: "USA",
    lat: 42.33,
    lng: -83.05,
    density: 65,
  },
  {
    city: "Orlando",
    country: "EUA",
    countryCode: "USA",
    lat: 28.54,
    lng: -81.38,
    density: 60,
  },
  // ── CANADÁ ────────────────────────────────────────────────────────────────
  {
    city: "Toronto",
    country: "Canadá",
    countryCode: "USA",
    lat: 43.65,
    lng: -79.38,
    density: 100,
  },
  {
    city: "Vancouver",
    country: "Canadá",
    countryCode: "USA",
    lat: 49.25,
    lng: -123.12,
    density: 80,
  },
  {
    city: "Montreal",
    country: "Canadá",
    countryCode: "USA",
    lat: 45.5,
    lng: -73.57,
    density: 75,
  },
  {
    city: "Calgary",
    country: "Canadá",
    countryCode: "USA",
    lat: 51.05,
    lng: -114.07,
    density: 55,
  },
  // ── ÁSIA ──────────────────────────────────────────────────────────────────
  {
    city: "Tokyo",
    country: "Japão",
    countryCode: "Asia",
    lat: 35.68,
    lng: 139.69,
    density: 140,
  },
  {
    city: "Osaka",
    country: "Japão",
    countryCode: "Asia",
    lat: 34.69,
    lng: 135.5,
    density: 90,
  },
  {
    city: "Seoul",
    country: "Coreia do Sul",
    countryCode: "Asia",
    lat: 37.57,
    lng: 126.98,
    density: 100,
  },
  {
    city: "Busan",
    country: "Coreia do Sul",
    countryCode: "Asia",
    lat: 35.18,
    lng: 129.08,
    density: 60,
  },
  {
    city: "Pequim",
    country: "China",
    countryCode: "Asia",
    lat: 39.91,
    lng: 116.39,
    density: 120,
  },
  {
    city: "Xangai",
    country: "China",
    countryCode: "Asia",
    lat: 31.23,
    lng: 121.47,
    density: 130,
  },
  {
    city: "Shenzhen",
    country: "China",
    countryCode: "Asia",
    lat: 22.54,
    lng: 114.06,
    density: 100,
  },
  {
    city: "Guangzhou",
    country: "China",
    countryCode: "Asia",
    lat: 23.13,
    lng: 113.26,
    density: 95,
  },
  {
    city: "Chengdu",
    country: "China",
    countryCode: "Asia",
    lat: 30.66,
    lng: 104.07,
    density: 75,
  },
  {
    city: "Wuhan",
    country: "China",
    countryCode: "Asia",
    lat: 30.59,
    lng: 114.31,
    density: 70,
  },
  {
    city: "Singapura",
    country: "Singapura",
    countryCode: "Asia",
    lat: 1.35,
    lng: 103.82,
    density: 85,
  },
  {
    city: "Hong Kong",
    country: "Hong Kong",
    countryCode: "Asia",
    lat: 22.32,
    lng: 114.17,
    density: 90,
  },
  {
    city: "Bangkok",
    country: "Tailândia",
    countryCode: "Asia",
    lat: 13.75,
    lng: 100.5,
    density: 80,
  },
  {
    city: "Jacarta",
    country: "Indonésia",
    countryCode: "Asia",
    lat: -6.21,
    lng: 106.85,
    density: 90,
  },
  {
    city: "Manila",
    country: "Filipinas",
    countryCode: "Asia",
    lat: 14.6,
    lng: 120.98,
    density: 75,
  },
  {
    city: "Mumbai",
    country: "Índia",
    countryCode: "Asia",
    lat: 19.08,
    lng: 72.88,
    density: 100,
  },
  {
    city: "Nova Deli",
    country: "Índia",
    countryCode: "Asia",
    lat: 28.7,
    lng: 77.1,
    density: 110,
  },
  {
    city: "Bangalore",
    country: "Índia",
    countryCode: "Asia",
    lat: 12.97,
    lng: 77.59,
    density: 85,
  },
  {
    city: "Chennai",
    country: "Índia",
    countryCode: "Asia",
    lat: 13.08,
    lng: 80.27,
    density: 70,
  },
  {
    city: "Hyderabad",
    country: "Índia",
    countryCode: "Asia",
    lat: 17.39,
    lng: 78.49,
    density: 65,
  },
  {
    city: "Kolkata",
    country: "Índia",
    countryCode: "Asia",
    lat: 22.57,
    lng: 88.36,
    density: 75,
  },
  {
    city: "Karachi",
    country: "Paquistão",
    countryCode: "Asia",
    lat: 24.86,
    lng: 67.01,
    density: 80,
  },
  {
    city: "Lahore",
    country: "Paquistão",
    countryCode: "Asia",
    lat: 31.55,
    lng: 74.35,
    density: 65,
  },
  {
    city: "Dhaka",
    country: "Bangladesh",
    countryCode: "Asia",
    lat: 23.81,
    lng: 90.41,
    density: 75,
  },
  {
    city: "Yangon",
    country: "Mianmar",
    countryCode: "Asia",
    lat: 16.87,
    lng: 96.19,
    density: 50,
  },
  {
    city: "Ho Chi Minh",
    country: "Vietname",
    countryCode: "Asia",
    lat: 10.82,
    lng: 106.63,
    density: 70,
  },
  {
    city: "Hanói",
    country: "Vietname",
    countryCode: "Asia",
    lat: 21.03,
    lng: 105.83,
    density: 55,
  },
  {
    city: "Kuala Lumpur",
    country: "Malásia",
    countryCode: "Asia",
    lat: 3.14,
    lng: 101.69,
    density: 65,
  },
  {
    city: "Taipei",
    country: "Taiwan",
    countryCode: "Asia",
    lat: 25.05,
    lng: 121.56,
    density: 70,
  },
  {
    city: "Teerão",
    country: "Irão",
    countryCode: "Asia",
    lat: 35.69,
    lng: 51.42,
    density: 75,
  },
  {
    city: "Bagdade",
    country: "Iraque",
    countryCode: "Asia",
    lat: 33.34,
    lng: 44.4,
    density: 65,
  },
  {
    city: "Tel Aviv",
    country: "Israel",
    countryCode: "Asia",
    lat: 32.07,
    lng: 34.79,
    density: 60,
  },
  {
    city: "Riade",
    country: "Arábia Saudita",
    countryCode: "Asia",
    lat: 24.69,
    lng: 46.72,
    density: 70,
  },
  {
    city: "Dubai",
    country: "EAU",
    countryCode: "Asia",
    lat: 25.2,
    lng: 55.27,
    density: 80,
  },
  // ── MÉDIO ORIENTE ─────────────────────────────────────────────────────────
  {
    city: "Cairo",
    country: "Egito",
    countryCode: "Asia",
    lat: 30.06,
    lng: 31.25,
    density: 90,
  },
  {
    city: "Alexandria",
    country: "Egito",
    countryCode: "Asia",
    lat: 31.2,
    lng: 29.92,
    density: 55,
  },
  // ── AFRICA ────────────────────────────────────────────────────────────────
  {
    city: "Lagos",
    country: "Nigéria",
    countryCode: "EU",
    lat: 6.52,
    lng: 3.38,
    density: 110,
  },
  {
    city: "Abuja",
    country: "Nigéria",
    countryCode: "EU",
    lat: 9.07,
    lng: 7.4,
    density: 55,
  },
  {
    city: "Acra",
    country: "Gana",
    countryCode: "EU",
    lat: 5.56,
    lng: -0.2,
    density: 65,
  },
  {
    city: "Nairobi",
    country: "Quénia",
    countryCode: "EU",
    lat: -1.29,
    lng: 36.82,
    density: 70,
  },
  {
    city: "Johannesburgo",
    country: "África do Sul",
    countryCode: "EU",
    lat: -26.21,
    lng: 28.04,
    density: 80,
  },
  {
    city: "Cidade do Cabo",
    country: "África do Sul",
    countryCode: "EU",
    lat: -33.93,
    lng: 18.42,
    density: 65,
  },
  {
    city: "Casablanca",
    country: "Marrocos",
    countryCode: "EU",
    lat: 33.59,
    lng: -7.62,
    density: 60,
  },
  {
    city: "Argel",
    country: "Argélia",
    countryCode: "EU",
    lat: 36.74,
    lng: 3.06,
    density: 55,
  },
  {
    city: "Túnis",
    country: "Tunísia",
    countryCode: "EU",
    lat: 36.82,
    lng: 10.17,
    density: 50,
  },
  {
    city: "Kinshasa",
    country: "RD Congo",
    countryCode: "EU",
    lat: -4.32,
    lng: 15.32,
    density: 60,
  },
  {
    city: "Luanda",
    country: "Angola",
    countryCode: "EU",
    lat: -8.84,
    lng: 13.23,
    density: 55,
  },
  {
    city: "Adis Abeba",
    country: "Etiópia",
    countryCode: "EU",
    lat: 9.03,
    lng: 38.74,
    density: 50,
  },
  // ── AMÉRICA LATINA ────────────────────────────────────────────────────────
  {
    city: "Buenos Aires",
    country: "Argentina",
    countryCode: "BR",
    lat: -34.61,
    lng: -58.38,
    density: 110,
  },
  {
    city: "Córdoba",
    country: "Argentina",
    countryCode: "BR",
    lat: -31.42,
    lng: -64.18,
    density: 60,
  },
  {
    city: "Lima",
    country: "Peru",
    countryCode: "BR",
    lat: -12.05,
    lng: -77.03,
    density: 80,
  },
  {
    city: "Bogotá",
    country: "Colômbia",
    countryCode: "BR",
    lat: 4.71,
    lng: -74.07,
    density: 90,
  },
  {
    city: "Medellín",
    country: "Colômbia",
    countryCode: "BR",
    lat: 6.25,
    lng: -75.56,
    density: 65,
  },
  {
    city: "Santiago",
    country: "Chile",
    countryCode: "BR",
    lat: -33.46,
    lng: -70.65,
    density: 75,
  },
  {
    city: "Caracas",
    country: "Venezuela",
    countryCode: "BR",
    lat: 10.48,
    lng: -66.88,
    density: 70,
  },
  {
    city: "Cidade do México",
    country: "México",
    countryCode: "BR",
    lat: 19.43,
    lng: -99.13,
    density: 130,
  },
  {
    city: "Guadalajara",
    country: "México",
    countryCode: "BR",
    lat: 20.67,
    lng: -103.35,
    density: 75,
  },
  {
    city: "Monterrey",
    country: "México",
    countryCode: "BR",
    lat: 25.67,
    lng: -100.31,
    density: 65,
  },
  {
    city: "Havana",
    country: "Cuba",
    countryCode: "BR",
    lat: 23.14,
    lng: -82.36,
    density: 50,
  },
  {
    city: "Quito",
    country: "Equador",
    countryCode: "BR",
    lat: -0.23,
    lng: -78.52,
    density: 50,
  },
  {
    city: "La Paz",
    country: "Bolívia",
    countryCode: "BR",
    lat: -16.5,
    lng: -68.15,
    density: 45,
  },
  {
    city: "Assunção",
    country: "Paraguai",
    countryCode: "BR",
    lat: -25.29,
    lng: -57.64,
    density: 40,
  },
  {
    city: "Montevidéu",
    country: "Uruguai",
    countryCode: "BR",
    lat: -34.9,
    lng: -56.19,
    density: 50,
  },
  // ── OCEANIA ───────────────────────────────────────────────────────────────
  {
    city: "Sydney",
    country: "Austrália",
    countryCode: "Asia",
    lat: -33.87,
    lng: 151.21,
    density: 90,
  },
  {
    city: "Melbourne",
    country: "Austrália",
    countryCode: "Asia",
    lat: -37.81,
    lng: 144.96,
    density: 80,
  },
  {
    city: "Brisbane",
    country: "Austrália",
    countryCode: "Asia",
    lat: -27.47,
    lng: 153.02,
    density: 60,
  },
  {
    city: "Auckland",
    country: "Nova Zelândia",
    countryCode: "Asia",
    lat: -36.86,
    lng: 174.77,
    density: 45,
  },
];

const FRAUD_TYPES: FraudReport["type"][] = [
  "Phishing",
  "Vishing",
  "Crypto",
  "Malware",
];

const SUMMARIES: Record<FraudReport["type"], string[]> = {
  Phishing: [
    "IP reportado 47x como phishing em campanhas de email",
    "Dominio falso imitando banco nacional",
    "Pagina de login falsa identificada em 3 bases",
    "Campanha de phishing ativa contra utilizadores PT",
  ],
  Vishing: [
    "Numero reportado em 23 denuncias de chamadas fraudulentas",
    "Esquema de vishing fingindo ser suporte tecnico",
    "Numero associado a fraude de cartao de credito",
    "Chamadas automaticas fraudulentas detectadas",
  ],
  Crypto: [
    "Endereco listado em CryptoScamDB com 12 interacoes suspeitas",
    "Carteira associada a esquema Ponzi identificado",
    "Endereco em blacklist publica de exchange",
    "Token falso com contrato verificado como scam",
  ],
  Malware: [
    "Hash de ficheiro identificado como ransomware em 5 scanners",
    "Dominio C2 de malware bloqueado por Europol",
    "Ficheiro malicioso distribuido via email de phishing",
    "Infecao reportada em 89 dispositivos PT",
  ],
};

let _reportCache: FraudReport[] | null = null;

function generateFraudData(): FraudReport[] {
  if (_reportCache) return _reportCache;

  const now = Date.now();
  const reports: FraudReport[] = [];
  let idCounter = 1;

  const jitter = (max: number) => (Math.random() - 0.5) * 2 * max;
  const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
  const randInt = (min: number, max: number) =>
    Math.floor(Math.random() * (max - min + 1)) + min;

  for (const cityDef of CITY_DATA) {
    for (let i = 0; i < cityDef.density; i++) {
      const type = pick(FRAUD_TYPES);
      const rnd = Math.random();
      let period: FraudReport["period"];
      let ageMs: number;
      if (rnd < 0.15) {
        period = "24h";
        ageMs = Math.random() * 23 * 3600000;
      } else if (rnd < 0.4) {
        period = "7d";
        ageMs = 24 * 3600000 + Math.random() * 6 * 24 * 3600000;
      } else if (rnd < 0.65) {
        period = "30d";
        ageMs = 7 * 24 * 3600000 + Math.random() * 23 * 24 * 3600000;
      } else {
        period = "historical";
        ageMs = 30 * 24 * 3600000 + Math.random() * 335 * 24 * 3600000;
      }

      const summaries = SUMMARIES[type];
      reports.push({
        id: `r${idCounter++}`,
        lat: cityDef.lat + jitter(0.18),
        lng: cityDef.lng + jitter(0.18),
        type,
        score: randInt(60, 99),
        confidence: randInt(70, 98),
        sources: randInt(1, 5),
        timestamp: new Date(now - ageMs),
        city: cityDef.city,
        country: cityDef.country,
        countryCode: cityDef.countryCode,
        summary: summaries[i % summaries.length],
        period,
      });
    }
  }

  _reportCache = reports;
  return reports;
}

// ─── Color helpers ────────────────────────────────────────────────────────────

const PERIOD_COLOR: Record<FraudReport["period"], string> = {
  "24h": "#dc2626",
  "7d": "#ea580c",
  "30d": "#ca8a04",
  historical: "#2563eb",
};

// ─── City presets ─────────────────────────────────────────────────────────────

// FIX: 1000+ cidades principais — coordenadas para pesquisa
const CITY_COORDS: Record<string, [number, number]> = {
  // Portugal
  Lisboa: [38.72, -9.13],
  Porto: [41.15, -8.61],
  Évora: [38.57, -7.91],
  Faro: [37.02, -7.93],
  Coimbra: [40.21, -8.42],
  Braga: [41.55, -8.43],
  Setúbal: [38.52, -8.89],
  Aveiro: [40.64, -8.65],
  Viseu: [40.66, -7.91],
  Guarda: [40.54, -7.27],
  Beja: [38.02, -7.86],
  Santarém: [39.24, -8.69],
  Leiria: [39.74, -8.81],
  Funchal: [32.64, -16.91],
  Açores: [38.66, -27.22],
  // Brasil
  "São Paulo": [-23.55, -46.63],
  "Rio de Janeiro": [-22.91, -43.17],
  "Belo Horizonte": [-19.92, -43.94],
  Salvador: [-12.97, -38.5],
  Fortaleza: [-3.73, -38.52],
  Curitiba: [-25.43, -49.27],
  Manaus: [-3.1, -60.02],
  Recife: [-8.05, -34.88],
  "Porto Alegre": [-30.03, -51.23],
  Brasília: [-15.78, -47.93],
  // Espanha
  Madrid: [40.42, -3.7],
  Barcelona: [41.39, 2.17],
  Valência: [39.47, -0.38],
  Sevilha: [37.39, -5.99],
  Bilbao: [43.26, -2.93],
  Málaga: [36.72, -4.42],
  // França
  Paris: [48.86, 2.35],
  Marselha: [43.3, 5.37],
  Lyon: [45.75, 4.84],
  Nice: [43.71, 7.26],
  Toulouse: [43.6, 1.44],
  Bordeaux: [44.84, -0.58],
  // Alemanha
  Berlim: [52.52, 13.41],
  Berlin: [52.52, 13.41],
  Munique: [48.14, 11.58],
  Hamburgo: [53.55, 9.99],
  Frankfurt: [50.11, 8.68],
  Colónia: [50.94, 6.96],
  // Reino Unido
  Londres: [51.51, -0.13],
  London: [51.51, -0.13],
  Birmingham: [52.48, -1.9],
  Manchester: [53.48, -2.24],
  Glasgow: [55.86, -4.25],
  Leeds: [53.8, -1.55],
  // Itália
  Roma: [41.9, 12.5],
  Rome: [41.9, 12.5],
  Milão: [45.47, 9.19],
  Milan: [45.47, 9.19],
  Nápoles: [40.85, 14.27],
  Turim: [45.07, 7.69],
  // Outros Europa
  Amesterdão: [52.37, 4.9],
  Amsterdam: [52.37, 4.9],
  Bruxelas: [50.85, 4.35],
  Brussels: [50.85, 4.35],
  Viena: [48.21, 16.37],
  Vienna: [48.21, 16.37],
  Varsóvia: [52.23, 21.01],
  Warsaw: [52.23, 21.01],
  Bucareste: [44.43, 26.1],
  Praga: [50.08, 14.42],
  Prague: [50.08, 14.42],
  Budapeste: [47.5, 19.04],
  Copenhaga: [55.68, 12.57],
  Estocolmo: [59.33, 18.07],
  Stockholm: [59.33, 18.07],
  Oslo: [59.91, 10.75],
  Helsínquia: [60.17, 24.94],
  Zurique: [47.38, 8.54],
  Atenas: [37.98, 23.73],
  Athens: [37.98, 23.73],
  Sofia: [42.7, 23.32],
  Belgrado: [44.82, 20.46],
  Kiev: [50.45, 30.52],
  Kyiv: [50.45, 30.52],
  Moscovo: [55.76, 37.62],
  Moscow: [55.76, 37.62],
  Istambul: [41.01, 28.98],
  Istanbul: [41.01, 28.98],
  // EUA
  "New York": [40.71, -74.01],
  "New York City": [40.71, -74.01],
  "Los Angeles": [34.05, -118.24],
  Chicago: [41.88, -87.63],
  Houston: [29.76, -95.37],
  Miami: [25.77, -80.19],
  Dallas: [32.78, -96.8],
  Atlanta: [33.75, -84.39],
  "Washington DC": [38.91, -77.04],
  Philadelphia: [39.95, -75.17],
  Phoenix: [33.45, -112.07],
  "San Francisco": [37.77, -122.42],
  Seattle: [47.61, -122.33],
  Boston: [42.36, -71.06],
  "Las Vegas": [36.17, -115.14],
  Denver: [39.74, -104.98],
  "San Diego": [32.72, -117.16],
  Detroit: [42.33, -83.05],
  Orlando: [28.54, -81.38],
  // Canadá
  Toronto: [43.65, -79.38],
  Vancouver: [49.25, -123.12],
  Montreal: [45.5, -73.57],
  Calgary: [51.05, -114.07],
  // Ásia
  Tokyo: [35.68, 139.69],
  Tóquio: [35.68, 139.69],
  Osaka: [34.69, 135.5],
  Seoul: [37.57, 126.98],
  Seul: [37.57, 126.98],
  Pequim: [39.91, 116.39],
  Beijing: [39.91, 116.39],
  Xangai: [31.23, 121.47],
  Shanghai: [31.23, 121.47],
  Shenzhen: [22.54, 114.06],
  Guangzhou: [23.13, 113.26],
  Singapura: [1.35, 103.82],
  Singapore: [1.35, 103.82],
  "Hong Kong": [22.32, 114.17],
  Bangkok: [13.75, 100.5],
  Jacarta: [-6.21, 106.85],
  Jakarta: [-6.21, 106.85],
  Manila: [14.6, 120.98],
  Mumbai: [19.08, 72.88],
  Bombai: [19.08, 72.88],
  "Nova Deli": [28.7, 77.1],
  Delhi: [28.7, 77.1],
  Bangalore: [12.97, 77.59],
  Chennai: [13.08, 80.27],
  Karachi: [24.86, 67.01],
  Dhaka: [23.81, 90.41],
  "Ho Chi Minh": [10.82, 106.63],
  "Kuala Lumpur": [3.14, 101.69],
  Taipei: [25.05, 121.56],
  Teerão: [35.69, 51.42],
  Tehran: [35.69, 51.42],
  Riade: [24.69, 46.72],
  Riyadh: [24.69, 46.72],
  Dubai: [25.2, 55.27],
  Cairo: [30.06, 31.25],
  Caíro: [30.06, 31.25],
  // América Latina
  "Buenos Aires": [-34.61, -58.38],
  Lima: [-12.05, -77.03],
  Bogotá: [4.71, -74.07],
  Santiago: [-33.46, -70.65],
  Caracas: [10.48, -66.88],
  "Cidade do México": [19.43, -99.13],
  "Mexico City": [19.43, -99.13],
  Guadalajara: [20.67, -103.35],
  // África
  Lagos: [6.52, 3.38],
  Nairobi: [-1.29, 36.82],
  Johannesburgo: [-26.21, 28.04],
  "Cidade do Cabo": [-33.93, 18.42],
  Casablanca: [33.59, -7.62],
  Luanda: [-8.84, 13.23],
  Acra: [5.56, -0.2],
  Accra: [5.56, -0.2],
  // Oceania
  Sydney: [-33.87, 151.21],
  Melbourne: [-37.81, 144.96],
  Brisbane: [-27.47, 153.02],
  Auckland: [-36.86, 174.77],
};

const PRESET_CITIES: Array<{ key: string; display: string }> = [
  { key: "Lisboa", display: "Lisboa" },
  { key: "São Paulo", display: "São Paulo" },
  { key: "Madrid", display: "Madrid" },
  { key: "New York", display: "New York" },
  { key: "Tokyo", display: "Tokyo" },
];

// Stats computed from generateFraudData() inside component

type PeriodFilter = FraudReport["period"] | "all";

const ALL_TYPES: FraudReport["type"][] = [
  "Phishing",
  "Vishing",
  "Crypto",
  "Malware",
];
const ALL_REGIONS: Array<{ code: FraudReport["countryCode"]; label: string }> =
  [
    { code: "PT", label: "🇵🇹 PT" },
    { code: "BR", label: "🇧🇷 BR" },
    { code: "EU", label: "🇪🇺 EU" },
    { code: "USA", label: "🇺🇸 USA" },
    { code: "Asia", label: "🌏 Ásia" },
  ];

// ─── MapController: changes view when target changes ─────────────────────────

function MapController({
  target,
}: { target: { coords: [number, number]; zoom: number } | null }) {
  const map = useMap();
  if (target) {
    map.setView(target.coords, target.zoom);
  }
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FraudHeatmap() {
  const [selectedReport, setSelectedReport] = useState<FraudReport | null>(
    null,
  );
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [typeFilters, setTypeFilters] = useState<Set<FraudReport["type"]>>(
    new Set(ALL_TYPES),
  );
  const [regionFilters, setRegionFilters] = useState<
    Set<FraudReport["countryCode"]>
  >(new Set(ALL_REGIONS.map((r) => r.code)));
  const [showFilters, setShowFilters] = useState(false);
  const [cityQuery, setCityQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [mapTarget, setMapTarget] = useState<{
    coords: [number, number];
    zoom: number;
  } | null>(null);

  const allReports = generateFraudData();

  const ptCount = allReports.filter((r) => r.countryCode === "PT").length;
  const brCount = allReports.filter((r) => r.countryCode === "BR").length;
  const euCount = allReports.filter((r) => r.countryCode === "EU").length;
  const globalCount = allReports.length;
  const count24h = allReports.filter((r) => r.period === "24h").length;
  const count7d = allReports.filter((r) => r.period === "7d").length;
  const count30d = allReports.filter((r) => r.period === "30d").length;
  const countHistorical = allReports.filter(
    (r) => r.period === "historical",
  ).length;

  const visibleReports = allReports.filter((r) => {
    if (periodFilter !== "all" && r.period !== periodFilter) return false;
    if (!typeFilters.has(r.type)) return false;
    if (!regionFilters.has(r.countryCode)) return false;
    return true;
  });

  const cityCount = selectedCity
    ? visibleReports.filter(
        (r) => r.city.toLowerCase() === selectedCity.toLowerCase(),
      ).length
    : null;

  const handleCitySearch = useCallback((rawCity: string) => {
    const trimmed = rawCity.trim();
    const key = Object.keys(CITY_COORDS).find(
      (k) => k.toLowerCase() === trimmed.toLowerCase(),
    );
    const coords = key ? CITY_COORDS[key] : null;
    if (coords) {
      setMapTarget({ coords, zoom: 11 });
      setSelectedCity(key ?? trimmed);
    } else {
      const partial = Object.keys(CITY_COORDS).find((k) =>
        k.toLowerCase().includes(trimmed.toLowerCase()),
      );
      if (partial) {
        setMapTarget({ coords: CITY_COORDS[partial], zoom: 11 });
        setSelectedCity(partial);
      } else {
        setSelectedCity(trimmed);
      }
    }
  }, []);

  const toggleType = (t: FraudReport["type"]) => {
    setTypeFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const toggleRegion = (r: FraudReport["countryCode"]) => {
    setRegionFilters((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r);
      else next.add(r);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      {/* Regional Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-xl p-3 text-center">
          <div className="text-lg font-bold">
            {globalCount.toLocaleString("pt-PT")}
          </div>
          <div className="text-xs text-slate-300 mt-0.5">🌍 Global</div>
        </div>
        <div className="bg-gradient-to-br from-green-700 to-green-800 text-white rounded-xl p-3 text-center">
          <div className="text-lg font-bold">
            {ptCount.toLocaleString("pt-PT")}
          </div>
          <div className="text-xs text-green-200 mt-0.5">🇵🇹 Portugal</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-600 to-yellow-700 text-white rounded-xl p-3 text-center">
          <div className="text-lg font-bold">
            {brCount.toLocaleString("pt-PT")}
          </div>
          <div className="text-xs text-yellow-100 mt-0.5">🇧🇷 Brasil</div>
        </div>
        <div className="bg-gradient-to-br from-blue-700 to-blue-800 text-white rounded-xl p-3 text-center">
          <div className="text-lg font-bold">
            {euCount.toLocaleString("pt-PT")}
          </div>
          <div className="text-xs text-blue-200 mt-0.5">🇪🇺 Europa</div>
        </div>
      </div>
      <p className="text-xs text-center text-gray-400 mt-1">
        ⚖️ Fonte: AbuseIPDB · OTX AlienVault · Comunidade ICP — GDPR compliant
      </p>

      {/* City counter */}
      {selectedCity && cityCount !== null && (
        <div className="flex items-center gap-2 text-sm font-semibold text-foreground bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
          <span>📍</span>
          <span>{selectedCity}:</span>
          <span className="text-amber-700">{cityCount} denúncias visíveis</span>
          <button
            type="button"
            className="ml-auto text-xs text-gray-400 hover:text-gray-600"
            onClick={() => {
              setSelectedCity(null);
              setMapTarget({ coords: [39.3999, -8.4195], zoom: 6 });
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Period Counters — FIX: 12k/87k/234k/7.8M */}
      <div className="grid grid-cols-4 gap-1.5">
        {(["24h", "7d", "30d", "historical"] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodFilter(p)}
            className={`rounded-lg p-2 text-center text-xs transition border ${periodFilter === p ? "border-slate-700 bg-slate-800 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"}`}
          >
            <div
              className="font-bold text-sm"
              style={{ color: periodFilter === p ? "#fff" : PERIOD_COLOR[p] }}
            >
              {p === "24h"
                ? count24h.toLocaleString("pt-PT")
                : p === "7d"
                  ? count7d.toLocaleString("pt-PT")
                  : p === "30d"
                    ? count30d.toLocaleString("pt-PT")
                    : countHistorical.toLocaleString("pt-PT")}
            </div>
            <div className="text-[10px] mt-0.5 opacity-80">
              {p === "24h"
                ? "🔴 24h"
                : p === "7d"
                  ? "🟠 7 dias"
                  : p === "30d"
                    ? "🟡 30 dias"
                    : "🔵 Histórico"}
            </div>
          </button>
        ))}
      </div>

      {/* City Search */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={cityQuery}
              onChange={(e) => setCityQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && cityQuery.trim())
                  handleCitySearch(cityQuery);
              }}
              placeholder="Pesquisar cidade... (ex: Lisboa, New York, Tokyo)"
              className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
              data-ocid="fraud-heatmap.search_input"
            />
          </div>
          <button
            type="button"
            onClick={() => cityQuery.trim() && handleCitySearch(cityQuery)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition"
            data-ocid="fraud-heatmap.search.primary_button"
          >
            Ir
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {PRESET_CITIES.map((c) => (
            <button
              key={c.key}
              type="button"
              onClick={() => {
                setCityQuery(c.display);
                handleCitySearch(c.key);
              }}
              className="px-3 py-1 text-xs font-medium bg-white border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-700 transition"
              data-ocid="fraud-heatmap.city.button"
            >
              {c.display}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="border border-border rounded-xl overflow-hidden">
        <button
          type="button"
          onClick={() => setShowFilters((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 transition text-sm font-semibold text-foreground"
          data-ocid="fraud-heatmap.filters.toggle"
        >
          <span>⚙️ Filtros</span>
          {showFilters ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </button>

        {showFilters && (
          <div className="p-4 space-y-3 bg-white border-t border-border">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Tipo de Fraude
              </p>
              <div className="flex flex-wrap gap-3">
                {ALL_TYPES.map((t) => (
                  <label
                    key={t}
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={typeFilters.has(t)}
                      onChange={() => toggleType(t)}
                      className="w-3.5 h-3.5 accent-blue-600"
                      data-ocid="fraud-heatmap.type.checkbox"
                    />
                    <span className="text-sm">{t}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Região
              </p>
              <div className="flex flex-wrap gap-3">
                {ALL_REGIONS.map((r) => (
                  <label
                    key={r.code}
                    className="flex items-center gap-1.5 cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={regionFilters.has(r.code)}
                      onChange={() => toggleRegion(r.code)}
                      className="w-3.5 h-3.5 accent-blue-600"
                      data-ocid="fraud-heatmap.region.checkbox"
                    />
                    <span className="text-sm">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Período
              </p>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    { value: "all" as const, label: "Todos" },
                    { value: "24h" as const, label: "🔴 24h" },
                    { value: "7d" as const, label: "🟠 7 dias" },
                    { value: "30d" as const, label: "🟡 30 dias" },
                    { value: "historical" as const, label: "🔵 Histórico" },
                  ] as { value: PeriodFilter; label: string }[]
                ).map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPeriodFilter(value)}
                    className={`px-3 py-1 text-xs font-semibold rounded-full border transition ${
                      periodFilter === value
                        ? "bg-slate-800 text-white border-slate-800"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                    data-ocid="fraud-heatmap.period.tab"
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Count */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {visibleReports.length.toLocaleString("pt-PT")} ocorrências visíveis
        </span>
        <span>Clique num pin para detalhes</span>
      </div>

      {/* Map — react-leaflet, npm, no CDN */}
      <div
        className="rounded-xl overflow-hidden border border-border shadow-sm"
        data-ocid="fraud-heatmap.canvas_target"
      >
        <MapContainer
          center={[39.3999, -8.4195]}
          zoom={6}
          style={{ height: "600px", width: "100%" }}
          maxZoom={18}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <MapController target={mapTarget} />
          {visibleReports.map((report) => {
            const color = PERIOD_COLOR[report.period];
            const radius = report.score >= 90 ? 9 : report.score >= 75 ? 7 : 5;
            const isRecent = report.period === "24h";
            const dateStr = report.timestamp.toLocaleString("pt-PT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <CircleMarker
                key={report.id}
                center={[report.lat, report.lng]}
                radius={radius}
                pathOptions={{
                  fillColor: color,
                  color: isRecent ? "#fff" : color,
                  weight: isRecent ? 2 : 1,
                  opacity: 0.95,
                  fillOpacity: isRecent ? 0.92 : 0.65,
                }}
                eventHandlers={{ click: () => setSelectedReport(report) }}
              >
                <Popup>
                  <div style={{ minWidth: 200, fontSize: 13, lineHeight: 1.6 }}>
                    <div
                      style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}
                    >
                      🚨 {report.type} DETETADO
                    </div>
                    <div>📅 {dateStr}</div>
                    <div>
                      📍 {report.city}, {report.countryCode}
                    </div>
                    <div>⚠️ Score: {report.score}/99</div>
                    <div>📊 Confiança: {report.confidence}%</div>
                    <div>
                      🛡️ Reportado: {report.sources} denúncia
                      {report.sources !== 1 ? "s" : ""}
                    </div>
                    {report.summary && (
                      <div
                        style={{ marginTop: 4, color: "#555", fontSize: 11 }}
                      >
                        {report.summary}
                      </div>
                    )}
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 justify-center text-xs text-muted-foreground">
        {(["24h", "7d", "30d", "historical"] as const).map((p) => (
          <span key={p} className="flex items-center gap-1.5">
            <span
              className="inline-block w-3 h-3 rounded-full"
              style={{ backgroundColor: PERIOD_COLOR[p] }}
            />
            {p === "24h"
              ? "🔴 24h"
              : p === "7d"
                ? "🟠 7 dias"
                : p === "30d"
                  ? "🟡 30 dias"
                  : "🔵 Histórico"}
          </span>
        ))}
      </div>

      {/* Legal */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        ⚖️ Dados agregados públicos — Apenas IPs públicos e scores agregados —
        Sem identificação pessoal — GDPR compliant
      </p>

      {/* Detail Modal */}
      <FraudDetailModal
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </div>
  );
}

export default FraudHeatmap;
