import { PHASES, GAMES, NUMBER_COLORS } from './data.js';
import { audio } from './audio.js';
import { THEMES, getTheme, setTheme, loadSavedTheme } from './themes.js';
import { createCountingGame } from './games/counting.js';
import { createSubitizingGame } from './games/subitizing.js';
import { createMatchingGame } from './games/matching.js';
import { createCollectingGame } from './games/collecting.js';
import { createFindNumberGame } from './games/find-number.js';

const app = document.getElementById('app');

const state = {
    currentPhase: 0,
    currentGame: null,
    soundEnabled: true,
};

// Load saved state
try {
    const saved = localStorage.getItem('learn_numbers_phase');
    if (saved != null) state.currentPhase = parseInt(saved);
} catch (e) { /* ignore */ }

loadSavedTheme();

function saveState() {
    try {
        localStorage.setItem('learn_numbers_phase', state.currentPhase);
    } catch (e) { /* ignore */ }
}

// ====== Screen Management ======
function clearScreens() {
    app.innerHTML = '';
}

function showScreen(html, className = '') {
    clearScreens();
    const screen = document.createElement('div');
    screen.className = `screen ${className}`;
    screen.innerHTML = html;
    app.appendChild(screen);
    requestAnimationFrame(() => screen.classList.add('active'));
    return screen;
}

// ====== Theme Icon Helper ======
function themeIconHtml(theme, size = 60) {
    return `<img src="${theme.icon}" alt="${theme.name}" class="theme-photo" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
}

// ====== Splash Screen ======
function showSplash() {
    const nums = Array.from({ length: 10 }, (_, i) => {
        const n = i + 1;
        return `<span class="splash-num" style="background:${NUMBER_COLORS[n]}">${n}</span>`;
    }).join('');

    const screen = showScreen(`
        <div class="splash-title">בואו נלמד<br>מספרים!</div>
        <div class="splash-numbers">${nums}</div>
        <button class="play-btn" id="start-btn">\u25B6\uFE0F</button>
    `, 'splash');

    screen.querySelector('#start-btn').addEventListener('click', () => {
        audio.init();
        showThemePicker();
    });
}

// ====== Theme Picker Screen ======
function showThemePicker() {
    const currentTheme = getTheme();
    const themesHtml = THEMES.map(t => `
        <button class="theme-card ${t.id === currentTheme.id ? 'selected' : ''}" data-theme="${t.id}">
            <div class="theme-icon-wrap">${themeIconHtml(t, 70)}</div>
            <div class="theme-name">${t.name}</div>
        </button>
    `).join('');

    const screen = showScreen(`
        <div class="home-title">בחרו נושא</div>
        <div class="themes-grid">${themesHtml}</div>
    `, 'theme-picker');

    screen.querySelectorAll('.theme-card').forEach(btn => {
        btn.addEventListener('click', () => {
            const themeId = btn.dataset.theme;
            setTheme(themeId);
            audio.playPop();
            showHome();
        });
    });
}

// ====== Home Screen ======
function showHome() {
    const theme = getTheme();

    const phasesHtml = PHASES.map((p, i) => `
        <button class="phase-btn ${i === state.currentPhase ? 'selected' : ''}" data-phase="${i}">
            <span class="phase-icon">${p.icon}</span>
            <span class="phase-range">${p.label}</span>
        </button>
    `).join('');

    const gamesHtml = GAMES.map(g => `
        <button class="game-btn" data-game="${g.id}">
            <span class="game-icon">${g.icon}</span>
            <span class="game-label">${g.label}</span>
        </button>
    `).join('');

    const screen = showScreen(`
        <div class="home-header">
            <button class="theme-switch-btn" id="theme-switch">${themeIconHtml(theme, 40)}</button>
            <div class="home-title">${theme.name}</div>
            <div style="width:48px"></div>
        </div>
        <div class="phases-container">${phasesHtml}</div>
        <div class="games-grid">${gamesHtml}</div>
    `, 'home');

    // Theme switch button
    screen.querySelector('#theme-switch').addEventListener('click', () => {
        audio.playWhoosh();
        showThemePicker();
    });

    // Phase selection
    screen.querySelectorAll('.phase-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            state.currentPhase = parseInt(btn.dataset.phase);
            saveState();
            screen.querySelectorAll('.phase-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            audio.playPop();
        });
    });

    // Game selection
    screen.querySelectorAll('.game-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            audio.playWhoosh();
            startGame(btn.dataset.game);
        });
    });
}

// ====== Game Screen ======
function startGame(gameId) {
    state.currentGame = gameId;
    const phase = PHASES[state.currentPhase];
    const gameInfo = GAMES.find(g => g.id === gameId);
    const theme = getTheme();
    let roundCount = 0;
    let cleanupGame = null;

    function renderGameShell() {
        const screen = showScreen(`
            <div class="game-header">
                <button class="back-btn" id="back-btn">\u2190</button>
                <div class="game-title-bar">${gameInfo.icon} ${gameInfo.label}</div>
                <button class="sound-btn" id="sound-toggle">${state.soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07'}</button>
            </div>
            <div class="game-area" id="game-area"></div>
        `, 'game-screen');

        screen.querySelector('#back-btn').addEventListener('click', () => {
            if (cleanupGame) cleanupGame();
            audio.playWhoosh();
            showHome();
        });

        screen.querySelector('#sound-toggle').addEventListener('click', (e) => {
            state.soundEnabled = audio.toggle();
            e.currentTarget.textContent = state.soundEnabled ? '\uD83D\uDD0A' : '\uD83D\uDD07';
        });

        return screen.querySelector('#game-area');
    }

    function playRound() {
        const gameArea = renderGameShell();
        roundCount++;

        const onComplete = () => {
            setTimeout(() => playRound(), 800);
        };

        const creators = {
            'counting': createCountingGame,
            'subitizing': createSubitizingGame,
            'matching': createMatchingGame,
            'collecting': createCollectingGame,
            'find-number': createFindNumberGame,
        };

        const creator = creators[gameId];
        if (creator) {
            cleanupGame = creator(gameArea, phase, onComplete, theme);
        }
    }

    playRound();
}

// ====== Init ======
showSplash();
