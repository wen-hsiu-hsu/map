## 1. 準備

- [x] 1.1 在 `app/generator/page.tsx` 新增 `activeTab: 'embed' | 'live'` state（預設 `'embed'`）
- [x] 1.2 新增 `LS_LIVE_KEY = 'globe-map-generator-live'` 常數與對應的 `PersistedLiveState` 介面
- [x] 1.3 新增 Live Controls 所需 state：`liveMarkers`、`flyLat/Lng/Zoom`、`highlightId`、`optLng/Lat/Zoom`、`events`，從 localStorage 還原

## 2. Tab UI

- [x] 2.1 在左側 panel 頂部加入 tab 切換列（Embed Config / Live Controls）
- [x] 2.2 根據 `activeTab` 條件渲染對應內容（Embed Config 區塊維持現狀）

## 3. Live Controls UI

- [x] 3.1 實作 SET_MARKERS 區塊：動態 marker rows（id、lat、lng、label、color）、Add/Remove、Send 按鈕
- [x] 3.2 實作 FLY_TO 區塊：lat、lng、zoom（選填）、Send 按鈕
- [x] 3.3 實作 HIGHLIGHT 區塊：marker id 輸入、Send 按鈕（空白→ null）
- [x] 3.4 實作 SET_OPTIONS 區塊：center lng/lat（選填）、zoom（選填）、Send 按鈕
- [x] 3.5 實作 Events Log：顯示最近 100 筆，收到/發出事件時 prepend

## 4. Live Controls 邏輯

- [x] 4.1 實作 `sendLive(msg)` 函式：發送 postMessage 給 iframeRef 並記錄到 events
- [x] 4.2 更新 window message 監聽：收到任何事件時也記錄到 events（目前只處理 MAP_CLICK 和 READY）
- [x] 4.3 Live Controls state 變更時寫入 `LS_LIVE_KEY` localStorage

## 5. 收尾

- [x] 5.1 刪除 `public/test.html`
- [x] 5.2 TypeScript 編譯確認無錯誤
