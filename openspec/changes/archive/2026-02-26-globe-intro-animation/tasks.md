## 1. 型別與 URL 參數

- [x] 1.1 在 `lib/parseUrlParams.ts` 的 `UrlParams` 介面新增 `intro?: boolean`、`introDuration?: number`、`introRotate?: number`
- [x] 1.2 在 `parseUrlParams()` 中解析 `?intro`、`?introDuration`、`?introRotate` 參數
- [x] 1.3 在 `lib/postMessageTypes.ts` 的 `InboundMessage` union 新增 `{ type: 'PLAY_INTRO' }`

## 2. intro 動畫核心邏輯

- [x] 2.1 在 `GlobeMap.tsx` 新增 `showOverlay` state（初始為 `true`），並在 map ready 時（無 intro）或動畫開始時設為 `false`
- [x] 2.2 在 JSX 最外層 div 內新增白色全屏 overlay div，以 CSS opacity transition（400ms）實作淡出效果
- [x] 2.3 實作 `playIntro(map, targetCenter, targetZoom, options)` 函式：設定起始相機位置（zoom=1, center=[targetLng - introRotate, targetLat=0]）、觸發 `map.easeTo()`、在 `moveend` 回調中發送 READY
- [x] 2.4 在 `onMapReady` 中：若 `intro=true`，呼叫 `playIntro` 取代 `jumpTo`，並延遲 READY 的發送

## 3. PLAY_INTRO postMessage 支援

- [x] 3.1 在 `handleMessage` 的 switch 新增 `PLAY_INTRO` case，呼叫 `playIntro` 重播動畫
- [x] 3.2 確認重播時 overlay 重新淡入再淡出（showOverlay 先設 true 再讓動畫開始後設 false）

## 4. 驗證

- [ ] 4.1 手動測試：無 intro 時行為與現有一致（overlay 淡出、READY 正常發送）
- [ ] 4.2 手動測試：`?intro=true` 播放動畫、overlay 同步淡出、動畫結束後 READY
- [ ] 4.3 手動測試：`?intro=true&introDuration=5000&introRotate=120` 參數正確套用
- [ ] 4.4 手動測試：postMessage `{ type: 'PLAY_INTRO' }` 重播動畫並重新發送 READY
