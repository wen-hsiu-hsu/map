import type { MarkerData } from './parseUrlParams';

// Inbound messages (from parent to map)
export type InboundMessage =
  | { type: 'SET_MARKERS'; markers: MarkerData[] }
  | { type: 'FLY_TO'; lat: number; lng: number; zoom?: number }
  | { type: 'HIGHLIGHT'; id: string | null }
  | { type: 'SET_OPTIONS'; center?: [number, number]; zoom?: number };

// Outbound messages (from map to parent)
export type OutboundMessage =
  | { type: 'READY' }
  | { type: 'MARKER_CLICK'; id: string; lat: number; lng: number }
  | { type: 'ZOOM_CHANGE'; zoom: number }
  | { type: 'ERROR'; message: string };
