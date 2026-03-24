// Pluggable provider layer for legal public-source presence checks
// Supports local dataset and future external providers (HaveIBeenPwned, PhishTank, etc.)
// Graceful degradation when no external provider is configured

import { areExternalProvidersEnabled } from "@/config/features";
import {
  type PublicContactInfo,
  lookupPublicContact,
} from "./publicContactLookup";

export interface PublicSourcePresence {
  found: boolean;
  sources: Array<{
    name: string;
    url: string;
  }>;
  info?: PublicContactInfo;
}

/**
 * Check public source presence for a contact (phone or email)
 * Uses local dataset and future external providers when configured
 */
export async function checkPublicSourcePresence(
  contact: string,
  type: "phone" | "email",
): Promise<PublicSourcePresence> {
  const sources: Array<{ name: string; url: string }> = [];
  let info: PublicContactInfo | undefined;

  // Always check local dataset (legal, same-origin)
  const localResult = await lookupPublicContact(contact, type);
  if (localResult.found && localResult.info) {
    info = localResult.info;
    if (localResult.info.sourceUrl) {
      sources.push({
        name: localResult.info.source,
        url: localResult.info.sourceUrl,
      });
    }
  }

  // Future: Check external providers when enabled and configured
  if (areExternalProvidersEnabled()) {
    // Placeholder for future HaveIBeenPwned, PhishTank, AbuseIPDB integration
    // Will be implemented when API keys/config are available
  }

  return {
    found: sources.length > 0,
    sources,
    info,
  };
}
