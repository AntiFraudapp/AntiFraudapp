#!/usr/bin/env node

/**
 * Live Integration Completion Wrapper
 * 
 * This wrapper script runs the restart integration script and, only if successful,
 * emits the exact single-line success message to stdout.
 * 
 * This provides a deterministic 'final completion response' mechanism for automation.
 */

import { spawn } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const restartScriptPath = join(__dirname, 'restart-live-integration.mjs');

/**
 * Run the restart integration script and capture output
 */
function runRestartIntegration() {
  return new Promise((resolve, reject) => {
    const child = spawn('node', [restartScriptPath], {
      stdio: ['inherit', 'pipe', 'inherit']
    });

    let stdout = '';

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(`Integration restart failed with exit code ${code}`));
      }
    });

    child.on('error', (err) => {
      reject(err);
    });
  });
}

/**
 * Main execution
 */
async function main() {
  try {
    const output = await runRestartIntegration();
    
    // Only output the exact completion message if present
    if (output === 'Módulo live integrado.') {
      console.log('Módulo live integrado.');
      process.exit(0);
    } else {
      console.error('[ERROR] Unexpected output from integration restart script');
      console.error('Expected: "Módulo live integrado."');
      console.error(`Got: "${output}"`);
      process.exit(1);
    }
  } catch (err) {
    console.error('[ERROR] Integration restart failed:');
    console.error(err.message);
    process.exit(1);
  }
}

main();
