import { randomInRange, pickRandomObject, getNumberData, NUMBER_COLORS } from '../data.js';
import { audio } from '../audio.js';
import { popIn } from '../animations.js';
import { celebrateCorrect } from '../components/celebration.js';

export function createCollectingGame(container, phase, onComplete, theme) {
    const target = randomInRange(phase.min, phase.max);
    const objectEmoji = pickRandomObject(theme && theme.objects);
    const totalObjects = target + randomInRange(1, 3);
    let collected = 0;
    let dragging = null;
    let dragOffset = { x: 0, y: 0 };

    function render() {
        const color = NUMBER_COLORS[target] || '#fff';
        container.innerHTML = `
            <div class="collecting-area">
                <div class="target-number">
                    <span class="number-display" style="font-size:3.5rem;color:${color}">${target}</span>
                    <span class="number-hebrew" style="display:inline;margin-right:12px">${getNumberData(target).hebrew}</span>
                </div>
                <div class="draggable-area" id="drag-area"></div>
                <div class="basket" id="basket">
                    <span>\uD83E\uDDFA</span>
                    <span class="basket-count" id="basket-count">0</span>
                </div>
            </div>
        `;

        audio.speakNumber(target);

        const area = container.querySelector('#drag-area');
        const areaRect = area.getBoundingClientRect();

        for (let i = 0; i < totalObjects; i++) {
            const el = document.createElement('div');
            el.className = 'draggable-object';
            el.textContent = objectEmoji;
            el.dataset.index = i;

            // Position randomly within the drag area
            const x = 10 + Math.random() * (Math.min(areaRect.width, 300) - 60);
            const y = 10 + Math.random() * (Math.max(areaRect.height, 150) - 60);
            el.style.left = x + 'px';
            el.style.top = y + 'px';

            popIn(el);
            setupDrag(el);
            area.appendChild(el);
        }
    }

    function setupDrag(el) {
        const onStart = (e) => {
            e.preventDefault();
            dragging = el;
            el.classList.add('dragging');
            const touch = e.touches ? e.touches[0] : e;
            const rect = el.getBoundingClientRect();
            dragOffset.x = touch.clientX - rect.left;
            dragOffset.y = touch.clientY - rect.top;
            audio.playPop();
        };

        const onMove = (e) => {
            if (!dragging || dragging !== el) return;
            e.preventDefault();
            const touch = e.touches ? e.touches[0] : e;
            const parent = el.parentElement.getBoundingClientRect();
            const x = touch.clientX - parent.left - dragOffset.x;
            const y = touch.clientY - parent.top - dragOffset.y;
            el.style.left = x + 'px';
            el.style.top = y + 'px';

            // Check if over basket
            const basket = container.querySelector('#basket');
            const basketRect = basket.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const isOver = elRect.bottom > basketRect.top &&
                          elRect.top < basketRect.bottom &&
                          elRect.right > basketRect.left &&
                          elRect.left < basketRect.right;
            basket.classList.toggle('hover', isOver);
        };

        const onEnd = (e) => {
            if (!dragging || dragging !== el) return;
            el.classList.remove('dragging');

            const basket = container.querySelector('#basket');
            const basketRect = basket.getBoundingClientRect();
            const elRect = el.getBoundingClientRect();
            const isOver = elRect.bottom > basketRect.top &&
                          elRect.top < basketRect.bottom &&
                          elRect.right > basketRect.left &&
                          elRect.left < basketRect.right;

            basket.classList.remove('hover');

            if (isOver) {
                if (collected < target) {
                    collected++;
                    el.style.transition = 'transform 0.3s ease, opacity 0.3s ease';
                    el.style.transform = 'scale(0)';
                    el.style.opacity = '0';
                    setTimeout(() => el.remove(), 300);

                    audio.playCountStep(collected);
                    audio.speakNumber(collected);

                    const countEl = container.querySelector('#basket-count');
                    if (countEl) countEl.textContent = collected;

                    if (collected === target) {
                        basket.classList.add('full');
                        setTimeout(async () => {
                            const rect = basket.getBoundingClientRect();
                            await celebrateCorrect(rect.left + rect.width / 2, rect.top);
                            onComplete();
                        }, 500);
                    }
                } else {
                    // Too many - bounce back
                    audio.playGentleError();
                    const area = el.parentElement.getBoundingClientRect();
                    el.style.transition = 'left 0.3s ease, top 0.3s ease';
                    el.style.left = (10 + Math.random() * (area.width - 60)) + 'px';
                    el.style.top = (10 + Math.random() * (area.height - 60)) + 'px';
                    setTimeout(() => el.style.transition = '', 300);
                }
            }

            dragging = null;
        };

        el.addEventListener('mousedown', onStart);
        el.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
    }

    render();
    return () => { dragging = null; };
}
