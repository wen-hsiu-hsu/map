## Why

新使用者開啟 generator 頁面時，無法快速了解地圖有哪些功能（標記、URL 參數、postMessage API 等），需要一個簡易的說明頁，讓使用者能在幾分鐘內掌握主要功能。目前 README 內容存在但不在 UI 中呈現，這個頁面填補了使用者入門的缺口。

## What Changes

- 新增 `/docs` 路由頁面，以結構化方式列出所有主要功能說明
- 在 generator 頁面新增「文件說明」連結，引導使用者前往 `/docs`
- 文件頁面涵蓋：URL 參數、標記設定、postMessage API、地圖控制項等功能

## Capabilities

### New Capabilities
- `docs-page`: 靜態文件說明頁（`/docs`），以分節方式列出功能、參數與範例，支援錨點導航

### Modified Capabilities
- `iframe-src-generator`: 在 generator UI 中加入「查看文件」連結，指向 `/docs`

## Impact

- 新增 `app/docs/page.tsx`（新路由）
- 修改 `app/generator/page.tsx`（加入文件連結）
- 不影響地圖核心邏輯、API 或現有路由
