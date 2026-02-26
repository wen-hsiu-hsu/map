## Purpose

定義地圖 iframe 的開場動畫行為：白色 overlay 消除初始空白期，以及可選的地球旋轉縮近進場動畫。

## Requirements

### Requirement: 白色 overlay 消除初始空白畫面
地圖 SHALL 在初始化期間顯示白色全屏 overlay，覆蓋 MapLibre 載入前的空白期。overlay 與地圖 canvas SHALL 在地圖 ready 時以 0.3s CSS opacity transition 同步淡出/淡入。

#### Scenario: 頁面載入即顯示 overlay
- **WHEN** iframe 頁面開始載入
- **THEN** 立即顯示白色全屏 overlay，不出現空白白屏閃爍

#### Scenario: 無 intro 時 overlay 淡出
- **WHEN** MapLibre 地圖載入完成且未啟用 intro
- **THEN** overlay 以 0.3s 淡出，地圖 canvas 同時淡入，發送 READY

#### Scenario: 有 intro 時地圖淡入後才執行動畫
- **WHEN** intro 啟用，MapLibre 地圖載入完成
- **THEN** overlay 淡出、地圖 canvas 淡入（0.3s），完成後才開始 intro 動畫

### Requirement: 地球進場動畫（intro）
地圖 SHALL 支援可選的開場動畫：從 zoom=1 的偏移起始位置，以 requestAnimationFrame 逐幀插值旋轉並縮近至目標 center 與 zoom。多圈旋轉（introRotate ≥ 360）與反向旋轉（負數）均支援。

#### Scenario: 動畫從偏移位置縮近至目標
- **WHEN** intro 啟用，地圖 ready
- **THEN** 地圖從 zoom=1、center=[targetLng - introRotate, 0] 開始，rAF 插值至目標 center 與 zoom

#### Scenario: 動畫結束後發送 READY
- **WHEN** intro 動畫完成
- **THEN** 地圖發送 READY postMessage

#### Scenario: 無 intro 時 READY 時機不變
- **WHEN** 未啟用 intro
- **THEN** 地圖在 MapLibre load 完成後立即發送 READY（現有行為不變）

### Requirement: intro 可透過 PLAY_INTRO postMessage 重播
地圖 SHALL 接受 `{ type: 'PLAY_INTRO' }` inbound 訊息，重新播放完整 intro 動畫序列（overlay 淡入 → 等待淡入完成 → 動畫 → READY）。

#### Scenario: 重播 intro 動畫
- **WHEN** 外部網站在地圖已載入後發送 `{ type: 'PLAY_INTRO' }`
- **THEN** overlay 淡入，等待 0.4s 後相機重置至起始位置，動畫至目標，完成後發送 READY

### Requirement: introDuration 控制動畫時長
地圖 SHALL 支援 `introDuration` URL 參數（毫秒，預設 3000）控制 intro 動畫時長。

#### Scenario: 自訂動畫時長
- **WHEN** URL 含 `?intro=true&introDuration=5000`
- **THEN** intro 動畫持續 5 秒

#### Scenario: 使用預設時長
- **WHEN** URL 含 `?intro=true` 但未指定 introDuration
- **THEN** intro 動畫持續 3 秒（預設值）

### Requirement: introRotate 控制起始偏移角度
地圖 SHALL 支援 `introRotate` URL 參數（度數，預設 90）控制動畫起始點相對於目標 longitude 的偏移量。正數為旋轉方向，負數為反向，360 的倍數代表完整圈數。

#### Scenario: 自訂起始偏移角度
- **WHEN** URL 含 `?intro=true&introRotate=120`
- **THEN** 動畫從 center=[targetLng - 120, 0], zoom=1 開始

#### Scenario: 多圈旋轉
- **WHEN** URL 含 `?intro=true&introRotate=720`
- **THEN** 地球旋轉兩整圈後停在目標位置

#### Scenario: 使用預設偏移角度
- **WHEN** URL 含 `?intro=true` 但未指定 introRotate
- **THEN** 動畫從 center=[targetLng - 90, 0] 開始
