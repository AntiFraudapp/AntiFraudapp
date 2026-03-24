export interface HistoryItem {
  type: "phone" | "crypto" | "message" | "email";
  input: string;
  timestamp: number;
  result?: string;
}

export interface UserProfile {
  history: HistoryItem[];
  preferredLanguage?: string;
}

const STORAGE_KEY_PREFIX = "antifraud_user_";
const CONSENT_KEY = "antifraud_consent";
const LOOKUP_CACHE_KEY = "antifraud_contact_lookup_cache";

export function getUserProfile(principal: string): UserProfile {
  try {
    const key = `${STORAGE_KEY_PREFIX}${principal}`;
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading user profile:", error);
  }
  return { history: [] };
}

export function saveUserProfile(principal: string, profile: UserProfile): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${principal}`;
    localStorage.setItem(key, JSON.stringify(profile));
  } catch (error) {
    console.error("Error saving user profile:", error);
  }
}

export function clearUserProfile(principal: string): void {
  try {
    const key = `${STORAGE_KEY_PREFIX}${principal}`;
    localStorage.removeItem(key);
  } catch (error) {
    console.error("Error clearing user profile:", error);
  }
}

export function clearAllUserData(): void {
  try {
    // Clear all user profile keys
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }

    // Clear lookup cache
    localStorage.removeItem(LOOKUP_CACHE_KEY);

    // Note: We don't clear consent or language preference
    // as those are user settings, not history data
  } catch (error) {
    console.error("Error clearing all user data:", error);
  }
}

export function clearConsentData(): void {
  try {
    localStorage.removeItem(CONSENT_KEY);
  } catch (error) {
    console.error("Error clearing consent data:", error);
  }
}
