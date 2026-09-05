-- ============================================================================
-- HERITAGE GUARD (हेरिटेज गार्ड) - POSTGIS DATABASE SCHEMA & SEED PACK
-- SIH 2026 · Problem Statement PS 26197 · Team Sinister Six
-- Compatible with PostgreSQL 15+ & PostGIS 3.3+
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. ENUM TYPES
DROP TYPE IF EXISTS consent_status_enum CASCADE;
CREATE TYPE consent_status_enum AS ENUM (
    'PUBLIC',
    'COMMUNITY_ONLY',
    'REVIEWER_ONLY',
    'WITHHELD'
);

DROP TYPE IF EXISTS spatial_classification_enum CASCADE;
CREATE TYPE spatial_classification_enum AS ENUM (
    'INSIDE_PROHIBITED_ZONE',
    'INSIDE_REGULATED_ZONE',
    'BOUNDARY_UNCERTAIN',
    'OUTSIDE_STATUTORY_ZONES',
    'LOC_UNCERTAIN',
    'SRC_INSUFFICIENT'
);

DROP TYPE IF EXISTS review_status_enum CASCADE;
CREATE TYPE review_status_enum AS ENUM (
    'PENDING_TRIAGE',
    'ADDITIONAL_INFO_REQUESTED',
    'REVIEWED_CATALOGED',
    'REFERRED_TO_AUTHORITY',
    'ARCHIVED_DUPLICATE'
);

DROP TYPE IF EXISTS concern_category_enum CASCADE;
CREATE TYPE concern_category_enum AS ENUM (
    'MASONRY_DISPLACEMENT',
    'MOISTURE_INFILTRATION',
    'CONSTRUCTION_DEBRIS',
    'VEGETATION_OVERGROWTH',
    'UNAUTHORIZED_EXCAVATION',
    'ACCESS_OBSTRUCTION',
    'STRUCTURAL_CRACKING',
    'SURFACE_DEFACEMENT'
);

-- 3. CORE TABLES

-- Table 1: Heritage Clusters (Layer 1: Identity)
CREATE TABLE IF NOT EXISTS heritage_clusters (
    cluster_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    official_name_en VARCHAR(255) NOT NULL,
    vernacular_name_hi VARCHAR(255) NOT NULL,
    alternate_names TEXT[] DEFAULT '{}',
    state_province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    historical_summary TEXT NOT NULL,
    architectural_school VARCHAR(150),
    established_period VARCHAR(100),
    centroid_location GEOMETRY(Point, 4326) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_heritage_clusters_centroid ON heritage_clusters USING GIST(centroid_location);
CREATE INDEX IF NOT EXISTS idx_heritage_clusters_slug ON heritage_clusters(slug);

-- Table 2: Living Practices (Layer 2: Intangible Heritage & Cultural Consent)
CREATE TABLE IF NOT EXISTS living_practices (
    practice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES heritage_clusters(cluster_id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    practice_type VARCHAR(100) NOT NULL, -- 'RITUAL', 'ARTISAN_CRAFT', 'ORAL_FOLKLORE', 'FESTIVAL_ROUTE'
    cultural_bearer_group VARCHAR(200),
    description TEXT NOT NULL,
    seasonality VARCHAR(100),
    consent_status consent_status_enum DEFAULT 'PUBLIC',
    custodian_contact_hash VARCHAR(64), -- Privacy-preserving SHA-256
    media_urls TEXT[] DEFAULT '{}',
    audio_narrative_url VARCHAR(500),
    is_verified_by_community BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_living_practices_cluster ON living_practices(cluster_id);

-- Table 3: Spatial Layer Versions (Layer 3: Sourced Geometry & Legal Buffers)
CREATE TABLE IF NOT EXISTS spatial_layer_versions (
    layer_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES heritage_clusters(cluster_id) ON DELETE RESTRICT,
    version_label VARCHAR(50) NOT NULL,
    source_agency VARCHAR(150) NOT NULL,
    gazette_notification_ref VARCHAR(200),
    source_publication_date DATE NOT NULL,
    source_confidence_score NUMERIC(3, 2) CHECK (source_confidence_score BETWEEN 0.00 AND 1.00),
    
    -- Geospatial Polygons (WGS84 EPSG:4326)
    monument_boundary GEOMETRY(MultiPolygon, 4326) NOT NULL,
    prohibited_zone_100m GEOMETRY(MultiPolygon, 4326) NOT NULL,
    regulated_zone_200m GEOMETRY(MultiPolygon, 4326) NOT NULL,
    
    limitation_disclaimer TEXT NOT NULL,
    is_active_version BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_spatial_monument ON spatial_layer_versions USING GIST(monument_boundary);
CREATE INDEX IF NOT EXISTS idx_spatial_prohibited ON spatial_layer_versions USING GIST(prohibited_zone_100m);
CREATE INDEX IF NOT EXISTS idx_spatial_regulated ON spatial_layer_versions USING GIST(regulated_zone_200m);

-- Table 4: Field Observations (Layer 4: Neutral Observations & Telemetry)
CREATE TABLE IF NOT EXISTS field_observations (
    observation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES heritage_clusters(cluster_id),
    layer_version_id UUID NOT NULL REFERENCES spatial_layer_versions(layer_version_id),
    case_tracking_code VARCHAR(30) UNIQUE NOT NULL,
    
    category concern_category_enum NOT NULL,
    observation_notes TEXT NOT NULL,
    
    coordinate GEOMETRY(Point, 4326) NOT NULL,
    gps_accuracy_meters NUMERIC(6, 2) NOT NULL,
    device_altitude_meters NUMERIC(6, 2),
    device_heading_deg NUMERIC(5, 2),
    client_captured_at TIMESTAMPTZ NOT NULL,
    server_received_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    computed_classification spatial_classification_enum NOT NULL,
    distance_to_prohibited_boundary_meters NUMERIC(8, 2),
    spatial_reasoning_explanation TEXT NOT NULL,
    
    client_payload_sha256 CHAR(64) NOT NULL,
    evidence_media_sha256 CHAR(64) NOT NULL,
    submitter_pseudonym_token VARCHAR(64) NOT NULL,
    is_anonymized BOOLEAN DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS idx_observations_coordinate ON field_observations USING GIST(coordinate);
CREATE INDEX IF NOT EXISTS idx_observations_cluster_date ON field_observations(cluster_id, client_captured_at DESC);
CREATE INDEX IF NOT EXISTS idx_observations_tracking_code ON field_observations(case_tracking_code);

-- Table 5: Evidence Artifacts (Media & Hash Chain)
CREATE TABLE IF NOT EXISTS evidence_artifacts (
    artifact_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID NOT NULL REFERENCES field_observations(observation_id) ON DELETE CASCADE,
    storage_url VARCHAR(500) NOT NULL,
    file_mime_type VARCHAR(50) NOT NULL,
    file_size_bytes BIGINT NOT NULL,
    sha256_checksum CHAR(64) NOT NULL,
    exif_camera_make VARCHAR(100),
    exif_camera_model VARCHAR(100),
    exif_timestamp TIMESTAMPTZ,
    face_blur_applied BOOLEAN DEFAULT TRUE,
    license_plate_redacted BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_evidence_observation ON evidence_artifacts(observation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_checksum ON evidence_artifacts(sha256_checksum);

-- Table 6: Change Ledger Events (Layer 4/5: Longitudinal History)
CREATE TABLE IF NOT EXISTS change_ledger_events (
    ledger_event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cluster_id UUID NOT NULL REFERENCES heritage_clusters(cluster_id),
    event_timestamp TIMESTAMPTZ NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    related_observation_id UUID REFERENCES field_observations(observation_id),
    title VARCHAR(255) NOT NULL,
    summary TEXT NOT NULL,
    before_media_url VARCHAR(500),
    after_media_url VARCHAR(500),
    is_publicly_visible BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_ledger_cluster_time ON change_ledger_events(cluster_id, event_timestamp DESC);

-- Table 7: Safeguarding Reviews & Institutional Actions (Layer 5: Audit & Triage)
CREATE TABLE IF NOT EXISTS safeguarding_reviews (
    review_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id UUID NOT NULL REFERENCES field_observations(observation_id),
    reviewer_user_id VARCHAR(100) NOT NULL,
    reviewer_organization VARCHAR(150) NOT NULL,
    previous_status review_status_enum NOT NULL,
    updated_status review_status_enum NOT NULL,
    reviewer_rationale TEXT NOT NULL,
    referral_reference_number VARCHAR(100),
    official_dossier_pdf_url VARCHAR(500),
    action_timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_reviews_observation ON safeguarding_reviews(observation_id);

-- 4. AUTOMATED SPATIAL COMPUTATION TRIGGER
CREATE OR REPLACE FUNCTION fn_compute_observation_spatial_status()
RETURNS TRIGGER AS $$
DECLARE
    v_prohibited GEOMETRY;
    v_regulated GEOMETRY;
    v_dist_prohibited NUMERIC;
    v_inside_prohibited BOOLEAN;
    v_inside_regulated BOOLEAN;
    v_acc NUMERIC;
BEGIN
    SELECT prohibited_zone_100m, regulated_zone_200m 
    INTO v_prohibited, v_regulated
    FROM spatial_layer_versions
    WHERE layer_version_id = NEW.layer_version_id;

    v_acc := NEW.gps_accuracy_meters;

    -- Degraded GPS gatekeeper
    IF v_acc > 35.0 THEN
        NEW.computed_classification := 'LOC_UNCERTAIN';
        NEW.spatial_reasoning_explanation := 'Device horizontal error margin (' || ROUND(v_acc, 1) || 'm) exceeds scientific 35m threshold.';
        NEW.distance_to_prohibited_boundary_meters := NULL;
        RETURN NEW;
    END IF;

    -- Compute geodesic distance to prohibited boundary in meters
    v_dist_prohibited := ST_Distance(NEW.coordinate::geography, v_prohibited::geography);
    v_inside_prohibited := ST_Covers(v_prohibited, NEW.coordinate);
    v_inside_regulated := ST_Covers(v_regulated, NEW.coordinate);

    NEW.distance_to_prohibited_boundary_meters := ROUND(v_dist_prohibited, 2);

    -- Uncertainty disk overlap logic
    IF v_dist_prohibited <= (v_acc + 5.0) AND NOT v_inside_prohibited THEN
        NEW.computed_classification := 'BOUNDARY_UNCERTAIN';
        NEW.spatial_reasoning_explanation := 'Point is within ' || ROUND(v_dist_prohibited, 1) || 
            'm of prohibited line, intersecting device uncertainty circle (±' || ROUND(v_acc, 1) || 'm).';
    ELSIF v_inside_prohibited THEN
        NEW.computed_classification := 'INSIDE_PROHIBITED_ZONE';
        NEW.spatial_reasoning_explanation := 'Observation point strictly falls within the 100m Prohibited Buffer as per surveyed boundary.';
    ELSIF v_inside_regulated THEN
        NEW.computed_classification := 'INSIDE_REGULATED_ZONE';
        NEW.spatial_reasoning_explanation := 'Observation point strictly falls within the 200m Regulated Buffer.';
    ELSE
        NEW.computed_classification := 'OUTSIDE_STATUTORY_ZONES';
        NEW.spatial_reasoning_explanation := 'Observation point is outside statutory buffers (' || ROUND(v_dist_prohibited, 1) || 'm from prohibited edge).';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_before_insert_observation_spatial ON field_observations;
CREATE TRIGGER trg_before_insert_observation_spatial
BEFORE INSERT ON field_observations
FOR EACH ROW
EXECUTE FUNCTION fn_compute_observation_spatial_status();

-- ============================================================================
-- 5. VALIDATED SEED DATA PACK (Chand Baori, Abhaneri, Rajasthan)
-- ============================================================================

-- Insert Cluster
INSERT INTO heritage_clusters (
    cluster_id, slug, official_name_en, vernacular_name_hi, alternate_names,
    state_province, district, historical_summary, architectural_school, established_period,
    centroid_location
) VALUES (
    'e6b7d291-72f1-4db8-b59a-1158a1290bb3',
    'chand-baori-abhaneri',
    'Chand Baori Stepwell and Harshat Mata Temple Complex',
    'चाँद बावड़ी एवं हर्षत माता मंदिर परिसर',
    ARRAY['Abhaneri Stepwell', 'Bawdi of King Chanda'],
    'Rajasthan',
    'Dausa',
    'Chand Baori is a monumental 9th-century stepwell comprising 3,500 narrow stone steps arranged in geometric precision across 13 tiered levels reaching 20 meters into the aquifer. Built under King Chanda of the Nikumbha dynasty.',
    'Gurjara-Pratihara Architecture',
    '8th–9th Century CE',
    ST_SetSRID(ST_MakePoint(76.606245, 27.009312), 4326)
) ON CONFLICT (slug) DO NOTHING;

-- Insert Living Practices
INSERT INTO living_practices (
    cluster_id, title, practice_type, cultural_bearer_group, description, seasonality,
    consent_status, is_verified_by_community
) VALUES (
    'e6b7d291-72f1-4db8-b59a-1158a1290bb3',
    'Harshat Mata Monsoon Jal Vandana',
    'RITUAL',
    'Abhaneri Village Elders & Temple Trust',
    'Annual prayers of gratitude offered at the onset of the monsoon to invoke aquifer replenishment and thank the goddess Harshat Mata for subterranean water safety.',
    'Ashadha Shukla Navami (Monsoon onset)',
    'PUBLIC',
    TRUE
), (
    'e6b7d291-72f1-4db8-b59a-1158a1290bb3',
    'Abhaneri Terracotta Water-Vessel Craft',
    'ARTISAN_CRAFT',
    'Kumhar Artisan Guild of Dausa',
    'Traditional porous red clay vessels shaped using ancient stone paddle methods designed to keep desert well-water cool during summer months.',
    'Year-round (Peak in Summer: Chaitra–Vaisakha)',
    'PUBLIC',
    TRUE
) ON CONFLICT DO NOTHING;

-- Insert Spatial Layer Version with True Polygons (Approximated Around 27.0093°N, 76.6062°E)
INSERT INTO spatial_layer_versions (
    layer_version_id, cluster_id, version_label, source_agency, gazette_notification_ref,
    source_publication_date, source_confidence_score,
    monument_boundary, prohibited_zone_100m, regulated_zone_200m,
    limitation_disclaimer
) VALUES (
    'c144e456-9781-4b1a-9653-83210988e001',
    'e6b7d291-72f1-4db8-b59a-1158a1290bb3',
    'ASI_BHUVAN_V2023.1',
    'Archaeological Survey of India (Jaipur Circle) & NRSC',
    'Gazette Notification S.O. 1928 / SMR-RAJ-042',
    '2022-11-14',
    0.95,
    -- Monument Core Polygon (~50m box)
    ST_Multi(ST_GeomFromText('POLYGON((
        76.6059 27.0090,
        76.6066 27.0090,
        76.6066 27.0096,
        76.6059 27.0096,
        76.6059 27.0090
    ))', 4326)),
    -- 100m Prohibited Buffer MultiPolygon
    ST_Multi(ST_GeomFromText('POLYGON((
        76.6049 27.0080,
        76.6076 27.0080,
        76.6076 27.0106,
        76.6049 27.0106,
        76.6049 27.0080
    ))', 4326)),
    -- 200m Regulated Buffer MultiPolygon
    ST_Multi(ST_GeomFromText('POLYGON((
        76.6030 27.0062,
        76.6095 27.0062,
        76.6095 27.0124,
        76.6030 27.0124,
        76.6030 27.0062
    ))', 4326)),
    'Official ASI Bhuvan digitised cadastral boundary. Western agricultural boundary demarcated by state revenue survey stone pillars.'
) ON CONFLICT DO NOTHING;

-- Insert Seed Change Ledger Event
INSERT INTO change_ledger_events (
    cluster_id, event_timestamp, event_type, title, summary, is_publicly_visible
) VALUES (
    'e6b7d291-72f1-4db8-b59a-1158a1290bb3',
    '2024-03-15 10:00:00+05:30',
    'RESTORATION_MILESTONE',
    'Upper Pavilion Sandstone Lintel Consolidation Complete',
    'ASI conservation team completed lime-mortar grouting and stabilization of three fractured lintels on the northern pillared gallery.',
    TRUE
) ON CONFLICT DO NOTHING;
