'use client'

import Link from 'next/link'
import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface MarkerRow {
  id: string
  lat: string
  lng: string
  label: string
  color: string
  flyToZoom: string
}

interface LiveMarkerRow {
  id: string
  lat: string
  lng: string
  label: string
  color: string
}

interface LogEntry {
  time: string
  dir: 'in' | 'out'
  text: string
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function encodeMarkersBase64(markers: MarkerRow[]): string {
  const valid = markers
    .filter((m) => m.id && m.lat && m.lng)
    .map((m) => {
      const entry: Record<string, string | number> = {
        id: m.id,
        lat: parseFloat(m.lat),
        lng: parseFloat(m.lng),
      }
      if (m.label) entry.label = m.label
      if (m.color) entry.color = m.color
      if (m.flyToZoom) entry.flyToZoom = parseFloat(m.flyToZoom)
      return entry
    })
  if (valid.length === 0) return ''
  const json = JSON.stringify(valid)
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((b) => { binary += String.fromCharCode(b) })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function buildIframeSrc(
  centerMode: 'coords' | 'markerId',
  centerLng: string,
  centerLat: string,
  centerMarkerId: string,
  zoom: string,
  markers: MarkerRow[],
  onMarkerClick: 'event-only' | 'flyto+highlight',
  globalFlyToZoom: string,
  smartFlyThreshold: string,
  introEnabled: boolean,
  introDuration: string,
  introRotate: string,
): string {
  const base = typeof window !== 'undefined' ? window.location.origin : ''
  const params = new URLSearchParams()
  if (centerMode === 'markerId') {
    if (centerMarkerId) params.set('center', `marker:${centerMarkerId}`)
  } else {
    if (centerLng && centerLat) params.set('center', `${centerLng},${centerLat}`)
  }
  if (zoom) params.set('zoom', zoom)
  if (onMarkerClick === 'flyto+highlight') params.set('onMarkerClick', 'flyto+highlight')
  if (globalFlyToZoom) params.set('flyToZoom', globalFlyToZoom)
  if (smartFlyThreshold) params.set('smartFlyThreshold', smartFlyThreshold)
  if (introEnabled) {
    params.set('intro', 'true')
    if (introDuration) params.set('introDuration', introDuration)
    if (introRotate) params.set('introRotate', introRotate)
  }
  const encodedMarkers = encodeMarkersBase64(markers)
  if (encodedMarkers) params.set('markers', encodedMarkers)
  const query = params.toString()
  return `${base}/${query ? `?${query}` : ''}`
}

// ─── LocalStorage ─────────────────────────────────────────────────────────────

const LS_KEY = 'globe-map-generator-state'
const LS_LIVE_KEY = 'globe-map-generator-live'

interface PersistedState {
  centerMode: 'coords' | 'markerId'
  centerLng: string
  centerLat: string
  centerMarkerId: string
  zoom: string
  markers: MarkerRow[]
  onMarkerClick: 'event-only' | 'flyto+highlight'
  globalFlyToZoom: string
  smartFlyThreshold: string
  introEnabled: boolean
  introDuration: string
  introRotate: string
  markerCounter: number
}

interface PersistedLiveState {
  liveMarkers: LiveMarkerRow[]
  flyLat: string
  flyLng: string
  flyZoom: string
  highlightId: string
  optLng: string
  optLat: string
  optZoom: string
  liveMarkerCounter: number
}

function loadLS<T>(key: string): Partial<T> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

let markerCounter = (() => {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? (JSON.parse(raw) as PersistedState).markerCounter ?? 0 : 0
  } catch { return 0 }
})()

let liveMarkerCounter = (() => {
  if (typeof window === 'undefined') return 0
  try {
    const raw = localStorage.getItem(LS_LIVE_KEY)
    return raw ? (JSON.parse(raw) as PersistedLiveState).liveMarkerCounter ?? 0 : 0
  } catch { return 0 }
})()

function newMarkerRow(lat = '', lng = ''): MarkerRow {
  markerCounter += 1
  return { id: `marker-${markerCounter}`, lat, lng, label: '', color: '', flyToZoom: '' }
}

function newLiveMarkerRow(): LiveMarkerRow {
  liveMarkerCounter += 1
  return { id: `marker-${liveMarkerCounter}`, lat: '', lng: '', label: '', color: '' }
}

function usePersistedState<T>(key: keyof PersistedState, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const saved = loadLS<PersistedState>(LS_KEY)
  const [state, setState] = useState<T>((key in saved ? saved[key] : defaultValue) as T)
  return [state, setState]
}

function usePersistedLiveState<T>(key: keyof PersistedLiveState, defaultValue: T): [T, Dispatch<SetStateAction<T>>] {
  const saved = loadLS<PersistedLiveState>(LS_LIVE_KEY)
  const [state, setState] = useState<T>((key in saved ? saved[key] : defaultValue) as T)
  return [state, setState]
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GeneratorPage() {
  const [activeTab, setActiveTab] = useState<'embed' | 'live'>('embed')

  // Embed Config state
  const [centerMode, setCenterMode] = usePersistedState<'coords' | 'markerId'>('centerMode', 'coords')
  const [centerLng, setCenterLng] = usePersistedState<string>('centerLng', '121.5319')
  const [centerLat, setCenterLat] = usePersistedState<string>('centerLat', '25.0478')
  const [centerMarkerId, setCenterMarkerId] = usePersistedState<string>('centerMarkerId', '')
  const [zoom, setZoom] = usePersistedState<string>('zoom', '10')
  const [markers, setMarkers] = usePersistedState<MarkerRow[]>('markers', [])
  const [onMarkerClick, setOnMarkerClick] = usePersistedState<'event-only' | 'flyto+highlight'>('onMarkerClick', 'event-only')
  const [globalFlyToZoom, setGlobalFlyToZoom] = usePersistedState<string>('globalFlyToZoom', '')
  const [smartFlyThreshold, setSmartFlyThreshold] = usePersistedState<string>('smartFlyThreshold', '')
  const [introEnabled, setIntroEnabled] = usePersistedState<boolean>('introEnabled', false)
  const [introDuration, setIntroDuration] = usePersistedState<string>('introDuration', '')
  const [introRotate, setIntroRotate] = usePersistedState<string>('introRotate', '')
  const [copied, setCopied] = useState(false)

  // Coordinate picker
  const [pickedCoord, setPickedCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [applyMarkerTarget, setApplyMarkerTarget] = useState<'new' | number>('new')

  // Live Controls state
  const [liveMarkers, setLiveMarkers] = usePersistedLiveState<LiveMarkerRow[]>('liveMarkers', [])
  const [flyLat, setFlyLat] = usePersistedLiveState<string>('flyLat', '')
  const [flyLng, setFlyLng] = usePersistedLiveState<string>('flyLng', '')
  const [flyZoom, setFlyZoom] = usePersistedLiveState<string>('flyZoom', '')
  const [highlightId, setHighlightId] = usePersistedLiveState<string>('highlightId', '')
  const [optLng, setOptLng] = usePersistedLiveState<string>('optLng', '')
  const [optLat, setOptLat] = usePersistedLiveState<string>('optLat', '')
  const [optZoom, setOptZoom] = usePersistedLiveState<string>('optZoom', '')
  const [events, setEvents] = useState<LogEntry[]>([])

  // Persist embed state
  useEffect(() => {
    const state: PersistedState = {
      centerMode, centerLng, centerLat, centerMarkerId, zoom, markers,
      onMarkerClick, globalFlyToZoom, smartFlyThreshold,
      introEnabled, introDuration, introRotate,
      markerCounter,
    }
    localStorage.setItem(LS_KEY, JSON.stringify(state))
  }, [centerMode, centerLng, centerLat, centerMarkerId, zoom, markers, onMarkerClick, globalFlyToZoom, smartFlyThreshold, introEnabled, introDuration, introRotate])

  // Persist live state
  useEffect(() => {
    const state: PersistedLiveState = {
      liveMarkers, flyLat, flyLng, flyZoom, highlightId, optLng, optLat, optZoom, liveMarkerCounter,
    }
    localStorage.setItem(LS_LIVE_KEY, JSON.stringify(state))
  }, [liveMarkers, flyLat, flyLng, flyZoom, highlightId, optLng, optLat, optZoom])

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const mapReadyRef = useRef(false)

  const iframeSrc = useMemo(
    () => buildIframeSrc(centerMode, centerLng, centerLat, centerMarkerId, zoom, markers, onMarkerClick, globalFlyToZoom, smartFlyThreshold, introEnabled, introDuration, introRotate),
    [centerMode, centerLng, centerLat, centerMarkerId, zoom, markers, onMarkerClick, globalFlyToZoom, smartFlyThreshold, introEnabled, introDuration, introRotate],
  )
  const tooLong = iframeSrc.length > 4000

  // ── Log helpers ──
  function logOut(msg: object) {
    setEvents((prev) => [
      { time: new Date().toLocaleTimeString(), dir: 'out', text: JSON.stringify(msg) },
      ...prev.slice(0, 99),
    ])
  }
  function logIn(msg: object) {
    setEvents((prev) => [
      { time: new Date().toLocaleTimeString(), dir: 'in', text: JSON.stringify(msg) },
      ...prev.slice(0, 99),
    ])
  }

  // ── Send helpers ──
  const sendGlobalSettings = useCallback(() => {
    const win = iframeRef.current?.contentWindow
    if (!win) return
    const msg: Record<string, unknown> = { type: 'SET_OPTIONS', onMarkerClick }
    if (globalFlyToZoom) msg.flyToZoom = parseFloat(globalFlyToZoom)
    if (smartFlyThreshold) msg.smartFlyThreshold = parseFloat(smartFlyThreshold)
    win.postMessage(msg, '*')
  }, [onMarkerClick, globalFlyToZoom, smartFlyThreshold])

  function sendLive(msg: object) {
    iframeRef.current?.contentWindow?.postMessage(msg, '*')
    logOut(msg)
  }

  // ── Message listener ──
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      const msg = event.data
      if (!msg?.type) return
      logIn(msg)
      if (msg.type === 'READY') {
        mapReadyRef.current = true
        sendGlobalSettings()
      }
      if (msg.type === 'MAP_CLICK') {
        setPickedCoord({ lat: msg.lat, lng: msg.lng })
      }
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [sendGlobalSettings])

  useEffect(() => {
    if (mapReadyRef.current) sendGlobalSettings()
  }, [sendGlobalSettings])

  const handleIframeLoad = useCallback(() => {
    mapReadyRef.current = false
  }, [])

  // ── Embed Config helpers ──
  function addMarker(lat = '', lng = '') {
    setMarkers((prev) => [...prev, newMarkerRow(lat, lng)])
  }
  function removeMarker(index: number) {
    setMarkers((prev) => prev.filter((_, i) => i !== index))
  }
  function updateMarker(index: number, field: keyof MarkerRow, value: string) {
    setMarkers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }
  async function copyToClipboard() {
    await navigator.clipboard.writeText(iframeSrc)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  function applyPickedToCenter() {
    if (!pickedCoord) return
    setCenterMode('coords')
    setCenterLng(String(Math.round(pickedCoord.lng * 1e6) / 1e6))
    setCenterLat(String(Math.round(pickedCoord.lat * 1e6) / 1e6))
    setPickedCoord(null)
  }
  function applyPickedToMarker() {
    if (!pickedCoord) return
    const lat = String(Math.round(pickedCoord.lat * 1e6) / 1e6)
    const lng = String(Math.round(pickedCoord.lng * 1e6) / 1e6)
    if (applyMarkerTarget === 'new') {
      addMarker(lat, lng)
    } else {
      updateMarker(applyMarkerTarget, 'lat', lat)
      updateMarker(applyMarkerTarget, 'lng', lng)
    }
    setPickedCoord(null)
  }

  // ── Live Controls helpers ──
  function addLiveMarker() {
    setLiveMarkers((prev) => [...prev, newLiveMarkerRow()])
  }
  function removeLiveMarker(index: number) {
    setLiveMarkers((prev) => prev.filter((_, i) => i !== index))
  }
  function updateLiveMarker(index: number, field: keyof LiveMarkerRow, value: string) {
    setLiveMarkers((prev) => prev.map((m, i) => (i === index ? { ...m, [field]: value } : m)))
  }
  function sendSetMarkers() {
    const mkrs = liveMarkers
      .filter((m) => m.id && m.lat && m.lng)
      .map((m) => {
        const entry: Record<string, string | number> = { id: m.id, lat: parseFloat(m.lat), lng: parseFloat(m.lng) }
        if (m.label) entry.label = m.label
        if (m.color) entry.color = m.color
        return entry
      })
    sendLive({ type: 'SET_MARKERS', markers: mkrs })
  }
  function sendFlyTo() {
    const lat = parseFloat(flyLat)
    const lng = parseFloat(flyLng)
    if (isNaN(lat) || isNaN(lng)) return
    const msg: Record<string, unknown> = { type: 'FLY_TO', lat, lng }
    if (flyZoom !== '') msg.zoom = parseFloat(flyZoom)
    sendLive(msg)
  }
  function sendHighlight() {
    sendLive({ type: 'HIGHLIGHT', id: highlightId.trim() || null })
  }
  function sendSetOptions() {
    const msg: Record<string, unknown> = { type: 'SET_OPTIONS' }
    if (optLng !== '' && optLat !== '') msg.center = [parseFloat(optLng), parseFloat(optLat)]
    if (optZoom !== '') msg.zoom = parseFloat(optZoom)
    sendLive(msg)
  }

  // ── Render ──
  return (
    <div style={{ fontFamily: 'sans-serif', display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Left panel */}
      <div style={{ width: 360, flexShrink: 0, display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRight: '1px solid #e2e8f0' }}>

        {/* Header + Tabs */}
        <div style={{ padding: '16px 20px 0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <h1 style={{ fontSize: 15, fontWeight: 700, color: '#0f172a', margin: 0 }}>Map Generator</h1>
            <Link href="/docs" style={{ fontSize: 12, color: '#0369a1', textDecoration: 'none', padding: '3px 8px', border: '1px solid #bae6fd', borderRadius: 5, background: '#f0f9ff' }}>文件說明</Link>
          </div>
          <div style={{ display: 'flex', borderBottom: '2px solid #e2e8f0' }}>
            {(['embed', 'live'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  flex: 1,
                  padding: '7px 0',
                  fontSize: 12,
                  fontWeight: 600,
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  color: activeTab === tab ? '#3b82f6' : '#64748b',
                  borderBottom: activeTab === tab ? '2px solid #3b82f6' : '2px solid transparent',
                  marginBottom: -2,
                }}
              >
                {tab === 'embed' ? 'Embed Config' : 'Live Controls'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>

          {activeTab === 'embed' ? (
            <>
              {/* Coordinate picker */}
              {pickedCoord && (
                <section style={{ ...sectionStyle, borderColor: '#6366f1', background: '#eef2ff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#4338ca' }}>Picked Location</span>
                    <button onClick={() => setPickedCoord(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: 16, lineHeight: 1, padding: 0 }}>✕</button>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace', color: '#1e293b', marginBottom: 10 }}>
                    lat: {pickedCoord.lat.toFixed(6)}　lng: {pickedCoord.lng.toFixed(6)}
                  </div>
                  <button style={{ ...btnStyle, marginBottom: 8, background: '#6366f1' }} onClick={applyPickedToCenter}>Apply to Center</button>
                  <div style={{ fontSize: 12, color: '#475569', fontWeight: 600, marginBottom: 4 }}>Apply to Marker:</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <input type="radio" name="applyTarget" checked={applyMarkerTarget === 'new'} onChange={() => setApplyMarkerTarget('new')} />
                      Add new marker
                    </label>
                    {markers.length > 0 && (
                      <label style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="radio" name="applyTarget" checked={typeof applyMarkerTarget === 'number'} onChange={() => setApplyMarkerTarget(0)} />
                        Apply to existing:&nbsp;
                        <select
                          style={{ fontSize: 12, border: '1px solid #cbd5e1', borderRadius: 4, padding: '2px 4px' }}
                          value={typeof applyMarkerTarget === 'number' ? applyMarkerTarget : 0}
                          onChange={(e) => setApplyMarkerTarget(parseInt(e.target.value))}
                          onClick={() => { if (applyMarkerTarget === 'new') setApplyMarkerTarget(0) }}
                        >
                          {markers.map((m, i) => <option key={i} value={i}>{m.id}{m.label ? ` – ${m.label}` : ''}</option>)}
                        </select>
                      </label>
                    )}
                  </div>
                  <button style={{ ...btnStyle, marginTop: 8, background: '#0ea5e9' }} onClick={applyPickedToMarker}>Apply to Marker</button>
                </section>
              )}

              {/* Center & Zoom */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>Center &amp; Zoom</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 2 }}>
                    {(['coords', 'markerId'] as const).map((mode) => (
                      <button key={mode} style={{ ...modeBtnStyle, background: centerMode === mode ? '#3b82f6' : '#e2e8f0', color: centerMode === mode ? 'white' : '#475569' }} onClick={() => setCenterMode(mode)}>
                        {mode === 'coords' ? 'Coordinates' : 'Marker ID'}
                      </button>
                    ))}
                  </div>
                  {centerMode === 'coords' ? (
                    <>
                      <label style={labelStyle}>Longitude<input style={inputStyle} type="number" step="any" value={centerLng} onChange={(e) => setCenterLng(e.target.value)} placeholder="e.g. 121.5319" /></label>
                      <label style={labelStyle}>Latitude<input style={inputStyle} type="number" step="any" value={centerLat} onChange={(e) => setCenterLat(e.target.value)} placeholder="e.g. 25.0478" /></label>
                    </>
                  ) : (
                    <label style={labelStyle}>
                      Marker ID
                      <select style={{ ...inputStyle, color: centerMarkerId ? '#0f172a' : '#94a3b8' }} value={centerMarkerId} onChange={(e) => setCenterMarkerId(e.target.value)}>
                        <option value="">— select a marker —</option>
                        {markers.map((m, i) => <option key={i} value={m.id}>{m.id}{m.label ? ` – ${m.label}` : ''}</option>)}
                      </select>
                      {markers.length === 0 && <span style={{ fontSize: 11, color: '#94a3b8' }}>Add markers below first</span>}
                    </label>
                  )}
                  <label style={labelStyle}>Zoom<input style={inputStyle} type="number" step="any" min={0} max={22} value={zoom} onChange={(e) => setZoom(e.target.value)} placeholder="e.g. 10" /></label>
                </div>
              </section>

              {/* Behavior */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>Behavior <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>(written to URL)</span></h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#475569', marginBottom: 4 }}>On Marker Click</div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {(['event-only', 'flyto+highlight'] as const).map((v) => (
                        <button key={v} style={{ ...modeBtnStyle, background: onMarkerClick === v ? '#3b82f6' : '#e2e8f0', color: onMarkerClick === v ? 'white' : '#475569' }} onClick={() => setOnMarkerClick(v)}>
                          {v === 'event-only' ? 'Event only' : 'Fly + Highlight'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <label style={labelStyle}>Fly-to Zoom (global)<input style={inputStyle} type="number" step="any" min={0} max={22} value={globalFlyToZoom} onChange={(e) => setGlobalFlyToZoom(e.target.value)} placeholder="e.g. 12" /></label>
                  <label style={labelStyle}>Smart Fly Threshold (km)<input style={inputStyle} type="number" step="any" min={0} value={smartFlyThreshold} onChange={(e) => setSmartFlyThreshold(e.target.value)} placeholder="e.g. 1000 (blank = always)" /></label>
                </div>
              </section>

              {/* Intro Animation */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>Intro Animation</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <label style={{ fontSize: 12, color: '#475569', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={introEnabled}
                      onChange={(e) => setIntroEnabled(e.target.checked)}
                      style={{ width: 14, height: 14, cursor: 'pointer' }}
                    />
                    <span>Enable intro animation</span>
                  </label>
                  {introEnabled && (
                    <>
                      <label style={labelStyle}>
                        Duration (ms)
                        <input style={inputStyle} type="number" step="100" min={500} value={introDuration} onChange={(e) => setIntroDuration(e.target.value)} placeholder="3000 (default)" />
                      </label>
                      <label style={labelStyle}>
                        Rotate offset (deg)
                        <input style={inputStyle} type="number" step="1" value={introRotate} onChange={(e) => setIntroRotate(e.target.value)} placeholder="90 (default)" />
                      </label>
                    </>
                  )}
                </div>
              </section>

              {/* Markers */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h2 style={{ ...h2Style, marginBottom: 0 }}>Markers</h2>
                  <button style={addBtnStyle} onClick={() => addMarker()}>+ Add</button>
                </div>
                {markers.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8' }}>No markers yet.</p>}
                {markers.map((m, i) => (
                  <div key={i} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Marker {i + 1}</span>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => { const lat = parseFloat(m.lat); const lng = parseFloat(m.lng); if (!isNaN(lat) && !isNaN(lng)) sendLive({ type: 'FLY_TO', lat, lng, ...(m.flyToZoom ? { zoom: parseFloat(m.flyToZoom) } : {}) }) }} style={{ fontSize: 11, background: 'none', border: 'none', color: '#6366f1', cursor: 'pointer', padding: 0 }}>Fly</button>
                        <button onClick={() => removeMarker(i)} style={{ fontSize: 11, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>Remove</button>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input style={inputStyle} placeholder="id *" value={m.id} onChange={(e) => updateMarker(i, 'id', e.target.value)} />
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="lat *" type="number" step="any" value={m.lat} onChange={(e) => updateMarker(i, 'lat', e.target.value)} />
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="lng *" type="number" step="any" value={m.lng} onChange={(e) => updateMarker(i, 'lng', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="label" value={m.label} onChange={(e) => updateMarker(i, 'label', e.target.value)} />
                        <input style={{ ...inputStyle, width: 72 }} placeholder="color" value={m.color} onChange={(e) => updateMarker(i, 'color', e.target.value)} />
                      </div>
                      <input style={{ ...inputStyle, width: 130 }} placeholder="flyToZoom (optional)" type="number" step="any" min={0} max={22} value={m.flyToZoom} onChange={(e) => updateMarker(i, 'flyToZoom', e.target.value)} />
                    </div>
                  </div>
                ))}
              </section>

              {/* Generated URL */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>Generated iframe src</h2>
                <div style={{ fontSize: 11, fontFamily: 'monospace', background: '#1e293b', color: '#4ade80', padding: 8, borderRadius: 6, wordBreak: 'break-all', marginBottom: 8, minHeight: 48 }}>
                  {iframeSrc}
                </div>
                {tooLong && (
                  <div style={{ fontSize: 12, color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6, padding: '6px 10px', marginBottom: 8 }}>
                    Warning: URL exceeds 4000 characters.
                  </div>
                )}
                <button style={btnStyle} onClick={copyToClipboard}>{copied ? 'Copied!' : 'Copy to Clipboard'}</button>
              </section>
            </>
          ) : (
            <>
              {/* SET_MARKERS */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h2 style={{ ...h2Style, marginBottom: 0 }}>SET_MARKERS</h2>
                  <button style={addBtnStyle} onClick={addLiveMarker}>+ Add</button>
                </div>
                {liveMarkers.length === 0 && <p style={{ fontSize: 12, color: '#94a3b8' }}>No markers.</p>}
                {liveMarkers.map((m, i) => (
                  <div key={i} style={{ borderTop: '1px solid #e2e8f0', paddingTop: 8, marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: '#475569' }}>Marker {i + 1}</span>
                      <button onClick={() => removeLiveMarker(i)} style={{ fontSize: 11, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0 }}>Remove</button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      <input style={inputStyle} placeholder="id *" value={m.id} onChange={(e) => updateLiveMarker(i, 'id', e.target.value)} />
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="lat *" type="number" step="any" value={m.lat} onChange={(e) => updateLiveMarker(i, 'lat', e.target.value)} />
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="lng *" type="number" step="any" value={m.lng} onChange={(e) => updateLiveMarker(i, 'lng', e.target.value)} />
                      </div>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <input style={{ ...inputStyle, flex: 1 }} placeholder="label" value={m.label} onChange={(e) => updateLiveMarker(i, 'label', e.target.value)} />
                        <input style={{ ...inputStyle, width: 72 }} placeholder="color" value={m.color} onChange={(e) => updateLiveMarker(i, 'color', e.target.value)} />
                      </div>
                    </div>
                  </div>
                ))}
                <button style={{ ...btnStyle, marginTop: 10 }} onClick={sendSetMarkers}>Send SET_MARKERS</button>
              </section>

              {/* FLY_TO */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>FLY_TO</h2>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  <label style={{ ...labelStyle, flex: 1 }}>Lat<input style={inputStyle} type="number" step="any" value={flyLat} onChange={(e) => setFlyLat(e.target.value)} placeholder="e.g. 25.04" /></label>
                  <label style={{ ...labelStyle, flex: 1 }}>Lng<input style={inputStyle} type="number" step="any" value={flyLng} onChange={(e) => setFlyLng(e.target.value)} placeholder="e.g. 121.53" /></label>
                  <label style={{ ...labelStyle, width: 72 }}>Zoom<input style={inputStyle} type="number" step="any" min={0} max={22} value={flyZoom} onChange={(e) => setFlyZoom(e.target.value)} placeholder="opt" /></label>
                </div>
                <button style={btnStyle} onClick={sendFlyTo}>Send FLY_TO</button>
              </section>

              {/* HIGHLIGHT */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>HIGHLIGHT</h2>
                <label style={{ ...labelStyle, marginBottom: 8 }}>
                  Marker ID <span style={{ color: '#94a3b8' }}>(blank = clear)</span>
                  <input style={inputStyle} value={highlightId} onChange={(e) => setHighlightId(e.target.value)} placeholder="e.g. marker-1" />
                </label>
                <button style={btnStyle} onClick={sendHighlight}>Send HIGHLIGHT</button>
              </section>

              {/* SET_OPTIONS */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>SET_OPTIONS</h2>
                <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
                  <label style={{ ...labelStyle, flex: 1 }}>Center Lng<input style={inputStyle} type="number" step="any" value={optLng} onChange={(e) => setOptLng(e.target.value)} placeholder="optional" /></label>
                  <label style={{ ...labelStyle, flex: 1 }}>Center Lat<input style={inputStyle} type="number" step="any" value={optLat} onChange={(e) => setOptLat(e.target.value)} placeholder="optional" /></label>
                  <label style={{ ...labelStyle, width: 72 }}>Zoom<input style={inputStyle} type="number" step="any" value={optZoom} onChange={(e) => setOptZoom(e.target.value)} placeholder="opt" /></label>
                </div>
                <button style={btnStyle} onClick={sendSetOptions}>Send SET_OPTIONS</button>
              </section>

              {/* PLAY_INTRO */}
              <section style={sectionStyle}>
                <h2 style={h2Style}>PLAY_INTRO</h2>
                <p style={{ fontSize: 12, color: '#475569', marginBottom: 8 }}>重播開場動畫，結束後重新發送 READY。</p>
                <button style={btnStyle} onClick={() => sendLive({ type: 'PLAY_INTRO' })}>Send PLAY_INTRO</button>
              </section>

              {/* Events Log */}
              <section style={sectionStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <h2 style={{ ...h2Style, marginBottom: 0 }}>Events Log</h2>
                  <button onClick={() => setEvents([])} style={{ fontSize: 11, background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0 }}>Clear</button>
                </div>
                <div style={{ fontSize: 11, fontFamily: 'monospace', background: '#1e293b', borderRadius: 6, padding: 8, height: 200, overflowY: 'auto' }}>
                  {events.length === 0 && <span style={{ color: '#475569' }}>No events yet.</span>}
                  {events.map((e, i) => (
                    <div key={i} style={{ color: e.dir === 'out' ? '#93c5fd' : '#4ade80', marginBottom: 2 }}>
                      [{e.time}] {e.dir === 'out' ? '→' : '←'} {e.text}
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {/* Right: iframe preview */}
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        style={{ flex: 1, border: 'none' }}
        allow="geolocation"
        title="Map Preview"
        onLoad={handleIframeLoad}
      />
    </div>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const sectionStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  padding: 12,
}

const h2Style: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: '#334155',
  marginBottom: 8,
}

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: '#475569',
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
}

const inputStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '5px 8px',
  border: '1px solid #cbd5e1',
  borderRadius: 5,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
}

const btnStyle: React.CSSProperties = {
  width: '100%',
  padding: '8px 12px',
  background: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: 6,
  cursor: 'pointer',
  fontSize: 13,
}

const addBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  background: '#10b981',
  color: 'white',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 12,
}

const modeBtnStyle: React.CSSProperties = {
  padding: '4px 10px',
  border: 'none',
  borderRadius: 5,
  cursor: 'pointer',
  fontSize: 12,
}
