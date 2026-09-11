/**
 * Seeds the ONE real site this prototype covers: Shivneri Fort (ASI monument
 * MUMMH015). The boundary polygons below are ported verbatim from
 * src/shared/mock-data/siteGeometry.ts, which the frontend team digitized from
 * the Bhuvan/NRSC (ISRO) WMS portal in association with ASI. This is real,
 * provenance-labeled source data — not fabricated — so it is seeded as
 * baseline reference data, distinct from the illustrative MOCK_CASES demo
 * observations (see seed-demo.ts / /api/dev/seed-demo), which are NOT run
 * automatically.
 *
 * Re-running this script is idempotent (ON CONFLICT DO NOTHING).
 */
import { pool } from './pool.js';

const PROVENANCE = {
  sourceAgency: 'Bhuvan / NRSC (ISRO) in association with Archaeological Survey of India (ASI)',
  portalUrl: 'https://bhuvan-app1.nrsc.gov.in/culture_monuments/',
  retrievalDate: '2026-09-07',
  limitationNote:
    'Bhuvan states these boundaries were mapped in association with ASI, require ASI verification for correctness/completeness, are for visualization/indicative purposes only, and cannot be used for any legal purpose. This is version 1.0 data; NRSC/ISRO disclaims responsibility for inadvertent errors.',
};

const SITE = {
  site_id: 'site-shivneri-01',
  slug: 'shivneri-fort',
  name: 'Fort of Shivner (Shivneri Fort)',
  vernacular_name: 'शिवनेरी किल्ला (MUMMH015)',
  state: 'Maharashtra',
  district: 'Pune',
  historical_significance:
    'Fort of Shivner (Shivneri Fort) is a monumental 17th-century hill fortification located near Junnar in Pune district, Maharashtra (ASI Monument MUMMH015). Renowned as the birthplace of Chhatrapati Shivaji Maharaj, it features steep defensive escarpments, historic rock-cut water cisterns (Ganga-Jamuna), monumental stone entry portals, and fortified bastions symbolizing historic Deccan architecture.',
  representative_image_url:
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200',
  source_agency: PROVENANCE.sourceAgency,
  centroid_lng: 73.858,
  centroid_lat: 19.198,
};

// [lng, lat] rings, ported verbatim from siteGeometry.ts
const RINGS: Record<'PROTECTED' | 'PROHIBITED' | 'REGULATED' | 'PERMITTED', [number, number][]> = {
  PROTECTED: [
    [73.86279634, 19.19414318], [73.86315325, 19.19317236], [73.86315325, 19.19280116],
    [73.86301049, 19.19268695], [73.86178148, 19.19312326], [73.86030172, 19.19283898],
    [73.85852902, 19.19299365], [73.85769621, 19.19285088], [73.85559039, 19.19325539],
    [73.85298488, 19.19333867], [73.8518175, 19.19401469], [73.85204593, 19.19447154],
    [73.85347361, 19.19588018], [73.85385432, 19.19654643], [73.85505357, 19.19707943],
    [73.85606246, 19.1981835], [73.85716653, 19.19884975], [73.8580041, 19.2017051],
    [73.85874649, 19.20290435], [73.85905106, 19.20393228], [73.85967924, 19.20475081],
    [73.86009803, 19.20471274], [73.86104981, 19.20273303], [73.86163992, 19.19879264],
    [73.86154474, 19.19713654], [73.86207774, 19.19532815], [73.86279634, 19.19414318],
  ],
  PROHIBITED: [
    [73.86411103, 19.19285748], [73.86387098, 19.19221768], [73.86310994, 19.19179447],
    [73.86158634, 19.19218729], [73.86038535, 19.19194504], [73.85861633, 19.19206926],
    [73.85734867, 19.19196605], [73.85551276, 19.19235222], [73.85270558, 19.19248134],
    [73.85134822, 19.19319976], [73.8509292, 19.1937095], [73.85088325, 19.19414713],
    [73.85106536, 19.19470601], [73.85267835, 19.19638123], [73.85318174, 19.19717659],
    [73.85448811, 19.19780848], [73.85544584, 19.19886338], [73.85638803, 19.19940202],
    [73.85671858, 19.20093507], [73.85726504, 19.20235413], [73.85784816, 19.20320337],
    [73.85823948, 19.20439158], [73.85875205, 19.20512208], [73.85931993, 19.20558082],
    [73.86007323, 19.20569717], [73.8607493, 19.20536284], [73.86194756, 19.20301236],
    [73.86257848, 19.1988943], [73.86249284, 19.19724181], [73.86294951, 19.19569057],
    [73.86381913, 19.19424093], [73.86411103, 19.19285748],
  ],
  REGULATED: [
    [73.84898613, 19.19390374], [73.84921406, 19.19517005], [73.84984018, 19.19616181],
    [73.8510928, 19.19739179], [73.85189963, 19.19849579], [73.85340824, 19.19932794],
    [73.85410777, 19.20013289], [73.85474998, 19.2005827], [73.85507693, 19.20196585],
    [73.85562678, 19.20325868], [73.85606497, 19.20386035], [73.85645985, 19.20502262],
    [73.85762458, 19.2066052], [73.85865853, 19.20726251], [73.86001449, 19.20749952],
    [73.86109349, 19.20726964], [73.86215004, 19.2065698], [73.86266947, 19.20584461],
    [73.86375474, 19.20353632], [73.86445777, 19.19907913], [73.86438905, 19.19745234],
    [73.86469308, 19.19641541], [73.86551044, 19.19504652], [73.86590036, 19.19387296],
    [73.86591837, 19.19221185], [73.86566361, 19.19155198], [73.86510776, 19.19085161],
    [73.86420169, 19.19024396], [73.86312704, 19.18999682], [73.86158692, 19.19028706],
    [73.86023288, 19.19014738], [73.85713296, 19.19018123], [73.853575, 19.19054588],
    [73.85236481, 19.19071156], [73.8515316, 19.19102733], [73.84986094, 19.19206243],
    [73.84924635, 19.19288275], [73.84898613, 19.19390374],
  ],
  PERMITTED: [
    [73.8457458, 19.1931671], [73.84600604, 19.19214612], [73.84621137, 19.19158203],
    [73.84652569, 19.19106466], [73.84714029, 19.19024435], [73.84754611, 19.1897979],
    [73.84803281, 19.18943059], [73.84970345, 19.18839551], [73.85029043, 19.18810612],
    [73.85093126, 19.18793238], [73.85176446, 19.18761661], [73.85259767, 19.18730084],
    [73.85380786, 19.18713516], [73.85736582, 19.18677051], [73.86046574, 19.18673666],
    [73.86181978, 19.18687634], [73.8633599, 19.1865861], [73.86443455, 19.18683324],
    [73.86534062, 19.18744089], [73.86589647, 19.18814126], [73.86615123, 19.18880113],
    [73.86613322, 19.19046224], [73.86641837, 19.19221185], [73.86751044, 19.19504652],
    [73.86790036, 19.19687296], [73.86738905, 19.19945234], [73.86645777, 19.20207913],
    [73.86575474, 19.20553632], [73.86466947, 19.20784461], [73.86315004, 19.2095698],
    [73.86109349, 19.21026964], [73.85865853, 19.21026251], [73.85662458, 19.2096052],
    [73.85445985, 19.20702262], [73.85306497, 19.20586035], [73.85162678, 19.20425868],
    [73.84907693, 19.20296585], [73.84774998, 19.2005827], [73.84689963, 19.19749579],
    [73.84598613, 19.19490374], [73.8457458, 19.1931671],
  ],
};

const GEOMETRY_IDS: Record<keyof typeof RINGS, string> = {
  PROTECTED: 'MUMMH015-asi_protected_areas-7068',
  PROHIBITED: 'MUMMH015-asi_prohibited_boundary-9785',
  REGULATED: 'MUMMH015-asi_regulated_boundary-2394',
  PERMITTED: 'MUMMH015-asi_permitted_zone-survey',
};

const VERSION_LABELS: Record<keyof typeof RINGS, string> = {
  PROTECTED: 'v1.0-bhuvan-protected-7068',
  PROHIBITED: 'v1.0-bhuvan-prohibited-9785',
  REGULATED: 'v1.0-bhuvan-regulated-2394',
  PERMITTED: 'v1.0-exterior-permitted-zone',
};

function ringToWkt(ring: [number, number][]): string {
  const coords = ring.map(([lng, lat]) => `${lng} ${lat}`).join(', ');
  return `MULTIPOLYGON(((${coords})))`;
}

async function main() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO sites (site_id, slug, name, vernacular_name, state, district, historical_significance, representative_image_url, source_agency, centroid)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, ST_SetSRID(ST_MakePoint($10, $11), 4326))
       ON CONFLICT (site_id) DO NOTHING`,
      [
        SITE.site_id, SITE.slug, SITE.name, SITE.vernacular_name, SITE.state, SITE.district,
        SITE.historical_significance, SITE.representative_image_url, SITE.source_agency,
        SITE.centroid_lng, SITE.centroid_lat,
      ]
    );

    for (const tier of Object.keys(RINGS) as (keyof typeof RINGS)[]) {
      const limitationNote =
        tier === 'PERMITTED'
          ? 'Zone beyond 300m statutory boundary where normal activities and development are permitted under standard municipal norms.'
          : PROVENANCE.limitationNote;

      await client.query(
        `INSERT INTO geometry_records (geometry_id, site_id, tier, version_label, source_document_or_url, capture_date, limitation_note, governance_state, layer_confidence_score, geom)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'PILOT_PUBLISHED', 0.95, ST_GeomFromText($8, 4326))
         ON CONFLICT (geometry_id) DO NOTHING`,
        [
          GEOMETRY_IDS[tier], SITE.site_id, tier, VERSION_LABELS[tier],
          PROVENANCE.portalUrl, PROVENANCE.retrievalDate, limitationNote,
          ringToWkt(RINGS[tier]),
        ]
      );
    }

    await client.query('COMMIT');
    console.log('[seed] Shivneri Fort site + 4 geometry tiers seeded (idempotent).');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('[seed] failed:', err);
  process.exit(1);
});
