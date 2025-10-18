document.addEventListener('DOMContentLoaded', () => {
    // --- 籤筒/移除/分組 DOM 元素 ---
    const totalCountInput = document.getElementById('total-count-input');
    const increaseTotalCount = document.getElementById('increase-total-count');
    const decreaseTotalCount = document.getElementById('decrease-total-count');
    const currentParticipants = document.getElementById('current-participants');
    const removedNumbersInput = document.getElementById('removed-numbers-input');
    const clearRemovedNumbers = document.getElementById('clear-removed-numbers');

    const drawCountInput = document.getElementById('draw-count-input');
    const increaseDrawCount = document.getElementById('increase-draw-count');
    const decreaseDrawCount = document.getElementById('decrease-draw-count');
    const allowRepeatCheckbox = document.getElementById('allow-repeat');
    const repeatStatusLabel = document.getElementById('repeat-status');
    const drawButton = document.getElementById('draw-button');
    const drawResults = document.getElementById('draw-results'); 

    const groupCountInput = document.getElementById('group-count-input');
    const increaseGroupCount = document.getElementById('increase-group-count');
    const decreaseGroupCount = document.getElementById('decrease-group-count');
    const groupButton = document.getElementById('group-button');
    const groupResults = document.getElementById('group-results');

    const resetButton = document.getElementById('reset-button');

    // --- 計時器 DOM 元素 ---
    const hourInput = document.getElementById('hour-input');
    const minuteInput = document.getElementById('minute-input');
    const secondInput = document.getElementById('second-input');
    const startPauseTimerButton = document.getElementById('start-pause-timer'); 
    const resetTimerButton = document.getElementById('reset-timer');
    
    // 警報和提示文字元素
    const alarmSound = document.getElementById('alarm-sound');
    const timeUpMessage = document.getElementById('time-up-message');

    // --- 狀態變數 ---
    let timerInterval = null;
    let timeRemaining = 240; 
    let isTimerRunning = false;
    let alarmTimeout = null; 
    
    // 籤筒狀態
    let participants = []; // 當前可用籤號
    let removed = [];      // 已移除籤號
    let drawnHistory = []; // 用於記錄不放回模式下已抽出的號碼

    // --- 計時器輔助函數 (不變) ---
    const playAlarm = () => {
        alarmSound.currentTime = 0; 
        alarmSound.loop = true;
        alarmSound.play().catch(e => console.error("無法播放音效:", e));
        alarmTimeout = setTimeout(stopAlarm, 10000); 
    };

    const stopAlarm = () => {
        alarmSound.pause();
        alarmSound.currentTime = 0;
        if (alarmTimeout) {
            clearTimeout(alarmTimeout);
            alarmTimeout = null;
        }
    };
    
    const showTimeUpMessage = () => {
        timeUpMessage.textContent = '時間到！';
        timeUpMessage.classList.add('active');
    };

    const hideTimeUpMessage = () => {
        timeUpMessage.textContent = '';
        timeUpMessage.classList.remove('active');
        stopAlarm();
    };

    const formatTime = (totalSeconds) => {
        const h = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const m = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const s = String(totalSeconds % 60).padStart(2, '0');
        return { h, m, s };
    };

    const updateTimeInputs = (seconds) => {
        const { h, m, s } = formatTime(seconds);
        hourInput.value = h;
        minuteInput.value = m;
        secondInput.value = s;
    };

    const readTotalSeconds = () => {
        const h = parseInt(hourInput.value) || 0;
        const m = parseInt(minuteInput.value) || 0;
        const s = parseInt(secondInput.value) || 0;
        return h * 3600 + m * 60 + s;
    };

    const updateTimer = () => {
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            isTimerRunning = false;
            timeRemaining = 0;
            updateTimeInputs(timeRemaining);
            showTimeUpMessage(); 
            playAlarm();
            startPauseTimerButton.textContent = '開始'; 
            startPauseTimerButton.disabled = true;
            resetTimerButton.textContent = '重設 (00:04:00)';
            return;
        }

        timeRemaining--;
        updateTimeInputs(timeRemaining);
    };

    const setupTimer = () => {
        hideTimeUpMessage();
        stopAlarm();
        timeRemaining = readTotalSeconds();
        updateTimeInputs(timeRemaining);
        startPauseTimerButton.textContent = '開始';
        startPauseTimerButton.disabled = timeRemaining <= 0;
        isTimerRunning = false; 
        clearInterval(timerInterval); 
    };
    
    // --- 計時器事件監聽器 (不變) ---
    startPauseTimerButton.addEventListener('click', () => {
        if (isTimerRunning) {
            // 暫停邏輯
            clearInterval(timerInterval);
            isTimerRunning = false;
            startPauseTimerButton.textContent = '開始';
        } else {
            // 開始邏輯
            if (timeRemaining > 0) {
                hideTimeUpMessage(); 
                isTimerRunning = true;
                startPauseTimerButton.textContent = '暫停';
                timerInterval = setInterval(updateTimer, 1000);
            }
        }
    });

    resetTimerButton.addEventListener('click', () => {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timeRemaining = 240; 
        updateTimeInputs(timeRemaining);
        startPauseTimerButton.textContent = '開始'; 
        startPauseTimerButton.disabled = false;
        resetTimerButton.textContent = '重設 (00:04:00)';
        hideTimeUpMessage(); 
    });

    const timeInputs = [hourInput, minuteInput, secondInput];
    timeInputs.forEach(input => {
        input.addEventListener('input', setupTimer);
        input.addEventListener('change', setupTimer); 
    });

    document.querySelectorAll('.btn-adjust-time').forEach(button => {
        button.addEventListener('click', (e) => {
            const unit = e.target.dataset.timeUnit;
            const action = e.target.dataset.action;
            let value = 0;
            let max = 0;
            let inputElement;

            if (unit === 'hour') {
                inputElement = hourInput;
                value = parseInt(inputElement.value);
                max = 99;
            } else if (unit === 'minute') {
                inputElement = minuteInput;
                value = parseInt(inputElement.value);
                max = 59;
            } else if (unit === 'second') {
                inputElement = secondInput;
                value = parseInt(inputElement.value);
                max = 59;
            }

            if (action === 'increase') {
                value = (value < max) ? value + 1 : 0;
            } else if (action === 'decrease') {
                value = (value > 0) ? value - 1 : max;
            }
            
            inputElement.value = String(value).padStart(2, '0');
            setupTimer(); 
        });
    });


    // --- 籤筒/移除/分組的 JavaScript 邏輯 ---

    // 輔助函數：生成和更新籤筒號碼
    const generateParticipants = () => {
        const total = parseInt(totalCountInput.value) || 0;
        let allNumbers = Array.from({ length: total }, (_, i) => i + 1);
        
        // 從總人數中排除已移除的號碼
        participants = allNumbers.filter(num => !removed.includes(num));
        
        // --- 籤筒顯示邏輯 (修正 2) ---
        let displayContent = '無';

        if (participants.length > 0) {
            const ranges = [];
            let start = participants[0];
            let end = participants[0];

            for (let i = 1; i < participants.length; i++) {
                if (participants[i] === end + 1) {
                    end = participants[i];
                } else {
                    ranges.push(start === end ? start.toString() : `${start}-${end}`);
                    start = participants[i];
                    end = participants[i];
                }
            }
            ranges.push(start === end ? start.toString() : `${start}-${end}`);
            
            if (ranges.length > 5) {
                 // 修正 2: 號 -> 支籤
                 displayContent = `${participants[0]}, ..., ${participants[participants.length - 1]} (共 ${participants.length} 支籤)`;
            } else if (ranges.length > 0) {
                 // 修正 2: 號 -> 支籤
                displayContent = ranges.join(', ') + ` (共 ${participants.length} 支籤)`;
            } else {
                 // 修正 2: 號 -> 支籤
                displayContent = participants.join(', ') + ` (共 ${participants.length} 支籤)`;
            }
        }
        currentParticipants.textContent = displayContent;
        // --- 修正結束 ---

        // 提示需要重新操作
        drawResults.innerHTML = '籤筒已更新，請重新抽籤';
        groupResults.textContent = '人數已更新，請重新分組';
        
        // 清空歷史紀錄，因為籤筒人數變了
        drawnHistory = [];
    };

    // 處理移除號碼輸入 
    const updateRemovedNumbers = () => {
        const inputStr = removedNumbersInput.value.trim().replace(/[,，\s]+/g, ' ').trim();
        const totalCount = parseInt(totalCountInput.value) || 0;
        const newRemoved = inputStr.split(/\s+/).filter(Boolean).map(Number).filter(n => n >= 1 && n <= totalCount);
        
        // 確保移除的號碼不重複且有效
        removed = Array.from(new Set(newRemoved)).sort((a, b) => a - b);
        
        // 關鍵：每次移除號碼改變時，都確保籤筒狀態被更新
        generateParticipants(); 
    };

    removedNumbersInput.addEventListener('input', updateRemovedNumbers);
    
    // 清空移除號碼
    clearRemovedNumbers.addEventListener('click', () => {
        removedNumbersInput.value = '';
        updateRemovedNumbers(); 
    });


    // 籤筒人數調整 (不變)
    increaseTotalCount.addEventListener('click', () => {
        totalCountInput.value = parseInt(totalCountInput.value) + 1;
        updateRemovedNumbers(); 
    });
    decreaseTotalCount.addEventListener('click', () => {
        if (parseInt(totalCountInput.value) > 1) {
            totalCountInput.value = parseInt(totalCountInput.value) - 1;
        }
        updateRemovedNumbers(); 
    });
    totalCountInput.addEventListener('input', () => {
        let val = parseInt(totalCountInput.value);
        if (isNaN(val) || val < 1) totalCountInput.value = 1;
        updateRemovedNumbers(); 
    });
    
    // 抽籤結果字體大小調整函數 (不變)
    const adjustFontSize = (count) => {
        drawResults.className = 'results-box draw-results-large';
        if (count <= 3) {
            drawResults.classList.add('size-xl');
        } else if (count <= 8) {
            drawResults.classList.add('size-lg');
        } else if (count <= 15) {
            drawResults.classList.add('size-md');
        } else {
            drawResults.classList.add('size-sm');
        }
    };
    
    // 抽籤邏輯 (修正 1)
    const handleDraw = () => {
        const count = parseInt(drawCountInput.value) || 1;
        const allowRepeat = allowRepeatCheckbox.checked;
        
        // 判斷當前籤筒是否已空
        if (participants.length === 0) {
             drawResults.innerHTML = '<span class="drawn-numbers">籤筒號碼不足，無法抽取。</span>';
             return;
        }
        
        let result = [];
        // 使用一個臨時的籤筒來執行抽取
        let tempParticipants = [...participants]; 
        const maxDraw = allowRepeat ? count : Math.min(count, tempParticipants.length);

        if (!allowRepeat && count > participants.length) {
            drawResults.innerHTML = `<span class="drawn-numbers">不放回模式下，抽取人數 (${count}) 不能多於剩餘人數 (${participants.length})。</span>`;
            return;
        }

        for (let i = 0; i < maxDraw; i++) {
            const randomIndex = Math.floor(Math.random() * tempParticipants.length);
            const drawnNumber = tempParticipants[randomIndex];
            result.push(drawnNumber);
            
            // 修正 1: 無論是否放回，單次抽取都需從臨時籤筒移除，確保當前批次無重複
            tempParticipants.splice(randomIndex, 1); 
            
            if (!allowRepeat) {
                // 不放回模式：加入永久歷史紀錄
                drawnHistory.push(drawnNumber); 
            }
        }
        
        adjustFontSize(result.length); 

        // 顯示已抽過號碼
        const historyText = drawnHistory.length > 0 
            ? `已抽過號碼：${drawnHistory.join(', ')}` 
            : '無';
        
        if (!allowRepeat) {
            // 將實際抽完後的剩餘籤筒賦值回全域變數 participants
            participants = tempParticipants;
            
            drawResults.innerHTML = `
                <p class="drawn-history">${historyText}</p>
                <p class="drawn-numbers">${result.join(', ')}</p>
                <p class="drawn-history">(籤筒剩餘人數: ${participants.length})</p>
            `;
            // 重新更新籤筒顯示（僅更新剩餘人數文字）
            // 修正 2: 確保更新後的文字也是「支籤」
            currentParticipants.textContent = currentParticipants.textContent.replace(/\(共 \d+ 支籤\)/, `(共 ${participants.length} 支籤)`);
            
        } else {
             drawResults.innerHTML = `
                <p class="drawn-history">模式：放回 (單次抽籤不重複)</p>
                <p class="drawn-numbers">${result.join(', ')}</p>
                <p class="drawn-history">(籤筒總人數: ${participants.length} 支籤)</p>
            `;
            // 這裡不需要更新 currentParticipants，因為籤筒人數沒有變動
        }
    };
    
    // 開始抽籤按鈕
    drawButton.addEventListener('click', handleDraw);


    // 分組邏輯 (不變)
    const handleGroup = () => {
        const totalGroups = parseInt(groupCountInput.value) || 1;
        const totalParticipants = participants.length;
        
        if (totalParticipants === 0 || totalGroups === 0) {
            groupResults.textContent = '籤筒人數或分組數無效，無法分組。';
            return;
        }

        if (totalGroups > totalParticipants) {
             groupResults.textContent = '分組數不能多於人數。';
             return;
        }

        let shuffledParticipants = [...participants].sort(() => 0.5 - Math.random());
        let groups = Array.from({ length: totalGroups }, () => []);
        
        for (let i = 0; i < totalParticipants; i++) {
            groups[i % totalGroups].push(shuffledParticipants[i]);
        }
        
        let resultText = `參與人數: ${totalParticipants}。分成 ${totalGroups} 組。<br>`;
        resultText += groups.map((group, index) => 
            `第${index + 1}組(${group.length}人): ${group.join(', ')}`
        ).join('<br>');
        
        groupResults.innerHTML = resultText;
    };

    groupButton.addEventListener('click', handleGroup);


    // 其他調整和控制項的事件監聽器 (不變)
    increaseDrawCount.addEventListener('click', () => { drawCountInput.value = parseInt(drawCountInput.value) + 1; });
    decreaseDrawCount.addEventListener('click', () => { if (parseInt(drawCountInput.value) > 1) { drawCountInput.value = parseInt(drawCountInput.value) - 1; } });
    drawCountInput.addEventListener('input', () => { let val = parseInt(drawCountInput.value); if (isNaN(val) || val < 1) drawCountInput.value = 1; });

    increaseGroupCount.addEventListener('click', () => { groupCountInput.value = parseInt(groupCountInput.value) + 1; });
    decreaseGroupCount.addEventListener('click', () => { if (parseInt(groupCountInput.value) > 1) { groupCountInput.value = parseInt(groupCountInput.value) - 1; } });
    groupCountInput.addEventListener('input', () => { let val = parseInt(groupCountInput.value); if (isNaN(val) || val < 1) groupCountInput.value = 1; });

    allowRepeatCheckbox.addEventListener('change', () => {
        repeatStatusLabel.textContent = allowRepeatCheckbox.checked ? '開 (放回)' : '關 (不放回)';
        // 模式切換時，清空歷史紀錄，並重置籤筒狀態
        drawnHistory = []; 
        updateRemovedNumbers(); // 重新產生籤筒顯示，並重設 drawResults
    });
    
    // 回到預設按鈕 (不變)
    const resetToDefaults = () => {
        totalCountInput.value = 23;
        removedNumbersInput.value = '';
        drawCountInput.value = 1;
        allowRepeatCheckbox.checked = false;
        groupCountInput.value = 4;

        drawnHistory = []; 
        updateRemovedNumbers(); 
        
        drawResults.innerHTML = '尚未抽取';
        groupResults.textContent = '尚未分組';
        repeatStatusLabel.textContent = '關 (不放回)';

        clearInterval(timerInterval);
        isTimerRunning = false;
        timeRemaining = 240; 
        updateTimeInputs(timeRemaining);
        startPauseTimerButton.textContent = '開始'; 
        startPauseTimerButton.disabled = false;
        resetTimerButton.textContent = '重設 (00:04:00)';
        hideTimeUpMessage(); 
    }

    resetButton.addEventListener('click', resetToDefaults);


    // --- 初始化 ---
    updateRemovedNumbers(); 
    updateTimeInputs(timeRemaining);
    setupTimer(); 
});