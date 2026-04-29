// Input layer: keyboard + mouse + touch (virtual joystick + virtual buttons).
// Touch is detected on first touch event and a layout is set via setTouchLayout()
// so the renderer can draw matching control hints.
export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.virtualKeys = new Set();
    this.virtualPressed = new Set();
    this.virtualReleased = new Set();
    this.mouse = {x:0, y:0, down:false, clicked:false, rightClicked:false, worldX:0, worldY:0, wheel:0};
    // Touch state and virtual control regions:
    this.touchActive = false;
    this.usingTouch = false;
    this.isMobile = false;
    this.activeTouches = new Map();
    this.joystick = { active:false, baseX:0, baseY:0, x:0, y:0, dx:0, dy:0, id:null, radius:80 };
    this.aim = { active:false, x:0, y:0, id:null }; // right-side aim/look pad
    this.touchButtons = []; // {id,x,y,r,key,label}
    this.virtualMouseClick = false;
    this.virtualMouseRight = false;

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
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      this.mouse.wheel += Math.sign(e.deltaY);
    }, { passive: false });

    // Touch events
    const touchOpts = { passive:false };
    canvas.addEventListener('touchstart', e => this.handleTouchStart(e), touchOpts);
    canvas.addEventListener('touchmove', e => this.handleTouchMove(e), touchOpts);
    canvas.addEventListener('touchend', e => this.handleTouchEnd(e), touchOpts);
    canvas.addEventListener('touchcancel', e => this.handleTouchEnd(e), touchOpts);
    // Detect coarse pointer (mobile-ish) without requiring a touch yet.
    if (typeof window.matchMedia === 'function'){
      try { if (window.matchMedia('(pointer: coarse)').matches) this.isMobile = true; } catch(_e){}
    }
  }
  norm(k){ if (k === ' ') return 'space'; return String(k).toLowerCase(); }
  updateMouse(e){
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (e.clientY - r.top) * (this.canvas.height / r.height);
  }
  // ---- Touch helpers ----
  setTouchButtons(list){ this.touchButtons = list || []; }
  canvasPosFromTouch(t){
    const r = this.canvas.getBoundingClientRect();
    return {
      x:(t.clientX - r.left) * (this.canvas.width / r.width),
      y:(t.clientY - r.top) * (this.canvas.height / r.height)
    };
  }
  hitButton(x,y){
    for (const b of this.touchButtons){
      const dx = x - b.x, dy = y - b.y; const r = b.r || 44;
      if (dx*dx + dy*dy <= r*r) return b;
    }
    return null;
  }
  handleTouchStart(e){
    e.preventDefault();
    this.touchActive = true; this.usingTouch = true; this.isMobile = true;
    for (const t of e.changedTouches){
      const pos = this.canvasPosFromTouch(t);
      const btn = this.hitButton(pos.x, pos.y);
      if (btn){
        this.activeTouches.set(t.identifier, { kind:'btn', btn });
        if (btn.key){
          if (!this.virtualKeys.has(btn.key)) this.virtualPressed.add(btn.key);
          this.virtualKeys.add(btn.key);
        }
        if (btn.action === 'mouse_click') this.mouse.clicked = true;
        if (btn.action === 'mouse_right') this.mouse.rightClicked = true;
        continue;
      }
      // Left half is the move joystick, right half is aim / tap-to-act
      if (pos.x < this.canvas.width * 0.5 && !this.joystick.active){
        this.joystick.active = true; this.joystick.id = t.identifier;
        this.joystick.baseX = pos.x; this.joystick.baseY = pos.y;
        this.joystick.x = pos.x; this.joystick.y = pos.y;
        this.joystick.dx = 0; this.joystick.dy = 0;
        this.activeTouches.set(t.identifier, {kind:'joystick'});
      } else {
        this.aim.active = true; this.aim.id = t.identifier;
        this.aim.x = pos.x; this.aim.y = pos.y;
        this.activeTouches.set(t.identifier, {kind:'aim', startX:pos.x, startY:pos.y, startTime:performance.now(), moved:false});
        this.mouse.x = pos.x; this.mouse.y = pos.y;
      }
    }
  }
  handleTouchMove(e){
    e.preventDefault();
    for (const t of e.changedTouches){
      const meta = this.activeTouches.get(t.identifier); if (!meta) continue;
      const pos = this.canvasPosFromTouch(t);
      if (meta.kind === 'joystick'){
        const r = this.joystick.radius;
        let dx = pos.x - this.joystick.baseX, dy = pos.y - this.joystick.baseY;
        const len = Math.hypot(dx,dy);
        if (len > r){ dx = dx*r/len; dy = dy*r/len; }
        this.joystick.x = this.joystick.baseX + dx; this.joystick.y = this.joystick.baseY + dy;
        this.joystick.dx = dx / r; this.joystick.dy = dy / r;
      } else if (meta.kind === 'aim'){
        const dx = pos.x - meta.startX, dy = pos.y - meta.startY;
        if (Math.hypot(dx,dy) > 12) meta.moved = true;
        this.aim.x = pos.x; this.aim.y = pos.y;
        this.mouse.x = pos.x; this.mouse.y = pos.y;
      }
    }
  }
  handleTouchEnd(e){
    e.preventDefault();
    for (const t of e.changedTouches){
      const meta = this.activeTouches.get(t.identifier); if (!meta) continue;
      if (meta.kind === 'btn'){
        const btn = meta.btn;
        if (btn.key){
          this.virtualKeys.delete(btn.key);
          this.virtualReleased.add(btn.key);
        }
      } else if (meta.kind === 'joystick'){
        this.joystick.active = false; this.joystick.dx = 0; this.joystick.dy = 0; this.joystick.id = null;
      } else if (meta.kind === 'aim'){
        const dur = performance.now() - meta.startTime;
        // Treat short tap as a primary click (use tool / aim).
        if (!meta.moved && dur < 280){
          this.mouse.clicked = true;
        }
        this.aim.active = false; this.aim.id = null;
      }
      this.activeTouches.delete(t.identifier);
    }
  }
  // ---- Public API ----
  isUsingTouch(){ return this.usingTouch || this.touchActive; }
  down(k){
    const key = k.toLowerCase();
    if (this.keys.has(key) || this.virtualKeys.has(key)) return true;
    // Virtual joystick mapping:
    if (this.joystick.active){
      const dx = this.joystick.dx, dy = this.joystick.dy;
      const dead = 0.18;
      if ((key==='w' || key==='arrowup') && dy < -dead) return true;
      if ((key==='s' || key==='arrowdown') && dy > dead) return true;
      if ((key==='a' || key==='arrowleft') && dx < -dead) return true;
      if ((key==='d' || key==='arrowright') && dx > dead) return true;
    }
    return false;
  }
  hit(k){ const key = k.toLowerCase(); return this.pressed.has(key) || this.virtualPressed.has(key); }
  endFrame(){
    this.pressed.clear();
    this.virtualPressed.clear();
    this.virtualReleased.clear();
    this.mouse.clicked = false;
    this.mouse.rightClicked = false;
    this.mouse.wheel = 0;
    if (this.virtualMouseClick){ this.mouse.clicked = true; this.virtualMouseClick = false; }
    if (this.virtualMouseRight){ this.mouse.rightClicked = true; this.virtualMouseRight = false; }
  }
}
