// Grandview Fence Design Studio (static, no build step)
// Renders: background + optional overlay. No pan/zoom/drag.

const APP_VERSION = "v0.6.3";
const CANVAS_W = 1960;
const CANVAS_H = 1096;

const els = {
  canvas: document.getElementById('canvas'),
  gateFrame: document.getElementById('gateFrame'),
  sceneSelect: document.getElementById('sceneSelect'),
  styleHeading: document.getElementById('styleHeading'),
  styleSelect: document.getElementById('styleSelect'),
  resetViewBtn: document.getElementById('resetViewBtn'),
  downloadBtn: document.getElementById('downloadBtn'),
  aboutBtn: document.getElementById('aboutBtn'),
  aboutModal: document.getElementById('aboutModal'),
  aboutVersion: document.getElementById('aboutVersion'),
  status: document.getElementById('status'),
};

const ctx = els.canvas.getContext('2d');

const state = {
  scene: 'front',          // 'front' | 'back' | 'gate'
  styleCode: null,         // current style code for current scene (or null)
  watermark: true,
};

// Remember the last chosen style per scene so switching scenes feels stable.
const lastStyleByScene = {
  front: null,
  back: null,
  gate: null,
};

let catalog;
let bgImg = new Image();
let overlayImg = null;
let logoImg = new Image();

function setStatus(msg){ els.status.textContent = msg || ''; }

function loadImage(src){
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load: ' + src));
    img.src = src;
  });
}

function getQuery(){
  const p = new URLSearchParams(location.search);
  return {
    scene: p.get('scene'),
    style: p.get('style'),
    wm: p.get('wm'),
  };
}

function updateUrl(){
  const p = new URLSearchParams();
  p.set('scene', state.scene);
  if (state.styleCode) p.set('style', state.styleCode);
  p.set('wm', state.watermark ? '1' : '0');
  const url = location.origin + location.pathname + '?' + p.toString();
  history.replaceState({}, '', url);
  localStorage.setItem('gv_designstudio_state', JSON.stringify({
    scene: state.scene,
    styleCode: state.styleCode,
    watermark: state.watermark,
    lastStyleByScene,
  }));
}

function applyFromQueryOrStorage(){
  const q = getQuery();
  if (q.scene) state.scene = q.scene;
  if (q.style) state.styleCode = q.style;
  if (q.wm !== null) state.watermark = q.wm === '1';

  // If no query params were provided, restore from localStorage.
  if (!q.scene && !q.style && q.wm === null){
    const saved = localStorage.getItem('gv_designstudio_state');
    if (saved){
      try{
        const parsed = JSON.parse(saved);
        if (parsed.scene) state.scene = parsed.scene;
        if ('styleCode' in parsed) state.styleCode = parsed.styleCode;
        if ('watermark' in parsed) state.watermark = !!parsed.watermark;
        if (parsed.lastStyleByScene){
          Object.assign(lastStyleByScene, parsed.lastStyleByScene);
        }
      }catch{}
    }
  }
}

function stylesForScene(sceneId){
  return sceneId === 'gate' ? (catalog.gate_styles || []) : (catalog.styles || []);
}

function getBackgroundFile(sceneId){
  const scene = catalog.scenes.find(s => s.id === sceneId) || catalog.scenes[0];
  return scene.background;
}

function getOverlayFile(sceneId, styleCode){
  const map = catalog.overlays?.[sceneId] || {};
  return map?.[styleCode] || null;
}

function draw(){
  ctx.clearRect(0,0,CANVAS_W,CANVAS_H);
  ctx.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);

  if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
    ctx.drawImage(overlayImg, 0, 0, CANVAS_W, CANVAS_H);
  }
}

function setStageForScene(){
  if (!els.gateFrame) return;
  if (state.scene === 'gate'){
    els.canvas.style.display = 'none';
    els.gateFrame.style.display = 'block';
    // Gate tool has its own renderer; disable Save Image for now.
    els.downloadBtn.disabled = true;
    els.downloadBtn.textContent = 'Save Image';
  } else {
    els.canvas.style.display = 'block';
    els.gateFrame.style.display = 'none';
    els.downloadBtn.disabled = false;
    els.downloadBtn.textContent = 'Save Image';
  }
}

function syncUi(){
  if (els.sceneSelect) els.sceneSelect.value = state.scene;
  if (els.styleHeading) els.styleHeading.textContent = state.scene === 'gate' ? 'Gate Style' : 'Fence Style';
  if (els.styleSelect) els.styleSelect.value = state.styleCode || '';
  updateUrl();
}

function buildSceneSelect(){
  els.sceneSelect.innerHTML = '';
  catalog.scenes.forEach(sc => {
    const o = document.createElement('option');
    o.value = sc.id;
    o.textContent = sc.label;
    els.sceneSelect.appendChild(o);
  });

  els.sceneSelect.onchange = async () => {
    await setScene(els.sceneSelect.value);
  };
}

function buildStyleSelect(){
  els.styleSelect.innerHTML = '';

  const list = stylesForScene(state.scene);

  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = state.scene === 'gate' ? 'Select a gate style' : 'Select a fence style';
  els.styleSelect.appendChild(placeholder);

  list.forEach(st => {
    const o = document.createElement('option');
    o.value = st.code;
    o.textContent = st.label;
    els.styleSelect.appendChild(o);
  });

  els.styleSelect.onchange = () => {
    const v = els.styleSelect.value;
    // empty means "no overlay"
    setStyle(v || null);
  };
}

function postToGate(msg){
  try{
    if (els.gateFrame && els.gateFrame.contentWindow){
      els.gateFrame.contentWindow.postMessage(msg, '*');
    }
  }catch{}
}

// The gate renderer lives inside an iframe. If we post before it finishes loading,
// the message can be dropped. Track readiness and re-sync on load.
let gateFrameReady = false;
if (els.gateFrame){
  // Load iframe only when needed to avoid WebGL context issues
  els.gateFrame.addEventListener('load', () => {
    gateFrameReady = true;
    if (state.scene === 'gate'){
      if (state.styleCode){
        postToGate({ type:'SET_GATE_STYLE', code: state.styleCode });
      } else {
        postToGate({ type:'RESET_GATE' });
      }
    }
  });
}

async function refreshImages(){
  syncUi();
  setStatus('Loading…');

  // Gate scene uses Three.js renderer inside gate_tool.html
  if (state.scene === 'gate'){
    setStageForScene();
    // If no style selected, just reset to default view (background + default gate)
    if (state.styleCode){
      postToGate({ type:'SET_GATE_STYLE', code: state.styleCode });
      setStatus('');
    } else {
      postToGate({ type:'RESET_GATE' });
      setStatus('');
    }
    syncUi();
    return;
  }

  try{
    const bgFile = getBackgroundFile(state.scene);
    bgImg = await loadImage(bgFile);

    // Validate style only if set
    const list = stylesForScene(state.scene);
    if (state.styleCode && !list.some(s => s.code === state.styleCode)) {
      state.styleCode = null;
      lastStyleByScene[state.scene] = null;
      buildStyleSelect();
    }

    const ovFile = state.styleCode ? getOverlayFile(state.scene, state.styleCode) : null;

    if (!ovFile) {
      overlayImg = null;
      draw();
      // If they chose a style but we don't have a 2D overlay yet, say so.
      if (state.styleCode) setStatus('Preview coming soon for this gate style.');
      else setStatus('');
      return;
    }

    overlayImg = await loadImage(ovFile);
    draw();
    setStatus('');
  }catch(err){
    console.error(err);
    setStatus('Failed to load images.');
  }finally{
    syncUi();
  }
}

async function setScene(sceneId){
  // Save current selection for the old scene
  lastStyleByScene[state.scene] = state.styleCode;

  state.scene = sceneId;

  // Switch selection to whatever we last had for this scene; default to none.
  state.styleCode = lastStyleByScene[sceneId] || null;

  // Rebuild dropdown immediately so it never shows the wrong list.
  buildStyleSelect();

  // Toggle stage elements immediately (prevents flicker)
  setStageForScene();

  // Lazy load gate iframe only when gate scene is selected
  if (sceneId === 'gate' && els.gateFrame && els.gateFrame.src === 'about:blank') {
    els.gateFrame.src = 'gate_tool/index.html';
  }

  await refreshImages();
  updateUrl();
}

async function setStyle(styleCode){
  state.styleCode = styleCode;
  lastStyleByScene[state.scene] = styleCode;
  await refreshImages();
  updateUrl();
}

function resetCurrentScene(){
  // Reset should return the current scene to its default selection.
  // For fence scenes: background-only (no overlay) matches the existing UX.
  // For gate scene (runtime renderer): select the default gate style so the renderer shows a valid view.
  if (state.scene === 'gate'){
    state.styleCode = stylesForScene('gate')[0]?.code || null;
  } else {
    state.styleCode = null;
  }
  lastStyleByScene[state.scene] = state.styleCode;
  buildStyleSelect();
  refreshImages();
}

function downloadImage(){
  const off = document.createElement('canvas');
  off.width = CANVAS_W;
  off.height = CANVAS_H;
  const c = off.getContext('2d');

  c.drawImage(bgImg, 0, 0, CANVAS_W, CANVAS_H);
  if (overlayImg && overlayImg.complete && overlayImg.naturalWidth > 0) {
    c.drawImage(overlayImg, 0, 0, CANVAS_W, CANVAS_H);
  }

  if (state.watermark){
    const cfg = catalog.brand?.export_watermark || {};
    const pad = Number(cfg.padding ?? 24);
    const maxW = Number(cfg.max_width ?? 340);
    const opacity = Number(cfg.opacity ?? 0.88);

    const ratio = logoImg.width / logoImg.height;
    const w = Math.min(maxW, logoImg.width);
    const h = Math.round(w / ratio);

    const x = CANVAS_W - w - pad;
    const y = CANVAS_H - h - pad;

    c.save();
    c.globalAlpha = opacity;
    c.drawImage(logoImg, x, y, w, h);
    c.restore();
  }

  const a = document.createElement('a');
  const styleSlug = (state.styleCode || 'none').replace(/[^a-z0-9-]/gi,'_');
  a.download = `grandview-design-${state.scene}-${styleSlug}.png`;
  a.href = off.toDataURL('image/png');
  a.click();
}


function openAbout(){
  if (!els.aboutModal) return;
  if (els.aboutVersion) els.aboutVersion.textContent = `Version: ${APP_VERSION}`;
  els.aboutModal.classList.add('is-open');
  els.aboutModal.setAttribute('aria-hidden','false');
  // Move focus into the modal for accessibility.
  const closeBtn = els.aboutModal.querySelector('[data-close="1"]');
  if (closeBtn) closeBtn.focus();
}

function closeAbout(){
  if (!els.aboutModal) return;
  // Ensure focus is not trapped inside a soon-to-be aria-hidden modal.
  try {
    if (els.aboutBtn) els.aboutBtn.focus();
    if (document.activeElement) document.activeElement.blur();
  } catch {}
  els.aboutModal.classList.remove('is-open');
  els.aboutModal.setAttribute('aria-hidden','true');
}

function hookControls(){
  if (els.resetViewBtn) els.resetViewBtn.onclick = resetCurrentScene;
  if (els.downloadBtn) els.downloadBtn.onclick = downloadImage;
  if (els.aboutBtn) els.aboutBtn.onclick = openAbout;
  if (els.aboutModal){
    els.aboutModal.addEventListener('click', (e)=>{
      const t = e.target;
      if (t && t.getAttribute && t.getAttribute('data-close')==='1') closeAbout();
    });
  }
}

async function init(){
  const res = await fetch('catalog.json', {cache:'no-store'});
  catalog = await res.json();

  applyFromQueryOrStorage();

  // Load logo once for watermark export
  logoImg = await loadImage(catalog.brand.logo);

  buildSceneSelect();
  buildStyleSelect();
  hookControls();

  // If we have a style in the URL, keep it. Otherwise pick sensible defaults.
  if (!state.styleCode){
    if (state.scene === 'gate'){
      state.styleCode = stylesForScene('gate')[0]?.code || null;
    } else {
      state.styleCode = stylesForScene(state.scene)[0]?.code || null;
    }
    lastStyleByScene[state.scene] = state.styleCode;
  }

  await refreshImages();
  syncUi();
}

init();
