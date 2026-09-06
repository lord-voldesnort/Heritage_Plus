-- ============================================================================
-- HERITAGE PULSE (हेरिटेज पल्स) - POSTGIS DATABASE SCHEMA & SEED PACK
-- SIH 2026 · Problem Statement PS 26197 · Team Sinister Six
-- Compatible with PostgreSQL 15+ & PostGIS 3.3+
-- Target Prototype Site: Shivneri Fort, Maharashtra
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DROP TYPE IF EXISTS visible_change_category_enum CASCADE;
CREATE TYPE visible_change_category_enum AS ENUM (
    'POSSIBLE_CONSTRUCTION',
    'POSSIBLE_ENCROACHMENT',
    'PHYSICAL_DAMAGE',
    'DUMPING_OR_WASTE',
    'BLOCKED_ACCESS',
    'ALTERATION',
    'VISUAL_OBSTRUCTION',
    'OTHER_VISIBLE_CHANGE'
);

DROP TYPE IF EXISTS spatial_classification_enum CASCADE;
CREATE TYPE spatial_classification_enum AS ENUM (
    'POTENTIAL_ZONE_CONCERN',
    'NO_SPATIAL_CONCERN',
    'LOCATION_UNCERTAIN',
    'CLASSIFICATION_UNAVAILABLE'
);

DROP TYPE IF EXISTS governance_state_enum CASCADE;
CREATE TYPE governance_state_enum AS ENUM (
    'SOURCE_LOGGED',
    'DRAFT',
    'UNDER_REVIEW',
    'PILOT_PUBLISHED',
    'REPLACED',
    'RETIRED'
);

DROP TYPE IF EXISTS review_action_enum CASCADE;
CREATE TYPE review_action_enum AS ENUM (
    'SUBMITTED',
    'ADDITIONAL_INFO_NEEDED',
    'FIELD_VERIFICATION_RECOMMENDED',
    'REFERRED_MANUALLY',
    'CLOSED_INSUFFICIENT_LOCATION',
    'CLOSED_DUPLICATE',
    'CLOSED_REVIEWED'
);

-- 3. CORE TABLES

-- Table 1: Sites (Site Context Card)
CREATE TABLE IF NOT EXISTS sites (
    site_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    official_name_en VARCHAR(255) NOT NULL,
    vernacular_name_mr VARCHAR(255) NOT NULL,
    state_province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    historical_significance TEXT NOT NULL,
    representative_image_url VARCHAR(500),
    centroid_location GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Geometry Records (Source Versioning & Governance)
CREATE TABLE IF NOT EXISTS geometry_records (
    geometry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_id UUID NOT NULL REFERENCES sites(site_id) ON DELETE RESTRICT,
    version_label VARCHAR(50) NOT NULL,
    source_document_or_url TEXT NOT NULL,
    capture_date DATE NOT NULL,
    reviewer_name VARCHAR(150),
    limitation_note TEXT NOT NULL,
    governance_state governance_state_enum DEFAULT 'DRAFT',
    layer_confidence_score NUMERIC(3, 2) CHECK (layer_confidence_score BETWEEN 0.00 AND 1.00),
    site_geometry GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_geometry_site ON geometry_records(site_id);
CREATE INDEX IF NOT EXISTS idx_geometry_spatial ON geometry_records USING GIST(site_geometry);

-- Table 3: Observation Records (Field Observations)
CREATE TABLE IF NOT EXISTS observation_records (
    observation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id VARCHAR(30) UNIQUE NOT NULL,
    site_id UUID NOT NULL REFERENCES sites(site_id),
    geometry_id UUID NOT NULL REFERENCES geometry_records(geometry_id),
    reporter_type VARCHAR(50) DEFAULT 'VISITOR',
    category visible_change_category_enum NOT NULL,
    factual_description TEXT NOT NULL,
    coordinate GEOMETRY(Point, 4326) NOT NULL,
    gps_accuracy_meters NUMERIC(6, 2) NOT NULL,
    observed_timestamp TIMESTAMPTZ NOT NULL,
    privacy_consent_given BOOLEAN DEFAULT TRUE,
    computed_classification spatial_classification_enum NOT NULL,
    distance_to_boundary_meters NUMERIC(8, 2),
    reasoning_explanation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_observations_coordinate ON observation_records USING GIST(coordinate);
CREATE INDEX IF NOT EXISTS idx_observations_case_id ON observation_records(case_id);

-- Table 4: Evidence Records (Photographs & Metadata)
CREATE TABLE IF NOT EXISTS evidence_records (
    evidence_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID NOT NULL REFERENCES observation_records(observation_id) ON DELETE CASCADE,
    photo_storage_url VARCHAR(500) NOT NULL,
    upload_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    file_mime_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum CHAR(64) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidence_observation ON evidence_records(observation_id);

-- Table 5: Review Events (Change Ledger Audit Trail)
CREATE TABLE IF NOT EXISTS review_events (
    event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID NOT NULL REFERENCES observation_records(observation_id) ON DELETE CASCADE,
    reviewer_role VARCHAR(100) NOT NULL,
    action review_action_enum NOT NULL,
    reviewer_notes TEXT,
    next_status VARCHAR(100) NOT NULL,
    event_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_review_events_obs ON review_events(observation_id);

-- 4. AUTOMATED SPATIAL COMPUTATION TRIGGER
CREATE OR REPLACE FUNCTION fn_compute_spatial_uncertainty()
RETURNS TRIGGER AS $$
DECLARE
    v_geom GEOMETRY;
    v_confidence NUMERIC;
    v_dist NUMERIC;
    v_inside BOOLEAN;
    v_acc NUMERIC;
BEGIN
    SELECT site_geometry, layer_confidence_score 
    INTO v_geom, v_confidence
    FROM geometry_records
    WHERE geometry_id = NEW.geometry_id;

    v_acc := NEW.gps_accuracy_meters;

    -- Governance Check
    IF v_confidence < 0.70 THEN
        NEW.computed_classification := 'CLASSIFICATION_UNAVAILABLE';
        NEW.reasoning_explanation := 'Classification unavailable; source review required.';
        NEW.distance_to_boundary_meters := NULL;
        RETURN NEW;
    END IF;

    -- Degraded GPS Gatekeeper
    IF v_acc > 35.0 THEN
        NEW.computed_classification := 'LOCATION_UNCERTAIN';
        NEW.reasoning_explanation := 'Location evidence insufficient. Device reported GPS error (' || ROUND(v_acc, 1) || 'm) exceeds 35m threshold.';
        NEW.distance_to_boundary_meters := NULL;
        RETURN NEW;
    END IF;

    -- Geodesic Distance Computation
    v_dist := ST_Distance(NEW.coordinate::geography, v_geom::geography);
    v_inside := ST_Covers(v_geom, NEW.coordinate);

    NEW.distance_to_boundary_meters := ROUND(v_dist, 2);

    -- Accuracy Circle Overlap Check
    IF v_dist <= v_acc AND NOT v_inside THEN
        NEW.computed_classification := 'LOCATION_UNCERTAIN';
        NEW.reasoning_explanation := 'Location uncertain – the GPS accuracy circle (±' || ROUND(v_acc, 1) || 
            'm) overlaps the zone boundary (' || ROUND(v_dist, 1) || 'm distance). Additional evidence required.';
    ELSIF v_inside THEN
        NEW.computed_classification := 'POTENTIAL_ZONE_CONCERN';
        NEW.reasoning_explanation := 'Potential zone-related concern – the reported point appears within the pilot zone layer. GPS accuracy is ' || 
            ROUND(v_acc, 1) || 'm. This is not a legal finding; authority verification is required.';
    ELSE
        NEW.computed_classification := 'NO_SPATIAL_CONCERN';
        NEW.reasoning_explanation := 'No spatial concern indicated by this layer (point is ' || ROUND(v_dist, 1) || 'm outside). This does not prove absence of other issues.';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_insert_observation ON observation_records;
CREATE TRIGGER trg_before_insert_observation
BEFORE INSERT ON observation_records
FOR EACH ROW
EXECUTE FUNCTION fn_compute_spatial_uncertainty();

-- ============================================================================
-- 5. SEED DATA PACK (Shivneri Fort, Junnar, Maharashtra)
-- ============================================================================

INSERT INTO sites (
    site_id, slug, official_name_en, vernacular_name_mr, state_province, district,
    historical_significance, centroid_location
) VALUES (
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'shivneri-fort',
    'Shivneri Fort Monument Complex',
    'शिवनेरी किल्ला परिसर',
    'Maharashtra',
    'Pune',
    'Shivneri Fort is a 17th-century hill fort near Junnar in Pune district, Maharashtra. It is celebrated as the birthplace of Chhatrapati Shivaji Maharaj, the founder of the Maratha Empire. The fort features massive stone gateways, rock-cut water cisterns, and defensive bastions.',
    ST_SetSRID(ST_MakePoint(73.8624, 19.1982), 4326)
) ON CONFLICT (slug) DO NOTHING;

INSERT INTO geometry_records (
    geometry_id, site_id, version_label, source_document_or_url, capture_date,
    reviewer_name, limitation_note, governance_state, layer_confidence_score, site_geometry
) VALUES (
    'd29073b4-8b01-49e9-9c3a-2300461c238b',
    'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    'v1.0-pilot-shivneri',
    'State Archaeological Department Gazette & Digitized Survey Sheet SMR-MH-JUN-01',
    '2023-11-10',
    'Heritage GIS Review Team',
    'Test polygon for prototype evaluation. Western cliff edge boundaries derived from 1:5000 scale survey sheets.',
    'PILOT_PUBLISHED',
    0.90,
    ST_Multi(ST_GeomFromText('POLYGON((
        73.8600 19.1950,
        73.8650 19.1950,
        73.8650 19.2010,
        73.8600 19.2010,
        73.8600 19.1950
    ))', 4326))
) ON CONFLICT DO NOTHING;
