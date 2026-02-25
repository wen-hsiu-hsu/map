## Context

Generator 頁面（`app/generator/page.tsx`）為左右分割佈局：左側表單（360px）、右側預覽 iframe。地圖（`components/GlobeMap.tsx`）透過 postMessage 與父視窗雙向通訊。目前地圖只在使用者點擊 **marker** 時發送事件，點擊空白地圖不發送任何事件。

全域行為設定（onMarkerClick、flyToZoom、smartFlyThreshold）是 Change A 新增的 SET_OPTIONS 欄位，這些設定只影響執行時行為，**不**應寫入 iframe src URL（URL 只決定初始狀態，無法表達事件驅動行為）。

## Goals / Non-Goals

**Goals:**
- 點擊地圖拾取座標，流暢套用到表單欄位
- 全域設定即時預覽（postMessage 傳給 iframe，不寫入 URL）
- Marker flyToZoom 寫入 URL

**Non-Goals:**
- 全域設定寫入 iframe src URL
- 拾取器支援在 cluster 上點擊
- 多點同時拾取

## Decisions

### D1. MAP_CLICK 事件從地圖觸發

地圖在 `map.on('click', ...)` 時，若點擊目標不是 marker（判斷：event target 沒有 marker CSS class），發送 `{ type: "MAP_CLICK", lat, lng }` 給父視窗。

MapLibre `click` event 的 `lngLat` 直接提供座標，精確度足夠。

**替代考慮**：在 Generator 層疊透明 overlay 偵測點擊 → 無法取得精確地圖座標，放棄。

---

### D2. 拾取器 UI：浮動面板 vs. 固定區塊

**決策**：固定顯示在左側面板頂部，MAP_CLICK 後出現，顯示座標與操作按鈕。不使用地圖上浮動 tooltip（跨 iframe 無法定位）。

```
┌──────────────────────────────────┐
│  📍 拾取座標                      │  ← 點擊地圖後出現，再次點擊地圖更新
│  lat: 25.0338  lng: 121.5645     │
│  [套用到 Center]                  │
│  套用到 Marker:                   │
│  ○ 新增一筆 marker               │
│  ● 套用到現有: [下拉選 marker id] │
│                         [✕ 關閉] │
└──────────────────────────────────┘
```

點擊其他地點更新座標（面板持續顯示）；手動關閉（✕）或點擊「套用」後關閉。

---

### D3. 全域設定的傳遞方式

全域設定（onMarkerClick / flyToZoom / smartFlyThreshold）以 `useEffect` 監聽變更，透過 `iframeRef.current.contentWindow.postMessage(SET_OPTIONS, '*')` 即時傳送給 iframe。

不使用 URL params 傳遞（這些設定是執行時行為，不是初始狀態）。

Generator 持有 `iframeRef`，需要等 iframe READY 事件後才開始傳送設定。

---

### D4. Center marker id 模式

Center 區塊新增切換：`[座標模式] / [Marker ID 模式]`。

- 座標模式：現有 lng/lat 輸入（不變）
- Marker ID 模式：顯示下拉選單，選項從現有 `markers` state 動態產生（`<id>` 或 `<id> – <label>`）；選好後 URL 產生 `center=marker:<id>`

---

### D5. encodeMarkersBase64 的 UTF-8 修正

現有 `btoa(json)` 不處理 UTF-8，中文 label 會損壞（Change A 中已修正 decode 端）。

修正：使用 `TextEncoder` 將 JSON 轉為 UTF-8 bytes，再手動 base64 encode：
```typescript
const bytes = new TextEncoder().encode(json)
// convert bytes → binary string → btoa
```

---

## Risks / Trade-offs

- **MAP_CLICK 與 marker click 衝突**：MapLibre click 事件在 marker DOM element 上也會冒泡到地圖。需在地圖層過濾：若 event 的 `originalEvent.target` 是 marker element，不發送 MAP_CLICK。
- **iframe READY 時序**：Generator 需等 READY 事件後才能傳送全域設定。若 iframe 已載入（URL 未變），READY 不會重發。→ 在 iframe `onLoad` 後也嘗試傳送一次設定作為備援。
