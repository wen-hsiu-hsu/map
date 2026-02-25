## Why

目前地圖核心缺乏幾個重要的互動能力：center 只能填入固定座標（無法參照 marker）、marker 點擊行為完全依賴外部網站介入、flyto 在跨洲距離時視覺體驗不佳。這些缺陷使嵌入地圖在常見情境下需要大量外部協調才能達到良好體驗。

## What Changes

- **center 支援 marker id 參照**：`center` 欄位可填入 `marker:<id>`，地圖在 markers 初始化完成後以該 marker 的座標作為初始中心
- **onMarkerClick 行為設定**：新增全域選項控制 marker 點擊後是否由地圖內部自動執行 flyto + highlight，或僅發送事件給外部
- **智慧 flyto（smart flyto）**：FLY_TO 觸發時，若起終點距離超過門檻，自動執行 zoom out → flyto → zoom in 序列，提供跨洲飛行的視覺引導
- **marker 個別 flyToZoom**：每個 marker 可指定 `flyToZoom`，flyto 到該 marker 時使用此值作為落點 zoom 層級
- **interactive 鎖定**：SET_OPTIONS 支援 `interactive: false`，停用所有使用者手勢（縮放、拖移）
- **FLY_START / FLY_END 事件**：flyto 動畫開始與結束時向父視窗發送事件，供外部同步 UI 狀態

## Capabilities

### New Capabilities

- `smart-flyto`: 智慧飛行策略——距離門檻判斷、zoom out/in 動畫序列、FLY_START/FLY_END 事件

### Modified Capabilities

- `map-core`: 新增 center 支援 marker id 參照、interactive 鎖定選項
- `markers`: 新增 marker 個別 `flyToZoom` 欄位
- `postmessage-api`: 新增 onMarkerClick 選項於 SET_OPTIONS、新增 FLY_START/FLY_END 事件、FLY_TO 行為擴充（smart flyto）

## Impact

- `components/Map.tsx`（或同等地圖主元件）：初始化序列調整、smart flyto 邏輯、onMarkerClick 行為、interactive 選項
- `lib/markers.ts`（或同等 marker 管理模組）：新增 `flyToZoom` 欄位支援
- postMessage handler：SET_OPTIONS 新增欄位、新增 FLY_START/FLY_END dispatch
- URL params 解析：center 新增 `marker:<id>` 格式解析
