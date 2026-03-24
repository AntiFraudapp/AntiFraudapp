# Live Integration Restart Runbook

This runbook provides step-by-step instructions for restarting the live integration after code changes.

## Important: Draft Rollback Workflow

**Before executing this runbook for a Draft 73 rollback:**

1. **Complete the Draft 73 Rollback Verification Checklist**
   - See `ROLLBACK_VERIFICATION_CHECKLIST_DRAFT_73.md`
   - Ensure all verification steps are completed
   - Confirm code matches Draft 73 exactly

2. **Review the Republish Draft Runbook**
   - See `REPUBLISH_DRAFT_RUNBOOK.md`
   - Understand the full republish workflow
   - Follow deployment best practices

3. **Verify Production Build**
   - See `PRODUCTION_BUILD_VERIFICATION.md`
   - Complete all verification steps
   - Ensure no post-73 changes remain

**This runbook must not introduce changes beyond the rollback.**

---

## Prerequisites

- [ ] Node.js 18+ installed
- [ ] pnpm installed
- [ ] DFX CLI installed and configured
- [ ] Access to Internet Computer mainnet
- [ ] Sufficient cycles in wallet
- [ ] Draft 73 rollback verification complete (if applicable)

## Step 1: Clean Environment

