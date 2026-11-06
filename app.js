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
  ouro: '<path d="M4 15l3-6h10l3 6-8 5z" fill="#f2c94c" stroke="#7a5a10" stroke-width="1.4" stroke-linejoin="round"/><path d="M7 9l5 11 5-11" fill="none" stroke="#fff1b8" stroke-width="1.1"/>',
  rubi: '<path d="M12 3l7 6-7 12-7-12z" fill="#e0314f" stroke="#6e0f22" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 9h14M12 3l-3 6 3 12 3-12z" fill="none" stroke="#ff9db0" stroke-width="1"/>',
  diamante: '<path d="M6 4h12l4 5-10 12L2 9z" fill="#9fe6ff" stroke="#1d6b86" stroke-width="1.4" stroke-linejoin="round"/><path d="M2 9h20M9 4l-2 5 5 12 5-12-2-5" fill="none" stroke="#e8fbff" stroke-width="1"/>',
  meal: '<path d="M4 12h16a8 8 0 0 1-16 0z" fill="#b5803f" stroke="#4a2c0f" stroke-width="1.4"/><circle cx="9" cy="10" r="2.4" fill="#f4f1e6" stroke="#6b5a3a"/><circle cx="14" cy="9" r="2.6" fill="#d8423a" stroke="#6b1a12"/><path d="M17 7l2-3" stroke="#5c8a2e" stroke-width="2" stroke-linecap="round"/>',
  leite: '<path d="M8 3h8v3l2 4v10H6V10l2-4z" fill="#f7f7f2" stroke="#4a5a66" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 13h12" stroke="#7ab0d6" stroke-width="2"/>',
  ovos: '<ellipse cx="9" cy="14" rx="5" ry="6" fill="#f5ead2" stroke="#7a6440" stroke-width="1.4"/><ellipse cx="16" cy="15" rx="4.5" ry="5.5" fill="#e9c99a" stroke="#7a6440" stroke-width="1.4"/>',
  frutas: '<circle cx="12" cy="14" r="7" fill="#d8423a" stroke="#6b1a12" stroke-width="1.4"/><path d="M12 7q1-4 4-4M12 7q-3-2-5 0q2 2 5 0" stroke="#4f7a24" stroke-width="1.6" fill="#7fb34a"/>',
  legumes: '<path d="M6 18L17 6q3 1 2 4L8 20q-3 0-2-2z" fill="#ef8a2b" stroke="#7a3a0a" stroke-width="1.4"/><path d="M17 6l2-3M18 7l3-1M16 5l0-3" stroke="#4f9a2e" stroke-width="1.8" stroke-linecap="round"/>',
  verduras: '<path d="M12 20c-6 0-8-5-7-9 2 2 4 2 5 0-2-3-1-6 2-8 3 2 4 5 2 8 1 2 3 2 5 0 1 4-1 9-7 9z" fill="#7fc04f" stroke="#2f5a16" stroke-width="1.4"/><path d="M12 20V9" stroke="#2f5a16" stroke-width="1.2"/>',
  carne: '<path d="M14 4c4 0 6 3 5 6s-4 5-7 5l-3 3a2 2 0 1 1-3-1l-1-1a2 2 0 1 1 1-3l3-3c0-3 2-6 5-6z" fill="#b5503a" stroke="#4a1a10" stroke-width="1.4"/><path d="M8 16l-2 2" stroke="#f4efe6" stroke-width="2.4" stroke-linecap="round"/><path d="M13 7q3 0 4 3" stroke="#e08a6e" stroke-width="1.3" fill="none"/>',
  couro: '<path d="M5 5q3 2 7 0q4 2 7 0q-1 3 0 6q-2 2 0 5q-3 0-4 3q-3-2-6 0q-1-3-4-3q2-3 0-5q1-3 0-6z" fill="#a8743f" stroke="#4a2c0f" stroke-width="1.4" stroke-linejoin="round"/><path d="M8 9q4 3 8 0M8 14q4 3 8 0" stroke="#d6a26a" stroke-width="1.1" fill="none"/>',
  trofeu: '<path d="M12 20v-6M9 14h6" stroke="#6b4527" stroke-width="2.2" stroke-linecap="round"/><path d="M12 14c-3 0-5-2-6-6M6 8L4 4M6 8l3-3M12 14c3 0 5-2 6-6M18 8l2-4M18 8l-3-3" stroke="#e8d6a8" stroke-width="2" fill="none" stroke-linecap="round"/><circle cx="12" cy="13" r="2.2" fill="#8a5a2c"/>',
  hammer: '<path d="M5 19l8-8" stroke="#b07a3a" stroke-width="3" stroke-linecap="round"/><path d="M11 5l6 6 2-2-6-6z" fill="#aeb7bc" stroke="#2c343a" stroke-width="1.3"/>'
};
document.querySelectorAll('svg[data-ico]').forEach(s => s.innerHTML = ICO[s.dataset.ico]);
const icoSVG = k => `<svg viewBox="0 0 24 24">${ICO[k]}</svg>`;
const RES = ['food', 'wood', 'stone', 'iron'];
const RES_NAME = { food: 'Comida', wood: 'Madeira', stone: 'Pedra', iron: 'Ferro', ouro: 'Ouro', rubi: 'Rubi', diamante: 'Diamante',
  leite: 'Leite', ovos: 'Ovos', carne: 'Carne', couro: 'Couro', trofeu: 'Troféu de alce', frutas: 'Frutas', legumes: 'Legumes', verduras: 'Verduras', runes: 'Runas', meal: 'Refeições' };
const GEMS = ['ouro', 'rubi', 'diamante'], PANTRY = ['leite', 'ovos', 'frutas', 'legumes', 'verduras', 'carne'], TREAS = [...GEMS, 'couro', 'trofeu'];

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
  muralha: { name: 'Muralha', size: 0, time: 25, cost: { wood: 300, stone: 220 }, unlock: 3,
             desc: 'Cerca a vila pela praia e pelas florestas. Os draugr precisam derrubá-la antes de entrar. Até o nível 3 é uma paliçada de troncos; no 4 vira muralha de pedra; no 7 ganha torres de arqueiros.' },
  cabana:  { name: 'Cabana de Caça', size: 2, time: 14, cost: { wood: 180, food: 80 }, unlock: 3,
             desc: 'Os caçadores saem pelo portão leste até a clareira da floresta. Trazem carne para a despensa e couro para as armaduras do Ferreiro. Cuidado com os lobos.' },
  horta:   { name: 'Horta e Pomar', size: 2, time: 12, cost: { wood: 110, food: 60 }, unlock: 2,
             desc: 'Plante frutas, legumes e verduras nos canteiros. Elas crescem à vista e alimentam os trabalhadores. Cada nível libera novas plantas e mais canteiros.' },
  curral:  { name: 'Curral', size: 2, time: 14, cost: { wood: 160, stone: 50 }, unlock: 2,
             desc: 'Galinhas botam ovos, vacas e cabras dão leite. Os cães de guarda ajudam a defender a vila. Cada nível traz mais animais.' },
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
  { id: 'torre2', type: 'torre', c: 2, r: 9 },
  { id: 'horta', type: 'horta', c: 3, r: 7 },
  { id: 'muralha', type: 'muralha', c: 7, r: 10 },
  { id: 'cabana', type: 'cabana', c: 12, r: 4 },
  { id: 'curral', type: 'curral', c: 12, r: 7 }
];
const plotById = id => PLOTS.find(p => p.id === id);
const costFor = (type, L) => {
  const d = DEF[type], f = Math.pow(1.55, L - 1), out = {};
  for (const k in d.cost) out[k] = Math.round(d.cost[k] * f / 5) * 5;
  if (L >= 4 && type !== 'mina') out.iron = Math.round((d.cost.wood || d.cost.food || 60) * .35 * Math.pow(1.5, L - 4) / 5) * 5;
  const m = type === 'salao' ? 2 : 1; // níveis altos pedem ouro e gemas
  if (L === 8) out.ouro = 3 * m;
  if (L === 9) { out.ouro = 5 * m; out.rubi = 1 * m; }
  if (L === 10) { out.rubi = 2 * m; out.diamante = 1 * m; }
  return out;
};
const timeFor = (type, L) => Math.round(DEF[type].time * Math.pow(1.6, L - 1) * (1 - relic('build')));
const rateFor = (type, L) => L > 0 && DEF[type].prod ? DEF[type].rate * Math.pow(1.3, L - 1) * (1 + relic('prod')) : 0; // por hora
const have = k => k === 'runes' ? S.runes : TREAS.includes(k) ? (S.gems[k] || 0) : PANTRY.includes(k) ? (S.pantry[k] || 0) : (S.res[k] || 0);
function spend(c) { for (const k in c) { if (k === 'runes') S.runes -= c[k]; else if (TREAS.includes(k)) S.gems[k] -= c[k]; else if (PANTRY.includes(k)) S.pantry[k] -= c[k]; else S.res[k] -= c[k]; } }
function gain(k, v) { // soma respeitando o limite do armazém
  if (k === 'runes') S.runes += v; else if (TREAS.includes(k)) S.gems[k] = (S.gems[k] || 0) + v;
  else if (PANTRY.includes(k)) S.pantry[k] = Math.min(pantryCap(), (S.pantry[k] || 0) + v);
  else { S.res[k] = Math.min(Math.max(S.res[k], capFor(k)), S.res[k] + v); S.stats[k] = (S.stats[k] || 0) + v; }
}
const pantryCap = () => 60 + 40 * (S.b.armazem.lvl || 0);
/* relíquias do Tesouro do Jarl */
const RELICS = [
  { id: 'anel', name: 'Anel de Ouro', desc: '+10% produção de todos os prédios', cost: { ouro: 10 }, fx: { prod: .1 } },
  { id: 'machado', name: 'Machado de Rubi', desc: '+10% de dano das tropas', cost: { rubi: 5 }, fx: { dmg: .1 } },
  { id: 'coroa', name: 'Coroa de Diamante', desc: 'Obras 10% mais rápidas', cost: { diamante: 3 }, fx: { build: .1 } },
  { id: 'escudo', name: 'Escudo Dourado', desc: '+15% de vida das tropas', cost: { ouro: 20, rubi: 2 }, fx: { hp: .15 } },
  { id: 'trofeu', name: 'Troféu de Alce', desc: '+20% de carne e couro nas caçadas', cost: { trofeu: 1, ouro: 3 }, fx: { hunt: .2 } },
  { id: 'olho', name: 'Olho de Odin', desc: '+25% de chance de achar gemas', cost: { rubi: 5, diamante: 5 }, fx: { gem: .25 } },
  { id: 'elmo', name: 'Elmo do Jarl', desc: '+25% de vida e dano do Jarl', cost: { ouro: 30, diamante: 3 }, fx: { hero: .25 } }
];
const GEM_RUNES = { ouro: 1, rubi: 5, diamante: 15 };
function relic(k) { if (!S || !S.relics) return 0; return RELICS.reduce((a, r) => a + (S.relics[r.id] ? (r.fx[k] || 0) : 0), 0); }
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
const troopHpF = () => smithBonus() * (1 + relic('hp')) * (1 + .05 * (S.armor || 0)), troopDmgF = () => smithBonus() * (1 + relic('dmg'));
const towerDmg = L => Math.round(16 * Math.pow(1.25, L - 1));
const heroStats = () => { const L = S.b.salao.lvl, f = 1 + relic('hero'); return { hp: (450 + 90 * L) * f, dmg: (28 + 6 * L) * f }; };
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
  { t: 'Construa a Horta e Pomar', ok: () => lv('horta') >= 1, r: { wood: 200 } },
  { t: 'Plante e colha na Horta', ok: () => (S.stats.harvest || 0) >= 1, r: { runes: 10 } },
  { t: 'Mande os lenhadores cortar madeira', ok: () => (S.stats.expLenha || 0) >= 1, r: { food: 300 } },
  { t: 'Melhore a Serraria ao nível 2', ok: () => lv('serraria') >= 2, r: { runes: 10 } },
  { t: 'Construa o Armazém', ok: () => lv('armazem') >= 1, r: { stone: 200 } },
  { t: 'Construa a segunda Fazenda', ok: () => lv('faz2') >= 1, r: { wood: 300 } },
  { t: 'Construa o Curral', ok: () => lv('curral') >= 1, r: { stone: 200 } },
  { t: 'Recolha leite e ovos no Curral', ok: () => (S.stats.curral || 0) >= 1, r: { runes: 10 } },
  { t: 'Melhore o Salão do Jarl ao nível 3', ok: () => lv('salao') >= 3, r: { runes: 30 } },
  { t: 'Construa uma Torre de Arqueiros', ok: () => Math.max(lv('torre1'), lv('torre2')) >= 1, r: { stone: 300 } },
  { t: 'Construa a Muralha', ok: () => lv('muralha') >= 1, r: { stone: 400 } },
  { t: 'Construa a Cabana de Caça', ok: () => lv('cabana') >= 1, r: { wood: 300 } },
  { t: 'Mande os caçadores à floresta', ok: () => (S.stats.expCaca || 0) >= 1, r: { runes: 15 } },
  { t: 'Faça uma armadura de couro no Ferreiro', ok: () => (S.armor || 0) >= 1, r: { iron: 200 } },
  { t: 'Mande os mineiros à montanha', ok: () => (S.stats.expMina || 0) >= 1, r: { wood: 300 } },
  { t: 'Encontre uma pedra preciosa', ok: () => !!S.stats.gemFound, r: { runes: 20 } },
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
  { t: 'Forje uma relíquia no Tesouro do Jarl', ok: () => Object.keys(S.relics).length >= 1, r: { runes: 30 } },
  { t: 'Erga a muralha de pedra (nível 4)', ok: () => lv('muralha') >= 4, r: { runes: 30 } },
  { t: 'Derrote o Rei Draugr na Onda 10', ok: () => S.wave > 10, r: { runes: 60 } },
  { t: 'Deixe todos os produtores no nível 5', ok: () => ['faz1', 'faz2', 'serraria', 'pedreira', 'mina'].every(id => lv(id) >= 5), r: { runes: 60 } },
  { t: 'Transforme o Salão no Castelo Viking (nível 7)', ok: () => lv('salao') >= 7, r: { runes: 80 } },
  { t: 'Vença a Onda 20', ok: () => S.wave > 20, r: { runes: 100 } },
  { t: 'Melhore o Salão do Jarl ao nível 10', ok: () => lv('salao') >= 10, r: { runes: 150 } },
  { t: 'Vença a Onda 30 e salve o fiorde', ok: () => S.wave > 30, r: { runes: 300 } }
];
const V2_MISSIONS = ['Colete comida na Fazenda', 'Construa a Pedreira', 'Melhore o Salão do Jarl ao nível 2', 'Construa o Quartel', 'Treine 3 Guerreiros no Quartel', 'Vença a Onda 1', 'Melhore a Serraria ao nível 2', 'Construa o Armazém', 'Construa a segunda Fazenda', 'Melhore o Salão do Jarl ao nível 3', 'Construa uma Torre de Arqueiros', 'Vença a Onda 3', 'Construa a Mina de Ferro', 'Melhore uma Fazenda ao nível 3', 'Colete 500 de ferro', 'Melhore o Salão do Jarl ao nível 4', 'Construa o Ferreiro', 'Melhore o Quartel ao nível 4 (libera Huscarls)', 'Vença a Onda 5', 'Melhore a Serraria ao nível 5', 'Melhore o Armazém ao nível 4', 'Melhore o Salão do Jarl ao nível 5', 'Derrote o Rei Draugr na Onda 10', 'Deixe todos os produtores no nível 5', 'Melhore o Salão do Jarl ao nível 7', 'Vença a Onda 20', 'Melhore o Salão do Jarl ao nível 10', 'Vença a Onda 30 e salve o fiorde'];
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
if (!S.gems) S.gems = { ouro: 0, rubi: 0, diamante: 0 };
TREAS.forEach(k => { if (S.gems[k] === undefined) S.gems[k] = 0; });
if (!S.pantry) S.pantry = { leite: 0, ovos: 0, frutas: 0, legumes: 0, verduras: 0 };
if (!S.exp) S.exp = { lenha: null, mina: null };
if (S.exp.caca === undefined) S.exp.caca = null;
if (S.pantry && S.pantry.carne === undefined) S.pantry.carne = 0;
if (!S.armor) S.armor = 0;
if (!S.fields) S.fields = [null, null, null, null, null];
if (!S.relics) S.relics = {};
if (!S.cur) S.cur = { leite: 0, ovos: 0 };
if (!S.jarl) S.jarl = 'Jarl';
if (!S.vila) S.vila = 'Vila do Jarl';
if (!S.wave) S.wave = 1;
if (S.train === undefined) S.train = null;
if (!S.mdone) S.mdone = (S.mv === 2 ? V2_MISSIONS : OLD_MISSIONS).slice(0, S.mission || 0); // missões já resgatadas (por texto)
S.mv = 3;
const nextMission = () => { const d = new Set(S.mdone); const i = MISSIONS.findIndex(m => !d.has(m.t)); return i < 0 ? MISSIONS.length : i; };
S.mission = nextMission();
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
  chop() { this.noise(.09, .5, 500); this.tone(140, .1, { type: 'square', v: .05, to: 90 }); },
  pick() { this.noise(.05, .3, 3200); this.tone(1800, .08, { type: 'square', v: .03, to: 1500 }); },
  crack() { this.noise(.45, .5, 700); this.tone(70, .5, { type: 'sine', v: .15, to: 40 }); },
  timber() { this.noise(.7, .45, 260); this.tone(55, .7, { type: 'sine', v: .2, to: 30 }); },
  chime() { [784, 988, 1175, 1568, 1976].forEach((f, i) => this.tone(f, .5, { v: .07, delay: i * .09 })); },
  lose() { [392, 330, 262, 196].forEach((f, i) => this.tone(f, .45, { type: 'triangle', v: .09, delay: i * .22 })); }
};

/* ========== Vida na vila: expedições, horta e curral ========== */
const EXP = {
  lenha: { name: 'Lenhadores', one: 'lenhador', plot: 'serraria', spot: [13, 1], rate: 14, title: 'Os lenhadores derrubam um pinheiro!' },
  mina:  { name: 'Mineiros', one: 'mineiro', plot: 'pedreira', spot: [2, 2], rate: 11, title: 'Os mineiros quebram a rocha!' },
  caca:  { name: 'Caçadores', one: 'caçador', plot: 'cabana', spot: [15, 4], rate: 2.5, title: 'Os caçadores cercam o alce!' }
};
const DURS = [{ s: 15, t: '15 s' }, { s: 60, t: '1 min' }, { s: 300, t: '5 min' }, { s: 1800, t: '30 min' }];
const workersMax = k => Math.min(6, 1 + (k === 'lenha' ? S.b.serraria.lvl : k === 'caca' ? S.b.cabana.lvl : S.b.pedreira.lvl));
const mealsFor = (n, s) => Math.max(1, Math.ceil(n * s / 300));
const MEAL_FOOD = 20; // sem despensa, cada refeição sai por 20 de comida
const mealsHave = () => PANTRY.reduce((a, k) => a + Math.floor(S.pantry[k] || 0), 0);
const varietyOk = () => PANTRY.filter(k => (S.pantry[k] || 0) >= 1).length >= 3;
function expYield(k, n, s, fed) {
  const min = s / 60, f = n * (fed ? 1.25 : 1), e = EXP[k]; // base por viagem + por minuto
  if (k === 'lenha') return { wood: Math.round(f * (18 + min * e.rate) * Math.pow(1.25, S.b.serraria.lvl - 1)) };
  if (k === 'caca') { const h = Math.pow(1.2, Math.max(0, S.b.cabana.lvl - 1)) * (1 + relic('hunt')); return { carne: Math.max(1, Math.round(f * (3 + min * e.rate) * h)), couro: Math.max(1, Math.round(f * (1 + min * .8) * h)) }; }
  const out = { stone: Math.round(f * (14 + min * e.rate) * Math.pow(1.25, Math.max(0, S.b.pedreira.lvl - 1))) };
  if (S.b.mina.lvl) out.iron = Math.round(f * (4 + min * 4) * Math.pow(1.25, S.b.mina.lvl - 1));
  return out;
}
const gemChance = () => (1 + .1 * S.b.mina.lvl) * (1 + relic('gem'));
function rollGems(n, s) {
  const wm = n * s / 60, f = gemChance(), out = {};
  [['ouro', .05], ['rubi', .012], ['diamante', .004]].forEach(([g, p]) => { const e = Math.min(wm * p * f, 30); let c = Math.floor(e); if (Math.random() < e - c) c++; if (c) out[g] = c; });
  if (!S.stats.gemFound && !Object.keys(out).length) out.ouro = 1; // a primeira expedição sempre acha ouro
  return out;
}
const CROPS = {
  alface:    { name: 'Alface', m: 'Lettuce', cat: 'verduras', s: 90, q: 6, L: 1, h: .3 },
  cenoura:   { name: 'Cenoura', m: 'Carrot', cat: 'legumes', s: 180, q: 8, L: 1, h: .3 },
  trigo:     { name: 'Trigo', m: 'Wheat', cat: 'food', s: 240, q: 150, L: 1, h: .55 },
  tomate:    { name: 'Tomate', m: 'Tomato', cat: 'legumes', s: 300, q: 10, L: 2, h: .5 },
  amora:     { name: 'Frutas silvestres', m: 'BushBerries', cat: 'frutas', s: 420, q: 10, L: 2, h: .45 },
  beterraba: { name: 'Beterraba', m: 'Beet', cat: 'legumes', s: 480, q: 12, L: 3, h: .3 },
  milho:     { name: 'Milho', m: 'Corn', cat: 'legumes', s: 600, q: 14, L: 3, h: .8 },
  abobora:   { name: 'Abóbora', m: 'Pumpkin', cat: 'legumes', s: 900, q: 18, L: 4, h: .35 },
  maca:      { name: 'Maçã', m: 'Apple', cat: 'frutas', s: 1200, q: 22, L: 5, h: 1.25, tree: true },
  melancia:  { name: 'Melancia', m: 'Watermelon', cat: 'frutas', s: 1500, q: 26, L: 6, h: .3 },
  laranja:   { name: 'Laranja', m: 'Orange', cat: 'frutas', s: 1800, q: 30, L: 7, h: 1.25, tree: true }
};
const fieldsOpen = () => S.b.horta.lvl ? Math.min(5, 1 + Math.floor(S.b.horta.lvl / 2)) : 0;
const cropYield = c => Math.round(CROPS[c].q * (1 + .15 * (S.b.horta.lvl - 1)));
const herd = () => { const L = S.b.curral.lvl; return L ? { galinha: Math.min(6, 1 + L), vaca: Math.min(3, Math.floor(L / 2)), cabra: L >= 3 ? Math.min(3, Math.floor((L - 1) / 3) + 1) : 0, cao: Math.min(3, 1 + Math.floor(L / 4)) } : { galinha: 0, vaca: 0, cabra: 0, cao: 0 }; };
const herdRates = () => { const h = herd(); return { ovos: h.galinha * 5, leite: h.vaca * 4 + h.cabra * 3 }; }; // por hora
const curCap = () => { const r = herdRates(); return { ovos: Math.max(6, r.ovos * 2), leite: Math.max(6, r.leite * 2) }; };

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
  if (S.b.curral.lvl) { const r = herdRates(), c = curCap(); S.cur.ovos = Math.min(c.ovos, S.cur.ovos + r.ovos * dt / 3600e3); S.cur.leite = Math.min(c.leite, S.cur.leite + r.leite * dt / 3600e3); }
  S.last = now;
}
let finished = [], trainedNow = 0;
const bootLast = S.last || 0;
const offlineGain = (() => { const before = JSON.stringify(S.b); const away = Date.now() - S.last; advance(Date.now()); return away > 60e3 ? away : 0; })();

/* ========== Ações ========== */
const busyBuilders = () => PLOTS.filter(p => S.b[p.id].end);
const canAfford = c => Object.entries(c).every(([k, v]) => have(k) >= v);
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
  spend(c);
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
  const f = Object.entries(c).filter(([k, v]) => have(k) < v).map(([k, v]) => `${fmt(v - have(k))} de ${RES_NAME[k].toLowerCase()}`);
  return 'Falta ' + f.join(' e ') + '. Colete nas bolhas dos prédios ou melhore os produtores.';
}
function trainLeftS() { const T = S.train; return T ? Math.max(0, (T.left - 1) * T.per + (T.next - Date.now()) / 1000) : 0; }
function train(type, n) {
  const t = TROOPS[type], room = armyCap() - armyCount() - queued();
  if (S.train && S.train.type !== type) { toast('Espere o treino atual terminar'); Snd.no(); return; }
  n = Math.min(n, room); if (n <= 0) { toast('Exército cheio: melhore o Quartel'); Snd.no(); return; }
  const c = {}; for (const k in t.cost) c[k] = t.cost[k] * n;
  if (!canAfford(c)) { toast('Faltam recursos'); Snd.no(); return; }
  spend(c);
  if (S.train) S.train.left += n; else S.train = { type, left: n, per: t.time, next: Date.now() + t.time * 1000 };
  Snd.build(); save(); dirty = true; renderSheet();
}
function speedTrain() {
  const c = Math.ceil(trainLeftS() / 60); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); return; }
  S.runes -= c; if (S.train) S.train.next = Date.now() - (S.train.left - 1) * S.train.per * 1000; tick(); renderSheet();
}
function claimMission() {
  const m = MISSIONS[S.mission]; if (!m || !m.ok()) return;
  for (const k in m.r) gain(k, m.r[k]);
  S.mdone.push(m.t); S.mission = nextMission(); Snd.done(); toast('Recompensa recebida!'); save(); dirty = true;
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
wall_straight wall_straight_gate axe_1handed axe_2handed sword_1handed shield_round_barbarian shield_round_color bow_withString target`.split(/\s+/);
const CHARS = ['Barbarian', 'Rogue', 'Ranger', 'Knight', 'Rogue_Hooded', 'Skeleton_Minion', 'Skeleton_Warrior', 'Skeleton_Rogue', 'Skeleton_Mage'];
const CHAR_GLTF = ['Skeleton_Axe', 'Skeleton_Blade', 'Skeleton_Shield_Small_A', 'Skeleton_Staff'];
const ANIMS = ['Rig_Medium_MovementBasic', 'Rig_Medium_General'];
function loadAll() {
  const jobs = ENV.map(n => loader.loadAsync(`models/env/${n}.gltf`).then(g => { G[n] = g; }))
    .concat(CHARS.concat(ANIMS).map(n => loader.loadAsync(`models/chars/${n}.glb`).then(g => { G[n] = g; })))
    .concat(CHAR_GLTF.map(n => loader.loadAsync(`models/chars/${n}.gltf`).then(g => { G[n] = g; })))
    .concat(lifeModels().map(([k, u]) => loader.loadAsync(u).then(g => { G[k] = g; })));
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
    else if (t === 'forest' && plotAt.has(key)) { if (rnd() < .5) add(['tree_single_A', 'tree_single_B'][Math.floor(rnd() * 2)], x + (rnd() - .5) * 1.2, z + (rnd() - .5) * 1.2, rot, .8); }
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
const PLOT_H = { cabana: 1.2, muralha: 1.3, horta: .9, curral: 1.1, salao: 4.4, fazenda: 1.4, serraria: 1.6, pedreira: 1.6, mina: 1.7, armazem: 1.6, quartel: 2.2, ferreiro: 1.6, torre: 2.8 };
function put(g, n, x = 0, z = 0, rot = 0, s = 1) { const o = model(n, s); o.position.set(x, 0, z); o.rotation.y = rot; g.add(o); return o; }
function refreshPlot(p) {
  let g = plotGroups[p.id];
  if (!g) { g = plotGroups[p.id] = new THREE.Group(); const [x, z] = hexPos(p.c, p.r); g.position.set(x, 0, z); scene.add(g); }
  const b = S.b[p.id], L = b.lvl, tier = L >= 7 ? 3 : L >= 4 ? 2 : 1;
  const ruined = B && B.bhp[p.id] !== undefined && B.bhp[p.id] <= 0;
  const sig = [L, b.end ? b.to : 0, tier, ruined].join(':');
  if (g.userData.sig === sig) return; g.userData.sig = sig;
  g.clear();
  if (p.type === 'muralha') { if (b.end) put(g, 'building_scaffolding', 0, -.6, 0, .9); return; }
  if (!L) {
    if (b.end) { const total = timeFor(p.type, b.to) * 1000, pr = 1 - (b.end - Date.now()) / total; put(g, pr < .34 ? 'building_stage_A' : pr < .67 ? 'building_stage_B' : 'building_stage_C'); g.userData.sig += ':' + (pr < .34 ? 'a' : pr < .67 ? 'b' : 'c'); }
    else put(g, 'building_dirt');
    return;
  }
  if (ruined) { put(g, 'building_destroyed'); return; }
  switch (p.type) {
    case 'horta': { put(g, 'building_dirt'); const C = CROPS.alface, C2 = CROPS.cenoura; CROP_SPOTS.slice(0, 5).forEach(([dx, dz], k) => { const o = cropModel(k % 2 ? C2 : C, 4); o.position.set(dx * .9, .1, dz * .9); g.add(o); }); if (tier >= 2) put(g, 'wheelbarrow', .75, .55, .8, .7); if (tier >= 3) put(g, 'sack', -.75, .55, 0, .8); break; }
    case 'curral': {
      const R = 1.45, fs = R / 2.06;
      for (let k = 0; k < 6; k++) { if (k === 1) continue; const a = (30 + 60 * k) * Math.PI / 180, f = shadowize(G.Fence.scene.clone(true)); f.scale.set(fs, fs * .85, fs); f.position.set(Math.cos(a) * R * .866, 0, Math.sin(a) * R * .866); f.rotation.y = -a + Math.PI / 2; g.add(f); }
      put(g, 'barrel', -.5, -.55, 0, .7); put(g, 'sack', .55, -.6, .5, .8); if (tier >= 2) { const c = shadowize(G.Crate.scene.clone(true)); c.scale.setScalar(.3 / heightOf(c)); c.position.set(.1, 0, -.85); g.add(c); }
      break; }
    case 'cabana': {
      put(g, 'building_home_A_red', 0, -.1, 0, .85); put(g, 'weaponrack', .72, .5, -.6, .7); put(g, 'barrel', -.75, .55, 0, .6);
      const rack = new THREE.Group(); rack.position.set(-.55, 0, -.55);
      [-.18, .18].forEach(x => rack.add(mesh(new THREE.CylinderGeometry(.03, .03, .55, 5), '#5c3d22', x, .27, 0)));
      rack.add(mesh(new THREE.CylinderGeometry(.025, .025, .45, 5), '#5c3d22', 0, .5, 0)); rack.children[2].rotation.z = Math.PI / 2;
      const hide = mesh(new THREE.BoxGeometry(.32, .3, .02), '#a8743f', 0, .32, .03); rack.add(hide); g.add(rack);
      { const ant = new THREE.Group(); ant.position.set(0, .95, .55); ant.scale.setScalar(tier >= 2 ? 1.5 : 1.1); [-1, 1].forEach(sd => { const b = mesh(new THREE.CylinderGeometry(.015, .02, .3, 4), '#e8d6a8', sd * .1, .12, 0); b.rotation.z = -sd * .6; ant.add(b); const b2 = mesh(new THREE.CylinderGeometry(.012, .015, .15, 4), '#e8d6a8', sd * .2, .22, 0); b2.rotation.z = sd * .3; ant.add(b2); }); g.add(ant); }
      break; }
    case 'quartel': put(g, 'building_barracks_red'); if (tier >= 2) put(g, 'weaponrack', -.65, .55, .4, .8); if (tier >= 3) put(g, 'target', .7, .5, -.5, .7); break;
    case 'ferreiro': put(g, 'building_blacksmith_red'); if (tier >= 2) put(g, 'barrel', .65, .55, 0, .7); break;
    case 'torre': put(g, tier >= 2 ? 'building_tower_B_red' : 'building_tower_A_red'); if (tier >= 3) put(g, 'flag_red', .45, .45, 0, .8); break;
    case 'salao':
      if (tier === 1) { put(g, 'building_castle_red'); break; }
      if (tier === 2) { put(g, 'building_castle_red'); [-.82, .82].forEach(x => { put(g, 'building_tower_A_red', x, .55, 0, .55); put(g, 'flag_red', x, 1.35, 0, 1.4); }); break; }
      { // Castelo Viking
        const c = put(g, 'building_castle_red', 0, -.1, 0, 1.12);
        [[-.95, -.75], [.95, -.75], [-.95, .7], [.95, .7]].forEach(([x, z]) => { put(g, 'building_tower_B_red', x, z, 0, .5); put(g, 'flag_red', x, 1.24, z, 1.6); });
        [[0, -1.02, 0], [-1.02, 0, Math.PI / 2], [1.02, 0, Math.PI / 2]].forEach(([x, z, r]) => { const w = put(g, 'wall_straight', x, z, r, .5); });
        put(g, 'wall_straight_gate', 0, 1.02, 0, .5);
        const shM = [mat('#a8322b'), mat('#d9a441')];
        for (let i = -3; i <= 3; i++) { const sh = new THREE.Mesh(new THREE.CylinderGeometry(.075, .075, .02, 10), shM[(i + 9) % 2]); sh.rotation.x = Math.PI / 2; sh.position.set(i * .22, .32, 1.27); g.add(sh); }
        const head = mesh(new THREE.TorusGeometry(.16, .045, 6, 10, Math.PI * 1.2), '#6b4527', 0, 4.35, .35); head.rotation.set(0, Math.PI / 2, .3); g.add(head);
      }
      break;
    case 'fazenda': put(g, 'building_grain'); if (tier >= 2) put(g, 'building_windmill_red', .45, -.5, 0, .7); if (tier >= 3) { put(g, 'sack', -.6, .5); put(g, 'wheelbarrow', -.3, .7, .6); } break;
    case 'serraria': put(g, 'building_lumbermill_red'); put(g, 'resource_lumber', -.6, .55, .3, .8); if (tier >= 2) { const w = shadowize(G.Wagon.scene.clone(true)); w.scale.setScalar(.42 / heightOf(w)); w.position.set(.75, 0, .45); w.rotation.y = 2.4; g.add(w); } break;
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
    el.querySelector('.bubble').addEventListener('click', e => { e.stopPropagation(); Snd.init(); const k = expOf(p); if (k && S.exp[k] && Date.now() >= S.exp[k].end) finishExp(k); else if (p.type === 'curral') curralCollect(); else collect(p); });
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
    const xk = expOf(p), xe = xk && S.exp[xk], xdone = xe && Date.now() >= xe.end;
    if (xe && !b.end && !xdone) { prog.hidden = false; prog.classList.add('train'); prog.querySelector('i').style.width = Math.min(100, (Date.now() - xe.start) / (xe.s * 1000) * 100) + '%'; prog.querySelector('b').textContent = ({ lenha: '🪓 ', mina: '⛏ ', caca: '🏹 ' })[xk] + fmtT((xe.end - Date.now()) / 1000); }
    const curOk = p.type === 'curral' && L && S.cur.ovos + S.cur.leite >= 3;
    const show = xdone || curOk || (d.prod && L && !b.end && b.buf >= Math.max(20, bufCap(p.type, L) * .08));
    bub.hidden = !show;
    if (show) { const ic = xdone ? 'done' : curOk ? 'ovos' : d.prod; if (bub.dataset.ic !== ic) { bub.dataset.ic = ic; bub.innerHTML = ic === 'done' ? '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#7fc56b" stroke="#2f5a16" stroke-width="1.6"/><path d="M7 12l3.5 3.5L17 9" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>' : icoSVG(ic); }
      bub.classList.toggle('full', !!xdone || (!!d.prod && b.buf >= bufCap(p.type, L) * .98)); }
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
  if (!pointers.has(e.pointerId) || CINE) return; pointers.set(e.pointerId, [e.clientX, e.clientY]);
  if (pinch && pointers.size === 2) { const [a, b] = [...pointers.values()]; cam.d = pinch.cd * pinch.d / Math.max(20, Math.hypot(a[0] - b[0], a[1] - b[1])); placeCamera(); return; }
  if (drag) {
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y; if (Math.abs(dx) + Math.abs(dy) > 6) moved = true;
    if (moved && B) { if (B.cut || B.ending) return; if (B.follow) toggleFollow(); }
    if (moved) { const k = 2 * cam.d * Math.tan(camera.fov * Math.PI / 360) / innerHeight; cam.x = drag.cx - dx * k; cam.z = drag.cz - dy * k / Math.sin(cam.pitch); placeCamera(); }
  }
});
const expOf = p => p.type === 'serraria' ? 'lenha' : p.type === 'pedreira' ? 'mina' : p.type === 'cabana' ? 'caca' : null;
const up = e => {
  pointers.delete(e.pointerId); if (pointers.size < 2) pinch = null;
  if (CINE) { if (pointers.size === 0) drag = null; return; }
  if (drag && !moved && pointers.size === 0 && B) moveHero(e.clientX, e.clientY);
  else if (drag && !moved && pointers.size === 0 && pickField(e.clientX, e.clientY) >= 0) { Snd.tap(); openField(pickField(e.clientX, e.clientY)); }
  else if (drag && !moved && pointers.size === 0) {
    const p = pickPlot(e.clientX, e.clientY);
    if (p) { const b = S.b[p.id]; if (DEF[p.type].prod && b.lvl && !b.end && b.buf >= 1 && collect(p, true)) Snd.collect(); else Snd.tap(); openBuilding(p); }
  }
  if (pointers.size === 0) drag = null;
};
cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
cv.addEventListener('wheel', e => { e.preventDefault(); if (CINE) return; cam.d *= e.deltaY < 0 ? .9 : 1.1; placeCamera(); }, { passive: false });

/* ---------- batalha na vila ---------- */
let B = null; // estado da batalha (null = vila em paz)
const DOG = { name: 'Cão de guarda', model: 'Husky', beast: true, h: .36, hp: 150, dmg: 12, rate: .8, range: .8, speed: 3.2 };
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
const ACTS = { cheer: 'Jump_Full_Short', idle: 'Idle_A', walk: 'Walking_A', run: 'Running_A', atk: 'Use_Item', shoot: 'Throw', hit: 'Hit_A', die: 'Death_A', rise: 'Spawn_Ground' };
const ONCE = ['atk', 'shoot', 'hit', 'die', 'rise', 'cheer'];
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
  const hero = kind === 'hero', D = hero ? HERO : kind === 'dog' ? DOG : side === 'ally' ? TROOPS[kind] : FOES[kind];
  const w = B.wave, scale = D.scale || .3;
  const c = D.beast ? mkBeast(D.model, D.h) : mkChar(D.model, scale, D.r, D.l);
  c.o.position.set(x, 0, z); c.o.visible = false; scene.add(c.o);
  let hp, dmg;
  if (hero) { const h = heroStats(); hp = h.hp; dmg = h.dmg; const ring = new THREE.Mesh(ringGeo, heroRingMat); ring.position.y = .05; ring.scale.setScalar(1 / scale * .3 * 2.6); c.o.add(ring); }
  else if (side === 'ally') { hp = D.hp * troopHpF() * (D.beast ? 1 : 1); dmg = D.dmg * troopDmgF(); }
  else { hp = D.hp * Math.pow(1.08, w - 1); dmg = D.dmg * Math.pow(1.05, w - 1); }
  const u = Object.assign(c, { side, kind, D, hp, max: hp, dmg, rate: D.rate, range: D.range, speed: D.speed, ranged: D.ranged,
    rad: scale / .3 * .3, cd: Math.random() * .5, busy: 0, pend: null, target: null, rt: 0, dead: false, on: false, deadT: 0,
    bar: mkBar(hero ? 'hero' : side, hero ? .9 : kind === 'boss' ? 1.4 : .6), barY: (kind === 'boss' ? 1.55 : hero ? 1.15 : .95) });
  u.bs = c.o.scale.x; if (side === 'ally' && !D.beast) addFace(u);
  B.units.push(u); return u;
}
function activate(u, rise) {
  u.on = true; u.o.visible = true; if (u.face) setFace(u, 'angry');
  if (u.side === 'enemy' && B.walls) u.wside = ['s', 'e', 'w'].find(k => outsideOf(k, u.o.position.x, u.o.position.z)) || null;
  if (u.kind === 'boss') { toast('O Rei Draugr chegou!'); setTimeout(() => bcut(() => [u.o.position.x, .4, u.o.position.z], 2.2, 'O Rei Draugr!', 0), 1500); }
  if (rise) { anim(u, 'rise'); u.busy = 1.3; burstAt(u.o.position.x, .2, u.o.position.z, '#6b5a44', 12, .03); }
}
function hurt(t, d) {
  if (!alive(t) || !B || B.over) return;
  if (t.isW) { wallHurt(t.side, d); return; }
  if (t.isB) {
    t.hp -= d * .6; B.bhp[t.id] = t.hp;
    if (t.hp <= 0) { Snd.crash(); burstAt(t.x, 1, t.z, '#5b4a3a', 26, .07); if (t.id === 'salao') endBattle(false); }
    return;
  }
  t.hp -= d; burstAt(t.o.position.x, .5, t.o.position.z, t.side === 'enemy' ? '#d8d2c0' : '#b02a1e', 4, .025); Snd.hit();
  dmgNum(t.o.position.x, t.barY + .15, t.o.position.z, d, t.side === 'enemy' ? '#fff1c2' : '#ff6a5a', d >= 60); t.sq = .14;
  if (t.hp <= 0) { die(t); return; }
  if (t.face) faceFor(t, 'hurt', .45);
  if (!t.busy && t.kind !== 'boss' && t.kind !== 'hero' && Math.random() < .25) { anim(t, 'hit', .4); t.busy = .35; }
}
function die(u) {
  u.dead = true; u.pend = null; anim(u, 'die'); if (u.face) setFace(u, 'hurt'); u.bar.bg.visible = u.bar.fg.visible = false; Snd.die();
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
  // muralha e quem atira de cima
  const WL = S.b.muralha.lvl;
  B.walls = WL ? Object.fromEntries(['s', 'e', 'w'].map(k => [k, { hp: wallHp(WL), max: wallHp(WL), bar: mkBar('bld', 1.6) }])) : null;
  B.shooters = [];
  B.blds.forEach(t => { if (t.p.type === 'torre') B.shooters.push({ bld: t, x: t.x, y: 2.7, z: t.z, range: 7.5, rate: 1.2, dmg: towerDmg(S.b[t.id].lvl), cd: 1 }); });
  const SL = S.b.salao.lvl, sal = B.blds.find(t => t.id === 'salao');
  if (SL >= 7) sal.hp = sal.max = Math.round(sal.max * 1.3), B.bhp.salao = sal.hp;
  if (SL >= 4) [-.85, .85].concat(SL >= 7 ? [-.95, .95] : []).forEach((dx, i) => B.shooters.push({ bld: sal, x: sal.x + dx, y: 3, z: sal.z + (i > 1 ? -.7 : .6), range: 7.5, rate: 1.1, dmg: towerDmg(SL - 3), cd: .5 + i * .3 }));
  if (WL >= 7) ['e', 'w'].forEach(k => { const [x, z] = wallPt(k, WALL[k].to); B.shooters.push({ x, y: 2.2, z, range: 8, rate: 1, dmg: towerDmg(WL - 4), cd: 1 }); });
  // olhos dos draugr brilham
  ['Skeleton_Minion', 'Skeleton_Warrior', 'Skeleton_Rogue', 'Skeleton_Mage'].forEach(n => G[n].scene.traverse(m => { if (m.isMesh && /Eyes/.test(m.name)) { m.material.emissive = new THREE.Color('#ff3a1a'); m.material.emissiveIntensity = 1.4; } }));
  // herói
  const [hx, hz] = hexPos(7, 5);
  B.hero = mkUnit('ally', 'hero', hx, hz + 1.6); activate(B.hero);
  for (let i = 0; i < herd().cao; i++) { const [px, pz] = penCenter(), u = mkUnit('ally', 'dog', px - .5 + i * .5, pz + 1.2); u.spawnAt = .2 + i * .3; B.queue.push(u); }
  herdObjs.forEach(a => { if (a.kind === 'cao') a.o.visible = false; });
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
  B.follow = true; B.slow = 1; B.oldD = cam.d; cam.d = Math.min(cam.d, 20); cam.x = hx; cam.z = hz + 2.6; placeCamera(); $('#btnCam').classList.add('on');
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
  u.cd = u.rate; u.busy = .5; u.pend = { t: .28, target: t }; if (u.face) faceFor(u, 'shout', .55);
  anim(u, u.ranged ? 'shoot' : 'atk', .55);
}
function stepUnit(u, dt) {
  u.mixer.update(dt); stepFace(u, dt);
  if (u.sq > 0) { u.sq -= dt; const k = 1 + Math.max(0, u.sq) * 1.1; u.o.scale.set(u.bs * k, u.bs / k, u.bs * k); } else if (u.sq !== undefined) { u.o.scale.setScalar(u.bs); u.sq = undefined; }
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
  let t = u.target;
  if (u.side === 'enemy' && t && !t.isW) { const w = wallTarget(u); if (w && !(t.side === 'ally' && outsideOf(u.wside, ...posOf(t)))) t = w; }
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
  L.forEach(u => { const p = u.o.position; if (u.on && u.kind !== 'boss') { p.x = Math.max(-17, Math.min(17.5, p.x)); p.z = Math.max(-9.5, Math.min(11.5, p.z)); }
    const k = u.wside; if (k && B.walls && B.walls[k].hp > 0) { if (k === 's') p.z = Math.max(p.z, WALL.s.v + .45); else if (k === 'e') p.x = Math.max(p.x, WALL.e.v + .45); else p.x = Math.min(p.x, WALL.w.v - .45); } });
}
function stepBattle(dt) {
  if (!B) return;
  camRight.setFromMatrixColumn(camera.matrixWorld, 0);
  if (B.ending) { stepEnding(dt); return; }
  if (B.pendEnd && (B.pendEnd.t -= dt) <= 0) { const e = B.pendEnd; B.pendEnd = null; startEnding(e.win, e.html); return; }
  B.cutCd = Math.max(0, (B.cutCd || 0) - dt);
  if (B.cut) stepCut(dt); else followHero(dt);
  dt *= B.slow || 1;
  B.t += dt;
  stepDmg(dt);
  // drakkar inimigo chega à praia
  if (B.ship) { const k = Math.min(1, B.t / 5); B.ship.position.z = 34 - (34 - 12.6) * (1 - Math.pow(1 - k, 2)); B.ship.position.y = -.15 + Math.sin(B.t * 1.4) * .05; B.ship.rotation.z = Math.sin(B.t) * .03; }
  B.queue = B.queue.filter(u => { if (B.t >= u.spawnAt) { activate(u, u.rise); return false; } return true; });
  B.units.forEach(u => stepUnit(u, dt));
  separate();
  // torres, castelo e torres da muralha atiram
  B.shooters.forEach(t => {
    if (t.bld && t.bld.hp <= 0) return; t.cd -= dt; if (t.cd > 0) return;
    let best = null, bd = t.range; B.units.forEach(u => { if (u.side === 'enemy' && alive(u)) { const d = Math.hypot(u.o.position.x - t.x, u.o.position.z - t.z); if (d < bd) { bd = d; best = u; } } });
    if (best) { t.cd = t.rate; shoot('arrow', t.x, t.y, t.z, best, t.dmg, 'ally'); }
  });
  if (B.walls) Object.entries(B.walls).forEach(([k, w]) => { const [x, z] = wallPt(k, WALL[k].gate); placeBar(w.bar, x, 1.9, z, Math.max(0, w.hp) / w.max, w.hp > 0 && w.hp < w.max); });
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
  faceFor(h, 'shout', 1);
  setTimeout(() => { if (B && !h.dead) { shoot('axe', h.o.position.x, 1, h.o.position.z, best, h.dmg * 4, 'ally', 1.9); bcut(() => best.o ? [best.o.position.x, .4, best.o.position.z] : [tx, .4, tz], 1.3, '', h.o.rotation.y + Math.PI * .75); } }, 300);
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
  B.units.forEach(u => { if (u.side === 'ally' && TROOPS[u.kind]) { if (u.dead) lost[u.kind]++; else surv[u.kind]++; } });
  for (const k in surv) S.army[k] = Math.max(0, S.army[k] - lost[k]);
  let rew = null;
  if (win) {
    rew = waveReward(w);
    for (const k in rew) gain(k, rew[k]);
    S.wave = w + 1; Snd.done();
  } else Snd.lose();
  save(); dirty = true;
  const lostN = lost.war + lost.arc + lost.hus;
  const lostTxt = lostN ? Object.entries(lost).filter(([, n]) => n).map(([k, n]) => `${n} ${(n > 1 ? TROOPS[k].pl : TROOPS[k].name).toLowerCase()}`).join(', ') : 'nenhuma tropa';
  B.pendEnd = { win, t: .7, html: (win
      ? `<h2>Vitória!</h2><p class="sub">Onda ${w} derrotada${w === MAXWAVE ? ' · o fiorde está salvo!' : ''}</p>
         <p class="desc">Os draugr voltaram para o mar. Perdas: ${lostTxt}.</p>
         <div class="costs">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div>
         <div class="actions"><button class="btn" data-a="home">Voltar à vila</button></div>`
      : `<h2>O Salão caiu…</h2><p class="sub">Onda ${w}</p>
         <p class="desc">A vila se reergue, mas a onda continua lá fora. Perdas: ${lostTxt}. Treine mais tropas, melhore o Ferreiro e as Torres e tente de novo.</p>
         <div class="actions"><button class="btn" data-a="home">Voltar à vila</button></div>`) };
  B.units.forEach(u => { if (u.side === 'ally' && u.head) u.hr0 = u.head.rotation.x; });
}
function fleeBattle() { if (!B || B.over) return; B.over = true; const w = B.wave;
  const lost = { war: 0, arc: 0, hus: 0 }; B.units.forEach(u => { if (u.side === 'ally' && TROOPS[u.kind] && u.dead) lost[u.kind]++; });
  for (const k in lost) S.army[k] = Math.max(0, S.army[k] - lost[k]); save(); dirty = true;
  cleanupBattle(); toast(`Você recuou da Onda ${w}`); }
function cleanupBattle() {
  if (!B) return;
  B.units.forEach(u => { scene.remove(u.o); dropBar(u.bar); }); clearDmg();
  if (B.walls) Object.values(B.walls).forEach(w => dropBar(w.bar));
  if (B.oldD) cam.d = B.oldD; document.body.classList.remove('cine'); $('#cine').hidden = true;
  B.blds.forEach(t => dropBar(t.bar)); B.proj.forEach(p => scene.remove(p.m));
  if (B.ship) scene.remove(B.ship); if (B.mark) scene.remove(B.mark);
  B = null;
  document.body.classList.remove('battle'); $('#bhud').hidden = true;
  folk.forEach(f => f.o.visible = true); herdObjs.forEach(a => a.o.visible = true); refreshGuards(); dirty = true; placeCamera();
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

/* ---------- vida na vila: plantações, animais, trabalhadores e cenas ---------- */
const FIELDS = [[3, 8], [2, 7], [3, 6], [2, 8], [4, 8]];
const PEN_EXTRA = [[12, 6], [13, 6], [11, 7], [13, 7], [12, 8], [11, 6]];
FIELDS.concat(PEN_EXTRA, [EXP.lenha.spot, EXP.mina.spot, [12, 1], [3, 2]]).forEach(([c, r]) => plotAt.add(c + ',' + r));
function lifeModels() { // [chave, url]
  const L = [['Cow', 'models/farm/Cow.glb'], ['Husky', 'models/farm/Husky.glb'], ['Fence', 'models/farm/Prop_WoodenFence_Single.glb'],
    ['Wagon', 'models/farm/Prop_Wagon.glb'], ['Crate', 'models/farm/Prop_Crate.glb'], ['Deer', 'models/farm/Deer.glb'], ['Stag', 'models/farm/Stag.glb'], ['Fox', 'models/farm/Fox.glb'], ['Wolf', 'models/farm/Wolf.glb']];
  Object.values(CROPS).forEach(C => { ['1', '2', '3', '4', 'Crop'].forEach(s => L.push([C.m + '_' + s, `models/crops/${C.m}_${s}.glb`])); });
  return L;
}
const _box = new THREE.Box3();
const heightOf = o => { o.updateMatrixWorld(true); _box.setFromObject(o); return Math.max(.001, _box.max.y - _box.min.y); };
const matC = {}; const mat = c => matC[c] || (matC[c] = new THREE.MeshStandardMaterial({ color: c, roughness: .85 }));
const mesh = (geo, c, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat(c)); m.position.set(x, y, z); m.castShadow = true; return m; };

/* plantações */
const stageOf = (f, now) => { const p = (now - f.start) / (f.end - f.start); return p >= 1 ? 4 : Math.min(3, 1 + Math.floor(p * 3)); }; // 4 = maduro
const _cs = {};
function cropScale(C) { if (!_cs[C.m]) _cs[C.m] = C.h / heightOf(G[C.m + '_4'].scene); return _cs[C.m]; }
function cropModel(C, stg) { const o = shadowize(G[C.m + '_' + stg].scene.clone(true)); o.scale.setScalar(cropScale(C)); return o; }
function produceModel(C, h = .14) { const o = shadowize(G[C.m + '_Crop'].scene.clone(true)); o.scale.setScalar(h / heightOf(o)); return o; }
const CROP_SPOTS = [[-.42, -.32], [.42, -.32], [-.42, .34], [.42, .34], [0, 0], [0, -.62], [0, .64]];
const fieldG = [];
function refreshFields(now) {
  const open = fieldsOpen();
  FIELDS.forEach(([c, r], i) => {
    let g = fieldG[i]; if (!g) { g = fieldG[i] = new THREE.Group(); const [x, z] = hexPos(c, r); g.position.set(x, 0, z); scene.add(g); }
    if (g.userData.lock) return;
    const f = S.fields[i], stg = f ? stageOf(f, now) : 0, sig = i < open ? (f ? f.c + ':' + stg : 'vazio') : 'x';
    if (g.userData.sig === sig) return; g.userData.sig = sig; g.clear(); g.userData.crops = [];
    if (i >= open) return;
    put(g, 'building_dirt');
    if (!f) return;
    const C = CROPS[f.c];
    (C.tree ? [[0, 0]] : CROP_SPOTS).forEach(([dx, dz], k) => { const o = cropModel(C, stg); o.position.set(dx, .1, dz); o.rotation.y = k * 1.7; g.add(o); g.userData.crops.push(o); });
  });
}

/* animais */
function mkBeast(model, h) {
  const o = SkeletonUtils.clone(G[model].scene); o.traverse(m => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
  o.scale.setScalar(h / heightOf(o));
  const mixer = new THREE.AnimationMixer(o), clips = {}; G[model].animations.forEach(a => clips[a.name] = a);
  const pick = (...n) => clips[n.find(x => clips[x])];
  const act = {}, map = { idle: ['Idle', 'Idle_2'], walk: ['Walk'], run: ['Gallop', 'Walk'], atk: ['Attack', 'Attack_Headbutt'], shoot: ['Attack', 'Attack_Headbutt'],
    hit: ['Idle_HitReact1', 'Idle'], die: ['Death'], rise: ['Idle'], eat: ['Eating', 'Idle'] };
  for (const k in map) { act[k] = mixer.clipAction(pick(...map[k])); if (['atk', 'shoot', 'hit', 'die'].includes(k)) { act[k].setLoop(THREE.LoopOnce); act[k].clampWhenFinished = true; } }
  act.idle.play();
  return { o, mixer, act, cur: 'idle' };
}
function mkChicken() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const b = mesh(new THREE.SphereGeometry(.075, 10, 8), '#f4f1e6', 0, .1, 0); b.scale.set(.9, .85, 1.2); body.add(b);
  const tail = mesh(new THREE.ConeGeometry(.04, .08, 6), '#f4f1e6', 0, .14, -.08); tail.rotation.x = -.8; body.add(tail);
  const head = new THREE.Group(); head.position.set(0, .16, .07); body.add(head);
  head.add(mesh(new THREE.SphereGeometry(.042, 8, 6), '#f4f1e6'));
  const beak = mesh(new THREE.ConeGeometry(.014, .04, 5), '#e9a826', 0, -.005, .05); beak.rotation.x = Math.PI / 2; head.add(beak);
  head.add(mesh(new THREE.BoxGeometry(.012, .035, .045), '#d0302a', 0, .045, .005));
  head.add(mesh(new THREE.BoxGeometry(.012, .025, .015), '#d0302a', 0, -.035, .035));
  const legs = [-.03, .03].map(x => { const l = mesh(new THREE.CylinderGeometry(.007, .007, .07, 4), '#e9a826', x, .035, 0); g.add(l); return l; });
  return { o: g, legs, head, body, proc: true, h: 'chicken' };
}
function mkGoat() {
  const g = new THREE.Group(), body = new THREE.Group(); g.add(body);
  const col = Math.random() < .5 ? '#ece6da' : '#9a7650', dark = '#3a2c20';
  body.add(mesh(new THREE.BoxGeometry(.15, .13, .28), col, 0, .2, 0));
  const head = new THREE.Group(); head.position.set(0, .29, .15); body.add(head);
  head.add(mesh(new THREE.BoxGeometry(.08, .09, .12), col, 0, 0, .03));
  [-.025, .025].forEach(x => { const h = mesh(new THREE.ConeGeometry(.012, .09, 5), dark, x, .07, -.01); h.rotation.x = -.6; head.add(h); });
  head.add(mesh(new THREE.BoxGeometry(.03, .05, .02), '#d8d0c0', 0, -.06, .07));
  [-.06, .06].forEach(x => { const e = mesh(new THREE.BoxGeometry(.05, .015, .025), col, x, .02, 0); e.rotation.z = x > 0 ? -.4 : .4; head.add(e); });
  const tail = mesh(new THREE.BoxGeometry(.03, .05, .02), col, 0, .27, -.15); tail.rotation.x = -.5; body.add(tail);
  const legs = [[-.05, .1], [.05, .1], [-.05, -.1], [.05, -.1]].map(([x, z]) => { const l = mesh(new THREE.BoxGeometry(.03, .14, .03), col, x, .07, z); g.add(l); return l; });
  return { o: g, legs, head, body, proc: true, h: 'goat' };
}
const herdObjs = []; let herdSig = '';
function penCenter() { return hexPos(12, 7); }
function refreshHerd() {
  const h = herd(), sig = JSON.stringify(h); if (sig === herdSig || !G.Cow) return; herdSig = sig;
  herdObjs.splice(0).forEach(a => scene.remove(a.o));
  const [cx, cz] = penCenter();
  const add = (a, kind, sp, free) => { const ang = Math.random() * TAU, r = Math.random() * .7; a.o.position.set(cx + Math.cos(ang) * r, 0, cz + Math.sin(ang) * r); a.o.rotation.y = Math.random() * TAU; scene.add(a.o); herdObjs.push(Object.assign(a, { kind, sp, free, tx: a.o.position.x, tz: a.o.position.z, wait: Math.random() * 3, t: Math.random() * 10 })); };
  for (let i = 0; i < h.vaca; i++) add(mkBeast('Cow', .5), 'vaca', .18);
  for (let i = 0; i < h.cabra; i++) add(mkGoat(), 'cabra', .3);
  for (let i = 0; i < h.galinha; i++) add(mkChicken(), 'galinha', .32);
  for (let i = 0; i < h.cao; i++) add(mkBeast('Husky', .34), 'cao', .7, true);
}
function stepHerd(dt) {
  const [cx, cz] = penCenter();
  herdObjs.forEach(a => {
    a.t += dt; if (a.mixer) a.mixer.update(dt);
    const p = a.o.position, dx = a.tx - p.x, dz = a.tz - p.z, d = Math.hypot(dx, dz);
    const moving = a.wait <= 0 && d > .03;
    if (a.wait > 0) a.wait -= dt;
    else if (d <= .03) {
      a.wait = 1 + Math.random() * 4;
      if (a.free) { const [sx, sz] = hexPos(7 + Math.floor(Math.random() * 6), 4 + Math.floor(Math.random() * 5)); a.tx = sx + (Math.random() - .5); a.tz = sz + 1; }
      else { const ang = Math.random() * TAU, r = Math.random() * (a.kind === 'vaca' ? .55 : .85); a.tx = cx + Math.cos(ang) * r; a.tz = cz + Math.sin(ang) * r; }
      if (a.act) { const k = a.kind === 'vaca' && Math.random() < .6 ? 'eat' : 'idle'; a.act[a.cur].fadeOut(.3); a.act[k].reset().fadeIn(.3).play(); a.cur = k; }
    } else {
      const st = Math.min(d, a.sp * dt); p.x += dx / d * st; p.z += dz / d * st; a.o.rotation.y = Math.atan2(dx, dz);
      if (a.act && a.cur !== 'walk') { a.act[a.cur].fadeOut(.25); a.act.walk.reset().fadeIn(.25).play(); a.cur = 'walk'; }
    }
    if (a.proc) { // animação feita no código
      const w = moving ? Math.sin(a.t * (a.h === 'chicken' ? 22 : 12)) : 0;
      a.legs.forEach((l, i) => l.rotation.x = w * .6 * (i % 2 ? 1 : -1) * (a.h === 'goat' && i > 1 ? -1 : 1));
      a.body.position.y = moving ? Math.abs(w) * .012 : 0;
      a.head.rotation.x = !moving && a.h === 'chicken' ? Math.max(0, Math.sin(a.t * 5)) * 1.1 : !moving ? Math.max(0, Math.sin(a.t * 1.3)) * .6 : 0;
    }
  });
}

/* pilhas no armazém e baú de ouro */
const piles = new THREE.Group(); let pileSig = '';
function refreshPiles() {
  if (!G.resource_lumber) return;
  const n = k => S.b.armazem.lvl ? Math.max(0, Math.min(3, Math.ceil(S.res[k] / capFor(k) * 3))) : 0;
  const gems = GEMS.reduce((a, k) => a + S.gems[k], 0);
  const sig = [n('wood'), n('stone'), gems > 0].join(); if (sig === pileSig) return; pileSig = sig;
  piles.clear(); if (!piles.parent) scene.add(piles);
  const [x, z] = hexPos(11, 6);
  for (let i = 0; i < n('wood'); i++) { const o = model('resource_lumber', .9); o.position.set(x - .45 + i * .02, i * .22, z - .3); o.rotation.y = .3 + i * .2; piles.add(o); }
  for (let i = 0; i < n('stone'); i++) { const o = model('resource_stone', .85); o.position.set(x + .45, i * .18, z + .25); o.rotation.y = i; piles.add(o); }
  if (gems) { const [hx, hz] = hexPos(7, 5); const c = shadowize(G.Crate.scene.clone(true)); c.scale.setScalar(.32 / heightOf(c)); c.position.set(hx - 1.15, 0, hz + .85); piles.add(c);
    for (let i = 0; i < 5; i++) { const g = new THREE.Mesh(new THREE.OctahedronGeometry(.05), new THREE.MeshStandardMaterial({ color: '#f2c94c', emissive: '#6b4a00', metalness: .6, roughness: .3 })); g.position.set(hx - 1.15 + (Math.random() - .5) * .18, .34, hz + .85 + (Math.random() - .5) * .18); piles.add(g); } }
}

/* árvore e rocha de trabalho (usadas nas cenas) */
let workTree = null, workRock = null, workStump = null, workLog = null;
const stumpGeo = new THREE.CylinderGeometry(.09, .12, .16, 8), trunkGeo = new THREE.CylinderGeometry(.07, .09, 1, 8);
const mkStump = s => { const m = mesh(stumpGeo, '#6b4a2b'); m.scale.setScalar(s); m.position.y = .08 * s; const top = mesh(new THREE.CylinderGeometry(.085, .085, .01, 8), '#d6b07a', 0, .081, 0); m.add(top); return m; };
const mkTrunk = (len, r = 1) => { const m = mesh(trunkGeo, '#7a5230'); m.scale.set(r, len, r); m.rotation.z = Math.PI / 2; m.position.y = .09 * r; return m; };
function buildWorkSpots() {
  const [tx, tz] = hexPos(...EXP.lenha.spot);
  workTree = new THREE.Group(); workTree.position.set(tx, 0, tz); const t = model('tree_single_A', 1.6); workTree.add(t); scene.add(workTree); workTree.userData.grow = 1;
  workStump = mkStump(1.6); workStump.position.set(tx, workStump.position.y, tz); workStump.visible = false; scene.add(workStump);
  workLog = new THREE.Group(); workLog.position.set(tx, 0, tz - .2); const tr = mkTrunk(1.5, 1.4); tr.rotation.set(Math.PI / 2, 0, 0); tr.position.set(0, .12, -.75); workLog.add(tr); workLog.visible = false; scene.add(workLog);
  const [rx, rz] = hexPos(...EXP.mina.spot);
  workRock = new THREE.Group(); workRock.position.set(rx, 0, rz); const r = model('rock_single_A', 2.4); workRock.add(r); scene.add(workRock); workRock.userData.grow = 1;
  [workTree, workRock].forEach(o => o.userData.base = o.children[0].scale.x);
}
function regrow(dt) {
  [workTree, workRock].forEach(o => {
    if (!o || o.userData.grow >= 1 || CINE) return;
    o.userData.grow = Math.min(1, o.userData.grow + dt / 3); const s = o.userData.grow;
    o.visible = s > 0; if (s > 0) o.children[0].scale.setScalar(o.userData.base * (.15 + .85 * s));
    if (o === workTree) { workStump.visible = s < .4; workLog.visible = s < 0; }
  });
}

/* picareta feita no código */
function mkPickaxe() {
  const g = new THREE.Group();
  g.add(mesh(new THREE.CylinderGeometry(.035, .04, .95, 6), '#7a5230', 0, .3, 0));
  const head = mesh(new THREE.BoxGeometry(.75, .09, .09), '#8e979c', 0, .74, 0); g.add(head);
  [-1, 1].forEach(s => { const tip = mesh(new THREE.ConeGeometry(.05, .2, 4), '#8e979c', s * .45, .7, 0); tip.rotation.z = s * -Math.PI / 2 - s * .25; g.add(tip); });
  return g;
}

/* equipes das expedições: cada um com sua árvore ou rocha e sua pilha */
const crews = { lenha: [], mina: [] };
const crewAng = (i, n) => (i / Math.max(1, n)) * TAU + .9;
function crewPos(k, i, n) { const [x, z] = hexPos(...EXP[k].spot), a = crewAng(i, n), r = k === 'lenha' ? .95 : 1.05; return [x + Math.cos(a) * r, z + Math.sin(a) * r]; }
function mkWorker(k) {
  const c = k === 'lenha' ? mkChar('Barbarian', .3, 'axe_1handed') : mkChar('Knight', .3);
  if (k === 'mina') { const b = findNode(c.o, SLOT.r); if (b) b.add(mkPickaxe()); }
  c.o.traverse(m => { if (m.isMesh) m.castShadow = true; });
  return c;
}
const HITS = { lenha: 4, mina: 5 };
function setupJob(k, c, n, pre) { // árvore/rocha na frente do trabalhador e pilha ao lado
  const [sx, sz] = hexPos(...EXP[k].spot), a = crewAng(c.i, n), wx = sx + Math.cos(a) * (k === 'lenha' ? .95 : 1.05), wz = sz + Math.sin(a) * (k === 'lenha' ? .95 : 1.05);
  const fx = Math.cos(a), fz = Math.sin(a), px = -fz, pz = fx; // frente (para fora) e lado
  c.face = Math.atan2(fx, fz);
  c.jobPos = [wx + fx * .45, wz + fz * .45]; c.pilePos = [wx + px * .45 - fx * .1, wz + pz * .45 - fz * .1]; c.fallDir = [px, pz];
  c.job = new THREE.Group(); c.job.position.set(c.jobPos[0], 0, c.jobPos[1]); scene.add(c.job);
  c.pile = new THREE.Group(); c.pile.position.set(c.pilePos[0], 0, c.pilePos[1]); c.pile.rotation.y = c.face; scene.add(c.pile);
  c.cut = 0; c.hits = 0; c.state = 'work'; c.t = 0;
  newTarget(k, c);
  for (let i = 0; i < pre; i++) addToPile(k, c);
}
function newTarget(k, c) {
  c.job.clear(); c.job.rotation.set(0, 0, 0); c.hits = 0;
  if (k === 'lenha') { const t = model(Math.random() < .5 ? 'tree_single_A' : 'tree_single_B', 1.05); t.rotation.y = Math.random() * TAU; c.job.add(t); c.target = t; c.job.userData.grow = 0; t.scale.setScalar(.01); }
  else { const r = model(['rock_single_A', 'rock_single_C', 'rock_single_E'][Math.floor(Math.random() * 3)], 3.4); r.rotation.y = Math.random() * TAU; c.job.add(r); c.target = r; c.job.userData.base = r.scale.x; c.job.userData.grow = 0; r.scale.setScalar(.01); }
}
function addToPile(k, c) {
  const n = c.pile.children.length; if (n >= 7) return;
  if (k === 'lenha') { const row = n < 4 ? 0 : 1, i = row ? n - 4 : n; const l = mkTrunk(.42, .95); l.rotation.set(0, 0, Math.PI / 2); l.rotation.y = Math.PI / 2; l.position.set((i - (row ? 1 : 1.5)) * .15, .085 + row * .14, 0); c.pile.add(l); }
  else { const s = mesh(new THREE.DodecahedronGeometry(.075 + Math.random() * .04), Math.random() < .2 ? '#7c8a96' : '#9aa3a8'); const ring = n < 4 ? 0 : 1; s.position.set((Math.random() - .5) * .26, .07 + ring * .09, (Math.random() - .5) * .26); s.rotation.set(Math.random(), Math.random(), 0); c.pile.add(s); }
}
function dropCrew(c) { scene.remove(c.o); if (c.job) scene.remove(c.job); if (c.pile) scene.remove(c.pile); if (c.stump) scene.remove(c.stump); if (c.log) scene.remove(c.log); }
function refreshCrews(now) {
  ['lenha', 'mina'].forEach(k => {
    const e = S.exp[k], want = e ? Math.min(4, e.n) : 0, list = crews[k];
    if (CINE && CINE.kind === k) return;
    while (list.length > want) dropCrew(list.pop());
    while (list.length < want) {
      const c = mkWorker(k), p = plotById(EXP[k].plot), [hx, hz] = hexPos(p.c, p.r), i = list.length;
      const fresh = now - e.start < 6000; // recém-saídos vêm andando do prédio
      const [px, pz] = crewPos(k, i, want);
      c.o.position.set(fresh ? hx + (Math.random() - .5) * .5 : px, 0, fresh ? hz + 1 : pz);
      Object.assign(c, { i, swing: Math.random() * .4, chip: 0 }); scene.add(c.o); list.push(c);
      const pr = Math.min(1, (now - e.start) / (e.s * 1000));
      setupJob(k, c, want, fresh ? 0 : Math.round(pr * 5));
    }
  });
}
function stepCrews(dt, now) {
  ['lenha', 'mina'].forEach(k => {
    if (CINE && CINE.kind === k) return;
    const e = S.exp[k]; if (!e) return; const done = now >= e.end, list = crews[k];
    list.forEach(c => {
      c.mixer.update(dt);
      // árvore/rocha nova crescendo
      if (c.job.userData.grow < 1) { c.job.userData.grow = Math.min(1, c.job.userData.grow + dt / .8); const g = c.job.userData.grow; c.target.scale.setScalar((k === 'lenha' ? 1.05 : c.job.userData.base) * Math.max(.01, g)); if (g >= 1 && c.stump) { scene.remove(c.stump); c.stump = null; } }
      const [px, pz] = crewPos(k, c.i, list.length), p = c.o.position, dx = px - p.x, dz = pz - p.z, d = Math.hypot(dx, dz);
      if (d > .05) { const st = Math.min(d, 2.2 * dt); p.x += dx / d * st; p.z += dz / d * st; c.o.rotation.y = Math.atan2(dx, dz); anim(c, 'run'); return; }
      c.o.rotation.y = c.face;
      if (c.state === 'fall') { // a árvore cai e vira tronco deitado
        c.t += dt; const kk = Math.min(1, c.t / .8);
        c.job.rotation.x = c.fallDir[1] * Math.pow(kk, 2.2) * 1.5; c.job.rotation.z = -c.fallDir[0] * Math.pow(kk, 2.2) * 1.5;
        if (kk >= 1) {
          Snd.tone(70, .2, { type: 'sine', v: .06, to: 40 }); burstAt(c.jobPos[0] + c.fallDir[0] * .7, .1, c.jobPos[1] + c.fallDir[1] * .7, '#a08a66', 10, .03);
          c.job.clear(); c.job.rotation.set(0, 0, 0);
          c.stump = mkStump(.8); c.stump.position.set(c.jobPos[0], c.stump.position.y, c.jobPos[1]); scene.add(c.stump);
          c.log = mkTrunk(.9, 1); c.log.rotation.set(0, Math.atan2(c.fallDir[0], c.fallDir[1]), 0); c.log.rotateX(Math.PI / 2); c.log.position.set(c.jobPos[0] + c.fallDir[0] * .45, .07, c.jobPos[1] + c.fallDir[1] * .45); scene.add(c.log);
          c.state = 'log'; c.t = 0;
        }
        return;
      }
      if (c.state === 'log') { // o tronco é cortado em toras para a pilha
        c.t += dt; anim(c, 'idle');
        if (c.t > 1.4) { scene.remove(c.log); c.log = null; addToPile(k, c); Snd.tone(300, .08, { type: 'square', v: .03 }); c.state = 'work'; if (!done) newTarget(k, c); }
        return;
      }
      if (done) { anim(c, 'idle'); return; }
      if (c.job.userData.grow < 1) { anim(c, 'idle'); return; }
      if ((c.swing -= dt) <= 0) { c.swing = .85 + Math.random() * .2; anim(c, 'atk', .55); c.chip = .28; }
      if (c.chip > 0 && (c.chip -= dt) <= 0) {
        c.hits++; const [jx, jz] = c.jobPos;
        if (k === 'lenha') {
          Snd.chop(); burstAt(jx, .3, jz, '#d6b07a', 5, .03); c.target.rotation.z = c.hits % 2 ? .05 : -.05;
          if (c.hits >= HITS.lenha) { c.state = 'fall'; c.t = 0; Snd.timber(); }
        } else {
          Snd.pick(); burstAt(jx, .3, jz, '#ffd27a', 4, .035); burstAt(jx, .25, jz, '#9aa3a8', 3, .03);
          addToPile(k, c); const left = 1 - c.hits / HITS.mina; c.target.scale.setScalar(c.job.userData.base * Math.max(.15, left));
          if (c.hits >= HITS.mina) { Snd.crack(); burstAt(jx, .15, jz, '#8e979c', 12, .05); newTarget(k, c); }
        }
      }
    });
  });
}

/* ---------- cenas de cinema ---------- */
let CINE = null;
const _cp = new THREE.Vector3(), _cl = new THREE.Vector3(), _lk = new THREE.Vector3();
const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
function camAt(keys, t) {
  let i = 0; while (i < keys.length - 2 && t > keys[i + 1].t) i++;
  const a = keys[i], b = keys[i + 1], k = ease(Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))));
  _cp.set(a.p[0] + (b.p[0] - a.p[0]) * k, a.p[1] + (b.p[1] - a.p[1]) * k, a.p[2] + (b.p[2] - a.p[2]) * k);
  _lk.set(a.l[0] + (b.l[0] - a.l[0]) * k, a.l[1] + (b.l[1] - a.l[1]) * k, a.l[2] + (b.l[2] - a.l[2]) * k);
}
function startCine(c) {
  if (CINE || B) return;
  closeSheet(); Snd.init();
  const look = new THREE.Vector3(cam.x, 0, cam.z);
  c.keys.unshift({ t: 0, p: camera.position.toArray(), l: look.toArray() });
  CINE = Object.assign({ t: 0, shake: 0, slow: 1, actors: [], fx: [] }, c);
  document.body.classList.add('cine'); $('#cine').hidden = false; $('#cineCap').textContent = c.title; $('#cineCap').classList.remove('show');
  setTimeout(() => $('#cineCap') && $('#cineCap').classList.add('show'), 500);
}
function stepCine(dt) {
  const C = CINE; C.t += dt * C.slow;
  camAt(C.keys, C.t);
  if (C.shake > 0) { C.shake -= dt; _cp.x += (Math.random() - .5) * .12; _cp.y += (Math.random() - .5) * .08; }
  camera.position.copy(_cp); camera.lookAt(_lk);
  C.step(C.t, dt * C.slow);
  for (let i = C.fx.length - 1; i >= 0; i--) { const f = C.fx[i]; f.v[1] -= 9 * dt; f.o.position.x += f.v[0] * dt; f.o.position.y += f.v[1] * dt; f.o.position.z += f.v[2] * dt; if (f.spin) f.o.rotation.x += f.spin * dt; if (f.o.position.y < (f.floor || 0)) { f.o.position.y = f.floor || 0; f.v[1] *= -.35; f.v[0] *= .6; f.v[2] *= .6; f.spin = (f.spin || 0) * .5; } }
  if (C.t >= C.dur) endCine();
}
function endCine() {
  const C = CINE; if (!C) return; CINE = null;
  C.finish && C.finish();
  C.actors.forEach(a => scene.remove(a.o || a)); C.fx.forEach(f => scene.remove(f.o));
  document.body.classList.remove('cine'); $('#cine').hidden = true; placeCamera(); dirty = true;
  if (C.card) openSheet(C.card);
}
function skipCine() { if (CINE) { CINE.t = CINE.dur; CINE.step(CINE.dur, 0); endCine(); } }
const rewardCard = (title, sub, rew) => `<h2>${title}</h2><p class="sub">${sub}</p><div class="costs big">${Object.entries(rew).filter(([, v]) => v).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div><div class="actions"><button class="btn" data-a="close">Coletar</button></div>`;
function popFx(C, name, x, y, z, s, n, floor) { for (let i = 0; i < n; i++) { const o = typeof name === 'function' ? name(i) : model(name, s); o.position.set(x, y, z); scene.add(o); const a = Math.random() * TAU; C.fx.push({ o, v: [Math.cos(a) * (1 + Math.random()), 3 + Math.random() * 2, Math.sin(a) * (1 + Math.random())], spin: 6, floor }); } }

/* lenhadores */
function cineLenha(e) {
  const [sx, sz] = hexPos(...EXP.lenha.spot), list = crews.lenha.splice(0); list.forEach(c => { dropCrew(c); scene.add(c.o); });
  workTree.visible = true; workTree.userData.grow = 1; workTree.children[0].scale.setScalar(workTree.userData.base); workStump.visible = false; workLog.visible = false;
  while (list.length < Math.min(3, e.n)) { const c = mkWorker('lenha'); scene.add(c.o); list.push(c); }
  const ANG = [-.25, Math.PI + .25, Math.PI * .72];
  list.forEach((c, i) => { const a = ANG[i % 3], r = .6; c.o.position.set(sx + Math.cos(a) * r, 0, sz + Math.sin(a) * r); c.o.rotation.y = Math.atan2(sx - c.o.position.x, sz - c.o.position.z); c.swing = i * .25; });
  let fell = false, hit = 0;
  startCine({ kind: 'lenha', dur: 6.6, title: EXP.lenha.title, actors: list.slice(),
    keys: [{ t: 1.3, p: [sx + 2.6, 2, sz + 3.6], l: [sx, .9, sz] }, { t: 3.4, p: [sx - 1.8, 1.8, sz + 3.8], l: [sx, 1, sz] }, { t: 4.8, p: [sx + 2.4, 2.6, sz + 3.4], l: [sx, .5, sz - .7] }, { t: 6.6, p: [sx + 3, 3.6, sz + 4.6], l: [sx, .3, sz - .8] }],
    step(t, dt) {
      list.forEach(c => { c.mixer.update(dt); if (t > .8 && t < 3.6 && (c.swing -= dt) <= 0) { c.swing = .75; anim(c, 'atk', .55); c.hitAt = .3; } if (c.hitAt > 0 && (c.hitAt -= dt) <= 0) { hit++; Snd.chop(); burstAt(sx, .4, sz, '#d6b07a', 7, .035); workTree.rotation.z = (hit % 2 ? .04 : -.04); } if (t >= 3.6) anim(c, 'idle'); });
      if (t >= 3.6 && t < 4.75) { CINE.slow = .45; workTree.rotation.z = 0; const k = Math.min(1, (t - 3.6) / 1.1); workTree.rotation.x = -Math.pow(k, 2.3) * 1.5; }
      if (t >= 4.75 && !fell) { fell = true; CINE.slow = 1; CINE.shake = .35; Snd.timber(); burstAt(sx, .2, sz - 1.5, '#a08a66', 30, .06); workTree.visible = false; workStump.visible = true; workLog.visible = true; burstAt(sx, 1, sz - 1.4, '#3f7a32', 26, .07); popFx(CINE, 'resource_lumber', sx + .5, .5, sz - .6, .7, 3); }
    },
    finish() { workTree.rotation.set(0, 0, 0); workTree.visible = false; workStump.visible = true; workLog.visible = true; workTree.userData.grow = -6; },
    card: rewardCard('Madeira cortada!', `${e.n} lenhador${e.n > 1 ? 'es' : ''} voltaram${e.fed ? ' · bem alimentados +25%' : ''}`, e.rew) });
}
/* mineiros */
function cineMina(e) {
  const [sx, sz] = hexPos(...EXP.mina.spot), list = crews.mina.splice(0); list.forEach(c => { dropCrew(c); scene.add(c.o); });
  while (list.length < Math.min(3, e.n)) { const c = mkWorker('mina'); scene.add(c.o); list.push(c); }
  list.forEach((c, i) => { const a = [-.2, Math.PI + .2, -Math.PI / 2][i % 3], r = .8; c.o.position.set(sx + Math.cos(a) * r, 0, sz + Math.sin(a) * r); c.o.rotation.y = Math.atan2(sx - c.o.position.x, sz - c.o.position.z); c.swing = i * .22; });
  const gemList = Object.entries(e.gems || {}).filter(([, v]) => v), best = gemList.length ? gemList.sort((a, b) => GEMS.indexOf(b[0]) - GEMS.indexOf(a[0]))[0][0] : null;
  const GC = { ouro: '#f2c94c', rubi: '#e0314f', diamante: '#9fe6ff' };
  let cracked = false, gemObj = null, beam = null, hit = 0;
  const dur = best ? 8.2 : 6.4;
  const keys = [{ t: 1.3, p: [sx + 2.6, 1.9, sz + 3.2], l: [sx, .5, sz] }, { t: 3.6, p: [sx - 2.2, 1.6, sz + 3.2], l: [sx, .5, sz] }];
  if (best) keys.push({ t: 5, p: [sx - .6, 1.7, sz + 2.8], l: [sx, 1, sz] }, { t: 7, p: [sx + .2, 1.9, sz + 2.1], l: [sx, 1.4, sz] }, { t: dur, p: [sx + 1.2, 2.6, sz + 3.2], l: [sx, 1.2, sz] });
  else keys.push({ t: 4.8, p: [sx - 2.6, 2.3, sz + 3.8], l: [sx, .4, sz] }, { t: dur, p: [sx - 3, 3.2, sz + 4.6], l: [sx, .3, sz] });
  const title = EXP.mina.title;
  startCine({ kind: 'mina', dur, title, actors: list.slice(), keys,
    step(t, dt) {
      list.forEach(c => { c.mixer.update(dt); if (t > .8 && t < 3.7 && (c.swing -= dt) <= 0) { c.swing = .7; anim(c, 'atk', .5); c.hitAt = .28; } if (c.hitAt > 0 && (c.hitAt -= dt) <= 0) { hit++; Snd.pick(); burstAt(sx, .5, sz, '#ffd27a', 6, .04); burstAt(sx, .4, sz, '#8e979c', 5, .03); workRock.rotation.y = hit % 2 ? .05 : -.05; } if (t >= 3.7) anim(c, 'idle'); });
      if (t >= 3.7 && t < 4.1) { workRock.position.x = sx + (Math.random() - .5) * .08; }
      if (t >= 4.1 && !cracked) {
        cracked = true; workRock.position.x = sx; workRock.visible = false; CINE.shake = .3; Snd.crack();
        popFx(CINE, () => { const m = mesh(new THREE.DodecahedronGeometry(.13 + Math.random() * .08), '#8e979c'); return m; }, sx, .4, sz, 1, 6, .08);
        popFx(CINE, 'resource_stone', sx + .3, .4, sz + .2, .6, 2);
        if (best) {
          $('#cineCap').textContent = `Vocês acharam ${best === 'ouro' ? 'OURO' : best === 'rubi' ? 'um RUBI' : 'um DIAMANTE'}!`;
          gemObj = new THREE.Mesh(new THREE.OctahedronGeometry(.2), new THREE.MeshStandardMaterial({ color: GC[best], emissive: GC[best], emissiveIntensity: .45, metalness: .5, roughness: .15 }));
          gemObj.position.set(sx, .3, sz); scene.add(gemObj); CINE.actors.push(gemObj);
          beam = new THREE.Mesh(new THREE.CylinderGeometry(.1, .2, 7, 16, 1, true), new THREE.MeshBasicMaterial({ color: GC[best], transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
          beam.position.set(sx, 3.5, sz); scene.add(beam); CINE.actors.push(beam); Snd.chime();
        }
      }
      if (gemObj) { const k = Math.min(1, (t - 4.1) / 1.6); gemObj.position.y = .3 + ease(k) * 1.15; gemObj.rotation.y += dt * 3; beam.material.opacity = Math.min(.28, (t - 4.1) * .4); if (Math.random() < .3) burstAt(sx + (Math.random() - .5) * .4, gemObj.position.y, sz + (Math.random() - .5) * .4, '#fff6c8', 2, .02); }
    },
    finish() { workRock.visible = true; workRock.position.x = sx; workRock.rotation.y = 0; workRock.userData.grow = 0; },
    card: best ? rewardCard('Tesouro da montanha!', `${e.n} mineiro${e.n > 1 ? 's' : ''} voltaram com pedras preciosas`, Object.assign({}, e.gems, e.rew))
      : rewardCard('Rocha quebrada!', `${e.n} mineiro${e.n > 1 ? 's' : ''} voltaram${e.fed ? ' · bem alimentados +25%' : ''}`, e.rew) });
}
/* colheita */
const CAT_COL = { frutas: '#d8423a', legumes: '#ef8a2b', verduras: '#7fc04f', food: '#e2b84a' };
function cineHarvest(i, f, rew) {
  const g = fieldG[i], [x, z] = hexPos(...FIELDS[i]); g.userData.lock = true;
  const C = CROPS[f.c], crops = C.tree ? Array(6).fill((g.userData.crops || [])[0]).filter(Boolean) : (g.userData.crops || []).slice();
  const farmer = mkChar('Rogue_Hooded', .3); farmer.o.position.set(x - 1.1, 0, z + .7); scene.add(farmer.o);
  const basket = model('sack', .9); basket.position.set(x + .15, 0, z + .75); scene.add(basket);
  let picked = 0, nextPick = 1.6;
  startCine({ kind: 'colheita', dur: 5.4, title: `Colheita de ${C.name.toLowerCase()}!`, actors: [farmer, basket],
    keys: [{ t: 1.2, p: [x + 2, 1.8, z + 2.8], l: [x, .3, z] }, { t: 3.6, p: [x - 1.9, 1.7, z + 2.8], l: [x, .3, z] }, { t: 5.4, p: [x - 2.3, 2.6, z + 3.6], l: [x, .2, z] }],
    step(t, dt) {
      farmer.mixer.update(dt);
      const p = farmer.o.position;
      if (t < 1.5) { const k = t / 1.5; p.x = x - 1.1 + k * .9; anim(farmer, 'walk'); farmer.o.rotation.y = Math.PI / 2; }
      else if (t >= nextPick && picked < crops.length) {
        nextPick += Math.max(.35, 2.6 / crops.length); anim(farmer, 'atk', .45);
        const o = crops[picked++]; const wp = new THREE.Vector3(); o.getWorldPosition(wp);
        if (C.tree) wp.add(new THREE.Vector3((Math.random() - .5) * .6, .55 + Math.random() * .4, (Math.random() - .5) * .6)); else o.visible = false;
        Snd.collect(); burstAt(wp.x, wp.y + .1, wp.z, '#7fc04f', 5, .03);
        const item = produceModel(C, C.tree ? .12 : .16); item.position.copy(wp).setY(Math.max(.35, wp.y));
        scene.add(item); CINE.fx.push({ o: item, v: [(x + .15 - wp.x) * 1.4, 3.2, (z + .75 - wp.z) * 1.4], floor: .18 });
        farmer.o.rotation.y = Math.atan2(wp.x - p.x, wp.z - p.z);
      }
    },
    finish() { g.userData.lock = false; g.userData.sig = null; },
    card: rewardCard('Colheita feita!', `${C.name} foi para a ${C.cat === 'food' ? 'comida da vila' : 'despensa'}`, rew) });
}
/* curral */
function cineCurral(rew) {
  const [x, z] = penCenter();
  let t0 = 0;
  startCine({ kind: 'curral', dur: 4.6, title: 'Leite fresco e ovos no curral!', actors: [],
    keys: [{ t: 1.2, p: [x + 1.8, 1.4, z + 2.4], l: [x, .2, z] }, { t: 4.6, p: [x - 1.6, 1.6, z + 2.6], l: [x, .2, z] }],
    step(t, dt) {
      stepHerd(dt);
      if (t > 1.2 && (t0 -= dt) <= 0 && t < 3.8) {
        t0 = .35; const hens = herdObjs.filter(a => a.kind === 'galinha'), hen = hens[Math.floor(Math.random() * hens.length)];
        const egg = mesh(new THREE.SphereGeometry(.035, 8, 6), '#f5ead2'); egg.scale.y = 1.3;
        const p = hen ? hen.o.position : { x, z }; egg.position.set(p.x, .12, p.z); scene.add(egg);
        CINE.fx.push({ o: egg, v: [(Math.random() - .5), 2.4, (Math.random() - .5)], floor: .04 }); Snd.tone(900 + Math.random() * 300, .06, { v: .05 });
      }
    },
    card: rewardCard('Curral recolhido!', 'Leite e ovos foram para a despensa', rew) });
}

/* ---------- rostos com expressão (sobrancelhas, boca e lágrimas presas à cabeça) ---------- */
let FM = null;
function faceMats() {
  if (FM) return FM;
  FM = { brow: new THREE.MeshBasicMaterial({ color: '#2a1a10' }), mouth: new THREE.MeshBasicMaterial({ color: '#3a0f0c' }), tongue: new THREE.MeshBasicMaterial({ color: '#c8504a' }),
    teeth: new THREE.MeshBasicMaterial({ color: '#f4efe6' }), tear: new THREE.MeshBasicMaterial({ color: '#8fd3ff' }),
    browG: new THREE.BoxGeometry(.2, .05, .03), openG: new THREE.CircleGeometry(.085, 16), tongueG: new THREE.CircleGeometry(.045, 12),
    arcG: new THREE.TorusGeometry(.09, .022, 6, 16, Math.PI), grimG: new THREE.BoxGeometry(.22, .06, .02), teethG: new THREE.BoxGeometry(.2, .022, .022), tearG: new THREE.SphereGeometry(.035, 8, 6) };
  return FM;
}
function addFace(c) {
  const head = findNode(c.o, ['head']); if (!head) return;
  const M = faceMats(); c.o.updateMatrixWorld(true);
  const f = new THREE.Group(); new THREE.Matrix4().copy(head.matrixWorld).invert().multiply(c.o.matrixWorld).decompose(f.position, f.quaternion, f.scale);
  head.add(f); const z = .53;
  const bl = new THREE.Mesh(M.browG, M.brow), br = new THREE.Mesh(M.browG, M.brow); bl.position.set(-.17, 1.7, z + .05); br.position.set(.17, 1.7, z + .05);
  const open = new THREE.Group(); const om = new THREE.Mesh(M.openG, M.mouth); om.scale.y = 1.25; open.add(om); const tg = new THREE.Mesh(M.tongueG, M.tongue); tg.position.set(0, -.03, .002); open.add(tg); open.position.set(0, 1.42, z + .005);
  const smile = new THREE.Mesh(M.arcG, M.mouth); smile.rotation.z = Math.PI; smile.position.set(0, 1.47, z);
  const frown = new THREE.Mesh(M.arcG, M.mouth); frown.position.set(0, 1.38, z);
  const grim = new THREE.Group(); grim.add(new THREE.Mesh(M.grimG, M.mouth)); const th = new THREE.Mesh(M.teethG, M.teeth); th.position.z = .004; grim.add(th); grim.position.set(0, 1.43, z);
  const tears = [-.17, .17].map(x => { const t = new THREE.Mesh(M.tearG, M.tear); t.scale.y = 1.4; t.position.set(x, 1.55, z); return t; });
  f.add(bl, br, open, smile, frown, grim, ...tears);
  c.face = { f, bl, br, open, smile, frown, grim, tears, cur: '', t: 0 }; c.head = head;
  setFace(c, 'calm');
}
const FACES = { // [altura das sobrancelhas, inclinação (+ = bravo), boca]
  calm: [1.71, 0, null], angry: [1.69, .45, null], shout: [1.68, .5, 'open'], hurt: [1.7, -.5, 'grim'],
  happy: [1.74, -.12, 'smile'], cheer: [1.74, -.12, 'open'], sad: [1.72, -.42, 'frown'], scared: [1.72, -.4, 'open']
};
function setFace(c, e) {
  const F = c.face; if (!F || F.cur === e) return; F.cur = e;
  const [y, tilt, m] = FACES[e];
  F.bl.position.y = F.br.position.y = y; F.bl.rotation.z = -tilt; F.br.rotation.z = tilt;
  ['open', 'smile', 'frown', 'grim'].forEach(k => F[k].visible = m === k);
  F.open.scale.setScalar(e === 'scared' ? .6 : 1);
  F.tears.forEach(t => t.visible = e === 'sad');
}
function faceFor(u, e, dur) { if (!u.face) return; setFace(u, e); u.faceT = dur || 0; }
function stepFace(u, dt) {
  if (!u.face) return;
  if (u.face.cur === 'sad') u.face.tears.forEach((t, i) => { t.position.y = 1.55 - ((u.face.t + i * .3) % .6) * .5; });
  u.face.t += dt;
  if (u.faceT > 0 && (u.faceT -= dt) <= 0) setFace(u, u.hp < u.max * .3 ? 'scared' : 'angry');
}

/* ---------- números de dano ---------- */
const dmgs = [];
function dmgNum(x, y, z, v, col, big) {
  if (dmgs.length > 40) return;
  const el = document.createElement('div'); el.className = 'dmg' + (big ? ' big' : ''); el.textContent = Math.round(v); el.style.color = col;
  $('#tags').appendChild(el); dmgs.push({ el, x: x + (Math.random() - .5) * .3, y, z, t: 0 });
}
function stepDmg(dt) {
  for (let i = dmgs.length - 1; i >= 0; i--) {
    const d = dmgs[i]; d.t += dt; v3.set(d.x, d.y + d.t * .9, d.z).project(camera);
    d.el.style.transform = `translate(${(v3.x + 1) / 2 * innerWidth}px,${(1 - v3.y) / 2 * innerHeight}px) translate(-50%,-50%) scale(${1 + Math.max(0, .25 - d.t) * 2})`;
    d.el.style.opacity = Math.min(1, (1 - d.t) * 2.5);
    if (d.t > 1) { d.el.remove(); dmgs.splice(i, 1); }
  }
}
function clearDmg() { dmgs.splice(0).forEach(d => d.el.remove()); }

/* ---------- muralha em volta da vila ---------- */
const WALL = { s: { a: 'z', v: 7.65, from: -14.3, to: 13.6, gate: -1 }, e: { a: 'x', v: 13.6, from: -6.8, to: 7.65, gate: .5 }, w: { a: 'x', v: -14.3, from: -6.8, to: 7.65, gate: 1.5 } };
const wallHp = L => Math.round(700 * Math.pow(1.45, L - 1));
const outsideOf = (k, x, z) => k === 's' ? z > WALL.s.v : k === 'e' ? x > WALL.e.v : x < WALL.w.v;
const wallPt = (k, v) => WALL[k].a === 'z' ? [v, WALL[k].v] : [WALL[k].v, v];
const wallGroup = new THREE.Group(); let wallSig = '';
const logGeo = new THREE.CylinderGeometry(.11, .12, 1, 7), tipGeo = new THREE.ConeGeometry(.11, .24, 7);
function rebuildWalls() {
  const L = S.b.muralha.lvl, broken = B && B.walls ? Object.keys(B.walls).filter(k => B.walls[k].hp <= 0).join('') : '';
  const sig = L + ':' + broken; if (sig === wallSig || !G.wall_straight) return; wallSig = sig;
  wallGroup.clear(); if (!wallGroup.parent) scene.add(wallGroup); if (!L) return;
  const stone = L >= 4, wood = mat('#7a5230'), tipM = mat('#5c3d22');
  const logs = [], tips = [];
  Object.entries(WALL).forEach(([k, W]) => {
    const down = broken.includes(k), hs = down ? .32 : 1, rot = W.a === 'z' ? 0 : Math.PI / 2;
    if (stone) {
      for (let v = W.from + 1; v <= W.to - .2; v += 2) {
        const [x, z] = wallPt(k, v), gate = Math.abs(v - W.gate) < 1;
        const o = model(gate && !down ? 'wall_straight_gate' : 'wall_straight'); o.position.set(x, 0, z); o.rotation.y = rot; o.scale.y = hs; wallGroup.add(o);
      }
      if (L >= 7 && k !== 's') { const [x, z] = wallPt(k, W.to); const t = model('building_tower_A_red', .7); t.position.set(x, 0, z); wallGroup.add(t); const fl = model('flag_red', 1.6); fl.position.set(x, 1.95, z); wallGroup.add(fl); }
    } else {
      for (let v = W.from; v <= W.to; v += .27) {
        const [x, z] = wallPt(k, v), gap = Math.abs(v - W.gate) < .8;
        if (gap) continue; const h = (.95 + (Math.floor(v * 7) % 3) * .06) * hs;
        logs.push([x, h / 2, z, h]); tips.push([x, h + .1, z]);
      }
      const [gx, gz] = wallPt(k, W.gate);
      if (!down) { // portão de madeira
        const gt = new THREE.Group(); gt.position.set(gx, 0, gz); gt.rotation.y = rot;
        [-.82, .82].forEach(dx => { const p = mesh(new THREE.CylinderGeometry(.14, .15, 1.4, 7), '#5c3d22', dx, .7, 0); gt.add(p); });
        gt.add(mesh(new THREE.BoxGeometry(1.5, .9, .1), '#8a6038', 0, .5, 0));
        [.25, .75].forEach(y => gt.add(mesh(new THREE.BoxGeometry(1.55, .08, .14), '#4a2f18', 0, y, 0)));
        gt.add(mesh(new THREE.BoxGeometry(1.9, .14, .18), '#4a2f18', 0, 1.3, 0));
        wallGroup.add(gt);
      }
    }
  });
  if (logs.length) {
    const im = new THREE.InstancedMesh(logGeo, wood, logs.length), it = new THREE.InstancedMesh(tipGeo, tipM, tips.length), mt = new THREE.Matrix4();
    logs.forEach(([x, y, z, h], i) => { mt.makeScale(1, h, 1).setPosition(x, y, z); im.setMatrixAt(i, mt); });
    tips.forEach(([x, y, z], i) => { mt.makeTranslation(x, y, z); it.setMatrixAt(i, mt); });
    im.castShadow = it.castShadow = true; im.receiveShadow = true; wallGroup.add(im, it);
  }
}
function wallTarget(u) { // o draugr do lado de fora de um muro de pé ataca o muro
  const k = u.wside; if (!k || !B.walls || B.walls[k].hp <= 0) return null;
  const p = u.o.position, W = WALL[k], v = Math.max(W.from + .5, Math.min(W.to - .5, W.a === 'z' ? p.x : p.z)), [x, z] = wallPt(k, v);
  if (!u.wt) u.wt = { isB: true, isW: true, side: k, rad: .45, get hp() { return B && B.walls ? B.walls[this.side].hp : 0; } };
  u.wt.x = x; u.wt.z = z; return u.wt;
}
function wallHurt(k, d) {
  const w = B.walls[k]; if (w.hp <= 0) return; w.hp -= d;
  const [x, z] = wallPt(k, WALL[k].gate); if (Math.random() < .3) burstAt(x + (Math.random() - .5) * 2, .8, z, S.b.muralha.lvl >= 4 ? '#9aa3a8' : '#8a6038', 4, .03);
  if (w.hp <= 0) { Snd.crash(); toast(k === 's' ? 'A muralha da praia caiu!' : k === 'e' ? 'A muralha leste caiu!' : 'A muralha oeste caiu!'); bcut([x, .6, z], 1.6, 'A muralha caiu!'); }
}

/* ---------- câmera de ação: segue o Jarl e faz closes em câmera lenta ---------- */
const _bc = new THREE.Vector3();
function bcut(at, dur, cap, ang) {
  if (!B || B.over || B.cut || B.cutCd > 0) return;
  B.cut = { at, dur, t: 0, ang: ang ?? Math.random() * .8 - .4, d: 3.2 }; B.cutCd = 7; B.slow = .35;
  document.body.classList.add('cine'); $('#cine').hidden = false; $('#cineSkip').hidden = true; $('#cineCap').textContent = cap || ''; $('#cineCap').classList.toggle('show', !!cap);
}
function stepCut(dt) {
  const c = B.cut; c.t += dt;
  const at = typeof c.at === 'function' ? c.at() : c.at, a = c.ang + c.t * .5, d = c.d - c.t * .4;
  _bc.set(at[0] + Math.sin(a) * d, at[1] + 1.1, at[2] + Math.cos(a) * d); camera.position.copy(_bc); camera.lookAt(at[0], at[1] + .3, at[2]);
  if (c.t >= c.dur) { B.cut = null; B.slow = 1; document.body.classList.remove('cine'); $('#cine').hidden = true; $('#cineSkip').hidden = false; placeCamera(); }
}
function followHero(dt) {
  if (!B.follow || B.cut) return;
  const h = B.hero, [x, z] = h.dead ? hexPos(7, 5) : [h.o.position.x, h.o.position.z], k = Math.min(1, dt * 2.2);
  cam.x += (x - cam.x) * k; cam.z += (z + 1 - cam.z) * k; placeCamera();
}
function toggleFollow() { if (!B) return; B.follow = !B.follow; $('#btnCam').classList.toggle('on', B.follow); Snd.tap(); }

/* ---------- final da batalha em cena ---------- */
function startEnding(win, html) {
  B.ending = { win, t: 0, html }; B.cut = null; B.slow = 1;
  B.units.forEach(u => { u.bar.bg.visible = u.bar.fg.visible = false; }); B.blds.forEach(t => { t.bar.bg.visible = t.bar.fg.visible = false; }); if (B.walls) Object.values(B.walls).forEach(w => { w.bar.bg.visible = w.bar.fg.visible = false; });
  document.body.classList.add('cine'); $('#cine').hidden = false; $('#cineSkip').hidden = false;
  $('#cineCap').textContent = win ? 'VITÓRIA!' : 'O Salão caiu…'; $('#cineCap').classList.remove('show'); setTimeout(() => $('#cineCap').classList.add('show'), 300);
  B.units.forEach(u => {
    if (u.dead || !u.on) return;
    u.pend = null; u.busy = 0;
    if (u.side === 'ally') { if (win) { faceFor(u, 'cheer'); u.cheer = Math.random() * .6; } else { faceFor(u, 'sad'); anim(u, 'idle'); } }
    else if (win) anim(u, 'idle'); else anim(u, 'idle');
  });
  const h = B.hero; B.ending.at = !h.dead ? [h.o.position.x, 0, h.o.position.z] : (() => { const [x, z] = hexPos(7, 5); return [x, 0, z + 1.4]; })();
}
function stepEnding(dt) {
  const E = B.ending; E.t += dt;
  B.units.forEach(u => {
    u.mixer.update(dt); stepFace(u, dt);
    if (u.dead || !u.on || u.side !== 'ally') return;
    if (E.win) { if (u.act.cheer && (u.cheer -= dt) <= 0) { u.cheer = 1.1 + Math.random() * .4; anim(u, 'cheer', .9); setFace(u, Math.random() < .5 ? 'cheer' : 'happy'); } }
    else if (u.head) u.head.rotation.x += .5; // cabisbaixo
  });
  stepDmg(dt);
  const [x, , z] = E.at, a = E.win ? E.t * .45 : .3, d = E.win ? 3 : 2.6 + E.t * .5, y = E.win ? 1.4 : 1.2 + E.t * .25;
  camera.position.set(x + Math.sin(a) * d, y, z + Math.cos(a) * d); camera.lookAt(x, .6, z);
  if (E.t > 4.2) finishEnding();
}
function finishEnding() {
  if (!B || !B.ending) return; const html = B.ending.html;
  document.body.classList.remove('cine'); $('#cine').hidden = true; cleanupBattle(); placeCamera(); openSheet(html);
}

/* ---------- caça: clareira na floresta, animais selvagens e caçadores ---------- */
const CLEARING = [[15, 3], [16, 3], [15, 4], [16, 4], [15, 5], [16, 5]];
CLEARING.concat([[12, 4]]).forEach(([c, r]) => plotAt.add(c + ',' + r));
const CLR = { x0: 14.5, x1: 18, z0: -4.6, z1: .6 };
const WILD_H = { Deer: .5, Stag: .62, Fox: .26, Wolf: .38 };
const wild = [];
function rndClear() { return [CLR.x0 + Math.random() * (CLR.x1 - CLR.x0), CLR.z0 + Math.random() * (CLR.z1 - CLR.z0)]; }
function spawnWild(kind, at) {
  const a = mkBeast(kind, WILD_H[kind]); const [x, z] = at || rndClear(); a.o.position.set(x, 0, z); a.o.rotation.y = Math.random() * TAU; scene.add(a.o);
  const w = Object.assign(a, { kind, tx: x, tz: z, wait: Math.random() * 3, sp: kind === 'Fox' ? .5 : .32, dead: false, deadT: 0 }); wild.push(w); return w;
}
function buildWild() { if (!G.Deer) return; ['Deer', 'Deer', 'Stag', 'Fox', 'Deer'].forEach(k => spawnWild(k)); }
function playB(a, k) { if (a.cur === k) return; a.act[a.cur].fadeOut(.25); a.act[k].reset().fadeIn(.25).play(); a.cur = k; }
function stepWild(dt) {
  for (let i = wild.length - 1; i >= 0; i--) {
    const a = wild[i]; a.mixer.update(dt);
    if (a.dead) { a.deadT += dt; if (a.deadT > 2.5) a.o.position.y -= dt * .3; if (a.deadT > 4) { scene.remove(a.o); wild.splice(i, 1); if (!a.noRespawn) setTimeout(() => { if (wild.filter(w => !w.dead).length < 6) spawnWild(a.kind === 'Wolf' ? 'Deer' : a.kind); }, 6000); } continue; }
    if (a.held) continue; // presa de uma cena
    const p = a.o.position, dx = a.tx - p.x, dz = a.tz - p.z, d = Math.hypot(dx, dz);
    if (a.wait > 0) { a.wait -= dt; continue; }
    if (d < .05) { a.wait = 1.5 + Math.random() * 4; [a.tx, a.tz] = rndClear(); playB(a, Math.random() < .5 ? 'eat' : 'idle'); continue; }
    const st = Math.min(d, (a.flee ? 2.4 : a.sp) * dt); p.x += dx / d * st; p.z += dz / d * st; a.o.rotation.y = Math.atan2(dx, dz); playB(a, a.flee ? 'run' : 'walk');
    if (a.flee && d < .1) a.flee = false;
  }
}
function killWild(a) { a.dead = true; a.deadT = 0; a.act[a.cur].fadeOut(.15); a.act.die.reset().fadeIn(.15).play(); a.cur = 'die'; burstAt(a.o.position.x, .3, a.o.position.z, '#a83a2a', 8, .03); }

/* flechas soltas (fora da batalha) */
const looseArrows = [];
function fireArrow(from, to, onHit, slow) {
  const m = new THREE.Mesh(arrowGeo, arrowMat); m.position.set(from[0], from[1], from[2]); scene.add(m);
  looseArrows.push({ m, from, to, t: 0, dur: Math.max(.25, Math.hypot(to[0] - from[0], to[2] - from[2]) / 12) * (slow || 1), onHit });
  Snd.shoot();
}
function stepArrows(dt) {
  for (let i = looseArrows.length - 1; i >= 0; i--) {
    const a = looseArrows[i]; a.t += dt / a.dur; const k = Math.min(1, a.t), [x0, y0, z0] = a.from, [x1, y1, z1] = a.to;
    const x = x0 + (x1 - x0) * k, z = z0 + (z1 - z0) * k, y = y0 + (y1 - y0) * k + .5 * 4 * k * (1 - k);
    a.m.lookAt(x + (x - a.m.position.x), y + (y - a.m.position.y), z + (z - a.m.position.z)); a.m.position.set(x, y, z);
    if (a.t >= 1) { scene.remove(a.m); looseArrows.splice(i, 1); a.onHit && a.onHit(); }
  }
}

/* caçadores em ação durante a expedição */
const hunters = [];
function mkHunter() { const c = mkChar('Ranger', .3, null, 'bow_withString'); c.o.traverse(m => { if (m.isMesh) m.castShadow = true; }); addFace(c); return c; }
const gateE = () => wallPt('e', WALL.e.gate);
function huntPos(i, n) { const [x, z] = hexPos(...EXP.caca.spot), a = (i / Math.max(1, n)) * TAU + 2.6; return [x - 1.2 + Math.cos(a) * .7, z + Math.sin(a) * .9]; }
function refreshHunters(now) {
  const e = S.exp.caca, want = e ? Math.min(4, e.n) : 0;
  if (CINE && CINE.kind === 'caca') return;
  while (hunters.length > want) { const c = hunters.pop(); scene.remove(c.o); if (c.pile) scene.remove(c.pile); }
  while (hunters.length < want) {
    const c = mkHunter(), p = plotById('cabana'), [hx, hz] = hexPos(p.c, p.r), i = hunters.length, fresh = now - e.start < 6000, [px, pz] = huntPos(i, want);
    c.o.position.set(fresh ? hx + (Math.random() - .5) * .5 : px, 0, fresh ? hz + 1 : pz);
    c.route = fresh && S.b.muralha.lvl ? [gateE(), [px, pz]] : [[px, pz]];
    c.pile = new THREE.Group(); c.pile.position.set(px - .35, 0, pz + .3); scene.add(c.pile);
    Object.assign(c, { i, cool: 1 + i * .7, aim: null }); setFace(c, 'calm'); scene.add(c.o); hunters.push(c);
    const pre = fresh ? 0 : Math.min(4, Math.round((now - e.start) / (e.s * 1000) * 4)); for (let k = 0; k < pre; k++) addMeat(c);
  }
}
function addMeat(c) {
  const n = c.pile.children.length; if (n >= 6) return;
  const m = mesh(new THREE.BoxGeometry(.14, .07, .1), n % 3 === 2 ? '#a8743f' : '#9b3b2a'); m.position.set((n % 3 - 1) * .13, .04 + Math.floor(n / 3) * .07, 0); m.rotation.y = Math.random() * .5; c.pile.add(m);
}
function stepHunters(dt, now) {
  if (CINE && CINE.kind === 'caca') return;
  const e = S.exp.caca; if (!e) return; const done = now >= e.end;
  hunters.forEach(c => {
    c.mixer.update(dt); stepFace(c, dt);
    const p = c.o.position, tgt = c.route[0], dx = tgt[0] - p.x, dz = tgt[1] - p.z, d = Math.hypot(dx, dz);
    if (d > .05) { const st = Math.min(d, 2 * dt); p.x += dx / d * st; p.z += dz / d * st; c.o.rotation.y = Math.atan2(dx, dz); anim(c, 'run'); return; }
    if (c.route.length > 1) { c.route.shift(); return; }
    if (done) { anim(c, 'idle'); setFace(c, 'happy'); return; }
    if ((c.cool -= dt) > 0) { if (c.aim && !c.aim.dead) c.o.rotation.y = Math.atan2(c.aim.o.position.x - p.x, c.aim.o.position.z - p.z); return; }
    const prey = wild.filter(a => !a.dead && !a.held && a.kind !== 'Wolf').sort((a, b) => a.o.position.distanceTo(p) - b.o.position.distanceTo(p))[0];
    if (!prey) { c.cool = 1; anim(c, 'idle'); return; }
    c.aim = prey; c.o.rotation.y = Math.atan2(prey.o.position.x - p.x, prey.o.position.z - p.z); anim(c, 'shoot', .7); setFace(c, 'angry'); c.cool = 3.2 + Math.random() * 1.5;
    setTimeout(() => {
      if (!c.o.parent || prey.dead) return; const q = prey.o.position;
      fireArrow([p.x, .75, p.z], [q.x, .3, q.z], () => { if (prey.dead) return; if (Math.random() < .75) { killWild(prey); addMeat(c); setFace(c, 'happy'); c.faceT = 1.2; } else { prey.flee = true; [prey.tx, prey.tz] = rndClear(); } });
    }, 400);
  });
}

/* cena da caçada */
function cineCaca(e) {
  hunters.splice(0).forEach(c => { scene.remove(c.o); if (c.pile) scene.remove(c.pile); });
  const [sx, sz] = hexPos(...EXP.caca.spot), list = [];
  const n = Math.min(3, e.n); for (let i = 0; i < n; i++) { const c = mkHunter(); c.o.position.set(sx - 1.5 + i * .45, 0, sz + .9 - i * .3); c.o.rotation.y = Math.PI / 2; scene.add(c.o); setFace(c, 'calm'); list.push(c); }
  const stag = spawnWild('Stag', [sx + 1.6, sz - .2]); stag.held = true; stag.noRespawn = true; stag.o.rotation.y = -Math.PI / 2 - .3; playB(stag, 'eat');
  let wolf = null, shot = false, wolfShot = false, arrowObj = null;
  const dur = e.wolf ? 9 : 6.6, troph = e.gems && e.gems.trofeu;
  const keys = [{ t: 1.2, p: [sx - 2.4, 1.9, sz + 2.6], l: [sx + .4, .4, sz] }, { t: 2.6, p: [sx - 2.2, 1.5, sz + 2], l: [sx + 1.5, .45, sz - .2] }, { t: 4, p: [sx + .2, .9, sz + 1.5], l: [sx + 1.6, .3, sz - .2] }, { t: 5.2, p: [sx + 3.2, 1.3, sz + 1.6], l: [sx + 1.4, .3, sz - .2] }];
  if (e.wolf) keys.push({ t: 7, p: [sx + .6, 1.6, sz + 2.4], l: [sx - .9, .3, sz - .6] }, { t: dur, p: [sx - 2.4, 2.2, sz + 3.6], l: [sx - .8, .3, sz] });
  else keys.push({ t: dur, p: [sx - 1.2, 2.2, sz + 3.4], l: [sx + .4, .3, sz] });
  startCine({ kind: 'caca', dur, title: EXP.caca.title, actors: list.slice(),
    keys,
    step(t, dt) {
      list.forEach(c => { c.mixer.update(dt); stepFace(c, dt); });
      stag.mixer.update(dt); stepArrows(dt);
      if (t > 1.6 && !shot) { shot = true; const c = list[0]; anim(c, 'shoot', .8); setFace(c, 'angry'); CINE.slow = .35;
        setTimeout(() => { if (!CINE) return; const p = c.o.position, q = stag.o.position; fireArrow([p.x, .78, p.z], [q.x, .45, q.z], () => { killWild(stag); CINE.slow = 1; CINE.shake = .2; Snd.timber(); list.forEach(h => { anim(h, 'cheer', .9); setFace(h, 'cheer'); }); }, 2.2); }, 280); }
      if (shot && !stag.dead && t > 2.4) { stag.o.rotation.y += Math.sin(t * 20) * .002; }
      if (e.wolf) {
        if (t > 5.4 && !wolf) { wolf = spawnWild('Wolf', [sx - .2, sz - 2.4]); wolf.held = true; wolf.noRespawn = true; playB(wolf, 'run'); $('#cineCap').textContent = 'Lobos!'; list.forEach(h => setFace(h, 'scared')); Snd.tone(320, .6, { type: 'sawtooth', v: .05, to: 520 }); }
        if (wolf && !wolf.dead) { wolf.mixer.update(dt); const tg = list[1] || list[0], p = wolf.o.position, q = tg.o.position, dx = q.x - p.x, dz = q.z - p.z, d = Math.hypot(dx, dz); wolf.o.rotation.y = Math.atan2(dx, dz); if (d > .45) { p.x += dx / d * 2.6 * dt; p.z += dz / d * 2.6 * dt; } else if (wolf.cur !== 'atk') { playB(wolf, 'atk'); anim(tg, 'hit', .4); setFace(tg, 'hurt'); Snd.hit(); } }
        if (t > 6.6 && wolf && !wolfShot) { wolfShot = true; const c = list[0]; anim(c, 'shoot', .6); setFace(c, 'shout'); setTimeout(() => { if (!CINE || !wolf) return; const p = c.o.position, q = wolf.o.position; fireArrow([p.x, .78, p.z], [q.x, .35, q.z], () => killWild(wolf)); }, 250); }
        if (wolf && wolf.dead) wolf.mixer.update(dt);
      }
    },
    finish() { [stag, wolf].forEach(a => { if (!a) return; scene.remove(a.o); const i = wild.indexOf(a); if (i >= 0) wild.splice(i, 1); }); looseArrows.splice(0).forEach(a => scene.remove(a.m)); },
    card: rewardCard(troph ? 'Caçada lendária!' : e.wolf ? 'Caçada com lobos!' : 'Boa caçada!', `${e.n} caçador${e.n > 1 ? 'es' : ''} voltaram${e.wolf ? ' · os lobos levaram parte da caça' : e.fed ? ' · bem alimentados +25%' : ''}`, Object.assign({}, e.rew, e.gems || {})) });
}

/* armaduras de couro no Ferreiro */
const armorCost = l => ({ couro: 10 + l * 8, iron: 40 + l * 30 });
function armorHTML() {
  const l = S.armor || 0, c = armorCost(l);
  return `<div class="exp"><div class="exph"><b>Armaduras de couro</b><small>nível ${l} de 10</small></div>
    <p class="desc" style="margin:4px 0">Cada nível dá +5% de vida a todas as tropas (agora +${l * 5}%). O couro vem dos caçadores.</p>
    ${l >= 10 ? '<p class="ok">Armaduras no máximo!</p>' : `${costHTML(c)}<div class="actions"><button class="btn" data-a="armor" ${canAfford(c) ? '' : 'disabled'}>Forjar nível ${l + 1}</button></div>`}</div>`;
}

/* ---------- laço de render ---------- */
let lastT = performance.now();
function frame(now) {
  const dt = Math.min(100, now - lastT); lastT = now;
  PLOTS.forEach(refreshPlot); rebuildWalls();
  const ds = dt / 1000, wall = Date.now();
  refreshFields(wall); refreshCrews(wall); refreshHunters(wall); regrow(ds);
  if (CINE) stepCine(ds); else { stepHerd(ds); stepCrews(ds, wall); stepWild(ds); stepHunters(ds, wall); stepArrows(ds); }
  if (B) stepBattle(ds); else stepFolk(dt);
  guards.forEach(g => g.mixer.update(dt / 1000));
  if (ship) { ship.position.y = -.15 + Math.sin(now / 900) * .05; ship.rotation.z = Math.sin(now / 1300) * .03; }
  clouds.forEach(c => { c.position.x += dt * .0006; if (c.position.x > 40) c.position.x = -40; });
  if (!reduceMotion && (smokeT -= dt) < 0) { smokeT = 420; spawnSmoke(); }
  for (let i = smokes.length - 1; i >= 0; i--) { const s = smokes[i]; s.life -= dt / 3000; s.m.position.y += dt * .0007; s.m.position.x += dt * .0003; s.m.scale.setScalar(.4 + (1 - s.life) * 1.1); s.m.material.opacity = s.life * .55; if (s.life <= 0) { scene.remove(s.m); s.m.material.dispose(); smokes.splice(i, 1); } }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt / 900; const a = s.pts.geometry.attributes.position; s.vel.forEach((v, k) => { a.array[k * 3] += v[0]; a.array[k * 3 + 1] += v[1]; a.array[k * 3 + 2] += v[2]; v[1] -= .004; }); a.needsUpdate = true; s.pts.material.opacity = s.life; if (s.life <= 0) { scene.remove(s.pts); sparks.splice(i, 1); } }
  updateTags(); updateFieldTags();
  renderer.render(scene, camera);
}

/* ========== UI ========== */
const sheet = $('#sheet'), sheetBg = $('#sheetBg');
let sheetFor = null;
function openSheet(html) { sheet.innerHTML = html; sheet.hidden = false; sheetBg.hidden = false; const f = sheet.querySelector('button'); if (f) f.focus({ preventScroll: true }); }
function closeSheet() { sheet.hidden = true; sheetBg.hidden = true; sheetFor = null; }
sheetBg.addEventListener('click', closeSheet);
function costHTML(c) { return `<div class="costs">${Object.entries(c).map(([k, v]) => `<div class="cost${have(k) < v ? ' miss' : ''}">${icoSVG(k)}${fmt(v)}</div>`).join('')}</div>`; }
function openBuilding(p) {
  sheetFor = p.id; renderSheet();
}
function renderSheet() {
  const p = plotById(sheetFor); if (!p) return;
  const b = S.b[p.id], d = DEF[p.type], L = b.lvl;
  let html = `<h2>${p.type === 'salao' && L >= 7 ? 'Castelo Viking' : d.name}</h2><p class="sub">${L ? 'Nível ' + L : 'Terreno livre'}</p><p class="desc">${d.desc}</p>`;
  if (p.type === 'torre' && L) html += `<div class="stat"><span>Dano da flecha</span><span>${towerDmg(L)}${L < MAXLV ? ` <span class="up">→ ${towerDmg(L + 1)}</span>` : ''}</span></div>`;
  if (p.type === 'ferreiro' && L) html += `<div class="stat"><span>Bônus das tropas</span><span>+${L * 10}%${L < MAXLV ? ` <span class="up">→ +${(L + 1) * 10}%</span>` : ''}</span></div>`;
  if (p.type === 'quartel' && L) html += trainHTML();
  if (d.prod && L) html += `<div class="stat"><span>Produção</span><span>${fmt(rateFor(p.type, L))} ${RES_NAME[d.prod].toLowerCase()}/h${L < MAXLV ? ` <span class="up">→ ${fmt(rateFor(p.type, L + 1))}</span>` : ''}</span></div>
      <div class="stat"><span>Guardado aqui</span><span>${fmt(b.buf)} / ${fmt(bufCap(p.type, L))}</span></div>`;
  if (p.type === 'armazem' && L) html += `<div class="stat"><span>Limite de cada recurso</span><span>${fmt(capFor('food'))}</span></div>`;
  if (p.type === 'armazem') html += pantryHTML();
  if (p.type === 'salao') html += `<div class="stat"><span>Poder da vila</span><span>${fmt(power())}</span></div><div class="actions" style="margin:4px 0 8px"><button class="btn ghost" data-a="treasure">${icoSVG('ouro')} Tesouro do Jarl</button></div>`;
  if (p.type === 'serraria' && L) html += expHTML('lenha');
  if (p.type === 'pedreira' && L) html += expHTML('mina');
  if (p.type === 'cabana' && L) html += expHTML('caca');
  if (p.type === 'ferreiro' && L) html += armorHTML();
  if (p.type === 'horta') html += hortaHTML();
  if (p.type === 'curral') html += curralHTML();
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
  const T = S.train, cap = armyCap(), L = S.b.quartel.lvl, f = troopHpF(), fd = troopDmgF();
  let h = `<div class="stat"><span>Exército</span><span>${armyCount()} / ${cap}${T ? ` <span class="up">+${T.left} treinando</span>` : ''}</span></div>`;
  if (T) h += `<div class="stat"><span>Treinando ${T.left} ${(T.left > 1 ? TROOPS[T.type].pl : TROOPS[T.type].name).toLowerCase()}</span><span>${fmtT(trainLeftS())}</span></div>
    <div class="actions" style="margin-top:4px"><button class="btn rune" data-a="tspeed">${Math.ceil(trainLeftS() / 60) ? `Acelerar treino · ${Math.ceil(trainLeftS() / 60)} runa${Math.ceil(trainLeftS() / 60) > 1 ? 's' : ''}` : 'Concluir treino'}</button></div>`;
  h += '<div class="troops">' + Object.entries(TROOPS).map(([k, t]) => {
    const locked = L < t.need, room = cap - armyCount() - queued(), busy = T && T.type !== k;
    return `<div class="troop${locked ? ' locked' : ''}"><div class="tt"><b>${t.name}</b> <small>×${S.army[k]}</small><p>${t.desc}</p>
      <p class="tstat">Vida ${Math.round(t.hp * f)} · Dano ${Math.round(t.dmg * fd)}${t.ranged ? ' · à distância' : ''} · ${t.time}s</p>${costHTML(t.cost)}</div>
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
    <div class="mlist">${MISSIONS.map((x, i) => { const dn = S.mdone.includes(x.t); return `<div class="mitem${dn ? ' done' : i === S.mission ? ' cur' : ''}">${dn ? '✓' : i + 1}. ${x.t}</div>`; }).join('')}</div>`);
}
$('#mission').addEventListener('click', () => { Snd.init(); Snd.tap(); const m = MISSIONS[S.mission]; if (m && m.ok()) claimMission(); else openMissions(); });
$('#btnBattle').addEventListener('click', () => { Snd.init(); Snd.tap(); openWave(); });
$('#btnRunes').addEventListener('click', () => { Snd.init(); toast('Runas aceleram obras. Ganhe completando missões.'); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
function toast(t) { const el = $('#toast'); el.textContent = t; el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); }

function renderHUD() {
  $('#res').innerHTML = RES.map(k => { const cap = capFor(k), v = S.res[k]; return `<div class="r${v >= cap ? ' full' : ''}" title="${RES_NAME[k]}">${icoSVG(k)}<span>${fmt(v)}</span></div>`; }).join('');
  $('#gemsN').textContent = GEMS.reduce((a, k) => a + (S.gems[k] || 0), 0); $('#runes').textContent = S.runes; $('#hallLv').textContent = S.b.salao.lvl; $('#vilaName').textContent = S.vila; $('#power').textContent = 'Poder ' + fmt(power());
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

/* ========== Vida na vila: ações e telas ========== */
const Life = { sel: { lenha: { n: 1, d: 0 }, mina: { n: 1, d: 0 }, caca: { n: 1, d: 0 } } };
function payMeals(n) { // tira da despensa (do que tem mais) e completa com comida
  let left = n; const used = {};
  while (left > 0) { const k = PANTRY.filter(x => S.pantry[x] >= 1).sort((a, b) => S.pantry[b] - S.pantry[a])[0]; if (!k) break; S.pantry[k]--; used[k] = (used[k] || 0) + 1; left--; }
  if (left) { S.res.food -= left * MEAL_FOOD; used.food = left * MEAL_FOOD; }
  return used;
}
const canFeed = n => Math.max(0, n - mealsHave()) * MEAL_FOOD <= S.res.food;
function startExp(k) {
  const sel = Life.sel[k], n = Math.min(sel.n, workersMax(k)), s = DURS[sel.d].s, meals = mealsFor(n, s);
  if (S.exp[k]) return;
  if (!canFeed(meals)) { toast('Falta comida para os trabalhadores'); Snd.no(); return; }
  const fed = varietyOk(); payMeals(meals);
  const rew = expYield(k, n, s, fed), now = Date.now();
  S.exp[k] = { n, s, start: now, end: now + s * 1000, rew, gems: k === 'mina' ? rollGems(n, s) : null, fed };
  if (k === 'caca') { // lobos e troféu decididos na saída
    const e = S.exp[k]; e.wolf = Math.random() < (herd().cao ? .1 : .25) * Math.min(1, .5 + s / 120);
    if (e.wolf) for (const r in e.rew) e.rew[r] = Math.max(1, Math.round(e.rew[r] * .7));
    if (Math.random() < Math.min(.25, .04 + s / 3600 * .1) || !S.stats.trofeuFirst && (S.stats.expCaca || 0) >= 2) { e.gems = { trofeu: 1 }; }
  }
  Snd.build(); toast(`${n} ${n > 1 ? EXP[k].name.toLowerCase() : EXP[k].one} saíram para trabalhar`); save(); dirty = true; closeSheet();
}
function finishExp(k) {
  const e = S.exp[k]; if (!e || Date.now() < e.end || CINE || B) return;
  for (const r in e.rew) gain(r, e.rew[r]);
  if (e.gems) for (const g in e.gems) { gain(g, e.gems[g]); if (g === 'trofeu') S.stats.trofeuFirst = 1; else S.stats.gemFound = (S.stats.gemFound || 0) + e.gems[g]; }
  const sk = { lenha: 'expLenha', mina: 'expMina', caca: 'expCaca' }[k]; S.stats[sk] = (S.stats[sk] || 0) + 1;
  S.exp[k] = null; save(); dirty = true;
  ({ lenha: cineLenha, mina: cineMina, caca: cineCaca })[k](e);
}
function expSpeedCost(k) { const e = S.exp[k]; return e ? Math.ceil(Math.max(0, e.end - Date.now()) / 60000) : 0; }
function speedExp(k) { const c = expSpeedCost(k); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); return; } S.runes -= c; S.exp[k].end = Date.now(); save(); dirty = true; finishExp(k); }
function expHTML(k) {
  const e = S.exp[k], X = EXP[k], now = Date.now();
  if (k === 'mina' && !S.b.pedreira.lvl) return '';
  let h = `<div class="exp"><div class="exph"><b>${X.name}</b><small>${workersMax(k)} disponíveis</small></div>`;
  if (e) {
    const left = Math.max(0, e.end - now), pr = 1 - left / (e.s * 1000);
    h += left > 0 ? `<p class="desc" style="margin:4px 0">${e.n} ${e.n > 1 ? X.name.toLowerCase() : X.one} trabalhando · volta em ${fmtT(left / 1000)}</p><div class="hbar gold"><i style="width:${pr * 100}%"></i></div>
      <div class="actions"><button class="btn rune" data-a="exp-speed" data-k="${k}">${expSpeedCost(k) ? `Acelerar · ${expSpeedCost(k)} runa${expSpeedCost(k) > 1 ? 's' : ''}` : 'Concluir'}</button></div>`
      : `<p class="desc" style="margin:4px 0">Trabalho concluído!</p><div class="actions"><button class="btn" data-a="exp-see" data-k="${k}">Ver e recolher</button></div>`;
    return h + '</div>';
  }
  const sel = Life.sel[k]; sel.n = Math.max(1, Math.min(sel.n, workersMax(k)));
  const s = DURS[sel.d].s, meals = mealsFor(sel.n, s), fed = varietyOk(), y = expYield(k, sel.n, s, fed), fromPantry = Math.min(meals, mealsHave()), food = (meals - fromPantry) * MEAL_FOOD;
  h += `<div class="exprow"><span>Trabalhadores</span><div class="stepper"><button data-a="exp-n" data-k="${k}" data-v="-1" ${sel.n <= 1 ? 'disabled' : ''}>−</button><b>${sel.n}</b><button data-a="exp-n" data-k="${k}" data-v="1" ${sel.n >= workersMax(k) ? 'disabled' : ''}>+</button></div></div>
    <div class="durs">${DURS.map((d, i) => `<button data-a="exp-d" data-k="${k}" data-v="${i}" class="${i === sel.d ? 'on' : ''}">${d.t}</button>`).join('')}</div>
    <div class="exprow"><span>Refeições</span><span>${icoSVG('meal')} ${meals}${fromPantry < meals ? ` <small>(${fromPantry} da despensa + ${fmt(food)} comida)</small>` : ' <small>da despensa</small>'}</span></div>
    <div class="exprow"><span>Traz</span><span class="costs inline">${Object.entries(y).map(([r, v]) => `<span class="cost">${icoSVG(r)}${fmt(v)}</span>`).join('')}${k === 'mina' ? `<span class="cost">${icoSVG('ouro')}?</span>` : ''}</span></div>
    ${fed ? '<p class="ok">Despensa variada: +25% de rendimento</p>' : '<p class="sub" style="margin:4px 0">Com 3 tipos de alimento na despensa (leite, ovos, frutas, legumes, verduras) eles rendem +25%.</p>'}
    ${k === 'caca' ? `<p class="sub" style="margin:4px 0">Lobos podem atacar e reduzir a caça${herd().cao ? ' (seus cães de guarda ajudam)' : ' (cães de guarda do Curral diminuem o risco)'}. Às vezes trazem um troféu de alce.</p>` : ''}
    ${k === 'mina' ? `<p class="sub" style="margin:4px 0">Podem achar ouro, rubi e diamante${gemChance() > 1 ? ` (bônus de +${Math.round((gemChance() - 1) * 100)}%)` : ''}.${S.b.mina.lvl ? '' : ' A Mina de Ferro aumenta a chance e traz ferro.'}</p>` : ''}
    <div class="actions"><button class="btn" data-a="exp-go" data-k="${k}" ${canFeed(meals) ? '' : 'disabled'}>Enviar ${sel.n > 1 ? X.name.toLowerCase() : X.one}</button></div></div>`;
  return h;
}

/* horta */
function openField(i) {
  sheetFor = null; const f = S.fields[i], L = S.b.horta.lvl, now = Date.now();
  if (i >= fieldsOpen()) { openSheet(`<h2>Canteiro fechado</h2><p class="desc">Melhore a Horta e Pomar para abrir mais canteiros.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  if (f) {
    const C = CROPS[f.c], left = f.end - now;
    if (left <= 0) { harvest(i); return; }
    const c = Math.ceil(left / 60000);
    openSheet(`<h2>${C.name}</h2><p class="sub">Canteiro ${i + 1} · crescendo</p><div class="hbar green"><i style="width:${(1 - left / (f.end - f.start)) * 100}%"></i></div>
      <div class="stat"><span>Pronto em</span><span>${fmtT(left / 1000)}</span></div><div class="stat"><span>Colheita</span><span>${icoSVG(C.cat)} ${cropYield(f.c)}</span></div>
      <div class="actions"><button class="btn rune" data-a="crop-speed" data-v="${i}">Acelerar · ${c} runa${c > 1 ? 's' : ''}</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
    return;
  }
  openSheet(`<h2>Plantar</h2><p class="sub">Canteiro ${i + 1} · escolha a semente</p><div class="crops">${Object.entries(CROPS).map(([k, C]) => {
    const lock = L < C.L;
    return `<button class="crop${lock ? ' locked' : ''}" data-a="plant" data-k="${k}" data-v="${i}" ${lock ? 'disabled' : ''}><b>${C.name}</b><span>${icoSVG(C.cat)} ${cropYield(k)} · ${fmtT(C.s)}</span>${lock ? `<small>Horta nível ${C.L}</small>` : ''}</button>`;
  }).join('')}</div><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
function plant(i, k, all) {
  const now = Date.now(), C = CROPS[k], idx = all ? S.fields.map((f, j) => j).filter(j => j < fieldsOpen() && !S.fields[j]) : [i];
  idx.forEach(j => { S.fields[j] = { c: k, start: now, end: now + C.s * 1000 }; burstAt(...(() => { const [x, z] = hexPos(...FIELDS[j]); return [x, .3, z]; })(), '#7a5a32', 10, .03); });
  Snd.build(); save(); dirty = true; closeSheet();
}
function harvest(i) {
  const f = S.fields[i]; if (!f || Date.now() < f.end || CINE || B) return;
  const C = CROPS[f.c], q = cropYield(f.c), rew = { [C.cat]: q };
  gain(C.cat, q); S.stats.harvest = (S.stats.harvest || 0) + 1; S.fields[i] = null; save(); dirty = true;
  cineHarvest(i, f, rew);
}
function hortaHTML() {
  const open = fieldsOpen(), now = Date.now(), L = S.b.horta.lvl;
  if (!L) return '';
  const empty = S.fields.filter((f, j) => j < open && !f).length;
  let h = `<div class="stat"><span>Canteiros</span><span>${open} de 5</span></div><div class="mlist">`;
  for (let j = 0; j < open; j++) { const f = S.fields[j]; h += `<button class="mitem fld-row" data-a="field" data-v="${j}">${j + 1}. ${f ? `${CROPS[f.c].name} · ${now >= f.end ? '<b class="ok">pronto para colher</b>' : fmtT((f.end - now) / 1000)}` : 'vazio · toque para plantar'}</button>`; }
  h += '</div>';
  if (empty > 1) h += `<p class="sub" style="margin-top:10px">Plantar em todos os ${empty} canteiros vazios:</p><div class="crops">${Object.entries(CROPS).filter(([, C]) => C.L <= L).map(([k, C]) => `<button class="crop" data-a="plant-all" data-k="${k}"><b>${C.name}</b><span>${icoSVG(C.cat)} ${cropYield(k)} · ${fmtT(C.s)}</span></button>`).join('')}</div>`;
  return h;
}
/* curral */
function curralCollect() {
  const o = Math.floor(S.cur.ovos), l = Math.floor(S.cur.leite);
  if (o + l < 1 || CINE || B) { toast('Ainda não há leite nem ovos'); return; }
  S.cur.ovos -= o; S.cur.leite -= l; gain('ovos', o); gain('leite', l); S.stats.curral = (S.stats.curral || 0) + 1; save(); dirty = true;
  cineCurral({ ovos: o, leite: l });
}
function curralHTML() {
  if (!S.b.curral.lvl) return '';
  const h = herd(), r = herdRates();
  return `<div class="stat"><span>Animais</span><span>${h.galinha} galinha${h.galinha > 1 ? 's' : ''}${h.vaca ? ` · ${h.vaca} vaca${h.vaca > 1 ? 's' : ''}` : ''}${h.cabra ? ` · ${h.cabra} cabra${h.cabra > 1 ? 's' : ''}` : ''} · ${h.cao} cão${h.cao > 1 ? 'es' : ''}</span></div>
    <div class="stat"><span>Produção</span><span>${icoSVG('ovos')} ${r.ovos}/h · ${icoSVG('leite')} ${r.leite}/h</span></div>
    <div class="stat"><span>Esperando no curral</span><span>${Math.floor(S.cur.ovos)} ovos · ${Math.floor(S.cur.leite)} leite</span></div>
    <p class="sub" style="margin:4px 0">Os cães de guarda lutam ao lado das tropas nas ondas.</p>
    <div class="actions"><button class="btn" data-a="curral-get" ${S.cur.ovos + S.cur.leite >= 1 ? '' : 'disabled'}>Recolher leite e ovos</button></div>`;
}
function pantryHTML() {
  return `<p class="sub" style="margin-top:10px">Despensa · até ${pantryCap()} de cada</p><div class="costs">${PANTRY.map(k => `<div class="cost">${icoSVG(k)}${fmt(S.pantry[k] || 0)}</div>`).join('')}</div>`;
}
/* Tesouro do Jarl */
function openTreasure() {
  sheetFor = null;
  openSheet(`<h2>Tesouro do Jarl</h2><p class="sub">Pedras preciosas achadas pelos mineiros</p>
    <div class="costs">${GEMS.map(g => `<div class="cost">${icoSVG(g)}${S.gems[g] || 0}</div>`).join('')}</div>
    <p class="sub" style="margin-top:10px">Relíquias · bônus para sempre</p>
    <div class="relics">${RELICS.map(r => { const own = S.relics[r.id]; return `<div class="relic${own ? ' own' : ''}"><div><b>${r.name}</b><p>${r.desc}</p>${own ? '' : costHTML(r.cost)}</div>${own ? '<span class="ok">Forjada ✓</span>' : `<button class="btn sm" data-a="relic" data-k="${r.id}" ${canAfford(r.cost) ? '' : 'disabled'}>Forjar</button>`}</div>`; }).join('')}</div>
    <p class="sub" style="margin-top:10px">Mercado · trocar por runas</p>
    <div class="market">${GEMS.map(g => `<button class="btn sm ghost" data-a="sell" data-k="${g}" ${S.gems[g] ? '' : 'disabled'}>${icoSVG(g)} 1 → ${GEM_RUNES[g]} ${icoSVG('runes')}</button>`).join('')}</div>
    <div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.k, v = +a.dataset.v;
  switch (a.dataset.a) {
    case 'exp-n': Life.sel[k].n += v; Snd.tap(); renderSheet(); break;
    case 'exp-d': Life.sel[k].d = v; Snd.tap(); renderSheet(); break;
    case 'exp-go': startExp(k); break;
    case 'exp-speed': speedExp(k); break;
    case 'exp-see': finishExp(k); break;
    case 'field': openField(v); break;
    case 'plant': plant(v, k); break;
    case 'plant-all': plant(0, k, true); break;
    case 'crop-speed': { const f = S.fields[v], c = Math.ceil((f.end - Date.now()) / 60000); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); break; } S.runes -= c; f.end = Date.now(); f.start = Math.min(f.start, f.end - 1000); harvest(v); break; }
    case 'curral-get': curralCollect(); break;
    case 'treasure': openTreasure(); break;
    case 'relic': { const r = RELICS.find(x => x.id === k); if (!canAfford(r.cost)) break; spend(r.cost); S.relics[k] = 1; Snd.done(); toast(`${r.name} forjada!`); save(); dirty = true; openTreasure(); break; }
    case 'armor': { const c = armorCost(S.armor || 0); if (!canAfford(c) || S.armor >= 10) break; spend(c); S.armor = (S.armor || 0) + 1; Snd.done(); toast(`Armaduras de couro nível ${S.armor}!`); save(); dirty = true; renderSheet(); break; }
    case 'sell': if (S.gems[k] > 0) { S.gems[k]--; S.runes += GEM_RUNES[k]; Snd.collect(); save(); dirty = true; openTreasure(); } break;
  }
});
$('#btnGems').addEventListener('click', () => { Snd.init(); Snd.tap(); openTreasure(); });
$('#cineSkip').addEventListener('click', () => { if (B && B.ending) finishEnding(); else skipCine(); });
$('#btnCam').addEventListener('click', toggleFollow);

/* etiquetas dos canteiros */
const ftags = [];
function buildFieldTags() {
  FIELDS.forEach((f, i) => {
    const el = document.createElement('div'); el.className = 'tag ftag';
    el.innerHTML = '<span class="sign"></span><div class="prog"><i></i><b></b></div><button class="bubble" aria-label="Colher"></button>';
    el.querySelector('.bubble').addEventListener('click', ev => { ev.stopPropagation(); Snd.init(); harvest(i); });
    el.querySelector('.sign').addEventListener('click', ev => { ev.stopPropagation(); Snd.init(); Snd.tap(); openField(i); });
    $('#tags').appendChild(el); ftags.push(el);
  });
}
function updateFieldTags() {
  const open = fieldsOpen(), now = Date.now();
  FIELDS.forEach(([c, r], i) => {
    const el = ftags[i]; if (!el) return;
    if (i >= open) { el.style.display = 'none'; return; }
    const [x, z] = hexPos(c, r); v3.set(x, .9, z).project(camera); el.style.display = v3.z < 1 ? '' : 'none';
    el.style.transform = `translate(${(v3.x + 1) / 2 * innerWidth}px,${(1 - v3.y) / 2 * innerHeight}px)`;
    const f = S.fields[i], sign = el.querySelector('.sign'), prog = el.querySelector('.prog'), bub = el.querySelector('.bubble');
    sign.hidden = !!f; if (!f) { sign.textContent = 'Plantar'; sign.classList.add('free'); }
    const ripe = f && now >= f.end;
    prog.hidden = !f || ripe; if (f && !ripe) { prog.querySelector('i').style.width = Math.min(100, (now - f.start) / (f.end - f.start) * 100) + '%'; prog.querySelector('b').textContent = fmtT((f.end - now) / 1000); }
    bub.hidden = !ripe; if (ripe && bub.dataset.k !== f.c) { bub.dataset.k = f.c; bub.innerHTML = icoSVG(CROPS[f.c].cat); }
  });
}
function pickField(sx, sy) {
  if (!fieldsOpen()) return -1;
  ndc.set(sx / innerWidth * 2 - 1, -(sy / innerHeight) * 2 + 1); ray.setFromCamera(ndc, camera);
  let best = -1, bd = .95;
  for (const h of [0, .3]) { ground.constant = -h; if (!ray.ray.intersectPlane(ground, hit)) continue; FIELDS.forEach(([c, r], i) => { if (i >= fieldsOpen()) return; const [x, z] = hexPos(c, r), d = Math.hypot(hit.x - x, hit.z - z); if (d < bd) { bd = d; best = i; } }); }
  ground.constant = 0; return best;
}

/* ========== Laço do jogo ========== */
function tick() {
  finished = []; trainedNow = 0; advance(Date.now());
  refreshHerd(); refreshPiles();
  ['lenha', 'mina', 'caca'].forEach(k => { const e = S.exp[k]; if (e && Date.now() >= e.end && !e.told) { e.told = 1; Snd.done(); toast(`${EXP[k].name} terminaram! Toque no ✓ para ver`); save(); } });
  if (trainedNow) { dirty = true; refreshGuards(); if (sheetFor === 'quartel' && !sheet.hidden) renderSheet(); }
  finished.forEach(id => { const p = plotById(id); Snd.done(); burst(p, '#f3d27a', 24); toast(`${DEF[p.type].name} chegou ao nível ${S.b[id].lvl}!`); dirty = true; });
  if (finished.length) refreshDecor();
  if (finished.length && sheetFor) renderSheet();
  renderBuilders();
  if (dirty) { renderHUD(); save(); dirty = false; }
}
setInterval(() => { tick(); if (sheetFor && !sheet.hidden && S.b[sheetFor] && (S.b[sheetFor].end || (sheetFor === 'quartel' && S.train) || ((sheetFor === 'serraria' && S.exp.lenha) || (sheetFor === 'pedreira' && S.exp.mina)) || sheetFor === 'horta' || sheetFor === 'curral') && !sheet.contains(document.activeElement && document.activeElement.tagName === 'INPUT' ? document.activeElement : null)) renderSheet(); }, 1000);
setInterval(() => { dirty = true; }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); dirty = true; } else save(); });


/* ========== Início ========== */
addEventListener('resize', resize);
resize(); renderHUD(); renderBuilders();
loadAll().then(() => {
  buildTerrain(); ship = buildShip();
  for (let i = 0; i < 6; i++) { const c = model(i % 2 ? 'cloud_small' : 'cloud_big', 2.2); c.traverse(m => { if (m.isMesh) m.castShadow = false; }); c.position.set(-35 + i * 13, 15 + (i % 3), -26 + (i % 2) * 6); scene.add(c); clouds.push(c); }
  buildFolk(); buildTags(); refreshDecor(); refreshGuards(); buildWorkSpots(); buildFieldTags(); refreshHerd(); refreshPiles(); buildWild();
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
window.__vs = { camera, setFace, faceFor, finishExp, harvest, curralCollect, cineT: () => CINE && CINE.t, S, tick, upgrade: id => upgrade(plotById(id)), collect: id => collect(plotById(id)), cam, placeCamera, startBattle, heroSkill, endBattle, get B() { return B; }, sim: sec => { let t = 0; while (t < sec && B) { stepBattle(.05); t += .05; } return t; }, train, renderSheet, openBuilding: id => openBuilding(plotById(id)) };
