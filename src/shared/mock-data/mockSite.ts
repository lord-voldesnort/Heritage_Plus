import { SiteRecord, GeometryRecord } from '../types';

export const SHIVNERI_SITE: SiteRecord = {
  siteId: 'site-shivneri-01',
  slug: 'shivneri-fort',
  name: 'Shivneri Fort Monument Complex',
  vernacularName: 'शिवनेरी किल्ला परिसर',
  state: 'Maharashtra',
  district: 'Pune',
  centroid: [73.8624, 19.1982], // [lng, lat]
  sourceAgency: 'State Archaeological Department & Survey GIS Unit',
  representativeImageUrl: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&q=80&w=1200',
  historicalSignificance:
    'Shivneri Fort is a monumental 17th-century hill fortification located near Junnar in Pune district, Maharashtra. Renowned as the birthplace of Chhatrapati Shivaji Maharaj, it features steep defensive escarpments, historic rock-cut water cisterns (Ganga-Jamuna), monumental stone entry portals, and fortified bastions symbolizing historic Deccan architecture.',
};

export const SHIVNERI_GEOMETRY: GeometryRecord = {
  geometryId: 'geom-shivneri-v1',
  siteId: 'site-shivneri-01',
  versionLabel: 'v1.0-pilot-geometry',
  sourceDocumentOrUrl: 'Survey of India 1:5000 Cadastral Sheet & State Archaeology Notification SMR-MH-JUN-01',
  captureDate: '2023-11-10',
  limitationNote: 'Pilot prototype polygon. Boundary vertices represent monument core and protected buffer. Western cliff perimeters approximated for evaluation.',
  governanceState: 'PILOT_PUBLISHED',
  layerConfidenceScore: 0.92,
  geojson: {
    type: 'Polygon',
    coordinates: [
      [
        [73.8590, 19.1945],
        [73.8660, 19.1945],
        [73.8660, 19.2020],
        [73.8590, 19.2020],
        [73.8590, 19.1945],
      ],
    ],
  },
};
