## ADDED Requirements

### Requirement: 3D 地球初始化
地圖 SHALL 使用 MapLibre GL JS v5 以 globe projection 渲染 3D 地球。底圖 SHALL 使用 CARTO positron 亮色底圖，URL 透過 `NEXT_PUBLIC_BASEMAP_URL` 環境變數設定。

#### Scenario: 地圖正常載入
- **WHEN** 使用者開啟地圖頁面
- **THEN** 地球以 globe projection 渲染，顯示亮色底圖與邊界線

#### Scenario: 環境變數未設定
- **WHEN** `NEXT_PUBLIC_BASEMAP_URL` 未設定
- **THEN** 使用 fallback 預設值 `https://basemaps.cartocdn.com/gl/positron-gl-style/style.json`

### Requirement: 容器自適應
地圖 SHALL 自動填滿外部 iframe 的容器尺寸，並在容器尺寸變化時自動重新渲染。

#### Scenario: iframe 尺寸變化
- **WHEN** 外部網站調整 iframe 的 CSS 尺寸
- **THEN** 地圖自動重新計算並填滿新尺寸，不需要重新載入頁面

### Requirement: 初始位置設定
地圖 SHALL 支援在初始化時設定 center（經緯度）與 zoom 等級。未指定時 SHALL 使用預設值（center: `[0, 20]`，zoom: `2`）。

#### Scenario: 使用預設初始位置
- **WHEN** 未傳入任何初始設定
- **THEN** 地圖以預設 center `[0, 20]` 與 zoom `2` 渲染地球全景
