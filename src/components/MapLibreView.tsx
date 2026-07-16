import React, { useEffect, useMemo, useRef } from 'react';
import maplibregl, { type LngLatLike, type Map as MapLibreMap } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export type MapPoint = {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  subtitle?: string;
  markerText?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'muted';
  size?: 'sm' | 'md' | 'lg';
  popupHtml?: string;
  onClick?: () => void;
};

interface MapLibreViewProps {
  center: [number, number];
  zoom?: number;
  points?: MapPoint[];
  route?: [number, number][];
  fitRoute?: boolean;
  className?: string;
  interactive?: boolean;
  onMapClick?: (lat: number, lng: number) => void;
}

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

const markerColors: Record<NonNullable<MapPoint['variant']>, string> = {
  primary: '#FF6B4A',
  secondary: '#0077B6',
  success: '#2FBF71',
  muted: '#607D93',
};

const markerSizes: Record<NonNullable<MapPoint['size']>, number> = {
  sm: 18,
  md: 32,
  lg: 40,
};

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const buildPopup = (point: MapPoint) => {
  if (point.popupHtml) return point.popupHtml;

  return `
    <div class="long-map-popup">
      ${point.label ? `<p class="long-map-popup-title">${escapeHtml(point.label)}</p>` : ''}
      ${point.subtitle ? `<p class="long-map-popup-copy">${escapeHtml(point.subtitle)}</p>` : ''}
    </div>
  `;
};

const createMarkerElement = (point: MapPoint) => {
  const size = markerSizes[point.size || 'md'];
  const color = markerColors[point.variant || 'primary'];
  const element = document.createElement('button');
  element.type = 'button';
  element.className = `long-map-marker long-map-marker-${point.size || 'md'}`;
  element.style.setProperty('--marker-color', color);
  element.style.width = `${size}px`;
  element.style.height = `${size}px`;
  element.setAttribute('aria-label', point.label || 'Map marker');

  if (point.markerText) {
    element.textContent = point.markerText;
  }

  return element;
};

const MapLibreView: React.FC<MapLibreViewProps> = ({
  center,
  zoom = 12,
  points = [],
  route = [],
  fitRoute = false,
  className = '',
  interactive = true,
  onMapClick,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const clickHandlerRef = useRef(onMapClick);
  const routeDataRef = useRef<GeoJSON.Feature<GeoJSON.LineString> | null>(null);

  const routeData = useMemo(
    () => ({
      type: 'Feature' as const,
      properties: {},
      geometry: {
        type: 'LineString' as const,
        coordinates: route.map(([lat, lng]) => [lng, lat]),
      },
    }),
    [route],
  );

  useEffect(() => {
    clickHandlerRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    routeDataRef.current = routeData;
  }, [routeData]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center: [center[1], center[0]],
      zoom,
      interactive,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution: 'MapLibre GL | OpenFreeMap | OpenStreetMap',
      }),
      'bottom-right',
    );

    map.on('click', (event) => {
      clickHandlerRef.current?.(event.lngLat.lat, event.lngLat.lng);
    });

    map.on('load', () => {
      map.addSource('route', {
        type: 'geojson',
        data: routeDataRef.current || routeData,
      });
      map.addLayer({
        id: 'route-shadow',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#17324D',
          'line-opacity': 0.18,
          'line-width': 9,
        },
      });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: {
          'line-cap': 'round',
          'line-join': 'round',
        },
        paint: {
          'line-color': '#FF6B4A',
          'line-width': 5,
        },
      });
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = points.map((point) => {
      const marker = new maplibregl.Marker({
        element: createMarkerElement(point),
        anchor: 'center',
      })
        .setLngLat([point.lng, point.lat])
        .setPopup(
          new maplibregl.Popup({
            closeButton: false,
            offset: 18,
            maxWidth: '260px',
          }).setHTML(buildPopup(point)),
        )
        .addTo(map);

      marker.getElement().addEventListener('click', () => {
        point.onClick?.();
      });

      return marker;
    });
  }, [points]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (fitRoute && route.length > 1) {
      const bounds = new maplibregl.LngLatBounds();
      route.forEach(([lat, lng]) => bounds.extend([lng, lat] as LngLatLike));
      map.fitBounds(bounds, { padding: 72, maxZoom: 14, duration: 600 });
      return;
    }

    map.easeTo({
      center: [center[1], center[0]],
      zoom,
      duration: 600,
    });
  }, [center, fitRoute, route, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;

    const source = map.getSource('route') as maplibregl.GeoJSONSource | undefined;
    source?.setData(routeData);
  }, [routeData]);

  return <div ref={containerRef} className={`h-full w-full ${className}`} />;
};

export default MapLibreView;
