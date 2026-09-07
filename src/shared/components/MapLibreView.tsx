import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import { GeometryRecord, SpatialClassification } from '../types';

interface MapLibreViewProps {
  geometryRecord: GeometryRecord;
  observationPoint?: {
    latitude: number;
    longitude: number;
    accuracyMeters?: number;
  };
  classification?: SpatialClassification;
  className?: string;
}

export const MapLibreView: React.FC<MapLibreViewProps> = ({
  geometryRecord,
  observationPoint,
  classification,
  className = 'h-64 sm:h-80 w-full',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Use free OpenStreetMap / CARTO vector style
    const styleUrl = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

    const defaultCenter: [number, number] = observationPoint
      ? [observationPoint.longitude, observationPoint.latitude]
      : [73.8624, 19.1982];

    try {
      const map = new maplibregl.Map({
        container: mapContainer.current,
        style: styleUrl,
        center: defaultCenter,
        zoom: observationPoint ? 15.5 : 14.5,
        attributionControl: false,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');

      map.on('load', () => {
        // 1. Add Shivneri Sourced Boundary GeoJSON source
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

        // 2. Add GPS Uncertainty Circle Disk if observationPoint has accuracyMeters
        if (observationPoint && observationPoint.accuracyMeters) {
          const accuracyRadiusMeters = observationPoint.accuracyMeters;
          const circleFeature = turf.circle(
            [observationPoint.longitude, observationPoint.latitude],
            accuracyRadiusMeters / 1000,
            { units: 'kilometers', steps: 64 }
          );

          map.addSource('gps-uncertainty-disk', {
            type: 'geojson',
            data: circleFeature,
          });

          // Determine color scheme based on spatial classification / accuracy
          let strokeColor = '#fbbf24'; // Amber (normal)
          let fillColor = '#f59e0b';
          
          if (classification === 'LOCATION_UNCERTAIN') {
            strokeColor = '#f43f5e'; // Rose / Red (overlap alert)
            fillColor = '#e11d48';
          } else if (classification === 'EVIDENCE_INSUFFICIENT' || accuracyRadiusMeters > 35) {
            strokeColor = '#c084fc'; // Purple (sensor error)
            fillColor = '#a855f7';
          } else if (classification === 'NO_SPATIAL_CONCERN_INDICATED') {
            strokeColor = '#34d399'; // Emerald (outside)
            fillColor = '#10b981';
          }

          map.addLayer({
            id: 'gps-uncertainty-disk-fill',
            type: 'fill',
            source: 'gps-uncertainty-disk',
            paint: {
              'fill-color': fillColor,
              'fill-opacity': 0.22,
            },
          });

          map.addLayer({
            id: 'gps-uncertainty-disk-line',
            type: 'line',
            source: 'gps-uncertainty-disk',
            paint: {
              'line-color': strokeColor,
              'line-width': 2,
              'line-dasharray': [3, 2],
            },
          });
        }

        // 3. Add Observation Marker Pin if present
        if (observationPoint) {
          const markerEl = document.createElement('div');
          const pinColorClass = classification === 'LOCATION_UNCERTAIN'
            ? 'bg-rose-500 border-rose-200'
            : classification === 'EVIDENCE_INSUFFICIENT'
            ? 'bg-purple-500 border-purple-200'
            : classification === 'NO_SPATIAL_CONCERN_INDICATED'
            ? 'bg-emerald-500 border-emerald-200'
            : 'bg-amber-500 border-amber-200';

          markerEl.className = `w-5 h-5 rounded-full ${pinColorClass} border-2 shadow-lg animate-pulse`;
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
  }, [geometryRecord, observationPoint, classification]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 ${className}`}>
      <div ref={mapContainer} className="w-full h-full" />
      <div className="absolute bottom-2 left-2 z-10 px-2 py-1 rounded bg-slate-900/90 backdrop-blur border border-slate-800 text-[10px] text-slate-400 font-mono">
        Source: {geometryRecord.versionLabel} (EPSG:4326)
      </div>
      {observationPoint?.accuracyMeters && (
        <div className="absolute top-2 left-2 z-10 px-2.5 py-1 rounded-lg bg-slate-900/90 backdrop-blur border border-slate-800 text-xs text-amber-300 font-mono flex items-center gap-1.5 shadow-md">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
          GPS Error Radius: ±{observationPoint.accuracyMeters.toFixed(1)}m
        </div>
      )}
    </div>
  );
};

