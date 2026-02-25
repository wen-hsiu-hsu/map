## Purpose

定義地圖標記的放置、樣式、高亮、聚合與點擊事件行為。
## Requirements
### Requirement: 標記放置
地圖 SHALL 支援同時顯示多個標記。每個標記 SHALL 包含 `id`（唯一識別碼）、`lat`、`lng`（經緯度）、`label`（地點名稱）、`color`（可選 CSS 色號）。`color` 未指定時 SHALL 使用預設綠色。

#### Scenario: 放置單一標記
- **WHEN** 傳入包含一個標記的 markers 陣列
- **THEN** 地圖在對應經緯度顯示帶有 label 的標記圓點

#### Scenario: 放置多個標記
- **WHEN** 傳入包含多個標記的 markers 陣列
- **THEN** 地圖同時顯示所有標記，各自使用指定顏色

#### Scenario: 未指定顏色
- **WHEN** 標記的 `color` 欄位未傳入
- **THEN** 標記使用預設綠色顯示

### Requirement: Label 永遠顯示
每個標記的 `label` 文字顯示行為 SHALL 依據目前是否有 active（highlight）標記而不同：
- 無 active 標記時：所有標記的 label SHALL 顯示
- 有 active 標記時：只有 active 標記的 label SHALL 永遠顯示；其他標記的 label SHALL 僅在 hover 時顯示，且 hover 離開後隱藏

Label 的存在 SHALL 不影響圓點在地圖上的定位（使用 visibility: hidden 保留空間）。

#### Scenario: 無 highlight 時所有 label 顯示
- **WHEN** 無任何標記處於 active 狀態
- **THEN** 所有標記的 label 均顯示

#### Scenario: Highlight 模式只顯示 active label
- **WHEN** 某標記被設為 active
- **THEN** 只有該 active 標記的 label 永遠顯示，其他標記 label 隱藏

#### Scenario: Hover 顯示非 active 標記 label
- **WHEN** 有 active 標記存在，使用者 hover 到非 active 標記
- **THEN** 該被 hover 標記的 label 顯示

#### Scenario: Hover 離開後隱藏 label
- **WHEN** 使用者 hover 離開非 active 標記
- **THEN** 該標記的 label 重新隱藏

### Requirement: 標記高亮（Highlight）
地圖 SHALL 支援將指定標記切換為 active 狀態，以光暈效果與其他標記視覺區分。同一時間只有一個標記可為 active 狀態。非 active 標記的圓點 SHALL 在 highlight 模式下降低透明度以突顯 active 標記。Hover 中的標記 label SHALL 顯示於所有其他標記 label 之上。

#### Scenario: 高亮指定標記
- **WHEN** 指定某個標記 id 為 active
- **THEN** 該標記顯示光暈效果，其他標記恢復一般狀態

#### Scenario: 切換高亮目標
- **WHEN** 已有一個 active 標記，再次指定不同標記為 active
- **THEN** 新標記顯示光暈，前一個標記光暈消失

#### Scenario: 非 active 標記圓點透明度降低
- **WHEN** 某標記被設為 active
- **THEN** 非 active 標記的圓點透明度降低，視覺上退至背景

#### Scenario: Hover 標記 label 置頂
- **WHEN** 使用者 hover 到任一標記
- **THEN** 該標記的 label 顯示於所有其他標記 label 之上

### Requirement: 標記替換
呼叫 SET_MARKERS 時 SHALL 取代地圖上所有既有標記，包括清除先前的 active 狀態。

#### Scenario: 取代現有標記
- **WHEN** 地圖已有標記，再次呼叫 SET_MARKERS
- **THEN** 舊標記全部移除，新標記全部顯示

### Requirement: 標記聚合（Clustering）
當多個標記在視覺上相近時，地圖 SHALL 自動將其聚合為帶數字的圓圈。Cluster 圓圈 SHALL 使用固定預設綠色，不隨內部標記顏色變化。縮放放大後 cluster SHALL 逐步展開為個別標記。

#### Scenario: 標記自動聚合
- **WHEN** 多個標記在目前縮放層級下視覺重疊
- **THEN** 相近標記合併為帶數字的 cluster 圓圈，數字顯示聚合數量

#### Scenario: 縮放展開 cluster
- **WHEN** 使用者放大縮放至 cluster 所在區域
- **THEN** cluster 逐步展開，最終顯示個別標記

### Requirement: 標記點擊事件
使用者點擊標記時，地圖 SHALL 發送 MARKER_CLICK 事件給外部網站，包含標記的 `id`、`lat`、`lng`。

#### Scenario: 點擊標記
- **WHEN** 使用者點擊地圖上的標記
- **THEN** 地圖發送 MARKER_CLICK postMessage，包含對應標記的 id 與座標

### Requirement: 標記個別 flyToZoom
每個標記 SHALL 支援選用欄位 `flyToZoom`（數字），指定飛行至該標記時的落點 zoom 層級。未指定時使用全域 flyToZoom 或系統預設值。此欄位 SHALL 在 SET_MARKERS、URL params markers 陣列中均可使用。

#### Scenario: marker flyToZoom 在 onMarkerClick 模式下套用
- **WHEN** `onMarkerClick` 設定為 `flyto+highlight`，使用者點擊 `flyToZoom: 15` 的標記
- **THEN** 飛行落點 zoom 為 15

#### Scenario: marker flyToZoom 未指定時使用全域設定
- **WHEN** marker 無 `flyToZoom` 欄位，全域 `flyToZoom` 為 12
- **THEN** 飛行落點 zoom 為 12

#### Scenario: SET_MARKERS 傳入 flyToZoom
- **WHEN** 外部網站發送 `{ type: "SET_MARKERS", markers: [{ id: "a", lat: 25, lng: 121, flyToZoom: 14 }] }`
- **THEN** 地圖儲存該標記的 flyToZoom 值，供後續飛行時使用

### Requirement: Label Callout 樣式
標記的 label SHALL 以白底卡片（callout）形式顯示於圓點正上方，並以細垂直線連接卡片與圓點，強調 label 與地理位置的對應關係。

#### Scenario: Label 卡片顯示
- **WHEN** 標記 label 顯示
- **THEN** label 以白底圓角卡片形式呈現，卡片下方有細線指向圓點

