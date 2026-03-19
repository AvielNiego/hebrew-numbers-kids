import { PHASES, GAMES, NUMBER_COLORS } from './data.js';
import { audio } from './audio.js';
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

// Load saved phase
try {
    const saved = localStorage.getItem('learn_numbers_phase');
    if (saved != null) state.currentPhase = parseInt(saved);
} catch (e) { /* ignore */ }

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
    // Trigger reflow then activate
    requestAnimationFrame(() => screen.classList.add('active'));
    return screen;
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
        showHome();
    });
}

// ====== Home Screen ======
function showHome() {
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
        <div class="home-title">\u05DE\u05D4 \u05E0\u05DC\u05DE\u05D3?</div>
        <div class="phases-container">${phasesHtml}</div>
        <div class="games-grid">${gamesHtml}</div>
    `, 'home');

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
            // Auto-advance to next round after a short delay
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
            cleanupGame = creator(gameArea, phase, onComplete);
        }
    }

    playRound();
}

// ====== Init ======
showSplash();
