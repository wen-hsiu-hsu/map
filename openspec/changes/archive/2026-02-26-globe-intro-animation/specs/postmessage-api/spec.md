## ADDED Requirements

### Requirement: PLAY_INTRO inbound 訊息
地圖 SHALL 接受 `{ type: 'PLAY_INTRO' }` inbound postMessage，重新播放 intro 動畫（不論 intro URL 參數是否啟用）。

#### Scenario: 收到 PLAY_INTRO 後播放動畫
- **WHEN** 外部網站發送 `{ type: 'PLAY_INTRO' }`
- **THEN** 地圖重播 intro 動畫並在結束後重新發送 READY

## MODIFIED Requirements

### Requirement: READY 事件
地圖 SHALL 在 MapLibre 地圖載入完成後向父視窗發送 `READY` 事件。intro 啟用時，SHALL 在動畫完成後才發送；intro 未啟用時，行為與現有一致（MapLibre load 後立即發送）。外部網站 SHALL 等收到此事件後才開始傳送指令。

#### Scenario: 地圖載入完成通知
- **WHEN** MapLibre 地圖完成初始載入且未啟用 intro
- **THEN** 地圖向 `window.parent` 發送 `{ type: "READY" }` postMessage

#### Scenario: 有 intro 時 READY 延後至動畫結束
- **WHEN** intro 啟用，MapLibre 地圖完成載入並播放動畫
- **THEN** 地圖在動畫完成後才發送 `{ type: "READY" }`

#### Scenario: 地圖載入完成通知（PLAY_INTRO 重播）
- **WHEN** 外部網站發送 PLAY_INTRO 且動畫完成
- **THEN** 地圖再次向 `window.parent` 發送 `{ type: "READY" }`
