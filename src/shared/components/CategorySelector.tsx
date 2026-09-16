import React from 'react';
import { clsx } from 'clsx';
import { OBSERVATION_CATEGORIES } from '../constants/categories';

interface CategorySelectorProps {
  selectedCategoryId: string | null;
  onSelectCategory: (categoryId: string) => void;
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  POSSIBLE_CONSTRUCTION: 'construction',
  POSSIBLE_ENCROACHMENT: 'fence',
  PHYSICAL_DAMAGE: 'broken_image',
  DUMPING_OR_WASTE: 'rainy',
  BLOCKED_ACCESS: 'block',
  ALTERATION_OR_OBSTRUCTION: 'psychiatry',
  OTHER_VISIBLE_CHANGE: 'groups',
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedCategoryId,
  onSelectCategory,
  disabled = false,
}) => {
  return (
    <div className="space-y-2.5">
      <div className="flex justify-between items-baseline">
        <label className="text-sm font-semibold text-text-primary">
          Primary Classification of Finding <span className="text-primary">*</span>
        </label>
        <span className="text-xs text-text-muted">Select statutory category</span>
      </div>

      <div
        role="radiogroup"
        aria-label="Observation Finding Classification"
        className="grid grid-cols-2 sm:grid-cols-3 gap-3"
      >
        {OBSERVATION_CATEGORIES.slice(0, 6).map((category) => {
          const isSelected =
            selectedCategoryId === category.id ||
            (category.id === 'POSSIBLE_CONSTRUCTION' && selectedCategoryId === 'unauth-construction') ||
            (category.id === 'POSSIBLE_ENCROACHMENT' && selectedCategoryId === 'encroachment') ||
            (category.id === 'PHYSICAL_DAMAGE' && selectedCategoryId === 'structural-damage') ||
            (category.id === 'DUMPING_OR_WASTE' && selectedCategoryId === 'natural-degradation') ||
            (category.id === 'ALTERATION_OR_OBSTRUCTION' && (selectedCategoryId === 'vegetation' || selectedCategoryId === 'structure-alteration')) ||
            (category.id === 'OTHER_VISIBLE_CHANGE' && selectedCategoryId === 'tourism-footprint');

          const iconName = CATEGORY_ICONS[category.id] || 'construction';

          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelectCategory(category.id)}
              className={clsx(
                'flex flex-col items-center justify-center text-center p-4 rounded-xl transition-all duration-200 group cursor-pointer active:scale-[0.98]',
                isSelected
                  ? 'border-2 border-primary bg-primary/5 shadow-xs ring-1 ring-primary/20'
                  : 'border border-border-subtle bg-surface-well/50 hover:bg-surface-well hover:border-border-strong text-text-primary',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              <div
                className={clsx(
                  'w-11 h-11 rounded-full flex items-center justify-center mb-2.5 transition-transform group-hover:scale-105',
                  isSelected
                    ? 'bg-primary/10 text-primary'
                    : 'bg-surface-card border border-border-subtle text-secondary'
                )}
              >
                <span className="material-symbols-outlined text-[22px]">{iconName}</span>
              </div>
              <span
                className={clsx(
                  'text-xs sm:text-sm leading-tight',
                  isSelected ? 'font-bold text-primary' : 'font-medium text-text-primary'
                )}
              >
                {category.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategorySelector;