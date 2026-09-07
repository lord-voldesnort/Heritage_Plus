import { ObservationType } from '../types';

export interface CategoryMetadata {
  id: ObservationType;
  label: string;
  iconName: string;
  description: string;
  examplePrompt: string;
}

export const OBSERVATION_CATEGORIES: CategoryMetadata[] = [
  {
    id: 'POSSIBLE_CONSTRUCTION',
    label: 'Possible construction or extension',
    iconName: 'Hammer',
    description: 'New structure, extension, wall, or foundation visible near the site.',
    examplePrompt: 'Describe observed foundation excavation, masonry work, or structural additions factually without naming individuals.',
  },
  {
    id: 'POSSIBLE_ENCROACHMENT',
    label: 'Possible encroachment',
    iconName: 'ShieldAlert',
    description: 'Activity or temporary structure appearing to occupy a sensitive protected zone.',
    examplePrompt: 'Describe observed temporary structure, occupation, or zone activity factually without alleging legal violations.',
  },
  {
    id: 'PHYSICAL_DAMAGE',
    label: 'Physical damage',
    iconName: 'AlertTriangle',
    description: 'Stone fracture, displaced masonry, carving detachment, wall collapse, or feature damage.',
    examplePrompt: 'Describe observed stone fracture, masonry displacement, or structural weathering factually.',
  },
  {
    id: 'DUMPING_OR_WASTE',
    label: 'Dumping or waste',
    iconName: 'Trash2',
    description: 'Debris, rubble, or unmanaged waste near monument feature or access route.',
    examplePrompt: 'Describe observed rubble accumulation, construction waste, or discarded materials factually.',
  },
  {
    id: 'BLOCKED_ACCESS',
    label: 'Blocked access',
    iconName: 'Ban',
    description: 'Pathway, entrance, gateway, public passage, or access route obstructed.',
    examplePrompt: 'Describe observed pathway obstruction, gate restriction, or barrier factually.',
  },
  {
    id: 'STRUCTURE_ALTERATION',
    label: 'Structure alteration',
    iconName: 'Wrench',
    description: 'Surface painting, plaster repair, masonry modification, or architectural alteration of existing structure.',
    examplePrompt: 'Describe observed surface painting, plaster repair, or structural alteration factually without assuming authorization status.',
  },
  {
    id: 'VISUAL_OBSTRUCTION',
    label: 'Visual obstruction',
    iconName: 'EyeOff',
    description: 'Hoarding, commercial signage, or object altering monument visibility or setting.',
    examplePrompt: 'Describe observed hoarding, commercial signage, or object obstructing monument visibility factually.',
  },
  {
    id: 'OTHER_VISIBLE_CHANGE',
    label: 'Other visible change',
    iconName: 'HelpCircle',
    description: 'Any other physical, contextual, or environmental condition noted.',
    examplePrompt: 'Describe observable physical or environmental changes factually.',
  },
];
