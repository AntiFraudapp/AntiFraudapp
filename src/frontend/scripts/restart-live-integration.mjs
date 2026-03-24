#!/usr/bin/env node

/**
 * Live Integration Restart Script
 * 
 * This script performs clean, repeatable build preparation for production deployment.
 * It verifies all critical files and ensures the build is ready for deployment.
 * 
 * For Draft 73 rollback: This script must not introduce changes beyond the rollback.
 * Complete the Draft 73 rollback verification checklist before running this script.
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkFile(filePath, description) {
  const fullPath = join(projectRoot, filePath);
  if (existsSync(fullPath)) {
    log(`✓ ${description}`, 'green');
    return true;
  } else {
    log(`✗ ${description} - Missing: ${filePath}`, 'red');
    return false;
  }
}

async function main() {
  log('\n=== Live Integration Restart Verification ===\n', 'blue');

  // Check if this is a Draft 73 rollback
  const rollbackChecklistPath = join(projectRoot, 'ROLLBACK_VERIFICATION_CHECKLIST_DRAFT_73.md');
  if (existsSync(rollbackChecklistPath)) {
    log('⚠ Draft 73 rollback detected', 'yellow');
    log('⚠ Ensure rollback verification checklist is complete before proceeding', 'yellow');
    log('⚠ See: ROLLBACK_VERIFICATION_CHECKLIST_DRAFT_73.md\n', 'yellow');
  }

  let allChecksPass = true;

  // Critical build files
  log('Checking critical build files...', 'blue');
  allChecksPass &= checkFile('dist/index.html', 'index.html');
  allChecksPass &= checkFile('dist/service-worker.js', 'service-worker.js');
  allChecksPass &= checkFile('dist/manifest.webmanifest', 'manifest.webmanifest');

  // Custom domain configuration
  log('\nChecking custom domain configuration...', 'blue');
  allChecksPass &= checkFile('dist/.well-known/ic-domains', 'ic-domains (custom domain)');

  // PWA assets
  log('\nChecking PWA assets...', 'blue');
  allChecksPass &= checkFile('dist/assets/generated/antifraud-icon.dim_192x192.png', 'PWA icon 192x192');
  allChecksPass &= checkFile('dist/assets/generated/antifraud-icon.dim_512x512.png', 'PWA icon 512x512');

  // SPA fallback
  log('\nChecking SPA configuration...', 'blue');
  allChecksPass &= checkFile('dist/404.html', '404.html (SPA fallback)');

  // Verification summary
  log('\n=== Verification Summary ===\n', 'blue');

  if (allChecksPass) {
    log('✓ All checks passed', 'green');
    log('✓ Build is ready for deployment', 'green');
    log('\nNext steps:', 'blue');
    log('1. Review PRODUCTION_BUILD_VERIFICATION.md', 'yellow');
    log('2. Deploy: dfx deploy frontend --network ic', 'yellow');
    log('3. Verify: https://antifraudapp.com\n', 'yellow');
    
    // Emit success message for automation
    console.log('Módulo live integrado.');
    process.exit(0);
  } else {
    log('✗ Some checks failed', 'red');
    log('✗ Build is NOT ready for deployment', 'red');
    log('\nPlease fix the issues above and rebuild:\n', 'yellow');
    log('  pnpm build\n', 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n✗ Error: ${error.message}`, 'red');
  process.exit(1);
});
