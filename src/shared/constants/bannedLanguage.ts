/**
 * FORBIDDEN ACCUSATORY PHRASES
 * Heritage Pulse strictly forbids any accusatory, defamatory, or legal verdict claims in UI copy.
 */
export const BANNED_PHRASES: string[] = [
  'illegal construction detected',
  'encroacher identified',
  'guilty',
  'demolition required',
  'noc absent',
  'violation confirmed',
  'criminal trespass',
  'punishable offense',
  'perpetrator named',
  'illegal occupant',
];

/**
 * Validates whether a text string contains any forbidden accusatory language.
 */
export function containsBannedLanguage(text: string): { hasViolation: boolean; matchedPhrase?: string } {
  const normalized = text.toLowerCase();
  for (const phrase of BANNED_PHRASES) {
    if (normalized.includes(phrase)) {
      return { hasViolation: true, matchedPhrase: phrase };
    }
  }
  return { hasViolation: false };
}
