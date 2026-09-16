import React from 'react';
import { MapPinned, Camera, CheckCircle2 } from 'lucide-react';

export type WorkflowStepId = 'explore' | 'report' | 'done';

interface WorkflowStepsProps {
  current: WorkflowStepId;
  className?: string;
}

const STEPS: { id: WorkflowStepId; label: string; icon: React.ElementType }[] = [
  { id: 'explore', label: 'Explore the map', icon: MapPinned },
  { id: 'report', label: 'Report what you see', icon: Camera },
  { id: 'done', label: 'Get confirmation', icon: CheckCircle2 },
];

/**
 * Small, plain-language step tracker shown at the top of the tourist-facing
 * flow (site map -> log observation -> confirmation) so first-time users
 * always know what to do next.
 */
export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({ current, className = '' }) => {
  const currentIndex = STEPS.findIndex((s) => s.id === current);

  return (
    <div
      className={`flex items-center justify-between gap-2 bg-surface-card border border-border-subtle rounded-2xl p-3 sm:p-4 ${className}`}
      aria-label="Reporting steps"
    >
      {STEPS.map((step, idx) => {
        const Icon = step.icon;
        const isDone = idx < currentIndex;
        const isActive = idx === currentIndex;

        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isActive
                    ? 'bg-primary text-white border-primary'
                    : isDone
                    ? 'bg-emerald-500 text-white border-emerald-500'
                    : 'bg-surface-well text-text-muted border-border-subtle'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="min-w-0 hidden xs:block sm:block">
                <div className="text-[10px] text-text-muted font-mono leading-none">Step {idx + 1}</div>
                <div
                  className={`text-xs font-semibold truncate ${
                    isActive ? 'text-primary' : isDone ? 'text-emerald-700' : 'text-text-secondary'
                  }`}
                >
                  {step.label}
                </div>
              </div>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className={`flex-1 h-0.5 rounded-full mx-1 ${
                  idx < currentIndex ? 'bg-emerald-400' : 'bg-border-subtle'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default WorkflowSteps;
