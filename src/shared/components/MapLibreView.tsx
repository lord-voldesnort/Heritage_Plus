import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { GeometryRecord } from '../types';

interface MapLibreViewProps {
  geometryRecord: GeometryRecord;
  observationPoint?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  classification?: string;
  className?: string;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  geometryRecord,
  observationPoint,
  className = 'h-64 sm:h-80 w-full',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use free OpenStreetMap / CARTO vector style (no private paid token required)
    const styleUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const defaultCenter: [number, number] = observationPoint
      ? [observationPoint.longitude, observationPoint.latitude]
      : [73.8624, 19.1982];

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: defaultCenter,
        zoom: 14.5,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        // Add Shivneri Sourced Boundary GeoJSON source
        map.addSource('site-boundary', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {
              name: geometryRecord.versionLabel,
            },
            geometry: geometryRecord.geojson as any,
          },
        });

        // Add Polygon Fill Layer
        map.addLayer({
          id: 'site-boundary-fill',
          type: 'fill',
          source: 'site-boundary',
          paint: {
            'fill-color': '#d97706', // amber
            'fill-opacity': 0.2,
          },
        });

        // Add Polygon Outline Layer
        map.addLayer({
          id: 'site-boundary-line',
          type: 'line',
          source: 'site-boundary',
          paint: {
            'line-color': '#f59e0b',
            'line-width': 2.5,
            'line-dasharray': [2, 1],
          },
        });

        // Add Observation Marker if present
        if (observationPoint) {
          const markerEl = document.createElement('div');
          markerEl.className = 'w-5 h-5 rounded-full bg-amber-500 border-2 border-slate-950 shadow-lg animate-pulse';
          new maplibregl.Marker({ element: markerEl })
            .setLngLat([observationPoint.longitude, observationPoint.latitude])
            .addTo(map);
        }
      });

      mapRef.current = map;

      return () => {
        map.remove();
      };
    } catch (e) {
      console.warn('MapLibre GL initialization error (WebGL support required):', e);
    }
  }, [geometryRecord, observationPoint]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-slate-900/90 backdrop-blur border border-slate-800 text-[10px] text-slate-400">
        Source: {geometryRecord.versionLabel} (EPSG:4326)
      </div>
      {observationPoint?.accuracyMeters && (
        <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-800 text-xs text-amber-300 font-mono">
          GPS Accuracy: ±{observationPoint.accuracyMeters.toFixed(1)}m
        </div>
      )}
    </div>
  );
};
