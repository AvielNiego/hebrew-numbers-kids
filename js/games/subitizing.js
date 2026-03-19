import { randomInRange, generateChoices, getNumberData } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';

function makeObjectEl(theme, index) {
    const el = document.createElement('div');
    el.className = 'object-item';
    if (theme && theme.useImages) {
        const img = document.createElement('img');
        img.src = theme.images[index % theme.images.length];
        img.alt = '';
        img.className = 'theme-obj-img';
        el.appendChild(img);
    } else {
        el.textContent = '\uD83C\uDF4E';
    }
    return el;
}

export function createSubitizingGame(container, phase, onComplete, theme) {
    const target = randomInRange(phase.min, phase.max);
    const choices = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
    let answered = false;
    let cleanupIdle = null;

    function render() {
        container.innerHTML = `
            <div class="objects-container" id="flash-area"></div>
            <div class="number-hebrew" id="question-text">?כמה יש</div>
            <div class="choices-container" id="choices"></div>
        `;

        const flashArea = container.querySelector('#flash-area');
        for (let i = 0; i < target; i++) {
            const el = makeObjectEl(theme, i);
            el.style.animationDelay = (i * 0.08) + 's';
            popIn(el);
            flashArea.appendChild(el);
        }

        const choicesEl = container.querySelector('#choices');
        choices.forEach(n => {
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.dataset.value = n;
            btn.textContent = n;
            btn.addEventListener('click', (e) => handleChoice(e, n));
            choicesEl.appendChild(btn);
        });

        // Flash: show objects briefly, then fade
        setTimeout(() => {
            flashArea.querySelectorAll('.object-item').forEach(el => {
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0.15';
            });
        }, 1500 + target * 300);

        cleanupIdle = addIdleWiggle(container);
    }

    async function handleChoice(e, value) {
        if (answered) return;
        answered = true;
        if (cleanupIdle) cleanupIdle();

        const btn = e.currentTarget;

        // Reveal objects again
        container.querySelectorAll('.object-item').forEach(el => {
            el.style.opacity = '1';
        });

        if (value === target) {
            btn.classList.add('correct');
            const data = getNumberData(target);
            const questionText = container.querySelector('#question-text');
            if (questionText && data) questionText.textContent = data.hebrew;
            audio.speakNumber(target);
            const rect = btn.getBoundingClientRect();
            await celebrateCorrect(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
            btn.classList.add('wrong');
            audio.playGentleError();
            container.querySelectorAll('.choice-btn').forEach(b => {
                if (parseInt(b.dataset.value) === target) b.classList.add('glow');
            });
            await audio.speakNumber(target);
            await celebrateAttempt();
        }

        onComplete();
    }

    render();
    return () => { if (cleanupIdle) cleanupIdle(); };
}
