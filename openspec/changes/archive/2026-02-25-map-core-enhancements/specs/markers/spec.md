## ADDED Requirements

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
