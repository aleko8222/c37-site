// ==========================================
// ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ (TOAST)
// ==========================================
function showToast(title, msg, icon = '✅') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div class="toast-icon">${icon}</div>
        <div class="toast-body">
            <div class="toast-title">${title}</div>
            <div class="toast-msg">${msg}</div>
        </div>
    `;
    container.appendChild(toast);
    setTimeout(() => {
        toast.classList.add('hide');
        toast.addEventListener('animationend', () => toast.remove());
    }, 3000);
}

// ==========================================
// LIGHTBOX (ЗУМ КАРТИНОК)
// ==========================================
function openImage(src) {
    const lightbox = document.getElementById('image-lightbox');
    if (!lightbox) return;
    document.getElementById('lightbox-img').src = src;
    lightbox.classList.add('active');
}
function closeImage() {
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox) lightbox.classList.remove('active');
}

// ==========================================
// SCROLL REVEAL (АНИМАЦИЯ ПОЯВЛЕНИЯ)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const revealElements = document.querySelectorAll('.reveal');
    const revealOptions = { threshold: 0.15, rootMargin: "0px 0px -50px 0px" };
    const revealOnScroll = new IntersectionObserver(function(entries, observer) {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        });
    }, revealOptions);
    revealElements.forEach(el => { revealOnScroll.observe(el); });
});

// ==========================================
// ТАКТИЛЬНАЯ ОТДАЧА (ВИБРАЦИЯ)
// ==========================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn') || e.target.closest('.btn-small') || e.target.closest('.btn-outline') || e.target.closest('.cart-icon-btn');
    if (btn && navigator.vibrate) { navigator.vibrate(30); }
});

// ==========================================
// ШЛЮЗ OZON (ДЛЯ ДАЛЬНИХ РЕГИОНОВ)
// ==========================================
function checkCity() {
    const cityInput = document.getElementById('order-city');
    if (!cityInput) return;
    const remoteCities = ['владивосток', 'хабаровск', 'новосибирск', 'красноярск', 'иркутск', 'якутск', 'магадан', 'петропавловск', 'южно-сахалинск'];
    const val = cityInput.value.toLowerCase().trim();
    if (remoteCities.some(city => val.includes(city))) {
        document.getElementById('ozon-modal').style.display = 'flex';
    }
}
function closeOzonModal() { document.getElementById('ozon-modal').style.display = 'none'; }
document.addEventListener('DOMContentLoaded', () => {
    const ozon = document.getElementById('ozon-modal');
    if (ozon) ozon.addEventListener('click', function(e) { if (e.target === this) closeOzonModal(); });
});

// ==========================================
// КОРЗИНА
// ==========================================
let cart = JSON.parse(localStorage.getItem('c37_cart')) || [];

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (!sidebar) return;
    if (sidebar.classList.contains('active')) {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
    } else {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        renderCart();
    }
}

function addToCart(name, price) {
    const existingItem = cart.find(item => item.name === name);
    if (existingItem) { existingItem.qty += 1; } 
    else { cart.push({ name, price, qty: 1 }); }
    saveCart();
    updateCartCount();
    renderCart();
    showToast('Добавлено в корзину', name, '🛒');
}

function saveCart() { localStorage.setItem('c37_cart', JSON.stringify(cart)); }

function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const countEl = document.getElementById('cart-count');
    if (countEl) {
        if (count > 0) { countEl.innerText = count; countEl.style.display = 'flex'; } 
        else { countEl.style.display = 'none'; }
    }
}

function renderCart() {
    const container = document.getElementById('cart-items-container');
    if (!container) return;
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('btn-go-checkout');
    const warningEl = document.getElementById('cart-warning');
    const warningCountEl = document.getElementById('cart-warning-count');

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#777; text-align:center; margin-top:20px;">Пока пусто. Добавь топливо!</p>';
        if(totalPriceEl) totalPriceEl.innerText = '0 ₽';
        if(checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; }
        if(warningEl) warningEl.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    let total = 0, totalItems = 0, hasBox = false;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        totalItems += item.qty;
        if(item.name.includes('ПРОТОКОЛ') || item.name.includes('ПОДПИСКА')) hasBox = true;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info"><h4>${item.name}</h4><p>${item.price} ₽</p></div>
            <div class="cart-item-actions">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>`;
        container.appendChild(div);
    });

    if(totalPriceEl) totalPriceEl.innerText = total + ' ₽';
    
    // Ограничение минимального заказа (7 батончиков или 1 Бокс/Подписка)
    if (hasBox || totalItems >= 7) {
        if(checkoutBtn) { checkoutBtn.disabled = false; checkoutBtn.style.opacity = '1'; }
        if(warningEl) warningEl.style.display = 'none';
    } else {
        if(checkoutBtn) { checkoutBtn.disabled = true; checkoutBtn.style.opacity = '0.5'; }
        if(warningEl) warningEl.style.display = 'block';
        if(warningCountEl) warningCountEl.innerText = 7 - totalItems;
    }
}

function changeQty(index, delta) {
    cart[index].qty += delta;
    if (cart[index].qty <= 0) { cart.splice(index, 1); }
    saveCart();
    updateCartCount();
    renderCart();
}

function showCheckout() {
    document.getElementById('checkout-form').classList.add('active');
    document.getElementById('btn-go-checkout').style.display = 'none';
}

function submitOrder() {
    if (!document.getElementById('agree-pd').checked) {
        alert('Необходимо согласие на обработку персональных данных'); return;
    }
    const name = document.getElementById('order-name').value;
    const phone = document.getElementById('order-phone').value;
    const city = document.getElementById('order-city').value;
    const delivery = document.getElementById('order-delivery').value;
    if (!name || !phone || !city) { alert('Пожалуйста, заполни все поля.'); return; }

    let orderText = `🚀 *Новый заказ C37 FUEL*\n\n`;
    orderText += `👤 Имя: ${name}\n📞 Контакт: ${phone}\n🏙 Город: ${city}\n🚚 Доставка: ${delivery}\n\n*Состав:*\n`;
    let total = 0;
    cart.forEach(item => { orderText += `- ${item.name} x${item.qty} = ${item.price * item.qty} ₽\n`; total += item.price * item.qty; });
    orderText += `\n💰 *Итого: ${total} ₽*`;
    console.log(orderText); 
    
    alert('Заказ принят! Мы свяжемся с тобой для подтверждения.');
    cart = []; saveCart(); updateCartCount(); renderCart();
    document.getElementById('checkout-form').classList.remove('active');
    document.getElementById('btn-go-checkout').style.display = 'block';
    toggleCart(); 
}

// ==========================================
// ВИДЕО
// ==========================================
function playIntro() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('eva-video');
    const quizSection = document.getElementById('quiz');
    if (!overlay) return;
    if (quizSection) quizSection.style.display = 'none';
    overlay.style.display = 'flex';
    video.currentTime = 0; 
    video.onerror = endVideo;
    video.play().catch(() => endVideo());
    video.onended = endVideo;
}
function endVideo() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('eva-video');
    const quizSection = document.getElementById('quiz');
    if (!overlay) return;
    overlay.style.display = 'none';
    video.pause();
    if (quizSection) {
        quizSection.style.display = 'block';
        setTimeout(() => { quizSection.scrollIntoView({ behavior: 'smooth' }); }, 100);
    }
}

// ==========================================
// ЧАТ С ЭЙВОЙ
// ==========================================
function toggleChat() {
    const chat = document.getElementById('chat-window');
    if (!chat) return;
    chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}
function handleEnter(e) { if (e.key === 'Enter') sendMessage(); }

async function sendMessage() {
    const input = document.getElementById('chat-input-field');
    if (!input) return;
    const text = input.value.trim();
    if (!text) return;

    const messages = document.getElementById('chat-messages');
    const userMsg = document.createElement('div');
    userMsg.className = 'message-user';
    userMsg.innerText = text;
    messages.appendChild(userMsg);
    input.value = '';
    messages.scrollTop = messages.scrollHeight;

    const typingMsg = document.createElement('div');
    typingMsg.className = 'message-eva';
    typingMsg.innerText = '...';
    messages.appendChild(typingMsg);
    messages.scrollTop = messages.scrollHeight;

    let isTyping = true;
    const timeoutId = setTimeout(() => {
        if (isTyping && typingMsg.parentNode) { typingMsg.innerText = 'Просыпаюсь, подожди немного...'; }
    }, 5000);

    try {
        const response = await fetch('https://c37-python-rag.de1.netrun.io/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: text })
        });
        
        isTyping = false;
        clearTimeout(timeoutId); 
        if(typingMsg.parentNode) messages.removeChild(typingMsg);
        
        if (!response.ok) {
            const errText = await response.text().catch(() => '');
            console.error("Сервер вернул ошибку:", response.status, errText);
            const errorMsg = document.createElement('div');
            errorMsg.className = 'message-eva';
            errorMsg.innerText = `Ошибка сервера (${response.status}). Попробуй позже.`;
            messages.appendChild(errorMsg);
            messages.scrollTop = messages.scrollHeight;
            return;
        }
        
        const data = await response.json();
        const evaMsg = document.createElement('div');
        evaMsg.className = 'message-eva';
        evaMsg.innerText = data.reply || 'Ошибка: пустой ответ.';
        messages.appendChild(evaMsg);
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        isTyping = false;
        clearTimeout(timeoutId);
        if(typingMsg.parentNode) messages.removeChild(typingMsg);
        const errorMsg = document.createElement('div');
        errorMsg.className = 'message-eva';
        errorMsg.innerText = 'Ошибка соединения. Проверь настройки сервера.';
        messages.appendChild(errorMsg);
        messages.scrollTop = messages.scrollHeight;
    }
}

// ==========================================
// КВИЗ (РАСЧЕТ КБЖУ)
// ==========================================
const steps = [
    { id: 'goal', type: 'options', question: 'Твоя цель?', options: ['Похудение', 'Энергия', 'Мышцы'] },
    { id: 'params', type: 'group_params', question: 'Твои параметры' },
    { id: 'activity', type: 'options', question: 'Уровень активности?', options: ['Сидячий', 'Средний', 'Высокий'] },
    { id: 'rhythm', type: 'group_rhythm', question: 'Твой ритм' },
    { id: 'restrictions', type: 'group_restrictions', question: 'Ограничения' }
];
let currentStep = 0;
let answers = {};

function renderStep() {
    const container = document.getElementById('quiz-content');
    if (!container) return;
    const step = steps[currentStep];
    let html = `<div style="font-size: 0.85rem; color: var(--accent); margin-bottom: 10px; font-weight: bold; text-transform: uppercase;">ШАГ ${currentStep + 1} ИЗ ${steps.length}</div>`;
    html += `<p class="question-text">${step.question}</p>`;
    
    if (step.type === 'options') {
        html += `<div class="options">`;
        step.options.forEach(opt => {
            const isSelected = answers[step.id] === opt ? 'selected' : '';
            html += `<button class="option-btn ${isSelected}" onclick="selectOption('${step.id}', '${opt}')">${opt}</button>`;
        });
        html += `</div>`;
    } else if (step.type === 'group_params') {
        html += `
            <div class="quiz-group"><label>Пол</label><div class="row-2">
                <button class="option-btn ${answers.gender === 'Мужской' ? 'selected' : ''}" onclick="selectOption('gender', 'Мужской')">Мужской</button>
                <button class="option-btn ${answers.gender === 'Женский' ? 'selected' : ''}" onclick="selectOption('gender', 'Женский')">Женский</button>
            </div></div>
            <div class="row-2">
                <div class="quiz-group"><label>Возраст</label><input type="number" id="input-age" placeholder="Лет" value="${answers.age || ''}" oninput="saveNumber('age', this.value)"></div>
                <div class="quiz-group"><label>Рост (см)</label><input type="number" id="input-height" placeholder="См" value="${answers.height || ''}" oninput="saveNumber('height', this.value)"></div>
            </div>
            <div class="quiz-group"><label>Вес (кг)</label><input type="number" id="input-weight" placeholder="Кг" value="${answers.weight || ''}" oninput="saveNumber('weight', this.value)"></div>`;
    } else if (step.type === 'group_rhythm') {
        html += `
            <div class="quiz-group"><label>Когда тянет на сладкое?</label><div class="row-2">
                <button class="option-btn ${answers.craving === 'Утро' ? 'selected' : ''}" onclick="selectOption('craving', 'Утро')">Утро</button>
                <button class="option-btn ${answers.craving === 'День' ? 'selected' : ''}" onclick="selectOption('craving', 'День')">День</button>
                <button class="option-btn ${answers.craving === 'Вечер' ? 'selected' : ''}" onclick="selectOption('craving', 'Вечер')">Вечер</button>
            </div></div>
            <div class="quiz-group"><label>Сон?</label><div class="row-2">
                <button class="option-btn ${answers.sleep === 'Мало' ? 'selected' : ''}" onclick="selectOption('sleep', 'Мало')">Меньше 7 ч</button>
                <button class="option-btn ${answers.sleep === 'Норма' ? 'selected' : ''}" onclick="selectOption('sleep', 'Норма')">7-9 ч</button>
            </div></div>`;
    } else if (step.type === 'group_restrictions') {
        html += `
            <div class="quiz-group"><label>Аллергия на арахис?</label><div class="row-2">
                <button class="option-btn ${answers.allergies === 'Нет' ? 'selected' : ''}" onclick="selectOption('allergies', 'Нет')">Нет</button>
                <button class="option-btn ${answers.allergies === 'Да' ? 'selected' : ''}" onclick="selectOption('allergies', 'Да')">Да</button>
            </div></div>
            <div class="quiz-group"><label>Стоп-факторы?</label><div class="row-2">
                <button class="option-btn ${answers.stop === 'Нет' ? 'selected' : ''}" onclick="selectOption('stop', 'Нет')">Нет</button>
                <button class="option-btn ${answers.stop === 'Да' ? 'selected' : ''}" onclick="selectOption('stop', 'Да')">Да</button>
            </div></div>`;
    }
    container.innerHTML = html;
    const progress = (currentStep / (steps.length - 1)) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('prevBtn').style.display = currentStep === 0 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').innerText = currentStep === steps.length - 1 ? 'Показать результат' : 'Далее';
}

function selectOption(id, value) { answers[id] = value; renderStep(); }
function saveNumber(id, value) { answers[id] = value; }

function nextStep() {
    const step = steps[currentStep];
    if (step.type === 'group_params' && (!answers.gender || !answers.age || !answers.height || !answers.weight)) { alert('Заполни все параметры.'); return; }
    if (step.type === 'group_rhythm' && (!answers.craving || !answers.sleep)) { alert('Ответь на оба вопроса.'); return; }
    if (step.type === 'group_restrictions') {
        if (!answers.allergies || !answers.stop) { alert('Ответь на оба вопроса.'); return; }
        if (answers.stop === 'Да') {
            document.getElementById('quiz-content').innerHTML = `<div style="text-align: center; padding: 20px;"><h2 style="color: var(--accent);">Обратитесь к врачу</h2><p style="margin: 20px 0;">Для твоей безопасности мы не можем собрать протокол.</p><button class="btn" onclick="resetQuiz()">Начать заново</button></div>`;
            document.querySelector('.nav-buttons').style.display = 'none'; return;
        }
    }
    if (step.type === 'options' && !answers[step.id]) { alert('Выбери вариант'); return; }
    
    if (currentStep < steps.length - 1) { currentStep++; renderStep(); } 
    else { calculateResult(); }
}
function prevStep() { if (currentStep > 0) { currentStep--; renderStep(); } }

function calculateResult() {
    document.querySelector('.progress-bar').style.display = 'none';
    const w = parseFloat(answers.weight), h = parseFloat(answers.height), a = parseFloat(answers.age);
    const isMale = answers.gender === 'Мужской';
    let bmr = isMale ? (10*w + 6.25*h - 5*a + 5) : (10*w + 6.25*h - 5*a - 161);
    let mult = answers.activity === 'Сидячий' ? 1.2 : answers.activity === 'Высокий' ? 1.55 : 1.375;
    let tdee = bmr * mult;
    let kcal = answers.goal === 'Похудение' ? Math.max(bmr, tdee * 0.83) : answers.goal === 'Мышцы' ? tdee * 1.1 : tdee;
    const protein = (answers.goal === 'Похудение' ? 2.0 : answers.goal === 'Мышцы' ? 1.9 : 1.7) * w;
    const fat = 0.9 * w;
    const carbs = (kcal - 4*protein - 9*fat) / 4;

    let boxName = 'ПРОТОКОЛ НЕДЕЛИ (Похудение)', barMorning = 'База Лимитированная', barEvening = 'Коллаген Лайт';
    if (answers.goal === 'Энергия') { boxName = 'ПРОТОКОЛ НЕДЕЛИ (Энергия)'; barMorning = 'Энергия Дисциплины'; barEvening = 'Омега Буст'; } 
    else if (answers.goal === 'Мышцы') { boxName = 'ПРОТОКОЛ НЕДЕЛИ (Мышцы)'; barMorning = 'Протеин База'; barEvening = 'Восстановление'; }
    if (answers.allergies === 'Да') {
        if (['База Лимитированная','Протеин База'].includes(barMorning)) barMorning = 'Коллаген Лайт';
        if (['Протеин База','База Лимитированная'].includes(barEvening)) barEvening = 'Коллаген Лайт';
    }

    // СОХРАНЕНИЕ ПРОТОКОЛА ДЛЯ ДНЕВНИКА
    const protocolData = {
        goal: answers.goal,
        gender: answers.gender,
        age: answers.age,
        height: answers.height,
        weight: answers.weight,
        activity: answers.activity,
        craving: answers.craving,
        kcal: Math.round(kcal),
        protein: Math.round(protein),
        fat: Math.round(fat),
        carbs: Math.round(carbs),
        barMorning: barMorning,
        barEvening: barEvening
    };
    localStorage.setItem('c37_protocol', JSON.stringify(protocolData));

    document.getElementById('quiz-content').innerHTML = `
        <h2 style="color: var(--accent); margin-bottom: 10px;">Твой протокол готов</h2>
        <div class="result-grid">
            <div class="result-card"><h3>Калории</h3><div class="value">${Math.round(kcal)}</div></div>
            <div class="result-card"><h3>Белки</h3><div class="value">${Math.round(protein)} г</div></div>
            <div class="result-card"><h3>Жиры</h3><div class="value">${Math.round(fat)} г</div></div>
            <div class="result-card"><h3>Углеводы</h3><div class="value">${Math.round(carbs)} г</div></div>
        </div>
        <div style="margin-top: 20px; background: rgba(0,0,0,0.4); padding: 25px; border-radius: 12px; border: 1px solid var(--accent);">
            <p style="margin-bottom: 15px; font-weight: bold; color: #fff;">📦 Твой Бокс на 7 дней:</p>
            <p style="margin-bottom: 10px;">🌅 Утро: <strong style="color: var(--accent);">${barMorning} (x3)</strong></p>
            <p style="margin-bottom: 15px;">💼 Вечер: <strong style="color: var(--accent);">${barEvening} (x4)</strong></p>
            <button class="btn" style="width:100%; margin-bottom:10px;" onclick="addToCart('${boxName}', 1190);">Заказать Бокс за 1190 ₽</button>
            <a href="diary.html" class="btn btn-outline" style="width:100%; text-decoration:none;">Перейти в Дневник</a>
        </div>`;
    document.querySelector('.nav-buttons').style.display = 'none';
}

function resetQuiz() {
    currentStep = 0; answers = {};
    document.querySelector('.progress-bar').style.display = 'block';
    document.querySelector('.nav-buttons').style.display = 'flex';
    renderStep();
}

// ==========================================
// ДНЕВНИК V1 (СЛОТЫ, СТРИК, ВЕС)
// ==========================================
let diaryState = JSON.parse(localStorage.getItem('c37_diary_v1')) || {
    lastActiveDate: null,
    streak: 0,
    slots: { breakfast: null, lunch: null, dinner: null, snacks: null },
    snacksC37: 0
};

let weightData = JSON.parse(localStorage.getItem('c37_weight_history')) || [];
let targetWeight = localStorage.getItem('c37_target_weight') || '';
let weightChartInstance = null;

function checkNewDay() {
    const today = new Date().toLocaleDateString('ru-RU');
    if (diaryState.lastActiveDate !== today) {
        diaryState.slots = { breakfast: null, lunch: null, dinner: null, snacks: null };
        diaryState.snacksC37 = 0;
        diaryState.lastActiveDate = today;
        saveDiaryState();
    }
}

function saveDiaryState() {
    localStorage.setItem('c37_diary_v1', JSON.stringify(diaryState));
    renderDiaryUI();
}

function markSlot(slotId, status) {
    diaryState.slots[slotId] = status;
    const allDone = Object.values(diaryState.slots).every(s => s !== null);
    if (allDone && diaryState.streak === 0) {
        diaryState.streak = 1; 
    }
    saveDiaryState();
    if(typeof showToast === 'function') showToast('Записано', 'Прием пищи отмечен', '✅');
}

function addSnackC37(name) {
    diaryState.snacksC37 += 1;
    saveDiaryState();
    if(typeof showToast === 'function') showToast('Батончик', `${name} добавлен в перекус`, '🍫');
}

function renderDiaryUI() {
    const dayEl = document.getElementById('day-count');
    if (!dayEl) return;

    dayEl.innerText = localStorage.getItem('c37_day_count') || '1';
    document.getElementById('streak-count').innerText = diaryState.streak;
    document.getElementById('snack-count').innerText = diaryState.snacksC37;

    const slots = ['breakfast', 'lunch', 'dinner', 'snacks'];
    slots.forEach(slot => {
        const card = document.getElementById(`slot-${slot}`);
        if (!card) return;
        
        const status = diaryState.slots[slot];
        card.classList.remove('completed');
        
        if (status === 'eaten') {
            card.classList.add('completed');
            card.querySelector('.slot-desc').innerText = "✅ Выполнено";
        } else if (status === 'skipped') {
            card.classList.add('completed');
            card.querySelector('.slot-desc').innerText = "❌ Пропущено";
        } else {
            const defaultDesc = { breakfast: 'Белки + сложные углеводы', lunch: 'Белок + овощи', dinner: 'Легкий белок', snacks: 'Батончик C37' };
            card.querySelector('.slot-desc').innerText = defaultDesc[slot];
        }
    });

    const savedCal = localStorage.getItem('c37_target_calories');
    if (savedCal) {
        document.getElementById('daily-cal-goal').innerText = savedCal + ' ккал';
    } else {
        document.getElementById('daily-cal-goal').innerText = 'Собери протокол';
    }
}

// --- ВЕС ---
function saveWeight() {
    const input = document.getElementById('current-weight');
    if (!input) return;
    const weight = parseFloat(input.value);
    if (!weight || weight < 30 || weight > 300) { alert('Введи корректный вес (30-300 кг).'); return; }

    const today = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    const existingIndex = weightData.findIndex(item => item.date === today);
    if (existingIndex !== -1) { weightData[existingIndex].weight = weight; } 
    else { weightData.push({ date: today, weight: weight }); }
    if (weightData.length > 30) weightData.shift();

    localStorage.setItem('c37_weight_history', JSON.stringify(weightData));
    input.value = '';
    renderChart();
    if(typeof showToast === 'function') showToast('Вес записан', `Текущий вес: ${weight} кг`, '⚖️');
}

function saveTargetWeight() {
    const input = document.getElementById('target-weight');
    if (!input) return;
    targetWeight = input.value;
    localStorage.setItem('c37_target_weight', targetWeight);
    renderChart();
}

function renderChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    if (weightData.length === 0) {
        canvas.parentElement.innerHTML = '<div style="height: 100%; display: flex; align-items: center; justify-content: center; color: #777; text-align: center;">Пока нет данных. Введи свой первый вес!</div>';
        return;
    }

    const ctx = canvas.getContext('2d');
    const sortedData = [...weightData].sort((a, b) => {
        const [dayA, monthA] = a.date.split('.');
        const [dayB, monthB] = b.date.split('.');
        return new Date(`2026-${monthA}-${dayA}`) - new Date(`2026-${monthB}-${dayB}`);
    });

    const labels = sortedData.map(item => item.date);
    const dataPoints = sortedData.map(item => item.weight);

    let minWeight = Math.min(...dataPoints);
    let maxWeight = Math.max(...dataPoints);
    if (targetWeight) {
        minWeight = Math.min(minWeight, parseFloat(targetWeight));
        maxWeight = Math.max(maxWeight, parseFloat(targetWeight));
    }
    minWeight = Math.floor(minWeight - 1);
    maxWeight = Math.ceil(maxWeight + 1);

    if (weightChartInstance) { weightChartInstance.destroy(); }

    Chart.defaults.color = '#a0a0a0';
    Chart.defaults.font.family = "'Inter', sans-serif";

    weightChartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Мой вес (кг)',
                    data: dataPoints,
                    borderColor: '#FF6B1A',
                    backgroundColor: 'rgba(255, 107, 26, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#fff',
                    pointBorderColor: '#FF6B1A',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Цель',
                    data: labels.map(() => targetWeight ? parseFloat(targetWeight) : null),
                    borderColor: '#4CAF50',
                    borderWidth: 3,
                    borderDash: [],
                    pointRadius: 0,
                    fill: false,
                    tension: 0
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: { 
                legend: { display: true, position: 'top' },
                tooltip: {
                    backgroundColor: 'rgba(20, 24, 28, 0.9)',
                    titleColor: '#FF6B1A',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 26, 0.3)',
                    borderWidth: 1,
                    padding: 10
                }
            },
            scales: {
                y: { 
                    min: minWeight,
                    max: maxWeight,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { stepSize: 1 }
                },
                x: { grid: { display: false } }
            }
        }
    });

    if (targetWeight && document.getElementById('target-weight')) {
        document.getElementById('target-weight').value = targetWeight;
    }
}

function askEvaAboutProgress() {
    const calEl = document.getElementById('daily-cal-goal');
    const cal = calEl ? calEl.innerText : 'неизвестно';
    
    let weightText = "Я пока не записывал(а) свой вес.";
    if (weightData.length > 0) {
        const startWeight = weightData[0].weight;
        const currentWeight = weightData[weightData.length - 1].weight;
        const diff = (currentWeight - startWeight).toFixed(1);
        const diffStr = diff < 0 ? `похудел(а) на ${Math.abs(diff)} кг` : (diff > 0 ? `набрал(а) ${diff} кг` : `вес стоит на месте`);
        weightText = `Мой стартовый вес был ${startWeight} кг, сейчас ${currentWeight} кг. Я ${diffStr}. Цель: ${targetWeight || 'не задана'}.`;
    }
    
    let snackText = diaryState.snacksC37 > 0 ? `Сегодня я съел(а) ${diaryState.snacksC37} батончиков C37.` : "";
    
    const promptText = `Эйва, привет! Проанализируй мой день. Моя цель по калориям: ${cal}. ${weightText} ${snackText} Как тебе мой прогресс и что мне съесть завтра, чтобы ускорить результат?`;

    toggleChat();
    document.getElementById('chat-input-field').value = promptText;
    sendMessage();
}

// Переопределяем функцию addToCart для новых тарифов (Чтобы выводить предупреждения)
const originalAddToCart = addToCart;
addToCart = function(name, price) {
    originalAddToCart(name, price);
    
    if (name.includes('батончик') || name === 'Протеин База' || name === 'Энергия Дисциплины' || name === 'База Лимитированная' || name === 'Восстановление') {
        setTimeout(() => {
            alert('Батончик добавлен в корзину.\n\n⚠️ Важно: при поштучной покупке доступ к дневнику и ЭЙВЕ НЕ подключается. Чтобы получить полный протокол, выбери Бокс или Подписку.');
        }, 500);
    }
    
    if (name.includes('ПОДПИСКА') || name.includes('ПРОТОКОЛ')) {
        setTimeout(() => {
            alert('Отличный выбор! Выбранный формат активирует доступ к ЭЙВА и дневнику с автоматическими корректировками.');
        }, 500);
    }
};

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('quiz-content')) renderStep();
    if (document.getElementById('weightChart')) { 
        checkNewDay();
        renderDiaryUI(); 
        renderChart(); 
    }
});