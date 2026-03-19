import { randomInRange, generateChoices, getNumberData, NUMBER_COLORS } from '../data.js';
import { audio } from '../audio.js';
import { popIn, addIdleWiggle } from '../animations.js';
import { celebrateCorrect, celebrateAttempt } from '../components/celebration.js';
import { setObjectContent } from '../theme-helpers.js';

const SELLER_PHRASES = [
    'כמה זה עולה?',
    '!קנו ממני',
    '!הנה הסחורה',
    '?מי קונה',
];

export function createMarketGame(container, phase, onComplete, theme) {
    const target = randomInRange(phase.min, phase.max);
    const choices = generateChoices(target, phase.min, phase.max, Math.min(3, phase.max - phase.min + 1));
    let answered = false;
    let cleanupIdle = null;

    function render() {
        // Show market stand with items
        const phrase = SELLER_PHRASES[Math.floor(Math.random() * SELLER_PHRASES.length)];

        container.innerHTML = `
            <div class="market-stand">
                <div class="market-awning"></div>
                <div class="market-counter">
                    <div class="market-items" id="market-items"></div>
                    <div class="market-seller">🧑‍🍳</div>
                </div>
                <div class="market-speech">
                    <span class="market-phrase">${phrase}</span>
                    <div class="market-price-tag">
                        <span class="market-price">${target}</span>
                        <span class="market-shekel">₪</span>
                    </div>
                </div>
            </div>
            <div class="number-hebrew" style="margin-top:8px">?כמה לשלם</div>
            <div class="market-coins" id="coins"></div>
        `;

        // Show items on the counter
        const itemsEl = container.querySelector('#market-items');
        for (let i = 0; i < target; i++) {
            const el = document.createElement('div');
            el.className = 'market-item';
            setObjectContent(el, theme, i);
            popIn(el);
            itemsEl.appendChild(el);
        }

        // Show coin choices
        const coinsEl = container.querySelector('#coins');
        choices.forEach(n => {
            const coin = document.createElement('button');
            coin.className = 'coin-btn';
            coin.dataset.value = n;
            coin.innerHTML = `<span class="coin-value">${n}</span><span class="coin-shekel">₪</span>`;
            coin.addEventListener('click', (e) => handleChoice(e, n));
            popIn(coin);
            coinsEl.appendChild(coin);
        });

        // Speak the price
        setTimeout(() => {
            audio.speakNumber(target);
        }, 600);

        cleanupIdle = addIdleWiggle(container);
    }

    async function handleChoice(e, value) {
        if (answered) return;
        answered = true;
        if (cleanupIdle) cleanupIdle();

        const btn = e.currentTarget;

        if (value === target) {
            btn.classList.add('coin-correct');
            audio.playSuccess();

            // Items fly away (sold!)
            container.querySelectorAll('.market-item').forEach((el, i) => {
                setTimeout(() => {
                    el.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                    el.style.transform = 'scale(0) translateY(-50px)';
                    el.style.opacity = '0';
                }, i * 100);
            });

            const rect = btn.getBoundingClientRect();
            await celebrateCorrect(rect.left + rect.width / 2, rect.top + rect.height / 2);
        } else {
            btn.classList.add('coin-wrong');
            audio.playGentleError();

            // Shake the price tag
            const priceTag = container.querySelector('.market-price-tag');
            if (priceTag) {
                priceTag.style.animation = 'none';
                priceTag.offsetHeight;
                priceTag.style.animation = 'shake 0.5s ease';
            }

            // Show wrong feedback
            const wrongOverlay = document.createElement('div');
            wrongOverlay.className = 'wrong-feedback';
            wrongOverlay.textContent = '✕';
            btn.appendChild(wrongOverlay);
            setTimeout(() => wrongOverlay.remove(), 800);

            // Highlight correct
            container.querySelectorAll('.coin-btn').forEach(b => {
                if (parseInt(b.dataset.value) === target) {
                    b.classList.add('coin-glow');
                }
            });

            await audio.speakNumber(target);
            await celebrateAttempt();
        }

        onComplete();
    }

    render();
    return () => { if (cleanupIdle) cleanupIdle(); };
}
