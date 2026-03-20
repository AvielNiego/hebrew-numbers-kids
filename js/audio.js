import { NUMBERS, PRAISE, pickRandom } from './data.js';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
        this.hebrewVoice = null;
        this.voicesLoaded = false;
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available');
        }
        this._loadVoices();
    }

    _loadVoices() {
        const findBest = () => {
            const voices = speechSynthesis.getVoices();
            if (!voices.length) return;
            this.voicesLoaded = true;

            // Prefer high-quality Hebrew voices
            const heVoices = voices.filter(v => v.lang.startsWith('he'));
            if (heVoices.length) {
                // Prefer Google or premium voices
                this.hebrewVoice =
                    heVoices.find(v => v.name.includes('Google')) ||
                    heVoices.find(v => !v.localService) ||
                    heVoices[0];
            }
        };

        findBest();
        // Voices load async on many browsers
        speechSynthesis.onvoiceschanged = findBest;
        // Some mobile browsers need a retry
        setTimeout(findBest, 500);
        setTimeout(findBest, 2000);
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    speak(text) {
        if (!this.enabled) return Promise.resolve();
        return new Promise(resolve => {
            // Cancel any ongoing speech
            speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            utterance.rate = 0.8;
            utterance.pitch = 1.05;
            utterance.volume = 1.0;

            if (this.hebrewVoice) {
                utterance.voice = this.hebrewVoice;
            }

            utterance.onend = resolve;
            utterance.onerror = resolve;

            // Mobile Safari fix: speech can stall, add timeout
            const timeout = setTimeout(resolve, 4000);
            utterance.onend = () => { clearTimeout(timeout); resolve(); };
            utterance.onerror = () => { clearTimeout(timeout); resolve(); };

            // Mobile Chrome fix: must speak from user gesture context
            // We queue it — the first user tap in splash already unlocks it
            speechSynthesis.speak(utterance);
        });
    }

    speakNumber(n) {
        const data = NUMBERS[n - 1];
        if (!data) return Promise.resolve();
        return this.speak(data.word);
    }

    speakPraise() {
        const phrase = pickRandom(PRAISE).replace('!', '');
        return this.speak(phrase);
    }

    playTone(freq, duration = 0.15, type = 'sine') {
        if (!this.enabled || !this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) { /* ignore */ }
    }

    playPop() {
        this.playTone(600, 0.1, 'sine');
        setTimeout(() => this.playTone(800, 0.08, 'sine'), 50);
    }

    playDing() {
        this.playTone(880, 0.3, 'sine');
        setTimeout(() => this.playTone(1100, 0.3, 'sine'), 100);
    }

    playSuccess() {
        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            setTimeout(() => this.playTone(freq, 0.2, 'sine'), i * 100);
        });
    }

    playWhoosh() {
        if (!this.enabled || !this.ctx) return;
        try {
            if (this.ctx.state === 'suspended') this.ctx.resume();
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(400, this.ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + 0.2);
        } catch (e) { /* ignore */ }
    }

    playGentleError() {
        this.playTone(400, 0.15, 'triangle');
        setTimeout(() => this.playTone(300, 0.15, 'triangle'), 120);
        setTimeout(() => this.playTone(200, 0.25, 'triangle'), 240);
    }

    playCountStep(n) {
        const baseFreq = 400;
        this.playTone(baseFreq + n * 50, 0.12, 'sine');
    }
}

export const audio = new AudioManager();
