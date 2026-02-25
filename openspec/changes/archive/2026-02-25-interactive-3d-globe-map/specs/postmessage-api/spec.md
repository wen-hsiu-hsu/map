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
