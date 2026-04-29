export class Input {
  constructor(canvas){
    this.canvas = canvas;
    this.keys = new Set();
    this.pressed = new Set();
    this.mouse = {x:0, y:0, down:false, clicked:false, rightClicked:false, worldX:0, worldY:0};
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

    // Touch support
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      this.updateTouch(e);
      this.mouse.down = true;
      this.mouse.clicked = true;
    }, {passive: false});
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      this.updateTouch(e);
    }, {passive: false});
    window.addEventListener('touchend', e => {
      this.mouse.down = false;
    });
  }
  norm(k){ if (k === ' ') return 'space'; return String(k).toLowerCase(); }
  updateMouse(e){
    const r = this.canvas.getBoundingClientRect();
    this.mouse.x = (e.clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (e.clientY - r.top) * (this.canvas.height / r.height);
  }
  updateTouch(e){
    if (!e.touches || !e.touches.length) return;
    const r = this.canvas.getBoundingClientRect();
    const touch = e.touches[0];
    this.mouse.x = (touch.clientX - r.left) * (this.canvas.width / r.width);
    this.mouse.y = (touch.clientY - r.top) * (this.canvas.height / r.height);
  }
  down(k){ return this.keys.has(k.toLowerCase()); }
  hit(k){ return this.pressed.has(k.toLowerCase()); }
  endFrame(){ this.pressed.clear(); this.mouse.clicked = false; this.mouse.rightClicked = false; }
}
