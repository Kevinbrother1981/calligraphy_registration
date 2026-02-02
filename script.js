document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('applyForm');
    const groupSelect = document.getElementById('competitionGroup');
    const schoolGroup = document.getElementById('schoolGroup');
    const modal = document.getElementById('successModal');

    // Dynamic Field Handling: Removed as School field is now standard
    // Previous logic for student groups is no longer needed per user request.

    // Form Submission Handling
    form.addEventListener('submit', function (e) {
        e.preventDefault();

        // Basic Validation
        if (validateForm()) {
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;

            // UI Indication
            submitBtn.innerHTML = '<span class="btn-text">處理中...</span>';
            submitBtn.disabled = true;
            submitBtn.style.opacity = '0.7';

            // Use Firebase Transaction to generate sequential ID safely
            const countRef = db.ref('metadata/count');

            countRef.transaction(function (currentCount) {
                // Increment counter, start at 1 if null
                return (currentCount || 0) + 1;
            }, function (error, committed, snapshot) {
                if (error) {
                    console.error('Transaction failed abnormally!', error);
                    alert('報名失敗，請稍後再試');
                    resetBtn(submitBtn, originalText);
                } else if (committed) {
                    const nextNum = snapshot.val();
                    const customId = `2026SW${String(nextNum).padStart(3, '0')}`;

                    // Collect Form Data
                    const formData = {
                        id: customId,
                        timestamp: new Date().toLocaleString(),
                        fullName: document.getElementById('fullName').value,
                        idNumber: document.getElementById('idNumber').value,
                        email: document.getElementById('email').value,
                        phone: document.getElementById('phone').value,
                        mobile: document.getElementById('mobile').value,
                        schoolOrg: document.getElementById('schoolOrg').value,
                        postalCode: document.getElementById('postalCode').value,
                        city: document.getElementById('city').value,
                        address: document.getElementById('address').value,
                        group: document.getElementById('competitionGroup').value
                    };

                    // Save to Firebase
                    db.ref('registrations/' + customId).set(formData)
                        .then(() => {
                            // Show Success Modal
                            modal.style.display = 'flex';
                            const modalIdSpan = modal.querySelector('.highlight-text');
                            if (modalIdSpan) {
                                modalIdSpan.textContent = customId;
                            }
                            resetBtn(submitBtn, originalText);
                        })
                        .catch((error) => {
                            console.error('Write failed', error);
                            alert('資料儲存失敗: ' + error.message);
                            resetBtn(submitBtn, originalText);
                        });
                }
            });
        }
    });

    function resetBtn(btn, text) {
        btn.innerHTML = text;
        btn.disabled = false;
        btn.style.opacity = '1';
    }

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });

    // Ink Effect on Click (Subtle visual flair)
    document.addEventListener('click', function (e) {
        // Create a temporary ink splash element? 
        // Keeping it simple for now to avoid performance issues, 
        // relying on CSS hover states.
    });
});

function validateForm() {
    // Add custom validation logic here if needed (e.g. ID number check)
    // For now, HTML5 'required' and 'pattern' attributes are sufficient.
    return true;
}

function closeModal() {
    document.getElementById('successModal').style.display = 'none';
    // Clear form after successful 'submission' and closing modal
    document.getElementById('applyForm').reset();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Close modal when clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('successModal');
    if (event.target == modal) {
        closeModal();
    }
}

// Print Logic Updated to fetch from Firebase if needed, but for modal we use current data
// Note: printRegistrationForm needs to know which ID to print. 
// We will modify it to accept ID or handle it differently.

function printRegistrationForm() {
    // In the modal context, we want to print the JUST submitted one.
    // The modal displays the ID. We can grab it from there.
    const modalIdSpan = document.getElementById('successModal').querySelector('.highlight-text');
    const idToPrint = modalIdSpan ? modalIdSpan.textContent : null;

    if (!idToPrint) {
        alert("無法讀取報名編號");
        return;
    }

    // Fetch specific data from Firebase
    db.ref('registrations/' + idToPrint).once('value').then((snapshot) => {
        const data = snapshot.val();
        if (!data) {
            alert("找不到資料");
            return;
        }
        generatePrintWindow(data);
    });
}

function generatePrintWindow(data) {

    // Determine which checkbox to check
    const groups = {
        'social': '社會組',
        'high_school': '高中組',
        'junior_high': '國中組',
        'elementary_high': '國小高年級組',
        'elementary_mid': '國小中年級組'
    };

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
                    /* Height auto to fit content, user request 0.5cm impossible for title+ID */
                }
                .label-row td {
                    background-color: transparent; /* Removed grey background to match style if needed, or keep? User didn't say remove. Putting height. */
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
