/**
 * ChatPanel.tsx
 *
 * Real-time chat panel for a location sharing session.
 * Supports text messages and voice messages (MediaRecorder API).
 * Messages are stored in sessionStore and synced via polling.
 */

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Mic, MicOff, Play, Send, Square, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  type SessionChatMessage,
  addChatMessage,
  getSessionById,
} from "../utils/sessionStore";

interface ChatPanelProps {
  sessionId: string;
  myParticipantId: string;
  myName: string;
  targetName?: string; // Name of the participant whose marker was clicked
  onClose: () => void;
}

// Format time as HH:MM
function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString("pt-PT", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatPanel({
  sessionId,
  myParticipantId,
  myName,
  targetName,
  onClose,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<SessionChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micError, setMicError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll for new messages every 2s ───────────────────────────────────────
  useEffect(() => {
    const fetch = () => {
      const s = getSessionById(sessionId);
      if (s?.messages) setMessages(s.messages);
    };
    fetch();
    pollRef.current = setInterval(fetch, 2000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId]);

  // biome-ignore lint/correctness/useExhaustiveDependencies: messages is the scroll trigger
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Cleanup on unmount ──────────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // ── Send text message ───────────────────────────────────────────────
  const sendText = useCallback(() => {
    const text = inputText.trim();
    if (!text) return;
    addChatMessage(sessionId, {
      participantId: myParticipantId,
      participantName: myName,
      text,
    });
    setInputText("");
    // Refresh immediately
    const s = getSessionById(sessionId);
    if (s?.messages) setMessages(s.messages);
  }, [inputText, sessionId, myParticipantId, myName]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendText();
    }
  };

  // ── Voice recording ─────────────────────────────────────────────────
  const startRecording = async () => {
    setMicError("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/ogg";
      const recorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        for (const t of stream.getTracks()) {
          t.stop();
        }
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        // Convert to base64 and save
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          addChatMessage(sessionId, {
            participantId: myParticipantId,
            participantName: myName,
            audioBase64: base64,
            audioMime: mimeType,
          });
          const s = getSessionById(sessionId);
          if (s?.messages) setMessages(s.messages);
        };
        reader.readAsDataURL(blob);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => {
          if (s >= 59) {
            stopRecording();
            return 60;
          }
          return s + 1;
        });
      }, 1000);
    } catch {
      setMicError(
        "Não foi possível aceder ao microfone. Verifique as permissões.",
      );
    }
  };

  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    setRecordingSeconds(0);
  }, []);

  // ── Play audio message ───────────────────────────────────────────────
  const playAudio = (base64: string, mime: string) => {
    try {
      const src = `data:${mime};base64,${base64}`;
      const audio = new Audio(src);
      audio.play().catch(() => {
        // ignore autoplay errors
      });
    } catch {
      // ignore
    }
  };

  const isMe = (msg: SessionChatMessage) =>
    msg.participantId === myParticipantId;

  return (
    <div
      className="flex flex-col bg-background border border-border rounded-xl shadow-2xl overflow-hidden"
      style={{ width: 320, maxHeight: "70vh", minHeight: 300 }}
      data-ocid="chat.panel"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-primary text-primary-foreground">
        <div>
          <p className="text-sm font-semibold">
            {targetName ? `Chat com ${targetName}` : "Chat da Sessão"}
          </p>
          <p className="text-xs opacity-75">
            Tempo real • AntiFraud real location
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded hover:bg-white/20 transition-colors"
          data-ocid="chat.close_button"
          aria-label="Fechar chat"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-3 py-3 space-y-3"
        style={{ minHeight: 0 }}
        data-ocid="chat.messages.list"
      >
        {messages.length === 0 && (
          <div
            className="flex items-center justify-center h-24"
            data-ocid="chat.messages.empty_state"
          >
            <p className="text-xs text-muted-foreground text-center">
              Sem mensagens ainda.
              <br />
              Seja o primeiro a escrever ou enviar voz.
            </p>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={msg.id}
            className={`flex flex-col gap-1 ${
              isMe(msg) ? "items-end" : "items-start"
            }`}
            data-ocid={`chat.messages.item.${idx + 1}`}
          >
            <span className="text-[10px] text-muted-foreground px-1">
              {isMe(msg) ? "Eu" : msg.participantName} ·{" "}
              {formatTime(msg.sentAt)}
            </span>

            {msg.text && (
              <div
                className={`rounded-2xl px-3 py-2 text-sm max-w-[85%] break-words ${
                  isMe(msg)
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
              >
                {msg.text}
              </div>
            )}

            {msg.audioBase64 && msg.audioMime && (
              <button
                type="button"
                onClick={() => playAudio(msg.audioBase64!, msg.audioMime!)}
                className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm ${
                  isMe(msg)
                    ? "bg-primary text-primary-foreground rounded-tr-sm"
                    : "bg-muted text-foreground rounded-tl-sm"
                }`}
                data-ocid={`chat.play_audio_button.${idx + 1}`}
              >
                <Play className="w-3 h-3" />
                <span className="text-xs">Mensagem de voz</span>
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Mic error */}
      {micError && (
        <div className="px-3 pb-1">
          <p className="text-xs text-destructive">{micError}</p>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-border px-3 py-2 flex items-center gap-2">
        {isRecording ? (
          <>
            <div className="flex-1 flex items-center gap-2 text-xs text-destructive">
              <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
              A gravar… {recordingSeconds}s
            </div>
            <Button
              size="icon"
              variant="destructive"
              className="h-8 w-8 shrink-0"
              onClick={stopRecording}
              data-ocid="chat.stop_recording_button"
            >
              <Square className="w-3 h-3" />
            </Button>
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Escreva uma mensagem…"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-ocid="chat.text_input"
              maxLength={500}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
              onClick={startRecording}
              data-ocid="chat.record_button"
              title="Gravar mensagem de voz"
            >
              <Mic className="w-4 h-4" />
            </Button>
            <Button
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={sendText}
              disabled={!inputText.trim()}
              data-ocid="chat.send_button"
            >
              <Send className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
