# Android WebAPK Installation Testing Checklist

This document provides step-by-step instructions for testing PWA installation on Android devices using Chrome.

## Prerequisites

- Android device (phone or tablet) running Android 5.0 or higher
- Google Chrome browser installed and updated to latest version
- Internet connection

## Quick Access QR Code

A QR code is available at `frontend/public/assets/generated/antifraud-android-test-qr.dim_768x768.png` that encodes the production app URL. You can:

1. Open the QR code image on your computer
2. Scan it with your Android device's camera or QR code reader
3. Open the link in Chrome to quickly access the app for testing

## Manual Testing Procedure

### Step 1: Open the App in Chrome
1. Open Google Chrome on your Android device
2. Navigate to: **https://antifraudapp.com**
   (Fallback canister URL: https://v63rh-lqaaa-aaaaa-qewvq-cai.icp0.io)
3. Wait for the page to fully load

### Step 2: Trigger Install Prompt
Chrome will automatically show an install banner if the PWA meets all criteria. Alternatively:

1. Tap the **three-dot menu** (⋮) in the top-right corner of Chrome
2. Look for **"Install app"** or **"Add to Home screen"** option
3. Tap the install option

### Step 3: Confirm Installation
1. A dialog will appear showing the app name "AntiFraud" and icon
2. Review the permissions (if any)
3. Tap **"Install"** or **"Add"** to confirm

### Step 4: Verify Installation
1. Check your device's home screen for the AntiFraud icon
2. The icon should match the official shield design
3. Tap the icon to launch the app

### Step 5: Test Installed App
1. App should open in standalone mode (no browser UI)
2. Test offline functionality:
   - Enable airplane mode
   - Close and reopen the app
   - Verify the app still loads and basic features work
3. Test the "Verify Global Phone" feature offline
4. Disable airplane mode and verify online features work

## Expected Outcomes

### ✅ Success Criteria
- Install prompt appears in Chrome menu
- App installs successfully to home screen
- Icon displays correctly with shield design
- App launches in standalone mode (no browser chrome)
- App works offline for cached content
- Phone validation works offline
- Fixed install button appears when eligible
- Install suggestion prompt appears with cooldown logic

### ❌ Failure Indicators
- No install option in Chrome menu
- Installation fails or shows error
- Icon doesn't appear on home screen
- App opens in browser instead of standalone
- App doesn't work offline

## Troubleshooting

If installation fails:
1. Ensure Chrome is updated to the latest version
2. Clear Chrome cache and try again
3. Verify the manifest.webmanifest is loading correctly
4. Check that service worker is registered (Chrome DevTools → Application → Service Workers)
5. Ensure HTTPS is working (required for PWA)
6. Verify custom domain DNS is properly configured

## Testing Checklist

- [ ] QR code scans correctly and opens app URL (https://antifraudapp.com)
- [ ] Install prompt appears in Chrome
- [ ] Fixed install button appears in bottom-right corner
- [ ] Install suggestion modal appears when eligible
- [ ] Installation completes successfully
- [ ] Icon appears on home screen with correct design
- [ ] App launches in standalone mode
- [ ] Offline mode works (airplane mode test)
- [ ] Phone validation works offline
- [ ] App reconnects when back online

## Notes

- iOS uses a different installation method (Safari → Share → Add to Home Screen)
- WebAPK installation is Android-specific and provides the best PWA experience
- The install prompt may not appear immediately; Chrome evaluates engagement signals
- Users can manually trigger installation via Chrome menu at any time
- The fixed install button and suggestion prompt provide additional install entry points

## Support

For issues specific to the AntiFraud app, contact: suporte.antifraud@gmail.com
