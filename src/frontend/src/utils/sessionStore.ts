/**
 * SessionStore — persists location-sharing sessions in localStorage so that
 * the creator's session data can be looked up by joinToken on any device
 * that opens the invite link in the same browser / same origin.
 *
 * Extended in v2.2 to support avatarUrl per participant and chat messages.
 */

export interface SessionParticipant {
  id: string;
  name: string;
  joinedAt: number;
  location?: { lat: number; lng: number };
  /** data-URL or blob-URL of the participant's avatar/photo */
  avatarUrl?: string;
}

export interface SessionChatMessage {
  id: string;
  participantId: string;
  participantName: string;
  text?: string;
  /** base64-encoded audio */
  audioBase64?: string;
  audioMime?: string;
  sentAt: number;
}

export interface LocationSession {
  sessionId: string;
  phoneA: string;
  status: "PENDING" | "ACTIVE" | "ENDED";
  joinToken: string;
  /** numeric 6-digit code — only required for code-protected sessions */
  code?: string;
  /** whether this session requires a code to join */
  requiresCode: boolean;
  participants: SessionParticipant[];
  messages: SessionChatMessage[];
  createdAt: number;
  expiresAt: number; // createdAt + 24h
}

const LS_KEY_PREFIX = "antifraud_ls_session_";
const SS_KEY_PREFIX = "antifraud_session_"; // legacy sessionStorage key

function lsKey(joinToken: string): string {
  return `${LS_KEY_PREFIX}${joinToken}`;
}

/** Save (or update) a session to localStorage, keyed by joinToken. */
export function saveSession(session: LocationSession): void {
  try {
    localStorage.setItem(lsKey(session.joinToken), JSON.stringify(session));
  } catch {
    // storage may be full — fail silently
  }
}

/** Load a session by joinToken from localStorage (or legacy sessionStorage). */
export function getSessionByToken(joinToken: string): LocationSession | null {
  // 1. Try localStorage (new format)
  try {
    const raw = localStorage.getItem(lsKey(joinToken));
    if (raw) {
      const parsed = JSON.parse(raw) as LocationSession;
      // Expire after 24 h (minimum 1 hour)
      const minExpiry1 = parsed.createdAt + 60 * 60 * 1000;
      const effectiveExpiry1 = Math.max(parsed.expiresAt, minExpiry1);
      if (Date.now() > effectiveExpiry1) {
        localStorage.removeItem(lsKey(joinToken));
        return null;
      }
      // Ensure messages array exists (migration)
      if (!parsed.messages) parsed.messages = [];
      return parsed;
    }
  } catch {
    try {
      localStorage.removeItem(lsKey(joinToken));
    } catch {
      // ignore
    }
  }

  // 2. Fallback: legacy sessionStorage format
  try {
    const raw = sessionStorage.getItem(`${SS_KEY_PREFIX}${joinToken}`);
    if (raw) {
      const data = JSON.parse(raw);
      const migrated: LocationSession = {
        sessionId: data.sessionId ?? `session-${joinToken.slice(0, 8)}`,
        phoneA: data.phoneA ?? "",
        status: data.status ?? "PENDING",
        joinToken,
        code: data.code ?? data.numericCode ?? undefined,
        requiresCode: false,
        participants: (data.participants ?? []).map(
          (nameOrObj: string | SessionParticipant, i: number) =>
            typeof nameOrObj === "string"
              ? {
                  id: `participant-${i}`,
                  name: nameOrObj,
                  joinedAt: Date.now(),
                }
              : nameOrObj,
        ),
        messages: [],
        createdAt: Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      };
      saveSession(migrated);
      return migrated;
    }
  } catch {
    // ignore
  }

  return null;
}

/** Load a session by sessionId (scans all localStorage keys). */
export function getSessionById(sessionId: string): LocationSession | null {
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key?.startsWith(LS_KEY_PREFIX)) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const session = JSON.parse(raw) as LocationSession;
      if (session.sessionId === sessionId) {
        const minExpiry2 = session.createdAt + 60 * 60 * 1000;
        const effectiveExpiry2 = Math.max(session.expiresAt, minExpiry2);
        if (Date.now() > effectiveExpiry2) {
          localStorage.removeItem(key);
          return null;
        }
        if (!session.messages) session.messages = [];
        return session;
      }
    }
  } catch {
    // ignore
  }
  return null;
}

/** Add (or update) a participant in the session and persist. */
export function addParticipant(
  joinToken: string,
  participant: SessionParticipant,
): LocationSession | null {
  const session = getSessionByToken(joinToken);
  if (!session) return null;

  const existing = session.participants.findIndex(
    (p) => p.id === participant.id,
  );
  if (existing >= 0) {
    session.participants[existing] = {
      ...session.participants[existing],
      ...participant,
    };
  } else {
    if (session.participants.length >= 10) return null;
    session.participants.push(participant);
  }

  if (session.participants.length >= 2 && session.status === "PENDING") {
    session.status = "ACTIVE";
  }

  saveSession(session);
  return session;
}

/** Update a participant's location in the session. */
export function updateParticipantLocation(
  sessionId: string,
  participantId: string,
  location: { lat: number; lng: number },
): void {
  const session = getSessionById(sessionId);
  if (!session) return;
  const idx = session.participants.findIndex((p) => p.id === participantId);
  if (idx >= 0) {
    session.participants[idx].location = location;
    saveSession(session);
  }
}

/** Update a participant's avatar URL. */
export function updateParticipantAvatar(
  sessionId: string,
  participantId: string,
  avatarUrl: string,
): void {
  const session = getSessionById(sessionId);
  if (!session) return;
  const idx = session.participants.findIndex((p) => p.id === participantId);
  if (idx >= 0) {
    session.participants[idx].avatarUrl = avatarUrl;
    saveSession(session);
  }
}

/** Add a chat message to a session. */
export function addChatMessage(
  sessionId: string,
  msg: Omit<SessionChatMessage, "id" | "sentAt">,
): void {
  const session = getSessionById(sessionId);
  if (!session) return;
  const full: SessionChatMessage = {
    ...msg,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    sentAt: Date.now(),
  };
  if (!session.messages) session.messages = [];
  session.messages = [...session.messages, full].slice(-200);
  saveSession(session);
}

/** Mark a session as ENDED. */
export function endSession(joinToken: string): void {
  const session = getSessionByToken(joinToken);
  if (!session) return;
  session.status = "ENDED";
  saveSession(session);
}

/** Delete a session from localStorage. */
export function deleteSession(joinToken: string): void {
  try {
    localStorage.removeItem(lsKey(joinToken));
  } catch {
    // ignore
  }
}
