// ==========================================
// МЕТРИКА И СОГЛАСИЕ НА COOKIE (152-ФЗ)
// ==========================================
const YM_ID = 00000000; // ВСТАВЬ СЮДА НОМЕР СЧЕТЧИКА МЕТРИКИ!

function initMetrika(){
  if (window.ym) return;
  (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
  m[i].l=1*new Date();k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
  (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");
  ym(YM_ID, "init", { clickmap:true, trackLinks:true, accurateTrackBounce:true });
}

window.addEventListener('c37:cookie-consent', e => { if (e.detail.mode === 'all') initMetrika(); });
if (localStorage.getItem('c37_cookie') === 'all') initMetrika();
function track(ev, params){ if (window.ym) ym(YM_ID, 'reachGoal', ev, params || {}); }

// ==========================================
// ВСПЛЫВАЮЩИЕ ПЛАШКИ (TOAST)
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
    const modal = document.getElementById('ozon-modal');
    if (modal && modal.style.display === 'flex') return; // Не спамим, если уже открыто
    const cityInput = document.getElementById('order-city');
    if (!cityInput) return;
    const remoteCities = ['владивосток','хабаровск','новосибирск','красноярск','иркутск','якутск','магадан','петропавловск','южно-сахалинск'];
    const val = cityInput.value.toLowerCase().trim();
    if (remoteCities.some(city => val.includes(city))) {
        if (modal) modal.style.display = 'flex';
    }
}
function closeOzonModal() { 
    const modal = document.getElementById('ozon-modal');
    if (modal) modal.style.display = 'none'; 
}
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
    
    // Показываем всплывашку, НЕ открываем корзину и НЕ показываем alert
    showToast('Добавлено в корзину', name, '🛒');
    track('add_to_cart', {name: name});
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
        // Если есть Бокс или Подписка — минималка выполнена
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
    track('purchase_success', {total: total});
    
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
    track('play_intro');
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
    track('start_quiz');
}

// ==========================================
// ЧАТ С ЭЙВОЙ
// ==========================================
function toggleChat() {
    const chat = document.getElementById('chat-window');
    if (!chat) return;
    chat.style.display = chat.style.display === 'flex' ? 'none' : 'flex';
    track('open_chat');
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
        track('chat_message');
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
// КВИЗ (7 ШАГОВ)
// ==========================================
const steps = [
    { id: 'goal', type: 'options', question: 'Твоя цель?', options: ['Похудение', 'Энергия', 'Мышцы'] },
    { id: 'params1', type: 'group_params1', question: 'О тебе' },
    { id: 'params2', type: 'group_params2', question: 'Твои размеры' },
    { id: 'activity', type: 'options', question: 'Уровень активности?', options: ['Сидячий', 'Средний', 'Высокий'] },
    { id: 'rhythm', type: 'group_rhythm', question: 'Когда сильнее тянет на сладкое?' },
    { id: 'sleep', type: 'group_sleep', question: 'Сколько спишь в среднем?' },
    { id: 'restrictions', type: 'group_restrictions', question: 'Ограничения' }
];
let currentStep = 0;
let answers = {};

function renderStep() {
    const container = document.getElementById('quiz-content');
    if (!container) return;
    const step = steps[currentStep];
    let html = `<div style="font-size:0.85rem;color:var(--accent);margin-bottom:10px;font-weight:bold;text-transform:uppercase;">ШАГ ${currentStep + 1} ИЗ ${steps.length}</div>`;
    html += `<p class="question-text">${step.question}</p>`;
    
    if (step.type === 'options') {
        html += `<div class="options">`;
        step.options.forEach(opt => {
            const sel = answers[step.id] === opt ? 'selected' : '';
            html += `<button class="option-btn ${sel}" onclick="selectOption('${step.id}','${opt}')">${opt}</button>`;
        });
        html += `</div>`;
    } else if (step.type === 'group_params1') {
        html += `
            <div class="quiz-group"><label>Пол</label><div class="row-2">
                <button class="option-btn ${answers.gender === 'Мужской' ? 'selected' : ''}" onclick="selectOption('gender', 'Мужской')">Мужской</button>
                <button class="option-btn ${answers.gender === 'Женский' ? 'selected' : ''}" onclick="selectOption('gender', 'Женский')">Женский</button>
            </div></div>
            <div class="quiz-group"><label>Возраст</label><input type="number" placeholder="Лет" min="18" max="75" value="${answers.age || ''}" oninput="saveNumber('age', this.value)"></div>`;
    } else if (step.type === 'group_params2') {
        html += `
            <div class="row-2">
                <div class="quiz-group"><label>Рост (см)</label><input type="number" placeholder="См" min="140" max="220" value="${answers.height || ''}" oninput="saveNumber('height', this.value)"></div>
                <div class="quiz-group"><label>Вес (кг)</label><input type="number" placeholder="Кг" min="45" max="180" value="${answers.weight || ''}" oninput="saveNumber('weight', this.value)"></div>
            </div>`;
    } else if (step.type === 'group_rhythm') {
        html += `<div class="options">`;
        ['Утро', 'День', 'Вечер', 'Нет тяги'].forEach(v => {
            const sel = answers.craving === v ? 'selected' : '';
            html += `<button class="option-btn ${sel}" onclick="selectOption('craving','${v}')">${v}</button>`;
        });
        html += `</div>`;
    } else if (step.type === 'group_sleep') {
        html += `<div class="row-2">
            <button class="option-btn ${answers.sleep === 'Мало' ? 'selected' : ''}" onclick="selectOption('sleep', 'Мало')">Меньше 7 ч</button>
            <button class="option-btn ${answers.sleep === 'Норма' ? 'selected' : ''}" onclick="selectOption('sleep', 'Норма')">7–9 ч</button>
        </div>`;
    } else if (step.type === 'group_restrictions') {
        html += `
            <div class="quiz-group"><label>Аллергия на арахис?</label><div class="row-2">
                <button class="option-btn ${answers.allergies === 'Нет' ? 'selected' : ''}" onclick="selectOption('allergies', 'Нет')">Нет</button>
                <button class="option-btn ${answers.allergies === 'Да' ? 'selected' : ''}" onclick="selectOption('allergies', 'Да')">Да</button>
            </div></div>
            <div class="quiz-group"><label>Стоп-факторы? (беременность/ГВ, РПП, хронические)</label><div class="row-2">
                <button class="option-btn ${answers.stop === 'Нет' ? 'selected' : ''}" onclick="selectOption('stop', 'Нет')">Нет</button>
                <button class="option-btn ${answers.stop === 'Да' ? 'selected' : ''}" onclick="selectOption('stop', 'Да')">Да</button>
            </div></div>`;
    }
    container.innerHTML = html;
    document.getElementById('progress').style.width = (currentStep / (steps.length - 1)) * 100 + '%';
    document.getElementById('prevBtn').style.display = currentStep === 0 ? 'none' : 'inline-block';
    document.getElementById('nextBtn').innerText = currentStep === steps.length - 1 ? 'Показать результат' : 'Далее';
}

function selectOption(id, value) { answers[id] = value; renderStep(); }
function saveNumber(id, value) { answers[id] = value; }

function doctorScreen() {
    document.getElementById('quiz-content').innerHTML = `
        <div style="text-align:center;padding:20px;">
            <h2 style="color:var(--accent);">Обратитесь к врачу</h2>
            <p style="margin:20px 0;">Для твоей безопасности мы не можем собрать протокол автоматически. Уроки ЭЙВЫ останутся открытыми.</p>
            <button class="btn" onclick="resetQuiz()">Начать заново</button>
        </div>`;
    document.querySelector('.nav-buttons').style.display = 'none';
}

function nextStep() {
    const step = steps[currentStep];
    if (step.type === 'group_params1') {
        const a = parseInt(answers.age, 10);
        if (!answers.gender || !a) { alert('Укажи пол и возраст.'); return; }
        if (a < 18 || a > 75) { doctorScreen(); return; }
    }
    if (step.type === 'group_params2') {
        const h = parseFloat(answers.height), w = parseFloat(answers.weight);
        if (!h || !w) { alert('Укажи рост и вес.'); return; }
        if (h < 140 || h > 220 || w < 45 || w > 180) { alert('Проверь данные: рост 140–220 см, вес 45–180 кг.'); return; }
    }
    if (step.type === 'group_rhythm' && !answers.craving) { alert('Выбери вариант.'); return; }
    if (step.type === 'group_sleep' && !answers.sleep) { alert('Выбери вариант.'); return; }
    if (step.type === 'group_restrictions') {
        if (!answers.allergies || !answers.stop) { alert('Ответь на оба вопроса.'); return; }
        if (answers.stop === 'Да') { doctorScreen(); return; }
    }
    if (step.type === 'options' && !answers[step.id]) { alert('Выбери вариант.'); return; }
    
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

    // СОХРАНЕНИЕ ДЛЯ ДНЕВНИКА
    const protocolData = {
        goal: answers.goal, gender: answers.gender, age: answers.age, height: answers.height, weight: answers.weight,
        activity: answers.activity, craving: answers.craving, kcal: Math.round(kcal), protein: Math.round(protein),
        fat: Math.round(fat), carbs: Math.round(carbs), barMorning: barMorning, barEvening: barEvening
    };
    localStorage.setItem('c37_protocol', JSON.stringify(protocolData));
    localStorage.setItem('c37_target_calories', Math.round(kcal));
    track('protocol_created', {goal: answers.goal});

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
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('quiz-content')) renderStep();
});
