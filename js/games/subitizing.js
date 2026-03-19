import { randomInRange, pickRandomObject, generateChoices, getNumberData } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';

export function createSubitizingGame(container, phase, onComplete) {
    const target = randomInRange(phase.min, phase.max);
    const objectEmoji = pickRandomObject();
    const choices = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
    let answered = false;
    let cleanupIdle = null;

    function render() {
        const objectsHtml = Array(target)
            .fill(0)
            .map(() => `<div class="object-item">${objectEmoji}</div>`)
            .join('');

        const choicesHtml = choices
            .map(n => `<button class="choice-btn" data-value="${n}">${n}</button>`)
            .join('');

        container.innerHTML = `
            <div class="objects-container" id="flash-area">${objectsHtml}</div>
            <div class="number-hebrew" id="question-text">?כמה יש</div>
            <div class="choices-container" id="choices">${choicesHtml}</div>
        `;

        const objectEls = container.querySelectorAll('.object-item');
        objectEls.forEach((el, i) => {
            el.style.animationDelay = (i * 0.08) + 's';
            popIn(el);
        });

        // Flash: show objects briefly, then hide
        setTimeout(() => {
            objectEls.forEach(el => {
                el.style.transition = 'opacity 0.3s ease';
                el.style.opacity = '0.15';
            });
        }, 1500 + target * 300);

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

            // Highlight correct answer
            container.querySelectorAll('.choice-btn').forEach(b => {
                if (parseInt(b.dataset.value) === target) {
                    b.classList.add('glow');
                }
            });

            // Count together
            await audio.speakNumber(target);
            await celebrateAttempt();
        }

        onComplete();
    }

    render();
    return () => { if (cleanupIdle) cleanupIdle(); };
}
