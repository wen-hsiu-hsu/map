## Context

專案是純靜態的 Next.js（output: 'export'）應用，部署於 Cloudflare Pages，無後端服務。Markers 透過 URL-safe Base64 編碼的 JSON 陣列傳遞給 iframe（`?markers=<base64>`）。測試頁（`public/test.html`）目前所有 postMessage 指令使用硬編碼固定資料，無法在不修改程式碼的情況下測試不同場景。

## Goals / Non-Goals

**Goals:**
- 提供靜態工具頁（`/generator`），讓外部開發者填入參數後即時產生可複製的 iframe `src` URL
- 測試頁所有 postMessage 指令（SET_MARKERS、FLY_TO、HIGHLIGHT、SET_OPTIONS）改為透過表單輸入，支援動態新增/移除 marker 列
- 不改動現有地圖核心邏輯與 URL 參數規格

**Non-Goals:**
- 不提供後端 API 端點（維持純靜態架構）
- 不改動 MarkerData interface 或 postMessage API 規格
- 不加入使用者驗證或資料持久化

## Decisions

### 1. Generator 以靜態 Next.js 頁面實作，不用 API Route

**決定**：`app/generator/page.tsx` 作為純前端工具頁，所有編碼邏輯在瀏覽器端執行。

**理由**：專案已設定 `output: 'export'`，API Routes 無法在靜態導出中使用。前端即可完成 Base64 編碼，無需伺服器。

**考慮過的替代方案**：
- 後端 API（被排除：需改變部署架構）
- 獨立 JS 函式庫（被排除：增加額外依賴管理成本）

### 2. Generator 頁使用即時預覽（reactive）不用送出按鈕

**決定**：使用者每次修改輸入欄位時即時更新 iframe src 預覽，不需按「產生」按鈕。

**理由**：減少互動步驟，讓開發者立即看到結果，提升效率。

### 3. 測試頁維持純 HTML，不改用 React

**決定**：`public/test.html` 維持純 HTML + Vanilla JS，僅擴充 UI 元件。

**理由**：測試頁不經過 Next.js 構建，保持簡單以利除錯。改用 React 需要額外的構建步驟。

### 4. Marker 列表使用動態 DOM 操作

**決定**：SET_MARKERS 表單支援「新增一列」/「移除」按鈕，每列包含 id、lat、lng、label、color 欄位。

**理由**：比預填固定數量的欄位更靈活，與實際使用場景一致。

## Risks / Trade-offs

- **Base64 URL 長度限制**：大量 marker（>500 個）產生的 URL 可能超過瀏覽器/伺服器 URL 長度上限（通常 ~8KB）。→ 在 generator UI 加入 marker 數量警示提示。
- **測試頁複雜度上升**：動態 DOM 操作讓 test.html 程式碼量增加。→ 保持函式小且有明確命名，適時加入行內註解。

## Migration Plan

1. 新增 `app/generator/page.tsx`（不影響現有頁面）
2. 修改 `public/test.html`（不影響地圖核心，僅改測試 UI）
3. 靜態導出後部署到 Cloudflare Pages，`/generator` 路由自動可用

無回滾風險，修改均為新增或 UI 層改動。
