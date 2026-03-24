/**
 * communityReportStore — community report store with localStorage persistence.
 * Reports survive page refresh (stored under "antifraud_reports_v1").
 */

export type ReportType = "phone" | "link" | "iban" | "message" | "image";
export type RiskLevel = "safe" | "unknown" | "suspicious" | "high_risk";

export interface CommunityReport {
  type: ReportType;
  value: string; // normalized lowercase
  count: number;
  firstReported: number;
  lastReported: number;
}

const STORAGE_KEY = "antifraud_reports_v1";

// In-memory store
const reportStore = new Map<string, CommunityReport>();

// Load from localStorage on module initialization
function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed: Record<string, CommunityReport> = JSON.parse(raw);
    for (const [key, value] of Object.entries(parsed)) {
      reportStore.set(key, value);
    }
  } catch {
    // Ignore storage errors — start fresh
  }
}

// Save current store to localStorage
function saveToStorage(): void {
  try {
    const obj: Record<string, CommunityReport> = {};
    for (const [key, value] of reportStore.entries()) {
      obj[key] = value;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
  } catch {
    // Ignore storage errors
  }
}

// Initialize from localStorage immediately
loadFromStorage();

function storeKey(type: ReportType, value: string): string {
  return `${type}:${value.trim().toLowerCase()}`;
}

/**
 * Add or increment a report for a given type+value.
 * Persists to localStorage.
 */
export function addReport(type: ReportType, value: string): void {
  const key = storeKey(type, value);
  const existing = reportStore.get(key);
  if (existing) {
    existing.count += 1;
    existing.lastReported = Date.now();
  } else {
    reportStore.set(key, {
      type,
      value: value.trim().toLowerCase(),
      count: 1,
      firstReported: Date.now(),
      lastReported: Date.now(),
    });
  }
  saveToStorage();
}

/**
 * Get the report count for a given type+value.
 */
export function getReportCount(type: ReportType, value: string): number {
  const key = storeKey(type, value);
  return reportStore.get(key)?.count ?? 0;
}

/**
 * Get a risk level based on community report count.
 * - 0 reports → 'unknown'
 * - 1–2 reports → 'suspicious'
 * - 3+ reports → 'high_risk'
 */
export function getRiskLevel(type: ReportType, value: string): RiskLevel {
  const count = getReportCount(type, value);
  if (count === 0) return "unknown";
  if (count <= 2) return "suspicious";
  return "high_risk";
}

/**
 * Return all current reports (snapshot for display purposes).
 */
export function getAllReports(): CommunityReport[] {
  return Array.from(reportStore.values());
}

/**
 * Get the total count of all reports across all entries.
 */
export function getTotalReportCount(): number {
  let total = 0;
  for (const report of reportStore.values()) {
    total += report.count;
  }
  return total;
}
