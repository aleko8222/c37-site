// --- ЛОГИКА LIGHTBOX (ЗУМ КАРТИНОК) ---
function openImage(src) {
    document.getElementById('lightbox-img').src = src;
    document.getElementById('image-lightbox').classList.add('active');
}

function closeImage() {
    document.getElementById('image-lightbox').classList.remove('active');
}

// --- SCROLL REVEAL (Intersection Observer) ---
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

// --- ТАКТИЛЬНАЯ ОТДАЧА ДЛЯ КНОПОК ---
document.addEventListener('click', function(e) {
    const btn = e.target.closest('.btn') || e.target.closest('.btn-small') || e.target.closest('.btn-outline') || e.target.closest('.cart-icon-btn');
    if (btn && navigator.vibrate) { navigator.vibrate(30); }
});

// --- УМНЫЙ ШЛЮЗ ДЛЯ OZON ---
function checkCity() {
    const cityInput = document.getElementById('order-city');
    const remoteCities = ['владивосток', 'хабаровск', 'новосибирск', 'красноярск', 'иркутск', 'якутск', 'магадан', 'петропавловск', 'южно-сахалинск'];
    const val = cityInput.value.toLowerCase().trim();
    if (remoteCities.some(city => val.includes(city))) {
        document.getElementById('ozon-modal').style.display = 'flex';
    }
}
function closeOzonModal() { document.getElementById('ozon-modal').style.display = 'none'; }
document.getElementById('ozon-modal').addEventListener('click', function(e) {
    if (e.target === this) closeOzonModal();
});

// --- ЛОГИКА КОРЗИНЫ ---
let cart = JSON.parse(localStorage.getItem('c37_cart')) || [];

function toggleCart() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
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
    // Корзина больше не открывается сама, только обновляется счетчик
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
    const totalPriceEl = document.getElementById('cart-total-price');
    const checkoutBtn = document.getElementById('btn-go-checkout');
    const warningEl = document.getElementById('cart-warning');
    const warningCountEl = document.getElementById('cart-warning-count');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '<p style="color:#777; text-align:center; margin-top:20px;">Пока пусто. Добавь топливо!</p>';
        totalPriceEl.innerText = '0 ₽';
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
        if(warningEl) warningEl.style.display = 'none';
        return;
    }

    container.innerHTML = '';
    let total = 0;
    let totalItems = 0;
    let hasBox = false;

    cart.forEach((item, index) => {
        total += item.price * item.qty;
        totalItems += item.qty;
        if(item.name.includes('ПРОТОКОЛ')) hasBox = true;

        const div = document.createElement('div');
        div.className = 'cart-item';
        div.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p>${item.price} ₽</p>
            </div>
            <div class="cart-item-actions">
                <button onclick="changeQty(${index}, -1)">-</button>
                <span>${item.qty}</span>
                <button onclick="changeQty(${index}, 1)">+</button>
            </div>
        `;
        container.appendChild(div);
    });

    totalPriceEl.innerText = total + ' ₽';

    if (hasBox || totalItems >= 7) {
        checkoutBtn.disabled = false;
        checkoutBtn.style.opacity = '1';
        if(warningEl) warningEl.style.display = 'none';
    } else {
        checkoutBtn.disabled = true;
        checkoutBtn.style.opacity = '0.5';
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
        alert('Необходимо согласие на обработку персональных данных');
        return;
    }
    const name = document.getElementById('order-name').value;
    const phone = document.getElementById('order-phone').value;
    const city = document.getElementById('order-city').value;
    const delivery = document.getElementById('order-delivery').value;

    if (!name || !phone || !city) {
        alert('Пожалуйста, заполни все поля для доставки.');
        return;
    }

    let orderText = `🚀 *Новый заказ C37 FUEL*\n\n`;
    orderText += `👤 Имя: ${name}\n📞 Контакт: ${phone}\n🏙 Город: ${city}\n🚚 Доставка: ${delivery}\n\n*Состав заказа:*\n`;
    
    let total = 0;
    cart.forEach(item => {
        orderText += `- ${item.name} x${item.qty} = ${item.price * item.qty} ₽\n`;
        total += item.price * item.qty;
    });
    orderText += `\n💰 *Итого: ${total} ₽*`;

    console.log(orderText); 
    alert('Заказ принят! Мы свяжемся с тобой в ближайшее время для подтверждения доставки.');
    
    cart = [];
    saveCart();
    updateCartCount();
    renderCart();
    document.getElementById('checkout-form').classList.remove('active');
    document.getElementById('btn-go-checkout').style.display = 'block';
    toggleCart(); 
}

// --- ЛОГИКА ВИДЕО ---
function playIntro() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('eva-video');
    const quizSection = document.getElementById('quiz');
    quizSection.style.display = 'none';
    overlay.style.display = 'flex';
    video.currentTime = 0; 
    video.onerror = endVideo;
    video.play().catch(error => { console.log("Автовоспроизведение заблокировано:", error); endVideo(); });
    video.onended = endVideo;
}

function endVideo() {
    const overlay = document.getElementById('video-overlay');
    const video = document.getElementById('eva-video');
    const quizSection = document.getElementById('quiz');
    overlay.style.display = 'none';
    video.pause();
    quizSection.style.display = 'block';
    setTimeout(() => { quizSection.scrollIntoView({ behavior: 'smooth' }); }, 100);
}

// --- ЛОГИКА ЧАТА ---
function toggleChat() {
    const chat = document.getElementById('chat-window');
    chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
}
function handleEnter(e) { if (e.key === 'Enter') sendMessage(); }

async function sendMessage() {
    const input = document.getElementById('chat-input-field');
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
        const data = await response.json();
        isTyping = false;
        clearTimeout(timeoutId); 
        if(typingMsg.parentNode) messages.removeChild(typingMsg);
        const evaMsg = document.createElement('div');
        evaMsg.className = 'message-eva';
        evaMsg.innerText = data.reply || 'Ошибка: пустой ответ.';
        messages.appendChild(evaMsg);
        messages.scrollTop = messages.scrollHeight;
    } catch (error) {
        console.error("Ошибка:", error);
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

// --- КВИЗ ---
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
    const step = steps[currentStep];
    const container = document.getElementById('quiz-content');
    if (!container) return;
    
    let html = `<div style="font-size: 0.85rem; color: var(--accent); margin-bottom: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">ШАГ ${currentStep + 1} ИЗ ${steps.length}</div>`;
    html += `<p class="question-text">${step.question}</p>`;
    
    if (step.type === 'options') {
        html += `<div class="options">`;
        step.options.forEach(opt => {
            const isSelected = answers[step.id] === opt ? 'selected' : '';
            html += `<button class="option-btn ${isSelected}" onclick="selectOption('${step.id}', '${opt}')">${opt}</button>`;
        });
        html += `</div>`;
    } 
    else if (step.type === 'group_params') {
        html += `
            <div class="quiz-group">
                <label>Пол</label>
                <div class="row-2">
                    <button class="option-btn ${answers.gender === 'Мужской' ? 'selected' : ''}" onclick="selectOption('gender', 'Мужской')">Мужской</button>
                    <button class="option-btn ${answers.gender === 'Женский' ? 'selected' : ''}" onclick="selectOption('gender', 'Женский')">Женский</button>
                </div>
            </div>
            <div class="row-2">
                <div class="quiz-group">
                    <label>Возраст</label>
                    <input type="number" id="input-age" placeholder="Лет" min="10" max="100" value="${answers.age || ''}" oninput="saveNumber('age', this.value)">
                </div>
                <div class="quiz-group">
                    <label>Рост (см)</label>
                    <input type="number" id="input-height" placeholder="См" min="100" max="250" value="${answers.height || ''}" oninput="saveNumber('height', this.value)">
                </div>
            </div>
            <div class="quiz-group">
                <label>Вес (кг)</label>
                <input type="number" id="input-weight" placeholder="Кг" min="30" max="300" value="${answers.weight || ''}" oninput="saveNumber('weight', this.value)">
            </div>
        `;
    }
    else if (step.type === 'group_rhythm') {
        html += `
            <div class="quiz-group">
                <label>Когда сильнее тянет на сладкое?</label>
                <div class="row-2">
                    <button class="option-btn ${answers.craving === 'Утро' ? 'selected' : ''}" onclick="selectOption('craving', 'Утро')">Утро</button>
                    <button class="option-btn ${answers.craving === 'День' ? 'selected' : ''}" onclick="selectOption('craving', 'День')">День</button>
                    <button class="option-btn ${answers.craving === 'Вечер' ? 'selected' : ''}" onclick="selectOption('craving', 'Вечер')">Вечер</button>
                    <button class="option-btn ${answers.craving === 'Нет тяги' ? 'selected' : ''}" onclick="selectOption('craving', 'Нет тяги')">Нет тяги</button>
                </div>
            </div>
            <div class="quiz-group">
                <label>Средняя продолжительность сна?</label>
                <div class="row-2">
                    <button class="option-btn ${answers.sleep === 'Мало' ? 'selected' : ''}" onclick="selectOption('sleep', 'Мало')">Меньше 7 ч</button>
                    <button class="option-btn ${answers.sleep === 'Норма' ? 'selected' : ''}" onclick="selectOption('sleep', 'Норма')">7-9 ч</button>
                </div>
            </div>
        `;
    }
    else if (step.type === 'group_restrictions') {
        html += `
            <div class="quiz-group">
                <label>Есть ли аллергии на арахис?</label>
                <div class="row-2">
                    <button class="option-btn ${answers.allergies === 'Нет' ? 'selected' : ''}" onclick="selectOption('allergies', 'Нет')">Нет</button>
                    <button class="option-btn ${answers.allergies === 'Да' ? 'selected' : ''}" onclick="selectOption('allergies', 'Да')">Да</button>
                </div>
            </div>
            <div class="quiz-group">
                <label>Есть ли что-то из этого? (Стоп-факторы)</label>
                <div class="row-2">
                    <button class="option-btn ${answers.stop === 'Нет' ? 'selected' : ''}" onclick="selectOption('stop', 'Нет')">Нет</button>
                    <button class="option-btn ${answers.stop === 'Да' ? 'selected' : ''}" onclick="selectOption('stop', 'Да')">Да</button>
                </div>
            </div>
        `;
    }

    container.innerHTML = html;
    const progress = ((currentStep) / (steps.length - 1)) * 100;
    document.getElementById('progress').style.width = progress + '%';
    document.getElementById('prevBtn').style.display = currentStep === 0 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').innerText = currentStep === steps.length - 1 ? 'Показать результат' : 'Далее';
}

function selectOption(id, value) { answers[id] = value; renderStep(); }
function saveNumber(id, value) { answers[id] = value; }

function nextStep() {
    const step = steps[currentStep];
    if (step.type === 'group_params') {
        if (!answers.gender || !answers.age || !answers.height || !answers.weight) { alert('Пожалуйста, заполни все параметры.'); return; }
    } else if (step.type === 'group_rhythm') {
        if (!answers.craving || !answers.sleep) { alert('Пожалуйста, ответь на оба вопроса.'); return; }
    } else if (step.type === 'group_restrictions') {
        if (!answers.allergies || !answers.stop) { alert('Пожалуйста, ответь на оба вопроса.'); return; }
        if (answers.stop === 'Да') {
            document.getElementById('quiz-content').innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <h2 style="color: var(--accent); margin-bottom: 20px;">Обратитесь к врачу</h2>
                    <p style="margin-bottom: 20px;">Для твоей безопасности мы не можем собрать протокол автоматически.</p>
                    <button class="btn" onclick="resetQuiz()">Начать заново</button>
                </div>
            `;
            document.querySelector('.nav-buttons').style.display = 'none';
            return;
        }
    } else if (step.type === 'options') {
        if (!answers[step.id]) { alert('Пожалуйста, выбери вариант'); return; }
    }
    if (currentStep < steps.length - 1) { currentStep++; renderStep(); } 
    else { calculateResult(); }
}

function prevStep() { if (currentStep > 0) { currentStep--; renderStep(); } }

function calculateResult() {
    document.querySelector('.progress-bar').style.display = 'none';
    const w = parseFloat(answers.weight);
    const h = parseFloat(answers.height);
    const a = parseFloat(answers.age);
    const isMale = answers.gender === 'Мужской';
    let bmr = isMale ? (10 * w + 6.25 * h - 5 * a + 5) : (10 * w + 6.25 * h - 5 * a - 161);
    let activityMultiplier = 1.375;
    if (answers.activity === 'Сидячий') activityMultiplier = 1.2;
    if (answers.activity === 'Высокий') activityMultiplier = 1.55;
    let tdee = bmr * activityMultiplier;
    let targetCalories = tdee;
    if (answers.goal === 'Похудение') targetCalories = Math.max(bmr, tdee * 0.83);
    if (answers.goal === 'Мышцы') targetCalories = tdee * 1.1;
    const protein = (answers.goal === 'Похудение' ? 2.0 : answers.goal === 'Мышцы' ? 1.9 : 1.7) * w;
    const fat = 0.9 * w;
    const carbs = (targetCalories - 4 * protein - 9 * fat) / 4;

    let boxName = 'ПРОТОКОЛ НЕДЕЛИ (Похудение)';
    let barMorning = 'База Лимитированная';
    let barEvening = 'Коллаген Лайт';
    if (answers.goal === 'Энергия') { boxName = 'ПРОТОКОЛ НЕДЕЛИ (Энергия)'; barMorning = 'Энергия Дисциплины'; barEvening = 'Омега Буст'; } 
    else if (answers.goal === 'Мышцы') { boxName = 'ПРОТОКОЛ НЕДЕЛИ (Мышцы)'; barMorning = 'Протеин База'; barEvening = 'Восстановление'; }
    
    if (answers.allergies === 'Да') {
        if (barMorning === 'База Лимитированная' || barMorning === 'Протеин База') barMorning = 'Коллаген Лайт';
        if (barEvening === 'Протеин База' || barEvening === 'База Лимитированная') barEvening = 'Коллаген Лайт';
    }

    document.getElementById('quiz-content').innerHTML = `
        <h2 style="color: var(--accent); margin-bottom: 10px;">Твой протокол готов</h2>
        <div class="result-grid">
            <div class="result-card"><h3>Калории</h3><div class="value">${Math.round(targetCalories)}</div></div>
            <div class="result-card"><h3>Белки</h3><div class="value">${Math.round(protein)} г</div></div>
            <div class="result-card"><h3>Жиры</h3><div class="value">${Math.round(fat)} г</div></div>
            <div class="result-card"><h3>Углеводы</h3><div class="value">${Math.round(carbs)} г</div></div>
        </div>
        <div style="margin-top: 20px; background: rgba(0,0,0,0.4); padding: 25px; border-radius: 12px; border: 1px solid var(--accent);">
            <p style="margin-bottom: 15px; color: #fff; font-size: 1.1rem; font-weight: bold;">📦 Твой Стартовый Бокс на 7 дней:</p>
            <p style="margin-bottom: 10px;">🌅 Утро (вместо кофе): <strong style="color: var(--accent);">${barMorning} (x3)</strong></p>
            <p style="margin-bottom: 15px;">💼 Офис/Вечер: <strong style="color: var(--accent);">${barEvening} (x4)</strong></p>
            <button class="btn" style="width:100%; margin-bottom:10px;" onclick="addToCart('${boxName}', 1190);">Заказать Бокс за 1190 ₽</button>
            <a href="https://t.me/c37_eva" target="_blank" class="btn btn-outline" style="width:100%; text-decoration:none;">Подписаться на Эйву в TG</a>
        </div>
        <p class="disclaimer">ЭЙВА — цифровой ведущий, а не врач. Это ориентировочный протокол.</p>
    `;
    document.querySelector('.nav-buttons').style.display = 'none';
}

function resetQuiz() {
    currentStep = 0; answers = {};
    document.querySelector('.progress-bar').style.display = 'block';
    document.querySelector('.nav-buttons').style.display = 'flex';
    renderStep();
}

// --- ГЛОБАЛЬНЫЙ ESC ---
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