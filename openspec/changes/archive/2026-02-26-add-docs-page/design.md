## Context

目前專案有 `/generator` 頁面（互動式 iframe src 產生器）和地圖主頁（`/`），但沒有任何說明頁面。新使用者首次接觸時必須自行閱讀原始碼或 README 才能了解支援的 URL 參數、標記格式、postMessage API 等功能。本次新增一個靜態文件頁 `/docs`，並在 generator 頁面加入連結入口。

## Goals / Non-Goals

**Goals:**
- 新增 `/docs` 路由，以分節方式說明所有主要功能
- 在 generator 頁面的 UI 加入明顯的「文件說明」連結
- 文件內容涵蓋：URL 參數、標記格式、postMessage API 指令、地圖控制項

**Non-Goals:**
- 不做互動式 API 沙盒或即時嘗試功能
- 不做多語言（中文即可）
- 不做版本管理或 changelog

## Decisions

**1. 使用 Next.js App Router 靜態頁面**
- 直接新增 `app/docs/page.tsx`，與現有架構一致
- 不引入 MDX 或 CMS，內容直接以 JSX 撰寫，減少依賴

**2. 文件頁使用錨點導航**
- 頁面頂部加入目錄，各節以 `id` 標記，支援 `#section` 直連
- 替代方案：多頁路由（`/docs/markers`、`/docs/api`）→ 過度設計，內容不多

**3. Generator 連結位置**
- 在 generator 頁面頂部 header 區域加入「文件說明」連結（Next.js `<Link>`）
- 視覺上使用按鈕樣式，確保新使用者容易發現

**4. 樣式沿用現有 Tailwind + shadcn/ui**
- 與 generator 頁面保持一致的視覺語言
- 不引入新的 CSS 框架

## Risks / Trade-offs

- **內容維護風險**：文件以硬編碼 JSX 撰寫，功能更新時需手動同步 → 接受此風險，規模小不值得引入 CMS
- **搜尋缺失**：純靜態頁不支援全文搜尋 → 可用瀏覽器 Ctrl+F，未來有需要再加
