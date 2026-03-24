// FIX: report system with legal compliance
// FIX: internal fraud database
// FIX: blacklist system integrated
// FIX: future monetization ready

export type ReportType = "phone" | "ip" | "crypto" | "url";
export type ReportStatus = "pending" | "verified fraud" | "false report";

export interface FraudReport {
  id: string;
  value: string;
  type: ReportType;
  reason: string;
  timestamp: number;
  country: string;
  status: ReportStatus;
}

export interface BlacklistEntry {
  id: string;
  value: string;
  type: ReportType;
  addedAt: number;
  addedBy: string;
  note?: string;
}

const REPORTS_KEY = "antifraudapp_reports";
const BLACKLIST_KEY = "antifraudapp_blacklist";

// ── Helpers ────────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

async function detectCountry(): Promise<string> {
  try {
    // Use browser language as a basic country hint
    const lang = navigator.language || "pt";
    if (lang.startsWith("pt")) return "PT";
    if (lang.startsWith("en-US")) return "US";
    if (lang.startsWith("en-GB")) return "GB";
    if (lang.startsWith("fr")) return "FR";
    if (lang.startsWith("de")) return "DE";
    if (lang.startsWith("es")) return "ES";
    if (lang.startsWith("it")) return "IT";
    if (lang.startsWith("br") || lang.startsWith("pt-BR")) return "BR";
    return lang.split("-")[1] || "PT";
  } catch {
    return "PT";
  }
}

// ── Reports ────────────────────────────────────────────────────────────────

export function getAllReports(): FraudReport[] {
  try {
    const raw = localStorage.getItem(REPORTS_KEY);
    return raw ? (JSON.parse(raw) as FraudReport[]) : [];
  } catch {
    return [];
  }
}

export async function saveReport(
  value: string,
  type: ReportType,
  reason: string,
): Promise<FraudReport> {
  const country = await detectCountry();
  const report: FraudReport = {
    id: generateId(),
    value,
    type,
    reason,
    timestamp: Date.now(),
    country,
    status: "pending",
  };
  const all = getAllReports();
  all.unshift(report);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  return report;
}

export function updateReportStatus(id: string, status: ReportStatus): void {
  const all = getAllReports();
  const idx = all.findIndex((r) => r.id === id);
  if (idx !== -1) {
    all[idx].status = status;
    localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
  }
}

export function deleteReport(id: string): void {
  const all = getAllReports().filter((r) => r.id !== id);
  localStorage.setItem(REPORTS_KEY, JSON.stringify(all));
}

// ── Blacklist ──────────────────────────────────────────────────────────────

export function getBlacklist(): BlacklistEntry[] {
  try {
    const raw = localStorage.getItem(BLACKLIST_KEY);
    return raw ? (JSON.parse(raw) as BlacklistEntry[]) : [];
  } catch {
    return [];
  }
}

export function addToBlacklist(
  value: string,
  type: ReportType,
  note?: string,
): BlacklistEntry {
  const entry: BlacklistEntry = {
    id: generateId(),
    value: value.trim(),
    type,
    addedAt: Date.now(),
    addedBy: "admin",
    note,
  };
  const list = getBlacklist();
  list.unshift(entry);
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
  return entry;
}

export function removeFromBlacklist(id: string): void {
  const list = getBlacklist().filter((e) => e.id !== id);
  localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
}

export function isBlacklisted(value: string): boolean {
  const list = getBlacklist();
  const v = value.trim().toLowerCase();
  return list.some((e) => e.value.toLowerCase() === v);
}

// ── Statistics ─────────────────────────────────────────────────────────────

export interface ReportStats {
  total: number;
  byType: Record<ReportType, number>;
  last24h: number;
  last7d: number;
  last30d: number;
}

export function getReportStats(): ReportStats {
  const all = getAllReports();
  const now = Date.now();
  const h24 = now - 24 * 60 * 60 * 1000;
  const d7 = now - 7 * 24 * 60 * 60 * 1000;
  const d30 = now - 30 * 24 * 60 * 60 * 1000;

  return {
    total: all.length,
    byType: {
      phone: all.filter((r) => r.type === "phone").length,
      ip: all.filter((r) => r.type === "ip").length,
      crypto: all.filter((r) => r.type === "crypto").length,
      url: all.filter((r) => r.type === "url").length,
    },
    last24h: all.filter((r) => r.timestamp >= h24).length,
    last7d: all.filter((r) => r.timestamp >= d7).length,
    last30d: all.filter((r) => r.timestamp >= d30).length,
  };
}

// ── Authorities redirect ───────────────────────────────────────────────────

export function getAuthorityLinks(country: string): {
  label: string;
  url: string;
}[] {
  const c = country.toUpperCase();
  if (c === "PT") {
    return [
      {
        label: "CNCS — Centro Nacional de Cibersegurança",
        url: "https://www.cncs.gov.pt/",
      },
      {
        label: "CNPD — Comissão Nacional de Proteção de Dados",
        url: "https://www.cnpd.pt/",
      },
    ];
  }
  if (c === "US") {
    return [
      { label: "FTC — Report Fraud", url: "https://reportfraud.ftc.gov/" },
      {
        label: "IC3 — Internet Crime Complaint Center",
        url: "https://www.ic3.gov/",
      },
    ];
  }
  if (["GB", "FR", "DE", "ES", "IT", "NL", "BE", "PL"].includes(c)) {
    return [
      {
        label: "Europol — European Cybercrime Centre",
        url: "https://www.europol.europa.eu/",
      },
    ];
  }
  // Default: Europol
  return [
    {
      label: "Europol — European Cybercrime Centre",
      url: "https://www.europol.europa.eu/",
    },
  ];
}
