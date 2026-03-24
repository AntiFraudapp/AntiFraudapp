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
  Camera,
  KeyRound,
  Loader2,
  MapPin,
  Shield,
  Users,
} from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import {
  rlEnsureSession,
  rlUpdateParticipant,
} from "../services/realLocationService";
import {
  type LocationSession,
  type SessionParticipant,
  addParticipant,
  getSessionByToken,
  saveSession,
} from "../utils/sessionStore";

// ─── Compress image to a small data-URL ──────────────────────────────────────────
function resizeImage(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = 80; // 80x80 px thumbnail
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d")!;
        // Centre-crop
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}

// ─── Main Page ────────────────────────────────────────────────────────────────────────
interface SecureLocationJoinPageProps {
  joinToken: string;
}

export default function SecureLocationJoinPage({
  joinToken,
}: SecureLocationJoinPageProps) {
  const { navigate } = useSimpleRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState("");
  const [session, setSession] = useState<LocationSession | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [participantName, setParticipantName] = useState("");
  const [codeInput, setCodeInput] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Validate token and load session ────────────────────────────────────────
  useEffect(() => {
    if (!joinToken || joinToken === "manual" || joinToken === "") {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    const found = getSessionByToken(joinToken);
    if (found) {
      if (found.status === "ENDED") {
        setNotFound(true);
        setJoinError(
          "Esta sessão foi encerrada. Peça ao criador um novo link.",
        );
      } else if (found.participants.length >= 10) {
        setNotFound(true);
        setJoinError(
          "Esta sessão já atingiu o limite máximo de 10 participantes.",
        );
      } else {
        setSession(found);
      }
    } else {
      // Fix: try to restore session from URL query param (d=base64) for cross-device links
      const params = new URLSearchParams(window.location.search);
      const d = params.get("d");
      if (d) {
        try {
          const decoded = JSON.parse(
            decodeURIComponent(escape(atob(decodeURIComponent(d)))),
          );
          if (decoded && decoded.joinToken === joinToken) {
            saveSession(decoded);
            if (decoded.status === "ENDED") {
              setNotFound(true);
              setJoinError(
                "Esta sessão foi encerrada. Peça ao criador um novo link.",
              );
            } else if (decoded.participants.length >= 10) {
              setNotFound(true);
              setJoinError(
                "Esta sessão já atingiu o limite máximo de 10 participantes.",
              );
            } else {
              setSession(decoded);
            }
            setIsLoading(false);
            return;
          }
        } catch {
          /* silent — fall through to notFound */
        }
      }
      setNotFound(true);
      setJoinError(
        "A sessão não foi encontrada neste dispositivo. Os dados de sessão estão guardados localmente no dispositivo que criou o link. Para partilhar localização, crie uma nova sessão.",
      );
    }
    setIsLoading(false);
  }, [joinToken]);

  // ── Handle avatar file pick ───────────────────────────────────────────────
  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const dataUrl = await resizeImage(file);
    setAvatarUrl(dataUrl);
    setAvatarPreview(dataUrl);
  };

  // ── Join the session ────────────────────────────────────────────────────────
  const handleJoin = async () => {
    if (!session) return;
    setIsJoining(true);
    setJoinError("");

    if (session.requiresCode && session.code) {
      if (codeInput.trim() !== session.code) {
        setJoinError(
          "Código de segurança inválido. Verifique o código recebido e tente novamente.",
        );
        setIsJoining(false);
        return;
      }
    }

    const latestSession = getSessionByToken(joinToken);
    if (!latestSession) {
      setJoinError("Sessão não encontrada. O link pode ter expirado.");
      setIsJoining(false);
      return;
    }
    if (latestSession.participants.length >= 10) {
      setJoinError(
        "Esta sessão já atingiu o limite máximo de 10 participantes.",
      );
      setIsJoining(false);
      return;
    }

    const displayName =
      participantName.trim() ||
      `Participante ${Date.now().toString().slice(-4)}`;
    const participantId = `joiner-${Date.now()}`;

    const newParticipant: SessionParticipant = {
      id: participantId,
      name: displayName,
      joinedAt: Date.now(),
      avatarUrl: avatarUrl ?? undefined,
    };

    const updated = addParticipant(joinToken, newParticipant);
    if (!updated) {
      setJoinError("Não foi possível entrar na sessão. Tente novamente.");
      setIsJoining(false);
      return;
    }

    // Register in real-location canister service
    rlEnsureSession(updated.sessionId);
    rlUpdateParticipant(updated.sessionId, {
      id: participantId,
      name: displayName,
      avatarUrl: avatarUrl ?? undefined,
    });

    try {
      sessionStorage.setItem(
        `antifraud_my_participant_${updated.sessionId}`,
        participantId,
      );
      sessionStorage.setItem(
        `antifraud_my_name_${updated.sessionId}`,
        displayName,
      );
    } catch {
      // silent
    }

    setTimeout(() => navigate(`/location/session/${updated.sessionId}`), 800);
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">
              A validar o link de adesão…
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Not found ───────────────────────────────────────────────────────────────────
  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card
          className="w-full max-w-md shadow-lg"
          data-ocid="location.join.notfound.card"
        >
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-3">
              <div className="p-3 rounded-full bg-destructive/10">
                <AlertTriangle className="w-8 h-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-xl">Sessão Não Encontrada</CardTitle>
            <CardDescription className="text-sm mt-1">
              {joinError ||
                "O link pode ter expirado ou a sessão foi encerrada. Pode abrir a partilha de localização diretamente."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full"
              data-ocid="location.join.notfound.home_button"
              onClick={() => navigate("/")}
            >
              Voltar ao Início
            </Button>
            <Button
              variant="outline"
              className="w-full"
              data-ocid="location.join.notfound.map_button"
              onClick={() => navigate("/secure-location-map")}
            >
              <MapPin className="w-4 h-4 mr-2" />
              Partilha de Localização
            </Button>
            <Button
              variant="secondary"
              className="w-full"
              data-ocid="location.join.notfound.create_button"
              onClick={() => navigate("/secure-location")}
            >
              Criar Nova Sessão de Localização
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Join screen ──────────────────────────────────────────────────────────────────
  const participantCount = session?.participants.length ?? 0;
  const isCodeProtected = session?.requiresCode && !!session?.code;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card
        className="w-full max-w-md shadow-lg"
        data-ocid="location.join.card"
      >
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-3">
            <div className="p-3 rounded-full bg-primary/10">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl">
            Entrar na Sessão de Localização
          </CardTitle>
          <CardDescription className="text-sm mt-1">
            Recebeu um convite AntiFraud para partilhar localização em tempo
            real.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <Alert>
            <MapPin className="w-4 h-4" />
            <AlertDescription className="text-sm">
              Ao entrar, a sua localização será partilhada com os outros
              participantes durante 24h. A partilha é mútua e temporária — pode
              parar a qualquer momento. Destina-se a contactos de confiança e à
              sua proteção pessoal.
            </AlertDescription>
          </Alert>

          {/* Session info */}
          {session && (
            <div className="bg-muted rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado</span>
                <span
                  className={
                    session.status === "ACTIVE"
                      ? "text-green-600 font-semibold"
                      : "text-amber-600 font-semibold"
                  }
                >
                  {session.status === "ACTIVE" ? "ATIVA" : "A aguardar"}
                </span>
              </div>
              {session.phoneA && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Criador</span>
                  <span>{session.phoneA}</span>
                </div>
              )}
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Participantes</span>
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {participantCount} / 10
                </span>
              </div>
            </div>
          )}

          {/* Avatar upload */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Foto de perfil (opcional)
            </p>
            <div className="flex items-center gap-3">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="Avatar"
                  className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-muted border-2 border-dashed border-border flex items-center justify-center">
                  <Camera className="w-5 h-5 text-muted-foreground" />
                </div>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                data-ocid="location.join.avatar_upload_button"
              >
                {avatarPreview ? "Alterar foto" : "Adicionar foto"}
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
                data-ocid="location.join.avatar_input"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              A sua foto aparece no mapa como marcador pessoal.
            </p>
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label
              htmlFor="participant-name"
              className="text-sm font-medium text-foreground"
            >
              O seu nome ou alcunha (opcional)
            </label>
            <input
              id="participant-name"
              type="text"
              maxLength={30}
              placeholder="Ex: João, Mãe, Amigo…"
              value={participantName}
              onChange={(e) => setParticipantName(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="location.join.name_input"
            />
          </div>

          {/* Code (only if session requires it) */}
          {isCodeProtected && (
            <div className="space-y-2">
              <label
                htmlFor="session-code"
                className="text-sm font-medium text-foreground flex items-center gap-1"
              >
                <KeyRound className="w-3 h-3" />
                Código de segurança da sessão
              </label>
              <input
                id="session-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="123456"
                value={codeInput}
                onChange={(e) =>
                  setCodeInput(e.target.value.replace(/\D/g, ""))
                }
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-center tracking-widest font-mono ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-ocid="location.join.code_input"
              />
            </div>
          )}

          {joinError && (
            <Alert variant="destructive" data-ocid="location.join.error_state">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription>{joinError}</AlertDescription>
            </Alert>
          )}

          <Button
            className="w-full h-12 text-base font-semibold"
            data-ocid="location.join.enter_button"
            onClick={handleJoin}
            disabled={isJoining}
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />A entrar…
              </>
            ) : (
              <>
                <MapPin className="w-4 h-4 mr-2" />
                Entrar na Sessão
              </>
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Ao entrar, aceita partilhar a sua localização GPS temporariamente
            com os outros participantes. Esta funcionalidade destina-se a
            contactos de confiança e à proteção pessoal, não a controlo ou
            perseguição de terceiros.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
