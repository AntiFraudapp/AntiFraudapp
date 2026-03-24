# Republish Draft to Production Runbook

This runbook provides step-by-step instructions for republishing the current draft version to production at https://antifraudapp.com.

## Prerequisites

- [ ] Draft Version 73 rollback verification checklist completed (see `ROLLBACK_VERIFICATION_CHECKLIST_DRAFT_73.md`)
- [ ] All tests passing
- [ ] No known critical bugs
- [ ] Backup of current production version available
- [ ] Access to deployment environment
- [ ] DFX CLI installed and configured

## Terminology

- **Draft**: The current development version being prepared for production
- **Live/Production**: The deployed version accessible at https://antifraudapp.com

## Step 1: Pre-Deployment Verification

### 1.1 Verify Draft Version 73 Rollback
