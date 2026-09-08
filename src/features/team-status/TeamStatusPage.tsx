import React from 'react';
import taskStatusData from '../../../project/TASK_STATUS.json';
import teamMembersData from '../../../project/TEAM_MEMBERS.json';
import gateStatusData from '../../../project/GATE_STATUS.json';
import { Card } from '../../shared/components/Card';
import { Badge } from '../../shared/components/Badge';
import {
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export const TeamStatusPage: React.FC = () => {
  const isGatePassed = gateStatusData.geometryGate.status === 'PASSED';
  const totalFoundation = taskStatusData.foundationTasks.length;
  const doneFoundation = taskStatusData.foundationTasks.filter(t => t.status === 'DONE').length;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue">Internal Coordination</Badge>
            <span className="text-xs font-mono text-text-secondary">Team Sinister Six</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-primary font-sans tracking-tight">
            Team Status &amp; Gate Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Parallel workstream coordination, foundation progress, and structural gate tracking.
          </p>
        </div>

        <div className="bg-surface-card p-2.5 rounded-xl border border-border-subtle text-xs font-mono text-right">
          <div className="text-text-muted">CLI Command:</div>
          <div className="text-primary font-bold">npm run team:status</div>
        </div>
      </div>

      {/* 1. Prominent Geometry Gate Status Banner */}
      <Card
        variant="elevated"
        className={`border-l-4 ${
          isGatePassed
            ? 'border-l-zone-survey bg-zone-survey-bg/60'
            : 'border-l-zone-core bg-zone-core-bg/40'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-text-muted uppercase font-bold">
                Quality Gate (Risk B)
              </span>
              <Badge variant={isGatePassed ? 'emerald' : 'rose'}>
                {gateStatusData.geometryGate.status}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-primary flex items-center gap-2">
              {!isGatePassed && <AlertTriangle className="w-5 h-5 text-zone-core flex-shrink-0" />}
              {gateStatusData.geometryGate.name}
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed max-w-lg">
              {gateStatusData.geometryGate.description}
            </p>
          </div>

          {isGatePassed && (
            <div className="flex items-center gap-2 px-4 py-3 bg-zone-survey-bg rounded-xl border border-zone-survey-border shrink-0">
              <CheckCircle2 className="w-5 h-5 text-zone-survey" />
              <span className="text-sm font-bold text-zone-survey">Gate Clear</span>
            </div>
          )}
        </div>

        {gateStatusData.geometryGate.validationChecks && (
          <div className="mt-4 pt-4 border-t border-border-subtle space-y-2">
            <div className="text-[10px] font-mono text-text-muted uppercase font-bold tracking-wide">Validation Checks:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {gateStatusData.geometryGate.validationChecks.map((check: any, i: number) => (
                <div key={i} className={`flex items-center gap-2 text-xs p-2 rounded-lg border ${
                  check.pass
                    ? 'bg-zone-survey-bg border-zone-survey-border text-zone-survey'
                    : 'bg-zone-core-bg border-zone-core-border text-zone-core'
                }`}>
                  {check.pass
                    ? <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    : <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />}
                  <span className="font-medium">{check.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 2. Foundation Tasks */}
      <Card variant="elevated">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-secondary uppercase tracking-wider font-mono">
            Foundation Tasks ({doneFoundation}/{totalFoundation} Complete)
          </h2>
          <div className="flex items-center gap-2">
            <div className="h-2 w-32 sm:w-48 rounded-full bg-surface-well overflow-hidden border border-border-subtle">
              <div
                className="h-full bg-gradient-to-r from-primary-saffron to-primary rounded-full transition-all duration-700"
                style={{ width: `${Math.round((doneFoundation / totalFoundation) * 100)}%` }}
              />
            </div>
            <span className="text-xs font-bold text-primary font-mono">
              {Math.round((doneFoundation / totalFoundation) * 100)}%
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {taskStatusData.foundationTasks.map((task: any) => (
            <div
              key={task.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border text-xs ${
                task.status === 'DONE'
                  ? 'bg-zone-survey-bg border-zone-survey-border'
                  : task.status === 'IN_PROGRESS'
                  ? 'bg-primary-surface border-primary-border'
                  : 'bg-surface-well border-border-subtle'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {task.status === 'DONE'
                  ? <CheckCircle2 className="w-4 h-4 text-zone-survey flex-shrink-0" />
                  : task.status === 'IN_PROGRESS'
                  ? <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                  : <div className="w-4 h-4 rounded-full border-2 border-border-strong flex-shrink-0" />}
                <span className={`font-medium ${
                  task.status === 'DONE'
                    ? 'text-text-primary'
                    : task.status === 'IN_PROGRESS'
                    ? 'text-primary font-semibold'
                    : 'text-text-secondary'
                }`}>
                  {task.name}
                </span>
              </div>
              <Badge variant={task.status === 'DONE' ? 'emerald' : task.status === 'IN_PROGRESS' ? 'amber' : 'slate'}>
                {task.status}
              </Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Team Members */}
      <div>
        <h2 className="text-xs font-semibold text-secondary uppercase tracking-wider font-mono mb-3">
          Team Members ({teamMembersData.members.length})
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {teamMembersData.members.map((member: any) => (
            <Card key={member.name} variant="default" className="p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 text-primary flex items-center justify-center font-bold text-sm border border-primary/20 flex-shrink-0">
                {member.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-bold text-text-primary truncate">{member.name}</div>
                <div className="text-[11px] text-text-secondary truncate">{member.role}</div>
                {member.workstream && (
                  <div className="text-[10px] text-primary font-mono mt-0.5 truncate">{member.workstream}</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
