## Context

地圖核心為單一 Next.js 頁面，主要邏輯集中在 `components/GlobeMap.tsx`（279 行）。地圖透過 MapLibre GL JS v5 以 globe projection 渲染，接受 postMessage 與 URL params 控制。目前初始化序列為：`parseUrlParams → 掛載地圖 → onMapReady（jumpTo + setMarkers）`。

現有相關模組：
- `lib/parseUrlParams.ts`：URL params 解析，回傳 `{ center, zoom, markers }`
- `lib/postMessageTypes.ts`：InboundMessage / OutboundMessage 型別定義
- `components/GlobeMap.tsx`：所有地圖行為邏輯

## Goals / Non-Goals

**Goals:**
- center 支援 `marker:<id>` 語法，並確保 markers 初始化後才套用
- marker 點擊可由地圖內部自動執行 flyto + highlight（可設定）
- FLY_TO 智慧判斷跨遠距離並自動加入 zoom out/in 過渡動畫
- marker 個別 `flyToZoom` 欄位，控制落點縮放層級
- `interactive: false` 停用所有地圖手勢
- FLY_START / FLY_END 事件通知外部

**Non-Goals:**
- Generator 頁面的設定 UI（屬於 Change B）
- 改變 postMessage 排隊機制的現有行為
- 支援多個同時飛行動畫

## Decisions

### D1. center → marker id 的 URL 語法

**決策**：`?center=marker:taipei-101`（前綴 `marker:`）

`parseUrlParams` 回傳型別擴充為：
```typescript
center?: [number, number] | { markerId: string }
```

`onMapReady` 中初始化順序固定為：
1. `setMarkers(p.markers)` — markers 先寫入 state（但 React state 更新是非同步的）
2. 解析 center：若為 `markerId`，從 `p.markers` 陣列中直接查找（不依賴 state，直接用 urlParams ref 的原始資料）
3. 找到 → `jumpTo({ center: [m.lng, m.lat] })`；找不到 → fallback DEFAULT_CENTER

**理由**：URL params 所有資料同步可得，`onMapReady` 中直接從 `urlParams.current.markers` 查找，避免 React state 時序問題。postMessage `SET_OPTIONS { center: { markerId } }` 情境則直接從當前 `markers` state 查找，找不到直接 fallback。

**替代方案考慮**：等待 React state 更新後再解析 → 需要 useEffect 依賴，複雜度高且非必要。

---

### D2. onMarkerClick 行為設定

**決策**：`GlobeMap` 內部維護 `onMarkerClickMode` state，預設 `"event-only"`。

```typescript
// SET_OPTIONS 新增欄位
type InboundMessage =
  | { type: 'SET_OPTIONS'; center?: ...; zoom?: number; onMarkerClick?: 'event-only' | 'flyto+highlight'; interactive?: boolean }
```

`handleMarkerClick` 行為：
- 永遠發送 `MARKER_CLICK` 給父視窗
- 若 `onMarkerClickMode === 'flyto+highlight'`：額外執行 `triggerFlyTo(marker)` 與 `setActiveMarkerId(id)`

**理由**：外部網站可能有自己的 click 處理邏輯，預設不改變現有行為（event-only）。

---

### D3. 智慧 flyto（smart flyto）

**決策**：FLY_TO 觸發時，計算 geodesic 距離（Haversine），若超過 `smartFlyThreshold`（km）則執行三段動畫；未設定門檻時永遠執行智慧策略。

三段動畫序列：
1. `map.flyTo({ center: midpoint, zoom: fitZoom, duration: 800 })` — zoom out 到能容納兩點的最小 zoom
2. 等待 `moveend` 事件
3. `map.flyTo({ center: target, zoom: flyToZoom, duration: 1200 })` — 飛到目標並 zoom in

`fitZoom` 計算：使用 MapLibre 原生 `map.cameraForBounds(LngLatBounds)` 取得能同時容納起終點的最佳 zoom，減去 0.5 作為 padding buffer。

`flyToZoom` 優先序：`msg.zoom` → marker 的 `flyToZoom`（僅 onMarkerClick 模式觸發時適用）→ 全域 `flyToZoom`（SET_OPTIONS 可設） → 預設值（10）。

抽出共用函式 `triggerFlyTo(target: { lng, lat, zoom?: number }, markerFlyToZoom?: number)`，供 FLY_TO postMessage 與 onMarkerClick 內部調用。

**FLY_START / FLY_END**：`triggerFlyTo` 開始時發送 `{ type: 'FLY_START', lat, lng }`，監聽最終 `moveend` 後發送 `{ type: 'FLY_END', lat, lng }`。

**替代方案考慮**：使用 `turf.js` 計算距離 → 引入不必要的依賴，Haversine 手寫 5 行即可。

---

### D4. marker flyToZoom

**決策**：擴充 `MarkerData` 介面，新增選用欄位 `flyToZoom?: number`。對現有功能完全向後相容（未指定時不影響任何行為）。

---

### D5. interactive 鎖定

**決策**：SET_OPTIONS `interactive: false` 時，停用 MapLibre 所有手勢控制器：
```typescript
map.dragPan.disable()
map.scrollZoom.disable()
map.doubleClickZoom.disable()
map.touchZoomRotate.disable()
map.keyboard.disable()
```

`interactive: true` 時重新啟用。`GlobeMap` 維護 `isInteractive` state（預設 `true`）。

---

## Risks / Trade-offs

- **三段動畫的 moveend 監聽**：若使用者在動畫中手動移動地圖，`moveend` 會提前觸發，導致第二段飛行目標不符。
  → 緩解：使用一次性 `.once('moveend', ...)` 監聽；三段動畫期間暫時設 `interactive: false` 可選。

- **cameraForBounds 在 globe projection 的精確度**：MapLibre v5 globe projection 下 `cameraForBounds` 為近似計算，極端情況下（如對蹠點）fitZoom 可能不準確。
  → 緩解：fitZoom 減去 0.5 buffer 提供安全餘裕。

- **GlobeMap.tsx 複雜度增加**：目前 279 行，新增邏輯後約 380-420 行，仍在 400 行目標內。
  → 可考慮抽出 `lib/flyTo.ts` 存放 smart flyto 邏輯。

## Migration Plan

無 breaking changes，所有新欄位皆為選用。現有 URL params 格式完全相容（`center=lng,lat` 不變）。逐步部署，無需遷移步驟。
