import React from 'react';
import { clsx } from 'clsx';
import { FolderOpen } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ReactNode;
    title: string;
    description: string;
    action?: React.ReactNode;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon,
    title,
    description,
    action,
    className,
}) => {
    return (
        <div
            className={clsx(
                'flex flex-col items-center justify-center p-8 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/40 text-slate-200',
                className
            )}
        >
            <div className="p-3 mb-3 rounded-full bg-slate-950 border border-slate-800 text-slate-400 shadow-xs">
                {icon ?? <FolderOpen className="w-6 h-6 text-amber-500/70" />}
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1 font-['Outfit']">{title}</h3>
            <p className="text-xs text-slate-400 max-w-sm leading-relaxed mb-4">
                {description}
            </p>
            {action && <div>{action}</div>}
        </div>
    );
};

export default EmptyState;