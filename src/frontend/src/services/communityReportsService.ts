/**
 * communityReportsService.ts
 *
 * Community reports service for AntiFraudapp.
 * Stores reports in localStorage and provides reputation scoring.
 */

const STORAGE_KEY = "antifraudapp_reports";

export interface CommunityReport {
  id: string;
  type:
    | "phone"
    | "email"
    | "iban"
    | "link"
    | "sms"
    | "whatsapp"
    | "telegram"
    | "msn"
    | "crypto";
  identifier: string;
  description: string;
  imageData?: string;
  reportedAt: string;
  location?: {
    lat: number;
    lng: number;
    city?: string;
    country?: string;
  };
  riskLevel: "low" | "medium" | "high";
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getReports(): CommunityReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as CommunityReport[];
  } catch {
    return [];
  }
}

function saveReports(reports: CommunityReport[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  } catch {
    // ignore
  }
}

export function addReport(
  report: Omit<CommunityReport, "id" | "reportedAt">,
): CommunityReport {
  const full: CommunityReport = {
    ...report,
    id: generateId(),
    reportedAt: new Date().toISOString(),
  };
  const existing = getReports();
  saveReports([...existing, full]);
  return full;
}

export function getReputation(identifier: string): {
  count: number;
  level: "none" | "low" | "medium" | "high";
  score: number;
} {
  const reports = getReports();
  const normalized = identifier.trim().toLowerCase();
  const count = reports.filter(
    (r) => r.identifier.trim().toLowerCase() === normalized,
  ).length;

  if (count === 0) return { count: 0, level: "none", score: 0 };
  if (count < 5) return { count, level: "low", score: 25 };
  if (count < 10) return { count, level: "medium", score: 65 };
  return { count, level: "high", score: 90 };
}

export function getReportsByLocation(): Record<
  string,
  {
    count: number;
    lat: number;
    lng: number;
    city: string;
    country: string;
    types: string[];
  }
> {
  const reports = getReports();
  const result: Record<
    string,
    {
      count: number;
      lat: number;
      lng: number;
      city: string;
      country: string;
      types: string[];
    }
  > = {};

  for (const r of reports) {
    if (!r.location?.city || !r.location.lat || !r.location.lng) continue;
    const key = r.location.city;
    if (!result[key]) {
      result[key] = {
        count: 0,
        lat: r.location.lat,
        lng: r.location.lng,
        city: r.location.city,
        country: r.location.country || "",
        types: [],
      };
    }
    result[key].count++;
    if (!result[key].types.includes(r.type)) {
      result[key].types.push(r.type);
    }
  }

  return result;
}

export function clearOldReports(): void {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  const reports = getReports().filter(
    (r) => new Date(r.reportedAt).getTime() > thirtyDaysAgo,
  );
  saveReports(reports);
}

export function getTrustLevel(count: number): {
  nivel: number;
  label: string;
  description: string;
  color: string;
} {
  if (count <= 0) return { nivel: 0, label: "", description: "", color: "" };
  if (count === 1)
    return {
      nivel: 1,
      label: "Nível 1",
      description: "Denúncia isolada",
      color: "bg-yellow-100 text-yellow-800",
    };
  if (count < 5)
    return {
      nivel: 2,
      label: "Nível 2",
      description: "Várias denúncias comunitárias",
      color: "bg-orange-100 text-orange-800",
    };
  if (count < 10)
    return {
      nivel: 3,
      label: "Nível 3",
      description: "Padrões consistentes identificados",
      color: "bg-red-100 text-red-800",
    };
  return {
    nivel: 4,
    label: "Nível 4",
    description: "Confirmado por múltiplas fontes",
    color: "bg-red-200 text-red-900",
  };
}
