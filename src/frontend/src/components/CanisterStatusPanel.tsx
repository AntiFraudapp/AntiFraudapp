import { useState } from "react";
import { useCanisterSync } from "../hooks/useCanisterSync";
import type { CanisterHealthStatus } from "../services/canisterService";

function healthDot(
  healthStatus: CanisterHealthStatus | undefined,
  online: boolean,
) {
  const status = healthStatus ?? (online ? "online" : "offline");
  if (status === "online") return "bg-green-400";
  if (status === "installing") return "bg-yellow-400 animate-pulse";
  return "bg-red-500";
}

function healthLabel(
  healthStatus: CanisterHealthStatus | undefined,
  online: boolean,
) {
  const status = healthStatus ?? (online ? "online" : "offline");
  if (status === "online") return { text: "● ONLINE", cls: "text-green-400" };
  if (status === "installing")
    return { text: "⟳ A INSTALAR MOTOKO", cls: "text-yellow-400" };
  return { text: "○ OFFLINE", cls: "text-red-400" };
}

export function CanisterStatusPanel() {
  const { statuses, loading, lastSync, onlineCount, totalCount, syncStatuses } =
    useCanisterSync();
  const [expanded, setExpanded] = useState(false);

  const installingCount = statuses.filter(
    (s) => (s as any).healthStatus === "installing",
  ).length;
  const allOnline = onlineCount === totalCount && totalCount > 0;
  const someIssue = installingCount > 0 || onlineCount < totalCount;

  const overallColor = loading
    ? "bg-yellow-500"
    : allOnline
      ? "bg-green-500"
      : installingCount > 0
        ? "bg-yellow-500"
        : someIssue
          ? "bg-yellow-500"
          : "bg-red-500";

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/90 text-white text-sm shadow-lg overflow-hidden">
      {/* Header row */}
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${overallColor} animate-pulse`}
          />
          <span className="font-semibold tracking-wide">ICP Canisters</span>
          {!loading && (
            <span className="text-xs text-slate-400">
              {onlineCount}/{totalCount} online
              {installingCount > 0 && (
                <span className="ml-1 text-yellow-400">
                  · {installingCount} a instalar
                </span>
              )}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {lastSync && (
            <span className="text-xs text-slate-500 hidden sm:inline">
              Sync: {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              syncStatuses();
            }}
            className="text-xs text-blue-400 hover:text-blue-300 px-2 py-0.5 rounded border border-blue-700 hover:border-blue-500 transition-colors"
          >
            ↻
          </button>
          <span className="text-slate-500 text-xs">{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-slate-700 divide-y divide-slate-800">
          {loading ? (
            <div className="px-4 py-3 text-slate-400 text-xs">
              A verificar canisters...
            </div>
          ) : (
            statuses.map((s) => {
              const hs = (s as any).healthStatus as
                | CanisterHealthStatus
                | undefined;
              const dot = healthDot(hs, s.online);
              const lbl = healthLabel(hs, s.online);
              return (
                <div
                  key={s.id}
                  className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-800/50"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`}
                    />
                    <div>
                      <div className="font-medium text-xs">{s.label}</div>
                      <div className="text-slate-500 text-xs font-mono">
                        {s.id}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-0.5">
                    <span className={`text-xs font-semibold ${lbl.cls}`}>
                      {lbl.text}
                    </span>
                    {s.latencyMs !== undefined && s.online && (
                      <span className="text-xs text-slate-500">
                        {s.latencyMs}ms
                      </span>
                    )}
                    {hs === "installing" && (
                      <span className="text-xs text-yellow-600">
                        instalar Motoko via dfx
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
          {installingCount > 0 && (
            <div className="px-4 py-2.5 bg-yellow-950/40 border-t border-yellow-800">
              <p className="text-xs text-yellow-300 font-medium">
                ⟳ Canisters em 503 aguardam instalação do código Motoko.
              </p>
              <p className="text-xs text-yellow-600 mt-0.5">
                Execute:{" "}
                <span className="font-mono">dfx deploy --network ic</span> com o
                teu controller.
              </p>
              <p className="text-xs text-yellow-600">
                Quando o deploy terminar, o estado ficará verde automaticamente.
              </p>
            </div>
          )}
          <div className="px-4 py-2 bg-slate-950/50">
            <p className="text-xs text-slate-600 font-mono">
              Controller:
              6wzpv-jfxnt-kzbeg-4isuv-vd2m2-yfzmk-znnho-tpvrg-lmarn-afsnw-tae
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default CanisterStatusPanel;
