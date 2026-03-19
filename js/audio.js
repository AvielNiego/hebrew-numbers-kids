import { NUMBERS, PRAISE, pickRandom } from './data.js';

class AudioManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.initialized = false;
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

    speak(text, rate = 0.85) {
        if (!this.enabled) return Promise.resolve();
        return new Promise(resolve => {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'he-IL';
            utterance.rate = rate;
            utterance.pitch = 1.1;
            utterance.onend = resolve;
            utterance.onerror = resolve;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
            setTimeout(resolve, 3000);
        });
    }

    speakNumber(n) {
        const data = NUMBERS[n - 1];
        if (!data) return Promise.resolve();
        return this.speak(data.word);
    }

    speakPraise() {
        const phrase = pickRandom(PRAISE);
        return this.speak(phrase.replace('!', ''));
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
        this.playTone(300, 0.15, 'triangle');
        setTimeout(() => this.playTone(250, 0.2, 'triangle'), 100);
    }

    playCountStep(n) {
        const baseFreq = 400;
        this.playTone(baseFreq + n * 50, 0.12, 'sine');
    }
}

export const audio = new AudioManager();
