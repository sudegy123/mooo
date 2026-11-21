# Builds scripts/templates/aesthetic3.template.html from the Arabic aesthetic template:
# scenes 1-3 (hook, pain, cost) become flat 2D character scenes on a light stage (SVG characters rigged with GSAP).
import re
SRC = 'G:/sudegy-video-studio/scripts/templates/aesthetic.template.html'
DST = 'G:/sudegy-video-studio/scripts/templates/aesthetic3.template.html'
t = open(SRC, encoding='utf-8').read()

def between(s, a, b, new):
    i = s.index(a); j = s.index(b, i)
    return s[:i] + new + s[j:]

CSS = r'''      /* ---- light 2D character stage (scenes 1-3) ---- */
      #bgL { position: absolute; inset: 0; z-index: 3; background: radial-gradient(1100px 900px at 50% 40%, #fbf6ec 0%, #f1e7d4 100%); }
      #bgL::after { content: ""; position: absolute; inset: 0; opacity: .5; background-image: radial-gradient(circle, rgba(15,107,87,.10) 2.5px, transparent 3px); background-size: 120px 120px; }
      .stage { position: absolute; inset: 0; width: 1080px; height: 1920px; overflow: visible; }
      .ground { position: absolute; left: 0; right: 0; top: 1500px; height: 4px; background: #d8c9ad; }
      .lt { color: #1f2328; }
      .lt .kw { color: rgba(31,35,40,.58); }
      .kw { position: relative; }
      .uw { position: absolute; left: -4%; width: 108%; bottom: -10px; height: 26px; transform: scaleX(0); transform-origin: 100% 50%; }
      .uw svg { width: 100%; height: 100%; display: block; overflow: visible; }
      .brandL { position: absolute; top: 130px; left: 0; right: 0; text-align: center; direction: ltr; font-size: 38px; font-weight: 800; letter-spacing: 12px; color: #0f6b57; }
      .bub2 { position: absolute; padding: 22px 34px; border-radius: 34px; background: #fffaf0; border: 5px solid #1f2328; font-size: 50px; font-weight: 800; color: #1f2328; direction: rtl; opacity: 0; white-space: nowrap; box-shadow: 0 10px 0 rgba(31,35,40,.08); }
      .bub2::after { content: ""; position: absolute; width: 30px; height: 30px; background: #fffaf0; border-right: 5px solid #1f2328; border-bottom: 5px solid #1f2328; bottom: -19px; transform: rotate(45deg); }
      #q1 { left: 600px; top: 760px; } #q1::after { left: 60px; }
      #r1 { left: 70px; top: 930px; background: #e3f4ef; border-color: #0f6b57; color: #0f6b57; font-size: 44px; } #r1::after { background: #e3f4ef; border-color: #0f6b57; right: 60px; }
      #r1 small { display: block; font-size: 26px; font-weight: 700; color: #4d7f73; }
      #seen1 { position: absolute; left: 90px; top: 1105px; font-size: 32px; font-weight: 800; color: #4d7f73; opacity: 0; direction: rtl; }
      #gone1 { position: absolute; left: 0; right: 0; top: 1545px; text-align: center; font-size: 44px; font-weight: 800; color: #b5483f; opacity: 0; direction: rtl; }
      .qm { position: absolute; width: 96px; height: 96px; border-radius: 50%; background: #fffaf0; border: 5px solid #1f2328; display: grid; place-items: center; font-size: 62px; font-weight: 900; color: #c08a1e; opacity: 0; }
      #qm1 { left: 300px; top: 770px; } #qm2 { left: 470px; top: 860px; }
      #hook { top: 230px; font-size: 74px; }
      #pain { top: 230px; font-size: 66px; }
      .sign { position: absolute; top: 590px; width: 300px; height: 230px; border-radius: 28px; background: #fffaf0; border: 5px solid #1f2328; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; direction: rtl; opacity: 0; box-shadow: 0 10px 0 rgba(31,35,40,.08); }
      .sign b { font-size: 40px; font-weight: 800; color: #1f2328; }
      .sign em { font-style: normal; font-size: 40px; font-weight: 900; color: #fff; background: #c08a1e; border-radius: 22px; padding: 4px 26px; }
      .sign .nd { width: 110px; height: 16px; border-radius: 8px; background: linear-gradient(90deg, #8fa3b8, #dfe8f1); position: relative; transform: rotate(-30deg); }
      .sign .nd::after { content: ""; position: absolute; left: -30px; top: 5px; width: 30px; height: 6px; background: #8fa3b8; }
      #sgA { left: 740px; } #sgB { left: 390px; } #sgC { left: 40px; border-color: #0f6b57; } #sgC b { color: #0f6b57; }
      #plan_lost { position: absolute; left: 0; right: 0; top: 1545px; text-align: center; font-size: 42px; font-weight: 800; color: #b5483f; opacity: 0; direction: rtl; }
      #cost { top: 230px; font-size: 66px; }
      #clock { position: absolute; left: 640px; top: 600px; width: 300px; height: 300px; }
      .tkt { position: absolute; left: 600px; width: 420px; height: 96px; border-radius: 24px; background: #fffaf0; border: 4px solid #b5483f; display: flex; align-items: center; justify-content: center; direction: rtl; opacity: 0; }
      .tkt em { font-style: normal; font-size: 34px; font-weight: 800; color: #b5483f; }
      #t1 { top: 960px; } #t2 { top: 1080px; } #t3 { top: 1200px; }
      #sigh { position: absolute; left: 430px; top: 800px; font-size: 96px; font-weight: 900; color: #1f2328; opacity: 0; }

      /* phone + caption */'''
t = between(t, '      /* S1 hook:', '      /* phone + caption */', CSS)
t = t.replace('      /* phone + caption */      /* phone + caption */', '      /* phone + caption */')

HTML = r'''      <div id="bgL"></div>
      <section id="s1" class="scene">
        <div class="brandL">SUDEGY</div>
        <h1 id="hook" class="sent lt">__S_hook__</h1>
        <div class="ground"></div>
        <svg class="stage" viewBox="0 0 1080 1920"><g transform="translate(560,1500)"><g id="P1"><g id="P1f" data-char="patient"></g></g></g></svg>
        <div id="q1" class="bub2">بكم الإبرة؟</div>
        <div id="r1" class="bub2"><small>عيادة تجميل</small>السعر عندنا كذا</div>
        <div id="seen1">✓✓ تمت المشاهدة</div>
        <div id="qm1" class="qm">؟</div>
        <div id="gone1">ولم يرد المريض مرة أخرى</div>
      </section>

      <section id="s2" class="scene">
        <div class="brandL">SUDEGY</div>
        <p id="pain" class="sent lt">__S_pain__</p>
        <div id="sgA" class="sign"><i class="nd"></i><b>عيادة أ</b><em>بكم؟</em></div>
        <div id="sgB" class="sign"><i class="nd"></i><b>عيادة ب</b><em>بكم؟</em></div>
        <div id="sgC" class="sign"><i class="nd"></i><b>عيادتك</b><em>بكم؟</em></div>
        <div class="ground"></div>
        <svg class="stage" viewBox="0 0 1080 1920"><g transform="translate(540,1500) scale(0.9)"><g id="P2"><g id="P2f" data-char="patient"></g></g></g></svg>
        <div id="qm2" class="qm">؟</div>
        <div id="plan_lost">الخطة العلاجية وقيمة الطبيب لا تُقارَن</div>
      </section>

      <section id="s3" class="scene">
        <div class="brandL">SUDEGY</div>
        <p id="cost" class="sent lt">__S_cost__</p>
        <svg id="clock" viewBox="0 0 420 420" aria-hidden="true">
          <circle cx="210" cy="210" r="190" fill="#fffaf0" stroke="#1f2328" stroke-width="12"/>
          <circle cx="210" cy="210" r="12" fill="#1f2328"/>
          <line x1="210" y1="210" x2="210" y2="100" stroke="#1f2328" stroke-width="14" stroke-linecap="round"/>
          <line id="hand" x1="210" y1="210" x2="210" y2="56" stroke="#c08a1e" stroke-width="10" stroke-linecap="round"/>
        </svg>
        <div id="t1" class="tkt"><em>استشارة طويلة بلا حجز</em></div>
        <div id="t2" class="tkt"><em>استشارة طويلة بلا حجز</em></div>
        <div id="t3" class="tkt"><em>استشارة طويلة بلا حجز</em></div>
        <div class="ground"></div>
        <svg class="stage" viewBox="0 0 1080 1920"><g transform="translate(330,1500)"><g id="D3"><g id="D3f" data-char="doctor"></g></g></g></svg>
        <div id="sigh">...</div>
      </section>

'''
t = between(t, '      <section id="s1" class="scene">', '      <div class="brand" id="brandP"', HTML)

JS_CHARS = r'''      // ---- flat 2D characters (SVG, rigged by group; feet at 0,0) ----
      const INK = "#1f2328", SK = 'stroke="#1f2328" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
      function patient(id) {
        return `<ellipse cx="0" cy="4" rx="96" ry="13" fill="rgba(31,35,40,.10)"/>
        <g id="${id}-fl"><line x1="-26" y1="-80" x2="-30" y2="-8" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><ellipse cx="-40" cy="-5" rx="22" ry="10" fill="${INK}"/></g>
        <g id="${id}-fr"><line x1="26" y1="-80" x2="30" y2="-8" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><ellipse cx="40" cy="-5" rx="22" ry="10" fill="${INK}"/></g>
        <g id="${id}-al"><line x1="-60" y1="-392" x2="-88" y2="-236" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><circle cx="-90" cy="-226" r="15" fill="#f6dcc8" ${SK}/></g>
        <path id="${id}-body" d="M-60,-405 Q-62,-418 -46,-420 L46,-420 Q62,-418 60,-405 L98,-70 Q100,-58 86,-58 L-86,-58 Q-100,-58 -98,-70 Z" fill="#2f3b4f" ${SK}/>
        <g id="${id}-head">
          <path d="M-94,-470 Q-104,-388 -58,-398 L58,-398 Q104,-388 94,-470 Z" fill="#c46d7a" ${SK}/>
          <circle cx="0" cy="-502" r="90" fill="#c46d7a" ${SK}/>
          <circle cx="0" cy="-498" r="62" fill="#f6dcc8" stroke="${INK}" stroke-width="5"/>
          <g id="${id}-eyes"><ellipse cx="-22" cy="-506" rx="7" ry="10" fill="${INK}"/><ellipse cx="22" cy="-506" rx="7" ry="10" fill="${INK}"/></g>
          <circle cx="-36" cy="-480" r="9" fill="#f2a9a0" opacity=".7"/><circle cx="36" cy="-480" r="9" fill="#f2a9a0" opacity=".7"/>
          <ellipse id="${id}-m" cx="0" cy="-468" rx="14" ry="5" fill="#7a2e2e"/>
        </g>
        <g id="${id}-ar"><line x1="60" y1="-392" x2="96" y2="-300" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><line x1="96" y1="-300" x2="74" y2="-430" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
          <rect x="56" y="-512" width="44" height="76" rx="9" fill="#26303d" ${SK}/><rect x="63" y="-503" width="30" height="54" rx="4" fill="#6fe0c8"/><circle cx="74" cy="-436" r="15" fill="#f6dcc8" ${SK}/></g>`;
      }
      function doctor(id) {
        return `<ellipse cx="0" cy="4" rx="100" ry="13" fill="rgba(31,35,40,.10)"/>
        <g id="${id}-fl"><line x1="-30" y1="-235" x2="-34" y2="-10" stroke="#24324a" stroke-width="16" stroke-linecap="round"/><ellipse cx="-46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
        <g id="${id}-fr"><line x1="30" y1="-235" x2="34" y2="-10" stroke="#24324a" stroke-width="16" stroke-linecap="round"/><ellipse cx="46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
        <g id="${id}-al"><line x1="-74" y1="-418" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="#e9c3a6" ${SK}/></g>
        <path d="M-74,-425 Q-78,-440 -56,-442 L56,-442 Q78,-440 74,-425 L92,-205 Q93,-195 82,-195 L-82,-195 Q-93,-195 -92,-205 Z" fill="#ffffff" ${SK}/>
        <path d="M-32,-442 L0,-372 L32,-442 Z" fill="#22b59a" ${SK}/>
        <path d="M-34,-436 Q-46,-330 0,-322 Q46,-330 34,-436" fill="none" stroke="#3a4a5a" stroke-width="6"/><circle cx="0" cy="-318" r="10" fill="#3a4a5a"/>
        <rect x="30" y="-330" width="40" height="26" rx="5" fill="#0f6b57"/>
        <g id="${id}-head">
          <rect x="-18" y="-462" width="36" height="26" fill="#e9c3a6" stroke="${INK}" stroke-width="5"/>
          <circle cx="0" cy="-522" r="72" fill="#e9c3a6" ${SK}/>
          <path d="M-72,-530 Q-66,-604 0,-600 Q66,-604 72,-530 Q46,-566 0,-562 Q-46,-566 -72,-530 Z" fill="#2a2522" ${SK}/>
          <g id="${id}-brows"><line x1="-36" y1="-548" x2="-14" y2="-546" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="14" y1="-546" x2="36" y2="-548" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
          <g id="${id}-eyes"><ellipse cx="-24" cy="-526" rx="7" ry="10" fill="${INK}"/><ellipse cx="24" cy="-526" rx="7" ry="10" fill="${INK}"/></g>
          <line id="${id}-m" x1="-16" y1="-482" x2="16" y2="-484" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        </g>
        <g id="${id}-ar"><line x1="74" y1="-418" x2="104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="106" cy="-252" r="16" fill="#e9c3a6" ${SK}/></g>`;
      }
      document.querySelectorAll("[data-char]").forEach((g) => { g.innerHTML = (g.dataset.char === "doctor" ? doctor : patient)(g.id.slice(0, -1)); });
'''
t = t.replace('      const zoom = document.getElementById("zoom");', JS_CHARS + '      const zoom = document.getElementById("zoom");')

# karaoke: light-stage sentences use dark ink; key words get a gold underline swoosh
t = t.replace('''Object.values(KID).forEach((id) => { const el = document.getElementById(id); const words = el.textContent.trim().split(/\\s+/); el.textContent = ""; words.forEach((w, i) => { const s = document.createElement("span"); s.className = "kw"; s.id = id + "-w" + i; s.textContent = w; el.appendChild(s); if (i < words.length - 1) el.appendChild(document.createTextNode(" ")); }); });''',
'''const KEY = { hook: [-1], pain: [3], cost: [2] };   // word index to underline (-1 = last word)
      Object.entries(KID).forEach(([k, id]) => { const el = document.getElementById(id); const words = el.textContent.trim().split(/\\s+/); el.textContent = ""; words.forEach((w, i) => { const s = document.createElement("span"); s.className = "kw"; s.id = id + "-w" + i; s.textContent = w; if ((KEY[k] || []).some((j) => (j < 0 ? words.length + j : j) === i)) { const u = document.createElement("i"); u.className = "uw"; u.id = id + "-u" + i; u.innerHTML = '<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M3 14 Q50 2 97 12" fill="none" stroke="#c08a1e" stroke-width="7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>'; s.appendChild(u); } el.appendChild(s); if (i < words.length - 1) el.appendChild(document.createTextNode(" ")); }); });
      const LIGHT = { hook: 1, pain: 1, cost: 1 };''')

JS_TL = r'''      // ---- S1-S3: 2D character scenes on the light stage ----
      const walk = (p, t0, dur, step = 0.32) => { const n = Math.max(1, Math.round(dur / step)); tl.fromTo(p + "-fl", { rotation: -16 }, { rotation: 16, duration: step, ease: "sine.inOut", yoyo: true, repeat: n - 1, transformOrigin: "50% 0%" }, t0); tl.fromTo(p + "-fr", { rotation: 16 }, { rotation: -16, duration: step, ease: "sine.inOut", yoyo: true, repeat: n - 1, transformOrigin: "50% 0%" }, t0); tl.fromTo(p + "-body", { y: 0 }, { y: -8, duration: step / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1 }, t0); tl.set([p + "-fl", p + "-fr"], { rotation: 0 }, t0 + dur); };
      const talk = (p, t0, dur) => tl.fromTo(p + "-m", { scaleY: 1 }, { scaleY: 3.2, duration: 0.11, ease: "none", yoyo: true, repeat: Math.max(1, Math.round(dur / 0.11)) | 1, transformOrigin: "50% 50%" }, t0);
      const blink = (p, t0) => tl.fromTo(p + "-eyes", { scaleY: 1 }, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: "50% 50%" }, t0);
      const pop = (sel, t0) => tl.fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.2)" }, t0);
      tl.fromTo("#bgL", { opacity: 1 }, { opacity: 0, duration: 0.45, ease: "power1.inOut" }, W[2] - 0.1);

      // S1 hook: she asks the price on the phone, reads the reply, and walks away
      tl.fromTo("#s1", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, 0);
      tl.fromTo("#P1", { x: 420 }, { x: 0, duration: 0.6, ease: "power2.out" }, 0); walk("#P1", 0, 0.6, 0.2);
      tl.fromTo("#P1-head", { rotation: 0 }, { rotation: -4, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1, transformOrigin: "50% 100%" }, 0.6);
      pop("#q1", T.h.b1); talk("#P1", T.h.b1, 0.55);
      blink("#P1", T.h.b1 + 0.9);
      pop("#r1", T.h.b2);
      tl.fromTo("#P1-eyes", { y: 0 }, { y: -3, scaleY: 1.3, duration: 0.2, transformOrigin: "50% 50%" }, T.h.b2 + 0.25);
      pop("#qm1", T.h.b2 + 0.3);
      tl.fromTo("#seen1", { opacity: 0 }, { opacity: 1, duration: 0.3 }, T.h.seen);
      tl.to(["#q1", "#qm1"], { opacity: 0, duration: 0.2 }, T.h.seen + 0.1);
      tl.to("#P1", { x: 760, duration: W[0] - 0.35 - (T.h.seen + 0.3), ease: "power1.in" }, T.h.seen + 0.3); walk("#P1", T.h.seen + 0.3, W[0] - 0.35 - (T.h.seen + 0.3), 0.26);
      tl.fromTo("#gone1", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.35 }, T.h.seen + 0.55);
      tl.to("#s1", { opacity: 0, duration: 0.25, ease: "power2.in" }, W[0] - 0.05);

      // S2 pain: she compares the same needle across clinics like a commodity
      tl.fromTo("#s2", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, W[0] + 0.1);
      ["#sgA", "#sgB", "#sgC"].forEach((s, i) => pop(s, W[0] + 0.3 + i * 0.3));
      tl.fromTo("#P2", { x: -700 }, { x: 0, duration: 0.8, ease: "power2.out" }, W[0] + 0.25); walk("#P2", W[0] + 0.25, 0.8, 0.22);
      const look = [[18, 1.4], [0, 2.3], [-18, 3.2]];
      look.forEach(([dx, at]) => { tl.to("#P2-eyes", { x: dx * 0.6, duration: 0.18 }, W[0] + at); tl.to("#P2-head", { rotation: dx * 0.4, duration: 0.25, transformOrigin: "50% 100%" }, W[0] + at); });
      [["#sgA", 1.4], ["#sgB", 2.3], ["#sgC", 3.2]].forEach(([s, at]) => tl.fromTo(s, { y: 0 }, { y: -14, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" }, W[0] + at));
      pop("#qm2", W[0] + 3.7); tl.fromTo(["#P2-al", "#P2-ar"], { rotation: 0 }, { rotation: (i) => (i ? 18 : -18), duration: 0.25, yoyo: true, repeat: 1, transformOrigin: "50% 0%" }, W[0] + 3.7);
      tl.fromTo("#plan_lost", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4 }, W[1] - 1.6);
      tl.to("#s2", { opacity: 0, duration: 0.22, ease: "power2.in" }, W[1] - 0.05);

      // S3 cost: the doctor waits while the clock runs; consultations that never book
      tl.fromTo("#s3", { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "none" }, W[1] + 0.1);
      tl.fromTo("#hand", { rotation: 0, svgOrigin: "210 210" }, { rotation: 1080, svgOrigin: "210 210", duration: W[2] - W[1] - 0.2, ease: "power1.inOut" }, W[1] + 0.2);
      tl.fromTo("#D3-head", { rotation: 0 }, { rotation: 10, duration: 0.4, ease: "sine.inOut", transformOrigin: "50% 100%" }, W[1] + 0.5);
      tl.fromTo("#D3-fr", { rotation: 0 }, { rotation: -10, duration: 0.18, yoyo: true, repeat: 9, ease: "sine.inOut", transformOrigin: "50% 0%" }, W[1] + 0.6);
      ["#t1", "#t2", "#t3"].forEach((s, i) => pop(s, W[1] + 1.0 + i * 0.5));
      blink("#D3", W[1] + 1.8);
      tl.to("#D3-head", { rotation: -6, y: 10, duration: 0.5, ease: "power2.inOut", transformOrigin: "50% 100%" }, W[2] - 1.5);
      tl.to("#D3-brows", { rotation: 8, duration: 0.3, transformOrigin: "50% 50%" }, W[2] - 1.5);
      tl.fromTo("#sigh", { opacity: 0, y: 10 }, { opacity: 1, y: -10, duration: 0.6 }, W[2] - 1.2);
      tl.to("#s3", { opacity: 0, duration: 0.22, ease: "power2.in" }, W[2] - 0.05);

      // S4-S8'''
t = between(t, '      // S1 hook:', '      // S4-S8', JS_TL)
t = t.replace('      // S4-S8      // S4-S8', '      // S4-S8')

# karaoke tween colours per stage + underline swoosh
t = t.replace('''      Object.entries(KID).forEach(([k, id]) => (WT[k] || []).forEach(([a, b], i) => {
        const w = "#" + id + "-w" + i;
        tl.fromTo(w, { color: "rgba(234,244,241,0.42)" }, { color: "#ffd978", duration: 0.1, ease: "none" }, a);''',
'''      Object.entries(KID).forEach(([k, id]) => (WT[k] || []).forEach(([a, b], i) => {
        const w = "#" + id + "-w" + i, L = LIGHT[k];
        const u = document.getElementById(id + "-u" + i); if (u) tl.to(u, { scaleX: 1, duration: 0.45, ease: "power2.out" }, a + 0.05);
        tl.fromTo(w, { color: L ? "rgba(31,35,40,0.58)" : "rgba(234,244,241,0.42)" }, { color: L ? "#0f6b57" : "#ffd978", duration: 0.1, ease: "none" }, a);''')
t = t.replace('''        tl.to(w, { color: "#eaf4f1", duration: 0.25, ease: "none" }, Math.max(a + 0.12, b));''',
'''        tl.to(w, { color: L ? "#1f2328" : "#eaf4f1", duration: 0.25, ease: "none" }, Math.max(a + 0.12, b));''')
assert 'LIGHT[k]' in t and 'data-char="doctor"' in t and 'walk("#P1"' in t
t = t.replace('Sudegy aesthetic clinics — doctor ad', 'Sudegy aesthetic clinics — doctor ad v3 (2D characters)').replace('"default":"aesthetic"', '"default":"aesthetic3"')
open(DST, 'w', encoding='utf-8').write(t)
print('written', DST, len(t))
