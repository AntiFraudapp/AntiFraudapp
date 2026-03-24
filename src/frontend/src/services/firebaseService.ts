/**
 * Firebase Realtime Database service for Sala Segura
 * Uses Firebase REST API directly (no SDK dependency required)
 */

// ─── Firebase Config ──────────────────────────────────────────────────────────
const FIREBASE_DB_URL =
  "https://antifraudapp-sala-segura-default-rtdb.europe-west1.firebasedatabase.app";

export const FIREBASE_CONFIGURED = true;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface RoomParticipant {
  id: string;
  name: string;
  lat: number | null;
  lng: number | null;
  updatedAt: number;
  color: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
}

export interface Room {
  id: string;
  hostId: string;
  createdAt: number;
  expiresAt: number;
  participants: Record<string, RoomParticipant>;
  messages: Record<string, ChatMessage>;
}

const PARTICIPANT_COLORS = [
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

function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

export function getParticipantColor(index: number): string {
  return PARTICIPANT_COLORS[index % PARTICIPANT_COLORS.length];
}

async function dbGet<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`);
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function dbSet(path: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function dbUpdate(path: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function dbPush(path: string, data: unknown): Promise<string | null> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { name: string };
    return json.name;
  } catch {
    return null;
  }
}

async function dbDelete(path: string): Promise<boolean> {
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/${path}.json`, {
      method: "DELETE",
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Room Operations ──────────────────────────────────────────────────────────
export async function createRoom(
  hostId: string,
  hostName: string,
): Promise<string> {
  const roomId = generateRoomId();
  const now = Date.now();
  const expiresAt = now + 24 * 60 * 60 * 1000; // 24 hours

  await dbSet(`salas/${roomId}`, {
    id: roomId,
    hostId,
    createdAt: now,
    expiresAt,
    participants: {
      [hostId]: {
        id: hostId,
        name: hostName,
        lat: null,
        lng: null,
        updatedAt: now,
        color: PARTICIPANT_COLORS[0],
      },
    },
    messages: {},
  });

  return roomId;
}

export async function joinRoom(
  roomId: string,
  participantId: string,
  participantName: string,
): Promise<{ success: boolean; error?: string }> {
  const room = await dbGet<Room>(`salas/${roomId}`);

  if (!room) {
    return { success: false, error: "Sala não encontrada" };
  }

  if (Date.now() > room.expiresAt) {
    return { success: false, error: "Sala expirada" };
  }

  const participants = room.participants || {};
  const count = Object.keys(participants).length;
  if (count >= 10 && !participants[participantId]) {
    return { success: false, error: "Sala cheia (máx. 10 participantes)" };
  }

  const colorIndex = Object.keys(participants).length;
  await dbSet(`salas/${roomId}/participants/${participantId}`, {
    id: participantId,
    name: participantName,
    lat: null,
    lng: null,
    updatedAt: Date.now(),
    color: PARTICIPANT_COLORS[colorIndex % PARTICIPANT_COLORS.length],
  });

  return { success: true };
}

export async function updateLocation(
  roomId: string,
  participantId: string,
  lat: number,
  lng: number,
): Promise<void> {
  try {
    await dbUpdate(`salas/${roomId}/participants/${participantId}`, {
      lat,
      lng,
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.error("updateLocation failed:", e);
  }
}

export async function sendChatMessage(
  roomId: string,
  senderId: string,
  senderName: string,
  text: string,
): Promise<void> {
  try {
    await dbPush(`salas/${roomId}/messages`, {
      senderId,
      senderName,
      text,
      timestamp: Date.now(),
    });
  } catch {
    // silent
  }
}

// ─── Real-time subscription via polling ──────────────────────────────────────
export function subscribeToRoom(
  roomId: string,
  callback: (room: Room | null) => void,
): () => void {
  let active = true;

  const poll = async () => {
    if (!active) return;
    const room = await dbGet<Room>(`salas/${roomId}`);
    if (active) callback(room);
  };

  // Initial fetch
  poll();

  // Poll every 3 seconds for near-real-time updates
  const interval = setInterval(poll, 3000);

  return () => {
    active = false;
    clearInterval(interval);
  };
}

export async function leaveRoom(
  roomId: string,
  participantId: string,
): Promise<void> {
  try {
    await dbDelete(`salas/${roomId}/participants/${participantId}`);
  } catch {
    // silent
  }
}
