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

interface CategorySelectorProps {
    selectedCategoryId: string | null;
    onSelectCategory: (categoryId: string) => void;
    disabled?: boolean;
}

const ICON_MAP: Record<string, React.ReactNode> = {
    'possible-construction': <Hammer className="w-5 h-5" />,
    'possible-encroachment': <ShieldAlert className="w-5 h-5" />,
    'physical-damage': <AlertTriangle className="w-5 h-5" />,
    'dumping-waste': <Trash2 className="w-5 h-5" />,
    'blocked-access': <Ban className="w-5 h-5" />,
    'alteration': <Paintbrush className="w-5 h-5" />,
    'visual-obstruction': <EyeOff className="w-5 h-5" />,
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
    selectedCategoryId,
    onSelectCategory,
    disabled = false,
}) => {
    return (
        <div className="space-y-2">
            <div className="flex justify-between items-baseline">
                <label className="text-sm font-semibold text-slate-800">
                    Observation Type <span className="text-amber-600">*</span>
                </label>
                <span className="text-xs text-slate-500">Select one factual concern</span>
            </div>

            <div
                role="radiogroup"
                aria-label="Observation Categories"
                className="grid grid-cols-1 sm:grid-cols-2 gap-2.5"
            >
                {OBSERVATION_CATEGORIES.map((category) => {
                    const isSelected = selectedCategoryId === category.id;
                    const icon = ICON_MAP[category.id] ?? <ShieldAlert className="w-5 h-5" />;

                    return (
                        <button
                            key={category.id}
                            type="button"
                            role="radio"
                            aria-checked={isSelected}
                            disabled={disabled}
                            onClick={() => onSelectCategory(category.id)}
                            className={clsx(
                                'flex items-start p-3 rounded-lg border text-left transition-all',
                                'focus:outline-none focus:ring-2 focus:ring-amber-500/50',
                                'active:scale-[0.98] min-h-[64px]',
                                isSelected
                                    ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50',
                                disabled && 'opacity-50 cursor-not-allowed'
                            )}
                        >
                            <div
                                className={clsx(
                                    'p-2 rounded-md mr-3 shrink-0',
                                    isSelected
                                        ? 'bg-amber-100 text-amber-900'
                                        : 'bg-slate-100 text-slate-600'
                                )}
                            >
                                {icon}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                    <span
                                        className={clsx(
                                            'text-sm font-medium leading-5',
                                            isSelected ? 'text-amber-950 font-semibold' : 'text-slate-900'
                                        )}
                                    >
                                        {category.label}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
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