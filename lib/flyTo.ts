import type MapLibreGL from 'maplibre-gl';
import { LngLatBounds } from 'maplibre-gl';

const DEFAULT_FLY_TO_ZOOM = 10;

export function getDistanceKm(
  from: [number, number],
  to: [number, number]
): number {
  const R = 6371;
  const dLat = ((to[1] - from[1]) * Math.PI) / 180;
  const dLng = ((to[0] - from[0]) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((from[1] * Math.PI) / 180) *
      Math.cos((to[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export interface FlyToTarget {
  lng: number;
  lat: number;
}

export interface FlyToOptions {
  zoom?: number;
  markerFlyToZoom?: number;
  globalFlyToZoom?: number;
  smartFlyThreshold?: number;
  onStart?: (target: FlyToTarget) => void;
  onEnd?: (target: FlyToTarget) => void;
}

function resolveFlyToZoom(
  msgZoom: number | undefined,
  markerFlyToZoom: number | undefined,
  globalFlyToZoom: number | undefined
): number {
  return msgZoom ?? markerFlyToZoom ?? globalFlyToZoom ?? DEFAULT_FLY_TO_ZOOM;
}

export function triggerSmartFlyTo(
  map: MapLibreGL.Map,
  target: FlyToTarget,
  options: FlyToOptions = {}
): void {
  const { zoom, markerFlyToZoom, globalFlyToZoom, smartFlyThreshold, onStart, onEnd } = options;
  const targetZoom = resolveFlyToZoom(zoom, markerFlyToZoom, globalFlyToZoom);

  const currentCenter = map.getCenter();
  const from: [number, number] = [currentCenter.lng, currentCenter.lat];
  const to: [number, number] = [target.lng, target.lat];

  const distance = getDistanceKm(from, to);
  const useSmartFly =
    smartFlyThreshold === undefined || distance >= smartFlyThreshold;

  onStart?.(target);

  if (!useSmartFly) {
    map.flyTo({ center: to, zoom: targetZoom, duration: 1500 });
    map.once('moveend', () => onEnd?.(target));
    return;
  }

  // Calculate zoom level that fits both points in view
  let fitZoom = 2;
  try {
    const bounds = new LngLatBounds(
      [Math.min(from[0], to[0]), Math.min(from[1], to[1])],
      [Math.max(from[0], to[0]), Math.max(from[1], to[1])]
    );
    const camera = map.cameraForBounds(bounds, { padding: 60 });
    if (camera && 'zoom' in camera && typeof camera.zoom === 'number') {
      fitZoom = Math.max(camera.zoom - 0.5, 1);
    }
  } catch {
    fitZoom = 2;
  }

  const currentZoom = map.getZoom();

  // If already zoomed out enough to see both points, skip zoom-out stage
  if (fitZoom >= currentZoom) {
    map.flyTo({ center: to, zoom: targetZoom, duration: 1500 });
    map.once('moveend', () => onEnd?.(target));
    return;
  }

  // Stage 1: zoom out to fit both points
  map.flyTo({ center: from, zoom: fitZoom, duration: 800 });
  map.once('moveend', () => {
    // Stage 2: fly to target and zoom in
    map.flyTo({ center: to, zoom: targetZoom, duration: 1200 });
    map.once('moveend', () => onEnd?.(target));
  });
}
