# AntiFraud Live Canister Links

This document contains the live ICP canister URLs for all 5 deployed AntiFraud canisters, plus the production custom domain.

## Production Custom Domain

### Primary Production URL
- **Custom Domain:** https://antifraudapp.com
- **WWW Subdomain:** https://www.antifraudapp.com
- **Purpose:** Primary production URL for end users
- **Status:** Active (DNS configured)

## Deployed Canisters

### 1. Main Canister (Frontend/UI)
- **Canister ID:** `v63rh-lqaaa-aaaaa-qewvq-cai`
- **Live URL:** https://v63rh-lqaaa-aaaaa-qewvq-cai.icp0.io
- **Custom Domain:** https://antifraudapp.com
- **Purpose:** Frontend application and main UI

### 2. Extra Canister (Crypto Checks)
- **Canister ID:** `c6sjf-tqaaa-aaaap-qsiea-cai`
- **Live URL:** https://c6sjf-tqaaa-aaaap-qsiea-cai.icp0.io
- **Purpose:** Cryptocurrency address verification and checks

### 3. Denúncias Canister (Report System)
- **Canister ID:** `7w5qg-6aaaa-aaaab-ael4a-cai`
- **Live URL:** https://7w5qg-6aaaa-aaaab-ael4a-cai.icp0.io
- **Purpose:** User report submission and collaborative database

### 4. Contact-Lookup Canister (Phone Validation)
- **Canister ID:** `ezroe-caaaa-aaaac-bcdeq-cai`
- **Live URL:** https://ezroe-caaaa-aaaac-bcdeq-cai.icp0.io
- **Purpose:** International phone number validation and lookup

### 5. Public-Data Canister (Blacklists)
- **Canister ID:** `e2m3q-yqaaa-aaaas-qekva-cai`
- **Live URL:** https://e2m3q-yqaaa-aaaas-qekva-cai.icp0.io
- **Purpose:** Public blacklists and data sources

## Testing

### Custom Domain Testing
You can access the production app via:
- https://antifraudapp.com (primary)
- https://www.antifraudapp.com (www subdomain)

### Canister URL Testing
You can access any canister URL directly in your browser to verify the canister is live and responding:
- Main frontend: https://v63rh-lqaaa-aaaaa-qewvq-cai.icp0.io

## Integration

All canister IDs are configured in `frontend/src/ic/canisterIds.ts` and are automatically used by the application's actor initialization system.

## DNS Configuration

DNS records for antifraudapp.com are configured as documented in `DNS_SETUP_ANTIFRAUDAPP_COM.md`:
- CNAME record: www.antifraudapp.com → v63rh-lqaaa-aaaaa-qewvq-cai.icp0.io
- A record: antifraudapp.com → 18.184.130.250

## Notes

- The custom domain (antifraudapp.com) is the primary production URL
- The canister URL (icp0.io) remains available as a fallback
- Both URLs serve the same application content
- PWA installation works on both URLs
- Deep links work on both URLs (e.g., /verify-global-phone)
