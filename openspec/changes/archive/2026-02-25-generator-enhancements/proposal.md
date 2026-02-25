## Why

Generator 頁面目前需要手動輸入經緯度，調整位置效率低。同時缺少全域地圖行為設定（onMarkerClick、flyToZoom、smartFlyThreshold），導致使用者必須自行構造 postMessage 才能測試這些功能。

## What Changes

- **座標拾取器**：點擊右側預覽地圖任意位置，地圖發送 MAP_CLICK 事件，Generator 顯示浮動面板（含經緯度），可一鍵套用至 center 或任意 marker（新增一筆 / 套用到現有）
- **全域行為設定**：Generator 左側新增設定區塊，包含 onMarkerClick（切換開關）、flyToZoom（數字輸入）、smartFlyThreshold（數字輸入），這些設定會以 `SET_OPTIONS` postMessage 即時傳送給預覽地圖，並**不**寫入 iframe src URL
- **Marker flyToZoom 欄位**：每個 marker row 新增選用的 flyToZoom 欄位，納入 base64 編碼並寫入 iframe src
- **Center 支援 marker id**：center 輸入區新增「使用 Marker ID」模式切換，選擇後顯示 marker id 下拉（從現有 markers 選取），產生 `center=marker:<id>` URL 格式

## Capabilities

### New Capabilities

- `map-click-event`: 地圖在使用者點擊空白處時發送 MAP_CLICK 事件給父視窗，包含點擊位置的經緯度

### Modified Capabilities

- `iframe-src-generator`: 新增座標拾取器 UI、全域行為設定區塊、marker flyToZoom 欄位、center marker id 模式
- `postmessage-api`: 新增 MAP_CLICK outbound 事件

## Impact

- `components/GlobeMap.tsx`：新增地圖空白處點擊監聽，發送 MAP_CLICK 事件
- `lib/postMessageTypes.ts`：OutboundMessage 新增 MAP_CLICK 型別
- `app/generator/page.tsx`：新增全域設定區塊、座標拾取器邏輯、marker flyToZoom 欄位、center marker id 模式、監聽 iframe postMessage
- `lib/parseUrlParams.ts` / `encodeMarkersBase64`：支援 flyToZoom 欄位編碼（需修正 btoa 的 UTF-8 問題）
