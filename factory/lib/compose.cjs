// Assembles one HyperFrames composition from a job: scenes, karaoke captions, voice, SFX, wipes, label.
// Frame 0 always shows the hook scene (no fade from black) because the first frame is the thumbnail and the hook.
const { ROOT, fs, r2, abs } = require('./util.cjs');
const { TYPES, phoneGroup, esc } = require('./scenes.cjs');

function planTimes({ sentences, voice, O, scenes, tail = 1.3 }) {
  const roles = sentences.map((s) => s.role), N = sentences.length;
  const cuts = voice.cuts.map((c) => r2(O + c)), END = r2(O + voice.D + tail);
  const win = (i) => [i === 0 ? 0 : cuts[i - 1], i === N - 1 ? END : cuts[i]];
  const seen = new Set();
  scenes.forEach((s, idx) => {
    s.idx = idx; s.sentIdx = (s.say || []).map((r) => { const k = roles.indexOf(r); if (k < 0) throw new Error(`scene ${idx} says unknown role ${r}`); seen.add(k); return k; });
    if (!s.sentIdx.length) throw new Error(`scene ${idx} must say at least one role`);
    s.w = [win(Math.min(...s.sentIdx))[0], win(Math.max(...s.sentIdx))[1]];
  });
  roles.forEach((r, k) => { if (!seen.has(k)) throw new Error('no scene says role ' + r); });
  return { END, cuts, win };
}

function css(theme, lang = 'ar') {
  const isRtl = lang === 'ar';
  const T = theme;
  return `* { margin: 0; padding: 0; box-sizing: border-box; }
html, body { width: 1080px; height: 1920px; overflow: hidden; background: ${T.light}; font-family: "Cairo", system-ui, sans-serif; }
#root { position: relative; width: 100%; height: 100%; overflow: hidden; }
.scene { position: absolute; inset: 0; opacity: 0; overflow: hidden; }
svg.stage { position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: visible; }
.cap { position: absolute; left: 56px; right: 56px; text-align: center; direction: ${isRtl ? 'rtl' : 'ltr'}; text-wrap: balance; font-weight: 900; line-height: 1.32; z-index: 35; font-size: 64px; opacity: 0; }
.cap.top { top: 150px; } .cap.bottom { top: 1330px; }
.cap.light { color: ${T.ink}; }
.cap.dark { color: #ffffff; background: rgba(18, 9, 17, 0.84); padding: 18px 34px; border-radius: 38px; border: 2px solid rgba(244, 114, 182, 0.4); box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7); text-shadow: 0 3px 10px rgba(0, 0, 0, 0.9); }
.kw { display: inline-block; position: relative; margin: 0 0.15em; }
.uw { position: absolute; left: -4%; width: 108%; bottom: -10px; height: 26px; transform: scaleX(0); transform-origin: ${isRtl ? '100% 50%' : '0% 50%'}; }
.uw svg { width: 100%; height: 100%; display: block; overflow: visible; }
.el { position: absolute; opacity: 0; z-index: 15; direction: ${isRtl ? 'rtl' : 'ltr'}; font-weight: 800; white-space: nowrap; }
.el.bubble { padding: 20px 32px; border-radius: 34px; background: ${T.paper}; border: 5px solid ${T.ink}; font-size: 46px; color: ${T.ink}; box-shadow: 0 10px 0 rgba(31,35,40,.08); }
.el.bubble::after { content: ""; position: absolute; width: 30px; height: 30px; background: ${T.paper}; border-right: 5px solid ${T.ink}; border-bottom: 5px solid ${T.ink}; bottom: -19px; left: 50px; transform: rotate(45deg); }
.el.bubble.r::after { left: auto; right: 50px; }
.el.bubble.app { background: #e3f4ef; border-color: ${T.accent3}; color: ${T.accent3}; } .el.bubble.app::after { background: #e3f4ef; border-color: ${T.accent3}; }
.el.think { padding: 30px 46px; border-radius: 50%; background: ${T.paper}; border: 5px solid ${T.ink}; font-size: 44px; color: ${T.ink}; }
.el.tag { padding: 10px 26px; border-radius: 24px; background: ${T.paper}; font-size: 40px; color: ${T.danger}; box-shadow: 0 6px 0 rgba(31,35,40,.08); }
.el.tag.good { color: ${T.accent3}; } .el.tag.gold { background: ${T.accent}; color: #fff; } .el.tag.ink { background: ${T.ink}; color: ${T.accent2}; }
.el.qm { width: 96px; height: 96px; border-radius: 50%; background: ${T.paper}; border: 5px solid ${T.ink}; display: grid; place-items: center; font-size: 62px; font-weight: 900; color: ${T.accent}; }
.el.mark { width: 96px; height: 96px; border-radius: 50%; background: ${T.danger}; border: 5px solid ${T.ink}; color: #fff; font-size: 44px; line-height: 1; display: grid; place-items: center; font-weight: 900; }
.el.mark.ok { background: #2f8a57; }
.el.note { width: 150px; height: 80px; border-radius: 12px; background: #6fbf73; border: 5px solid ${T.ink}; }
.el.stamp { width: 230px; height: 230px; border-radius: 50%; border: 8px double ${T.danger}; color: ${T.danger}; display: grid; place-items: center; text-align: center; font-size: 34px; font-weight: 900; line-height: 1.2; transform: rotate(-14deg); background: rgba(255,250,240,.92); white-space: normal; }
.el.card { padding: 20px 30px; border-radius: 26px; background: ${T.paper}; border: 4px solid rgba(31,35,40,.12); box-shadow: 0 16px 36px rgba(31,35,40,.08); font-size: 38px; color: ${T.ink}; }
.el.card.gold { border-color: ${T.accent2}; background: linear-gradient(135deg, #ffffff 0%, #f6fcf9 100%); }
.el.card.dark { background: #16202e; color: #f3ead7; border-color: ${T.accent}; }
.el.badge { display: flex; align-items: center; gap: 14px; padding: 12px 28px; border-radius: 40px; background: ${T.paper}; border: 3px solid ${T.ink}; font-size: 36px; box-shadow: 0 8px 0 rgba(31,35,40,.08); }
.el.badge.good { background: #e3f4ef; border-color: ${T.accent3}; color: ${T.accent3}; }
.el.badge.danger { background: #fde8e8; border-color: ${T.danger}; color: ${T.danger}; }
.el.badge.gold { background: ${T.accent}; color: #ffffff; border-color: ${T.accent2}; }
.el.emoji { font-size: 72px; line-height: 1; filter: drop-shadow(0 8px 16px rgba(0,0,0,.15)); }
.el.big { font-size: 120px; font-weight: 900; color: ${T.ink}; }
.el.img { overflow: hidden; border: 7px solid ${T.accent}; } .el.img.circle { border-radius: 50%; } .el.img.rect { border-radius: 36px; } .el.img img { width: 100%; height: 100%; object-fit: cover; }
.el.tv-display { position: absolute; display: flex; flex-direction: column; align-items: center; z-index: 12; }
.el.tv-display .tv-glow { position: absolute; inset: -30px -40px; background: radial-gradient(circle, rgba(219,39,119,0.4) 0%, rgba(244,114,182,0.15) 45%, transparent 70%); filter: blur(35px); z-index: 1; pointer-events: none; border-radius: 40px; }
.el.tv-display .tv-bezel { position: relative; z-index: 2; background: #11141a; border-radius: 20px; border: 8px solid #232936; box-shadow: 0 25px 60px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.1), inset 0 0 0 2px #0a0c10; display: flex; flex-direction: column; overflow: hidden; }
.el.tv-display .tv-screen { width: 100%; flex: 1; background: #000; overflow: hidden; position: relative; }
.el.tv-display .tv-screen video, .el.tv-display .tv-screen img { width: 100%; height: 100%; object-fit: cover; display: block; }
.el.tv-display .tv-chin { height: 26px; background: linear-gradient(180deg, #181d26 0%, #0d1015 100%); display: flex; align-items: center; justify-content: space-between; padding: 0 24px; border-top: 1px solid rgba(255,255,255,0.08); }
.el.tv-display .tv-brand { font-size: 11px; font-weight: 800; letter-spacing: 2px; color: rgba(255,255,255,0.45); text-transform: uppercase; font-family: sans-serif; }
.el.tv-display .tv-led { width: 6px; height: 6px; border-radius: 50%; background: #10b981; box-shadow: 0 0 8px #10b981; }
.el.tv-display .tv-stand { display: flex; flex-direction: column; align-items: center; z-index: 1; margin-top: -2px; }
.el.tv-display .tv-neck { width: 44px; height: 32px; background: linear-gradient(180deg, #2a3140 0%, #151921 100%); border-left: 1px solid rgba(255,255,255,0.15); border-right: 1px solid rgba(0,0,0,0.5); }
.el.tv-display .tv-base { width: 280px; height: 14px; background: linear-gradient(180deg, #374151 0%, #1f2937 100%); border-radius: 6px; border: 1px solid rgba(255,255,255,0.12); box-shadow: 0 10px 20px rgba(0,0,0,0.4); }
.el.phone-display { position: absolute; display: flex; flex-direction: column; align-items: center; z-index: 12; }
.el.phone-display .phone-glow { position: absolute; inset: -20px; background: radial-gradient(circle, rgba(13,148,136,0.25) 0%, rgba(20,184,166,0.08) 50%, transparent 70%); filter: blur(25px); z-index: 1; pointer-events: none; border-radius: 60px; }
.el.phone-display .phone-bezel { position: relative; z-index: 2; background: #ffffff; border-radius: 52px; border: 8px solid #94a3b8; box-shadow: 0 25px 60px rgba(15,23,42,0.18), inset 0 0 0 2px rgba(255,255,255,0.9); display: flex; flex-direction: column; overflow: hidden; }
.el.phone-display .phone-screen { width: 100%; flex: 1; background: #000; overflow: hidden; position: relative; }
.el.phone-display .phone-screen video, .el.phone-display .phone-screen img { width: 100%; height: 100%; object-fit: cover; display: block; }
.el.phone-display .phone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 120px; height: 24px; background: #cbd5e1; border-radius: 12px; z-index: 5; }
.dim { position: absolute; left: 0; right: 0; top: 560px; bottom: 0; background: rgba(12,16,22,.55); opacity: 0; z-index: 9; }
.flash { position: absolute; inset: 0; background: #fff6dc; opacity: 0; z-index: 40; }
#wipe { position: absolute; top: -50px; height: 2020px; width: 440px; z-index: 45; opacity: 0; background: linear-gradient(90deg, rgba(255,255,255,0), ${T.accent2} 50%, rgba(255,255,255,0)); transform: skewX(-12deg); }
#grain { position: absolute; left: -200px; top: -200px; width: 1480px; height: 2320px; z-index: 41; pointer-events: none; opacity: .05; background: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.7' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
#label { position: absolute; left: 0; right: 0; top: 1665px; z-index: 50; display: flex; justify-content: center; }
#label div { padding: 12px 30px; border-radius: 32px; background: rgba(31,35,40,.9); color: #fff; font-size: 30px; font-weight: 700; direction: rtl; white-space: nowrap; }`;
}

// match cut between two scene blocks. On the incoming scene:
//   "transition": "matchcut", "match": { "from": "<anchor in previous scene>", "to": "<anchor in this scene>",
//     "mode": "auto|in|out", "dur": 0.7, "hold": 0.12, "maxScale": 2.4, "sfx": "whoosh-short.mp3" | false }
// An anchor is a character, prop or el id of that scene (resolved to #<sceneId>_<id>) or a raw "#selector".
function matchCutJs(prev, b, sfx) {
  const s = b.first, m = s.match || {};
  if (prev.phone || b.phone) throw new Error(`scene ${s.idx}: matchcut needs non-phone scenes on both sides of the cut`);
  if (!m.from || !m.to) throw new Error(`scene ${s.idx}: matchcut needs match.from (previous scene) and match.to (this scene)`);
  const resolve = (sc, a, side) => {
    if (a.startsWith('#')) return a;
    const sid = sc.id || `s${sc.idx}`;
    if (sc.type === 'stage') {
      const ids = [...(sc.chars || []), ...(sc.props || []), ...(sc.els || [])].map((x) => x.id);
      if (!ids.includes(a)) throw new Error(`scene ${sc.idx}: matchcut ${side} anchor "${a}" is not a character, prop or el of that scene (${ids.join(', ') || 'none'})`);
    }
    return `#${sid}_${a}`;
  };
  const o = { at: r2(b.start), from: resolve(prev.last, m.from, 'from'), to: resolve(s, m.to, 'to'), outScene: `#${prev.ids[prev.ids.length - 1]}`, inScene: `#${b.ids[0]}` };
  for (const k of ['mode', 'dur', 'hold', 'maxScale']) if (m[k] != null) o[k] = m[k];
  if (m.sfx !== false) sfx.push([m.sfx || 'whoosh-short.mp3', b.start - 0.12, 0.2, 0.6]);
  return `SF.matchCut(tl, ${JSON.stringify(o)});\n`;
}

function compose({ job, client, sentences, voice, O, scenes, reels, dir, name }) {
  const theme = { ...client.theme, ...(job.theme || {}) };
  const { END, win } = planTimes({ sentences, voice, O, scenes });
  // real word timings from whisper alignment when available, otherwise the letter-weighted estimate
  const wt = voice.aligned ? voice.aligned.map((ws) => ws.map(([a, b]) => [r2(a + O), r2(b + O)])) : require('./voice.cjs').wordTimes(sentences, voice.spans, O);
  const keyIdx = sentences.map((s) => { const ws = s.text.trim().split(/\s+/); return s.keyword ? ws.findIndex((w) => w.includes(s.keyword)) : -1; });
  const ctx = { client, theme, sentences, wt, keyIdx, job };
  const parts = []; const sfx = []; const assets = []; const sceneInfo = [];
  let three = false, webgl = false;
  for (let k = 0; k < scenes.length; k++) {
    const s = scenes[k];
    if (s.type === 'phone') {
      const grp = [s]; while (k + 1 < scenes.length && scenes[k + 1].type === 'phone' && (scenes[k + 1].group || 'p') === (s.group || 'p')) grp.push(scenes[++k]);
      const reel = reels[s.group || 'p']; if (!reel) throw new Error('no reel built for phone group ' + (s.group || 'p'));
      const r = phoneGroup(grp, ctx, reel); parts.push({ ...r, scenes: grp, phone: true });
      grp.forEach((g) => sceneInfo.push({ s: g, r }));
    } else {
      const f = TYPES[s.type]; if (!f) throw new Error('unknown scene type ' + s.type);
      const r = f(s, s.idx, s.w, ctx); parts.push({ ...r, scenes: [s] }); sceneInfo.push({ s, r });
      if (r.three) three = true; if (r.webgl) webgl = true;
    }
  }
  parts.forEach((p) => { (p.sfx || []).forEach((x) => sfx.push(x)); (p.assets || []).forEach((a) => assets.push(a)); });

  // captions with karaoke + keyword underline
  let capHtml = '', capJs = '';
  sentences.forEach((snt, i) => {
    const info = sceneInfo.find((x) => x.s.sentIdx.includes(i)); const s = info.s, r = info.r;
    if (r.noCaption || s.caption === 'none') return;
    const pos = s.captionPos || r.captionPos || 'top', th = s.captionTheme || r.captionTheme || ((s.bg === 'dark' || s.bg === 'luxury') ? 'dark' : 'light');
    const [a, b] = win(i);
    capHtml += `<p class="cap ${pos} ${th}" id="cap${i}" data-layout-allow-overlap="true">${esc(snt.text)}</p>\n`;
    const hi = th === 'dark' ? '#fde047' : theme.accent3, fin = th === 'dark' ? '#ffffff' : theme.ink;
    // the hook caption is fully dark from frame 0 (TikTok rule 2026-11-12: viewers decide in the first second); later lines keep the dim karaoke
    const dim = i === 0 ? fin : th === 'dark' ? 'rgba(255,255,255,0.88)' : 'rgba(31,35,40,0.58)';
    capJs += i === 0 ? `tl.set('#cap0', { opacity: 1 }, 0);\n` : `tl.fromTo('#cap${i}', { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.2, ease: "power2.out" }, ${a});\n`;
    capJs += `tl.to('#cap${i}', { opacity: 0, duration: 0.12 }, ${r2(b - 0.12)});\n`;
    capJs += `SF.karaoke(tl, 'cap${i}', ${JSON.stringify(wt[i])}, { key: ${keyIdx[i]}, dim: ${JSON.stringify(dim)}, hi: ${JSON.stringify(hi)}, fin: ${JSON.stringify(fin)}, underline: ${JSON.stringify(theme.accent)} });\n`;
  });

  // scene visibility, punch-in and wipes at cuts (none inside one phone group).
  // A scene with transition "cut" gets a hard cut; "matchcut" gets a hard cut where an anchor keeps its spot (SF.matchCut).
  let visJs = '', matchJs = '';
  const blocks = parts.map((p) => ({ start: p.scenes[0].w[0], end: p.scenes[p.scenes.length - 1].w[1], ids: p.phone ? [] : p.scenes.map((s) => s.id || `s${s.idx}`), first: p.scenes[0], last: p.scenes[p.scenes.length - 1], phone: !!p.phone }));
  const wipe = (b, k) => { visJs += `tl.fromTo('#wipe', { x: 1500, opacity: 0.9 }, { x: -560, opacity: 0.9, duration: 0.5, ease: "power2.inOut"${k > 1 ? ', immediateRender: false' : ''} }, ${r2(b.start - 0.25)});\ntl.set('#wipe', { opacity: 0 }, ${r2(b.start + 0.26)});\n`; sfx.push(['whoosh-short.mp3', b.start - 0.25, 0.28, 0.6]); };
  let wiped = 0;   // the first wipe must render immediately, later ones must not
  blocks.forEach((b, k) => {
    const tr = k > 0 ? (b.first.transition || 'wipe') : null;
    if (tr && !['wipe', 'cut', 'matchcut'].includes(tr)) throw new Error(`scene ${b.first.idx}: unknown transition "${tr}" (wipe | cut | matchcut)`);
    b.ids.forEach((id, j) => {
      visJs += k === 0 ? `tl.set('#${id}', { opacity: 1, immediateRender: true }, 0);\n`
        : tr !== 'wipe' && j === 0 ? `tl.set('#${id}', { opacity: 1 }, ${b.start});\n`
        : `tl.fromTo('#${id}', { opacity: 0, scale: 1.06 }, { opacity: 1, scale: 1, duration: 0.35, ease: "power3.out" }, ${b.start});\n`;
      if (k < blocks.length - 1) visJs += `tl.set('#${id}', { opacity: 0 }, ${r2(b.end)});\n`;
    });
    if (tr === 'wipe') wipe(b, ++wiped);
    if (tr === 'matchcut') matchJs += matchCutJs(blocks[k - 1], b, sfx);
  });
  const firstCss = '';   // frame 0 visibility comes from an immediate tl.set at 0 (the linter rejects a full-frame scene that is visible in CSS)

  // SFX: dedupe same file within 0.15 s, keep inside the video
  const seen = []; const sfxTags = [];
  sfx.sort((a, b) => a[1] - b[1]).forEach(([f, at, vol, d]) => {
    at = Math.max(0, r2(at)); if (at > END - 0.2) return;
    if (seen.some((x) => x[0] === f && Math.abs(x[1] - at) < 0.15)) return; seen.push([f, at]);
    sfxTags.push(`<audio id="sfx${sfxTags.length}" src="assets/sfx/${f}" data-start="${at}" data-duration="${d}" data-track-index="${20 + sfxTags.length}" data-volume="${vol}"></audio>`);
  });
  const music = job.music ? `<audio id="music" src="assets/music${job.music.slice(job.music.lastIndexOf('.'))}" data-start="0" data-duration="${END}" data-track-index="6" data-volume="${job.musicVolume || 0.12}"></audio>` : '';

  // files
  fs.rmSync(dir, { recursive: true, force: true });
  fs.mkdirSync(`${dir}/assets/sfx`, { recursive: true });
  fs.copyFileSync(`${ROOT}/compositions/dental-triage-15s/assets/gsap.min.js`, `${dir}/assets/gsap.min.js`);
  fs.cpSync(`${ROOT}/compositions/dental-triage-15s/assets/fonts`, `${dir}/assets/fonts`, { recursive: true });
  fs.copyFileSync(`${ROOT}/factory/runtime/stage.js`, `${dir}/assets/stage.js`);
  fs.copyFileSync(voice.file, `${dir}/assets/voice.wav`);
  for (const f of new Set(seen.map((x) => x[0]))) { const src = fs.existsSync(`${ROOT}/factory/sfx/${f}`) ? `${ROOT}/factory/sfx/${f}` : `${ROOT}/assets/sfx/${f}`; if (fs.existsSync(src)) fs.copyFileSync(src, `${dir}/assets/sfx/${f}`); }
  for (const a of assets) fs.copyFileSync(a.src, `${dir}/assets/${a.dst}`);
  if (job.music) fs.copyFileSync(abs(job.music), `${dir}/assets/music${job.music.slice(job.music.lastIndexOf('.'))}`);
  if (three) { for (const f of ['three.module.min.js', 'three.core.min.js']) fs.copyFileSync(`${ROOT}/node_modules/three/build/${f}`, `${dir}/assets/${f}`); fs.copyFileSync(`${ROOT}/node_modules/three/examples/jsm/environments/RoomEnvironment.js`, `${dir}/assets/RoomEnvironment.js`); }
  const p = JSON.parse(fs.readFileSync(`${ROOT}/compositions/andoria-explainer/package.json`, 'utf8')); p.name = name; fs.writeFileSync(`${dir}/package.json`, JSON.stringify(p, null, 2));
  const fonts = fs.readFileSync(`${ROOT}/.cache/fonts_block.css`, 'utf8');

  const html = `<!doctype html>
<html lang="${job.lang || 'ar'}" dir="${(job.lang || 'ar') === 'ar' ? 'rtl' : 'ltr'}" data-resolution="portrait" data-composition-variables='[{"id":"name","type":"string","label":"Variant name (output file name)","default":"${name}"}]'>
<head><meta charset="UTF-8" /><meta name="viewport" content="width=1080, height=1920" /><title>${esc(job.id)}</title>
<script src="assets/gsap.min.js"></script><script src="assets/stage.js"></script>${three ? '<script type="importmap">{ "imports": { "three": "./assets/three.module.min.js" } }</script>' : ''}
<style>
${fonts}
${css(theme, job.lang || 'ar')}
${parts.map((p) => p.css).join('\n')}
${firstCss}
</style></head>
<body><div id="root" data-composition-id="main" data-start="0" data-width="1080" data-height="1920" data-duration="${END}">
${parts.map((p) => p.html).join('\n')}
${capHtml}
<audio id="voice" src="assets/voice.wav" data-start="${O}" data-duration="${r2(voice.D)}" data-track-index="5" data-volume="1"></audio>
${music}
${sfxTags.join('\n')}
<div id="wipe" data-layout-allow-overflow="true" data-layout-allow-occlusion="true"></div><div id="grain"></div>
${client.label || job.label ? `<div id="label"><div>${esc(job.label || client.label)}</div></div>` : ''}
</div>
<script>
const tl = gsap.timeline({ paused: true });
window.FRAME_HOOKS = []; const FRAME_HOOKS = window.FRAME_HOOKS;
${job.art === 1 ? 'window.SF_ART = 1; // job asks for the v1 characters\n' : ''}SF.hydrate();
${parts.map((p) => p.js).join('\n')}
${visJs}
${capJs}
${matchJs}
for (let g = 0; g * 0.1 < ${END}; g++) tl.set('#grain', { x: ((g * 97) % 160) - 80, y: ((g * 53) % 160) - 80 }, g * 0.1);
tl.eventCallback('onUpdate', () => { for (const f of FRAME_HOOKS) f(); });
window.__timelines["main"] = tl; tl.seek(0); for (const f of FRAME_HOOKS) f();
</script>
${parts.filter((p) => p.moduleJs).map((p) => `<script type="module">\n${p.moduleJs}\n</script>`).join('\n')}
</body></html>`;
  fs.writeFileSync(`${dir}/index.html`, html);
  return { END, wt, webgl, three, sfxCount: sfxTags.length };
}
module.exports = { compose, planTimes };
