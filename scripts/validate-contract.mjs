#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productRulesPath = path.resolve(__dirname, '../project/PRODUCT_RULES.json');
const productRules = JSON.parse(fs.readFileSync(productRulesPath, 'utf-8'));
const forbiddenPhrases = productRules.forbiddenPhrases.map(p => p.toLowerCase());

const srcDir = path.resolve(__dirname, '../src');

let violations = [];

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx') || entry.name.endsWith('.js') || entry.name.endsWith('.jsx'))) {
      // Skip the bannedLanguage definition file itself
      if (entry.name === 'bannedLanguage.ts' || entry.name === 'bannedLanguage.test.ts') continue;

      const content = fs.readFileSync(fullPath, 'utf-8').toLowerCase();
      forbiddenPhrases.forEach(phrase => {
        if (content.includes(phrase)) {
          violations.push({
            file: path.relative(path.resolve(__dirname, '..'), fullPath),
            phrase: phrase
          });
        }
      });
    }
  }
}

console.log('Scanning source code (/src) for banned accusatory language...');
scanDirectory(srcDir);

if (violations.length > 0) {
  console.error('\x1b[31m[CONTRACT VIOLATION]\x1b[0m Found forbidden accusatory strings in source code:');
  violations.forEach(v => {
    console.error(` ✖ File: ${v.file} contains banned phrase: "${v.phrase}"`);
  });
  console.error('\nHeritage Pulse strictly forbids accusatory terminology in UI strings.');
  process.exit(1);
} else {
  console.log('\x1b[32m✔ CONTRACT VALIDATION PASSED: Zero forbidden accusatory phrases found in /src.\x1b[0m');
  process.exit(0);
}
