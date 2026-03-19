import { NUMBERS, PRAISE, pickRandom } from './data.js';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
        this.audioCache = {};
    }

    init() {
        if (this.initialized) return;
        try {
            this.ctx = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (e) {
            console.warn('Web Audio API not available');
        }
    }

    toggle() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    // Use Google Translate TTS for high-quality Hebrew speech
    _googleTtsUrl(text) {
        return `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=he&q=${encodeURIComponent(text)}`;
    }

    _playAudioUrl(url) {
        if (!this.enabled) return Promise.resolve();
        return new Promise(resolve => {
            const audio = new Audio(url);
            audio.volume = 1.0;
            audio.onended = resolve;
            audio.onerror = () => {
                // Fallback to SpeechSynthesis
                this._speakFallback(url.includes('q=') ? decodeURIComponent(url.split('q=')[1]) : '');
                resolve();
            };
            audio.play().catch(() => {
                this._speakFallback(decodeURIComponent(url.split('q=')[1] || ''));
                resolve();
            });
        });
    }

    _speakFallback(text) {
        if (!this.enabled || !text) return;
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            utterance.rate = 0.85;
            utterance.pitch = 1.1;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        } catch (e) { /* ignore */ }
    }

    speak(text, rate = 0.85) {
        if (!this.enabled) return Promise.resolve();
        return this._playAudioUrl(this._googleTtsUrl(text));
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
        // More noticeable wrong sound — descending tones
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
