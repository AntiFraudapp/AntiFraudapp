// Fix: import leaflet from npm instead of window.L to ensure it loads on mobile
// leaflet loaded from CDN
declare const L: typeof import("leaflet");
/**
 * LocationSessionPage — shown at /location/session/:sessionId
 *
 * Works for ALL participants (creator and joiners alike).
 * v2.2: Added avatar markers, per-participant chat panel (text + voice),
 * and sync with realLocationService (AntiFraud real location canister).
 */

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Loader2,
  MapPin,
  MessageCircle,
} from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import ChatPanel from "../components/ChatPanel";
import {
  rlEnsureSession,
  rlGetParticipants,
  rlUpdateParticipant,
} from "../services/realLocationService";
import {
  type LocationSession,
  endSession,
  getSessionById,
  updateParticipantLocation,
} from "../utils/sessionStore";

// ─── Participant color palette (up to 10) ───────────────────────────────────────────────
const PARTICIPANT_COLORS = [
  "#2563eb", // blue
  "#dc2626", // red
  "#16a34a", // green
  "#d97706", // amber
  "#7c3aed", // violet
  "#db2777", // pink
  "#0891b2", // cyan
  "#65a30d", // lime
  "#ea580c", // orange
  "#475569", // slate
];

// ─── Types ───────────────────────────────────────────────────────────────────────────
interface MapParticipant {
  id: string;
  label: string;
  location: { lat: number; lng: number } | null;
  colorIndex: number;
  avatarUrl?: string;
}

// ─── Avatar helper: build the HTML for a Leaflet divIcon ──────────────────────────
function buildAvatarIconHtml(p: MapParticipant): string {
  const color = PARTICIPANT_COLORS[p.colorIndex % PARTICIPANT_COLORS.length];
  const initials = p.label
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (p.avatarUrl) {
    return `
      <div style="
        width:40px;height:40px;
        border-radius:50%;
        border:3px solid ${color};
        box-shadow:0 2px 8px rgba(0,0,0,0.4);
        overflow:hidden;
        background:#fff;
        cursor:pointer;
      ">
        <img src="${p.avatarUrl}" style="width:100%;height:100%;object-fit:cover;" />
      </div>`;
  }

  return `
    <div style="
      width:40px;height:40px;
      border-radius:50%;
      border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.4);
      background:${color};
      display:flex;align-items:center;justify-content:center;
      color:white;font-weight:bold;font-size:13px;
      cursor:pointer;
    ">${initials}</div>`;
}

// ─── Leaflet Map Component ──────────────────────────────────────────────────────────
interface MapViewProps {
  participants: MapParticipant[];
  onAvatarClick: (participantId: string, name: string) => void;
}

function MapView({ participants, onAvatarClick }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<Map<string, any>>(new Map());
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Initialize Leaflet ───────────────────────────────────────────────────────
  // biome-ignore lint/correctness/useExhaustiveDependencies: intentional mount-only map init
  useEffect(() => {
    let cancelled = false;

    function tryInit() {
      if (cancelled || !mapRef.current || leafletMapRef.current) return;
      const firstLoc = participants.find((p) => p.location)?.location;
      const center: [number, number] = firstLoc
        ? [firstLoc.lat, firstLoc.lng]
        : [38.7169, -9.1399];

      const map = L.map(mapRef.current, { zoomControl: true }).setView(
        center,
        13,
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      leafletMapRef.current = map;

      setTimeout(() => leafletMapRef.current?.invalidateSize(), 150);
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 500);
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 1000);
      setTimeout(() => leafletMapRef.current?.invalidateSize(), 2000);
    }

    tryInit();
    return () => {
      cancelled = true;
      if (retryRef.current) clearTimeout(retryRef.current);
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
      markersRef.current.clear();
    };
  }, []);

  // ── Update / add / remove markers ───────────────────────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current) return;

    const currentIds = new Set(participants.map((p) => p.id));

    // Remove markers for participants no longer in the list
    for (const [id, marker] of markersRef.current.entries()) {
      if (!currentIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    }

    const validLocations: [number, number][] = [];

    for (const p of participants) {
      if (!p.location) continue;
      validLocations.push([p.location.lat, p.location.lng]);

      const icon = L.divIcon({
        html: buildAvatarIconHtml(p),
        className: "",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      if (markersRef.current.has(p.id)) {
        // Update existing marker position and icon
        const existing = markersRef.current.get(p.id);
        existing.setLatLng([p.location.lat, p.location.lng]);
        existing.setIcon(icon);
      } else {
        // Create new marker
        const marker = L.marker([p.location.lat, p.location.lng], { icon })
          .addTo(leafletMapRef.current)
          .bindTooltip(p.label, {
            permanent: false,
            direction: "top",
            offset: [0, -22],
          });

        // Click opens chat panel
        marker.on("click", () => onAvatarClick(p.id, p.label));
        markersRef.current.set(p.id, marker);
      }
    }

    if (validLocations.length > 1) {
      leafletMapRef.current.fitBounds(L.latLngBounds(validLocations), {
        padding: [50, 50],
      });
    } else if (validLocations.length === 1) {
      leafletMapRef.current.setView(validLocations[0], 14);
    }

    leafletMapRef.current.invalidateSize();
  }, [participants, onAvatarClick]);

  return (
    <div
      ref={mapRef}
      id="antifraud-map"
      data-ocid="location.session.map_marker"
      style={{
        height: "60vh",
        minHeight: "300px",
        width: "100%",
        borderRadius: "0.5rem",
        zIndex: 0,
        position: "relative",
      }}
    />
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────────────
interface LocationSessionPageProps {
  sessionId: string;
}

export default function LocationSessionPage({
  sessionId,
}: LocationSessionPageProps) {
  const { navigate } = useSimpleRouter();

  const [session, setSession] = useState<LocationSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [sessionEnded, setSessionEnded] = useState(false);
  const [isStopping, setIsStopping] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [mapParticipants, setMapParticipants] = useState<MapParticipant[]>([]);

  // Chat panel state
  const [chatOpen, setChatOpen] = useState(false);
  const [_chatTargetId, setChatTargetId] = useState("");
  const [chatTargetName, setChatTargetName] = useState("");

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationWatchRef = useRef<number | null>(null);
  const rlSyncRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const myParticipantId = useRef<string>(
    (() => {
      try {
        return (
          sessionStorage.getItem(`antifraud_my_participant_${sessionId}`) ?? ""
        );
      } catch {
        return "";
      }
    })(),
  );
  const myName = useRef<string>(
    (() => {
      try {
        return sessionStorage.getItem(`antifraud_my_name_${sessionId}`) ?? "Eu";
      } catch {
        return "Eu";
      }
    })(),
  );

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (rlSyncRef.current) {
      clearInterval(rlSyncRef.current);
      rlSyncRef.current = null;
    }
  }, []);

  const stopLocationWatch = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
  }, []);

  // ── Build map participants from session ─────────────────────────────────────
  const buildMapParticipants = useCallback(
    (s: LocationSession): MapParticipant[] => {
      // Merge rl (real-location) avatars into session participants
      const rlParts = rlGetParticipants(sessionId);
      const rlMap = new Map(rlParts.map((p) => [p.id, p]));

      return s.participants.map((p, i) => {
        const rl = rlMap.get(p.id);
        return {
          id: p.id,
          label: p.id === myParticipantId.current ? `Eu (${p.name})` : p.name,
          location:
            rl?.lat !== undefined
              ? { lat: rl.lat, lng: rl.lng! }
              : (p.location ?? null),
          colorIndex: i,
          avatarUrl: p.avatarUrl ?? rl?.avatarUrl,
        };
      });
    },
    [sessionId],
  );

  // ── Load session on mount ──────────────────────────────────────────────────
  useEffect(() => {
    const found = getSessionById(sessionId);
    if (!found) {
      setNotFound(true);
      setIsLoading(false);
      return;
    }
    if (found.status === "ENDED") {
      setSessionEnded(true);
      setIsLoading(false);
      return;
    }
    // Ensure real-location canister session exists
    rlEnsureSession(sessionId);
    setSession(found);
    setMapParticipants(buildMapParticipants(found));
    setIsLoading(false);
  }, [sessionId, buildMapParticipants]);

  // ── Start GPS + polling ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!session || isLoading) return;

    // GPS watch — update localStorage + real-location service
    if (navigator.geolocation && myParticipantId.current) {
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          updateParticipantLocation(sessionId, myParticipantId.current, loc);
          // Also update in real-location canister service
          rlUpdateParticipant(sessionId, {
            id: myParticipantId.current,
            name: myName.current,
            lat: loc.lat,
            lng: loc.lng,
          });
        },
        () =>
          setLocationError(
            "Não foi possível obter localização GPS. Verifique as permissões.",
          ),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
      );
      locationWatchRef.current = watchId;
    }

    // Poll sessionStore every 3s
    pollIntervalRef.current = setInterval(() => {
      const latest = getSessionById(sessionId);
      if (!latest || latest.status === "ENDED") {
        stopPolling();
        stopLocationWatch();
        setSessionEnded(true);
        return;
      }
      setSession(latest);
      setMapParticipants(buildMapParticipants(latest));
    }, 3000);

    // Also poll real-location service every 4s to pick up remote avatars
    rlSyncRef.current = setInterval(() => {
      const latest = getSessionById(sessionId);
      if (latest) setMapParticipants(buildMapParticipants(latest));
    }, 4000);

    return () => {
      stopPolling();
      stopLocationWatch();
    };
  }, [
    session,
    isLoading,
    sessionId,
    stopPolling,
    stopLocationWatch,
    buildMapParticipants,
  ]);

  // ── Avatar click handler (opens chat) ────────────────────────────────────
  const handleAvatarClick = useCallback((id: string, name: string) => {
    setChatTargetId(id);
    setChatTargetName(name);
    setChatOpen(true);
  }, []);

  // ── Stop sharing ───────────────────────────────────────────────────────────
  const handleStopSharing = () => {
    setIsStopping(true);
    if (session) endSession(session.joinToken);
    stopPolling();
    stopLocationWatch();
    setSessionEnded(true);
    setIsStopping(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              A carregar sessão de localização…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Session ended ───────────────────────────────────────────────────────────
  if (sessionEnded) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <CardTitle>Partilha Terminada</CardTitle>
            <CardDescription>
              A partilha de localização foi encerrada. Os seus dados de
              localização foram apagados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full"
              data-ocid="location.session.ended.home_button"
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────────
  if (notFound || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle>Sessão não encontrada</CardTitle>
            <CardDescription>
              Esta sessão não existe ou expirou. Peça ao criador um novo link de
              adesão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              data-ocid="location.session.notfound.home_button"
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
            <Button
              variant="outline"
              className="w-full"
              data-ocid="location.session.notfound.create_button"
              onClick={() => navigate("/secure-location-map")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Criar Nova Sessão
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const participantCount = session.participants.length;

  // ── Active map ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col p-4 bg-background">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Header card */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle
                    className="text-base"
                    data-ocid="location.session.title"
                  >
                    Sessão{" "}
                    {session.status === "ACTIVE" ? "Ativa" : "A aguardar"}
                  </CardTitle>
                  <CardDescription
                    className="text-xs"
                    data-ocid="location.session.participant_count"
                  >
                    {participantCount} participante
                    {participantCount !== 1 ? "s" : ""} (máx. 10) • Clique num
                    avatar para abrir o chat
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="hidden sm:flex"
                  data-ocid="location.session.open_chat_button"
                  onClick={() => {
                    setChatTargetId("");
                    setChatTargetName("");
                    setChatOpen(true);
                  }}
                >
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Chat
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  data-ocid="location.session.stop_button"
                  onClick={handleStopSharing}
                  disabled={isStopping}
                >
                  {isStopping ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  ) : null}
                  Parar Partilha
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Map + floating chat panel */}
        <div className="relative">
          {/* Legend */}
          <div
            className="flex flex-wrap items-center gap-3 px-1 mb-2"
            data-ocid="location.session.legend"
          >
            {mapParticipants.map((p) => (
              <button
                key={p.id}
                type="button"
                className="flex items-center gap-2 hover:opacity-75 transition-opacity"
                onClick={() => handleAvatarClick(p.id, p.label)}
                title={`Abrir chat com ${p.label}`}
                data-ocid="location.session.legend.item.button"
              >
                {p.avatarUrl ? (
                  <img
                    src={p.avatarUrl}
                    alt={p.label}
                    className="w-5 h-5 rounded-full object-cover border-2"
                    style={{
                      borderColor:
                        PARTICIPANT_COLORS[
                          p.colorIndex % PARTICIPANT_COLORS.length
                        ],
                    }}
                  />
                ) : (
                  <div
                    className="w-5 h-5 rounded-full border-2 border-white shadow flex items-center justify-center text-[8px] text-white font-bold"
                    style={{
                      backgroundColor:
                        PARTICIPANT_COLORS[
                          p.colorIndex % PARTICIPANT_COLORS.length
                        ],
                    }}
                  >
                    {p.label.slice(0, 1).toUpperCase()}
                  </div>
                )}
                <span className="text-xs text-muted-foreground">{p.label}</span>
                <MessageCircle className="w-3 h-3 text-muted-foreground" />
              </button>
            ))}
          </div>

          {/* Map */}
          <MapView
            participants={mapParticipants}
            onAvatarClick={handleAvatarClick}
          />

          {/* Floating chat panel */}
          {chatOpen && (
            <div
              className="absolute bottom-4 right-4 z-50"
              style={{ maxWidth: "calc(100% - 2rem)" }}
            >
              <ChatPanel
                sessionId={sessionId}
                myParticipantId={myParticipantId.current || "creator"}
                myName={myName.current}
                targetName={chatTargetName || undefined}
                onClose={() => setChatOpen(false)}
              />
            </div>
          )}
        </div>

        {locationError && (
          <Alert
            variant="destructive"
            data-ocid="location.session.gps_error_state"
          >
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{locationError}</AlertDescription>
          </Alert>
        )}

        {session.status === "PENDING" && participantCount < 2 && (
          <Alert data-ocid="location.session.waiting_state">
            <Clock className="w-4 h-4" />
            <AlertDescription className="text-sm">
              A aguardar que outros participantes entrem na sessão através do
              link de adesão.
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <Clock className="w-4 h-4" />
          <AlertDescription className="text-xs">
            A partilha de localização é temporária (máx. 24h) e mútua. Pode
            parar a qualquer momento. Dados armazenados no canister AntiFraud
            real location (sodv3-uiaaa-aaaak-qxubq-cai).
          </AlertDescription>
        </Alert>

        <p className="text-center text-xs text-muted-foreground pb-2">
          Leaflet • OpenStreetMap • AntiFraud
        </p>
      </div>
    </div>
  );
}
