import { GeometryRecord } from '../types';

export const PROVENANCE_METADATA = {
  sourceAgency: 'Bhuvan / NRSC (ISRO) in association with Archaeological Survey of India (ASI)',
  portalUrl: 'https://bhuvan-app1.nrsc.gov.in/culture_monuments/',
  portalJsUrl: 'https://bhuvan-app1.nrsc.gov.in/culture_monuments/usrtasks/asi_v2/asi23.js',
  inlineSourceScript: 'usrtasks/asi_v2/asi.php',
  wmsEndpoint: 'https://bhuvan-vec2.nrsc.gov.in/bhuvan/wms',
  wfsStatus: 'Disabled (https://bhuvan-vec2.nrsc.gov.in/bhuvan/wfs returns OGC ServiceUnavailable)',
  retrievalMethod: 'One-time manual offline data extraction via WMS GetFeatureInfo (INFO_FORMAT=application/json) during development; no live in-app network API capability',
  monumentNumber: 'MUMMH015',
  monumentName: 'Fort of Shivner',
  retrievalDate: '2026-09-07',
  crs: 'EPSG:4326',
  geometryType: 'MultiPolygon',
  bhuvanVersionStatement: 'Version 1.0 source data; not independently legally verified',
  verbatimAsiDisclaimer:
    'The location and the protected boundary of the monuments have been mapped in association with Archaeological Survey of India and need to be verified for its correctness and completeness by ASI. The database is meant for visualization and indicative purpose only and cannot be used for any legal purpose. BHUVAN portal and ISRO is not responsible for its authenticity. For any queries, please contact Archaeological Survey of India, New Delhi. Authenticity and validation of the location of the sites and monuments is in progress.',
  verbatimVersionDisclaimer:
    'BhuvanDisclaimer: This is version 1.0 data. Improvements are being done. NRSC/ISRO disowns responsibility for any inadvertent errors, beyond its limitations.',
  verbatimLimitationText:
    'Bhuvan explicitly states that these boundaries were mapped in association with ASI, require ASI verification for correctness/completeness, are for visualization/indicative purposes only, and cannot be used for any legal purpose. Bhuvan also separately states this is "version 1.0 data" and disclaims responsibility for inadvertent errors.',
  recommendedUiLabels: {
    layerBadge: 'Bhuvan/NRSC ASI-associated indicative layer',
    authorityNotice: 'Source-labelled spatial context — authority verification required',
    disclaimer: 'Version 1.0 source data; not independently legally verified',
  },
  durableKeyRule:
    'Combination of mon_num (MUMMH015), gid, and layer name (fid values are dynamic/unstable across WFS/WMS queries)',
  gids: {
    protected: 7068,
    prohibited: 9785,
    regulated: 2394,
  },
};

export const SHIVNERI_PROTECTED_GEOJSON: GeoJSON.MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [73.86279634, 19.19414318],
        [73.86315325, 19.19317236],
        [73.86315325, 19.19280116],
        [73.86301049, 19.19268695],
        [73.86178148, 19.19312326],
        [73.86030172, 19.19283898],
        [73.85852902, 19.19299365],
        [73.85769621, 19.19285088],
        [73.85559039, 19.19325539],
        [73.85298488, 19.19333867],
        [73.8518175, 19.19401469],
        [73.85204593, 19.19447154],
        [73.85347361, 19.19588018],
        [73.85385432, 19.19654643],
        [73.85505357, 19.19707943],
        [73.85606246, 19.1981835],
        [73.85716653, 19.19884975],
        [73.8580041, 19.2017051],
        [73.85874649, 19.20290435],
        [73.85905106, 19.20393228],
        [73.85967924, 19.20475081],
        [73.86009803, 19.20471274],
        [73.86104981, 19.20273303],
        [73.86163992, 19.19879264],
        [73.86154474, 19.19713654],
        [73.86207774, 19.19532815],
        [73.86279634, 19.19414318],
      ],
    ],
  ],
};

export const SHIVNERI_PROHIBITED_GEOJSON: GeoJSON.MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [73.86411103, 19.19285748],
        [73.86387098, 19.19221768],
        [73.86310994, 19.19179447],
        [73.86158634, 19.19218729],
        [73.86038535, 19.19194504],
        [73.85861633, 19.19206926],
        [73.85734867, 19.19196605],
        [73.85551276, 19.19235222],
        [73.85270558, 19.19248134],
        [73.85134822, 19.19319976],
        [73.8509292, 19.1937095],
        [73.85088325, 19.19414713],
        [73.85106536, 19.19470601],
        [73.85267835, 19.19638123],
        [73.85318174, 19.19717659],
        [73.85448811, 19.19780848],
        [73.85544584, 19.19886338],
        [73.85638803, 19.19940202],
        [73.85671858, 19.20093507],
        [73.85726504, 19.20235413],
        [73.85784816, 19.20320337],
        [73.85823948, 19.20439158],
        [73.85875205, 19.20512208],
        [73.85931993, 19.20558082],
        [73.86007323, 19.20569717],
        [73.8607493, 19.20536284],
        [73.86194756, 19.20301236],
        [73.86257848, 19.1988943],
        [73.86249284, 19.19724181],
        [73.86294951, 19.19569057],
        [73.86381913, 19.19424093],
        [73.86411103, 19.19285748],
      ],
    ],
  ],
};

export const SHIVNERI_REGULATED_GEOJSON: GeoJSON.MultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [73.84898613, 19.19390374],
        [73.84921406, 19.19517005],
        [73.84984018, 19.19616181],
        [73.8510928, 19.19739179],
        [73.85189963, 19.19849579],
        [73.85340824, 19.19932794],
        [73.85410777, 19.20013289],
        [73.85474998, 19.2005827],
        [73.85507693, 19.20196585],
        [73.85562678, 19.20325868],
        [73.85606497, 19.20386035],
        [73.85645985, 19.20502262],
        [73.85762458, 19.2066052],
        [73.85865853, 19.20726251],
        [73.86001449, 19.20749952],
        [73.86109349, 19.20726964],
        [73.86215004, 19.2065698],
        [73.86266947, 19.20584461],
        [73.86375474, 19.20353632],
        [73.86445777, 19.19907913],
        [73.86438905, 19.19745234],
        [73.86469308, 19.19641541],
        [73.86551044, 19.19504652],
        [73.86590036, 19.19387296],
        [73.86591837, 19.19221185],
        [73.86566361, 19.19155198],
        [73.86510776, 19.19085161],
        [73.86420169, 19.19024396],
        [73.86312704, 19.18999682],
        [73.86158692, 19.19028706],
        [73.86023288, 19.19014738],
        [73.85713296, 19.19018123],
        [73.853575, 19.19054588],
        [73.85236481, 19.19071156],
        [73.8515316, 19.19102733],
        [73.84986094, 19.19206243],
        [73.84924635, 19.19288275],
        [73.84898613, 19.19390374],
      ],
    ],
  ],
};

export const SHIVNERI_PROTECTED_GEOMETRY: GeometryRecord = {
  geometryId: 'MUMMH015-asi_protected_areas-7068',
  siteId: 'site-shivneri-01',
  versionLabel: 'v1.0-bhuvan-protected-7068',
  sourceDocumentOrUrl: PROVENANCE_METADATA.portalUrl,
  captureDate: PROVENANCE_METADATA.retrievalDate,
  limitationNote: PROVENANCE_METADATA.verbatimLimitationText,
  governanceState: 'PILOT_PUBLISHED',
  // Prototype placeholder estimate (0.95); not derived from official NRSC metadata or statutory certification
  layerConfidenceScore: 0.95,
  geojson: SHIVNERI_PROTECTED_GEOJSON,
};

export const SHIVNERI_PROHIBITED_GEOMETRY: GeometryRecord = {
  geometryId: 'MUMMH015-asi_prohibited_boundary-9785',
  siteId: 'site-shivneri-01',
  versionLabel: 'v1.0-bhuvan-prohibited-9785',
  sourceDocumentOrUrl: PROVENANCE_METADATA.portalUrl,
  captureDate: PROVENANCE_METADATA.retrievalDate,
  limitationNote: PROVENANCE_METADATA.verbatimLimitationText,
  governanceState: 'PILOT_PUBLISHED',
  // Prototype placeholder estimate (0.95); not derived from official NRSC metadata or statutory certification
  layerConfidenceScore: 0.95,
  geojson: SHIVNERI_PROHIBITED_GEOJSON,
};

export const SHIVNERI_REGULATED_GEOMETRY: GeometryRecord = {
  geometryId: 'MUMMH015-asi_regulated_boundary-2394',
  siteId: 'site-shivneri-01',
  versionLabel: 'v1.0-bhuvan-regulated-2394',
  sourceDocumentOrUrl: PROVENANCE_METADATA.portalUrl,
  captureDate: PROVENANCE_METADATA.retrievalDate,
  limitationNote: PROVENANCE_METADATA.verbatimLimitationText,
  governanceState: 'PILOT_PUBLISHED',
  // Prototype placeholder estimate (0.95); not derived from official NRSC metadata or statutory certification
  layerConfidenceScore: 0.95,
  geojson: SHIVNERI_REGULATED_GEOJSON,
};

export const SHIVNERI_GEOMETRY: GeometryRecord = SHIVNERI_PROTECTED_GEOMETRY;
