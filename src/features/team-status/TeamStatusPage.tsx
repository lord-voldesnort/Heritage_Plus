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
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="blue">Internal Coordination</Badge>
            <span className="text-xs font-mono text-slate-400">Team Sinister Six</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white font-['Outfit']">
            Team Status & Gate Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Parallel workstream coordination, foundation progress, and structural gate tracking.
          </p>
        </div>

        <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 text-xs font-mono text-right">
          <div className="text-slate-400">CLI Command:</div>
          <div className="text-amber-400 font-bold">npm run team:status</div>
        </div>
      </div>

      {/* 1. Prominent Geometry Gate Status Banner (Risk B) */}
      <Card
        variant="elevated"
        className={`border-l-4 ${
          isGatePassed
            ? 'border-l-emerald-500 bg-emerald-950/20'
            : 'border-l-rose-500 bg-rose-950/20 border-rose-800/80'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-slate-400 uppercase font-bold">
                Quality Gate (Risk B)
              </span>
              <Badge variant={isGatePassed ? 'emerald' : 'rose'}>
                {gateStatusData.geometryGate.status}
              </Badge>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              {!isGatePassed && <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />}
              {isGatePassed
                ? 'Geometry Gate Passed — Spatial Engine Unblocked'
                : 'Geometry Gate Active — GATE-01 In Progress'}
            </h2>
            <p className="text-xs text-slate-300 max-w-2xl">
              {isGatePassed
                ? 'Official Shivneri Fort geometry validated and approved. Spatial and map tasks are unblocked.'
                : 'SPATIAL-01, SPATIAL-02, SPATIAL-03, UI-02, and LEDGER-01 are structurally BLOCKED until GATE-01 is completed.'}
            </p>
          </div>

          <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-right flex-shrink-0 text-xs font-mono">
            <div className="text-slate-500 text-[10px]">Command to verify:</div>
            <div className="text-amber-400 font-bold">npm run gate:check</div>
          </div>
        </div>
      </Card>

      {/* 2. Foundation Tasks Progress Banner */}
      <Card variant="bordered" className="bg-slate-900/60 p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-semibold text-slate-200 font-mono uppercase">
              Foundation Phase: {doneFoundation}/{totalFoundation} Complete
            </h3>
          </div>
          <Badge variant="emerald">Foundation Ready</Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {taskStatusData.foundationTasks.map(ft => (
            <div key={ft.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-900 flex items-center justify-between">
              <span className="font-mono text-slate-400 text-[11px]">{ft.id}</span>
              <Badge variant="emerald" className="text-[10px]">DONE</Badge>
            </div>
          ))}
        </div>
      </Card>

      {/* 3. Team Member Cards & Active Next Tasks */}
      <div className="space-y-3">
        <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
          Team Member Workstreams & Active Next Tasks
        </h2>

        <div className="grid md:grid-cols-3 gap-4">
          {teamMembersData.slice(0, 3).map(member => {
            const memberTasks = taskStatusData.tasks.filter(t => t.owner.toLowerCase() === member.id.toLowerCase());
            const activeTask = memberTasks.find(t => t.status === 'READY' || t.status === 'IN_PROGRESS') 
              || memberTasks.find(t => t.status === 'BLOCKED');

            const isBlocked = activeTask?.status === 'BLOCKED';

            return (
              <Card key={member.id} variant="elevated" className="space-y-4 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-base text-white">{member.name}</h3>
                    <Badge variant="blue" className="text-[10px]">{member.id.toUpperCase()}</Badge>
                  </div>
                  <p className="text-xs text-amber-400 font-medium">{member.role}</p>
                </div>

                {activeTask ? (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500">CURRENT NEXT TASK:</span>
                      <Badge variant={isBlocked ? 'rose' : 'emerald'} className="text-[9px]">
                        {activeTask.status}
                      </Badge>
                    </div>

                    <div className="font-semibold text-slate-200 text-xs">
                      [{activeTask.id}] {activeTask.title}
                    </div>

                    {isBlocked && (
                      <div className="text-[10px] text-rose-400 font-mono">
                        Blocked by: {activeTask.blockers.join(', ')}
                      </div>
                    )}

                    <div className="text-[10px] text-slate-400 line-clamp-2">
                      DoD: {activeTask.definitionOfDone}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-500 py-2">No active pending task.</div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
