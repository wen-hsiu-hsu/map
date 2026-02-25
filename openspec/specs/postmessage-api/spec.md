## Purpose

定義地圖 iframe 與外部網站之間的 postMessage 通訊協定，包含所有 inbound 指令與 outbound 事件的格式與行為規範。
## Requirements
### Requirement: SET_OPTIONS 支援 onMarkerClick 行為設定
地圖 SHALL 接受 SET_OPTIONS 指令中的 `onMarkerClick` 欄位，控制使用者點擊標記時地圖的自動行為。`"event-only"`（預設）：僅發送 MARKER_CLICK 事件，不自動飛行。`"flyto+highlight"`：地圖內部自動執行智慧 flyto 並 highlight 該標記，同時仍發送 MARKER_CLICK 事件。

#### Scenario: 設定 onMarkerClick 為 flyto+highlight
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", onMarkerClick: "flyto+highlight" }`，使用者點擊標記
- **THEN** 地圖自動執行智慧 flyto 至該標記，highlight 該標記，並發送 MARKER_CLICK 事件

#### Scenario: 預設行為不受影響
- **WHEN** 未設定 `onMarkerClick`（或設定為 `"event-only"`），使用者點擊標記
- **THEN** 地圖僅發送 MARKER_CLICK 事件，不自動飛行或 highlight

#### Scenario: flyto+highlight 模式仍發送 MARKER_CLICK
- **WHEN** `onMarkerClick: "flyto+highlight"`，使用者點擊標記
- **THEN** 地圖發送 `{ type: "MARKER_CLICK", id, lat, lng }`（外部網站仍可接收到點擊事件）

### Requirement: SET_OPTIONS 支援 flyToZoom 與 smartFlyThreshold
地圖 SHALL 接受 SET_OPTIONS 中的 `flyToZoom`（數字）與 `smartFlyThreshold`（km 數字）欄位，作為全域飛行設定。

#### Scenario: 設定全域 flyToZoom
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", flyToZoom: 13 }`
- **THEN** 後續所有 flyto 動畫（在無更高優先級設定時）以 zoom 13 為落點

#### Scenario: 設定 smartFlyThreshold
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", smartFlyThreshold: 800 }`
- **THEN** 後續 FLY_TO 在距離超過 800km 時才執行智慧三段飛行

### Requirement: FLY_TO 觸發智慧飛行
地圖收到 FLY_TO 指令時，SHALL 根據 smartFlyThreshold 判斷是否執行智慧飛行策略（詳見 smart-flyto spec）。現有無效座標行為不變（發送 ERROR）。

#### Scenario: FLY_TO 觸發智慧飛行
- **WHEN** 外部網站發送 FLY_TO，且條件符合智慧飛行策略
- **THEN** 地圖執行 zoom out → flyto → zoom in 三段序列，並發送 FLY_START / FLY_END 事件

## ADDED Requirements

### Requirement: 接受任意來源的 postMessage
地圖 SHALL 接受來自任何 `origin` 的 postMessage 指令，不驗證來源網域。

#### Scenario: 任意來源送出指令
- **WHEN** 任何外部網站透過 postMessage 送出指令
- **THEN** 地圖正常處理該指令，不因來源不符而拒絕

### Requirement: READY 事件
地圖 SHALL 在 MapLibre 地圖載入完成（`map.on('load')`）後，向父視窗發送 `READY` 事件。外部網站 SHALL 等收到此事件後才開始傳送指令。

#### Scenario: 地圖載入完成通知
- **WHEN** MapLibre 地圖完成初始載入
- **THEN** 地圖向 `window.parent` 發送 `{ type: "READY" }` postMessage

### Requirement: READY 前指令排隊
地圖 SHALL 在發送 READY 事件前，將收到的所有指令存入排隊，待 READY 發送後依序執行。

#### Scenario: 早於 READY 的指令被排隊
- **WHEN** 外部網站在收到 READY 前送出 SET_MARKERS 指令
- **THEN** 地圖將該指令加入 pending queue

#### Scenario: READY 後 flush 排隊指令
- **WHEN** 地圖發送 READY 事件
- **THEN** 依序執行所有 pending queue 中的指令

### Requirement: SET_MARKERS 指令
地圖 SHALL 接收 `SET_MARKERS` 指令，取代當前所有標記。

#### Scenario: 接收 SET_MARKERS
- **WHEN** 外部網站發送 `{ type: "SET_MARKERS", markers: [...] }`
- **THEN** 地圖移除所有既有標記，顯示新的標記集合

### Requirement: FLY_TO 指令
地圖 SHALL 接收 `FLY_TO` 指令，飛行至指定座標。

#### Scenario: 接收 FLY_TO
- **WHEN** 外部網站發送 `{ type: "FLY_TO", lat, lng, zoom? }`
- **THEN** 地圖執行飛行動畫至指定位置

### Requirement: HIGHLIGHT 指令
地圖 SHALL 接收 `HIGHLIGHT` 指令，將指定 id 的標記切換為 active（光暈）狀態。

#### Scenario: 接收 HIGHLIGHT
- **WHEN** 外部網站發送 `{ type: "HIGHLIGHT", id: "xxx" }`
- **THEN** 對應標記顯示光暈效果

### Requirement: SET_OPTIONS 指令
地圖 SHALL 接收 `SET_OPTIONS` 指令，動態更新 center 與/或 zoom。

#### Scenario: 接收 SET_OPTIONS
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", center?, zoom? }`
- **THEN** 地圖立即更新對應設定

### Requirement: 無效座標回傳 ERROR 事件
收到 `FLY_TO` 或 `SET_OPTIONS` 時，若座標超出有效範圍（lat 超出 -90~90 或 lng 超出 -180~180），地圖 SHALL 向父視窗發送 ERROR 事件，不執行飛行。

#### Scenario: FLY_TO 無效座標
- **WHEN** 外部網站發送 `{ type: "FLY_TO", lat: 999, lng: 0 }`
- **THEN** 地圖發送 `{ type: "ERROR", code: "INVALID_COORDINATES", message: "..." }` 並不執行飛行

### Requirement: MARKER_CLICK 事件
使用者點擊標記時，地圖 SHALL 向父視窗發送 `MARKER_CLICK` 事件。

#### Scenario: 點擊標記發送事件
- **WHEN** 使用者點擊地圖標記
- **THEN** 地圖發送 `{ type: "MARKER_CLICK", id, lat, lng }`

### Requirement: ZOOM_CHANGE 事件
縮放操作結束後，地圖 SHALL 向父視窗發送 `ZOOM_CHANGE` 事件。

#### Scenario: 縮放結束發送事件
- **WHEN** 使用者完成縮放操作
- **THEN** 地圖發送 `{ type: "ZOOM_CHANGE", zoom: number }`

### Requirement: MAP_CLICK outbound 事件
地圖 SHALL 在使用者點擊空白地圖時向父視窗發送 MAP_CLICK 事件（詳見 map-click-event spec）。

#### Scenario: MAP_CLICK 格式
- **WHEN** 使用者點擊空白地圖
- **THEN** 地圖發送 `{ type: "MAP_CLICK", lat: number, lng: number }`，lat/lng 為點擊位置的精確座標
