export interface StatusMetadata {
  id: string;
  label: string;
  isTerminal: boolean;
}

const STATUSES: StatusMetadata[] = [
  { id: 'DRAFT', label: 'Draft (Pending Submission)', isTerminal: false },
  { id: 'SUBMITTED_FOR_REVIEW', label: 'Submitted for Review', isTerminal: false },
  { id: 'ADDITIONAL_INFORMATION_NEEDED', label: 'Additional Information Needed', isTerminal: false },
  { id: 'FIELD_VERIFICATION_RECOMMENDED', label: 'Field Verification Recommended', isTerminal: false },
  { id: 'REFERRED', label: 'Referred to Competent Authority', isTerminal: true },
  { id: 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE', label: 'Closed (Insufficient Location Evidence)', isTerminal: true },
  { id: 'CLOSED_DUPLICATE', label: 'Closed (Duplicate / Unrelated)', isTerminal: true },
  { id: 'CLOSED_REVIEWED', label: 'Closed (Reviewed)', isTerminal: true },
];

export const CASE_STATUSES = new Map(STATUSES.map((s) => [s.id, s]));

const CLOSED_STATUSES = new Set([
  'CLOSED_REVIEWED',
  'CLOSED_DUPLICATE',
  'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
]);

const CLOSURE_ACTIONS = new Set([
  'CLOSED_REVIEWED',
  'CLOSED_DUPLICATE',
  'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
]);

export function isClosedStatus(status: string): boolean {
  return CLOSED_STATUSES.has(status);
}

export function isClosureAction(action: string): boolean {
  return CLOSURE_ACTIONS.has(action);
}
