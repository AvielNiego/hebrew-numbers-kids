import { randomInRange, shuffle } from '../data.js';
import { audio } from '../audio.js';
import { celebrateCorrect } from '../components/celebration.js';

export function createBubblesGame(container, phase, onComplete, theme) {
    const count = randomInRange(phase.min, Math.min(phase.max, 7));
    // Generate numbers 1..count in random order
    const numbers = shuffle(Array.from({ length: count }, (_, i) => i + 1));
    let popped = 0;
    let bubbleEls = [];
    let animFrame = null;
    let alive = true;

    function render() {
        container.innerHTML = `
            <div class="bubbles-area" id="bubbles-area"></div>
            <div class="number-hebrew" id="bubble-label" style="position:absolute;bottom:16px;width:100%;text-align:center"></div>
        `;
        container.style.position = 'relative';

        const area = container.querySelector('#bubbles-area');
        area.style.cssText = 'position:absolute;inset:0;overflow:hidden;';

        const areaW = area.offsetWidth || 320;
        const areaH = area.offsetHeight || 500;

        numbers.forEach((num, i) => {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            bubble.dataset.num = num;

            // Number inside bubble
            const numEl = document.createElement('span');
            numEl.className = 'bubble-number';
            numEl.textContent = num;
            bubble.appendChild(numEl);

            // If theme has images, show small character behind number
            if (theme && theme.useImages && theme.images) {
                const img = document.createElement('img');
                img.src = theme.images[i % theme.images.length];
                img.alt = '';
                img.className = 'bubble-character';
                bubble.appendChild(img);
            }

            // Random start position at bottom, spread horizontally
            const startX = 20 + Math.random() * (areaW - 100);
            const startY = areaH + 40 + Math.random() * 100;
            bubble.style.left = startX + 'px';
            bubble.style.top = startY + 'px';

            // Float properties
            bubble._x = startX;
            bubble._y = startY;
            bubble._speedY = 0.3 + Math.random() * 0.4; // slow float up
            bubble._wobbleAmp = 15 + Math.random() * 20;
            bubble._wobbleSpeed = 0.5 + Math.random() * 0.5;
            bubble._wobbleOffset = Math.random() * Math.PI * 2;
            bubble._baseX = startX;

            bubble.addEventListener('click', () => popBubble(bubble));
            bubble.addEventListener('touchend', (e) => {
                e.preventDefault();
                popBubble(bubble);
            });

            area.appendChild(bubble);
            bubbleEls.push(bubble);
        });

        // Start float animation
        let startTime = performance.now();
        function animate(now) {
            if (!alive) return;
            const elapsed = (now - startTime) / 1000;

            bubbleEls.forEach(b => {
                if (b._popped) return;
                b._y -= b._speedY;
                // Wobble side to side
                const wobble = Math.sin(elapsed * b._wobbleSpeed + b._wobbleOffset) * b._wobbleAmp;
                b.style.left = (b._baseX + wobble) + 'px';
                b.style.top = b._y + 'px';

                // If floated off top, wrap to bottom
                if (b._y < -100) {
                    b._y = areaH + 50;
                    b._baseX = 20 + Math.random() * (areaW - 100);
                }
            });

            animFrame = requestAnimationFrame(animate);
        }
        animFrame = requestAnimationFrame(animate);
    }

    function popBubble(bubble) {
        if (bubble._popped) return;
        bubble._popped = true;
        popped++;

        const num = parseInt(bubble.dataset.num);

        // Pop animation
        bubble.classList.add('bubble-pop');
        audio.playPop();

        // Show the number growing
        const label = container.querySelector('#bubble-label');
        if (label) {
            label.style.fontSize = '3rem';
            label.style.transition = 'none';
            label.textContent = num.toString();
            label.style.animation = 'none';
            label.offsetHeight;
            label.style.animation = 'celebration-pop 0.5s ease';
        }

        // Speak the number
        audio.speakNumber(num);

        // Remove bubble after pop animation
        setTimeout(() => {
            bubble.remove();
            bubbleEls = bubbleEls.filter(b => b !== bubble);
        }, 400);

        // Check if all popped
        if (popped === count) {
            setTimeout(async () => {
                if (animFrame) cancelAnimationFrame(animFrame);
                alive = false;
                await celebrateCorrect(
                    container.offsetWidth / 2,
                    container.offsetHeight / 2
                );
                onComplete();
            }, 800);
        }
    }

    render();

    return () => {
        alive = false;
        if (animFrame) cancelAnimationFrame(animFrame);
    };
}
