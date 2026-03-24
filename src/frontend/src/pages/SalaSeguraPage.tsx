import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useSimpleRouter } from "@/router/useSimpleRouter";
import { Link2, MapPin, Shield, Users } from "lucide-react";
import { useState } from "react";
import { GdprLocationModal } from "../components/GdprLocationModal";
import {
  FIREBASE_CONFIGURED,
  createRoom,
  joinRoom,
} from "../services/firebaseService";

function generateUserId(): string {
  let id = localStorage.getItem("afapp_user_id");
  if (!id) {
    id = Math.random().toString(36).substring(2, 12);
    localStorage.setItem("afapp_user_id", id);
  }
  return id;
}

export function SalaSeguraPage() {
  const { navigate } = useSimpleRouter();
  const [gdprAccepted, setGdprAccepted] = useState(false);
  const [name, setName] = useState(
    () => localStorage.getItem("afapp_user_name") || "",
  );
  const [joinCode, setJoinCode] = useState("");
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");

  if (!gdprAccepted) {
    return <GdprLocationModal onAccepted={() => setGdprAccepted(true)} />;
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Introduz o teu nome para criar a sala.");
      return;
    }
    setError("");
    setCreating(true);
    try {
      localStorage.setItem("afapp_user_name", name.trim());
      const userId = generateUserId();
      const roomId = await createRoom(userId, name.trim());
      navigate(`/sala/${roomId}`);
    } catch (_e) {
      setError("Erro ao criar sala. Verifica se o Firebase está configurado.");
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase();
    if (!name.trim()) {
      setError("Introduz o teu nome para entrar na sala.");
      return;
    }
    if (!code) {
      setError("Introduz o código ou URL da sala.");
      return;
    }
    setError("");
    setJoining(true);
    try {
      localStorage.setItem("afapp_user_name", name.trim());
      const userId = generateUserId();
      const roomId = code.includes("/sala/")
        ? code.split("/sala/")[1].split(/[?#]/)[0]
        : code;
      const result = await joinRoom(roomId, userId, name.trim());
      if (result.success) {
        navigate(`/sala/${roomId}`);
      } else {
        setError(result.error || "Erro ao entrar na sala.");
      }
    } catch {
      setError("Erro ao entrar. Verifica o código.");
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="flex-1 container mx-auto px-4 py-8 max-w-xl">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="p-3 rounded-full bg-blue-100">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">🔒 Sala Segura</h1>
          <p className="text-sm text-muted-foreground">
            Partilha localização em tempo real com até 10 pessoas. Sessão
            privada, expira em 24h.
          </p>
        </div>

        {/* Firebase not configured warning */}
        {!FIREBASE_CONFIGURED && (
          <Card className="border-amber-300 bg-amber-50">
            <CardContent className="p-4">
              <p className="text-sm font-semibold text-amber-800 mb-2">
                ⚙️ Firebase não configurado
              </p>
              <p className="text-xs text-amber-700">
                Para ativar a partilha multi-dispositivo (iPhone ↔ Android),
                configura o Firebase no ficheiro{" "}
                <code className="bg-amber-100 px-1 rounded">
                  src/services/firebaseService.ts
                </code>
                :{" "}
                <a
                  href="https://console.firebase.google.com"
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-medium"
                >
                  console.firebase.google.com
                </a>{" "}
                → Criar projeto → Realtime Database → Copiar config.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Your name */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" /> O teu nome
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Ex: Hermínio"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              data-ocid="sala-segura.name_input"
            />
          </CardContent>
        </Card>

        {/* Create room */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" /> Criar nova sala
            </CardTitle>
            <CardDescription className="text-xs">
              Gera um link para partilhares com os teus contactos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              onClick={handleCreate}
              disabled={creating}
              data-ocid="sala-segura.create_button"
            >
              {creating ? "A criar…" : "✨ Criar Sala Segura"}
            </Button>
          </CardContent>
        </Card>

        {/* Join room */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Link2 className="w-4 h-4 text-blue-600" /> Entrar numa sala
            </CardTitle>
            <CardDescription className="text-xs">
              Cola o link ou o código da sala que recebeste.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              placeholder="Código (ex: AB12CD34) ou URL completo"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              data-ocid="sala-segura.join_input"
            />
            <Button
              className="w-full"
              variant="outline"
              onClick={handleJoin}
              disabled={joining}
              data-ocid="sala-segura.join_button"
            >
              {joining ? "A entrar…" : "🚀 Entrar na Sala"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <p className="text-sm text-red-600 text-center font-medium">
            {error}
          </p>
        )}

        <p className="text-xs text-muted-foreground text-center">
          🔒 Os dados de localização são temporários e eliminados após a sessão.
          Compatível com iPhone e Android.
        </p>
      </div>
    </main>
  );
}

export default SalaSeguraPage;
