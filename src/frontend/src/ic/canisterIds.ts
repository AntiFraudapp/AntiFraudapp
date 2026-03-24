/**
 * Single source of truth for all AntiFraud canister IDs.
 * Main canister: message analysis and core functionality
 * Extra canister: phone and crypto lookups
 * Reports canister: user-submitted reports and collaborative database
 * Denuncias canister: reports via ICP actor (same ID as reports)
 * ContactLookup canister: international contact validation
 * PublicData canister: public blacklists and data sources
 * Location canister: secure real-time location sharing
 */

export const CANISTER_IDS = {
  main: "v63rh-lqaaa-aaaaa-qewvq-cai",
  extra: "c6sjf-tqaaa-aaaap-qsiea-cai",
  reports: "7w5qg-6aaaa-aaaab-ael4a-cai",
  denuncias: "7w5qg-6aaaa-aaaab-ael4a-cai",
  contactLookup: "ezroe-caaaa-aaaac-bcdeq-cai",
  publicData: "e2m3q-yqaaa-aaaas-qekva-cai",
  location: "sodv3-uiaaa-aaaak-qxubq-cai",
} as const;

export type CanisterType = keyof typeof CANISTER_IDS;

export function getCanisterId(type: CanisterType): string {
  return CANISTER_IDS[type];
}
