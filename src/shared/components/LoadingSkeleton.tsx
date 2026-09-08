import React from 'react';
import { clsx } from 'clsx';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div
      className={clsx(
        'animate-pulse rounded-[4px] bg-ink-800/80 border border-ink-700/40',
        className
      )}
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="p-4 sm:p-5 rounded-lg border border-ink-800 bg-ink-900/60 shadow-archival-sm space-y-3.5">
      <Skeleton className="h-36 w-full rounded-md" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
      <div className="pt-2 space-y-2 border-t border-ink-800/80">
        <Skeleton className="h-9 w-full rounded-md" />
      </div>
    </div>
  );
};

export default Skeleton;