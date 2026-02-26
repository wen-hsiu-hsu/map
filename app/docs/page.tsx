import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '文件說明 | Map',
  description: '地圖 iframe 嵌入功能說明，包含 URL 參數、標記格式與 postMessage API',
}

const tocItems = [
  { id: 'url-params', label: 'URL 參數' },
  { id: 'markers-format', label: '標記格式' },
  { id: 'postmessage-commands', label: 'postMessage 指令' },
  { id: 'postmessage-events', label: 'postMessage 事件' },
  { id: 'map-controls', label: '地圖控制項' },
]

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} style={{ marginBottom: 48 }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 16, paddingBottom: 8, borderBottom: '2px solid #e2e8f0' }}>
        {title}
      </h2>
      {children}
    </section>
  )
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre style={{
      background: '#f1f5f9',
      border: '1px solid #e2e8f0',
      borderRadius: 8,
      padding: '12px 16px',
      fontSize: 13,
      fontFamily: 'monospace',
      overflowX: 'auto',
      margin: '8px 0',
      color: '#1e293b',
      lineHeight: 1.6,
    }}>
      <code>{children}</code>
    </pre>
  )
}

function ParamTable({ rows }: { rows: { name: string; type: string; required: boolean; desc: string }[] }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, marginTop: 12 }}>
      <thead>
        <tr style={{ background: '#f8fafc' }}>
          {['參數', '類型', '必填', '說明'].map((h) => (
            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.name} style={{ borderBottom: '1px solid #f1f5f9' }}>
            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#0369a1' }}>{r.name}</td>
            <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#7c3aed' }}>{r.type}</td>
            <td style={{ padding: '8px 12px', color: r.required ? '#dc2626' : '#64748b' }}>{r.required ? '是' : '否'}</td>
            <td style={{ padding: '8px 12px', color: '#334155' }}>{r.desc}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default function DocsPage() {
  return (
    <div style={{ fontFamily: 'sans-serif', minHeight: '100vh', height: '100%', overflowY: 'auto', background: '#ffffff' }}>
      {/* Top nav */}
      <nav style={{ borderBottom: '1px solid #e2e8f0', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16, background: '#f8fafc' }}>
        <Link href="/" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>地圖</Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <Link href="/generator" style={{ color: '#64748b', fontSize: 14, textDecoration: 'none' }}>Generator</Link>
        <span style={{ color: '#cbd5e1' }}>/</span>
        <span style={{ color: '#0f172a', fontSize: 14, fontWeight: 600 }}>文件說明</span>
      </nav>

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 32px' }}>
        {/* Page title */}
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', marginBottom: 8 }}>文件說明</h1>
        <p style={{ fontSize: 15, color: '#475569', marginBottom: 40, lineHeight: 1.6 }}>
          本頁說明如何將地圖嵌入網頁，以及所有支援的 URL 參數與 postMessage API。
          使用 <Link href="/generator" style={{ color: '#0369a1' }}>Generator</Link> 可快速產生 iframe src。
        </p>

        {/* Table of contents */}
        <nav style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '16px 20px', marginBottom: 48 }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>目錄</p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
            {tocItems.map((item) => (
              <li key={item.id}>
                <a href={`#${item.id}`} style={{ color: '#0369a1', fontSize: 14, textDecoration: 'none' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* ── URL 參數 ── */}
        <Section id="url-params" title="URL 參數">
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 1.7 }}>
            透過 iframe src 的 query string 設定地圖初始狀態，無需撰寫 JavaScript。
            URL 參數僅在初始化時讀取，後續 postMessage 指令可覆蓋設定。
          </p>
          <CodeBlock>{`<iframe src="https://your-domain/?center=121.53,25.05&zoom=10&markers=..." />`}</CodeBlock>

          <ParamTable rows={[
            { name: 'center', type: 'string', required: false, desc: '初始中心點，格式為 lng,lat（經度在前）。例：121.5319,25.0478' },
            { name: 'zoom', type: 'number', required: false, desc: '初始縮放等級，建議範圍 1–20。預設 10' },
            { name: 'markers', type: 'string', required: false, desc: 'URL-safe Base64 編碼的 JSON 標記陣列（見下方標記格式）' },
            { name: 'markerColor', type: 'string', required: false, desc: '所有標記的全域預設顏色（CSS 色號，需 URL encode，如 %23ef4444）' },
            { name: 'onMarkerClick', type: 'string', required: false, desc: '"flyto+highlight" 使點擊標記時自動飛行並高亮；預設為 "event-only"' },
            { name: 'flyToZoom', type: 'number', required: false, desc: 'flyTo 動畫的目標縮放等級' },
            { name: 'smartFlyThreshold', type: 'number', required: false, desc: '超過此距離（km）才執行三段智慧飛行。預設 500' },
          ]} />
        </Section>

        {/* ── 標記格式 ── */}
        <Section id="markers-format" title="標記格式">
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 12, lineHeight: 1.7 }}>
            markers 參數為 JSON 陣列經 URL-safe Base64 編碼後的字串。
            編碼規則：標準 Base64 中 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>+</code> 換為 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>-</code>、
            <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>/</code> 換為 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>_</code>，並移除尾端 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>=</code> padding。
          </p>

          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginBottom: 8 }}>標記物件欄位</h3>
          <ParamTable rows={[
            { name: 'id', type: 'string', required: true, desc: '標記唯一識別碼' },
            { name: 'lat', type: 'number', required: true, desc: '緯度（-90 ~ 90）' },
            { name: 'lng', type: 'number', required: true, desc: '經度（-180 ~ 180）' },
            { name: 'label', type: 'string', required: false, desc: '標記上方顯示的文字標籤' },
            { name: 'color', type: 'string', required: false, desc: '標記顏色（CSS 色號，如 #ef4444）。未設定時使用全域 markerColor 或預設綠色 #22c55e' },
            { name: 'flyToZoom', type: 'number', required: false, desc: '點擊此標記執行 flyTo 時的目標縮放等級' },
          ]} />

          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', marginTop: 20, marginBottom: 8 }}>編碼範例</h3>
          <CodeBlock>{`// 原始 JSON
const markers = [
  { id: "a1", lat: 25.0478, lng: 121.5319, label: "台北", color: "#ef4444" }
]

// 編碼
const json = JSON.stringify(markers)
const encoded = btoa(unescape(encodeURIComponent(json)))
  .replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '')

// 用於 URL
const src = \`https://your-domain/?markers=\${encoded}\``}</CodeBlock>
        </Section>

        {/* ── postMessage 指令 ── */}
        <Section id="postmessage-commands" title="postMessage 指令（Inbound）">
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 1.7 }}>
            透過 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>iframeEl.contentWindow.postMessage(payload, '*')</code> 傳送指令至地圖。
            建議等收到 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>READY</code> 事件後再發送指令（地圖會自動排隊早於 READY 的指令）。
          </p>

          {[
            {
              cmd: 'SET_MARKERS',
              desc: '取代所有現有標記',
              payload: `{ type: "SET_MARKERS", markers: [
  { id: "a1", lat: 25.05, lng: 121.53, label: "台北" }
] }`,
            },
            {
              cmd: 'FLY_TO',
              desc: '飛行至指定座標，支援智慧三段飛行',
              payload: `{ type: "FLY_TO", lat: 25.05, lng: 121.53, zoom: 12 }`,
            },
            {
              cmd: 'HIGHLIGHT',
              desc: '高亮指定 id 的標記（光暈效果）',
              payload: `{ type: "HIGHLIGHT", id: "a1" }`,
            },
            {
              cmd: 'SET_OPTIONS',
              desc: '更新地圖設定（center、zoom、flyToZoom、smartFlyThreshold、onMarkerClick）',
              payload: `{ type: "SET_OPTIONS", center: [121.53, 25.05], zoom: 10 }
// 或設定點擊行為
{ type: "SET_OPTIONS", onMarkerClick: "flyto+highlight" }`,
            },
          ].map(({ cmd, desc, payload }) => (
            <div key={cmd} style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <code style={{ fontSize: 14, fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '2px 8px', borderRadius: 4 }}>{cmd}</code>
                <span style={{ fontSize: 13, color: '#475569' }}>{desc}</span>
              </div>
              <CodeBlock>{payload}</CodeBlock>
            </div>
          ))}
        </Section>

        {/* ── postMessage 事件 ── */}
        <Section id="postmessage-events" title="postMessage 事件（Outbound）">
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 1.7 }}>
            地圖會透過 <code style={{ background: '#f1f5f9', padding: '1px 4px', borderRadius: 3 }}>window.addEventListener('message', handler)</code> 通知父頁面。
          </p>

          <CodeBlock>{`window.addEventListener('message', (e) => {
  const { type, ...data } = e.data
  if (type === 'READY') { /* 地圖已就緒 */ }
  if (type === 'MARKER_CLICK') console.log('點擊標記', data.id)
})`}</CodeBlock>

          {[
            { event: 'READY', desc: '地圖載入完成，可開始發送指令', payload: `{ type: "READY" }` },
            { event: 'MARKER_CLICK', desc: '使用者點擊標記', payload: `{ type: "MARKER_CLICK", id: "a1", lat: 25.05, lng: 121.53 }` },
            { event: 'MAP_CLICK', desc: '使用者點擊空白地圖區域', payload: `{ type: "MAP_CLICK", lat: 25.05, lng: 121.53 }` },
            { event: 'ZOOM_CHANGE', desc: '縮放操作結束', payload: `{ type: "ZOOM_CHANGE", zoom: 12 }` },
            { event: 'FLY_START', desc: '智慧飛行動畫開始', payload: `{ type: "FLY_START" }` },
            { event: 'FLY_END', desc: '智慧飛行動畫結束', payload: `{ type: "FLY_END" }` },
            { event: 'ERROR', desc: '指令處理錯誤（如無效座標）', payload: `{ type: "ERROR", code: "INVALID_COORDINATES", message: "lat must be between -90 and 90" }` },
          ].map(({ event, desc, payload }) => (
            <div key={event} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 4 }}>
                <code style={{ fontSize: 14, fontWeight: 700, color: '#0369a1', background: '#eff6ff', padding: '2px 8px', borderRadius: 4 }}>{event}</code>
                <span style={{ fontSize: 13, color: '#475569' }}>{desc}</span>
              </div>
              <CodeBlock>{payload}</CodeBlock>
            </div>
          ))}
        </Section>

        {/* ── 地圖控制項 ── */}
        <Section id="map-controls" title="地圖控制項">
          <p style={{ fontSize: 14, color: '#475569', marginBottom: 16, lineHeight: 1.7 }}>
            地圖右側提供以下 UI 控制項：
          </p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['控制項', '說明'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '1px solid #e2e8f0', fontWeight: 600, color: '#475569' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['+ / −', '縮放控制，點擊放大或縮小一級'],
                ['指北針', '點擊重設地圖方位朝向正北'],
                ['地球圖示', '切換 3D 地球（globe）與 2D 平面（mercator）投影'],
              ].map(([ctrl, desc]) => (
                <tr key={ctrl} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '8px 12px', fontFamily: 'monospace', color: '#0369a1' }}>{ctrl}</td>
                  <td style={{ padding: '8px 12px', color: '#334155' }}>{desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Footer */}
        <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 24, display: 'flex', gap: 16 }}>
          <Link href="/generator" style={{ color: '#0369a1', fontSize: 14 }}>前往 Generator →</Link>
          <Link href="/" style={{ color: '#64748b', fontSize: 14 }}>查看地圖</Link>
        </div>
      </div>
    </div>
  )
}
