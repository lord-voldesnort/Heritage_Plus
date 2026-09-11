#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const gateStatusPath = path.resolve(__dirname, '../project/GATE_STATUS.json');

if (!fs.existsSync(gateStatusPath)) {
  console.error('\x1b[31m[ERROR] project/GATE_STATUS.json not found!\x1b[0m');
  process.exit(1);
}

const rawData = fs.readFileSync(gateStatusPath, 'utf-8');
const { geometryGate } = JSON.parse(rawData);

console.log('\n======================================================================');
console.log('            HERITAGE PULSE: GEOMETRY GO/NO-GO GATE CHECK              ');
console.log('======================================================================\n');

if (geometryGate.status === 'PASSED' || geometryGate.status === 'PASSED_WITH_LIMITATIONS') {
  console.log(`\x1b[32m✔ GEOMETRY GATE STATUS: ${geometryGate.status}\x1b[0m`);
  console.log(`• Target Site: ${geometryGate.targetSite}`);
  console.log(`• Source Document/URL: ${geometryGate.sourceUrl}`);
  console.log(`• Source Date: ${geometryGate.sourceDate}`);
  console.log(`• Test Points Validated: ${geometryGate.testPointsValidated}`);
  console.log(`• Degraded GPS Handled: ${geometryGate.poorGpsHandled}`);
  if (geometryGate.bhuvanVersionStatement) {
    console.log(`• Limitation Statement: ${geometryGate.bhuvanVersionStatement}`);
  }
  console.log(`• Passed By: ${geometryGate.passedBy} at ${geometryGate.passedAt}`);
  console.log('\n\x1b[32mSpatial & Map development tasks (SPATIAL-*, UI-02, LEDGER-01) are UNBLOCKED.\x1b[0m\n');
  process.exit(0);
} else {
  console.log('\x1b[31m✖ GEOMETRY GATE STATUS: NOT_PASSED (GATE-01 ACTIVE)\x1b[0m\n');
  console.log('The following gate sub-conditions must be fulfilled before spatial work begins:');

  const issues = [];
  if (!geometryGate.targetSite) issues.push('Target site not defined (select exactly one site, e.g. Shivneri Fort)');
  if (!geometryGate.sourceUrl) issues.push('Source geometry document/URL not recorded');
  if (!geometryGate.sourceDate) issues.push('Source publication/capture date not recorded');
  if (!geometryGate.testPointsValidated) issues.push('Test coordinates (Inside, Outside, Near-Edge) not yet validated');
  if (!geometryGate.poorGpsHandled) issues.push('Degraded GPS uncertainty handling not yet verified');

  issues.forEach((issue, idx) => {
    console.log(`  ${idx + 1}. [ \x1b[31mUNMET\x1b[0m ] ${issue}`);
  });

  console.log('\n\x1b[33m[NOTICE] Tasks SPATIAL-01, SPATIAL-02, SPATIAL-03, UI-02, and LEDGER-01 are currently BLOCKED.\x1b[0m');
  console.log('Run task GATE-01 (Ameya + Vishwajeet) to resolve this gate.\n');
  process.exit(1);
}
