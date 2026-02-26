'use client';

import MapLibreGL from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, MapMarker, MarkerContent, MapClusterLayer, useMap } from '@/components/ui/map';
import type { MarkerData } from '@/lib/parseUrlParams';
import type { InboundMessage, OutboundMessage } from '@/lib/postMessageTypes';
import { isValidCoords } from '@/lib/validateCoords';
import { parseUrlParams } from '@/lib/parseUrlParams';
import { triggerSmartFlyTo } from '@/lib/flyTo';

const BASEMAP_URL =
  process.env.NEXT_PUBLIC_BASEMAP_URL ||
  'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json';

const DEFAULT_CENTER: [number, number] = [0, 20];
const DEFAULT_ZOOM = 2;

function sendToParent(msg: OutboundMessage) {
  if (typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage(msg, '*');
  }
}

interface MarkerElementProps {
  marker: MarkerData;
  isActive: boolean;
  hasActiveMarker: boolean;
  defaultColor: string;
  onClick: (id: string) => void;
}

function MarkerElement({ marker, isActive, hasActiveMarker, defaultColor, onClick }: MarkerElementProps) {
  const [isHovered, setIsHovered] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const color = marker.color || defaultColor;

  function setMarkerZIndex(value: string) {
    const markerEl = containerRef.current?.closest<HTMLElement>('.maplibregl-marker');
    if (markerEl) markerEl.style.zIndex = value;
  }

  // Show label when: active, hovered, or no highlight mode active
  const showLabel = !!marker.label && (isActive || isHovered || !hasActiveMarker);
  // Dim non-active dots when a highlight is active
  const dotOpacity = hasActiveMarker && !isActive ? 0.3 : 1;

  return (
    <div
      ref={containerRef}
      data-marker="true"
      style={{ cursor: 'pointer', userSelect: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', overflow: 'visible' }}
      onClick={() => onClick(marker.id)}
      onMouseEnter={() => { setIsHovered(true); setMarkerZIndex('1000'); }}
      onMouseLeave={() => { setIsHovered(false); setMarkerZIndex(''); }}
    >
      {/* Label card + connecting line, above the dot */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
        {/* Frosted glass label card */}
        <div
          style={{
            visibility: showLabel ? 'visible' : 'hidden',
            opacity: showLabel ? 1 : 0,
            transition: 'opacity 0.15s ease',
            fontSize: 11,
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            padding: '3px 8px',
            borderRadius: 6,
            background: 'rgba(255,255,255,0.92)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.1)',
            lineHeight: '16px',
          }}
        >
          {marker.label}
        </div>
        {/* Connecting line */}
        <div
          style={{
            visibility: showLabel ? 'visible' : 'hidden',
            opacity: showLabel ? 1 : 0,
            transition: 'opacity 0.15s ease',
            width: 1,
            height: 10,
            background: 'rgba(0,0,0,0.25)',
          }}
        />
      </div>

      {/* Dot */}
      <div style={{ position: 'relative', width: 14, height: 14, opacity: dotOpacity, transition: 'opacity 0.2s ease' }}>
        {/* ping 擴散環 */}
        {isActive && (
          <div
            className="animate-ping absolute inset-0 rounded-full"
            style={{ backgroundColor: color, opacity: 0.75 }}
          />
        )}
        {/* 圓點本體 */}
        <div
          style={{
            position: 'relative',
            width: 14,
            height: 14,
            borderRadius: '50%',
            backgroundColor: color,
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </div>
  );
}

// Bridges map instance to outer scope and fires callbacks on load/zoom
interface MapEventsProps {
  markers: MarkerData[];
  activeMarkerId: string | null;
  onMarkerClick: (id: string) => void;
  defaultMarkerColor: string;
  pendingQueue: React.MutableRefObject<InboundMessage[]>;
  onMessage: (msg: InboundMessage) => void;
  onMapReady: (map: MapLibreGL.Map) => void;
  onMapRef: (map: MapLibreGL.Map | null) => void;
}

function MapEvents({
  markers,
  activeMarkerId,
  onMarkerClick,
  defaultMarkerColor,
  pendingQueue,
  onMessage,
  onMapReady,
  onMapRef,
}: MapEventsProps) {
  const { map, isLoaded: mapReady } = useMap();
  const readyFired = useRef(false);

  useEffect(() => {
    onMapRef(map ?? null);
  }, [map, onMapRef]);

  useEffect(() => {
    if (mapReady && map && !readyFired.current) {
      readyFired.current = true;
      onMapReady(map);
      const queue = pendingQueue.current;
      pendingQueue.current = [];
      queue.forEach(onMessage);
    }
  }, [mapReady, map, onMapReady, pendingQueue, onMessage]);

  useEffect(() => {
    if (!mapReady || !map) return;
    const onZoomEnd = () => {
      sendToParent({ type: 'ZOOM_CHANGE', zoom: map.getZoom() });
    };
    map.on('zoomend', onZoomEnd);
    return () => {
      map.off('zoomend', onZoomEnd);
    };
  }, [mapReady, map]);

  useEffect(() => {
    if (!mapReady || !map) return;
    const onMapClick = (e: MapLibreGL.MapMouseEvent) => {
      // Don't fire MAP_CLICK when user clicked on a marker DOM element
      const target = e.originalEvent.target as HTMLElement | null;
      if (target?.closest('[data-marker]')) return;
      sendToParent({ type: 'MAP_CLICK', lat: e.lngLat.lat, lng: e.lngLat.lng });
    };
    map.on('click', onMapClick);
    return () => {
      map.off('click', onMapClick);
    };
  }, [mapReady, map]);

  const clusterData: GeoJSON.FeatureCollection<GeoJSON.Point> = {
    type: 'FeatureCollection',
    features: markers.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: { id: m.id, label: m.label, color: m.color || '#22c55e' },
    })),
  };

  return (
    <>
      {/* cluster 模式（> 50 點）：只用 GL layer，隱藏所有 DOM markers */}
      {markers.length > 50 ? (
        <MapClusterLayer
          data={clusterData}
          clusterMaxZoom={14}
          clusterRadius={50}
          clusterColors={['#22c55e', '#eab308', '#ef4444']}
          pointColor="#22c55e"
        />
      ) : (
        markers.map((marker) => (
          <MapMarker
            key={marker.id}
            longitude={marker.lng}
            latitude={marker.lat}
            anchor="bottom"
            offset={[0, 7]}
          >
            <MarkerContent>
              <MarkerElement
                marker={marker}
                isActive={activeMarkerId === marker.id}
                hasActiveMarker={activeMarkerId !== null}
                defaultColor={defaultMarkerColor}
                onClick={onMarkerClick}
              />
            </MarkerContent>
          </MapMarker>
        ))
      )}
    </>
  );
}

interface PlayIntroOptions {
  duration?: number;
  rotate?: number;
  onEnd?: () => void;
}

function playIntro(
  map: MapLibreGL.Map,
  targetCenter: [number, number],
  targetZoom: number,
  options: PlayIntroOptions = {}
) {
  const { duration = 3000, rotate = 90, onEnd } = options;
  const [targetLng, targetLat] = targetCenter;
  const startLng = targetLng - rotate;
  const startZoom = 1;

  map.jumpTo({ center: [startLng, 0], zoom: startZoom });

  const easeInOut = (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;

  const startTime = performance.now();
  let rafId: number;

  function frame(now: number) {
    const t = Math.min((now - startTime) / duration, 1);
    const e = easeInOut(t);

    const lng = startLng + (targetLng - startLng) * e;
    const lat = 0 + (targetLat - 0) * e;
    const zoom = startZoom + (targetZoom - startZoom) * e;

    map.jumpTo({ center: [lng, lat], zoom });

    if (t < 1) {
      rafId = requestAnimationFrame(frame);
    } else {
      map.jumpTo({ center: targetCenter, zoom: targetZoom });
      onEnd?.();
    }
  }

  rafId = requestAnimationFrame(frame);

  // Return cleanup function in case animation needs to be cancelled
  return () => cancelAnimationFrame(rafId);
}

export default function GlobeMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [showOverlay, setShowOverlay] = useState(true);
  const pendingQueue = useRef<InboundMessage[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const urlParams = useRef(parseUrlParams());
  const mapRef = useRef<MapLibreGL.Map | null>(null);
  const cancelIntroRef = useRef<(() => void) | null>(null);

  // New state for map-core-enhancements — use refs to avoid stale closures in handleMessage
  const onMarkerClickModeRef = useRef<'event-only' | 'flyto+highlight'>('event-only');
  const globalFlyToZoomRef = useRef<number | undefined>(undefined);
  const smartFlyThresholdRef = useRef<number | undefined>(undefined);
  const markersRef = useRef<MarkerData[]>([]);

  // Keep markersRef in sync with markers state
  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);

  // Resolve initial center: if it's a markerId reference, use DEFAULT_CENTER for Map component
  // (actual resolution happens in onMapReady after markers are set)
  const initialCenter = (() => {
    const c = urlParams.current.center;
    if (!c || typeof c === 'object' && 'markerId' in c) return DEFAULT_CENTER;
    return c as [number, number];
  })();
  const initialZoom = urlParams.current.zoom ?? DEFAULT_ZOOM;

  const applyInteractive = useCallback((map: MapLibreGL.Map, interactive: boolean) => {
    if (interactive) {
      map.dragPan.enable();
      map.scrollZoom.enable();
      map.doubleClickZoom.enable();
      map.touchZoomRotate.enable();
      map.keyboard.enable();
    } else {
      map.dragPan.disable();
      map.scrollZoom.disable();
      map.doubleClickZoom.disable();
      map.touchZoomRotate.disable();
      map.keyboard.disable();
    }
  }, []);

  const handleMessage = useCallback((msg: InboundMessage) => {
    const map = mapRef.current;
    switch (msg.type) {
      case 'PLAY_INTRO': {
        if (!map) return;
        const p = urlParams.current;
        let targetCenter: [number, number] = DEFAULT_CENTER;
        if (p.center !== undefined) {
          if (Array.isArray(p.center)) {
            targetCenter = p.center as [number, number];
          } else if ('markerId' in p.center) {
            const found = markersRef.current.find((m) => m.id === (p.center as { markerId: string }).markerId);
            if (found) targetCenter = [found.lng, found.lat];
          }
        }
        const targetZoom = p.zoom ?? DEFAULT_ZOOM;
        cancelIntroRef.current?.();
        setShowOverlay(true);
        // Wait for overlay to fade in before starting animation
        setTimeout(() => {
          setShowOverlay(false);
          cancelIntroRef.current = playIntro(map, targetCenter, targetZoom, {
            duration: p.introDuration,
            rotate: p.introRotate,
            onEnd: () => sendToParent({ type: 'READY' }),
          });
        }, 300);
        break;
      }
      case 'SET_MARKERS':
        setMarkers(msg.markers || []);
        setActiveMarkerId(null);
        break;
      case 'FLY_TO': {
        if (!isValidCoords(msg.lat, msg.lng)) {
          sendToParent({ type: 'ERROR', message: 'Invalid coordinates for FLY_TO' });
          return;
        }
        if (!map) return;
        triggerSmartFlyTo(
          map,
          { lng: msg.lng, lat: msg.lat },
          {
            zoom: msg.zoom,
            globalFlyToZoom: globalFlyToZoomRef.current,
            smartFlyThreshold: smartFlyThresholdRef.current,
            onStart: (t) => sendToParent({ type: 'FLY_START', lat: t.lat, lng: t.lng }),
            onEnd: (t) => sendToParent({ type: 'FLY_END', lat: t.lat, lng: t.lng }),
          }
        );
        break;
      }
      case 'HIGHLIGHT':
        setActiveMarkerId(msg.id);
        break;
      case 'SET_OPTIONS': {
        if (msg.onMarkerClick !== undefined) {
          onMarkerClickModeRef.current = msg.onMarkerClick;
        }
        if (msg.flyToZoom !== undefined) {
          globalFlyToZoomRef.current = msg.flyToZoom;
        }
        if (msg.smartFlyThreshold !== undefined) {
          smartFlyThresholdRef.current = msg.smartFlyThreshold;
        }
        if (msg.interactive !== undefined && map) {
          applyInteractive(map, msg.interactive);
        }

        if (msg.center !== undefined || msg.zoom !== undefined) {
          const jumpOptions: MapLibreGL.CameraOptions = {};
          if (msg.center !== undefined) {
            if (Array.isArray(msg.center)) {
              jumpOptions.center = msg.center as [number, number];
            } else if ('markerId' in msg.center) {
              const found = markersRef.current.find((m) => m.id === (msg.center as { markerId: string }).markerId);
              if (found) jumpOptions.center = [found.lng, found.lat];
              // else: fallback — do not jump
            }
          }
          if (msg.zoom !== undefined) jumpOptions.zoom = msg.zoom;
          if (Object.keys(jumpOptions).length > 0) map?.jumpTo(jumpOptions);
        }
        break;
      }
    }
  }, [applyInteractive]);

  // postMessage listener
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data as InboundMessage;
      if (!msg?.type) return;
      if (!isLoaded) {
        pendingQueue.current.push(msg);
      } else {
        handleMessage(msg);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isLoaded, handleMessage]);

  const handleMarkerClick = useCallback(
    (id: string) => {
      const marker = markers.find((m) => m.id === id);
      if (!marker) return;
      sendToParent({ type: 'MARKER_CLICK', id, lat: marker.lat, lng: marker.lng });

      if (onMarkerClickModeRef.current === 'flyto+highlight') {
        setActiveMarkerId(id);
        const map = mapRef.current;
        if (map) {
          triggerSmartFlyTo(
            map,
            { lng: marker.lng, lat: marker.lat },
            {
              markerFlyToZoom: marker.flyToZoom,
              globalFlyToZoom: globalFlyToZoomRef.current,
              smartFlyThreshold: smartFlyThresholdRef.current,
              onStart: (t) => sendToParent({ type: 'FLY_START', lat: t.lat, lng: t.lng }),
              onEnd: (t) => sendToParent({ type: 'FLY_END', lat: t.lat, lng: t.lng }),
            }
          );
        }
      } else {
        setActiveMarkerId(id);
      }
    },
    [markers]
  );

  const onMapReady = useCallback((map: MapLibreGL.Map) => {
    setIsLoaded(true);
    const p = urlParams.current;

    // Apply URL-param global settings
    if (p.onMarkerClick) onMarkerClickModeRef.current = p.onMarkerClick;
    if (p.flyToZoom !== undefined) globalFlyToZoomRef.current = p.flyToZoom;
    if (p.smartFlyThreshold !== undefined) smartFlyThresholdRef.current = p.smartFlyThreshold;

    // Set markers first so center→markerId resolution can find them
    if (p.markers?.length) {
      setMarkers(p.markers);
    }

    // Resolve target center
    let targetCenter: [number, number] = DEFAULT_CENTER;
    if (p.center !== undefined) {
      if (Array.isArray(p.center)) {
        targetCenter = p.center as [number, number];
      } else if ('markerId' in p.center) {
        const found = (p.markers ?? []).find((m) => m.id === (p.center as { markerId: string }).markerId);
        targetCenter = found ? [found.lng, found.lat] : DEFAULT_CENTER;
      }
    }
    const targetZoom = p.zoom ?? DEFAULT_ZOOM;

    if (p.intro) {
      // Jump to intro start position while overlay is still opaque
      const rotate = p.introRotate ?? 90;
      map.jumpTo({ center: [targetCenter[0] - rotate, 0], zoom: 1 });
      // rAF ensures browser paints opacity:1 before we change to 0, triggering the CSS transition
      requestAnimationFrame(() => {
        map.getCanvas().style.opacity = '1';
        setShowOverlay(false);
      });
      setTimeout(() => {
        cancelIntroRef.current = playIntro(map, targetCenter, targetZoom, {
          duration: p.introDuration,
          rotate: p.introRotate,
          onEnd: () => sendToParent({ type: 'READY' }),
        });
      }, 400);
    } else {
      map.jumpTo({ center: targetCenter, zoom: targetZoom });
      requestAnimationFrame(() => {
        map.getCanvas().style.opacity = '1';
        setShowOverlay(false);
      });
      sendToParent({ type: 'READY' });
    }
  }, []);

  const onMapRef = useCallback((map: MapLibreGL.Map | null) => {
    mapRef.current = map;
    if (map) {
      const canvas = map.getCanvas();
      canvas.style.opacity = '0';
      canvas.style.transition = 'opacity 0.3s ease';
    }
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 10,
          background: '#ffffff',
          opacity: showOverlay ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: showOverlay ? 'auto' : 'none',
        }}
      />
      <Map
        styles={{ light: BASEMAP_URL, dark: BASEMAP_URL }}
        theme="light"
        projection={{ type: 'globe' }}
        center={initialCenter}
        zoom={initialZoom}
        dragRotate={false}
        className="w-full h-full"
      >
        <MapEvents
          markers={markers}
          activeMarkerId={activeMarkerId}
          onMarkerClick={handleMarkerClick}
          defaultMarkerColor={urlParams.current.markerColor ?? '#22c55e'}
          pendingQueue={pendingQueue}
          onMessage={handleMessage}
          onMapReady={onMapReady}
          onMapRef={onMapRef}
        />
      </Map>
    </div>
  );
}
