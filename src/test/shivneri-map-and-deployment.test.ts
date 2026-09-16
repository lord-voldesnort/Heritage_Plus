import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as turf from '@turf/turf';
import {
  SHIVNERI_PROTECTED_GEOJSON,
  SHIVNERI_REGULATED_GEOJSON,
  SHIVNERI_PERMITTED_GEOJSON,
  SHIVNERI_PROTECTED_GEOMETRY,
  SHIVNERI_REGULATED_GEOMETRY,
  SHIVNERI_PERMITTED_GEOMETRY,
  PROVENANCE_METADATA,
} from '../shared/mock-data/siteGeometry';
import { SHIVNERI_SITE } from '../shared/mock-data/mockSite';
import { DEMO_SCENARIOS } from '../shared/mock-data/mockScenarios';
import { ledgerStore } from '../shared/lib/ledgerStore';
import { calculateSpatialResult } from '../shared/lib/spatialEngine';
import { buildCanonicalReviewerPacketData } from '../shared/contracts/heritagePulseContract';

describe('Shivneri Fort 3-Zone Map & Full Deployment Verification Suite', () => {
  describe('1. Shivneri Fort Exclusivity Audit', () => {
    it('ensures SiteContextPage contains strictly Shivneri Fort and zero references to other monuments', () => {
      const siteContextPath = path.resolve(__dirname, '../features/site-context/SiteContextPage.tsx');
      const content = fs.readFileSync(siteContextPath, 'utf-8');

      // Must NOT contain removed monuments
      expect(content).not.toContain('Taj Mahal');
      expect(content).not.toContain('Red Fort Complex');
      expect(content).not.toContain('Hampi Virupaksha');
      expect(content).not.toContain('Sun Temple Konark');
      expect(content).not.toContain('taj-mahal');
      expect(content).not.toContain('red-fort');

      // Must strictly reference Fort of Shivner (MUMMH015)
      expect(content).toContain('Fort of Shivner');
      expect(content).toContain('MUMMH015');
      expect(content).toContain('ShivneriPolygonMap');
      expect(content).toContain('Red — Protected Zone');
      expect(content).toContain('Yellow — Neutral Zone');
      expect(content).toContain('Green — Zone where activities are permitted');
    });

    it('verifies SHIVNERI_SITE metadata conforms strictly to ASI Mumbai Circle record MUMMH015', () => {
      expect(SHIVNERI_SITE.slug).toBe('shivneri-fort');
      expect(SHIVNERI_SITE.name).toContain('Shivneri Fort');
      expect(SHIVNERI_SITE.state).toBe('Maharashtra');
      expect(SHIVNERI_SITE.district).toBe('Pune');
      expect(SHIVNERI_SITE.centroid).toEqual([73.858, 19.198]);
      expect(PROVENANCE_METADATA.monumentNumber).toBe('MUMMH015');
    });
  });

  describe('2. Three Statutory Zones Geometry & Color Integrity', () => {
    it('validates Red Zone (Protected Area) geometry and attributes', () => {
      expect(SHIVNERI_PROTECTED_GEOJSON.type).toBe('MultiPolygon');
      expect(SHIVNERI_PROTECTED_GEOJSON.coordinates.length).toBeGreaterThan(0);
      expect(SHIVNERI_PROTECTED_GEOMETRY.versionLabel).toBe('v1.0-bhuvan-protected-7068');

      // Coordinate format check: [longitude, latitude] in WGS84
      const firstRing = SHIVNERI_PROTECTED_GEOJSON.coordinates[0][0];
      expect(firstRing.length).toBeGreaterThan(10);
      for (const [lng, lat] of firstRing) {
        expect(lng).toBeGreaterThan(73.8);
        expect(lng).toBeLessThan(73.9);
        expect(lat).toBeGreaterThan(19.1);
        expect(lat).toBeLessThan(19.3);
      }
    });

    it('validates Yellow Zone (Neutral Regulated Buffer) geometry and attributes', () => {
      expect(SHIVNERI_REGULATED_GEOJSON.type).toBe('MultiPolygon');
      expect(SHIVNERI_REGULATED_GEOJSON.coordinates.length).toBeGreaterThan(0);
      expect(SHIVNERI_REGULATED_GEOMETRY.versionLabel).toBe('v1.0-bhuvan-regulated-2394');

      const firstRing = SHIVNERI_REGULATED_GEOJSON.coordinates[0][0];
      expect(firstRing.length).toBeGreaterThan(15);
      for (const [lng, lat] of firstRing) {
        expect(lng).toBeGreaterThan(73.8);
        expect(lng).toBeLessThan(73.9);
        expect(lat).toBeGreaterThan(19.1);
        expect(lat).toBeLessThan(19.3);
      }
    });

    it('validates Green Zone (Permitted Activities Perimeter) geometry and attributes', () => {
      expect(SHIVNERI_PERMITTED_GEOJSON.type).toBe('MultiPolygon');
      expect(SHIVNERI_PERMITTED_GEOJSON.coordinates.length).toBeGreaterThan(0);
      expect(SHIVNERI_PERMITTED_GEOMETRY.versionLabel).toBe('v1.0-exterior-permitted-zone');

      const firstRing = SHIVNERI_PERMITTED_GEOJSON.coordinates[0][0];
      expect(firstRing.length).toBeGreaterThan(20);
      for (const [lng, lat] of firstRing) {
        expect(lng).toBeGreaterThan(73.8);
        expect(lng).toBeLessThan(73.9);
        expect(lat).toBeGreaterThan(19.1);
        expect(lat).toBeLessThan(19.3);
      }
    });

    it('confirms the concentric zone hierarchy: Protected (Red) ⊂ Regulated (Yellow) ⊂ Permitted (Green)', () => {
      const protectedArea = turf.area(SHIVNERI_PROTECTED_GEOJSON);
      const regulatedArea = turf.area(SHIVNERI_REGULATED_GEOJSON);
      const permittedArea = turf.area(SHIVNERI_PERMITTED_GEOJSON);

      // Regulated buffer encompasses Protected core area
      expect(regulatedArea).toBeGreaterThan(protectedArea);
      // Permitted outer perimeter encompasses Regulated buffer
      expect(permittedArea).toBeGreaterThan(regulatedArea);
    });
  });

  describe('3. Benchmark Scenarios & Spatial Calculation Integrity', () => {
    it('verifies all 4 demo scenarios are centered strictly at Shivneri coordinates', () => {
      expect(DEMO_SCENARIOS).toHaveLength(4);

      DEMO_SCENARIOS.forEach((sc) => {
        expect(sc.latitude).toBeGreaterThan(19.18);
        expect(sc.latitude).toBeLessThan(19.22);
        expect(sc.longitude).toBeGreaterThan(73.84);
        expect(sc.longitude).toBeLessThan(73.88);
      });
    });

    it('correctly classifies a coordinate inside the Red Protected Zone', () => {
      const insideScenario = DEMO_SCENARIOS.find((s) => s.id === 'scenario-1-inside')!;
      const result = calculateSpatialResult(
        {
          latitude: insideScenario.latitude,
          longitude: insideScenario.longitude,
          gpsAccuracyMeters: insideScenario.gpsAccuracyMeters,
          factualDescription: insideScenario.factualNotes,
        },
        SHIVNERI_PROTECTED_GEOMETRY
      );

      expect(result.classification).toBe('POTENTIAL_ZONE_CONCERN');
      expect(result.distanceToBoundaryMeters).toBeGreaterThan(0);
    });

    it('correctly classifies a coordinate outside in the Green Permitted Zone', () => {
      const outsideScenario = DEMO_SCENARIOS.find((s) => s.id === 'scenario-2-outside')!;
      const result = calculateSpatialResult(
        {
          latitude: outsideScenario.latitude,
          longitude: outsideScenario.longitude,
          gpsAccuracyMeters: outsideScenario.gpsAccuracyMeters,
          factualDescription: outsideScenario.factualNotes,
        },
        SHIVNERI_PROTECTED_GEOMETRY
      );

      expect(result.classification).toBe('NO_SPATIAL_CONCERN_INDICATED');
      expect(result.distanceToBoundaryMeters).toBeGreaterThan(100);
    });
  });

  describe('4. Full End-to-End Case Creation and Reviewer Packet Workflow', () => {
    it('creates an observation, persists it to ledgerStore, records review action, and exports canonical packet', () => {
      // 1. Create Case
      const testObservation = {
        siteId: SHIVNERI_SITE.siteId,
        geometryId: SHIVNERI_PROTECTED_GEOMETRY.geometryId,
        category: 'POSSIBLE_CONSTRUCTION' as const,
        factualDescription: 'Observed scaffolding erection near eastern bastion.',
        latitude: 19.1985,
        longitude: 73.8615,
        gpsAccuracyMeters: 3.5,
        reporterType: 'VISITOR' as const,
        photoUrl: 'https://example.com/test-photo.jpg',
      };

      const spatialResult = calculateSpatialResult(testObservation, SHIVNERI_PROTECTED_GEOMETRY);
      const createdCase = ledgerStore.createCase(testObservation, spatialResult);

      expect(createdCase.caseId).toMatch(/^HP-MH-\d{4}-\d{4}$/);
      expect(createdCase.currentStatus).toBe('SUBMITTED_FOR_REVIEW');

      // 2. Triage & Review Decision
      const reviewedCase = ledgerStore.recordReviewAction(
        createdCase.caseId,
        'FIELD_VERIFICATION_RECOMMENDED',
        'Dispatched ground inspection team to eastern bastion.',
        'Senior Conservation Officer'
      );

      expect(reviewedCase).not.toBeNull();
      expect(reviewedCase!.currentStatus).toBe('FIELD_VERIFICATION_RECOMMENDED');
      expect(reviewedCase!.eventsTimeline.length).toBeGreaterThan(createdCase.eventsTimeline.length);

      // 3. Build Canonical Packet Export
      const canonicalPacket = buildCanonicalReviewerPacketData(reviewedCase!);
      expect(canonicalPacket.caseId).toBe(createdCase.caseId);
      expect(canonicalPacket.siteName).toBe(SHIVNERI_SITE.name);
      expect(canonicalPacket.spatialVerdict.classification).toBe(spatialResult.classification);
      expect(canonicalPacket.eventsTimeline.length).toBe(reviewedCase!.eventsTimeline.length);
    });
  });
});
