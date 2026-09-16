import React from 'react';
import { clsx } from 'clsx';

interface SkeletonProps {
    className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
    return (
        <div
            className={clsx(
                'animate-pulse rounded-md bg-slate-200/80',
                className
            )}
        />
    );
};

export const CardSkeleton: React.FC = () => {
    return (
        <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
            <Skeleton className="h-40 w-full rounded-lg" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="pt-2 space-y-2">
                <Skeleton className="h-8 w-full" />
            </div>
        </div>
    );
};

export default Skeleton;