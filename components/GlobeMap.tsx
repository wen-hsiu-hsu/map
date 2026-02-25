'use client';

import MapLibreGL from 'maplibre-gl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Map, MapMarker, MarkerContent, MapClusterLayer, useMap } from '@/components/ui/map';
import type { MarkerData } from '@/lib/parseUrlParams';
import type { InboundMessage, OutboundMessage } from '@/lib/postMessageTypes';
import { isValidCoords } from '@/lib/validateCoords';
import { parseUrlParams } from '@/lib/parseUrlParams';

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
  onClick: (id: string) => void;
}

function MarkerElement({ marker, isActive, onClick }: MarkerElementProps) {
  const color = marker.color || '#22c55e';
  return (
    <div
      style={{ cursor: 'pointer', userSelect: 'none', textAlign: 'center', padding: '4px 8px', margin: '-4px -8px' }}
      onClick={() => onClick(marker.id)}
    >
      <div style={{ position: 'relative', width: 14, height: 14, margin: '0 auto' }}>
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
      {marker.label && (
        <div
          style={{
            marginTop: 4,
            fontSize: 11,
            fontWeight: 600,
            color: '#1e293b',
            whiteSpace: 'nowrap',
            textShadow:
              '0 1px 2px #fff, 0 -1px 2px #fff, 1px 0 2px #fff, -1px 0 2px #fff',
          }}
        >
          {marker.label}
        </div>
      )}
    </div>
  );
}

// Bridges map instance to outer scope and fires callbacks on load/zoom
interface MapEventsProps {
  markers: MarkerData[];
  activeMarkerId: string | null;
  onMarkerClick: (id: string) => void;
  pendingQueue: React.MutableRefObject<InboundMessage[]>;
  onMessage: (msg: InboundMessage) => void;
  onMapReady: (map: MapLibreGL.Map) => void;
  onMapRef: (map: MapLibreGL.Map | null) => void;
}

function MapEvents({
  markers,
  activeMarkerId,
  onMarkerClick,
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
      sendToParent({ type: 'READY' });
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
      {markers.map((marker) => (
        <MapMarker
          key={marker.id}
          longitude={marker.lng}
          latitude={marker.lat}
          anchor="top"
          offset={[0, -7]}
        >
          <MarkerContent>
            <MarkerElement
              marker={marker}
              isActive={activeMarkerId === marker.id}
              onClick={onMarkerClick}
            />
          </MarkerContent>
        </MapMarker>
      ))}

      {markers.length > 50 && (
        <MapClusterLayer
          data={clusterData}
          clusterMaxZoom={14}
          clusterRadius={50}
          clusterColors={['#22c55e', '#eab308', '#ef4444']}
          pointColor="#22c55e"
        />
      )}
    </>
  );
}

export default function GlobeMap() {
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingQueue = useRef<InboundMessage[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  const urlParams = useRef(parseUrlParams());
  const mapRef = useRef<MapLibreGL.Map | null>(null);

  const initialCenter = urlParams.current.center ?? DEFAULT_CENTER;
  const initialZoom = urlParams.current.zoom ?? DEFAULT_ZOOM;

  const handleMessage = useCallback((msg: InboundMessage) => {
    const map = mapRef.current;
    switch (msg.type) {
      case 'SET_MARKERS':
        setMarkers(msg.markers || []);
        setActiveMarkerId(null);
        break;
      case 'FLY_TO': {
        if (!isValidCoords(msg.lat, msg.lng)) {
          sendToParent({ type: 'ERROR', message: 'Invalid coordinates for FLY_TO' });
          return;
        }
        const flyOptions: MapLibreGL.FlyToOptions = {
          center: [msg.lng, msg.lat],
          duration: 1500,
        };
        if (msg.zoom !== undefined) flyOptions.zoom = msg.zoom;
        map?.flyTo(flyOptions);
        break;
      }
      case 'HIGHLIGHT':
        setActiveMarkerId(msg.id);
        break;
      case 'SET_OPTIONS': {
        const jumpOptions: MapLibreGL.CameraOptions = {};
        if (msg.center) jumpOptions.center = msg.center;
        if (msg.zoom !== undefined) jumpOptions.zoom = msg.zoom;
        map?.jumpTo(jumpOptions);
        break;
      }
    }
  }, []);

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
      setActiveMarkerId(id);
      sendToParent({ type: 'MARKER_CLICK', id, lat: marker.lat, lng: marker.lng });
    },
    [markers]
  );

  const onMapReady = useCallback((_map: MapLibreGL.Map) => {
    setIsLoaded(true);
    if (urlParams.current.markers?.length) {
      setMarkers(urlParams.current.markers);
    }
  }, []);

  const onMapRef = useCallback((map: MapLibreGL.Map | null) => {
    mapRef.current = map;
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0 }}>
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
          pendingQueue={pendingQueue}
          onMessage={handleMessage}
          onMapReady={onMapReady}
          onMapRef={onMapRef}
        />
      </Map>
    </div>
  );
}
