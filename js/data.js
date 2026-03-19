export const NUMBERS = [
    { value: 1, hebrew: 'אחת', word: 'אחת' },
    { value: 2, hebrew: 'שתיים', word: 'שתיים' },
    { value: 3, hebrew: 'שלוש', word: 'שלוש' },
    { value: 4, hebrew: 'ארבע', word: 'ארבע' },
    { value: 5, hebrew: 'חמש', word: 'חמש' },
    { value: 6, hebrew: 'שש', word: 'שש' },
    { value: 7, hebrew: 'שבע', word: 'שבע' },
    { value: 8, hebrew: 'שמונה', word: 'שמונה' },
    { value: 9, hebrew: 'תשע', word: 'תשע' },
    { value: 10, hebrew: 'עשר', word: 'עשר' },
];

export const PHASES = [
    { id: 'phase1', min: 1, max: 3, icon: '\u2B50', label: '1-3' },
    { id: 'phase2', min: 1, max: 5, icon: '\uD83C\uDF08', label: '1-5' },
    { id: 'phase3', min: 1, max: 10, icon: '\uD83D\uDE80', label: '1-10' },
];

export const OBJECTS = [
    '\uD83C\uDF4E', // apple
    '\uD83C\uDF4A', // orange
    '\uD83C\uDF53', // strawberry
    '\uD83C\uDF47', // grape
    '\uD83C\uDF4C', // banana
    '\u2B50',       // star
    '\uD83D\uDC1F', // fish
    '\uD83E\uDD8B', // butterfly
    '\uD83C\uDF3B', // sunflower
    '\uD83D\uDE97', // car
    '\uD83C\uDF08', // rainbow
    '\uD83C\uDF82', // cake
    '\uD83D\uDC36', // dog
    '\uD83D\uDC31', // cat
    '\uD83D\uDC25', // chick
];

export const PRAISE = [
    '!יופי',
    '!כל הכבוד',
    '!נפלא',
    '!מצוין',
    '!איזה כיף',
    '!נהדר',
    '!סחתיין',
    '!אלוף',
];

export const GAMES = [
    { id: 'counting', icon: '\uD83D\uDC46', label: '\u05D1\u05D5\u05D0\u05D5 \u05E0\u05E1\u05E4\u05D5\u05E8' },
    { id: 'subitizing', icon: '\uD83C\uDFB2', label: '\u05DB\u05DE\u05D4 \u05D9\u05E9?' },
    { id: 'matching', icon: '\uD83E\uDDE9', label: '\u05DE\u05E6\u05D0 \u05D4\u05EA\u05D0\u05DE\u05D4' },
    { id: 'collecting', icon: '\uD83E\uDDFA', label: '\u05DE\u05DC\u05D0 \u05D0\u05EA \u05D4\u05E1\u05DC' },
    { id: 'find-number', icon: '\uD83D\uDC42', label: '\u05E9\u05DE\u05E2 \u05D5\u05DE\u05E6\u05D0' },
];

export const NUMBER_COLORS = [
    '', // 0 placeholder
    '#e74c3c', '#3498db', '#2ecc71', '#f1c40f', '#e67e22',
    '#9b59b6', '#e84393', '#d35400', '#00cec9', '#f39c12',
];

export function getNumberData(n) {
    return NUMBERS[n - 1];
}

export function getNumbersInRange(min, max) {
    return NUMBERS.filter(n => n.value >= min && n.value <= max);
}

export function randomInRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function pickRandom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

export function pickRandomObject(themeObjects) {
    return pickRandom(themeObjects || OBJECTS);
}

export function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

export function generateChoices(correct, min, max, count = 3) {
    const choices = new Set([correct]);
    const range = [];
    for (let i = min; i <= max; i++) {
        if (i !== correct) range.push(i);
    }
    const shuffled = shuffle(range);
    for (const n of shuffled) {
        if (choices.size >= count) break;
        choices.add(n);
    }
    return shuffle([...choices]);
}
