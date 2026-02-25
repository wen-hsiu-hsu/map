export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
}

export interface UrlParams {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MarkerData[];
}

function decodeBase64Url(str: string): string {
  // URL-safe Base64: replace - with + and _ with /
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad to multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  return atob(base64);
}

export function parseUrlParams(): UrlParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result: UrlParams = {};

  const centerParam = params.get('center');
  if (centerParam) {
    const parts = centerParam.split(',');
    if (parts.length === 2) {
      const lng = parseFloat(parts[0]);
      const lat = parseFloat(parts[1]);
      if (!isNaN(lng) && !isNaN(lat)) {
        result.center = [lng, lat];
      }
    }
  }

  const zoomParam = params.get('zoom');
  if (zoomParam) {
    const zoom = parseFloat(zoomParam);
    if (!isNaN(zoom)) {
      result.zoom = zoom;
    }
  }

  const markersParam = params.get('markers');
  if (markersParam) {
    try {
      const decoded = decodeBase64Url(markersParam);
      const parsed = JSON.parse(decoded);
      if (Array.isArray(parsed)) {
        result.markers = parsed as MarkerData[];
      }
    } catch {
      console.warn('[map] Failed to parse markers URL param:', markersParam);
    }
  }

  return result;
}
