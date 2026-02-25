## Why

test.html 與 generator 功能定位重疊，且 generator 目前將「嵌入設定（寫入 URL）」與「即時控制（postMessage）」混放在同一個 panel，使用者容易混淆哪些設定會影響 iframe src、哪些只對當前預覽有效。整合後以 tab 明確區分，並移除冗餘的 test.html。

## What Changes

- **Generator 左側 panel 改為雙 tab 佈局**
  - **Embed Config tab**：所有會寫入 iframe src URL 的設定（Center/Zoom、Markers、Behavior）+ Generated URL + Copy 按鈕
  - **Live Controls tab**：runtime postMessage 指令（FLY_TO、HIGHLIGHT、SET_MARKERS、SET_OPTIONS）+ Events Log
- **Live Controls 從 test.html 移植**：完整保留 SET_MARKERS 動態 marker rows、FLY_TO、HIGHLIGHT、SET_OPTIONS 指令 UI，以及 Events Log
- **移除 test.html**：`public/test.html` 刪除
- **Global Settings（onMarkerClick / flyToZoom / smartFlyThreshold）留在 Embed Config**：明確標註「也寫入 URL」，與純 postMessage 設定區分
- **Live Controls 的 SET_MARKERS marker rows 也支援 localStorage 持久化**

## Capabilities

### New Capabilities

（無新 capability，為 UI 重組）

### Modified Capabilities

- `iframe-src-generator`: tab 佈局、Live Controls 整合、test.html 移除

## Impact

- `app/generator/page.tsx`：重構為雙 tab 佈局，加入 Live Controls 區塊
- `public/test.html`：刪除
