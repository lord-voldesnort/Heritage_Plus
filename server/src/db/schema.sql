-- ============================================================================
-- HERITAGE PULSE — PRODUCTION SCHEMA
-- Replaces the browser-localStorage prototype store with real PostgreSQL + PostGIS.
--
-- This schema is derived directly from the frontend's live TypeScript contracts
-- (src/shared/types/index.ts) rather than the stale BACKEND_SCHEMA.sql draft that
-- shipped in the repo, whose enum values and table shapes no longer match the
-- application (e.g. it modeled a single geometry per site; the app actually uses
-- four boundary tiers — protected / prohibited / regulated / permitted — per site).
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ----------------------------------------------------------------------------
-- Sites
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS sites (
    site_id                     TEXT PRIMARY KEY,
    slug                        TEXT UNIQUE NOT NULL,
    name                        TEXT NOT NULL,
    vernacular_name             TEXT NOT NULL,
    state                       TEXT NOT NULL,
    district                    TEXT NOT NULL,
    historical_significance     TEXT NOT NULL,
    representative_image_url    TEXT,
    source_agency               TEXT NOT NULL,
    centroid                    GEOMETRY(Point, 4326) NOT NULL,
    is_active                   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at                  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Geometry records — one row per boundary TIER per site, versioned.
-- Mirrors GeometryRecord in src/shared/types/index.ts.
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE geometry_tier_enum AS ENUM ('PROTECTED', 'PROHIBITED', 'REGULATED', 'PERMITTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE governance_state_enum AS ENUM ('SOURCE_LOGGED', 'DRAFT', 'UNDER_REVIEW', 'PILOT_PUBLISHED', 'REPLACED', 'RETIRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS geometry_records (
    geometry_id             TEXT PRIMARY KEY,
    site_id                 TEXT NOT NULL REFERENCES sites(site_id) ON DELETE RESTRICT,
    tier                    geometry_tier_enum NOT NULL,
    version_label           TEXT NOT NULL,
    source_document_or_url  TEXT NOT NULL,
    capture_date            DATE NOT NULL,
    limitation_note         TEXT NOT NULL,
    governance_state        governance_state_enum NOT NULL DEFAULT 'DRAFT',
    layer_confidence_score  NUMERIC(3, 2) NOT NULL CHECK (layer_confidence_score BETWEEN 0.00 AND 1.00),
    geom                    GEOMETRY(MultiPolygon, 4326) NOT NULL,
    created_at               TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Only one published geometry per (site, tier) at a time; older versions are REPLACED, not deleted.
    UNIQUE (site_id, tier, version_label)
);

CREATE INDEX IF NOT EXISTS idx_geometry_site_tier ON geometry_records (site_id, tier);
CREATE INDEX IF NOT EXISTS idx_geometry_spatial ON geometry_records USING GIST (geom);

-- ----------------------------------------------------------------------------
-- Observations (Change Ledger "cases")
-- Mirrors ObservationRecord in src/shared/types/index.ts.
-- computed_classification / distance_to_boundary_meters / spatial_result are
-- written ONLY by the server after running the authoritative spatial engine —
-- never trusted from the client.
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE observation_type_enum AS ENUM (
        'POSSIBLE_CONSTRUCTION', 'POSSIBLE_ENCROACHMENT', 'PHYSICAL_DAMAGE',
        'DUMPING_OR_WASTE', 'BLOCKED_ACCESS', 'ALTERATION_OR_OBSTRUCTION', 'OTHER_VISIBLE_CHANGE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE spatial_classification_enum AS ENUM (
        'POTENTIAL_ZONE_CONCERN', 'NO_SPATIAL_CONCERN_INDICATED', 'LOCATION_UNCERTAIN',
        'EVIDENCE_INSUFFICIENT', 'SOURCE_UNAVAILABLE'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE case_status_enum AS ENUM (
        'DRAFT', 'SUBMITTED_FOR_REVIEW', 'ADDITIONAL_INFORMATION_NEEDED',
        'FIELD_VERIFICATION_RECOMMENDED', 'REFERRED', 'CLOSED_INSUFFICIENT_LOCATION_EVIDENCE',
        'CLOSED_DUPLICATE', 'CLOSED_REVIEWED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE reporter_type_enum AS ENUM ('VISITOR', 'RESIDENT', 'STUDENT', 'VOLUNTEER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS observation_records (
    observation_id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id                      TEXT UNIQUE NOT NULL,
    site_id                      TEXT NOT NULL REFERENCES sites(site_id),
    geometry_id                  TEXT NOT NULL REFERENCES geometry_records(geometry_id),
    reporter_type                reporter_type_enum NOT NULL DEFAULT 'VISITOR',
    category                     observation_type_enum NOT NULL,
    factual_description          TEXT NOT NULL,
    coordinate                   GEOMETRY(Point, 4326) NOT NULL,
    gps_accuracy_meters          NUMERIC(8, 2) NOT NULL CHECK (gps_accuracy_meters >= 0),
    observed_timestamp           TIMESTAMPTZ NOT NULL,
    privacy_consent_given        BOOLEAN NOT NULL DEFAULT TRUE,
    computed_classification      spatial_classification_enum NOT NULL,
    distance_to_boundary_meters  NUMERIC(10, 2),
    spatial_reasoning_explanation TEXT NOT NULL,
    spatial_result                JSONB NOT NULL,
    current_status                case_status_enum NOT NULL DEFAULT 'SUBMITTED_FOR_REVIEW',
    is_demo_scenario              BOOLEAN NOT NULL DEFAULT FALSE,
    created_at                    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_observations_coordinate ON observation_records USING GIST (coordinate);
CREATE INDEX IF NOT EXISTS idx_observations_case_id ON observation_records (case_id);
CREATE INDEX IF NOT EXISTS idx_observations_status ON observation_records (current_status);
CREATE INDEX IF NOT EXISTS idx_observations_category ON observation_records (category);
CREATE INDEX IF NOT EXISTS idx_observations_site ON observation_records (site_id);

-- ----------------------------------------------------------------------------
-- Evidence (field photographs) — hashed server-side, never trusting client hash.
-- Mirrors EvidenceRecord in src/shared/types/index.ts.
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS evidence_records (
    evidence_id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    observation_id    UUID NOT NULL REFERENCES observation_records(observation_id) ON DELETE CASCADE,
    file_url          TEXT NOT NULL,
    file_mime_type    TEXT NOT NULL,
    file_size_bytes   BIGINT NOT NULL,
    sha256_checksum   CHAR(64) NOT NULL,
    upload_timestamp  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_evidence_observation ON evidence_records (observation_id);

-- ----------------------------------------------------------------------------
-- Review events — the append-only Change Ledger audit trail.
-- Mirrors ReviewEvent in src/shared/types/index.ts. Rows are never updated or
-- deleted by the API; only INSERTed.
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE review_event_type_enum AS ENUM (
        'OBSERVATION_CREATED', 'LOCATION_CAPTURED', 'SPATIAL_CALCULATED', 'EVIDENCE_ATTACHED',
        'REVIEW_ACTION_RECORDED', 'INFO_REQUESTED', 'STATUS_UPDATED', 'CASE_CLOSED'
    );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS review_events (
    event_id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    case_id            TEXT NOT NULL REFERENCES observation_records(case_id) ON DELETE CASCADE,
    event_timestamp    TIMESTAMPTZ NOT NULL DEFAULT now(),
    event_type         review_event_type_enum NOT NULL,
    actor_role         TEXT NOT NULL,
    summary            TEXT NOT NULL,
    action_taken       case_status_enum,
    reviewer_notes     TEXT,
    title              TEXT,
    resulting_status   case_status_enum NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_events_case ON review_events (case_id, event_timestamp);

-- ----------------------------------------------------------------------------
-- Users — real authentication for the reviewer/curator role.
-- Field observations remain anonymous/public, matching the existing app's
-- design (anyone can submit via Field Capture with no login) — only the
-- reviewer console and the ability to record review decisions require an
-- authenticated account, since that is the action with real integrity stakes.
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('REVIEWER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS users (
    user_id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email           TEXT UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    display_name    TEXT NOT NULL,
    role            user_role_enum NOT NULL DEFAULT 'REVIEWER',
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    failed_login_attempts SMALLINT NOT NULL DEFAULT 0,
    locked_until    TIMESTAMPTZ,
    last_login_at   TIMESTAMPTZ,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- Atomic case ID sequence. Case IDs look like HP-MH-2026-0001. Using a real
-- sequence (rather than scanning MAX(existing case ids) in application code,
-- as the old localStorage-era caseGenerator.ts did) guarantees uniqueness
-- under concurrent submissions without a table lock.
-- ----------------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS case_id_seq START 1;

-- ============================================================================
-- Research and asynchronous-processing foundations. These tables record
-- lifecycle and provenance metadata; workers must write measured outputs and
-- never fabricate EO or benchmark results.
-- ============================================================================
DO $$ BEGIN
  CREATE TYPE processing_job_status_enum AS ENUM ('QUEUED', 'RUNNING', 'SUCCEEDED', 'FAILED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS processing_jobs (
    job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type TEXT NOT NULL,
    status processing_job_status_enum NOT NULL DEFAULT 'QUEUED',
    requested_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    progress_percent NUMERIC(5,2) NOT NULL DEFAULT 0 CHECK (progress_percent >= 0 AND progress_percent <= 100),
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    failure_reason TEXT,
    logs TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_processing_jobs_status ON processing_jobs(status, created_at);

CREATE TABLE IF NOT EXISTS provenance_records (
    provenance_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    input_kind TEXT NOT NULL,
    input_reference TEXT NOT NULL,
    source_uri TEXT,
    acquisition_time TIMESTAMPTZ,
    processing_version TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    code_version TEXT,
    environment JSONB NOT NULL DEFAULT '{}'::jsonb,
    output_reference TEXT,
    validation_state TEXT NOT NULL DEFAULT 'UNVALIDATED',
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_provenance_input ON provenance_records(input_kind, input_reference);

CREATE TABLE IF NOT EXISTS dataset_versions (
    dataset_version_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_id TEXT NOT NULL,
    version_label TEXT NOT NULL,
    description TEXT NOT NULL,
    creator UUID REFERENCES users(user_id) ON DELETE SET NULL,
    source_uri TEXT,
    license TEXT,
    schema_document TEXT,
    checksum_sha256 TEXT,
    parent_dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    provenance_id UUID REFERENCES provenance_records(provenance_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(dataset_id, version_label)
);

CREATE TABLE IF NOT EXISTS experiments (
    experiment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    experiment_name TEXT NOT NULL,
    hypothesis TEXT NOT NULL,
    dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    algorithm_name TEXT NOT NULL,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    code_version TEXT,
    environment JSONB NOT NULL DEFAULT '{}'::jsonb,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    results JSONB NOT NULL DEFAULT '{}'::jsonb,
    researcher UUID REFERENCES users(user_id) ON DELETE SET NULL,
    provenance_id UUID REFERENCES provenance_records(provenance_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS model_registry (
    model_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    model_name TEXT NOT NULL,
    model_version TEXT NOT NULL,
    training_dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    validation_dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
    parameters JSONB NOT NULL DEFAULT '{}'::jsonb,
    feature_definitions JSONB NOT NULL DEFAULT '{}'::jsonb,
    code_version TEXT,
    checksum_sha256 TEXT,
    limitations TEXT NOT NULL,
    intended_use TEXT NOT NULL,
    approval_status TEXT NOT NULL DEFAULT 'UNVALIDATED',
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(model_name, model_version)
);

CREATE TABLE IF NOT EXISTS benchmark_annotations (
    annotation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    observation_id UUID REFERENCES observation_records(observation_id) ON DELETE SET NULL,
    annotator UUID REFERENCES users(user_id) ON DELETE SET NULL,
    ground_truth_label TEXT,
    researcher_annotation TEXT,
    evidence_reference TEXT,
    spatial_accuracy_meters NUMERIC,
    temporal_accuracy_days NUMERIC,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS research_exports (
    export_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    export_format TEXT NOT NULL CHECK (export_format IN ('CSV', 'GEOJSON', 'JSON', 'PACKAGE')),
    dataset_version_id UUID REFERENCES dataset_versions(dataset_version_id) ON DELETE RESTRICT,
    provenance_id UUID REFERENCES provenance_records(provenance_id) ON DELETE RESTRICT,
    file_url TEXT,
    checksum_sha256 TEXT,
    created_by UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_logs (
    audit_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    request_id TEXT,
    action TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    details JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource ON audit_logs(resource_type, resource_id, created_at);
