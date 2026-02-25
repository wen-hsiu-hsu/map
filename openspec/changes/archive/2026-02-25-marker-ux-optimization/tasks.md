## 1. MarkerElement 重構

- [x] 1.1 新增 `hasActiveMarker` prop，控制 highlight 模式下 label 顯示邏輯
- [x] 1.2 加入 `isHovered` state，hover 時顯示 label
- [x] 1.3 非 active 圓點透明度降低至 0.3（含 transition）
- [x] 1.4 Label 改為白底卡片 + 細線 callout 樣式，排列為 label → 線 → 圓點

## 2. Hover z-index 提升

- [x] 2.1 加入 `containerRef`，hover 時 `closest('.maplibregl-marker')` 設定 `zIndex: 1000`
- [x] 2.2 hover 離開時清除 zIndex

## 3. MapMarker anchor 調整

- [x] 3.1 `anchor` 從 `"top"` 改為 `"bottom"`，確保圓點對齊地圖座標

## 4. MarkerContent overflow 修正

- [x] 4.1 在 `MarkerContent` 設定 `marker.getElement().style.overflow = 'visible'`，避免 label 卡片被截掉

## 5. markerColor URL 參數

- [x] 5.1 `UrlParams` interface 新增 `markerColor?: string`
- [x] 5.2 `parseUrlParams` 解析 `markerColor` query param
- [x] 5.3 `MarkerElementProps` 新增 `defaultColor` prop
- [x] 5.4 `MapEventsProps` 新增 `defaultMarkerColor` prop，從 `urlParams.markerColor` 讀取並傳入
- [x] 5.5 `MarkerElement` 使用 `marker.color || defaultColor` 作為圓點顏色
