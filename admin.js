document.addEventListener('DOMContentLoaded', function () {
    // Check if already logged in (optional, for session persistence)
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        showAdminContent();
        loadData();
    }
});

function checkLogin() {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const errorMsg = document.getElementById('loginError');

    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === '2026swancor' && password === 'swancor1!') {
        // Login success
        errorMsg.style.display = 'none';
        sessionStorage.setItem('adminLoggedIn', 'true');
        showAdminContent();
        loadData();
    } else {
        // Login failed
        errorMsg.style.display = 'block';
        passwordInput.value = '';
    }
}

function showAdminContent() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('adminContent').style.display = 'block';
}

function loadData() {
    const data = JSON.parse(localStorage.getItem('registrations')) || [];
    const tbody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('dataTable');

    if (!tbody || !emptyState || !table) return; // Guard clause

    tbody.innerHTML = '';

    if (data.length === 0) {
        table.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }

    table.style.display = 'table';
    emptyState.style.display = 'none';

    // Sort by newest first
    data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    data.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.id || '-'}</td>
            <td>${item.timestamp}</td>
            <td>${item.fullName}</td>
            <td>${item.idNumber}</td>
            <td>${getGroupName(item.group)}</td>
            <td>${item.phone}</td>
            <td>${getCityName(item.city)}</td>
            <td>${item.schoolOrg}</td>
            <td>${item.email}</td>

            <td>${item.postalCode} ${item.address}</td>
            <td><button onclick="printRegistrationFormAdmin('${item.id}')" class="btn" style="background-color: #17a2b8; color: white; padding: 5px 10px; font-size: 0.8rem;">下載</button></td>
        `;
        tbody.appendChild(row);
    });
}

function getGroupName(code) {
    const groups = {
        'social': '社會組',
        'high_school': '高中組',
        'junior_high': '國中組',
        'elementary_high': '國小高年級組',
        'elementary_mid': '國小中年級組'
    };
    return groups[code] || code;
}

function getCityName(code) {
    const cities = {
        'Taipei': '臺北市', 'NewTaipei': '新北市', 'Taoyuan': '桃園市', 'Taichung': '臺中市',
        'Tainan': '臺南市', 'Kaohsiung': '高雄市', 'Keelung': '基隆市', 'HsinchuCity': '新竹市',
        'HsinchuCounty': '新竹縣', 'Miaoli': '苗栗縣', 'Changhua': '彰化縣', 'Nantou': '南投縣',
        'Yunlin': '雲林縣', 'ChiayiCity': '嘉義市', 'ChiayiCounty': '嘉義縣', 'Pingtung': '屏東縣',
        'Yilan': '宜蘭縣', 'Hualien': '花蓮縣', 'Taitung': '臺東縣', 'Penghu': '澎湖縣',
        'Kinmen': '金門縣', 'Lienchiang': '連江縣'
    };
    return cities[code] || code;
}

function exportToCSV() {
    const data = JSON.parse(localStorage.getItem('registrations')) || [];
    if (data.length === 0) {
        alert('無資料可匯出');
        return;
    }

    // CSV Header
    const headers = ['編號', '時間', '姓名', '身分證字號', '組別', '電話', '縣市', '服務單位', 'Email', '郵遞區號', '地址'];

    // CSV Content
    let csvContent = headers.join(',') + '\n';

    data.forEach(item => {
        const row = [
            `"${item.id || ''}"`,
            `"${item.timestamp}"`,
            `"${item.fullName}"`,
            `"${item.idNumber}"`,
            `"${getGroupName(item.group)}"`,
            `"${item.phone}"`,
            `"${getCityName(item.city)}"`,
            `"${item.schoolOrg}"`,
            `"${item.email}"`,
            `"${item.postalCode}"`,
            `"${item.address}"`
        ];
        csvContent += row.join(',') + '\n';
    });

    // Create a Blob with UTF-8 BOM for Excel compatibility
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `報名資料_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function clearData() {
    if (confirm('確定要清除所有報名資料嗎？此動作無法復原。')) {
        localStorage.removeItem('registrations');
        loadData();
        alert('資料已清除');
    }
}

function printRegistrationFormAdmin(id) {
    const dataList = JSON.parse(localStorage.getItem('registrations')) || [];
    const data = dataList.find(item => item.id === id);

    if (!data) {
        alert('找不到該筆資料');
        return;
    }

    const groupChecks = {
        'social': '□',
        'high_school': '□',
        'junior_high': '□',
        'elementary_high': '□',
        'elementary_mid': '□'
    };

    if (groupChecks[data.group]) {
        groupChecks[data.group] = '■'; // Checked symbol
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=600');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>書法比賽送件表 - ${data.fullName}</title>
            <style>
                body {
                    font-family: "KaiTi", "BiauKai", "DFKai-SB", serif; /* BiauKai font */
                    padding: 40px;
                }
                @media print {
                    @page { margin: 0; }
                    body { padding: 5px; }
                    .no-print { display: none; }
                    .print-container { border: none; }
                }
                .print-container {
                    width: 16.3cm;
                    margin: 0 auto;
                    border: 1px solid black;
                }
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                th, td {
                    border: 1px solid black;
                    padding: 2px 4px; /* Reduced padding */
                    text-align: center;
                    font-size: 10pt; /* Smaller base font */
                }
                .header-row th {
                    font-size: 14pt;
                    font-weight: bold;
                    padding: 5px;
                }
                .label-row td {
                    background-color: #f0f0f0; 
                    font-weight: bold;
                    font-size: 10pt;
                    height: 0.5cm; /* Requested height */
                    padding: 0; /* Tight fit */
                }
                .content-cell {
                    height: 2.4cm; /* Requested height */
                    vertical-align: middle;
                    font-size: 12pt; /* Adjusted for better fit */
                }
                .group-list {
                    text-align: left;
                    padding-left: 5px;
                    font-size: 9pt; /* Smaller for list */
                    white-space: nowrap; /* Prevent wrapping */
                    letter-spacing: -0.5px; /* Squeeze text */
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between; /* Evenly distribute height */
                    height: 100%; /* Fill the cell height */
                }
                .address-box {
                    font-size: 10pt; /* Same as other text */
                    letter-spacing: 2px;
                    margin-bottom: 2px;
                    font-family: inherit; /* Use default font */
                    text-align: left; /* Ensure left alignment */
                }
                .phone-list {
                    text-align: left;
                    padding-left: 5px;
                    line-height: 1.5; /* Increased line height for readability */
                    font-size: 9pt;
                    vertical-align: top; /* Align to top */
                }
                .id-box {
                    color: red;
                    font-weight: bold;
                    font-size: 12pt;
                }
                /* Utility to squeeze text if needed */
                .squeeze-text {
                    letter-spacing: -1px;
                }
            </style>
        </head>
        <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: center;">
                <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">下載送件表</button>
                <p style="color: red; font-size: 14px;">請列印此頁並貼於作品背面右下角</p>
            </div>

            <div class="print-container">
                <table>
                    <tr class="header-row">
                        <th colspan="4" style="text-align:center;">115年第九屆「上緯諒茶獎」書法比賽送件表</th>
                        <th colspan="1" style="width: 3.2cm; text-align: left; padding: 2px; font-size: 9pt;">
                            編號：<span class="id-box">${data.id}</span>
                            <div style="font-size: 7pt; font-weight: normal; margin-top: 1px;">(此欄由主辦單位填寫)</div>
                        </th>
                    </tr>
                    <tr class="label-row">
                        <td style="width: 2.5cm;">組 別</td>
                        <td style="width: 2.4cm;">姓 名</td>
                        <td style="width: 2.8cm;">服務單位或學校</td>
                        <td style="width: 5.2cm;">通 訊 處</td>
                        <td style="width: 3.2cm;">電 話</td>
                    </tr>
                    <tr>
                        <td class="content-cell">
                            <div class="group-list">
                                <div>${groupChecks['social']}社會組</div>
                                <div>${groupChecks['high_school']}高中組</div>
                                <div>${groupChecks['junior_high']}國中組</div>
                                <div>${groupChecks['elementary_high']}國小高年級組</div>
                                <div>${groupChecks['elementary_mid']}國小中年級組</div>
                            </div>
                        </td>
                        <td class="content-cell">${data.fullName}</td>
                        <td class="content-cell" style="letter-spacing: -1px;">${data.schoolOrg}</td>
                        <td class="content-cell" style="text-align: left; padding-left: 5px;">
                            <div class="address-box" style="display: inline-block; min-width: 100px; margin-bottom: 5px;">${data.postalCode}</div>
                            <div style="text-align: left;">${data.address}</div>
                        </td>
                        <td class="content-cell phone-list" style="vertical-align: top;">
                            公：${data.phone}<br>
                            宅：<br>
                            手機：${data.mobile}
                        </td>
                    </tr>
                </table>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}
