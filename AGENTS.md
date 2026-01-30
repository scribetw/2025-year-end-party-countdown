# AGENTS.md - 計時器系統文檔

## 專案概述

這是一個 Single Page Application (SPA)，專為投影設備設計的倒數計時器系統，整合計分板功能。

**技術棧：** 純 HTML/CSS/JavaScript（無外部依賴庫）

**設計風格：** 白底黑字，適合投影設備使用

---

## 檔案結構

```
├── index.html      # 主要 HTML 結構
├── style.css       # 所有樣式定義
├── script.js       # JavaScript 邏輯
├── LICENSE         # MIT License
├── README.md       # Readme
└── AGENTS.md       # 本文檔
```

---

## 核心功能模組

### 1. 倒數計時器系統

#### 三個畫面狀態
- **開始畫面 (`#startScreen`)**: 大型圓形開始按鈕（250px，白底黑字黑邊框）
- **計時畫面 (`#timerScreen`)**: 顯示圓形進度條與倒數數字
- **結束畫面 (`#endScreen`)**: 顯示大型 "STOP" 文字

#### 計時器特性
- **倒數時長**: 15 秒（可在 `script.js` 的 `duration` 變數修改）
- **更新頻率**: 每 50 毫秒更新一次
- **進度視覺化**: SVG 圓形進度條，順時針填滿
  - SVG 尺寸: 80vh x 80vh
  - 圓形半徑: 155（viewBox 200x200，留邊距防止發光效果被裁切）
  - 圓周長計算: `2 * π * 155`

#### 緊張效果（最後 5 秒）
當倒數 ≤ 5 秒時，自動觸發：
- 倒數數字變紅色 (#ff4757) 並脈動放大
- 進度圓圈變紅色並發光閃爍
- 背景圓圈改為半透明紅色
- CSS 類別: `.timer-container.urgent`
- 動畫: `@keyframes pulse` 和 `@keyframes glow`

#### 右上角取消按鈕
- 位置: `top: 4vh, right: 4vh`
- 功能: 強制中斷計時，返回開始畫面
- 樣式: 半透明低調設計，hover 時變明顯

### 2. 計分板系統

#### 基本資訊
- **位置**: 固定底部，預設收起
- **觸發**: 右下角「計分板」按鈕
- **桌次**: 三桌（第一桌、第二桌、第三桌）
- **計分方式**: 點擊 Set 按鈕，透過 Modal 選擇重複數量 (0-4)
- **分數計算**: 每輪得分 = 5 - 選擇的重複數量

#### 排版布局
- **橫向三欄布局**: 每桌獨立卡片
- **每欄垂直排列**（由上而下）:
  1. 桌次名稱
  2. 分數顯示
  3. Set 按鈕

#### Modal 互動流程
1. 點擊任一桌的 **Set 按鈕** → 彈出 Modal
2. Modal 顯示內容：
   - 第一行：桌次名稱（如「第一桌」）
   - 第二行：提示文字「幾個重複?」
   - 第三行：五個數字按鈕 (0, 1, 2, 3, 4)
   - 右上角：關閉按鈕 (×)
3. 選擇數字 → Modal 關閉，分數更新

#### 臨時計分機制
- **設計理念**: 避免誤操作，關閉計分板前都可修改
- **雙層分數系統**:
  - `scores`: 正式累計分數（關閉計分板時提交）
  - `tempScores`: 臨時分數（開啟計分板時清空）
- **操作流程**:
  1. 打開計分板 → `tempScores` 清空
  2. 選擇分數 → 只更新 `tempScores`（可重複修改同一桌）
  3. 關閉計分板 → `tempScores` 提交到 `scores`
- **顯示邏輯**: 畫面顯示 `scores + tempScores`
- **修正機制**: 關閉前可重新點擊 Set 修改選擇

#### 資料持久性
- 分數保存在內存 (`scores` 和 `tempScores` 物件)
- 刷新頁面後歸零
- 每輪倒數計時獨立計分

#### 集中式狀態管理
- **統一函數**: `toggleScorePanel(forceState)`
  - `forceState = true`: 強制打開（自動清空 tempScores）
  - `forceState = false`: 強制關閉（自動提交 tempScores）
  - `forceState = undefined`: 切換狀態
- **所有開關點**:
  1. 按下 START 按鈕 → 強制關閉並提交
  2. 點擊計分板按鈕/叉叉 → 切換狀態
  3. 點擊外部區域 → 強制關閉並提交
  4. 計時結束 → 強制打開並清空

#### UX 優化
1. **按下開始自動收起並提交**: 避免干擾計時，分數正式記錄
2. **計時結束自動彈開**: END 畫面顯示 0.3 秒後彈開，方便記分
3. **點擊外部區域收起並提交**: 點擊計分板/Modal 外任何地方自動關閉
4. **可重複修改**: 選錯數字時，關閉前可重新選擇
5. **Modal 外部點擊關閉**: 點擊 Modal 背景或叉叉取消操作

---

## 關鍵 CSS 類別與 ID

### 畫面切換
- `.screen`: 基礎畫面容器
- `.screen.active`: 當前顯示的畫面

### 計時器相關
- `.timer-container`: 計時器主容器
- `.progress-ring`: SVG 容器（rotate -90deg 讓起點在頂部）
- `.progress-ring-circle`: 進度圓圈（黑色 #333333，緊張時變紅）
- `.progress-ring-circle-bg`: 背景圓圈（淡灰色 rgba(0,0,0,0.1)）
- `.countdown-text`: 倒數數字（font-size: 20vh）
- `.timer-container.urgent`: 緊張狀態類別

### 計分板相關
- `.score-panel`: 計分板容器
- `.score-panel.open`: 展開狀態
- `.score-panel-toggle`: 右下角觸發按鈕
- `.score-item`: 單一桌次容器
- `.set-button`: Set 按鈕
- `.score-display`: 分數顯示
- `.score-modal`: Modal 遮罩
- `.score-modal.open`: Modal 顯示狀態
- `.modal-content`: Modal 內容容器
- `.modal-close`: Modal 關閉按鈕
- `.modal-title`: Modal 桌次標題
- `.modal-question`: Modal 提示文字
- `.number-buttons`: 數字按鈕容器
- `.number-button`: 單一數字按鈕

### 按鈕
- `.start-button`: 開始按鈕
- `.cancel-button`: 取消按鈕
- `.close-panel-button`: 關閉計分板按鈕

---

## JavaScript 關鍵變數與函數

### 全域變數
```javascript
const radius = 155;              // 圓形半徑
const circumference = 2 * Math.PI * radius;  // 圓周長
let timerInterval = null;        // 計時器 interval ID
let remainingTime = 15;          // 剩餘秒數
const scores = {1: 0, 2: 0, 3: 0};  // 三桌正式分數
const tempScores = {1: 0, 2: 0, 3: 0};  // 三桌臨時分數
let currentTable = null;         // 當前選擇的桌次
```

### 核心函數
- `setProgress(percent)`: 更新圓形進度（0-100%）
- `switchScreen(hideScreen, showScreen)`: 切換畫面
- `resetTimer()`: 重置計時器狀態
- `startCountdown()`: 開始 15 秒倒數
- `toggleScorePanel(forceState)`: 切換計分板顯示/隱藏（支持強制開關）
- `updateScoreDisplay(tableNumber)`: 更新指定桌次分數顯示
- `resetTempScores()`: 清空臨時分數
- `commitTempScores()`: 提交臨時分數到正式分數
- `openModal(tableNumber)`: 開啟 Modal 設定分數
- `closeModal()`: 關閉 Modal
- `setScore(repeatCount)`: 根據重複數量設定分數

### 事件監聽
- 開始按鈕點擊 → `startCountdown()`
- 取消按鈕點擊 → 中斷計時並返回
- 計分板觸發按鈕 → `toggleScorePanel()`
- Set 按鈕點擊 → `openModal(tableNumber)`
- 數字按鈕點擊 → `setScore(repeatCount)`
- document 全域點擊 → 檢測外部點擊收起計分板
- Modal 外部點擊 → 關閉 Modal

---

## 工作流程

### 正常流程
1. 使用者看到**開始按鈕**
2. 點擊開始 → 切換到**計時畫面**，計分板自動收起
3. 倒數 15 秒，進度條順時針填滿
4. 最後 5 秒觸發**紅色緊張效果**
5. 倒數結束 → 顯示 **結束畫面**（0.5 秒）
7. 2.5 秒後返回**開始畫面**，**計分板自動彈開**

### 中斷流程
- 任何時刻點擊右上角**取消按鈕** → 立即返回開始畫面

### 計分流程
- 右下角點擊「計分板」→ 面板從底部滑出
- 點擊各桌 Set 按鈕 → 彈出 Modal
- 選擇重複數量（0-4）→ 更新臨時分數
- 可重複修改同一桌，數值會被覆蓋
- 點擊面板外、叉叉或開始按鈕 → 關閉並提交分數

---

## 設計尺寸參考

### 倒數計時器
- SVG 容器: `80vh x 80vh`
- 圓形半徑: `155` (viewBox: 400x400)
- 倒數數字: `20vh`
- STOP 文字: `30vh`

### 按鈕
- 開始按鈕: `250px x 250px`
- 取消按鈕: `50px x 50px`
- Set 按鈕: `12px 30px` padding
- Modal 數字按鈕: `60px x 60px`

### 計分板
- 最大高度: `60vh`
- 三欄間距: `40px`
- 單欄最小寬度: `150px`

---

## 常見修改指南

### 調整倒數時長
修改 `script.js` 中的 `duration` 和初始 `remainingTime`：
```javascript
const duration = 20000;  // 改為 20 秒
let remainingTime = 20;
```

### 調整緊張效果觸發時機
修改 `script.js` 中的條件判斷：
```javascript
if (secondsLeft <= 3 && !timerContainer.classList.contains('urgent'))
```

### 調整分數計算公式
修改 `script.js` 中的公式：
```javascript
const scoreToAdd = 10 - repeatCount;  // 改為 10 - 重複數量
```

### 增加/減少桌次
1. 在 `index.html` 複製 `.score-item` 結構
2. 修改 `id="score-X"` 和 `data-table="X"`
3. 在 `script.js` 的 `scores` 和 `tempScores` 物件添加對應桌次
4. 在 `openModal()` 函數的 `tableNames` 陣列添加桌名

### 修改顏色主題
主要顏色定義在 `style.css`：
- 背景: `body { background: #ffffff; }`
- 主色調: `#333333`（黑色文字/邊框）
- 緊張色: `#ff4757`（紅色）

---

## 瀏覽器兼容性

- **SVG 動畫**: 需要支援 `stroke-dashoffset` 動畫
- **CSS 變數**: 使用 `vh` 單位
- **Flexbox**: 廣泛使用於布局
- **建議**: 現代瀏覽器（Chrome 60+, Firefox 60+, Safari 12+, Edge 79+）

---

## 未來擴展建議

1. **LocalStorage 持久化**: 保存計分板數據
2. **自訂倒數時長**: UI 設定介面
3. **聲音提示**: 計時結束時播放音效
4. **歷史記錄**: 記錄每次計時與分數
5. **響應式優化**: 行動裝置適配
6. **鍵盤快捷鍵**: Space 開始, Esc 取消等
7. **多語言支援**: i18n 國際化

---

**最後更新**: 2026年1月31日  
**版本**: 2.0  
**維護者**: AI Agent
