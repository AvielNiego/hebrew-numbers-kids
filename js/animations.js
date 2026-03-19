const CONFETTI_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#e67e22', '#9b59b6', '#e84393', '#00cec9'];

export function confetti(count = 25) {
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'confetti-piece';
        el.style.background = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-20px';
        el.style.setProperty('--drift-x', (Math.random() - 0.5) * 200 + 'px');
        el.style.setProperty('--spin', Math.random() * 1080 + 'deg');
        el.style.setProperty('--fall-duration', (1.5 + Math.random()) + 's');
        el.style.width = (8 + Math.random() * 8) + 'px';
        el.style.height = (8 + Math.random() * 8) + 'px';
        el.style.borderRadius = Math.random() > 0.5 ? '50%' : '3px';
        el.style.animationDelay = Math.random() * 0.5 + 's';
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}

export function starBurst(x, y, count = 8) {
    const stars = ['\u2B50', '\u2728', '\uD83C\uDF1F'];
    for (let i = 0; i < count; i++) {
        const el = document.createElement('div');
        el.className = 'star';
        el.textContent = stars[i % stars.length];
        el.style.left = x + 'px';
        el.style.top = y + 'px';
        const angle = (Math.PI * 2 * i) / count;
        const dist = 60 + Math.random() * 40;
        el.style.setProperty('--burst-x', Math.cos(angle) * dist + 'px');
        el.style.setProperty('--burst-y', Math.sin(angle) * dist + 'px');
        document.body.appendChild(el);
        el.addEventListener('animationend', () => el.remove());
    }
}

export function popIn(element) {
    element.style.animation = 'none';
    element.offsetHeight; // reflow
    element.style.animation = 'pop-in 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards';
}

export function bounce(element) {
    element.style.animation = 'none';
    element.offsetHeight;
    element.style.animation = 'bounce 0.3s ease';
}

export function wiggle(element) {
    element.style.animation = 'none';
    element.offsetHeight;
    element.style.animation = 'wiggle 0.5s ease';
}

export function addIdleWiggle(container, delayMs = 5000) {
    let timer = null;
    const reset = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            const items = container.querySelectorAll('.object-item:not(.counted), .choice-btn, .draggable-object');
            items.forEach((el, i) => {
                setTimeout(() => wiggle(el), i * 100);
            });
        }, delayMs);
    };
    container.addEventListener('pointerdown', reset);
    reset();
    return () => clearTimeout(timer);
}
