## ADDED Requirements

### Requirement: center 支援 marker id 參照
地圖 SHALL 支援在 URL params 與 SET_OPTIONS 中使用 `marker:<id>` 語法將 center 設定為指定 marker 的座標。

#### Scenario: URL params center 指向 marker id
- **WHEN** iframe src 包含 `?center=marker:taipei-101&markers=<base64>` 且 markers 陣列包含 id 為 `taipei-101` 的 marker
- **THEN** 地圖以該 marker 的座標作為初始中心，在 markers 初始化完成後套用

#### Scenario: marker id 不存在時 fallback
- **WHEN** `center=marker:nonexistent`，markers 陣列中無對應 id
- **THEN** 地圖使用預設 center `[0, 20]` 初始化，不發送 ERROR

#### Scenario: SET_OPTIONS center 指向 marker id
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", center: { markerId: "taipei-101" } }`，當前地圖有對應 marker
- **THEN** 地圖跳轉至該 marker 座標

#### Scenario: SET_OPTIONS center marker id 不存在時 fallback
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", center: { markerId: "ghost" } }`，當前地圖無對應 marker
- **THEN** 地圖不執行任何跳轉，不發送 ERROR

### Requirement: 地圖互動鎖定（interactive）
地圖 SHALL 支援透過 SET_OPTIONS 停用所有使用者手勢操作（拖移、滾輪縮放、雙擊縮放、觸控縮放、鍵盤控制）。停用後，地圖仍可透過 postMessage 指令控制視角。

#### Scenario: 停用互動
- **WHEN** 外部網站發送 `{ type: "SET_OPTIONS", interactive: false }`
- **THEN** 使用者無法拖移地圖、滾輪縮放、雙擊縮放或觸控操作

#### Scenario: 重新啟用互動
- **WHEN** 外部網站先發送 `{ type: "SET_OPTIONS", interactive: false }`，再發送 `{ type: "SET_OPTIONS", interactive: true }`
- **THEN** 使用者可再次自由操作地圖

#### Scenario: postMessage 在 interactive: false 時仍正常運作
- **WHEN** `interactive: false` 狀態下，外部網站發送 FLY_TO 指令
- **THEN** 地圖正常執行飛行動畫
