## Why

需要一個可被任何外部網站透過 iframe 嵌入的互動式 3D 地球地圖，以 postMessage 進行雙向通訊。現有方案需要各網站自行整合地圖 SDK，重複成本高且難以統一維護。

## What Changes

- 建立全新的獨立 web 應用（Next.js static export），部署至 `map.hsiu.soy`
- 實作 3D 地球地圖（MapLibre GL JS v5，globe projection）
- 實作完整 postMessage 雙向通訊 API（外部控制地圖 + 地圖回傳事件）
- 支援 URL query parameters 初始化（無需 JS 的嵌入情境）
- 支援標記（Markers）、飛行動畫（Fly To）、標記高亮（Highlight）、標記聚合（Clustering）

## Capabilities

### New Capabilities

- `map-core`: MapLibre GL JS 3D 地球初始化、底圖設定（CARTO CDN）、容器自適應
- `markers`: 標記放置、label 永遠顯示、自訂顏色、active 高亮（光暈）、clustering 聚合
- `map-controls`: 飛行動畫（FlyTo）、zoom 變化事件（zoomend）
- `postmessage-api`: 完整雙向通訊協定——接收指令（SET_MARKERS、FLY_TO、HIGHLIGHT、SET_OPTIONS）、發送事件（READY、MARKER_CLICK、ZOOM_CHANGE、ERROR）、READY 前指令排隊
- `url-params`: URL query parameters 初始化（center、zoom、markers base64）

### Modified Capabilities

（無既有 spec）

## Impact

- **新增依賴**：`maplibre-gl` ^5、`next` (static export)、`tailwindcss`、`shadcn/ui`、mapcn 元件（複製進 `components/ui/map/`）
- **部署**：Cloudflare Pages，綁定 `map.hsiu.soy`
- **外部介面**：`window.postMessage` API（任何來源均可送訊）、URL query parameters
- **無後端**：純靜態 SPA，無資料庫、無認證
