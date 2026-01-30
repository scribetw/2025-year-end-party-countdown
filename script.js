// 獲取 DOM 元素
const startScreen = document.getElementById('startScreen');
const timerScreen = document.getElementById('timerScreen');
const endScreen = document.getElementById('endScreen');
const startButton = document.getElementById('startButton');
const cancelButton = document.getElementById('cancelButton');
const countdownText = document.getElementById('countdownText');
const progressCircle = document.querySelector('.progress-ring-circle');
const timerContainer = document.querySelector('.timer-container');

// 計算圓形周長
const radius = 155;
const circumference = 2 * Math.PI * radius;

// 初始化進度條
progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
progressCircle.style.strokeDashoffset = circumference;

// 計時器變數
let timerInterval = null;
let remainingTime = 15;

// 更新進度圓形
function setProgress(percent) {
    const offset = circumference - (percent / 100) * circumference;
    progressCircle.style.strokeDashoffset = offset;
}

// 切換畫面
function switchScreen(hideScreen, showScreen) {
    hideScreen.classList.remove('active');
    showScreen.classList.add('active');
}

// 重置計時器
function resetTimer() {
    remainingTime = 15;
    countdownText.textContent = remainingTime;
    setProgress(0);
    timerContainer.classList.remove('urgent');
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

// 開始倒數計時
function startCountdown() {
    // 切換到計時器畫面
    switchScreen(startScreen, timerScreen);
    
    // 關閉計分板（如果有開啟）並提交分數
    toggleScorePanel(false);
    
    // 重置計時器
    resetTimer();
    
    const startTime = Date.now();
    const duration = 15000; // 15秒（毫秒）
    
    timerInterval = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const remaining = duration - elapsed;
        
        if (remaining <= 0) {
            // 計時結束
            clearInterval(timerInterval);
            timerInterval = null;
            
            // 設置為完成狀態
            countdownText.textContent = '0';
            setProgress(100);
            
            // 延遲0.3秒後顯示END畫面
            setTimeout(() => {
                switchScreen(timerScreen, endScreen);

                // 2.5秒後回到開始畫面
                setTimeout(() => {
                    switchScreen(endScreen, startScreen);
                    // 自動彈開計分板
                    toggleScorePanel(true);
                    resetTimer();
                }, 2500);
            }, 300);
        } else {
            // 更新倒數數字（向上取整）
            const secondsLeft = Math.ceil(remaining / 1000);
            countdownText.textContent = secondsLeft;
            
            // 最後5秒添加緊張效果
            if (secondsLeft <= 5 && !timerContainer.classList.contains('urgent')) {
                timerContainer.classList.add('urgent');
            }
            
            // 更新進度（計算已經過的百分比）
            const progress = (elapsed / duration) * 100;
            setProgress(progress);
        }
    }, 50); // 每50毫秒更新一次，使動畫更流暢
}

// 綁定開始按鈕事件
startButton.addEventListener('click', startCountdown);

// 綁定取消按鈕事件
cancelButton.addEventListener('click', () => {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    switchScreen(timerScreen, startScreen);
    resetTimer();
});

// ===== 計分板功能 =====
const scorePanelToggle = document.getElementById('scorePanelToggle');
const scorePanel = document.getElementById('scorePanel');
const closePanelButton = document.getElementById('closePanelButton');
const scoreButtons = document.querySelectorAll('.score-button');

// 計分板狀態
const scores = {
    1: 0,
    2: 0,
    3: 0
};

// 臨時分數（關閉計分板前可修改）
const tempScores = {
    1: 0,
    2: 0,
    3: 0
};

// 切換計分板顯示/隱藏
// forceState: true=強制打開, false=強制關閉, undefined/null=切換
function toggleScorePanel(forceState) {
    const isCurrentlyOpen = scorePanel.classList.contains('open');
    let willBeOpen;
    
    if (forceState === true) {
        willBeOpen = true;
    } else if (forceState === false) {
        willBeOpen = false;
    } else {
        willBeOpen = !isCurrentlyOpen;
    }
    
    // 如果狀態沒有變化，不做任何事
    if (isCurrentlyOpen === willBeOpen) {
        return;
    }
    
    // 更新狀態
    if (willBeOpen) {
        scorePanel.classList.add('open');
        // 打開時清空臨時分數
        resetTempScores();
    } else {
        scorePanel.classList.remove('open');
        // 關閉時提交臨時分數
        commitTempScores();
    }
}

scorePanelToggle.addEventListener('click', toggleScorePanel);
closePanelButton.addEventListener('click', toggleScorePanel);

// 點擊計分板外部區域收起面板
document.addEventListener('click', (event) => {
    // 檢查計分板是否打開
    if (!scorePanel.classList.contains('open')) {
        return;
    }
    
    // 檢查點擊是否在計分板、Modal 或觸發按鈕內
    const isClickInsidePanel = scorePanel.contains(event.target);
    const isClickOnToggle = scorePanelToggle.contains(event.target);
    const isClickInsideModal = modal.contains(event.target);
    
    // 如果點擊在外部（且不在 Modal 內），則關閉計分板
    if (!isClickInsidePanel && !isClickOnToggle && !isClickInsideModal) {
        toggleScorePanel(false);
    }
});

// 更新分數顯示（顯示正式分數 + 臨時分數）
function updateScoreDisplay(tableNumber) {
    const scoreDisplay = document.getElementById(`score-${tableNumber}`);
    const totalScore = scores[tableNumber] + tempScores[tableNumber];
    scoreDisplay.textContent = totalScore;
}

// 重置臨時分數
function resetTempScores() {
    tempScores[1] = 0;
    tempScores[2] = 0;
    tempScores[3] = 0;
}

// 提交臨時分數到正式分數
function commitTempScores() {
    scores[1] += tempScores[1];
    scores[2] += tempScores[2];
    scores[3] += tempScores[3];
    resetTempScores();
    // 更新所有顯示
    updateScoreDisplay(1);
    updateScoreDisplay(2);
    updateScoreDisplay(3);
}

// Modal 相關變數
let currentTable = null;
const modal = document.getElementById('scoreModal');
const modalTableName = document.getElementById('modalTableName');

// 開啟 Modal
function openModal(tableNumber) {
    const tableNames = ['第一桌', '第二桌', '第三桌'];
    modalTableName.textContent = tableNames[tableNumber - 1];
    currentTable = tableNumber;
    modal.classList.add('open');
}

// 關閉 Modal
function closeModal() {
    modal.classList.remove('open');
    currentTable = null;
}

// 設定分數（根據重複數量計算，只更新臨時分數）
function setScore(repeatCount) {
    if (currentTable !== null) {
        const scoreToAdd = 5 - repeatCount;
        tempScores[currentTable] = scoreToAdd; // 直接設定，不累加
        updateScoreDisplay(currentTable);
        closeModal();
    }
}

// 處理 Set 按鈕
const setButtons = document.querySelectorAll('.set-button');
setButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        e.stopPropagation();
        const tableNumber = parseInt(button.dataset.table);
        openModal(tableNumber);
    });
});

// 點擊 Modal 外部關閉
modal.addEventListener('click', function(e) {
    if (e.target === modal) {
        closeModal();
    }
});
