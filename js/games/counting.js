import { randomInRange, pickRandomObject, getNumberData } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect } from '../components/celebration.js';

export function createCountingGame(container, phase, onComplete, theme) {
    const target = randomInRange(phase.min, phase.max);
    const objectEmoji = pickRandomObject(theme && theme.objects);
    let counted = 0;
    const items = [];
    let cleanupIdle = null;

    function render() {
        container.innerHTML = `
            <div class="count-progress" id="count-label"></div>
            <div class="objects-container" id="objects-area"></div>
            <div class="number-hebrew" id="count-word"></div>
        `;

        const area = container.querySelector('#objects-area');

        for (let i = 0; i < target; i++) {
            const el = document.createElement('div');
            el.className = 'object-item';
            el.textContent = objectEmoji;
            el.dataset.index = i;
            el.style.animationDelay = (i * 0.08) + 's';
            popIn(el);
            el.addEventListener('click', () => handleTap(el, i));
            area.appendChild(el);
            items.push(el);
        }

        updateLabel();
        cleanupIdle = addIdleWiggle(area);
    }

    function updateLabel() {
        const label = container.querySelector('#count-label');
        const word = container.querySelector('#count-word');
        if (counted === 0) {
            label.textContent = '!לחצו על כל אחד';
            word.textContent = '';
        } else {
            label.textContent = counted.toString();
            const data = getNumberData(counted);
            word.textContent = data ? data.hebrew : '';
        }
    }

    function handleTap(el, index) {
        if (el.classList.contains('counted')) return;

        counted++;
        el.classList.add('counted');
        audio.playCountStep(counted);
        audio.speakNumber(counted);

        el.style.animation = 'none';
        el.offsetHeight;
        el.style.animation = 'counted-bounce 0.4s ease';

        updateLabel();

        if (counted === target) {
            if (cleanupIdle) cleanupIdle();
            setTimeout(async () => {
                const rect = el.getBoundingClientRect();
                await celebrateCorrect(rect.left + rect.width / 2, rect.top + rect.height / 2);
                onComplete();
            }, 400);
        }
    }

    render();
    return () => { if (cleanupIdle) cleanupIdle(); };
}
