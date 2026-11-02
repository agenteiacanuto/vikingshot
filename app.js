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
  quartel: { name: 'Quartel', size: 2, time: 15, cost: { food: 120, wood: 160, stone: 60 }, unlock: 2,
             desc: 'Treina guerreiros, arqueiros e huscarls. Cada nível aumenta o tamanho do exército e libera novas tropas.' },
  ferreiro:{ name: 'Ferreiro', size: 2, time: 18, cost: { wood: 180, stone: 140 }, unlock: 4,
             desc: 'Forja machados e cotas de malha. Cada nível dá +10% de vida e dano a todas as tropas.' },
  torre:   { name: 'Torre de Arqueiros', size: 1, time: 14, cost: { wood: 120, stone: 160 }, unlock: 3,
             desc: 'Atira flechas sozinha nos draugr que chegam perto. Cada nível aumenta o dano.' }
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
const power = () => PLOTS.reduce((a, p) => a + (S.b[p.id] ? S.b[p.id].lvl * (p.type === 'salao' ? 120 : 35) : 0), 0)
  + Object.keys(TROOPS).reduce((a, k) => a + (S.army[k] || 0) * TROOPS[k].pow, 0) + (S.wave - 1) * 25;

/* ========== Tropas e ondas ========== */
const TROOPS = {
  war: { name: 'Guerreiro', pl: 'Guerreiros', model: 'Barbarian', r: 'axe_1handed', l: 'shield_round_barbarian', hp: 130, dmg: 13, rate: 1.0, range: .9, speed: 1.7,
         cost: { food: 30, wood: 20 }, time: 6, need: 1, pow: 4, desc: 'Machado e escudo. Segura a linha de frente.' },
  arc: { name: 'Arqueiro', pl: 'Arqueiros', model: 'Ranger', l: 'bow_withString', hp: 70, dmg: 12, rate: 1.3, range: 6, speed: 1.6, ranged: 'arrow',
         cost: { food: 30, wood: 35 }, time: 8, need: 2, pow: 5, desc: 'Atira de longe. Frágil de perto.' },
  hus: { name: 'Huscarl', pl: 'Huscarls', model: 'Knight', r: 'sword_1handed', l: 'shield_round_color', hp: 280, dmg: 24, rate: 1.1, range: 1, speed: 1.8,
         cost: { food: 60, iron: 25 }, time: 14, need: 4, pow: 10, desc: 'Guarda de elite do Jarl. Muita vida e golpe forte.' }
};
const FOES = {
  minion:  { name: 'Draugr', pl: 'Draugr', model: 'Skeleton_Minion', r: 'Skeleton_Blade', hp: 55, dmg: 7, rate: 1.1, range: .9, speed: 1.5 },
  warrior: { name: 'Draugr Guerreiro', pl: 'Draugr Guerreiros', model: 'Skeleton_Warrior', r: 'Skeleton_Axe', l: 'Skeleton_Shield_Small_A', hp: 150, dmg: 12, rate: 1.3, range: .9, speed: 1.2 },
  rogue:   { name: 'Draugr Ágil', pl: 'Draugr Ágeis', model: 'Skeleton_Rogue', r: 'Skeleton_Blade', hp: 75, dmg: 11, rate: .8, range: .9, speed: 2.2 },
  mage:    { name: 'Feiticeiro Draugr', pl: 'Feiticeiros Draugr', model: 'Skeleton_Mage', r: 'Skeleton_Staff', hp: 65, dmg: 15, rate: 1.8, range: 5, speed: 1.2, ranged: 'bolt' },
  boss:    { name: 'Rei Draugr', pl: 'Reis Draugr', model: 'Skeleton_Warrior', r: 'Skeleton_Axe', l: 'Skeleton_Shield_Small_A', hp: 1800, dmg: 35, rate: 1.6, range: 1.4, speed: 1.0, scale: .55 }
};
const MAXWAVE = 30;
const armyCap = () => S.b.quartel.lvl ? 4 + 2 * S.b.quartel.lvl : 0;
const armyCount = () => Object.values(S.army).reduce((a, b) => a + b, 0);
const queued = () => S.train ? S.train.left : 0;
const smithBonus = () => 1 + .1 * S.b.ferreiro.lvl;
const towerDmg = L => Math.round(16 * Math.pow(1.25, L - 1));
const heroStats = () => { const L = S.b.salao.lvl; return { hp: 450 + 90 * L, dmg: 28 + 6 * L }; };
function waveDef(w) {
  const n = Math.min(20, 3 + Math.round(w * .75)), list = [];
  if (w % 10 === 0) list.push('boss');
  const pool = ['minion', 'minion']; if (w >= 3) pool.push('warrior'); if (w >= 5) pool.push('rogue'); if (w >= 7) pool.push('mage', 'warrior');
  let k = w * 7;
  while (list.length < n) { k = (k * 31 + 7) % 101; list.push(pool[k % pool.length]); }
  return list;
}
function waveReward(w) {
  const f = Math.pow(1.18, w - 1), r = { food: Math.round(120 * f / 5) * 5, wood: Math.round(120 * f / 5) * 5, stone: Math.round(90 * f / 5) * 5 };
  if (w >= 3) r.iron = Math.round(50 * f / 5) * 5;
  r.runes = 5 + (w % 10 === 0 ? 40 : 0) + (w % 5 === 0 ? 10 : 0);
  return r;
}

/* ========== Missões ========== */
const lv = id => S.b[id] ? S.b[id].lvl : 0;
const MISSIONS = [
  { t: 'Colete comida na Fazenda', ok: () => S.stats.food > 0, r: { wood: 150 } },
  { t: 'Construa a Pedreira', ok: () => lv('pedreira') >= 1, r: { food: 150 } },
  { t: 'Melhore o Salão do Jarl ao nível 2', ok: () => lv('salao') >= 2, r: { runes: 20 } },
  { t: 'Construa o Quartel', ok: () => lv('quartel') >= 1, r: { food: 250 } },
  { t: 'Treine 3 Guerreiros no Quartel', ok: () => (S.stats.trained || 0) >= 3, r: { wood: 200 } },
  { t: 'Vença a Onda 1', ok: () => S.wave > 1, r: { runes: 20 } },
  { t: 'Melhore a Serraria ao nível 2', ok: () => lv('serraria') >= 2, r: { runes: 10 } },
  { t: 'Construa o Armazém', ok: () => lv('armazem') >= 1, r: { stone: 200 } },
  { t: 'Construa a segunda Fazenda', ok: () => lv('faz2') >= 1, r: { wood: 300 } },
  { t: 'Melhore o Salão do Jarl ao nível 3', ok: () => lv('salao') >= 3, r: { runes: 30 } },
  { t: 'Construa uma Torre de Arqueiros', ok: () => Math.max(lv('torre1'), lv('torre2')) >= 1, r: { stone: 300 } },
  { t: 'Vença a Onda 3', ok: () => S.wave > 3, r: { runes: 20 } },
  { t: 'Construa a Mina de Ferro', ok: () => lv('mina') >= 1, r: { food: 500 } },
  { t: 'Melhore uma Fazenda ao nível 3', ok: () => Math.max(lv('faz1'), lv('faz2')) >= 3, r: { stone: 300 } },
  { t: 'Colete 500 de ferro', ok: () => S.stats.iron >= 500, r: { wood: 600 } },
  { t: 'Melhore o Salão do Jarl ao nível 4', ok: () => lv('salao') >= 4, r: { runes: 40 } },
  { t: 'Construa o Ferreiro', ok: () => lv('ferreiro') >= 1, r: { iron: 200 } },
  { t: 'Melhore o Quartel ao nível 4 (libera Huscarls)', ok: () => lv('quartel') >= 4, r: { food: 800 } },
  { t: 'Vença a Onda 5', ok: () => S.wave > 5, r: { runes: 30 } },
  { t: 'Melhore a Serraria ao nível 5', ok: () => lv('serraria') >= 5, r: { stone: 800 } },
  { t: 'Melhore o Armazém ao nível 4', ok: () => lv('armazem') >= 4, r: { iron: 300 } },
  { t: 'Melhore o Salão do Jarl ao nível 5', ok: () => lv('salao') >= 5, r: { runes: 50 } },
  { t: 'Derrote o Rei Draugr na Onda 10', ok: () => S.wave > 10, r: { runes: 60 } },
  { t: 'Deixe todos os produtores no nível 5', ok: () => ['faz1', 'faz2', 'serraria', 'pedreira', 'mina'].every(id => lv(id) >= 5), r: { runes: 60 } },
  { t: 'Melhore o Salão do Jarl ao nível 7', ok: () => lv('salao') >= 7, r: { runes: 80 } },
  { t: 'Vença a Onda 20', ok: () => S.wave > 20, r: { runes: 100 } },
  { t: 'Melhore o Salão do Jarl ao nível 10', ok: () => lv('salao') >= 10, r: { runes: 150 } },
  { t: 'Vença a Onda 30 e salve o fiorde', ok: () => S.wave > 30, r: { runes: 300 } }
];
const OLD_MISSIONS = ['Colete comida na Fazenda', 'Construa a Pedreira', 'Melhore o Salão do Jarl ao nível 2', 'Melhore a Serraria ao nível 2', 'Construa o Armazém', 'Construa a segunda Fazenda', 'Melhore uma Fazenda ao nível 3', 'Melhore o Salão do Jarl ao nível 3', 'Construa a Mina de Ferro', 'Colete 500 de ferro', 'Melhore o Salão do Jarl ao nível 4', 'Melhore a Serraria ao nível 5', 'Melhore o Armazém ao nível 4', 'Melhore o Salão do Jarl ao nível 5', 'Deixe todos os produtores no nível 5', 'Melhore o Salão do Jarl ao nível 7', 'Melhore o Salão do Jarl ao nível 10'];

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
if (!S.army) S.army = { war: 0, arc: 0, hus: 0 };
if (!S.jarl) S.jarl = 'Jarl';
if (!S.vila) S.vila = 'Vila do Jarl';
if (!S.wave) S.wave = 1;
if (S.train === undefined) S.train = null;
if (S.mv !== 2) { // missões antigas da Etapa 1 -> nova lista com batalhas
  const done = new Set(OLD_MISSIONS.slice(0, S.mission));
  S.mission = MISSIONS.findIndex(m => !done.has(m.t)); if (S.mission < 0) S.mission = MISSIONS.length; S.mv = 2;
}
let dirty = true;
let cloudDirty = false, leaving = false;
const save = () => { if (leaving) return; try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} cloudDirty = true; };

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
  no() { this.tone(200, .15, { type: 'square', v: .04, to: 140 }); },
  noise(d, v, f = 1800, delay = 0) {
    if (!S.sound || !this.ctx || this.ctx.state !== 'running') return;
    const c = this.ctx, t = c.currentTime + delay, len = Math.floor(c.sampleRate * d), buf = c.createBuffer(1, len, c.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2);
    const src = c.createBufferSource(), bp = c.createBiquadFilter(), g = c.createGain(); src.buffer = buf; bp.type = 'bandpass'; bp.frequency.value = f; bp.Q.value = 1.2;
    g.gain.value = v; src.connect(bp); bp.connect(g); g.connect(c.destination); src.start(t);
  },
  _hit: 0,
  hit() { const n = performance.now(); if (n - this._hit < 70) return; this._hit = n; this.noise(.08, .25, 2600 + Math.random() * 1500); this.tone(1400 + Math.random() * 600, .06, { type: 'square', v: .025 }); },
  shoot() { this.noise(.14, .12, 900); },
  die() { this.tone(260, .25, { type: 'sawtooth', v: .03, to: 90 }); },
  crash() { this.noise(.5, .35, 400); this.tone(90, .4, { type: 'sine', v: .12, to: 45 }); },
  horn() { [[110, 0], [110, .9], [147, 1.4]].forEach(([f, d], i) => { this.tone(f, i === 2 ? 1.4 : .7, { type: 'sawtooth', v: .07, delay: d }); this.tone(f * 1.5, i === 2 ? 1.4 : .7, { type: 'triangle', v: .04, delay: d }); }); },
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, .45, { type: 'triangle', v: .09, delay: i * .22 })); }
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
  const T = S.train;
  if (T) {
    while (T.left > 0 && now >= T.next) { S.army[T.type]++; S.stats.trained = (S.stats.trained || 0) + 1; T.left--; T.next += T.per * 1000; trainedNow++; }
    if (!T.left) S.train = null;
  }
  S.last = now;
}
let finished = [], trainedNow = 0;
const bootLast = S.last || 0;
const offlineGain = (() => { const before = JSON.stringify(S.b); const away = Date.now() - S.last; advance(Date.now()); return away > 60e3 ? away : 0; })();

/* ========== Ações ========== */
const busyBuilders = () => PLOTS.filter(p => S.b[p.id].end);
const canAfford = c => Object.entries(c).every(([k, v]) => (S.res[k] || 0) >= v);
function requirement(p, L) {
  const d = DEF[p.type];
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
function missingTxt(c) {
  const f = Object.entries(c).filter(([k, v]) => (S.res[k] || 0) < v).map(([k, v]) => `${fmt(v - (S.res[k] || 0))} de ${RES_NAME[k].toLowerCase()}`);
  return 'Falta ' + f.join(' e ') + '. Colete nas bolhas dos prédios ou melhore os produtores.';
}
function trainLeftS() { const T = S.train; return T ? Math.max(0, (T.left - 1) * T.per + (T.next - Date.now()) / 1000) : 0; }
function train(type, n) {
  const t = TROOPS[type], room = armyCap() - armyCount() - queued();
  if (S.train && S.train.type !== type) { toast('Espere o treino atual terminar'); Snd.no(); return; }
  n = Math.min(n, room); if (n <= 0) { toast('Exército cheio: melhore o Quartel'); Snd.no(); return; }
  const c = {}; for (const k in t.cost) c[k] = t.cost[k] * n;
  if (!canAfford(c)) { toast('Faltam recursos'); Snd.no(); return; }
  for (const k in c) S.res[k] -= c[k];
  if (S.train) S.train.left += n; else S.train = { type, left: n, per: t.time, next: Date.now() + t.time * 1000 };
  Snd.build(); save(); dirty = true; renderSheet();
}
function speedTrain() {
  const c = Math.ceil(trainLeftS() / 60); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); return; }
  S.runes -= c; if (S.train) S.train.next = Date.now() - (S.train.left - 1) * S.train.per * 1000; tick(); renderSheet();
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
resource_lumber resource_stone wheelbarrow tent weaponrack cloud_big cloud_small building_tower_B_red building_destroyed
axe_1handed axe_2handed sword_1handed shield_round_barbarian shield_round_color bow_withString target`.split(/\s+/);
const CHARS = ['Barbarian', 'Rogue', 'Ranger', 'Knight', 'Rogue_Hooded', 'Skeleton_Minion', 'Skeleton_Warrior', 'Skeleton_Rogue', 'Skeleton_Mage'];
const CHAR_GLTF = ['Skeleton_Axe', 'Skeleton_Blade', 'Skeleton_Shield_Small_A', 'Skeleton_Staff'];
const ANIMS = ['Rig_Medium_MovementBasic', 'Rig_Medium_General'];
function loadAll() {
  const jobs = ENV.map(n => loader.loadAsync(`models/env/${n}.gltf`).then(g => { G[n] = g; }))
    .concat(CHARS.concat(ANIMS).map(n => loader.loadAsync(`models/chars/${n}.glb`).then(g => { G[n] = g; })))
    .concat(CHAR_GLTF.map(n => loader.loadAsync(`models/chars/${n}.gltf`).then(g => { G[n] = g; })));
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
  const ruined = B && B.bhp[p.id] !== undefined && B.bhp[p.id] <= 0;
  const sig = [L, b.end ? b.to : 0, tier, ruined].join(':');
  if (g.userData.sig === sig) return; g.userData.sig = sig;
  g.clear();
  if (!L) {
    if (b.end) { const total = timeFor(p.type, b.to) * 1000, pr = 1 - (b.end - Date.now()) / total; put(g, pr < .34 ? 'building_stage_A' : pr < .67 ? 'building_stage_B' : 'building_stage_C'); g.userData.sig += ':' + (pr < .34 ? 'a' : pr < .67 ? 'b' : 'c'); }
    else put(g, 'building_dirt');
    return;
  }
  if (ruined) { put(g, 'building_destroyed'); return; }
  switch (p.type) {
    case 'quartel': put(g, 'building_barracks_red'); if (tier >= 2) put(g, 'weaponrack', -.65, .55, .4, .8); if (tier >= 3) put(g, 'target', .7, .5, -.5, .7); break;
    case 'ferreiro': put(g, 'building_blacksmith_red'); if (tier >= 2) put(g, 'barrel', .65, .55, 0, .7); break;
    case 'torre': put(g, tier >= 2 ? 'building_tower_B_red' : 'building_tower_A_red'); if (tier >= 3) put(g, 'flag_red', .45, .45, 0, .8); break;
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
function buildShip(enemy) {
  const g = new THREE.Group();
  const wood = new THREE.MeshStandardMaterial({ color: enemy ? '#3b3a36' : '#6b4527', roughness: .8 });
  const hull = new THREE.Shape(); hull.moveTo(-1.6, .2); hull.quadraticCurveTo(0, -.55, 1.6, .2); hull.lineTo(1.4, .35); hull.quadraticCurveTo(0, -.2, -1.4, .35); hull.closePath();
  const hg = new THREE.ExtrudeGeometry(hull, { depth: .7, bevelEnabled: false }); hg.translate(0, 0, -.35);
  g.add(new THREE.Mesh(hg, wood));
  const deck = new THREE.Mesh(new THREE.BoxGeometry(2.6, .06, .62), wood); deck.position.y = .12; g.add(deck);
  [[1.55, 1], [-1.55, -1]].forEach(([x, s]) => { const neck = new THREE.Mesh(new THREE.TorusGeometry(.32, .07, 6, 10, Math.PI), wood); neck.position.set(x, .45, 0); neck.rotation.z = s > 0 ? -Math.PI / 2.4 : Math.PI / 1.7; g.add(neck); });
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.2), wood); mast.position.y = 1.2; g.add(mast);
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const c = cv.getContext('2d');
  for (let i = 0; i < 8; i++) { c.fillStyle = enemy ? (i % 2 ? '#26302c' : '#5d7a6a') : (i % 2 ? '#efe4cc' : '#a8322b'); c.fillRect(i * 8, 0, 8, 64); }
  const sailTex = new THREE.CanvasTexture(cv); sailTex.colorSpace = THREE.SRGBColorSpace;
  const sail = new THREE.Mesh(new THREE.PlaneGeometry(1.5, 1.2, 6, 1), new THREE.MeshStandardMaterial({ map: sailTex, side: THREE.DoubleSide }));
  sail.position.set(0, 1.35, 0); sail.rotation.y = Math.PI / 2; g.add(sail); g.userData.sail = sail;
  const shieldMat = enemy ? [new THREE.MeshStandardMaterial({ color: '#7d8a80' }), new THREE.MeshStandardMaterial({ color: '#2d3330' })] : [new THREE.MeshStandardMaterial({ color: '#d9a441' }), new THREE.MeshStandardMaterial({ color: '#a8322b' })];
  for (let i = -3; i <= 3; i++) [-.36, .36].forEach((zz, k) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .03, 10), shieldMat[(i + k + 6) % 2]); s.rotation.x = Math.PI / 2; s.position.set(i * .32, .22, zz); g.add(s); });
  shadowize(g); if (enemy) return g;
  const [x, z] = hexPos(9, 12); g.position.set(x + .3, -.15, z); g.rotation.y = .35; scene.add(g);
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
    sign.hidden = !!L || !!b.end; if (!L && !b.end) { sign.textContent = req ? 'Nv ' + (p.unlock || d.unlock) : 'Construir'; sign.classList.toggle('free', !req); }
    const tr = p.type === 'quartel' && S.train && !b.end;
    prog.hidden = !b.end && !tr; prog.classList.toggle('train', !!tr);
    if (b.end) { const total = timeFor(p.type, b.to) * 1000, left = b.end - Date.now(); prog.querySelector('i').style.width = Math.max(0, Math.min(100, (1 - left / total) * 100)) + '%'; prog.querySelector('b').textContent = fmtT(left / 1000); }
    else if (tr) { const T = S.train, part = 1 - (T.next - Date.now()) / (T.per * 1000); prog.querySelector('i').style.width = Math.max(0, Math.min(100, part * 100)) + '%'; prog.querySelector('b').textContent = `⚔ ${T.left} · ${fmtT(trainLeftS())}`; }
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
  if (drag && !moved && pointers.size === 0 && B) moveHero(e.clientX, e.clientY);
  else if (drag && !moved && pointers.size === 0) {
    const p = pickPlot(e.clientX, e.clientY);
    if (p) { const b = S.b[p.id]; if (DEF[p.type].prod && b.lvl && !b.end && b.buf >= 1 && collect(p, true)) Snd.collect(); else Snd.tap(); openBuilding(p); }
  }
  if (pointers.size === 0) drag = null;
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('wheel', e => { e.preventDefault(); cam.d *= e.deltaY < 0 ? .9 : 1.1; placeCamera(); }, { passive: false });

/* ---------- batalha na vila ---------- */
let B = null; // estado da batalha (null = vila em paz)
const HERO = { name: 'Jarl', model: 'Barbarian', r: 'axe_2handed', scale: .38, range: 1.1, rate: .9, speed: 3 };
const CLIPS = {};
const clipsReady = () => { if (!CLIPS.Idle_A) ANIMS.forEach(n => G[n].animations.forEach(a => CLIPS[a.name] = a)); };
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 2, 32, 32, 30); g.addColorStop(0, 'rgba(0,0,0,.55)'); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
const blobMat = new THREE.MeshBasicMaterial({ map: blobTex, transparent: true, depthWrite: false });
const blobGeo = new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2);
const ringGeo = new THREE.RingGeometry(.42, .52, 32).rotateX(-Math.PI / 2);
const heroRingMat = new THREE.MeshBasicMaterial({ color: '#f3d27a', transparent: true, opacity: .85, depthWrite: false });
const SLOT = { r: ['handslot.r', 'handslotr'], l: ['handslot.l', 'handslotl'] };
function findNode(o, names) { let r = null; o.traverse(m => { if (!r && names.includes(m.name)) r = m; }); return r; }
function arm(o, side, name) { if (!name || !G[name]) return; const b = findNode(o, SLOT[side]); if (!b) return; const w = G[name].scene.clone(true); w.traverse(m => { if (m.isMesh) { m.castShadow = false; m.frustumCulled = false; } }); b.add(w); }
const ACTS = { idle: 'Idle_A', walk: 'Walking_A', run: 'Running_A', atk: 'Use_Item', shoot: 'Throw', hit: 'Hit_A', die: 'Death_A', rise: 'Spawn_Ground' };
const ONCE = ['atk', 'shoot', 'hit', 'die', 'rise'];
function mkChar(model, scale, wr, wl) {
  clipsReady();
  const o = SkeletonUtils.clone(G[model].scene); o.scale.setScalar(scale);
  o.traverse(m => { if (m.isMesh) { m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false; } });
  arm(o, 'r', wr); arm(o, 'l', wl);
  const blob = new THREE.Mesh(blobGeo, blobMat); blob.scale.setScalar(3.4); blob.position.y = .08; blob.renderOrder = 1; o.add(blob);
  const mixer = new THREE.AnimationMixer(o), act = {};
  for (const k in ACTS) { act[k] = mixer.clipAction(CLIPS[ACTS[k]]); if (ONCE.includes(k)) { act[k].setLoop(THREE.LoopOnce); act[k].clampWhenFinished = true; } }
  act.idle.play();
  return { o, mixer, act, cur: 'idle' };
}
function anim(u, k, dur) {
  if (u.cur === k && !ONCE.includes(k)) return;
  const a = u.act[k], prev = u.act[u.cur];
  a.reset(); a.timeScale = dur ? a.getClip().duration / dur : 1; a.fadeIn(.1).play();
  if (prev && prev !== a) prev.fadeOut(.1);
  u.cur = k;
}

/* barras de vida 3D (sprites sempre de frente para a câmera) */
const barBgMat = new THREE.SpriteMaterial({ color: '#140c06', depthTest: false, transparent: true, opacity: .85 });
const BAR_COL = { ally: '#7fc56b', enemy: '#e0523f', hero: '#f3d27a', bld: '#f0a43a' };
function mkBar(kind, w = .7) {
  const bg = new THREE.Sprite(barBgMat); bg.scale.set(w + .08, .15, 1); bg.renderOrder = 20;
  const fg = new THREE.Sprite(new THREE.SpriteMaterial({ color: BAR_COL[kind], depthTest: false })); fg.center.set(0, .5); fg.scale.set(w, .09, 1); fg.renderOrder = 21;
  scene.add(bg, fg); return { bg, fg, w };
}
const camRight = new THREE.Vector3();
function placeBar(bar, x, y, z, k, show) {
  bar.bg.visible = bar.fg.visible = show; if (!show) return;
  bar.bg.position.set(x, y, z); bar.fg.position.set(x - camRight.x * bar.w / 2, y, z - camRight.z * bar.w / 2);
  bar.fg.scale.x = Math.max(.001, bar.w * k);
}
function dropBar(bar) { if (!bar) return; scene.remove(bar.bg, bar.fg); bar.fg.material.dispose(); }

/* partículas soltas */
function burstAt(x, y, z, col, n = 10, sp = .04) {
  const geo = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), vel = [];
  for (let i = 0; i < n; i++) { pos.set([x, y, z], i * 3); const a = Math.random() * TAU; vel.push([Math.cos(a) * sp, .03 + Math.random() * .05, Math.sin(a) * sp]); }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(geo, new THREE.PointsMaterial({ color: col, size: .16, transparent: true }));
  scene.add(pts); sparks.push({ pts, vel, life: 1 });
}

/* projéteis */
const arrowGeo = new THREE.CylinderGeometry(.02, .02, .55, 4).rotateX(Math.PI / 2);
const arrowMat = new THREE.MeshBasicMaterial({ color: '#3a2412' });
const boltGeo = new THREE.SphereGeometry(.13, 8, 6), boltMat = new THREE.MeshBasicMaterial({ color: '#8dffb8' });
function shoot(kind, sx, sy, sz, target, dmg, side, aoe = 0) {
  let m;
  if (kind === 'arrow') m = new THREE.Mesh(arrowGeo, arrowMat);
  else if (kind === 'bolt') m = new THREE.Mesh(boltGeo, boltMat);
  else { m = G.axe_1handed.scene.clone(true); m.scale.setScalar(.6); }
  m.position.set(sx, sy, sz); scene.add(m);
  const [tx, tz] = posOf(target), d = Math.hypot(tx - sx, tz - sz);
  B.proj.push({ m, kind, sx, sy, sz, tx, tz, target, t: 0, dur: Math.max(.25, d / (kind === 'axe' ? 11 : 14)), arc: kind === 'bolt' ? .3 : Math.min(2, d * .18), dmg, side, aoe });
  if (kind !== 'bolt') Snd.shoot();
}

/* alvos: unidades ou prédios */
const posOf = t => t.isB ? [t.x, t.z] : [t.o.position.x, t.o.position.z];
const alive = t => t && (t.isB ? t.hp > 0 : !t.dead && t.on);
const dist2 = (a, b) => { const [ax, az] = posOf(a), [bx, bz] = posOf(b); return Math.hypot(ax - bx, az - bz); };

function mkUnit(side, kind, x, z) {
  const hero = kind === 'hero', D = hero ? HERO : side === 'ally' ? TROOPS[kind] : FOES[kind];
  const w = B.wave, scale = D.scale || .3;
  const c = mkChar(D.model, scale, D.r, D.l);
  c.o.position.set(x, 0, z); c.o.visible = false; scene.add(c.o);
  let hp, dmg;
  if (hero) { const h = heroStats(); hp = h.hp; dmg = h.dmg; const ring = new THREE.Mesh(ringGeo, heroRingMat); ring.position.y = .05; ring.scale.setScalar(1 / scale * .3 * 2.6); c.o.add(ring); }
  else if (side === 'ally') { const f = smithBonus(); hp = D.hp * f; dmg = D.dmg * f; }
  else { hp = D.hp * Math.pow(1.08, w - 1); dmg = D.dmg * Math.pow(1.05, w - 1); }
  const u = Object.assign(c, { side, kind, D, hp, max: hp, dmg, rate: D.rate, range: D.range, speed: D.speed, ranged: D.ranged,
    rad: scale / .3 * .3, cd: Math.random() * .5, busy: 0, pend: null, target: null, rt: 0, dead: false, on: false, deadT: 0,
    bar: mkBar(hero ? 'hero' : side, hero ? .9 : kind === 'boss' ? 1.4 : .6), barY: (kind === 'boss' ? 1.55 : hero ? 1.15 : .95) });
  B.units.push(u); return u;
}
function activate(u, rise) {
  u.on = true; u.o.visible = true;
  if (rise) { anim(u, 'rise'); u.busy = 1.3; burstAt(u.o.position.x, .2, u.o.position.z, '#6b5a44', 12, .03); }
}
function hurt(t, d) {
  if (!alive(t) || !B || B.over) return;
  if (t.isB) {
    t.hp -= d * .6; B.bhp[t.id] = t.hp;
    if (t.hp <= 0) { Snd.crash(); burstAt(t.x, 1, t.z, '#5b4a3a', 26, .07); if (t.id === 'salao') endBattle(false); }
    return;
  }
  t.hp -= d; burstAt(t.o.position.x, .5, t.o.position.z, t.side === 'enemy' ? '#d8d2c0' : '#b02a1e', 4, .025); Snd.hit();
  if (t.hp <= 0) { die(t); return; }
  if (!t.busy && t.kind !== 'boss' && t.kind !== 'hero' && Math.random() < .25) { anim(t, 'hit', .4); t.busy = .35; }
}
function die(u) {
  u.dead = true; u.pend = null; anim(u, 'die'); u.bar.bg.visible = u.bar.fg.visible = false; Snd.die();
  if (u.side === 'enemy') B.killed++;
  if (u.kind === 'hero') { B.heroDown = 8; toast('O Jarl caiu! Ele volta em 8 segundos'); }
}

function startBattle() {
  if (B) return;
  if (S.wave > MAXWAVE) { toast('Todas as ondas foram vencidas!'); return; }
  Snd.init(); closeSheet();
  const w = S.wave;
  B = { wave: w, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: 0, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0 };
  // prédios viram alvos com vida
  PLOTS.forEach(p => {
    const L = S.b[p.id].lvl; if (!L) return; const [x, z] = hexPos(p.c, p.r);
    const max = p.type === 'salao' ? 1500 + 700 * L : p.type === 'torre' ? 400 + 250 * L : 300 + 180 * L;
    const t = { isB: true, id: p.id, p, x, z, rad: p.type === 'salao' ? 1.3 : .85, hp: max, max, bar: mkBar('bld', p.type === 'salao' ? 1.6 : 1), cd: 1 };
    B.blds.push(t); B.bhp[p.id] = max;
  });
  // herói
  const [hx, hz] = hexPos(7, 5);
  B.hero = mkUnit('ally', 'hero', hx, hz + 1.6); activate(B.hero);
  // tropas saem do quartel
  const [qx, qz] = hexPos(10, 8); let k = 0;
  ['hus', 'war', 'arc'].forEach(type => { for (let i = 0; i < (S.army[type] || 0); i++) { const u = mkUnit('ally', type, qx + (Math.random() - .5) * .6, qz + 1); u.spawnAt = .4 + k++ * .22; B.queue.push(u); } });
  // inimigos: praia (barco), floresta leste e oeste
  const list = waveDef(w); B.total = list.length;
  const first = Math.ceil(list.length * .6);
  let nb = 0, nf = 0;
  list.forEach((kind, i) => {
    const lane = kind === 'boss' || w <= 2 ? 0 : [0, 1, 0, 2][i % 4], late = i >= first;
    let x, z, at;
    if (lane === 0) { x = -3 + (Math.random() - .5) * 2.2; z = 10.6 + Math.random() * .6; at = (late ? 19 : 5.6) + (nb++ % 12) * .4; }
    else { x = lane === 1 ? 16.4 : -16.2; z = (lane === 1 ? -1 : 1.5) + Math.random() * 5; at = (late ? 17 : 2.5) + (nf++ % 10) * .55; }
    const u = mkUnit('enemy', kind, x, z); u.spawnAt = at; u.rise = lane !== 0; B.queue.push(u);
  });
  // drakkar inimigo
  B.ship = buildShip(true); B.ship.position.set(-3, -.15, 34); B.ship.rotation.y = Math.PI / 2; scene.add(B.ship);
  document.body.classList.add('battle'); $('#bhud').hidden = false; $('#bWave').textContent = 'Onda ' + w + (w % 10 === 0 ? ' · Chefe' : '');
  $('#bHint').hidden = false; setTimeout(() => { const h = $('#bHint'); if (h) h.hidden = true; }, 6000);
  folk.forEach(f => f.o.visible = false); guards.forEach(g => g.o.visible = false);
  cam.x = 0; cam.z = 3.5; placeCamera();
  Snd.horn();
}

function chooseTarget(u) {
  let best = null, bd = 1e9;
  const consider = (t, bias = 0) => { if (!alive(t)) return; const d = dist2(u, t) + bias; if (d < bd) { bd = d; best = t; } };
  if (u.side === 'ally') {
    B.units.forEach(t => { if (t.side === 'enemy') consider(t); });
    if (u.kind === 'hero' && bd > 4.5) return null; // o Jarl só caça quem está perto
  } else {
    B.units.forEach(t => { if (t.side === 'ally') { const d = dist2(u, t); if (d < 3.2) consider(t); } });
    if (!best) B.blds.forEach(t => consider(t, t.id === 'salao' ? -2 : 0));
  }
  return best;
}
function moveToward(u, tx, tz, dt, stopAt) {
  const p = u.o.position, dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz);
  u.o.rotation.y = Math.atan2(dx, dz);
  if (d <= stopAt) return true;
  const st = Math.min(d - stopAt, u.speed * dt); p.x += dx / d * st; p.z += dz / d * st;
  anim(u, u.speed >= 1.6 ? 'run' : 'walk');
  return false;
}
function strike(u, t) {
  u.cd = u.rate; u.busy = .5; u.pend = { t: .28, target: t };
  anim(u, u.ranged ? 'shoot' : 'atk', .55);
}
function stepUnit(u, dt) {
  u.mixer.update(dt);
  if (u.dead) {
    u.deadT += dt; if (u.deadT > 2) u.o.position.y -= dt * .5;
    if (u.deadT > 3.2 && u.o.parent) { scene.remove(u.o); }
    return;
  }
  if (!u.on) return;
  u.cd -= dt;
  if (u.pend) {
    u.pend.t -= dt;
    if (u.pend.t <= 0) {
      const t = u.pend.target; u.pend = null;
      if (alive(t)) {
        const p = u.o.position;
        if (u.ranged) shoot(u.ranged, p.x, .7, p.z, t, u.dmg, u.side);
        else if (dist2(u, t) <= u.range + (t.rad || .3) + .6) hurt(t, u.dmg);
      }
    }
  }
  if (u.busy > 0) { u.busy -= dt; return; }
  // ordem do jogador para o Jarl
  if (u.kind === 'hero' && B.cmd) {
    if (moveToward(u, B.cmd[0], B.cmd[1], dt, .15)) { B.cmd = null; anim(u, 'idle'); }
    return;
  }
  if ((u.rt -= dt) <= 0 || !alive(u.target)) { u.target = chooseTarget(u); u.rt = .4 + Math.random() * .2; }
  const t = u.target;
  if (!t) {
    if (u.side === 'ally' && u.kind !== 'hero') { // espera em frente ao Salão
      const i = B.units.indexOf(u); if (moveToward(u, 1.5 + (i % 5) * .6 - 1.2, 3.2 + Math.floor(i / 5) % 3 * .6, dt, .2)) anim(u, 'idle');
    } else anim(u, 'idle');
    return;
  }
  const [tx, tz] = posOf(t), reach = u.range + (t.rad || .3);
  if (moveToward(u, tx, tz, dt, reach)) { if (u.cd <= 0) strike(u, t); else if (u.cur === 'walk' || u.cur === 'run') anim(u, 'idle'); }
}
function separate() {
  const L = B.units.filter(u => u.on && !u.dead);
  for (let i = 0; i < L.length; i++) for (let j = i + 1; j < L.length; j++) {
    const a = L[i].o.position, b = L[j].o.position, dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), m = (L[i].rad + L[j].rad) * 1.25;
    if (d > 0 && d < m) { const push = (m - d) / 2, nx = dx / d * push, nz = dz / d * push; a.x -= nx; a.z -= nz; b.x += nx; b.z += nz; }
  }
  L.forEach(u => { const p = u.o.position; if (u.on && u.kind !== 'boss') { p.x = Math.max(-17, Math.min(17.5, p.x)); p.z = Math.max(-9.5, Math.min(11.5, p.z)); } });
}
function stepBattle(dt) {
  if (!B) return;
  B.t += dt;
  camRight.setFromMatrixColumn(camera.matrixWorld, 0);
  // drakkar inimigo chega à praia
  if (B.ship) { const k = Math.min(1, B.t / 5); B.ship.position.z = 34 - (34 - 12.6) * (1 - Math.pow(1 - k, 2)); B.ship.position.y = -.15 + Math.sin(B.t * 1.4) * .05; B.ship.rotation.z = Math.sin(B.t) * .03; }
  B.queue = B.queue.filter(u => { if (B.t >= u.spawnAt) { activate(u, u.rise); return false; } return true; });
  B.units.forEach(u => stepUnit(u, dt));
  separate();
  // torres atiram
  B.blds.forEach(t => {
    if (t.p.type !== 'torre' || t.hp <= 0) return; t.cd -= dt; if (t.cd > 0) return;
    let best = null, bd = 7.5; B.units.forEach(u => { if (u.side === 'enemy' && alive(u)) { const d = Math.hypot(u.o.position.x - t.x, u.o.position.z - t.z); if (d < bd) { bd = d; best = u; } } });
    if (best) { t.cd = 1.2; shoot('arrow', t.x, 2.7, t.z, best, towerDmg(S.b[t.id].lvl), 'ally'); }
  });
  // projéteis
  for (let i = B.proj.length - 1; i >= 0; i--) {
    const pr = B.proj[i]; pr.t += dt / pr.dur;
    if (alive(pr.target)) [pr.tx, pr.tz] = posOf(pr.target);
    const k = Math.min(1, pr.t), x = pr.sx + (pr.tx - pr.sx) * k, z = pr.sz + (pr.tz - pr.sz) * k, y = pr.sy + (.5 - pr.sy) * k + pr.arc * 4 * k * (1 - k);
    if (pr.kind === 'arrow') pr.m.lookAt(x + (x - pr.m.position.x), y + (y - pr.m.position.y), z + (z - pr.m.position.z));
    if (pr.kind === 'axe') pr.m.rotation.x += dt * 22;
    pr.m.position.set(x, y, z);
    if (pr.t >= 1) {
      if (pr.aoe) { burstAt(pr.tx, .4, pr.tz, '#f3d27a', 22, .07); Snd.crash(); B.units.forEach(u => { if (u.side === 'enemy' && alive(u) && Math.hypot(u.o.position.x - pr.tx, u.o.position.z - pr.tz) < pr.aoe) hurt(u, pr.dmg); }); }
      else if (alive(pr.target)) hurt(pr.target, pr.dmg);
      scene.remove(pr.m); B.proj.splice(i, 1);
    }
  }
  // o Jarl volta
  const h = B.hero;
  if (h.dead && (B.heroDown -= dt) <= 0) {
    const [hx, hz] = hexPos(7, 5); h.dead = false; h.hp = h.max; h.deadT = 0; h.o.position.set(hx, 0, hz + 1.6); if (!h.o.parent) scene.add(h.o);
    anim(h, 'rise'); h.busy = 1.3; burstAt(hx, .5, hz + 1.6, '#f3d27a', 20); B.cmd = null;
  }
  B.skillCd = Math.max(0, B.skillCd - dt);
  // barras
  B.units.forEach(u => { if (!u.on || u.dead) { u.bar.bg.visible = u.bar.fg.visible = false; return; } const p = u.o.position; placeBar(u.bar, p.x, u.barY, p.z, u.hp / u.max, u.kind === 'hero' || u.kind === 'boss' || u.hp < u.max); });
  B.blds.forEach(t => placeBar(t.bar, t.x, (PLOT_H[t.p.type] || 1.5) + .5, t.z, Math.max(0, t.hp) / t.max, t.hp > 0 && t.hp < t.max));
  if (B.mark) { B.mark.material.opacity -= dt * 1.2; B.mark.scale.multiplyScalar(1 + dt * .6); if (B.mark.material.opacity <= 0) { scene.remove(B.mark); B.mark = null; } }
  // fim?
  if (!B.over && !B.queue.some(u => u.side === 'enemy') && !B.units.some(u => u.side === 'enemy' && !u.dead)) { B.endT += dt; if (B.endT > 1.2) endBattle(true); }
  renderBHUD();
}
function renderBHUD() {
  const hall = B.blds.find(t => t.id === 'salao'), h = B.hero;
  $('#bFoes').style.width = (100 - B.killed / B.total * 100) + '%'; $('#bFoesT').textContent = `${B.total - B.killed} draugr restantes`;
  $('#bHall').style.width = Math.max(0, hall.hp / hall.max * 100) + '%';
  $('#bHero').style.width = (h.dead ? 0 : h.hp / h.max * 100) + '%'; $('#bHeroT').textContent = h.dead ? `volta em ${Math.ceil(B.heroDown)}s` : `${Math.ceil(h.hp)} / ${Math.round(h.max)}`;
  const sk = $('#btnSkill'); sk.disabled = B.skillCd > 0 || h.dead; $('#bSkillCd').style.height = (B.skillCd / 8 * 100) + '%';
}
function heroSkill() {
  if (!B || B.over) return; const h = B.hero; if (h.dead || B.skillCd > 0) return;
  let best = null, bd = 9; B.units.forEach(u => { if (u.side === 'enemy' && alive(u)) { const d = dist2(h, u); if (d < bd) { bd = d; best = u; } } });
  if (!best) { toast('Nenhum draugr ao alcance do machado'); Snd.no(); return; }
  B.skillCd = 8; B.cmd = null; h.pend = null; h.busy = .55; const [tx, tz] = posOf(best); h.o.rotation.y = Math.atan2(tx - h.o.position.x, tz - h.o.position.z);
  anim(h, 'shoot', .55);
  setTimeout(() => { if (B && !h.dead) shoot('axe', h.o.position.x, 1, h.o.position.z, best, h.dmg * 4, 'ally', 1.9); }, 300);
}
function moveHero(sx, sy) {
  if (!B || B.over || B.hero.dead) return;
  ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera); ground.constant = 0;
  if (!ray.ray.intersectPlane(ground, hit)) return;
  const x = Math.max(-16, Math.min(17, hit.x)), z = Math.max(-9, Math.min(10, hit.z));
  B.cmd = [x, z]; B.hero.target = null; Snd.tap();
  if (B.mark) scene.remove(B.mark);
  B.mark = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#f3d27a', transparent: true, opacity: 1, depthWrite: false })); B.mark.position.set(x, .06, z); scene.add(B.mark);
}
function endBattle(win) {
  if (!B || B.over) return; B.over = true;
  const w = B.wave, surv = { war: 0, arc: 0, hus: 0 }, lost = { war: 0, arc: 0, hus: 0 };
  B.units.forEach(u => { if (u.side === 'ally' && u.kind !== 'hero') { if (u.dead) lost[u.kind]++; else surv[u.kind]++; } });
  for (const k in surv) S.army[k] = Math.max(0, S.army[k] - lost[k]);
  let rew = null;
  if (win) {
    rew = waveReward(w);
    for (const k in rew) { if (k === 'runes') S.runes += rew[k]; else S.res[k] = Math.min(Math.max(S.res[k], capFor(k)), S.res[k] + rew[k]); }
    S.wave = w + 1; Snd.done();
  } else Snd.lose();
  save(); dirty = true;
  const lostN = lost.war + lost.arc + lost.hus;
  const lostTxt = lostN ? Object.entries(lost).filter(([, n]) => n).map(([k, n]) => `${n} ${(n > 1 ? TROOPS[k].pl : TROOPS[k].name).toLowerCase()}`).join(', ') : 'nenhuma tropa';
  setTimeout(() => {
    cleanupBattle();
    openSheet(win
      ? `<h2>Vitória!</h2><p class="sub">Onda ${w} derrotada${w === MAXWAVE ? ' · o fiorde está salvo!' : ''}</p>
         <p class="desc">Os draugr voltaram para o mar. Perdas: ${lostTxt}.</p>
         <div class="costs">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div>
         <div class="actions"><button class="btn" data-a="home">Voltar à vila</button></div>`
      : `<h2>O Salão caiu…</h2><p class="sub">Onda ${w}</p>
         <p class="desc">A vila se reergue, mas a onda continua lá fora. Perdas: ${lostTxt}. Treine mais tropas, melhore o Ferreiro e as Torres e tente de novo.</p>
         <div class="actions"><button class="btn" data-a="home">Voltar à vila</button></div>`);
  }, 1300);
}
function fleeBattle() { if (!B || B.over) return; B.over = true; const w = B.wave;
  const lost = { war: 0, arc: 0, hus: 0 }; B.units.forEach(u => { if (u.side === 'ally' && u.kind !== 'hero' && u.dead) lost[u.kind]++; });
  for (const k in lost) S.army[k] = Math.max(0, S.army[k] - lost[k]); save(); dirty = true;
  cleanupBattle(); toast(`Você recuou da Onda ${w}`); }
function cleanupBattle() {
  if (!B) return;
  B.units.forEach(u => { scene.remove(u.o); dropBar(u.bar); });
  B.blds.forEach(t => dropBar(t.bar)); B.proj.forEach(p => scene.remove(p.m));
  if (B.ship) scene.remove(B.ship); if (B.mark) scene.remove(B.mark);
  B = null;
  document.body.classList.remove('battle'); $('#bhud').hidden = true;
  folk.forEach(f => f.o.visible = true); refreshGuards(); dirty = true;
}
function openWave() {
  if (B) return; const w = S.wave;
  if (w > MAXWAVE) { openSheet(`<h2>Fiorde salvo!</h2><p class="desc">Você venceu as ${MAXWAVE} ondas de draugr. Skål, Jarl!</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  const list = waveDef(w), cnt = {}; list.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  const towers = PLOTS.filter(p => p.type === 'torre' && S.b[p.id].lvl).length, n = armyCount();
  openSheet(`<h2>Onda ${w}</h2><p class="sub">${w % 10 === 0 ? 'O Rei Draugr vem junto!' : 'Draugr pelo mar e pela floresta'}</p>
    <div class="stat"><span>Inimigos</span><span>${Object.entries(cnt).map(([k, v]) => `${v} ${v > 1 ? FOES[k].pl : FOES[k].name}`).join(' · ')}</span></div>
    <div class="stat"><span>Seu exército</span><span>${n ? Object.entries(S.army).filter(([, v]) => v).map(([k, v]) => `${v} ${v > 1 ? TROOPS[k].pl : TROOPS[k].name}`).join(' · ') : 'só o Jarl'}</span></div>
    <div class="stat"><span>Torres</span><span>${towers}</span></div>
    ${!n ? `<p class="req">${S.b.quartel.lvl ? 'Treine tropas no Quartel antes de lutar.' : 'Construa o Quartel para treinar tropas.'}</p>` : ''}
    <p class="sub" style="margin-top:10px">Recompensa</p><div class="costs">${Object.entries(waveReward(w)).map(([k, v]) => `<div class="cost">${icoSVG(k)}${fmt(v)}</div>`).join('')}</div>
    <p class="desc" style="font-size:14px">Toque no chão para mover o Jarl. O botão Machado arremessa o machado no draugr mais próximo.</p>
    <div class="actions"><button class="btn" data-a="fight">Defender a vila!</button><button class="btn ghost" data-a="close">Agora não</button></div>`);
}
$('#btnSkill').addEventListener('click', heroSkill);
$('#btnFlee').addEventListener('click', () => { Snd.init(); fleeBattle(); });

/* tropas paradas na frente do quartel */
const guards = []; let guardSig = '';
function refreshGuards() {
  if (!G.Barbarian || B) return;
  const kinds = []; ['hus', 'war', 'arc'].forEach(k => { for (let i = 0; i < Math.min(3, S.army[k]); i++) kinds.push(k); });
  const pick = kinds.slice(0, 3), sig = S.b.quartel.lvl ? pick.join() : '';
  if (sig === guardSig) { guards.forEach(g => g.o.visible = true); return; } guardSig = sig;
  guards.splice(0).forEach(g => scene.remove(g.o));
  if (!S.b.quartel.lvl) return;
  const [qx, qz] = hexPos(10, 8);
  pick.forEach((k, i) => { const t = TROOPS[k], c = mkChar(t.model, .3, t.r, t.l); c.o.position.set(qx - .7 + i * .7, 0, qz + 1.05); c.act.idle.time = i * .3; scene.add(c.o); guards.push(c); });
}

/* ---------- laço de render ---------- */
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(100, now - lastT); lastT = now;
  PLOTS.forEach(refreshPlot);
  if (B) stepBattle(dt / 1000); else stepFolk(dt);
  guards.forEach(g => g.mixer.update(dt / 1000));
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
  let html = `<h2>${d.name}</h2><p class="sub">${L ? 'Nível ' + L : 'Terreno livre'}</p><p class="desc">${d.desc}</p>`;
  if (p.type === 'torre' && L) html += `<div class="stat"><span>Dano da flecha</span><span>${towerDmg(L)}${L < MAXLV ? ` <span class="up">→ ${towerDmg(L + 1)}</span>` : ''}</span></div>`;
  if (p.type === 'ferreiro' && L) html += `<div class="stat"><span>Bônus das tropas</span><span>+${L * 10}%${L < MAXLV ? ` <span class="up">→ +${(L + 1) * 10}%</span>` : ''}</span></div>`;
  if (p.type === 'quartel' && L) html += trainHTML();
  if (d.prod && L) html += `<div class="stat"><span>Produção</span><span>${fmt(rateFor(p.type, L))} ${RES_NAME[d.prod].toLowerCase()}/h${L < MAXLV ? ` <span class="up">→ ${fmt(rateFor(p.type, L + 1))}</span>` : ''}</span></div>
      <div class="stat"><span>Guardado aqui</span><span>${fmt(b.buf)} / ${fmt(bufCap(p.type, L))}</span></div>`;
  if (p.type === 'armazem' && L) html += `<div class="stat"><span>Limite de cada recurso</span><span>${fmt(capFor('food'))}</span></div>`;
  if (p.type === 'salao') html += `<div class="stat"><span>Poder da vila</span><span>${fmt(power())}</span></div>`;
  if (b.end) {
    const c = speedCost(p);
    html += `<div class="stat"><span>${L ? 'Melhorando para nível ' + b.to : 'Construindo'}</span><span>${fmtT((b.end - Date.now()) / 1000)}</span></div>
      <div class="actions"><button class="btn rune" data-a="speed">${c ? `Acelerar · ${c} runa${c > 1 ? 's' : ''}` : 'Concluir grátis'}</button><button class="btn ghost" data-a="close">Fechar</button></div>`;
  } else if (L >= MAXLV) {
    html += `<p class="sub">Nível máximo desta etapa.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`;
  } else {
    const c = costFor(p.type, L + 1), req = requirement(p, L + 1), busy = busyBuilders().length >= 2;
    html += `<p class="sub" style="margin-top:10px">${L ? 'Melhorar para nível ' + (L + 1) : 'Construir'} · ${fmtT(timeFor(p.type, L + 1))}</p>${costHTML(c)}
      ${req ? `<p class="req">${req}</p>` : busy ? '<p class="req">Os dois construtores estão ocupados</p>' : !canAfford(c) ? `<p class="req">${missingTxt(c)}</p>` : ''}
      <div class="actions"><button class="btn" data-a="up" ${req || busy || !canAfford(c) ? 'disabled' : ''}>${L ? 'Melhorar' : 'Construir'}</button><button class="btn ghost" data-a="close">Fechar</button></div>`;
  }
  openSheet(html);
}
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const p = plotById(sheetFor);
  if (a.dataset.a === 'close') closeSheet();
  if (a.dataset.a === 'up' && p) upgrade(p);
  if (a.dataset.a === 'speed' && p) speedUp(p);
  if (a.dataset.a === 'train') train(a.dataset.k, +a.dataset.n);
  if (a.dataset.a === 'tspeed') speedTrain();
  if (a.dataset.a === 'fight') { closeSheet(); startBattle(); }
  if (a.dataset.a === 'home') { closeSheet(); }
  if (a.dataset.a === 'claim') { claimMission(); openMissions(); }
});
function trainHTML() {
  const T = S.train, cap = armyCap(), L = S.b.quartel.lvl, f = smithBonus();
  let h = `<div class="stat"><span>Exército</span><span>${armyCount()} / ${cap}${T ? ` <span class="up">+${T.left} treinando</span>` : ''}</span></div>`;
  if (T) h += `<div class="stat"><span>Treinando ${T.left} ${(T.left > 1 ? TROOPS[T.type].pl : TROOPS[T.type].name).toLowerCase()}</span><span>${fmtT(trainLeftS())}</span></div>
    <div class="actions" style="margin-top:4px"><button class="btn rune" data-a="tspeed">${Math.ceil(trainLeftS() / 60) ? `Acelerar treino · ${Math.ceil(trainLeftS() / 60)} runa${Math.ceil(trainLeftS() / 60) > 1 ? 's' : ''}` : 'Concluir treino'}</button></div>`;
  h += '<div class="troops">' + Object.entries(TROOPS).map(([k, t]) => {
    const locked = L < t.need, room = cap - armyCount() - queued(), busy = T && T.type !== k;
    return `<div class="troop${locked ? ' locked' : ''}"><div class="tt"><b>${t.name}</b> <small>×${S.army[k]}</small><p>${t.desc}</p>
      <p class="tstat">Vida ${Math.round(t.hp * f)} · Dano ${Math.round(t.dmg * f)}${t.ranged ? ' · à distância' : ''} · ${t.time}s</p>${costHTML(t.cost)}</div>
      ${locked ? `<p class="req">Quartel nível ${t.need}</p>` : `<div class="tbtns"><button class="btn sm" data-a="train" data-k="${k}" data-n="1" ${room < 1 || busy ? 'disabled' : ''}>+1</button><button class="btn sm" data-a="train" data-k="${k}" data-n="5" ${room < 1 || busy ? 'disabled' : ''}>+5</button></div>`}</div>`;
  }).join('') + '</div>';
  return h;
}
function openMissions() {
  sheetFor = null;
  const m = MISSIONS[S.mission];
  openSheet(`<h2>Missões</h2><p class="sub">Complete para ganhar recursos e runas.</p>
    ${m ? `<div class="stat"><span>${m.t}</span><span>${m.ok() ? '✓' : ''}</span></div><div class="costs">${Object.entries(m.r).map(([k, v]) => `<div class="cost">${icoSVG(k)}${fmt(v)}</div>`).join('')}</div>
    <div class="actions"><button class="btn" data-a="claim" ${m.ok() ? '' : 'disabled'}>Resgatar</button><button class="btn ghost" data-a="close">Fechar</button></div>` : '<p class="desc">Todas as missões foram cumpridas. O fiorde está salvo, Jarl!</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>'}
    <div class="mlist">${MISSIONS.map((x, i) => `<div class="mitem${i < S.mission ? ' done' : i === S.mission ? ' cur' : ''}">${i < S.mission ? '✓' : i + 1}. ${x.t}</div>`).join('')}</div>`);
}
$('#mission').addEventListener('click', () => { Snd.init(); Snd.tap(); const m = MISSIONS[S.mission]; if (m && m.ok()) claimMission(); else openMissions(); });
$('#btnBattle').addEventListener('click', () => { Snd.init(); Snd.tap(); openWave(); });
$('#btnRunes').addEventListener('click', () => { Snd.init(); toast('Runas aceleram obras. Ganhe completando missões.'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }

function renderHUD() {
  $('#res').innerHTML = RES.map(k => { const cap = capFor(k), v = S.res[k]; return `<div class="r${v >= cap ? ' full' : ''}" title="${RES_NAME[k]}">${icoSVG(k)}<span>${fmt(v)}</span></div>`; }).join('');
  $('#runes').textContent = S.runes; $('#hallLv').textContent = S.b.salao.lvl; $('#vilaName').textContent = S.vila; $('#power').textContent = 'Poder ' + fmt(power());
  const m = MISSIONS[S.mission], mb = $('#mission');
  $('#missionText').textContent = m ? m.t : 'Fiorde salvo!';
  $('#btnBattle').innerHTML = S.wave > MAXWAVE ? 'Batalha<small>completa</small>' : `Batalha<small>Onda ${S.wave}</small>`;
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


/* ========== Conta, nuvem e ranking (Supabase) ========== */
const Cloud = {
  sb: null, user: null, busy: false, ready: false, lastPush: 0, status: 'off', rankTab: 'power',
  on() { return !!this.sb; },
  init() {
    const cfg = window.VS_CLOUD || {};
    if (!cfg.url || !cfg.key || !window.supabase) { this.setStatus('off'); return; }
    this.sb = window.supabase.createClient(cfg.url, cfg.key, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
    this.sb.auth.onAuthStateChange((ev, session) => {
      const u = session ? session.user : null, was = this.user && this.user.id;
      this.user = u; if (!u || was !== u.id) this.ready = false;
      if (u && was !== u.id) setTimeout(() => this.linked(ev), 0);
      if (!u) this.setStatus('guest');
    });
  },
  setStatus(s) { this.status = s; const el = $('#cloudDot'); if (el) { el.dataset.s = s; el.title = { off: '', guest: 'Vila só neste aparelho', ok: 'Vila salva na nuvem', sync: 'Salvando…', err: 'Sem conexão com a nuvem' }[s] || ''; } },
  name() { const u = this.user; if (!u) return ''; const m = u.user_metadata || {}; return m.full_name || m.name || (u.email || '').split('@')[0]; },
  // chamada ao entrar: decide entre a vila da nuvem e a deste aparelho
  async linked(ev) {
    this.setStatus('sync');
    const { data, error } = await this.sb.from('saves').select('data,updated_at').eq('user_id', this.user.id).maybeSingle();
    if (error) { this.setStatus('err'); console.warn(error); return; }
    if (!data) { this.ready = true; if (S.jarl === 'Jarl' && this.name()) S.jarl = this.name().slice(0, 18); S.owner = this.user.id; save(); await this.push(true); toast('Vila salva na nuvem!'); return; }
    const R = data.data, mine = S.owner === this.user.id;
    const progress = x => (x.wave || 1) * 1000 + Object.values(x.b || {}).reduce((a, b) => a + (b.lvl || 0), 0);
    if (mine) { // mesma conta: vale a que foi jogada por último
      if ((R.last || 0) > bootLast + 5000) this.adopt(R); else { this.ready = true; await this.push(true); }
      return;
    }
    // vila de convidado neste aparelho + vila já existente na conta
    if (progress(S) <= progress(fresh()) + 1) { this.adopt(R); return; }
    this.choose(R, progress);
  },
  choose(R, progress) {
    const card = (x, t) => `<div class="stat"><span>${t}</span><span>Salão ${x.b && x.b.salao ? x.b.salao.lvl : 1} · Onda ${x.wave || 1}</span></div>`;
    openSheet(`<h2>Qual vila continuar?</h2><p class="sub">Esta conta já tem uma vila salva</p>
      ${card(R, 'Na nuvem: ' + esc(R.vila || 'Vila do Jarl'))}${card(S, 'Neste aparelho: ' + esc(S.vila || 'Vila do Jarl'))}
      <p class="desc" style="font-size:14px">A outra vila será substituída.</p>
      <div class="actions"><button class="btn" data-c="cloud">Da nuvem</button><button class="btn ghost" data-c="local">Deste aparelho</button></div>`);
    sheet.querySelector('[data-c=cloud]').onclick = () => this.adopt(R);
    sheet.querySelector('[data-c=local]').onclick = async () => { closeSheet(); this.ready = true; S.owner = this.user.id; save(); await this.push(true); toast('Vila salva na nuvem!'); };
  },
  adopt(R) {
    if (B) cleanupBattle();
    R.owner = this.user.id; R.last = Math.max(R.last || 0, Date.now() - 1000);
    leaving = true; try { localStorage.setItem(SKEY, JSON.stringify(R)); } catch (e) {}
    location.reload(); // recomeça com a vila da conta
  },
  async push(force) {
    if (!this.sb || !this.user || !this.ready || this.busy) return; // só depois de decidir qual vila vale
    if (leaving || (!force && (!cloudDirty || Date.now() - this.lastPush < 30000))) return;
    this.busy = true; cloudDirty = false; this.setStatus('sync');
    S.owner = this.user.id;
    const now = new Date().toISOString();
    const a = await this.sb.from('saves').upsert({ user_id: this.user.id, data: S, updated_at: now });
    const b = await this.sb.from('profiles').upsert({ id: this.user.id, jarl: S.jarl || 'Jarl', vila: S.vila || 'Vila do Jarl', power: Math.min(200000, power()), best_wave: Math.min(30, S.wave - 1), updated_at: now });
    this.busy = false; this.lastPush = Date.now();
    if (a.error || b.error) { cloudDirty = true; this.setStatus('err'); console.warn(a.error || b.error); } else this.setStatus('ok');
  },
  async google() {
    const { error } = await this.sb.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: location.origin + location.pathname } });
    if (error) toast('Não foi possível abrir o Google');
  },
  async email(addr) {
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(addr)) { toast('E-mail inválido'); Snd.no(); return false; }
    const { error } = await this.sb.auth.signInWithOtp({ email: addr, options: { emailRedirectTo: location.origin + location.pathname } });
    if (error) { toast(/rate|limit/i.test(error.message) ? 'Muitos pedidos, tente em alguns minutos' : 'Não foi possível enviar o e-mail'); return false; }
    return true;
  },
  async logout() {
    await this.push(true);
    await this.sb.auth.signOut(); this.user = null;
    // a vila continua neste aparelho como convidado
    delete S.owner; save(); this.setStatus('guest'); toast('Você saiu da conta');
  }
};
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const cleanName = (t, max) => String(t || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

function openProfile() {
  sheetFor = null;
  const u = Cloud.user, on = Cloud.on();
  let acc;
  if (!on) acc = `<p class="desc" style="font-size:14px">O salvamento na nuvem ainda não foi ativado neste jogo.</p>`;
  else if (u) acc = `<div class="stat"><span>Conta</span><span class="mail">${esc(u.email || Cloud.name())}</span></div>
      <div class="stat"><span>Nuvem</span><span>${{ ok: 'Salva ✓', sync: 'Salvando…', err: 'Sem conexão', guest: '' }[Cloud.status] || ''}</span></div>
      <div class="actions"><button class="btn ghost" data-p="sync">Salvar agora</button><button class="btn ghost" data-p="out">Sair</button></div>`;
  else acc = `<p class="sub" style="margin-top:12px">Salve sua vila na nuvem</p>
      <p class="desc" style="font-size:14px">Entre para não perder o progresso, jogar em outro aparelho e aparecer no ranking.</p>
${(window.VS_CLOUD || {}).google ? `      <button class="btn google" data-p="google"><svg viewBox="0 0 24 24" width="22" height="22"><path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z"/></svg>Entrar com Google</button>
      <div class="or">ou receba um link no e-mail</div>` : '<p class="sub">Receba um link de acesso no e-mail:</p>'}
      <div class="mailrow"><input id="pfMail" type="email" inputmode="email" autocomplete="email" placeholder="seu@email.com"><button class="btn sm" data-p="mail">Enviar</button></div>`;
  openSheet(`<h2>Perfil</h2><p class="sub">Poder ${fmt(power())} · Onda ${S.wave > MAXWAVE ? 'todas vencidas' : S.wave}</p>
    <label class="fld"><span>Nome do Jarl</span><input id="pfJarl" maxlength="18" value="${esc(S.jarl || 'Jarl')}"></label>
    <label class="fld"><span>Nome da vila</span><input id="pfVila" maxlength="24" value="${esc(S.vila || 'Vila do Jarl')}"></label>
    ${acc}
    <div class="actions"><button class="btn" data-p="ok">Pronto</button></div>`);
}
function readNames() {
  if (!$('#pfJarl')) return;
  const j = cleanName($('#pfJarl').value, 18), v = cleanName($('#pfVila').value, 24);
  if (j.length >= 2) S.jarl = j; if (v.length >= 2) S.vila = v;
  save(); dirty = true;
}
sheet.addEventListener('change', e => { if (e.target.id === 'pfJarl' || e.target.id === 'pfVila') readNames(); });
sheet.addEventListener('click', async e => {
  const a = e.target.closest('[data-p]'); if (!a) return;
  const k = a.dataset.p; Snd.tap();
  if (k === 'ok') { readNames(); closeSheet(); Cloud.push(true); }
  if (k === 'google') Cloud.google();
  if (k === 'mail') { const addr = $('#pfMail').value.trim(); a.disabled = true; if (await Cloud.email(addr)) { openSheet(`<h2>Confira seu e-mail</h2><p class="desc">Mandamos um link para <b>${esc(addr)}</b>. Abra-o neste aparelho para entrar. Pode demorar um minuto; olhe também o spam.</p><div class="actions"><button class="btn" data-a="close">Ok</button></div>`); } else a.disabled = false; }
  if (k === 'sync') { await Cloud.push(true); openProfile(); }
  if (k === 'out') { await Cloud.logout(); openProfile(); }
});

async function openRanking(tab) {
  sheetFor = null; Cloud.rankTab = tab || Cloud.rankTab;
  const t = Cloud.rankTab, head = `<h2>Ranking de Jarls</h2><div class="tabs"><button data-r="power" class="${t === 'power' ? 'on' : ''}">Poder</button><button data-r="wave" class="${t === 'wave' ? 'on' : ''}">Ondas</button></div>`;
  if (!Cloud.on()) { openSheet(head + `<p class="desc">O ranking ainda não foi ativado.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  openSheet(head + `<p class="sub">Carregando…</p>`);
  let q = Cloud.sb.from('profiles').select('id,jarl,vila,power,best_wave').limit(10);
  q = t === 'power' ? q.order('power', { ascending: false }) : q.order('best_wave', { ascending: false }).order('power', { ascending: false });
  const { data, error } = await q;
  if (sheet.hidden || !sheet.querySelector('.tabs')) return;
  if (error) { openSheet(head + `<p class="req">Sem conexão com o ranking. Tente de novo.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  const me = Cloud.user && Cloud.user.id;
  const rows = data.map((r, i) => `<div class="rk${r.id === me ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="who"><b>${esc(r.jarl)}</b><small>${esc(r.vila)}</small></span><span class="val">${t === 'power' ? fmt(r.power) : 'Onda ' + r.best_wave}</span></div>`).join('');
  let foot = '';
  if (!me) foot = `<p class="desc" style="font-size:14px;margin-top:10px">Entre na sua conta para aparecer no ranking.</p><div class="actions"><button class="btn" data-x="login">Entrar</button><button class="btn ghost" data-a="close">Fechar</button></div>`;
  else {
    if (!data.some(r => r.id === me)) {
      const mine = t === 'power' ? power() : S.wave - 1;
      const { count } = await Cloud.sb.from('profiles').select('id', { count: 'exact', head: true }).gt(t === 'power' ? 'power' : 'best_wave', mine);
      if (count != null) foot += `<div class="rk me"><span class="pos">${count + 1}</span><span class="who"><b>${esc(S.jarl || 'Jarl')}</b><small>${esc(S.vila || 'Vila do Jarl')}</small></span><span class="val">${t === 'power' ? fmt(power()) : 'Onda ' + mine}</span></div>`;
    }
    foot += `<div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`;
  }
  if (sheet.hidden || !sheet.querySelector('.tabs')) return;
  openSheet(head + `<div class="rklist">${rows || '<p class="desc">Ninguém no ranking ainda. Seja o primeiro!</p>'}</div>` + foot);
}
sheet.addEventListener('click', e => {
  const r = e.target.closest('[data-r]'); if (r) { Snd.tap(); openRanking(r.dataset.r); }
  if (e.target.closest('[data-x=login]')) { Snd.tap(); openProfile(); }
});
$('#btnProfile').addEventListener('click', () => { Snd.init(); Snd.tap(); openProfile(); });
$('#btnRank').addEventListener('click', () => { Snd.init(); Snd.tap(); openRanking(); });
setInterval(() => Cloud.push(), 5000);
document.addEventListener('visibilitychange', () => { if (document.hidden) Cloud.push(true); });
Cloud.init();

/* ========== Laço do jogo ========== */
function tick() {
  finished = []; trainedNow = 0; advance(Date.now());
  if (trainedNow) { dirty = true; refreshGuards(); if (sheetFor === 'quartel' && !sheet.hidden) renderSheet(); }
  finished.forEach(id => { const p = plotById(id); Snd.done(); burst(p, '#f3d27a', 24); toast(`${DEF[p.type].name} chegou ao nível ${S.b[id].lvl}!`); dirty = true; });
  if (finished.length) refreshDecor();
  if (finished.length && sheetFor) renderSheet();
  renderBuilders();
  if (dirty) { renderHUD(); save(); dirty = false; }
}
setInterval(() => { tick(); if (sheetFor && !sheet.hidden && S.b[sheetFor] && (S.b[sheetFor].end || (sheetFor === 'quartel' && S.train))) renderSheet(); }, 1000);
setInterval(() => { dirty = true; }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); dirty = true; } else save(); });


/* ========== Início ========== */
addEventListener('resize', resize);
resize(); renderHUD(); renderBuilders();
loadAll().then(() => {
  buildTerrain(); ship = buildShip();
  for (let i = 0; i < 6; i++) { const c = model(i % 2 ? 'cloud_small' : 'cloud_big', 2.2); c.traverse(m => { if (m.isMesh) m.castShadow = false; }); c.position.set(-35 + i * 13, 15 + (i % 3), -26 + (i % 2) * 6); scene.add(c); clouds.push(c); }
  buildFolk(); buildTags(); refreshDecor(); refreshGuards();
  $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 600);
  renderer.setAnimationLoop(frame);
  if (!S.intro) {
    openSheet(`<h2>Bem-vindo, Jarl!</h2><p class="sub">Sua vila no fiorde</p>
      <p class="desc">Construa e melhore os prédios, colete recursos tocando nas bolhas acima deles e cumpra as missões. Arraste para mover a vila e use dois dedos para aproximar.</p>
      <p class="desc">Os draugr virão pelo mar e pela floresta. Construa o Quartel, treine tropas e toque em <b>Batalha</b> quando estiver pronto.</p>
      <div class="actions"><button class="btn" data-a="close">Começar</button></div>`);
    S.intro = true; save();
  } else if (offlineGain) toast(`Bem-vindo de volta! A vila produziu por ${fmtT(Math.min(offlineGain, 8 * 3600e3) / 1000)}`);
}).catch(err => { $('#loadMsg').textContent = 'Não foi possível carregar os modelos 3D. Verifique a conexão e recarregue.'; console.error(err); });
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
window.__vs = { S, tick, upgrade: id => upgrade(plotById(id)), collect: id => collect(plotById(id)), cam, placeCamera, startBattle, heroSkill, endBattle, get B() { return B; }, sim: sec => { let t = 0; while (t < sec && B && !B.over) { stepBattle(.05); t += .05; } return t; }, train, renderSheet, openBuilding: id => openBuilding(plotById(id)) };
