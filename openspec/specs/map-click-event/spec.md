# map-click-event Specification

## Purpose
TBD - created by archiving change generator-enhancements. Update Purpose after archive.
## Requirements
### Requirement: MAP_CLICK 事件
使用者點擊地圖空白處（非 marker）時，地圖 SHALL 向父視窗發送 `MAP_CLICK` 事件，包含點擊位置的經緯度。點擊 marker 時 SHALL NOT 發送 MAP_CLICK（僅發送 MARKER_CLICK）。

#### Scenario: 點擊空白地圖發送 MAP_CLICK
- **WHEN** 使用者點擊地圖上沒有 marker 的位置
- **THEN** 地圖發送 `{ type: "MAP_CLICK", lat: number, lng: number }` 給父視窗

#### Scenario: 點擊 marker 不發送 MAP_CLICK
- **WHEN** 使用者點擊地圖上的 marker
- **THEN** 地圖發送 MARKER_CLICK 事件，不發送 MAP_CLICK 事件

