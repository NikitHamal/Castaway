// Procedural sound & generative ambient music using Web Audio API
export class Sound {
  constructor() {
    this.ctx = null;
    this.master = null;
    this.musicNodes = [];
    this.musicPlaying = false;
    this.initialized = false;
    this.volume = 0.45;
  }

  init() {
    if (this.initialized) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.volume;
    this.master.connect(this.ctx.destination);
    this.initialized = true;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    if (this.master) this.master.gain.value = this.volume;
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
  }

  _now() { return this.ctx ? this.ctx.currentTime : 0; }

  _noiseBuffer(duration = 1) {
    const sr = this.ctx.sampleRate;
    const len = sr * duration;
    const buf = this.ctx.createBuffer(1, len, sr);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    return buf;
  }

  _playNoise(duration, fadeOut, filterFreq, gainVal) {
    if (!this.ctx) return;
    const src = this.ctx.createBufferSource();
    src.buffer = this._noiseBuffer(duration);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = filterFreq;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(gainVal, this._now());
    gain.gain.exponentialRampToValueAtTime(0.001, this._now() + fadeOut);
    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    src.start();
    src.stop(this._now() + fadeOut);
  }

  _playTone(freq, type, duration, gainVal, slideTo = null) {
    if (!this.ctx) return;
    const o = this.ctx.createOscillator();
    o.type = type;
    o.frequency.setValueAtTime(freq, this._now());
    if (slideTo != null) o.frequency.exponentialRampToValueAtTime(slideTo, this._now() + duration);
    const g = this.ctx.createGain();
    g.gain.setValueAtTime(gainVal, this._now());
    g.gain.exponentialRampToValueAtTime(0.001, this._now() + duration);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(this._now() + duration);
  }

  chop() {
    if (!this.ctx) return;
    this._playNoise(0.12, 0.12, 1200, 0.35);
    this._playTone(180, 'square', 0.08, 0.12, 90);
  }

  mine() {
    if (!this.ctx) return;
    this._playNoise(0.15, 0.15, 2800, 0.35);
    this._playTone(600, 'sawtooth', 0.1, 0.08, 200);
  }

  attack() {
    if (!this.ctx) return;
    this._playNoise(0.1, 0.1, 2200, 0.25);
    this._playTone(440, 'sawtooth', 0.12, 0.15, 110);
  }

  hit() {
    if (!this.ctx) return;
    this._playNoise(0.18, 0.18, 800, 0.4);
    this._playTone(120, 'square', 0.14, 0.18, 40);
  }

  pickup() {
    if (!this.ctx) return;
    this._playTone(660, 'sine', 0.08, 0.2, 880);
    setTimeout(() => this._playTone(880, 'sine', 0.1, 0.15, 1320), 60);
  }

  build() {
    if (!this.ctx) return;
    this._playNoise(0.1, 0.1, 600, 0.3);
    this._playTone(200, 'square', 0.12, 0.18, 100);
  }

  blueprint() {
    if (!this.ctx) return;
    this._playTone(440, 'sine', 0.1, 0.15, 660);
  }

  step() {
    if (!this.ctx) return;
    this._playNoise(0.05, 0.05, 400, 0.06);
  }

  swim() {
    if (!this.ctx) return;
    this._playNoise(0.3, 0.3, 900, 0.08);
  }

  eat() {
    if (!this.ctx) return;
    this._playTone(520, 'sine', 0.06, 0.18, 720);
    setTimeout(() => this._playTone(720, 'sine', 0.08, 0.12, 520), 80);
  }

  tame() {
    if (!this.ctx) return;
    this._playTone(330, 'sine', 0.15, 0.2, 440);
    setTimeout(() => this._playTone(440, 'sine', 0.15, 0.2, 550), 150);
    setTimeout(() => this._playTone(550, 'sine', 0.2, 0.15, 660), 300);
  }

  alert() {
    if (!this.ctx) return;
    this._playTone(300, 'square', 0.12, 0.2, 300);
    setTimeout(() => this._playTone(300, 'square', 0.12, 0.2, 300), 160);
  }

  win() {
    if (!this.ctx) return;
    [523, 659, 784, 1047].forEach((f, i) => this._playTone(f, 'sine', 0.4, 0.18, f * 1.5, i * 0.15));
  }

  gameOver() {
    if (!this.ctx) return;
    [400, 350, 300, 220].forEach((f, i) => this._playTone(f, 'sawtooth', 0.35, 0.18, f * 0.5, i * 0.18));
  }

  // Generative ambient BGM
  startMusic() {
    if (!this.ctx || this.musicPlaying) return;
    this.musicPlaying = true;
    this._musicLoop();
  }

  stopMusic() {
    this.musicPlaying = false;
    for (const n of this.musicNodes) { try { n.stop(); } catch (e) {} }
    this.musicNodes = [];
  }

  _musicLoop() {
    if (!this.musicPlaying || !this.ctx) return;
    const t = this._now();
    // Ocean waves drone
    const wave = this.ctx.createOscillator();
    wave.type = 'sine';
    wave.frequency.setValueAtTime(55 + Math.random() * 8, t);
    const waveGain = this.ctx.createGain();
    waveGain.gain.setValueAtTime(0.06, t);
    waveGain.gain.linearRampToValueAtTime(0.03, t + 4 + Math.random() * 4);
    wave.connect(waveGain);
    waveGain.connect(this.master);
    wave.start();
    wave.stop(t + 10);
    this.musicNodes.push(wave);

    // Soft pad chord
    const chord = [110, 164.81, 196, 220, 261.63, 329.63];
    const pick = chord[Math.floor(Math.random() * chord.length)];
    const pad = this.ctx.createOscillator();
    pad.type = 'triangle';
    pad.frequency.setValueAtTime(pick, t);
    const padGain = this.ctx.createGain();
    padGain.gain.setValueAtTime(0, t);
    padGain.gain.linearRampToValueAtTime(0.04, t + 1.5);
    padGain.gain.linearRampToValueAtTime(0, t + 6 + Math.random() * 4);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 600;
    pad.connect(filter);
    filter.connect(padGain);
    padGain.connect(this.master);
    pad.start();
    pad.stop(t + 12);
    this.musicNodes.push(pad);

    setTimeout(() => this._musicLoop(), 5000 + Math.random() * 5000);
  }
}
