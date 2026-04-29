import { TILE, clamp } from './shared.js';

const MASTER = .46;

export class AudioEngine {
  constructor(){
    this.ctx = null;
    this.master = null;
    this.music = null;
    this.started = false;
    this.enabled = true;
    this.nextNote = 0;
    this.step = 0;
    this.ambienceTimer = 0;
  }
  async start(){
    if(this.started || !this.enabled) return;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if(!Ctx) { this.enabled = false; return; }
    this.ctx = new Ctx();
    this.master = this.ctx.createGain();
    this.master.gain.value = MASTER;
    this.master.connect(this.ctx.destination);
    this.music = this.ctx.createGain();
    this.music.gain.value = .22;
    this.music.connect(this.master);
    if(this.ctx.state === 'suspended') await this.ctx.resume();
    this.started = true;
  }
  tick(dt, game){
    if(!this.started || !this.ctx) return;
    const now = this.ctx.currentTime;
    const night = game?.nightAmount ? game.nightAmount() : 0;
    this.music.gain.setTargetAtTime(.16 + night*.08, now, .7);
    if(this.nextNote < now) this.scheduleMusic(now, game);
    this.ambienceTimer -= dt;
    if(this.ambienceTimer <= 0){
      this.ambienceTimer = 3.5 + Math.random()*4;
      this.ambient(game);
    }
  }
  scheduleMusic(now, game){
    const scale = [0,3,5,7,10,12,15,17];
    const island = game?.island || 1;
    const root = 174.61 * Math.pow(2, Math.min(2,island-1)/12);
    const idx = (this.step + (game?.world?.kind === 'dungeon' ? 2 : 0)) % scale.length;
    const note = root * Math.pow(2, scale[idx]/12);
    const bass = root * .5 * Math.pow(2, scale[(idx+3)%scale.length]/12);
    this.tone(note, .42, 'triangle', .045, now, this.music, .012);
    if(this.step % 2 === 0) this.tone(bass, .72, 'sine', .055, now, this.music, .018);
    if(this.step % 4 === 0) this.noise(.18, .018, 900, now+.03, this.music);
    this.step++;
    this.nextNote = now + (game?.world?.kind === 'dungeon' ? .48 : .62);
  }
  tone(freq, dur=.15, type='sine', gain=.08, start=null, out=null, attack=.004){
    if(!this.started || !this.ctx) return;
    const now = start ?? this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(gain, now + attack);
    g.gain.exponentialRampToValueAtTime(.0001, now + dur);
    osc.connect(g); g.connect(out || this.master);
    osc.start(now); osc.stop(now + dur + .03);
  }
  noise(dur=.12, gain=.06, filterFreq=1200, start=null, out=null){
    if(!this.started || !this.ctx) return;
    const now = start ?? this.ctx.currentTime;
    const rate = this.ctx.sampleRate;
    const buffer = this.ctx.createBuffer(1, Math.max(1, Math.floor(rate*dur)), rate);
    const data = buffer.getChannelData(0);
    for(let i=0;i<data.length;i++) data[i] = Math.random()*2-1;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const g = this.ctx.createGain();
    filter.type = 'lowpass'; filter.frequency.value = filterFreq;
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(.0001, now+dur);
    src.buffer = buffer;
    src.connect(filter); filter.connect(g); g.connect(out || this.master);
    src.start(now); src.stop(now+dur+.02);
  }
  sfx(name, amount=1){
    if(!this.started || !this.ctx || !this.enabled) return;
    const a = clamp(amount, .25, 2.5);
    const now = this.ctx.currentTime;
    if(name === 'step') this.tone(95+Math.random()*22, .045, 'sine', .018*a, now);
    else if(name === 'splash') { this.noise(.18, .052*a, 850, now); this.tone(220, .09, 'sine', .018*a, now+.02); }
    else if(name === 'hit') { this.noise(.075, .075*a, 1700, now); this.tone(120, .06, 'square', .025*a, now); }
    else if(name === 'wood') { this.tone(178, .085, 'square', .04*a, now); this.noise(.055, .035*a, 1300, now); }
    else if(name === 'stone') { this.tone(310, .06, 'triangle', .05*a, now); this.noise(.055, .04*a, 2600, now); }
    else if(name === 'pickup') { this.tone(523, .07, 'triangle', .04*a, now); this.tone(784, .08, 'triangle', .035*a, now+.055); }
    else if(name === 'eat') { this.tone(260, .06, 'sine', .035*a, now); this.tone(330, .06, 'sine', .03*a, now+.05); }
    else if(name === 'craft') { this.tone(392, .08, 'triangle', .045*a, now); this.tone(659, .13, 'triangle', .04*a, now+.08); }
    else if(name === 'build') { this.tone(196, .08, 'square', .05*a, now); this.tone(294, .11, 'square', .04*a, now+.08); }
    else if(name === 'monkey') { this.tone(740, .07, 'triangle', .035*a, now); this.tone(520, .08, 'triangle', .035*a, now+.055); }
    else if(name === 'damage') { this.noise(.16, .08*a, 700, now); this.tone(86, .15, 'sawtooth', .045*a, now); }
    else if(name === 'select') this.tone(620, .045, 'triangle', .025*a, now);
    else if(name === 'ui') this.tone(440, .045, 'sine', .022*a, now);
    else if(name === 'win') { [523,659,784,1046].forEach((f,i)=>this.tone(f,.22,'triangle',.05*a,now+i*.09)); }
  }
  ambient(game){
    if(!game || game.world?.kind === 'dungeon'){
      this.tone(70 + Math.random()*30, 1.2, 'sine', .018, this.ctx.currentTime);
      return;
    }
    const tile = game.world.tile(Math.floor(game.player.x/TILE), Math.floor(game.player.y/TILE));
    if(tile === 'water' || tile === 'shallow') this.noise(.55, .026, 500);
    else if(Math.random() < .6) this.tone(900+Math.random()*500, .08, 'sine', .015);
  }
}
