import { useCallback, useEffect, useRef, useState } from "react";
import {
  type CanisterReport,
  type CanisterStatus,
  checkAllCanisters,
  fetchCanisterReports,
} from "../services/canisterService";

const POLL_INTERVAL_MS = 5_000; // 5 seconds
const STATUS_CHECK_INTERVAL_MS = 60_000; // 1 minute

export function useCanisterSync() {
  const [statuses, setStatuses] = useState<CanisterStatus[]>([]);
  const [reports, setReports] = useState<CanisterReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const reportTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const statusTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const syncStatuses = useCallback(async () => {
    const results = await checkAllCanisters();
    setStatuses(results);
  }, []);

  const syncReports = useCallback(async () => {
    const data = await fetchCanisterReports();
    setReports(data);
    setLastSync(new Date());
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial load
    syncStatuses();
    syncReports();

    // Polling
    reportTimerRef.current = setInterval(syncReports, POLL_INTERVAL_MS);
    statusTimerRef.current = setInterval(
      syncStatuses,
      STATUS_CHECK_INTERVAL_MS,
    );

    return () => {
      if (reportTimerRef.current) clearInterval(reportTimerRef.current);
      if (statusTimerRef.current) clearInterval(statusTimerRef.current);
    };
  }, [syncStatuses, syncReports]);

  const onlineCount = statuses.filter((s) => s.online).length;
  const totalCount = statuses.length;

  return {
    statuses,
    reports,
    loading,
    lastSync,
    onlineCount,
    totalCount,
    syncStatuses,
    syncReports,
  };
}
