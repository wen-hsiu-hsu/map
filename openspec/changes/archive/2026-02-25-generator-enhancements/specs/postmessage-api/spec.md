## ADDED Requirements

### Requirement: MAP_CLICK outbound 事件
地圖 SHALL 在使用者點擊空白地圖時向父視窗發送 MAP_CLICK 事件（詳見 map-click-event spec）。

#### Scenario: MAP_CLICK 格式
- **WHEN** 使用者點擊空白地圖
- **THEN** 地圖發送 `{ type: "MAP_CLICK", lat: number, lng: number }`，lat/lng 為點擊位置的精確座標
