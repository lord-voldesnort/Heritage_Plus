import React from 'react';
import {
  SHIVNERI_PROTECTED_GEOJSON,
  SHIVNERI_REGULATED_GEOJSON,
  SHIVNERI_PERMITTED_GEOJSON,
} from '../mock-data/siteGeometry';

interface LocationPreviewMapProps {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  className?: string;
}

// Same bounding box used by ShivneriPolygonMap so the two views line up.
const MIN_LNG = 73.844;
const MAX_LNG = 73.87;
const MIN_LAT = 19.186;
const MAX_LAT = 19.212;
const WIDTH = 400;
const HEIGHT = 260;

const projectToSvg = (lng: number, lat: number) => {
  const x = ((lng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * WIDTH;
  const y = HEIGHT - ((lat - MIN_LAT) / (MAX_LAT - MIN_LAT)) * HEIGHT;
  return [x, y];
};

const geoJsonToSvgPath = (multiPolygon: GeoJSON.MultiPolygon) => {
  return multiPolygon.coordinates
    .map((polygon) =>
      polygon
        .map((ring) =>
          ring
            .map((coord, idx) => {
              const [x, y] = projectToSvg(coord[0], coord[1]);
              return `${idx === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
            })
            .join(' ') + ' Z'
        )
        .join(' ')
    )
    .join(' ');
};

/**
 * A deliberately minimal, pure-white map: no basemap tiles, no imagery —
 * just the three zone outlines and a single pin marking the location the
 * visitor just acquired. Meant to give quick visual confirmation of "where
 * am I relative to the fort" right after tapping "Acquire Location".
 */
export const LocationPreviewMap: React.FC<LocationPreviewMapProps> = ({
  latitude,
  longitude,
  accuracyMeters,
  className = 'h-[220px] w-full',
}) => {
  const isOutOfBounds =
    longitude < MIN_LNG - 0.01 || longitude > MAX_LNG + 0.01 || latitude < MIN_LAT - 0.01 || latitude > MAX_LAT + 0.01;

  const [px, py] = projectToSvg(
    Math.min(Math.max(longitude, MIN_LNG), MAX_LNG),
    Math.min(Math.max(latitude, MIN_LAT), MAX_LAT)
  );

  return (
    <div
      className={`relative rounded-xl overflow-hidden border border-border-subtle bg-white shadow-2xs ${className}`}
    >
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
        {/* Pure white canvas background */}
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="#ffffff" />

        {/* Subtle grid so the white canvas doesn't feel empty */}
        <defs>
          <pattern id="hp-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f1f5f9" strokeWidth="1" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={WIDTH} height={HEIGHT} fill="url(#hp-grid)" />

        {/* Zone polygons, lightest tint so the pin stands out */}
        <path
          d={geoJsonToSvgPath(SHIVNERI_PERMITTED_GEOJSON)}
          fill="#22c55e"
          fillOpacity="0.12"
          stroke="#16a34a"
          strokeWidth="1.5"
          strokeDasharray="5 3"
        />
        <path
          d={geoJsonToSvgPath(SHIVNERI_REGULATED_GEOJSON)}
          fill="#eab308"
          fillOpacity="0.22"
          stroke="#ca8a04"
          strokeWidth="1.75"
        />
        <path
          d={geoJsonToSvgPath(SHIVNERI_PROTECTED_GEOJSON)}
          fill="#ef4444"
          fillOpacity="0.32"
          stroke="#b91c1c"
          strokeWidth="2"
        />

        {/* Visitor's pin */}
        {!isOutOfBounds && (
          <g>
            <circle cx={px} cy={py} r="14" fill="#a33900" fillOpacity="0.18" className="animate-ping" />
            <circle cx={px} cy={py} r="6" fill="#a33900" stroke="#ffffff" strokeWidth="2" />
          </g>
        )}
      </svg>

      {isOutOfBounds && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-center px-4">
          <span className="text-xs text-text-secondary">
            Your location is outside the mapped fort area — the pin can't be shown here, but your coordinates
            have still been recorded.
          </span>
        </div>
      )}

      <div className="absolute bottom-2 left-2 bg-white/95 border border-border-subtle rounded-md px-2 py-1 text-[10px] font-mono text-text-secondary shadow-2xs">
        You are here{accuracyMeters ? ` · ±${accuracyMeters.toFixed(1)}m` : ''}
      </div>
    </div>
  );
};

export default LocationPreviewMap;
