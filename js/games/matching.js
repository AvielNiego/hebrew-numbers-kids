import { randomInRange, generateChoices, getNumberData, NUMBER_COLORS } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';
import { setObjectContent, objectInlineHtml } from '../theme-helpers.js';

export function createMatchingGame(container, phase, onComplete, theme) {
    const mode = Math.random() > 0.5 ? 'numToGroup' : 'groupToNum';
    const target = randomInRange(phase.min, phase.max);
    let answered = false;
    let cleanupIdle = null;

    function renderNumToGroup() {
        const color = NUMBER_COLORS[target] || '#fff';
        const choiceValues = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));

        const groupsHtml = choiceValues.map(n => {
            const group = objectInlineHtml(theme, n);
            return `<button class="choice-btn" data-value="${n}" style="width:auto;height:auto;border-radius:var(--radius);padding:12px 16px;min-width:80px;min-height:80px;font-size:1.8rem;display:flex;flex-wrap:wrap;gap:4px;align-items:center;justify-content:center;">${group}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="number-display" style="color:${color}">${target}</div>
            <div class="number-hebrew">${getNumberData(target).hebrew}</div>
            <div style="height:20px"></div>
            <div class="choices-container" id="choices">${groupsHtml}</div>
        `;

        audio.speakNumber(target);
        setupListeners();
    }

    function renderGroupToNum() {
        container.innerHTML = `
            <div class="objects-container" id="objects-area"></div>
            <div class="number-hebrew">?איזה מספר</div>
            <div class="choices-container" id="choices"></div>
        `;

        const area = container.querySelector('#objects-area');
        for (let i = 0; i < target; i++) {
            const el = document.createElement('div');
            el.className = 'object-item';
            setObjectContent(el, theme, i);
            el.style.animationDelay = (i * 0.08) + 's';
            popIn(el);
            area.appendChild(el);
        }

        const choiceValues = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
        const choicesEl = container.querySelector('#choices');
        choiceValues.forEach(n => {
            const color = NUMBER_COLORS[n] || '#333';
            const btn = document.createElement('button');
            btn.className = 'choice-btn';
            btn.dataset.value = n;
            btn.textContent = n;
            btn.style.color = color;
            choicesEl.appendChild(btn);
        });

        setupListeners();
    }

    function setupListeners() {
        container.querySelectorAll('.choice-btn').forEach(btn => {
            btn.addEventListener('click', (e) => handleChoice(e, parseInt(btn.dataset.value)));
        });
        cleanupIdle = addIdleWiggle(container);
    }

    async function handleChoice(e, value) {
        if (answered) return;
        answered = true;
        if (cleanupIdle) cleanupIdle();

        const btn = e.currentTarget;

        if (value === target) {
            btn.classList.add('correct');
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

    if (mode === 'numToGroup') {
        renderNumToGroup();
    } else {
        renderGroupToNum();
    }

    return () => { if (cleanupIdle) cleanupIdle(); };
}
