import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';

const $ = s => document.querySelector(s);
const TAU = Math.PI * 2;
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const fmt = n => { n = Math.floor(n); return n >= 100000 ? (n / 1000).toFixed(0) + 'k' : n >= 10000 ? (n / 1000).toFixed(1) + 'k' : n.toLocaleString('pt-BR'); };
const fmtT = s => { s = Math.max(0, Math.ceil(s)); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60), ss = s % 60;
  return h ? `${h}h ${String(m).padStart(2, '0')}m` : m ? `${m}m ${String(ss).padStart(2, '0')}s` : `${ss}s`; };

/* ========== Ícones ========== */
const ICO = {
  food: '<ellipse cx="12" cy="14" rx="9" ry="6" fill="#c98a3a" stroke="#5a3410" stroke-width="1.5"/><path d="M6 12q3-3 6 0q3-3 6 0" stroke="#f3d29a" stroke-width="1.6" fill="none"/>',
  wood: '<rect x="3" y="9" width="18" height="8" rx="4" fill="#8a5a2c" stroke="#3d220e" stroke-width="1.5"/><ellipse cx="19" cy="13" rx="3" ry="4" fill="#d9a86a" stroke="#3d220e" stroke-width="1.2"/><circle cx="19" cy="13" r="1.4" fill="#8a5a2c"/>',
  stone: '<path d="M4 17l3-8 6-3 6 4 1 7z" fill="#9aa3a8" stroke="#3a4044" stroke-width="1.5" stroke-linejoin="round"/><path d="M7 9l4 4 6-3" stroke="#d7dde0" stroke-width="1.2" fill="none"/>',
  iron: '<path d="M3 16l3-6h12l3 6z" fill="#7c8a96" stroke="#2c343a" stroke-width="1.5" stroke-linejoin="round"/><path d="M6 10h12" stroke="#cfd8df" stroke-width="1.5"/>',
  runes: '<path d="M7 3h10l3 9-3 9H7l-3-9z" fill="#5b3fb0" stroke="#c9b5ff" stroke-width="1.4"/><path d="M12 7v10M12 9l3 2.5L12 14" stroke="#e7dcff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  hammer: '<path d="M5 19l8-8" stroke="#b07a3a" stroke-width="3" stroke-linecap="round"/><path d="M11 5l6 6 2-2-6-6z" fill="#aeb7bc" stroke="#2c343a" stroke-width="1.3"/>'
};
document.querySelectorAll('svg[data-ico]').forEach(s => s.innerHTML = ICO[s.dataset.ico]);
const icoSVG = k => `<svg viewBox="0 0 24 24">${ICO[k]}</svg>`;
const RES = ['food', 'wood', 'stone', 'iron'];
const RES_NAME = { food: 'Comida', wood: 'Madeira', stone: 'Pedra', iron: 'Ferro' };

/* ========== Definições ========== */
const MAXLV = 10;
const DEF = {
  salao:   { name: 'Salão do Jarl', size: 3, time: 20, cost: { food: 80, wood: 120, stone: 80 }, unlock: 1,
             desc: 'O coração da vila. O nível do Salão é o limite de nível de todos os outros prédios e libera novas construções.' },
  fazenda: { name: 'Fazenda', size: 2, time: 10, cost: { wood: 60 }, unlock: 1, prod: 'food', rate: 600,
             desc: 'Planta cevada e cria ovelhas. Produz comida para o povo e para as tropas.' },
  serraria:{ name: 'Serraria', size: 2, time: 10, cost: { food: 50, wood: 30 }, unlock: 1, prod: 'wood', rate: 520,
             desc: 'Corta os pinheiros da floresta. Madeira para casas, drakkars e paliçadas.' },
  pedreira:{ name: 'Pedreira', size: 2, time: 12, cost: { food: 40, wood: 70 }, unlock: 1, prod: 'stone', rate: 400,
             desc: 'Quebra a rocha da montanha. Pedra para fundações e muralhas.' },
  mina:    { name: 'Mina de Ferro', size: 2, time: 15, cost: { wood: 140, stone: 90 }, unlock: 3, prod: 'iron', rate: 220,
             desc: 'Extrai minério da montanha. O ferro vira machados, elmos e cotas de malha.' },
  armazem: { name: 'Armazém', size: 2, time: 12, cost: { wood: 100, stone: 60 }, unlock: 2,
             desc: 'Guarda os recursos da vila. Cada nível aumenta o limite de cada recurso.' },
  quartel: { name: 'Quartel', size: 2, stage2: true, desc: 'Treina guerreiros, arqueiros e cavaleiros. Chega na Etapa 2.' },
  ferreiro:{ name: 'Ferreiro', size: 2, stage2: true, desc: 'Melhora armas e armaduras das tropas. Chega na Etapa 2.' },
  torre:   { name: 'Torre de Arqueiros', size: 1, stage2: true, desc: 'Atira flechas nos invasores. Chega na Etapa 2.' }
};
const PLOTS = [
  { id: 'salao', type: 'salao', c: 7, r: 5 },
  { id: 'faz1', type: 'fazenda', c: 4, r: 7 },
  { id: 'faz2', type: 'fazenda', c: 6, r: 8, unlock: 2 },
  { id: 'serraria', type: 'serraria', c: 11, r: 3 },
  { id: 'pedreira', type: 'pedreira', c: 3, r: 3 },
  { id: 'mina', type: 'mina', c: 1, r: 5 },
  { id: 'armazem', type: 'armazem', c: 10, r: 6 },
  { id: 'quartel', type: 'quartel', c: 10, r: 8 },
  { id: 'ferreiro', type: 'ferreiro', c: 7, r: 2 },
  { id: 'torre1', type: 'torre', c: 13, r: 8 },
  { id: 'torre2', type: 'torre', c: 2, r: 9 }
];
const plotById = id => PLOTS.find(p => p.id === id);
const costFor = (type, L) => {
  const d = DEF[type], f = Math.pow(1.55, L - 1), out = {};
  for (const k in d.cost) out[k] = Math.round(d.cost[k] * f / 5) * 5;
  if (L >= 4 && type !== 'mina') out.iron = Math.round((d.cost.wood || d.cost.food || 60) * .35 * Math.pow(1.5, L - 4) / 5) * 5;
  return out;
};
const timeFor = (type, L) => Math.round(DEF[type].time * Math.pow(1.6, L - 1));
const rateFor = (type, L) => L > 0 && DEF[type].prod ? DEF[type].rate * Math.pow(1.3, L - 1) : 0; // por hora
const capFor = r => 3000 + (S.b.armazem.lvl ? Math.round(3000 * Math.pow(1.45, S.b.armazem.lvl - 1)) : 0);
const bufCap = (type, L) => rateFor(type, L) * 2; // guarda até 2h de produção
const power = () => PLOTS.reduce((a, p) => a + (S.b[p.id] ? S.b[p.id].lvl * (p.type === 'salao' ? 120 : 35) : 0), 0);

/* ========== Missões ========== */
const lv = id => S.b[id] ? S.b[id].lvl : 0;
const MISSIONS = [
  { t: 'Colete comida na Fazenda', ok: () => S.stats.food > 0, r: { wood: 150 } },
  { t: 'Construa a Pedreira', ok: () => lv('pedreira') >= 1, r: { food: 150 } },
  { t: 'Melhore o Salão do Jarl ao nível 2', ok: () => lv('salao') >= 2, r: { runes: 20 } },
  { t: 'Melhore a Serraria ao nível 2', ok: () => lv('serraria') >= 2, r: { runes: 10 } },
  { t: 'Construa o Armazém', ok: () => lv('armazem') >= 1, r: { stone: 200 } },
  { t: 'Construa a segunda Fazenda', ok: () => lv('faz2') >= 1, r: { wood: 300 } },
  { t: 'Melhore uma Fazenda ao nível 3', ok: () => Math.max(lv('faz1'), lv('faz2')) >= 3, r: { stone: 300 } },
  { t: 'Melhore o Salão do Jarl ao nível 3', ok: () => lv('salao') >= 3, r: { runes: 30 } },
  { t: 'Construa a Mina de Ferro', ok: () => lv('mina') >= 1, r: { food: 500 } },
  { t: 'Colete 500 de ferro', ok: () => S.stats.iron >= 500, r: { wood: 600 } },
  { t: 'Melhore o Salão do Jarl ao nível 4', ok: () => lv('salao') >= 4, r: { runes: 40 } },
  { t: 'Melhore a Serraria ao nível 5', ok: () => lv('serraria') >= 5, r: { stone: 800 } },
  { t: 'Melhore o Armazém ao nível 4', ok: () => lv('armazem') >= 4, r: { iron: 300 } },
  { t: 'Melhore o Salão do Jarl ao nível 5', ok: () => lv('salao') >= 5, r: { runes: 50 } },
  { t: 'Deixe todos os produtores no nível 5', ok: () => ['faz1', 'faz2', 'serraria', 'pedreira', 'mina'].every(id => lv(id) >= 5), r: { runes: 60 } },
  { t: 'Melhore o Salão do Jarl ao nível 7', ok: () => lv('salao') >= 7, r: { runes: 80 } },
  { t: 'Melhore o Salão do Jarl ao nível 10', ok: () => lv('salao') >= 10, r: { runes: 150 } }
];

/* ========== Estado ========== */
const SKEY = 'vikingshot-v1';
function fresh() {
  const b = {}; PLOTS.forEach(p => b[p.id] = { lvl: 0, buf: 0, end: 0, to: 0 });
  b.salao.lvl = 1; b.faz1.lvl = 1; b.serraria.lvl = 1;
  b.faz1.buf = 120; b.serraria.buf = 80;
  return { v: 1, res: { food: 600, wood: 600, stone: 300, iron: 0 }, runes: 60, b, mission: 0, stats: { food: 0, wood: 0, stone: 0, iron: 0 }, last: Date.now(), intro: false, sound: true };
}
let S;
try { S = JSON.parse(localStorage.getItem(SKEY) || 'null'); } catch (e) { S = null; }
if (!S || S.v !== 1) S = fresh();
PLOTS.forEach(p => { if (!S.b[p.id]) S.b[p.id] = { lvl: 0, buf: 0, end: 0, to: 0 }; });
let dirty = true;
const save = () => { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} };

/* ========== Som ========== */
const Snd = {
  ctx: null,
  init() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume(); },
  tone(f, d, o = {}) {
    if (!S.sound || !this.ctx || this.ctx.state !== 'running') return;
    const { type = 'triangle', v = .12, delay = 0, to = null } = o, c = this.ctx, t = c.currentTime + delay;
    const os = c.createOscillator(), g = c.createGain(); os.type = type; os.frequency.setValueAtTime(f, t); if (to) os.frequency.exponentialRampToValueAtTime(to, t + d);
    g.gain.setValueAtTime(.0001, t); g.gain.exponentialRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + d);
    os.connect(g); g.connect(c.destination); os.start(t); os.stop(t + d + .05);
  },
  collect() { this.tone(880, .08, { v: .08 }); this.tone(1320, .14, { v: .07, delay: .05 }); },
  build() { [0, .12, .24].forEach(d => this.tone(180, .08, { type: 'square', v: .05, delay: d, to: 120 })); },
  done() { [392, 523, 659, 784].forEach((f, i) => this.tone(f, .3, { v: .1, delay: i * .08 })); },
  tap() { this.tone(520, .05, { v: .05 }); },
  no() { this.tone(200, .15, { type: 'square', v: .04, to: 140 }); }
};

/* ========== Tempo e produção ========== */
function advance(now) {
  let dt = Math.min(now - S.last, 8 * 3600e3); if (dt < 0) dt = 0;
  const start = now - dt;
  PLOTS.forEach(p => {
    const b = S.b[p.id], prod = DEF[p.type].prod;
    const grow = (lvl, ms) => { if (prod && lvl && ms > 0) b.buf = Math.min(bufCap(p.type, lvl), b.buf + rateFor(p.type, lvl) * ms / 3600e3); };
    if (b.end && now >= b.end) {
      const endT = b.end;
      grow(b.lvl, Math.max(0, Math.min(endT, now) - start));   // nível antigo até a obra acabar
      b.lvl = b.to; b.end = 0; b.to = 0; finished.push(p.id);
      grow(b.lvl, now - Math.max(endT, start));                 // nível novo depois
    } else grow(b.lvl, dt);
  });
  S.last = now;
}
let finished = [];
const offlineGain = (() => { const before = JSON.stringify(S.b); const away = Date.now() - S.last; advance(Date.now()); return away > 60e3 ? away : 0; })();

/* ========== Ações ========== */
const busyBuilders = () => PLOTS.filter(p => S.b[p.id].end);
const canAfford = c => Object.entries(c).every(([k, v]) => (S.res[k] || 0) >= v);
function requirement(p, L) {
  const d = DEF[p.type];
  if (d.stage2) return 'Chega na Etapa 2 (batalhas)';
  const hall = S.b.salao.lvl;
  const unlock = p.unlock || d.unlock;
  if (L === 1 && hall < unlock) return `Precisa do Salão do Jarl nível ${unlock}`;
  if (p.type !== 'salao' && L > hall) return `Precisa do Salão do Jarl nível ${L}`;
  if (p.type === 'salao' && L > 2) {
    const need = ['serraria', 'faz1'].filter(id => S.b[id].lvl < L - 1);
    if (need.length) return `Precisa de ${need.map(id => DEF[plotById(id).type].name).join(' e ')} no nível ${L - 1}`;
  }
  if (L > MAXLV) return 'Nível máximo';
  return '';
}
function upgrade(p) {
  const b = S.b[p.id], L = b.lvl + 1, c = costFor(p.type, L);
  if (requirement(p, L)) return;
  if (busyBuilders().length >= 2) { toast('Os dois construtores estão ocupados'); Snd.no(); return; }
  if (!canAfford(c)) { toast('Faltam recursos'); Snd.no(); return; }
  for (const k in c) S.res[k] -= c[k];
  b.end = Date.now() + timeFor(p.type, L) * 1000; b.to = L;
  Snd.build(); burst(p, '#e8c27a', 14); save(); dirty = true; closeSheet();
}
function speedCost(p) { const left = (S.b[p.id].end - Date.now()) / 1000; return left <= 30 ? 0 : Math.ceil(left / 60); }
function speedUp(p) {
  const c = speedCost(p); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); return; }
  S.runes -= c; S.b[p.id].end = Date.now(); tick(); closeSheet();
}
function collect(p, silent) {
  const b = S.b[p.id], d = DEF[p.type]; if (!d.prod || b.buf < 1) return 0;
  const room = capFor(d.prod) - S.res[d.prod]; const take = Math.floor(Math.min(b.buf, room));
  if (take <= 0) { if (!silent) { toast(`${RES_NAME[d.prod]} no limite: melhore o Armazém`); Snd.no(); } return 0; }
  b.buf -= take; S.res[d.prod] += take; S.stats[d.prod] = (S.stats[d.prod] || 0) + take;
  floatIcon(p, d.prod, '+' + fmt(take)); if (!silent) Snd.collect();
  dirty = true; save(); return take;
}
function claimMission() {
  const m = MISSIONS[S.mission]; if (!m || !m.ok()) return;
  for (const k in m.r) { if (k === 'runes') S.runes += m.r[k]; else S.res[k] = Math.min(capFor(k) * 2, S.res[k] + m.r[k]); }
  S.mission++; Snd.done(); toast('Recompensa recebida!'); save(); dirty = true;
}


/* ========== Mundo 3D (Three.js + modelos KayKit) ========== */
const HZ = Math.sqrt(3), CX = 15, CZ = 9;
const hexPos = (c, r) => [c * 2 + (r & 1 ? 1 : 0) - CX, r * HZ - CZ];
const toAx = (c, r) => [c - (r - (r & 1)) / 2, r];
const fromAx = (q, r) => [q + (r - (r & 1)) / 2, r];
const DIRS = [[1, 0], [0, 1], [-1, 1], [-1, 0], [0, -1], [1, -1]]; // 0°, 60°, … no plano xz

function tType(c, r) {
  if (r >= 11 || (r >= 10 && c <= 1)) return 'water';
  if (c < 0 || c > 15 || r < 0) return (r < 4 && c < 5) || r < -2 ? 'mountain' : 'forest';
  if (r <= 1 && c <= 2) return 'mountain';
  if (c >= 14 || c <= 0 || r === 0) return 'forest';
  return 'grass';
}
const COAST = [['hex_coast_A', [1]], ['hex_coast_B', [1, 2]], ['hex_coast_C', [0, 1, 2]], ['hex_coast_D', [5, 0, 1, 2]]];
function coastFor(W) {
  const n = W.length; if (!n) return null; if (n >= 5) return { name: 'hex_water', rot: 0 };
  const [name, base] = COAST[Math.min(n, 4) - 1], want = [...W].sort().join();
  for (let s = 0; s < 6; s++) if (base.map(e => (e + s) % 6).sort().join() === want) return { name, rot: -s * Math.PI / 3 };
  return { name: 'hex_coast_A', rot: -(W[0] - 1) * Math.PI / 3 };
}

/* ---------- motor ---------- */
const renderer = new THREE.WebGLRenderer({ canvas: $('#world'), antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#9db9c8'); scene.fog = new THREE.Fog('#9db9c8', 45, 95);
const camera = new THREE.PerspectiveCamera(32, 1, .5, 200);
scene.add(new THREE.HemisphereLight('#dceaff', '#3d4a35', .9));
const sun = new THREE.DirectionalLight('#fff1dc', 1.7);
sun.position.set(-18, 32, 14); sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 90 });
sun.shadow.bias = -.0005; sun.shadow.normalBias = .02;
scene.add(sun, sun.target);
// mar ao fundo, abaixo dos hexágonos
const sea = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: '#3f8fa6', roughness: .35, metalness: .05 }));
sea.rotation.x = -Math.PI / 2; sea.position.y = -.22; sea.receiveShadow = true; scene.add(sea);

const cam = { x: 0, z: 3, d: 26, pitch: .95 };
function placeCamera() {
  cam.d = Math.max(12, Math.min(55, cam.d)); cam.x = Math.max(-18, Math.min(18, cam.x)); cam.z = Math.max(-10, Math.min(14, cam.z));
  camera.position.set(cam.x, Math.sin(cam.pitch) * cam.d, cam.z + Math.cos(cam.pitch) * cam.d);
  camera.lookAt(cam.x, 0, cam.z);
  sun.target.position.set(cam.x, 0, cam.z); sun.position.set(cam.x - 18, 32, cam.z + 14);
}
function resize() {
  const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h;
  camera.fov = w < h ? 42 : 32; camera.updateProjectionMatrix();
  if (!cam.init) { cam.d = w < h ? 38 : 28; cam.init = true; }
  placeCamera();
}

/* ---------- carregamento ---------- */
const manager = new THREE.LoadingManager();
manager.onProgress = (url, done, total) => { $('#loadBar').style.width = Math.round(done / total * 100) + '%'; };
const loader = new GLTFLoader(manager);
const G = {};
const ENV = `hex_grass hex_water hex_coast_A hex_coast_B hex_coast_C hex_coast_D mountain_A mountain_B mountain_C mountain_A_grass_trees mountain_B_grass_trees
hills_A_trees hills_B_trees hill_single_A trees_A_large trees_A_medium trees_A_small trees_B_large trees_B_medium tree_single_A tree_single_B
rock_single_A rock_single_C rock_single_E building_castle_red building_grain building_windmill_red building_lumbermill_red building_mine_red
building_market_red building_barracks_red building_blacksmith_red building_tower_A_red building_home_A_red building_home_B_red building_well_red
building_tavern_red building_dirt building_stage_A building_stage_B building_stage_C building_scaffolding flag_red barrel crate_A_big sack
resource_lumber resource_stone wheelbarrow tent weaponrack cloud_big cloud_small`.split(/\s+/);
const CHARS = ['Barbarian', 'Rogue', 'Ranger', 'Knight', 'Rogue_Hooded'];
const ANIMS = ['Rig_Medium_MovementBasic', 'Rig_Medium_General'];
function loadAll() {
  const jobs = ENV.map(n => loader.loadAsync(`models/env/${n}.gltf`).then(g => { G[n] = g; }))
    .concat(CHARS.concat(ANIMS).map(n => loader.loadAsync(`models/chars/${n}.glb`).then(g => { G[n] = g; })));
  return Promise.all(jobs);
}
function shadowize(o, cast = true) { o.traverse(m => { if (m.isMesh) { m.castShadow = cast; m.receiveShadow = true; } }); return o; }
const model = (n, s = 1) => { const o = shadowize(G[n].scene.clone(true)); o.scale.setScalar(s); return o; };

/* ---------- terreno instanciado ---------- */
function instanced(name, mats, cast) {
  const src = G[name].scene; src.updateMatrixWorld(true);
  src.traverse(m => {
    if (!m.isMesh || !mats.length) return;
    let mat = m.material;
    const im = new THREE.InstancedMesh(m.geometry, mat, mats.length);
    mats.forEach((mt, i) => im.setMatrixAt(i, mt.clone().multiply(m.matrixWorld)));
    im.castShadow = cast; im.receiveShadow = true; scene.add(im);
  });
}
let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const plotAt = new Set(PLOTS.map(p => p.c + ',' + p.r));
const DECOR_HOMES = [
  { c: 8, r: 6, m: 'building_home_A_red', lv: 2 }, { c: 6, r: 6, m: 'building_home_B_red', lv: 3 }, { c: 9, r: 4, m: 'building_tavern_red', lv: 4 },
  { c: 8, r: 4, m: 'building_well_red', lv: 5 }, { c: 5, r: 5, m: 'building_home_A_red', lv: 6 }, { c: 9, r: 7, m: 'building_home_B_red', lv: 7 },
  { c: 12, r: 5, m: 'building_home_A_red', lv: 8 }, { c: 5, r: 3, m: 'building_home_B_red', lv: 9 }];
DECOR_HOMES.forEach(h => plotAt.add(h.c + ',' + h.r));
function buildTerrain() {
  const M = {}; const add = (n, x, z, rot = 0, s = 1, y = 0) => { (M[n] = M[n] || []).push(new THREE.Matrix4().compose(new THREE.Vector3(x, y, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(s, s, s))); };
  for (let r = -7; r <= 19; r++) for (let c = -7; c <= 22; c++) {
    const t = tType(c, r), [x, z] = hexPos(c, r);
    if (t === 'water') { if (r <= 14 && c >= -3 && c <= 18) add('hex_water', x, z); continue; }
    const [q, rr] = toAx(c, r);
    const W = DIRS.map(([dq, dr], k) => { const [nc, nr] = fromAx(q + dq, rr + dr); return tType(nc, nr) === 'water' ? k : -1; }).filter(k => k >= 0);
    const coast = coastFor(W);
    if (coast) add(coast.name, x, z, coast.rot); else add('hex_grass', x, z);
    if (coast) continue;
    const key = c + ',' + r, rot = Math.floor(rnd() * 6) * Math.PI / 3;
    if (t === 'mountain') add(['mountain_A', 'mountain_B', 'mountain_C', 'mountain_A_grass_trees', 'mountain_B_grass_trees'][Math.floor(rnd() * 5)], x, z, rot);
    else if (t === 'forest') add(rnd() < .15 ? ['hills_A_trees', 'hills_B_trees'][Math.floor(rnd() * 2)] : ['trees_A_large', 'trees_B_large', 'trees_A_medium', 'trees_B_medium'][Math.floor(rnd() * 4)], x, z, rot);
    else if (!plotAt.has(key)) {
      const k = rnd();
      if (k < .12) add(['tree_single_A', 'tree_single_B'][Math.floor(rnd() * 2)], x + (rnd() - .5), z + (rnd() - .5), rot);
      else if (k < .2) add(['rock_single_A', 'rock_single_C', 'rock_single_E'][Math.floor(rnd() * 3)], x + (rnd() - .5), z + (rnd() - .5), rot, 1.5);
    }
  }
  for (const n in M) instanced(n, M[n], !n.startsWith('hex_'));
}

/* ---------- prédios ---------- */
const plotGroups = {};
const PLOT_H = { salao: 4.4, fazenda: 1.4, serraria: 1.6, pedreira: 1.6, mina: 1.7, armazem: 1.6, quartel: 2.2, ferreiro: 1.6, torre: 2.8 };
function put(g, n, x = 0, z = 0, rot = 0, s = 1) { const o = model(n, s); o.position.set(x, 0, z); o.rotation.y = rot; g.add(o); return o; }
function refreshPlot(p) {
  let g = plotGroups[p.id];
  if (!g) { g = plotGroups[p.id] = new THREE.Group(); const [x, z] = hexPos(p.c, p.r); g.position.set(x, 0, z); scene.add(g); }
  const b = S.b[p.id], L = b.lvl, tier = L >= 7 ? 3 : L >= 4 ? 2 : 1;
  const sig = [L, b.end ? b.to : 0, tier].join(':');
  if (g.userData.sig === sig) return; g.userData.sig = sig;
  g.clear();
  if (!L) {
    if (b.end) { const total = timeFor(p.type, b.to) * 1000, pr = 1 - (b.end - Date.now()) / total; put(g, pr < .34 ? 'building_stage_A' : pr < .67 ? 'building_stage_B' : 'building_stage_C'); g.userData.sig += ':' + (pr < .34 ? 'a' : pr < .67 ? 'b' : 'c'); }
    else put(g, 'building_dirt');
    return;
  }
  switch (p.type) {
    case 'salao': put(g, 'building_castle_red'); break;
    case 'fazenda': put(g, 'building_grain'); if (tier >= 2) put(g, 'building_windmill_red', .45, -.5, 0, .7); if (tier >= 3) { put(g, 'sack', -.6, .5); put(g, 'wheelbarrow', -.3, .7, .6); } break;
    case 'serraria': put(g, 'building_lumbermill_red'); put(g, 'resource_lumber', -.6, .55, .3, .8); if (tier >= 2) put(g, 'resource_lumber', .6, .55, -.4, .8); break;
    case 'pedreira': put(g, 'hill_single_A', 0, -.2); put(g, 'resource_stone', .4, .5, 0, .9); if (tier >= 2) put(g, 'wheelbarrow', -.4, .6, 1); if (tier >= 3) put(g, 'resource_stone', -.5, -.1, 1, .8); break;
    case 'mina': put(g, 'building_mine_red'); if (tier >= 2) put(g, 'crate_A_big', .6, .55, .3, .7); break;
    case 'armazem': put(g, 'building_market_red'); put(g, 'barrel', -.6, .6, 0, .8); if (tier >= 2) put(g, 'crate_A_big', .55, .6, .2, .8); if (tier >= 3) put(g, 'sack', 0, .8); break;
  }
  if (b.end) put(g, 'building_scaffolding', 0, 0, 0, 1.02);
}
function refreshDecor() {
  DECOR_HOMES.forEach(h => {
    const show = S.b.salao.lvl >= h.lv;
    if (show && !h.obj) { h.obj = model(h.m); const [x, z] = hexPos(h.c, h.r); h.obj.position.set(x, 0, z); h.obj.rotation.y = Math.floor(rnd() * 6) * Math.PI / 3; scene.add(h.obj); }
    if (h.obj) h.obj.visible = show;
  });
}

/* ---------- drakkar, nuvens, fumaça ---------- */
function buildShip() {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: '#6b4527', roughness: .8 });
  const hull = new THREE.Shape(); hull.moveTo(-1.6, .2); hull.quadraticCurveTo(0, -.55, 1.6, .2); hull.lineTo(1.4, .35); hull.quadraticCurveTo(0, -.2, -1.4, .35); hull.closePath();
  const hg = new THREE.ExtrudeGeometry(hull, { depth: .7, bevelEnabled: false }); hg.translate(0, 0, -.35);
  g.add(new THREE.Mesh(hg, wood));
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, .06, .62), wood); deck.position.y = .12; g.add(deck);
  [[1.55, 1], [-1.55, -1]].forEach(([x, s]) => { const neck = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 6, 10, Math.PI), wood); neck.position.set(x, .45, 0); neck.rotation.z = s > 0 ? -Math.PI / 2.4 : Math.PI / 1.7; g.add(neck); });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.2), wood); mast.position.y = 1.2; g.add(mast);
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d');
  for (let i = 0; i < 8; i++) { c.fillStyle = i % 2 ? '#efe4cc' : '#a8322b'; c.fillRect(i * 8, 0, 8, 64); }
  const sailTex = new THREE.CanvasTexture(cv); sailTex.colorSpace = THREE.SRGBColorSpace;
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2, 6, 1), new THREE.MeshStandardMaterial({ map: sailTex, side: THREE.DoubleSide }));
  sail.position.set(0, 1.35, 0); sail.rotation.y = Math.PI / 2; g.add(sail); g.userData.sail = sail;
  const shieldMat = [new THREE.MeshStandardMaterial({ color: '#d9a441' }), new THREE.MeshStandardMaterial({ color: '#a8322b' })];
  for (let i = -3; i <= 3; i++) [-.36, .36].forEach((zz, k) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .03, 10), shieldMat[(i + k + 6) % 2]); s.rotation.x = Math.PI / 2; s.position.set(i * .32, .22, zz); g.add(s); });
  shadowize(g); const [x, z] = hexPos(9, 12); g.position.set(x + .3, -.15, z); g.rotation.y = .35; scene.add(g);
  return g;
}
let ship, clouds = [];
const smokeTex = (() => { const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d'); const gr = c.createRadialGradient(32, 32, 2, 32, 32, 30); gr.addColorStop(0, 'rgba(255,255,255,.9)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(cv); })();
const smokes = []; let smokeT = 0;
function spawnSmoke() {
  const [x, z] = hexPos(7, 5); const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: smokeTex, color: '#e8e4dc', transparent: true, opacity: .6, depthWrite: false }));
  m.position.set(x + .55, 3.3, z - .35); m.scale.setScalar(.4); scene.add(m); smokes.push({ m, life: 1 });
}

/* ---------- moradores animados ---------- */
const folk = [];
function buildFolk() {
  const clips = {}; ANIMS.forEach(n => G[n].animations.forEach(a => clips[a.name] = a));
  CHARS.concat(CHARS.slice(0, 2)).forEach((n, k) => {
    const o = SkeletonUtils.clone(G[n].scene); shadowize(o); o.scale.setScalar(.3);
    const mixer = new THREE.AnimationMixer(o);
    const walk = mixer.clipAction(clips.Walking_A), idle = mixer.clipAction(clips.Idle_A);
    idle.play(); const [x, z] = hexPos(7, 6); o.position.set(x + (k - 3) * .3, 0, z + .8); scene.add(o);
    folk.push({ o, mixer, walk, idle, tx: o.position.x, tz: o.position.z, wait: 500 + k * 700, moving: false, sp: .0011 + k * .00008 });
  });
}
function doorOf(p) { const [x, z] = hexPos(p.c, p.r); return [x + (Math.random() - .5) * .8, z + 1.05 + Math.random() * .2]; }
function stepFolk(dt) {
  const doors = PLOTS.filter(p => S.b[p.id].lvl);
  folk.forEach(f => {
    f.mixer.update(dt / 1000);
    if (f.wait > 0) { f.wait -= dt; if (f.moving) { f.moving = false; f.walk.fadeOut(.2); f.idle.reset().fadeIn(.2).play(); } return; }
    const dx = f.tx - f.o.position.x, dz = f.tz - f.o.position.z, dist = Math.hypot(dx, dz);
    if (dist < .05) { const [x, z] = doorOf(doors[Math.floor(Math.random() * doors.length)]); f.tx = x; f.tz = z; f.wait = 1200 + Math.random() * 3000; return; }
    if (!f.moving) { f.moving = true; f.idle.fadeOut(.2); f.walk.reset().fadeIn(.2).play(); }
    const st = Math.min(dist, f.sp * dt); f.o.position.x += dx / dist * st; f.o.position.z += dz / dist * st;
    f.o.rotation.y = Math.atan2(dx, dz);
  });
}

/* ---------- partículas ---------- */
const sparks = [];
function burst(p, col, n = 14) {
  const [x, z] = hexPos(p.c, p.r), h = PLOT_H[p.type] || 1.5;
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) { pos.set([x, h, z], i * 3); const a = Math.random() * TAU; vel.push([Math.cos(a) * .04, .05 + Math.random() * .05, Math.sin(a) * .04]); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: .18, transparent: true }));
  scene.add(pts); sparks.push({ pts, vel, life: 1 });
}
function floatIcon(p, res, txt) {
  const el = document.createElement('div'); el.className = 'floaty'; el.innerHTML = `${icoSVG(res)}<b>${txt}</b>`;
  $('#tags').appendChild(el); el.dataset.plot = p.id; setTimeout(() => el.remove(), 1400);
}

/* ---------- etiquetas e bolhas (HTML sobre o 3D) ---------- */
const tags = {};
function buildTags() {
  PLOTS.forEach(p => {
    const el = document.createElement('div'); el.className = 'tag';
    el.innerHTML = '<span class="lvl"></span><span class="sign"></span><div class="prog"><i></i><b></b></div><button class="bubble" aria-label="Coletar"></button>';
    el.querySelector('.bubble').addEventListener('click', e => { e.stopPropagation(); Snd.init(); collect(p); });
    $('#tags').appendChild(el); tags[p.id] = el;
  });
}
const v3 = new THREE.Vector3();
function screenOf(p, h) { const [x, z] = hexPos(p.c, p.r); v3.set(x, h, z).project(camera); return [(v3.x + 1) / 2 * innerWidth, (1 - v3.y) / 2 * innerHeight, v3.z < 1]; }
function updateTags() {
  PLOTS.forEach(p => {
    const el = tags[p.id], b = S.b[p.id], d = DEF[p.type], L = b.lvl, [sx, sy, vis] = screenOf(p, (PLOT_H[p.type] || 1.5) + .3);
    el.style.transform = `translate(${sx}px,${sy}px)`; el.style.display = vis ? '' : 'none';
    const lvl = el.querySelector('.lvl'), sign = el.querySelector('.sign'), prog = el.querySelector('.prog'), bub = el.querySelector('.bubble');
    lvl.hidden = !L; if (L) lvl.textContent = L;
    const req = !L && !b.end ? requirement(p, 1) : '';
    sign.hidden = !!L || !!b.end; if (!L && !b.end) { sign.textContent = req ? (d.stage2 ? 'Etapa 2' : 'Nv ' + (p.unlock || d.unlock)) : 'Construir'; sign.classList.toggle('free', !req); }
    prog.hidden = !b.end;
    if (b.end) { const total = timeFor(p.type, b.to) * 1000, left = b.end - Date.now(); prog.querySelector('i').style.width = Math.max(0, Math.min(100, (1 - left / total) * 100)) + '%'; prog.querySelector('b').textContent = fmtT(left / 1000); }
    const show = d.prod && L && !b.end && b.buf >= Math.max(20, bufCap(p.type, L) * .08);
    bub.hidden = !show; if (show) { bub.innerHTML = icoSVG(d.prod); bub.classList.toggle('full', b.buf >= bufCap(p.type, L) * .98); }
  });
  document.querySelectorAll('.floaty').forEach(el => { const p = plotById(el.dataset.plot); const [sx, sy] = screenOf(p, (PLOT_H[p.type] || 1.5) + 1); el.style.left = sx + 'px'; el.style.top = sy + 'px'; });
}

/* ---------- câmera e toque ---------- */
const cv = $('#world');
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), ground = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hit = new THREE.Vector3();
function pickPlot(sx, sy) {
  ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  // testa a altura de cada prédio para tocar no telhado também
  let best = null, bd = 1.25;
  PLOTS.forEach(p => { const [x, z] = hexPos(p.c, p.r); for (const h of [0, .8, 1.6, 2.6]) { ground.constant = -h; if (ray.ray.intersectPlane(ground, hit)) { const d = Math.hypot(hit.x - x, hit.z - z); if (d < bd && h <= (PLOT_H[p.type] || 1.5)) { bd = d; best = p; } } } });
  ground.constant = 0; return best;
}
const pointers = new Map(); let drag = null, pinch = null, moved = false;
cv.addEventListener('pointerdown', e => {
  Snd.init(); cv.setPointerCapture(e.pointerId); pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pointers.size === 1) { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cz: cam.z }; moved = false; }
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]), cd: cam.d }; drag = null; moved = true; }
});
cv.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return; pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; cam.d = pinch.cd * pinch.d / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])); placeCamera(); return; }
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
    if (moved) { const k = 2 * cam.d * Math.tan(camera.fov * Math.PI / 360) / innerHeight; cam.x = drag.cx - dx * k; cam.z = drag.cz - dy * k / Math.sin(cam.pitch); placeCamera(); }
  }
});
const up = e => {
  pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null;
  if (drag && !moved && pointers.size === 0) {
    const p = pickPlot(e.clientX, e.clientY);
    if (p) { const b = S.b[p.id]; if (DEF[p.type].prod && b.lvl && !b.end && b.buf >= 1 && collect(p, true)) Snd.collect(); else Snd.tap(); openBuilding(p); }
  }
  if (pointers.size === 0) drag = null;
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('wheel', e => { e.preventDefault(); cam.d *= e.deltaY < 0 ? .9 : 1.1; placeCamera(); }, { passive: false });

/* ---------- laço de render ---------- */
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(100, now - lastT); lastT = now;
  PLOTS.forEach(refreshPlot);
  stepFolk(dt);
  if (ship) { ship.position.y = -.15 + Math.sin(now / 900) * .05; ship.rotation.z = Math.sin(now / 1300) * .03; }
  clouds.forEach(c => { c.position.x += dt * .0006; if (c.position.x > 40) c.position.x = -40; });
  if (!reduceMotion && (smokeT -= dt) < 0) { smokeT = 420; spawnSmoke(); }
  for (let i = smokes.length - 1; i >= 0; i--) { const s = smokes[i]; s.life -= dt / 3000; s.m.position.y += dt * .0007; s.m.position.x += dt * .0003; s.m.scale.setScalar(.4 + (1 - s.life) * 1.1); s.m.material.opacity = s.life * .55; if (s.life <= 0) { scene.remove(s.m); s.m.material.dispose(); smokes.splice(i, 1); } }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt / 900; const a = s.pts.geometry.attributes.position; s.vel.forEach((v, k) => { a.array[k * 3] += v[0]; a.array[k * 3 + 1] += v[1]; a.array[k * 3 + 2] += v[2]; v[1] -= .004; }); a.needsUpdate = true; s.pts.material.opacity = s.life; if (s.life <= 0) { scene.remove(s.pts); sparks.splice(i, 1); } }
  updateTags();
  renderer.render(scene, camera);
}

/* ========== UI ========== */
const sheet = $('#sheet'), sheetBg = $('#sheetBg');
let sheetFor = null;
function openSheet(html) { sheet.innerHTML = html; sheet.hidden = false; sheetBg.hidden = false; const f = sheet.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
function closeSheet() { sheet.hidden = true; sheetBg.hidden = true; sheetFor = null; }
sheetBg.addEventListener('click', closeSheet);
function costHTML(c) { return `<div class="costs">${Object.entries(c).map(([k, v]) => `<div class="cost${(S.res[k] || 0) < v ? ' miss' : ''}">${icoSVG(k)}${fmt(v)}</div>`).join('')}</div>`; }
function openBuilding(p) {
  sheetFor = p.id; renderSheet();
}
function renderSheet() {
  const p = plotById(sheetFor); if (!p) return;
  const b = S.b[p.id], d = DEF[p.type], L = b.lvl;
  let html = `<h2>${d.name}</h2><p class="sub">${L ? 'Nível ' + L : d.stage2 ? 'Em breve' : 'Terreno livre'}</p><p class="desc">${d.desc}</p>`;
  if (d.stage2) { openSheet(html + `<div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  if (d.prod && L) html += `<div class="stat"><span>Produção</span><span>${fmt(rateFor(p.type, L))} ${RES_NAME[d.prod].toLowerCase()}/h${L < MAXLV ? ` <span class="up">→ ${fmt(rateFor(p.type, L + 1))}</span>` : ''}</span></div>
      <div class="stat"><span>Guardado aqui</span><span>${fmt(b.buf)} / ${fmt(bufCap(p.type, L))}</span></div>`;
  if (p.type === 'armazem' && L) html += `<div class="stat"><span>Limite de cada recurso</span><span>${fmt(capFor('food'))}</span></div>`;
  if (p.type === 'salao') html += `<div class="stat"><span>Poder da vila</span><span>${fmt(power())}</span></div>`;
  if (b.end) {
    const c = speedCost(p);
    html += `<div class="stat"><span>${L ? 'Melhorando para nível ' + b.to : 'Construindo'}</span><span>${fmtT((b.end - Date.now()) / 1000)}</span></div>
      <div class="actions"><button class="btn rune" data-a="speed">${c ? `Acelerar · ${c} runas` : 'Concluir grátis'}</button><button class="btn ghost" data-a="close">Fechar</button></div>`;
  } else if (L >= MAXLV) {
    html += `<p class="sub">Nível máximo desta etapa.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`;
  } else {
    const c = costFor(p.type, L + 1), req = requirement(p, L + 1), busy = busyBuilders().length >= 2;
    html += `<p class="sub" style="margin-top:10px">${L ? 'Melhorar para nível ' + (L + 1) : 'Construir'} · ${fmtT(timeFor(p.type, L + 1))}</p>${costHTML(c)}
      ${req ? `<p class="req">${req}</p>` : busy ? '<p class="req">Os dois construtores estão ocupados</p>' : ''}
      <div class="actions"><button class="btn" data-a="up" ${req || busy || !canAfford(c) ? 'disabled' : ''}>${L ? 'Melhorar' : 'Construir'}</button><button class="btn ghost" data-a="close">Fechar</button></div>`;
  }
  openSheet(html);
}
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const p = plotById(sheetFor);
  if (a.dataset.a === 'close') closeSheet();
  if (a.dataset.a === 'up' && p) upgrade(p);
  if (a.dataset.a === 'speed' && p) speedUp(p);
  if (a.dataset.a === 'claim') { claimMission(); openMissions(); }
});
function openMissions() {
  sheetFor = null;
  const m = MISSIONS[S.mission];
  openSheet(`<h2>Missões</h2><p class="sub">Complete para ganhar recursos e runas.</p>
    ${m ? `<div class="stat"><span>${m.t}</span><span>${m.ok() ? '✓' : ''}</span></div><div class="costs">${Object.entries(m.r).map(([k, v]) => `<div class="cost">${icoSVG(k)}${fmt(v)}</div>`).join('')}</div>
    <div class="actions"><button class="btn" data-a="claim" ${m.ok() ? '' : 'disabled'}>Resgatar</button><button class="btn ghost" data-a="close">Fechar</button></div>` : '<p class="desc">Todas as missões desta etapa foram cumpridas. A Etapa 2 traz as batalhas!</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>'}
    <div class="mlist">${MISSIONS.map((x, i) => `<div class="mitem${i < S.mission ? ' done' : i === S.mission ? ' cur' : ''}">${i < S.mission ? '✓' : i + 1}. ${x.t}</div>`).join('')}</div>`);
}
$('#mission').addEventListener('click', () => { Snd.init(); Snd.tap(); const m = MISSIONS[S.mission]; if (m && m.ok()) claimMission(); else openMissions(); });
$('#btnBattle').addEventListener('click', () => { Snd.init(); toast('As batalhas chegam na Etapa 2'); });
$('#btnRunes').addEventListener('click', () => { Snd.init(); toast('Runas aceleram obras. Ganhe completando missões.'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }

function renderHUD() {
  $('#res').innerHTML = RES.map(k => { const cap = capFor(k), v = S.res[k]; return `<div class="r${v >= cap ? ' full' : ''}" title="${RES_NAME[k]}">${icoSVG(k)}<span>${fmt(v)}</span></div>`; }).join('');
  $('#runes').textContent = S.runes; $('#hallLv').textContent = S.b.salao.lvl; $('#power').textContent = 'Poder ' + fmt(power());
  const m = MISSIONS[S.mission], mb = $('#mission');
  $('#missionText').textContent = m ? m.t : 'Etapa 1 completa!';
  mb.classList.toggle('done', !!(m && m.ok()));
  const old = mb.querySelector('.claim'); if (old) old.remove();
  if (m && m.ok()) { const c = document.createElement('span'); c.className = 'claim'; c.textContent = 'Resgatar'; mb.appendChild(c); }
}
function renderBuilders() {
  const busy = busyBuilders();
  [0, 1].forEach(k => {
    const el = $('#b' + k), p = busy[k], sp = el.querySelector('span');
    el.classList.toggle('busy', !!p);
    sp.textContent = p ? `${DEF[p.type].name.split(' ')[0]} · ${fmtT((S.b[p.id].end - Date.now()) / 1000)}` : 'Livre';
    el.onclick = p ? () => openBuilding(p) : null;
  });
}


/* ========== Laço do jogo ========== */
function tick() {
  finished = []; advance(Date.now());
  finished.forEach(id => { const p = plotById(id); Snd.done(); burst(p, '#f3d27a', 24); toast(`${DEF[p.type].name} chegou ao nível ${S.b[id].lvl}!`); dirty = true; });
  if (finished.length) refreshDecor();
  if (finished.length && sheetFor) renderSheet();
  renderBuilders();
  if (dirty) { renderHUD(); save(); dirty = false; }
}
setInterval(() => { tick(); if (sheetFor && !sheet.hidden && S.b[sheetFor] && S.b[sheetFor].end) renderSheet(); }, 1000);
setInterval(() => { dirty = true; }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); dirty = true; } else save(); });


/* ========== Início ========== */
addEventListener('resize', resize);
resize(); renderHUD(); renderBuilders();
loadAll().then(() => {
  buildTerrain(); ship = buildShip();
  for (let i = 0; i < 6; i++) { const c = model(i % 2 ? 'cloud_small' : 'cloud_big', 2.2); c.traverse(m => { if (m.isMesh) m.castShadow = false; }); c.position.set(-35 + i * 13, 9 + (i % 3), -14 + (i % 2) * 10); scene.add(c); clouds.push(c); }
  buildFolk(); buildTags(); refreshDecor();
  $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 600);
  renderer.setAnimationLoop(frame);
  if (!S.intro) {
    openSheet(`<h2>Bem-vindo, Jarl!</h2><p class="sub">Sua vila no fiorde</p>
      <p class="desc">Construa e melhore os prédios, colete recursos tocando nas bolhas acima deles e cumpra as missões. Arraste para mover a vila e use dois dedos para aproximar.</p>
      <p class="desc">Na Etapa 2 chegam os invasores: draugr, trolls e gigantes de gelo. Prepare a vila!</p>
      <div class="actions"><button class="btn" data-a="close">Começar</button></div>`);
    S.intro = true; save();
  } else if (offlineGain) toast(`Bem-vindo de volta! A vila produziu por ${fmtT(Math.min(offlineGain, 8 * 3600e3) / 1000)}`);
}).catch(err => { $('#loadMsg').textContent = 'Não foi possível carregar os modelos 3D. Verifique a conexão e recarregue.'; console.error(err); });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
window.__vs = { S, tick, upgrade: id => upgrade(plotById(id)), collect: id => collect(plotById(id)), cam, placeCamera };
