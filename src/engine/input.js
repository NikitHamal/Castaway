export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = {x:0, y:0, down:false, clicked:false, rightClicked:false, worldX:0, worldY:0};
    this.touch = { active: false, dx:0, dy:0, action:false, interact:false, build:false, craft:false, mimic:false };
    this.isMobile = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    window.addEventListener('keydown', e => {
      const key = this.norm(e.key);
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) e.preventDefault();
    });
    window.addEventListener('keyup', e => { this.keys.delete(this.norm(e.key)); });
    canvas.addEventListener('mousemove', e => this.updateMouse(e));
    canvas.addEventListener('mousedown', e => {
      this.updateMouse(e);
      if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
      if (e.button === 2) { this.mouse.rightClicked = true; }
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; });
    canvas.addEventListener('contextmenu', e => e.preventDefault());

    this.setupMobileControls();
  }

  norm(k){ if (k === ' ') return 'space'; return String(k).toLowerCase(); }
  updateMouse(e){
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (e.clientY - r.top) * (this.canvas.height / r.height);
  }
  down(k){ return this.keys.has(k.toLowerCase()); }
  hit(k){ return this.pressed.has(k.toLowerCase()); }
  endFrame(){ this.pressed.clear(); this.mouse.clicked = false; this.mouse.rightClicked = false; }

  setupMobileControls(){
    if (!this.isMobile) return;
    const jZone = document.getElementById('joystickZone');
    const jBase = document.getElementById('joystickBase');
    const jKnob = document.getElementById('joystickKnob');
    if (!jZone || !jBase || !jKnob) return;

    let dragging = false, originX = 0, originY = 0;
    const maxDist = 42;

    const start = (x, y) => {
      dragging = true;
      const rect = jBase.getBoundingClientRect();
      originX = rect.left + rect.width / 2;
      originY = rect.top + rect.height / 2;
      move(x, y);
    };
    const move = (x, y) => {
      if (!dragging) return;
      let dx = x - originX;
      let dy = y - originY;
      const len = Math.hypot(dx, dy);
      if (len > maxDist) { dx = (dx / len) * maxDist; dy = (dy / len) * maxDist; }
      jKnob.style.left = (50 + (dx / maxDist) * 35) + '%';
      jKnob.style.top = (50 + (dy / maxDist) * 35) + '%';
      this.touch.dx = dx / maxDist;
      this.touch.dy = dy / maxDist;
    };
    const end = () => {
      dragging = false;
      this.touch.dx = 0;
      this.touch.dy = 0;
      jKnob.style.left = '50%';
      jKnob.style.top = '50%';
    };

    jZone.addEventListener('touchstart', e => { e.preventDefault(); start(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
    jZone.addEventListener('touchmove', e => { e.preventDefault(); move(e.touches[0].clientX, e.touches[0].clientY); }, {passive:false});
    jZone.addEventListener('touchend', e => { e.preventDefault(); end(); });
    jZone.addEventListener('touchcancel', e => { e.preventDefault(); end(); });

    const bindBtn = (id, key) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.addEventListener('touchstart', e => { e.preventDefault(); this.keys.add(key); this.pressed.add(key); this.touch[key] = true; }, {passive:false});
      btn.addEventListener('touchend', e => { e.preventDefault(); this.keys.delete(key); this.touch[key] = false; });
      btn.addEventListener('touchcancel', e => { e.preventDefault(); this.keys.delete(key); this.touch[key] = false; });
    };
    bindBtn('btnAction', 'space');
    bindBtn('btnInteract', 'e');
    bindBtn('btnBuild', 'b');
    bindBtn('btnCraft', 'c');
    bindBtn('btnMimic', 'm');
  }

  getMobileMovement() {
    if (!this.isMobile) return {dx:0, dy:0};
    let dx = 0, dy = 0;
    if (this.touch.dx !== 0) dx = this.touch.dx;
    if (this.touch.dy !== 0) dy = this.touch.dy;
    return {dx, dy};
  }
}
