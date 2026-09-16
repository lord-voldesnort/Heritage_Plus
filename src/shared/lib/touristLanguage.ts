import { SpatialClassification } from '../types';

export interface TouristResultCopy {
  headline: string;
  zoneLabel: string;
  zoneColor: 'red' | 'amber' | 'green' | 'slate';
  message: string;
  whatHappensNext: string[];
}

/**
 * Translates the internal (technical) spatial classification into short,
 * plain-language copy that a visitor with no GIS background can understand.
 */
export function getTouristResultCopy(
  classification: SpatialClassification
): TouristResultCopy {
  switch (classification) {
    case 'POTENTIAL_ZONE_CONCERN':
      return {
        headline: 'Thanks — your report has been received',
        zoneLabel: 'Inside the protected zone',
        zoneColor: 'red',
        message:
          "The spot you marked falls inside the fort's protected (red) zone, where construction and other changes are not normally allowed. Because of this, your report has been flagged as a priority for our conservation team.",
        whatHappensNext: [
          'A conservation officer will review your photo and notes.',
          'You can track progress anytime under "My Reports".',
          'No further action is needed from you right now — thank you for helping protect the site.',
        ],
      };
    case 'LOCATION_UNCERTAIN':
      return {
        headline: 'Thanks — your report has been saved',
        zoneLabel: 'Location needs a closer look',
        zoneColor: 'amber',
        message:
          "Your phone's GPS signal was close to a zone boundary, so we can't say for certain which zone the spot falls in. Don't worry — your report has still been logged, and our team will double-check the exact location.",
        whatHappensNext: [
          'Our team will review the exact spot using your photo and notes.',
          'If needed, they may follow up for a clearer location.',
          'You can check the status anytime under "My Reports".',
        ],
      };
    case 'NO_SPATIAL_CONCERN_INDICATED':
      return {
        headline: 'Thanks for your report',
        zoneLabel: 'Outside the restricted zones',
        zoneColor: 'green',
        message:
          "The spot you marked is outside the fort's restricted zones. That doesn't mean it isn't worth looking at — your report has still been saved and our team will take a look.",
        whatHappensNext: [
          'Your report has been added to the review list.',
          'Someone will look into it if it needs attention.',
          'You can check back anytime under "My Reports".',
        ],
      };
    case 'EVIDENCE_INSUFFICIENT':
      return {
        headline: "We've saved your report",
        zoneLabel: 'Location not precise enough',
        zoneColor: 'slate',
        message:
          "Your phone's GPS signal wasn't accurate enough for us to confirm exactly which zone this was in. Your report and photo have still been saved so nothing is lost.",
        whatHappensNext: [
          'For a more precise result, try reporting again from an open area (away from walls or trees).',
          'Our team will still review the details you provided.',
          'You can check the status anytime under "My Reports".',
        ],
      };
    case 'SOURCE_UNAVAILABLE':
    default:
      return {
        headline: "We've saved your report",
        zoneLabel: 'Zone check unavailable right now',
        zoneColor: 'slate',
        message:
          "We couldn't check this location against our zone map right now, but your report has been saved and won't be lost.",
        whatHappensNext: [
          'Our team will review your report manually.',
          'You can check the status anytime under "My Reports".',
        ],
      };
  }
}

export function formatDistanceForTourist(distanceToBoundaryMeters: number | null): string | null {
  if (distanceToBoundaryMeters === null || distanceToBoundaryMeters === undefined) return null;
  const rounded = Math.round(distanceToBoundaryMeters);
  return `About ${rounded}m from the fort boundary`;
}
