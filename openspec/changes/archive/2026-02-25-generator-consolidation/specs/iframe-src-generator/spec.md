## ADDED Requirements

### Requirement: 雙 tab 佈局（Embed Config / Live Controls）
Generator 頁面左側 panel SHALL 提供兩個 tab：「Embed Config」與「Live Controls」。預設顯示 Embed Config tab。切換 tab 不影響預覽 iframe 或任何 state。

#### Scenario: 預設顯示 Embed Config
- **WHEN** 使用者開啟 generator 頁面
- **THEN** 左側顯示 Embed Config tab 內容

#### Scenario: 切換到 Live Controls
- **WHEN** 使用者點擊 Live Controls tab
- **THEN** 左側切換顯示 Live Controls 內容，預覽 iframe 不重新載入

### Requirement: Live Controls — SET_MARKERS
Live Controls tab SHALL 提供 SET_MARKERS 指令 UI，包含動態 marker rows（id、lat、lng、label、color）與發送按鈕。Marker rows 狀態 SHALL 持久化至 localStorage。

#### Scenario: 新增與移除 marker row
- **WHEN** 使用者在 Live Controls 點擊「+ Add Marker」
- **THEN** 新增一個 marker row（id、lat、lng、label、color 欄位）

#### Scenario: 發送 SET_MARKERS
- **WHEN** 使用者點擊「Send SET_MARKERS」
- **THEN** 傳送 `{ type: "SET_MARKERS", markers: [...] }` 給預覽 iframe，並在 Events Log 記錄

### Requirement: Live Controls — FLY_TO
Live Controls tab SHALL 提供 FLY_TO 指令 UI（lat、lng、zoom 欄位），狀態 SHALL 持久化。

#### Scenario: 發送 FLY_TO
- **WHEN** 使用者填入 lat/lng（zoom 選填）並點擊發送
- **THEN** 傳送 FLY_TO postMessage 給預覽 iframe

### Requirement: Live Controls — HIGHLIGHT
Live Controls tab SHALL 提供 HIGHLIGHT 指令 UI（marker id 欄位），狀態 SHALL 持久化。空白時發送 `id: null` 清除 highlight。

#### Scenario: 發送 HIGHLIGHT
- **WHEN** 使用者填入 marker id 並發送
- **THEN** 傳送 `{ type: "HIGHLIGHT", id: "<id>" }` 給預覽 iframe

### Requirement: Live Controls — SET_OPTIONS
Live Controls tab SHALL 提供 SET_OPTIONS 指令 UI（center lng/lat、zoom 欄位），狀態 SHALL 持久化。

#### Scenario: 發送 SET_OPTIONS
- **WHEN** 使用者填入任意欄位並發送
- **THEN** 傳送包含填入欄位的 SET_OPTIONS postMessage 給預覽 iframe

### Requirement: Live Controls — Events Log
Live Controls tab SHALL 顯示 Events Log，記錄所有發出的指令與收到的地圖事件。最多保留 100 筆，新事件顯示在最上方。

#### Scenario: 收到地圖事件記錄
- **WHEN** 地圖發送任何 postMessage（READY、MARKER_CLICK、MAP_CLICK 等）
- **THEN** Events Log 新增一筆記錄，顯示時間與事件內容

#### Scenario: 發出指令記錄
- **WHEN** 使用者透過 Live Controls 發送任何 postMessage
- **THEN** Events Log 新增一筆記錄，顯示時間與指令內容

### Requirement: 移除 test.html
`public/test.html` SHALL 被刪除。Generator 頁面的 Live Controls tab 取代其所有功能。

#### Scenario: test.html 不再存在
- **WHEN** 使用者訪問 `/test.html`
- **THEN** 回傳 404（檔案已移除）
