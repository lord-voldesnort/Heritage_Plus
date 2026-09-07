import { describe, it, expect } from 'vitest';
import * as turf from '@turf/turf';
import fs from 'fs';
import path from 'path';

const baseDir = path.resolve(__dirname, '../../../data/sources/shivneri/bhuvan-nrsc-2026-09-07');
const protectedGeo = JSON.parse(fs.readFileSync(path.join(baseDir, 'asi_protected_areas_7068.geojson'), 'utf-8'));
const prohibitedGeo = JSON.parse(fs.readFileSync(path.join(baseDir, 'asi_prohibited_boundary_9785.geojson'), 'utf-8'));
const regulatedGeo = JSON.parse(fs.readFileSync(path.join(baseDir, 'asi_regulated_boundary_2394.geojson'), 'utf-8'));

describe('Shivneri Fort (MUMMH015) Bhuvan/NRSC Geometry Automated Validation', () => {
  it('confirms all 3 MultiPolygon layers are topologically valid', () => {
    expect(turf.booleanValid(protectedGeo.features[0])).toBe(true);
    expect(turf.booleanValid(prohibitedGeo.features[0])).toBe(true);
    expect(turf.booleanValid(regulatedGeo.features[0])).toBe(true);
  });

  it('confirms spatial nesting: protected inside prohibited, prohibited inside regulated', () => {
    const isProtectedInProhibited = turf.booleanContains(prohibitedGeo.features[0], protectedGeo.features[0]);
    const isProhibitedInRegulated = turf.booleanContains(regulatedGeo.features[0], prohibitedGeo.features[0]);

    expect(isProtectedInProhibited).toBe(true);
    expect(isProhibitedInRegulated).toBe(true);
  });

  it('confirms surface area increases in expected order across buffer tiers', () => {
    const areaProtected = turf.area(protectedGeo.features[0]);
    const areaProhibited = turf.area(prohibitedGeo.features[0]);
    const areaRegulated = turf.area(regulatedGeo.features[0]);

    expect(areaProtected).toBeLessThan(areaProhibited);
    expect(areaProhibited).toBeLessThan(areaRegulated);
  });

  it('verifies official reference coordinate (19.1931225, 73.8528893) falls outside protected but inside prohibited and regulated', () => {
    const refPoint = turf.point([73.8528893, 19.1931225]);

    const inProtected = turf.booleanPointInPolygon(refPoint, protectedGeo.features[0]);
    const inProhibited = turf.booleanPointInPolygon(refPoint, prohibitedGeo.features[0]);
    const inRegulated = turf.booleanPointInPolygon(refPoint, regulatedGeo.features[0]);

    expect(inProtected).toBe(false);
    expect(inProhibited).toBe(true);
    expect(inRegulated).toBe(true);
  });

  it('verifies stable key metadata attributes across layers', () => {
    const f1 = protectedGeo.features[0].properties;
    const f2 = prohibitedGeo.features[0].properties;
    const f3 = regulatedGeo.features[0].properties;

    expect(f1.mon_num).toBe('MUMMH015');
    expect(f2.mon_num).toBe('MUMMH015');
    expect(f3.mon_num).toBe('MUMMH015');

    expect(f1.gid).toBe(7068);
    expect(f2.gid).toBe(9785);
    expect(f3.gid).toBe(2394);

    expect(f2.buff_dist).toBe(100);
    expect(f3.buff_dist).toBe(300);
  });
});
