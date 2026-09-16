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
    label: 'Possible Construction',
    iconName: 'Hammer',
    description: 'New structure, extension, wall, or foundation visible near the site.',
    examplePrompt: 'e.g., Brick foundation trench dug 12m from boundary wall.',
  },
  {
    id: 'POSSIBLE_ENCROACHMENT',
    label: 'Possible Encroachment Concern',
    iconName: 'ShieldAlert',
    description: 'Activity or temporary structure appearing to occupy a sensitive protected zone.',
    examplePrompt: 'e.g., Temporary tin shed erected in open perimeter courtyard.',
  },
  {
    id: 'PHYSICAL_DAMAGE',
    label: 'Physical Damage',
    iconName: 'AlertTriangle',
    description: 'Stone fracture, displaced masonry, carving detachment, or wall collapse.',
    examplePrompt: 'e.g., Displaced ashlar stone block on outer plinth near gateway.',
  },
  {
    id: 'DUMPING_OR_WASTE',
    label: 'Dumping or Waste',
    iconName: 'Trash2',
    description: 'Debris, rubble, or unmanaged waste near monument feature or access route.',
    examplePrompt: 'e.g., Pile of construction rubble dumped along eastern approach path.',
  },
  {
    id: 'BLOCKED_ACCESS',
    label: 'Blocked Access',
    iconName: 'Ban',
    description: 'Pathway, entrance, gateway, or public access route obstructed.',
    examplePrompt: 'e.g., Iron gate locked or pathway obstructed by metal barrier.',
  },
  {
    id: 'ALTERATION_OR_OBSTRUCTION',
    label: 'Alteration or Visual Obstruction',
    iconName: 'EyeOff',
    description: 'Surface painting, repair, signage, or object altering monument visibility.',
    examplePrompt: 'e.g., Commercial hoarding mounted near the heritage view line.',
  },
  {
    id: 'OTHER_VISIBLE_CHANGE',
    label: 'Other Visible Change',
    iconName: 'HelpCircle',
    description: 'Any other physical, contextual, or environmental condition noted.',
    examplePrompt: 'e.g., Water pooling and moisture infiltration along western base.',
  },
];
