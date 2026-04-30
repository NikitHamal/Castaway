import { listSlots, latestSlot, deleteSlot, formatPlayTime, formatSaveDate, normalizeSlotId } from './saveManager.js';

const GENERATION_STAGES = [
  ['Charting ocean currents', 0.08],
  ['Raising island shelves', 0.20],
  ['Simulating beaches and reefs', 0.34],
  ['Growing biomes and hazards', 0.52],
  ['Placing homes, docks and farm plots', 0.68],
  ['Balancing starter resources', 0.82],
  ['Packing save slot', 0.94],
  ['Ready', 1.00]
];

function el(tag, className='', text=''){
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

export class MainMenu {
  constructor({ root, game, canvas }){
    this.root = root;
    this.game = game;
    this.canvas = canvas;
    this.assetsLoaded = false;
    this.startedLoop = false;
    this.selectedSlot = '1';
    this.screen = 'home';
    this.renderHome();
  }

  clear(){
    this.root.replaceChildren();
    this.root.classList.remove('hidden');
  }

  backdrop(){
    const frame = el('div', 'menu-frame');
    frame.innerHTML = `
      <div class="ocean-layer ocean-layer-a"></div>
      <div class="ocean-layer ocean-layer-b"></div>
      <div class="menu-island">
        <div class="palm palm-a"></div>
        <div class="palm palm-b"></div>
        <div class="anchor-shape"></div>
        <div class="crab-shape"></div>
      </div>
      <div class="wreck-shape"></div>
      <div class="menu-vignette"></div>
    `;
    return frame;
  }

  logo(){
    const logo = el('div', 'island-logo');
    logo.innerHTML = `<span>ISL</span><span>AND</span>`;
    return logo;
  }

  renderHome(){
    this.screen = 'home';
    this.clear();
    const frame = this.backdrop();
    const panel = el('section', 'main-menu-card');
    panel.append(this.logo());
    const subtitle = el('div', 'menu-subtitle', 'Open-world island life · build, farm, fish, explore');
    panel.append(subtitle);

    const latest = latestSlot();
    const buttons = el('div', 'menu-buttons');
    buttons.append(
      this.button(latest ? 'Resume Latest' : 'Start New Island', 'primary', () => latest ? this.resumeSlot(latest.slotId) : this.openSlots()),
      this.button('Single Player', '', () => this.openSlots()),
      this.button('Multiplayer · Soon', 'soon', () => this.toast('Multiplayer is intentionally disabled until the new island simulation has an authoritative netcode layer.')),
      this.button('Options', '', () => this.renderOptions()),
      this.button('Credits / Build Info', '', () => this.renderCredits())
    );
    panel.append(buttons);

    const foot = el('div', 'menu-foot', 'Mouse/keyboard and touch ready. Saves use four local browser slots.');
    panel.append(foot);
    frame.append(panel);
    this.root.append(frame);
  }

  openSlots(){
    this.screen = 'slots';
    this.clear();
    const frame = this.backdrop();
    const wrap = el('section', 'slot-screen');
    const top = el('div', 'menu-topbar');
    top.append(this.button('← Back', 'small', () => this.renderHome()));
    top.append(el('h1', '', 'Choose Island Slot'));
    top.append(this.button('Options', 'small', () => this.renderOptions()));
    wrap.append(top);

    const grid = el('div', 'slot-grid');
    for (const slot of listSlots()) grid.append(this.slotCard(slot));
    wrap.append(grid);

    const note = el('p', 'slot-note', 'Each slot can resume, overwrite with a fresh world, or be deleted. Homes and autosave update the active slot.');
    wrap.append(note);
    frame.append(wrap);
    this.root.append(frame);
  }

  slotCard(slot){
    const card = el('article', `slot-card ${slot.empty ? 'empty' : 'filled'}`);
    const title = el('div', 'slot-title', slot.empty ? `Empty Slot ${slot.slotId}` : `Slot ${slot.slotId} · ${slot.meta.title}`);
    card.append(title);
    if (slot.empty) {
      card.append(el('div', 'slot-preview blank', 'New island'));
      card.append(el('p', 'slot-meta', 'No save data yet.'));
      card.append(this.button('Create New Island', 'primary wide', () => this.createSlot(slot.slotId)));
    } else {
      const meta = slot.meta;
      const preview = el('div', 'slot-preview');
      preview.innerHTML = `<span class="preview-sun"></span><span class="preview-land"></span><span class="preview-water"></span>`;
      card.append(preview);
      card.append(el('p', 'slot-meta', `Day ${meta.day} · ${formatPlayTime(meta.playTime)} · ${meta.homes} buildings · ${meta.animals} animals`));
      card.append(el('p', 'slot-meta faint', `Saved ${formatSaveDate(meta.savedAt)} · HP ${meta.health} · Hunger ${meta.hunger}`));
      const actions = el('div', 'slot-actions');
      actions.append(this.button('Resume', 'primary', () => this.resumeSlot(slot.slotId)));
      actions.append(this.button('New', '', () => this.confirmOverwrite(slot.slotId)));
      actions.append(this.button('Delete', 'danger', () => this.confirmDelete(slot.slotId)));
      card.append(actions);
    }
    return card;
  }

  renderOptions(){
    this.previousScreen = this.screen || 'home';
    this.screen = 'options';
    this.clear();
    const frame = this.backdrop();
    const panel = el('section', 'options-card');
    const top = el('div', 'menu-topbar compact');
    top.append(this.button('← Back', 'small', () => this.previousScreen === 'slots' ? this.openSlots() : this.renderHome()));
    top.append(el('h1', '', 'Options'));
    top.append(el('span'));
    panel.append(top);

    const muted = this.game.audio?.muted;
    panel.append(this.toggleRow('Mute All Audio', muted, value => this.game.audio.setMuted(value)));
    panel.append(this.rangeRow('Music Volume', this.game.audio?.musicVol ?? 0.25, value => this.game.audio.setMusicVolume(value)));
    panel.append(this.rangeRow('SFX Volume', this.game.audio?.sfxVol ?? 0.65, value => this.game.audio.setSfxVolume(value)));
    panel.append(this.toggleRow('Pixel-perfect scaling', true, () => this.toast('Pixel scaling is locked on for now to keep the art crisp.')));
    panel.append(el('p', 'options-note', 'More settings can be added without touching gameplay. The menu is DOM-based so it stays sharp at any resolution.'));
    frame.append(panel);
    this.root.append(frame);
  }

  renderCredits(){
    this.screen = 'credits';
    this.clear();
    const frame = this.backdrop();
    const panel = el('section', 'options-card credits-card');
    panel.append(this.logo());
    panel.append(el('p', 'options-note', 'Island is now a Sunnyside-powered open-world island-life game: build homes, grow crops, fish, explore and expand a homestead.'));
    panel.append(el('p', 'options-note', 'Rebuild pass: removed the old survival sandbox logic, cleaned non-Sunnyside runtime assets, and rebuilt world/play systems around Sunnyside art.'));
    panel.append(this.button('Back', 'primary wide', () => this.renderHome()));
    frame.append(panel);
    this.root.append(frame);
  }

  toggleRow(label, initial, onChange){
    const row = el('label', 'setting-row');
    const span = el('span', '', label);
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.checked = !!initial;
    input.addEventListener('change', () => onChange(input.checked));
    row.append(span, input);
    return row;
  }

  rangeRow(label, initial, onChange){
    const row = el('label', 'setting-row');
    const span = el('span', '', label);
    const input = document.createElement('input');
    input.type = 'range';
    input.min = '0';
    input.max = '1';
    input.step = '0.01';
    input.value = String(initial);
    input.addEventListener('input', () => onChange(Number(input.value)));
    row.append(span, input);
    return row;
  }

  button(text, variant='', cb=()=>{}){
    const btn = el('button', `island-btn ${variant}`.trim(), text);
    if (variant.includes('disabled')) btn.disabled = true;
    btn.addEventListener('click', event => { event.preventDefault(); if (!btn.disabled) cb(); });
    return btn;
  }

  toast(message){
    const note = el('div', 'menu-toast', message);
    this.root.append(note);
    setTimeout(() => note.remove(), 2800);
  }

  confirmOverwrite(slotId){
    if (confirm(`Overwrite slot ${slotId} with a new island?`)) this.createSlot(slotId);
  }

  confirmDelete(slotId){
    if (confirm(`Delete slot ${slotId}? This cannot be undone.`)) {
      deleteSlot(slotId);
      this.openSlots();
    }
  }

  async ensureAssets(){
    if (this.assetsLoaded) return;
    await this.game.art.loadAssets(progress => this.updateProgress('Loading Sunnyside assets', progress));
    this.assetsLoaded = true;
  }

  async createSlot(slotId){
    this.selectedSlot = normalizeSlotId(slotId);
    await this.showGeneration(async () => {
      await this.ensureAssets();
      this.game.newGame({ slotId: this.selectedSlot, clearSave: true, silent: true, seed: (Date.now() ^ (Number(this.selectedSlot) * 0x9e3779b9)) & 0x7fffffff });
      this.game.saveGame({ slotId: this.selectedSlot, silent: true });
    });
    this.enterGame();
  }

  async resumeSlot(slotId){
    this.selectedSlot = normalizeSlotId(slotId);
    await this.showLoading('Loading save slot', async () => {
      await this.ensureAssets();
      const ok = this.game.loadGame(this.selectedSlot, { silent: true });
      if (!ok) throw new Error('Save slot could not be loaded.');
    });
    this.enterGame();
  }

  async showLoading(title, work){
    this.clear();
    const frame = this.backdrop();
    const panel = el('section', 'generation-card');
    panel.append(el('h1', '', title));
    const bar = el('div', 'generation-bar');
    bar.innerHTML = '<span></span>';
    const label = el('div', 'generation-label', 'Preparing...');
    panel.append(label, bar);
    frame.append(panel);
    this.root.append(frame);
    this.progressFill = bar.querySelector('span');
    this.progressLabel = label;
    this.updateProgress('Preparing...', .15);
    await work();
    this.updateProgress('Ready', 1);
    await this.sleep(180);
  }

  async showGeneration(work){
    this.clear();
    const frame = this.backdrop();
    const panel = el('section', 'generation-card');
    panel.append(el('h1', '', 'Generating Island'));
    panel.append(el('p', 'generation-copy', 'Building a fresh Sunnyside island with beaches, village paths, animals, farm plots, resources and reachable exploration.'));
    const label = el('div', 'generation-label', 'Starting...');
    const bar = el('div', 'generation-bar');
    bar.innerHTML = '<span></span>';
    panel.append(label, bar);
    frame.append(panel);
    this.root.append(frame);
    this.progressFill = bar.querySelector('span');
    this.progressLabel = label;

    for (let i = 0; i < GENERATION_STAGES.length; i++) {
      const [name, pct] = GENERATION_STAGES[i];
      this.updateProgress(name, pct);
      if (i === 3) await work();
      await this.sleep(i === 3 ? 140 : 220);
    }
  }

  updateProgress(label, pct){
    if (this.progressFill) this.progressFill.style.width = `${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%`;
    if (this.progressLabel) this.progressLabel.textContent = `${label} ${Math.round(Math.max(0, Math.min(1, pct)) * 100)}%`;
  }

  sleep(ms){ return new Promise(resolve => setTimeout(resolve, ms)); }

  enterGame(){
    this.root.classList.add('hidden');
    this.canvas.focus();
    try { this.game.audio.unlock(); } catch (_e) {}
    if (!this.startedLoop) {
      this.game.start();
      this.startedLoop = true;
    }
  }
}
