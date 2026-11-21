// Scene types for the factory compositor. Each type returns { css, html, js, sfx, assets, module } for one scene.
// Coordinates: 1080x1920, ground line y=1500, caption band 200-480, label pill at 1665.
const { abs, fs } = require('./util.cjs');
const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const J = (o) => JSON.stringify(o);
const q = (s) => "'" + String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'") + "'";

// resolve a beat time: seconds from scene start, "40%", "end-1.2", "w3" (word 3 of the scene's first sentence)
function timeOf(at, w, ctx, sent) {
  if (at == null) return w[0];
  if (typeof at === 'number') return +(w[0] + at).toFixed(2);
  const s = String(at);
  if (s.endsWith('%')) return +(w[0] + (w[1] - w[0]) * parseFloat(s) / 100).toFixed(2);
  if (s.startsWith('end')) return +(w[1] + (s.length > 3 ? parseFloat(s.slice(3)) : 0)).toFixed(2);   // "end-1.2" -> w1 - 1.2
  if (s.startsWith('w')) { const k = parseInt(s.slice(1), 10); const wt = ctx.wt[sent] || []; return wt[Math.min(k, wt.length - 1)] ? wt[Math.min(k, wt.length - 1)][0] : w[0]; }
  return w[0] + parseFloat(s);
}

// ---------------------------------------------------------------- BACKDROPS (art v2, 2026-11-12)
// Illustrated, low-contrast sets with depth behind stage scenes: wall, window light, furniture silhouettes, floor, vignette.
// The caption band (y 200-480) stays plain so the hook stays readable; detail sits between y 540 and the floor (1500).
function backdrop(bg, id, th) {
  const g = (n) => `${id}_${n}`;
  const lg = (n, a, b) => `<linearGradient id="${g(n)}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient>`;
  const vig = (o = 0.22) => `<radialGradient id="${g('vg')}" cx="50%" cy="46%" r="72%"><stop offset=".58" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${o}"/></radialGradient>`;
  const V = `<rect width="1080" height="1920" fill="url(#${g('vg')})"/>`;
  const floorShadow = `<ellipse cx="540" cy="1512" rx="520" ry="46" fill="#000" opacity=".06"/>`;
  const persp = (xs, color) => xs.map((x) => `<path d="M${x},1500 L${Math.round(540 + (x - 540) * 2.05)},1920" stroke="${color}" stroke-width="3" opacity=".45"/>`).join('');
  const plant = (x, sc = 1) => `<g transform="translate(${x},1500) scale(${sc})"><path d="M-48,0 L-40,-100 L40,-100 L48,0 Z" fill="#c4704e"/><path d="M-40,-100 L40,-100 L38,-84 L-38,-84 Z" fill="#a95c3e"/><path d="M0,-100 C-74,-176 -94,-268 -42,-340 C-10,-266 -4,-186 0,-100Z M0,-100 C42,-196 94,-246 136,-256 C114,-194 62,-134 0,-100Z M0,-100 C-20,-206 12,-308 62,-370 C62,-278 32,-176 0,-100Z M0,-100 C-60,-150 -130,-160 -170,-140 C-120,-112 -60,-104 0,-100Z" fill="#6f9b6b"/><path d="M0,-100 C-20,-206 12,-308 62,-370" fill="none" stroke="#557d52" stroke-width="4"/></g>`;
  const A1 = th.accent || '#b8913a', A2 = th.accent2 || '#e6c879', A3 = th.accent3 || '#8a6a22';
  if (bg === 'room') return `<defs>${vig()}${lg('wall', '#f4e9d6', '#e5d2b1')}${lg('floor', '#d1b78e', '#b89a6f')}${lg('sky', '#bfe0f3', '#f8ead0')}<linearGradient id="${g('beam')}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff9e8" stop-opacity=".6"/><stop offset="1" stop-color="#fff9e8" stop-opacity="0"/></linearGradient></defs>
<rect width="1080" height="1500" fill="url(#${g('wall')})"/>
<rect x="92" y="600" width="338" height="476" rx="18" fill="#fbf6ec"/><rect x="114" y="622" width="294" height="432" rx="8" fill="url(#${g('sky')})"/><path d="M114,968 C170,936 232,958 284,930 C334,904 374,918 408,904 V1054 H114Z" fill="#e7cfa3" opacity=".75"/><path d="M261,622 V1054 M114,838 H408" stroke="#fbf6ec" stroke-width="12"/>
<path d="M80,590 H444" stroke="#d9c39c" stroke-width="10" stroke-linecap="round"/><path d="M96,596 C120,700 110,900 132,1090 L70,1090 C64,900 70,700 96,596Z M428,596 C404,700 414,900 392,1090 L454,1090 C460,900 454,700 428,596Z" fill="${A1}" opacity=".32"/>
<path d="M114,1054 L408,1054 L700,1500 L-60,1500 Z" fill="url(#${g('beam')})"/>
<rect x="688" y="676" width="256" height="196" rx="10" fill="#fbf6ec" opacity=".9"/><rect x="704" y="692" width="224" height="164" rx="4" fill="${A2}" opacity=".38"/><circle cx="782" cy="764" r="38" fill="${A1}" opacity=".42"/><path d="M704,856 L790,782 L850,832 L928,760 V856Z" fill="${A3}" opacity=".28"/>
<rect y="1476" width="1080" height="24" fill="#dcc59e"/>${plant(985, 0.9)}
<rect y="1500" width="1080" height="420" fill="url(#${g('floor')})"/><path d="M0,1596 H1080 M0,1712 H1080 M0,1846 H1080" stroke="#9c7f57" stroke-width="3" opacity=".3"/>${floorShadow}${V}`;
  if (bg === 'clinic') return `<defs>${vig(0.18)}${lg('wall', '#f1fbf8', '#dcf1ec')}${lg('floor', '#d3ebe6', '#bcdcd5')}${lg('glass', '#d7eefb', '#f2fbff')}</defs>
<rect width="1080" height="1500" fill="url(#${g('wall')})"/><rect y="1150" width="1080" height="330" fill="#cfeae3"/><rect y="1144" width="1080" height="10" fill="#b5ddd3"/>
<rect x="86" y="600" width="300" height="420" rx="16" fill="#ffffff"/><rect x="104" y="618" width="264" height="384" rx="8" fill="url(#${g('glass')})"/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="104" y="${630 + k * 46}" width="264" height="18" fill="#ffffff" opacity=".75"/>`).join('')}
<g transform="translate(760,640)"><rect x="-120" y="0" width="240" height="300" rx="14" fill="#ffffff"/><rect x="-104" y="16" width="208" height="268" rx="8" fill="#e6f7f3"/><path d="M-36,90 C-40,54 -6,44 0,64 C6,44 40,54 36,90 C32,126 24,176 20,190 C12,198 6,182 0,170 C-6,182 -12,198 -20,190 C-24,176 -32,126 -36,90 Z" fill="#ffffff" stroke="#14b8a6" stroke-width="6"/><path d="M60,40 l8,-16 l8,16 l-8,16 Z" fill="#5eead4"/></g>
<g transform="translate(150,1480)"><rect x="-90" y="-250" width="180" height="250" rx="10" fill="#ffffff" stroke="#c7e3dc" stroke-width="4"/><path d="M-90,-125 H90 M0,-250 V0" stroke="#c7e3dc" stroke-width="4"/><path d="M-20,-140 h-24 M20,-140 h24 M-20,-110 h-24 M20,-110 h24" stroke="#94a3b8" stroke-width="6" stroke-linecap="round"/></g>${plant(990, 0.8)}
<rect y="1500" width="1080" height="420" fill="url(#${g('floor')})"/>${persp([0, 135, 270, 405, 540, 675, 810, 945, 1080], '#a9d1c8')}<path d="M0,1600 H1080 M0,1730 H1080" stroke="#a9d1c8" stroke-width="3" opacity=".45"/>${floorShadow}${V}`;
  if (bg === 'office') {
    const towers = [[110, 820, 70], [190, 700, 60], [260, 900, 50], [330, 610, 80], [430, 760, 64], [520, 560, 70], [610, 820, 56], [690, 660, 74], [790, 780, 60], [870, 720, 70], [950, 860, 50]].map(([x, y, wd]) => `<rect x="${x}" y="${y}" width="${wd}" height="${1200 - y}" fill="#b9c8d8"/>${y < 700 ? `<rect x="${x + wd / 2 - 3}" y="${y - 60}" width="6" height="60" fill="#b9c8d8"/>` : ''}`).join('');
    return `<defs>${vig(0.2)}${lg('wall', '#eef1f5', '#dde3ea')}${lg('floor', '#cdd4dd', '#b6bfcb')}${lg('sky', '#cfe3f5', '#f6e6cf')}<clipPath id="${g('win')}"><rect x="86" y="596" width="908" height="588" rx="6"/></clipPath></defs>
<rect width="1080" height="1500" fill="url(#${g('wall')})"/><rect x="70" y="580" width="940" height="620" rx="14" fill="#ffffff"/><rect x="86" y="596" width="908" height="588" rx="6" fill="url(#${g('sky')})"/>
<g clip-path="url(#${g('win')})" opacity=".8">${towers}<path d="M86,1090 C300,1060 700,1110 994,1070 V1184 H86Z" fill="#a9b9ca" opacity=".55"/></g><path d="M386,596 V1184 M694,596 V1184" stroke="#ffffff" stroke-width="14"/>
<rect y="1440" width="1080" height="60" fill="#d3dae3"/>${plant(80, 0.75)}
<rect y="1500" width="1080" height="420" fill="url(#${g('floor')})"/>${persp([0, 270, 540, 810, 1080], '#a6b0bd')}${floorShadow}${V}`;
  }
  if (bg === 'shop') {
    const cols = ['#e8a3b0', '#9cc7d9', '#c9d99c', '#f0c987', '#c7a3e0', '#e8b89c', '#a3d9c4', '#f2b5a0'];
    let boxes = '';
    [700, 930, 1160].forEach((y, r) => { let x = 66, k = r * 3; while (x < 990) { const wd = 60 + ((k * 37) % 50), h = 110 + ((k * 53) % 70); boxes += `<rect x="${x}" y="${y - h}" width="${Math.min(wd, 1020 - x)}" height="${h}" rx="8" fill="${cols[k % cols.length]}"/><rect x="${x + 10}" y="${y - h + 22}" width="${Math.max(10, Math.min(wd, 1020 - x) - 20)}" height="16" rx="4" fill="#fff" opacity=".6"/>`; x += wd + 14; k++; } });
    return `<defs>${vig(0.22)}${lg('wall', '#f6eddc', '#eadcc2')}${lg('floor', '#d9c9ac', '#c4b08e')}</defs>
<rect width="1080" height="1500" fill="url(#${g('wall')})"/><rect x="40" y="540" width="1000" height="760" rx="12" fill="#e4d2b3"/><g opacity=".6">${boxes}</g>${[700, 930, 1160].map((y) => `<rect x="40" y="${y}" width="1000" height="22" fill="#b98b5a"/><rect x="40" y="${y + 22}" width="1000" height="10" fill="#000" opacity=".08"/>`).join('')}
<rect y="1476" width="1080" height="24" fill="#d8c5a3"/><rect y="1500" width="1080" height="420" fill="url(#${g('floor')})"/>${floorShadow}${V}`;
  }
  if (bg === 'dark' || bg === 'luxury') {
    const sp = bg === 'luxury' ? '#ffd1e3' : '#fff3d6';
    return `<defs>${vig(0.35)}<radialGradient id="${g('spot')}" cx="50%" cy="0%" r="100%"><stop offset="0" stop-color="${sp}" stop-opacity=".2"/><stop offset="1" stop-color="${sp}" stop-opacity="0"/></radialGradient><radialGradient id="${g('pool')}"><stop offset="0" stop-color="${sp}" stop-opacity=".26"/><stop offset="1" stop-color="${sp}" stop-opacity="0"/></radialGradient></defs>
<path d="M380,0 L700,0 L1020,1500 L60,1500 Z" fill="url(#${g('spot')})"/><ellipse cx="540" cy="1505" rx="470" ry="70" fill="url(#${g('pool')})"/>${[[150, 700, 6], [900, 560, 9], [820, 1200, 5], [230, 1300, 8], [640, 880, 4]].map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r * 6}" fill="${sp}" opacity=".05"/>`).join('')}${V}`;
  }
  return `<defs>${vig(0.12)}<radialGradient id="${g('b1')}"><stop offset="0" stop-color="${A2}" stop-opacity=".35"/><stop offset="1" stop-color="${A2}" stop-opacity="0"/></radialGradient><radialGradient id="${g('b2')}"><stop offset="0" stop-color="${A1}" stop-opacity=".18"/><stop offset="1" stop-color="${A1}" stop-opacity="0"/></radialGradient></defs>
<circle cx="160" cy="760" r="300" fill="url(#${g('b1')})"/><circle cx="960" cy="1180" r="360" fill="url(#${g('b2')})"/><circle cx="880" cy="560" r="180" fill="url(#${g('b1')})"/><ellipse cx="540" cy="1505" rx="480" ry="40" fill="#000" opacity=".06"/>${V}`;
}

// ---------------------------------------------------------------- CAST + MEME REACTIONS (2026-11-12)
// Recurring fictional characters (factory/cast.json): { "cast": "bu_saad" } on a character fills in its type and look,
// so a series keeps the same person in every episode. Job values win over the cast file.
let CAST = null;
function resolveCast(c) {
  if (!c || !c.cast) return c;
  if (!CAST) CAST = JSON.parse(fs.readFileSync(abs('factory/cast.json'), 'utf8'));
  const m = CAST.cast[c.cast]; if (!m) throw new Error(`unknown cast member "${c.cast}" (see factory/cast.json)`);
  if (!c.type) c.type = m.type;
  c.opts = { ...(m.opts || {}), ...(c.opts || {}) };
  return c;
}
// comic symbols drawn over a head; origin = bottom centre of the symbol, about 100 px tall
function emoteSvg(kind, rtl = true) {
  const txt = (ch, fill) => `<text x="0" y="-6" text-anchor="middle" font-family="Cairo" font-weight="900" font-size="112" fill="${fill}" stroke="#ffffff" stroke-width="12" paint-order="stroke" stroke-linejoin="round">${ch}</text>`;
  const star = (cx, cy, R) => `<path d="M${cx},${cy - R} Q${cx + R * 0.2},${cy - R * 0.2} ${cx + R},${cy} Q${cx + R * 0.2},${cy + R * 0.2} ${cx},${cy + R} Q${cx - R * 0.2},${cy + R * 0.2} ${cx - R},${cy} Q${cx - R * 0.2},${cy - R * 0.2} ${cx},${cy - R} Z" fill="#fbbf24" stroke="#d97706" stroke-width="3"/>`;
  switch (kind) {
    case 'sweat': return `<path d="M0,-96 q-34,58 0,80 q34,-22 0,-80 Z" fill="#7dd3fc" stroke="#38bdf8" stroke-width="5"/><path d="M-9,-48 q-6,14 4,22" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    case 'anger': return `<g transform="translate(0,-52)" fill="none" stroke="#e03131" stroke-width="11" stroke-linecap="round"><path d="M-32,-10 Q-10,-10 -10,-32 M10,-32 Q10,-10 32,-10 M32,10 Q10,10 10,32 M-10,32 Q-10,10 -32,10"/></g>`;
    case 'question': return txt(rtl ? '؟' : '?', '#1f2328');
    case 'exclaim': return `<rect x="-11" y="-104" width="22" height="64" rx="11" fill="#e03131" stroke="#fff" stroke-width="6"/><circle cx="0" cy="-16" r="13" fill="#e03131" stroke="#fff" stroke-width="6"/>`;
    case 'idea': return `<path d="M-52,-62 h-16 M52,-62 h16 M0,-114 v-16 M-38,-100 l-12,-12 M38,-100 l12,-12" stroke="#f59e0b" stroke-width="7" stroke-linecap="round"/><circle cx="0" cy="-62" r="36" fill="#fde047" stroke="#d4a017" stroke-width="5"/><rect x="-15" y="-30" width="30" height="20" rx="5" fill="#9ca3af" stroke="#6b7280" stroke-width="3"/><path d="M-12,-66 q12,-18 24,0" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>`;
    case 'heart': return `<path d="M0,-12 C-70,-56 -32,-112 0,-74 C32,-112 70,-56 0,-12 Z" fill="#ef4444" stroke="#b91c1c" stroke-width="4"/><circle cx="-20" cy="-74" r="8" fill="#fff" opacity=".8"/>`;
    case 'zzz': return `<g font-family="Cairo" font-weight="900" fill="#64748b" stroke="#fff" stroke-width="7" paint-order="stroke"><text x="-30" y="-8" font-size="44">Z</text><text x="0" y="-44" font-size="58">Z</text><text x="36" y="-90" font-size="74">Z</text></g>`;
    case 'sparkle': return `${star(0, -64, 34)}${star(-46, -24, 16)}${star(44, -104, 18)}`;
    case 'coins': return `<circle cx="18" cy="-42" r="34" fill="#f59e0b" stroke="#b45309" stroke-width="5"/><circle cx="-10" cy="-58" r="38" fill="#fbbf24" stroke="#b45309" stroke-width="5"/><circle cx="-10" cy="-58" r="25" fill="none" stroke="#d97706" stroke-width="4"/><path d="M-26,-76 q10,-12 22,-10" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".8"/>`;
    case 'dizzy': return `<path d="M0,-58 m-34,0 a34,34 0 1 1 34,34 a24,24 0 1 1 -24,-24 a14,14 0 1 1 14,14" fill="none" stroke="#7c3aed" stroke-width="8" stroke-linecap="round"/>${star(48, -104, 14)}${star(-52, -100, 12)}`;
    default: throw new Error('unknown emote ' + kind + ' (sweat anger question exclaim idea heart zzz sparkle coins dizzy)');
  }
}
// manga focus lines around the origin, leaving a clear circle for the face
function impactSvg(color) {
  let d = '';
  for (let k = 0; k < 30; k++) {
    const a = ((k * 12 + ((k * 37) % 9) - 4) * Math.PI) / 180, w = ((1.1 + ((k * 53) % 10) / 9) * Math.PI) / 180, r1 = 250 + ((k * 71) % 110), r2 = 1700;
    const p = (r, ang) => `${(Math.cos(ang) * r).toFixed(0)},${(Math.sin(ang) * r).toFixed(0)}`;
    d += `M${p(r1, a)} L${p(r2, a - w)} L${p(r2, a + w)} Z `;
  }
  return `<path d="${d}" fill="${color}"/>`;
}

// ---------------------------------------------------------------- STAGE
function stage(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme, sent = s.sentIdx[0];
  const bg = s.bg || 'light';
  const art2 = !(ctx.job && ctx.job.art === 1) && s.backdrop !== false;   // art v2: illustrated backdrop + idle life
  const bd = art2 ? backdrop(bg, id, th) : '';
  const assets = [];
  (s.chars || []).forEach(resolveCast);
  // character geometry for emotes, impact lines and the camera: scale, and the face point in frame pixels
  const cScale = (c) => c.scale || (art2 && !(c.opts && c.opts.art === 1) ? 1.2 : 1);
  const facePt = (cid) => { const c = (s.chars || []).find((x) => x.id === cid); if (!c) throw new Error(`scene ${i}: no character "${cid}"`); return [c.x || 540, Math.round((c.y || 1500) - 512 * cScale(c)), cScale(c)]; };
  const rtl = (ctx.job && ctx.job.lang ? ctx.job.lang : 'ar') === 'ar';
  let fxBack = '', fxFront = '';
  (s.beats || []).forEach((b, k) => {
    if (b.do === 'emote') {
      const [fx, fy, cs] = facePt(b.who), side = b.pos === 'left' ? -1 : b.pos === 'right' ? 1 : 0;
      const x = fx + side * 150 * cs, y = side ? fy - 20 * cs : fy - 158 * cs;
      fxFront += `<g transform="translate(${Math.round(x)},${Math.round(y)}) scale(${(1.15 * cs).toFixed(2)})"><g id="${id}_em${k}" opacity="0">${emoteSvg(b.kind || 'exclaim', rtl)}</g></g>`;
    }
    if (b.do === 'impact') {
      const [fx, fy] = b.who ? facePt(b.who) : [b.x || 540, b.y || 900];
      fxBack += `<g transform="translate(${fx},${fy})"><g id="${id}_im${k}" opacity="0">${impactSvg(bg === 'dark' || bg === 'luxury' ? 'rgba(255,255,255,.75)' : 'rgba(31,35,40,.5)')}</g></g>`;
    }
  });
  const css = `#${id} .bgfill { position: absolute; inset: 0; background: ${bg === 'dark' ? `radial-gradient(1000px 900px at 50% 40%, #2b2418 0%, ${th.dark} 75%)` : bg === 'luxury' ? `radial-gradient(1100px 900px at 50% 35%, #2a1620 0%, #12090e 70%, #080406 100%)` : bg === 'room' ? `linear-gradient(180deg, #efe4cf 0%, #e6d6b8 78%, #d9c7a3 78%, #d0bd96 100%)` : bg === 'clinic' ? `linear-gradient(180deg, #f0fdfa 0%, #e0f2fe 75%, #0d9488 75%, #0f766e 100%)` : `radial-gradient(1100px 900px at 50% 40%, #fdf8ee 0%, ${th.light} 100%)`}; }
#${id} .ground { position: absolute; left: 0; right: 0; top: 1500px; height: 4px; background: ${bg === 'dark' ? 'rgba(255,255,255,.12)' : bg === 'luxury' ? 'rgba(219,39,119,.3)' : bg === 'clinic' ? '#0f766e' : '#d9c7a3'}; }${bd ? `
#${id} .backdrop { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; overflow: hidden; }
#${id} .ground { display: none; }
#${id} [data-char] { filter: drop-shadow(0 18px 16px rgba(20,24,33,.13)); }
#${id} [data-prop] { filter: drop-shadow(0 12px 12px rgba(20,24,33,.12)); }` : ''}
#${id} .cam { position: absolute; left: 0; top: 0; width: 1080px; height: 1920px; }`;
  // art v2 characters default to 1.2x: faces must read on a phone (v1 sat at about a quarter of the frame height)
  const chars = (s.chars || []).map((c) => { const cid = `${id}_${c.id}`; return `<g transform="translate(${c.x || 540},${c.y || 1500}) scale(${c.scale || (art2 && !(c.opts && c.opts.art === 1) ? 1.2 : 1)})"><g id="${cid}"><g id="${cid}f" data-char="${c.type}" data-cid="${cid}" data-opts='${J(c.opts || {})}'></g></g></g>`; }).join('');
  const props = (s.props || []).map((p) => { const pid = `${id}_${p.id}`; return `<g transform="translate(${p.x || 0},${p.y || 0}) scale(${p.scale || 1})"><g id="${pid}" data-prop="${p.type}" data-pid="${pid}"${p.faceOk ? ' data-face-ok="1"' : ''} data-opts='${J(p.opts || {})}'></g></g>`; }).join('');
  const behind = (s.props || []).filter((p) => !p.front).length;
  const propsBack = (s.props || []).filter((p) => !p.front).map((p) => { const pid = `${id}_${p.id}`; return `<g transform="translate(${p.x || 0},${p.y || 0}) scale(${p.scale || 1})"><g id="${pid}" data-prop="${p.type}" data-pid="${pid}"${p.faceOk ? ' data-face-ok="1"' : ''} data-opts='${J(p.opts || {})}'></g></g>`; }).join('');
  const propsFront = (s.props || []).filter((p) => p.front).map((p) => { const pid = `${id}_${p.id}`; return `<g transform="translate(${p.x || 0},${p.y || 0}) scale(${p.scale || 1})"><g id="${pid}" data-prop="${p.type}" data-pid="${pid}"${p.faceOk ? ' data-face-ok="1"' : ''} data-opts='${J(p.opts || {})}'></g></g>`; }).join('');
  void props; void behind;
  const els = (s.els || []).map((e) => {
    const eid = `${id}_${e.id}`, st = `left:${e.x || 0}px;top:${e.y || 0}px;` + (e.w ? `width:${e.w}px;` : '');
    if (e.kind === 'img') {
      const src = ctx.client?.assets?.[e.file] || e.file;
      const dst = `img_${eid}${src.slice(src.lastIndexOf('.'))}`;
      assets.push({ src: abs(src), dst });
      return `<div id="${eid}" class="el img ${e.shape || 'circle'}" data-layout-allow-overlap="true" style="${st}width:${e.size || 420}px;height:${e.size || 420}px"><img src="assets/${dst}" alt="" /></div>`;
    }
    if (e.kind === 'tv') {
      const rawSrc = ctx.client?.assets?.[e.src] || e.src;
      const isVid = /\.(mp4|mov|webm)$/i.test(rawSrc);
      const dst = `tv_${eid}${rawSrc.slice(rawSrc.lastIndexOf('.'))}`;
      assets.push({ src: abs(rawSrc), dst });
      const dS = (w[1] - w[0]).toFixed(2);
      const screenContent = isVid
        ? `<video id="${eid}_v" src="assets/${dst}" muted playsinline data-start="${w[0]}" data-duration="${dS}" data-playback-rate="${e.rate || 1}" data-track-index="${40 + i}"></video>`
        : `<img src="assets/${dst}" alt="" />`;
      const wPx = e.w || 960;
      const hPx = e.h || Math.round(wPx * 9 / 16);
      return `<div id="${eid}" class="el tv-display ${e.cls || ''}" data-layout-allow-overlap="true" style="left:${e.x != null ? e.x : Math.round((1080 - wPx) / 2)}px;top:${e.y != null ? e.y : 480}px;width:${wPx}px;">
        <div class="tv-glow"></div>
        <div class="tv-bezel" style="width:${wPx}px;height:${hPx}px;">
          <div class="tv-screen">${screenContent}</div>
          <div class="tv-chin"><span class="tv-brand">${e.brand || 'SUDEGY 4K'}</span><span class="tv-led"></span></div>
        </div>
        <div class="tv-stand"><div class="tv-neck"></div><div class="tv-base"></div></div>
      </div>`;
    }
    if (e.kind === 'phone_video' || e.kind === 'phone') {
      const rawSrc = ctx.client?.assets?.[e.src] || e.src;
      const isVid = /\.(mp4|mov|webm)$/i.test(rawSrc);
      const dst = `ph_${eid}${rawSrc.slice(rawSrc.lastIndexOf('.'))}`;
      assets.push({ src: abs(rawSrc), dst });
      const dS = (w[1] - w[0]).toFixed(2);
      const screenContent = isVid
        ? `<video id="${eid}_v" src="assets/${dst}" muted playsinline data-start="${w[0]}" data-duration="${dS}" data-playback-rate="${e.rate || 1}" data-track-index="${40 + i}"></video>`
        : `<img src="assets/${dst}" alt="" />`;
      const wPx = e.w || 440;
      const hPx = e.h || Math.round(wPx * 832 / 464);
      return `<div id="${eid}" class="el phone-display ${e.cls || ''}" data-layout-allow-overlap="true" style="left:${e.x != null ? e.x : Math.round((1080 - wPx) / 2)}px;top:${e.y != null ? e.y : 480}px;width:${wPx}px;height:${hPx}px;">
        <div class="phone-glow"></div>
        <div class="phone-bezel" style="width:${wPx}px;height:${hPx}px;">
          <div class="phone-screen">${screenContent}</div>
          <div class="phone-notch"></div>
        </div>
      </div>`;
    }
    return `<div id="${eid}" class="el ${e.kind} ${e.color || ''}"${e.faceOk ? ' data-face-ok="1"' : ''} data-layout-allow-overlap="true" style="${st}${e.size ? `font-size:${e.size}px;` : ''}">${esc(e.text || (e.kind === 'qm' ? '؟' : e.kind === 'mark' ? (e.ok ? '✓' : '✕') : ''))}</div>`;
  }).join('');
  const needDark = (s.beats || []).some((b) => b.do === 'trip' || b.do === 'dark');
  let petalsHtml = '';
  if (s.petals || bg === 'luxury') {
    const pColors = ['#f43f5e', '#fb7185', '#fda4af', '#e11d48', '#f472b6', '#fde047', '#f43f5e', '#fda4af', '#fb7185', '#f472b6', '#fde047', '#e11d48'];
    const pConfigs = [
      { x: 120, y0: 350, dx: 70, sc: 0.9, rot: 180, dur: 3.8, delay: 0 },
      { x: 340, y0: 820, dx: -60, sc: 1.1, rot: 240, dur: 2.7, delay: 0 },
      { x: 620, y0: 510, dx: 80, sc: 0.85, rot: 210, dur: 3.4, delay: 0 },
      { x: 880, y0: 1100, dx: -70, sc: 1.0, rot: 280, dur: 2.1, delay: 0 },
      { x: 220, y0: -80, dx: 90, sc: 1.0, rot: 360, dur: 4.8, delay: 0.2 },
      { x: 480, y0: -80, dx: -80, sc: 1.15, rot: 420, dur: 4.5, delay: 0.7 },
      { x: 760, y0: -80, dx: 70, sc: 0.9, rot: 340, dur: 4.9, delay: 1.2 },
      { x: 150, y0: -80, dx: -60, sc: 0.8, rot: 390, dur: 4.6, delay: 1.8 },
      { x: 920, y0: -80, dx: 80, sc: 1.05, rot: 410, dur: 4.4, delay: 2.3 },
      { x: 380, y0: -80, dx: -90, sc: 0.95, rot: 380, dur: 4.7, delay: 2.9 },
      { x: 670, y0: -80, dx: 80, sc: 1.1, rot: 430, dur: 4.5, delay: 3.5 },
      { x: 280, y0: -80, dx: -70, sc: 0.85, rot: 350, dur: 4.8, delay: 4.1 }
    ];
    const items = pConfigs.map((cfg, k) => {
      const col = pColors[k % pColors.length];
      const isBlossom = k % 2 === 0;
      const svg = isBlossom
        ? `<svg width="44" height="44" viewBox="-22 -22 44 44"><path d="M0,0 Q-10,-20 0,-22 Q10,-20 0,0 M0,0 Q20,-10 22,0 Q20,10 0,0 M0,0 Q10,20 0,22 Q-10,20 0,0 M0,0 Q-20,10 -22,0 Q-20,-10 0,0" fill="${col}" opacity="0.88"/><circle cx="0" cy="0" r="4.5" fill="#fef08a"/></svg>`
        : `<svg width="34" height="42" viewBox="-17 -21 34 42"><path d="M0,-19 C13,-19 20,2 14,16 C8,23 -8,23 -14,16 C-20,2 -13,-19 0,-19 Z" fill="${col}" opacity="0.9"/></svg>`;
      return `<div id="${id}_p${k}" class="falling-petal" data-layout-allow-overlap="true" style="position:absolute;left:0;top:0;pointer-events:none;z-index:22;opacity:0;">${svg}</div>`;
    }).join('');
    petalsHtml = `<div class="petals-wrap" data-layout-allow-overlap="true" style="position:absolute;inset:0;pointer-events:none;overflow:hidden;z-index:22;">${items}</div>`;
  }
  // .cam wraps everything the camera sees (backdrop, stage, cards) so zoomTo moves them together; captions stay outside
  const html = `<section id="${id}" class="scene stage-sec bg-${bg}"><div class="bgfill"></div><div class="cam" id="${id}_cam" data-layout-allow-overflow="true" data-layout-allow-overlap="true">${bd ? `<svg class="backdrop" viewBox="0 0 1080 1920" data-layout-allow-overflow="true" data-layout-allow-occlusion="true">${bd}</svg>` : ''}<div class="ground"></div>${petalsHtml}
<svg class="stage" data-layout-allow-overflow="true" viewBox="0 0 1080 1920">${propsBack}${fxBack}${chars}${propsFront}${fxFront}</svg>${needDark ? `<div class="dim" id="${id}_dark"></div>` : ''}${els}</div><div class="flash" id="${id}_flash"></div></section>`;
  const P = (x) => `'#${id}_${x}'`;
  const propOrigin = (pid) => { const p = (s.props || []).find((x) => x.id === pid) || {}; return `${p.x || 0} ${p.y || 0}`; };
  const sfx = [];
  const lines = [];
  if (s.petals || bg === 'luxury') {
    const pConfigs = [
      { x: 120, y0: 350, dx: 70, sc: 0.9, rot: 180, dur: 3.8, delay: 0 },
      { x: 340, y0: 820, dx: -60, sc: 1.1, rot: 240, dur: 2.7, delay: 0 },
      { x: 620, y0: 510, dx: 80, sc: 0.85, rot: 210, dur: 3.4, delay: 0 },
      { x: 880, y0: 1100, dx: -70, sc: 1.0, rot: 280, dur: 2.1, delay: 0 },
      { x: 220, y0: -80, dx: 90, sc: 1.0, rot: 360, dur: 4.8, delay: 0.2 },
      { x: 480, y0: -80, dx: -80, sc: 1.15, rot: 420, dur: 4.5, delay: 0.7 },
      { x: 760, y0: -80, dx: 70, sc: 0.9, rot: 340, dur: 4.9, delay: 1.2 },
      { x: 150, y0: -80, dx: -60, sc: 0.8, rot: 390, dur: 4.6, delay: 1.8 },
      { x: 920, y0: -80, dx: 80, sc: 1.05, rot: 410, dur: 4.4, delay: 2.3 },
      { x: 380, y0: -80, dx: -90, sc: 0.95, rot: 380, dur: 4.7, delay: 2.9 },
      { x: 670, y0: -80, dx: 80, sc: 1.1, rot: 430, dur: 4.5, delay: 3.5 },
      { x: 280, y0: -80, dx: -70, sc: 0.85, rot: 350, dur: 4.8, delay: 4.1 }
    ];
    pConfigs.forEach((cfg, k) => {
      const tStart = +(w[0] + cfg.delay).toFixed(2);
      lines.push(`tl.fromTo('#${id}_p${k}', { x: ${cfg.x}, y: ${cfg.y0}, rotation: 0, opacity: 0, scale: ${cfg.sc} }, { x: ${cfg.x + cfg.dx}, y: 2020, rotation: ${cfg.rot}, opacity: 0.85, duration: ${cfg.dur}, ease: "none" }, ${tStart});`);
    });
  }
  for (const c of s.chars || []) if (c.enter) { lines.push(`SF.A.enter(tl, ${P(c.id)}, ${w[0] + (c.enterAt || 0)}, ${q(c.enter)});`); }
  for (const e of s.els || []) if (e.show) lines.push(`tl.set(${P(e.id)}, { opacity: 1 }, ${w[0]});`);
  for (const b of s.beats || []) {
    const t = timeOf(b.at, w, ctx, sent), who = b.who ? P(b.who) : null, el = b.el ? P(b.el) : null, pr = b.prop ? `${id}_${b.prop}` : null;
    switch (b.do) {
      case 'enter': lines.push(`SF.A.enter(tl, ${who}, ${t}, ${q(b.from || 'left')});`); break;
      case 'exit': lines.push(`SF.A.exit(tl, ${who}, ${t}, ${q(b.to || 'right')}, ${b.dist || 900}, ${b.dur || 1.0});`); break;
      case 'walkTo': lines.push(`tl.to(${who}, { x: ${b.dx || 0}, duration: ${b.dur || 0.8}, ease: "power1.inOut" }, ${t}); SF.A.walk(tl, ${who}, ${t}, ${b.dur || 0.8});`); break;
      case 'flip': lines.push(`tl.to('#${id}_${b.who}f', { scaleX: ${b.back ? 1 : -1}, duration: 0.15, transformOrigin: "50% 50%" }, ${t});`); break;
      case 'talk': lines.push(`SF.A.talk(tl, ${who}, ${t}, ${b.dur || 0.6});`); break;
      case 'shake': lines.push(`SF.A.shake(tl, ${who}, ${t}, ${b.dur || 1.0});`); break;
      case 'tilt': lines.push(`SF.A.tilt(tl, ${who}, ${t}, ${b.deg || 6});`); break;
      case 'point': lines.push(`SF.A.point(tl, ${who}, ${t}, ${q(b.side || 'r')}, ${b.hold || 1.2});`); break;
      case 'wave': lines.push(`SF.A.wave(tl, ${who}, ${t}, ${b.dur || 1.4}, ${q(b.side || 'r')});`); break;
      case 'arm': lines.push(`SF.A.arm(tl, ${who}, ${q(b.side || 'r')}, ${t}, ${b.deg || 0});`); break;
      case 'phoneUp': lines.push(`SF.A.phoneUp(tl, ${who}, ${t}, ${q(b.side || 'r')});`); break;
      case 'blink': case 'nod': case 'shrug': case 'cheer': case 'sad': case 'angry': case 'smile': case 'surprise': case 'neutral':
        lines.push(`SF.A.${b.do}(tl, ${who}, ${t});`); if (b.do === 'cheer') sfx.push(['sparkle.mp3', t, 0.25, 1.8]); break;
      case 'pop': lines.push(`SF.A.pop(tl, ${el}, ${t});`); sfx.push(['pop.mp3', t, 0.22, 0.7]); break;
      case 'show': lines.push(`tl.set(${el}, { opacity: 1 }, ${t});`); break;
      case 'hide': lines.push(`SF.A.hide(tl, ${el || `'#${pr}'`}, ${t});`); break;
      case 'slideIn': lines.push(`SF.A.slideIn(tl, ${el}, ${t}, ${b.dx || 200});`); sfx.push(['pop.mp3', t, 0.18, 0.7]); break;
      case 'flyAway': lines.push(`SF.A.flyAway(tl, ${el || `'#${pr}'`}, ${t}, ${b.dx || 900});`); sfx.push(['whoosh-short.mp3', t, 0.25, 0.6]); break;
      case 'stamp': lines.push(`SF.A.stamp(tl, ${el}, ${t});`); sfx.push(['pop.mp3', t + 0.28, 0.45, 0.7], ['sparkle.mp3', t + 0.32, 0.25, 1.8]); break;
      case 'drop': lines.push(`SF.A.drop(tl, ${el || `'#${pr}'`}, ${t}, ${b.dist || 500});`); break;
      case 'dropMany': lines.push(`SF.A.dropMany(tl, '#${pr}-j', ${b.n || 5}, ${t}, ${b.gap || 0.14});`); sfx.push(['pop.mp3', t, 0.15, 0.7]); break;
      case 'money': lines.push(`SF.A.money(tl, ${J((b.els || []).map((x) => `#${id}_${x}`))}, ${t});`); sfx.push(['whoosh-short.mp3', t, 0.25, 0.6]); break;
      case 'drain': lines.push(`SF.A.drain(tl, '#${pr}-lvl', ${t}, ${b.dur || 1.6});`); break;
      case 'fill': lines.push(`SF.A.fill(tl, '#${pr}-lvl', ${t}, ${b.dur || 1.2});`); break;
      case 'spin': lines.push(`SF.A.spin(tl, '#${pr}-hand', ${t}, ${b.dur || 3}, ${b.turns || 3}, ${q(propOrigin(b.prop))});`); break;
      case 'trip': lines.push(`SF.A.trip(tl, ${q(pr)}, ${t}, '#${id}_dark');`); sfx.push(['impact-bass-1.mp3', t, 0.5, 1.2]); break;
      case 'dark': lines.push(`tl.fromTo('#${id}_dark', { opacity: 0 }, { opacity: 1, duration: 0.15 }, ${t});`); break;
      case 'light': lines.push(`tl.to('#${id}_dark', { opacity: 0, duration: 0.25 }, ${t});`); break;
      case 'acOn': lines.push(`SF.A.acOn(tl, ${q(pr)}, ${t});`); break;
      case 'acOff': lines.push(`SF.A.acOff(tl, ${q(pr)}, ${t});`); break;
      case 'panelsOn': lines.push(`tl.fromTo('#${pr}-panels', { opacity: 0, y: -40 }, { opacity: 1, y: 0, duration: 0.5, ease: "bounce.out" }, ${t});`); sfx.push(['pop.mp3', t, 0.22, 0.7]); break;
      case 'lightsOn': lines.push(`SF.A.lightsOn(tl, ${J((b.ids || []).map((x) => `#${pr}-${x}`))}, ${t});`); break;
      case 'shakeScreen': lines.push(`SF.A.shakeScreen(tl, '#${id} .stage', ${t});`); break;
      case 'flash': lines.push(`SF.A.flash(tl, '#${id}_flash', ${t});`); sfx.push(['whoosh-short.mp3', t, 0.2, 0.6]); break;
      case 'bob': lines.push(`SF.A.bob(tl, ${el || `'#${pr}'`}, ${t}, ${b.dur || 2});`); break;
      // meme reactions (docs/viral-playbook-2026-11-12.md): exaggerated face, comic symbol, camera punch-in, focus lines
      case 'face': lines.push(`SF.A.face(tl, ${who}, ${t}, ${q(b.as || b.kind || 'shock')}, ${b.hold == null ? 1.4 : b.hold});`); if ((b.as || b.kind) !== 'dead' && (b.as || b.kind) !== 'smug') sfx.push(['pop.mp3', t, 0.24, 0.7]); break;
      case 'emote': lines.push(`SF.A.emote(tl, '#${id}_em${(s.beats || []).indexOf(b)}', ${t}, ${b.hold || 1.2});`); sfx.push(['pop.mp3', t, 0.16, 0.7]); break;
      case 'zoomTo': { const [fx, fy] = b.who ? facePt(b.who) : [b.x || 540, b.y || 900]; lines.push(`SF.A.zoomTo(tl, '#${id}_cam', ${t}, ${fx}, ${fy}, ${b.scale || 1.5}, ${b.hold == null ? 1.2 : b.hold});`); sfx.push(['whoosh-short.mp3', t, 0.2, 0.6]); break; }
      case 'impact': lines.push(`SF.A.impact(tl, '#${id}_im${(s.beats || []).indexOf(b)}', ${t}, ${b.dur || 0.7});`); sfx.push(['impact-bass-1.mp3', t, 0.32, 1.2]); break;
      default: throw new Error('unknown beat ' + b.do);
    }
  }
  if (s.push !== false) lines.push(`SF.A.push(tl, '#${id} .stage', ${w[0]}, ${(w[1] - w[0]).toFixed(2)}, ${s.push || 1.035});`);
  // lip-sync: a character with speaks: true (or the scene's speaker) moves its mouth on every narrated word of this scene
  const speakers = (s.chars || []).filter((c) => c.speaks || s.speaker === c.id);
  if (speakers.length) {
    const words = s.sentIdx.flatMap((k) => ctx.wt[k] || []).map(([a, b]) => [+(+a).toFixed(2), +(+b).toFixed(2)]);
    speakers.forEach((c) => lines.push(`SF.A.lipsync(tl, ${P(c.id)}, ${J(words)});`));
  }
  if (art2) {
    // idle life for every character (v1 characters are skipped inside SF.A.idle) and a slower push on the backdrop = parallax
    (s.chars || []).forEach((c, k) => lines.push(`SF.A.idle(tl, ${P(c.id)}, ${w[0]}, ${w[1]}, ${i * 7 + k + 1});`));
    if (bd && s.push !== false) lines.push(`SF.A.push(tl, '#${id} .backdrop', ${w[0]}, ${(w[1] - w[0]).toFixed(2)}, 1.012);`);
  }
  return { css, html, js: lines.join('\n'), sfx, assets };
}

// ---------------------------------------------------------------- TITLE (giant kinetic words = pattern interrupt)
function title(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme, sent = s.sentIdx[0];
  const text = ctx.sentences[sent].text, ws = text.trim().split(/\s+/);
  const bg = s.bg === 'dark' ? th.dark : s.bg === 'light' ? th.light : th.accent;
  const fg = s.bg === 'light' ? th.ink : '#ffffff', hi = s.bg === 'light' ? th.accent : th.accent2;
  const css = `#${id} { background: ${bg}; }
#${id} .ttl { position: absolute; left: 60px; right: 60px; top: ${s.top || 560}px; text-align: center; direction: ${(ctx.job.lang || 'ar') === 'ar' ? 'rtl' : 'ltr'}; font-size: ${s.size || 112}px; line-height: 1.22; font-weight: 900; color: ${fg}; text-wrap: balance; }
#${id} .ttl .tw { display: inline-block; opacity: .55; margin: 0 .06em; }
#${id} .sub { position: absolute; left: 60px; right: 60px; top: ${(s.top || 560) + 520}px; text-align: center; font-size: 46px; font-weight: 800; color: ${hi}; direction: ${(ctx.job.lang || 'ar') === 'ar' ? 'rtl' : 'ltr'}; opacity: 0; }
#${id} .ring { position: absolute; left: 540px; top: 900px; width: 1400px; height: 1400px; margin: -700px 0 0 -700px; border-radius: 50%; border: 40px solid rgba(255,255,255,.07); }`;
  const html = `<section id="${id}" class="scene title"><div class="ring" data-layout-allow-overflow="true"></div><p class="ttl" data-layout-allow-overlap="true">${ws.map((x, k) => `<span class="tw" id="${id}_t${k}">${esc(x)}</span>`).join(' ')}</p>${s.sub ? `<div class="sub" id="${id}_sub">${esc(s.sub)}</div>` : ''}</section>`;
  const wt = ctx.wt[sent];
  const key = ctx.keyIdx[sent];
  // every word is ghosted (opacity .3) from frame 0 so the hook reads on the thumbnail; each word punches to full when spoken
  const js = ws.map((_, k) => { const t = Math.max(w[0], (wt[k] || [w[0]])[0] - 0.05); return `tl.fromTo('#${id}_t${k}', { opacity: 0.55, scale: 1 }, { opacity: 1, scale: 1.08, duration: 0.14, ease: "power2.out", immediateRender: false, overwrite: "auto" }, ${t.toFixed(2)});\ntl.to('#${id}_t${k}', { scale: 1, duration: 0.16, ease: "power2.in" }, ${(t + 0.14).toFixed(2)});`; }).join('\n')
    + (key >= 0 ? `\ntl.to('#${id}_t${key}', { color: ${q(hi)}, scale: 1.12, duration: 0.2, overwrite: "auto" }, ${(wt[key] || [w[0]])[0].toFixed(2)});` : '')
    + (s.sub ? `\ntl.fromTo('#${id}_sub', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3 }, ${(w[0] + (w[1] - w[0]) * 0.55).toFixed(2)});` : '')
    + `\ntl.fromTo('#${id} .ring', { scale: 0.6, rotation: 0 }, { scale: 1.1, rotation: 25, duration: ${(w[1] - w[0]).toFixed(2)}, ease: "none" }, ${w[0]});`;
  return { css, html, js, sfx: [['whoosh-short.mp3', w[0], 0.25, 0.6]], noCaption: true };
}

// ---------------------------------------------------------------- QUIZ
function quiz(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme;
  const dark = s.bg !== 'light';
  const css = `#${id} { background: ${dark ? `radial-gradient(1000px 900px at 50% 30%, #2a2213 0%, ${th.dark} 75%)` : th.light}; }
#${id} .qq { position: absolute; left: 0; right: 0; top: ${s.top || 520}px; text-align: center; font-size: 110px; font-weight: 900; color: ${dark ? '#f3ead7' : th.ink}; direction: rtl; }
#${id} .opt { position: absolute; left: 140px; width: 800px; height: 140px; border-radius: 70px; background: ${dark ? 'rgba(243,234,215,.08)' : '#ffffff'}; border: 4px solid ${th.accent2}; display: flex; align-items: center; justify-content: space-between; padding: 0 56px; direction: rtl; font-size: 60px; font-weight: 800; color: ${dark ? '#f3ead7' : th.ink}; opacity: 0; }
#${id} .opt i { width: 56px; height: 56px; border-radius: 50%; border: 5px solid ${th.accent2}; }
#${id} .cbub { position: absolute; left: 0; right: 0; margin: 0 auto; width: fit-content; top: ${(s.top || 520) + 760}px; padding: 16px 36px; border-radius: 34px; background: ${th.accent2}; color: ${th.ink}; font-size: 42px; font-weight: 800; direction: rtl; opacity: 0; }
#${id} .tap { position: absolute; width: 90px; height: 90px; margin: -45px 0 0 -45px; border-radius: 50%; border: 5px solid ${th.accent2}; background: rgba(230,200,121,.3); opacity: 0; }`;
  const opts = s.options || [];
  const top0 = (s.top || 520) + 200;
  const html = `<section id="${id}" class="scene quiz"><div class="qq">${esc(s.q || '')}</div>${opts.map((o, k) => `<div class="opt" id="${id}_o${k}" style="top:${top0 + k * 180}px"><span>${esc(o)}</span><i id="${id}_c${k}"></i></div>`).join('')}${s.comment ? `<div class="cbub" id="${id}_cb">${esc(s.comment)}</div>` : ''}<div class="tap" id="${id}_tap" style="left:280px;top:${top0 + (s.pick || 0) * 180 + 70}px"></div></section>`;
  const span = w[1] - w[0], step = Math.min(0.5, span / (opts.length + 3));
  const tPick = w[0] + step * (opts.length + 1);
  const js = `tl.fromTo('#${id} .qq', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${w[0]});\n` + opts.map((_, k) => `tl.fromTo('#${id}_o${k}', { opacity: 0, x: 200 }, { opacity: 1, x: 0, duration: 0.32, ease: "back.out(1.8)" }, ${(w[0] + step * (k + 0.6)).toFixed(2)});`).join('\n')
    + (s.pick != null ? `\ntl.fromTo('#${id}_tap', { opacity: 0.95, scale: 0.3 }, { opacity: 0, scale: 1.6, duration: 0.5, ease: "power2.out", immediateRender: false }, ${tPick.toFixed(2)});\ntl.to('#${id}_o${s.pick}', { background: ${q(th.accent2)}, color: ${q(th.ink)}, duration: 0.15 }, ${tPick.toFixed(2)});\ntl.to('#${id}_c${s.pick}', { background: ${q(th.ink)}, duration: 0.15 }, ${tPick.toFixed(2)});` : '')
    + (s.comment ? `\ntl.fromTo('#${id}_cb', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: "back.out(2)" }, ${(tPick + 0.2).toFixed(2)});` : '');
  const sfx = opts.map((_, k) => ['pop.mp3', w[0] + step * (k + 0.6), 0.22, 0.7]); if (s.pick != null) sfx.push(['click-soft.mp3', tPick, 0.4, 0.4]);
  return { css, html, js, sfx };
}

// ---------------------------------------------------------------- MEDIA (official image/video with ken burns)
function media(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme;
  const src = ctx.client.assets[s.src] || s.src, isVid = /\.(mp4|mov|webm)$/i.test(src), file = `m_${id}${src.slice(src.lastIndexOf('.'))}`;
  const frame = s.frame || 'full';
  const light = s.bg === 'light' || s.shade === false;
  const showShade = frame === 'full' && s.shade !== false;
  const css = `#${id} { background: ${light ? (th.paper || '#ffffff') : th.dark}; }
#${id} .mwrap { position: absolute; ${frame === 'circle' ? 'left: 190px; top: 560px; width: 700px; height: 700px; border-radius: 50%; border: 8px solid ' + th.accent + '; box-shadow: 0 0 0 14px rgba(230,200,121,.3);' : frame === 'card' ? 'left: 60px; right: 60px; top: 580px; height: 680px; border-radius: 36px; background: #0c121d; border: 4px solid ' + th.accent2 + '; box-shadow: 0 30px 80px rgba(0,0,0,.7); display: flex; align-items: center; justify-content: center; padding: 20px;' : 'inset: 0;'} overflow: hidden; }
#${id} .mwrap img, #${id} .mwrap video { width: 100%; height: 100%; object-fit: ${frame === 'card' ? 'contain' : 'cover'}; }
${showShade ? `#${id} .shade { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(8,7,6,.55) 0%, rgba(8,7,6,0) 28%, rgba(8,7,6,0) 55%, rgba(8,7,6,.9) 85%); }` : ''}`;
  const dS = (w[1] - w[0] + 0.1).toFixed(2);
  const inner = isVid ? `<video id="${id}_v" src="assets/${file}" muted playsinline data-start="${w[0]}" data-duration="${dS}" data-playback-rate="${s.rate || 1}" data-track-index="${30 + i}"></video>` : `<img id="${id}_v" src="assets/${file}" alt="" />`;
  const html = `<section id="${id}" class="scene media"><div class="mwrap" data-layout-allow-overflow="true">${inner}</div>${showShade ? '<div class="shade"></div>' : ''}</section>`;
  const js = `tl.fromTo('#${id}_v', { scale: 1.0 }, { scale: ${s.zoom || 1.12}, duration: ${dS}, ease: "none" }, ${w[0]});`;
  return { css, html, js, sfx: [], assets: [{ src: abs(src), dst: file }], captionTheme: light ? 'light' : 'dark' };
}

// ---------------------------------------------------------------- PHONE (shared across a group of consecutive phone scenes)
function phoneGroup(scenes, ctx, reel) {
  const th = ctx.theme, g = scenes[0], id = `ph_${g.group || 'p'}`;
  const W0 = scenes[0].w[0], W1 = scenes[scenes.length - 1].w[1];
  const side = resolveCast(g.side);
  const css = `#${id}_bg { position: absolute; inset: 0; background: ${g.bg === 'dark' ? `radial-gradient(1000px 800px at 78% 16%, rgba(212,175,90,.15), transparent 65%), linear-gradient(170deg, #1c170d 0%, ${th.dark} 70%)` : `radial-gradient(1100px 900px at 50% 40%, #fdf8ee 0%, ${th.light} 100%)`}; opacity: 0; }
#${id} { position: absolute; left: ${side ? 430 : 291}px; top: 450px; width: 498px; height: 1045px; border-radius: 72px; background: linear-gradient(145deg, #3a3f46, #0b0d10); box-shadow: 0 40px 90px rgba(31,35,40,.35), inset 0 0 0 2px ${th.accent2}; z-index: 20; opacity: 0; }
#${id} .scr { position: absolute; left: 14px; top: 14px; width: 470px; height: 1017px; border-radius: 58px; overflow: hidden; background: #000; }
#${id} .scr { position: absolute; left: 14px; top: 14px; width: 470px; height: 1017px; border-radius: 58px; overflow: hidden; background: ${th.dark || '#0b140e'}; }
#${id} .zoom { position: absolute; inset: 0; } #${id} video { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
#${id} .ripple { position: absolute; width: 74px; height: 74px; margin: -37px 0 0 -37px; border-radius: 50%; border: 4px solid ${th.accent2}; background: rgba(255,255,255,.3); opacity: 0; }
#${id} .scanline { position: absolute; left: 0; right: 0; top: 0; height: 6px; background: linear-gradient(90deg, transparent, #ecd18a, transparent); box-shadow: 0 0 40px 12px rgba(236,209,138,.55); opacity: 0; }
.pill { position: absolute; top: 1535px; left: 40px; right: 40px; height: 84px; z-index: 30; opacity: 0; display: flex; justify-content: center; }
.pill div { display: flex; align-items: center; gap: 18px; direction: rtl; height: 84px; padding: 0 34px 0 40px; border-radius: 42px; background: ${th.accent}; color: #fff; font-size: 42px; font-weight: 800; box-shadow: 0 12px 0 rgba(31,35,40,.12); white-space: nowrap; }
.pill i { width: 50px; height: 50px; border-radius: 50%; background: ${th.accent2}; color: ${th.ink}; font-size: 30px; font-weight: 900; display: grid; place-items: center; direction: ltr; font-style: normal; }`;
  const DEMO = +(W0 + 0.15).toFixed(2);
  const ripples = reel.taps.map((t, k) => `<i class="ripple" id="${id}_r${k}" style="left:${(t[1] / 390 * 470).toFixed(0)}px;top:${(t[2] / 844 * 1017).toFixed(0)}px"></i>`).join('');
  let html = `<div id="${id}_bg"></div>`;
  if (side) html += `<svg class="stage" id="${id}_side" viewBox="0 0 1080 1920" style="opacity:0;z-index:19"><g transform="translate(${side.x || 210},1500) scale(${side.scale || 0.62})"><g id="${id}_m"><g id="${id}_mf" data-char="${side.type}" data-cid="${id}_m" data-opts='${J(side.opts || {})}'></g></g></g></svg>`;
  html += `<div id="${id}"><div class="scr"><div class="zoom"><video id="${id}_vid" src="assets/${id}.mp4" muted playsinline data-start="${DEMO}" data-duration="${(reel.dur + 1.2).toFixed(2)}" data-track-index="2"></video>${ripples}<div class="scanline" id="${id}_scan"></div></div></div></div>`;
  let n = 0; const pills = scenes.map((s) => (s.pill ? `<div class="pill" id="${id}_pill${s.idx}"><div><i>${++n}</i><span>${esc(s.pill)}</span></div></div>` : '')).join('');
  html += pills;
  const out = `${id}_out`;
  let js = `tl.fromTo('#${id}_bg', { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${(W0 - 0.05).toFixed(2)});\ntl.fromTo('#${id}', { opacity: 0, y: 80, scale: 0.96 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }, ${(W0 + 0.05).toFixed(2)});\n`;
  if (side) js += `tl.fromTo('#${id}_side', { opacity: 0 }, { opacity: 1, duration: 0.3 }, ${(W0 + 0.15).toFixed(2)});\nSF.A.enter(tl, '#${id}_m', ${(W0 + 0.15).toFixed(2)}, 'left', 400, 0.6);\n`;
  scenes.forEach((s) => {
    if (s.pill) { js += `tl.fromTo('#${id}_pill${s.idx}', { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.3, ease: "power3.out" }, ${(s.w[0] + 0.15).toFixed(2)});\ntl.to('#${id}_pill${s.idx}', { opacity: 0, y: -12, duration: 0.2 }, ${(s.w[1] - 0.12).toFixed(2)});\n`; }
    if (side) js += `SF.A.nod(tl, '#${id}_m', ${(s.w[0] + 0.4).toFixed(2)});\nSF.A.blink(tl, '#${id}_m', ${(s.w[0] + 1.6).toFixed(2)});\n`;
    if (s.scan) { const st = s.w[0] + (s.w[1] - s.w[0]) * (s.scanAt || 0) + 0.2; js += `tl.fromTo('#${id}_scan', { y: 0, opacity: 1 }, { y: 1000, opacity: 1, duration: 1.1, yoyo: true, repeat: 1, ease: "power1.inOut", immediateRender: false }, ${st.toFixed(2)});\ntl.set('#${id}_scan', { opacity: 0 }, ${(st + 2.3).toFixed(2)});\n`; }
  });
  js += reel.taps.map((t, k) => `tl.fromTo('#${id}_r${k}', { scale: 0.25, opacity: 0.95 }, { scale: 1.6, opacity: 0, duration: 0.5, ease: "power2.out", immediateRender: false }, ${(DEMO + t[0]).toFixed(2)});`).join('\n');
  js += `\ntl.to(['#${id}', '#${id}_bg'${side ? `, '#${id}_side'` : ''}], { opacity: 0, duration: 0.25, ease: "power2.in" }, ${(W1 - 0.25).toFixed(2)});`;
  void out;
  const sfx = reel.taps.map((t) => ['click-soft.mp3', DEMO + t[0], 0.25, 0.4]);
  scenes.forEach((s) => { if (s.pill) sfx.push(['pop.mp3', s.w[0] + 0.15, 0.18, 0.7]); });
  return { css, html, js, sfx, assets: [{ src: reel.file, dst: `${id}.mp4` }], DEMO, captionTheme: g.bg === 'dark' ? 'dark' : 'light' };
}

// ---------------------------------------------------------------- CTA
function cta(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme, c = ctx.client;
  resolveCast(s.char);
  const dark = s.bg === 'dark';
  const css = `#${id} { background: ${dark ? `radial-gradient(1000px 900px at 50% 40%, #2b2418 0%, ${th.dark} 75%)` : `radial-gradient(1100px 900px at 50% 40%, #fdf8ee 0%, ${th.light} 100%)`}; }
#${id} .brandbig { position: absolute; left: 0; right: 0; top: ${s.char || s.product ? 560 : 640}px; text-align: center; direction: ltr; font-size: 110px; font-weight: 900; letter-spacing: 10px; color: ${dark ? th.accent2 : th.accent}; }
#${id} .cmt { position: absolute; left: 0; right: 0; margin: 0 auto; width: fit-content; top: ${s.char ? 760 : (s.product ? 780 : 860)}px; padding: 16px 38px; border-radius: 34px; background: ${th.accent2}; border: 5px solid ${th.ink}; font-size: 46px; font-weight: 900; color: ${th.ink}; direction: ${(ctx.job.lang || 'ar') === 'ar' ? 'rtl' : 'ltr'}; opacity: 0; }
#${id} .url { position: absolute; left: 0; right: 0; top: 1545px; text-align: center; direction: ltr; font-size: 52px; font-weight: 900; color: ${dark ? '#f3ead7' : th.accent3}; opacity: 0; }
#${id} .prod { position: absolute; left: ${s.char ? 600 : 350}px; top: ${s.char ? 900 : 1010}px; width: 380px; height: 380px; border-radius: 50%; overflow: hidden; border: 7px solid ${th.accent}; opacity: 0; }
#${id} .prod img { width: 100%; height: 100%; object-fit: cover; }
#${id} .ground { position: absolute; left: 0; right: 0; top: 1500px; height: 4px; background: #d9c7a3; }`;
  let html = `<section id="${id}" class="scene cta"><div class="brandbig">${esc(c.brand)}</div>`;
  if (s.comment) html += `<div class="cmt" id="${id}_cmt">${esc(s.comment)}</div>`;
  const assets = [];
  if (s.product) { const src = c.assets[s.product] || s.product; const f = `cta_${id}${src.slice(src.lastIndexOf('.'))}`; assets.push({ src: abs(src), dst: f }); html += `<div class="prod" id="${id}_prod"><img src="assets/${f}" alt="" /></div>`; }
  if (s.char) html += `<div class="ground"></div><svg class="stage" viewBox="0 0 1080 1920"><g transform="translate(${s.char.x || 300},1500)"><g id="${id}_c"><g id="${id}_cf" data-char="${s.char.type}" data-cid="${id}_c" data-opts='${J(s.char.opts || {})}'></g></g></g></svg>`;
  if (c.url && s.url !== false) html += `<div class="url" id="${id}_url">${esc(c.url)}</div>`;
  html += `</section>`;
  let js = `tl.fromTo('#${id} .brandbig', { opacity: 0, y: 30, scale: 0.94 }, { opacity: 1, y: 0, scale: 1, duration: 0.45, ease: "power3.out" }, ${w[0]});\n`;
  if (s.comment) js += `tl.fromTo('#${id}_cmt', { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.2)" }, ${(w[0] + 0.5).toFixed(2)});\ntl.to('#${id}_cmt', { scale: 1.06, duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" }, ${(w[0] + 1.0).toFixed(2)});\n`;
  if (s.product) js += `tl.fromTo('#${id}_prod', { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.6)" }, ${(w[0] + 0.3).toFixed(2)});\n`;
  if (s.char) js += `SF.A.enter(tl, '#${id}_c', ${w[0]}, 'left', 420, 0.6);\nSF.A.wave(tl, '#${id}_c', ${(w[0] + 0.8).toFixed(2)}, 1.4);\nSF.A.smile(tl, '#${id}_c', ${(w[0] + 0.8).toFixed(2)});\n`;
  if (c.url && s.url !== false) js += `tl.fromTo('#${id}_url', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, ${(w[0] + 0.7).toFixed(2)});\n`;
  return { css, html, js, sfx: [['chime.mp3', w[0], 0.2, 2.5], ...(s.comment ? [['pop.mp3', w[0] + 0.5, 0.25, 0.7]] : [])], assets, captionTheme: dark ? 'dark' : 'light' };
}

// ---------------------------------------------------------------- LIQUID GOLD (WebGL shader)
function liquid(s, i, w, ctx) {
  const id = s.id || `s${i}`;
  const css = `#${id} { background: #0c0b09; } #${id} canvas { position: absolute; inset: 0; width: 1080px; height: 1920px; }`;
  const html = `<section id="${id}" class="scene liquid"><canvas id="${id}_gl" width="1080" height="1920"></canvas></section>`;
  const form = +(w[0] + (w[1] - w[0]) * (s.formAt || 0.35)).toFixed(2);
  const js = `(function(){ const cv = document.getElementById('${id}_gl'); const gl = cv.getContext('webgl', { preserveDrawingBuffer: true });
const VS = "attribute vec2 p; varying vec2 uv; void main(){ uv = p * 0.5 + 0.5; gl_Position = vec4(p, 0., 1.); }";
const FS = "precision highp float; varying vec2 uv; uniform float uT, uForm, uShine; uniform sampler2D uTex; uniform vec2 uRes;" +
"float h21(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }" +
"float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f); return mix(mix(h21(i), h21(i+vec2(1,0)), f.x), mix(h21(i+vec2(0,1)), h21(i+vec2(1,1)), f.x), f.y); }" +
"float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++){ v += a * noise(p); p = p * 2.03 + 11.7; a *= .5; } return v; }" +
"float field(vec2 q){ vec2 w = vec2(fbm(q * 1.6 + uT * .25), fbm(q * 1.6 - uT * .2 + 5.2)); float liquid = fbm(q * 2.2 + w * 2.4 + vec2(0., uT * .35)); float txt = texture2D(uTex, vec2(q.x / (uRes.x/uRes.y) * 0.5 + 0.5, q.y * 0.5 + 0.5)).r; return mix(liquid, txt * .85 + liquid * .18, uForm); }" +
"void main(){ vec2 q = (uv * 2. - 1.); q.x *= uRes.x / uRes.y; float e = 2. / uRes.y; float h = field(q), hx = field(q + vec2(e, 0.)), hy = field(q + vec2(0., e));" +
"vec3 n = normalize(vec3((h - hx) * 60., (h - hy) * 60., 1.)); vec3 L = normalize(vec3(-.4, .6, .7)); float diff = max(dot(n, L), 0.); float spec = pow(max(dot(reflect(-L, n), vec3(0.,0.,1.)), 0.), 40.); float env = .5 + .5 * n.y;" +
"vec3 col = mix(vec3(.12,.08,.03), vec3(.72,.52,.18), smoothstep(.15, .9, diff * .8 + env * .5)); col = mix(col, vec3(1.,.9,.62), smoothstep(.55, 1., env * diff + spec * 1.2)); col += spec * vec3(1.,.95,.8) * (1. + uShine);" +
"float mask = mix(1., smoothstep(.28, .55, h), uForm); col *= mix(.12, 1., mask); float vig = smoothstep(1.6, .3, length(q * vec2(.9, .7))); gl_FragColor = vec4(col * vig, 1.); }";
const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); return o; };
const pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr); gl.useProgram(pr);
const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
const loc = gl.getAttribLocation(pr, "p"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
const U = (k) => gl.getUniformLocation(pr, k); const tc = document.createElement("canvas"); tc.width = 1080; tc.height = 1920; const tx = tc.getContext("2d"); const tex = gl.createTexture();
function buildText(){ tx.fillStyle = "#000"; tx.fillRect(0, 0, 1080, 1920); tx.filter = "blur(14px)"; tx.fillStyle = "#fff"; tx.textAlign = "center"; tx.textBaseline = "middle"; tx.font = "900 ${s.size || 240}px Cairo, sans-serif"; tx.direction = "rtl"; tx.fillText(${q(s.text || ctx.client.brand_ar)}, 540, 820); ${s.sub ? `tx.font = "900 92px Cairo, sans-serif"; tx.direction = "ltr"; tx.fillText(${q(s.sub)}, 540, 1060);` : ''} gl.bindTexture(gl.TEXTURE_2D, tex); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tc); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); }
const S = { form: 0, shine: 0 }; let built = false;
function draw(){ if (!built) { buildText(); built = true; } gl.viewport(0, 0, 1080, 1920); gl.uniform1f(U("uT"), tl.time()); gl.uniform1f(U("uForm"), S.form); gl.uniform1f(U("uShine"), S.shine); gl.uniform2f(U("uRes"), 1080, 1920); gl.uniform1i(U("uTex"), 0); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); }
document.fonts.ready.then(() => { built = false; draw(); });
FRAME_HOOKS.push(draw);
tl.fromTo(S, { form: 0 }, { form: 1, duration: ${Math.max(1.2, Math.min(2.0, (w[1] - form) * 0.6)).toFixed(2)}, ease: "power2.inOut" }, ${form});
tl.fromTo(S, { shine: 0 }, { shine: 2.5, duration: 0.5, yoyo: true, repeat: 1, ease: "sine.inOut" }, ${(form + 1.9).toFixed(2)}); })();`;
  return { css, html, js, sfx: [['whoosh-cinematic.mp3', form - 0.2, 0.25, 1.6], ['sparkle.mp3', form + 1.9, 0.3, 1.8]], captionTheme: 'dark', captionPos: 'bottom', webgl: true };
}

// ---------------------------------------------------------------- MICROSCOPE (photo dive into a living cell field)
function microscope(s, i, w, ctx) {
  const id = s.id || `s${i}`; const src = ctx.client.assets[s.image] || s.image, file = `mic_${id}${src.slice(src.lastIndexOf('.'))}`;
  const [fx, fy] = s.focus || [711, 881];
  const css = `#${id} { background: #140c07; } #${id} img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; transform-origin: ${fx}px ${fy}px; }
#${id} canvas { position: absolute; inset: 0; width: 1080px; height: 1920px; opacity: 0; }
#${id} .lab { position: absolute; padding: 8px 22px; border-radius: 22px; background: rgba(12,11,9,.85); border: 2px solid #d4af5a; color: #ecd18a; font-size: 36px; font-weight: 800; direction: rtl; opacity: 0; }`;
  const labs = (s.labels || []).map((l, k) => `<div class="lab" id="${id}_l${k}" style="left:${[120, 620, 360][k % 3]}px;top:${[1240, 1330, 1460][k % 3]}px">${esc(l)}</div>`).join('');
  const html = `<section id="${id}" class="scene microscope"><img id="${id}_img" src="assets/${file}" alt="" /><canvas id="${id}_cv" width="1080" height="1920"></canvas>${labs}</section>`;
  const dive = +(w[0] + (w[1] - w[0]) * 0.42).toFixed(2);
  const js = `(function(){ let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const C = Array.from({ length: 46 }, () => ({ x: rnd() * 1300 - 110, y: rnd() * 2200 - 140, r: 90 + rnd() * 120, ph: rnd() * 6.28, sp: 0.4 + rnd() * 0.8 }));
const D = Array.from({ length: 70 }, () => ({ x: rnd() * 1080, y: rnd() * 1920, r: 3 + rnd() * 9, ph: rnd() * 6.28, z: 0.3 + rnd() }));
const cv = document.getElementById('${id}_cv'), cx = cv.getContext('2d'); const P = { zoom: 2.2 };
function draw(){ const t = tl.time(), z = P.zoom; cx.clearRect(0, 0, 1080, 1920); const g = cx.createRadialGradient(540, 960, 100, 540, 960, 1200); g.addColorStop(0, '#5a3b22'); g.addColorStop(1, '#140c07'); cx.fillStyle = g; cx.fillRect(0, 0, 1080, 1920);
cx.save(); cx.translate(540, 960); cx.scale(z, z); cx.translate(-540, -960);
for (const c of C) { cx.beginPath(); for (let k = 0; k <= 40; k++) { const a = k / 40 * 6.283; const rr = c.r * (1 + 0.08 * Math.sin(a * 3 + t * c.sp + c.ph) + 0.05 * Math.sin(a * 5 - t * 0.7)); const px = c.x + Math.cos(a) * rr, py = c.y + Math.sin(a) * rr * 0.86; k ? cx.lineTo(px, py) : cx.moveTo(px, py); }
const cg = cx.createRadialGradient(c.x - c.r * 0.3, c.y - c.r * 0.3, 10, c.x, c.y, c.r); cg.addColorStop(0, 'rgba(246,214,170,.55)'); cg.addColorStop(0.7, 'rgba(190,128,78,.35)'); cg.addColorStop(1, 'rgba(120,70,40,.25)'); cx.fillStyle = cg; cx.fill(); cx.lineWidth = 3; cx.strokeStyle = 'rgba(236,209,138,.55)'; cx.stroke();
cx.beginPath(); cx.arc(c.x + 10 * Math.sin(t + c.ph), c.y + 8 * Math.cos(t * 0.8 + c.ph), c.r * 0.16, 0, 6.283); cx.fillStyle = 'rgba(120,60,30,.55)'; cx.fill(); }
cx.restore(); for (const d of D) { const yy = (d.y - t * 40 * d.z + 1920 * 4) % 1920, xx = d.x + 14 * Math.sin(t * d.z + d.ph); cx.beginPath(); cx.arc(xx, yy, d.r * d.z, 0, 6.283); const dg = cx.createRadialGradient(xx - 2, yy - 2, 0, xx, yy, d.r * d.z); dg.addColorStop(0, 'rgba(255,248,225,.95)'); dg.addColorStop(1, 'rgba(236,209,138,.1)'); cx.fillStyle = dg; cx.fill(); } }
FRAME_HOOKS.push(draw);
tl.fromTo('#${id}_img', { scale: 1 }, { scale: 9, duration: ${(dive - w[0]).toFixed(2)}, ease: "power2.in" }, ${w[0]});
tl.fromTo('#${id}_cv', { opacity: 0 }, { opacity: 1, duration: 0.4 }, ${(dive - 0.25).toFixed(2)});
tl.fromTo(P, { zoom: 2.2 }, { zoom: 1.0, duration: ${(w[1] - dive + 0.2).toFixed(2)}, ease: "power2.out" }, ${(dive - 0.25).toFixed(2)});
${(s.labels || []).map((_, k) => `tl.fromTo('#${id}_l${k}', { opacity: 0, y: 20, scale: 0.8 }, { opacity: 1, y: 0, scale: 1, duration: 0.35, ease: "back.out(2)" }, ${(dive + 0.4 + k * 0.45).toFixed(2)});`).join('\n')} })();`;
  return { css, html, js, sfx: [['whoosh-cinematic.mp3', dive - 1.2, 0.3, 1.6], ...(s.labels || []).map((_, k) => ['pop.mp3', dive + 0.4 + k * 0.45, 0.2, 0.7])], assets: [{ src: abs(src), dst: file }], captionTheme: 'dark' };
}

// ---------------------------------------------------------------- JAR3D (three.js product teardown)
function jar3d(s, i, w, ctx) {
  const id = s.id || `s${i}`, th = ctx.theme;
  const css = `#${id} { background: radial-gradient(900px 900px at 50% 52%, #3a2c16 0%, #120e08 60%, #070605 100%); } #${id} canvas { position: absolute; inset: 0; width: 1080px; height: 1920px; }
#${id} .lay { position: absolute; left: 40px; display: flex; align-items: center; gap: 14px; direction: rtl; opacity: 0; }
#${id} .lay b { padding: 12px 30px; border-radius: 30px; background: rgba(12,11,9,.9); border: 3px solid ${th.accent}; color: ${th.accent2}; font-size: 50px; font-weight: 900; }`;
  const labs = (s.labels || []).map((l, k) => `<div class="lay" id="${id}_y${k}" style="top:${[640, 900, 1240][k % 3]}px"><b>${esc(l)}</b></div>`).join('');
  const html = `<section id="${id}" class="scene jar3d"><canvas id="${id}_gl" width="1080" height="1920"></canvas>${labs}</section>`;
  const open = +(w[0] + (w[1] - w[0]) * 0.22).toFixed(2), close = +(w[1] - 0.9).toFixed(2);
  const moduleJs = `import * as THREE from "three"; import { RoomEnvironment } from "./assets/RoomEnvironment.js";
(function(){ const tl = window.__timelines["main"]; const canvas = document.getElementById("${id}_gl");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, preserveDrawingBuffer: true }); renderer.setPixelRatio(1); renderer.setSize(1080, 1920, false); renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.1;
const scene = new THREE.Scene(); const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
const camera = new THREE.PerspectiveCamera(30, 1080 / 1920, 0.1, 100);
const key = new THREE.DirectionalLight(0xfff1d6, 2.2); key.position.set(3, 5, 6); scene.add(key); const rim = new THREE.DirectionalLight(0xffc56b, 2.5); rim.position.set(-5, 2, -4); scene.add(rim);
const gold = new THREE.MeshPhysicalMaterial({ color: 0xd4af5a, metalness: 1, roughness: 0.22, clearcoat: 0.4 }); const black = new THREE.MeshPhysicalMaterial({ color: 0x0d0b08, metalness: 0.2, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.08 }); const cream = new THREE.MeshPhysicalMaterial({ color: 0xf5ead6, roughness: 0.45, sheen: 1, sheenColor: new THREE.Color(0xffe8c0) });
const lathe = (pts, mat) => new THREE.Mesh(new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 96), mat);
const jar = new THREE.Group(); scene.add(jar);
const body = lathe([[0, -1.1], [1.35, -1.1], [1.5, -1.0], [1.55, -0.6], [1.55, 0.55], [1.48, 0.7], [1.3, 0.72], [1.3, 0.62], [0, 0.62]], black); jar.add(body);
const ring = new THREE.Mesh(new THREE.TorusGeometry(1.52, 0.05, 24, 120), gold); ring.rotation.x = Math.PI / 2; ring.position.y = 0.55; body.add(ring);
const lc = document.createElement("canvas"); lc.width = 2048; lc.height = 256; const lx = lc.getContext("2d"); lx.fillStyle = "#e6c879"; lx.font = "900 120px Cairo, sans-serif"; lx.textAlign = "center"; lx.textBaseline = "middle"; lx.fillText(${q(ctx.client.brand)}, 512, 128); lx.fillText(${q(ctx.client.brand)}, 1536, 128);
const ltex = new THREE.CanvasTexture(lc); ltex.colorSpace = THREE.SRGBColorSpace; const label = new THREE.Mesh(new THREE.CylinderGeometry(1.565, 1.565, 0.5, 96, 1, true), new THREE.MeshPhysicalMaterial({ map: ltex, transparent: true, metalness: 0.8, roughness: 0.3 })); label.position.y = -0.15; body.add(label);
const creamM = lathe([[0, 0.95], [0.5, 0.92], [0.95, 0.82], [1.25, 0.66], [1.28, 0.6], [0, 0.6]], cream); jar.add(creamM); const sw = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.07, 16, 80), cream); sw.rotation.x = Math.PI / 2; sw.position.y = 0.96; creamM.add(sw);
const lid = lathe([[0, 1.55], [1.2, 1.55], [1.45, 1.5], [1.6, 1.35], [1.62, 0.8], [1.5, 0.75], [0, 0.75]], gold); jar.add(lid);
const drops = []; let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
for (let k = 0; k < 26; k++) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05 + rnd() * 0.09, 24, 16), gold); m.userData = { a: rnd() * 6.28, r: 2.0 + rnd() * 1.6, y: -2 + rnd() * 4.5, s: 0.3 + rnd() * 0.5 }; scene.add(m); drops.push(m); }
const S = { open: 0, spin: -0.6, cam: 0 };
function render(){ const t = tl.time(); if (t < ${w[0] - 0.3} || t > ${w[1] + 0.3}) return; const o = S.open; jar.rotation.y = S.spin; jar.rotation.x = 0.22; lid.position.y = o * 1.9; lid.rotation.z = o * 0.25; creamM.position.y = o * 1.1; body.position.y = -o * 1.1;
for (const m of drops) { const u = m.userData; const a = u.a + t * u.s; m.position.set(Math.cos(a) * u.r, u.y + Math.sin(t * 0.8 + u.a) * 0.2, Math.sin(a) * u.r - 1); }
camera.position.set(Math.sin(S.cam) * 1.0, 0.8 + S.cam * 0.3, 16 - S.cam * 1.2); camera.lookAt(0, 0.75, 0); renderer.render(scene, camera); }
window.FRAME_HOOKS.push(render);
tl.fromTo(S, { spin: -0.6 }, { spin: Math.PI * 2 - 0.6, duration: ${(w[1] - w[0]).toFixed(2)}, ease: "none" }, ${w[0]});
tl.fromTo(S, { cam: 0 }, { cam: 0.6, duration: ${(w[1] - w[0]).toFixed(2)}, ease: "sine.inOut" }, ${w[0]});
tl.fromTo(S, { open: 0 }, { open: 1, duration: 0.9, ease: "back.out(1.4)" }, ${open}); tl.to(S, { open: 0, duration: 0.6, ease: "power3.inOut" }, ${close});
${(s.labels || []).map((_, k) => `tl.fromTo('#${id}_y${k}', { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(2)" }, ${(open + 0.6 + k * ((close - open - 0.8) / Math.max(1, (s.labels || []).length))).toFixed(2)}); tl.to('#${id}_y${k}', { opacity: 0, duration: 0.2 }, ${close});`).join('\n')}
tl.seek(tl.time()); render(); })();`;
  const sfx = [['whoosh-cinematic.mp3', open - 0.3, 0.28, 1.6], ['whoosh-short.mp3', close - 0.1, 0.3, 0.6]];
  return { css, html, js: '', moduleJs, sfx, captionTheme: 'dark', webgl: true, three: true };
}

module.exports = { TYPES: { stage, title, quiz, media, cta, liquid, microscope, jar3d }, phoneGroup, timeOf, esc };
