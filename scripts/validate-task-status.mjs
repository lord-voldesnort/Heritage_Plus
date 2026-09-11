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

const validMemberIds = new Set(teamMembers.map(m => m.id.toLowerCase()));
const validStatuses = new Set(['BACKLOG', 'READY', 'IN_PROGRESS', 'BLOCKED', 'NEEDS_REVIEW', 'DONE']);

let errors = [];
const seenTaskIds = new Set();
const isGatePassed = gateData.geometryGate.status === 'PASSED' || gateData.geometryGate.status === 'PASSED_WITH_LIMITATIONS';

console.log('Validating task status and dependency integrity...');

// 1. Validate Foundation Tasks
taskData.foundationTasks.forEach(ft => {
  if (seenTaskIds.has(ft.id)) errors.push(`Duplicate task ID: ${ft.id}`);
  seenTaskIds.add(ft.id);

  if (!validMemberIds.has(ft.owner.toLowerCase())) {
    errors.push(`Foundation task ${ft.id} has invalid owner: ${ft.owner}`);
  }
});

// 2. Validate Standard Tasks
taskData.tasks.forEach(task => {
  if (seenTaskIds.has(task.id)) errors.push(`Duplicate task ID: ${task.id}`);
  seenTaskIds.add(task.id);

  if (!validMemberIds.has(task.owner.toLowerCase())) {
    errors.push(`Task ${task.id} has invalid owner: ${task.owner}`);
  }

  if (!validStatuses.has(task.status)) {
    errors.push(`Task ${task.id} has invalid status: ${task.status}`);
  }

  // Check Geometry Gate enforcement
  const isSpatialOrMapTask = task.id.startsWith('SPATIAL-') || task.id === 'UI-02' || task.id === 'LEDGER-01';
  if (isSpatialOrMapTask && !isGatePassed) {
    if (task.status !== 'BLOCKED') {
      errors.push(`Task ${task.id} must have status 'BLOCKED' while Geometry Gate is NOT_PASSED (found: ${task.status})`);
    }
    if (!task.blockers || !task.blockers.some(b => b.includes('GATE-01'))) {
      errors.push(`Task ${task.id} missing 'GATE-01 not passed' in blockers array while Geometry Gate is NOT_PASSED.`);
    }
  }
});

if (errors.length > 0) {
  console.error('\x1b[31m[VALIDATION FAILED]\x1b[0m Found the following integrity errors:');
  errors.forEach(e => console.error(` ✖ ${e}`));
  process.exit(1);
} else {
  console.log('\x1b[32m✔ TASK STATUS INTEGRITY PASSED: All tasks, owners, statuses, and gate blockers are valid.\x1b[0m');
  process.exit(0);
}
