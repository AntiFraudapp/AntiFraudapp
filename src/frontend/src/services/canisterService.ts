// AntiFraudapp Canister Integration Service
// Calls the user's own ICP canisters directly from the browser

import { createDenunciasActor } from "../ic/actors";

export const CANISTERS = {
  principal: {
    id: "v63rh-lqaaa-aaaaa-qewvq-cai",
    label: "AntiFraud Principal",
    role: "Frontend/Principal",
  },
  denuncias: {
    id: "7w5qg-6aaaa-aaaab-ael4a-cai",
    label: "Denúncias",
    role: "Reports DB",
  },
  location: {
    id: "sodv3-uiaaa-aaaak-qxubq-cai",
    label: "Localização Segura",
    role: "Location Sharing",
  },
  extra: {
    id: "c6sjf-tqaaa-aaaap-qsiea-cai",
    label: "AntiFraud Extra",
    role: "Backup/Extra",
  },
  contacts: {
    id: "ezroe-caaaa-aaaac-bcdeq-cai",
    label: "Contact Lookup",
    role: "Contact DB",
  },
  publicData: {
    id: "e2m3q-yqaaa-aaaas-qekva-cai",
    label: "Public Data",
    role: "Public Data",
  },
} as const;

export type CanisterId = keyof typeof CANISTERS;

/** 'online' = responding OK, 'installing' = 503 (Motoko being installed), 'offline' = unreachable */
export type CanisterHealthStatus = "online" | "installing" | "offline";

export interface CanisterStatus {
  id: string;
  label: string;
  role: string;
  online: boolean;
  healthStatus: CanisterHealthStatus;
  latencyMs?: number;
  lastChecked: Date;
}

export interface CanisterReport {
  id: number;
  reportType: string;
  target: string;
  description: string;
  riskScore: number;
  country: string;
  city: string;
  lat: number;
  lon: number;
  timestamp: bigint;
}

// Minimal Candid envelope: DIDL + 0 args + 0 results
const CANDID_PING = new Uint8Array([68, 73, 68, 76, 0, 0]);

/**
 * Ping a canister via the ICP API endpoint.
 * Any HTTP response (200/400/422/500/503) means the canister is reachable.
 * - 503  → installing (Motoko not yet deployed)
 * - other HTTP response → online
 * - network error / timeout → offline
 */
export async function pingCanister(canisterId: string): Promise<{
  online: boolean;
  healthStatus: CanisterHealthStatus;
  latencyMs: number;
}> {
  const start = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const res = await fetch(
      `https://icp-api.io/api/v2/canister/${canisterId}/query`,
      {
        method: "POST",
        mode: "cors",
        body: CANDID_PING,
        signal: controller.signal,
      },
    );
    clearTimeout(timer);
    const latencyMs = Date.now() - start;
    if (res.status === 503) {
      return { online: false, healthStatus: "installing", latencyMs };
    }
    // Any other HTTP status (200, 400, 404, 422, 500…) = canister is up
    return { online: true, healthStatus: "online", latencyMs };
  } catch {
    clearTimeout(timer);
    return {
      online: false,
      healthStatus: "offline",
      latencyMs: Date.now() - start,
    };
  }
}

// Check status of all canisters
export async function checkAllCanisters(): Promise<CanisterStatus[]> {
  const entries = Object.entries(CANISTERS) as [
    CanisterId,
    (typeof CANISTERS)[CanisterId],
  ][];
  const results = await Promise.all(
    entries.map(async ([_key, info]) => {
      const { online, healthStatus, latencyMs } = await pingCanister(info.id);
      return {
        id: info.id,
        label: info.label,
        role: info.role,
        online,
        healthStatus,
        latencyMs,
        lastChecked: new Date(),
      } as CanisterStatus;
    }),
  );
  return results;
}

// Fetch reports from the denuncias canister via Candid actor
export async function fetchCanisterReports(): Promise<CanisterReport[]> {
  try {
    const actor = await createDenunciasActor();
    const data = await actor.getReports();
    return data.map((r) => ({
      id: Number(r.id),
      reportType: r.reportType,
      target: r.target,
      description: r.description,
      riskScore: Number(r.riskScore),
      country: r.country,
      city: r.city,
      lat: r.lat,
      lon: r.lon,
      timestamp: r.timestamp,
    }));
  } catch {
    return [];
  }
}

// Submit a report to the denuncias canister via Candid actor
export async function submitToCanister(report: {
  reportType: string;
  target: string;
  description: string;
  riskScore: number;
  country: string;
  city: string;
  lat: number;
  lon: number;
}): Promise<number | null> {
  try {
    const actor = await createDenunciasActor();
    const id = await actor.submitReport(
      report.reportType,
      report.target,
      report.description,
      BigInt(Math.round(report.riskScore)),
      report.country,
      report.city,
      report.lat,
      report.lon,
    );
    return Number(id);
  } catch {
    return null;
  }
}
