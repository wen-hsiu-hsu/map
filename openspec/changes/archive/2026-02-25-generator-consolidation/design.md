## Context

`app/generator/page.tsx` 目前為單一左側 panel（約 500 行），包含 Center/Zoom、Global Settings、Markers、Generated URL 區塊，右側為預覽 iframe。`public/test.html` 為獨立靜態頁面，有完整的 postMessage 控制 UI 與 Events Log。

兩頁面都持有 `iframeRef` 並監聽 postMessage 事件，功能高度重疊。

## Goals / Non-Goals

**Goals:**
- Generator 左側以 tab 切換 Embed Config / Live Controls
- Live Controls 包含完整的 postMessage 指令 UI 與 Events Log
- 移除 test.html
- 所有狀態持久化至 localStorage（含 Live Controls 的 marker rows）

**Non-Goals:**
- 改變任何 postMessage 協定或地圖行為
- 修改右側預覽 iframe 邏輯

## Decisions

### D1. Tab 狀態

新增 `activeTab: 'embed' | 'live'` state，預設 `'embed'`。Tab 狀態**不**持久化（每次開啟預設顯示 Embed Config）。

### D2. Live Controls 的 marker rows 與 Embed Config 的 markers 分離

兩者為獨立 state：
- `markers`（Embed Config）：寫入 iframe src URL
- `liveMarkers`（Live Controls）：只用於 SET_MARKERS postMessage，不影響 URL

兩者都持久化至 localStorage（不同 key）。

### D3. Events Log 實作

`events` state 為 `{ time: string; dir: 'in' | 'out'; text: string }[]`，最多保留 100 筆（FIFO）。收到任何 postMessage 事件時 prepend。發送指令時也記錄。

### D4. Live Controls SET_MARKERS marker rows

沿用與 test.html 相同的欄位（id、lat、lng、label、color），但**不含** flyToZoom（Live Controls 的 SET_MARKERS 不需要）。

### D5. iframeRef 共用

`iframeRef` 在元件頂層，Embed Config 與 Live Controls 都使用同一個 ref 對同一個預覽 iframe 發送指令。

### D6. localStorage key 擴充

現有 `LS_KEY = 'globe-map-generator-state'` 保持不變（Embed Config state）。新增 `LS_LIVE_KEY = 'globe-map-generator-live'` 儲存 Live Controls 的 marker rows、FLY_TO、HIGHLIGHT、SET_OPTIONS 欄位值。

## Risks / Trade-offs

- `page.tsx` 行數會顯著增加（預估 700-800 行）。若未來需要進一步拆分，可考慮抽出 `LiveControls.tsx` 元件，但目前不做。
