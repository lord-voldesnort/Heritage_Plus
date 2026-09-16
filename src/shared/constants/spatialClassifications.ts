import { SpatialClassification } from '../types';

export interface SpatialClassificationMetadata {
  id: SpatialClassification;
  badgeLabel: string;
  badgeVariant: 'amber' | 'emerald' | 'slate' | 'rose';
  summaryDescription: string;
}

export const SPATIAL_CLASSIFICATIONS: Record<SpatialClassification, SpatialClassificationMetadata> = {
  POTENTIAL_ZONE_CONCERN: {
    id: 'POTENTIAL_ZONE_CONCERN',
    badgeLabel: 'Potential Zone Concern (Verification Required)',
    badgeVariant: 'amber',
    summaryDescription: 'Point coordinates fall strictly within the sourced boundary layer.',
  },
  NO_SPATIAL_CONCERN_INDICATED: {
    id: 'NO_SPATIAL_CONCERN_INDICATED',
    badgeLabel: 'No Spatial Concern Indicated by this Layer',
    badgeVariant: 'emerald',
    summaryDescription: 'Point coordinates fall outside the sourced boundary layer.',
  },
  LOCATION_UNCERTAIN: {
    id: 'LOCATION_UNCERTAIN',
    badgeLabel: 'Location Uncertain (Accuracy Circle Overlaps Boundary)',
    badgeVariant: 'rose',
    summaryDescription: 'GPS uncertainty disk intersects boundary line; system refuses to overclaim.',
  },
  EVIDENCE_INSUFFICIENT: {
    id: 'EVIDENCE_INSUFFICIENT',
    badgeLabel: 'Location Evidence Insufficient',
    badgeVariant: 'slate',
    summaryDescription: 'Device reported GPS accuracy error exceeds 35m scientific threshold.',
  },
  SOURCE_UNAVAILABLE: {
    id: 'SOURCE_UNAVAILABLE',
    badgeLabel: 'Source Geometry Unavailable for Classification',
    badgeVariant: 'slate',
    summaryDescription: 'Boundary layer is unreviewed or below required confidence score.',
  },
};
