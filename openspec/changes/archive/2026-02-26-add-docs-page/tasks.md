## 1. 建立文件頁面

- [x] 1.1 新增 `app/docs/page.tsx`，設定頁面 metadata（title、description）
- [x] 1.2 實作頁面頂部標題與簡介段落
- [x] 1.3 實作頁面頂部目錄（Table of Contents），含錨點連結至各節
- [x] 1.4 實作「URL 參數」節：說明 `center`、`zoom`、`markers` 參數格式與範例
- [x] 1.5 實作「標記格式」節：說明 markers JSON 陣列欄位（id, lat, lng, label, color, flyToZoom）及 Base64 編碼方式
- [x] 1.6 實作「postMessage API - 指令」節：列出所有 inbound 指令（SET_MARKERS, FLY_TO, HIGHLIGHT, SET_OPTIONS）及 payload 範例
- [x] 1.7 實作「postMessage API - 事件」節：列出所有 outbound 事件（READY, MARKER_CLICK, ZOOM_CHANGE, ERROR）及 payload 範例
- [x] 1.8 實作「地圖控制項」節：說明 UI 控制項（縮放、方位、投影切換）的行為

## 2. 修改 Generator 頁面

- [x] 2.1 在 `app/generator/page.tsx` 的頁面頂部 header 區域加入 Next.js `<Link>` 指向 `/docs`
- [x] 2.2 確認連結樣式與現有 UI 一致（使用 Tailwind / shadcn/ui 按鈕或連結樣式）

## 3. 驗證

- [x] 3.1 本地啟動開發伺服器，確認 `/docs` 頁面可正常載入
- [x] 3.2 確認目錄錨點連結正常捲動至對應節
- [x] 3.3 確認 generator 頁面的文件連結可正常導向 `/docs`
- [x] 3.4 確認靜態匯出（`next build`）無錯誤
