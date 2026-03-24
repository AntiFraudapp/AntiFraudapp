# Draft Version 73 Rollback Verification Checklist

This checklist ensures the codebase has been successfully restored to Draft Version 73 state before republishing to production.

## Pre-Rollback Verification

- [ ] Confirm Draft Version 73 source code is available for comparison
- [ ] Document all known working features in Draft 73
- [ ] Backup current version before rollback
- [ ] Review all changes made after Draft 73 (versions 74-89)

## Code Restoration Verification

### Core Application Files
- [ ] `frontend/src/App.tsx` - Routing and app shell match Draft 73
- [ ] `frontend/src/components/AppLayout.tsx` - Header/navigation/layout match Draft 73
- [ ] `frontend/src/pages/HomePage.tsx` - Home page UI/flow match Draft 73
- [ ] `frontend/src/components/AdvancedContactLookup.tsx` - Lookup behavior matches Draft 73
- [ ] `frontend/src/components/Footer.tsx` - Footer branding/wording matches Draft 73

### Asset References
- [ ] Header logo references correct asset (PNG vs SVG)
- [ ] All icon references point to existing generated assets
- [ ] Portugal flag asset is correctly referenced
- [ ] PWA manifest icons are correctly referenced

### Route Configuration
- [ ] All Draft 73 routes are present and functional
- [ ] No post-73 route aliases or normalization logic remains
- [ ] Navigation between pages works correctly
- [ ] Deep links resolve correctly

## Build Verification

- [ ] Clean install: `rm -rf node_modules && pnpm install`
- [ ] TypeScript compilation: `pnpm typescript-check` passes with no errors
- [ ] Production build: `pnpm build` completes successfully
- [ ] Build output contains all required assets
- [ ] Service worker is generated correctly
- [ ] No console errors during build

## Functional Verification

### Navigation & App Shell
- [ ] Home page (`/`) loads correctly
- [ ] Mission page (`/mission`) loads correctly
- [ ] How It Works page (`/how-it-works`) loads correctly
- [ ] Terms page (`/terms`) loads correctly
- [ ] Privacy page (`/privacy`) loads correctly
- [ ] Documentation page (`/documentation`) loads correctly
- [ ] International Contact Search page loads correctly
- [ ] Public Services page loads correctly
- [ ] Verify Global Phone page loads correctly
- [ ] Admin Terms page loads correctly (when authenticated as admin)

### Header & Footer
- [ ] Logo displays correctly
- [ ] Portugal flag displays correctly
- [ ] Navigation links work
- [ ] Language selector works
- [ ] Auth control displays correctly
- [ ] Mobile menu works
- [ ] Footer displays all seals correctly
- [ ] Footer support email link works

### Core Features (Home Page)
- [ ] Message analysis tab works
- [ ] Email verification tab works
- [ ] Phone verification tab works
- [ ] Crypto verification tab works
- [ ] Advanced lookup tab works
- [ ] Results display correctly
- [ ] Error messages display correctly

### Authentication & Authorization
- [ ] Login flow works
- [ ] Logout flow works
- [ ] User profile setup works
- [ ] Admin access control works
- [ ] Guest access works correctly

### PWA Functionality
- [ ] Service worker registers correctly
- [ ] App is installable
- [ ] Install prompt appears when eligible
- [ ] Offline functionality works
- [ ] App shell caching works

### Internationalization
- [ ] Language selector displays all languages
- [ ] Language switching works
- [ ] All UI strings are translated
- [ ] Portuguese is default language
- [ ] Fallback to Portuguese works for missing keys

## Regression Prevention

- [ ] No post-73 features are present
- [ ] No post-73 bug fixes are accidentally removed
- [ ] No post-73 route changes remain
- [ ] No post-73 asset references remain
- [ ] No post-73 UI changes remain

## Pre-Republish Final Checks

- [ ] All checklist items above are verified
- [ ] Local development server runs without errors
- [ ] Production build runs without errors
- [ ] No console errors in browser
- [ ] All critical user flows tested
- [ ] Rollback is confirmed to match Draft 73 exactly

## Sign-Off

- [ ] Developer verification complete
- [ ] QA verification complete (if applicable)
- [ ] Ready for production republish

**Date:** _______________
**Verified by:** _______________
**Notes:** _______________

---

## Important Notes

1. This checklist must be completed BEFORE executing the republish workflow
2. Any failures must be resolved before proceeding
3. Document any deviations from Draft 73 in the Notes section
4. Keep this checklist with the deployment documentation
