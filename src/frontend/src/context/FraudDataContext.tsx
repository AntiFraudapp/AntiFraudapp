import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createDenunciasActor } from "../ic/actors";
import type { CanisterReport } from "../ic/idl/denuncias.idl";

export type { CanisterReport };

export interface SubmitReportData {
  reportType: string;
  target: string;
  description: string;
  riskScore: number;
  country: string;
  city: string;
  lat: number;
  lon: number;
}

export type CanisterErrorKind = "installing" | "unreachable" | null;

interface FraudDataContextValue {
  reports: CanisterReport[];
  loading: boolean;
  lastSync: Date | null;
  error: string | null;
  errorKind: CanisterErrorKind;
  submitReport: (data: SubmitReportData) => Promise<boolean>;
  refresh: () => void;
}

const FraudDataContext = createContext<FraudDataContextValue>({
  reports: [],
  loading: true,
  lastSync: null,
  error: null,
  errorKind: null,
  submitReport: async () => false,
  refresh: () => {},
});

const POLL_INTERVAL = 5_000;

/** Detect if an ICP call error is a 503 (code not installed on canister) */
function is503Error(e: unknown): boolean {
  if (!e) return false;
  const msg = String(e).toLowerCase();
  return (
    msg.includes("503") ||
    msg.includes("canister_error") ||
    msg.includes("failed to process") ||
    msg.includes("canister failed")
  );
}

export function FraudDataProvider({ children }: { children: React.ReactNode }) {
  const [reports, setReports] = useState<CanisterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorKind, setErrorKind] = useState<CanisterErrorKind>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      const actor = await createDenunciasActor();
      const data = await actor.getReports();
      setReports(data);
      setLastSync(new Date());
      setError(null);
      setErrorKind(null);
    } catch (e) {
      if (is503Error(e)) {
        setError(
          "A instalar Motoko no canister 7w5qg — ficará verde automaticamente após o deploy.",
        );
        setErrorKind("installing");
      } else {
        setError("Canister temporariamente inacessível");
        setErrorKind("unreachable");
      }
      console.warn("[FraudData] getReports:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    fetchReports();
    timerRef.current = setInterval(fetchReports, POLL_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchReports]);

  const submitReport = useCallback(
    async (data: SubmitReportData): Promise<boolean> => {
      try {
        const actor = await createDenunciasActor();
        await actor.submitReport(
          data.reportType,
          data.target,
          data.description,
          BigInt(Math.round(data.riskScore)),
          data.country,
          data.city,
          data.lat,
          data.lon,
        );
        await fetchReports();
        return true;
      } catch (e) {
        console.warn("[FraudData] submitReport:", e);
        return false;
      }
    },
    [fetchReports],
  );

  return (
    <FraudDataContext.Provider
      value={{
        reports,
        loading,
        lastSync,
        error,
        errorKind,
        submitReport,
        refresh,
      }}
    >
      {children}
    </FraudDataContext.Provider>
  );
}

export function useFraudData() {
  return useContext(FraudDataContext);
}
