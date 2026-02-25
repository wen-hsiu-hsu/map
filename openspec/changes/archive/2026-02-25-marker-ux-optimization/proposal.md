## Why

當地圖縮小時，多個標記的 label 會互相疊蓋，高亮（highlight）中的標記 label 也可能被其他標記蓋住，嚴重影響可讀性。同時，預設標記顏色目前寫死在程式碼中，無法透過 URL 參數客製化。

## What Changes

- **Label 顯示邏輯調整**：有 highlight 時，只有 active 標記永遠顯示 label；其他標記的 label 僅在 hover 時顯示
- **圓點透明度**：非 active 標記圓點在 highlight 模式下降低透明度（0.3），使 active 標記更突出
- **Label 樣式重設計**：從文字陰影改為 frosted glass card（白底卡片 + 細線指向圓點），排列改為 label 在上、線條、圓點在下
- **Hover z-index 提升**：hover 的標記 label 永遠顯示於其他 label 之上
- **新增 `markerColor` URL 參數**：設定全域預設標記顏色，優先順序為個別 marker color > markerColor URL param > 系統預設 #22c55e

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `markers`：Label 顯示行為變更（highlight 模式下隱藏非 active label）、dot opacity、label 樣式
- `url-params`：新增 `markerColor` 參數

## Impact

- `components/GlobeMap.tsx`：MarkerElement 組件重構
- `components/ui/map.tsx`：MarkerContent overflow 設定
- `lib/parseUrlParams.ts`：新增 markerColor 欄位
