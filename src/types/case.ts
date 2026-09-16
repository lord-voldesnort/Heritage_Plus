import { CaseStatus } from '../shared/types';

/**
 * Strict Case Statuses Governance Type
 */
export type GovernanceCaseStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'ADDITIONAL_INFO_NEEDED'
  | 'FIELD_VERIFICATION_RECOMMENDED'
  | 'REFERRED'
  | 'CLOSED';

export interface ReviewerTransitionAction {
  caseId: string;
  actionTitle: string;
  resultingStatus: CaseStatus;
  reviewerNotes: string; // Required non-empty rationale string
  reviewerRole?: string;
}

/**
 * Validates that a reviewer transition action contains a required non-empty rationale string.
 */
export function validateReviewerRationale(notes: string): { isValid: boolean; error?: string } {
  if (!notes || notes.trim().length === 0) {
    return {
      isValid: false,
      error: 'Administrative rationale is required before executing a reviewer status transition.',
    };
  }
  return { isValid: true };
}
