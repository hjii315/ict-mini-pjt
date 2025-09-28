// Global state variables
let participants = [];
let menuItems = [];
let participantMenuSelection = {}; // 참가자별로 선택한 메뉴 가격 목록
let menuSelection = {}; // 메뉴별로 선택한 참가자 정보 { menuItemIndex: participantPhone }
let settlementMode = 'split'; // 'split' or 'select'

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Kakao SDK
    // IMPORTANT: Replace 'YOUR_JAVASCRIPT_KEY' with your actual Kakao App's JavaScript key.
    Kakao.init('YOUR_JAVASCRIPT_KEY');
    console.log('Kakao SDK Initialized:', Kakao.isInitialized());

    renderParticipants();
    calculateSplit();
});

// --- Mode & Participant Management ---
function toggleSettlementMode(mode) {
    settlementMode = mode;
    const menuSection = document.getElementById('menuSelectionSection');
    menuSection.classList.toggle('hidden', mode !== 'select');
    updateParticipantTotals();
}

function addParticipant() {
    const input = document.getElementById('newParticipant');
    const phone = input.value.trim();
    if (phone && !participants.includes(phone)) {
        participants.push(phone);
        input.value = '';
        renderParticipants();
    } else if (participants.includes(phone)) {
        alert('이미 추가된 번호입니다.');
    } else {
        alert('유효한 휴대전화 번호를 입력하세요.');
    }
}

function removeParticipant(index) {
    const removedParticipant = participants[index];
    participants.splice(index, 1);

    // 이 참가자가 선택했던 메뉴들을 모두 해제
    for (const itemIndex in menuSelection) {
        if (menuSelection[itemIndex] === removedParticipant) {
            delete menuSelection[itemIndex];
        }
    }
    renderParticipants();
}

function renderParticipants() {
    const list = document.getElementById('participantList');
    list.innerHTML = '';
    participants.forEach((phone, index) => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="participant-info">
                <span>${phone}</span>
                <span class="participant-amount">0원</span>
            </div>
            <button class="remove-btn" onclick="removeParticipant(${index})">삭제</button>
        `;
        list.appendChild(li);
    });
    document.getElementById('participantCount').textContent = participants.length;
    updateParticipantTotals();
    updateParticipantSelectionView();
}

// --- Receipt Analysis & UI Update ---
function previewReceipt(event) {
    const reader = new FileReader();
    reader.onload = function(){
        const preview = document.getElementById('receiptPreview');
        preview.src = reader.result;
        preview.classList.remove('hidden');
        document.getElementById('uploadPlaceholder').classList.add('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    }
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
}

async function analyzeReceipt() {
    const uploadInput = document.getElementById('receiptUpload');
    if (uploadInput.files.length === 0) return alert('영수증 사진을 먼저 선택해주세요.');

    const formData = new FormData();
    formData.append('receipt', uploadInput.files[0]);

    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.classList.remove('hidden');
    document.getElementById('analyzeBtn').disabled = true;

    try {
        const response = await fetch('/analyze-receipt', { method: 'POST', body: formData });
        if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);
        
        const data = await response.json();
        if (data.error) throw new Error(data.error);

        document.getElementById('totalAmount').value = data.total_price || 0;
        displayMenuItems(data.items || []);
        alert('영수증 분석이 완료되었습니다!');

    } catch (error) {
        console.error('Error analyzing receipt:', error);
        alert(`영수증 분석 중 오류가 발생했습니다: ${error.message}`);
    } finally {
        loadingIndicator.classList.add('hidden');
        document.getElementById('analyzeBtn').disabled = false;
    }
}

function displayMenuItems(items) {
    // Normalize items: set quantity and base unit price for calculations
    menuItems = (items || []).map(it => {
        const ocrQty = Number.isFinite(it.quantity) && it.quantity > 0 ? parseInt(it.quantity) : null;
        const qty = ocrQty || 1;
        const unit = Number.isFinite(it.unit_price) ? Number(it.unit_price) : (qty > 0 ? Number(it.price) / qty : Number(it.price));
        return {
            ...it,
            quantity: qty,            // current user-selected quantity
            maxQuantity: ocrQty,      // OCR-detected maximum (if provided)
            _baseUnit: isFinite(unit) && unit > 0 ? unit : Number(it.price) || 0,
        };
    });
    menuSelection = {}; // 메뉴가 새로 들어오면 선택 상태 초기화
    const menuList = document.getElementById('menuList');
    const analysisResultSection = document.getElementById('analysisResultSection');
    menuList.innerHTML = '';

    if (menuItems.length > 0) {
        menuItems.forEach((item, index) => {
            const li = document.createElement('li');
            li.innerHTML = `
                <div class="menu-item-details">
                    <input type="checkbox" id="menu-item-${index}" onchange="updateParticipantSelection(${index}, this.checked)">
                    <label for="menu-item-${index}" class="menu-item-name">${item.name}</label>
                </div>
                <div class="menu-item-qty">
                    <label for="menu-qty-${index}">수량</label>
                    <input type="number" id="menu-qty-${index}" min="1" ${item.maxQuantity ? `max="${item.maxQuantity}"` : ''} step="1" value="${item.quantity}" onchange="onQuantityChange(${index}, this.value)">
                </div>
                <span class="menu-item-price" id="menu-price-${index}">${getItemTotal(item).toLocaleString()}원</span>
            `;
            menuList.appendChild(li);
        });
        analysisResultSection.classList.remove('hidden');
    } else {
        analysisResultSection.classList.add('hidden');
    }
    // 분석 완료 후, 정산 모드에 따라 금액 계산
    updateParticipantTotals();
    updateParticipantSelectionView();
}

function onQuantityChange(index, value) {
    let qty = Math.max(1, parseInt(value || '1'));
    const maxQ = menuItems[index].maxQuantity;
    if (Number.isFinite(maxQ) && maxQ > 0 && qty > maxQ) {
        qty = maxQ;
        const input = document.getElementById(`menu-qty-${index}`);
        if (input) input.value = String(maxQ);
    }
    menuItems[index].quantity = qty;
    // Update displayed item total
    const priceEl = document.getElementById(`menu-price-${index}`);
    if (priceEl) priceEl.textContent = `${getItemTotal(menuItems[index]).toLocaleString()}원`;
    updateParticipantTotals();
}

function getItemTotal(item) {
    const qty = Number.isFinite(item.quantity) && item.quantity > 0 ? item.quantity : 1;
    const unit = Number.isFinite(item._baseUnit) && item._baseUnit > 0 ? item._baseUnit : (Number.isFinite(item.unit_price) ? item.unit_price : (Number.isFinite(item.price) ? item.price : 0));
    return Math.round(unit * qty);
}

function updateParticipantSelectionView() {
    const selectionDiv = document.getElementById('participantSelection');
    selectionDiv.innerHTML = '';

    if (participants.length > 0 && menuItems.length > 0) {
        let radioHTML = '<h3>메뉴를 정산할 사람 선택:</h3><div class="participant-radio-group">';
        participants.forEach((phone, index) => {
            radioHTML += `
                <label>
                    <input type="radio" name="participant-selector" value="${phone}" ${index === 0 ? 'checked' : ''} onchange="updateMenuCheckboxes()">
                    ${phone.slice(-4)}
                </label>
            `;
        });
        radioHTML += '</div>';
        selectionDiv.innerHTML = radioHTML;
    }
    updateMenuCheckboxes();
}

function updateMenuCheckboxes() {
    const selectedParticipant = document.querySelector('input[name="participant-selector"]:checked')?.value;
    menuItems.forEach((_, index) => {
        const checkbox = document.getElementById(`menu-item-${index}`);
        if (!checkbox) return;
        const whoSelected = menuSelection[index];
        checkbox.disabled = whoSelected && whoSelected !== selectedParticipant;
        checkbox.checked = whoSelected === selectedParticipant;
    });
}

// --- Calculation & Sharing ---
function updateParticipantSelection(itemIndex, isChecked) {
    const selectedParticipant = document.querySelector('input[name="participant-selector"]:checked')?.value;
    if (!selectedParticipant) {
        alert('먼저 메뉴를 할당할 참가자를 선택해주세요!');
        document.getElementById(`menu-item-${itemIndex}`).checked = !isChecked;
        return;
    }

    if (isChecked) {
        menuSelection[itemIndex] = selectedParticipant;
    } else if (menuSelection[itemIndex] === selectedParticipant) {
        delete menuSelection[itemIndex];
    }
    updateParticipantTotals();
}

function updateParticipantTotals() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    const participantCount = participants.length;
    const splitAmount = participantCount > 0 ? Math.ceil(totalAmount / participantCount) : 0;

    // 참가자별 개인 금액 계산
    const personalTotals = {};
    participants.forEach(p => personalTotals[p] = 0);
    for (const itemIndex in menuSelection) {
        const participant = menuSelection[itemIndex];
        personalTotals[participant] += getItemTotal(menuItems[itemIndex]);
    }

    // 화면 업데이트
    document.querySelectorAll('#participantList li').forEach(li => {
        const phone = li.querySelector('.participant-info span:first-child').textContent;
        const amountSpan = li.querySelector('.participant-amount');
        if (settlementMode === 'select') {
            amountSpan.textContent = `${(personalTotals[phone] || 0).toLocaleString()}원`;
        } else {
            amountSpan.textContent = `${splitAmount.toLocaleString()}원`;
        }
    });
}

function calculateSplit() {
    // N/1 모드일 경우, 참가자 목록의 금액을 업데이트
    if (settlementMode === 'split') {
        updateParticipantTotals();
    }
}

function sendKakaoTalkMessages() {
    const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;
    if (totalAmount <= 0) return alert('총 금액을 입력해주세요.');
    if (participants.length === 0) return alert('참가자를 추가해주세요.');

    let message = `[정산 요청]\n총 금액: ${totalAmount.toLocaleString()}원\n\n`;
    // 메뉴 선택이 하나라도 있을 경우에만 개인별 정산 메시지를 보냄
    if (settlementMode === 'select' && Object.keys(menuSelection).length > 0) {
        message += '--- 개인별 정산 금액 ---\n';
        document.querySelectorAll('#participantList li').forEach(li => {
            const phone = li.querySelector('.participant-info span:first-child').textContent;
            const amount = li.querySelector('.participant-amount').textContent;
            if (amount !== '0원') {
                message += `${phone}: ${amount}\n`;
            }
        });
    } else {
        const splitAmount = Math.ceil(totalAmount / participants.length);
        message += `--- N분의 1 정산 금액 ---\n1인당 ${splitAmount.toLocaleString()}원`;
    }

    Kakao.API.request({
        url: '/v2/api/talk/memo/default/send',
        data: {
            template_object: {
                object_type: 'text',
                text: message,
                link: { web_url: window.location.href, mobile_web_url: window.location.href },
            },
        },
        success: () => alert('나에게 카카오톡 메시지를 성공적으로 보냈습니다.'),
        fail: (error) => {
            alert('카카오톡 메시지 보내기에 실패했습니다.');
            console.error(error);
        },
    });
}
