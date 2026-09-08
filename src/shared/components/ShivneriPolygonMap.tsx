import React, { useEffect, useRef, useState, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import {
  SHIVNERI_PROTECTED_GEOJSON,
  SHIVNERI_REGULATED_GEOJSON,
  SHIVNERI_PERMITTED_GEOJSON,
  PROVENANCE_METADATA,
} from '../mock-data/siteGeometry';
import { ledgerStore } from '../lib/ledgerStore';
import { ObservationRecord } from '../types';

export interface ShivneriPolygonMapProps {
  selectedCaseId?: string | null;
  onSelectCase?: (caseId: string) => void;
  className?: string;
}

export const ShivneriPolygonMap: React.FC<ShivneriPolygonMapProps> = ({
  selectedCaseId,
  onSelectCase,
  className = 'h-[520px] w-full',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<maplibregl.Map | null>(null);

  // Layer toggle states
  const [showProtected, setShowProtected] = useState(true);
  const [showNeutral, setShowNeutral] = useState(true);
  const [showPermitted, setShowPermitted] = useState(true);
  const [showObservations, setShowObservations] = useState(true);

  // Active hover/selected zone
  const [activeZoneTooltip, setActiveZoneTooltip] = useState<{
    name: string;
    color: string;
    description: string;
    regulation: string;
  } | null>(null);

  // SVG Fallback state if WebGL is unavailable
  const [useSvgFallback, setUseSvgFallback] = useState(false);
  const [svgZoom, setSvgZoom] = useState(1);
  const [svgPan, setSvgPan] = useState({ x: 0, y: 0 });

  // Get active cases from ledgerStore
  const activeCases: ObservationRecord[] = useMemo(() => {
    return ledgerStore.getCases().filter((c) => c.latitude && c.longitude);
  }, []);

  // Shivneri Centroid
  const centroid: [number, number] = [73.8624, 19.1982]; // [lng, lat]

  useEffect(() => {
    if (!mapContainerRef.current) return;

    let map: maplibregl.Map;

    try {
      // Create MapLibre with a pure white background style
      map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {},
          layers: [
            {
              id: 'background',
              type: 'background',
              paint: {
                'background-color': '#ffffff',
              },
            },
          ],
        },
        center: centroid,
        zoom: 14.3,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        // 1. GREEN ZONE: Zone where activities are permitted (Exterior survey perimeter >300m)
        map.addSource('zone-permitted-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: 'Permitted Zone',
              regulation: 'General municipal building and commercial activity permitted beyond statutory boundary.',
            },
            geometry: SHIVNERI_PERMITTED_GEOJSON as any,
          },
        });

        map.addLayer({
          id: 'zone-permitted-fill',
          type: 'fill',
          source: 'zone-permitted-source',
          layout: {
            visibility: showPermitted ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#22c55e', // Green
            'fill-opacity': 0.18,
          },
        });

        map.addLayer({
          id: 'zone-permitted-line',
          type: 'line',
          source: 'zone-permitted-source',
          layout: {
            visibility: showPermitted ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#16a34a',
            'line-width': 2,
            'line-dasharray': [4, 2],
          },
        });

        // 2. YELLOW ZONE: Neutral Zone (Regulated Buffer 100m–300m)
        map.addSource('zone-neutral-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: 'Neutral Zone (Regulated Buffer)',
              regulation: 'Mandatory prior permission from National Monuments Authority (NMA) required.',
            },
            geometry: SHIVNERI_REGULATED_GEOJSON as any,
          },
        });

        map.addLayer({
          id: 'zone-neutral-fill',
          type: 'fill',
          source: 'zone-neutral-source',
          layout: {
            visibility: showNeutral ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#eab308', // Yellow
            'fill-opacity': 0.28,
          },
        });

        map.addLayer({
          id: 'zone-neutral-line',
          type: 'line',
          source: 'zone-neutral-source',
          layout: {
            visibility: showNeutral ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#ca8a04',
            'line-width': 2.5,
          },
        });

        // 3. RED ZONE: Protected Zone (Core Monument Area 0–100m)
        map.addSource('zone-protected-source', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: 'Protected Zone (Core)',
              regulation: 'Total statutory ban on construction, excavation, and modifications under AMASR Act.',
            },
            geometry: SHIVNERI_PROTECTED_GEOJSON as any,
          },
        });

        map.addLayer({
          id: 'zone-protected-fill',
          type: 'fill',
          source: 'zone-protected-source',
          layout: {
            visibility: showProtected ? 'visible' : 'none',
          },
          paint: {
            'fill-color': '#ef4444', // Red
            'fill-opacity': 0.38,
          },
        });

        map.addLayer({
          id: 'zone-protected-line',
          type: 'line',
          source: 'zone-protected-source',
          layout: {
            visibility: showProtected ? 'visible' : 'none',
          },
          paint: {
            'line-color': '#b91c1c',
            'line-width': 3,
          },
        });

        // Add Active Incident Markers to the map
        activeCases.forEach((caseRecord) => {
          const isSelected = selectedCaseId === caseRecord.caseId;
          const markerEl = document.createElement('div');

          // Zone-based pin styling
          let pinColor = '#ef4444'; // Red default
          if (caseRecord.computedClassification === 'LOCATION_UNCERTAIN') {
            pinColor = '#eab308'; // Yellow
          } else if (caseRecord.computedClassification === 'NO_SPATIAL_CONCERN_INDICATED') {
            pinColor = '#22c55e'; // Green
          }

          markerEl.className = `cursor-pointer transition-transform duration-200 ${
            isSelected ? 'scale-125 z-30' : 'hover:scale-110 z-20'
          }`;
          markerEl.innerHTML = `
            <div class="relative flex flex-col items-center">
              <div style="background-color: ${pinColor}; box-shadow: 0 2px 8px rgba(0,0,0,0.25);" 
                   class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center text-white font-bold text-[10px]">
                !
              </div>
              <div class="bg-white/95 text-slate-800 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded shadow-sm border border-slate-200 mt-0.5 whitespace-nowrap">
                ${caseRecord.caseId}
              </div>
            </div>
          `;

          markerEl.addEventListener('click', () => {
            if (onSelectCase) {
              onSelectCase(caseRecord.caseId);
            }
          });

          new maplibregl.Marker({ element: markerEl })
            .setLngLat([caseRecord.longitude, caseRecord.latitude])
            .addTo(map);
        });
      });

      mapInstanceRef.current = map;

      return () => {
        map.remove();
      };
    } catch (err) {
      console.warn('MapLibre WebGL unavailable or failed to initialize; falling back to SVG vector renderer.', err);
      setUseSvgFallback(true);
    }
  }, []);

  // Update layer visibility when toggles change in MapLibre instance
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer('zone-permitted-fill')) {
      map.setLayoutProperty('zone-permitted-fill', 'visibility', showPermitted ? 'visible' : 'none');
      map.setLayoutProperty('zone-permitted-line', 'visibility', showPermitted ? 'visible' : 'none');
    }
    if (map.getLayer('zone-neutral-fill')) {
      map.setLayoutProperty('zone-neutral-fill', 'visibility', showNeutral ? 'visible' : 'none');
      map.setLayoutProperty('zone-neutral-line', 'visibility', showNeutral ? 'visible' : 'none');
    }
    if (map.getLayer('zone-protected-fill')) {
      map.setLayoutProperty('zone-protected-fill', 'visibility', showProtected ? 'visible' : 'none');
      map.setLayoutProperty('zone-protected-line', 'visibility', showProtected ? 'visible' : 'none');
    }
  }, [showPermitted, showNeutral, showProtected]);

  // Center / Zoom map controls
  const handleResetCenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ center: centroid, zoom: 14.3 });
    } else {
      setSvgZoom(1);
      setSvgPan({ x: 0, y: 0 });
    }
  };

  const handleZoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    } else {
      setSvgZoom((prev) => Math.min(prev + 0.25, 2.5));
    }
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    } else {
      setSvgZoom((prev) => Math.max(prev - 0.25, 0.6));
    }
  };

  // Helper to project GeoJSON polygon coordinates to SVG coordinate space [0..600, 0..520]
  // Bounding box for Shivneri Fort area:
  // Lng range: ~73.844 to ~73.868 (width ~0.024)
  // Lat range: ~19.186 to ~19.212 (height ~0.026)
  const projectToSvg = (lng: number, lat: number, width = 600, height = 520) => {
    const minLng = 73.844;
    const maxLng = 73.870;
    const minLat = 19.186;
    const maxLat = 19.212;

    const x = ((lng - minLng) / (maxLng - minLng)) * width;
    const y = height - ((lat - minLat) / (maxLat - minLat)) * height;
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

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-border-subtle bg-white shadow-xs flex flex-col ${className}`}>
      {/* Top Map Control Bar */}
      <div className="p-3 lg:px-4 lg:py-2.5 border-b border-border-subtle flex flex-wrap items-center justify-between gap-3 bg-white z-10">
        {/* Layer Filter Toggles */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary mr-1">
            Zones:
          </span>

          {/* Red Zone Toggle */}
          <button
            type="button"
            onClick={() => setShowProtected(!showProtected)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showProtected
                ? 'bg-red-50 text-red-700 border-red-200 shadow-2xs font-bold'
                : 'bg-surface-well/60 text-text-muted border-border-subtle opacity-60'
            }`}
            title="Toggle Red — Protected Zone"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-red-600"></span>
            <span>Red: Protected</span>
          </button>

          {/* Yellow Zone Toggle */}
          <button
            type="button"
            onClick={() => setShowNeutral(!showNeutral)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showNeutral
                ? 'bg-amber-50 text-amber-800 border-amber-200 shadow-2xs font-bold'
                : 'bg-surface-well/60 text-text-muted border-border-subtle opacity-60'
            }`}
            title="Toggle Yellow — Neutral Zone"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Yellow: Neutral</span>
          </button>

          {/* Green Zone Toggle */}
          <button
            type="button"
            onClick={() => setShowPermitted(!showPermitted)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showPermitted
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs font-bold'
                : 'bg-surface-well/60 text-text-muted border-border-subtle opacity-60'
            }`}
            title="Toggle Green — Zone where activities are permitted"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600"></span>
            <span>Green: Permitted</span>
          </button>

          {/* Observations Toggle */}
          <button
            type="button"
            onClick={() => setShowObservations(!showObservations)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer border ${
              showObservations
                ? 'bg-primary-surface text-primary border-primary-border shadow-2xs'
                : 'bg-surface-well/60 text-text-muted border-border-subtle opacity-60'
            }`}
            title="Toggle Active Incident Observation Pins"
          >
            <span className="material-symbols-outlined text-[14px]">location_on</span>
            <span>Incidents ({activeCases.length})</span>
          </button>
        </div>

        {/* Zoom & View Controls */}
        <div className="flex items-center gap-1 bg-surface-well p-1 rounded-xl">
          <button
            type="button"
            onClick={handleZoomIn}
            className="w-7 h-7 rounded-lg bg-white text-text-primary hover:bg-slate-100 flex items-center justify-center shadow-2xs transition cursor-pointer"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="w-7 h-7 rounded-lg bg-white text-text-primary hover:bg-slate-100 flex items-center justify-center shadow-2xs transition cursor-pointer"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[16px]">remove</span>
          </button>
          <button
            type="button"
            onClick={handleResetCenter}
            className="w-7 h-7 rounded-lg bg-white text-text-primary hover:bg-slate-100 flex items-center justify-center shadow-2xs transition cursor-pointer"
            title="Reset Centroid View (Fort of Shivner)"
          >
            <span className="material-symbols-outlined text-[16px]">my_location</span>
          </button>
        </div>
      </div>

      {/* Map Body: Pure White Background Vector Canvas */}
      <div className="relative flex-1 w-full h-full min-h-[460px] bg-white overflow-hidden select-none">
        {/* Subtle coordinate grid watermark */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: 'linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Primary MapLibre GL Container */}
        <div
          ref={mapContainerRef}
          className={`w-full h-full ${useSvgFallback ? 'hidden' : 'block'}`}
          style={{ backgroundColor: '#ffffff' }}
        />

        {/* High-Fidelity SVG Projection Engine (Fallback or Overlay) */}
        {useSvgFallback && (
          <div className="w-full h-full flex items-center justify-center bg-white p-4">
            <svg
              className="w-full h-full max-w-[600px] max-h-[500px] transition-transform duration-200 ease-out"
              viewBox="0 0 600 520"
              style={{
                transform: `scale(${svgZoom}) translate(${svgPan.x}px, ${svgPan.y}px)`,
              }}
            >
              {/* Subtle axes */}
              <line x1="300" y1="20" x2="300" y2="500" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />
              <line x1="20" y1="260" x2="580" y2="260" stroke="#f1f5f9" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* 1. GREEN ZONE: Activities Permitted */}
              {showPermitted && (
                <path
                  d={geoJsonToSvgPath(SHIVNERI_PERMITTED_GEOJSON)}
                  fill="#22c55e"
                  fillOpacity="0.18"
                  stroke="#16a34a"
                  strokeWidth="2"
                  strokeDasharray="6 3"
                  className="cursor-pointer hover:fill-opacity-25 transition-all"
                  onMouseEnter={() =>
                    setActiveZoneTooltip({
                      name: 'Green — Zone where activities are permitted',
                      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                      description: 'External survey area beyond 300m statutory boundary.',
                      regulation: 'Regular construction, farming, and commercial activity permitted under municipal guidelines.',
                    })
                  }
                  onMouseLeave={() => setActiveZoneTooltip(null)}
                />
              )}

              {/* 2. YELLOW ZONE: Neutral Zone (Regulated Buffer 100m–300m) */}
              {showNeutral && (
                <path
                  d={geoJsonToSvgPath(SHIVNERI_REGULATED_GEOJSON)}
                  fill="#eab308"
                  fillOpacity="0.28"
                  stroke="#ca8a04"
                  strokeWidth="2.5"
                  className="cursor-pointer hover:fill-opacity-35 transition-all"
                  onMouseEnter={() =>
                    setActiveZoneTooltip({
                      name: 'Yellow — Neutral Zone (Regulated Buffer)',
                      color: 'text-amber-800 bg-amber-50 border-amber-200',
                      description: '100m to 300m buffer perimeter from Fort of Shivner boundary.',
                      regulation: 'Strict regulatory oversight; mandatory prior clearance from National Monuments Authority (NMA).',
                    })
                  }
                  onMouseLeave={() => setActiveZoneTooltip(null)}
                />
              )}

              {/* 3. RED ZONE: Protected Zone (Core Prohibited 0–100m) */}
              {showProtected && (
                <path
                  d={geoJsonToSvgPath(SHIVNERI_PROTECTED_GEOJSON)}
                  fill="#ef4444"
                  fillOpacity="0.38"
                  stroke="#b91c1c"
                  strokeWidth="3"
                  className="cursor-pointer hover:fill-opacity-45 transition-all"
                  onMouseEnter={() =>
                    setActiveZoneTooltip({
                      name: 'Red — Protected Zone (Core Monument)',
                      color: 'text-red-700 bg-red-50 border-red-200',
                      description: 'Fort of Shivner central heritage area & 100m prohibited zone.',
                      regulation: 'Total statutory ban on construction, mining, and excavation under AMASR (Amendment) Act 2010.',
                    })
                  }
                  onMouseLeave={() => setActiveZoneTooltip(null)}
                />
              )}

              {/* Centroid Marker: Shivneri Fort */}
              {(() => {
                const [cx, cy] = projectToSvg(centroid[0], centroid[1]);
                return (
                  <g>
                    <circle cx={cx} cy={cy} r="16" fill="#a33900" fillOpacity="0.2" className="animate-ping" />
                    <circle cx={cx} cy={cy} r="7" fill="#a33900" stroke="#ffffff" strokeWidth="2" />
                    <text x={cx} y={cy - 12} textAnchor="middle" fill="#0f172a" fontSize="11" fontWeight="800" fontFamily="sans-serif">
                      Shivneri Fort Centroid
                    </text>
                  </g>
                );
              })()}

              {/* Incident Pins */}
              {showObservations &&
                activeCases.map((c) => {
                  const [ix, iy] = projectToSvg(c.longitude, c.latitude);
                  const isSelected = selectedCaseId === c.caseId;
                  const pinFill =
                    c.computedClassification === 'LOCATION_UNCERTAIN'
                      ? '#eab308'
                      : c.computedClassification === 'NO_SPATIAL_CONCERN_INDICATED'
                      ? '#22c55e'
                      : '#ef4444';

                  return (
                    <g
                      key={c.caseId}
                      className="cursor-pointer group"
                      onClick={() => onSelectCase && onSelectCase(c.caseId)}
                    >
                      <circle cx={ix} cy={iy} r={isSelected ? 10 : 7} fill={pinFill} stroke="#ffffff" strokeWidth="2" />
                      <rect
                        x={ix - 40}
                        y={iy + 10}
                        width="80"
                        height="18"
                        rx="4"
                        fill="#ffffff"
                        stroke="#cbd5e1"
                        strokeWidth="1"
                        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.1))"
                      />
                      <text
                        x={ix}
                        y={iy + 22}
                        textAnchor="middle"
                        fill="#1e293b"
                        fontSize="9"
                        fontWeight="700"
                        fontFamily="monospace"
                      >
                        {c.caseId}
                      </text>
                    </g>
                  );
                })}
            </svg>
          </div>
        )}

        {/* Interactive Hover Tooltip for Zone Inspection */}
        {activeZoneTooltip && (
          <div className="absolute top-4 left-4 max-w-sm bg-white/95 backdrop-blur-xs p-3.5 rounded-xl border border-border-subtle shadow-md z-30 space-y-1 animate-in fade-in duration-150">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border inline-block ${activeZoneTooltip.color}`}>
              {activeZoneTooltip.name}
            </span>
            <p className="text-xs text-text-primary font-medium">{activeZoneTooltip.description}</p>
            <p className="text-[11px] text-text-secondary leading-relaxed pt-1 border-t border-border-subtle">
              {activeZoneTooltip.regulation}
            </p>
          </div>
        )}

        {/* Floating 3-Zone Explicit Color Legend (Requested by User) */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur-xs p-3 rounded-xl border border-border-subtle shadow-md z-20 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-red-600 border border-white shadow-2xs"></span>
            <div>
              <span className="font-bold text-red-700 block leading-tight">Red — Protected Zone</span>
              <span className="text-[10px] text-text-muted">Prohibited 0–100m · Non-Development</span>
            </div>
          </div>

          <div className="h-4 w-px bg-border-subtle hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-white shadow-2xs"></span>
            <div>
              <span className="font-bold text-amber-800 block leading-tight">Yellow — Neutral Zone</span>
              <span className="text-[10px] text-text-muted">Buffer 100–300m · NMA Clearance</span>
            </div>
          </div>

          <div className="h-4 w-px bg-border-subtle hidden sm:block"></div>

          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border border-white shadow-2xs"></span>
            <div>
              <span className="font-bold text-emerald-700 block leading-tight">Green — Permitted Zone</span>
              <span className="text-[10px] text-text-muted">&gt;300m · Activities Permitted</span>
            </div>
          </div>
        </div>

        {/* Compass Rose Badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-xl shadow-2xs border border-border-subtle flex flex-col items-center justify-center w-8 h-8 z-20">
          <span className="text-[9px] font-bold text-primary leading-none">N</span>
          <span className="material-symbols-outlined text-primary text-[13px]">navigation</span>
        </div>
      </div>

      {/* Geospatial Status Footer */}
      <div className="px-4 py-2.5 bg-white border-t border-border-subtle flex flex-wrap items-center justify-between gap-2 text-xs text-text-secondary font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> WGS-84 ACTIVE
          </span>
          <span className="text-text-muted">|</span>
          <span>Centroid: 19.1982° N, 73.8624° E</span>
          <span className="text-text-muted hidden sm:inline">|</span>
          <span className="text-text-muted hidden sm:inline">{PROVENANCE_METADATA.monumentNumber}</span>
        </div>
        <div className="text-[11px] text-text-muted">
          Cartographic Sourcing: <span className="font-semibold text-text-primary">Bhuvan / NRSC (ISRO) & ASI</span>
        </div>
      </div>
    </div>
  );
};
