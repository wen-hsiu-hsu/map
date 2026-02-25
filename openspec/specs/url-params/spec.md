## ADDED Requirements

### Requirement: URL query parameters 初始化
地圖 SHALL 支援透過 URL query parameters 設定初始 center、zoom 與 markers，供不需要撰寫 JS 的嵌入情境使用（如 VitePress markdown）。URL 參數 SHALL 只用於初始化，不影響後續 postMessage 操作。

#### Scenario: 帶有 URL 參數的嵌入
- **WHEN** iframe src 包含 `?center=121.565,25.033&zoom=5`
- **THEN** 地圖以指定 center 與 zoom 初始化，不需要 postMessage

#### Scenario: URL 參數格式
- **WHEN** URL 包含 `center=lng,lat`（注意 lng 在前）
- **THEN** 地圖正確解析並設定初始中心點

### Requirement: URL markers 使用 URL-safe Base64 編碼
`markers` 參數 SHALL 為 URL-safe Base64 編碼的 JSON 陣列（格式同 `SET_MARKERS` 的 `markers` 欄位）。編碼 SHALL 使用 `+→-`、`/→_` 替換，並移除 `=` padding，以確保在 URL 中安全傳遞。

#### Scenario: 帶有 markers 的 URL 參數
- **WHEN** URL 包含 `markers=<url-safe-base64>`
- **THEN** 地圖解碼並在初始化時放置對應標記

#### Scenario: Base64 解碼失敗
- **WHEN** `markers` 參數不是有效的 Base64 或 JSON
- **THEN** 地圖靜默忽略該參數，繼續正常初始化

### Requirement: postMessage 覆蓋 URL 參數
收到 `SET_MARKERS` postMessage 時，SHALL 完全取代 URL 參數所設定的初始標記。

#### Scenario: postMessage 覆蓋初始標記
- **WHEN** 地圖已透過 URL 參數顯示初始標記，外部網站發送 SET_MARKERS
- **THEN** URL 參數的標記全部移除，顯示 postMessage 傳入的新標記

### Requirement: markerColor URL 參數
地圖 SHALL 支援 `markerColor` URL 參數，設定所有標記的全域預設顏色。顏色 SHALL 為合法 CSS 色號（如 `#ef4444`，需 URL encode 為 `%23ef4444`）。優先順序 SHALL 為：個別 marker `color` 欄位 > `markerColor` URL 參數 > 系統預設色（#22c55e）。`markerColor` 僅在初始化時讀取，不影響後續 postMessage 操作。

#### Scenario: 設定全域預設顏色
- **WHEN** URL 包含 `markerColor=%23ef4444`
- **THEN** 所有未指定個別 color 的標記均以紅色（#ef4444）顯示

#### Scenario: 個別 marker color 優先於全域設定
- **WHEN** URL 包含 `markerColor=%23ef4444`，某標記有 `color: "#3b82f6"`
- **THEN** 該標記以藍色顯示，其他無個別顏色的標記以紅色顯示

#### Scenario: 未設定 markerColor 使用系統預設
- **WHEN** URL 不含 `markerColor` 參數
- **THEN** 標記使用系統預設綠色（#22c55e）
