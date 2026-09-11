import { SiteRecord } from '../types';
import { SHIVNERI_GEOMETRY as BHUVAN_GEOMETRY, PROVENANCE_METADATA } from './siteGeometry';

export const SHIVNERI_SITE: SiteRecord = {
  siteId: 'site-shivneri-01',
  slug: 'shivneri-fort',
  name: 'Fort of Shivner (Shivneri Fort)',
  vernacularName: 'शिवनेरी किल्ला (MUMMH015)',
  state: 'Maharashtra',
  district: 'Pune',
  centroid: [73.8580, 19.1980], // [lng, lat]
  sourceAgency: PROVENANCE_METADATA.sourceAgency,
  representativeImageUrl:
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200',
  historicalSignificance:
    'Fort of Shivner (Shivneri Fort) is a monumental 17th-century hill fortification located near Junnar in Pune district, Maharashtra (ASI Monument MUMMH015). Renowned as the birthplace of Chhatrapati Shivaji Maharaj, it features steep defensive escarpments, historic rock-cut water cisterns (Ganga-Jamuna), monumental stone entry portals, and fortified bastions symbolizing historic Deccan architecture.',
};

export const SHIVNERI_GEOMETRY = BHUVAN_GEOMETRY;
