## Purpose

提供 `/generator` 頁面，讓使用者透過視覺化表單產生地圖 iframe src URL，並可即時預覽地圖效果。
## Requirements
### Requirement: Generator page renders parameter form
The system SHALL provide a web page at `/generator` with input fields for center longitude, center latitude, zoom level, and a dynamic list of markers (each with id, lat, lng, label, color).

#### Scenario: Page loads with empty defaults
- **WHEN** user navigates to `/generator`
- **THEN** the page SHALL display input fields for center lng, center lat, zoom, and an empty marker list with an "Add Marker" button

#### Scenario: Default values pre-filled
- **WHEN** the page loads
- **THEN** center longitude SHALL default to `121.5319`, center latitude to `25.0478`, and zoom to `10`

### Requirement: Generator produces iframe src URL in real time
The system SHALL recompute and display the iframe `src` URL whenever any input field value changes, without requiring a submit button.

#### Scenario: Center and zoom inputs update URL
- **WHEN** user changes center longitude, center latitude, or zoom
- **THEN** the displayed iframe src SHALL immediately reflect the new `?center=<lng>,<lat>&zoom=<zoom>` values

#### Scenario: Markers encoded as URL-safe Base64
- **WHEN** user has one or more marker rows filled in
- **THEN** the displayed iframe src SHALL include `&markers=<url-safe-base64-encoded-json-array>` where the JSON array contains only the filled marker fields

#### Scenario: Empty marker list omits markers param
- **WHEN** no marker rows exist or all marker rows are empty
- **THEN** the displayed iframe src SHALL NOT include a `markers` parameter

### Requirement: Generator allows dynamic marker management
The system SHALL allow users to add and remove marker rows in the form.

#### Scenario: Add marker row
- **WHEN** user clicks "Add Marker"
- **THEN** a new row with id, lat, lng, label (optional), and color (optional) input fields SHALL appear

#### Scenario: Remove marker row
- **WHEN** user clicks the remove button on a marker row
- **THEN** that row SHALL be removed and the iframe src SHALL update immediately

### Requirement: Generator provides copy-to-clipboard action
The system SHALL provide a button to copy the generated iframe src URL to the clipboard.

#### Scenario: Copy button copies URL
- **WHEN** user clicks the copy button
- **THEN** the current iframe src value SHALL be copied to the clipboard and the button SHALL briefly show a confirmation state (e.g., "Copied!")

### Requirement: Generator warns when URL length is excessive
The system SHALL warn the user when the generated URL exceeds 4000 characters, indicating potential issues with browser or server URL length limits.

#### Scenario: Warning displayed for long URL
- **WHEN** the generated iframe src URL exceeds 4000 characters
- **THEN** the system SHALL display a visible warning message near the URL output

#### Scenario: No warning for acceptable URL length
- **WHEN** the generated iframe src URL is 4000 characters or fewer
- **THEN** no length warning SHALL be displayed

### Requirement: 座標拾取器
Generator 頁面 SHALL 監聽來自預覽 iframe 的 MAP_CLICK postMessage。收到後 SHALL 在左側面板頂部顯示座標拾取面板，顯示經緯度並提供套用選項。

#### Scenario: 點擊地圖出現拾取面板
- **WHEN** 使用者點擊預覽 iframe 中的空白地圖
- **THEN** 左側面板頂部出現拾取面板，顯示 `lat: <value>  lng: <value>`

#### Scenario: 再次點擊地圖更新座標
- **WHEN** 拾取面板已顯示，使用者點擊地圖其他位置
- **THEN** 面板座標更新為新點擊位置，面板持續顯示

#### Scenario: 手動關閉拾取面板
- **WHEN** 使用者點擊拾取面板的關閉按鈕（✕）
- **THEN** 拾取面板消失

### Requirement: 座標拾取套用到 Center
拾取面板 SHALL 提供「套用到 Center」按鈕，點擊後將拾取座標填入 center lat/lng 欄位，並關閉面板。

#### Scenario: 套用拾取座標到 Center
- **WHEN** 使用者在拾取面板點擊「套用到 Center」
- **THEN** center Longitude 與 Latitude 欄位更新為拾取座標，面板關閉

### Requirement: 座標拾取套用到 Marker
拾取面板 SHALL 提供套用到 Marker 的選項，包含兩種模式：新增一筆 marker（使用拾取座標）、套用到現有 marker（下拉選取 marker id）。

#### Scenario: 新增 marker 使用拾取座標
- **WHEN** 使用者選擇「新增一筆 marker」並確認
- **THEN** markers 列表新增一筆 marker，lat/lng 預填為拾取座標，面板關閉

#### Scenario: 套用到現有 marker
- **WHEN** 使用者選擇「套用到現有 marker」，從下拉選取某個 marker id，並確認
- **THEN** 該 marker 的 lat/lng 更新為拾取座標，面板關閉

#### Scenario: 無現有 marker 時隱藏套用到現有選項
- **WHEN** markers 列表為空，拾取面板顯示
- **THEN** 「套用到現有 marker」選項不顯示

### Requirement: Marker flyToZoom 欄位
每個 marker row SHALL 包含選用的 flyToZoom 數字輸入欄位。有值時 SHALL 納入 base64 編碼寫入 iframe src URL。

#### Scenario: flyToZoom 寫入 URL
- **WHEN** 使用者在某個 marker row 填入 flyToZoom 值（如 14）
- **THEN** 產生的 markers base64 中該 marker 包含 `flyToZoom: 14`

#### Scenario: flyToZoom 為空時不寫入
- **WHEN** marker row 的 flyToZoom 欄位為空
- **THEN** 該 marker 的編碼中不包含 flyToZoom 欄位

### Requirement: 全域行為設定區塊
Generator 左側面板 SHALL 新增全域設定區塊，包含 onMarkerClick 切換、flyToZoom 輸入、smartFlyThreshold 輸入。這些設定 SHALL 即時以 SET_OPTIONS postMessage 傳送給預覽 iframe，不寫入 iframe src URL。

#### Scenario: onMarkerClick 切換即時生效
- **WHEN** 使用者切換 onMarkerClick 為 `flyto+highlight`
- **THEN** Generator 傳送 `{ type: "SET_OPTIONS", onMarkerClick: "flyto+highlight" }` 給 iframe，預覽地圖立即套用

#### Scenario: flyToZoom 設定即時生效
- **WHEN** 使用者在全域設定填入 flyToZoom 值
- **THEN** Generator 傳送 `{ type: "SET_OPTIONS", flyToZoom: <value> }` 給 iframe

#### Scenario: 全域設定不影響 iframe src URL
- **WHEN** 使用者更改任何全域設定
- **THEN** 顯示的 iframe src URL 不變，全域設定僅透過 postMessage 傳遞

### Requirement: Center 支援 Marker ID 模式
Center 區塊 SHALL 支援「Marker ID 模式」切換。啟用後顯示 marker id 下拉選單（從現有 markers 動態產生），產生 `center=marker:<id>` URL 格式。

#### Scenario: 切換到 Marker ID 模式
- **WHEN** 使用者啟用 Center 的 Marker ID 模式
- **THEN** lat/lng 輸入隱藏，顯示 marker id 下拉選單

#### Scenario: 選擇 Marker ID 產生正確 URL
- **WHEN** 使用者在 Marker ID 模式下選擇 id 為 `taipei-101` 的 marker
- **THEN** iframe src 包含 `center=marker:taipei-101`

#### Scenario: 切回座標模式
- **WHEN** 使用者關閉 Marker ID 模式
- **THEN** 恢復顯示 lat/lng 輸入，URL 改回 `center=<lng>,<lat>` 格式

### Requirement: encodeMarkersBase64 支援 UTF-8
Generator 的 base64 編碼函式 SHALL 正確處理 UTF-8 字元（含中文）。

#### Scenario: 中文 label 正確編碼
- **WHEN** marker label 包含中文字（如「台北101」）
- **THEN** 編碼後的 base64 解碼可還原原始中文字，地圖正確顯示 label

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
