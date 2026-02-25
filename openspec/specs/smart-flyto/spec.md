# smart-flyto Specification

## Purpose
TBD - created by archiving change map-core-enhancements. Update Purpose after archive.
## Requirements
### Requirement: 智慧飛行策略（Smart Flyto）
地圖 SHALL 在執行飛行動畫前判斷起終點距離。若未設定門檻（`smartFlyThreshold` 未指定），SHALL 永遠執行智慧飛行策略；若已設定且起終點 geodesic 距離超過門檻（km），SHALL 執行三段飛行序列：zoom out 至能容納兩點的視野 → flyto 至目標 → zoom in 至落點 zoom。

#### Scenario: 未設定門檻時永遠執行智慧飛行
- **WHEN** `smartFlyThreshold` 未設定，且觸發 FLY_TO
- **THEN** 地圖執行智慧三段飛行序列（zoom out → flyto → zoom in）

#### Scenario: 距離超過門檻時執行智慧飛行
- **WHEN** `smartFlyThreshold` 設定為 1000，起終點 geodesic 距離為 2000km，觸發 FLY_TO
- **THEN** 地圖執行三段飛行序列

#### Scenario: 距離未超過門檻時直接飛行
- **WHEN** `smartFlyThreshold` 設定為 1000，起終點距離為 300km，觸發 FLY_TO
- **THEN** 地圖直接 flyTo 至目標，不執行 zoom out/in 過渡

#### Scenario: Zoom out 視野容納兩點
- **WHEN** 智慧飛行第一段動畫
- **THEN** 地圖縮放至能同時看到起點與終點的 zoom 層級（使用 cameraForBounds 計算，含安全 buffer）

### Requirement: FLY_START 事件
地圖 SHALL 在飛行動畫開始時向父視窗發送 `FLY_START` 事件。

#### Scenario: FLY_TO 觸發 FLY_START
- **WHEN** 地圖開始執行 FLY_TO 飛行動畫
- **THEN** 地圖發送 `{ type: "FLY_START", lat: number, lng: number }`

#### Scenario: onMarkerClick 觸發 FLY_START
- **WHEN** `onMarkerClick` 設定為 `flyto+highlight`，使用者點擊標記
- **THEN** 地圖發送 `{ type: "FLY_START", lat: number, lng: number }`

### Requirement: FLY_END 事件
地圖 SHALL 在飛行動畫完全結束後向父視窗發送 `FLY_END` 事件。智慧飛行三段序列完成後才發送（不在中間 zoom out 結束時發送）。

#### Scenario: 一般飛行 FLY_END
- **WHEN** FLY_TO 飛行動畫結束（map moveend 觸發）
- **THEN** 地圖發送 `{ type: "FLY_END", lat: number, lng: number }`

#### Scenario: 智慧飛行三段完成後 FLY_END
- **WHEN** 智慧飛行第三段（zoom in）動畫結束
- **THEN** 地圖發送 `{ type: "FLY_END", lat: number, lng: number }`，中間過渡不發送

### Requirement: 全域 flyToZoom 設定
地圖 SHALL 支援透過 SET_OPTIONS 設定全域 `flyToZoom`，作為所有 flyto 動畫的落點 zoom 預設值。落點 zoom 優先序 SHALL 為：`FLY_TO msg.zoom` → marker 個別 `flyToZoom` → 全域 `flyToZoom` → 系統預設值（10）。

#### Scenario: 全域 flyToZoom 套用
- **WHEN** 全域 `flyToZoom` 設定為 12，觸發 FLY_TO 未帶 zoom 參數，目標 marker 無個別 flyToZoom
- **THEN** 飛行落點 zoom 為 12

#### Scenario: marker 個別 flyToZoom 優先於全域
- **WHEN** 全域 `flyToZoom` 為 12，目標 marker 的 `flyToZoom` 為 15
- **THEN** 飛行落點 zoom 為 15

#### Scenario: msg.zoom 優先於所有設定
- **WHEN** FLY_TO 訊息帶有 `zoom: 8`，全域 flyToZoom 為 12
- **THEN** 飛行落點 zoom 為 8

### Requirement: 全域 smartFlyThreshold 設定
地圖 SHALL 支援透過 SET_OPTIONS 設定 `smartFlyThreshold`（km 單位）。未設定時永遠執行智慧飛行策略。

#### Scenario: 設定門檻
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", smartFlyThreshold: 500 }`
- **THEN** 後續 FLY_TO 使用 500km 作為智慧飛行門檻

