// Fix Leaflet default icon paths for bundlers
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
  Shield,
} from "lucide-react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { SessionStatus } from "../backend";
import { useActor } from "../hooks/useActor";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  CircleMarker,
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "../lib/leaflet-stub";

// ─── Participant color palette (up to 10) ─────────────────────────────────────
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

// ─── Participant type ─────────────────────────────────────────────────────────
interface Participant {
  id: string;
  label: string;
  location: { lat: number; lng: number } | null;
}

// ─── Leaflet Map Component ────────────────────────────────────────────────────
interface MapViewProps {
  participants: Participant[];
}

function MapView({ participants }: MapViewProps) {
  const firstLoc = participants.find((p) => p.location)?.location;
  const center: [number, number] = firstLoc
    ? [firstLoc.lat, firstLoc.lng]
    : [38.7169, -9.1399];

  return (
    <MapContainer
      center={center}
      zoom={13}
      style={{ height: "60vh", minHeight: "400px", width: "100%" }}
      scrollWheelZoom={false}
      data-ocid="location.session.map_marker"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      {participants
        .filter((p) => p.location)
        .map((p, i) => (
          <Marker key={p.id} position={[p.location!.lat, p.location!.lng]}>
            <Popup>
              <strong
                style={{
                  color: PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
                }}
              >
                {p.label}
              </strong>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}

// ─── Main Page────────────────────────────────────────────────────────────
interface SecureLocationSessionPageProps {
  sessionId: bigint;
  myPhone: string;
  phoneNumber1: string;
  phoneNumber2: string;
}

export default function SecureLocationSessionPage({
  sessionId,
  myPhone,
  phoneNumber1,
  phoneNumber2,
}: SecureLocationSessionPageProps) {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const { navigate } = useSimpleRouter();

  // Multi-participant list (up to 10)
  const [participants, setParticipants] = useState<Participant[]>(() => {
    const initial: Participant[] = [
      {
        id: phoneNumber1,
        label: phoneNumber1 === myPhone ? `Eu (${phoneNumber1})` : phoneNumber1,
        location: null,
      },
    ];
    if (phoneNumber2 && phoneNumber2 !== phoneNumber1) {
      initial.push({
        id: phoneNumber2,
        label: phoneNumber2 === myPhone ? `Eu (${phoneNumber2})` : phoneNumber2,
        location: null,
      });
    }
    return initial;
  });

  const [isStopping, setIsStopping] = useState(false);
  const [shareError, setShareError] = useState("");
  const [sessionEnded, setSessionEnded] = useState(false);

  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationWatchRef = useRef<number | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const stopLocationWatch = useCallback(() => {
    if (locationWatchRef.current !== null) {
      navigator.geolocation.clearWatch(locationWatchRef.current);
      locationWatchRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopPolling();
      stopLocationWatch();
    };
  }, [stopPolling, stopLocationWatch]);

  // Start GPS watch and location polling
  useEffect(() => {
    if (!actor || !identity) return;

    // GPS watch — send this device's location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        async (pos) => {
          const loc = {
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude,
          };
          try {
            await actor.updateLocation(sessionId, myPhone, loc);
            // Update our own participant entry
            setParticipants((prev) =>
              prev.map((p) =>
                p.id === myPhone
                  ? {
                      ...p,
                      location: { lat: loc.latitude, lng: loc.longitude },
                    }
                  : p,
              ),
            );
          } catch {
            // silent
          }
        },
        () =>
          setShareError(
            "Não foi possível obter localização GPS. Verifique as permissões.",
          ),
        { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 },
      );
      locationWatchRef.current = watchId;
    }

    // Poll for all locations and session status
    pollIntervalRef.current = setInterval(async () => {
      try {
        const status: SessionStatus = await actor.getSessionStatus(sessionId);
        if (
          status === SessionStatus.ended ||
          status === SessionStatus.stopped ||
          status === SessionStatus.expired
        ) {
          stopPolling();
          stopLocationWatch();
          setSessionEnded(true);
          return;
        }

        // Fetch the two canonical locations from backend
        const [loc1, loc2] = await actor.getSessionLocations(sessionId);
        setParticipants((prev) => {
          const updated = [...prev];
          if (loc1) {
            const idx = updated.findIndex((p) => p.id === phoneNumber1);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                location: { lat: loc1.latitude, lng: loc1.longitude },
              };
            }
          }
          if (loc2) {
            const idx = updated.findIndex((p) => p.id === phoneNumber2);
            if (idx >= 0) {
              updated[idx] = {
                ...updated[idx],
                location: { lat: loc2.latitude, lng: loc2.longitude },
              };
            } else if (
              phoneNumber2 &&
              phoneNumber2 !== phoneNumber1 &&
              updated.length < 10
            ) {
              // Add new participant if not yet in list
              updated.push({
                id: phoneNumber2,
                label:
                  phoneNumber2 === myPhone
                    ? `Eu (${phoneNumber2})`
                    : phoneNumber2,
                location: { lat: loc2.latitude, lng: loc2.longitude },
              });
            }
          }
          return updated;
        });
      } catch {
        // silent
      }
    }, 4000);

    return () => {
      stopPolling();
      stopLocationWatch();
    };
  }, [
    actor,
    identity,
    sessionId,
    myPhone,
    phoneNumber1,
    phoneNumber2,
    stopPolling,
    stopLocationWatch,
  ]);

  const handleStopSharing = async () => {
    if (!actor) return;
    setIsStopping(true);
    try {
      await actor.endSession(sessionId);
    } catch {
      // silent
    } finally {
      stopPolling();
      stopLocationWatch();
      setSessionEnded(true);
      setIsStopping(false);
    }
  };

  // ── Session ended ──────────────────────────────────────────────────────────
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
              onClick={() => navigate("/secure-location-map")}
            >
              Voltar à Localização Segura
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Not authenticated ──────────────────────────────────────────────────────
  if (!identity) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 mx-auto mb-2 text-primary" />
            <CardTitle>Sessão de Localização</CardTitle>
            <CardDescription>
              Inicie sessão para ver o mapa de localização partilhada.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // ── Active map ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col p-4 bg-background">
      <div className="max-w-2xl mx-auto w-full space-y-4">
        {/* Header */}
        <Card className="shadow-md">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-green-100">
                  <MapPin className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-base">Sessão Ativa</CardTitle>
                  <CardDescription className="text-xs">
                    {participants.length} participante
                    {participants.length !== 1 ? "s" : ""} • Partilha mútua em
                    curso
                  </CardDescription>
                </div>
              </div>
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
          </CardHeader>
        </Card>

        {/* Legend — all participants */}
        <div className="flex flex-wrap items-center gap-3 px-1">
          {participants.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full border-2 border-white shadow"
                style={{
                  backgroundColor:
                    PARTICIPANT_COLORS[i % PARTICIPANT_COLORS.length],
                }}
              />
              <span className="text-xs text-muted-foreground">{p.label}</span>
            </div>
          ))}
        </div>

        {/* Map */}
        <MapView participants={participants} />

        {shareError && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>{shareError}</AlertDescription>
          </Alert>
        )}

        {/* Info */}
        <Alert>
          <Clock className="w-4 h-4" />
          <AlertDescription className="text-xs">
            A partilha de localização é temporária (máx. 24h). Pode parar a
            qualquer momento premindo "Parar Partilha".
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
