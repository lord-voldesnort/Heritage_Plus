/**
 * Case ID Generator for Heritage Pulse
 * Format: HP-{STATE_CODE}-{YEAR}-{SEQUENCE}
 * Example: HP-MH-2026-0001
 */
let sequenceCounter = 3;

export function generateNextCaseId(stateCode: string = 'MH'): string {
  sequenceCounter += 1;
  const year = new Date().getFullYear();
  const sequenceStr = String(sequenceCounter).padStart(4, '0');
  return `HP-${stateCode.toUpperCase()}-${year}-${sequenceStr}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
