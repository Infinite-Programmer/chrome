/* --- Config & Themes --- */
const CONFIG = {
    DEFAULT_THEME: 'anime', // Default is now Anime
    DEFAULT_LINKS: [
        { url: 'https://youtube.com', name: 'YouTube' },
        { url: 'https://github.com', name: 'GitHub' },
        { url: 'https://discord.com/app', name: 'Discord' },
        { url: 'https://crunchyroll.com', name: 'Crunchyroll' }
    ]
};

const THEMES = {
    anime: { 
        // High quality Anime Landscape (Night City)
        bg: 'https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=2560', 
        quoteType: 'anime' 
    },
    cyber: { bg: 'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?q=80&w=2000', quoteType: 'tech' },
    lofi: { bg: 'https://images.unsplash.com/photo-1516280440614-6697288d5d38?q=80&w=2000', quoteType: 'chill' },
    minimalist: { bg: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?q=80&w=2000', quoteType: 'calm' },
    dark_matter: { bg: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000', quoteType: 'space' }
};

const QUOTES = {
    anime: ["Whatever you lose, you'll find it again.", "Hard work betrays none.", "Ideally, I’d like to be a cloud.", "It's not about whether you can, it's about whether you will."],
    tech: ["The code is the law.", "System status: Online.", "Silence is the best error handler."],
    calm: ["Simplicity is the ultimate sophistication.", "Just breathe.", "Focus on the now."],
    chill: ["Vibe check passed.", "Stay cozy.", "Lo-Fi beats to study to."],
    space: ["To infinity and beyond.", "We are made of starstuff."]
};

const PLACEHOLDERS = [
    "Search the web...", "Find your next anime...", "What are we coding today?", "Google Search..."
];

/* --- State --- */
let state = {
    theme: CONFIG.DEFAULT_THEME,
    darkMode: true,
    customBg: null,
    links: [...CONFIG.DEFAULT_LINKS]
};

/* --- DOM Elements --- */
const $ = (id) => document.getElementById(id);
const els = {
    time: $('time'),
    seconds: $('seconds'),
    date: $('date'),
    quote: $('quote-text'),
    search: $('search-input'),
    linkGrid: $('links-grid'),
    addLinkBtn: $('add-link-btn'),
    modal: $('settings-modal'),
    openSettings: $('settings-btn'),
    closeSettings: $('close-modal'),
    modeToggle: $('mode-toggle'),
    themeCards: document.querySelectorAll('.theme-card'),
    customUrl: $('custom-url'),
    resetBtn: $('reset-btn')
};

/* --- Init --- */
function init() {
    loadState();
    renderTime();
    setInterval(renderTime, 1000);
    renderLinks();
    setRandomPlaceholder();
    applyTheme();
    setupEvents();
}

/* --- Core Logic --- */
function loadState() {
    const saved = localStorage.getItem('glassStateV3');
    if (saved) state = { ...state, ...JSON.parse(saved) };
}

function saveState() {
    localStorage.setItem('glassStateV3', JSON.stringify(state));
}

function getFavicon(url) {
    try {
        const domain = new URL(url).hostname;
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch {
        return 'https://www.google.com/s2/favicons?domain=google.com&sz=64';
    }
}

/* --- Rendering --- */
function renderTime() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const secStr = now.toLocaleTimeString([], { second: '2-digit' });

    if (els.time.firstChild.textContent !== timeStr) els.time.firstChild.textContent = timeStr;
    els.seconds.textContent = secStr;
    els.date.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
}

function setRandomPlaceholder() {
    els.search.placeholder = PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)];
}

function renderLinks() {
    els.linkGrid.innerHTML = '';
    state.links.forEach((link, index) => {
        const a = document.createElement('a');
        a.className = 'link-item animate__animated animate__fadeIn';
        a.href = link.url;
        a.innerHTML = `<img src="${getFavicon(link.url)}" alt="${link.name}">`;
        
        a.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            if(confirm(`Remove ${link.name}?`)) {
                state.links.splice(index, 1);
                saveState();
                renderLinks();
            }
        });
        
        els.linkGrid.appendChild(a);
    });
}

function applyTheme() {
    // 1. Mode
    document.body.className = state.darkMode ? 'dark-mode' : 'light-mode';
    $('mode-icon').className = state.darkMode ? 'bi bi-moon-stars-fill' : 'bi bi-sun-fill';
    $('mode-text').textContent = state.darkMode ? 'Dark Mode' : 'Light Mode';

    // 2. Background
    const preset = THEMES[state.theme] || THEMES['anime'];
    const bgUrl = state.customBg || preset.bg;
    document.documentElement.style.setProperty('--bg-image', `url('${bgUrl}')`);

    // 3. Quotes (Only update on reload/theme change)
    if(els.quote.textContent === "Loading aesthetics...") {
        const quoteList = QUOTES[preset.quoteType] || QUOTES['anime'];
        els.quote.textContent = `"${quoteList[Math.floor(Math.random() * quoteList.length)]}"`;
    }

    // 4. Indicator
    els.themeCards.forEach(card => {
        card.classList.toggle('active', card.dataset.theme === state.theme && !state.customBg);
    });
}

/* --- Events --- */
function setupEvents() {
    els.search.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && e.target.value) {
            window.location.href = `https://www.google.com/search?q=${encodeURIComponent(e.target.value)}`;
        }
    });

    els.addLinkBtn.addEventListener('click', () => {
        const url = prompt('Enter URL:');
        if (url) {
            let validUrl = url.startsWith('http') ? url : `https://${url}`;
            state.links.push({ url: validUrl, name: 'Link' });
            saveState();
            renderLinks();
        }
    });

    els.themeCards.forEach(card => {
        card.addEventListener('click', () => {
            state.theme = card.dataset.theme;
            state.customBg = null;
            saveState();
            applyTheme();
        });
    });

    els.customUrl.addEventListener('change', (e) => {
        if (e.target.value) {
            state.customBg = e.target.value;
            saveState();
            applyTheme();
            e.target.value = '';
        }
    });

    els.modeToggle.addEventListener('click', () => {
        state.darkMode = !state.darkMode;
        saveState();
        applyTheme();
    });

    els.openSettings.addEventListener('click', () => els.modal.classList.remove('hidden'));
    els.closeSettings.addEventListener('click', () => els.modal.classList.add('hidden'));
    els.modal.addEventListener('click', (e) => { if (e.target === els.modal) els.modal.classList.add('hidden'); });

    els.resetBtn.addEventListener('click', () => {
        if(confirm('Reset all?')) {
            localStorage.removeItem('glassStateV3');
            location.reload();
        }
    });
}

init();