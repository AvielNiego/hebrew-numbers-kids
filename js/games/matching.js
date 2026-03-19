import { randomInRange, pickRandomObject, generateChoices, getNumberData, NUMBER_COLORS } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';

export function createMatchingGame(container, phase, onComplete) {
    // Alternate between "match numeral to group" and "match group to numeral"
    const mode = Math.random() > 0.5 ? 'numToGroup' : 'groupToNum';
    const target = randomInRange(phase.min, phase.max);
    const objectEmoji = pickRandomObject();
    let answered = false;
    let cleanupIdle = null;

    function renderNumToGroup() {
        const color = NUMBER_COLORS[target] || '#fff';
        const choiceValues = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));

        const groupsHtml = choiceValues.map(n => {
            const objs = Array(n).fill(objectEmoji).join(' ');
            return `<button class="choice-btn" data-value="${n}" style="width:auto;height:auto;border-radius:var(--radius);padding:12px 16px;min-width:80px;min-height:80px;font-size:1.8rem;">${objs}</button>`;
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
        const objects = Array(target).fill(0).map(() =>
            `<div class="object-item">${objectEmoji}</div>`
        ).join('');

        const choiceValues = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
        const numBtns = choiceValues.map(n => {
            const color = NUMBER_COLORS[n] || '#333';
            return `<button class="choice-btn" data-value="${n}" style="color:${color}">${n}</button>`;
        }).join('');

        container.innerHTML = `
            <div class="objects-container">${objects}</div>
            <div class="number-hebrew">?איזה מספר</div>
            <div class="choices-container" id="choices">${numBtns}</div>
        `;

        container.querySelectorAll('.object-item').forEach((el, i) => {
            el.style.animationDelay = (i * 0.08) + 's';
            popIn(el);
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
