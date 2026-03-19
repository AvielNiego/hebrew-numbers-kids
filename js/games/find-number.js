import { randomInRange, generateChoices, getNumberData, NUMBER_COLORS } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';

export function createFindNumberGame(container, phase, onComplete, theme) {
    const target = randomInRange(phase.min, phase.max);
    const choices = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
    let answered = false;
    let cleanupIdle = null;

    function render() {
        const choicesHtml = choices.map(n => {
            const color = NUMBER_COLORS[n] || '#333';
            return `<button class="choice-btn" data-value="${n}" style="color:${color};font-size:3rem">${n}</button>`;
        }).join('');

        container.innerHTML = `
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px">
                <div class="number-hebrew" style="font-size:1.5rem">\uD83D\uDD0A הקשיבו</div>
                <button class="sound-btn" id="replay-btn" style="width:80px;height:80px;font-size:2.5rem;background:rgba(255,255,255,0.25);border-radius:50%;border:none;cursor:pointer">
                    \uD83D\uDD0A
                </button>
            </div>
            <div style="height:20px"></div>
            <div class="choices-container" id="choices">${choicesHtml}</div>
        `;

        // Play the number
        setTimeout(() => audio.speakNumber(target), 500);

        container.querySelector('#replay-btn').addEventListener('click', () => {
            audio.speakNumber(target);
        });

        container.querySelectorAll('.choice-btn').forEach((btn, i) => {
            popIn(btn);
            btn.style.animationDelay = (i * 0.1) + 's';
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
            const data = getNumberData(target);
            // Show the hebrew word
            const label = container.querySelector('.number-hebrew');
            if (label && data) label.textContent = `${target} - ${data.hebrew}`;
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
