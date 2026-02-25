## Context

地圖使用 MapLibre GL + React DOM marker 渲染標記（≤50 個），每個 MarkerElement 是獨立的 React 組件，透過 `createPortal` 掛載到 MapLibre 的 marker DOM element。

目前 label 永遠顯示，當縮小地圖時多個 label 重疊難以閱讀。高亮功能使用 `activeMarkerId` state 控制，但未限制其他標記的 label 可見性。

## Goals / Non-Goals

**Goals:**
- highlight 模式下只顯示 active marker 的 label，其他 hover 才顯示
- 非 active 圓點在 highlight 模式下視覺弱化
- hover 的 marker z-index 高於其他 marker
- label 改為 callout 卡片樣式（白底 + 連接線）
- `markerColor` URL 參數設定全域預設顏色

**Non-Goals:**
- 叢集模式（>50 markers）的 label 優化
- label 碰撞偵測（collision detection）
- label 位置自動調整

## Decisions

### 1. Label 可見性用 `visibility` + `opacity` 而非條件渲染

**Decision**: 使用 `visibility: hidden` + `opacity: 0` 保留 DOM 空間，而非 `{showLabel && <div>}`。

**Rationale**: 條件渲染會在 label 顯示/隱藏時導致標記高度改變，造成地圖上的位置跳動。保留空間確保圓點位置穩定。

### 2. Hover z-index 透過操作 MapLibre marker DOM element

**Decision**: 在 `onMouseEnter/Leave` 中使用 `closest('.maplibregl-marker')` 找到 MapLibre marker element，直接設定 `zIndex`。

**Rationale**: `MarkerElement` 是透過 portal 渲染，設定自身的 z-index 無效（受 stacking context 限制）。需要直接操控 MapLibre 管理的頂層 DOM element。

### 3. `markerColor` 透過 URL params 傳遞，不支援 postMessage 動態更新

**Decision**: `markerColor` 僅作為 URL 參數，只在初始化時讀取。

**Rationale**: 與其他 URL-only 參數（center、zoom）保持一致。動態顏色需求可透過個別 marker 的 `color` 欄位處理。

### 4. MapLibre marker element 的 `overflow` 設為 `visible`

**Decision**: 在 `MarkerContent` 中設定 `marker.getElement().style.overflow = 'visible'`。

**Rationale**: MapLibre 預設 marker element 有 `overflow: hidden`，會截掉 label 卡片（因為卡片比圓點大）。

## Risks / Trade-offs

- **Label 空白佔位**：無 highlight 時所有 label 都顯示，使用 `visibility: hidden` 方案在無 highlight 模式下不會有額外佔位問題；但在 highlight 模式下隱藏的 label 仍佔空間，可能影響點擊區域 → 可接受，點擊區域大反而有助觸控操作

- **MapLibre DOM 直接操作**：`closest('.maplibregl-marker')` 依賴 MapLibre 的 class 名稱，若 MapLibre 版本變更 class 名稱則失效 → 低風險，MapLibre 該 class 已穩定多版本

## Migration Plan

無需 migration，為純 UI 行為變更，不影響 postMessage API 或 URL params 格式（`markerColor` 為新增選填參數）。
