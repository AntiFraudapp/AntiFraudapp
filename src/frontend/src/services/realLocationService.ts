/**
 * realLocationService.ts
 *
 * Service layer for AntiFraud real location canister (sodv3-uiaaa-aaaak-qxubq-cai).
 *
 * Since the canister does not have a Candid binding in this project, we use
 * localStorage as the shared data store for same-origin communication
 * (same browser / same device testing), with the architecture designed so
 * a real canister HTTP query/update endpoint can be plugged in later.
 *
 * The service stores session state under a well-known key prefix so all
 * open tabs/participants on the same device see updates immediately.
 */

export const REAL_LOCATION_CANISTER_ID = "sodv3-uiaaa-aaaak-qxubq-cai";

// ─── Data types ───────────────────────────────────────────────────────────────

export interface RLParticipant {
  id: string;
  name: string;
  avatarUrl?: string; // data-URL or blob URL
  lat?: number;
  lng?: number;
  lastSeen: number; // unix ms
}

export interface RLChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  text?: string;
  audioBase64?: string; // base64-encoded audio blob
  audioMime?: string;
  sentAt: number; // unix ms
}

export interface RLSession {
  sessionId: string;
  status: "PENDING" | "ACTIVE" | "ENDED";
  participants: RLParticipant[];
  messages: RLChatMessage[];
  createdAt: number;
  expiresAt: number;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const RL_PREFIX = "rl_session_";

function rlKey(sessionId: string): string {
  return `${RL_PREFIX}${sessionId}`;
}

function readSession(sessionId: string): RLSession | null {
  try {
    const raw = localStorage.getItem(rlKey(sessionId));
    if (!raw) return null;
    const s = JSON.parse(raw) as RLSession;
    if (Date.now() > s.expiresAt) {
      localStorage.removeItem(rlKey(sessionId));
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

function writeSession(session: RLSession): void {
  try {
    localStorage.setItem(rlKey(session.sessionId), JSON.stringify(session));
  } catch {
    // storage full — silent
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Create or reset a session in the real-location store. */
export function rlCreateSession(sessionId: string): RLSession {
  const now = Date.now();
  const session: RLSession = {
    sessionId,
    status: "PENDING",
    participants: [],
    messages: [],
    createdAt: now,
    expiresAt: now + 24 * 60 * 60 * 1000,
  };
  writeSession(session);
  return session;
}

/** Upsert participant data (location + avatar). */
export function rlUpdateParticipant(
  sessionId: string,
  participant: Omit<RLParticipant, "lastSeen">,
): void {
  const session = readSession(sessionId);
  if (!session) return;

  const idx = session.participants.findIndex((p) => p.id === participant.id);
  const updated: RLParticipant = { ...participant, lastSeen: Date.now() };

  if (idx >= 0) {
    session.participants[idx] = { ...session.participants[idx], ...updated };
  } else {
    if (session.participants.length >= 10) return;
    session.participants.push(updated);
  }

  if (session.participants.length >= 2 && session.status === "PENDING") {
    session.status = "ACTIVE";
  }

  writeSession(session);
}

/** Read all participants from a session. */
export function rlGetParticipants(sessionId: string): RLParticipant[] {
  return readSession(sessionId)?.participants ?? [];
}

/** Send a chat message to the session. */
export function rlSendMessage(
  sessionId: string,
  msg: Omit<RLChatMessage, "id" | "sentAt">,
): void {
  const session = readSession(sessionId);
  if (!session) return;

  const full: RLChatMessage = {
    ...msg,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sentAt: Date.now(),
  };

  // Keep last 200 messages
  session.messages = [...session.messages, full].slice(-200);
  writeSession(session);
}

/** Read all chat messages in a session. */
export function rlGetMessages(sessionId: string): RLChatMessage[] {
  return readSession(sessionId)?.messages ?? [];
}

/** Mark a session as ENDED and remove participant data. */
export function rlEndSession(sessionId: string): void {
  const session = readSession(sessionId);
  if (!session) return;
  session.status = "ENDED";
  session.participants = [];
  session.messages = [];
  writeSession(session);
}

/** Get session status. */
export function rlGetStatus(sessionId: string): RLSession["status"] | null {
  return readSession(sessionId)?.status ?? null;
}

/** Ensure a session entry exists (idempotent). */
export function rlEnsureSession(sessionId: string): void {
  if (!readSession(sessionId)) {
    rlCreateSession(sessionId);
  }
}
