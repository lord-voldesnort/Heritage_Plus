import React from 'react';
import { clsx } from 'clsx';
import {
  Hammer,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Ban,
  Paintbrush,
  EyeOff
} from 'lucide-react';
import { OBSERVATION_CATEGORIES } from '../constants/categories';

export interface CategoryOption {
  id: string;
  label: string;
  description: string;
}

export interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  disabled?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  'possible-construction': <Hammer className="w-4 h-4" />,
  'possible-encroachment': <ShieldAlert className="w-4 h-4" />,
  'physical-damage': <AlertTriangle className="w-4 h-4" />,
  'dumping-waste': <Trash2 className="w-4 h-4" />,
  'blocked-access': <Ban className="w-4 h-4" />,
  'alteration': <Paintbrush className="w-4 h-4" />,
  'visual-obstruction': <EyeOff className="w-4 h-4" />,
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  disabled = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <label className="text-xs font-semibold text-ink-200 font-display uppercase tracking-wider">
          Observation Type <span className="text-sandstone-400">*</span>
        </label>
        <span className="text-dossier-code text-ink-400 font-mono">Select one factual concern</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Observation Categories"
        className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
      >
        {OBSERVATION_CATEGORIES.map((category) => {
          const isSelected = selectedCategoryId === category.id;
          const icon = ICON_MAP[category.id] ?? <ShieldAlert className="w-4 h-4" />;

          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectCategory(category.id)}
              className={clsx(
                'flex items-start p-3 rounded-md border text-left transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-sandstone-500/40 focus:ring-offset-1 focus:ring-offset-ink-950',
                'min-h-[64px]',
                isSelected
                  ? 'border-sandstone-500 bg-sandstone-950/60 shadow-archival'
                  : 'border-ink-800 bg-ink-900/80 hover:border-ink-700 hover:bg-ink-850 shadow-archival-sm',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={clsx(
                  'p-2 rounded-[4px] mr-3 shrink-0 border transition-colors',
                  isSelected
                    ? 'bg-sandstone-900/90 text-sandstone-300 border-sandstone-700/80'
                    : 'bg-ink-950 text-ink-400 border-ink-800'
                )}
              >
                {icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={clsx(
                      'text-xs font-medium leading-5 font-display',
                      isSelected ? 'text-sandstone-100 font-semibold' : 'text-ink-200'
                    )}
                  >
                    {category.label}
                  </span>
                </div>
                <p className="text-legal-notice text-ink-400 mt-0.5 leading-snug line-clamp-2 font-sans">
                  {category.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;