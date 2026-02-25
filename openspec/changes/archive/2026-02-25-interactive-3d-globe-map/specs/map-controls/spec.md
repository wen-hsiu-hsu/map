## ADDED Requirements

### Requirement: 飛行動畫（Fly To）
地圖 SHALL 接收經緯度座標，以平滑動畫旋轉飛行至目標位置。可選指定目標 zoom 等級；未指定時 SHALL 維持當前 zoom。連續快速觸發時，SHALL 中斷上一個動畫直接飛往新目標。

#### Scenario: 飛行到指定位置
- **WHEN** 收到 FLY_TO 指令（lat、lng）
- **THEN** 地球以平滑動畫旋轉飛行至目標座標

#### Scenario: 飛行並指定 zoom
- **WHEN** 收到 FLY_TO 指令，包含 zoom 欄位
- **THEN** 飛行結束後地圖縮放至指定 zoom 等級

#### Scenario: 連續快速飛行
- **WHEN** 前一個飛行動畫尚未結束，收到新的 FLY_TO 指令
- **THEN** 立即中斷前一個動畫，直接開始飛往新目標

### Requirement: 縮放變化事件
地圖 SHALL 在縮放操作結束後（`zoomend`）發送 ZOOM_CHANGE 事件，包含當前 zoom 值。每次縮放結束觸發一次，不在縮放過程中連續觸發。

#### Scenario: 縮放結束觸發事件
- **WHEN** 使用者完成縮放操作（滾輪、手勢、按鈕）
- **THEN** 地圖發送 ZOOM_CHANGE postMessage，包含最終 zoom 值

#### Scenario: 飛行結束觸發縮放事件
- **WHEN** FLY_TO 動畫完成，zoom 等級有變化
- **THEN** 地圖發送 ZOOM_CHANGE postMessage

### Requirement: 地圖設定更新
地圖 SHALL 支援動態更新 center 與 zoom，無動畫直接跳轉。

#### Scenario: 更新 center 與 zoom
- **WHEN** 收到 SET_OPTIONS 指令，包含 center 與 zoom
- **THEN** 地圖立即跳轉至指定位置與縮放等級

#### Scenario: 部分更新
- **WHEN** 收到 SET_OPTIONS 指令，只包含 zoom（無 center）
- **THEN** 地圖更新 zoom 等級，center 維持不變
