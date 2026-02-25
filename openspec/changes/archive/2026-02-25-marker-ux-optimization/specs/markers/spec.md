## MODIFIED Requirements

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

## ADDED Requirements

### Requirement: Label Callout 樣式
標記的 label SHALL 以白底卡片（callout）形式顯示於圓點正上方，並以細垂直線連接卡片與圓點，強調 label 與地理位置的對應關係。

#### Scenario: Label 卡片顯示
- **WHEN** 標記 label 顯示
- **THEN** label 以白底圓角卡片形式呈現，卡片下方有細線指向圓點
