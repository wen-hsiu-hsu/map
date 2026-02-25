## Why

外部網站需要手動將 marker JSON 編碼成 Base64 才能組出正確的 iframe `src`，流程繁瑣且容易出錯。同時，測試頁面所有 postMessage 指令都是硬編碼固定值，開發者無法在不改程式碼的情況下測試自訂參數，降低開發效率。

## What Changes

- 新增 `iframe-src-generator` 工具頁（`/generator`），接受 URL 參數並即時產生可直接使用的 iframe `src`，包含正確的 Base64 編碼 markers
- 測試頁（`/public/test.html`）所有 postMessage 指令改為透過表單輸入自訂值，包含 SET_MARKERS、FLY_TO、HIGHLIGHT、SET_OPTIONS 等，移除所有硬編碼的固定測試資料

## Capabilities

### New Capabilities

- `iframe-src-generator`: 提供一個靜態工具頁面，使用者填入 center/zoom/markers 等參數，頁面即時產生正確的 iframe `src` URL（含 Base64 編碼），可直接複製使用
- `custom-test-ui`: 測試頁所有 postMessage 指令均改為可由使用者在介面上自訂輸入值後執行，支援動態新增/移除 marker 列、自訂座標/標籤/顏色等欄位

### Modified Capabilities

- `url-params`: iframe-src-generator 直接使用現有 URL 參數規格（center、zoom、markers Base64），不改變規格本身，無需 delta spec
- `markers`: 測試 UI 新增自訂 marker 輸入，marker 資料結構（MarkerData interface）維持不變

## Impact

- 新增 Next.js 頁面：`app/generator/page.tsx`（iframe src 產生器）
- 修改：`public/test.html`（全面改為動態輸入 UI）
- 不影響現有地圖核心邏輯（GlobeMap.tsx、parseUrlParams.ts）
- 不影響 postMessage API 規格
- 無新增外部依賴
