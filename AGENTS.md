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
- **分數範圍**: 0 - 15 分（不可為負數，上限 15 分）

#### 排版布局
- **橫向三欄布局**: 每桌獨立卡片
- **每欄垂直排列**（由上而下）:
  1. 桌次名稱
  2. 加分按鈕 (+)
  3. 分數顯示
  4. 減分按鈕 (−)

#### 資料持久性
- 分數保存在內存 (`scores` 物件)
- 刷新頁面後歸零
- 多次倒數過程中保持獨立

#### UX 優化
1. **按下開始自動收起**: 避免干擾計時
2. **計時結束自動彈開**: END 畫面顯示 0.3 秒後彈開，方便記分
3. **點擊外部區域收起**: 點擊計分板外任何地方自動關閉（包括開始按鈕）

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
- `.score-button`: 加減分按鈕
- `.score-display`: 分數顯示

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
const scores = {1: 0, 2: 0, 3: 0};  // 三桌分數
```

### 核心函數
- `setProgress(percent)`: 更新圓形進度（0-100%）
- `switchScreen(hideScreen, showScreen)`: 切換畫面
- `resetTimer()`: 重置計時器狀態
- `startCountdown()`: 開始 15 秒倒數
- `toggleScorePanel()`: 切換計分板顯示/隱藏
- `updateScoreDisplay(tableNumber)`: 更新指定桌次分數顯示

### 事件監聽
- 開始按鈕點擊 → `startCountdown()`
- 取消按鈕點擊 → 中斷計時並返回
- 計分板觸發按鈕 → `toggleScorePanel()`
- 加減分按鈕 → 更新分數（限制 0-15）
- document 全域點擊 → 檢測外部點擊收起計分板

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
- 點擊 +/− 按鈕調整各桌分數
- 點擊面板外或叉叉關閉

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
- 加減分按鈕: `48px x 48px`

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

### 調整分數上限
修改 `script.js` 中的條件：
```javascript
if (scores[tableNumber] < 20) {  // 改為上限 20
```

### 增加/減少桌次
1. 在 `index.html` 複製 `.score-item` 結構
2. 修改 `id="score-X"` 和 `data-table="X"`
3. 在 `script.js` 的 `scores` 物件添加對應桌次

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

**最後更新**: 2026年1月29日  
**版本**: 1.0  
**維護者**: AI Agent
