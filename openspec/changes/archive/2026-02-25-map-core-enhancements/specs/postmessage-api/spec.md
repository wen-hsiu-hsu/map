## ADDED Requirements

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
