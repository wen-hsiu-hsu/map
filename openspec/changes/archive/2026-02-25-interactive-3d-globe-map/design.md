## Context

這是一個全新的獨立 web 應用，沒有既有程式碼需要遷移。目標是打造一個可被任意外部網站透過 iframe 嵌入的 3D 地球地圖，以 postMessage 進行雙向通訊。

主要限制：
- 純靜態部署（Cloudflare Pages），無後端
- 必須能在 iframe 中正常運作（CSP、CORS 考量）
- postMessage API 是唯一的外部介面

## Goals / Non-Goals

**Goals:**
- 建立 Next.js static export 應用，部署至 `map.hsiu.soy`
- 實作完整 postMessage 雙向通訊 API
- 支援 DOM Marker + GL Layer clustering 混合標記實作
- 支援 URL query parameters 初始化

**Non-Goals:**
- 後端、資料庫、認證
- 外部網站的佈局邏輯
- MapLibre 完整 API 的 proxy

## Decisions

### 1. 框架：Next.js（static export）而非 Vite + React

**決定**：使用 Next.js，設定 `output: 'export'`。

**理由**：mapcn 元件庫基於 Next.js 環境開發，透過 `npx shadcn@latest add @mapcn/map` 安裝最順暢。雖然是 static SPA，Next.js 的 static export 對 Cloudflare Pages 完全相容。

**替代方案**：Vite + React——可行，但安裝 mapcn 時需要手動解決環境差異，增加不必要的複雜度。

---

### 2. 標記實作：DOM Markers + GL Layer Clustering 混用

**決定**：個別標記使用 MapLibre DOM Marker（`<div>` 元素），clustering 使用 mapcn 的 `MapClusterLayer`（GeoJSON source）。

**理由**：
- DOM Marker 對任意 CSS 色號（`color: "#facc15"`）的支援最自然，光暈效果用 CSS 即可實現
- Label 永遠顯示，用 DOM 方式最容易控制層疊與樣式
- Clustering 用 GL Layer 原生聚合，效能好

**替代方案**：全用 GL Layer（paint expression）——顏色轉換複雜，光暈效果難以用 expression 實現。

**混用的邊界**：標記數量 > cluster threshold 時，隱藏 DOM Markers，改顯示 GL Cluster Layer；縮放展開後恢復 DOM Markers。使用 supercluster 或 MapLibre 原生 cluster source 計算聚合邊界。

---

### 3. postMessage 安全：接受任何來源

**決定**：`addEventListener('message', handler)` 不驗證 `event.origin`。

**理由**：此地圖為公開嵌入用途，沒有敏感資料，任何來源均可控制地圖行為。驗證 origin 會增加嵌入方的設定成本。

---

### 4. READY 前指令處理：排隊機制

**決定**：地圖載入完成前，收到的所有指令存入 queue；`map.on('load')` 觸發後依序執行。

**實作**：`useRef<Message[]>` 存放 pending queue，`map load` 後 flush。

---

### 5. 底圖：CARTO CDN，URL 設環境變數

**決定**：使用 `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`，以 `NEXT_PUBLIC_BASEMAP_URL` 環境變數控制。

**風險**：CARTO CDN 無 SLA，若服務中斷可透過環境變數快速切換備用底圖（如 OpenFreeMap）。

---

### 6. URL params 的 markers 編碼：URL-safe Base64

**決定**：使用 `btoa` / `atob`（標準 Base64）搭配 `encodeURIComponent`，或直接使用 URL-safe Base64（`+→-`、`/→_`）。

**理由**：避免 URL 中 `+`、`/`、`=` 被瀏覽器截斷或誤解。

## Risks / Trade-offs

- **CARTO CDN 不穩定** → 環境變數抽換底圖 URL，5 分鐘內可切換
- **mapcn 版本更新** → 元件已複製進 repo，不受上游更新影響（但也不會自動獲得 bug fix）
- **DOM Marker + GL Layer 混用的 z-index 問題** → MapLibre DOM Markers 預設在所有 GL Layer 之上，需留意 cluster 圓圈與 DOM Marker 的視覺層疊順序
- **iframe CSP 限制** → 部分外部網站可能有嚴格的 CSP，限制 `frame-src`；這是嵌入方的責任，非本專案範圍
- **連續 FLY_TO 動畫中斷** → MapLibre `flyTo` 可直接呼叫新目標中斷前一個動畫，行為符合預期

## Open Questions

（無，所有關鍵決策已在 explore 階段確認）
