export interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  label?: string;
  color?: string;
  flyToZoom?: number;
}

export type CenterParam = [number, number] | { markerId: string };

export interface UrlParams {
  center?: CenterParam;
  zoom?: number;
  markers?: MarkerData[];
  onMarkerClick?: 'event-only' | 'flyto+highlight';
  flyToZoom?: number;
  smartFlyThreshold?: number;
}

function decodeBase64Url(str: string): string {
  // URL-safe Base64: replace - with + and _ with /
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  // Pad to multiple of 4
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  // Use TextDecoder to handle UTF-8 correctly (atob only handles Latin1)
  const binary = atob(base64);
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function parseUrlParams(): UrlParams {
  if (typeof window === 'undefined') return {};

  const params = new URLSearchParams(window.location.search);
  const result: UrlParams = {};

  const centerParam = params.get('center');
  if (centerParam) {
    if (centerParam.startsWith('marker:')) {
      const markerId = centerParam.slice('marker:'.length);
      if (markerId) {
        result.center = { markerId };
      }
    } else {
      const parts = centerParam.split(',');
      if (parts.length === 2) {
        const lng = parseFloat(parts[0]);
        const lat = parseFloat(parts[1]);
        if (!isNaN(lng) && !isNaN(lat)) {
          result.center = [lng, lat];
        }
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

  const onMarkerClickParam = params.get('onMarkerClick');
  if (onMarkerClickParam === 'flyto+highlight' || onMarkerClickParam === 'event-only') {
    result.onMarkerClick = onMarkerClickParam;
  }

  const flyToZoomParam = params.get('flyToZoom');
  if (flyToZoomParam) {
    const v = parseFloat(flyToZoomParam);
    if (!isNaN(v)) result.flyToZoom = v;
  }

  const smartFlyThresholdParam = params.get('smartFlyThreshold');
  if (smartFlyThresholdParam) {
    const v = parseFloat(smartFlyThresholdParam);
    if (!isNaN(v)) result.smartFlyThreshold = v;
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
      // silently ignore invalid markers param
    }
  }

  return result;
}
