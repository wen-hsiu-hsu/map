## 1. iframe Src Generator 頁面

- [x] 1.1 建立 `app/generator/page.tsx`，標記為 `'use client'`，初始化 center lng/lat/zoom 的 state（預設值：121.5319, 25.0478, 10）
- [x] 1.2 新增 marker 列表 state，實作「Add Marker」按鈕以新增空白 marker 列，實作每列的「Remove」按鈕
- [x] 1.3 實作 `buildIframeSrc(center, zoom, markers)` 函式：將 markers JSON 陣列進行 URL-safe Base64 編碼，組合完整 iframe src URL
- [x] 1.4 使用 `useMemo` 或 `useEffect` 讓 iframe src 在任何輸入變更時即時更新
- [x] 1.5 實作 URL 長度警告：當 src URL 超過 4000 字元時顯示警告訊息
- [x] 1.6 實作「Copy」按鈕，呼叫 `navigator.clipboard.writeText()`，點擊後短暫顯示「Copied!」確認狀態
- [x] 1.7 在頁面底部加入 iframe 預覽，`src` 綁定至即時產生的 URL，讓使用者可直接驗證效果

## 2. 測試頁自訂輸入 UI

- [x] 2.1 移除 `public/test.html` 中 SET_MARKERS、FLY_TO、HIGHLIGHT、SET_OPTIONS 所有硬編碼的固定資料
- [x] 2.2 改寫 SET_MARKERS 區塊：新增動態 marker 列表（id, lat, lng, label, color 欄位），加入「Add Marker」與每列「Remove」按鈕，送出時從當前 DOM 欄位讀取值組成 markers 陣列
- [x] 2.3 改寫 FLY_TO 區塊：新增 lat、lng、zoom（optional）輸入欄位，送出時若 zoom 為空則不帶入 zoom 屬性
- [x] 2.4 改寫 HIGHLIGHT 區塊：新增 marker id 輸入欄位，送出時若欄位為空則傳 `id: null`
- [x] 2.5 改寫 SET_OPTIONS 區塊：新增 center lng、center lat（optional）、zoom（optional）輸入欄位，送出時只包含有填入值的屬性
- [x] 2.6 確認事件日誌面板仍正確顯示所有傳出與接收的 postMessage 內容（包含新的自訂值）
