/**
 * Case ID Generator for Heritage Pulse
 * Format: HP-{STATE_CODE}-{YEAR}-{SEQUENCE}
 * Example: HP-MH-2026-0001
 */

export function extractSequenceNumber(caseId: string): number {
  if (!caseId) return 0;
  const match = caseId.match(/HP-[A-Za-z]+-\d+-(\d+)/i);
  if (match && match[1]) {
    return parseInt(match[1], 10);
  }
  return 0;
}

export function generateNextCaseId(stateCode: string = 'MH', existingCases: { caseId: string }[] = []): string {
  const year = new Date().getFullYear();
  let maxSeq = 0;

  if (Array.isArray(existingCases)) {
    for (const c of existingCases) {
      if (c && c.caseId) {
        const seq = extractSequenceNumber(c.caseId);
        if (seq > maxSeq) {
          maxSeq = seq;
        }
      }
    }
  }

  const nextSeq = Math.max(maxSeq + 1, 1);
  const sequenceStr = String(nextSeq).padStart(4, '0');
  return `HP-${stateCode.toUpperCase()}-${year}-${sequenceStr}`;
}

export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
