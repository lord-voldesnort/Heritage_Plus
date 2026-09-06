import { CaseStatus } from '../types';

export interface StatusMetadata {
  id: CaseStatus;
  label: string;
  badgeVariant: 'default' | 'amber' | 'emerald' | 'blue' | 'purple' | 'slate';
  description: string;
  isTerminal: boolean;
}

export const CASE_STATUSES: Record<CaseStatus, StatusMetadata> = {
  DRAFT: {
    id: 'DRAFT',
    label: 'Draft (Pending Submission)',
    badgeVariant: 'slate',
    description: 'Observation captured locally on device.',
    isTerminal: false,
  },
  SUBMITTED_FOR_REVIEW: {
    id: 'SUBMITTED_FOR_REVIEW',
    label: 'Submitted for Review',
    badgeVariant: 'blue',
    description: 'Case logged into Change Ledger; awaiting curator triage.',
    isTerminal: false,
  },
  ADDITIONAL_INFORMATION_NEEDED: {
    id: 'ADDITIONAL_INFORMATION_NEEDED',
    label: 'Additional Information Needed',
    badgeVariant: 'amber',
    description: 'Reviewer requested higher precision GPS or clearer photo.',
    isTerminal: false,
  },
  FIELD_VERIFICATION_RECOMMENDED: {
    id: 'FIELD_VERIFICATION_RECOMMENDED',
    label: 'Field Verification Recommended',
    badgeVariant: 'purple',
    description: 'Case flagged for on-ground physical inspection.',
    isTerminal: false,
  },
  REFERRED: {
    id: 'REFERRED',
    label: 'Referred to Competent Authority',
    badgeVariant: 'emerald',
    description: 'Evidence packet compiled and forwarded to official authority.',
    isTerminal: true,
  },
  CLOSED_INSUFFICIENT_LOCATION_EVIDENCE: {
    id: 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
    label: 'Closed (Insufficient Location Evidence)',
    badgeVariant: 'slate',
    description: 'GPS error too large for reliable spatial calculation.',
    isTerminal: true,
  },
  CLOSED_DUPLICATE: {
    id: 'CLOSED_DUPLICATE',
    label: 'Closed (Duplicate / Unrelated)',
    badgeVariant: 'slate',
    description: 'Case is a duplicate of an existing record or outside scope.',
    isTerminal: true,
  },
  CLOSED_REVIEWED: {
    id: 'CLOSED_REVIEWED',
    label: 'Closed (Reviewed - No Further Action)',
    badgeVariant: 'emerald',
    description: 'Condition cataloged in Change Ledger; no intervention required.',
    isTerminal: true,
  },
};
