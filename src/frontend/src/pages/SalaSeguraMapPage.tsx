import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import {
  Clock,
  LogOut,
  MapPin,
  Mic,
  MicOff,
  Send,
  StopCircle,
  Users,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "../lib/leaflet-stub";
import {
  type ChatMessage,
  FIREBASE_CONFIGURED,
  type Room,
  type RoomParticipant,
  joinRoom,
  leaveRoom,
  sendChatMessage,
  subscribeToRoom,
  updateLocation,
} from "../services/firebaseService";

// Évora fallback coordinates
const EVORA_LAT = 38.5572;
const EVORA_LNG = -7.4136;

// ─── Error Boundary ───────────────────────────────────────────────────────────
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: "" };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error: error.message };
  }
  componentDidCatch(error: Error) {
    console.error("SalaSegura ErrorBoundary caught:", error);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-3 max-w-md">
            <p className="text-4xl">⚠️</p>
            <h2 className="text-lg font-bold text-red-600">
              Erro na Sala Segura
            </h2>
            <p className="text-sm text-muted-foreground">{this.state.error}</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
            >
              Recarregar página
            </button>
          </div>
        </main>
      );
    }
    return this.props.children;
  }
}

const COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
  "#0891b2",
  "#65a30d",
  "#ea580c",
  "#475569",
];

function makeColoredIcon(color: string) {
  const L = (window as any).L;
  if (!L) return undefined;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36"><path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 24 12 24S24 21 24 12C24 5.37 18.63 0 12 0z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12" cy="12" r="5" fill="white"/></svg>`;
  return L.divIcon({
    html: svg,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36],
  });
}

function getUserId(): string {
  return localStorage.getItem("afapp_user_id") || "anon";
}
function getUserName(): string {
  return localStorage.getItem("afapp_user_name") || "Utilizador";
}

/** Request GPS permission and return coords, falling back to Évora on error/denial */
function requestGpsWithFallback(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: EVORA_LAT, lng: EVORA_LNG });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        if (!lat || !lng || Number.isNaN(lat) || Number.isNaN(lng)) {
          resolve({ lat: EVORA_LAT, lng: EVORA_LNG });
        } else {
          resolve({ lat, lng });
        }
      },
      () => {
        resolve({ lat: EVORA_LAT, lng: EVORA_LNG });
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

interface SalaSeguraMapPageProps {
  roomId: string;
}

export function SalaSeguraMapPage({ roomId }: SalaSeguraMapPageProps) {
  const { navigate } = useSimpleRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState("");
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [voiceActive, setVoiceActive] = useState(false);
  const [joining, setJoining] = useState(true);
  const [gpsStatus, setGpsStatus] = useState<
    "requesting" | "active" | "fallback"
  >("requesting");
  const [mapCenter, setMapCenter] = useState<[number, number]>([
    EVORA_LAT,
    EVORA_LNG,
  ]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const gpsWatchRef = useRef<number | null>(null);
  const gpsIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const latestCoordsRef = useRef<{ lat: number; lng: number }>({
    lat: EVORA_LAT,
    lng: EVORA_LNG,
  });
  const unsubRef = useRef<(() => void) | null>(null);
  const userIdRef = useRef(getUserId());
  const userNameRef = useRef(getUserName());

  const userId = userIdRef.current;
  const userName = userNameRef.current;

  useEffect(() => {
    const prev = window.onerror;
    window.onerror = (msg, src, line, col, err) => {
      console.error("[SalaSegura window.onerror]", msg, src, line, col, err);
      return false;
    };
    return () => {
      window.onerror = prev;
    };
  }, []);

  useEffect(() => {
    const base = window.location.origin;
    setShareUrl(`${base}/sala/${roomId}`);
  }, [roomId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: userId/userName are stable refs; roomId is the only real dep
  useEffect(() => {
    async function initWithGps() {
      setGpsStatus("requesting");

      const { lat, lng } = await requestGpsWithFallback();
      const usingFallback = lat === EVORA_LAT && lng === EVORA_LNG;
      setGpsStatus(usingFallback ? "fallback" : "active");
      setMapCenter([lat, lng]);
      latestCoordsRef.current = { lat, lng };

      if (!FIREBASE_CONFIGURED) {
        setError("Firebase não configurado. Consulta firebaseService.ts.");
        setJoining(false);
        return;
      }
      try {
        await joinRoom(roomId, userId, userName);
      } catch {
        // already joined — continue
      }

      await updateLocation(roomId, userId, lat, lng);

      unsubRef.current = subscribeToRoom(roomId, (data) => {
        if (!data) {
          setError("Sala não encontrada ou expirada.");
          return;
        }
        if (Date.now() > data.expiresAt) {
          setError("Sala expirada.");
          return;
        }
        setRoom(data);
        const parts = Object.values(data.participants || {});
        setParticipants(parts);
        const msgs = Object.entries(data.messages || {}).map(([id, m]) => ({
          ...(m as Omit<ChatMessage, "id">),
          id,
        }));
        msgs.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(msgs);

        const withCoords = parts.find(
          (p) =>
            p.lat !== null &&
            p.lng !== null &&
            !Number.isNaN(p.lat) &&
            !Number.isNaN(p.lng),
        );
        if (withCoords && withCoords.lat !== null && withCoords.lng !== null) {
          setMapCenter([withCoords.lat, withCoords.lng]);
        }
      });

      setJoining(false);

      // Watch GPS for live updates
      if (navigator.geolocation) {
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const wLat = pos.coords.latitude;
            const wLng = pos.coords.longitude;
            if (!wLat || !wLng || Number.isNaN(wLat) || Number.isNaN(wLng)) {
              return;
            }
            setGpsStatus("active");
            latestCoordsRef.current = { lat: wLat, lng: wLng };
            updateLocation(roomId, userId, wLat, wLng);
          },
          () => {
            // GPS watch error — interval will still push latest coords
          },
          { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
        );
        gpsWatchRef.current = watchId;
      }

      // Force Firebase sync every 5s (ensures iOS gets updates even if watchPosition stalls)
      gpsIntervalRef.current = setInterval(() => {
        const { lat: iLat, lng: iLng } = latestCoordsRef.current;
        updateLocation(roomId, userId, iLat, iLng);
      }, 5000);
    }

    initWithGps();

    return () => {
      unsubRef.current?.();
      if (gpsWatchRef.current !== null)
        navigator.geolocation.clearWatch(gpsWatchRef.current);
      if (gpsIntervalRef.current !== null)
        clearInterval(gpsIntervalRef.current);
    };
  }, [roomId]);

  // Scroll only the chat container, not the whole page
  // biome-ignore lint/correctness/useExhaustiveDependencies: messages triggers re-run but ref is not a dep
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendChat = async () => {
    if (!chatText.trim()) return;
    await sendChatMessage(roomId, userId, userName, chatText.trim());
    setChatText("");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleLeave = async () => {
    await leaveRoom(roomId, userId);
    unsubRef.current?.();
    if (gpsWatchRef.current !== null)
      navigator.geolocation.clearWatch(gpsWatchRef.current);
    if (gpsIntervalRef.current !== null) clearInterval(gpsIntervalRef.current);
    navigate("/sala");
  };

  if (joining) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="text-center space-y-3">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground text-sm">
            {gpsStatus === "requesting"
              ? "A pedir permissão de localização…"
              : "A entrar na sala…"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <ErrorBoundary>
      {/* Full-screen column layout: top bar → map (50vh) → scrollable panel */}
      <main
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          overflow: "hidden",
        }}
      >
        {/* ── Top bar ── */}
        <div
          className="flex items-center justify-between px-4 py-2 border-b bg-card"
          style={{ flexShrink: 0 }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold">🔒 Sala {roomId}</span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {participants.length}/10
            </span>
            {room && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(room.expiresAt).toLocaleTimeString("pt-PT", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs">
              <MapPin className="w-3 h-3" />
              {gpsStatus === "active" ? (
                <span className="text-green-600">GPS ativo</span>
              ) : (
                <span className="text-amber-600">GPS: Évora (fallback)</span>
              )}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="text-xs h-7"
              data-ocid="sala.secondary_button"
            >
              {copied ? "✅" : "📋 Link"}
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={handleLeave}
              className="h-7 font-bold"
              data-ocid="sala.stop_button"
            >
              <StopCircle className="w-3.5 h-3.5 mr-1" />🛑 STOP
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={handleLeave}
              className="h-7"
              data-ocid="sala.close_button"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              Sair
            </Button>
          </div>
        </div>

        {gpsStatus === "fallback" && (
          <div
            className="px-4 py-1.5 bg-amber-50 border-b text-xs text-amber-700"
            style={{ flexShrink: 0 }}
          >
            📍 Localização GPS não disponível — a usar Évora como posição
            padrão. Ativa a permissão de localização no teu browser e recarrega.
          </div>
        )}

        {error && (
          <Alert
            variant="destructive"
            className="m-3"
            style={{ flexShrink: 0 }}
          >
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* ── Map — fixed 50vh, no scroll hijack ── */}
        <div style={{ height: "50vh", flexShrink: 0, width: "100%" }}>
          <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            {participants
              .filter(
                (p) =>
                  p.lat !== null &&
                  p.lng !== null &&
                  p.lat !== undefined &&
                  p.lng !== undefined &&
                  !Number.isNaN(p.lat) &&
                  !Number.isNaN(p.lng),
              )
              .map((p, i) => (
                <Marker
                  key={p.id}
                  position={[p.lat as number, p.lng as number]}
                  icon={makeColoredIcon(COLORS[i % COLORS.length])}
                >
                  <Popup>
                    <strong style={{ color: COLORS[i % COLORS.length] }}>
                      {p.id === userId ? `${p.name} (Tu)` : p.name}
                    </strong>
                  </Popup>
                </Marker>
              ))}
          </MapContainer>
        </div>

        {/* ── Bottom panel — participants + chat, scrollable ── */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
          className="bg-card"
        >
          {/* Participants row */}
          <div
            className="flex gap-3 px-3 py-2 border-b overflow-x-auto"
            style={{ flexShrink: 0 }}
          >
            {participants.map((p, i) => (
              <div key={p.id} className="flex items-center gap-1 shrink-0">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: COLORS[i % COLORS.length] }}
                />
                <span className="text-xs whitespace-nowrap">
                  {p.id === userId ? `${p.name} (Tu)` : p.name}
                </span>
                {p.lat !== null && <span>📍</span>}
              </div>
            ))}
          </div>

          {/* Chat messages — ref on the scrollable container */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 space-y-1.5"
          >
            {messages.map((m) => (
              <div
                key={m.id}
                className={`text-xs rounded px-2 py-1 max-w-[85%] ${
                  m.senderId === userId
                    ? "ml-auto bg-blue-600 text-white"
                    : "bg-muted"
                }`}
              >
                {m.senderId !== userId && (
                  <span className="font-semibold text-[10px] opacity-70 mr-1">
                    {m.senderName}:
                  </span>
                )}
                {m.text}
              </div>
            ))}
          </div>

          {/* Chat input */}
          <div className="p-2 border-t flex gap-2" style={{ flexShrink: 0 }}>
            <Input
              className="text-xs h-8 flex-1"
              placeholder="Mensagem…"
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
              data-ocid="sala.input"
            />
            <Button
              size="sm"
              variant={voiceActive ? "destructive" : "outline"}
              className="h-8 px-2"
              onClick={() => setVoiceActive((v) => !v)}
              data-ocid="sala.toggle"
            >
              {voiceActive ? (
                <MicOff className="w-3.5 h-3.5" />
              ) : (
                <Mic className="w-3.5 h-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              className="h-8 px-2"
              onClick={handleSendChat}
              data-ocid="sala.submit_button"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </main>
    </ErrorBoundary>
  );
}

export default SalaSeguraMapPage;
