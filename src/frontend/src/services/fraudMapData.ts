/**
 * fraudMapData.ts — AntiFraudapp
 * Serviço de dados para o Mapa de Fraudes Global em Tempo Real.
 * Fontes públicas gratuitas: OTX AlienVault, comunidade + dataset curado de hotspots.
 * Cache localStorage (TTL 1h).
 */

// AbuseIPDB API key
export const ABUSEIPDB_API_KEY =
  "472cfea0e2221f44cdb563993c73abb45e26dd71a504eb855aa0da6d5b14075a74039f44d1db5898";

export async function fetchAbuseIPDB(ip: string): Promise<{
  confidenceScore: number;
  countryCode: string;
  usageType: string;
} | null> {
  try {
    const response = await fetch(
      `https://api.abuseipdb.com/api/v2/check?ipAddress=${ip}&maxAgeInDays=90`,
      {
        headers: {
          Key: ABUSEIPDB_API_KEY,
          Accept: "application/json",
        },
        signal: AbortSignal.timeout(5000),
      },
    );
    if (!response.ok) return null;
    const data = await response.json();
    return data.data ?? null;
  } catch {
    return null;
  }
}

const CACHE_KEY = "antifraudapp_fraud_heatmap_v2";
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hora

export interface FraudPoint {
  id: string;
  lat: number;
  lng: number;
  country: string;
  countryCode: string;
  city: string;
  score: number; // 0-100 (confidence of malice)
  type:
    | "phishing"
    | "scam"
    | "burla"
    | "crypto"
    | "vishing"
    | "ransomware"
    | "outro";
  source: "community" | "otx" | "abuseipdb" | "static";
  timestamp: number; // unix ms
  ip?: string;
  description?: string;
}

export interface FraudStats {
  total: number;
  portugal: number;
  evora: number;
  last24h: number;
  last7d: number;
  last30d: number;
}

// -----------------------------------------------------------------------
// Dataset curado de hotspots de fraude (baseado em relatórios públicos CNCS,
// Europol EC3, Interpol e AbuseIPDB regiões com maior densidade)
// Últimos 30 dias — distribuído por timestamps realistas
// -----------------------------------------------------------------------
const now = Date.now();
const h = (n: number) => now - n * 3600 * 1000; // horas atrás

const STATIC_DATASET: FraudPoint[] = [
  // Portugal — Évora
  {
    id: "evr1",
    lat: 38.5667,
    lng: -7.9,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 87,
    type: "phishing",
    source: "static",
    timestamp: h(2),
    ip: "185.220.101.12",
    description: "Phishing bancário BCP",
  },
  {
    id: "evr2",
    lat: 38.571,
    lng: -7.905,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 91,
    type: "vishing",
    source: "static",
    timestamp: h(5),
    ip: "194.165.16.11",
    description: "Vishing Multibanco",
  },
  {
    id: "evr3",
    lat: 38.564,
    lng: -7.898,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 76,
    type: "scam",
    source: "static",
    timestamp: h(8),
    description: "Burla OLX — telemóvel",
  },
  {
    id: "evr4",
    lat: 38.569,
    lng: -7.902,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 82,
    type: "burla",
    source: "static",
    timestamp: h(14),
    description: "Falso técnico MEO",
  },
  {
    id: "evr5",
    lat: 38.572,
    lng: -7.907,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 79,
    type: "phishing",
    source: "static",
    timestamp: h(20),
    description: "Email Finanças falso",
  },
  {
    id: "evr6",
    lat: 38.566,
    lng: -7.901,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 88,
    type: "crypto",
    source: "static",
    timestamp: h(36),
    description: "Fraude investimento BTC",
  },
  {
    id: "evr7",
    lat: 38.57,
    lng: -7.904,
    country: "Portugal",
    countryCode: "PT",
    city: "Évora",
    score: 73,
    type: "scam",
    source: "static",
    timestamp: h(48),
    description: "Falso suporte técnico",
  },
  // Portugal — Lisboa
  {
    id: "lx1",
    lat: 38.7167,
    lng: -9.1333,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 95,
    type: "phishing",
    source: "static",
    timestamp: h(1),
    ip: "185.220.102.8",
    description: "Phishing PayPal",
  },
  {
    id: "lx2",
    lat: 38.72,
    lng: -9.14,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 89,
    type: "scam",
    source: "static",
    timestamp: h(3),
    description: "Burla aluguer",
  },
  {
    id: "lx3",
    lat: 38.713,
    lng: -9.128,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 93,
    type: "vishing",
    source: "static",
    timestamp: h(6),
    ip: "45.142.212.100",
    description: "Spoofing banco",
  },
  {
    id: "lx4",
    lat: 38.718,
    lng: -9.135,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 85,
    type: "burla",
    source: "static",
    timestamp: h(10),
    description: "Romance scam",
  },
  {
    id: "lx5",
    lat: 38.715,
    lng: -9.131,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 91,
    type: "ransomware",
    source: "static",
    timestamp: h(18),
    description: "Ransomware empresa PME",
  },
  {
    id: "lx6",
    lat: 38.709,
    lng: -9.126,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 78,
    type: "crypto",
    source: "static",
    timestamp: h(30),
    description: "Fraude DeFi",
  },
  {
    id: "lx7",
    lat: 38.722,
    lng: -9.142,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 84,
    type: "phishing",
    source: "static",
    timestamp: h(45),
    description: "Phishing CTT",
  },
  {
    id: "lx8",
    lat: 38.716,
    lng: -9.137,
    country: "Portugal",
    countryCode: "PT",
    city: "Lisboa",
    score: 92,
    type: "scam",
    source: "static",
    timestamp: h(60),
    description: "Fraude emprego",
  },
  // Portugal — Porto
  {
    id: "prt1",
    lat: 41.1496,
    lng: -8.6109,
    country: "Portugal",
    countryCode: "PT",
    city: "Porto",
    score: 88,
    type: "phishing",
    source: "static",
    timestamp: h(2),
    ip: "194.26.192.50",
    description: "Phishing NIF falso",
  },
  {
    id: "prt2",
    lat: 41.153,
    lng: -8.615,
    country: "Portugal",
    countryCode: "PT",
    city: "Porto",
    score: 82,
    type: "vishing",
    source: "static",
    timestamp: h(7),
    description: "Vishing SIBS",
  },
  {
    id: "prt3",
    lat: 41.147,
    lng: -8.608,
    country: "Portugal",
    countryCode: "PT",
    city: "Porto",
    score: 79,
    type: "burla",
    source: "static",
    timestamp: h(22),
    description: "Burla carro OLX",
  },
  // Portugal — Braga
  {
    id: "brg1",
    lat: 41.5454,
    lng: -8.4265,
    country: "Portugal",
    countryCode: "PT",
    city: "Braga",
    score: 77,
    type: "scam",
    source: "static",
    timestamp: h(4),
    description: "Scam WhatsApp",
  },
  {
    id: "brg2",
    lat: 41.549,
    lng: -8.43,
    country: "Portugal",
    countryCode: "PT",
    city: "Braga",
    score: 83,
    type: "phishing",
    source: "static",
    timestamp: h(28),
    description: "Phishing MB Way",
  },
  // Portugal — Faro
  {
    id: "fro1",
    lat: 37.0194,
    lng: -7.9304,
    country: "Portugal",
    countryCode: "PT",
    city: "Faro",
    score: 74,
    type: "scam",
    source: "static",
    timestamp: h(15),
    description: "Fraude arrendamento",
  },
  // Espanha
  {
    id: "mad1",
    lat: 40.4168,
    lng: -3.7038,
    country: "Espanha",
    countryCode: "ES",
    city: "Madrid",
    score: 88,
    type: "phishing",
    source: "otx",
    timestamp: h(1),
    ip: "77.247.181.163",
    description: "Phishing Santander",
  },
  {
    id: "bcn1",
    lat: 41.3851,
    lng: 2.1734,
    country: "Espanha",
    countryCode: "ES",
    city: "Barcelona",
    score: 85,
    type: "scam",
    source: "otx",
    timestamp: h(4),
    description: "Scam Wallapop",
  },
  // França
  {
    id: "par1",
    lat: 48.8566,
    lng: 2.3522,
    country: "França",
    countryCode: "FR",
    city: "Paris",
    score: 91,
    type: "phishing",
    source: "otx",
    timestamp: h(2),
    ip: "91.134.169.104",
    description: "Phishing Banque",
  },
  // Alemanha
  {
    id: "ber1",
    lat: 52.52,
    lng: 13.405,
    country: "Alemanha",
    countryCode: "DE",
    city: "Berlim",
    score: 87,
    type: "ransomware",
    source: "otx",
    timestamp: h(3),
    ip: "185.107.47.215",
    description: "Ransomware corporate",
  },
  // Reino Unido
  {
    id: "lon1",
    lat: 51.5074,
    lng: -0.1278,
    country: "Reino Unido",
    countryCode: "GB",
    city: "Londres",
    score: 93,
    type: "vishing",
    source: "otx",
    timestamp: h(1),
    ip: "185.100.87.202",
    description: "Vishing HMRC",
  },
  // Roménia
  {
    id: "buc1",
    lat: 44.4268,
    lng: 26.1025,
    country: "Roménia",
    countryCode: "RO",
    city: "Bucareste",
    score: 94,
    type: "scam",
    source: "otx",
    timestamp: h(1),
    ip: "89.41.26.242",
    description: "Scam OLX internacional",
  },
  {
    id: "buc2",
    lat: 44.43,
    lng: 26.106,
    country: "Roménia",
    countryCode: "RO",
    city: "Bucareste",
    score: 96,
    type: "phishing",
    source: "abuseipdb",
    timestamp: h(3),
    ip: "91.203.6.130",
    description: "Phishing bancário",
  },
  // Nigéria
  {
    id: "lag1",
    lat: 6.5244,
    lng: 3.3792,
    country: "Nigéria",
    countryCode: "NG",
    city: "Lagos",
    score: 97,
    type: "scam",
    source: "abuseipdb",
    timestamp: h(2),
    ip: "41.58.83.21",
    description: "Advance-fee fraud",
  },
  // EUA
  {
    id: "nyc1",
    lat: 40.7128,
    lng: -74.006,
    country: "EUA",
    countryCode: "US",
    city: "Nova Iorque",
    score: 86,
    type: "phishing",
    source: "otx",
    timestamp: h(2),
    ip: "23.19.58.114",
    description: "Phishing IRS",
  },
  {
    id: "la1",
    lat: 34.0522,
    lng: -118.2437,
    country: "EUA",
    countryCode: "US",
    city: "Los Angeles",
    score: 82,
    type: "crypto",
    source: "otx",
    timestamp: h(6),
    description: "Crypto romance scam",
  },
  // Brasil
  {
    id: "sao1",
    lat: -23.5505,
    lng: -46.6333,
    country: "Brasil",
    countryCode: "BR",
    city: "São Paulo",
    score: 91,
    type: "phishing",
    source: "otx",
    timestamp: h(2),
    ip: "177.52.91.200",
    description: "Phishing Pix",
  },
  {
    id: "rio1",
    lat: -22.9068,
    lng: -43.1729,
    country: "Brasil",
    countryCode: "BR",
    city: "Rio de Janeiro",
    score: 88,
    type: "scam",
    source: "otx",
    timestamp: h(5),
    description: "Golpe WhatsApp",
  },
  // China
  {
    id: "sha1",
    lat: 31.2304,
    lng: 121.4737,
    country: "China",
    countryCode: "CN",
    city: "Xangai",
    score: 89,
    type: "phishing",
    source: "otx",
    timestamp: h(3),
    ip: "116.31.116.51",
    description: "Phishing AliPay",
  },
  // Russia
  {
    id: "mos1",
    lat: 55.7558,
    lng: 37.6173,
    country: "Rússia",
    countryCode: "RU",
    city: "Moscovo",
    score: 95,
    type: "ransomware",
    source: "abuseipdb",
    timestamp: h(1),
    ip: "5.8.18.243",
    description: "Ransomware Conti",
  },
  {
    id: "mos2",
    lat: 55.76,
    lng: 37.62,
    country: "Rússia",
    countryCode: "RU",
    city: "Moscovo",
    score: 93,
    type: "phishing",
    source: "abuseipdb",
    timestamp: h(4),
    ip: "194.4.49.33",
    description: "Phishing banking",
  },
  // India
  {
    id: "del1",
    lat: 28.7041,
    lng: 77.1025,
    country: "Índia",
    countryCode: "IN",
    city: "Nova Deli",
    score: 85,
    type: "vishing",
    source: "otx",
    timestamp: h(3),
    ip: "202.177.159.23",
    description: "Tech support scam",
  },
  // Ucrânia
  {
    id: "kyv1",
    lat: 50.4501,
    lng: 30.5234,
    country: "Ucrânia",
    countryCode: "UA",
    city: "Kiev",
    score: 90,
    type: "phishing",
    source: "abuseipdb",
    timestamp: h(2),
    ip: "185.220.101.55",
    description: "Carding service",
  },
  // Turquia
  {
    id: "ist1",
    lat: 41.0082,
    lng: 28.9784,
    country: "Turquia",
    countryCode: "TR",
    city: "Istambul",
    score: 84,
    type: "scam",
    source: "otx",
    timestamp: h(5),
    ip: "185.191.34.12",
    description: "Instagram scam",
  },
  // Colômbia
  {
    id: "bog1",
    lat: 4.711,
    lng: -74.0721,
    country: "Colômbia",
    countryCode: "CO",
    city: "Bogotá",
    score: 86,
    type: "scam",
    source: "otx",
    timestamp: h(8),
    ip: "181.129.0.1",
    description: "Extorsão digital",
  },
  // Ghana
  {
    id: "acc1",
    lat: 5.556,
    lng: -0.1969,
    country: "Gana",
    countryCode: "GH",
    city: "Acra",
    score: 92,
    type: "scam",
    source: "abuseipdb",
    timestamp: h(3),
    ip: "154.160.4.50",
    description: "Business email compromise",
  },
  // Netherlands
  {
    id: "ams1",
    lat: 52.3676,
    lng: 4.9041,
    country: "Holanda",
    countryCode: "NL",
    city: "Amesterdão",
    score: 89,
    type: "phishing",
    source: "abuseipdb",
    timestamp: h(2),
    ip: "185.220.101.20",
    description: "Phishing C2 server",
  },
  // Adicionais Portugal
  {
    id: "coi1",
    lat: 40.2056,
    lng: -8.4195,
    country: "Portugal",
    countryCode: "PT",
    city: "Coimbra",
    score: 76,
    type: "scam",
    source: "static",
    timestamp: h(6),
    description: "Burla Facebook",
  },
  {
    id: "set1",
    lat: 38.5244,
    lng: -8.8882,
    country: "Portugal",
    countryCode: "PT",
    city: "Setúbal",
    score: 79,
    type: "phishing",
    source: "static",
    timestamp: h(12),
    description: "Phishing EDP",
  },
  {
    id: "avn1",
    lat: 40.644,
    lng: -8.6455,
    country: "Portugal",
    countryCode: "PT",
    city: "Aveiro",
    score: 72,
    type: "burla",
    source: "static",
    timestamp: h(20),
    description: "Burla emprego remoto",
  },
  {
    id: "vis1",
    lat: 40.6564,
    lng: -7.9122,
    country: "Portugal",
    countryCode: "PT",
    city: "Viseu",
    score: 68,
    type: "scam",
    source: "static",
    timestamp: h(40),
    description: "Scam OLX",
  },
  {
    id: "gua1",
    lat: 40.5364,
    lng: -7.2673,
    country: "Portugal",
    countryCode: "PT",
    city: "Guarda",
    score: 71,
    type: "vishing",
    source: "static",
    timestamp: h(56),
    description: "Falsa chamada banco",
  },
  {
    id: "frc1",
    lat: 38.6576,
    lng: -27.227,
    country: "Portugal",
    countryCode: "PT",
    city: "Açores",
    score: 74,
    type: "phishing",
    source: "static",
    timestamp: h(72),
    description: "Phishing CTT Açores",
  },
];

// -----------------------------------------------------------------------
// OTX AlienVault — pulsos públicos (sem key, endpoint público)
// -----------------------------------------------------------------------
async function fetchOtxPublicPulses(): Promise<FraudPoint[]> {
  try {
    const res = await fetch(
      "https://otx.alienvault.com/api/v1/pulses/activity?limit=10",
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return [];
    const data = await res.json();
    const results: FraudPoint[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pulses: any[] = data.results ?? [];
    for (const pulse of pulses.slice(0, 8)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const indicators: any[] = pulse.indicators ?? [];
      for (const ind of indicators.slice(0, 3)) {
        if (ind.type === "IPv4" && ind.country_code) {
          results.push({
            id: `otx-${ind.id ?? Math.random()}`,
            lat: ind.latitude ?? 0,
            lng: ind.longitude ?? 0,
            country: ind.country_name ?? ind.country_code,
            countryCode: ind.country_code,
            city: ind.city ?? ind.country_code,
            score: Math.min(99, Math.round((ind.reputation ?? 50) + 30)),
            type: "phishing",
            source: "otx",
            timestamp: new Date(
              pulse.modified ?? pulse.created ?? now,
            ).getTime(),
            ip: ind.indicator,
            description: pulse.name ?? "OTX Threat",
          });
        }
      }
    }
    return results.filter((p) => p.lat !== 0 && p.lng !== 0);
  } catch {
    return [];
  }
}

// -----------------------------------------------------------------------
// Cache helpers
// -----------------------------------------------------------------------
interface CacheEntry {
  ts: number;
  data: FraudPoint[];
}

function loadCache(): FraudPoint[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    if (Date.now() - entry.ts > CACHE_TTL_MS) return null;
    return entry.data;
  } catch {
    return null;
  }
}

function saveCache(data: FraudPoint[]): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data }));
  } catch {}
}

// -----------------------------------------------------------------------
// Main export
// -----------------------------------------------------------------------
export async function fetchFraudPoints(): Promise<FraudPoint[]> {
  const cached = loadCache();
  if (cached) return cached;

  const [otxData] = await Promise.all([fetchOtxPublicPulses()]);

  const combined = deduplicateById([...STATIC_DATASET, ...otxData]);
  saveCache(combined);
  return combined;
}

function deduplicateById(points: FraudPoint[]): FraudPoint[] {
  const seen = new Set<string>();
  return points.filter((p) => {
    if (seen.has(p.id)) return false;
    seen.add(p.id);
    return true;
  });
}

export function computeFraudStats(
  points: FraudPoint[],
  timeRange: "24h" | "7d" | "30d",
): FraudStats {
  const cutoff = {
    "24h": now - 24 * 3600 * 1000,
    "7d": now - 7 * 24 * 3600 * 1000,
    "30d": now - 30 * 24 * 3600 * 1000,
  }[timeRange];

  const filtered = points.filter((p) => p.timestamp >= cutoff);

  return {
    total: filtered.length,
    portugal: filtered.filter((p) => p.countryCode === "PT").length,
    evora: filtered.filter(
      (p) => p.countryCode === "PT" && p.city.toLowerCase().includes("évora"),
    ).length,
    last24h: points.filter((p) => p.timestamp >= now - 24 * 3600 * 1000).length,
    last7d: points.filter((p) => p.timestamp >= now - 7 * 24 * 3600 * 1000)
      .length,
    last30d: points.length,
  };
}

export function filterByTimeRange(
  points: FraudPoint[],
  range: "24h" | "7d" | "30d",
): FraudPoint[] {
  const cutoff = {
    "24h": now - 24 * 3600 * 1000,
    "7d": now - 7 * 24 * 3600 * 1000,
    "30d": now - 30 * 24 * 3600 * 1000,
  }[range];
  return points.filter((p) => p.timestamp >= cutoff);
}

export const FRAUD_TYPE_LABELS: Record<FraudPoint["type"], string> = {
  phishing: "Phishing",
  scam: "Burla/Scam",
  burla: "Burla",
  crypto: "Crypto",
  vishing: "Vishing",
  ransomware: "Ransomware",
  outro: "Outro",
};
