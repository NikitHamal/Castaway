export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = {x:0, y:0, down:false, clicked:false, rightClicked:false, worldX:0, worldY:0};
    this.touch = {
      active:false,
      joystickId:null,
      actionId:null,
      joyOriginX:0,
      joyOriginY:0,
      joyX:0,
      joyY:0,
      moveX:0,
      moveY:0,
      actionDown:false,
      actionClicked:false
    };
    this.pointerMode = 'mouse';
    this.lastPointerType = 'mouse';
    canvas.tabIndex = 0;
    canvas.style.touchAction = 'none';
    window.addEventListener('keydown', e => {
      const key = this.norm(e.key);
      if (!this.keys.has(key)) this.pressed.add(key);
      this.keys.add(key);
      if ([' ','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Tab'].includes(e.key)) e.preventDefault();
    }, {passive:false});
    window.addEventListener('keyup', e => { this.keys.delete(this.norm(e.key)); });
    canvas.addEventListener('mousemove', e => this.updateMouse(e));
    canvas.addEventListener('mousedown', e => {
      this.pointerMode = 'mouse';
      this.lastPointerType = 'mouse';
      this.updateMouse(e);
      if (e.button === 0) { this.mouse.down = true; this.mouse.clicked = true; }
      if (e.button === 2) { this.mouse.rightClicked = true; }
    });
    window.addEventListener('mouseup', e => { if (e.button === 0) this.mouse.down = false; });
    canvas.addEventListener('pointerdown', e => this.pointerDown(e), {passive:false});
    canvas.addEventListener('pointermove', e => this.pointerMove(e), {passive:false});
    window.addEventListener('pointerup', e => this.pointerUp(e), {passive:false});
    window.addEventListener('pointercancel', e => this.pointerUp(e), {passive:false});
    canvas.addEventListener('contextmenu', e => e.preventDefault());
  }
  norm(k){ if (k === ' ') return 'space'; return String(k).toLowerCase(); }
  down(k){ return this.keys.has(k.toLowerCase()); }
  hit(k){ return this.pressed.has(k.toLowerCase()); }
  setCanvasPoint(clientX, clientY){
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (clientY - r.top) * (this.canvas.height / r.height);
  }
  updateMouse(e){ this.setCanvasPoint(e.clientX, e.clientY); }
  pointerDown(e){
    if(e.pointerType === 'mouse') return;
    e.preventDefault();
    this.pointerMode = 'touch';
    this.lastPointerType = e.pointerType;
    this.touch.active = true;
    this.setCanvasPoint(e.clientX, e.clientY);
    const r = this.canvas.getBoundingClientRect();
    const cssX = e.clientX - r.left;
    const cssY = e.clientY - r.top;
    if(cssX < r.width * .56 && this.touch.joystickId === null){
      this.touch.joystickId = e.pointerId;
      this.touch.joyOriginX = this.mouse.x;
      this.touch.joyOriginY = this.mouse.y;
      this.touch.joyX = this.mouse.x;
      this.touch.joyY = this.mouse.y;
      this.touch.moveX = 0;
      this.touch.moveY = 0;
      this.canvas.setPointerCapture?.(e.pointerId);
      return;
    }
    this.touch.actionId = e.pointerId;
    this.touch.actionDown = true;
    this.touch.actionClicked = true;
    this.mouse.down = true;
    this.mouse.clicked = true;
    this.canvas.setPointerCapture?.(e.pointerId);
  }
  pointerMove(e){
    if(e.pointerType === 'mouse') return;
    e.preventDefault();
    this.setCanvasPoint(e.clientX, e.clientY);
    if(e.pointerId === this.touch.joystickId){
      this.touch.joyX = this.mouse.x;
      this.touch.joyY = this.mouse.y;
      const max = Math.max(42, Math.min(this.canvas.width, this.canvas.height) * .085);
      let dx = this.touch.joyX - this.touch.joyOriginX;
      let dy = this.touch.joyY - this.touch.joyOriginY;
      const len = Math.hypot(dx,dy);
      if(len > max){ dx = dx / len * max; dy = dy / len * max; }
      this.touch.moveX = dx / max;
      this.touch.moveY = dy / max;
      this.touch.joyX = this.touch.joyOriginX + dx;
      this.touch.joyY = this.touch.joyOriginY + dy;
    }
  }
  pointerUp(e){
    if(e.pointerType === 'mouse') return;
    e.preventDefault();
    if(e.pointerId === this.touch.joystickId){
      this.touch.joystickId = null;
      this.touch.moveX = 0;
      this.touch.moveY = 0;
    }
    if(e.pointerId === this.touch.actionId){
      this.touch.actionId = null;
      this.touch.actionDown = false;
      this.mouse.down = false;
    }
    this.touch.active = this.touch.joystickId !== null || this.touch.actionId !== null;
  }
  endFrame(){
    this.pressed.clear();
    this.mouse.clicked = false;
    this.mouse.rightClicked = false;
    this.touch.actionClicked = false;
  }
}
