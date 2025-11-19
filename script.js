// 年齡對照表（根據皇家資料）
const ageTable = {
    mini: [15, 24, 28, 32, 36, 40, 44, 48, 52, 56, 60, 64, 68, 72, 76, 80],
    medium: [15, 24, 28, 32, 36, 42, 47, 51, 56, 60, 65, 69, 74, 78, 83, 87],
    large: [15, 24, 28, 32, 36, 45, 50, 55, 61, 66, 72, 77, 82, 88, 93, 99],
    giant: [12, 22, 31, 38, 45, 49, 56, 64, 71, 79, 86, 93, 100, 107, 114, 121]
};

// 初始化年月日選單
function initializeDateSelectors() {
    const currentYear = new Date().getFullYear();
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    
    // 填充年份（從30年前到今年）
    for (let year = currentYear; year >= currentYear - 30; year--) {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year + ' 年';
        yearSelect.appendChild(option);
    }
    
    // 填充月份
    for (let month = 1; month <= 12; month++) {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = month + ' 月';
        monthSelect.appendChild(option);
    }
    
    // 填充日期（預設31天）
    updateDaySelector();
    
    // 當年份或月份改變時，更新日期選項
    yearSelect.addEventListener('change', updateDaySelector);
    monthSelect.addEventListener('change', updateDaySelector);
}

// 更新日期選單（根據年份和月份）
function updateDaySelector() {
    const yearSelect = document.getElementById('birthYear');
    const monthSelect = document.getElementById('birthMonth');
    const daySelect = document.getElementById('birthDay');
    
    const selectedDay = daySelect.value;
    const year = parseInt(yearSelect.value) || new Date().getFullYear();
    const month = parseInt(monthSelect.value) || 1;
    
    // 計算該月份的天數
    const daysInMonth = new Date(year, month, 0).getDate();
    
    // 清空並重新填充日期選項
    daySelect.innerHTML = '<option value="">日</option>';
    for (let day = 1; day <= daysInMonth; day++) {
        const option = document.createElement('option');
        option.value = day;
        option.textContent = day + ' 日';
        daySelect.appendChild(option);
    }
    
    // 恢復之前選擇的日期（如果還有效）
    if (selectedDay && selectedDay <= daysInMonth) {
        daySelect.value = selectedDay;
    }
}

// 頁面載入時檢查是否有儲存的名字並初始化選單
window.onload = function() {
    initializeDateSelectors();
    
    const savedName = localStorage.getItem('dogName');
    if (!savedName) {
        document.getElementById('nameModal').classList.add('show');
    } else {
        updateLabels(savedName);
        loadSavedData();
    }
};

// 處理 Enter 鍵送出名字
function handleNameEnter(event) {
    if (event.key === 'Enter') {
        saveDogName();
    }
}

// 儲存狗狗名字
function saveDogName() {
    const name = document.getElementById('dogNameInput').value.trim();
    if (name) {
        localStorage.setItem('dogName', name);
        document.getElementById('nameModal').classList.remove('show');
        updateLabels(name);
        loadSavedData();
    } else {
        alert('請輸入狗狗的名字！');
    }
}

// 更新所有標籤文字
function updateLabels(name) {
    document.getElementById('title').textContent = `${name}年齡計算器`;
    document.getElementById('birthdayLabel').textContent = `${name}出生年月日：`;
    document.getElementById('sizeLabel').textContent = `${name}體型：`;
}

// 載入已儲存的資料
function loadSavedData() {
    const savedBirthday = localStorage.getItem('dogBirthday');
    const savedSize = localStorage.getItem('dogSize');
    
    if (savedBirthday) {
        const date = new Date(savedBirthday);
        document.getElementById('birthYear').value = date.getFullYear();
        document.getElementById('birthMonth').value = date.getMonth() + 1;
        updateDaySelector();
        document.getElementById('birthDay').value = date.getDate();
    }
    if (savedSize) {
        document.getElementById('dogSize').value = savedSize;
    }
}

// 計算年齡
function calculateAge() {
    const year = document.getElementById('birthYear').value;
    const month = document.getElementById('birthMonth').value;
    const day = document.getElementById('birthDay').value;
    const size = document.getElementById('dogSize').value;
    const dogName = localStorage.getItem('dogName');

    if (!year || !month || !day) {
        alert('請選擇完整的出生年月日！');
        return;
    }

    if (!size) {
        alert('請選擇狗狗體型！');
        return;
    }

    // 組合並儲存生日
    const birthday = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    localStorage.setItem('dogBirthday', birthday);
    localStorage.setItem('dogSize', size);

    // 計算年齡
    const birthDate = new Date(birthday);
    const today = new Date();
    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();

    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
        years--;
        months += 12;
    }

    if (today.getDate() < birthDate.getDate()) {
        months--;
    }

    // 取得對應的人類年齡
    let humanAge;
    if (years >= 16) {
        humanAge = ageTable[size][15];
    } else if (years >= 1) {
        humanAge = ageTable[size][years - 1];
        // 如果有月份,進行線性插值
        if (months > 0 && years < 16) {
            const nextYearAge = ageTable[size][years];
            const monthlyIncrease = (nextYearAge - humanAge) / 12;
            humanAge = Math.round(humanAge + (monthlyIncrease * months));
        }
    } else {
        // 未滿一歲的計算
        const totalMonths = years * 12 + months;
        humanAge = Math.round((ageTable[size][0] / 12) * totalMonths);
    }

    // 只顯示彈窗結果
    showResultModal(dogName, years, months, humanAge);
}

// 顯示結果彈窗
function showResultModal(dogName, years, months, humanAge) {
    document.getElementById('resultModalTitle').textContent = `🎊 ${dogName}的年齡資訊 🎊`;
    
    // 顯示狗狗年齡
    let dogAgeText = '';
    if (years > 0) {
        dogAgeText = `${years} 歲`;
        if (months > 0) {
            dogAgeText += ` ${months} 個月`;
        }
    } else {
        dogAgeText = `${months} 個月`;
    }
    
    document.getElementById('dogAgeDisplay').textContent = dogAgeText;
    document.getElementById('humanAgeDisplay').textContent = `${humanAge} 歲`;
    
    document.getElementById('resultModal').classList.add('show');
}

// 關閉結果彈窗
function closeResultModal() {
    document.getElementById('resultModal').classList.remove('show');
}

// 換算另一隻狗狗
function switchDog() {
    // 清空當前狗狗的資料
    localStorage.removeItem('dogName');
    localStorage.removeItem('dogBirthday');
    localStorage.removeItem('dogSize');
    
    // 清空輸入欄位
    document.getElementById('birthYear').value = '';
    document.getElementById('birthMonth').value = '';
    document.getElementById('birthDay').value = '';
    document.getElementById('dogSize').value = '';
    document.getElementById('dogNameInput').value = '';
    
    // 顯示名字輸入彈窗
    document.getElementById('nameModal').classList.add('show');
}