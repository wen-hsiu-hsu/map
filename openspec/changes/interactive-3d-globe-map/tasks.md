## 1. 專案初始化

- [ ] 1.1 建立 Next.js 專案（TypeScript），設定 `output: 'export'`
- [ ] 1.2 安裝並設定 Tailwind CSS v4 與 shadcn/ui
- [ ] 1.3 透過 `npx shadcn@latest add @mapcn/map` 安裝 mapcn 地圖元件
- [ ] 1.4 設定 `.env.local`，加入 `NEXT_PUBLIC_BASEMAP_URL`（CARTO positron CDN URL）
- [ ] 1.5 設定 Cloudflare Pages 部署（`wrangler.toml` 或 Pages 設定），綁定 `map.hsiu.soy`

## 2. 地圖核心（map-core）

- [ ] 2.1 建立地圖頁面元件（`app/page.tsx`），初始化 MapLibre globe projection
- [ ] 2.2 設定底圖 style URL 從環境變數讀取，加入 fallback 預設值
- [ ] 2.3 實作容器自適應（ResizeObserver 或 CSS 100vw/100vh）
- [ ] 2.4 設定預設 center `[0, 20]`、zoom `2`
- [ ] 2.5 驗證地球以 globe projection 正確渲染亮色底圖

## 3. postMessage 通訊層

- [ ] 3.1 建立 `usePostMessage` hook，監聽 `window.message` 事件（不驗證 origin）
- [ ] 3.2 實作 pending queue 機制：地圖載入前收到的指令存入 queue
- [ ] 3.3 實作 `map.on('load')` 後 flush pending queue，並發送 `READY` 事件至 `window.parent`
- [ ] 3.4 實作指令 dispatcher：依 `type` 路由至對應 handler（SET_MARKERS、FLY_TO、HIGHLIGHT、SET_OPTIONS）
- [ ] 3.5 實作座標驗證 helper（lat -90~90，lng -180~180），無效時發送 `ERROR` postMessage
- [ ] 3.6 實作 `MARKER_CLICK` 事件發送（postMessage 至 `window.parent`）
- [ ] 3.7 實作 `ZOOM_CHANGE` 事件發送（監聽 `zoomend`，postMessage 至 `window.parent`）

## 4. 標記系統（markers）

- [ ] 4.1 建立 `MarkerManager`，管理 DOM Marker 的新增、移除與更新
- [ ] 4.2 實作標記元件：圓點 + 顏色（接受任意 CSS 色號）+ 永遠顯示的 label
- [ ] 4.3 實作預設綠色 fallback（`color` 未指定時）
- [ ] 4.4 實作 Highlight 光暈效果（CSS box-shadow 或 ring）
- [ ] 4.5 同一時間只有一個標記為 active，切換時移除前一個 active
- [ ] 4.6 實作 SET_MARKERS：清除所有現有標記後放置新標記集合
- [ ] 4.7 整合 mapcn `MapClusterLayer`，設定 clustering threshold 與固定預設綠色

## 5. 地圖控制（map-controls）

- [ ] 5.1 實作 FLY_TO handler：呼叫 MapLibre `flyTo`，帶入 lat、lng、zoom（可選）
- [ ] 5.2 確認連續 FLY_TO 能中斷前一個動畫（MapLibre 預設行為，驗證即可）
- [ ] 5.3 實作 SET_OPTIONS handler：呼叫 `jumpTo`（無動畫），支援 center 與 zoom 部分更新

## 6. URL 參數初始化（url-params）

- [ ] 6.1 建立 `parseUrlParams` utility，解析 `center`（lng,lat）、`zoom`、`markers`（URL-safe Base64）
- [ ] 6.2 實作 URL-safe Base64 decode（`-→+`、`_→/`，補 padding）並 JSON.parse
- [ ] 6.3 Base64 或 JSON 解析失敗時靜默忽略，記錄 console.warn
- [ ] 6.4 URL 參數在地圖初始化時套用（優先順序低於後續 postMessage）
- [ ] 6.5 確認 SET_MARKERS postMessage 能完全覆蓋 URL 參數的初始標記

## 7. 整合測試與驗收

- [ ] 7.1 建立本地測試 HTML 頁面，模擬外部網站透過 postMessage 控制地圖
- [ ] 7.2 測試 READY 前送出指令的排隊行為
- [ ] 7.3 測試連續 FLY_TO 的動畫中斷
- [ ] 7.4 測試 clustering 聚合與展開
- [ ] 7.5 測試 URL 參數初始化（含 markers base64）
- [ ] 7.6 測試 iframe 嵌入情境（在實際 VitePress 或 HTML 頁面中嵌入）
- [ ] 7.7 部署至 Cloudflare Pages，驗證 `map.hsiu.soy` 正常運作
