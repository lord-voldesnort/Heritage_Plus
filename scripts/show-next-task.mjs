#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const taskStatusPath = path.resolve(__dirname, '../project/TASK_STATUS.json');
const teamMembersPath = path.resolve(__dirname, '../project/TEAM_MEMBERS.json');
const gateStatusPath = path.resolve(__dirname, '../project/GATE_STATUS.json');

const taskData = JSON.parse(fs.readFileSync(taskStatusPath, 'utf-8'));
const teamMembers = JSON.parse(fs.readFileSync(teamMembersPath, 'utf-8'));
const gateData = JSON.parse(fs.readFileSync(gateStatusPath, 'utf-8'));

// Parse command line arguments (e.g. --member=vishwajeet)
const args = process.argv.slice(2);
let targetMemberId = null;

args.forEach(arg => {
  if (arg.startsWith('--member=')) {
    targetMemberId = arg.split('=')[1].toLowerCase().trim();
  }
});

const isGatePassed = gateData.geometryGate.status === 'PASSED' || gateData.geometryGate.status === 'PASSED_WITH_LIMITATIONS';

console.log('\n================================================================================');
console.log('                 HERITAGE PULSE: TEAM & TASK STATUS DASHBOARD                  ');
console.log('================================================================================');
console.log('Product: Heritage Pulse (SIH 2026 PS 26197 · Heritage & Culture)');
console.log('Core: Provenance-Aware, Uncertainty-Driven Change Ledger for Protected Sites');
console.log('--------------------------------------------------------------------------------');

// 1. Gate Status Banner
if (isGatePassed) {
  console.log(` [ GATE STATUS ] \x1b[32m✔ ${gateData.geometryGate.status}\x1b[0m — Spatial & Map work is unblocked.`);
} else {
  console.log(' [ GATE STATUS ] \x1b[31m✖ NOT_PASSED (GATE-01 ACTIVE)\x1b[0m');
  console.log('   \x1b[33m⚠ SPATIAL-*, LEDGER-01, and UI-02 are BLOCKED until geometry is validated.\x1b[0m');
}
console.log('--------------------------------------------------------------------------------');

// 2. Foundation Tasks Summary
const totalFoundation = taskData.foundationTasks.length;
const doneFoundation = taskData.foundationTasks.filter(t => t.status === 'DONE').length;
console.log(`Foundation Tasks: \x1b[32m${doneFoundation}/${totalFoundation} COMPLETE\x1b[0m`);

// 3. Member Filter or All Members View
const membersToDisplay = targetMemberId 
  ? teamMembers.filter(m => m.id.toLowerCase() === targetMemberId)
  : teamMembers;

if (targetMemberId && membersToDisplay.length === 0) {
  console.log(`\x1b[31mMember '${targetMemberId}' not found. Available members:\x1b[0m`);
  teamMembers.forEach(m => console.log(` - ${m.id} (${m.name})`));
  process.exit(1);
}

membersToDisplay.forEach(member => {
  console.log(`\n--------------------------------------------------------------------------------`);
  console.log(`👤 \x1b[36m${member.name.toUpperCase()}\x1b[0m — ${member.role}`);
  console.log(`--------------------------------------------------------------------------------`);

  const memberTasks = taskData.tasks.filter(t => t.owner.toLowerCase() === member.id.toLowerCase());
  const activeTask = memberTasks.find(t => t.status === 'READY' || t.status === 'IN_PROGRESS') 
    || memberTasks.find(t => t.status === 'BLOCKED');

  if (activeTask) {
    const isTaskBlocked = activeTask.status === 'BLOCKED' || (activeTask.blockers && activeTask.blockers.length > 0);
    const statusColor = isTaskBlocked ? '\x1b[31m' : '\x1b[32m';

    console.log(`👉 \x1b[1mCurrent Next Task\x1b[0m: [${activeTask.id}] ${activeTask.title}`);
    console.log(`   • Status: ${statusColor}${activeTask.status}\x1b[0m | Priority: ${activeTask.priority}`);
    console.log(`   • Description: ${activeTask.description}`);
    
    if (activeTask.blockers && activeTask.blockers.length > 0) {
      console.log(`   • \x1b[31mBlockers\x1b[0m: ${activeTask.blockers.join(', ')}`);
    }

    console.log(`   • Dependencies Complete: ${activeTask.dependencies.join(', ')}`);
    console.log(`   • Files Likely to Change: ${activeTask.filesLikelyToChange.join(', ')}`);
    console.log(`   • Definition of Done: ${activeTask.definitionOfDone}`);
    console.log(`   • Next Task After Completion: ${activeTask.nextTaskAfterCompletion || 'Integration / Demo'}`);
  } else {
    console.log('   • No immediate active task. Providing support or foundation complete.');
  }

  // If filtered for a single member, also print "What other members are building"
  if (targetMemberId) {
    console.log(`\n--- What Other Teammates Are Building ---`);
    teamMembers.filter(m => m.id !== member.id).forEach(other => {
      const otherActive = taskData.tasks.find(t => t.owner.toLowerCase() === other.id.toLowerCase() && (t.status === 'READY' || t.status === 'BLOCKED'));
      if (otherActive) {
        console.log(` • \x1b[33m${other.name}\x1b[0m: [${otherActive.id}] ${otherActive.title} (${otherActive.status})`);
      }
    });
  }
});

console.log('\n================================================================================\n');
