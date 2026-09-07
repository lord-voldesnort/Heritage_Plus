import { ObservationType } from '../../shared/types';

export interface CategoryGuideline {
  id: ObservationType;
  title: string;
  label: string;
  description: string;
  neutralPromptPlaceholder: string;
  photoExamples: string[];
  privacyWarning: string;
}

export const APPROVED_PRIVACY_WARNING = "Do not photograph human faces or private property signage.";

export const OBSERVATION_GUIDELINES: CategoryGuideline[] = [
  {
    id: 'POSSIBLE_CONSTRUCTION',
    title: 'Possible construction or extension',
    label: 'Possible construction or extension',
    description: 'New structure, extension, wall, or foundation visible near the site.',
    neutralPromptPlaceholder: 'Describe observed foundation excavation, masonry work, or structural additions factually without naming individuals.',
    photoExamples: [
      'Mortar joint or brick foundation trench',
      'Scaffolding or temporary support poles',
      'Fresh concrete or stone masonry line',
    ],
    privacyWarning: APPROVED_PRIVACY_WARNING,
  },
  {
    id: 'PHYSICAL_DAMAGE',
    title: 'Physical damage',
    label: 'Physical damage',
    description: 'Stone fracture, displaced masonry, carving detachment, or wall collapse.',
    neutralPromptPlaceholder: 'Describe observed stone fracture, masonry displacement, or structural weathering factually.',
    photoExamples: [
      'Crack line in stone wall or masonry plinth',
      'Displaced ashlar block or masonry unit',
      'Detached architectural carving or coping stone',
    ],
    privacyWarning: APPROVED_PRIVACY_WARNING,
  },
  {
    id: 'DUMPING_OR_WASTE',
    title: 'Dumping or waste',
    label: 'Dumping or waste',
    description: 'Debris, rubble, or unmanaged waste near monument feature or access route.',
    neutralPromptPlaceholder: 'Describe observed rubble accumulation, construction waste, or discarded materials factually.',
    photoExamples: [
      'Rubble pile or construction debris line',
      'Discarded packaging or material heap',
      'Waste accumulation near boundary marker',
    ],
    privacyWarning: APPROVED_PRIVACY_WARNING,
  },
  {
    id: 'POSSIBLE_ENCROACHMENT',
    title: 'Possible alteration',
    label: 'Possible alteration',
    description: 'Surface painting, repair, signage, or object altering monument visibility.',
    neutralPromptPlaceholder: 'Describe observed surface painting, plaster repair, or architectural modification factually.',
    photoExamples: [
      'Fresh plaster patch or cement coating',
      'Surface paint or wash application',
      'Modified opening or doorway alteration',
    ],
    privacyWarning: APPROVED_PRIVACY_WARNING,
  },
  {
    id: 'ALTERATION_OR_OBSTRUCTION',
    title: 'Visual obstruction',
    label: 'Visual obstruction',
    description: 'Hoarding, commercial signage, or object obstructing monument visibility.',
    neutralPromptPlaceholder: 'Describe observed hoarding, commercial signage, or object obstructing monument visibility factually.',
    photoExamples: [
      'Commercial advertising hoarding frame',
      'Boundary marker or sightline obstruction',
      'Temporary pole or visual barrier',
    ],
    privacyWarning: APPROVED_PRIVACY_WARNING,
  },
];

export function getGuidelineById(id: string): CategoryGuideline | undefined {
  return OBSERVATION_GUIDELINES.find(g => g.id === id);
}
