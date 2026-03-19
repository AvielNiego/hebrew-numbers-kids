const IMG = 'assets/images/themes';

export const THEMES = [
    {
        id: 'original',
        name: 'מספרים',
        iconEmoji: '🌈',
        bgStart: '#667eea',
        bgEnd: '#764ba2',
        accent: '#fdcb6e',
        surface: 'rgba(255, 255, 255, 0.95)',
        useImages: false,
        objects: ['🍎', '🍊', '🍓', '🍇', '🍌', '⭐', '🐟', '🦋', '🌻', '🚗', '🌈', '🎂', '🐶', '🐱', '🐥'],
        celebrationEmojis: ['🎉', '🌟', '🌈', '🤩', '💫'],
    },
    {
        id: 'paw-patrol',
        name: 'מפרץ ההרפתקאות',
        icon: `${IMG}/paw-patrol/chase.png`,
        bgStart: '#1e90ff',
        bgEnd: '#0056b3',
        accent: '#ff4444',
        surface: 'rgba(255, 255, 255, 0.95)',
        useImages: true,
        images: [
            `${IMG}/paw-patrol/chase.png`,
            `${IMG}/paw-patrol/marshall.png`,
            `${IMG}/paw-patrol/skye.png`,
            `${IMG}/paw-patrol/rubble.png`,
            `${IMG}/paw-patrol/rocky.png`,
            `${IMG}/paw-patrol/zuma.png`,
            `${IMG}/paw-patrol/everest.png`,
            `${IMG}/paw-patrol/ryder.png`,
            `${IMG}/paw-patrol/bone.png`,
            `${IMG}/paw-patrol/logo.png`,
        ],
        celebrationEmojis: ['🐾', '🐶', '⭐', '🦴', '🎉'],
    },
    {
        id: 'fireman-sam',
        name: 'סמי הכבאי',
        icon: `${IMG}/fireman-sam/sam.png`,
        bgStart: '#d32f2f',
        bgEnd: '#b71c1c',
        accent: '#ffc107',
        surface: 'rgba(255, 255, 255, 0.95)',
        useImages: true,
        images: [
            `${IMG}/fireman-sam/sam.png`,
            `${IMG}/fireman-sam/jupiter.png`,
            `${IMG}/fireman-sam/penny.png`,
            `${IMG}/fireman-sam/helicopter.png`,
            `${IMG}/fireman-sam/fire-helmet.png`,
            `${IMG}/fireman-sam/fire-hydrant.png`,
            `${IMG}/fireman-sam/fire-station.png`,
            `${IMG}/fireman-sam/sam-poster.png`,
            `${IMG}/fireman-sam/steele-group.png`,
        ],
        celebrationEmojis: ['🚒', '🔥', '⭐', '👨‍🚒', '🎉'],
    },
    {
        id: 'lion-king',
        name: 'מלך האריות',
        icon: `${IMG}/lion-king/simba.png`,
        bgStart: '#e65100',
        bgEnd: '#bf360c',
        accent: '#ffca28',
        surface: 'rgba(255, 248, 235, 0.95)',
        useImages: true,
        images: [
            `${IMG}/lion-king/simba.png`,
            `${IMG}/lion-king/young-simba.png`,
            `${IMG}/lion-king/timon.png`,
            `${IMG}/lion-king/pumbaa.png`,
            `${IMG}/lion-king/nala.png`,
            `${IMG}/lion-king/mufasa.png`,
            `${IMG}/lion-king/zazu.png`,
            `${IMG}/lion-king/rafiki.png`,
            `${IMG}/lion-king/scar.png`,
            `${IMG}/lion-king/shenzi.png`,
        ],
        celebrationEmojis: ['🦁', '👑', '🌅', '⭐', '🎉'],
    },
    {
        id: 'super-wings',
        name: 'סופר וינגס',
        icon: `${IMG}/super-wings/jett.png`,
        bgStart: '#0288d1',
        bgEnd: '#01579b',
        accent: '#ff5252',
        surface: 'rgba(240, 248, 255, 0.95)',
        useImages: true,
        images: [
            `${IMG}/super-wings/jett.png`,
            `${IMG}/super-wings/dizzy.png`,
            `${IMG}/super-wings/donnie.png`,
            `${IMG}/super-wings/jerome.png`,
            `${IMG}/super-wings/paul.png`,
            `${IMG}/super-wings/bello.png`,
            `${IMG}/super-wings/mira.png`,
            `${IMG}/super-wings/flip.png`,
            `${IMG}/super-wings/grand_albert.png`,
            `${IMG}/super-wings/jett_plane.png`,
        ],
        celebrationEmojis: ['✈️', '🌍', '📦', '⭐', '🎉'],
    },
];

// Father theme is hidden — only revealed via easter egg
export const FATHER_THEME = {
    id: 'father',
    name: 'עם אבא',
    icon: 'assets/images/father.jpg',
    bgStart: '#4a148c',
    bgEnd: '#7b1fa2',
    accent: '#e040fb',
    surface: 'rgba(255, 245, 255, 0.95)',
    useImages: true,
    hidden: true,
    images: [
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
        'assets/images/father.jpg',
    ],
    celebrationEmojis: ['❤️', '🤗', '⭐', '🎈', '🎉'],
};

let currentTheme = null;
let fatherUnlocked = false;

export function getTheme() {
    return currentTheme || THEMES[0];
}

export function isFatherUnlocked() {
    return fatherUnlocked;
}

export function unlockFather() {
    fatherUnlocked = true;
    try {
        localStorage.setItem('learn_numbers_father', '1');
    } catch (e) { /* ignore */ }
}

export function getVisibleThemes() {
    if (fatherUnlocked) {
        return [...THEMES, FATHER_THEME];
    }
    return THEMES;
}

export function setTheme(themeId) {
    const allThemes = [...THEMES, FATHER_THEME];
    currentTheme = allThemes.find(t => t.id === themeId) || THEMES[0];
    applyThemeCSS(currentTheme);
    try {
        localStorage.setItem('learn_numbers_theme', currentTheme.id);
    } catch (e) { /* ignore */ }
    return currentTheme;
}

export function loadSavedTheme() {
    try {
        const savedFather = localStorage.getItem('learn_numbers_father');
        if (savedFather === '1') fatherUnlocked = true;

        const saved = localStorage.getItem('learn_numbers_theme');
        if (saved) {
            const allThemes = [...THEMES, FATHER_THEME];
            currentTheme = allThemes.find(t => t.id === saved) || THEMES[0];
            // If father theme was selected but not unlocked, fall back
            if (currentTheme.hidden && !fatherUnlocked) {
                currentTheme = THEMES[0];
            }
            applyThemeCSS(currentTheme);
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
