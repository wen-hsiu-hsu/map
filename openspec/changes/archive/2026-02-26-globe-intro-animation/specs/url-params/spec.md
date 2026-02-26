## ADDED Requirements

### Requirement: intro URL 參數
地圖 SHALL 支援 `intro` URL 參數（`true` 或 `1`）啟用開場動畫。未提供或為其他值時，intro 預設為停用。

#### Scenario: 啟用 intro
- **WHEN** URL 含 `?intro=true` 或 `?intro=1`
- **THEN** 地圖在載入後播放 intro 動畫

#### Scenario: 未設定 intro
- **WHEN** URL 不含 `intro` 參數
- **THEN** 地圖跳過 intro 動畫，行為與現有一致

### Requirement: introDuration URL 參數
地圖 SHALL 支援 `introDuration` URL 參數（正整數毫秒）設定 intro 動畫時長，預設為 3000。

#### Scenario: 解析 introDuration
- **WHEN** URL 含 `?introDuration=5000`
- **THEN** 解析為數值 5000 並套用至 intro 動畫

### Requirement: introRotate URL 參數
地圖 SHALL 支援 `introRotate` URL 參數（數值，度數）設定動畫起始 longitude 偏移量，預設為 90。

#### Scenario: 解析 introRotate
- **WHEN** URL 含 `?introRotate=120`
- **THEN** 解析為數值 120 並套用至 intro 動畫起始偏移
