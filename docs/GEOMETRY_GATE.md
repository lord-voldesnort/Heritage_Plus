# GEOMETRY GO/NO-GO GATE SPECIFICATION
## Heritage Pulse · Quality & Spatial Rigor Gate (GATE-01)
**Gate Owners**: Ameya (Integration Lead) & Vishwajeet (Spatial Lead)  
*Status*: **PASSED_WITH_LIMITATIONS** (Verified on 2026-09-07)

---

## 1. Executive Gate Decision & Provenance Summary

The geometry gate for **Fort of Shivner (Shivneri Fort, Junnar, Maharashtra — ASI Monument MUMMH015)** has been formally passed with documented source limitations (`PASSED_WITH_LIMITATIONS`).

### Source & Reverse-Engineering Metadata
- **Source Agency**: Bhuvan / NRSC (ISRO) in association with Archaeological Survey of India (ASI)
- **Portal URL**: [https://bhuvan-app1.nrsc.gov.in/culture_monuments/](https://bhuvan-app1.nrsc.gov.in/culture_monuments/)
- **Portal JS Configuration**: `https://bhuvan-app1.nrsc.gov.in/culture_monuments/usrtasks/asi_v2/asi23.js`
- **Inline PHP Backend**: `usrtasks/asi_v2/asi.php`
- **WMS Endpoint**: `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms`
- **WFS Endpoint Status**: `https://bhuvan-vec2.nrsc.gov.in/bhuvan/wfs` returned `ServiceUnavailable — Service WFS is disabled`. Extraction relies on WMS `GetFeatureInfo` with GeoJSON output.
- **WMS Query Parameters**: `SERVICE=WMS&VERSION=1.1.1&REQUEST=GetFeatureInfo&LAYERS=asi:<layer>&QUERY_LAYERS=asi:<layer>&SRS=EPSG:4326&BBOX=73.80,19.14,73.90,19.24&WIDTH=800&HEIGHT=800&X=423&Y=375&INFO_FORMAT=application/json&FEATURE_COUNT=10`
- **CQL Filter Verification**: Tested `CQL_FILTER=mon_num='MUMMH015'`. Confirmed server-generated feature `fid` changes across requests (e.g. `protected_areas.fid--64429d2b_...` vs `protected_areas.fid--4cf5ebed_...`).
- **Monument Number**: `MUMMH015`
- **Monument Name**: Fort of Shivner
- **Retrieval Date**: `2026-09-07`
- **Coordinate Reference System (CRS)**: `EPSG:4326` (`urn:ogc:def:crs:EPSG::4326`)
- **Geometry Type**: `MultiPolygon`

### Sourced Layers & Durable Keys
1. **Protected Areas Layer**:
   - `layer`: `asi:protected_areas`
   - `gid`: `7068`
   - `buff_dist`: Base monument footprint
   - `sha256`: `4ba4be0672dd46703760c3022f5e1391ea592262b11209f06a9ed3045f69761e`
2. **Prohibited Boundary Layer**:
   - `layer`: `asi:prohibited_boundary`
   - `gid`: `9785`
   - `buff_dist`: `100` meters
   - `sha256`: `928fc7aa8f98c92f13411f76cc7df18693eb86d4bf333faa4e0804da8d51b168`
3. **Regulated Boundary Layer**:
   - `layer`: `asi:regulated_boundary`
   - `gid`: `2394`
   - `buff_dist`: `300` meters
   - `sha256`: `9d03d5f3bbfb0b8913b7569a597f4dd4097d363bb7d0143c250d301c9afd85f2`

### Durable Key Rule (`fid` Instability)
WFS/WMS server-generated feature `fid` values are dynamic and change across queries. The codebase strictly enforces the durable key tuple:
$$\text{Durable Key} = (\text{mon\_num: "MUMMH015"}, \text{layer\_name}, \text{gid})$$

---

## 2. Independent Automated Validation & Topological Nesting Check

An automated test suite (`src/shared/lib/geometryNesting.test.ts`) runs on every test execution to verify:
1. **Topological Validity**: All 3 MultiPolygon layers are topologically valid (`turf.booleanValid` = `true`).
2. **Spatial Nesting**: `asi:protected_areas` $\subset$ `asi:prohibited_boundary` $\subset$ `asi:regulated_boundary`.
3. **Surface Area Progression**: Area(Protected: 751,999 m²) < Area(Prohibited: 1,193,489 m²) < Area(Regulated: 2,266,200 m²).
4. **Reference Coordinate Behavior**: Official ASI/Bhuvan reference coordinate ($19.1931225^\circ\text{N}, 73.8528893^\circ\text{E}$) falls **outside** `protected_areas` but **inside** `prohibited_boundary` and `regulated_boundary`. This is a documented source characteristic and is maintained as a core edge-case benchmark scenario.

---

## 3. Mandatory Source Limitations & UI Language Standards

> [!WARNING]
> **Verbatim Bhuvan Legal & Version Notices**:
> 
> 1. **Bhuvan ASI Mapping Disclaimer**:
> *"The location and the protected boundary of the monuments have been mapped in association with Archaeological Survey of India and need to be verified for its correctness and completeness by ASI. The database is meant for visualization and indicative purpose only and cannot be used for any legal purpose. BHUVAN portal and ISRO is not responsible for its authenticity. For any queries, please contact Archaeological Survey of India, New Delhi. Authenticity and validation of the location of the sites and monuments is in progress."*
> 
> 2. **Bhuvan Version Disclaimer**:
> *"BhuvanDisclaimer: This is version 1.0 data. Improvements are being done. NRSC/ISRO disowns responsibility for any inadvertent errors, beyond its limitations."*

### Approved Application UI Labels
- **Badge Label**: *"Bhuvan/NRSC ASI-associated indicative layer"*
- **Authority Notice**: *"Source-labelled spatial context — authority verification required"*
- **Disclaimer Statement**: *"Version 1.0 source data; not independently legally verified"*

### Forbidden Accusatory Terms
The codebase strictly bans terms like "legally verified", "legally notified", "proof of encroachment", "proof of illegality", or "official ownership boundary".

---

## 4. Unblocked Downstream Tasks
With `GATE_STATUS.json` marked `PASSED_WITH_LIMITATIONS`, the following spatial and map development tasks are formally **UNBLOCKED**:
- `SPATIAL-01`: Point-in-Polygon & Boundary Distance Calculations (Vishwajeet)
- `SPATIAL-02`: Accuracy-Circle Overlap & Uncertainty Evaluator
- `UI-02`: Interactive Map View with Bhuvan Layer Vectors
- `LEDGER-01`: Change Ledger Integration
