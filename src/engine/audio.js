// Procedural WebAudio engine for the Island runtime.
// All SFX, ambient pads and tropical chiptune BGM are synthesized at runtime;
// no audio files are shipped with the build.
//
// Features:
//  - Instant resume on first user gesture (mobile autoplay safe)
//  - Categorical mixers (master, sfx, music, ambient) with persisted preferences
//  - Throttling so spammy events (footsteps, woodchips) don't clip
//  - Day/night ambient crossfade
//  - 4-track procedural tropical BGM with verse/chorus progression
const STORAGE_KEY = 'castaway_audio_settings_v1';
const NOISE_SECONDS = 1.6;
const CHIP_SCALE = [0, 2, 4, 7, 9, 12, 14, 16]; // major pent + extras
const NOTE_FREQ = (semi) => 440 * Math.pow(2, (semi - 9) / 12);

export class AudioEngine {
  constructor(){
    this.ctx = null;
    this.master = null;
    this.sfxGain = null;
    this.musicGain = null;
    this.ambientGain = null;
    this.noiseBuffer = null;
    this.lastPlay = {};
    this.muted = false;
    this.musicVol = 0.55;
    this.sfxVol = 0.85;
    this.musicNode = null;
    this.musicTimer = 0;
    this.musicBeat = 0;
    this.musicEnabled = false; // BGM disabled by default
    this.ambientNode = null;
    this.ambientType = null;
    this.ready = false;
    this.unlocked = false;
    this.loadPrefs();
  }
  loadPrefs(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      if (typeof data.muted === 'boolean') this.muted = data.muted;
      if (typeof data.musicVol === 'number') this.musicVol = Math.max(0, Math.min(1, data.musicVol));
      if (typeof data.sfxVol === 'number') this.sfxVol = Math.max(0, Math.min(1, data.sfxVol));
      if (typeof data.musicEnabled === 'boolean') this.musicEnabled = data.musicEnabled;
    } catch(_e) { /* ignore */ }
  }
  savePrefs(){
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({muted:this.muted, musicVol:this.musicVol, sfxVol:this.sfxVol, musicEnabled:this.musicEnabled})); } catch(_e){}
  }
  ensureContext(){
    if (this.ctx) return this.ctx;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 1;
    this.master.connect(ctx.destination);
    this.sfxGain = ctx.createGain(); this.sfxGain.gain.value = this.sfxVol; this.sfxGain.connect(this.master);
    this.musicGain = ctx.createGain(); this.musicGain.gain.value = this.musicVol; this.musicGain.connect(this.master);
    this.ambientGain = ctx.createGain(); this.ambientGain.gain.value = 0.5; this.ambientGain.connect(this.master);
    // Noise buffer used by many percussive SFX.
    const buf = ctx.createBuffer(1, ctx.sampleRate * NOISE_SECONDS, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i=0;i<data.length;i++) data[i] = Math.random()*2 - 1;
    this.noiseBuffer = buf;
    this.ready = true;
    return ctx;
  }
  unlock(){
    const ctx = this.ensureContext();
    if (!ctx) return false;
    if (ctx.state === 'suspended') ctx.resume().catch(()=>{});
    this.unlocked = true;
    return true;
  }
  setMuted(m){ this.muted = !!m; if (this.master) this.master.gain.value = this.muted ? 0 : 1; this.savePrefs(); }
  toggleMute(){ this.setMuted(!this.muted); return this.muted; }
  setMusicEnabled(on){
    this.musicEnabled = !!on;
    if (!this.musicEnabled && this.musicNode){ try{ this.musicNode.disconnect(); } catch(_e){} this.musicNode = null; }
    this.savePrefs();
  }
  // Internal: play tone with envelope; returns gain node
  _tone(opts){
    const ctx = this.ensureContext(); if (!ctx) return null;
    if (this.muted) return null;
    const t0 = opts.t0 ?? ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = opts.type || 'sine';
    const f0 = opts.f0 || 220, f1 = opts.f1 ?? f0;
    osc.frequency.setValueAtTime(f0, t0);
    if (f1 !== f0) osc.frequency.exponentialRampToValueAtTime(Math.max(20,f1), t0 + (opts.dur || 0.15));
    const gain = ctx.createGain();
    const peak = (opts.gain ?? 0.32);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.005));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (opts.dur || 0.18));
    osc.connect(gain).connect(opts.bus || this.sfxGain);
    osc.start(t0); osc.stop(t0 + (opts.dur || 0.18) + 0.05);
    return gain;
  }
  _noise(opts){
    const ctx = this.ensureContext(); if (!ctx || this.muted) return null;
    const t0 = opts.t0 ?? ctx.currentTime;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer;
    const filt = ctx.createBiquadFilter(); filt.type = opts.filterType || 'bandpass';
    filt.frequency.value = opts.freq || 800;
    filt.Q.value = opts.q || 0.9;
    const gain = ctx.createGain();
    const peak = opts.gain ?? 0.35;
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(peak, t0 + (opts.attack || 0.005));
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + (opts.dur || 0.18));
    src.connect(filt).connect(gain).connect(opts.bus || this.sfxGain);
    src.start(t0); src.stop(t0 + (opts.dur || 0.18) + 0.05);
    return gain;
  }
  _throttle(key, ms){
    const now = performance.now();
    if (this.lastPlay[key] && now - this.lastPlay[key] < ms) return false;
    this.lastPlay[key] = now;
    return true;
  }
  play(name, opts={}){
    if (!this.ensureContext() || this.muted) return;
    const ctx = this.ctx;
    const now = ctx.currentTime;
    const v = opts.volume ?? 1;
    const detune = opts.detune ?? 0;
    switch(name){
      case 'chop': {
        if (!this._throttle('chop', 110)) return;
        this._noise({t0:now, freq:1200, q:1.4, dur:0.16, gain:0.45*v, filterType:'bandpass'});
        this._tone({t0:now, type:'square', f0:300+detune, f1:130, dur:0.18, gain:0.18*v});
        break;
      }
      case 'mine': {
        if (!this._throttle('mine', 130)) return;
        this._noise({t0:now, freq:380, q:1.6, dur:0.22, gain:0.5*v});
        this._tone({t0:now, type:'square', f0:140+detune, f1:60, dur:0.22, gain:0.22*v});
        break;
      }
      case 'hit_flesh': {
        this._noise({t0:now, freq:520, dur:0.12, gain:0.35*v});
        this._tone({t0:now, type:'sawtooth', f0:230, f1:90, dur:0.18, gain:0.18*v});
        break;
      }
      case 'attack_swing': {
        if (!this._throttle('atk', 100)) return;
        this._noise({t0:now, freq:2200, q:0.7, dur:0.12, gain:0.32*v, filterType:'highpass'});
        this._tone({t0:now, type:'triangle', f0:660, f1:240, dur:0.14, gain:0.18*v});
        break;
      }
      case 'attack_metal': {
        this._noise({t0:now, freq:3200, q:0.6, dur:0.18, gain:0.4*v, filterType:'highpass'});
        this._tone({t0:now, type:'square', f0:880, f1:340, dur:0.2, gain:0.18*v});
        break;
      }
      case 'pickup': {
        if (!this._throttle('pickup', 60)) return;
        this._tone({t0:now, type:'triangle', f0:540, f1:880, dur:0.12, gain:0.28*v});
        this._tone({t0:now+0.08, type:'sine', f0:1200, f1:1500, dur:0.1, gain:0.18*v});
        break;
      }
      case 'deposit': {
        this._tone({t0:now, type:'square', f0:240, f1:380, dur:0.14, gain:0.22*v});
        this._tone({t0:now+0.08, type:'square', f0:420, f1:560, dur:0.14, gain:0.22*v});
        break;
      }
      case 'eat': {
        this._noise({t0:now, freq:520, q:1.2, dur:0.18, gain:0.35*v});
        this._tone({t0:now+0.08, type:'sine', f0:740, f1:520, dur:0.14, gain:0.16*v});
        break;
      }
      case 'craft': {
        this._noise({t0:now, freq:900, dur:0.18, gain:0.28*v});
        this._tone({t0:now+0.05, type:'square', f0:520, f1:880, dur:0.18, gain:0.2*v});
        break;
      }
      case 'build_complete': {
        for (let i=0;i<3;i++) this._tone({t0:now+i*0.08, type:'triangle', f0:440*(1+i*0.25), dur:0.18, gain:0.28*v});
        break;
      }
      case 'place': {
        this._tone({t0:now, type:'square', f0:320, f1:280, dur:0.1, gain:0.22*v});
        break;
      }
      case 'menu_open': {
        this._tone({t0:now, type:'triangle', f0:440, f1:660, dur:0.12, gain:0.28*v});
        break;
      }
      case 'menu_close': {
        this._tone({t0:now, type:'triangle', f0:660, f1:330, dur:0.12, gain:0.24*v});
        break;
      }
      case 'select': {
        if (!this._throttle('select', 60)) return;
        this._tone({t0:now, type:'square', f0:880, f1:1100, dur:0.06, gain:0.2*v});
        break;
      }
      case 'damage': {
        this._noise({t0:now, freq:140, q:0.9, dur:0.32, gain:0.45*v, filterType:'lowpass'});
        this._tone({t0:now, type:'sawtooth', f0:200, f1:60, dur:0.32, gain:0.22*v});
        break;
      }
      case 'death': {
        this._tone({t0:now, type:'sawtooth', f0:300, f1:60, dur:0.55, gain:0.34*v});
        this._noise({t0:now, freq:240, dur:0.6, gain:0.32*v});
        break;
      }
      case 'tame': {
        this._tone({t0:now, type:'sine', f0:520, f1:880, dur:0.18, gain:0.28*v});
        this._tone({t0:now+0.12, type:'sine', f0:720, f1:1320, dur:0.18, gain:0.28*v});
        this._tone({t0:now+0.24, type:'sine', f0:1040, f1:1760, dur:0.2, gain:0.28*v});
        break;
      }
      case 'raid_alert': {
        for (let i=0;i<3;i++){
          this._tone({t0:now + i*0.18, type:'sawtooth', f0:280, f1:520, dur:0.16, gain:0.4*v});
        }
        break;
      }
      case 'win_fanfare': {
        const seq = [0,4,7,12,16,19];
        for (let i=0;i<seq.length;i++){
          this._tone({t0:now + i*0.12, type:'triangle', f0:NOTE_FREQ(60+seq[i]), dur:0.22, gain:0.32*v});
        }
        break;
      }
      case 'splash': {
        if (!this._throttle('splash', 120)) return;
        this._noise({t0:now, freq:980, q:0.9, dur:0.16, gain:0.24*v, filterType:'bandpass'});
        this._noise({t0:now+0.02, freq:420, q:0.7, dur:0.36, gain:0.34*v, filterType:'lowpass'});
        this._tone({t0:now, type:'sine', f0:220, f1:120, dur:0.14, gain:0.08*v});
        break;
      }
      case 'fire_pop': {
        if (!this._throttle('fire', 220)) return;
        this._noise({t0:now, freq:1100, q:1.4, dur:0.08, gain:0.18*v});
        break;
      }
      case 'footstep': {
        if (!this._throttle('foot', 220)) return;
        this._noise({t0:now, freq:opts.freq||320, q:1.5, dur:0.05, gain:0.13*v, filterType:'lowpass'});
        this._tone({t0:now, type:'triangle', f0:110, f1:82, dur:0.05, gain:0.03*v});
        break;
      }
      case 'wade': {
        if (!this._throttle('wade', 180)) return;
        this._noise({t0:now, freq:760, q:0.8, dur:0.11, gain:0.16*v, filterType:'bandpass'});
        this._noise({t0:now+0.01, freq:280, q:0.7, dur:0.18, gain:0.22*v, filterType:'lowpass'});
        this._tone({t0:now, type:'sine', f0:180, f1:110, dur:0.1, gain:0.045*v});
        break;
      }
      case 'jump': {
        if (!this._throttle('jump', 120)) return;
        this._noise({t0:now, freq:280, q:0.9, dur:0.08, gain:0.10*v, filterType:'lowpass'});
        this._tone({t0:now, type:'triangle', f0:190, f1:310, dur:0.12, gain:0.09*v});
        break;
      }
    }
  }
  // ---------- Procedural BGM (tropical chiptune) ----------
  // Drives 4 voices per beat using a friendly major/pentatonic theme.
  startMusic(){
    if (!this.musicEnabled || this.muted || !this.ensureContext()) return;
    if (this.musicNode) return;
    this.musicNode = { active:true };
    this.musicBeat = 0;
    this._scheduleNextBeat();
  }
  stopMusic(){ if (this.musicNode){ this.musicNode.active=false; this.musicNode=null; } }
  _scheduleNextBeat(){
    if (!this.musicNode || !this.musicNode.active || !this.ctx) return;
    const ctx = this.ctx;
    const tempo = 96; // bpm
    const beatDur = 60/tempo / 2; // 1/8th notes
    const t = ctx.currentTime;
    const beat = this.musicBeat;
    // Chord progression I-V-vi-IV in C: C, G, Am, F (bass roots)
    const chordRoots = [60, 67, 69, 65];
    const chord = chordRoots[Math.floor(beat/8)%chordRoots.length];
    const triadOffsets = [0, 4, 7];
    // Bass on quarters
    if (beat % 2 === 0){
      const bassNote = chord - 24;
      this._tone({t0:t, type:'triangle', f0:NOTE_FREQ(bassNote), dur:beatDur*1.6, gain:0.28, attack:0.01, bus:this.musicGain});
    }
    // Pad chord every 4 beats
    if (beat % 4 === 0){
      for (const off of triadOffsets){
        this._tone({t0:t, type:'sine', f0:NOTE_FREQ(chord-12+off), dur:beatDur*4, gain:0.07, attack:0.5, bus:this.musicGain});
      }
    }
    // Lead pentatonic riff: pick from CHIP_SCALE around chord root
    if (beat % 1 === 0 && Math.random() < 0.85){
      const note = chord + CHIP_SCALE[Math.floor(Math.random()*CHIP_SCALE.length)];
      const dur = beatDur * (0.7 + Math.random()*0.6);
      this._tone({t0:t+0.005, type:'square', f0:NOTE_FREQ(note), dur, gain:0.10, attack:0.005, bus:this.musicGain});
    }
    // Light percussion on backbeats
    if (beat % 4 === 2){
      this._noise({t0:t, freq:1800, q:0.5, dur:0.1, gain:0.18, filterType:'highpass', bus:this.musicGain});
    }
    if (beat % 2 === 0){
      this._noise({t0:t, freq:120, q:0.6, dur:0.06, gain:0.18, filterType:'lowpass', bus:this.musicGain});
    }
    this.musicBeat = beat + 1;
    setTimeout(()=>this._scheduleNextBeat(), beatDur*1000);
  }
  // ---------- Ambient bed ----------
  setAmbient(kind){
    if (this.ambientType === kind) return;
    if (!this.ensureContext()) return;
    if (this.ambientNode){ try{ this.ambientNode.stop(); } catch(_e){} this.ambientNode = null; }
    if (this.ambientLFOs) { this.ambientLFOs.forEach(lfo => { try { lfo.stop(); } catch(_e){} }); this.ambientLFOs = []; }
    this.ambientType = kind;
    if (this.muted) return;
    const ctx = this.ctx;
    const src = ctx.createBufferSource(); src.buffer = this.noiseBuffer; src.loop = true;
    const filt = ctx.createBiquadFilter();
    const localGain = ctx.createGain();

    if (kind === 'overworld'){ 
      filt.type='lowpass'; filt.frequency.value = 520; 
      localGain.gain.value = 0.07; 
      
      const lfoFreq = ctx.createOscillator();
      lfoFreq.type = 'sine';
      lfoFreq.frequency.value = 0.09;
      const lfoFreqGain = ctx.createGain();
      lfoFreqGain.gain.value = 220; 
      lfoFreq.connect(lfoFreqGain).connect(filt.frequency);
      lfoFreq.start();

      const lfoVol = ctx.createOscillator();
      lfoVol.type = 'sine';
      lfoVol.frequency.value = 0.11;
      const lfoVolGain = ctx.createGain();
      lfoVolGain.gain.value = 0.02;
      lfoVol.connect(lfoVolGain).connect(localGain.gain);
      lfoVol.start();

      const surf = ctx.createOscillator();
      surf.type = 'sine';
      surf.frequency.value = 0.18;
      const surfGain = ctx.createGain();
      surfGain.gain.value = 35;
      surf.connect(surfGain).connect(filt.detune);
      surf.start();

      this.ambientLFOs = [lfoFreq, lfoVol, surf];
    }
    else if (kind === 'night'){ filt.type='lowpass'; filt.frequency.value = 600; localGain.gain.value = 0.12; }
    else if (kind === 'dungeon'){ filt.type='lowpass'; filt.frequency.value = 380; localGain.gain.value = 0.14; }
    else { filt.type='lowpass'; filt.frequency.value = 1000; localGain.gain.value = 0.10; }
    
    src.connect(filt).connect(localGain).connect(this.ambientGain);
    src.start();
    this.ambientNode = src;
  }
  setMusicVolume(v){ this.musicVol = Math.max(0, Math.min(1, v)); if (this.musicGain) this.musicGain.gain.value = this.musicVol; this.savePrefs(); }
  setSfxVolume(v){ this.sfxVol = Math.max(0, Math.min(1, v)); if (this.sfxGain) this.sfxGain.gain.value = this.sfxVol; this.savePrefs(); }
}
