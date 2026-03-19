export const THEMES = [
    {
        id: 'paw-patrol',
        name: 'מפרץ ההרפתקאות',
        icon: '🐾',
        bgStart: '#1e90ff',
        bgEnd: '#0056b3',
        accent: '#ff4444',
        surface: 'rgba(255, 255, 255, 0.95)',
        splashBg: 'linear-gradient(135deg, #1e90ff 0%, #0056b3 50%, #ff4444 100%)',
        objects: ['🐶', '🐾', '🦴', '🚒', '🚁', '🏔️', '⭐', '🛡️', '🎖️', '🚐', '📡', '🐕', '🎒', '🌟', '👮'],
        celebrationEmojis: ['🐾', '🐶', '⭐', '🦴', '🎉'],
        mascot: '🐾',
    },
    {
        id: 'fireman-sam',
        name: 'סמי הכבאי',
        icon: '🚒',
        bgStart: '#d32f2f',
        bgEnd: '#b71c1c',
        accent: '#ffc107',
        surface: 'rgba(255, 255, 255, 0.95)',
        splashBg: 'linear-gradient(135deg, #d32f2f 0%, #ff6659 30%, #ffc107 100%)',
        objects: ['🚒', '🔥', '🧯', '🚁', '👨‍🚒', '🏠', '⛑️', '🪜', '💧', '🐱', '🚤', '📻', '🌊', '🏔️', '⭐'],
        celebrationEmojis: ['🚒', '🔥', '⭐', '👨‍🚒', '🎉'],
        mascot: '🚒',
    },
    {
        id: 'lion-king',
        name: 'מלך האריות',
        icon: '🦁',
        bgStart: '#e65100',
        bgEnd: '#bf360c',
        accent: '#ffca28',
        surface: 'rgba(255, 248, 235, 0.95)',
        splashBg: 'linear-gradient(135deg, #ff8f00 0%, #e65100 40%, #4e342e 100%)',
        objects: ['🦁', '🐗', '🐒', '🦅', '🦓', '🐘', '🦛', '🌴', '🌅', '🌿', '🦎', '🐛', '🦋', '⭐', '🌙'],
        celebrationEmojis: ['🦁', '👑', '🌅', '⭐', '🎉'],
        mascot: '🦁',
    },
    {
        id: 'super-wings',
        name: 'סופר וינגס',
        icon: '✈️',
        bgStart: '#0288d1',
        bgEnd: '#01579b',
        accent: '#ff5252',
        surface: 'rgba(240, 248, 255, 0.95)',
        splashBg: 'linear-gradient(135deg, #0288d1 0%, #4fc3f7 40%, #ff5252 100%)',
        objects: ['✈️', '📦', '🌍', '🗼', '🏔️', '🌈', '🚀', '🎁', '🗺️', '☁️', '🌤️', '🏝️', '⭐', '🎒', '🛩️'],
        celebrationEmojis: ['✈️', '🌍', '📦', '⭐', '🎉'],
        mascot: '✈️',
    },
    {
        id: 'father',
        name: 'עם אבא',
        icon: 'father-photo',
        bgStart: '#4a148c',
        bgEnd: '#7b1fa2',
        accent: '#e040fb',
        surface: 'rgba(255, 245, 255, 0.95)',
        splashBg: 'linear-gradient(135deg, #4a148c 0%, #7b1fa2 40%, #e040fb 100%)',
        objects: ['❤️', '🏠', '🌳', '⚽', '🎈', '🍦', '🧸', '🎨', '📖', '🚲', '🌻', '🍕', '🎵', '⭐', '🤗'],
        celebrationEmojis: ['❤️', '🤗', '⭐', '🎈', '🎉'],
        mascot: 'father-photo',
        fatherImage: 'assets/images/father.jpg',
    },
];

let currentTheme = null;

export function getTheme() {
    return currentTheme || THEMES[0];
}

export function setTheme(themeId) {
    currentTheme = THEMES.find(t => t.id === themeId) || THEMES[0];
    applyThemeCSS(currentTheme);
    try {
        localStorage.setItem('learn_numbers_theme', currentTheme.id);
    } catch (e) { /* ignore */ }
    return currentTheme;
}

export function loadSavedTheme() {
    try {
        const saved = localStorage.getItem('learn_numbers_theme');
        if (saved) {
            currentTheme = THEMES.find(t => t.id === saved) || THEMES[0];
        }
    } catch (e) { /* ignore */ }
    return currentTheme || THEMES[0];
}

function applyThemeCSS(theme) {
    document.documentElement.style.setProperty('--color-bg-start', theme.bgStart);
    document.documentElement.style.setProperty('--color-bg-end', theme.bgEnd);
    document.documentElement.style.setProperty('--color-accent', theme.accent);
    document.documentElement.style.setProperty('--color-surface', theme.surface);
}
