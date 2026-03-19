import { confetti, starBurst } from '../animations.js';
import { audio } from '../audio.js';
import { pickRandom, PRAISE } from '../data.js';

let overlay = null;

function getOverlay() {
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.className = 'celebration';
        overlay.addEventListener('click', () => hide());
        document.body.appendChild(overlay);
    }
    return overlay;
}

function show(text, emoji, duration = 2500) {
    const el = getOverlay();
    el.innerHTML = `
        <div class="celebration-emoji">${emoji}</div>
        <div class="celebration-text">${text}</div>
    `;
    el.classList.add('active');
    return new Promise(resolve => {
        setTimeout(() => {
            hide();
            resolve();
        }, duration);
    });
}

function hide() {
    if (overlay) overlay.classList.remove('active');
}

export async function celebrateCorrect(x, y) {
    const praise = pickRandom(PRAISE);
    const emojis = ['\uD83C\uDF89', '\uD83C\uDF1F', '\uD83C\uDF08', '\uD83E\uDD29', '\uD83D\uDCAB'];
    audio.playSuccess();
    confetti(30);
    if (x != null && y != null) starBurst(x, y);
    await audio.speakPraise();
    return show(praise, pickRandom(emojis), 2000);
}

export async function celebrateAttempt() {
    audio.playDing();
    return show('\uD83D\uDC4F', '\uD83D\uDE0A', 1200);
}

export { hide };
