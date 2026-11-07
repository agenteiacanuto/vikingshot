import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as SkeletonUtils from 'three/addons/utils/SkeletonUtils.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

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
  gear: '<path d="M5 19l9-9M13 4l7 7-3 3-7-7z" stroke="#2b1a08" stroke-width="1.6" fill="#c08cff"/>',
  saga: '<rect x="5" y="4" width="14" height="16" rx="2" fill="#e8d6a8" stroke="#6b4a12" stroke-width="1.4"/><rect x="3" y="3" width="18" height="3.5" rx="1.7" fill="#a8743f" stroke="#4a2c0f" stroke-width="1.2"/><rect x="3" y="17.5" width="18" height="3.5" rx="1.7" fill="#a8743f" stroke="#4a2c0f" stroke-width="1.2"/><path d="M9 9l3 5 3-5M12 9v6" stroke="#8a3a2a" stroke-width="1.5" fill="none"/>',
  mead: '<path d="M5 6c3-2 11-2 14 0l-2 13c-2 2-8 2-10 0z" fill="#e2b84a" stroke="#6b4a12" stroke-width="1.4"/><path d="M5 6c3 2 11 2 14 0" fill="#fff4cf" stroke="#6b4a12" stroke-width="1.2"/><path d="M19 9c3 0 3 6 0 6" stroke="#6b4a12" stroke-width="1.8" fill="none"/>',
  hammer: '<path d="M5 19l8-8" stroke="#b07a3a" stroke-width="3" stroke-linecap="round"/><path d="M11 5l6 6 2-2-6-6z" fill="#aeb7bc" stroke="#2c343a" stroke-width="1.3"/>'
};
document.querySelectorAll('svg[data-ico]').forEach(s => s.innerHTML = ICO[s.dataset.ico]);
const icoSVG = k => k && k.startsWith('h:') ? `<svg viewBox="0 0 24 24"><path d="M12 2l8 6-3 12H7L4 8z" fill="${(typeof HEROES !== 'undefined' && HEROES[k.slice(2)] ? RAR[HEROES[k.slice(2)].rar].col : '#d9a441')}" stroke="#2b1a08" stroke-width="1.4"/><text x="12" y="16" text-anchor="middle" font-size="9" font-weight="800" fill="#2b1a08">${k.slice(2, 3).toUpperCase()}</text></svg>` : `<svg viewBox="0 0 24 24">${ICO[k] || ''}</svg>`;
const RES = ['food', 'wood', 'stone', 'iron'];
const RES_NAME = { food: 'Comida', wood: 'Madeira', stone: 'Pedra', iron: 'Ferro', ouro: 'Ouro', rubi: 'Rubi', diamante: 'Diamante',
  leite: 'Leite', ovos: 'Ovos', gear: 'Equipamento', saga: 'Pergaminhos de Saga', mead: 'Hidromel', carne: 'Carne', couro: 'Couro', trofeu: 'Troféu de alce', frutas: 'Frutas', legumes: 'Legumes', verduras: 'Verduras', runes: 'Runas', meal: 'Refeições' };
const GEMS = ['ouro', 'rubi', 'diamante'], PANTRY = ['leite', 'ovos', 'frutas', 'legumes', 'verduras', 'carne'], TREAS = [...GEMS, 'couro', 'trofeu', 'saga', 'mead'];

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
  taverna: { name: 'Taverna', size: 2, time: 16, cost: { wood: 200, food: 150 }, unlock: 2,
             desc: 'Onde os heróis vikings se reúnem. Troque hidromel por fragmentos de heróis e recrute novos campeões.' },
  runas:   { name: 'Círculo de Runas', size: 2, time: 20, cost: { stone: 260, wood: 120 }, unlock: 3,
             desc: 'Pedras antigas onde os sábios estudam as runas. Pesquise melhorias para a economia, o exército, os heróis e a defesa.' },
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
  { id: 'taverna', type: 'taverna', c: 9, r: 4 },
  { id: 'runas', type: 'runas', c: 5, r: 7 },
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
const timeFor = (type, L) => Math.round(DEF[type].time * Math.pow(1.6, L - 1) * (1 - relic('build')) * (1 - .04 * RS('build')));
const rateFor = (type, L) => L > 0 && DEF[type].prod ? DEF[type].rate * Math.pow(1.3, L - 1) * (1 + relic('prod')) * (1 + .05 * RS('prod')) : 0; // por hora
const have = k => k.startsWith('h:') ? hs(k.slice(2)).sh : k === 'runes' ? S.runes : TREAS.includes(k) ? (S.gems[k] || 0) : PANTRY.includes(k) ? (S.pantry[k] || 0) : (S.res[k] || 0);
function spend(c) { for (const k in c) { if (k.startsWith('h:')) hs(k.slice(2)).sh -= c[k]; else if (k === 'runes') S.runes -= c[k]; else if (TREAS.includes(k)) S.gems[k] -= c[k]; else if (PANTRY.includes(k)) S.pantry[k] -= c[k]; else S.res[k] -= c[k]; } }
function gain(k, v) { // soma respeitando o limite do armazém
  if (k === 'gear') { for (let i = 0; i < v; i++) dropGear(null, Math.floor(S.camp.next / STAGES)); } else if (k.startsWith('h:')) hs(k.slice(2)).sh += v; else if (k === 'runes') S.runes += v; else if (TREAS.includes(k)) S.gems[k] = (S.gems[k] || 0) + v;
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
const capFor = r => Math.round((3000 + (S.b.armazem.lvl ? Math.round(3000 * Math.pow(1.45, S.b.armazem.lvl - 1)) : 0)) * (1 + .1 * RS('cap')));
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
  wolf:    { name: 'Lobo Sombrio', pl: 'Lobos Sombrios', model: 'Wolf', beast: true, h: .4, hp: 90, dmg: 11, rate: .8, range: .8, speed: 2.8 },
  bigwolf: { name: 'Fenrir, o Lobo Gigante', pl: 'Lobos Gigantes', model: 'Wolf', beast: true, h: 1, hp: 2200, dmg: 40, rate: 1.3, range: 1.4, speed: 2.2, scale: .6 },
  witch:   { name: 'Bruxa do Pântano', pl: 'Bruxas', model: 'Skeleton_Mage', r: 'Skeleton_Staff', hp: 1500, dmg: 38, rate: 1.6, range: 5.5, speed: 1.1, ranged: 'bolt', scale: .5 },
  giant:   { name: 'Gigante de Gelo', pl: 'Gigantes', model: 'Skeleton_Warrior', r: 'Skeleton_Axe', l: 'Skeleton_Shield_Small_A', hp: 3200, dmg: 55, rate: 1.8, range: 1.6, speed: .9, scale: .72 },
  hel:     { name: 'Guardião de Hel', pl: 'Guardiões', model: 'Skeleton_Rogue', r: 'Skeleton_Blade', hp: 3500, dmg: 55, rate: 1, range: 1.4, speed: 1.6, scale: .62 },
  boss:    { name: 'Rei Draugr', pl: 'Reis Draugr', model: 'Skeleton_Warrior', r: 'Skeleton_Axe', l: 'Skeleton_Shield_Small_A', hp: 1800, dmg: 35, rate: 1.6, range: 1.4, speed: 1.0, scale: .55 }
};
const MAXWAVE = 30;
const armyCap = () => S.b.quartel.lvl ? 4 + 2 * S.b.quartel.lvl + 2 * RS('army') : 0;
const armyCount = () => Object.values(S.army).reduce((a, b) => a + b, 0);
const queued = () => S.train ? S.train.left : 0;
const smithBonus = () => 1 + .1 * S.b.ferreiro.lvl;
const troopHpF = () => smithBonus() * (1 + relic('hp')) * (1 + .05 * (S.armor || 0)) * (1 + .05 * RS('thp')), troopDmgF = () => smithBonus() * (1 + relic('dmg')) * (1 + .05 * RS('tdmg'));
const towerDmg = L => Math.round(16 * Math.pow(1.25, L - 1) * (1 + .08 * RS('tower')));
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
  { t: 'Construa a Taverna', ok: () => lv('taverna') >= 1, r: { mead: 3 } },
  { t: 'Recrute ou evolua um herói', ok: () => HERO_IDS.some(id => id !== 'gunnar' && hs(id).lvl >= 1) || hs('gunnar').lvl >= 3, r: { saga: 6 } },
  { t: 'Vença a fase 1-4 da Saga', ok: () => S.camp.next >= 4, r: { mead: 2 } },
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
  { t: 'Equipe um item em um herói', ok: () => S.gear.some(g => g.on), r: { iron: 300 } },
  { t: 'Vença uma luta na Arena', ok: () => (S.arena && S.arena.wins) >= 1, r: { mead: 2 } },
  { t: 'Construa o Círculo de Runas', ok: () => lv('runas') >= 1, r: { stone: 400 } },
  { t: 'Pesquise uma runa no Círculo', ok: () => Object.keys(S.research).length >= 1, r: { runes: 15 } },
  { t: 'Complete o capítulo 1 da Saga', ok: () => S.camp.next >= 8, r: { mead: 3 } },
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
if (S.music === undefined) S.music = true;
if (S.voice === undefined) S.voice = true;
if (S.bintro === undefined) S.bintro = true;
if (!S.heroes) S.heroes = { gunnar: { sh: 0, lvl: 1, st: 1 } };
if (!S.team) S.team = ['gunnar'];
if (!S.research) S.research = {};
if (S.rs === undefined) S.rs = null;
if (!S.camp) S.camp = { next: 0, stars: {}, chest: {}, rep: { d: '', n: 0 } };
if (!S.gear) S.gear = [];
if (!S.patrol) S.patrol = Date.now();
if (!S.tower) S.tower = { best: 0 };
if (!S.tot) S.tot = {};
if (!S.ach) S.ach = {};
setTimeout(() => { if (typeof HERO_IDS === 'undefined') return; let any = 0; HERO_IDS.forEach(id => { const h = hs(id), need = RAR[HEROES[id].rar].need; if (!h.lvl && h.sh >= need) { h.sh -= need; h.lvl = 1; h.st = 1; if (S.team.length < teamSlots()) S.team.push(id); any = 1; toast(`${HEROES[id].name} entrou para a sua saga!`); } }); if (any) { save(); dirty = true; } }, 3000);
if (!S.cb) S.cb = { w: 0, got: [], d: '', n: 0, best: 0 };
if (!S.gfx) S.gfx = 'auto';
if (!S.daily) S.daily = {};
if (S.tut === undefined) S.tut = (S.mission > 3 || (S.b && S.b.salao && S.b.salao.lvl > 2)) ? 99 : 0;
if (!S.gems) S.gems = { ouro: 0, rubi: 0, diamante: 0 };
TREAS.forEach(k => { if (S.gems[k] === undefined) S.gems[k] = k === 'mead' ? 3 : 0; });
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
  init() { if (!this.ctx) { try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) {} } if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().then(() => typeof Music !== 'undefined' && Music.start(B ? 'batalha' : 'vila')); else if (this.ctx && typeof Music !== 'undefined' && !Music.timer && S.music) Music.start(B ? 'batalha' : 'vila'); },
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
  const min = s / 60, f = n * (fed ? 1.25 : 1) * (isWeekend() ? 1.5 : 1) * (1 + .08 * RS('exp')) * (k === 'caca' ? 1 + .1 * RS('hunt') : 1), e = EXP[k]; // base por viagem + por minuto (+50% no fim de semana)
  if (k === 'lenha') return { wood: Math.round(f * (18 + min * e.rate) * Math.pow(1.25, S.b.serraria.lvl - 1)) };
  if (k === 'caca') { const h = Math.pow(1.2, Math.max(0, S.b.cabana.lvl - 1)) * (1 + relic('hunt')); return { carne: Math.max(1, Math.round(f * (3 + min * e.rate) * h)), couro: Math.max(1, Math.round(f * (1 + min * .8) * h)) }; }
  const out = { stone: Math.round(f * (14 + min * e.rate) * Math.pow(1.25, Math.max(0, S.b.pedreira.lvl - 1))) };
  if (S.b.mina.lvl) out.iron = Math.round(f * (4 + min * 4) * Math.pow(1.25, S.b.mina.lvl - 1));
  return out;
}
const gemChance = () => (1 + .1 * S.b.mina.lvl) * (1 + relic('gem')) * (1 + .1 * RS('gem'));
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

/* ========== Heróis colecionáveis ========== */
const RAR = { comum: { n: 'Comum', col: '#c9bfa8', need: 10 }, raro: { n: 'Raro', col: '#6fb3ff', need: 20 }, epico: { n: 'Épico', col: '#c08cff', need: 30 }, lend: { n: 'Lendário', col: '#f3b23a', need: 50 } };
const HEROES = {
  gunnar:  { name: 'Gunnar', tit: 'o Lenhador', rar: 'comum', model: 'Barbarian', r: 'axe_2handed', l: 'mug_full', hp: 420, dmg: 30, rate: 1.1, range: 1, speed: 2.4, sk: 'warcry', skn: 'Grito de Guerra', skd: 'Aliados próximos causam +30% de dano por 6 segundos.' },
  erik:    { name: 'Erik', tit: 'o Ruivo', rar: 'comum', model: 'Ranger', l: 'crossbow_1handed', hp: 260, dmg: 26, rate: 1.2, range: 5.5, ranged: 'arrow', speed: 2.2, sk: 'boom', skn: 'Flecha Explosiva', skd: 'Uma flecha que explode e acerta todos em volta do alvo (dano 3x).' },
  harald:  { name: 'Harald', tit: 'Dente-Azul', rar: 'raro', model: 'Knight', r: 'sword_2handed', hp: 620, dmg: 36, rate: 1.2, range: 1.1, speed: 2.3, sk: 'charge', skn: 'Investida', skd: 'Avança contra o draugr mais distante e derruba quem estiver no caminho (dano 2,5x).' },
  leif:    { name: 'Leif', tit: 'a Sombra', rar: 'raro', model: 'Rogue', r: 'dagger', l: 'dagger', hp: 330, dmg: 40, rate: .7, range: .9, speed: 3, sk: 'backstab', skn: 'Golpe nas Sombras', skd: 'Some e reaparece atrás do inimigo mais fraco: dano 5x.' },
  ingrid:  { name: 'Ingrid', tit: 'a Curandeira', rar: 'raro', model: 'Rogue_Hooded', r: 'wand', l: 'spellbook_open', hp: 300, dmg: 18, rate: 1.3, range: 4.5, ranged: 'orb', speed: 2.2, sk: 'heal', skn: 'Bênção de Eir', skd: 'Cura 30% da vida de todos os aliados próximos.' },
  astrid:  { name: 'Astrid', tit: 'Flecha-Certeira', rar: 'epico', model: 'Ranger', l: 'bow_withString', hp: 380, dmg: 34, rate: 1, range: 6.5, ranged: 'arrow', speed: 2.3, sk: 'rain', skn: 'Chuva de Flechas', skd: 'Cobre uma área com flechas: dano 3x em todos os inimigos.' },
  freydis: { name: 'Freydis', tit: 'Escudo-de-Ferro', rar: 'epico', model: 'Knight', r: 'sword_1handed', l: 'shield_spikes', hp: 900, dmg: 30, rate: 1.1, range: 1, speed: 2.2, sk: 'wall', skn: 'Muralha de Escudos', skd: 'Aliados próximos recebem metade do dano por 5 segundos.' },
  ragnar:  { name: 'Ragnar', tit: 'Machado-Sangrento', rar: 'lend', model: 'Barbarian', r: 'axe_1handed', l: 'axe_1handed', hp: 800, dmg: 55, rate: .9, range: 1.1, speed: 2.6, sk: 'fury', skn: 'Fúria Berserker', skd: 'Gira os machados três vezes: dano 3x em todos ao redor.' },
  sigrid:  { name: 'Sigrid', tit: 'a Vidente', rar: 'lend', model: 'Mage', r: 'staff', hp: 420, dmg: 40, rate: 1.4, range: 6, ranged: 'orb', speed: 2.1, sk: 'thunder', skn: 'Raio de Thor', skd: 'Um raio atinge o alvo e salta para mais 4 inimigos: dano 4x.' }
};
const HERO_IDS = Object.keys(HEROES);
const hs = id => S.heroes[id] || (S.heroes[id] = { sh: 0, lvl: 0, st: 0 });
const heroMaxLv = st => 10 * st;
const heroLvCost = (id, l) => ({ saga: Math.ceil(l * 1.5 * (1 - .08 * RS('hxp'))), food: Math.round(80 * l * Math.pow(1.12, l) * (1 - .08 * RS('hxp')) / 10) * 10 });
const heroStarCost = (id, st) => RAR[HEROES[id].rar].need * st;
function hStats(id) {
  const H = HEROES[id], h = hs(id), f = (1 + .07 * (h.lvl - 1)) * (1 + .18 * (h.st - 1)), gq = S.gear ? gearOf(id) : { arma: 0, armadura: 0, amuleto: 0 };
  return { hp: Math.round(H.hp * f * (1 + .06 * RS('hhp')) * (1 + gq.armadura)), dmg: Math.round(H.dmg * f * (1 + .06 * RS('hdmg')) * (1 + gq.arma + gq.amuleto * .4)), cd: 11 * (1 - .06 * RS('hcd')) * (1 - gq.amuleto * .6) };
}
const teamSlots = () => Math.min(3, 1 + Math.floor(S.b.salao.lvl / 3));
const heroPower = id => { const h = hs(id); if (!h.lvl) return 0; const s = hStats(id); return Math.round((s.hp / 10 + s.dmg * 2)); };

/* recrutamento na taverna (com hidromel ganho jogando, nunca vendido) */
const RECRUIT_ODDS = [['lend', .04], ['epico', .14], ['raro', .32], ['comum', .5]];
function recruitOnce(force) {
  let r = Math.random(), rar = 'comum';
  if (force) rar = Math.random() < .2 ? 'lend' : 'epico';
  else for (const [k, p] of RECRUIT_ODDS) { if (r < p) { rar = k; break; } r -= p; }
  const pool = HERO_IDS.filter(id => HEROES[id].rar === rar), id = pool[Math.floor(Math.random() * pool.length)];
  const n = { comum: 4, raro: 3, epico: 3, lend: 2 }[rar] + Math.floor(Math.random() * 2);
  hs(id).sh += n; return { id, n, rar };
}

/* ========== Círculo de Runas (pesquisa) ========== */
const TECH = [
  { br: 'Economia', list: [['prod', 'Colheita Farta', '+5% produção'], ['cap', 'Celeiros', '+10% capacidade do armazém'], ['build', 'Mestres Construtores', '−4% tempo de obra'], ['exp', 'Trabalho Duro', '+8% nas expedições']] },
  { br: 'Militar', list: [['tdmg', 'Lâminas Afiadas', '+5% dano das tropas'], ['thp', 'Cotas de Malha', '+5% vida das tropas'], ['train', 'Treino Intenso', '−8% tempo de treino'], ['army', 'Grande Exército', '+2 vagas no exército']] },
  { br: 'Heróis', list: [['hdmg', 'Sangue de Odin', '+6% dano dos heróis'], ['hhp', 'Pele de Urso', '+6% vida dos heróis'], ['hcd', 'Runas Rápidas', '−6% recarga das habilidades'], ['hxp', 'Sagas Antigas', '−8% custo de nível dos heróis']] },
  { br: 'Defesa', list: [['wall', 'Pedras Rúnicas', '+10% vida da muralha'], ['tower', 'Arqueiros de Elite', '+8% dano das torres e do castelo'], ['gem', 'Olho do Mineiro', '+10% chance de gemas'], ['hunt', 'Rastreadores', '+10% na caça']] }
];
const TECH_BY = {}; TECH.forEach((b, bi) => b.list.forEach(([k, n, d], i) => TECH_BY[k] = { k, n, d, bi, i }));
function RS(k) { return S && S.research ? (S.research[k] || 0) : 0; }
const techCost = (k, l) => { const t = TECH_BY[k], f = Math.pow(1.75, l), base = [{ food: 200, wood: 260 }, { food: 180, wood: 120, iron: 60 }, { food: 260, stone: 160 }, { wood: 160, stone: 240 }][t.bi]; const o = {}; for (const r in base) o[r] = Math.round(base[r] * f / 10) * 10; if (l >= 3) o.runes = 5 * (l - 2); return o; };
const techTime = l => Math.round(60 * Math.pow(2.2, l));
const techReq = l => 2 * l + 1; // nível do Círculo pedido para pesquisar o nível l+1

/* ========== Saga (campanha em capítulos) ========== */
const CHAPTERS = [
  { name: 'Praias de Sangue', fog: '#9db9c8', sky: '#9db9c8', light: '#ffffff', pool: ['minion', 'minion', 'warrior'], boss: 'boss', hero: 'harald', props: 'beach' },
  { name: 'Floresta dos Lobos', fog: '#5f7a5a', sky: '#6b8566', light: '#d9f0c8', pool: ['wolf', 'minion', 'rogue', 'wolf'], boss: 'bigwolf', hero: 'leif', props: 'forest' },
  { name: 'Pântano dos Afogados', fog: '#4f6a4a', sky: '#56704f', light: '#bfe0a8', pool: ['minion', 'mage', 'warrior', 'rogue'], boss: 'witch', hero: 'ingrid', props: 'swamp' },
  { name: 'Montanhas Geladas', fog: '#c8d6e4', sky: '#d4e0ec', light: '#e0ecff', pool: ['warrior', 'warrior', 'mage', 'wolf'], boss: 'giant', hero: 'freydis', props: 'rocks' },
  { name: 'Ruínas de Niflheim', fog: '#4a4460', sky: '#4f4868', light: '#c8b8ff', pool: ['rogue', 'mage', 'warrior', 'minion'], boss: 'witch', hero: 'astrid', props: 'ruins' },
  { name: 'Portões de Hel', fog: '#5a2a24', sky: '#6a2c22', light: '#ffb8a0', pool: ['warrior', 'rogue', 'mage', 'wolf'], boss: 'hel', hero: 'ragnar', props: 'ruins' }
];
const STAGES = 8, campIdx = (c, s) => c * STAGES + s;
function stageDef(c, s) {
  const g = campIdx(c, s), C = CHAPTERS[c], n = Math.min(16, 5 + Math.round(g * .25) + (s === 7 ? 0 : 0)), list = [];
  if (s === 7 || s === 3) list.push(s === 7 ? C.boss : C.pool[2]);
  let k = g * 13 + 5; while (list.length < n) { k = (k * 31 + 11) % 97; list.push(C.pool[k % C.pool.length]); }
  return { list, lvl: Math.pow(1.058, g) * .95, boss: s === 7 };
}
function stageReward(c, s, first) {
  if (!first) return { food: 150 + 60 * c, wood: 150 + 60 * c, saga: 1 };
  const r = { saga: 2 + c, runes: 4 + c * 2, food: 200 * (c + 1), wood: 200 * (c + 1) };
  if (s % 2 === 1) r.mead = 1; if (s === 7) { r.mead = 3; r['h:' + CHAPTERS[c].hero] = 10; } else if (s % 3 === 2) r['h:' + CHAPTERS[c].hero] = 3;
  if (c >= 1) r.iron = 80 * c;
  return r;
}
const campStars = () => Object.values(S.camp.stars).reduce((a, b) => a + b, 0);
const chapStars = c => { let t = 0; for (let s = 0; s < STAGES; s++) t += S.camp.stars[campIdx(c, s)] || 0; return t; };
const CHAP_CHEST = c => ({ mead: 5, runes: 20 + c * 10, ['h:' + CHAPTERS[c].hero]: 15 });

/* ========== Eventos semanais ========== */
const EVENTS = [
  { id: 'construtor', name: 'Semana do Construtor', desc: 'Pontos ao iniciar obras e pesquisas.', pts: { obras: 30, pesquisa: 50 } },
  { id: 'cacada', name: 'Grande Caçada', desc: 'Pontos por expedições: caça, lenha e mineração.', pts: { exp_caca: 45, exp_lenha: 15, exp_mina: 25 } },
  { id: 'furia', name: 'Fúria dos Draugr', desc: 'Pontos por ondas e fases da Saga vencidas.', pts: { ondas: 70, saga: 45 } },
  { id: 'freyr', name: 'Bênção de Freyr', desc: 'Pontos por colheitas, curral e coletas.', pts: { colher: 30, curral: 25, coletar: 6 } }
];
const EV_TIERS = [[100, { mead: 1, runes: 10 }], [300, { saga: 6, mead: 1 }], [600, { 'h:astrid': 6, runes: 15 }], [1000, { mead: 3, ouro: 2 }], [1600, { 'h:sigrid': 10, runes: 40 }]];
const weekNo = () => Math.floor((Date.now() / 864e5 + 3) / 7); // semanas começando na segunda
const curEvent = () => EVENTS[weekNo() % EVENTS.length];
const evEndsIn = () => ((weekNo() + 1) * 7 - 3) * 864e5 - Date.now();
function evState() { const w = weekNo(); if (!S.ev || S.ev.w !== w) S.ev = { w, pts: 0, got: [] }; return S.ev; }
function evAdd(k, n = 1) { const E = curEvent(), p = E.pts[k]; if (!p) return; const st = evState(); st.pts += p * n; }

/* ========== Equipamentos dos heróis ========== */
const GSLOT = { arma: { n: 'Arma', st: 'dano', names: ['Machado', 'Lâmina', 'Martelo', 'Lança'] }, armadura: { n: 'Armadura', st: 'vida', names: ['Cota', 'Gibão', 'Couraça', 'Manto'] }, amuleto: { n: 'Amuleto', st: 'recarga', names: ['Amuleto', 'Runa', 'Talismã', 'Colar'] } };
const GRAR = { comum: { b: .05, suf: 'de Ferro', m: 1 }, raro: { b: .09, suf: 'do Lobo', m: 1.6 }, epico: { b: .14, suf: 'de Valhalla', m: 2.4 }, lend: { b: .2, suf: 'de Odin', m: 3.5 } };
const gearVal = it => GRAR[it.rar].b * (1 + .12 * it.lv);
const gearName = it => `${GSLOT[it.slot].names[it.v % 4]} ${GRAR[it.rar].suf}`;
const gearTxt = it => it.slot === 'amuleto' ? `−${Math.round(gearVal(it) * 60)}% recarga · +${Math.round(gearVal(it) * 40)}% dano` : `+${Math.round(gearVal(it) * 100)}% ${GSLOT[it.slot].st}`;
function dropGear(minRar, chap = 0) {
  const r = Math.random(), order = ['comum', 'raro', 'epico', 'lend'];
  let rar = r < .02 + chap * .012 ? 'lend' : r < .1 + chap * .035 ? 'epico' : r < .42 ? 'raro' : 'comum';
  if (minRar && order.indexOf(rar) < order.indexOf(minRar)) rar = minRar;
  const slots = Object.keys(GSLOT), it = { uid: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), slot: slots[Math.floor(Math.random() * 3)], rar, lv: 0, v: Math.floor(Math.random() * 4), on: null };
  S.gear.push(it); if (S.gear.length > 80) { const i = S.gear.findIndex(g => !g.on && g.rar === 'comum'); if (i >= 0) S.gear.splice(i, 1); }
  return it;
}
function gearOf(id) { const o = { arma: 0, armadura: 0, amuleto: 0 }; S.gear.forEach(g => { if (g.on === id) o[g.slot] = gearVal(g); }); return o; }
const gearUpCost = it => ({ iron: Math.round(40 * (it.lv + 1) * GRAR[it.rar].m / 5) * 5, wood: Math.round(60 * (it.lv + 1) * GRAR[it.rar].m / 5) * 5 });
const gearSalvage = it => Math.round(30 * GRAR[it.rar].m * (1 + it.lv * .5));
const GEAR_ICO = { arma: '<path d="M5 19l9-9M13 4l7 7-3 3-7-7z" stroke="#2b1a08" stroke-width="1.6" fill="currentColor"/>', armadura: '<path d="M6 4l6 2 6-2 2 5-3 2v9H7v-9L4 9z" fill="currentColor" stroke="#2b1a08" stroke-width="1.5"/>', amuleto: '<path d="M8 3q4 6 8 0" stroke="#2b1a08" stroke-width="1.5" fill="none"/><circle cx="12" cy="14" r="6" fill="currentColor" stroke="#2b1a08" stroke-width="1.5"/><path d="M12 10v8M9 13l3-3 3 3" stroke="#2b1a08" stroke-width="1.3" fill="none"/>' };
const gearIco = it => `<svg viewBox="0 0 24 24" style="color:${RAR[it.rar].col}">${GEAR_ICO[it.slot]}</svg>`;

/* ========== Patrulha: prêmios acumulados com o jogo fechado ========== */
const PATROL_MAX = 12 * 3600e3;
function patrolRate() { const g = S.camp.next; return { food: 60 * (1 + g * .15), wood: 60 * (1 + g * .15), stone: 40 * (1 + g * .15), saga: .4 * (1 + g / 16), runes: .5, mead: .05 }; } // por hora
function patrolLoot() {
  const h = Math.min(PATROL_MAX, Date.now() - S.patrol) / 3600e3, r = patrolRate(), o = {};
  for (const k in r) { const v = r[k] * h; if (v >= 1) o[k] = Math.floor(v); }
  return { h, o };
}
function claimPatrol() {
  const { h, o } = patrolLoot(); if (h < 1 / 60 || !Object.keys(o).length) { toast('A patrulha acabou de sair. Volte daqui a pouco!'); return; }
  for (const k in o) gain(k, o[k]); S.patrol = Date.now(); passXP(Math.round(h * 4)); Snd.chime(); save(); dirty = true;
  openSheet(rewardCard('Patrulha voltou!', `${fmtT(h * 3600)} de patrulha pelo fiorde`, o));
}

/* ========== Passe do Jarl (temporada de 4 semanas) ========== */
const PASS_LV = 30, PASS_XP = 100;
const seasonNo = () => Math.floor(weekNo() / 4);
const seasonEnds = () => ((seasonNo() + 1) * 28 - 3) * 864e5 - Date.now();
function passState() { const s = seasonNo(); if (!S.pass || S.pass.s !== s) S.pass = { s, xp: 0, got: [] }; return S.pass; }
function passReward(i) { // i = 0..29
  const R = [{ runes: 10 }, { saga: 4 }, { mead: 1 }, { food: 1500, wood: 1500 }, { gear: 1 }, { ['h:' + HERO_IDS[(i * 7 + seasonNo()) % HERO_IDS.length]]: 5 }, { stone: 1200, iron: 400 }, { saga: 6 }, { mead: 2 }];
  if ((i + 1) % 10 === 0) return { ['h:' + ['sigrid', 'ragnar', 'freydis'][((i + 1) / 10 - 1 + seasonNo()) % 3]]: 12, gear: 1, runes: 30 };
  return R[i % R.length];
}
const PASS_XP_OF = { coletar: 1, obras: 8, exp_lenha: 6, exp_mina: 6, exp_caca: 6, colher: 5, curral: 4, ondas: 25, treinar: 1, saga: 15, pesquisa: 10, recrutar: 2, arena: 15, torre: 15, clan: 15 };
function passXP(n) { const p = passState(), before = Math.floor(p.xp / PASS_XP); p.xp = Math.min(PASS_LV * PASS_XP, p.xp + n); if (Math.floor(p.xp / PASS_XP) > before && typeof toast === 'function') toast(`Passe do Jarl: nível ${Math.floor(p.xp / PASS_XP)}!`); }

/* ========== Arena ========== */
const ARENA_TICKETS = 5;
const BOT_NAMES = ['Ulf Barba-Negra', 'Sven Punho-de-Ferro', 'Hilda Corvo', 'Torvald o Gordo', 'Ingvar Olho-de-Lobo', 'Brynja Lança-Fria', 'Halvar o Calvo', 'Ketil Nariz-Chato', 'Runa das Neves', 'Orm Serpente', 'Dagny Escudo-Rubro', 'Asbjorn Urso-Pardo'];
function arenaState() { if (!S.arena) S.arena = { rating: 1000, day: '', used: 0, wins: 0 }; if (S.arena.day !== today()) { S.arena.day = today(); S.arena.used = 0; } return S.arena; }
function mySnapshot() {
  const team = S.team.map(id => { const s = hStats(id), h = hs(id); return { id, lvl: h.lvl, st: h.st, hp: s.hp, dmg: s.dmg }; });
  const j = heroStats(); return { team, jarl: { hp: Math.round(j.hp), dmg: Math.round(j.dmg) }, army: { ...S.army }, mul: +(troopHpF().toFixed(2)), mul2: +(troopDmgF().toFixed(2)) };
}
const snapPower = sn => Math.round(sn.team.reduce((a, t) => a + t.hp / 10 + t.dmg * 2, 0) + (sn.jarl.hp / 10 + sn.jarl.dmg * 2) + Object.entries(sn.army).reduce((a, [k, n]) => a + n * TROOPS[k].pow * 12 * (sn.mul || 1), 0));
function botSnapshot(i) { // rival gerado pelo jogo, com força parecida com a sua
  const me = mySnapshot(), f = .8 + Math.random() * .45, pick = HERO_IDS.slice().sort(() => Math.random() - .5).slice(0, Math.max(1, me.team.length));
  const lv = Math.max(1, Math.round((me.team.reduce((a, t) => a + t.lvl, 0) / Math.max(1, me.team.length)) * f));
  const team = pick.map(id => { const H = HEROES[id], st = Math.max(1, Math.min(5, Math.round(lv / 10) + 1)), m = (1 + .07 * (lv - 1)) * (1 + .18 * (st - 1)); return { id, lvl: lv, st, hp: Math.round(H.hp * m), dmg: Math.round(H.dmg * m) }; });
  const army = {}; Object.keys(me.army).forEach(k => army[k] = Math.round((me.army[k] || 0) * f));
  return { name: BOT_NAMES[(i + S.arena.rating) % BOT_NAMES.length], bot: true, rating: S.arena.rating + Math.round((f - 1) * 200), snap: { team, jarl: { hp: Math.round(me.jarl.hp * f), dmg: Math.round(me.jarl.dmg * f) }, army, mul: me.mul * f, mul2: me.mul2 * f } };
}

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
  if (S.rs && now >= S.rs.end) { S.research[S.rs.k] = (S.research[S.rs.k] || 0) + 1; finished.push('rs:' + S.rs.k); S.rs = null; }
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
  b.end = Date.now() + timeFor(p.type, L) * 1000; b.to = L; dcount('obras');
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
  dcount('coletar'); b.buf -= take; S.res[d.prod] += take; S.stats[d.prod] = (S.stats[d.prod] || 0) + take;
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
  dcount('treinar', n); const per = t.time * (1 - .08 * RS('train')); if (S.train) S.train.left += n; else S.train = { type, left: n, per, next: Date.now() + per * 1000 };
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
  cam.d = Math.max(12, Math.min(55, cam.d)); cam.x = Math.max(CAMB.x0, Math.min(CAMB.x1, cam.x)); cam.z = Math.max(CAMB.z0, Math.min(CAMB.z1, cam.z));
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
manager.onProgress = (url, done, total) => { const b = $('#loadBar'); if (b) b.style.width = Math.round(done / total * 100) + '%'; };
const loader = new GLTFLoader(manager); loader.setMeshoptDecoder(MeshoptDecoder);
const G = {};
const ENV = `hex_grass hex_water hex_coast_A hex_coast_B hex_coast_C hex_coast_D mountain_A mountain_B mountain_C mountain_A_grass_trees mountain_B_grass_trees
hills_A_trees hills_B_trees hill_single_A trees_A_large trees_A_medium trees_A_small trees_B_large trees_B_medium tree_single_A tree_single_B
rock_single_A rock_single_C rock_single_E building_castle_red building_grain building_windmill_red building_lumbermill_red building_mine_red
building_market_red building_barracks_red building_blacksmith_red building_tower_A_red building_home_A_red building_home_B_red building_well_red
building_tavern_red building_dirt building_stage_A building_stage_B building_stage_C building_scaffolding flag_red barrel crate_A_big sack
resource_lumber resource_stone wheelbarrow tent weaponrack cloud_big cloud_small building_tower_B_red building_destroyed
dagger staff wand crossbow_1handed sword_2handed shield_spikes spellbook_open quiver mug_full wall_straight wall_straight_gate axe_1handed axe_2handed sword_1handed shield_round_barbarian shield_round_color bow_withString target`.split(/\s+/);
const CHARS = ['Barbarian', 'Rogue', 'Ranger', 'Knight', 'Rogue_Hooded', 'Mage', 'Skeleton_Minion', 'Skeleton_Warrior', 'Skeleton_Rogue', 'Skeleton_Mage'];
const CHAR_GLTF = ['Skeleton_Axe', 'Skeleton_Blade', 'Skeleton_Shield_Small_A', 'Skeleton_Staff'];
const ANIMS = ['Rig_Medium_MovementBasic', 'Rig_Medium_General'];
// primeiro o essencial da vila; draugr, animais e plantas carregam depois, sem travar a abertura
const CORE_CHARS = ['Barbarian', 'Rogue', 'Ranger', 'Knight', 'Rogue_Hooded'];
let restReady = false, restPromise = null;
function loadAll() {
  const jobs = ENV.map(n => loader.loadAsync(`models/env/${n}.gltf`).then(g => { G[n] = g; }))
    .concat(CORE_CHARS.concat(ANIMS).map(n => loader.loadAsync(`models/chars/${n}.glb`).then(g => { G[n] = g; })));
  return Promise.all(jobs);
}
function loadRest() {
  if (restPromise) return restPromise;
  const lim = 6, list = CHARS.filter(n => !CORE_CHARS.includes(n)).map(n => [n, `models/chars/${n}.glb`]).concat(CHAR_GLTF.map(n => [n, `models/chars/${n}.gltf`]), lifeModels());
  let i = 0; const worker = () => i < list.length ? (([k, u]) => loader.loadAsync(u).then(g => { G[k] = g; }).catch(e => console.warn(u, e)).then(worker))(list[i++]) : Promise.resolve();
  restPromise = Promise.all(Array.from({ length: lim }, worker)).then(() => { restReady = true; Object.values(plotGroups).forEach(g => g.userData.sig = null); });
  return restPromise;
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
  { c: 8, r: 6, m: 'building_home_A_red', lv: 2 }, { c: 6, r: 6, m: 'building_home_B_red', lv: 3 }, 
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
const PLOT_H = { taverna: 1.8, runas: 1.2, cabana: 1.2, muralha: 1.3, horta: .9, curral: 1.1, salao: 4.4, fazenda: 1.4, serraria: 1.6, pedreira: 1.6, mina: 1.7, armazem: 1.6, quartel: 2.2, ferreiro: 1.6, torre: 2.8 };
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
    case 'horta': { put(g, 'building_dirt'); if (!restReady) { g.userData.sig = null; break; } const C = CROPS.alface, C2 = CROPS.cenoura; CROP_SPOTS.slice(0, 5).forEach(([dx, dz], k) => { const o = cropModel(k % 2 ? C2 : C, 4); o.position.set(dx * .9, .1, dz * .9); g.add(o); }); if (tier >= 2) put(g, 'wheelbarrow', .75, .55, .8, .7); if (tier >= 3) put(g, 'sack', -.75, .55, 0, .8); break; }
    case 'curral': {
      if (!restReady) { g.userData.sig = null; put(g, 'building_dirt'); break; }
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
    case 'taverna': put(g, 'building_tavern_red'); put(g, 'barrel', -.75, .55, 0, .65); if (tier >= 2) put(g, 'barrel', .75, .6, .4, .6); if (tier >= 3) put(g, 'flag_red', .6, 1.2, -.3, 1.4); break;
    case 'runas': {
      const n = 6 + (tier - 1) * 2, glow = new THREE.MeshBasicMaterial({ color: '#b59cff' });
      for (let i = 0; i < n; i++) { const a = i / n * TAU, st = mesh(new THREE.BoxGeometry(.2, .55 + (i % 2) * .15, .12), '#868e84', Math.cos(a) * .72, .3, Math.sin(a) * .72); st.rotation.y = -a; g.add(st); const r = new THREE.Mesh(new THREE.PlaneGeometry(.08, .2), glow); r.position.set(Math.cos(a) * .64, .35, Math.sin(a) * .64); r.rotation.y = -a + Math.PI / 2; g.add(r); }
      g.add(mesh(new THREE.CylinderGeometry(.25, .3, .25, 8), '#6d7468', 0, .12, 0)); const orb = new THREE.Mesh(new THREE.OctahedronGeometry(.13), glow); orb.position.y = .45; orb.name = 'orb'; g.add(orb);
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
    case 'serraria': put(g, 'building_lumbermill_red'); put(g, 'resource_lumber', -.6, .55, .3, .8); if (tier >= 2 && G.Wagon) { const w = shadowize(G.Wagon.scene.clone(true)); w.scale.setScalar(.42 / heightOf(w)); w.position.set(.75, 0, .45); w.rotation.y = 2.4; g.add(w); } break;
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
  CORE_CHARS.concat(CORE_CHARS.slice(0, 2)).forEach((n, k) => {
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
const boltGeo = new THREE.SphereGeometry(.13, 8, 6), boltMat = new THREE.MeshBasicMaterial({ color: '#8dffb8' }), orbMat = new THREE.MeshBasicMaterial({ color: '#ffe48a' });
function shoot(kind, sx, sy, sz, target, dmg, side, aoe = 0) {
  let m;
  if (kind === 'arrow') m = new THREE.Mesh(arrowGeo, arrowMat);
  else if (kind === 'orb') m = new THREE.Mesh(boltGeo, orbMat);
  else if (kind === 'bolt') m = new THREE.Mesh(boltGeo, boltMat);
  else { m = G.axe_1handed.scene.clone(true); m.scale.setScalar(.6); }
  m.position.set(sx, sy, sz); scene.add(m);
  const [tx, tz] = posOf(target), d = Math.hypot(tx - sx, tz - sz);
  B.proj.push({ m, kind, sx, sy, sz, tx, tz, target, t: 0, dur: Math.max(.25, d / (kind === 'axe' ? 11 : 14)), arc: kind === 'bolt' || kind === 'orb' ? .3 : Math.min(2, d * .18), dmg, side, aoe });
  if (kind === 'arrow' || kind === 'axe') Snd.shoot();
}

/* alvos: unidades ou prédios */
const posOf = t => t.isB ? [t.x, t.z] : [t.o.position.x, t.o.position.z];
const alive = t => t && (t.isB ? t.hp > 0 : !t.dead && t.on);
const dist2 = (a, b) => { const [ax, az] = posOf(a), [bx, bz] = posOf(b); return Math.hypot(ax - bx, az - bz); };

function mkUnit(side, kind, x, z) {
  const hero = kind === 'hero', D = hero ? HERO : kind === 'dog' ? DOG : kind.startsWith('h_') ? heroUnitDef(kind.slice(2)) : kind.startsWith('x_') ? B.exD[kind] : side === 'ally' ? TROOPS[kind] : FOES[kind];
  const w = B.wave, scale = D.scale || .3;
  const c = D.beast ? mkBeast(D.model, D.h) : mkChar(D.model, scale, D.r, D.l);
  c.o.position.set(x, 0, z); c.o.visible = false; scene.add(c.o);
  let hp, dmg;
  if (hero) { const h = heroStats(); hp = h.hp; dmg = h.dmg; const ring = new THREE.Mesh(ringGeo, heroRingMat); ring.position.y = .05; ring.scale.setScalar(1 / scale * .3 * 2.6); c.o.add(ring); }
  else if (D.isHero) { hp = D.hp; dmg = D.dmg; }
  else if (side === 'ally') { hp = D.hp * troopHpF() * (D.beast ? 1 : 1); dmg = D.dmg * troopDmgF(); }
  else if (D.exact) { hp = D.hp; dmg = D.dmg; }
  else if (B.island) { hp = D.hp * B.lvlF; dmg = D.dmg * Math.pow(B.lvlF, .8); }
  else { hp = D.hp * Math.pow(1.08, w - 1); dmg = D.dmg * Math.pow(1.05, w - 1); }
  const u = Object.assign(c, { side, kind, D, hp, max: hp, dmg, rate: D.rate, range: D.range, speed: D.speed, ranged: D.ranged,
    rad: scale / .3 * .3, cd: Math.random() * .5, busy: 0, pend: null, target: null, rt: 0, dead: false, on: false, deadT: 0,
    bar: mkBar(hero || D.isHero ? 'hero' : side, hero ? .9 : D.isHero ? .75 : (D.scale || .3) > .45 ? 1.4 : .6), barY: ((D.scale || .3) > .45 ? 1.55 + ((D.scale || .3) - .55) * 2 : hero ? 1.15 : D.isHero ? 1.05 : .95) });
  if (D.isHero) { u.sk = D.sk; u.skMax = D.cd; u.skCd = D.cd * .4; }
  u.bs = c.o.scale.x; if (side === 'ally' && !D.beast) addFace(u);
  B.units.push(u); return u;
}
function activate(u, rise) {
  u.on = true; u.o.visible = true; if (u.face) setFace(u, 'angry');
  if (u.side === 'enemy' && B.walls) u.wside = ['s', 'e', 'w'].find(k => outsideOf(k, u.o.position.x, u.o.position.z)) || null;
  if (u.kind === 'boss') { toast('O Rei Draugr chegou!'); say('O Rei Draugr chegou!'); setTimeout(() => bcut(() => [u.o.position.x, .4, u.o.position.z], 2.2, 'O Rei Draugr!', 0), 1500); }
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
  if (t.shieldT > 0) d *= .5;
  t.hp -= d; burstAt(t.o.position.x, .5, t.o.position.z, t.side === 'enemy' ? '#d8d2c0' : '#b02a1e', 4, .025); Snd.hit();
  dmgNum(t.o.position.x, t.barY + .15, t.o.position.z, d, t.side === 'enemy' ? '#fff1c2' : '#ff6a5a', d >= 60); t.sq = .14;
  if (t.hp <= 0) { die(t); return; }
  if (t.face) faceFor(t, 'hurt', .45);
  if (!t.busy && t.kind !== 'boss' && t.kind !== 'hero' && Math.random() < .25) { anim(t, 'hit', .4); t.busy = .35; }
}
function die(u) {
  u.dead = true; u.pend = null; anim(u, 'die'); if (u.face) setFace(u, 'hurt'); u.bar.bg.visible = u.bar.fg.visible = false; Snd.die();
  if (u.side === 'enemy') B.killed++;
  if (u.kind === 'hero') { if (B.island) { B.heroDown = 1e9; toast('O Jarl caiu!'); } else { B.heroDown = 8; toast('O Jarl caiu! Ele volta em 8 segundos'); } }
  if (u.D.isHero) toast(`${u.D.name} caiu!`);
}

function startBattle() {
  if (B) return;
  if (!restReady) { toast('Os draugr estão chegando… só um instante'); closeSheet(); loadRest().then(() => startBattle()); return; }
  if (S.wave > MAXWAVE) { toast('Todas as ondas foram vencidas!'); return; }
  Snd.init(); closeSheet();
  const w = S.wave;
  B = { spd: S.bspd || 1, wave: w, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: 0, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0 };
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
  S.team.forEach((id, i) => { const u = mkUnit('ally', 'h_' + id, hx - .9 + i * .9, hz + 2.4); u.spawnAt = .2 + i * .25; B.queue.push(u); });
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
  B.ship = buildDrakkar(true, true); B.ship.scale.setScalar(.75); B.ship.position.set(-3, -.05, 34); B.ship.rotation.y = Math.PI / 2; scene.add(B.ship);
  B.extraShips = w % 10 === 0 ? [-1, 1].map(sd => { const sh = buildDrakkar(true, false); sh.scale.setScalar(.65); sh.position.set(-3 + sd * 6, -.05, 39); sh.rotation.y = Math.PI / 2 + sd * .1; sh.userData.dz = 5; scene.add(sh); return sh; }) : [];
  document.body.classList.add('battle'); $('#bhud').hidden = false; $('#bWave').textContent = 'Onda ' + w + (w % 10 === 0 ? ' · Chefe' : '');
  $('#bHint').hidden = false; setTimeout(() => { const h = $('#bHint'); if (h) h.hidden = true; }, 6000);
  folk.forEach(f => f.o.visible = false); guards.forEach(g => g.o.visible = false);
  B.follow = true; B.slow = 1; B.oldD = cam.d; cam.d = Math.min(cam.d, 20); cam.x = hx; cam.z = hz + 2.6; placeCamera(); $('#btnCam').classList.add('on');
  Music.start('batalha');
  if (S.bintro !== false) startIntro(); else { Snd.horn(); say('Os draugr se aproximam! Defendam a vila!'); }
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
    if (!best && B.island) B.units.forEach(t => { if (t.side === 'ally') consider(t); });
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
  if (stepHeroExtras(u, dt)) return;
  u.cd -= dt;
  if (u.pend) {
    u.pend.t -= dt;
    if (u.pend.t <= 0) {
      const t = u.pend.target; u.pend = null;
      if (alive(t)) {
        const p = u.o.position;
        if (u.ranged) shoot(u.ranged, p.x, .7, p.z, t, u.dmg * dmgMul(u), u.side);
        else if (dist2(u, t) <= u.range + (t.rad || .3) + .6) hurt(t, u.dmg * dmgMul(u));
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
      const i = B.units.indexOf(u), [rx, rz] = B.rally || [1.5, 3.2]; if (moveToward(u, rx + (i % 5) * .6 - 1.2, rz + Math.floor(i / 5) % 3 * .6, dt, .2)) anim(u, 'idle');
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
  const Bd = B.bounds || { x0: -17, x1: 17.5, z0: -9.5, z1: 11.5 };
  L.forEach(u => { const p = u.o.position; if (u.on && u.kind !== 'boss') { p.x = Math.max(Bd.x0, Math.min(Bd.x1, p.x)); p.z = Math.max(Bd.z0, Math.min(Bd.z1, p.z)); }
    const k = u.wside; if (k && B.walls && B.walls[k].hp > 0) { if (k === 's') p.z = Math.max(p.z, WALL.s.v + .45); else if (k === 'e') p.x = Math.max(p.x, WALL.e.v + .45); else p.x = Math.min(p.x, WALL.w.v - .45); } });
}
function stepBattle(dt) {
  if (!B) return;
  camRight.setFromMatrixColumn(camera.matrixWorld, 0);
  if (B.intro) { stepIntro(dt); return; }
  if (B.ending) { stepEnding(dt); return; }
  if (B.pendEnd && (B.pendEnd.t -= dt) <= 0) { const e = B.pendEnd; B.pendEnd = null; startEnding(e.win, e.html); return; }
  B.cutCd = Math.max(0, (B.cutCd || 0) - dt);
  if (B.cut) stepCut(dt); else followHero(dt);
  dt *= (B.slow || 1) * (B.cut ? 1 : (B.spd || 1));
  B.t += dt;
  if (B.mode === 'clanboss') stepClanBoss();
  stepDmg(dt);
  if (B.later && B.later.length) for (let i = B.later.length - 1; i >= 0; i--) { const l = B.later[i]; if ((l.t -= dt) <= 0) { B.later.splice(i, 1); if (!B.over) l.fn(); } }
  // drakkar inimigo chega à praia
  if (B.ship) { const k = Math.min(1, B.t / 5); [B.ship].concat(B.extraShips || []).forEach((sh, i) => { const dz = sh.userData.dz || 0; sh.position.z = 34 + dz - (34 - 12.6) * (1 - Math.pow(1 - k, 2)); sh.position.y = -.05 + Math.sin(B.t * 1.4 + i) * .05; sh.rotation.z = Math.sin(B.t + i) * .03; sh.userData.update(B.t, dt, k < 1); }); }
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
    if (pr.fx) { pr.m.material.opacity = Math.max(0, (pr.op || 1) * (1 - pr.t)); if (pr.grow) pr.m.scale.setScalar(.1 + .9 * (1 - Math.pow(1 - Math.min(1, pr.t), 3))); else if (pr.rise) { pr.m.scale.set(1 - pr.t * .6, 1 + pr.t, 1 - pr.t * .6); } else if (pr.m.scale) pr.m.scale.multiplyScalar(1 + dt * .4); if (pr.t >= 1) { scene.remove(pr.m); B.proj.splice(i, 1); } continue; }
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
  if (h.dead && !B.island && (B.heroDown -= dt) <= 0) {
    const [hx, hz] = hexPos(7, 5); h.dead = false; h.hp = h.max; h.deadT = 0; h.o.position.set(hx, 0, hz + 1.6); if (!h.o.parent) scene.add(h.o);
    anim(h, 'rise'); h.busy = 1.3; burstAt(hx, .5, hz + 1.6, '#f3d27a', 20); B.cmd = null;
  }
  B.skillCd = Math.max(0, B.skillCd - dt);
  // barras
  B.units.forEach(u => { if (!u.on || u.dead || u === B.boss) { u.bar.bg.visible = u.bar.fg.visible = false; return; } const p = u.o.position; placeBar(u.bar, p.x, u.barY, p.z, u.hp / u.max, u.kind === 'hero' || u.kind === 'boss' || u.hp < u.max); });
  B.blds.forEach(t => placeBar(t.bar, t.x, (PLOT_H[t.p.type] || 1.5) + .5, t.z, Math.max(0, t.hp) / t.max, t.hp > 0 && t.hp < t.max));
  if (B.mark) { B.mark.material.opacity -= dt * 1.2; B.mark.scale.multiplyScalar(1 + dt * .6); if (B.mark.material.opacity <= 0) { scene.remove(B.mark); B.mark = null; } }
  // fim?
  if (!B.over && !B.queue.some(u => u.side === 'enemy') && !B.units.some(u => u.side === 'enemy' && !u.dead)) { B.endT += dt; if (B.endT > 1.2) endBattle(true); }
  if (!B.over && B.island && !B.queue.some(u => u.side === 'ally') && !B.units.some(u => u.side === 'ally' && u.on && !u.dead)) endBattle(false);
  renderBHUD();
}
function renderBHUD() {
  const hall = B.blds.find(t => t.id === 'salao'), h = B.hero;
  $('#bFoes').style.width = (100 - B.killed / B.total * 100) + '%'; $('#bFoesT').textContent = `${B.total - B.killed} draugr restantes`;
  if (hall) $('#bHall').style.width = Math.max(0, hall.hp / hall.max * 100) + '%';
  $('#bHero').style.width = (h.dead ? 0 : h.hp / h.max * 100) + '%'; $('#bHeroT').textContent = h.dead ? (B.island ? 'caído' : `volta em ${Math.ceil(B.heroDown)}s`) : `${Math.ceil(h.hp)} / ${Math.round(h.max)}`;
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
  const Bd = B.bounds || { x0: -16, x1: 17, z0: -9, z1: 10 }, x = Math.max(Bd.x0, Math.min(Bd.x1, hit.x)), z = Math.max(Bd.z0, Math.min(Bd.z1, hit.z));
  B.cmd = [x, z]; B.hero.target = null; Snd.tap();
  if (B.mark) scene.remove(B.mark);
  B.mark = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#f3d27a', transparent: true, opacity: 1, depthWrite: false })); B.mark.position.set(x, .06, z); scene.add(B.mark);
}
function endBattle(win) {
  if (!B || B.over) return; B.over = true;
  if (B.mode === 'arena') { endArena(win); B.units.forEach(u => { if (u.side === 'ally' && u.head) u.hr0 = u.head.rotation.x; }); return; }
  if (B.mode === 'clanboss') { endClanBoss(win); B.units.forEach(u => { if (u.side === 'ally' && u.head) u.hr0 = u.head.rotation.x; }); return; }
  if (B.mode === 'tower') { endTower(win); B.units.forEach(u => { if (u.side === 'ally' && u.head) u.hr0 = u.head.rotation.x; }); return; }
  if (B.mode === 'camp') { endCamp(win); B.units.forEach(u => { if (u.side === 'ally' && u.head) u.hr0 = u.head.rotation.x; }); return; }
  const w = B.wave, surv = { war: 0, arc: 0, hus: 0 }, lost = { war: 0, arc: 0, hus: 0 };
  B.units.forEach(u => { if (u.side === 'ally' && TROOPS[u.kind]) { if (u.dead) lost[u.kind]++; else surv[u.kind]++; } });
  for (const k in surv) S.army[k] = Math.max(0, S.army[k] - lost[k]);
  let rew = null;
  if (win) {
    rew = waveReward(w);
    for (const k in rew) gain(k, rew[k]);
    S.wave = w + 1; Snd.done(); dcount('ondas'); say(w % 10 === 0 ? 'O Rei Draugr caiu! Skål!' : 'Vitória! Skål!');
  } else { Snd.lose(); say('O Salão caiu… vamos nos reerguer.'); }
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
  if (B.intro) endIntro(); (B.extraShips || []).forEach(sh => scene.remove(sh)); if (B.island) leaveCamp(); (B.later || []).length = 0;
  B.units.forEach(u => { scene.remove(u.o); dropBar(u.bar); }); clearDmg();
  if (B.walls) Object.values(B.walls).forEach(w => dropBar(w.bar));
  if (B.oldD) cam.d = B.oldD; document.body.classList.remove('cine'); $('#cine').hidden = true;
  B.blds.forEach(t => dropBar(t.bar)); B.proj.forEach(p => scene.remove(p.m));
  if (B.ship) scene.remove(B.ship); if (B.mark) scene.remove(B.mark);
  B = null;
  document.body.classList.remove('battle'); $('#bhud').hidden = true;
  folk.forEach(f => f.o.visible = true); herdObjs.forEach(a => a.o.visible = true); refreshGuards(); dirty = true; placeCamera(); applyGfx(GFX.mode, true); Music.start('vila');
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
  if (!restReady) return;
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
const wallHp = L => Math.round(700 * Math.pow(1.45, L - 1) * (1 + .1 * RS('wall')));
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
  const h = B.hero, al = h.dead && B.units.find(u => u.side === 'ally' && u.on && !u.dead), [x, z] = !h.dead ? [h.o.position.x, h.o.position.z] : al ? [al.o.position.x, al.o.position.z] : B.rally || hexPos(7, 5), k = Math.min(1, dt * 2.2);
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
  const h = B.hero, al = B.units.find(u => u.side === 'ally' && u.on && !u.dead); B.ending.at = !h.dead ? [h.o.position.x, 0, h.o.position.z] : al ? [al.o.position.x, 0, al.o.position.z] : B.rally ? [B.rally[0], 0, B.rally[1]] : (() => { const [x, z] = hexPos(7, 5); return [x, 0, z + 1.4]; })();
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

/* ---------- drakkar viking feito no código ---------- */
function hullGeo(L, W, D) {
  const N = 28, M = 14, pos = [], col = [], idx = [];
  const c1 = new THREE.Color('#7a4e2a'), c2 = new THREE.Color('#5e3a1e'), c3 = new THREE.Color('#3f2611');
  for (let i = 0; i <= N; i++) {
    const t = i / N * 2 - 1, at = Math.abs(t);
    const w = W * Math.pow(Math.max(0, 1 - t * t), .55) + .015, top = .18 + .55 * Math.pow(at, 4), d = D * (1 - Math.pow(at, 3)) + .04;
    for (let j = 0; j <= M; j++) {
      const a = j / M * Math.PI; pos.push(t * L / 2, top - Math.sin(a) * d, -Math.cos(a) * w);
      const band = Math.floor(Math.sin(a) * 6.99), c = band === 0 ? c3 : band % 2 ? c1 : c2; col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < M; j++) { const a = i * (M + 1) + j, b = a + M + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry(); g.setIndex(idx); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals(); return g;
}
function dragonHead(color, eyeCol) {
  const g = new THREE.Group(), m = new THREE.MeshStandardMaterial({ color, roughness: .7 });
  const neck = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(.25, .45, 0), new THREE.Vector3(.3, .95, 0), new THREE.Vector3(.5, 1.2, 0)]), 16, .08, 7), m); g.add(neck);
  const head = new THREE.Group(); head.position.set(.55, 1.22, 0); g.add(head);
  const skull = new THREE.Mesh(new THREE.BoxGeometry(.38, .17, .16), m); skull.position.x = .12; head.add(skull);
  const snout = new THREE.Mesh(new THREE.ConeGeometry(.08, .22, 6), m); snout.rotation.z = -Math.PI / 2; snout.position.set(.38, -.01, 0); head.add(snout);
  const jaw = new THREE.Mesh(new THREE.BoxGeometry(.32, .05, .12), m); jaw.position.set(.18, -.12, 0); jaw.rotation.z = -.25; head.add(jaw);
  [-1, 1].forEach(s => {
    const horn = new THREE.Mesh(new THREE.ConeGeometry(.035, .28, 5), m); horn.position.set(-.05, .14, s * .05); horn.rotation.set(s * .3, 0, .9); head.add(horn);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshBasicMaterial({ color: eyeCol })); eye.position.set(.2, .05, s * .085); head.add(eye);
    for (let k = 0; k < 3; k++) { const fin = new THREE.Mesh(new THREE.ConeGeometry(.03, .14, 4), m); fin.position.set(-.05 - k * .12, .05 - k * .25, 0); fin.rotation.z = 1.2; neck.add(fin); }
  });
  g.userData.jaw = jaw; return g;
}
function sailTex(enemy) {
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const c = cv.getContext('2d');
  for (let i = 0; i < 8; i++) { c.fillStyle = enemy ? (i % 2 ? '#1d2422' : '#4d6a5c') : (i % 2 ? '#efe4cc' : '#a8322b'); c.fillRect(i * 16, 0, 16, 128); }
  if (enemy) { // corvo/caveira pintado
    c.fillStyle = 'rgba(190,255,210,.85)'; c.beginPath(); c.arc(64, 54, 22, 0, TAU); c.fill(); c.fillRect(48, 66, 32, 18);
    c.fillStyle = '#1d2422'; c.beginPath(); c.arc(55, 52, 6, 0, TAU); c.arc(73, 52, 6, 0, TAU); c.fill(); c.fillRect(54, 72, 4, 10); c.fillRect(62, 72, 4, 10); c.fillRect(70, 72, 4, 10);
  } else { c.strokeStyle = '#d9a441'; c.lineWidth = 6; c.beginPath(); c.moveTo(64, 30); c.lineTo(64, 98); c.moveTo(64, 46); c.lineTo(82, 30); c.moveTo(64, 46); c.lineTo(46, 30); c.stroke(); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function buildDrakkar(enemy, crew) {
  const g = new THREE.Group(), L = 5.2, W = .62, D = .55;
  const hull = new THREE.Mesh(hullGeo(L, W, D), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .8, side: THREE.DoubleSide, color: enemy ? '#8a8f86' : '#ffffff' })); g.add(hull);
  const deck = new THREE.Mesh(new THREE.BoxGeometry(L * .78, .05, W * 1.5), new THREE.MeshStandardMaterial({ color: enemy ? '#3e3a33' : '#6b4527', roughness: .9 })); deck.position.y = -.08; g.add(deck);
  const wood = enemy ? '#3b3a36' : '#5c3d22', eye = enemy ? '#7dff9a' : '#ffcc55';
  const bow = dragonHead(wood, eye); bow.position.set(L / 2 - .2, .55, 0); g.add(bow);
  const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-.2, .5, 0), new THREE.Vector3(-.15, .95, 0), new THREE.Vector3(.1, 1.05, 0), new THREE.Vector3(.15, .85, 0)]), 16, .06, 6), new THREE.MeshStandardMaterial({ color: wood })); tail.position.set(-L / 2 + .2, .55, 0); g.add(tail);
  // mastro, verga e vela
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(.05, .07, 3.2, 8), new THREE.MeshStandardMaterial({ color: wood })); mast.position.y = 1.5; g.add(mast);
  const yard = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 2.6, 6), mast.material); yard.rotation.x = Math.PI / 2; yard.position.y = 2.75; g.add(yard);
  const sg = new THREE.PlaneGeometry(2.4, 1.8, 12, 8); const sail = new THREE.Mesh(sg, new THREE.MeshStandardMaterial({ map: sailTex(enemy), side: THREE.DoubleSide, roughness: .9, transparent: !!enemy, opacity: enemy ? .93 : 1 }));
  sail.rotation.y = Math.PI / 2; sail.position.set(.05, 1.85, 0); g.add(sail); sail.userData.base = sg.attributes.position.array.slice();
  // escudos na amurada
  const shM = enemy ? [new THREE.MeshStandardMaterial({ color: '#6d7a70' }), new THREE.MeshStandardMaterial({ color: '#2d3330' })] : [new THREE.MeshStandardMaterial({ color: '#d9a441' }), new THREE.MeshStandardMaterial({ color: '#a8322b' })];
  const boss = new THREE.MeshStandardMaterial({ color: '#9aa3a8', metalness: .6, roughness: .4 });
  for (let i = -6; i <= 6; i++) [-1, 1].forEach((s, k) => {
    const x = i * .3, t = x / (L / 2), w = W * Math.pow(Math.max(0, 1 - t * t), .55) + .02, y = .18 + .55 * Math.pow(Math.abs(t), 4);
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .025, 12), shM[(i + k + 12) % 2]); sh.rotation.x = Math.PI / 2; sh.position.set(x, y + .02, s * (w + .015)); g.add(sh);
    const b = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 4), boss); b.position.set(x, y + .02, s * (w + .03)); g.add(b);
  });
  // remos
  const oars = [], oarM = new THREE.MeshStandardMaterial({ color: '#8a6038' });
  for (let i = -4; i <= 4; i++) [-1, 1].forEach(s => {
    const piv = new THREE.Group(), x = i * .42 + .15, t = x / (L / 2), w = W * Math.pow(Math.max(0, 1 - t * t), .55);
    piv.position.set(x, .12, s * w); const oar = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, 1.6, 5), oarM); oar.rotation.x = s * (Math.PI / 2 + .55); oar.position.set(0, -.35, s * .65); piv.add(oar);
    const blade = new THREE.Mesh(new THREE.BoxGeometry(.09, .3, .02), oarM); blade.position.set(0, -.72, s * 1.28); blade.rotation.x = oar.rotation.x; piv.add(blade);
    g.add(piv); oars.push({ piv, s, ph: i * .15 });
  });
  // tripulação draugr
  const crewList = [];
  if (crew && G.Skeleton_Warrior) {
    [['Skeleton_Warrior', 1.7, 0, 'Skeleton_Axe', 'Skeleton_Shield_Small_A'], ['Skeleton_Minion', .9, .25, 'Skeleton_Blade'], ['Skeleton_Rogue', .3, -.25, 'Skeleton_Blade'], ['Skeleton_Minion', -.4, .25, null], ['Skeleton_Mage', -1.1, -.2, 'Skeleton_Staff']].forEach(([m, x, z, wr, wl], k) => {
      const c = mkChar(m, k === 0 ? .36 : .3, wr, wl); c.o.position.set(x, -.06, z); c.o.rotation.y = Math.PI / 2; c.act.idle.time = k * .3; g.add(c.o); crewList.push(c);
      c.o.traverse(n => { if (n.isMesh && /Eyes/.test(n.name)) { n.material = n.material.clone(); n.material.emissive = new THREE.Color('#5dff8a'); n.material.emissiveIntensity = 2; } });
    });
  }
  // lanterna fantasma
  if (enemy) { const lamp = new THREE.PointLight('#5dff8a', 2.5, 4); lamp.position.set(L / 2 - .5, 1.2, 0); g.add(lamp); g.userData.lamp = lamp; }
  g.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  g.userData.update = (t, dt, rowing = true) => {
    oars.forEach(o => { const p = t * 4.2 + o.ph; o.piv.rotation.y = rowing ? Math.sin(p) * .45 * o.s : 0; o.piv.rotation.x = rowing ? Math.max(0, Math.cos(p)) * .22 * o.s : 0; });
    const a = sail.geometry.attributes.position, b = sail.userData.base;
    for (let i = 0; i < a.count; i++) { const x = b[i * 3], y = b[i * 3 + 1]; a.array[i * 3 + 2] = (1 - Math.pow(x / 1.2, 2)) * (.22 + Math.sin(t * 2 + y * 2) * .04) * (1 - (y + .9) / 3.6); }
    a.needsUpdate = true; crewList.forEach(c => c.mixer.update(dt)); if (bow.userData.jaw) bow.userData.jaw.rotation.z = -.25 - Math.max(0, Math.sin(t * 1.3)) * .25;
    if (g.userData.lamp) g.userData.lamp.intensity = 2 + Math.sin(t * 7) * .6;
  };
  g.userData.crew = crewList; g.userData.L = L;
  return g;
}

/* ---------- filme de abertura da batalha ---------- */
let waveSea = null;
function mkWaveSea() {
  const geo = new THREE.PlaneGeometry(90, 90, 70, 70); geo.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: '#2f6f84', roughness: .25, metalness: .1, flatShading: true }));
  m.position.set(0, -.05, 62); m.receiveShadow = true; m.userData.base = geo.attributes.position.array.slice(); return m;
}
function stepWaveSea(t) {
  const a = waveSea.geometry.attributes.position, b = waveSea.userData.base;
  for (let i = 0; i < a.count; i++) { const x = b[i * 3], z = b[i * 3 + 2]; a.array[i * 3 + 1] = Math.sin(x * .45 + t * 1.6) * .12 + Math.sin(z * .6 + t * 1.1) * .1 + Math.sin((x + z) * 1.3 + t * 2.4) * .04; }
  a.needsUpdate = true; waveSea.geometry.computeVertexNormals();
}
const INTRO_D = 11;
function startIntro() {
  const I = B.intro = { t: 0, ships: [B.ship].concat(B.extraShips || []), cap: -1, fog0: [scene.fog.color.clone(), scene.fog.near, scene.fog.far, scene.background.clone()], flash: 0, horn: false, said: false };
  waveSea = mkWaveSea(); scene.add(waveSea);
  scene.fog.color.set('#4d6470'); scene.background.set('#4d6470'); scene.fog.near = 4; scene.fog.far = 20;
  // o Jarl na praia olhando o mar
  const [hx] = hexPos(7, 5); I.jarl = mkChar('Barbarian', .38, 'axe_2handed'); addFace(I.jarl); setFace(I.jarl, 'angry'); I.jarl.o.position.set(-2.4, 0, 7.1); I.jarl.o.rotation.y = 0; scene.add(I.jarl.o);
  document.body.classList.add('cine'); $('#cine').hidden = false; $('#cineSkip').hidden = false; $('#cineCap').classList.remove('show');
}
const INTRO_CAPS = [[.4, 'Na névoa do fiorde…'], [3.3, 'Os draugr remam para a guerra'], [5.7, ''], [7.9, '']];
function stepIntro(dt) {
  const I = B.intro; I.t += dt; const t = I.t, k = t / INTRO_D;
  // navios avançam de longe até a posição de ataque
  I.ships.forEach((s, i) => { s.position.z = 92 - (92 - 34) * k + (s.userData.dz || 0); s.position.y = -.05 + Math.sin(t * 1.4 + i) * .07; s.rotation.z = Math.sin(t * 1.1 + i) * .04; s.rotation.x = Math.sin(t * .9 + i) * .02; s.userData.update(t, dt); });
  if (waveSea.visible) stepWaveSea(t);
  const P = B.ship.position;
  // névoa abre aos poucos
  scene.fog.far = 20 + Math.min(1, t / 7) * 50;
  // legendas
  const ci = INTRO_CAPS.filter(c => t >= c[0]).length - 1;
  if (ci !== I.cap) { I.cap = ci; const txt = ci === 2 ? (B.wave % 10 === 0 ? 'O Rei Draugr lidera a frota!' : 'Eles vêm pela vila!') : ci === 3 ? `Onda ${B.wave} · Às armas, Jarl!` : INTRO_CAPS[ci][1]; $('#cineCap').textContent = txt; $('#cineCap').classList.remove('show'); void $('#cineCap').offsetWidth; if (txt) $('#cineCap').classList.add('show'); }
  // relâmpagos
  if (Math.random() < dt * .35 && t < 7.5) { I.flash = .25; setTimeout(() => Snd.noise(1.2, .35, 120), 300); }
  if (I.flash > 0) { I.flash -= dt; scene.background.set(I.flash > .12 ? '#c8d8e0' : '#4d6470'); } else if (t < 7.8) scene.background.set('#4d6470');
  // respingos dos remos
  if (Math.random() < dt * 8 && t < 7.8) burstAt(P.x + (Math.random() < .5 ? -1 : 1) * 1.4, -.05, P.z + (Math.random() - .5) * 3, '#d8f0f6', 5, .03);
  // câmera em 4 planos
  let cp, cl;
  if (t < 3.2) { const u = t / 3.2; cp = [P.x + 5 - u * 1.5, .9 + u * .4, P.z - 13 + u * 2]; cl = [P.x, .9, P.z]; }
  else if (t < 5.6) { const u = (t - 3.2) / 2.4; cp = [P.x + 2.6, .75, P.z + 1.4 - u * 2.8]; cl = [P.x + .2, .35, P.z - .8 - u * 1.2]; }
  else if (t < 7.8) { const u = (t - 5.6) / 2.2; scene.fog.far = 45; cp = [P.x + 1.5 - u * .4, .45, P.z - 4 + u * .9]; cl = [P.x, 1.05, P.z - 1.6]; if (!I.horn) { I.horn = true; Snd.horn(); const cap = B.ship.userData.crew[0]; if (cap) anim(cap, 'atk', 1); } }
  else {
    if (!I.beach) { I.beach = true; const [fc, fn, ff, bg] = I.fog0; scene.fog.color.copy(fc); scene.background.copy(bg); scene.fog.near = fn; scene.fog.far = ff; if (waveSea) waveSea.visible = false; setFace(I.jarl, 'shout'); anim(I.jarl, 'shoot', 1.2); if (!I.said) { I.said = true; say(B.wave % 10 === 0 ? 'O Rei Draugr vem com a frota! Às armas!' : 'Às armas! Defendam a vila!'); } }
    const u = (t - 7.8) / (INTRO_D - 7.8); cp = [-2.15, 1.2 + u * .25, 5.5 - u * .5]; cl = [-2.6, .3, 16];
    scene.fog.far = Math.max(scene.fog.far, 95);
  }
  I.jarl.mixer.update(dt); stepFace(I.jarl, dt);
  camera.position.set(...cp); camera.lookAt(...cl);
  if (t >= INTRO_D) endIntro();
}
function endIntro() {
  const I = B.intro; if (!I) return; B.intro = null;
  const [fc, fn, ff, bg] = I.fog0; scene.fog.color.copy(fc); scene.fog.near = fn; scene.fog.far = ff; scene.background.copy(bg);
  if (waveSea) { scene.remove(waveSea); waveSea = null; } scene.remove(I.jarl.o);
  I.ships.forEach(s => { s.position.z = 34 + (s.userData.dz || 0); s.rotation.x = 0; });
  document.body.classList.remove('cine'); $('#cine').hidden = true; $('#cineCap').classList.remove('show');
  placeCamera();
}

/* ---------- heróis na batalha: habilidades ---------- */
const heroUnitDef = id => { const s = hStats(id); return Object.assign({}, HEROES[id], { hp: s.hp, dmg: s.dmg, cd: s.cd, scale: .33, isHero: true, id }); };
const dmgMul = u => (u.buffT > 0 ? 1.3 : 1);
function floatText(x, y, z, txt, col) { if (dmgs.length > 40) return; const el = document.createElement('div'); el.className = 'dmg big'; el.textContent = txt; el.style.color = col; $('#tags').appendChild(el); dmgs.push({ el, x, y, z, t: -.3 }); }
function later(t, fn) { (B.later = B.later || []).push({ t, fn }); }
const foesAlive = () => B.units.filter(t => t.side === 'enemy' && alive(t));
const alliesAlive = () => B.units.filter(t => t.side === 'ally' && alive(t));
const dist = (a, b) => Math.hypot(a.o.position.x - b.o.position.x, a.o.position.z - b.o.position.z);
function ring(x, z, col, r = 1.5) { const m = new THREE.Mesh(new THREE.RingGeometry(r * .85, r, 40).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .8, depthWrite: false })); m.position.set(x, .08, z); scene.add(m); B.proj.push({ m, kind: 'fx', t: 0, dur: .7, fx: true }); }
function bolt(x0, y0, z0, x1, y1, z1) {
  const pts = []; for (let i = 0; i <= 8; i++) { const k = i / 8; pts.push(new THREE.Vector3(x0 + (x1 - x0) * k + (i && i < 8 ? (Math.random() - .5) * .5 : 0), y0 + (y1 - y0) * k, z0 + (z1 - z0) * k + (i && i < 8 ? (Math.random() - .5) * .5 : 0))); }
  const m = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: '#cfe8ff', transparent: true })); scene.add(m); B.proj.push({ m, kind: 'fx', t: 0, dur: .35, fx: true });
}
function castSkill(u) { const ok = castSkill0(u); if (ok) skillFx(u); return ok; }
function castSkill0(u) {
  const H = HEROES[u.D.id], F = foesAlive(), p = u.o.position; if (!F.length) return false;
  const near = (r, from = u) => F.filter(e => dist(from, e) < r).sort((a, b) => dist(from, a) - dist(from, b));
  const say2 = () => { floatText(p.x, 1.4, p.z, H.skn + '!', RAR[H.rar].col); faceFor(u, 'shout', 1); };
  switch (H.sk) {
    case 'warcry': { if (!near(4).length) return false; say2(); Snd.horn(); ring(p.x, p.z, '#f3d27a', 3.5); alliesAlive().forEach(a => { if (dist(u, a) < 3.5) { a.buffT = 6; if (a.face) faceFor(a, 'shout', .8); } }); anim(u, 'shoot', .6); u.busy = .5; return true; }
    case 'boom': { const t = near(u.range + 1)[0]; if (!t) return false; say2(); anim(u, 'shoot', .55); u.busy = .5; later(.3, () => shoot('arrow', p.x, .8, p.z, t, u.dmg * 3, 'ally', 1.5)); return true; }
    case 'charge': { const t = F.filter(e => dist(u, e) < 7).sort((a, b) => dist(u, b) - dist(u, a))[0]; if (!t || dist(u, t) < 2) return false; say2(); u.dash = { x: t.o.position.x, z: t.o.position.z, hit: false }; anim(u, 'run'); return true; }
    case 'backstab': { const t = F.filter(e => dist(u, e) < 8).sort((a, b) => a.hp - b.hp)[0]; if (!t) return false; say2(); burstAt(p.x, .5, p.z, '#2a2a3a', 16, .05); const tp = t.o.position, a = t.o.rotation.y; p.set(tp.x - Math.sin(a) * .6, 0, tp.z - Math.cos(a) * .6); u.o.rotation.y = a; burstAt(p.x, .5, p.z, '#2a2a3a', 16, .05); anim(u, 'atk', .45); u.busy = .5; later(.2, () => { hurt(t, u.dmg * 5 * dmgMul(u)); Snd.hit(); }); return true; }
    case 'heal': { const A = alliesAlive().filter(a => dist(u, a) < 3.5 && a.hp < a.max * .85); if (!A.length) return false; say2(); ring(p.x, p.z, '#7dff9a', 3.5); anim(u, 'shoot', .6); u.busy = .5; A.forEach(a => { const v = a.max * .3; a.hp = Math.min(a.max, a.hp + v); dmgNum(a.o.position.x, a.barY + .2, a.o.position.z, v, '#7dff9a'); burstAt(a.o.position.x, .6, a.o.position.z, '#9dffb4', 8, .03); }); return true; }
    case 'rain': { let best = null, bn = 0; F.filter(e => dist(u, e) < u.range + 1).forEach(e => { const n = F.filter(o => dist(e, o) < 1.8).length; if (n > bn) { bn = n; best = e; } }); if (!best) return false; say2(); anim(u, 'shoot', .6); u.busy = .5; const c = best.o.position.clone(); ring(c.x, c.z, '#f3d27a', 1.8);
      for (let i = 0; i < 6; i++) later(.3 + i * .15, () => { const x = c.x + (Math.random() - .5) * 2.4, z = c.z + (Math.random() - .5) * 2.4; burstAt(x, .2, z, '#d6b07a', 4, .03); foesAlive().forEach(e => { if (Math.hypot(e.o.position.x - c.x, e.o.position.z - c.z) < 1.8) hurt(e, u.dmg * .5 * dmgMul(u)); }); Snd.shoot(); }); return true; }
    case 'wall': { if (!near(3).length) return false; say2(); ring(p.x, p.z, '#8fd3ff', 3); alliesAlive().forEach(a => { if (dist(u, a) < 3) { a.shieldT = 5; burstAt(a.o.position.x, .7, a.o.position.z, '#8fd3ff', 6, .02); } }); Snd.crash(); return true; }
    case 'fury': { if (!near(1.9).length) return false; say2(); u.busy = 1.3; for (let i = 0; i < 3; i++) later(i * .4, () => { if (u.dead) return; anim(u, 'atk', .35); u.o.rotation.y += Math.PI * .66; ring(p.x, p.z, '#ff7a5a', 1.9); Snd.hit(); foesAlive().forEach(e => { if (dist(u, e) < 1.9) hurt(e, u.dmg * dmgMul(u)); }); }); bcut(() => [p.x, .4, p.z], 1.2, '', u.o.rotation.y + Math.PI * .7); return true; }
    case 'thunder': { const t = near(u.range + 1)[0]; if (!t) return false; say2(); anim(u, 'shoot', .7); u.busy = .6; Snd.crash(); scene.background.offsetHSL(0, 0, .2); setTimeout(() => scene.background.offsetHSL(0, 0, -.2), 120);
      let cur = t, hit = [t]; bolt(t.o.position.x, 8, t.o.position.z, t.o.position.x, .4, t.o.position.z); hurt(t, u.dmg * 4 * dmgMul(u));
      for (let i = 0; i < 4; i++) { const nx = foesAlive().filter(e => !hit.includes(e) && dist(cur, e) < 3.5).sort((a, b) => dist(cur, a) - dist(cur, b))[0]; if (!nx) break; const c0 = cur.o.position; bolt(c0.x, .5, c0.z, nx.o.position.x, .5, nx.o.position.z); hurt(nx, u.dmg * 2.5 * dmgMul(u)); hit.push(nx); cur = nx; }
      bcut(() => [t.o.position.x, .4, t.o.position.z], 1.1, '', Math.random() * 2); return true; }
  }
  return false;
}
function stepHeroExtras(u, dt) {
  if (u.buffT > 0) u.buffT -= dt; if (u.shieldT > 0) u.shieldT -= dt;
  if (u.dash) { const p = u.o.position, dx = u.dash.x - p.x, dz = u.dash.z - p.z, d = Math.hypot(dx, dz); u.o.rotation.y = Math.atan2(dx, dz);
    const st = Math.min(d, 9 * dt); p.x += dx / d * st; p.z += dz / d * st; burstAt(p.x, .1, p.z, '#a08a66', 2, .02);
    foesAlive().forEach(e => { if (!e.charged && dist(u, e) < .8) { e.charged = 1; hurt(e, u.dmg * 2.5 * dmgMul(u)); e.busy = .8; anim(e, 'hit', .5); } });
    if (d < .3) { u.dash = null; B.units.forEach(e => e.charged = 0); anim(u, 'atk', .5); u.busy = .4; CINE || (B.cutCd = Math.max(B.cutCd, 0)); }
    return true; }
  if (u.sk && u.on && !u.dead) { if ((u.skCd -= dt) <= 0) u.skCd = castSkill(u) ? u.skMax : .6; }
  return false;
}

/* ---------- Saga: batalha numa ilha longe da vila ---------- */
const ARENA = { x: 95, z: 0 };
let arenaG = null, arenaChap = -1;
const CAMB = { x0: -18, x1: 18, z0: -10, z1: 14 };
function buildArena(c) {
  if (arenaG && arenaChap === c) { arenaG.visible = true; return; }
  if (arenaG) scene.remove(arenaG); arenaChap = c; arenaG = new THREE.Group(); scene.add(arenaG);
  const C = CHAPTERS[c], M = {}, add = (n, x, z, rot = 0, s = 1) => (M[n] = M[n] || []).push(new THREE.Matrix4().compose(new THREE.Vector3(x, 0, z), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rot), new THREE.Vector3(s, s, s)));
  let sd = 7 + c * 31; const R = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
  for (let r = -6; r <= 6; r++) for (let q = -8; q <= 8; q++) {
    const x = ARENA.x + q * 2 + (r & 1 ? 1 : 0), z = ARENA.z + r * HZ, e = Math.pow((x - ARENA.x) / 15, 2) + Math.pow(z / 10, 2);
    if (e > 1) continue; const edge = e > .62, rot = Math.floor(R() * 6) * Math.PI / 3;
    add(C.props === 'beach' && edge ? 'hex_coast_A' : 'hex_grass', x, z, C.props === 'beach' && edge ? Math.atan2(x - ARENA.x, z) : 0);
    if (!edge) { if (R() < .06) add(['rock_single_A', 'rock_single_C'][Math.floor(R() * 2)], x + (R() - .5), z + (R() - .5), rot, 1.3); continue; }
    if (C.props === 'forest' || C.props === 'swamp') add(R() < .5 ? 'trees_A_large' : 'trees_B_medium', x, z, rot);
    else if (C.props === 'rocks') add(R() < .5 ? 'mountain_A' : 'mountain_C', x, z, rot, .8);
    else if (C.props === 'ruins') { if (R() < .4) add('building_destroyed', x, z, rot, 1.1); else if (R() < .5) add('rock_single_E', x, z, rot, 2); }
    else if (R() < .3) add('rock_single_A', x, z, rot, 1.8);
  }
  for (const n in M) { const src = G[n].scene; src.updateMatrixWorld(true); src.traverse(m => { if (!m.isMesh) return; const im = new THREE.InstancedMesh(m.geometry, m.material, M[n].length); M[n].forEach((mt, i) => im.setMatrixAt(i, mt.clone().multiply(m.matrixWorld))); im.castShadow = !n.startsWith('hex'); im.receiveShadow = true; arenaG.add(im); }); }
  // pedras rúnicas nos lados
  [[-7.5, -3], [-7.5, 3], [7.5, -3], [7.5, 3]].forEach(([dx, dz]) => { const st = mesh(new THREE.BoxGeometry(.3, 1.2, .18), '#7c8478', ARENA.x + dx, .6, ARENA.z + dz); arenaG.add(st); });
}
let amb0 = null;
function setAmbience(c) {
  const hemi = scene.children.find(o => o.isHemisphereLight);
  if (!amb0) amb0 = { fog: scene.fog.color.clone(), bg: scene.background.clone(), hemi: hemi.color.clone(), sun: sun.color.clone() };
  if (c < 0) { scene.fog.color.copy(amb0.fog); scene.background.copy(amb0.bg); hemi.color.copy(amb0.hemi); sun.color.copy(amb0.sun); return; }
  const C = CHAPTERS[c]; scene.fog.color.set(C.fog); scene.background.set(C.sky); hemi.color.set(C.light); sun.color.set(C.light);
}
function startCamp(g) {
  if (B || CINE) return;
  if (!restReady) { toast('Carregando… só um instante'); loadRest().then(() => startCamp(g)); return; }
  const first = !S.camp.stars[g], rep = S.camp.rep.d === today() ? S.camp.rep.n : 0;
  if (g > S.camp.next) return; if (!first && rep >= 10) { toast('Limite de repetições de hoje'); return; }
  closeSheet(); Snd.init();
  const c = Math.floor(g / STAGES), s = g % STAGES, d = stageDef(c, s);
  buildArena(c); setAmbience(c);
  B = { spd: S.bspd || 1, mode: 'camp', island: true, g, chap: c, stage: s, lvlF: d.lvl, wave: 1, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: d.list.length, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0, walls: null, shooters: [], later: [],
    bounds: { x0: ARENA.x - 13, x1: ARENA.x + 13, z0: ARENA.z - 8, z1: ARENA.z + 8 }, rally: [ARENA.x - 4.5, ARENA.z] };
  glowEyes();
  B.hero = mkUnit('ally', 'hero', ARENA.x - 7, ARENA.z); activate(B.hero);
  S.team.forEach((id, i) => { const u = mkUnit('ally', 'h_' + id, ARENA.x - 6.3, ARENA.z - 1.4 + i * 1.4); u.spawnAt = .2 + i * .2; B.queue.push(u); });
  let k = 0; ['hus', 'war', 'arc'].forEach(type => { for (let i = 0; i < (S.army[type] || 0); i++) { const u = mkUnit('ally', type, ARENA.x - 8 - Math.random(), ARENA.z + (Math.random() - .5) * 5); u.spawnAt = .5 + k++ * .12; B.queue.push(u); } });
  const first60 = Math.ceil(d.list.length * .6);
  d.list.forEach((kind, i) => { const late = i >= first60, u = mkUnit('enemy', kind, ARENA.x + 6 + Math.random() * 3, ARENA.z + (Math.random() - .5) * 8); u.spawnAt = (late ? 13 : 1.2) + (i % 8) * .35; u.rise = !FOES[kind].beast; B.queue.push(u); });
  Object.assign(CAMB, { x0: ARENA.x - 12, x1: ARENA.x + 12, z0: ARENA.z - 8, z1: ARENA.z + 10 });
  B.follow = true; B.slow = 1; B.oldD = cam.d; cam.d = 17; cam.x = ARENA.x - 4; cam.z = ARENA.z + 2; placeCamera();
  document.body.classList.add('battle', 'camp'); $('#bhud').hidden = false; $('#bWave').textContent = `Saga ${c + 1}-${s + 1}${d.boss ? ' · Chefe' : ''}`;
  folk.forEach(f => f.o.visible = false); guards.forEach(g2 => g2.o.visible = false);
  Music.start('batalha'); Snd.horn(); say(d.boss ? `${FOES[CHAPTERS[c].boss].name}! Lutem, vikings!` : 'Avante, vikings!');
  toast(`${CHAPTERS[c].name} · fase ${s + 1}`);
}
function glowEyes() { ['Skeleton_Minion', 'Skeleton_Warrior', 'Skeleton_Rogue', 'Skeleton_Mage'].forEach(n => G[n] && G[n].scene.traverse(m => { if (m.isMesh && /Eyes/.test(m.name)) { m.material.emissive = new THREE.Color('#ff3a1a'); m.material.emissiveIntensity = 1.4; } })); }
function endCamp(win) {
  const g = B.g, c = B.chap, s = B.stage, heroes = B.units.filter(u => u.side === 'ally' && (u.kind === 'hero' || u.D.isHero));
  const aliveH = heroes.filter(u => !u.dead).length, starsN = !win ? 0 : aliveH === heroes.length && B.t < 90 ? 3 : aliveH >= Math.ceil(heroes.length / 2) ? 2 : 1;
  let rew = null, first = false;
  if (win) {
    first = !S.camp.stars[g]; rew = stageReward(c, s, first); if (first || Math.random() < .4) rew.gear = 1;
    for (const k in rew) gain(k, rew[k]);
    S.camp.stars[g] = Math.max(S.camp.stars[g] || 0, starsN);
    if (g === S.camp.next) S.camp.next++;
    if (!first) { if (S.camp.rep.d !== today()) S.camp.rep = { d: today(), n: 0 }; S.camp.rep.n++; }
    dcount('saga'); Snd.done(); say(starsN === 3 ? 'Vitória perfeita! Skål!' : 'Vitória!');
  } else { Snd.lose(); say('Recuar! Voltaremos mais fortes.'); }
  save(); dirty = true;
  B.pendEnd = { win, t: .7, html: win
    ? `<h2>Vitória!</h2><div class="bigstars">${'<b>★</b>'.repeat(starsN)}${'<i>★</i>'.repeat(3 - starsN)}</div><p class="sub">Saga ${c + 1}-${s + 1} · ${CHAPTERS[c].name}${first ? '' : ' (repetição)'}</p><div class="costs big">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div><div class="actions"><button class="btn" data-a="saga">Continuar a Saga</button><button class="btn ghost" data-a="home">Vila</button></div>`
    : `<h2>Derrota…</h2><p class="sub">Saga ${c + 1}-${s + 1}</p><p class="desc">Evolua seus heróis, pesquise no Círculo de Runas e treine mais tropas. As tropas voltaram vivas para a vila.</p><div class="actions"><button class="btn" data-a="heroes">Heróis</button><button class="btn ghost" data-a="saga">Saga</button></div>` };
}
function leaveCamp() {
  if (arenaG) arenaG.visible = false; setAmbience(-1);
  Object.assign(CAMB, { x0: -18, x1: 18, z0: -10, z1: 14 }); cam.x = 0; cam.z = 3; document.body.classList.remove('camp');
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
  if (ship) { ship.position.y = -.05 + Math.sin(now / 900) * .05; ship.rotation.z = Math.sin(now / 1300) * .03; ship.userData.update(now / 1000, dt / 1000, false); }
  clouds.forEach(c => { c.position.x += dt * .0006; if (c.position.x > 40) c.position.x = -40; });
  if (!reduceMotion && (smokeT -= dt) < 0) { smokeT = 420; spawnSmoke(); }
  for (let i = smokes.length - 1; i >= 0; i--) { const s = smokes[i]; s.life -= dt / 3000; s.m.position.y += dt * .0007; s.m.position.x += dt * .0003; s.m.scale.setScalar(.4 + (1 - s.life) * 1.1); s.m.material.opacity = s.life * .55; if (s.life <= 0) { scene.remove(s.m); s.m.material.dispose(); smokes.splice(i, 1); } }
  for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.life -= dt / 900; const a = s.pts.geometry.attributes.position; s.vel.forEach((v, k) => { a.array[k * 3] += v[0]; a.array[k * 3 + 1] += v[1]; a.array[k * 3 + 2] += v[2]; v[1] -= .004; }); a.needsUpdate = true; s.pts.material.opacity = s.life; if (s.life <= 0) { scene.remove(s.pts); sparks.splice(i, 1); } }
  updateTags(); updateFieldTags(); renderTut(); watchFps(ds);
  let shk = null; if (B && B.shake > 0) { B.shake -= ds; shk = [(Math.random() - .5) * .22, (Math.random() - .5) * .16]; camera.position.x += shk[0]; camera.position.y += shk[1]; }
  renderer.render(scene, camera);
  if (shk) { camera.position.x -= shk[0]; camera.position.y -= shk[1]; }
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
  if (p.type === 'taverna' && L) html += `<div class="actions"><button class="btn" data-a="tavern">Recrutar heróis</button><button class="btn ghost" data-a="heroes">Ver heróis</button></div>`;
  if (p.type === 'runas') html += runasHTML();
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
  if (a.dataset.a === 'dq') claimDq(a.dataset.k);
  if (a.dataset.a === 'chestopen') openChest();
  if (a.dataset.a === 'chest') claimChest();
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
  openSheet(`<h2>Missões</h2>${dailyHTML()}<p class="sub" style="margin-top:12px">Missões da história</p>
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
    if (this.arenaOk !== false && S.team.length) { const sn = mySnapshot(); this.sb.from('arena').upsert({ user_id: this.user.id, jarl: S.jarl || 'Jarl', rating: arenaState().rating, power: snapPower(sn), snap: sn, updated_at: new Date().toISOString() }).then(r => { if (r.error) this.arenaOk = false; }); }
    if (this.evOk !== false) { const ev = evState(); if (ev.pts > 0) this.sb.from('event_scores').upsert({ week: ev.w, user_id: this.user.id, jarl: S.jarl || 'Jarl', pts: ev.pts }).then(r => { if (r.error) this.evOk = false; }); }
    if (this.towOk !== false && S.tower && S.tower.best > 0) this.sb.from('tower').upsert({ user_id: this.user.id, jarl: S.jarl || 'Jarl', best: S.tower.best, updated_at: now }).then(r => { if (r.error) this.towOk = false; });
    if (S.clan && this.clanOk !== false) this.sb.from('clan_members').update({ jarl: S.jarl || 'Jarl', power: Math.min(200000, power()) }).eq('user_id', this.user.id).then(() => {});
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
  openSheet(`<p class="ver">versão ${GAME_VERSION}</p><h2>Perfil</h2><p class="sub">Poder ${fmt(power())} · Onda ${S.wave > MAXWAVE ? 'todas vencidas' : S.wave}</p>
    <label class="fld"><span>Nome do Jarl</span><input id="pfJarl" maxlength="18" value="${esc(S.jarl || 'Jarl')}"></label>
    <label class="fld"><span>Nome da vila</span><input id="pfVila" maxlength="24" value="${esc(S.vila || 'Vila do Jarl')}"></label>
    <div class="actions" style="margin:8px 0 0"><button class="btn ghost sm" data-a="ach">Conquistas${achReady() ? ' •' : ''}</button><button class="btn ghost sm" data-a="tower">Torre: andar ${S.tower.best}</button></div>
    ${acc}
    <p class="sub" style="margin-top:12px">Levar a vila para outro navegador ou aparelho</p>
    <p class="desc" style="font-size:13px">${u ? 'Com a conta: basta entrar com o mesmo e-mail no outro navegador.' : 'O jeito mais fácil é entrar com seu e-mail acima. Sem conta, use o código da vila:'}</p>
    <div class="actions" style="margin:4px 0 0"><button class="btn ghost sm" data-p="xout">Copiar código da vila</button><button class="btn ghost sm" data-p="xin">Colar código</button></div>
    <p class="sub" style="margin-top:12px">Ajustes</p>
    <div class="sets">
      <div class="setrow"><span>Música</span><button class="tg${S.music ? ' on' : ''}" data-p="set" data-k="music">${S.music ? 'Ligada' : 'Desligada'}</button></div>
      <div class="setrow"><span>Efeitos sonoros</span><button class="tg${S.sound ? ' on' : ''}" data-p="set" data-k="sound">${S.sound ? 'Ligados' : 'Desligados'}</button></div>
      <div class="setrow"><span>Narrador</span><button class="tg${S.voice ? ' on' : ''}" data-p="set" data-k="voice">${S.voice ? 'Ligado' : 'Desligado'}</button></div>
      <div class="setrow"><span>Filme antes das batalhas</span><button class="tg${S.bintro !== false ? ' on' : ''}" data-p="set" data-k="bintro">${S.bintro !== false ? 'Ligado' : 'Desligado'}</button></div>
      <div class="setrow"><span>Gráficos</span><div class="seg">${[['auto', 'Auto'], ['alto', 'Alto'], ['leve', 'Leve']].map(([k, t]) => `<button class="${(S.gfx || 'auto') === k ? 'on' : ''}" data-p="gfx" data-k="${k}">${t}</button>`).join('')}</div></div>
      <div class="setrow"><span>Tutorial</span><button class="tg" data-p="tut">Ver de novo</button></div>
    </div>
    ${isStandalone() ? '' : `<div class="actions"><button class="btn ghost" data-p="install">Instalar no celular</button></div>`}
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
  if (k === 'prof') openProfile();
  if (k === 'install') installApp();
  if (k === 'set') { const key = a.dataset.k; S[key] = !S[key]; save(); if (key === 'music') { if (S.music) { Snd.init(); Music.start(B ? 'batalha' : 'vila'); } else Music.stop(); } if (key === 'voice' && S.voice) say('Skål, Jarl!'); openProfile(); }
  if (k === 'gfx') { S.gfx = a.dataset.k; save(); applyGfx(S.gfx === 'auto' ? (lowHint() ? 'leve' : 'alto') : S.gfx, true); toast('Gráficos: ' + a.textContent); openProfile(); }
  if (k === 'tut') { S.tut = 0; save(); closeSheet(); }
  if (k === 'mail') { const addr = $('#pfMail').value.trim(); a.disabled = true; if (await Cloud.email(addr)) { Cloud.mail = addr; openSheet(`<h2>Confira seu e-mail</h2><p class="desc">Mandamos um e-mail para <b>${esc(addr)}</b> (olhe também o spam).</p>
      <p class="sub">Digite aqui o código que veio no e-mail:</p><div class="mailrow"><input id="pfCode" inputmode="numeric" autocomplete="one-time-code" maxlength="10" placeholder="código" style="letter-spacing:.2em;text-align:center"><button class="btn sm" data-p="code">Entrar</button></div>
      <p class="desc" style="font-size:13px">Ou toque no link do e-mail <b>abrindo-o neste mesmo navegador</b>. Se o link abrir em outro navegador, use o código.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); } else a.disabled = false; }
  if (k === 'code') { const c = ($('#pfCode').value || '').replace(/\D/g, ''); if (c.length < 6) { toast('Digite o código do e-mail'); Snd.no(); return; } a.disabled = true; const { error } = await Cloud.sb.auth.verifyOtp({ email: Cloud.mail, token: c, type: 'email' }); if (error) { a.disabled = false; toast('Código errado ou vencido'); Snd.no(); } else { closeSheet(); toast('Conta conectada!'); } }
  if (k === 'xout') exportVila();
  if (k === 'xin') openImport();
  if (k === 'xgo') importVila(($('#xCode').value || '').trim());
  if (k === 'sync') { await Cloud.push(true); openProfile(); }
  if (k === 'out') { await Cloud.logout(); openProfile(); }
});

async function openRanking(tab) {
  sheetFor = null; Cloud.rankTab = tab || Cloud.rankTab;
  const t = Cloud.rankTab, head = `<h2>Ranking de Jarls</h2><div class="tabs"><button data-r="power" class="${t === 'power' ? 'on' : ''}">Poder</button><button data-r="wave" class="${t === 'wave' ? 'on' : ''}">Ondas</button><button data-r="tower" class="${t === 'tower' ? 'on' : ''}">Torre</button><button data-r="clan" class="${t === 'clan' ? 'on' : ''}">Clãs</button></div>`;
  if (!Cloud.on()) { openSheet(head + `<p class="desc">O ranking ainda não foi ativado.</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  openSheet(head + `<p class="sub">Carregando…</p>`);
  if (t === 'tower' || t === 'clan') return openRanking2(t, head);
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
/* ========== Código da vila: levar o progresso sem conta ========== */
const b64 = u8 => { let s = ''; for (let i = 0; i < u8.length; i += 8192) s += String.fromCharCode.apply(null, u8.subarray(i, i + 8192)); return btoa(s); };
async function packVila() {
  const txt = JSON.stringify(Object.assign({}, S, { owner: null }));
  if (window.CompressionStream) { const st = new Blob([txt]).stream().pipeThrough(new CompressionStream('gzip')); return 'VS1z' + b64(new Uint8Array(await new Response(st).arrayBuffer())); }
  return 'VS1j' + btoa(unescape(encodeURIComponent(txt)));
}
async function unpackVila(code) {
  code = code.replace(/\s+/g, ''); const kind = code.slice(0, 4), raw = atob(code.slice(4)), u8 = Uint8Array.from(raw, c => c.charCodeAt(0));
  if (kind === 'VS1z') return JSON.parse(await new Response(new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'))).text());
  if (kind === 'VS1j') return JSON.parse(decodeURIComponent(escape(raw)));
  throw new Error('código inválido');
}
async function exportVila() {
  save(); const code = await packVila(); let ok = false;
  try { await navigator.clipboard.writeText(code); ok = true; } catch (e) {}
  openSheet(`<h2>Código da vila</h2><p class="desc">${ok ? 'Código <b>copiado</b>! ' : ''}No outro navegador, abra o jogo → Perfil → <b>Colar código</b>. Você pode mandar o código para você mesmo pelo WhatsApp ou e-mail.</p>
    <textarea id="xShow" readonly rows="5" style="width:100%;font:12px monospace;border-radius:10px;padding:8px;background:#120d09;color:#e8d6a8;border:1px solid #3d3024">${code}</textarea>
    <p class="sub">Não compartilhe com outras pessoas: quem tiver o código copia a sua vila.</p>
    <div class="actions"><button class="btn" data-a="close">Ok</button></div>`);
  const t = $('#xShow'); if (t && !ok) { t.focus(); t.select(); }
}
function openImport() {
  openSheet(`<h2>Colar código da vila</h2><p class="desc">Cole o código copiado no outro navegador. <b>A vila deste navegador será substituída.</b></p>
    <textarea id="xCode" rows="5" placeholder="VS1…" style="width:100%;font:12px monospace;border-radius:10px;padding:8px;background:#120d09;color:#e8d6a8;border:1px solid #3d3024"></textarea>
    <div class="actions"><button class="btn" data-p="xgo">Carregar vila</button><button class="btn ghost" data-a="close">Cancelar</button></div>`);
}
async function importVila(code) {
  let R; try { R = await unpackVila(code); } catch (e) { toast('Código inválido'); Snd.no(); return; }
  if (!R || !R.b || !R.res) { toast('Código inválido'); Snd.no(); return; }
  if (B) cleanupBattle(); R.last = Date.now(); R.owner = Cloud.user ? Cloud.user.id : null;
  leaving = true; try { localStorage.setItem(SKEY, JSON.stringify(R)); } catch (e) {}
  if (Cloud.user) { Cloud.ready = true; S = R; await Cloud.push(true).catch(() => {}); }
  location.reload();
}
// lembrete para quem joga sem conta (uma vez por dia, depois de algum progresso)
setTimeout(() => {
  if (!Cloud.on() || Cloud.user || B || CINE || !sheet.hidden || S.nagD === today() || (S.b.salao.lvl || 0) < 2 || (S.tut || 0) < 99) return;
  S.nagD = today(); save();
  openSheet(`<h2>Proteja sua vila</h2><p class="desc">Sua vila está salva <b>só neste navegador</b>. Se trocar de navegador, de celular ou limpar os dados, ela some.</p><p class="desc">Entre com seu e-mail (é grátis e rápido) para salvar na nuvem e continuar de onde parou em qualquer aparelho.</p><div class="actions"><button class="btn" data-p="prof">Salvar minha vila</button><button class="btn ghost" data-a="close">Agora não</button></div>`);
}, 45000);


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
  if (!restReady) { toast('Carregando… tente em um instante'); return; }
  for (const r in e.rew) gain(r, e.rew[r]);
  if (e.gems) for (const g in e.gems) { gain(g, e.gems[g]); if (g === 'trofeu') S.stats.trofeuFirst = 1; else S.stats.gemFound = (S.stats.gemFound || 0) + e.gems[g]; }
  const sk = { lenha: 'expLenha', mina: 'expMina', caca: 'expCaca' }[k]; S.stats[sk] = (S.stats[sk] || 0) + 1;
  S.exp[k] = null; dcount('exp_' + k); save(); dirty = true;
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
  const f = S.fields[i]; if (!f || Date.now() < f.end || CINE || B || !restReady) return;
  const C = CROPS[f.c], q = cropYield(f.c), rew = { [C.cat]: q };
  gain(C.cat, q); dcount('colher'); S.stats.harvest = (S.stats.harvest || 0) + 1; S.fields[i] = null; save(); dirty = true;
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
  dcount('curral'); S.cur.ovos -= o; S.cur.leite -= l; gain('ovos', o); gain('leite', l); S.stats.curral = (S.stats.curral || 0) + 1; save(); dirty = true;
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
$('#cineSkip').addEventListener('click', () => { if (B && B.intro) endIntro(); else if (B && B.ending) finishEnding(); else skipCine(); });
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

/* ========== Retratos dos heróis (desenhados uma vez em 3D) ========== */
const PORTRAIT = {};
let pR = null;
function heroPortrait(id) {
  if (PORTRAIT[id]) return PORTRAIT[id];
  if (!restReady) return '';
  try {
    if (!pR) { pR = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true }); pR.setSize(160, 160); pR.outputColorSpace = THREE.SRGBColorSpace; pR.toneMapping = THREE.NeutralToneMapping; }
    const H = HEROES[id], sc = new THREE.Scene(); sc.add(new THREE.HemisphereLight('#fff8ec', '#4a3a2a', 2.2)); const dl = new THREE.DirectionalLight('#fff', 1.6); dl.position.set(1, 2, 3); sc.add(dl);
    const c = mkChar(H.model, 1, H.r, H.l); addFace(c); setFace(c, H.rar === 'lend' ? 'angry' : 'calm'); c.mixer.update(.4); c.o.rotation.y = -.35; sc.add(c.o);
    const cam = new THREE.PerspectiveCamera(30, 1, .1, 20); cam.position.set(.3, 1.75, 3.3); cam.lookAt(0, 1.45, 0);
    pR.render(sc, cam); PORTRAIT[id] = pR.domElement.toDataURL('image/png');
  } catch (e) { PORTRAIT[id] = ''; }
  return PORTRAIT[id];
}
const stars = n => '★'.repeat(n) + '<i>' + '★'.repeat(5 - n) + '</i>';
const pimg = id => { const u = heroPortrait(id); return u ? `<img src="${u}" alt="">` : `<span class="pfb">ᛉ</span>`; };

/* ========== Tela de heróis ========== */
function openHeroes() {
  sheetFor = null; const slots = teamSlots();
  const owned = HERO_IDS.filter(id => hs(id).lvl), rest = HERO_IDS.filter(id => !hs(id).lvl);
  const card = id => { const H = HEROES[id], h = hs(id), R = RAR[H.rar], inTeam = S.team.includes(id);
    const prog = h.lvl ? (h.st < 5 ? `${h.sh}/${heroStarCost(id, h.st)}` : 'máx.') : `${h.sh}/${R.need}`;
    const can = h.lvl ? (h.st < 5 && h.sh >= heroStarCost(id, h.st)) : h.sh >= R.need;
    return `<button class="hcard${h.lvl ? '' : ' locked'}${inTeam ? ' team' : ''}${can ? ' can' : ''}" data-a="hero" data-k="${id}" style="--rc:${R.col}">
      <div class="pt">${pimg(id)}</div><b>${H.name}</b><small>${h.lvl ? 'Nv ' + h.lvl : R.n}</small><div class="st">${h.lvl ? stars(h.st) : ''}</div>
      <div class="shb"><i style="width:${Math.min(100, h.sh / (h.lvl ? heroStarCost(id, h.st) || 1 : R.need) * 100)}%"></i><span>${prog}</span></div></button>`; };
  openSheet(`<h2>Heróis</h2><p class="sub">Equipe da batalha: ${S.team.length}/${slots} · mais vagas com o Salão nos níveis 3 e 6</p>
    <div class="teamrow">${Array.from({ length: 3 }, (_, i) => { const id = S.team[i]; return i >= slots ? '<div class="slot lock">🔒</div>' : id ? `<button class="slot" data-a="hero" data-k="${id}">${pimg(id)}</button>` : '<div class="slot">+</div>'; }).join('')}</div>
    <div class="hgrid">${owned.concat(rest).map(card).join('')}</div>
    <div class="costs" style="margin-top:10px"><div class="cost">${icoSVG('saga')}${S.gems.saga || 0}</div><div class="cost">${icoSVG('mead')}${S.gems.mead || 0}</div></div>
    <div class="actions"><button class="btn" data-a="tavern">Taverna: recrutar</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
function openHero(id) {
  sheetFor = null; const H = HEROES[id], h = hs(id), R = RAR[H.rar];
  if (!h.lvl) {
    openSheet(`<div class="hhead" style="--rc:${R.col}"><div class="pt big">${pimg(id)}</div><div><h2>${H.name}</h2><p class="sub">${H.tit} · <b style="color:${R.col}">${R.n}</b></p></div></div>
      <div class="stat"><span>Habilidade: ${H.skn}</span></div><p class="desc">${H.skd}</p>
      <div class="stat"><span>Fragmentos</span><span>${h.sh} / ${R.need}</span></div>
      <p class="sub">Ganhe fragmentos na Saga, na Taverna, nos eventos e nas missões.</p>
      <div class="actions"><button class="btn" data-a="hunlock" data-k="${id}" ${h.sh >= R.need ? '' : 'disabled'}>Recrutar ${H.name}</button><button class="btn ghost" data-a="heroes">Voltar</button></div>`); return;
  }
  const s = hStats(id), maxL = heroMaxLv(h.st), lc = heroLvCost(id, h.lvl), sc = heroStarCost(id, h.st), inTeam = S.team.includes(id);
  openSheet(`<div class="hhead" style="--rc:${R.col}"><div class="pt big">${pimg(id)}</div><div><h2>${H.name}</h2><p class="sub">${H.tit} · <b style="color:${R.col}">${R.n}</b></p><div class="st big">${stars(h.st)}</div></div></div>
    <div class="stat"><span>Nível</span><span>${h.lvl} / ${maxL}</span></div>
    <div class="stat"><span>Vida · Dano</span><span>${fmt(s.hp)} · ${fmt(s.dmg)}${H.ranged ? ' · à distância' : ''}</span></div>
    <div class="stat"><span>${H.skn}</span><span>recarga ${s.cd.toFixed(0)}s</span></div><p class="desc" style="font-size:14px">${H.skd}</p>
    ${gearSlotsHTML(id)}
    ${h.lvl < maxL ? `<p class="sub">Subir para o nível ${h.lvl + 1}</p>${costHTML(lc)}<div class="actions"><button class="btn" data-a="hlvl" data-k="${id}" ${canAfford(lc) ? '' : 'disabled'}>Subir de nível</button></div>` : `<p class="sub">Nível máximo para ${h.st} estrela${h.st > 1 ? 's' : ''}. Suba as estrelas para liberar mais níveis.</p>`}
    ${h.st < 5 ? `<p class="sub" style="margin-top:8px">Próxima estrela: +18% de força e mais 10 níveis</p>${costHTML({ ['h:' + id]: sc })}<div class="actions"><button class="btn rune" data-a="hstar" data-k="${id}" ${h.sh >= sc ? '' : 'disabled'}>Subir estrela</button></div>` : '<p class="ok">5 estrelas: lenda completa!</p>'}
    <div class="actions"><button class="btn ${inTeam ? 'ghost' : ''}" data-a="hteam" data-k="${id}">${inTeam ? 'Tirar da equipe' : 'Pôr na equipe'}</button><button class="btn ghost" data-a="heroes">Voltar</button></div>`);
}
function openTavern() {
  sheetFor = null; const m = S.gems.mead || 0, pity = 10 - ((S.pity || 0) % 10);
  openSheet(`<h2>Taverna</h2><p class="sub">Pague uma rodada de hidromel e os heróis contam suas sagas</p>
    <div class="stat"><span>Seu hidromel</span><span>${icoSVG('mead')} ${m}</span></div>
    <div class="odds">${RECRUIT_ODDS.map(([k, p]) => `<span style="color:${RAR[k].col}">${RAR[k].n} ${Math.round(p * 100)}%</span>`).join('')}</div>
    <p class="sub">${S.firstRec ? '' : '<b style="color:var(--gold-hi)">Primeira rodada: um herói garantido!</b> '}Cada rodada dá fragmentos; completou os fragmentos, o herói entra na equipe. Garantia: a cada 10 rodadas, fragmentos de herói Épico ou Lendário (faltam ${pity}). O hidromel vem da Saga, das missões, do baú e dos eventos.</p>
    <div class="actions"><button class="btn" data-a="rec" data-k="1" ${m >= 1 ? '' : 'disabled'}>1 rodada · ${icoSVG('mead')}1</button><button class="btn rune" data-a="rec" data-k="10" ${m >= 10 ? '' : 'disabled'}>10 rodadas · ${icoSVG('mead')}10</button></div>
    <div class="actions"><button class="btn ghost" data-a="heroes">Ver heróis</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
function doRecruit(n) {
  if ((S.gems.mead || 0) < n) return; S.gems.mead -= n; const got = [];
  // primeira rodada da vida: um herói garantido inteiro
  if (!S.firstRec) { S.firstRec = 1; const pick = ['erik', 'harald', 'leif'].find(id => !hs(id).lvl); if (pick) { const need = RAR[HEROES[pick].rar].need, add = Math.max(0, need - hs(pick).sh); hs(pick).sh += add; got.push({ id: pick, n: add }); } }
  for (let i = 0; i < n; i++) { S.pity = (S.pity || 0) + 1; got.push(recruitOnce(S.pity % 10 === 0)); }
  const sum = {}; got.forEach(g => sum[g.id] = (sum[g.id] || 0) + g.n);
  // quem completou os fragmentos entra na hora para a saga
  const fresh = Object.keys(sum).filter(id => { const h = hs(id), need = RAR[HEROES[id].rar].need; if (h.lvl || h.sh < need) return false; h.sh -= need; h.lvl = 1; h.st = 1; if (S.team.length < teamSlots()) S.team.push(id); return true; });
  dcount('recrutar', n); save(); dirty = true; Snd.chime(); if (fresh.length) { Snd.done(); say(`${HEROES[fresh[0]].name} entrou para a sua saga!`); }
  openSheet(`<h2>${fresh.length ? 'Novo herói!' : 'Fragmentos recebidos!'}</h2><div class="reveal">${Object.entries(sum).map(([id, v], i) => { const H = HEROES[id], R = RAR[H.rar], h = hs(id), nw = fresh.includes(id); return `<div class="rv${nw ? ' new' : ''}" style="--rc:${R.col};animation-delay:${i * .12}s"><div class="pt">${pimg(id)}</div><b>${H.name}</b><small style="color:${R.col}">${nw ? 'NOVO HERÓI!' : R.n}</small><span>+${v}</span><small>${h.lvl ? (nw ? 'recrutado' : 'p/ estrelas') : `${h.sh}/${R.need}`}</small></div>`; }).join('')}</div>
    <p class="sub">${fresh.length ? 'Ele já está na sua equipe (se houver vaga). ' : ''}Junte fragmentos de um herói (Comum 10, Raro 20, Épico 30, Lendário 50) e ele entra para a sua saga automaticamente.</p>
    <div class="actions"><button class="btn" data-a="heroes">Ver heróis</button><button class="btn ghost" data-a="tavern">Taverna</button></div>`);
}

/* ========== Círculo de Runas ========== */
function runasHTML() {
  const L = S.b.runas.lvl; if (!L) return '';
  const R = S.rs; let h = '';
  if (R) { const t = TECH_BY[R.k], left = Math.max(0, R.end - Date.now()), c = Math.ceil(left / 60000);
    h += `<div class="exp"><div class="exph"><b>Pesquisando</b><small>${t.n} ${(S.research[t.k] || 0) + 1}</small></div><div class="hbar gold"><i style="width:${(1 - left / (R.dur * 1000)) * 100}%"></i></div><div class="exprow"><span>Termina em</span><span>${fmtT(left / 1000)}</span></div><div class="actions"><button class="btn rune" data-a="rspeed">${c ? `Acelerar · ${c} runa${c > 1 ? 's' : ''}` : 'Concluir'}</button></div></div>`; }
  h += TECH.map(b => `<p class="sub" style="margin:10px 0 4px">${b.br}</p><div class="techs">${b.list.map(([k, n, d]) => { const l = S.research[k] || 0, max = l >= 5, req = techReq(l), lock = L < req, cost = max ? null : techCost(k, l);
    return `<button class="tech${max ? ' max' : ''}${lock ? ' locked' : ''}" data-a="tech" data-k="${k}"><b>${n}</b><small>${d}</small><span class="lv">${'◆'.repeat(l)}${'◇'.repeat(5 - l)}</span>${max ? '<span class="ok">completo</span>' : lock ? `<span class="req">Círculo nível ${req}</span>` : `<span class="tc">${Object.entries(cost).map(([r, v]) => `${icoSVG(r)}${fmt(v)}`).join(' ')} · ${fmtT(techTime(l))}</span>`}</button>`; }).join('')}</div>`).join('');
  return h;
}
function startTech(k) {
  const l = S.research[k] || 0, c = techCost(k, l);
  if (S.rs) { toast('Já há uma pesquisa em andamento'); Snd.no(); return; }
  if (l >= 5 || S.b.runas.lvl < techReq(l)) return;
  if (!canAfford(c)) { toast('Faltam recursos'); Snd.no(); return; }
  spend(c); const dur = techTime(l); S.rs = { k, end: Date.now() + dur * 1000, dur }; dcount('pesquisa'); Snd.build(); save(); dirty = true; renderSheet();
}

/* ========== Saga (mapa da campanha) ========== */
let sagaChap = 0;
function openSaga(c) {
  sheetFor = null; const maxC = Math.min(CHAPTERS.length - 1, Math.floor(S.camp.next / STAGES)); sagaChap = c ?? Math.min(maxC, sagaChap || maxC); const C = CHAPTERS[sagaChap];
  const chest = chapStars(sagaChap), got = S.camp.chest[sagaChap];
  const nodes = Array.from({ length: STAGES }, (_, s) => { const g = campIdx(sagaChap, s), st = S.camp.stars[g] || 0, open = g <= S.camp.next, cur = g === S.camp.next;
    return `<button class="node${st ? ' done' : ''}${cur ? ' cur' : ''}${s === 7 ? ' boss' : ''}" data-a="stage" data-k="${g}" ${open ? '' : 'disabled'}><b>${sagaChap + 1}-${s + 1}</b><span>${s === 7 ? '☠' : s === 3 ? '⚔' : ''}</span><i>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</i></button>`; }).join('');
  const PL = patrolLoot();
  openSheet(`<h2>Saga do Fiorde</h2><div class="patrol"><div><b>Patrulha</b><small>${fmtT(Math.min(PATROL_MAX, Date.now() - S.patrol) / 1000)} de 12h · rende mais quanto mais longe você vai na Saga</small><span>${Object.entries(PL.o).map(([k, v]) => `${icoSVG(k)}${fmt(v)}`).join(' ') || 'saiu agora há pouco'}</span></div><button class="btn sm" data-a="patrol" ${Object.keys(PL.o).length ? '' : 'disabled'}>Coletar</button></div>
    <div class="actions" style="margin:4px 0 8px"><button class="btn ghost sm" data-a="arena">⚔ Arena</button><button class="btn ghost sm" data-a="tower">Torre</button><button class="btn ghost sm${achReady() ? ' dotb' : ''}" data-a="ach">Conquistas</button><button class="btn ghost sm" data-a="pass">Passe</button></div>
    <div class="tabs">${CHAPTERS.map((x, i) => `<button data-a="chap" data-k="${i}" class="${i === sagaChap ? 'on' : ''}" ${i <= maxC ? '' : 'disabled'}>${i + 1}</button>`).join('')}</div>
    <p class="sub"><b style="color:var(--gold-hi)">Capítulo ${sagaChap + 1}: ${C.name}</b> · herói do capítulo: ${HEROES[C.hero].name}</p>
    <div class="path">${nodes}</div>
    <div class="stat"><span>Baú de 24 estrelas</span><span>${chest}/24 ${got ? '✓' : chest >= 24 ? `<button class="btn sm" data-a="chapchest" data-k="${sagaChap}">Abrir</button>` : ''}</span></div>
    <p class="sub">Sua equipe: Jarl + ${S.team.map(id => HEROES[id].name).join(', ') || 'nenhum herói'} + ${armyCount()} tropas. As tropas não morrem de verdade na Saga.</p>
    <div class="actions"><button class="btn" data-a="stage" data-k="${Math.min(S.camp.next, campIdx(CHAPTERS.length - 1, STAGES - 1))}">${S.camp.next >= CHAPTERS.length * STAGES ? 'Saga completa!' : `Lutar na fase ${Math.floor(S.camp.next / STAGES) + 1}-${S.camp.next % STAGES + 1}`}</button><button class="btn ghost" data-a="heroes">Heróis</button></div>`);
}
function openStage(g) {
  const c = Math.floor(g / STAGES), s = g % STAGES, d = stageDef(c, s), cnt = {}, first = !S.camp.stars[g];
  d.list.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  const rep = S.camp.rep.d === today() ? S.camp.rep.n : 0;
  openSheet(`<h2>Fase ${c + 1}-${s + 1}</h2><p class="sub">${CHAPTERS[c].name}${d.boss ? ' · CHEFE' : ''} · inimigos nível ${Math.round(d.lvl * 10)}</p>
    <div class="stat"><span>Inimigos</span><span>${Object.entries(cnt).map(([k, v]) => `${v} ${v > 1 ? FOES[k].pl : FOES[k].name}`).join(' · ')}</span></div>
    <p class="sub">${first ? 'Recompensa da primeira vitória' : `Recompensa ao repetir (${rep}/10 hoje)`}</p>${costHTML(stageReward(c, s, first))}
    <p class="sub">★ vencer · ★★ com metade dos heróis de pé · ★★★ sem perder nenhum herói em até 90s</p>
    <div class="actions"><button class="btn" data-a="fightstage" data-k="${g}" ${!first && rep >= 10 ? 'disabled' : ''}>Lutar!</button>${(S.camp.stars[g] || 0) >= 3 ? `<button class="btn rune" data-a="sweep" data-k="${g}" ${rep >= 10 ? 'disabled' : ''}>Vitória rápida</button>` : ''}<button class="btn ghost" data-a="saga">Voltar</button></div>`);
}

/* ========== Evento da semana ========== */
async function openEvent() {
  sheetFor = null; const E = curEvent(), st = evState();
  const head = `<h2>${E.name}</h2><p class="sub">${E.desc} Termina em ${fmtT(evEndsIn() / 1000)}.</p>
    <div class="stat"><span>Seus pontos</span><span><b style="color:var(--gold-hi);font-size:20px">${fmt(st.pts)}</b></span></div>
    <div class="evhow">${Object.entries(E.pts).map(([k, v]) => `<span>${{ obras: 'Obra iniciada', pesquisa: 'Pesquisa', exp_caca: 'Caçada', exp_lenha: 'Lenhadores', exp_mina: 'Mineiros', ondas: 'Onda vencida', saga: 'Fase da Saga', colher: 'Colheita', curral: 'Curral', coletar: 'Coleta' }[k]} +${v}</span>`).join('')}</div>
    <div class="tiers">${EV_TIERS.map(([p, r], i) => { const got = st.got.includes(i), ok = st.pts >= p; return `<div class="tier${got ? ' done' : ok ? ' ok' : ''}"><b>${fmt(p)}</b><span>${Object.entries(r).map(([k, v]) => `${icoSVG(k)}${v}`).join(' ')}</span>${got ? '✓' : ok ? `<button class="btn sm" data-a="evget" data-k="${i}">Pegar</button>` : ''}</div>`; }).join('')}</div>`;
  openSheet(head + `<p class="sub" style="margin-top:10px">Ranking da semana</p><div class="rklist" id="evrk"><p class="sub">${Cloud.on() ? 'Carregando…' : 'Entre na conta para ver o ranking.'}</p></div><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`);
  if (!Cloud.on()) return;
  const { data, error } = await Cloud.sb.from('event_scores').select('user_id,jarl,pts').eq('week', weekNo()).order('pts', { ascending: false }).limit(10);
  const el = $('#evrk'); if (!el) return;
  el.innerHTML = error ? '<p class="sub">Ranking indisponível no momento.</p>' : (data.length ? data.map((r, i) => `<div class="rk${Cloud.user && r.user_id === Cloud.user.id ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="who"><b>${esc(r.jarl)}</b></span><span class="val">${fmt(r.pts)}</span></div>`).join('') : '<p class="sub">Ninguém pontuou ainda. Seja o primeiro!</p>');
}

/* ========== cliques das telas novas ========== */
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.k;
  switch (a.dataset.a) {
    case 'heroes': Snd.tap(); openHeroes(); break;
    case 'hero': Snd.tap(); openHero(k); break;
    case 'hunlock': { const h = hs(k), need = RAR[HEROES[k].rar].need; if (h.sh < need) break; h.sh -= need; h.lvl = 1; h.st = 1; if (S.team.length < teamSlots()) S.team.push(k); Snd.chime(); toast(`${HEROES[k].name} entrou para a sua saga!`); save(); dirty = true; openHero(k); break; }
    case 'hlvl': { const h = hs(k), c = heroLvCost(k, h.lvl); if (h.lvl >= heroMaxLv(h.st) || !canAfford(c)) break; spend(c); h.lvl++; Snd.done(); save(); dirty = true; openHero(k); break; }
    case 'hstar': { const h = hs(k), c = heroStarCost(k, h.st); if (h.st >= 5 || h.sh < c) break; h.sh -= c; h.st++; Snd.chime(); toast(`${HEROES[k].name} agora tem ${h.st} estrelas!`); save(); dirty = true; openHero(k); break; }
    case 'hteam': { const i = S.team.indexOf(k); if (i >= 0) S.team.splice(i, 1); else { if (S.team.length >= teamSlots()) { toast('Equipe cheia: tire alguém primeiro'); Snd.no(); break; } S.team.push(k); } Snd.tap(); save(); openHero(k); break; }
    case 'tavern': Snd.tap(); openTavern(); break;
    case 'rec': doRecruit(+k); break;
    case 'tech': startTech(k); break;
    case 'rspeed': { const c = Math.ceil(Math.max(0, S.rs.end - Date.now()) / 60000); if (S.runes < c) { toast('Runas insuficientes'); Snd.no(); break; } S.runes -= c; S.rs.end = Date.now(); tick(); renderSheet(); break; }
    case 'saga': Snd.tap(); openSaga(); break;
    case 'chap': Snd.tap(); openSaga(+k); break;
    case 'stage': Snd.tap(); openStage(+k); break;
    case 'fightstage': startCamp(+k); break;
    case 'chapchest': { const c = +k; if (S.camp.chest[c] || chapStars(c) < 24) break; S.camp.chest[c] = 1; const r = CHAP_CHEST(c); for (const x in r) gain(x, r[x]); Snd.chime(); save(); dirty = true; openSheet(rewardCard('Baú do capítulo!', CHAPTERS[c].name, r)); break; }
    case 'evget': { const i = +k, st = evState(), [p, r] = EV_TIERS[i]; if (st.got.includes(i) || st.pts < p) break; st.got.push(i); for (const x in r) gain(x, r[x]); Snd.chime(); save(); dirty = true; openEvent(); break; }
  }
});
$('#btnHeroes').addEventListener('click', () => { Snd.init(); Snd.tap(); openHeroes(); });
$('#btnSaga').addEventListener('click', () => { Snd.init(); Snd.tap(); openSaga(); });
$('#btnEvent').addEventListener('click', () => { Snd.init(); Snd.tap(); openEvent(); });
function renderSide() {
  const canHero = HERO_IDS.some(id => { const h = hs(id); return h.lvl ? (h.st < 5 && h.sh >= heroStarCost(id, h.st)) : h.sh >= RAR[HEROES[id].rar].need; });
  $('#btnHeroes').classList.toggle('dot', canHero);
  $('#btnSaga').classList.toggle('dot', Date.now() - S.patrol > 2 * 3600e3 || achReady());
  $('#btnClan').classList.toggle('dot', !!S.clan && cbState().n < CB.tries && S.team.length > 0);
  $('#btnTower').classList.toggle('dot', towerOpen() && S.tower.best === 0); $('#towLv').textContent = towerOpen() ? (S.tower.best ? 'And ' + S.tower.best : 'Nova!') : '🔒';
  { const p = passState(), lv = Math.floor(p.xp / PASS_XP); $('#btnPass').classList.toggle('dot', Array.from({ length: lv }, (_, i) => i).some(i => !p.got.includes(i))); $('#passLv').textContent = 'Nv ' + lv; }
  $('#btnArena').classList.toggle('dot', arenaState().used < ARENA_TICKETS && S.team.length > 0 && S.b.salao.lvl >= 3);
  $('#btnEvent').classList.toggle('dot', EV_TIERS.some(([p], i) => evState().pts >= p && !evState().got.includes(i)));
  $('#evLeft').textContent = fmtT(evEndsIn() / 1000).split(' ')[0];
}

/* ========== Telas: equipamentos, passe, arena ========== */
function gearSlotsHTML(id) {
  return `<div class="gslots">${Object.keys(GSLOT).map(sl => { const it = S.gear.find(g => g.on === id && g.slot === sl);
    return `<button class="gslot" data-a="gpick" data-k="${id}" data-v="${sl}" style="--rc:${it ? RAR[it.rar].col : '#5a4632'}">${it ? gearIco(it) + `<b>+${it.lv}</b><small>${gearTxt(it)}</small>` : `<span>+</span><small>${GSLOT[sl].n}</small>`}</button>`; }).join('')}</div>`;
}
function openGearPick(id, sl) {
  sheetFor = null; const list = S.gear.filter(g => g.slot === sl).sort((a, b) => ['lend', 'epico', 'raro', 'comum'].indexOf(a.rar) - ['lend', 'epico', 'raro', 'comum'].indexOf(b.rar) || b.lv - a.lv);
  openSheet(`<h2>${GSLOT[sl].n} de ${HEROES[id].name}</h2><p class="sub">Equipamentos caem nas fases da Saga e no Passe do Jarl</p>
    <div class="glist">${list.length ? list.map(it => { const c = gearUpCost(it), mine = it.on === id; return `<div class="gitem${mine ? ' on' : ''}" style="--rc:${RAR[it.rar].col}">${gearIco(it)}<div class="gi"><b>${gearName(it)} +${it.lv}</b><small>${gearTxt(it)}${it.on && !mine ? ` · com ${HEROES[it.on].name}` : ''}</small></div>
      <div class="gb">${mine ? `<button class="btn sm ghost" data-a="gun" data-k="${it.uid}" data-v="${id}">Tirar</button>` : `<button class="btn sm" data-a="gon" data-k="${it.uid}" data-v="${id}">Usar</button>`}
      ${it.lv < 10 ? `<button class="btn sm rune" data-a="gup" data-k="${it.uid}" data-v="${id}" ${canAfford(c) ? '' : 'disabled'} title="${fmt(c.iron)} ferro, ${fmt(c.wood)} madeira">+1</button>` : ''}
      ${!it.on ? `<button class="btn sm ghost" data-a="gsalv" data-k="${it.uid}" data-v="${id}" title="Desmanchar: +${gearSalvage(it)} ferro">♻</button>` : ''}</div></div>`; }).join('') : '<p class="desc">Nenhum item deste tipo ainda. Vença fases da Saga para conseguir.</p>'}</div>
    <p class="sub">Forjar +1 custa ferro e madeira · ♻ desmancha o item e devolve ferro</p>
    <div class="actions"><button class="btn ghost" data-a="hero" data-k="${id}">Voltar</button></div>`);
}
function openPass() {
  sheetFor = null; const p = passState(), lv = Math.floor(p.xp / PASS_XP);
  openSheet(`<h2>Passe do Jarl</h2><p class="sub">Temporada ${seasonNo() % 100} · termina em ${fmtT(seasonEnds() / 1000)} · nível ${lv}/${PASS_LV}</p>
    <div class="hbar gold"><i style="width:${p.xp % PASS_XP}%"></i></div><p class="sub">${p.xp % PASS_XP}/${PASS_XP} XP para o próximo nível · ganhe XP jogando: missões do dia, batalhas, Saga, expedições, colheitas</p>
    <div class="ptrack">${Array.from({ length: PASS_LV }, (_, i) => { const r = passReward(i), got = p.got.includes(i), ok = lv > i; return `<div class="pt2${got ? ' done' : ok ? ' ok' : ''}${(i + 1) % 10 === 0 ? ' big' : ''}"><b>${i + 1}</b><span>${Object.entries(r).map(([k, v]) => `${k === 'gear' ? '<svg viewBox="0 0 24 24" style="color:#c08cff">' + GEAR_ICO.arma + '</svg>' : icoSVG(k)}${v}`).join(' ')}</span>${got ? '✓' : ok ? `<button class="btn sm" data-a="pget" data-k="${i}">Pegar</button>` : ''}</div>`; }).join('')}</div>
    <div class="pgold"><b>Trilha Dourada</b><span>Em breve: prêmios extras e aparências para quem apoiar o jogo.</span></div>
    <div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
let arenaOpps = [];
async function openArena(refresh) {
  sheetFor = null; const A = arenaState(), left = ARENA_TICKETS - A.used;
  const head = `<h2>Arena dos Jarls</h2><p class="sub">Sua equipe contra a de outros jarls. Ganhe pontos de arena e prêmios.</p>
    <div class="stat"><span>Seus pontos</span><span><b style="color:var(--gold-hi);font-size:20px">${A.rating}</b> · ${A.wins} vitórias</span></div>
    <div class="stat"><span>Lutas hoje</span><span>${left} de ${ARENA_TICKETS}</span></div>
    <div class="stat"><span>Seu poder de equipe</span><span>${fmt(snapPower(mySnapshot()))}</span></div>`;
  if (!arenaOpps.length || refresh) {
    openSheet(head + '<p class="sub">Procurando rivais…</p>');
    let real = [];
    if (Cloud.on() && Cloud.arenaOk !== false) {
      const { data, error } = await Cloud.sb.from('arena').select('user_id,jarl,rating,power,snap').gte('rating', A.rating - 300).lte('rating', A.rating + 300).limit(25);
      if (!error && data) real = data.filter(r => !Cloud.user || r.user_id !== Cloud.user.id).sort(() => Math.random() - .5).slice(0, 3).map(r => ({ name: r.jarl, rating: r.rating, snap: r.snap }));
    }
    arenaOpps = real.concat(Array.from({ length: 3 - real.length }, (_, i) => botSnapshot(i + Math.floor(Math.random() * 99))));
  }
  if (sheet.hidden && !refresh) return;
  openSheet(head + `<p class="sub" style="margin-top:8px">Escolha um rival</p><div class="opps">${arenaOpps.map((o, i) => `<div class="opp"><div><b>${esc(o.name)}</b><small>${o.bot ? 'rival do fiorde' : 'jogador'} · ${o.rating} pts · poder ${fmt(snapPower(o.snap))}</small><span class="oh">${o.snap.team.map(t => `<i style="color:${RAR[HEROES[t.id].rar].col}">${HEROES[t.id].name} ${t.lvl}</i>`).join(' ')}</span></div><button class="btn sm" data-a="afight" data-k="${i}" ${left > 0 ? '' : 'disabled'}>Lutar</button></div>`).join('')}</div>
    <p class="sub">Vitória: +20 pontos, runas e pergaminhos. Derrota: −12 pontos. ${Cloud.on() ? '' : 'Entre na conta para enfrentar jogadores de verdade.'}</p>
    <div class="actions"><button class="btn ghost" data-a="arefresh">Outros rivais</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
function startArena(i) {
  const o = arenaOpps[i], A = arenaState(); if (!o || B || CINE || A.used >= ARENA_TICKETS) return;
  if (!restReady) { toast('Carregando… só um instante'); return; }
  closeSheet(); Snd.init(); buildArena(4); setAmbience(4);
  B = { mode: 'arena', island: true, opp: o, lvlF: 1, wave: 1, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: 0, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0, walls: null, shooters: [], later: [], exD: {},
    bounds: { x0: ARENA.x - 13, x1: ARENA.x + 13, z0: ARENA.z - 8, z1: ARENA.z + 8 }, rally: [ARENA.x - 4.5, ARENA.z] };
  B.hero = mkUnit('ally', 'hero', ARENA.x - 7, ARENA.z); activate(B.hero);
  S.team.forEach((id, j) => { const u = mkUnit('ally', 'h_' + id, ARENA.x - 6.3, ARENA.z - 1.4 + j * 1.4); u.spawnAt = .2 + j * .2; B.queue.push(u); });
  let k = 0; ['hus', 'war', 'arc'].forEach(type => { for (let j = 0; j < (S.army[type] || 0); j++) { const u = mkUnit('ally', type, ARENA.x - 8 - Math.random(), ARENA.z + (Math.random() - .5) * 5); u.spawnAt = .5 + k++ * .12; B.queue.push(u); } });
  // o time do rival
  const sn = o.snap, add = (key, D, x, z, at) => { B.exD[key] = Object.assign({}, D, { exact: true }); const u = mkUnit('enemy', key, x, z); u.spawnAt = at; B.queue.push(u); B.total++; };
  add('x_jarl', { name: o.name, model: 'Barbarian', r: 'axe_2handed', scale: .36, hp: sn.jarl.hp, dmg: sn.jarl.dmg, rate: .9, range: 1.1, speed: 2.6 }, ARENA.x + 7, ARENA.z, .2);
  sn.team.forEach((t, j) => add('x_h' + j, Object.assign({}, HEROES[t.id], { scale: .33, hp: Math.round(t.hp * 1.15), dmg: Math.round(t.dmg * 1.15) }), ARENA.x + 6.3, ARENA.z - 1.4 + j * 1.4, .3 + j * .2));
  let m = 0; Object.entries(sn.army).forEach(([type, n]) => { for (let j = 0; j < Math.min(n, 30); j++) add('x_t' + type, Object.assign({}, TROOPS[type], { hp: Math.round(TROOPS[type].hp * (sn.mul || 1)), dmg: Math.round(TROOPS[type].dmg * (sn.mul2 || 1)) }), ARENA.x + 8 + Math.random(), ARENA.z + (Math.random() - .5) * 5, .5 + m++ * .12); });
  Object.assign(CAMB, { x0: ARENA.x - 12, x1: ARENA.x + 12, z0: ARENA.z - 8, z1: ARENA.z + 10 });
  B.follow = true; B.slow = 1; B.spd = S.bspd || 1; B.oldD = cam.d; cam.d = 17; cam.x = ARENA.x; cam.z = ARENA.z + 2; placeCamera();
  document.body.classList.add('battle', 'camp'); $('#bhud').hidden = false; $('#bWave').textContent = `Arena · ${o.name}`;
  folk.forEach(f => f.o.visible = false); guards.forEach(g2 => g2.o.visible = false);
  Music.start('batalha'); Snd.horn(); say('À arena! Por Odin!'); A.used++; save();
}
function endArena(win) {
  const A = arenaState(), o = B.opp; let rew = null;
  if (win) { A.rating += 20; A.wins++; rew = { runes: 6, saga: 2 }; if (A.wins % 3 === 0) rew.mead = 1; for (const k in rew) gain(k, rew[k]); Snd.done(); say('A arena é nossa!'); }
  else { A.rating = Math.max(0, A.rating - 12); Snd.lose(); }
  dcount('arena'); arenaOpps = []; save(); dirty = true;
  B.pendEnd = { win, t: .7, html: win
    ? `<h2>Vitória na Arena!</h2><p class="sub">Contra ${esc(o.name)} · agora ${A.rating} pontos</p><div class="costs big">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div><div class="actions"><button class="btn" data-a="arena">Arena</button><button class="btn ghost" data-a="home">Vila</button></div>`
    : `<h2>Derrota na Arena</h2><p class="sub">Contra ${esc(o.name)} · agora ${A.rating} pontos</p><p class="desc">Evolua heróis, equipamentos e tropas e tente de novo.</p><div class="actions"><button class="btn" data-a="arena">Arena</button><button class="btn ghost" data-a="heroes">Heróis</button></div>` };
}
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.k, v = a.dataset.v;
  const it = k && S.gear.find(g => g.uid === k);
  switch (a.dataset.a) {
    case 'gpick': Snd.tap(); openGearPick(k, v); break;
    case 'gon': if (it) { S.gear.forEach(g => { if (g.on === v && g.slot === it.slot) g.on = null; }); it.on = v; Snd.collect(); save(); openGearPick(v, it.slot); } break;
    case 'gun': if (it) { it.on = null; Snd.tap(); save(); openGearPick(v, it.slot); } break;
    case 'gup': if (it && it.lv < 10) { const c = gearUpCost(it); if (!canAfford(c)) break; spend(c); it.lv++; Snd.build(); save(); dirty = true; openGearPick(v, it.slot); } break;
    case 'gsalv': if (it && !it.on) { gain('iron', gearSalvage(it)); S.gear.splice(S.gear.indexOf(it), 1); Snd.crack(); save(); dirty = true; openGearPick(v, it.slot); } break;
    case 'patrol': claimPatrol(); break;
    case 'sweep': sweepStage(+k); break;
    case 'pass': openPass(); break;
    case 'pget': { const i = +k, p = passState(); if (p.got.includes(i) || Math.floor(p.xp / PASS_XP) <= i) break; p.got.push(i); const r = passReward(i); for (const x in r) gain(x, r[x]); Snd.chime(); save(); dirty = true; openPass(); break; }
    case 'arena': Snd.tap(); openArena(); break;
    case 'arefresh': Snd.tap(); openArena(true); break;
    case 'afight': startArena(+k); break;
  }
});
function sweepStage(g) {
  const c = Math.floor(g / STAGES), s = g % STAGES, rep = S.camp.rep.d === today() ? S.camp.rep.n : 0;
  if ((S.camp.stars[g] || 0) < 3 || rep >= 10) return;
  if (S.camp.rep.d !== today()) S.camp.rep = { d: today(), n: 0 }; S.camp.rep.n++;
  const r = stageReward(c, s, false); if (Math.random() < .4) r.gear = 1; for (const x in r) gain(x, r[x]); dcount('saga'); Snd.done(); save(); dirty = true;
  openSheet(rewardCard('Vitória rápida!', `Fase ${c + 1}-${s + 1} · repetições hoje ${S.camp.rep.n}/10`, r).replace('data-a="close">Coletar', `data-a="stage" data-k="${g}">Continuar`));
}

/* ========== Golpes especiais: efeitos ========== */
function shock(x, z, col, r) { const m = new THREE.Mesh(new THREE.RingGeometry(r * .78, r, 48).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .9, depthWrite: false, blending: THREE.AdditiveBlending })); m.position.set(x, .1, z); m.scale.setScalar(.1); scene.add(m); B.proj.push({ m, kind: 'fx', t: 0, dur: .55, fx: true, grow: true }); }
function pillar(x, z, col) { const m = new THREE.Mesh(new THREE.CylinderGeometry(.45, .6, 5, 18, 1, true), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: .55, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending })); m.position.set(x, 2.5, z); scene.add(m); B.proj.push({ m, kind: 'fx', t: 0, dur: .7, fx: true, rise: true, op: .55 }); }
const SK_COL = { warcry: '#f3d27a', boom: '#ffb36b', charge: '#d9b07a', backstab: '#9a8cff', heal: '#7dff9a', rain: '#f3d27a', wall: '#8fd3ff', fury: '#ff6a4a', thunder: '#cfe8ff' };
let skbT = 0;
function skillFx(u) {
  if (!B) return; const H = HEROES[u.D.id], p = u.o.position, col = SK_COL[H.sk] || RAR[H.rar].col;
  pillar(p.x, p.z, col); shock(p.x, p.z, col, 2.6); burstAt(p.x, 1, p.z, col, 14, .05);
  if (['boom', 'thunder', 'fury', 'charge', 'wall'].includes(H.sk)) B.shake = Math.max(B.shake || 0, H.sk === 'thunder' ? .45 : .28);
  if (!B.cut && !B.ending) { B.slow = .4; later(.16, () => { if (B && !B.cut) B.slow = 1; }); }
  const el = $('#skb'); if (!el) return; clearTimeout(skbT);
  el.style.setProperty('--sc', RAR[H.rar].col); el.innerHTML = `<b>${H.name}</b><span>${H.skn}</span>`;
  el.classList.remove('show'); void el.offsetWidth; el.classList.add('show'); skbT = setTimeout(() => el.classList.remove('show'), 1400);
}

/* ========== Torre de Valhalla (andares infinitos) ========== */
const TOWER_UNLOCK = 8; // depois da fase 1-8 da Saga
const towerOpen = () => S.camp.next >= TOWER_UNLOCK;
const towerChap = f => Math.floor((f - 1) / 10) % CHAPTERS.length;
function towerDef(f) {
  const C = CHAPTERS[towerChap(f)], boss = f % 10 === 0, mini = f % 5 === 0 && !boss, n = Math.min(18, 6 + Math.floor(f / 3)), list = [];
  if (boss) list.push(C.boss); else if (mini) list.push(C.pool[2], C.pool[2]);
  let k = f * 17 + 3; while (list.length < n) { k = (k * 31 + 7) % 101; list.push(C.pool[k % C.pool.length]); }
  return { list, lvl: .9 * Math.pow(1.065, f - 1), boss, mini };
}
function towerReward(f) {
  const r = { runes: 3 + Math.floor(f / 4), food: 120 + 40 * f, iron: 30 + 15 * f };
  if (f % 5 === 0) { r.mead = f % 10 === 0 ? 3 : 1; r.gear = 1; r.saga = 2 + Math.floor(f / 10); }
  if (f % 10 === 0) { r.diamante = 1 + Math.floor(f / 30); r['h:' + CHAPTERS[towerChap(f)].hero] = 5; }
  return r;
}
function openTower() {
  sheetFor = null;
  if (!towerOpen()) { openSheet(`<h2>Torre de Valhalla</h2><p class="desc">A torre se abre depois que você vencer a fase 1-8 da Saga (o Rei Draugr).</p><div class="actions"><button class="btn" data-a="saga">Ir para a Saga</button><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  const f = S.tower.best + 1, d = towerDef(f), cnt = {}; d.list.forEach(k => cnt[k] = (cnt[k] || 0) + 1);
  const floors = Array.from({ length: 7 }, (_, i) => f + 3 - i).filter(x => x > 0).map(x => `<div class="tfl${x < f ? ' done' : x === f ? ' cur' : ''}${x % 10 === 0 ? ' boss' : x % 5 === 0 ? ' mini' : ''}"><b>${x}</b><span>${x % 10 === 0 ? '☠ chefe' : x % 5 === 0 ? '⚔ guardião' : CHAPTERS[towerChap(x)].name}</span>${x < f ? '✓' : ''}</div>`).join('');
  openSheet(`<h2>Torre de Valhalla</h2><p class="sub">Cada andar é mais difícil que o anterior. Até onde você chega? Recorde: andar ${S.tower.best}</p>
    <div class="tower">${floors}</div>
    <div class="stat"><span>Andar ${f}</span><span>${Object.entries(cnt).map(([k, v]) => `${v} ${v > 1 ? FOES[k].pl : FOES[k].name}`).join(' · ')}</span></div>
    <div class="stat"><span>Nível dos inimigos</span><span>${Math.round(d.lvl * 10)}</span></div>
    <p class="sub">Prêmio do andar ${f}${f % 5 === 0 ? ' (andar especial!)' : ''}</p>${costHTML(towerReward(f))}
    <p class="sub">A cada 5 andares: hidromel e equipamento · a cada 10: diamante e fragmentos de herói. Tentativas livres, sem perder tropas.</p>
    <div class="actions"><button class="btn" data-a="tfight">Subir ao andar ${f}</button><button class="btn ghost" data-a="ach">Conquistas</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
function startTower() {
  if (B || CINE || !towerOpen()) return;
  if (!restReady) { toast('Carregando… só um instante'); loadRest().then(startTower); return; }
  const f = S.tower.best + 1, d = towerDef(f), c = towerChap(f);
  closeSheet(); Snd.init(); buildArena(c); setAmbience(c);
  B = { spd: S.bspd || 1, mode: 'tower', island: true, floor: f, chap: c, lvlF: d.lvl, wave: 1, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: d.list.length, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0, walls: null, shooters: [], later: [],
    bounds: { x0: ARENA.x - 13, x1: ARENA.x + 13, z0: ARENA.z - 8, z1: ARENA.z + 8 }, rally: [ARENA.x - 4.5, ARENA.z] };
  glowEyes();
  B.hero = mkUnit('ally', 'hero', ARENA.x - 7, ARENA.z); activate(B.hero);
  S.team.forEach((id, i) => { const u = mkUnit('ally', 'h_' + id, ARENA.x - 6.3, ARENA.z - 1.4 + i * 1.4); u.spawnAt = .2 + i * .2; B.queue.push(u); });
  let k = 0; ['hus', 'war', 'arc'].forEach(type => { for (let i = 0; i < (S.army[type] || 0); i++) { const u = mkUnit('ally', type, ARENA.x - 8 - Math.random(), ARENA.z + (Math.random() - .5) * 5); u.spawnAt = .5 + k++ * .12; B.queue.push(u); } });
  const first60 = Math.ceil(d.list.length * .6);
  d.list.forEach((kind, i) => { const late = i >= first60, u = mkUnit('enemy', kind, ARENA.x + 6 + Math.random() * 3, ARENA.z + (Math.random() - .5) * 8); u.spawnAt = (late ? 12 : 1.2) + (i % 8) * .35; u.rise = !FOES[kind].beast; B.queue.push(u); });
  Object.assign(CAMB, { x0: ARENA.x - 12, x1: ARENA.x + 12, z0: ARENA.z - 8, z1: ARENA.z + 10 });
  B.follow = true; B.slow = 1; B.oldD = cam.d; cam.d = 17; cam.x = ARENA.x - 4; cam.z = ARENA.z + 2; placeCamera();
  document.body.classList.add('battle', 'camp'); $('#bhud').hidden = false; $('#bWave').textContent = `Torre · andar ${f}${d.boss ? ' · Chefe' : ''}`;
  folk.forEach(x => x.o.visible = false); guards.forEach(g2 => g2.o.visible = false);
  Music.start('batalha'); Snd.horn(); say(d.boss ? `Andar ${f}! ${FOES[CHAPTERS[c].boss].name} guarda a torre!` : `Andar ${f} da Torre de Valhalla!`);
}
function endTower(win) {
  const f = B.floor; let rew = null;
  if (win) { S.tower.best = Math.max(S.tower.best, f); rew = towerReward(f); for (const k in rew) gain(k, rew[k]); dcount('torre'); Snd.done(); say(f % 10 === 0 ? 'O guardião caiu! Mais alto, vikings!' : 'Andar vencido!'); }
  else { Snd.lose(); say('A torre resistiu. Voltaremos mais fortes.'); }
  save(); dirty = true;
  B.pendEnd = { win, t: .7, html: win
    ? `<h2>Andar ${f} vencido!</h2><p class="sub">Torre de Valhalla · recorde: andar ${S.tower.best}</p><div class="costs big">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div><div class="actions"><button class="btn" data-a="tower">Próximo andar</button><button class="btn ghost" data-a="home">Vila</button></div>`
    : `<h2>A torre resistiu…</h2><p class="sub">Andar ${f}</p><p class="desc">Evolua heróis, equipamentos e pesquisas e tente de novo. As tentativas são livres.</p><div class="actions"><button class="btn" data-a="tower">Torre</button><button class="btn ghost" data-a="heroes">Heróis</button></div>` };
}

/* ========== Conquistas ========== */
const ACH = [
  { id: 'saga', n: 'Desbravador da Saga', d: 'Vença fases da Saga', v: () => S.camp.next, t: [4, 8, 16, 24, 36, 48] },
  { id: 'stars', n: 'Colecionador de Estrelas', d: 'Junte estrelas na Saga', v: () => campStars(), t: [12, 36, 72, 108, 144] },
  { id: 'heroes', n: 'Salão dos Heróis', d: 'Tenha heróis recrutados', v: () => HERO_IDS.filter(id => hs(id).lvl).length, t: [2, 4, 6, 8, 9] },
  { id: 'wave', n: 'Muralha de Ferro', d: 'Vença ondas de defesa da vila', v: () => Math.min(MAXWAVE, S.wave - 1), t: [3, 10, 20, 30] },
  { id: 'tower', n: 'Escalada a Valhalla', d: 'Suba andares da Torre', v: () => S.tower.best, t: [5, 10, 20, 30, 50, 75, 100] },
  { id: 'arena', n: 'Campeão da Arena', d: 'Vença lutas na Arena', v: () => arenaState().wins, t: [1, 10, 30, 75, 150] },
  { id: 'gear', n: 'Arsenal do Jarl', d: 'Junte equipamentos', v: () => S.gear.length, t: [3, 10, 20, 35] },
  { id: 'salao', n: 'Jarl Poderoso', d: 'Evolua o Salão do Jarl', v: () => S.b.salao.lvl, t: [3, 5, 7, 10] },
  { id: 'power', n: 'Poder do Norte', d: 'Aumente o poder da vila', v: () => power(), t: [300, 800, 1600, 2800, 4200] },
  { id: 'exp', n: 'Mestre das Expedições', d: 'Envie lenhadores, mineiros e caçadores', v: () => (S.tot.exp_lenha || 0) + (S.tot.exp_mina || 0) + (S.tot.exp_caca || 0), t: [5, 25, 100, 300] },
  { id: 'colher', n: 'Mãos da Terra', d: 'Colha a horta e o pomar', v: () => Math.max(S.tot.colher || 0, S.stats.harvest || 0), t: [5, 25, 100, 300] },
  { id: 'obras', n: 'Grande Construtor', d: 'Inicie obras na vila', v: () => S.tot.obras || 0, t: [5, 20, 60, 150] }
];
const achRew = (a, i) => { const last = i === a.t.length - 1; return { runes: 5 + 5 * i, saga: 1 + i, mead: last ? 3 : i >= 2 ? 1 : 0 }; };
const achReady = () => ACH.some(a => { const i = S.ach[a.id] || 0; return i < a.t.length && a.v() >= a.t[i]; });
function openAch() {
  sheetFor = null; const done = ACH.reduce((n, a) => n + (S.ach[a.id] || 0), 0), all = ACH.reduce((n, a) => n + a.t.length, 0);
  const list = ACH.map(a => { const i = S.ach[a.id] || 0, v = a.v(), max = i >= a.t.length, goal = a.t[Math.min(i, a.t.length - 1)], ok = !max && v >= goal;
    return `<div class="ach${ok ? ' ok' : max ? ' done' : ''}"><div class="ai"><b>${a.n}</b><small>${a.d}: ${fmt(Math.min(v, goal))}/${fmt(goal)}</small><div class="hbar gold"><i style="width:${Math.min(100, v / goal * 100)}%"></i></div><span class="astars">${'★'.repeat(i)}${'☆'.repeat(a.t.length - i)}</span></div>
      ${max ? '<span class="adone">✓</span>' : ok ? `<button class="btn sm" data-a="achget" data-k="${a.id}">Pegar</button>` : `<span class="arew">${Object.entries(achRew(a, i)).filter(([, x]) => x).map(([k, x]) => `${icoSVG(k)}${x}`).join(' ')}</span>`}</div>`; }).sort((x, y) => (y.includes('class="ach ok') - x.includes('class="ach ok'))).join('');
  openSheet(`<h2>Conquistas</h2><p class="sub">${done} de ${all} estrelas de conquista · cada estrela dá runas, pergaminhos e hidromel</p><div class="achs">${list}</div><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
sheet.addEventListener('click', e => {
  const a = e.target.closest('[data-a]'); if (!a) return; const k = a.dataset.k;
  switch (a.dataset.a) {
    case 'tower': Snd.tap(); openTower(); break;
    case 'tfight': startTower(); break;
    case 'ach': Snd.tap(); openAch(); break;
    case 'achget': { const A = ACH.find(x => x.id === k); if (!A) break; const i = S.ach[k] || 0; if (i >= A.t.length || A.v() < A.t[i]) break; S.ach[k] = i + 1; const r = achRew(A, i); for (const x in r) if (r[x]) gain(x, r[x]); Snd.chime(); toast(`Conquista: ${A.n} ${'★'.repeat(i + 1)}`); save(); dirty = true; openAch(); break; }
  }
});

/* ========== Ranking da Torre e dos Clãs ========== */
async function openRanking2(t, head) {
  const me = Cloud.user && Cloud.user.id, close = `<div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`;
  let rows = '', err = null;
  if (t === 'tower') {
    const { data, error } = await Cloud.sb.from('tower').select('user_id,jarl,best').order('best', { ascending: false }).limit(15); err = error;
    if (data) rows = data.map((r, i) => `<div class="rk${r.user_id === me ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="who"><b>${esc(r.jarl)}</b></span><span class="val">Andar ${r.best}</span></div>`).join('');
  } else {
    const { data, error } = await Cloud.sb.from('clan_boss').select('clan_id,dmg').eq('week', weekNo()).limit(1000); err = error;
    if (data) { const tot = {}; data.forEach(r => tot[r.clan_id] = (tot[r.clan_id] || 0) + r.dmg); const ids = Object.keys(tot).sort((a, b) => tot[b] - tot[a]).slice(0, 15);
      const names = {}; if (ids.length) { const c = await Cloud.sb.from('clans').select('id,name,tag').in('id', ids); (c.data || []).forEach(x => names[x.id] = x); }
      rows = ids.map((id, i) => `<div class="rk${S.clan && S.clan.id === id ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="who"><b>${esc(names[id] ? names[id].name : 'Clã')}</b><small>${names[id] ? '[' + esc(names[id].tag) + ']' : ''} · dano no ${CB.name} esta semana</small></span><span class="val">${fmt(tot[id])}</span></div>`).join(''); }
  }
  if (sheet.hidden || !sheet.querySelector('.tabs')) return;
  if (err) { openSheet(head + `<p class="req">Esse ranking ainda não está ativo.</p>` + close); return; }
  openSheet(head + `<div class="rklist">${rows || '<p class="sub">Ninguém aqui ainda. Seja o primeiro!</p>'}</div>` + (me ? '' : `<p class="desc" style="font-size:14px">Entre na sua conta para aparecer no ranking.</p>`) + close);
}

/* ========== Clãs: grupo, chat e chefe semanal ========== */
const CB = { name: 'Ymir, o Gigante Ancestral', tries: 3, limit: 40, tiers: [[100e3, { runes: 15, food: 1500 }], [300e3, { mead: 1, iron: 600 }], [700e3, { runes: 30, gear: 1 }], [1.5e6, { mead: 2, saga: 6 }], [3e6, { mead: 3, gear: 1, diamante: 1 }]] };
const CLAN_MAX = 30;
const cbState = () => { const w = weekNo(); if (S.cb.w !== w) S.cb = { w, got: [], d: '', n: 0, best: 0 }; if (S.cb.d !== today()) { S.cb.d = today(); S.cb.n = 0; } return S.cb; };
let clanTab = 'chat', chatPoll = 0, clanTotal = 0;
const cleanTxt = (t, n) => (t || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, n);
async function myClan() {
  if (!Cloud.user) return null;
  const { data, error } = await Cloud.sb.from('clan_members').select('clan_id,role,clans(id,name,tag,leader)').eq('user_id', Cloud.user.id).maybeSingle();
  if (error) { Cloud.clanOk = false; throw error; }
  S.clan = data && data.clans ? { id: data.clans.id, name: data.clans.name, tag: data.clans.tag, leader: data.clans.leader } : null; save(); return S.clan;
}
async function openClan(tab) {
  sheetFor = null; clearInterval(chatPoll); if (tab) clanTab = tab;
  const close = `<div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`;
  if (!Cloud.on() || !Cloud.user) { openSheet(`<h2>Clãs</h2><p class="desc">Junte-se a outros jarls: conversem no chat do clã e derrotem juntos o chefe da semana, ${CB.name}, para ganhar prêmios.</p><p class="desc">Para entrar num clã você precisa entrar na sua conta.</p><div class="actions"><button class="btn" data-p="prof">Entrar na conta</button><button class="btn ghost" data-a="close">Fechar</button></div>`); return; }
  if (S.b.salao.lvl < 3) { openSheet(`<h2>Clãs</h2><p class="desc">Os clãs se abrem com o Salão do Jarl no nível 3.</p>` + close); return; }
  openSheet(`<h2>Clãs</h2><p class="sub">Carregando…</p>`);
  let c; try { c = await myClan(); } catch (e) { openSheet(`<h2>Clãs</h2><p class="req">Os clãs ainda não foram ativados no servidor.</p>` + close); return; }
  if (!c) return openClanList();
  const t = clanTab, head = `<h2>${esc(c.name)} <small style="color:var(--gold-hi)">[${esc(c.tag)}]</small></h2><div class="tabs"><button data-cl="chat" class="${t === 'chat' ? 'on' : ''}">Chat</button><button data-cl="boss" class="${t === 'boss' ? 'on' : ''}">Chefe</button><button data-cl="mem" class="${t === 'mem' ? 'on' : ''}">Membros</button></div>`;
  if (t === 'chat') {
    openSheet(head + `<div class="chat" id="chatBox"><p class="sub">Carregando…</p></div><div class="mailrow"><input id="chatIn" maxlength="200" placeholder="Escreva para o clã…" autocomplete="off"><button class="btn sm" data-c2="send">Enviar</button></div>` + close);
    await loadChat(); chatPoll = setInterval(() => { if (sheet.hidden || !$('#chatBox')) { clearInterval(chatPoll); return; } loadChat(); }, 6000);
  } else if (t === 'mem') {
    const { data } = await Cloud.sb.from('clan_members').select('user_id,jarl,power,role').eq('clan_id', c.id).order('power', { ascending: false });
    const { data: dm } = await Cloud.sb.from('clan_boss').select('user_id,dmg').eq('clan_id', c.id).eq('week', weekNo()); const dd = {}; (dm || []).forEach(r => dd[r.user_id] = r.dmg);
    openSheet(head + `<p class="sub">${(data || []).length}/${CLAN_MAX} membros</p><div class="rklist">${(data || []).map((m, i) => `<div class="rk${m.user_id === Cloud.user.id ? ' me' : ''}"><span class="pos">${i + 1}</span><span class="who"><b>${esc(m.jarl)}${c.leader === m.user_id ? ' 👑' : ''}</b><small>poder ${fmt(m.power || 0)} · dano no chefe ${fmt(dd[m.user_id] || 0)}</small></span></div>`).join('')}</div>
      <div class="actions"><button class="btn ghost" data-c2="leave">Sair do clã</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
  } else {
    const st = cbState(); const { data } = await Cloud.sb.from('clan_boss').select('dmg').eq('clan_id', c.id).eq('week', weekNo());
    clanTotal = (data || []).reduce((a, r) => a + r.dmg, 0); const top = CB.tiers[CB.tiers.length - 1][0];
    openSheet(head + `<p class="sub">Chefe da semana: <b style="color:var(--gold-hi)">${CB.name}</b> · termina em ${fmtT(evEndsIn() / 1000)}</p>
      <div class="stat"><span>Dano do clã</span><span><b style="color:var(--gold-hi);font-size:18px">${fmt(clanTotal)}</b></span></div><div class="hbar gold"><i style="width:${Math.min(100, clanTotal / top * 100)}%"></i></div>
      <div class="tiers">${CB.tiers.map(([p, r], i) => { const got = st.got.includes(i), ok = clanTotal >= p; return `<div class="tier${got ? ' done' : ok ? ' ok' : ''}"><b>${fmt(p)}</b><span>${Object.entries(r).map(([k, v]) => `${icoSVG(k)}${v}`).join(' ')}</span>${got ? '✓' : ok ? `<button class="btn sm" data-c2="tier" data-k="${i}">Pegar</button>` : ''}</div>`; }).join('')}</div>
      <p class="sub">Cada membro tem ${CB.tries} ataques por dia, de ${CB.limit} segundos. Todo o dano soma para o clã, e todos ganham os prêmios. Seu melhor ataque: ${fmt(st.best)}</p>
      <div class="actions"><button class="btn" data-c2="atk" ${st.n < CB.tries && S.team.length ? '' : 'disabled'}>Atacar (${CB.tries - st.n} hoje)</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
  }
}
async function loadChat() {
  const c = S.clan; if (!c) return; const { data, error } = await Cloud.sb.from('clan_chat').select('user_id,jarl,msg,created_at').eq('clan_id', c.id).order('created_at', { ascending: false }).limit(50);
  const el = $('#chatBox'); if (!el || error) return; const stick = el.scrollTop + el.clientHeight >= el.scrollHeight - 30;
  el.innerHTML = (data || []).reverse().map(m => `<div class="cmsg${m.user_id === Cloud.user.id ? ' me' : ''}"><b>${esc(m.jarl)}</b><span>${esc(m.msg)}</span><small>${new Date(m.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</small></div>`).join('') || '<p class="sub">Nenhuma mensagem ainda. Diga olá ao clã!</p>';
  if (stick) el.scrollTop = el.scrollHeight;
}
async function openClanList() {
  const { data } = await Cloud.sb.from('clans').select('id,name,tag,descr,clan_members(count)').order('created_at', { ascending: false }).limit(30);
  const list = (data || []).map(c => ({ ...c, n: c.clan_members && c.clan_members[0] ? c.clan_members[0].count : 0 })).filter(c => c.n < CLAN_MAX && c.n > 0).sort((a, b) => b.n - a.n);
  openSheet(`<h2>Clãs</h2><p class="sub">Entre num clã para conversar e derrotar o chefe da semana juntos</p>
    <div class="opps">${list.map(c => `<div class="opp"><div><b>${esc(c.name)} [${esc(c.tag)}]</b><small>${c.n}/${CLAN_MAX} membros${c.descr ? ' · ' + esc(c.descr) : ''}</small></div><button class="btn sm" data-c2="join" data-k="${c.id}">Entrar</button></div>`).join('') || '<p class="sub">Ainda não há clãs. Crie o primeiro!</p>'}</div>
    <p class="sub" style="margin-top:10px">Criar um clã</p>
    <label class="fld"><span>Nome do clã</span><input id="clName" maxlength="20" placeholder="Lobos do Norte"></label>
    <label class="fld"><span>Sigla (2 a 4 letras)</span><input id="clTag" maxlength="4" placeholder="LOBO" style="text-transform:uppercase"></label>
    <label class="fld"><span>Frase do clã</span><input id="clDesc" maxlength="60" placeholder="Ativos todo dia, skål!"></label>
    <div class="actions"><button class="btn" data-c2="create">Criar clã</button><button class="btn ghost" data-a="close">Fechar</button></div>`);
}
async function clanAct(a, k) {
  const U = Cloud.user && Cloud.user.id; if (!U) return;
  if (a === 'create') {
    const name = cleanTxt($('#clName').value, 20), tag = cleanTxt($('#clTag').value, 4).toUpperCase().replace(/[^A-Z0-9]/g, ''), descr = cleanTxt($('#clDesc').value, 60);
    if (name.length < 3 || tag.length < 2) { toast('Nome com 3+ letras e sigla com 2 a 4'); Snd.no(); return; }
    const { data, error } = await Cloud.sb.from('clans').insert({ name, tag, descr, leader: U }).select('id').single();
    if (error) { toast(/duplicate|unique/i.test(error.message) ? 'Já existe um clã com esse nome' : 'Não foi possível criar o clã'); Snd.no(); return; }
    await Cloud.sb.from('clan_members').insert({ user_id: U, clan_id: data.id, jarl: S.jarl || 'Jarl', power: power(), role: 'lider' });
    Snd.chime(); toast(`Clã ${name} criado!`); clanTab = 'chat'; openClan(); return;
  }
  if (a === 'join') {
    const { count } = await Cloud.sb.from('clan_members').select('user_id', { count: 'exact', head: true }).eq('clan_id', k);
    if (count >= CLAN_MAX) { toast('Clã cheio'); return; }
    const { error } = await Cloud.sb.from('clan_members').insert({ user_id: U, clan_id: k, jarl: S.jarl || 'Jarl', power: power(), role: 'membro' });
    if (error) { toast('Não foi possível entrar'); Snd.no(); return; }
    await Cloud.sb.from('clan_chat').insert({ clan_id: k, user_id: U, jarl: S.jarl || 'Jarl', msg: '⚔ entrou no clã!' });
    Snd.chime(); clanTab = 'chat'; openClan(); return;
  }
  if (a === 'leave') {
    if (!confirmLeave) { confirmLeave = true; toast('Toque de novo para confirmar a saída'); setTimeout(() => confirmLeave = false, 3000); return; }
    const c = S.clan; if (!c) return;
    if (c.leader === U) { const { data } = await Cloud.sb.from('clan_members').select('user_id').eq('clan_id', c.id).neq('user_id', U).order('joined_at').limit(1);
      if (data && data.length) await Cloud.sb.from('clans').update({ leader: data[0].user_id }).eq('id', c.id); else { await Cloud.sb.from('clan_members').delete().eq('user_id', U); await Cloud.sb.from('clans').delete().eq('id', c.id); S.clan = null; save(); openClan(); return; } }
    await Cloud.sb.from('clan_members').delete().eq('user_id', U); S.clan = null; save(); toast('Você saiu do clã'); openClan(); return;
  }
  if (a === 'send') {
    const inp = $('#chatIn'), msg = cleanTxt(inp.value, 200); if (!msg || !S.clan) return; inp.value = '';
    const { error } = await Cloud.sb.from('clan_chat').insert({ clan_id: S.clan.id, user_id: U, jarl: S.jarl || 'Jarl', msg }); if (error) toast('Mensagem não enviada'); loadChat(); return;
  }
  if (a === 'tier') { const i = +k, st = cbState(), [p, r] = CB.tiers[i]; if (st.got.includes(i) || clanTotal < p) return; st.got.push(i); for (const x in r) gain(x, r[x]); Snd.chime(); save(); dirty = true; openClan('boss'); return; }
  if (a === 'atk') startClanBoss();
}
let confirmLeave = false;
sheet.addEventListener('click', e => {
  const t = e.target.closest('[data-cl]'); if (t) { Snd.tap(); openClan(t.dataset.cl); return; }
  const a = e.target.closest('[data-c2]'); if (a) { Snd.tap(); clanAct(a.dataset.c2, a.dataset.k); }
});
sheet.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target.id === 'chatIn') clanAct('send'); });
function startClanBoss() {
  const st = cbState(); if (B || CINE || !S.clan || st.n >= CB.tries || !S.team.length) return;
  if (!restReady) { toast('Carregando… só um instante'); loadRest().then(startClanBoss); return; }
  closeSheet(); Snd.init(); buildArena(3); setAmbience(3);
  const lv = .95 * Math.pow(1.058, Math.min(47, S.camp.next));
  B = { spd: S.bspd || 1, mode: 'clanboss', island: true, lvlF: lv, wave: 1, t: 0, units: [], proj: [], blds: [], bhp: {}, killed: 0, total: 1, queue: [], heroDown: 0, skillCd: 0, over: false, deployed: { ...S.army }, endT: 0, walls: null, shooters: [], later: [], exD: {},
    bounds: { x0: ARENA.x - 13, x1: ARENA.x + 13, z0: ARENA.z - 8, z1: ARENA.z + 8 }, rally: [ARENA.x - 4.5, ARENA.z] };
  glowEyes();
  B.hero = mkUnit('ally', 'hero', ARENA.x - 7, ARENA.z); activate(B.hero);
  S.team.forEach((id, i) => { const u = mkUnit('ally', 'h_' + id, ARENA.x - 6.3, ARENA.z - 1.4 + i * 1.4); u.spawnAt = .2 + i * .2; B.queue.push(u); });
  let k = 0; ['hus', 'war', 'arc'].forEach(type => { for (let i = 0; i < (S.army[type] || 0); i++) { const u = mkUnit('ally', type, ARENA.x - 8 - Math.random(), ARENA.z + (Math.random() - .5) * 5); u.spawnAt = .5 + k++ * .12; B.queue.push(u); } });
  B.exD.x_ymir = { name: CB.name, model: 'Skeleton_Warrior', r: 'Skeleton_Axe', l: 'Skeleton_Shield_Small_A', scale: .95, hp: 1e8, dmg: Math.round(40 * Math.pow(lv, .8)), rate: 1.9, range: 2, speed: .7, exact: true };
  const boss = mkUnit('enemy', 'x_ymir', ARENA.x + 6, ARENA.z); boss.spawnAt = .8; boss.rise = true; B.queue.push(boss); B.boss = boss;
  [10, 22, 32].forEach(t0 => { for (let i = 0; i < 3; i++) { const u = mkUnit('enemy', ['minion', 'warrior', 'rogue'][i], ARENA.x + 8, ARENA.z - 3 + i * 3); u.spawnAt = t0; u.rise = true; B.queue.push(u); B.total++; } });
  Object.assign(CAMB, { x0: ARENA.x - 12, x1: ARENA.x + 12, z0: ARENA.z - 8, z1: ARENA.z + 10 });
  B.follow = true; B.slow = 1; B.oldD = cam.d; cam.d = 17; cam.x = ARENA.x - 3; cam.z = ARENA.z + 2; placeCamera();
  document.body.classList.add('battle', 'camp'); $('#bhud').hidden = false; $('#bWave').textContent = 'Chefe do clã';
  folk.forEach(x => x.o.visible = false); guards.forEach(g2 => g2.o.visible = false);
  st.n++; save(); Music.start('batalha'); Snd.horn(); say('Ymir desperta! Pelo clã!');
}
function stepClanBoss() {
  if (B.over || !B.boss) return; const dmg = Math.round(B.boss.max ? B.boss.max - Math.max(0, B.boss.hp) : 0), left = Math.max(0, CB.limit - B.t);
  B.cbDmg = dmg; if (B.boss.bar) B.boss.bar.bg.visible = B.boss.bar.fg.visible = false;
  const el = $('#bWave'); if (el) el.textContent = `Ymir · dano ${fmt(dmg)} · ${Math.ceil(left)}s`;
  if (B.t >= CB.limit) endBattle(true);
}
async function endClanBoss() {
  const dmg = B.cbDmg || 0, st = cbState(), U = Cloud.user && Cloud.user.id, c = S.clan; st.best = Math.max(st.best, dmg);
  const rew = { runes: Math.min(15, 2 + Math.floor(dmg / 4000)), food: Math.min(3000, 200 + Math.floor(dmg / 20)) }; for (const k in rew) gain(k, rew[k]);
  dcount('clan'); Snd.done(); say('Bom golpe! O clã agradece.'); save(); dirty = true;
  B.pendEnd = { win: true, t: .7, html: `<h2>Ataque ao Ymir!</h2><p class="sub">Você causou</p><div class="bigdmg">${fmt(dmg)}</div><p class="sub">de dano para o clã ${c ? esc(c.name) : ''}</p><div class="costs big">${Object.entries(rew).map(([k, v]) => `<div class="cost">${icoSVG(k)}+${fmt(v)}</div>`).join('')}</div><div class="actions"><button class="btn" data-cl="boss">Ver o clã</button><button class="btn ghost" data-a="home">Vila</button></div>` };
  if (U && c && dmg > 0) {
    const w = weekNo(), { data } = await Cloud.sb.from('clan_boss').select('dmg,clan_id').eq('week', w).eq('user_id', U).maybeSingle();
    await Cloud.sb.from('clan_boss').upsert({ week: w, user_id: U, clan_id: c.id, dmg: Math.min(5e7, (data && data.clan_id === c.id ? data.dmg : 0) + dmg) });
  }
}
$('#btnClan').addEventListener('click', () => { Snd.init(); Snd.tap(); openClan(); });
$('#btnTower').addEventListener('click', () => { Snd.init(); Snd.tap(); openTower(); });
$('#btnPass').addEventListener('click', () => { Snd.init(); Snd.tap(); openPass(); });
$('#btnArena').addEventListener('click', () => { Snd.init(); Snd.tap(); openArena(); });
$('#btnSpd').textContent = 'x' + (S.bspd || 1); $('#btnSpd').classList.toggle('on', S.bspd === 2);
$('#btnSpd').addEventListener('click', () => { S.bspd = (S.bspd || 1) === 1 ? 2 : 1; if (B) B.spd = S.bspd; $('#btnSpd').textContent = 'x' + S.bspd; $('#btnSpd').classList.toggle('on', S.bspd === 2); Snd.tap(); save(); });

/* ========== Laço do jogo ========== */
function tick() {
  finished = []; trainedNow = 0; advance(Date.now());
  refreshHerd(); refreshPiles(); stepTut(); renderSide(); $('#mission').classList.toggle('dot', chestReady() || dqClaimable());
  ['lenha', 'mina', 'caca'].forEach(k => { const e = S.exp[k]; if (e && Date.now() >= e.end && !e.told) { e.told = 1; Snd.done(); toast(`${EXP[k].name} terminaram! Toque no ✓ para ver`); save(); } });
  if (trainedNow) { dirty = true; refreshGuards(); if (sheetFor === 'quartel' && !sheet.hidden) renderSheet(); }
  finished.filter(id => id.startsWith('rs:')).forEach(id => { const t = TECH_BY[id.slice(3)]; Snd.chime(); toast(`Runa pesquisada: ${t.n} nível ${S.research[t.k]}!`); dirty = true; if (sheetFor === 'runas') renderSheet(); });
  finished = finished.filter(id => !id.startsWith('rs:'));
  finished.forEach(id => { const p = plotById(id); Snd.done(); burst(p, '#f3d27a', 24); toast(`${DEF[p.type].name} chegou ao nível ${S.b[id].lvl}!`); dirty = true; });
  if (finished.length) refreshDecor();
  if (finished.length && sheetFor) renderSheet();
  renderBuilders();
  if (dirty) { renderHUD(); save(); dirty = false; }
}
setInterval(() => { tick(); if (sheetFor && !sheet.hidden && S.b[sheetFor] && (S.b[sheetFor].end || (sheetFor === 'quartel' && S.train) || ((sheetFor === 'serraria' && S.exp.lenha) || (sheetFor === 'pedreira' && S.exp.mina)) || sheetFor === 'horta' || sheetFor === 'curral' || (sheetFor === 'runas' && S.rs)) && !sheet.contains(document.activeElement && document.activeElement.tagName === 'INPUT' ? document.activeElement : null)) renderSheet(); }, 1000);
setInterval(() => { dirty = true; }, 5000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { tick(); dirty = true; if (S.music && Snd.ctx) Music.start(B ? 'batalha' : 'vila'); } else { save(); Music.stop(); } });


/* ========== Gráficos: modo leve automático ========== */
const GFX = { mode: 'alto', fpsT: 0, fpsN: 0, fpsSum: 0, checked: false };
const lowHint = () => (navigator.deviceMemory && navigator.deviceMemory <= 3) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4);
function applyGfx(m, silent) {
  GFX.mode = m; const low = m === 'leve';
  renderer.setPixelRatio(low ? 1 : Math.min(devicePixelRatio || 1, 1.5)); resize();
  sun.castShadow = !low; clouds.forEach(c => c.visible = !low);
  folk.forEach((f, i) => f.o.visible = !low || i < 3);
  if (!silent && low) toast('Modo leve ligado para o jogo rodar melhor');
}
function initGfx() { const pref = S.gfx || 'auto'; applyGfx(pref === 'auto' ? (lowHint() ? 'leve' : 'alto') : pref, true); }
function watchFps(dt) { // nos primeiros segundos, se estiver lento, liga o modo leve sozinho
  if (GFX.checked || (S.gfx || 'auto') !== 'auto' || B || CINE) return;
  GFX.fpsT += dt; if (GFX.fpsT < 2) return; GFX.fpsN++; GFX.fpsSum += dt;
  if (GFX.fpsT > 8) { GFX.checked = true; const avg = GFX.fpsSum / GFX.fpsN; if (avg > .045 && GFX.mode !== 'leve') applyGfx('leve'); }
}

/* ========== Música (gerada no jogo) e narrador ========== */
const Music = {
  out: null, mode: null, timer: null, nextT: 0, step: 0, drone: null, bpm: 84,
  SC: [146.83, 164.81, 174.61, 220, 261.63, 293.66, 329.63, 349.23, 440], // ré menor viking
  start(mode) {
    if (!S.music || !Snd.ctx || Snd.ctx.state !== 'running') { this.mode = mode; return; }
    if (this.mode === mode && this.timer) return;
    this.stop(); this.mode = mode; const c = Snd.ctx;
    this.out = c.createGain(); this.out.gain.value = 0; this.out.gain.linearRampToValueAtTime(mode === 'batalha' ? .32 : .22, c.currentTime + 2); this.out.connect(c.destination);
    this.bpm = mode === 'batalha' ? 132 : 80; this.step = 0; this.nextT = c.currentTime + .1;
    // bordão grave
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = mode === 'batalha' ? 520 : 360; f.connect(this.out);
    this.drone = [mode === 'batalha' ? 55 : 73.42, mode === 'batalha' ? 82.41 : 110].map(hz => { const o = c.createOscillator(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = hz; g.gain.value = .09; o.connect(g); g.connect(f); o.start(); return o; });
    this.timer = setInterval(() => this.tick(), 90);
  },
  stop() { if (this.timer) clearInterval(this.timer); this.timer = null; if (this.drone) { this.drone.forEach(o => { try { o.stop(); } catch (e) {} }); this.drone = null; } if (this.out) { const o = this.out; o.gain.linearRampToValueAtTime(0, Snd.ctx.currentTime + .4); setTimeout(() => o.disconnect(), 600); this.out = null; } },
  drum(t, hz, v, d = .25) { const c = Snd.ctx, o = c.createOscillator(), g = c.createGain(); o.type = 'sine'; o.frequency.setValueAtTime(hz, t); o.frequency.exponentialRampToValueAtTime(hz * .45, t + d); g.gain.setValueAtTime(v, t); g.gain.exponentialRampToValueAtTime(.001, t + d); o.connect(g); g.connect(this.out); o.start(t); o.stop(t + d + .05); },
  shaker(t, v) { const c = Snd.ctx, len = c.sampleRate * .05 | 0, b = c.createBuffer(1, len, c.sampleRate), ch = b.getChannelData(0); for (let i = 0; i < len; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / len); const s = c.createBufferSource(), hp = c.createBiquadFilter(), g = c.createGain(); hp.type = 'highpass'; hp.frequency.value = 5000; g.gain.value = v; s.buffer = b; s.connect(hp); hp.connect(g); g.connect(this.out); s.start(t); },
  flute(t, hz, d, v = .09) { const c = Snd.ctx, o = c.createOscillator(), lfo = c.createOscillator(), lg = c.createGain(), g = c.createGain(); o.type = 'triangle'; o.frequency.value = hz; lfo.frequency.value = 5.2; lg.gain.value = hz * .012; lfo.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(v, t + .06); g.gain.setValueAtTime(v, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(g); g.connect(this.out); o.start(t); lfo.start(t); o.stop(t + d + .05); lfo.stop(t + d + .05); },
  horn(t, hz, d) { const c = Snd.ctx, o = c.createOscillator(), f = c.createBiquadFilter(), g = c.createGain(); o.type = 'sawtooth'; o.frequency.value = hz; f.type = 'lowpass'; f.frequency.setValueAtTime(300, t); f.frequency.linearRampToValueAtTime(1200, t + .25); g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.08, t + .15); g.gain.setValueAtTime(.08, t + d * .8); g.gain.exponentialRampToValueAtTime(.0001, t + d); o.connect(f); f.connect(g); g.connect(this.out); o.start(t); o.stop(t + d + .05); },
  phrase: [],
  tick() {
    if (!this.out) return; const c = Snd.ctx, spb = 60 / this.bpm / 4;
    while (this.nextT < c.currentTime + .35) {
      const s = this.step % 16, bar = Math.floor(this.step / 16), t = this.nextT, B = this.mode === 'batalha';
      if (B) {
        if (s % 4 === 0) this.drum(t, 70, .55); if (s === 6 || s === 14) this.drum(t, 120, .3, .18); if (s % 2 === 1) this.shaker(t, .05);
        if (bar % 4 === 0 && s === 0) [0, 4, 8].forEach((k, i) => this.horn(t + k * spb, [73.42, 87.31, 110][i], spb * 4));
      } else {
        if (s === 0) this.drum(t, 60, .4, .4); if (s === 8) this.drum(t, 80, .22, .3); if (s === 11 && bar % 2) this.drum(t, 80, .14, .25);
      }
      if (s === 0 && bar % 2 === 0) { // frase nova a cada 2 compassos
        this.phrase = []; let pos = 0, idx = 3 + Math.floor(Math.random() * 3);
        while (pos < 32) { const len = [2, 2, 4, 4, 6][Math.floor(Math.random() * 5)]; idx = Math.max(0, Math.min(this.SC.length - 1, idx + [-2, -1, -1, 1, 1, 2, 0][Math.floor(Math.random() * 7)])); if (Math.random() < (B ? .25 : .35)) this.phrase.push(null); else this.phrase.push([pos, idx, len]); pos += len; }
        this.phrase = this.phrase.filter(Boolean);
      }
      const ps = (bar % 2) * 16 + s; this.phrase.forEach(([p, i, len]) => { if (p === ps) this.flute(t, this.SC[i] * (B ? 1 : 2), len * spb, B ? .06 : .08); });
      this.nextT += spb; this.step++;
    }
  }
};
function say(txt) {
  if (!S.voice || !('speechSynthesis' in window)) return;
  try { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(txt); u.lang = 'pt-BR'; u.rate = 1; u.pitch = .7; const v = speechSynthesis.getVoices().find(v => /pt(-|_)BR/i.test(v.lang)); if (v) u.voice = v; speechSynthesis.speak(u); } catch (e) {}
}

/* ========== Baú diário, missões do dia e fim de semana ========== */
const today = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const isWeekend = () => { const d = new Date().getDay(); return d === 0 || d === 6; };
const CHEST = [{ mead: 1, runes: 5, food: 300 }, { mead: 1, runes: 8, wood: 400 }, { mead: 1, runes: 10, stone: 400 }, { mead: 1, runes: 12, iron: 200 }, { mead: 1, runes: 15, food: 600 }, { mead: 1, runes: 20, ouro: 1 }, { mead: 3, runes: 30, ouro: 3, rubi: 1 }];
function chestReady() { return S.daily.last !== today(); }
const chestTier = d => d >= 7 ? 'lend' : d >= 4 ? 'ferro' : 'madeira';
function chestSVG(t, mini) {
  const C = { madeira: { w1: '#a8743f', w2: '#6b4527', band: '#7b8288', bandHi: '#b9c0c5', trim: '#d9a441' }, ferro: { w1: '#8a5230', w2: '#4f2c17', band: '#c9962f', bandHi: '#ffe08a', trim: '#f3d27a' }, lend: { w1: '#5b3a8a', w2: '#2c1a4a', band: '#e8b23a', bandHi: '#fff1b0', trim: '#ffe08a' } }[t];
  const id = 'c' + Math.random().toString(36).slice(2, 7);
  return `<svg class="csvg ${t}${mini ? ' mini' : ''}" viewBox="0 0 200 180"><defs>
    <linearGradient id="${id}w" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.w1}"/><stop offset="1" stop-color="${C.w2}"/></linearGradient>
    <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${C.band}"/><stop offset=".45" stop-color="${C.bandHi}"/><stop offset="1" stop-color="${C.band}"/></linearGradient>
    <radialGradient id="${id}g"><stop offset="0" stop-color="#fff8d8"/><stop offset=".5" stop-color="#ffd86a" stop-opacity=".8"/><stop offset="1" stop-color="#ffb000" stop-opacity="0"/></radialGradient></defs>
    <ellipse cx="100" cy="168" rx="82" ry="9" fill="#000" opacity=".35"/>
    <g class="glow"><circle cx="100" cy="88" r="70" fill="url(#${id}g)"/></g>
    <g class="body">
      <rect x="22" y="84" width="156" height="80" rx="6" fill="url(#${id}w)" stroke="#1e1208" stroke-width="4"/>
      <path d="M26 106h148M26 128h148M26 148h148" stroke="#000" stroke-opacity=".28" stroke-width="2"/>
      <path d="M40 92v66M88 92v8M120 140v14M150 110v40" stroke="#fff" stroke-opacity=".08" stroke-width="2"/>
      <rect x="44" y="84" width="16" height="80" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      <rect x="140" y="84" width="16" height="80" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      <rect x="22" y="84" width="156" height="9" fill="${C.trim}" stroke="#1e1208" stroke-width="2.5"/>
      <circle cx="52" cy="112" r="3" fill="#1e1208"/><circle cx="52" cy="140" r="3" fill="#1e1208"/><circle cx="148" cy="112" r="3" fill="#1e1208"/><circle cx="148" cy="140" r="3" fill="#1e1208"/>
      <path d="M82 92h36v30l-18 12-18-12z" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      <circle cx="100" cy="106" r="5" fill="#1e1208"/><path d="M98 108h4l1.5 12h-7z" fill="#1e1208"/>
      ${t === 'lend' ? '<text class="rn" x="100" y="156" text-anchor="middle" font-size="15" fill="#c9a8ff" letter-spacing="6">ᚠᚢᚦᚨᚱ</text>' : ''}
    </g>
    <g class="lid">
      <path d="M22 86V62c0-30 34-44 78-44s78 14 78 44v24z" fill="url(#${id}w)" stroke="#1e1208" stroke-width="4"/>
      <path d="M30 60c4-22 34-34 70-34s66 12 70 34" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="3"/>
      <path d="M44 86V40c4-6 10-10 16-12v58z" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      <path d="M156 86V40c-4-6-10-10-16-12v58z" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      <rect x="20" y="78" width="160" height="10" rx="2" fill="${C.trim}" stroke="#1e1208" stroke-width="2.5"/>
      <path d="M88 78h24v14H88z" fill="url(#${id}b)" stroke="#1e1208" stroke-width="2.5"/>
      ${t === 'lend' ? '<path d="M100 34l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z" fill="#ffe08a" stroke="#6b4a12" stroke-width="2"/>' : t === 'ferro' ? '<circle cx="100" cy="52" r="10" fill="#c9962f" stroke="#1e1208" stroke-width="2.5"/><path d="M100 45v14M93 52h14" stroke="#1e1208" stroke-width="2.5"/>' : ''}
    </g></svg>`;
}
function openChest() {
  sheetFor = null; const day = S.daily.next || 1, t = chestTier(day), ready = chestReady();
  openSheet(`<h2>${t === 'lend' ? 'Baú Lendário' : 'Baú do Jarl'}</h2><p class="sub">Volte todo dia seguido: o baú fica mais rico e no 7º dia é lendário</p>
    <div class="cstage ${t}${ready ? ' ready' : ''}" ${ready ? 'data-a="chest"' : ''}><div class="rays"></div>${chestSVG(t)}<div class="cfly"></div>${ready ? '<div class="ctap">Toque para abrir</div>' : ''}</div>
    <div class="chestrow">${CHEST.map((r, i) => { const d = i + 1, st = d < day ? 'got' : d === day ? (ready ? 'now' : 'got') : ''; return `<div class="cd ${st}${d === 7 ? ' l7' : ''}"><b>Dia ${d}</b>${chestSVG(chestTier(d), true)}<div class="cr">${Object.entries(r).map(([k, v]) => `<span>${icoSVG(k)}${fmt(v)}</span>`).join('')}</div>${d < day || (d === day && !ready) ? '<i class="ck">✓</i>' : ''}</div>`; }).join('')}</div>
    ${ready ? `<div class="actions"><button class="btn" data-a="chest">Abrir o baú do dia ${day}</button></div>` : `<p class="desc" style="text-align:center">Baú de hoje já aberto. Volte amanhã para o dia ${day}!</p><div class="actions"><button class="btn ghost" data-a="close">Fechar</button></div>`}`);
}
let chestBusy = false;
function claimChest() {
  if (!chestReady() || chestBusy) return; const y = new Date(Date.now() - 864e5), yd = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
  let day = S.daily.last === yd ? (S.daily.next || 1) : 1; // perdeu um dia: volta ao 1
  const r = CHEST[day - 1]; for (const k in r) gain(k, r[k]);
  S.daily.last = today(); S.daily.next = day >= 7 ? 1 : day + 1; passXP(20); save(); dirty = true;
  const st = sheet.querySelector('.cstage'); if (!st) { openSheet(rewardCard(day === 7 ? 'Baú lendário!' : `Baú do dia ${day}`, 'Volte amanhã para o próximo', r)); return; }
  chestBusy = true; st.classList.remove('ready'); st.removeAttribute('data-a'); sheet.querySelectorAll('[data-a="chest"]').forEach(b => b.disabled = true);
  st.classList.add('shake'); const tp = st.querySelector('.ctap'); if (tp) tp.remove(); Snd.tap(); setTimeout(() => Snd.tap(), 250); setTimeout(() => Snd.tap(), 500);
  setTimeout(() => {
    st.classList.remove('shake'); st.classList.add('open'); Snd.chime(); if (day === 7) setTimeout(() => Snd.done(), 200);
    const fly = st.querySelector('.cfly'), items = Object.entries(r);
    for (let i = 0; i < 14; i++) { const c = document.createElement('i'); c.className = 'coin'; c.style.setProperty('--x', (Math.random() * 220 - 110) + 'px'); c.style.setProperty('--y', (-60 - Math.random() * 90) + 'px'); c.style.animationDelay = (Math.random() * .25) + 's'; fly.appendChild(c); }
    items.forEach(([k, v], i) => { const e = document.createElement('div'); e.className = 'citem'; e.style.setProperty('--x', ((i - (items.length - 1) / 2) * 78) + 'px'); e.style.animationDelay = (.25 + i * .15) + 's'; e.innerHTML = `${icoSVG(k)}<b>+${fmt(v)}</b>`; fly.appendChild(e); });
  }, 800);
  setTimeout(() => { chestBusy = false; if (sheet.querySelector('.cstage')) openSheet(rewardCard(day === 7 ? 'Baú lendário!' : `Baú do dia ${day}`, 'Volte amanhã para o próximo', r)); }, 3000);
}
/* ========== Missões do dia ========== */
const DQ_POOL = [
  { k: 'coletar', n: 5, t: 'Colete recursos 5 vezes', r: { runes: 5 } },
  { k: 'obras', n: 2, t: 'Comece 2 obras ou melhorias', r: { wood: 300 } },
  { k: 'exp_lenha', n: 3, t: 'Mande os lenhadores 3 vezes', r: { food: 300 } },
  { k: 'exp_mina', n: 2, t: 'Mande os mineiros 2 vezes', r: { runes: 8 }, need: () => S.b.pedreira.lvl },
  { k: 'exp_caca', n: 2, t: 'Volte de 2 caçadas', r: { runes: 8 }, need: () => S.b.cabana.lvl },
  { k: 'colher', n: 3, t: 'Colha 3 plantações', r: { stone: 300 }, need: () => S.b.horta.lvl },
  { k: 'curral', n: 2, t: 'Recolha o curral 2 vezes', r: { food: 400 }, need: () => S.b.curral.lvl },
  { k: 'ondas', n: 1, t: 'Vença uma onda de draugr', r: { runes: 10 }, need: () => S.b.quartel.lvl },
  { k: 'treinar', n: 5, t: 'Treine 5 tropas', r: { iron: 150 }, need: () => S.b.quartel.lvl }
];
function dailyQuests() {
  if (!S.dq || S.dq.day !== today()) {
    const pool = DQ_POOL.filter(q => !q.need || q.need()); let seed = today().split('-').join('') % 9973;
    const pick = []; while (pick.length < 3 && pool.length) { seed = (seed * 7919 + 13) % 9973; pick.push(pool.splice(seed % pool.length, 1)[0].k); }
    S.dq = { day: today(), list: pick, cnt: {}, got: [], bonus: false };
  }
  return S.dq;
}
function dcount(k, n = 1) { S.tot = S.tot || {}; S.tot[k] = (S.tot[k] || 0) + n; const q = dailyQuests(); q.cnt[k] = (q.cnt[k] || 0) + n; evAdd(k, n); if (PASS_XP_OF[k]) passXP(PASS_XP_OF[k] * n); dirty = true; }
const dqDef = k => DQ_POOL.find(q => q.k === k);
const dqDone = k => (dailyQuests().cnt[k] || 0) >= dqDef(k).n;
function dqClaimable() { const q = dailyQuests(); return q.list.some(k => dqDone(k) && !q.got.includes(k)) || (!q.bonus && q.list.every(k => q.got.includes(k))); }
function dailyHTML() {
  const q = dailyQuests();
  return `<p class="sub" style="margin-top:4px">Missões do dia${isWeekend() ? ' · <b class="ok">fim de semana: expedições +50%</b>' : ''}</p><div class="mlist">${q.list.map(k => { const d = dqDef(k), c = Math.min(d.n, q.cnt[k] || 0), got = q.got.includes(k);
    return `<div class="mitem dq${got ? ' done' : ''}"><span>${d.t} <small>${c}/${d.n}</small></span>${got ? '✓' : dqDone(k) ? `<button class="btn sm" data-a="dq" data-k="${k}">Pegar</button>` : `<small>${Object.entries(d.r).map(([rk, v]) => `${icoSVG(rk)}${fmt(v)}`).join(' ')}</small>`}</div>`; }).join('')}
    <div class="mitem dq${q.bonus ? ' done' : ''}"><span>Complete as 3 <small>bônus</small></span>${q.bonus ? '✓' : q.list.every(k => q.got.includes(k)) ? '<button class="btn sm" data-a="dq" data-k="bonus">Pegar</button>' : `<small>${icoSVG('runes')}15 ${icoSVG('mead')}1</small>`}</div></div>
    <div class="mitem chestline" data-a="chestopen">${chestReady() ? '<b class="ok">Baú diário pronto para abrir!</b>' : `Baú diário · volta amanhã (dia ${S.daily.next || 1})`}</div>`;
}
function claimDq(k) {
  const q = dailyQuests();
  if (k === 'bonus') { if (q.bonus || !q.list.every(x => q.got.includes(x))) return; q.bonus = true; gain('runes', 15); gain('mead', 1); }
  else { if (!dqDone(k) || q.got.includes(k)) return; q.got.push(k); const r = dqDef(k).r; for (const x in r) gain(x, r[x]); }
  passXP(40); Snd.done(); toast('Recompensa recebida!'); save(); dirty = true; openMissions();
}

/* ========== Tutorial guiado ========== */
const TUT = [
  { t: 'Eu sou o Jarl! Vamos erguer nossa vila. Toque na bolha de comida em cima da <b>Fazenda</b>.', plot: 'faz1', done: () => S.stats.food > 0 },
  { t: 'Muito bem! Agora toque no <b>Salão do Jarl</b> e melhore para o nível 2.', plot: 'salao', done: () => S.b.salao.end || S.b.salao.lvl >= 2 },
  { t: 'Enquanto a obra anda, toque na <b>Serraria</b> e envie um lenhador para a floresta.', plot: 'serraria', done: () => S.exp.lenha || S.stats.expLenha },
  { t: 'Quando aparecer o <b>✓ verde</b> em cima da Serraria, toque nele para ver o corte.', plot: 'serraria', done: () => S.stats.expLenha >= 1 },
  { t: 'Agora toque nas <b>Missões</b> aqui embaixo para pegar suas recompensas.', el: '#mission', done: () => S.mdone.length >= 2 },
  { t: 'Siga as missões: construa o Quartel, treine guerreiros e toque em <b>Batalha</b> quando estiver pronto. Boa sorte, Jarl!', el: '#btnBattle', last: true }
];
function tutStep() { return S.tut < TUT.length ? TUT[S.tut] : null; }
function renderTut() {
  const st = tutStep(), box = $('#tut');
  if (!st || B || CINE) { box.hidden = true; return; }
  box.hidden = false;
  if (box.dataset.i !== String(S.tut)) { box.dataset.i = S.tut; $('#tutTxt').innerHTML = st.t; $('#tutOk').hidden = !st.last; }
  const ar = $('#tutArrow'); let x, y, ok = true;
  if (st.el) { const r = $(st.el).getBoundingClientRect(); x = r.left + r.width / 2; y = r.top - 6; }
  else { const p = plotById(st.plot), [px, pz] = hexPos(p.c, p.r); v3.set(px, (PLOT_H[p.type] || 1.5) + .9, pz).project(camera); x = (v3.x + 1) / 2 * innerWidth; y = (1 - v3.y) / 2 * innerHeight - 30; ok = v3.z < 1; }
  ar.hidden = !ok || !sheet.hidden; ar.style.transform = `translate(${x}px,${y}px)`;
}
function stepTut() {
  const st = tutStep(); if (!st || st.last) return;
  if (st.done()) { S.tut++; Snd.collect(); save(); }
}
function endTut() { S.tut = 99; save(); $('#tut').hidden = true; }

$('#tutSkip').addEventListener('click', () => { Snd.tap(); endTut(); });
$('#tutOk').addEventListener('click', () => { Snd.collect(); endTut(); });

/* ========== Início ========== */
addEventListener('resize', resize);
resize(); renderHUD(); renderBuilders();
loadAll().then(() => {
  buildTerrain(); { ship = buildDrakkar(false, false); const [x, z] = hexPos(9, 12); ship.position.set(x + .3, -.05, z); ship.rotation.y = .35; ship.scale.setScalar(.7); scene.add(ship); }
  for (let i = 0; i < 6; i++) { const c = model(i % 2 ? 'cloud_small' : 'cloud_big', 2.2); c.traverse(m => { if (m.isMesh) m.castShadow = false; }); c.position.set(-35 + i * 13, 15 + (i % 3), -26 + (i % 2) * 6); scene.add(c); clouds.push(c); }
  buildFolk(); buildTags(); refreshDecor(); refreshGuards(); buildWorkSpots(); buildFieldTags(); initGfx();
  loadRest().then(() => { refreshHerd(); refreshPiles(); buildWild(); });
  $('#loading').classList.add('done'); setTimeout(() => $('#loading').remove(), 600);
  setTimeout(() => { if (!S.intro || S.tut < 4) return; if (chestReady()) openChest(); else if (isWeekend()) toast('Fim de semana viking: expedições rendem +50%!'); }, 1500);
  renderer.setAnimationLoop(frame);
  if (!S.intro) {
    openSheet(`<h2>Bem-vindo, Jarl!</h2><p class="sub">Sua vila no fiorde</p>
      <p class="desc">Construa e melhore os prédios, colete recursos tocando nas bolhas acima deles e cumpra as missões. Arraste para mover a vila e use dois dedos para aproximar.</p>
      <p class="desc">Os draugr virão pelo mar e pela floresta. Construa o Quartel, treine tropas e toque em <b>Batalha</b> quando estiver pronto.</p>
      ${isStandalone() ? '' : '<p class="desc" style="font-size:14px">Dica: toque em <b>Instalar</b> no topo da tela para ter o jogo como app no celular.</p>'}
      <div class="actions"><button class="btn" data-a="close">Começar</button></div>`);
    S.intro = true; save();
  } else if (offlineGain) toast(`Bem-vindo de volta! A vila produziu por ${fmtT(Math.min(offlineGain, 8 * 3600e3) / 1000)}`);
}).catch(err => { $('#loadMsg').textContent = 'Não foi possível carregar os modelos 3D. Verifique a conexão e recarregue.'; console.error(err); });
const GAME_VERSION = 23;
/* instalar como app */
let installEvt = null;
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
addEventListener('beforeinstallprompt', e => { e.preventDefault(); installEvt = e; });
addEventListener('appinstalled', () => { installEvt = null; const b = $('#btnInstall'); if (b) b.hidden = true; toast('VikingShot instalado!'); });
async function installApp() {
  Snd.init(); Snd.tap();
  if (isStandalone()) { toast('O jogo já está instalado'); return; }
  if (installEvt) { installEvt.prompt(); const r = await installEvt.userChoice.catch(() => null); if (r && r.outcome === 'accepted') installEvt = null; return; }
  sheetFor = null;
  openSheet(isIOS()
    ? `<h2>Instalar no iPhone</h2><ol class="steps"><li>Abra o jogo no <b>Safari</b>.</li><li>Toque no botão <b>Compartilhar</b> (o quadrado com a seta para cima).</li><li>Escolha <b>Adicionar à Tela de Início</b> e toque em <b>Adicionar</b>.</li></ol><p class="desc">O ícone do VikingShot aparece junto com seus apps e o jogo abre em tela cheia.</p><div class="actions"><button class="btn" data-a="close">Entendi</button></div>`
    : `<h2>Instalar no celular</h2><ol class="steps"><li>Abra o jogo no <b>Chrome</b>.</li><li>Toque nos <b>três pontinhos ⋮</b> no canto de cima.</li><li>Escolha <b>Instalar app</b> ou <b>Adicionar à tela inicial</b>.</li></ol><p class="desc">O ícone do VikingShot aparece junto com seus apps e o jogo abre em tela cheia, até sem internet.</p><div class="actions"><button class="btn" data-a="close">Entendi</button></div>`);
}
if (!isStandalone()) { const b = $('#btnInstall'); if (b) { b.hidden = false; b.addEventListener('click', installApp); } }
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  // quando uma versão nova do jogo é instalada, recarrega sozinho uma vez
  const hadCtrl = !!navigator.serviceWorker.controller; let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadCtrl && !reloaded && !B && !CINE) { reloaded = true; save(); location.reload(); } });
  addEventListener('load', () => navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).then(r => { r.update(); setInterval(() => r.update(), 5 * 60e3); }).catch(() => {}));
}
window.__vs = { openChest, openTavern, openHeroes, openHero, startClanBoss, openClan, exportVila, packVila, unpackVila, startTower, openTower, openAch, achReady, finishEnding, startCampG: g => startCamp(g), Music, Snd, camera, setFace, faceFor, finishExp, harvest, curralCollect, cineT: () => CINE && CINE.t, S, tick, upgrade: id => upgrade(plotById(id)), collect: id => collect(plotById(id)), cam, placeCamera, startBattle, heroSkill, endBattle, get B() { return B; }, sim: sec => { let t = 0; while (t < sec && B) { stepBattle(.05); t += .05; } return t; }, train, renderSheet, openBuilding: id => openBuilding(plotById(id)) };
