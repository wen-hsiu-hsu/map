## ADDED Requirements

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
