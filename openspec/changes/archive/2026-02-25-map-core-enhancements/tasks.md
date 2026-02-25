## 1. 型別擴充

- [x] 1.1 擴充 `MarkerData`（`lib/parseUrlParams.ts`）：新增選用欄位 `flyToZoom?: number`
- [x] 1.2 擴充 `InboundMessage`（`lib/postMessageTypes.ts`）：SET_OPTIONS 新增 `onMarkerClick`, `flyToZoom`, `smartFlyThreshold`, `interactive` 欄位
- [x] 1.3 擴充 `OutboundMessage`（`lib/postMessageTypes.ts`）：新增 `FLY_START` 與 `FLY_END` 事件型別（含 `lat`, `lng`）
- [x] 1.4 擴充 `parseUrlParams` 回傳型別（`lib/parseUrlParams.ts`）：`center` 支援 `[number, number] | { markerId: string }`

## 2. URL Params 解析

- [x] 2.1 更新 `parseUrlParams`（`lib/parseUrlParams.ts`）：`center` 參數偵測 `marker:` 前綴，回傳 `{ markerId: string }`

## 3. Smart Flyto 邏輯

- [x] 3.1 建立 `lib/flyTo.ts`：實作 Haversine 距離計算函式 `getDistanceKm(from, to)`
- [x] 3.2 實作 `buildFlyToOptions`：根據 `smartFlyThreshold` 判斷是否使用智慧策略，計算 fitZoom（`map.cameraForBounds`）
- [x] 3.3 實作 `triggerSmartFlyTo(map, target, options)`：執行三段動畫序列（zoom out → flyTo → zoom in），使用 `map.once('moveend', ...)` 串接各段

## 4. GlobeMap 核心更新

- [x] 4.1 新增 state：`onMarkerClickMode`（預設 `"event-only"`）、`globalFlyToZoom`、`smartFlyThreshold`、`isInteractive`（預設 `true`）
- [x] 4.2 更新 `handleMessage` 的 `SET_OPTIONS` case：處理四個新欄位，`interactive` 變更時呼叫 `map.dragPan.disable()` 等
- [x] 4.3 更新 `handleMessage` 的 `FLY_TO` case：改呼叫 `triggerSmartFlyTo`，動畫前後發送 `FLY_START` / `FLY_END`
- [x] 4.4 更新 `handleMarkerClick`：當 `onMarkerClickMode === 'flyto+highlight'` 時，內部執行 `triggerSmartFlyTo`（使用 marker 的 `flyToZoom`）並 `setActiveMarkerId`
- [x] 4.5 更新 `onMapReady`：center 解析支援 `markerId`——從 `urlParams.current.markers` 中查找座標，找不到 fallback DEFAULT_CENTER
- [x] 4.6 更新 SET_OPTIONS handler 中 center 欄位：支援 `{ markerId: string }` 格式，從當前 `markers` state 查找

## 5. 驗證

- [x] 5.1 在 `public/test.html` 或 generator 手動測試：center=marker:id 正確飛至對應 marker
- [x] 5.2 手動測試智慧飛行：台灣 → 紐約應觸發三段動畫
- [x] 5.3 手動測試 onMarkerClick=flyto+highlight：點擊 marker 自動飛行且 FLY_START/FLY_END 發送
- [x] 5.4 手動測試 interactive=false：使用者手勢被停用，postMessage FLY_TO 仍正常
