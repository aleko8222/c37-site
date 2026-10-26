// ==========================================
// LIGHTBOX (ЗУМ КАРТИНОК)
// ==========================================
function openImage(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('image-lightbox').classList.add('active');
}
function closeImage() {
    document.getElementById('image-lightbox').classList.remove('active');
}

// ==========================================
// SCROLL REVEAL
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
// ТАКТИЛЬНАЯ ОТДАЧА
// ==========================================
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn') || e.target.closest('.btn-small') || e.target.closest('.btn-outline') || e.target.closest('.cart-icon-btn');
    if (btn && navigator.vibrate) { navigator.vibrate(30); }
});

// ==========================================
// ШЛЮЗ OZON
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
    if (typeof showToast === 'function') showToast('В корзине', name, '🛒');
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
        if(item.name.includes('ПРОТОКОЛ')) hasBox = true;

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
// КВИЗ
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

    document.getElementById('quiz-content').innerHTML = `
        <h2 style="color: var(--accent);">Твой протокол готов</h2>
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
// ГЛОБАЛЬНЫЙ ESC
// ==========================================
document.addEventListener('keydown', function(e) {
    if (e.key !== 'Escape') return;
    const ozon = document.getElementById('ozon-modal');
    if (ozon && ozon.style.display === 'flex') { closeOzonModal(); }
    const sidebar = document.getElementById('cart-sidebar');
    if (sidebar && sidebar.classList.contains('active')) { toggleCart(); }
    const chat = document.getElementById('chat-window');
    if (chat && chat.style.display === 'flex') { toggleChat(); }
    const video = document.getElementById('video-overlay');
    if (video && video.style.display === 'flex') { endVideo(); }
    const lightbox = document.getElementById('image-lightbox');
    if (lightbox && lightbox.classList.contains('active')) { closeImage(); }
});

// ==========================================
// ДНЕВНИК: ЕДА + ВЕС
// ==========================================
let foodData = JSON.parse(localStorage.getItem('c37_food_data')) || [];
let weightData = JSON.parse(localStorage.getItem('c37_weight_history')) || [];
let targetWeight = localStorage.getItem('c37_target_weight') || '';
let weightChartInstance = null;

// --- ПАРСИНГ ЕДЫ ---
async function analyzeFood() {
    const input = document.getElementById('food-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text) { alert('Напиши, что ты съел!'); return; }

    const btn = document.getElementById('btn-analyze');
    btn.innerText = '⏳ Эйва думает...';
    btn.disabled = true;

    try {
        const response = await fetch('https://c37-python-rag.de1.netrun.io/api/parse-food', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: text })
        });
        
        if (!response.ok) {
            throw new Error(`Сервер вернул ошибку ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
            data.items.forEach(item => {
                foodData.push({
                    id: Date.now() + Math.random(),
                    name: item.name,
                    cal: item.cal || 0,
                    prot: item.prot || 0,
                    fat: item.fat || 0,
                    carb: item.carb || 0
                });
            });
            localStorage.setItem('c37_food_data', JSON.stringify(foodData));
            input.value = '';
            renderFoodList();
        } else {
            alert('Не удалось распознать еду. Попробуй написать иначе.');
        }
    } catch (error) {
        console.error("Ошибка парсинга:", error);
        alert(`Ошибка: ${error.message}`);
    } finally {
        btn.innerText = '✨ Посчитать через ИИ';
        btn.disabled = false;
    }
}

function removeFood(id) {
    foodData = foodData.filter(item => item.id !== id);
    localStorage.setItem('c37_food_data', JSON.stringify(foodData));
    renderFoodList();
}

function resetFood() {
    if(confirm('Очистить дневник еды?')) {
        foodData = [];
        localStorage.setItem('c37_food_data', JSON.stringify(foodData));
        renderFoodList();
    }
}

function renderFoodList() {
    const listEl = document.getElementById('food-list');
    if (!listEl) return;

    if (foodData.length === 0) {
        listEl.innerHTML = '<li style="color:#777; text-align:center; padding: 20px;">Пока пусто. Напиши, что съел!</li>';
        updateMacros(0, 0, 0, 0);
        return;
    }

    listEl.innerHTML = '';
    let totalCal = 0, totalProt = 0, totalFat = 0, totalCarb = 0;

    foodData.forEach(item => {
        totalCal += item.cal; totalProt += item.prot; totalFat += item.fat; totalCarb += item.carb;
                const li = document.createElement('li');
        li.innerHTML = `
            <div style="display:flex; flex-direction:column;">
                <strong>${item.name}</strong>
                <span class="macros" style="font-size: 0.8rem; color: #777; margin-top: 4px;">
                    ${item.cal} ккал &nbsp;•&nbsp; Белки: ${item.prot}г &nbsp;•&nbsp; Жиры: ${item.fat}г &nbsp;•&nbsp; Углеводы: ${item.carb}г
                </span>
            </div>
            <button onclick="removeFood(${item.id})" style="background:none; border:none; color:#ff4444; cursor:pointer; font-size: 1.2rem;">✕</button>
        `;
        listEl.appendChild(li);
    });

    updateMacros(totalCal, totalProt, totalFat, totalCarb);
}

function updateMacros(cal, prot, fat, carb) {
    const calEl = document.getElementById('total-calories');
    if (!calEl) return;
    calEl.innerText = Math.round(cal);
    document.getElementById('total-protein').innerText = Math.round(prot);
    document.getElementById('total-fat').innerText = Math.round(fat);
    document.getElementById('total-carbs').innerText = Math.round(carb);
    document.getElementById('calories-bar').style.width = Math.min((cal / 2000) * 100, 100) + '%';
    document.getElementById('protein-bar').style.width = Math.min((prot / 120) * 100, 100) + '%';
    document.getElementById('fat-bar').style.width = Math.min((fat / 70) * 100, 100) + '%';
    document.getElementById('carbs-bar').style.width = Math.min((carb / 200) * 100, 100) + '%';
}

// --- ВЕС ---
function saveWeight() {
    const input = document.getElementById('current-weight');
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
}

function saveTargetWeight() {
    targetWeight = document.getElementById('target-weight').value;
    localStorage.setItem('c37_target_weight', targetWeight);
    renderChart();
}

function renderChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    // Если данных нет вообще
    if (weightData.length === 0) {
        canvas.parentElement.innerHTML = '<div style="height: 300px; display: flex; align-items: center; justify-content: center; color: #777; text-align: center;">Пока нет данных. Введи свой первый вес!</div>';
        return;
    }

    const ctx = canvas.getContext('2d');
    
    // Сортируем данные по дате (на всякий случай, чтобы линия не путалась)
    // Для этого преобразуем "26.10" в объект даты для сортировки
    const sortedData = [...weightData].sort((a, b) => {
        const [dayA, monthA] = a.date.split('.');
        const [dayB, monthB] = b.date.split('.');
        return new Date(`2026-${monthA}-${dayA}`) - new Date(`2026-${monthB}-${dayB}`);
    });

    const labels = sortedData.map(item => item.date);
    const dataPoints = sortedData.map(item => item.weight);

    // Вычисляем минимальный и максимальный вес для красивой шкалы
    let minWeight = Math.min(...dataPoints);
    let maxWeight = Math.max(...dataPoints);
    
    // Если есть цель, учитываем её в шкале
    if (targetWeight) {
        minWeight = Math.min(minWeight, parseFloat(targetWeight));
        maxWeight = Math.max(maxWeight, parseFloat(targetWeight));
    }
    
    // Добавляем отступы по 1 кг вверх и вниз, чтобы линия не прилипала к краям
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
                    tension: 0.3 // Плавные линии
                },
                                {
                    label: 'Цель',
                    data: labels.map(() => targetWeight ? parseFloat(targetWeight) : null),
                    borderColor: '#4CAF50', // Зеленый цвет
                    borderWidth: 3,         // Делаем линию толще
                    borderDash: [],         // Убираем пунктир, делаем сплошной полосой
                    pointRadius: 0,         // Убираем точки на линии цели
                    fill: false,
                    tension: 0              // Линия идеально ровная (не изгибается)
                }
            ]
        },
        options: {
            responsive: true, 
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: { 
                legend: { display: true, position: 'top' },
                tooltip: {
                    backgroundColor: 'rgba(20, 24, 28, 0.9)',
                    titleColor: '#FF6B1A',
                    bodyColor: '#fff',
                    borderColor: 'rgba(255, 107, 26, 0.3)',
                    borderWidth: 1,
                    padding: 10,
                    callbacks: {
                        label: function(context) {
                            return ` ${context.dataset.label}: ${context.parsed.y} кг`;
                        }
                    }
                }
            },
            scales: {
                y: { 
                    min: minWeight,
                    max: maxWeight,
                    grid: { color: 'rgba(255,255,255,0.05)' },
                    ticks: { stepSize: 1 } // Делаем шаг в 1 кг, чтобы не было дробных чисел на оси
                },
                x: { 
                    grid: { display: false } 
                }
            }
        }
    });

    if (targetWeight && document.getElementById('target-weight')) {
        document.getElementById('target-weight').value = targetWeight;
    }
}

function askEvaAboutProgress() {
    const calEl = document.getElementById('total-calories');
    const cal = calEl ? calEl.innerText : 0;
    let weightText = "Я пока не записывал(а) свой вес.";
    if (weightData.length > 0) {
        const startWeight = weightData[0].weight;
        const currentWeight = weightData[weightData.length - 1].weight;
        const diff = (currentWeight - startWeight).toFixed(1);
        const diffStr = diff < 0 ? `похудел(а) на ${Math.abs(diff)} кг` : (diff > 0 ? `набрал(а) ${diff} кг` : `вес стоит на месте`);
        weightText = `Стартовый вес ${startWeight} кг, сейчас ${currentWeight} кг. Я ${diffStr}. Цель: ${targetWeight || 'не задана'}.`;
    }
    const promptText = `Эйва, привет! Проанализируй мой день. Я съел(а) сегодня ${cal} ккал. ${weightText} Как тебе мой прогресс и что мне съесть завтра, чтобы ускорить результат?`;
    toggleChat();
    document.getElementById('chat-input-field').value = promptText;
    sendMessage();
}

// --- ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ ---
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('quiz-content')) renderStep();
    if (document.getElementById('weightChart')) { renderChart(); renderFoodList(); }
});
