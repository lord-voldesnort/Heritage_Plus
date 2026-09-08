import { DemoScenario } from '../types';

/**
 * BENCHMARK DEMO SCENARIOS (GATE-01 REAL BHUVAN GEOMETRY INTEGRATION)
 *
 * All coordinates in these scenarios are derived from official Bhuvan/NRSC ASI-associated
 * layer geometries for Fort of Shivner (MUMMH015):
 * 1. Clearly Inside: Real interior coordinate within asi:protected_areas (gid: 7068).
 * 2. Clearly Outside: Real external coordinate well outside asi:regulated_boundary (gid: 2394).
 * 3. Near Boundary / Edge Uncertainty: Uses the official ASI/Bhuvan reference site coordinate
 *    (19.1931225, 73.8528893). This point is a real, documented boundary characteristic—it lies
 *    outside protected_areas (~26.0m away) but inside prohibited_boundary. With ±30.0m GPS error,
 *    the accuracy disk intersects the protected boundary line, triggering LOCATION_UNCERTAIN.
 * 4. Poor GPS Accuracy: Real interior coordinate paired with ±46m horizontal accuracy error
 *    to trigger the >35m sensor degradation gate.
 */
export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario-1-inside',
    name: 'Scenario 1: Clearly Inside Protected Zone',
    description: 'Observation well inside Shivneri protected area (gid: 7068) with high-accuracy GPS (±4.5m).',
    category: 'POSSIBLE_CONSTRUCTION',
    factualNotes: 'Stone foundation excavation and mortar mixing observed 15m inside north gateway.',
    latitude: 19.1980,
    longitude: 73.8580,
    gpsAccuracyMeters: 4.5,
    expectedClassification: 'POTENTIAL_ZONE_CONCERN',
    demonstrates: 'Accurate spatial detection and formal evidence packet generation.',
  },
  {
    id: 'scenario-2-outside',
    name: 'Scenario 2: Clearly Outside Regulated Zone',
    description: 'Observation well outside the 300m regulated boundary (gid: 2394) with high GPS precision (±5.0m).',
    category: 'ALTERATION_OR_OBSTRUCTION',
    factualNotes: 'Commercial advertising board erected on approach road beyond 300m zone.',
    latitude: 19.2085,
    longitude: 73.8750,
    gpsAccuracyMeters: 5.0,
    expectedClassification: 'NO_SPATIAL_CONCERN_INDICATED',
    demonstrates: 'System does not falsely flag activity outside protected boundaries.',
  },
  {
    id: 'scenario-3-near-boundary',
    name: 'Scenario 3: Near Boundary (Edge Uncertainty - Real Reference Point)',
    description: 'Uses official reference coordinate (19.1931225, 73.8528893), ~26m from protected boundary with ±30m GPS accuracy. Multi-tier resolver identifies Prohibited tier concern with explicit higher-tier Protected boundary uncertainty caveat.',
    category: 'PHYSICAL_DAMAGE',
    factualNotes: 'Displaced masonry blocks noted near perimeter boundary stone.',
    latitude: 19.1931225,
    longitude: 73.8528893,
    gpsAccuracyMeters: 30.0,
    expectedClassification: 'POTENTIAL_ZONE_CONCERN',
    demonstrates: 'Multi-tier resolution: identifies confident Prohibited zone concern while preserving Protected tier edge uncertainty.',
  },
  {
    id: 'scenario-4-poor-gps',
    name: 'Scenario 4: Degraded GPS Signal',
    description: 'Deep canopy / gorge location reporting ±46m horizontal accuracy error (> 35m threshold).',
    category: 'DUMPING_OR_WASTE',
    factualNotes: 'Debris accumulated in rock crevice along base path.',
    latitude: 19.1980,
    longitude: 73.8580,
    gpsAccuracyMeters: 46.0,
    expectedClassification: 'EVIDENCE_INSUFFICIENT',
    demonstrates: 'Sensor error gatekeeper: prevents premature calculation from low-quality hardware data.',
  },
];
