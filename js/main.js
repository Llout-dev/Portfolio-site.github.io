// Loading Screen Animation
const dropShadow = document.getElementById('dropShadow');
let isPink = true;
let startTime;
let doorsOpened = false;

// Массив фраз для загрузочного экрана
const loadingPhrases = [
    "Лифт прибывает...",
    "Ожидаем лифт...",
    "Двери закрываются",
    "Выбираем этаж",
    "Направление: вверх",
    "Не прислоняться!",
    "Застряли между этажами",
    "Этаж? Ой, забыла!",
    "Неизвестный этаж...",
    "Лифт вызывали?"
];

let currentPhraseIndex = 0;
let phraseInterval;
let soundPlayed = false;
let lastPhraseIndex = -1; // Для предотвращения повторений подряд

function interpolateColor(color1, color2, factor) {
    const result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - color1[i]));
    }
    return `rgba(${result[0]}, ${result[1]}, ${result[2]}, ${result[3]})`;
}

function animateShadowColor(timestamp) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;

    const duration = 5000;
    const factor = Math.min(elapsed / duration, 1);

    const color1 = isPink ? [234, 83, 141, 1] : [215, 230, 234, 1];
    const color2 = isPink ? [215, 230, 234, 1] : [234, 83, 141, 1];

    if (dropShadow) {
        dropShadow.setAttribute('flood-color', interpolateColor(color1, color2, factor));
    }

    if (factor < 1) {
        requestAnimationFrame(animateShadowColor);
    } else {
        isPink = !isPink;
        startTime = null;
        setTimeout(() => {
            requestAnimationFrame(animateShadowColor);
        }, 1000);
    }
}

if (dropShadow) {
    requestAnimationFrame(animateShadowColor);
}

// Функция для воспроизведения звука лифта
function playElevatorSound() {
    if (soundPlayed) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.1);

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.3);

        soundPlayed = true;
    } catch (e) {
        console.log("Звук не поддерживается:", e);
    }
}

// Функция для получения случайной фразы (без повторения подряд)
function getRandomPhrase() {
    if (loadingPhrases.length <= 1) return loadingPhrases[0];

    let randomIndex;
    do {
        randomIndex = Math.floor(Math.random() * loadingPhrases.length);
    } while (randomIndex === lastPhraseIndex && loadingPhrases.length > 1);

    lastPhraseIndex = randomIndex;
    return loadingPhrases[randomIndex];
}

// Функция для анимации текста (появление по буквам) - БЫСТРАЯ
function animateText(element, text) {
    element.textContent = '';
    element.style.opacity = '1';
    element.style.whiteSpace = 'pre-wrap'; // Сохраняем пробелы

    const chars = text.split('');
    let charIndex = 0;

    function addNextChar() {
        if (charIndex < chars.length) {
            let charSpan;

            if (chars[charIndex] === ' ') {
                // Для пробелов создаем отдельный элемент
                charSpan = document.createElement('span');
                charSpan.className = 'phrase-space';
                charSpan.innerHTML = '&nbsp;';
                charSpan.style.width = '0.3em';
                charSpan.style.display = 'inline-block';
            } else {
                // Для обычных символов
                charSpan = document.createElement('span');
                charSpan.className = 'phrase-char';
                charSpan.textContent = chars[charIndex];
            }

            charSpan.style.opacity = '0';
            charSpan.style.transform = 'translateY(10px)';
            charSpan.style.transition = 'opacity 0.2s ease, transform 0.2s ease';

            element.appendChild(charSpan);

            // Анимируем появление буквы
            setTimeout(() => {
                charSpan.style.opacity = '1';
                charSpan.style.transform = 'translateY(0)';
            }, 10);

            charIndex++;
            setTimeout(addNextChar, 50);
        }
    }

    addNextChar();
}

// Функция для смены фразы
function changeLoadingPhrase() {
    const phraseElement = document.querySelector('.loading-text');
    if (!phraseElement) return;

    // Затухаем текущую фразу
    phraseElement.style.opacity = '0';
    phraseElement.style.transform = 'translateY(10px)';

    setTimeout(() => {
        // Получаем случайную фразу
        const newPhrase = getRandomPhrase();

        // Анимируем новую фразу
        animateText(phraseElement, newPhrase);

        // Возвращаем прозрачность
        setTimeout(() => {
            phraseElement.style.opacity = '1';
            phraseElement.style.transform = 'translateY(0)';
        }, 50);
    }, 300);
}

// Функция для запуска смены фраз СРАЗУ при загрузке
function startLoadingPhrases() {
    const phraseElement = document.querySelector('.loading-text');
    if (!phraseElement || loadingPhrases.length === 0) return;

    // Сразу показываем первую случайную фразу
    const initialPhrase = getRandomPhrase();
    phraseElement.textContent = ''; // Очищаем текущий текст
    animateText(phraseElement, initialPhrase);

    // Через 5 секунд начинаем менять фразы случайным образом
    setTimeout(() => {
        phraseInterval = setInterval(changeLoadingPhrase, 5000);
    }, 5000);
}

function getRandomDoorVariant() {
    const variants = [1, 2, 3, 4, 5, 6];
    return variants[Math.floor(Math.random() * variants.length)];
}

function openDoors() {
    const doorWrapper = document.getElementById('door-wrapper');
    const doorLeft = document.getElementById('door-left');
    const doorRight = document.getElementById('door-right');
    const preloader = document.getElementById('preloader');
    const loadingScreen = document.getElementById('loading');
    const svg2 = document.querySelector('.svg2');

    if (!doorWrapper || !doorLeft || !doorRight || !preloader || !loadingScreen) {
        return;
    }

    // Выбираем случайный вариант анимации
    const variant = getRandomDoorVariant();
    doorWrapper.classList.add(`doors-variant-${variant}`);

    if (variant === 5) {
        doorWrapper.style.perspective = '1000px';
    }

    // Сразу показываем сайт
    document.body.style.overflow = 'auto';

    // Сразу показываем SVG кота
    if (svg2) {
        svg2.classList.add('visible');
    }

    // Убираем прелоадер с плавным исчезновением
    preloader.style.opacity = '0';

    setTimeout(() => {
        // Запускаем анимацию открытия дверей
        doorLeft.classList.add('active');
        doorRight.classList.add('active');
        doorWrapper.style.backgroundColor = 'transparent';

        // Воспроизводим звук лифта при открытии дверей
        playElevatorSound();

        // СТАВИМ ФЛАГ ЧТО ДВЕРИ ОТКРЫЛИСЬ
        doorsOpened = true;

        // ЗАПУСКАЕМ АНИМАЦИИ САЙТА ПОСЛЕ ОТКРЫТИЯ ДВЕРЕЙ
        startSiteAnimations();

        console.log(`Лифт открывается: вариант ${variant}`);
    }, 400);

    // Скрываем экран загрузки после анимации
    setTimeout(() => {
        // Останавливаем смену фраз
        if (phraseInterval) {
            clearInterval(phraseInterval);
        }

        // Плавно скрываем текст загрузки
        const phraseElement = document.querySelector('.loading-text');
        if (phraseElement) {
            phraseElement.style.transition = 'opacity 0.5s ease';
            phraseElement.style.opacity = '0';
        }

        loadingScreen.style.display = 'none';

        // Сбрасываем стили для следующей загрузки
        setTimeout(() => {
            doorLeft.classList.remove('active');
            doorRight.classList.remove('active');
            doorWrapper.classList.remove(`doors-variant-${variant}`);
            doorWrapper.style.backgroundColor = 'var(--background)';
            doorWrapper.style.perspective = 'none';
            doorLeft.style.transform = '';
            doorRight.style.transform = '';
            doorLeft.style.opacity = '1';
            doorRight.style.opacity = '1';
            soundPlayed = false;
        }, 3000);
    }, 1500);
}

function startSiteAnimations() {
    // Запускаем анимацию заголовка hero
    const titleLines = document.querySelectorAll('.hero-title .title-line');
    titleLines.forEach(line => {
        splitText(line);
    });

    // Запускаем Intersection Observer для анимации элементов при скролле
    const animateElements = document.querySelectorAll('.work-item, .service-card, .section-header');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Запускаем анимацию плавающих карточек (если они не анимированы через CSS)
    const floatingCards = document.querySelectorAll('.floating-card');
    floatingCards.forEach(card => {
        card.style.animationPlayState = 'running';
    });
}

// ЗАПУСКАЕМ СМЕНУ ФРАЗ СРАЗУ ПРИ ЗАГРУЗКЕ ДОМ
document.addEventListener('DOMContentLoaded', () => {
    // Запускаем смену фраз сразу при загрузке страницы
    startLoadingPhrases();

    // НЕ запускаем анимации заголовка здесь!
    // Они запустятся позже в startSiteAnimations()

    // Инициализируем остальные вещи (тема, бургер и т.д.)
    const current = getPreferredTheme();
    applyTheme(current);

    const btn = document.getElementById('themeToggle');
    if (btn) {
        btn.textContent = current === 'dark' ? 'Светлая' : 'Тёмная';
        btn.addEventListener('click', () => {
            const next = (document.documentElement.getAttribute('data-theme') === 'dark') ? 'light' : 'dark';
            applyTheme(next);
            localStorage.setItem('theme', next);
            btn.textContent = next === 'dark' ? 'Светлая' : 'Тёмная';
            initMermaid();
        });
    }

    initMermaid();

    // Инициализируем бургер-меню
    const burger = document.querySelector('.burger');
    const nav = document.querySelector('.nav');
    if (burger && nav) {
        burger.addEventListener('click', () => {
            burger.classList.toggle('active');
            nav.classList.toggle('active');
        });
    }
});

// Запускаем анимацию дверей после полной загрузки страницы
window.addEventListener('load', function () {
    // Задержка для теста (потом можно уменьшить)
    const LOADING_DELAY = 3000; // 3 секунды для теста

    setTimeout(() => {
        openDoors();
    }, LOADING_DELAY);
});

// Custom Cursor
const cursor = document.querySelector('.custom-cursor');
if (cursor) {
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    const hoverElements = document.querySelectorAll('a, button, .work-item, .service-card');
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.classList.add('hover');
        });
        el.addEventListener('mouseleave', () => {
            cursor.classList.remove('hover');
        });
    });
}

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    const svg2 = document.querySelector('.svg2');

    if (window.scrollY > 100) {
        header.classList.add('scrolled');
        if (svg2) {
            svg2.classList.add('scrolled');
        }
    } else {
        header.classList.remove('scrolled');
        if (svg2) {
            svg2.classList.remove('scrolled');
        }
    }
});

// Text animation splitting для основного заголовка
function splitText(element) {
    const text = element.textContent;
    element.textContent = '';

    const chars = text.split('');
    chars.forEach((char, index) => {
        const charSpan = document.createElement('span');
        charSpan.className = 'char';
        charSpan.textContent = char;
        charSpan.style.display = 'inline-block';
        charSpan.style.setProperty('--char-index', index);
        element.appendChild(charSpan);
    });
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements for animation
document.addEventListener('DOMContentLoaded', () => {
    const animateElements = document.querySelectorAll('.work-item, .service-card, .section-header');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Burger menu functionality - уже инициализировано в первом DOMContentLoaded

// Theme toggle
function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
}

function getPreferredTheme() {
    const saved = localStorage.getItem('theme');
    if (saved) return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
}

// Mermaid theme synced with CSS variables
function initMermaid() {
    if (typeof mermaid === 'undefined') return;

    const styles = getComputedStyle(document.documentElement);
    const bg = styles.getPropertyValue('--surface').trim() || '#D7E6EA';
    const primaryText = styles.getPropertyValue('--text').trim() || '#171224';
    const accent = styles.getPropertyValue('--accent').trim() || '#EA538D';
    const border = styles.getPropertyValue('--border').trim() || '#D7E6EA';
    const themeMode = document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'neutral';
    const gentleBlue = 'rgba(215, 230, 234, 0.55)';
    const neutral1 = 'rgba(0, 0, 0, 0.06)';
    const neutral2 = 'rgba(0, 0, 0, 0.12)';

    mermaid.initialize({
        startOnLoad: true,
        theme: themeMode,
        themeVariables: {
            primaryColor: bg,
            primaryTextColor: primaryText,
            primaryBorderColor: border,
            lineColor: border,
            secondaryColor: bg,
            tertiaryColor: bg,
            noteBkgColor: bg,
            noteTextColor: primaryText,
            edgeLabelBackground: bg,
            fontFamily: 'Inter, sans-serif',
            fontSize: '16px',
            textColor: primaryText,
            mainBkg: bg,
            nodeBorder: border,
            clusterBkg: bg,
            clusterBorder: border,
            errorBkgColor: '#ffe5e5',
            errorTextColor: '#b00020',
            actorBkg: bg,
            actorTextColor: primaryText,
            labelTextColor: primaryText,
            sequenceNumberColor: accent,
            primaryColorDark: bg,
            secondaryBorderColor: border,
            tertiaryBorderColor: border,
            edgeColor: border,
            signalColor: accent,
            taskDoneColor: accent,
            pie1: accent,
            pie2: gentleBlue,
            pie3: neutral1,
            pie4: neutral2,
            pieSectionTextSize: '14px',
            pieTitleTextSize: '0px',
            pieOuterStrokeWidth: '0',
            pieOuterStrokeColor: 'transparent'
        }
    });
}

