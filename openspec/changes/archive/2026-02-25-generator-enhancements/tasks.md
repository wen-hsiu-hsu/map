## 1. 地圖 MAP_CLICK 事件

- [x] 1.1 更新 `OutboundMessage`（`lib/postMessageTypes.ts`）：新增 `{ type: "MAP_CLICK"; lat: number; lng: number }`
- [x] 1.2 在 `GlobeMap.tsx` 的 `MapEvents` 新增 `map.on('click', ...)` 監聽：過濾 marker 點擊（檢查 `event.originalEvent.target` 是否為 marker element），發送 MAP_CLICK

## 2. Generator：base64 UTF-8 修正

- [x] 2.1 修正 `encodeMarkersBase64`（`app/generator/page.tsx`）：改用 `TextEncoder` → 手動 base64 encode 以正確處理 UTF-8

## 3. Generator：Marker flyToZoom 欄位

- [x] 3.1 `MarkerRow` interface 新增 `flyToZoom: string` 欄位
- [x] 3.2 每個 marker row 新增 flyToZoom 數字輸入（optional）
- [x] 3.3 `encodeMarkersBase64` 將 flyToZoom 納入編碼（有值才加）

## 4. Generator：Center Marker ID 模式

- [x] 4.1 新增 `centerMode: 'coords' | 'markerId'` state（預設 `'coords'`）
- [x] 4.2 新增 `centerMarkerId: string` state
- [x] 4.3 Center 區塊新增切換按鈕，`markerId` 模式下顯示 marker id 下拉（從 markers state 動態產生選項）
- [x] 4.4 `buildIframeSrc` 支援 `centerMode === 'markerId'` 產生 `center=marker:<id>` 格式

## 5. Generator：全域行為設定

- [x] 5.1 新增全域設定 state：`onMarkerClick: 'event-only' | 'flyto+highlight'`、`globalFlyToZoom: string`、`smartFlyThreshold: string`
- [x] 5.2 新增「Global Settings」區塊 UI：onMarkerClick 切換按鈕、flyToZoom 數字輸入、smartFlyThreshold 數字輸入
- [x] 5.3 新增 `iframeRef` ref，在 iframe `onLoad` 後傳送目前全域設定的 SET_OPTIONS
- [x] 5.4 監聽全域設定變更（useEffect），有 iframeRef 且地圖 ready 時傳送 SET_OPTIONS postMessage
- [x] 5.5 監聽來自 iframe 的 READY 事件，收到後傳送目前全域設定

## 6. Generator：座標拾取器

- [x] 6.1 新增 `pickedCoord: { lat: number; lng: number } | null` state
- [x] 6.2 監聽 window message 事件，過濾 `type === "MAP_CLICK"` 來源，更新 `pickedCoord`
- [x] 6.3 `pickedCoord` 非 null 時，在左側面板頂部顯示拾取面板（座標 + 操作選項 + 關閉按鈕）
- [x] 6.4 實作「套用到 Center」：填入 centerLng/centerLat，關閉面板
- [x] 6.5 實作「新增一筆 Marker」：addMarker() 並預填 lat/lng，關閉面板
- [x] 6.6 實作「套用到現有 Marker」：下拉選取 marker index，更新 lat/lng，關閉面板（markers 為空時隱藏此選項）
