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

    if (username === '2026swancor' && password === 'iw123456') {
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
    const tbody = document.getElementById('tableBody');
    const emptyState = document.getElementById('emptyState');
    const table = document.getElementById('dataTable');

    if (!tbody || !emptyState || !table) return;

    // Firebase Realtime Listener
    db.ref('registrations').on('value', (snapshot) => {
        tbody.innerHTML = ''; // Clear current table
        const dataObj = snapshot.val();

        if (!dataObj) {
            table.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        table.style.display = 'table';
        emptyState.style.display = 'none';

        // Convert object to array and sort
        const data = Object.values(dataObj);
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
                <td style="white-space:nowrap;">
                    <button onclick="openEditModal('${item.id}')" class="btn-edit">修改</button>
                    <button onclick="deleteRecord('${item.id}')" class="btn-delete">刪除</button>
                </td>
            `;
            tbody.appendChild(row);
        });
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
    db.ref('registrations').once('value').then((snapshot) => {
        const dataObj = snapshot.val();
        if (!dataObj) {
            alert('無資料可匯出');
            return;
        }

        const data = Object.values(dataObj);

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
    });
}

function clearData() {
    if (confirm('確定要清除所有報名資料嗎？此動作無法復原。')) {
        Promise.all([
            db.ref('registrations').remove(),
            db.ref('metadata').remove()
        ])
            .then(() => {
                alert('資料已清除，編號將重新從001開始');
                // loadData listener will automatically update the UI
            })
            .catch((error) => {
                alert('清除失敗: ' + error.message);
            });
    }
}

// === CRUD Functions ===

function openAddModal() {
    document.getElementById('editModalTitle').textContent = '新增資料';
    document.getElementById('editId').value = '';
    document.getElementById('editFullName').value = '';
    document.getElementById('editIdNumber').value = '';
    document.getElementById('editGroup').value = 'social';
    document.getElementById('editPhone').value = '';
    document.getElementById('editMobile').value = '';
    document.getElementById('editSchoolOrg').value = '';
    document.getElementById('editEmail').value = '';
    document.getElementById('editCity').value = '';
    document.getElementById('editPostalCode').value = '';
    document.getElementById('editAddress').value = '';
    document.getElementById('editModal').style.display = 'flex';
}

function openEditModal(id) {
    db.ref('registrations/' + id).once('value').then((snapshot) => {
        const data = snapshot.val();
        if (!data) { alert('找不到資料'); return; }
        document.getElementById('editModalTitle').textContent = '修改資料';
        document.getElementById('editId').value = id;
        document.getElementById('editFullName').value = data.fullName || '';
        document.getElementById('editIdNumber').value = data.idNumber || '';
        document.getElementById('editGroup').value = data.group || 'social';
        document.getElementById('editPhone').value = data.phone || '';
        document.getElementById('editMobile').value = data.mobile || '';
        document.getElementById('editSchoolOrg').value = data.schoolOrg || '';
        document.getElementById('editEmail').value = data.email || '';
        document.getElementById('editCity').value = data.city || '';
        document.getElementById('editPostalCode').value = data.postalCode || '';
        document.getElementById('editAddress').value = data.address || '';
        document.getElementById('editModal').style.display = 'flex';
    });
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
}

function saveEdit() {
    const id = document.getElementById('editId').value;
    const fullName = document.getElementById('editFullName').value.trim();
    const idNumber = document.getElementById('editIdNumber').value.trim();
    const group = document.getElementById('editGroup').value;
    const phone = document.getElementById('editPhone').value.trim();
    const mobile = document.getElementById('editMobile').value.trim();
    const schoolOrg = document.getElementById('editSchoolOrg').value.trim();
    const email = document.getElementById('editEmail').value.trim();
    const city = document.getElementById('editCity').value.trim();
    const postalCode = document.getElementById('editPostalCode').value.trim();
    const address = document.getElementById('editAddress').value.trim();

    if (!fullName) { alert('請輸入姓名'); return; }

    if (id) {
        // Edit existing
        const updates = {
            fullName, idNumber, group, phone, mobile,
            schoolOrg, email, city, postalCode, address
        };
        db.ref('registrations/' + id).update(updates)
            .then(() => { alert('資料已更新'); closeEditModal(); })
            .catch((err) => { alert('更新失敗: ' + err.message); });
    } else {
        // Add new - generate ID
        const groupCodeMap = {
            'social': 'A', 'high_school': 'B', 'junior_high': 'C',
            'elementary_high': 'D', 'elementary_mid': 'E'
        };
        const groupCode = groupCodeMap[group] || 'X';
        const countRef = db.ref('metadata/groupCount/' + group);

        countRef.transaction(function (currentCount) {
            return (currentCount || 0) + 1;
        }, function (error, committed, snapshot) {
            if (error) { alert('新增失敗: ' + error.message); return; }
            if (committed) {
                const nextNum = snapshot.val();
                const newId = `SW115${groupCode}${String(nextNum).padStart(3, '0')}`;
                const formData = {
                    id: newId,
                    timestamp: new Date().toLocaleString(),
                    fullName, idNumber, group, phone, mobile,
                    schoolOrg, email, city, postalCode, address
                };
                db.ref('registrations/' + newId).set(formData)
                    .then(() => { alert('新增成功，編號: ' + newId); closeEditModal(); })
                    .catch((err) => { alert('新增失敗: ' + err.message); });
            }
        });
    }
}

function deleteRecord(id) {
    if (confirm('確定要刪除編號 ' + id + ' 的資料嗎？')) {
        db.ref('registrations/' + id).remove()
            .then(() => { alert('已刪除 ' + id); })
            .catch((err) => { alert('刪除失敗: ' + err.message); });
    }
}

function printRegistrationFormAdmin(id) {
    db.ref('registrations/' + id).once('value').then((snapshot) => {
        const data = snapshot.val();

        if (!data) {
            alert('找不到該筆資料');
            return;
        }

        generatePrintWindowAdmin(data);
    });
}
// Renaming old print logic to a helper function, or just inlining it
function generatePrintWindowAdmin(data) {

    const groupChecks = {
        'social': '□',
        'high_school': '□',
        'junior_high': '□',
        'elementary_high': '□',
        'elementary_mid': '□'
    };

    if (groupChecks[data.group]) {
        groupChecks[data.group] = '☑'; // Checked symbol
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=1200');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="zh-TW">
        <head>
            <meta charset="UTF-8">
            <title>書法比賽送件表 - ${data.fullName}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body {
                    font-family: "KaiTi", "BiauKai", "DFKai-SB", "標楷體", serif;
                    background: #f5f5f5;
                }
                @media print {
                    @page {
                        size: A4;
                        margin: 0;
                    }
                    body { background: white; }
                    .no-print { display: none !important; }
                    .a4-page { box-shadow: none; margin: 0; padding: 0; }
                }
                .no-print {
                    text-align: center;
                    padding: 20px;
                    background: #333;
                    color: white;
                    position: sticky;
                    top: 0;
                    z-index: 100;
                }
                .no-print button {
                    padding: 12px 30px;
                    font-size: 16px;
                    cursor: pointer;
                    background: #8B4513;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    margin-right: 10px;
                }
                .no-print button:hover { background: #A0522D; }
                .no-print p { margin-top: 8px; color: #ff6b6b; font-size: 14px; }
                .a4-page {
                    width: 21cm;
                    min-height: 29.7cm;
                    margin: 20px auto;
                    padding: 12mm 15mm;
                    background: white;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.15);
                }

                /* ===== 送件表 (Top Section) ===== */
                .entry-form-table {
                    width: 100%;
                    border-collapse: collapse;
                    border: 2px solid #000;
                }
                .entry-form-table th,
                .entry-form-table td {
                    border: 1px solid #000;
                    padding: 4px 6px;
                    text-align: center;
                    font-size: 11pt;
                    vertical-align: middle;
                }
                .entry-header {
                    font-size: 15pt;
                    font-weight: bold;
                    padding: 8px !important;
                    letter-spacing: 2px;
                }
                .entry-id-cell {
                    text-align: left !important;
                    padding: 4px 6px !important;
                    font-size: 9pt;
                    width: 3.5cm;
                    vertical-align: top;
                }
                .entry-id-cell .id-value {
                    color: black;
                    font-weight: bold;
                    font-size: 13pt;
                }
                .entry-id-cell .id-note {
                    font-size: 7pt;
                    font-weight: normal;
                    margin-top: 2px;
                    color: #555;
                }
                .label-row td {
                    font-weight: bold;
                    font-size: 10pt;
                    height: 0.6cm;
                    padding: 2px 4px !important;
                    background: #f8f8f8;
                }
                .data-row td {
                    height: 2.8cm;
                    vertical-align: middle;
                }
                .group-list {
                    text-align: left;
                    padding-left: 4px;
                    font-size: 10pt;
                    line-height: 1.7;
                }
                .group-list div { white-space: nowrap; }
                .address-cell {
                    text-align: left !important;
                    padding-left: 6px !important;
                    font-size: 10pt;
                }
                .phone-cell {
                    text-align: left !important;
                    padding-left: 6px !important;
                    font-size: 10pt;
                    line-height: 1.8;
                    vertical-align: top !important;
                    padding-top: 8px !important;
                }

                /* ===== 虛線及提示 ===== */
                .dashed-note {
                    text-align: right;
                    font-size: 8pt;
                    margin-top: 4px;
                    margin-bottom: 2px;
                    color: #333;
                }

                /* ===== 簡章 (Bottom Section) ===== */
                .rules-section {
                    margin-top: 18px;
                    border-top: 2px dashed #000;
                    padding-top: 14px;
                    font-size: 9.5pt;
                    line-height: 1.65;
                }
                .rules-title {
                    text-align: center;
                    font-size: 14pt;
                    font-weight: bold;
                    margin-bottom: 10px;
                    letter-spacing: 3px;
                }
                .rules-section h3 {
                    font-size: 10.5pt;
                    font-weight: bold;
                    margin-top: 8px;
                    margin-bottom: 3px;
                }
                .rules-section p,
                .rules-section ol,
                .rules-section ul {
                    margin-left: 1.2em;
                    margin-bottom: 2px;
                }
                .rules-section ol { list-style: none; padding-left: 0; margin-left: 1.5em; }
                .rules-section ol li { margin-bottom: 1px; }
                .sub-list { margin-left: 1.5em; }
                .sub-list li { margin-bottom: 0; }

                /* Awards table */
                .awards-table {
                    width: calc(100% - 5em);
                    margin: 5px 0 5px 5em;
                    border-collapse: collapse;
                    font-size: 9pt;
                }
                .awards-table th,
                .awards-table td {
                    border: 1px solid #000;
                    padding: 2px 5px;
                    text-align: center;
                }
                .awards-table th {
                    background: #f0f0f0;
                    font-weight: bold;
                }

                .indent { margin-left: 2em; }
                .indent2 { margin-left: 3em; }
            </style>
        </head>
        <body>
            <div class="no-print">
                <button onclick="window.print()">🖨️ 列印送件表</button>
                <p>請列印此頁，將上方送件表沿虛線剪下，黏貼於作品背面右下角</p>
            </div>

            <div class="a4-page">
                <!-- ===== 送件表 ===== -->
                <table class="entry-form-table">
                    <tr>
                        <th class="entry-header" colspan="4">115年第九屆「上緯諒茶獎」書法比賽送件表</th>
                        <td class="entry-id-cell" rowspan="1">
                            編號：<span class="id-value">${data.id}</span>
                            <div class="id-note">（此欄由主辦單位填寫）</div>
                        </td>
                    </tr>
                    <tr class="label-row">
                        <td style="width:2.6cm;">組　別</td>
                        <td style="width:2.5cm;">姓　名</td>
                        <td style="width:3cm;">服務單位或學校</td>
                        <td style="width:5.5cm;">通　訊　處</td>
                        <td style="width:3.5cm;">電　話</td>
                    </tr>
                    <tr class="data-row">
                        <td>
                            <div class="group-list">
                                <div>${groupChecks['social']}社會組</div>
                                <div>${groupChecks['high_school']}高中組</div>
                                <div>${groupChecks['junior_high']}國中組</div>
                                <div>${groupChecks['elementary_high']}國小高年級組</div>
                                <div>${groupChecks['elementary_mid']}國小中年級組</div>
                            </div>
                        </td>
                        <td style="font-size:13pt;">${data.fullName}</td>
                        <td style="font-size:10pt;">${data.schoolOrg}</td>
                        <td class="address-cell">
                            <div style="margin-bottom:3px;">${data.postalCode}</div>
                            <div>${data.address}</div>
                        </td>
                        <td class="phone-cell">
                            公：${data.phone}<br>
                            宅：<br>
                            手機：${data.mobile}
                        </td>
                    </tr>
                </table>
                <div class="dashed-note">※ 本欄請詳填後，沿虛線撕下來黏貼於作品背面右下角</div>

                <!-- ===== 簡章 ===== -->
                <div class="rules-section">
                    <div class="rules-title">115年第九屆「上緯諒茶獎」書法比賽　簡章</div>

                    <h3>一、實施目的</h3>
                    <p>闡揚儒家思想，倡導固有倫理道德，推展書法文化藝術，建立書香社會，培育藝文人才，提昇社會生活品質。</p>

                    <h3>二、辦理單位</h3>
                    <p class="indent">（一）指導單位：南投縣政府、南投縣政府文化局、南投縣政府教育處</p>
                    <p class="indent">（二）主辦單位：上緯國際投資控股股份有限公司、財團法人上緯諒茶文化基金會</p>
                    <p class="indent">（三）協辦單位：南投縣美術學會、南投國小</p>

                    <h3>三、參加對象：<span style="font-weight:normal;">凡對書法有興趣者均可按各組別報名參加。</span></h3>

                    <h3>四、比賽組別：<span style="font-weight:normal;">各組別以初賽收件截止日之學籍為準，報錯組別者取消比賽資格</span></h3>
                    <p style="margin-left:7em;">（一）社會組（包括各大專院校學生）</p>
                    <p style="margin-left:7em;">（二）高中組（包括高中、職學生）</p>
                    <p style="margin-left:7em;">（三）國中組</p>
                    <p style="margin-left:7em;">（四）國小高年級組（國小五、六年級學生）</p>
                    <p style="margin-left:7em;">（五）國小中年級組（國小三、四年級學生）</p>
                    <h3>五、比賽方式</h3>
                    <p style="margin-left:1.2em;">（一）初賽：（採徵件評選方式，每人以一組一件為限，若跨組別則不予評審。）</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">1. 書寫內容：以聖賢嘉句或典雅之詩詞文章為範圍。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">2. 作品規格：社會組、高中組以對開（35×135公分）宣紙直式書寫；國中組及國小組以4開（35×70公分）宣紙直式書寫，字體不拘，須加落款，不用裱褙，背後右下角須浮貼送件表。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">3. 收件日期：即日起至民國115年6月12日止（郵戳為憑，逾期或未符規定之作品概不受理）。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">4. 收件地址：南投市東閔路588號 連珮君 秘書收。電話：049-2255420轉561</p>
                    <p style="margin-left:1.2em;">（二）複賽：（採現場書寫比賽方式）</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">1. 複賽人員：由每組初賽作品中擇優錄取二十人，通知參加現場比賽（若未達水準則予以酌減人數）。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">2. 複賽日期：民國115年7月25日星期六上午8時30分前報到，9時至10時比賽。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">3. 複賽地點：南投國小禮堂（南投市彰南路一段1059號）。</p>
                    <p style="margin-left:8.5em;">比賽題目當場公布，比賽用紙由大會提供。毛筆、墨汁、硯台、墊布自備。</p>
                    <p style="margin-left:8.5em; text-indent:-1.5em;">4. 頒獎時間：複賽當天上午11時30分辦理頒獎典禮，未親領者則視同放棄。</p>

                    <h3 style="page-break-before: always;">六、評審及獎勵</h3>
                    <p class="indent">（一）評　審：由主辦單位聘請名書法家擔任。</p>
                    <p class="indent">（二）獎勵方式：</p>
                    <table class="awards-table">
                        <tr>
                            <th>組　別</th>
                            <th>第一名 1人</th>
                            <th>第二名 2人</th>
                            <th>第三名 3人</th>
                            <th>優選 5人</th>
                        </tr>
                        <tr>
                            <td>社會組</td>
                            <td>20,000 元</td>
                            <td>15,000 元</td>
                            <td>10,000 元</td>
                            <td>1,000 元</td>
                        </tr>
                        <tr>
                            <td>高中組</td>
                            <td>8,000 元</td>
                            <td>6,000 元</td>
                            <td>4,000 元</td>
                            <td>1,000 元</td>
                        </tr>
                        <tr>
                            <td>國中組</td>
                            <td>6,000 元</td>
                            <td>4,500 元</td>
                            <td>3,000 元</td>
                            <td>1,000 元</td>
                        </tr>
                        <tr>
                            <td>國小高年級組</td>
                            <td>3,500 元</td>
                            <td>2,500 元</td>
                            <td>2,000 元</td>
                            <td>1,000 元</td>
                        </tr>
                        <tr>
                            <td>國小中年級組</td>
                            <td>3,500 元</td>
                            <td>2,500 元</td>
                            <td>2,000 元</td>
                            <td>1,000 元</td>
                        </tr>
                    </table>
                    <p style="margin-left:5em; margin-top:3px;">說明：1.各組前三名及優選頒贈獎狀乙紙、獎金乙份。</p>
                    <p style="margin-left:8em;">2.參賽作品未達標準，獎項得從缺。</p>

                    <h3>七、其他事項</h3>
                    <p style="margin-left:4em; text-indent:-3em;">（一）本簡章及比賽結果公布於上緯國際投資控股股份有限公司（網址：https://www.swancor.com/tw）、南投縣政府文化局（網址：https://www.nthcc.gov.tw）、南投縣政府教育處（網站：https://www.ntct.edu.tw）。</p>
                    <p style="margin-left:4em; text-indent:-3em;">（二）凡參加比賽作品均不退件，參賽作品之所有權及著作財產權，全歸主辦單位所有，並有刊印、重製、展覽、無償使用及作為推展業務使用之權利，均不另予通知及致酬。</p>
                    <p style="margin-left:4em; text-indent:-3em;">（三）作品有抄繪、代為題字、冒名頂替、身分不實或違反本簡章規定之情事者，如經查明確有上情，除自負法律責任外，主辦單位得逕行取消其參賽資格，並追繳及沒入已頒發之獎狀、獎金。</p>
                    <p style="margin-left:4em; text-indent:-3em;">（四）投稿之作品若格式與規定不符，或因個人資料填寫錯誤，致無法聯繫者，視同放棄參賽資格，不得異議。</p>
                    <p style="margin-top: 6px; margin-left: 0;"><strong>八、凡參加比賽者，即視同接受本簡章之辦法；本辦法如有未盡事宜，由主辦單位修訂之。</strong></p>
                </div>
            </div>
        </body>
        </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
}
