// Sudegy video factory — browser runtime for 2D "stage" scenes: flat characters, props and reusable actions.
// Loaded as a classic script inside every composition. Every action only adds tweens to a paused GSAP timeline,
// so any frame can be seeked deterministically by HyperFrames.
(function () {
  const INK = "#1f2328";
  const SK = 'stroke="#1f2328" stroke-width="6" stroke-linejoin="round" stroke-linecap="round"';
  const leg = (id, side, c = INK, shoe = INK) => { const s = side === "l" ? -1 : 1; return `<g id="${id}-f${side}"><line x1="${26 * s}" y1="-80" x2="${30 * s}" y2="-8" stroke="${c}" stroke-width="10" stroke-linecap="round"/><ellipse cx="${40 * s}" cy="-5" rx="22" ry="10" fill="${shoe}" stroke="${INK}" stroke-width="3"/></g>`; };
  const arm = (id, side, skin, len = 1) => { const s = side === "l" ? -1 : 1; return `<g id="${id}-a${side}"><line x1="${60 * s}" y1="-392" x2="${88 * s}" y2="${-392 + 156 * len}" stroke="${INK}" stroke-width="10" stroke-linecap="round"/><circle cx="${90 * s}" cy="${-382 + 156 * len}" r="15" fill="${skin}" ${SK}/></g>`; };
  const shadow = '<ellipse cx="0" cy="4" rx="96" ry="13" fill="rgba(31,35,40,.10)"/>';
  const eyes = (id, y = -506, dx = 22) => `<g id="${id}-eyes"><ellipse cx="${-dx}" cy="${y}" rx="7" ry="10" fill="${INK}"/><ellipse cx="${dx}" cy="${y}" rx="7" ry="10" fill="${INK}"/></g>`;
  const brows = (id, y = -530, dx = 22) => `<g id="${id}-brows" opacity="0"><line x1="${-dx - 12}" y1="${y}" x2="${-dx + 10}" y2="${y + 4}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/><line x1="${dx - 10}" y1="${y + 4}" x2="${dx + 12}" y2="${y}" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>`;
  const mouth = (id, y = -468, c = "#7a2e2e") => `<ellipse id="${id}-m" cx="0" cy="${y}" rx="14" ry="5" fill="${c}"/>`;
  const robe = (id, fill, extra = "") => `<path id="${id}-body" d="M-60,-405 Q-62,-418 -46,-420 L46,-420 Q62,-418 60,-405 L98,-70 Q100,-58 86,-58 L-86,-58 Q-100,-58 -98,-70 Z" fill="${fill}" ${SK}/>${extra}`;

  // ---------------- characters (feet at 0,0; ~600 px tall) ----------------
  const CHAR = {
    // woman in hijab and abaya (Sudan / Gulf)
    woman(id, o = {}) {
      const skin = o.skin || "#f6dcc8", scarf = o.scarf || "#c46d7a", dress = o.dress || "#2f3b4f";
      return `${shadow}${leg(id, "l")}${leg(id, "r")}${arm(id, "l", skin)}${robe(id, dress)}
      <g id="${id}-head"><path d="M-94,-470 Q-104,-388 -58,-398 L58,-398 Q104,-388 94,-470 Z" fill="${scarf}" ${SK}/>
      <circle cx="0" cy="-502" r="90" fill="${scarf}" ${SK}/><circle cx="0" cy="-498" r="62" fill="${skin}" stroke="${INK}" stroke-width="5"/>
      ${eyes(id)}${brows(id)}<circle cx="-36" cy="-480" r="9" fill="#f2a9a0" opacity=".6"/><circle cx="36" cy="-480" r="9" fill="#f2a9a0" opacity=".6"/>${mouth(id)}</g>
      ${arm(id, "r", skin)}`;
    },
    // Sudanese man: white jalabiya and imma
    man_sd(id, o = {}) {
      const skin = o.skin || "#8d5a3b";
      return `${shadow}${leg(id, "l", "#6b4426", "#7a5233")}${leg(id, "r", "#6b4426", "#7a5233")}${arm(id, "l", skin)}
      ${robe(id, o.dress || "#ffffff", `<path d="M-20,-420 L0,-380 L20,-420" fill="none" stroke="${INK}" stroke-width="5"/><line x1="0" y1="-380" x2="0" y2="-300" stroke="${INK}" stroke-width="4"/>`)}
      <g id="${id}-head"><rect x="-18" y="-448" width="36" height="30" fill="${skin}" stroke="${INK}" stroke-width="5"/>
      <circle cx="0" cy="-500" r="64" fill="${skin}" ${SK}/>
      <path d="M-74,-520 Q-78,-600 0,-604 Q78,-600 74,-520 Q40,-540 0,-538 Q-40,-540 -74,-520 Z" fill="#ffffff" ${SK}/>
      <path d="M-70,-548 Q0,-575 70,-548" fill="none" stroke="#d8d2c4" stroke-width="5"/><path d="M-66,-572 Q0,-596 66,-572" fill="none" stroke="#d8d2c4" stroke-width="5"/>
      ${eyes(id)}${brows(id, -526)}<path d="M-24,-478 Q0,-486 24,-478" fill="none" stroke="#2a1d16" stroke-width="7" stroke-linecap="round"/>${mouth(id, -462, "#5a2620")}</g>
      ${arm(id, "r", skin)}`;
    },
    // Gulf man: white thobe, red-white ghutra and black agal
    man_gulf(id, o = {}) {
      const skin = o.skin || "#d9a77f";
      return `${shadow}${leg(id, "l", "#c9b9a0", "#5a4632")}${leg(id, "r", "#c9b9a0", "#5a4632")}${arm(id, "l", skin)}
      ${robe(id, o.dress || "#ffffff", `<line x1="0" y1="-420" x2="0" y2="-330" stroke="${INK}" stroke-width="4"/>`)}
      <g id="${id}-head"><path d="M-96,-500 Q-100,-380 -60,-392 L60,-392 Q100,-380 96,-500 Z" fill="#f4f1ec" ${SK}/>
      <circle cx="0" cy="-506" r="66" fill="${skin}" ${SK}/>
      <path d="M-82,-520 Q-84,-610 0,-612 Q84,-610 82,-520 Q46,-556 0,-552 Q-46,-556 -82,-520 Z" fill="#f4f1ec" ${SK}/>
      <path d="M-74,-560 L74,-560 M-70,-580 L70,-580 M-40,-600 L40,-600 M-50,-540 L-60,-600 M0,-545 L0,-610 M50,-540 L60,-600" stroke="#c0392b" stroke-width="4" opacity=".8"/>
      <ellipse cx="0" cy="-566" rx="78" ry="14" fill="none" stroke="#111" stroke-width="9"/>
      ${eyes(id, -508)}${brows(id, -532)}<path d="M-26,-484 Q0,-492 26,-484" fill="none" stroke="#2a1d16" stroke-width="7" stroke-linecap="round"/><path d="M-30,-470 Q0,-430 30,-470" fill="#2a1d16" opacity=".85"/>${mouth(id, -466, "#5a2620")}</g>
      ${arm(id, "r", skin)}`;
    },
    // male doctor in a white coat
    doctor_m(id, o = {}) {
      const skin = o.skin || "#e9c3a6";
      return `${shadow}<g id="${id}-fl"><line x1="-30" y1="-235" x2="-34" y2="-10" stroke="#24324a" stroke-width="16" stroke-linecap="round"/><ellipse cx="-46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="30" y1="-235" x2="34" y2="-10" stroke="#24324a" stroke-width="16" stroke-linecap="round"/><ellipse cx="46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
      <g id="${id}-al"><line x1="-74" y1="-418" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="${skin}" ${SK}/></g>
      <path id="${id}-body" d="M-74,-425 Q-78,-440 -56,-442 L56,-442 Q78,-440 74,-425 L92,-205 Q93,-195 82,-195 L-82,-195 Q-93,-195 -92,-205 Z" fill="#ffffff" ${SK}/>
      <path d="M-32,-442 L0,-372 L32,-442 Z" fill="${o.scrub || "#22b59a"}" ${SK}/><path d="M-34,-436 Q-46,-330 0,-322 Q46,-330 34,-436" fill="none" stroke="#3a4a5a" stroke-width="6"/><circle cx="0" cy="-318" r="10" fill="#3a4a5a"/>
      <g id="${id}-head"><rect x="-18" y="-462" width="36" height="26" fill="${skin}" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="-522" r="72" fill="${skin}" ${SK}/>
      <path d="M-72,-530 Q-66,-604 0,-600 Q66,-604 72,-530 Q46,-566 0,-562 Q-46,-566 -72,-530 Z" fill="#2a2522" ${SK}/>
      ${eyes(id, -526, 24)}${brows(id, -550, 24)}<line id="${id}-m" x1="-16" y1="-482" x2="16" y2="-482" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
      <g id="${id}-ar"><line x1="74" y1="-418" x2="104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="106" cy="-252" r="16" fill="${skin}" ${SK}/></g>`;
    },
    // female doctor/pharmacist: hijab and white coat
    doctor_f(id, o = {}) {
      const skin = o.skin || "#f0cdb0";
      return `${shadow}${leg(id, "l")}${leg(id, "r")}${arm(id, "l", skin)}
      ${robe(id, "#ffffff", `<path d="M-30,-420 L0,-360 L30,-420" fill="${o.scrub || "#22b59a"}" ${SK}/><path d="M-34,-414 Q-46,-320 0,-312 Q46,-320 34,-414" fill="none" stroke="#3a4a5a" stroke-width="6"/>`)}
      <g id="${id}-head"><path d="M-94,-470 Q-104,-388 -58,-398 L58,-398 Q104,-388 94,-470 Z" fill="${o.scarf || "#1f5e6b"}" ${SK}/>
      <circle cx="0" cy="-502" r="90" fill="${o.scarf || "#1f5e6b"}" ${SK}/><circle cx="0" cy="-498" r="62" fill="${skin}" stroke="${INK}" stroke-width="5"/>
      ${eyes(id)}${brows(id)}${mouth(id)}</g>${arm(id, "r", skin)}`;
    },
    // shop seller / technician in a green shirt
    seller(id, o = {}) {
      const skin = o.skin || "#a8714c";
      return `${shadow}<g id="${id}-fl"><line x1="-28" y1="-200" x2="-32" y2="-10" stroke="#2b2f3a" stroke-width="15" stroke-linecap="round"/><ellipse cx="-44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="28" y1="-200" x2="32" y2="-10" stroke="#2b2f3a" stroke-width="15" stroke-linecap="round"/><ellipse cx="44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-al"><line x1="-70" y1="-410" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="${skin}" ${SK}/></g>
      <path id="${id}-body" d="M-72,-418 Q-76,-434 -54,-436 L54,-436 Q76,-434 72,-418 L86,-200 L-86,-200 Z" fill="${o.shirt || "#2f8a57"}" ${SK}/>
      <path d="M-26,-436 L0,-396 L26,-436" fill="#ffffff" ${SK}/>
      <g id="${id}-head"><rect x="-18" y="-460" width="36" height="28" fill="${skin}" stroke="${INK}" stroke-width="5"/><circle cx="0" cy="-520" r="68" fill="${skin}" ${SK}/>
      <path d="M-68,-530 Q-62,-598 0,-594 Q62,-598 68,-530 Q42,-562 0,-558 Q-42,-562 -68,-530 Z" fill="#1f1a17" ${SK}/>
      ${eyes(id, -524)}${brows(id, -548)}<path id="${id}-m" d="M-20,-484 Q0,-470 20,-484" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/></g>
      <g id="${id}-ar"><line x1="70" y1="-410" x2="104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="106" cy="-252" r="16" fill="${skin}" ${SK}/></g>`;
    },
    // Saudi / Gulf Factory Director / Business Executive with Safety Hard Hat & Hi-Vis Vest
    factory_boss(id, o = {}) {
      const skin = o.skin || "#d9a77f";
      return `${shadow}${leg(id, "l", "#c9b9a0", "#2c3e50")}${leg(id, "r", "#c9b9a0", "#2c3e50")}${arm(id, "l", skin)}
      ${robe(id, "#ffffff", `
        <path d="M-58,-400 L-25,-400 L-10,-120 L-68,-120 Z" fill="#f39c12" stroke="${INK}" stroke-width="4"/>
        <path d="M58,-400 L25,-400 L10,-120 L68,-120 Z" fill="#f39c12" stroke="${INK}" stroke-width="4"/>
        <line x1="-50" y1="-260" x2="-15" y2="-260" stroke="#ffffff" stroke-width="10"/>
        <line x1="50" y1="-260" x2="15" y2="-260" stroke="#ffffff" stroke-width="10"/>
      `)}
      <g id="${id}-head">
        <circle cx="0" cy="-506" r="66" fill="${skin}" ${SK}/>
        ${eyes(id, -508)}${brows(id, -532)}
        <path d="M-26,-484 Q0,-492 26,-484" fill="none" stroke="#2a1d16" stroke-width="7" stroke-linecap="round"/>
        <path d="M-30,-470 Q0,-430 30,-470" fill="#2a1d16" opacity=".85"/>
        ${mouth(id, -466, "#5a2620")}
        <path d="M-80,-525 Q-85,-610 0,-615 Q85,-610 80,-525 Z" fill="#f1c40f" ${SK}/>
        <path d="M-92,-525 L92,-525" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
        <rect x="-16" y="-590" width="32" height="18" rx="4" fill="#ffffff" stroke="${INK}" stroke-width="3"/>
      </g>
      ${arm(id, "r", skin)}`;
    },
    // Factory Technical Worker in Blue Coveralls & Helmet
    factory_worker(id, o = {}) {
      const skin = o.skin || "#a8714c";
      return `${shadow}<g id="${id}-fl"><line x1="-28" y1="-200" x2="-32" y2="-10" stroke="#1f2d3d" stroke-width="15" stroke-linecap="round"/><ellipse cx="-44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="28" y1="-200" x2="32" y2="-10" stroke="#1f2d3d" stroke-width="15" stroke-linecap="round"/><ellipse cx="44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-al"><line x1="-70" y1="-410" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="${skin}" ${SK}/></g>
      <path id="${id}-body" d="M-72,-418 Q-76,-434 -54,-436 L54,-436 Q76,-434 72,-418 L86,-200 L-86,-200 Z" fill="#2980b9" ${SK}/>
      <line x1="-40" y1="-280" x2="40" y2="-280" stroke="#f1c40f" stroke-width="8"/>
      <g id="${id}-head">
        <rect x="-18" y="-460" width="36" height="28" fill="${skin}" stroke="${INK}" stroke-width="5"/>
        <circle cx="0" cy="-520" r="68" fill="${skin}" ${SK}/>
        ${eyes(id, -524)}${brows(id, -548)}
        <path id="${id}-m" d="M-20,-484 Q0,-470 20,-484" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <path d="M-76,-540 Q-82,-620 0,-624 Q82,-620 76,-540 Z" fill="#e67e22" ${SK}/>
        <path d="M-86,-540 L86,-540" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      </g>
      <g id="${id}-ar"><line x1="70" y1="-410" x2="104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="106" cy="-252" r="16" fill="${skin}" ${SK}/></g>`;
    },
    // Dental patient in severe toothache pain: holding jaw, swollen cheek, ice pack bandage
    patient_pain(id, o = {}) {
      const skin = o.skin || "#d9a77f";
      return `${shadow}<g id="${id}-fl"><line x1="-28" y1="-200" x2="-32" y2="-10" stroke="#1f2937" stroke-width="15" stroke-linecap="round"/><ellipse cx="-44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="28" y1="-200" x2="32" y2="-10" stroke="#1f2937" stroke-width="15" stroke-linecap="round"/><ellipse cx="44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-al"><line x1="-70" y1="-410" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="${skin}" ${SK}/></g>
      <path id="${id}-body" d="M-72,-418 Q-76,-434 -54,-436 L54,-436 Q76,-434 72,-418 L86,-200 L-86,-200 Z" fill="${o.shirt || "#0284c7"}" ${SK}/>
      <path d="M-26,-436 L0,-396 L26,-436" fill="#ffffff" ${SK}/>
      <g id="${id}-head">
        <rect x="-18" y="-460" width="36" height="28" fill="${skin}" stroke="${INK}" stroke-width="5"/>
        <circle cx="0" cy="-520" r="68" fill="${skin}" ${SK}/>
        <path d="M-72,-490 Q-76,-390 0,-386 Q76,-390 72,-490 Q76,-600 0,-604 Q-76,-600 -72,-490 Z" fill="none" stroke="#f8fafc" stroke-width="26"/>
        <path d="M-72,-490 Q-76,-390 0,-386 Q76,-390 72,-490 Q76,-600 0,-604 Q-76,-600 -72,-490 Z" fill="none" stroke="${INK}" stroke-width="5"/>
        <ellipse cx="-16" cy="-612" rx="16" ry="12" fill="#f8fafc" ${SK}/>
        <ellipse cx="16" cy="-612" rx="16" ry="12" fill="#f8fafc" ${SK}/>
        <ellipse cx="44" cy="-485" rx="30" ry="24" fill="#fca5a5" stroke="#ef4444" stroke-width="4"/>
        <path d="M48,-495 L62,-505 M54,-485 L70,-485 M50,-472 L64,-465" stroke="#ef4444" stroke-width="3" stroke-linecap="round"/>
        <g id="${id}-eyes">
          <path d="M-36,-525 L-18,-518 M-36,-512 L-18,-518" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <path d="M18,-518 L36,-525 M18,-518 L36,-512" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        </g>
        <g id="${id}-brows">
          <line x1="-38" y1="-538" x2="-14" y2="-548" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
          <line x1="14" y1="-548" x2="38" y2="-538" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        </g>
        <path id="${id}-m" d="M-22,-465 Q-8,-450 0,-465 Q8,-450 20,-465" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <circle cx="-38" cy="-500" r="6" fill="#38bdf8"/>
        <path id="${id}-spark" d="M68,-515 L86,-495 L72,-490 L92,-465" fill="none" stroke="#e11d48" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g id="${id}-ar">
        <path d="M70,-410 Q110,-350 56,-465" fill="none" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
        <circle cx="54" cy="-465" r="18" fill="${skin}" ${SK}/>
      </g>`;
    },
    // Modern Dentist: white coat over teal medical scrubs, dental loupe headlight, holding diagnostic tablet
    dentist_doctor(id, o = {}) {
      const skin = o.skin || "#e9c3a6";
      return `${shadow}<g id="${id}-fl"><line x1="-30" y1="-235" x2="-34" y2="-10" stroke="#1e293b" stroke-width="16" stroke-linecap="round"/><ellipse cx="-46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="30" y1="-235" x2="34" y2="-10" stroke="#1e293b" stroke-width="16" stroke-linecap="round"/><ellipse cx="46" cy="-6" rx="26" ry="11" fill="${INK}"/></g>
      <g id="${id}-al">
        <line x1="-74" y1="-418" x2="-100" y2="-280" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
        <circle cx="-100" cy="-280" r="16" fill="${skin}" ${SK}/>
        <g transform="translate(-150,-350)" data-layout-allow-occlusion="true" data-layout-allow-overflow="true">
          <rect x="0" y="0" width="105" height="135" rx="10" fill="#0f172a" ${SK}/>
          <rect x="6" y="6" width="93" height="123" rx="6" fill="#1e293b"/>
          <rect x="12" y="14" width="81" height="24" rx="4" fill="#0d9488"/>
          <text x="52" y="30" text-anchor="middle" font-size="11" font-weight="900" fill="#ffffff" font-family="Cairo" data-layout-allow-occlusion="true">TRIAGE #46</text>
          <path d="M35,62 C32,48 42,42 52,48 C62,42 72,48 69,62 C66,74 62,88 62,98 C58,102 54,95 52,90 C50,95 46,102 42,98 C42,88 38,74 35,62 Z" fill="#ffffff" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="58" cy="62" r="8" fill="#ef4444" opacity="0.85"/>
          <text x="52" y="118" text-anchor="middle" font-size="10" font-weight="900" fill="#4ade80" font-family="Cairo" data-layout-allow-occlusion="true">READY ✓</text>
        </g>
      </g>
      <path id="${id}-body" d="M-74,-425 Q-78,-440 -56,-442 L56,-442 Q78,-440 74,-425 L92,-205 Q93,-195 82,-195 L-82,-195 Q-93,-195 -92,-205 Z" fill="#ffffff" ${SK}/>
      <path d="M-32,-442 L0,-372 L32,-442 Z" fill="#0d9488" ${SK}/>
      <rect x="25" y="-390" width="28" height="38" rx="4" fill="#f8fafc" stroke="${INK}" stroke-width="2"/>
      <line x1="30" y1="-380" x2="48" y2="-380" stroke="#0d9488" stroke-width="3"/>
      <g id="${id}-head">
        <rect x="-18" y="-462" width="36" height="26" fill="${skin}" stroke="${INK}" stroke-width="5"/>
        <circle cx="0" cy="-522" r="72" fill="${skin}" ${SK}/>
        <path d="M-72,-530 Q-66,-604 0,-600 Q66,-604 72,-530 Q46,-566 0,-562 Q-46,-566 -72,-530 Z" fill="#1e293b" ${SK}/>
        <line x1="-66" y1="-560" x2="66" y2="-560" stroke="${INK}" stroke-width="6"/>
        <circle cx="0" cy="-565" r="15" fill="#e2e8f0" ${SK}/>
        <circle cx="0" cy="-565" r="8" fill="#38bdf8"/>
        ${eyes(id, -526, 24)}${brows(id, -550, 24)}
        <path id="${id}-m" d="M-22,-480 Q0,-458 22,-480" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      </g>
      <g id="${id}-ar"><line x1="74" y1="-418" x2="104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="106" cy="-252" r="16" fill="${skin}" ${SK}/></g>`;
    },
    // Relieved, smiling dental patient with sparkling clean teeth and thumbs up
    patient_happy(id, o = {}) {
      const skin = o.skin || "#d9a77f";
      return `${shadow}<g id="${id}-fl"><line x1="-28" y1="-200" x2="-32" y2="-10" stroke="#1f2937" stroke-width="15" stroke-linecap="round"/><ellipse cx="-44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-fr"><line x1="28" y1="-200" x2="32" y2="-10" stroke="#1f2937" stroke-width="15" stroke-linecap="round"/><ellipse cx="44" cy="-6" rx="25" ry="10" fill="${INK}"/></g>
      <g id="${id}-al"><line x1="-70" y1="-410" x2="-104" y2="-262" stroke="${INK}" stroke-width="11" stroke-linecap="round"/><circle cx="-106" cy="-252" r="16" fill="${skin}" ${SK}/></g>
      <path id="${id}-body" d="M-72,-418 Q-76,-434 -54,-436 L54,-436 Q76,-434 72,-418 L86,-200 L-86,-200 Z" fill="${o.shirt || "#10b981"}" ${SK}/>
      <path d="M-26,-436 L0,-396 L26,-436" fill="#ffffff" ${SK}/>
      <g id="${id}-head">
        <rect x="-18" y="-460" width="36" height="28" fill="${skin}" stroke="${INK}" stroke-width="5"/>
        <circle cx="0" cy="-520" r="68" fill="${skin}" ${SK}/>
        <path d="M-68,-530 Q-62,-598 0,-594 Q62,-598 68,-530 Q42,-562 0,-558 Q-42,-562 -68,-530 Z" fill="#1f1a17" ${SK}/>
        ${eyes(id, -524)}
        <line x1="-34" y1="-546" x2="-12" y2="-542" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <line x1="12" y1="-542" x2="34" y2="-546" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
        <path id="${id}-m" d="M-26,-480 Q0,-448 26,-480 Z" fill="#ffffff" stroke="${INK}" stroke-width="5"/>
        <circle cx="-35" cy="-485" r="9" fill="#fca5a5" opacity="0.6"/>
        <circle cx="35" cy="-485" r="9" fill="#fca5a5" opacity="0.6"/>
        <path d="M12,-480 L18,-490 L24,-480 L18,-470 Z" fill="#38bdf8"/>
      </g>
      <g id="${id}-ar">
        <line x1="70" y1="-410" x2="95" y2="-320" stroke="${INK}" stroke-width="11" stroke-linecap="round"/>
        <circle cx="95" cy="-320" r="16" fill="${skin}" ${SK}/>
        <path d="M95,-320 L95,-338" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
      </g>`;
    },
  };

  // ======================= ART v2 (2026-11-12) =======================
  // Shaded flat style: soft gradients instead of heavy ink, real sleeves and hands, eyes with highlights, visible brows,
  // beard, shemagh pattern, contact shadow, and an idle layer (breathing, blinks, head drift, cloth sway).
  // Same rig ids as v1 (-fl -fr -al -ar -body -head -eyes -brows -m) so every beat keeps working; parts carry
  // data-pivot="x y" (character coordinates) so arms turn on the shoulder and the head on the neck.
  // Fall back to v1 per character with opts.art = 1, or for a whole composition with window.SF_ART = 1.
  const mix = (hex, f) => { const n = parseInt(String(hex).slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; const tg = f < 0 ? 0 : 255, p = Math.abs(f); r = Math.round(r + (tg - r) * p); g = Math.round(g + (tg - g) * p); b = Math.round(b + (tg - b) * p); return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1); };
  const ln = (c, w = 3.5) => `stroke="${c}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;
  const HY = -520;   // head centre y
  const V2 = {
    defs(id, c) {
      return `<defs><radialGradient id="${id}-sh"><stop offset="0" stop-color="#141821" stop-opacity=".34"/><stop offset="1" stop-color="#141821" stop-opacity="0"/></radialGradient>
      <linearGradient id="${id}-gs" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(c.skin, 0.1)}"/><stop offset="1" stop-color="${mix(c.skin, -0.1)}"/></linearGradient>
      <linearGradient id="${id}-gc" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mix(c.cloth, 0.1)}"/><stop offset=".55" stop-color="${c.cloth}"/><stop offset="1" stop-color="${mix(c.cloth, -0.14)}"/></linearGradient>
      <linearGradient id="${id}-gv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${mix(c.sleeve, 0.1)}"/><stop offset="1" stop-color="${mix(c.sleeve, -0.13)}"/></linearGradient>
      <linearGradient id="${id}-gh2" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${mix(c.scarf, 0.12)}"/><stop offset="1" stop-color="${mix(c.scarf, -0.16)}"/></linearGradient>
      <pattern id="${id}-shm" width="15" height="15" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="15" height="15" fill="#fbfaf7"/><rect width="7.5" height="7.5" fill="#c8323a"/></pattern></defs>`;
    },
    shadow: (id) => `<ellipse cx="0" cy="2" rx="122" ry="20" fill="url(#${id}-sh)"/>`,
    // feet under a robe: skin + sandal; pivot inside the robe so walking swings them
    sandal(id, side, c) {
      const s = side === "l" ? -1 : 1, x = 32 * s, st = c.strap || "#6b4a2e";
      return `<g id="${id}-f${side}" data-pivot="${x} -70"><path d="M${x - 24},-13 Q${x - 26},-31 ${x - 8},-35 L${x + 8},-35 Q${x + 26},-31 ${x + 24},-13 Q${x + 20},-3 ${x},-3 Q${x - 20},-3 ${x - 24},-13 Z" fill="url(#${id}-gs)" ${ln(mix(c.skin, -0.45), 3)}/>
      <rect x="${x - 31}" y="-9" width="62" height="11" rx="5.5" fill="${st}"/><path d="M${x - 17},-25 Q${x},-15 ${x + 17},-25" fill="none" ${ln(st, 6)}/></g>`;
    },
    // trouser leg + shoe; pivot at the hip
    leg(id, side, c) {
      const s = side === "l" ? -1 : 1, x = 34 * s, p = c.pant || "#2b3445", sh = c.shoe || "#23272e";
      return `<g id="${id}-f${side}" data-pivot="${x} -236"><path d="M${x - 25},-244 L${x + 25},-244 L${x + 21},-26 L${x - 21},-26 Z" fill="${p}" ${ln(mix(p, -0.45), 3)}/><path d="M${x + 12 * s},-238 L${x + 10 * s},-30" ${ln(mix(p, 0.12), 3)} opacity=".5"/>
      <path d="M${x - 26},-10 Q${x - 24},-34 ${x},-34 Q${x + 26},-34 ${x + 26 + 14 * s},-12 Q${x + 26 + 14 * s},2 ${x + 6 * s},2 L${x - 18},2 Q${x - 27},2 ${x - 26},-10 Z" fill="${sh}" ${ln(mix(sh, -0.5), 3)}/><path d="M${x - 14},-27 Q${x + 4 * s},-31 ${x + 16 * s},-26" fill="none" stroke="#fff" stroke-width="3" opacity=".18"/></g>`;
    },
    // long robe (thobe, jalabiya, abaya); extra = collar, vest, trims
    robe(id, c, extra = "") {
      const cl = mix(c.cloth, -0.42);
      return `<g id="${id}-body"><path d="M-66,-414 C-82,-410 -90,-396 -90,-372 L-106,-50 Q-106,-38 -94,-38 L94,-38 Q106,-38 106,-50 L90,-372 C90,-396 82,-410 66,-414 Z" fill="url(#${id}-gc)" ${ln(cl)}/>
      <path d="M26,-410 C60,-300 76,-160 66,-39 L94,-39 Q105,-39 105,-50 L90,-372 C90,-396 82,-410 66,-414 Z" fill="#000" opacity=".06"/>
      <path d="M-30,-300 Q-44,-170 -54,-46" fill="none" ${ln(cl, 3)} opacity=".28"/><path d="M34,-226 Q38,-130 32,-46" fill="none" ${ln(cl, 3)} opacity=".22"/>${extra}</g>`;
    },
    // shirt / coat / coveralls down to `bot`
    torso(id, c, bot = -214, extra = "") {
      const cl = mix(c.cloth, -0.42), hw = bot > -200 ? 92 : 86;
      return `<g id="${id}-body"><path d="M-66,-414 C-82,-410 -90,-396 -90,-372 L-${hw},${bot - 10} Q-${hw},${bot} -${hw - 10},${bot} L${hw - 10},${bot} Q${hw},${bot} ${hw},${bot - 10} L90,-372 C90,-396 82,-410 66,-414 Z" fill="url(#${id}-gc)" ${ln(cl)}/>
      <path d="M26,-410 C58,-330 70,-260 ${hw - 18},${bot} L${hw - 10},${bot} Q${hw},${bot} ${hw},${bot - 10} L90,-372 C90,-396 82,-410 66,-414 Z" fill="#000" opacity=".06"/>${extra}</g>`;
    },
    neck: (c) => `<path d="M-22,-452 L22,-452 L24,-408 Q0,-398 -24,-408 Z" fill="${mix(c.skin, -0.2)}"/>`,
    hand(c, x, y, rot = 0) {
      return `<g transform="translate(${x},${y}) rotate(${rot})"><path d="M-17,-4 C-21,16 -15,36 -3,42 C9,47 19,37 18,19 C17,5 13,-5 9,-9 Z" fill="${c.skin}" ${ln(mix(c.skin, -0.45), 3)}/><path d="M-15,6 C-25,12 -25,24 -17,28" fill="none" ${ln(mix(c.skin, -0.45), 3)}/></g>`;
    },
    // right arm hanging (pivot 70,-398); the left arm is the same drawing mirrored
    arm(id, c) {
      const cl = mix(c.sleeve, -0.42);
      return `<path d="M50,-410 C72,-420 94,-408 98,-384 L114,-282 Q104,-266 84,-272 L64,-384 Z" fill="url(#${id}-gv)" ${ln(cl)}/>
      <path d="M84,-272 L114,-282 L117,-263 Q104,-251 86,-255 Z" fill="${mix(c.sleeve, -0.08)}" ${ln(cl, 3)}/>${V2.hand(c, 103, -252)}`;
    },
    // bent right arm: shoulder -> elbow -> hand (for hand-on-cheek, thumbs up, holding)
    bent(c, ex, ey, hx, hy) {
      const d = `M70,-396 Q${ex},${ey} ${hx},${hy}`;
      return `<path d="${d}" fill="none" stroke="${mix(c.sleeve, -0.42)}" stroke-width="42" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c.sleeve}" stroke-width="35" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".12" transform="translate(-6,-4)"/>`;
    },
    face(id, c, ears = true) {
      const y = HY, sh = mix(c.skin, -0.17), lc = mix(c.skin, -0.5);
      return `${ears ? `<ellipse cx="-75" cy="${y + 4}" rx="13" ry="20" fill="${sh}" ${ln(lc, 3)}/><ellipse cx="75" cy="${y + 4}" rx="13" ry="20" fill="${sh}" ${ln(lc, 3)}/>` : ""}
      <path d="M0,${y - 80} C46,${y - 80} 76,${y - 48} 76,${y - 2} C76,${y + 40} 50,${y + 76} 0,${y + 80} C-50,${y + 76} -76,${y + 40} -76,${y - 2} C-76,${y - 48} -46,${y - 80} 0,${y - 80} Z" fill="url(#${id}-gs)" ${ln(lc)}/>
      <path d="M30,${y - 74} C66,${y - 54} 78,${y - 6} 70,${y + 34} C60,${y + 64} 34,${y + 78} 4,${y + 80} C46,${y + 52} 58,${y - 6} 30,${y - 74} Z" fill="${sh}" opacity=".45"/>
      <ellipse cx="-42" cy="${y + 26}" rx="16" ry="9" fill="#e8806b" opacity=".22"/><ellipse cx="42" cy="${y + 26}" rx="16" ry="9" fill="#e8806b" opacity=".22"/>
      <path d="M-4,${y + 6} Q3,${y + 26} -2,${y + 31} Q7,${y + 34} 11,${y + 29}" fill="none" ${ln(lc, 3.5)}/>`;
    },
    eyes(id, c, kind = "open") {
      const y = HY - 8;
      if (kind === "squeeze") return `<g id="${id}-eyes"><path d="M-44,${y - 8} L-16,${y} L-44,${y + 8}" fill="none" ${ln("#1f1611", 5.5)}/><path d="M44,${y - 8} L16,${y} L44,${y + 8}" fill="none" ${ln("#1f1611", 5.5)}/></g><g id="${id}-lids" opacity="0"></g>`;
      const one = (x) => `<ellipse cx="${x}" cy="${y}" rx="14.5" ry="16.5" fill="#ffffff" ${ln("#2a1d16", 2.5)}/><circle cx="${x + 2}" cy="${y + 2}" r="10.5" fill="${c.iris || "#3a2414"}"/><circle cx="${x + 2}" cy="${y + 2}" r="5.6" fill="#0d0907"/><circle cx="${x + 6.5}" cy="${y - 3.5}" r="3.8" fill="#fff"/><circle cx="${x - 2.5}" cy="${y + 6.5}" r="1.7" fill="#fff" opacity=".85"/><path d="M${x - 16},${y - 5} Q${x},${y - 21} ${x + 16},${y - 5}" fill="none" ${ln("#1f1611", 4.5)}/>`;
      const lid = (x) => `<path d="M${x - 17},${y - 3} Q${x},${y - 23} ${x + 17},${y - 3} L${x + 17},${y + 18} L${x - 17},${y + 18} Z" fill="${c.skin}"/><path d="M${x - 16},${y + 14} Q${x},${y + 19} ${x + 16},${y + 14}" fill="none" ${ln("#1f1611", 4)}/>`;
      return `<g id="${id}-eyes">${one(-29)}${one(29)}</g><g id="${id}-lids" opacity="0">${lid(-29)}${lid(29)}</g>`;
    },
    brows(id, c) {
      const y = HY - 44, col = c.brow || c.hair || "#2a1d16";
      return `<g id="${id}-brows" data-rest="1"><path id="${id}-browl" d="M-48,${y + 5} Q-31,${y - 8} -12,${y + 1}" fill="none" ${ln(col, 7.5)}/><path id="${id}-browr" d="M12,${y + 1} Q31,${y - 8} 48,${y + 5}" fill="none" ${ln(col, 7.5)}/></g>`;
    },
    mouth(id, kind = "smile") {
      const y = HY + 50;
      if (kind === "wince") return `<g id="${id}-m"><path d="M-24,${y} L-12,${y - 7} L0,${y} L12,${y - 7} L24,${y}" fill="none" ${ln("#4a1a16", 5)}/></g>`;
      if (kind === "grin") return `<g id="${id}-m"><path d="M-30,${y - 6} Q0,${y + 30} 30,${y - 6} Z" fill="#6b2a24" ${ln("#3b1612", 3)}/><path d="M-25,${y - 4} Q0,${y + 4} 25,${y - 4} L24,${y + 2} Q0,${y + 9} -24,${y + 2} Z" fill="#fff"/></g>`;
      return `<g id="${id}-m"><path d="M-19,${y - 2} Q0,${y + 10} 19,${y - 2} Q0,${y + 3} -19,${y - 2} Z" fill="#6b2a24" ${ln("#3b1612", 2.5)}/><path d="M-11,${y + 0.5} Q0,${y + 2.5} 11,${y + 0.5}" fill="none" stroke="#fff" stroke-width="2" opacity=".85"/></g>`;
    },
    beard(c, full = true) {
      const y = HY, col = c.beard || "#2a1d16";
      return `${full ? `<path d="M-72,${y + 8} C-70,${y + 54} -44,${y + 88} 0,${y + 90} C44,${y + 88} 70,${y + 54} 72,${y + 8} C64,${y + 42} 44,${y + 64} 22,${y + 66} Q0,${y + 72} -22,${y + 66} C-44,${y + 64} -64,${y + 42} -72,${y + 8} Z" fill="${col}"/>` : ""}
      <path d="M-31,${y + 41} Q-15,${y + 30} 0,${y + 37} Q15,${y + 30} 31,${y + 41} Q15,${y + 45} 0,${y + 42} Q-15,${y + 45} -31,${y + 41} Z" fill="${col}"/>`;
    },
    ghutra(id) {
      const y = HY, edge = `${ln("#8a2328", 3)}`;
      const back = `<g id="${id}-gh" data-pivot="0 ${y - 40}"><path d="M-98,${y - 40} C-114,${y + 60} -106,${y + 122} -86,${y + 138} L86,${y + 138} C106,${y + 122} 114,${y + 60} 98,${y - 40} Z" fill="url(#${id}-shm)" ${edge}/><path d="M-98,${y - 40} C-114,${y + 60} -106,${y + 122} -86,${y + 138} L86,${y + 138} C106,${y + 122} 114,${y + 60} 98,${y - 40} Z" fill="#000" opacity=".07"/></g>`;
      const top = `<path d="M-100,${y - 22} C-106,${y - 112} -48,${y - 130} 0,${y - 130} C48,${y - 130} 106,${y - 112} 100,${y - 22} C90,${y - 52} 62,${y - 80} 0,${y - 82} C-62,${y - 80} -90,${y - 52} -100,${y - 22} Z" fill="url(#${id}-shm)" ${edge}/>
      <path d="M-100,${y - 22} C-90,${y - 52} -62,${y - 80} 0,${y - 82} C62,${y - 80} 90,${y - 52} 100,${y - 22}" fill="none" stroke="#000" stroke-width="8" opacity=".08"/>
      <ellipse cx="0" cy="${y - 100}" rx="88" ry="15" fill="none" stroke="#141414" stroke-width="11"/><ellipse cx="0" cy="${y - 114}" rx="80" ry="13" fill="none" stroke="#141414" stroke-width="10"/><path d="M-70,${y - 108} Q0,${y - 122} 70,${y - 108}" fill="none" stroke="#6a6a6a" stroke-width="2.5" opacity=".7"/>`;
      return { back, top };
    },
    imma() {
      const y = HY, s = "#d6d0c2";
      return `<path d="M-86,${y - 30} C-94,${y - 112} -44,${y - 136} 0,${y - 136} C44,${y - 136} 94,${y - 112} 86,${y - 30} C52,${y - 54} -52,${y - 54} -86,${y - 30} Z" fill="#fbfbf7" ${ln("#b5ad9c", 3)}/>
      <path d="M-82,${y - 54} C-40,${y - 80} 40,${y - 80} 82,${y - 54}" fill="none" ${ln(s, 5)}/><path d="M-74,${y - 82} C-30,${y - 106} 30,${y - 106} 74,${y - 82}" fill="none" ${ln(s, 5)}/><path d="M-52,${y - 110} C-20,${y - 126} 20,${y - 126} 52,${y - 110}" fill="none" ${ln(s, 4)}/>
      <path d="M-86,${y - 30} C-52,${y - 54} 52,${y - 54} 86,${y - 30}" fill="none" stroke="#000" stroke-width="7" opacity=".08"/>`;
    },
    hijab(id, c) {
      const y = HY, lc = mix(c.scarf, -0.45);
      const back = `<g id="${id}-gh" data-pivot="0 ${y}"><path d="M-106,${y - 6} C-114,${y + 82} -98,${y + 128} -72,${y + 140} L72,${y + 140} C98,${y + 128} 114,${y + 82} 106,${y - 6} Z" fill="url(#${id}-gh2)" ${ln(lc)}/></g>`;
      const top = `<path d="M0,${y - 114} C64,${y - 114} 108,${y - 70} 106,${y - 6} C104,${y + 54} 78,${y + 98} 40,${y + 110} L-40,${y + 110} C-78,${y + 98} -104,${y + 54} -106,${y - 6} C-108,${y - 70} -64,${y - 114} 0,${y - 114} Z M0,${y - 84} C-46,${y - 84} -70,${y - 46} -70,${y - 2} C-70,${y + 42} -44,${y + 78} 0,${y + 82} C44,${y + 78} 70,${y + 42} 70,${y - 2} C70,${y - 46} 46,${y - 84} 0,${y - 84} Z" fill="url(#${id}-gh2)" fill-rule="evenodd" ${ln(lc)}/>
      <path d="M-62,${y - 92} C-30,${y - 106} 30,${y - 106} 62,${y - 92}" fill="none" stroke="#fff" stroke-width="5" opacity=".2"/><path d="M58,${y + 60} C70,${y + 84} 66,${y + 104} 44,${y + 110}" fill="none" ${ln(lc, 3)} opacity=".5"/>`;
      return { back, top };
    },
    hair(c) {
      const y = HY, h = c.hair || "#1f1813";
      return `<path d="M-79,${y - 4} C-86,${y - 70} -46,${y - 100} 0,${y - 100} C48,${y - 100} 86,${y - 70} 79,${y - 4} C72,${y - 34} 54,${y - 54} 20,${y - 60} C0,${y - 52} -40,${y - 54} -60,${y - 38} C-70,${y - 30} -75,${y - 18} -79,${y - 4} Z" fill="${h}" ${ln(mix(h, -0.4), 3)}/><path d="M-42,${y - 86} Q0,${y - 98} 42,${y - 86}" fill="none" stroke="#fff" stroke-width="4" opacity=".14"/>`;
    },
    // Meme faces (2026-11-12, docs/viral-playbook-2026-11-12.md): exaggerated full-face reactions, the engine of
    // "stick & meme explainer" and 沙雕 animation. Hidden layers drawn over the head; the `face` beat swaps one in.
    memes(id, c) {
      const y = HY, ink = "#1f1611", bc = c.brow || c.hair || "#2a1d16", mo = "#4a1a16";
      const G = (k, s) => `<g id="${id}-fx-${k}" opacity="0">${s}</g>`;
      const br = (d, w = 8) => `<path d="${d}" fill="none" ${ln(bc, w)}/>`;
      const eye = (x, r) => `<circle cx="${x}" cy="${y - 10}" r="${r}" fill="#fff" ${ln(ink, 3)}/>`;
      const dot = (x, r = 6, dy = -10) => `<circle cx="${x}" cy="${y + dy}" r="${r}" fill="${ink}"/>`;
      const star = (cx, cy, R, f) => `<path d="M${cx},${cy - R} Q${cx + R * 0.2},${cy - R * 0.2} ${cx + R},${cy} Q${cx + R * 0.2},${cy + R * 0.2} ${cx},${cy + R} Q${cx - R * 0.2},${cy + R * 0.2} ${cx - R},${cy} Q${cx - R * 0.2},${cy - R * 0.2} ${cx},${cy - R} Z" fill="${f}" ${ln(mix(f, -0.35), 2.5)}/>`;
      const heart = (cx, cy, s) => `<path d="M${cx},${cy + s * 0.9} C${cx - s * 1.5},${cy - s * 0.1} ${cx - s * 0.65},${cy - s * 1.15} ${cx},${cy - s * 0.3} C${cx + s * 0.65},${cy - s * 1.15} ${cx + s * 1.5},${cy - s * 0.1} ${cx},${cy + s * 0.9} Z" fill="#ef4444" ${ln("#b91c1c", 2.5)}/><circle cx="${cx - s * 0.45}" cy="${cy - s * 0.35}" r="${s * 0.16}" fill="#fff" opacity=".8"/>`;
      const grin = `<path d="M-30,${y + 40} Q0,${y + 34} 30,${y + 40} Q26,${y + 76} 0,${y + 76} Q-26,${y + 76} -30,${y + 40} Z" fill="${mo}" ${ln("#2b0f0c", 3)}/><path d="M-24,${y + 42} Q0,${y + 37} 24,${y + 42} L22,${y + 50} Q0,${y + 45} -22,${y + 50} Z" fill="#fff"/><ellipse cx="0" cy="${y + 67}" rx="12" ry="6" fill="#d9655b"/>`;
      const upL = br(`M-52,${y - 58} Q-31,${y - 74} -10,${y - 60}`), upR = br(`M10,${y - 60} Q31,${y - 74} 52,${y - 58}`);
      return G("shock", `${upL}${upR}${eye(-30, 25)}${eye(30, 25)}${dot(-30)}${dot(30)}<ellipse cx="0" cy="${y + 54}" rx="17" ry="23" fill="${mo}" ${ln("#2b0f0c", 3)}/><ellipse cx="0" cy="${y + 66}" rx="10" ry="8" fill="#d9655b"/><path d="M-70,${y - 36} v20 M-60,${y - 46} v24 M-50,${y - 52} v18" ${ln("#5b7fb8", 4)} opacity=".85"/>`)
        + G("cry", `${br(`M-50,${y - 40} Q-30,${y - 58} -12,${y - 56}`)}${br(`M12,${y - 56} Q30,${y - 58} 50,${y - 40}`)}<path d="M-46,${y - 6} Q-30,${y - 24} -14,${y - 6}" fill="none" ${ln(ink, 6)}/><path d="M14,${y - 6} Q30,${y - 24} 46,${y - 6}" fill="none" ${ln(ink, 6)}/><path d="M-41,${y - 2} C-45,${y + 30} -41,${y + 60} -46,${y + 96} L-22,${y + 96} C-19,${y + 60} -22,${y + 30} -19,${y - 2} Z" fill="#7dd3fc" ${ln("#38bdf8", 2)} opacity=".92"/><path d="M41,${y - 2} C45,${y + 30} 41,${y + 60} 46,${y + 96} L22,${y + 96} C19,${y + 60} 22,${y + 30} 19,${y - 2} Z" fill="#7dd3fc" ${ln("#38bdf8", 2)} opacity=".92"/>${grin}`)
        + G("rage", `<circle cx="0" cy="${y}" r="74" fill="#e03131" opacity=".24"/>${br(`M-54,${y - 56} L-10,${y - 34}`, 10)}${br(`M54,${y - 56} L10,${y - 34}`, 10)}<path d="M-47,${y - 16} Q-30,${y - 22} -13,${y - 8} Q-30,${y + 8} -47,${y - 16} Z" fill="#fff" ${ln(ink, 3)}/><path d="M47,${y - 16} Q30,${y - 22} 13,${y - 8} Q30,${y + 8} 47,${y - 16} Z" fill="#fff" ${ln(ink, 3)}/>${dot(-27, 5, -9)}${dot(27, 5, -9)}<rect x="-28" y="${y + 40}" width="56" height="25" rx="6" fill="#fff" ${ln(ink, 4)}/><path d="M-28,${y + 52.5} H28 M-14,${y + 40} V${y + 65} M0,${y + 40} V${y + 65} M14,${y + 40} V${y + 65}" ${ln(ink, 2.5)}/><g transform="translate(56,${y - 74})" fill="none" ${ln("#e03131", 5.5)}><path d="M-13,-4 Q-4,-4 -4,-13 M4,-13 Q4,-4 13,-4 M13,4 Q4,4 4,13 M-4,13 Q-4,4 -13,4"/></g>`)
        + G("smug", `${br(`M-50,${y - 40} H-12`)}${br(`M12,${y - 56} Q30,${y - 68} 50,${y - 52}`)}<path d="M-46,${y - 12} H-14 Q-14,${y + 7} -30,${y + 7} Q-46,${y + 7} -46,${y - 12} Z" fill="#fff" ${ln(ink, 3)}/><path d="M14,${y - 12} H46 Q46,${y + 7} 30,${y + 7} Q14,${y + 7} 14,${y - 12} Z" fill="#fff" ${ln(ink, 3)}/>${dot(-22, 6, -4)}${dot(38, 6, -4)}<path d="M-18,${y + 54} Q6,${y + 62} 28,${y + 42}" fill="none" ${ln(mo, 6)}/><path d="M25,${y + 36} Q32,${y + 42} 28,${y + 49}" fill="none" ${ln(mo, 4)}/>`)
        + G("dead", `${br(`M-50,${y - 42} H-12`)}${br(`M12,${y - 42} H50`)}<path d="M-45,${y - 8} H-15 M15,${y - 8} H45" ${ln(ink, 7)}/><path d="M-46,${y + 6} Q-30,${y + 15} -14,${y + 6} M14,${y + 6} Q30,${y + 15} 46,${y + 6}" fill="none" ${ln("#6b5b73", 4)} opacity=".55"/><path d="M-16,${y + 53} H16" ${ln(mo, 6)}/>`)
        + G("wow", `${upL}${upR}${star(-30, y - 10, 25, "#fbbf24")}${star(30, y - 10, 25, "#fbbf24")}<circle cx="-36" cy="${y - 17}" r="4" fill="#fff"/><circle cx="24" cy="${y - 17}" r="4" fill="#fff"/>${grin}`)
        + G("love", `${br(`M-50,${y - 48} Q-30,${y - 60} -12,${y - 50}`)}${br(`M12,${y - 50} Q30,${y - 60} 50,${y - 48}`)}${heart(-30, y - 10, 19)}${heart(30, y - 10, 19)}<path d="M-24,${y + 44} Q0,${y + 70} 24,${y + 44} Q0,${y + 54} -24,${y + 44} Z" fill="${mo}" ${ln("#2b0f0c", 3)}/>`)
        + G("nervous", `${br(`M-50,${y - 50} Q-30,${y - 62} -12,${y - 46}`)}${br(`M12,${y - 46} Q30,${y - 62} 50,${y - 50}`)}${eye(-30, 20)}${eye(30, 20)}${dot(-38, 6, -8)}${dot(22, 6, -8)}<path d="M-26,${y + 52} q6.5,-9 13,0 q6.5,9 13,0 q6.5,-9 13,0 q6.5,9 13,0" fill="none" ${ln(mo, 5)}/><path d="M64,${y - 34} q-13,24 0,33 q13,-9 0,-33 Z" fill="#7dd3fc" ${ln("#38bdf8", 2.5)}/>`);
    },
    helmet(c) {
      const y = HY, col = c.helmet || "#f1b80f", lc = mix(col, -0.45);
      return `<path d="M-82,${y - 44} C-84,${y - 122} -42,${y - 144} 0,${y - 144} C42,${y - 144} 84,${y - 122} 82,${y - 44} Z" fill="${col}" ${ln(lc)}/><rect x="-98" y="${y - 50}" width="196" height="17" rx="8.5" fill="${mix(col, -0.12)}" ${ln(lc)}/><path d="M-11,${y - 142} V${y - 50} M11,${y - 142} V${y - 50}" ${ln(mix(col, -0.2), 6)}/><path d="M-52,${y - 112} Q-32,${y - 130} -8,${y - 132}" fill="none" stroke="#fff" stroke-width="7" opacity=".35"/>`;
    },
  };
  // one builder for every character: outfit + headwear + face + pose
  function person(id, k) {
    const c = { skin: k.skin, cloth: k.cloth, sleeve: k.sleeve || k.cloth, scarf: k.scarf || "#c46d7a", hair: k.hair, brow: k.brow, beard: k.beard, iris: k.iris, helmet: k.helmet, strap: k.strap, pant: k.pant, shoe: k.shoe };
    const robe = ["thobe", "jalabiya", "abaya"].includes(k.outfit);
    const legs = robe ? V2.sandal(id, "l", c) + V2.sandal(id, "r", c) : V2.leg(id, "l", c) + V2.leg(id, "r", c);
    const body = robe ? V2.robe(id, c, k.bodyExtra || "") : V2.torso(id, c, k.bot || -214, k.bodyExtra || "");
    const hw = k.head === "ghutra" ? V2.ghutra(id) : k.head === "hijab" ? V2.hijab(id, c) : null;
    const over = hw ? hw.top : k.head === "imma" ? V2.imma() : k.head === "helmet" ? V2.helmet(c) : k.head === "hair" ? V2.hair(c) : "";
    // -fx0 holds the resting face (eyes, lids, brows, mouth); the meme layers sit on top of the headwear so raised brows stay visible
    const head = `${hw ? hw.back : ""}${V2.face(id, c, !hw && k.head !== "imma" && k.head !== "helmet")}${k.beard ? V2.beard(c, k.fullBeard !== false) : ""}<g id="${id}-fx0">${V2.eyes(id, c, k.eyes)}${V2.brows(id, c)}${V2.mouth(id, k.mouth)}</g>${k.faceExtra || ""}${over}${k.headExtra || ""}${V2.memes(id, c)}`;
    // -al/-ar take the beats (point, wave...); the inner -alS/-arS take the idle sway, so the two never fight
    // relaxed A-pose: hanging arms open 7 degrees so the silhouette reads (stiff vertical tubes looked like a paper doll)
    const armL = `<g id="${id}-al" data-pivot="-70 -398"><g id="${id}-alS" data-pivot="-70 -398"><g transform="scale(-1,1)"><g transform="rotate(-7 70 -398)">${V2.arm(id, c)}</g></g>${k.leftItem || ""}</g></g>`;
    const armR = `<g id="${id}-ar" data-pivot="70 -398"${k.rightArm ? ' data-bent="1"' : ""}><g id="${id}-arS" data-pivot="70 -398">${k.rightArm ? k.rightArm(c) : `<g transform="rotate(-7 70 -398)">${V2.arm(id, c)}</g>`}</g></g>`;
    return `${V2.defs(id, c)}<g id="${id}-idle">${V2.shadow(id)}${legs}${armL}${V2.neck(c)}${body}<g id="${id}-head" data-pivot="0 -446"><g id="${id}-hi" data-pivot="0 -446">${head}</g></g>${armR}</g>`;
  }
  const tablet = `<g transform="translate(-112,-268) rotate(-8)"><rect x="-58" y="-82" width="116" height="160" rx="14" fill="#0f172a" ${ln("#020617", 3)}/><rect x="-50" y="-74" width="100" height="144" rx="8" fill="#e6fbf6"/><rect x="-42" y="-64" width="84" height="20" rx="6" fill="#14b8a6"/><path d="M-12,-26 C-14,-38 -2,-42 0,-34 C2,-42 14,-38 12,-26 C10,-14 8,0 6,4 C3,6 1,-2 0,-6 C-1,-2 -3,6 -6,4 C-8,0 -10,-14 -12,-26 Z" fill="#fff" ${ln("#14b8a6", 2.5)}/><rect x="-42" y="22" width="84" height="10" rx="5" fill="#99f6e4"/><rect x="-42" y="40" width="58" height="10" rx="5" fill="#ccfbf1"/></g>`;
  const coatExtra = (scrub) => `<path d="M-26,-414 L0,-350 L26,-414 Z" fill="${scrub}" ${ln(mix(scrub, -0.4), 3)}/><path d="M-30,-414 L-10,-330 L-40,-290 M30,-414 L10,-330 L40,-290" fill="none" ${ln("#c9ced6", 3.5)}/><rect x="34" y="-330" width="34" height="40" rx="5" fill="none" ${ln("#c9ced6", 3)}/><path d="M44,-338 V-318" ${ln("#3b82f6", 4)}/>`;
  const CHAR2 = {
    man_gulf: (id, o = {}) => person(id, { skin: o.skin || "#cf9f78", cloth: o.dress || "#fbfaf7", outfit: "thobe", head: "ghutra", beard: "#2a1d16", hair: "#2a1d16", bodyExtra: `<path d="M-26,-418 Q0,-406 26,-418 L24,-402 Q0,-392 -24,-402 Z" fill="#efece6" ${ln("#b8b3aa", 2.5)}/><path d="M0,-398 V-300" ${ln("#c9c4ba", 3)}/><circle cx="0" cy="-376" r="3.5" fill="#c9c4ba"/><circle cx="0" cy="-346" r="3.5" fill="#c9c4ba"/>` }),
    man_sd: (id, o = {}) => person(id, { skin: o.skin || "#8a5638", cloth: o.dress || "#fbfbf8", outfit: "jalabiya", head: "imma", beard: "#1d140f", fullBeard: false, hair: "#1d140f", strap: "#7a5233", bodyExtra: `<path d="M-24,-414 Q0,-394 24,-414" fill="none" ${ln("#c9c4ba", 3.5)}/><path d="M0,-400 V-346" ${ln("#c9c4ba", 3)}/>` }),
    woman: (id, o = {}) => person(id, { skin: o.skin || "#f2d3bd", cloth: o.dress || "#2f3b4f", outfit: "abaya", head: "hijab", scarf: o.scarf || "#c46d7a", brow: "#4a2f24", iris: "#4a2a18", strap: "#3a2a22", bodyExtra: `<path d="M-14,-410 L-26,-40 M14,-410 L26,-40" ${ln(mix(o.dress || "#2f3b4f", 0.25), 3)} opacity=".6"/>` }),
    doctor_m: (id, o = {}) => person(id, { skin: o.skin || "#e3b998", cloth: "#fbfbfb", outfit: "coat", bot: -150, head: "hair", hair: "#2a2522", pant: "#24324a", bodyExtra: coatExtra(o.scrub || "#22b59a") + `<path d="M-30,-410 C-60,-330 -40,-280 -6,-300 M30,-410 C60,-330 40,-280 6,-300" fill="none" ${ln("#3a4a5a", 5)}/><circle cx="0" cy="-296" r="11" fill="#3a4a5a"/>` }),
    doctor_f: (id, o = {}) => person(id, { skin: o.skin || "#efcbb0", cloth: "#fbfbfb", outfit: "coat", bot: -150, head: "hijab", scarf: o.scarf || "#1f5e6b", brow: "#4a2f24", pant: "#2b3445", bodyExtra: coatExtra(o.scrub || "#22b59a") }),
    seller: (id, o = {}) => person(id, { skin: o.skin || "#a8714c", cloth: o.shirt || "#2f8a57", outfit: "shirt", head: "hair", hair: "#1f1a17", pant: "#2b2f3a", bodyExtra: `<path d="M-24,-414 L0,-382 L24,-414" fill="#fff" ${ln("#c9ced6", 3)}/><path d="M0,-382 V-224" ${ln(mix(o.shirt || "#2f8a57", -0.3), 3)}/>` }),
    factory_boss: (id, o = {}) => person(id, { skin: o.skin || "#cf9f78", cloth: "#fbfaf7", outfit: "thobe", head: "helmet", helmet: "#f1c40f", beard: "#2a1d16", hair: "#2a1d16", bodyExtra: `<path d="M-64,-404 L-24,-404 L-12,-150 L-78,-150 Z M64,-404 L24,-404 L12,-150 L78,-150 Z" fill="#f39c12" ${ln("#a85f07", 3)}/><path d="M-72,-262 L-20,-262 M72,-262 L20,-262" ${ln("#e8eef3", 9)}/>` }),
    factory_worker: (id, o = {}) => person(id, { skin: o.skin || "#a8714c", cloth: "#2f74b5", outfit: "coveralls", bot: -150, head: "helmet", helmet: "#e67e22", hair: "#1f1a17", pant: "#2a63a0", bodyExtra: `<path d="M-84,-268 L84,-268" ${ln("#f1c40f", 10)}/><rect x="-60" y="-376" width="38" height="44" rx="6" fill="none" ${ln("#1f5a8f", 3)}/>` }),
    patient_pain: (id, o = {}) => person(id, { skin: o.skin || "#cf9f78", cloth: o.shirt || "#0284c7", outfit: "shirt", head: "hair", hair: "#1f1a17", eyes: "squeeze", mouth: "wince", pant: "#1f2937",
      faceExtra: `<ellipse cx="46" cy="${HY + 34}" rx="30" ry="24" fill="#f4a3a3" opacity=".75"/><path d="M-50,${HY - 30} q-6,14 2,20 q8,-6 -2,-20 Z" fill="#7dd3fc"/><path id="${id}-spark" d="M94,${HY - 6} L112,${HY + 12} L98,${HY + 18} L118,${HY + 42}" fill="none" ${ln("#e11d48", 6)}/>`,
      headExtra: `<path d="M-80,${HY + 6} Q-84,${HY + 96} 0,${HY + 100} Q84,${HY + 96} 80,${HY + 6}" fill="none" stroke="#f8fafc" stroke-width="22"/><path d="M-80,${HY + 6} Q-84,${HY + 96} 0,${HY + 100} Q84,${HY + 96} 80,${HY + 6}" fill="none" ${ln("#cbd5e1", 3)}/><ellipse cx="-16" cy="${HY - 104}" rx="18" ry="12" fill="#f8fafc" ${ln("#cbd5e1", 3)}/><ellipse cx="16" cy="${HY - 104}" rx="18" ry="12" fill="#f8fafc" ${ln("#cbd5e1", 3)}/>`,
      bodyExtra: `<path d="M-24,-414 L0,-382 L24,-414" fill="#fff" ${ln("#c9ced6", 3)}/>`,
      rightArm: (c) => V2.bent(c, 150, -320, 82, -468) + V2.hand(c, 82, -470, 160) }),
    dentist_doctor: (id, o = {}) => person(id, { skin: o.skin || "#e3b998", cloth: "#fbfbfb", outfit: "coat", bot: -150, head: "hair", hair: "#1e293b", pant: "#1e293b", bodyExtra: coatExtra("#0d9488"),
      headExtra: `<path d="M-78,${HY - 40} Q0,${HY - 76} 78,${HY - 40}" fill="none" ${ln("#334155", 8)}/><circle cx="0" cy="${HY - 62}" r="18" fill="#e2e8f0" ${ln("#334155", 3)}/><circle cx="0" cy="${HY - 62}" r="9" fill="#7dd3fc"/>`,
      leftItem: tablet }),
    patient_happy: (id, o = {}) => person(id, { skin: o.skin || "#cf9f78", cloth: o.shirt || "#10b981", outfit: "shirt", head: "hair", hair: "#1f1a17", mouth: "grin", pant: "#1f2937",
      faceExtra: `<path d="M22,${HY + 56} l5,-9 l5,9 l-5,9 Z" fill="#38bdf8"/>`, bodyExtra: `<path d="M-24,-414 L0,-382 L24,-414" fill="#fff" ${ln("#c9ced6", 3)}/>`,
      rightArm: (c) => V2.bent(c, 150, -300, 122, -370) + `<g transform="translate(122,-372)"><circle r="20" fill="${c.skin}" ${ln(mix(c.skin, -0.45), 3)}/><rect x="-7" y="-46" width="14" height="32" rx="7" fill="${c.skin}" ${ln(mix(c.skin, -0.45), 3)}/></g>` }),
  };

  // ---------------- v2 props ----------------
  // Same local origin, size and sub-ids as v1, because beats drive them: inverter -screen -led -spark, ac -led -air,
  // battery -lvl, clock -hand (spun around 0,0), lamp -glow, laptop/phoneHand -scr, jars -j0.., panelBox -box, siren -light -glow.
  // Props without a v2 drawing (the job-specific UI cards) get soften() at hydrate: thin outlines tinted by their own fill.
  const woodG = (id) => `<linearGradient id="${id}-gw" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#cfa06a"/><stop offset="1" stop-color="#a87846"/></linearGradient>`;
  const jar2 = (c, jid = "") => `<g ${jid ? `id="${jid}"` : ""}><rect x="-42" y="-92" width="84" height="24" rx="7" fill="#2b2f36"/><rect x="-42" y="-92" width="84" height="8" rx="4" fill="#4a505a"/><rect x="-50" y="-70" width="100" height="76" rx="16" fill="${c}" ${ln(mix(c, -0.4), 3)}/><rect x="-34" y="-50" width="68" height="28" rx="6" fill="#fffaf0" opacity=".92"/><rect x="-26" y="-43" width="40" height="5" rx="2.5" fill="${mix(c, -0.35)}"/><rect x="-26" y="-33" width="26" height="4" rx="2" fill="${mix(c, -0.2)}"/><path d="M-40,-60 Q-44,-30 -38,-8" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/></g>`;
  const PROP2 = {
    jarShelf: (id, o = {}) => `<rect x="-200" y="0" width="400" height="18" rx="6" fill="#b98b5a"/><rect x="-200" y="18" width="400" height="8" fill="#000" opacity=".1"/>` + Array.from({ length: o.n || 5 }, (_, i) => `<g transform="translate(${-150 + i * 75},0) scale(.62)">${jar2(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    jars: (id, o = {}) => Array.from({ length: o.n || 3 }, (_, i) => `<g transform="translate(${i * 165},0) scale(1.15)">${jar2(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    jarPile: (id, o = {}) => Array.from({ length: o.n || 12 }, (_, i) => `<g transform="translate(${(i % 4) * 120 + (Math.floor(i / 4) % 2) * 60},${-Math.floor(i / 4) * 92})">${jar2(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    inverter: (id) => `<defs><linearGradient id="${id}-gi" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4b5866"/><stop offset="1" stop-color="#2c353e"/></linearGradient></defs><rect x="0" y="0" width="170" height="240" rx="18" fill="url(#${id}-gi)" ${ln("#1d242b", 3)}/><rect x="8" y="7" width="154" height="9" rx="4.5" fill="#fff" opacity=".12"/><rect x="22" y="24" width="126" height="72" rx="11" fill="#1d242b"/><rect id="${id}-screen" x="28" y="30" width="114" height="60" rx="8" fill="#9fe0b4"/><path d="M40,72 l14,-14 l12,10 l18,-20 l14,12 l16,-8" fill="none" ${ln("#2f8a57", 3.5)} opacity=".65"/><circle cx="85" cy="150" r="28" fill="#1d242b"/><circle id="${id}-led" cx="85" cy="150" r="20" fill="#2f8a57" ${ln("#14532d", 3)}/><circle cx="78" cy="143" r="6" fill="#fff" opacity=".35"/><text x="85" y="215" text-anchor="middle" font-size="23" font-weight="800" fill="#e5e7eb" font-family="Cairo" letter-spacing="2">INVERTER</text><path id="${id}-spark" d="M150 -10 L110 60 L140 60 L100 140" fill="none" stroke="#f97316" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>`,
    ac: (id) => `<defs><linearGradient id="${id}-ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#e3e7ed"/></linearGradient></defs><rect x="0" y="0" width="360" height="110" rx="22" fill="url(#${id}-ga)" ${ln("#b8bec8", 3)}/><rect x="16" y="70" width="328" height="24" rx="9" fill="#d3d9e1"/><path d="M30,82 H330" ${ln("#b3bac5", 3)}/><g transform="translate(286,31)" stroke="#7dd3fc" stroke-width="3" stroke-linecap="round"><path d="M-9,0 H9 M0,-9 V9 M-6,-6 L6,6 M6,-6 L-6,6"/></g><circle id="${id}-led" cx="320" cy="30" r="8" fill="#2f8a57"/><rect x="14" y="8" width="200" height="8" rx="4" fill="#fff" opacity=".7"/><g id="${id}-air" opacity="0">${[60, 180, 300].map((x) => `<path d="M${x} 130 q20 30 0 60" fill="none" stroke="#93c5fd" stroke-width="7" stroke-linecap="round"/>`).join("")}</g>`,
    lamp: (id) => `<line x1="0" y1="-80" x2="0" y2="-38" ${ln("#4b5563", 5)}/><path d="M-26,-42 L26,-42 L20,-28 L-20,-28 Z" fill="#6b7280"/><circle id="${id}-glow" cx="0" cy="0" r="120" fill="rgba(253,224,71,.22)"/><circle cx="0" cy="0" r="34" fill="#fde68a" ${ln("#d4a017", 3)}/><circle cx="-10" cy="-10" r="10" fill="#fff" opacity=".6"/>`,
    counter: (id) => `<defs>${woodG(id)}</defs><rect x="0" y="34" width="480" height="196" rx="6" fill="#c9965e" ${ln("#7a5530", 3)}/>${[0, 1, 2, 3, 4, 5, 6, 7].map((k) => `<rect x="${12 + k * 58}" y="48" width="46" height="170" rx="5" fill="#b9874f" opacity=".75"/>`).join("")}<rect x="-14" y="0" width="508" height="36" rx="8" fill="url(#${id}-gw)" ${ln("#7a5530", 3)}/><rect x="-10" y="3" width="500" height="7" rx="3.5" fill="#fff" opacity=".2"/><rect x="0" y="36" width="480" height="9" fill="#000" opacity=".12"/>`,
    panelBox: (id) => `<g id="${id}-box"><defs><linearGradient id="${id}-gp" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#3a64a6"/><stop offset="1" stop-color="#1f3d6e"/></linearGradient></defs><rect x="0" y="0" width="300" height="190" rx="10" fill="#d9bd90" ${ln("#9c7a4a", 3)}/><rect x="30" y="30" width="240" height="130" fill="url(#${id}-gp)" ${ln("#14284a", 3)}/><path d="M70 30 V160 M110 30 V160 M150 30 V160 M190 30 V160 M230 30 V160 M30 95 H270" stroke="#9fbbe6" stroke-width="2.5" opacity=".8"/><path d="M36,36 L120,36 L60,110 Z" fill="#fff" opacity=".12"/></g>`,
    battery: (id) => `<rect x="55" y="0" width="60" height="26" rx="6" fill="#374151"/><rect x="8" y="22" width="154" height="270" rx="22" fill="#f8fafc" ${ln("#94a3b8", 5)}/><rect x="18" y="32" width="134" height="250" rx="14" fill="#e2e8f0"/><rect id="${id}-lvl" x="24" y="40" width="122" height="236" rx="10" fill="#2f8a57"/><path d="M32,50 V264" stroke="#fff" stroke-width="8" stroke-linecap="round" opacity=".25"/><path d="M92,110 L70,160 L90,160 L76,206 L108,148 L88,148 Z" fill="#fff" opacity=".9"/>`,
    clock: (id) => `<defs><radialGradient id="${id}-gk"><stop offset=".7" stop-color="#ffffff"/><stop offset="1" stop-color="#eceff3"/></radialGradient></defs><circle cx="0" cy="0" r="146" fill="#2f3640"/><circle cx="0" cy="0" r="132" fill="url(#${id}-gk)"/>${Array.from({ length: 12 }, (_, i) => { const a = i * Math.PI / 6, r1 = i % 3 ? 112 : 100; return `<line x1="${(Math.sin(a) * r1).toFixed(1)}" y1="${(-Math.cos(a) * r1).toFixed(1)}" x2="${(Math.sin(a) * 122).toFixed(1)}" y2="${(-Math.cos(a) * 122).toFixed(1)}" stroke="#4b5563" stroke-width="${i % 3 ? 4 : 8}" stroke-linecap="round"/>`; }).join("")}<line x1="0" y1="0" x2="0" y2="-74" stroke="#1f2937" stroke-width="12" stroke-linecap="round"/><line id="${id}-hand" x1="0" y1="0" x2="0" y2="-112" stroke="#c08a1e" stroke-width="8" stroke-linecap="round"/><circle cx="0" cy="0" r="11" fill="#1f2937"/><path d="M-96,-74 A122,122 0 0 1 30,-118" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".55"/>`,
    desk: (id) => `<defs>${woodG(id)}</defs><rect x="30" y="40" width="26" height="190" fill="#8a6234" ${ln("#5f4223", 3)}/><rect x="300" y="40" width="190" height="122" rx="6" fill="#b07f4a" ${ln("#7a5530", 3)}/><rect x="370" y="90" width="50" height="10" rx="5" fill="#7a5530"/><rect x="464" y="160" width="26" height="70" fill="#8a6234" ${ln("#5f4223", 3)}/><rect x="0" y="0" width="520" height="40" rx="8" fill="url(#${id}-gw)" ${ln("#7a5530", 3)}/><rect x="4" y="3" width="512" height="7" rx="3.5" fill="#fff" opacity=".2"/><rect x="0" y="40" width="520" height="10" fill="#000" opacity=".12"/>`,
    phoneHand: (id) => `<rect x="-42" y="-78" width="84" height="156" rx="16" fill="#1f2937" ${ln("#0b1220", 3)}/><rect id="${id}-scr" x="-33" y="-66" width="66" height="132" rx="8" fill="#6fe0c8"/><rect x="-12" y="-74" width="24" height="5" rx="2.5" fill="#0b1220"/><rect x="-25" y="-50" width="50" height="10" rx="5" fill="#fff" opacity=".7"/><rect x="-25" y="-32" width="36" height="8" rx="4" fill="#fff" opacity=".5"/><rect x="-25" y="30" width="50" height="22" rx="8" fill="#0f766e" opacity=".8"/><path d="M-28,-58 L-8,-64" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".3"/>`,
    laptop: (id) => `<defs><linearGradient id="${id}-gl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7dde5"/><stop offset="1" stop-color="#a4b0be"/></linearGradient></defs><rect x="-98" y="-143" width="196" height="141" rx="10" fill="#1e272e" ${ln("#0b1220", 3)}/><rect id="${id}-scr" x="-85" y="-130" width="170" height="115" rx="4" fill="#6fe0c8"/><rect x="-75" y="-120" width="150" height="16" rx="4" fill="#fff" opacity=".55"/><rect x="-75" y="-96" width="70" height="50" rx="6" fill="#fff" opacity=".35"/><rect x="5" y="-96" width="70" height="22" rx="5" fill="#fff" opacity=".45"/><rect x="5" y="-68" width="50" height="22" rx="5" fill="#fff" opacity=".3"/><circle cx="0" cy="-137" r="2.5" fill="#94a3b8"/><polygon points="-110,0 110,0 140,24 -140,24" fill="url(#${id}-gl)" ${ln("#7c8796", 3)}/><rect x="-30" y="4" width="60" height="6" rx="3" fill="#8592a3"/>`,
    siren: (id) => `<g id="${id}"><rect x="-24" y="0" width="48" height="40" rx="6" fill="#3b4652" ${ln("#1f2937", 3)}/><path id="${id}-light" d="M-25,0 Q-30,-50 0,-55 Q30,-50 25,0 Z" fill="#ef4444" ${ln("#991b1b", 3)}/><path d="M-12,-8 Q-16,-38 0,-44" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/><circle id="${id}-glow" cx="0" cy="-30" r="75" fill="rgba(239,68,68,0.3)" opacity="0"/></g>`,
  };
  // v1 props without a v2 drawing: heavy ink outlines become thin outlines tinted by the element's own fill
  function soften(root) {
    root.querySelectorAll("[stroke]").forEach((el) => {
      const s = (el.getAttribute("stroke") || "").toLowerCase(); if (s !== INK && s !== "#111" && s !== "#111111") return;
      const f = el.getAttribute("fill"); const hex = f && /^#[0-9a-f]{6}$/i.test(f) ? f : null;
      el.setAttribute("stroke", hex ? mix(hex, -0.45) : "#3d434c");
      const w = parseFloat(el.getAttribute("stroke-width") || "1"); if (w >= 4) el.setAttribute("stroke-width", Math.max(2.5, w * 0.6).toFixed(1));
    });
  }

  // ---------------- props (local origin documented per prop) ----------------
  const jarSvg = (c, id = "") => `<g ${id ? `id="${id}"` : ""}><rect x="-40" y="-90" width="80" height="22" rx="6" fill="${INK}"/><rect x="-50" y="-70" width="100" height="74" rx="14" fill="${c}" ${SK}/><rect x="-34" y="-50" width="68" height="26" rx="5" fill="#fffaf0" opacity=".85"/></g>`;
  const JARC = ["#e8a3b0", "#9cc7d9", "#c9d99c", "#f0c987", "#c7a3e0", "#e8b89c"];
  const PROP = {
    jarShelf: (id, o = {}) => `<rect x="-200" y="0" width="400" height="18" rx="6" fill="#b9874f" ${SK}/>` + Array.from({ length: o.n || 5 }, (_, i) => `<g transform="translate(${-150 + i * 75},0) scale(.62)">${jarSvg(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    jars: (id, o = {}) => Array.from({ length: o.n || 3 }, (_, i) => `<g transform="translate(${i * 165},0) scale(1.15)">${jarSvg(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    jarPile: (id, o = {}) => Array.from({ length: o.n || 12 }, (_, i) => `<g transform="translate(${(i % 4) * 120 + (Math.floor(i / 4) % 2) * 60},${-Math.floor(i / 4) * 92})">${jarSvg(JARC[i % 6], `${id}-j${i}`)}</g>`).join(""),
    inverter: (id) => `<rect x="0" y="0" width="170" height="240" rx="18" fill="#3b4652" ${SK}/><rect id="${id}-screen" x="28" y="30" width="114" height="60" rx="8" fill="#9fe0b4"/><circle id="${id}-led" cx="85" cy="150" r="20" fill="#2f8a57" stroke="${INK}" stroke-width="5"/><text x="85" y="215" text-anchor="middle" font-size="26" font-weight="800" fill="#fff" font-family="Cairo">INVERTER</text><path id="${id}-spark" d="M150 -10 L110 60 L140 60 L100 140" fill="none" stroke="#c0392b" stroke-width="10" stroke-linejoin="round" stroke-linecap="round" opacity="0"/>`,
    ac: (id) => `<rect x="0" y="0" width="360" height="110" rx="22" fill="#fffaf0" ${SK}/><line x1="30" y1="80" x2="330" y2="80" stroke="${INK}" stroke-width="5"/><circle id="${id}-led" cx="320" cy="30" r="8" fill="#2f8a57"/><g id="${id}-air" opacity="0">${[60, 180, 300].map((x) => `<path d="M${x} 130 q20 30 0 60" fill="none" stroke="#7fb8d6" stroke-width="7" stroke-linecap="round"/>`).join("")}</g>`,
    lamp: (id) => `<line x1="0" y1="-80" x2="0" y2="-34" stroke="${INK}" stroke-width="6"/><circle id="${id}-glow" cx="0" cy="0" r="120" fill="rgba(243,198,79,.25)"/><circle cx="0" cy="0" r="34" fill="#f3c64f" ${SK}/>`,
    house: (id) => `<path d="M-40 180 L200 0 L440 180 Z" fill="#c9714f" ${SK}/><g id="${id}-panels" opacity="0"><path d="M40 130 L160 40 L200 70 L80 160 Z" fill="#2c4a7a" stroke="${INK}" stroke-width="5"/><path d="M220 85 L260 55 L360 130 L320 160 Z" fill="#2c4a7a" stroke="${INK}" stroke-width="5"/></g><rect x="0" y="180" width="400" height="500" fill="#f1e2c4" ${SK}/><rect x="160" y="480" width="90" height="200" rx="8" fill="#7a5233" stroke="${INK}" stroke-width="5"/><rect id="${id}-w1" x="50" y="280" width="100" height="100" rx="6" fill="#7a7466" stroke="${INK}" stroke-width="5"/><rect id="${id}-w2" x="280" y="280" width="90" height="100" rx="6" fill="#7a7466" stroke="${INK}" stroke-width="5"/>`,
    counter: (id) => `<rect x="0" y="0" width="480" height="230" rx="10" fill="#b9874f" ${SK}/><line x1="0" y1="40" x2="480" y2="40" stroke="${INK}" stroke-width="4" opacity=".4"/>`,
    panelBox: (id) => `<g id="${id}-box"><rect x="0" y="0" width="300" height="190" rx="10" fill="#d7b98a" ${SK}/><rect x="30" y="30" width="240" height="130" fill="#2c4a7a" stroke="${INK}" stroke-width="5"/><path d="M70 30 V160 M110 30 V160 M150 30 V160 M190 30 V160 M230 30 V160 M30 95 H270" stroke="#8fb0e0" stroke-width="3"/></g>`,
    battery: (id) => `<rect x="55" y="0" width="60" height="26" rx="6" fill="${INK}"/><rect x="8" y="22" width="154" height="270" rx="22" fill="#fffaf0" stroke="${INK}" stroke-width="8"/><rect id="${id}-lvl" x="24" y="40" width="122" height="236" rx="10" fill="#2f8a57"/>`,
    clock: (id) => `<circle cx="0" cy="0" r="140" fill="#fffaf0" stroke="${INK}" stroke-width="10"/><circle cx="0" cy="0" r="10" fill="${INK}"/><line x1="0" y1="0" x2="0" y2="-80" stroke="${INK}" stroke-width="12" stroke-linecap="round"/><line id="${id}-hand" x1="0" y1="0" x2="0" y2="-115" stroke="#c08a1e" stroke-width="9" stroke-linecap="round"/>`,
    mirror: (id) => `<ellipse cx="0" cy="0" rx="170" ry="230" fill="#dfeef0" stroke="#b8913a" stroke-width="16"/><path d="M-100 -100 L-40 -140 M-110 -40 L-10 -110" stroke="#fff" stroke-width="10" stroke-linecap="round" opacity=".8"/>`,
    sun: (id) => `<g id="${id}-rays">${Array.from({ length: 8 }, (_, i) => { const a = i * Math.PI / 4; return `<line x1="${Math.cos(a) * 105}" y1="${Math.sin(a) * 105}" x2="${Math.cos(a) * 135}" y2="${Math.sin(a) * 135}" stroke="#e2a21b" stroke-width="10" stroke-linecap="round"/>`; }).join("")}</g><circle cx="0" cy="0" r="70" fill="#f3c64f" ${SK}/>`,
    panel: (id) => `<g transform="skewX(-12)"><rect x="0" y="0" width="300" height="170" rx="8" fill="#2c4a7a" ${SK}/><path d="M60 0 V170 M120 0 V170 M180 0 V170 M240 0 V170 M0 85 H300" stroke="#8fb0e0" stroke-width="3"/></g>`,
    desk: (id) => `<rect x="0" y="0" width="520" height="40" rx="8" fill="#b9874f" ${SK}/><rect x="30" y="40" width="26" height="190" fill="#8a6234" stroke="${INK}" stroke-width="5"/><rect x="464" y="40" width="26" height="190" fill="#8a6234" stroke="${INK}" stroke-width="5"/>`,
    phoneHand: (id) => `<rect x="-40" y="-75" width="80" height="150" rx="14" fill="#26303d" ${SK}/><rect id="${id}-scr" x="-30" y="-62" width="60" height="118" rx="6" fill="#6fe0c8"/>`,
    laptop: (id) => `<polygon points="-110,0 110,0 140,24 -140,24" fill="#a4b0be" stroke="${INK}" stroke-width="5"/><rect x="-95" y="-140" width="190" height="135" rx="8" fill="#1e272e" stroke="${INK}" stroke-width="5"/><rect id="${id}-scr" x="-85" y="-130" width="170" height="115" rx="4" fill="#6fe0c8"/><circle cx="0" cy="-135" r="3" fill="#ffffff"/>`,
    crmBoard: (id) => `<rect x="0" y="0" width="400" height="260" rx="16" fill="#ffffff" stroke="${INK}" stroke-width="6"/><line x1="133" y1="0" x2="133" y2="260" stroke="#d0d7de" stroke-width="4"/><line x1="266" y1="0" x2="266" y2="260" stroke="#d0d7de" stroke-width="4"/><text x="66" y="45" text-anchor="middle" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">جديد</text><text x="200" y="45" text-anchor="middle" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">متابعة</text><text x="333" y="45" text-anchor="middle" font-size="22" font-weight="900" fill="#0f6b57" font-family="Cairo">مكتمل</text><rect x="15" y="65" width="104" height="42" rx="8" fill="#eef4f2" stroke="${INK}" stroke-width="2"/><rect x="15" y="118" width="104" height="42" rx="8" fill="#eef4f2" stroke="${INK}" stroke-width="2"/><rect id="${id}-c1" x="148" y="65" width="104" height="42" rx="8" fill="#e3f4ef" stroke="${INK}" stroke-width="2"/><rect id="${id}-c2" x="281" y="65" width="104" height="42" rx="8" fill="#6fe0c8" stroke="${INK}" stroke-width="3"/>`,
    crmPipeline: (id) => `<rect x="0" y="0" width="580" height="320" rx="20" fill="#ffffff" stroke="${INK}" stroke-width="7"/><line x1="193" y1="0" x2="193" y2="320" stroke="#d0d7de" stroke-width="4"/><line x1="386" y1="0" x2="386" y2="320" stroke="#d0d7de" stroke-width="4"/><text x="96" y="50" text-anchor="middle" font-size="24" font-weight="900" fill="#c0392b" font-family="Cairo">جديد 📥</text><text x="290" y="50" text-anchor="middle" font-size="24" font-weight="900" fill="#d97706" font-family="Cairo">متابعة ⏳</text><text x="483" y="50" text-anchor="middle" font-size="24" font-weight="900" fill="#0f6b57" font-family="Cairo">صفقة 🤝</text><rect id="${id}-d1" x="20" y="75" width="153" height="65" rx="10" fill="#fef2f2" stroke="${INK}" stroke-width="3"/><rect id="${id}-d2" x="213" y="75" width="153" height="65" rx="10" fill="#fffbeb" stroke="${INK}" stroke-width="3"/><rect id="${id}-d3" x="406" y="75" width="153" height="65" rx="10" fill="#e3f4ef" stroke="${INK}" stroke-width="3"/>`,
    clientCard: (id) => `<g id="${id}" data-layout-allow-overflow="true"><rect x="0" y="0" width="620" height="290" rx="24" fill="#ffffff" stroke="${INK}" stroke-width="6"/><circle cx="75" cy="75" r="42" fill="#6fe0c8" stroke="${INK}" stroke-width="4"/><circle cx="75" cy="65" r="16" fill="#1f2328"/><path d="M52,102 Q75,85 98,102" fill="#1f2328"/><text x="135" y="70" font-size="26" font-weight="900" fill="#1f2328" font-family="Cairo">ملف العميل: أحمد 👤</text><text x="135" y="110" font-size="20" font-weight="800" fill="#0f6b57" font-family="Cairo">الحالة: عميل دائم ⭐⭐⭐</text><line x1="25" y1="140" x2="595" y2="140" stroke="#e1e4e8" stroke-width="3"/><text x="35" y="195" font-size="20" font-weight="800" fill="#57606a" font-family="Cairo">الخدمة: نظام تجاري مخصص 📦</text><text x="35" y="240" font-size="20" font-weight="800" fill="#57606a" font-family="Cairo">المتابعة: تذكير آلي بالواتساب 💬</text></g>`,
    crmTypes: (id) => `<g id="${id}" data-layout-allow-overflow="true"><g id="${id}-t1"><rect x="0" y="0" width="170" height="240" rx="18" fill="#e3f4ef" stroke="${INK}" stroke-width="5"/><text x="85" y="65" text-anchor="middle" font-size="44">⚙️</text><text x="85" y="125" text-anchor="middle" font-size="24" font-weight="900" fill="#0f6b57" font-family="Cairo">تشغيلي</text><text x="85" y="170" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">مسار الطلبات</text><text x="85" y="200" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">والمبيعات</text></g><g id="${id}-t2" transform="translate(195,0)"><rect x="0" y="0" width="170" height="240" rx="18" fill="#e0f2fe" stroke="${INK}" stroke-width="5"/><text x="85" y="65" text-anchor="middle" font-size="44">💬</text><text x="85" y="125" text-anchor="middle" font-size="24" font-weight="900" fill="#0284c7" font-family="Cairo">تواصلي</text><text x="85" y="170" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">ربط الواتساب</text><text x="85" y="200" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">والفريق</text></g><g id="${id}-t3" transform="translate(390,0)"><rect x="0" y="0" width="170" height="240" rx="18" fill="#fef3c7" stroke="${INK}" stroke-width="5"/><text x="85" y="65" text-anchor="middle" font-size="44">📊</text><text x="85" y="125" text-anchor="middle" font-size="24" font-weight="900" fill="#d97706" font-family="Cairo">تحليلي</text><text x="85" y="170" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">فهم الأرباح</text><text x="85" y="200" text-anchor="middle" font-size="18" font-weight="800" fill="#1f2328" font-family="Cairo">وسلوك العميل</text></g></g>`,
    growthShield: (id) => `<g id="${id}" data-layout-allow-overflow="true"><path d="M150,0 Q300,40 300,160 Q300,280 150,340 Q0,280 0,160 Q0,40 150,0 Z" fill="#0f6b57" stroke="${INK}" stroke-width="7"/><path d="M150,20 Q280,56 280,160 Q280,265 150,320 Q20,265 20,160 Q20,56 150,20 Z" fill="#6fe0c8" opacity=".35"/><text x="150" y="150" text-anchor="middle" font-size="90">🛡️</text><text x="150" y="235" text-anchor="middle" font-size="30" font-weight="900" fill="#ffffff" font-family="Cairo">حماية العملاء</text><text x="150" y="280" text-anchor="middle" font-size="24" font-weight="900" fill="#fff4cc" font-family="Cairo">+ زيادة الأرباح</text></g>`,
    // Warning Alarm Siren
    siren: (id) => `<g id="${id}"><rect x="-20" y="0" width="40" height="40" rx="4" fill="#34495e" ${SK}/><path id="${id}-light" d="M-25,0 Q-30,-50 0,-55 Q30,-50 25,0 Z" fill="#e74c3c" ${SK}/><circle id="${id}-glow" cx="0" cy="-30" r="75" fill="rgba(231,76,60,0.3)" opacity="0"/></g>`,
    // Warehouse Pallet Rack with Steel Shelves
    rack: (id) => `<g id="${id}"><line x1="0" y1="0" x2="0" y2="320" stroke="#2980b9" stroke-width="14" stroke-linecap="square"/><line x1="280" y1="0" x2="280" y2="320" stroke="#2980b9" stroke-width="14" stroke-linecap="square"/><line x1="0" y1="60" x2="280" y2="120" stroke="#2980b9" stroke-width="6"/><line x1="280" y1="120" x2="0" y2="180" stroke="#2980b9" stroke-width="6"/><line x1="0" y1="180" x2="280" y2="240" stroke="#2980b9" stroke-width="6"/><rect x="-10" y="110" width="300" height="16" rx="4" fill="#e67e22" ${SK}/><rect x="-10" y="230" width="300" height="16" rx="4" fill="#e67e22" ${SK}/><g transform="translate(20, 45)"><rect x="0" y="0" width="70" height="65" rx="6" fill="#bdc3c7" ${SK}/><line x1="0" y1="32" x2="70" y2="32" stroke="#7f8c8d" stroke-width="4"/></g><g transform="translate(110, 40)"><rect x="0" y="0" width="60" height="70" rx="8" fill="#e74c3c" ${SK}/><circle cx="30" cy="35" r="14" fill="#ffffff" opacity="0.6"/></g><g transform="translate(190, 48)"><rect x="0" y="0" width="75" height="62" rx="6" fill="#f39c12" ${SK}/></g></g>`,
    // Central Factory / Enterprise ERP Hub
    erpHub: (id) => `<g id="${id}" data-layout-allow-overlap="true" data-layout-allow-occlusion="true"><rect x="0" y="0" width="620" height="420" rx="28" fill="#0f1924" stroke="#0f6b57" stroke-width="8"/><rect x="0" y="0" width="620" height="70" rx="24" fill="#142332"/><circle cx="45" cy="35" r="12" fill="#2ecc71"/><circle cx="80" cy="35" r="12" fill="#f1c40f"/><circle cx="115" cy="35" r="12" fill="#e74c3c"/><text x="360" y="46" text-anchor="middle" font-size="28" font-weight="900" fill="#ffffff" font-family="Cairo">SUDEGY ENTERPRISE ERP</text><g id="${id}-mod1" transform="translate(30, 95)"><rect x="0" y="0" width="265" height="135" rx="16" fill="#192a3a" stroke="#2ecc71" stroke-width="4"/><text x="132" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#ffffff" font-family="Cairo">📦 إدارة المخزون</text><text x="132" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#2ecc71" font-family="Cairo">جرد لحظي دقيق</text><rect x="25" y="90" width="215" height="18" rx="9" fill="#2c3e50"/><rect id="${id}-bar1" x="25" y="90" width="200" height="18" rx="9" fill="#2ecc71"/></g><g id="${id}-mod2" transform="translate(325, 95)"><rect x="0" y="0" width="265" height="135" rx="16" fill="#192a3a" stroke="#3498db" stroke-width="4"/><text x="132" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#ffffff" font-family="Cairo">💼 أوامر المبيعات</text><text x="132" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#3498db" font-family="Cairo">ربط فوري مباشر</text><rect x="25" y="90" width="215" height="18" rx="9" fill="#2c3e50"/><rect id="${id}-bar2" x="25" y="90" width="210" height="18" rx="9" fill="#3498db"/></g><g id="${id}-mod3" transform="translate(30, 250)"><rect x="0" y="0" width="265" height="135" rx="16" fill="#192a3a" stroke="#f39c12" stroke-width="4"/><text x="132" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#ffffff" font-family="Cairo">🚚 التوريد والشحن</text><text x="132" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#f39c12" font-family="Cairo">0 تأخير للطلبات</text><rect x="25" y="90" width="215" height="18" rx="9" fill="#2c3e50"/><rect id="${id}-bar3" x="25" y="90" width="205" height="18" rx="9" fill="#f39c12"/></g><g id="${id}-mod4" transform="translate(325, 250)"><rect x="0" y="0" width="265" height="135" rx="16" fill="#192a3a" stroke="#9b59b6" stroke-width="4"/><text x="132" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#ffffff" font-family="Cairo">💰 المحاسبة والأرباح</text><text x="132" y="74" text-anchor="middle" font-size="22" font-weight="800" fill="#9b59b6" font-family="Cairo">أرباحك لحظة بلحظة</text><rect x="25" y="90" width="215" height="18" rx="9" fill="#2c3e50"/><rect id="${id}-bar4" x="25" y="90" width="215" height="18" rx="9" fill="#9b59b6"/></g></g>`,
    // Mobile ERP Smartphone App Mockup
    mobileErp: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="270" height="490" rx="36" fill="#1f2328" stroke="#0f6b57" stroke-width="7"/><rect x="12" y="14" width="246" height="462" rx="28" fill="#0b131e"/><rect x="90" y="20" width="90" height="16" rx="8" fill="#1f2328"/><rect x="25" y="55" width="220" height="60" rx="12" fill="#15263a"/><text x="135" y="93" text-anchor="middle" font-size="22" font-weight="900" fill="#2ecc71" font-family="Cairo">لوحة تحكم المالك 📱</text><rect x="25" y="130" width="220" height="95" rx="14" fill="#162e28" stroke="#2ecc71" stroke-width="2"/><text x="135" y="165" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="Cairo">صافي الأرباح اليومية</text><text x="135" y="202" text-anchor="middle" font-size="22" font-weight="900" fill="#6fe0c8" font-family="Cairo">+ 38,400 ر.س 📈</text><rect x="25" y="240" width="220" height="95" rx="14" fill="#2e2416" stroke="#f39c12" stroke-width="2"/><text x="135" y="275" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="Cairo">رصيد المستودع الحي</text><text x="135" y="312" text-anchor="middle" font-size="20" font-weight="900" fill="#f1c40f" font-family="Cairo">مطابق 100% بدون هدر</text><rect x="25" y="350" width="220" height="95" rx="14" fill="#1a1e36" stroke="#3498db" stroke-width="2"/><text x="135" y="385" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="Cairo">تسريب الفواتير</text><text x="135" y="422" text-anchor="middle" font-size="22" font-weight="900" fill="#3498db" font-family="Cairo">0% محمي تماماً 🛡️</text></g>`,
    // Chaotic Excel spreadsheets
    excelChaos: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="580" height="340" rx="20" fill="#ffffff" stroke="#c0392b" stroke-width="7"/><rect x="0" y="0" width="580" height="55" rx="16" fill="#fde8e8"/><text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#c0392b" font-family="Cairo">📊 إكسل يدوي: ملفات غير مترابطة ⚠️</text><line x1="0" y1="55" x2="580" y2="55" stroke="#c0392b" stroke-width="3"/><rect x="25" y="75" width="250" height="65" rx="10" fill="#fef2f2" stroke="#1f2328" stroke-width="2"/><text x="150" y="115" text-anchor="middle" font-size="20" font-weight="800" fill="#1f2328" font-family="Cairo">المبيعات: تم بيع 500 حبة</text><rect x="305" y="75" width="250" height="65" rx="10" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/><text x="430" y="115" text-anchor="middle" font-size="20" font-weight="900" fill="#dc2626" font-family="Cairo">المستودع: الرصيد 0 !</text><rect x="25" y="160" width="530" height="65" rx="10" fill="#fffbeb" stroke="#d97706" stroke-width="2"/><text x="290" y="200" text-anchor="middle" font-size="20" font-weight="900" fill="#b45309" font-family="Cairo">الحسابات: الفاتورة غير مسجلة (#REF!) ❌</text><rect x="25" y="245" width="530" height="65" rx="10" fill="#fef2f2" stroke="#dc2626" stroke-width="3"/><text x="290" y="285" text-anchor="middle" font-size="22" font-weight="900" fill="#991b1b" font-family="Cairo">صافي الأرباح: مجهول وضائع ؟ 📉</text></g>`,
    // Automated ERP Workflow Diagram
    erpWorkflow: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="600" height="320" rx="24" fill="#ffffff" stroke="#0f6b57" stroke-width="7"/><rect x="0" y="0" width="600" height="55" rx="20" fill="#e3f4ef"/><text x="300" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#0f6b57" font-family="Cairo">⚡ مسار الحركة الموحد في ثواني</text><g transform="translate(30, 80)"><rect x="0" y="0" width="160" height="200" rx="16" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/><text x="80" y="45" text-anchor="middle" font-size="34">🛒</text><text x="80" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#15803d" font-family="Cairo">1. أمر بيع</text><text x="80" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">تسجيل فوري</text><text x="80" y="165" text-anchor="middle" font-size="16" font-weight="800" fill="#15803d" font-family="Cairo">مباشر ✓</text></g><text x="215" y="190" font-size="32" font-weight="900" fill="#0f6b57">◀</text><g transform="translate(240, 80)"><rect x="0" y="0" width="160" height="200" rx="16" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/><text x="80" y="45" text-anchor="middle" font-size="34">📦</text><text x="80" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#1d4ed8" font-family="Cairo">2. المستودع</text><text x="80" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">تحديث الرصيد</text><text x="80" y="165" text-anchor="middle" font-size="16" font-weight="800" fill="#1d4ed8" font-family="Cairo">تلقائياً ⚡</text></g><text x="425" y="190" font-size="32" font-weight="900" fill="#0f6b57">◀</text><g transform="translate(450, 80)"><rect x="0" y="0" width="160" height="200" rx="16" fill="#fefce8" stroke="#ca8a04" stroke-width="3"/><text x="80" y="45" text-anchor="middle" font-size="34">🧾</text><text x="80" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#a16207" font-family="Cairo">3. المحاسبة</text><text x="80" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">قيد محاسبي</text><text x="80" y="165" text-anchor="middle" font-size="16" font-weight="800" fill="#a16207" font-family="Cairo">وفاتورة معتمدة</text></g></g>`,
    // Sudegy Bespoke Engineering vs Generic Template comparison
    erpCustomAudit: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="600" height="320" rx="24" fill="#ffffff" stroke="#1f2328" stroke-width="6"/><g transform="translate(25, 25)"><rect x="0" y="0" width="260" height="270" rx="18" fill="#fef2f2" stroke="#dc2626" stroke-width="4"/><text x="130" y="50" text-anchor="middle" font-size="40">❌</text><text x="130" y="95" text-anchor="middle" font-size="22" font-weight="900" fill="#dc2626" font-family="Cairo">قوالب جاهزة معقدة</text><line x1="20" y1="120" x2="240" y2="120" stroke="#fca5a5" stroke-width="2"/><text x="130" y="160" text-anchor="middle" font-size="18" font-weight="800" fill="#991b1b" font-family="Cairo">• 70% نسبة الفشل</text><text x="130" y="200" text-anchor="middle" font-size="18" font-weight="800" fill="#991b1b" font-family="Cairo">• اشتراكات متكررة</text><text x="130" y="240" text-anchor="middle" font-size="18" font-weight="800" fill="#991b1b" font-family="Cairo">• لا تناسب عملك</text></g><g transform="translate(315, 25)"><rect x="0" y="0" width="260" height="270" rx="18" fill="#f0fdf4" stroke="#16a34a" stroke-width="4"/><text x="130" y="50" text-anchor="middle" font-size="40">🏆</text><text x="130" y="95" text-anchor="middle" font-size="22" font-weight="900" fill="#15803d" font-family="Cairo">سوديجي المخصص</text><line x1="20" y1="120" x2="240" y2="120" stroke="#86efac" stroke-width="2"/><text x="130" y="160" text-anchor="middle" font-size="18" font-weight="800" fill="#166534" font-family="Cairo">• هندسة الدورة أولاً</text><text x="130" y="200" text-anchor="middle" font-size="18" font-weight="800" fill="#166534" font-family="Cairo">• ملكية كاملة للنظام</text><text x="130" y="240" text-anchor="middle" font-size="18" font-weight="800" fill="#166534" font-family="Cairo">• صفر اشتراكات</text></g></g>`,
    // Checkout Friction Card
    checkoutFrictionCard: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="580" height="340" rx="24" fill="#ffffff" stroke="#c0392b" stroke-width="7"/><rect x="0" y="0" width="580" height="55" rx="20" fill="#fde8e8"/><text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#c0392b" font-family="Cairo">🛒 تعقيد الدفع (Checkout Friction)</text><g transform="translate(30, 75)"><rect x="0" y="0" width="520" height="60" rx="14" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><text x="260" y="38" text-anchor="middle" font-size="20" font-weight="900" fill="#334155" font-family="Cairo">🔒 إجبار على إنشاء حساب وكلمة مرور</text></g><g transform="translate(30, 148)"><rect x="0" y="0" width="520" height="60" rx="14" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/><text x="260" y="38" text-anchor="middle" font-size="20" font-weight="900" fill="#b91c1c" font-family="Cairo">📋 5 خطوات واستمارة عنوان طويلة</text></g><g transform="translate(30, 222)"><rect x="0" y="0" width="520" height="65" rx="14" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/><text x="260" y="42" text-anchor="middle" font-size="20" font-weight="900" fill="#991b1b" font-family="Cairo">💸 رسوم شحن مفاجئة عند آخر خطوة</text></g></g>`,
    // Generic Template Friction Card
    genericTemplateFriction: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="580" height="340" rx="24" fill="#ffffff" stroke="#c0392b" stroke-width="7"/><rect x="0" y="0" width="580" height="55" rx="20" fill="#fde8e8"/><text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#c0392b" font-family="Cairo">⚠️ متجر القوالب الجاهزة (Template)</text><g transform="translate(30, 75)"><rect x="0" y="0" width="520" height="60" rx="14" fill="#f8fafc" stroke="#64748b" stroke-width="2"/><text x="260" y="38" text-anchor="middle" font-size="20" font-weight="900" fill="#334155" font-family="Cairo">🛒 كتالوج صامت يعرض بضاعة دون فرز</text></g><g transform="translate(30, 148)"><rect x="0" y="0" width="520" height="60" rx="14" fill="#fef2f2" stroke="#ef4444" stroke-width="2"/><text x="260" y="38" text-anchor="middle" font-size="20" font-weight="900" fill="#b91c1c" font-family="Cairo">📉 ارتداد فوري وخروج للزوار دون شراء</text></g><g transform="translate(30, 222)"><rect x="0" y="0" width="520" height="65" rx="14" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/><text x="260" y="42" text-anchor="middle" font-size="20" font-weight="900" fill="#991b1b" font-family="Cairo">❌ ضياع تكلفة الإعلانات دون بيانات</text></g></g>`,
    // WhatsApp "Bikam?" Chaos Card
    bikamChaos: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="580" height="340" rx="24" fill="#ffffff" stroke="#c0392b" stroke-width="7"/><rect x="0" y="0" width="580" height="55" rx="20" fill="#fde8e8"/><text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#c0392b" font-family="Cairo">🚨 زحمة الواتساب وهدر الإعلانات</text><g transform="translate(30, 75)"><rect x="0" y="0" width="220" height="50" rx="14" fill="#f0f2f5" stroke="#1f2328" stroke-width="2"/><text x="110" y="34" text-anchor="middle" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">بكم السعر؟ 💬</text></g><g transform="translate(320, 115)"><rect x="0" y="0" width="230" height="50" rx="14" fill="#dcf8c6" stroke="#075e54" stroke-width="2"/><text x="115" y="34" text-anchor="middle" font-size="20" font-weight="800" fill="#075e54" font-family="Cairo">أهلاً بك تفضل.. 👋</text></g><text x="530" y="195" text-anchor="end" font-size="20" font-weight="900" fill="#dc2626" font-family="Cairo">❌ اختفى العميل دون شراء!</text><g transform="translate(30, 205)"><rect x="0" y="0" width="220" height="50" rx="14" fill="#f0f2f5" stroke="#1f2328" stroke-width="2"/><text x="110" y="34" text-anchor="middle" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">بكم الباقة؟ 💬</text></g><g transform="translate(30, 270)"><rect x="0" y="0" width="520" height="55" rx="14" fill="#fee2e2" stroke="#dc2626" stroke-width="3"/><text x="260" y="36" text-anchor="middle" font-size="20" font-weight="900" fill="#991b1b" font-family="Cairo">💸 ميزانية الإعلان تُهدر دون مبيعات</text></g></g>`,
    // Smart Qualification Funnel Card (45 seconds)
    smartFunnelCard: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="600" height="340" rx="24" fill="#ffffff" stroke="#0f6b57" stroke-width="7"/><rect x="0" y="0" width="600" height="55" rx="20" fill="#e3f4ef"/><text x="300" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#0f6b57" font-family="Cairo">⚡ مسار الفرز الذكي (Smart Funnel)</text><g transform="translate(25, 75)"><rect x="0" y="0" width="165" height="190" rx="16" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/><text x="82" y="45" text-anchor="middle" font-size="36">🔍</text><text x="82" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#15803d" font-family="Cairo">1. نوع المشكلة</text><text x="82" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">تحديد الاحتياج</text><text x="82" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#15803d" font-family="Cairo">بدقة فائقة ✓</text></g><text x="205" y="180" font-size="28" font-weight="900" fill="#0f6b57">◀</text><g transform="translate(220, 75)"><rect x="0" y="0" width="165" height="190" rx="16" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/><text x="82" y="45" text-anchor="middle" font-size="36">🎯</text><text x="82" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#1d4ed8" font-family="Cairo">2. الخدمة</text><text x="82" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">تخصيص الباقة</text><text x="82" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#1d4ed8" font-family="Cairo">المناسبة ⚡</text></g><text x="400" y="180" font-size="28" font-weight="900" fill="#0f6b57">◀</text><g transform="translate(415, 75)"><rect x="0" y="0" width="165" height="190" rx="16" fill="#fefce8" stroke="#ca8a04" stroke-width="3"/><text x="82" y="45" text-anchor="middle" font-size="36">💰</text><text x="82" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#a16207" font-family="Cairo">3. الميزانية</text><text x="82" y="130" text-anchor="middle" font-size="16" font-weight="800" fill="#4b5563" font-family="Cairo">القدرة المالية</text><text x="82" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#a16207" font-family="Cairo">تأهيل مسبق ⏱️</text></g><rect x="25" y="280" width="550" height="45" rx="12" fill="#0f6b57"/><text x="300" y="310" text-anchor="middle" font-size="20" font-weight="900" fill="#ffffff" font-family="Cairo">⏱️ تأهيل كامل للعميل في 45 ثانية فقط</text></g>`,
    // WhatsApp Dossier Card
    whatsappDossier: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="600" height="340" rx="24" fill="#ffffff" stroke="#25d366" stroke-width="7"/><rect x="0" y="0" width="600" height="55" rx="20" fill="#e8f8f0"/><text x="300" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#075e54" font-family="Cairo">📲 تحويل مباشر للواتساب بملف العميل (Dossier)</text><circle cx="70" cy="115" r="38" fill="#25d366" stroke="#1f2328" stroke-width="3"/><text x="70" y="127" text-anchor="middle" font-size="36">👤</text><text x="130" y="105" font-size="24" font-weight="900" fill="#1f2328" font-family="Cairo">العميل: فهد السعيد (جاهز للشراء) ⭐</text><text x="130" y="138" font-size="20" font-weight="800" fill="#075e54" font-family="Cairo">الخدمة: باقة متكاملة مخصصة</text><line x1="25" y1="165" x2="575" y2="165" stroke="#e5e7eb" stroke-width="3"/><rect x="30" y="185" width="260" height="60" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/><text x="160" y="222" text-anchor="middle" font-size="18" font-weight="900" fill="#15803d" font-family="Cairo">الميزانية: معتمدة ومطابقة ✓</text><rect x="310" y="185" width="260" height="60" rx="12" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/><text x="440" y="222" text-anchor="middle" font-size="18" font-weight="900" fill="#1d4ed8" font-family="Cairo">الاحتياج: تنفيذ فوري خلال 3 أيام</text><rect x="30" y="260" width="540" height="60" rx="14" fill="#075e54"/><text x="300" y="298" text-anchor="middle" font-size="22" font-weight="900" fill="#ffffff" font-family="Cairo">🤝 يدخل المحادثة وهو مقتنع وفاهم التفاصيل</text></g>`,
    // November Offer Package Card
    novemberOfferCard: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="620" height="360" rx="26" fill="#ffffff" stroke="#0f6b57" stroke-width="7"/><rect x="0" y="0" width="620" height="60" rx="22" fill="#0f6b57"/><text x="310" y="42" text-anchor="middle" font-size="26" font-weight="900" fill="#ffffff" font-family="Cairo">🌟 عروض نوفمبر: باقة التحويل الذكي</text><g transform="translate(30, 80)"><text x="560" y="32" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">1️⃣ نظام فرز وتأهيل تفاعلي (Smart Funnel)</text><text x="560" y="78" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">2️⃣ تحويل مباشر للواتساب بملف كامل (Dossier)</text><text x="560" y="124" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">3️⃣ نظام CRM مدمج لإدارة ومتابعة الصفقات</text></g><line x1="25" y1="225" x2="595" y2="225" stroke="#e5e7eb" stroke-width="3"/><g transform="translate(30, 245)"><rect x="0" y="0" width="270" height="90" rx="18" fill="#fef3c7" stroke="#d97706" stroke-width="3"/><text x="135" y="40" text-anchor="middle" font-size="22" font-weight="900" fill="#92400e" font-family="Cairo">💰 1,990 ريال فقط</text><text x="135" y="72" text-anchor="middle" font-size="18" font-weight="900" fill="#1f2328" font-family="Cairo">شامل التأسيس والتشغيل</text><rect x="290" y="0" width="270" height="90" rx="18" fill="#e0f2fe" stroke="#0284c7" stroke-width="3"/><text x="425" y="40" text-anchor="middle" font-size="22" font-weight="900" fill="#0369a1" font-family="Cairo">⏱️ جاهز خلال 3 أيام</text><text x="425" y="72" text-anchor="middle" font-size="18" font-weight="900" fill="#1f2328" font-family="Cairo">تسليم وتشغيل فوري</text></g></g>`,
    // November Flower & Ecommerce Store Package Card
    novemberStoreOfferCard: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true"><rect x="0" y="0" width="620" height="360" rx="26" fill="#ffffff" stroke="#db2777" stroke-width="7"/><rect x="0" y="0" width="620" height="60" rx="22" fill="#db2777"/><text x="310" y="42" text-anchor="middle" font-size="26" font-weight="900" fill="#ffffff" font-family="Cairo">🌸 عروض نوفمبر: متجر متكامل فائق السرعة</text><g transform="translate(30, 80)"><text x="560" y="32" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">1️⃣ متجر مخصص فائق السرعة يعرض منتجاتك بفخامة</text><text x="560" y="78" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">2️⃣ سلة شراء ذكية وربط مباشر بالواتساب للطلب الفوري</text><text x="560" y="124" text-anchor="end" font-size="22" font-weight="900" fill="#1f2328" font-family="Cairo">3️⃣ تصميم متجاوب 100% للجوال والشاشات الكبيرة</text></g><line x1="25" y1="225" x2="595" y2="225" stroke="#e5e7eb" stroke-width="3"/><g transform="translate(30, 245)"><rect x="0" y="0" width="270" height="90" rx="18" fill="#fdf2f8" stroke="#db2777" stroke-width="3"/><text x="135" y="40" text-anchor="middle" font-size="22" font-weight="900" fill="#9d174d" font-family="Cairo">💰 1,990 ريال فقط</text><text x="135" y="72" text-anchor="middle" font-size="18" font-weight="900" fill="#1f2328" font-family="Cairo">شامل التأسيس والتشغيل</text><rect x="290" y="0" width="270" height="90" rx="18" fill="#f0fdf4" stroke="#16a34a" stroke-width="3"/><text x="425" y="40" text-anchor="middle" font-size="22" font-weight="900" fill="#15803d" font-family="Cairo">⏱️ جاهز خلال 3 أيام</text><text x="425" y="72" text-anchor="middle" font-size="18" font-weight="900" fill="#1f2328" font-family="Cairo">تسليم وتشغيل فوري</text></g></g>`,
    // Modern Dental Clinic Treatment Chair with Examination Lamp & Instrument Tray
    dentalChair: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <!-- Hydraulic Base -->
      <ellipse cx="250" cy="420" rx="160" ry="24" fill="#334155" ${SK}/>
      <rect x="220" y="270" width="60" height="150" rx="6" fill="#64748b" ${SK}/>
      <!-- Foot Control Pedals -->
      <ellipse cx="140" cy="415" rx="30" ry="12" fill="#1e293b" ${SK}/>
      <!-- Ergonomic Contoured Medical Seat (Cyan-Blue Leather) -->
      <path d="M80,270 Q180,295 320,265 Q380,275 420,335 L375,355 Q345,305 295,295 L100,295 Z" fill="#0284c7" ${SK}/>
      <!-- Reclined Backrest -->
      <path d="M85,270 Q35,215 55,135 Q65,105 95,105 Q115,105 120,135 L135,270 Z" fill="#0284c7" ${SK}/>
      <!-- Adjustable Headrest -->
      <rect x="52" y="55" width="75" height="45" rx="16" fill="#0369a1" ${SK}/>
      <!-- Armrest -->
      <path d="M135,235 Q245,225 315,245" fill="none" stroke="#64748b" stroke-width="15" stroke-linecap="round"/>
      <!-- Overhead Articulated Dental Lamp -->
      <path d="M300,270 Q370,110 270,35" fill="none" stroke="#475569" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="250" cy="28" rx="36" ry="20" fill="#e2e8f0" ${SK}/>
      <ellipse cx="250" cy="30" rx="26" ry="11" fill="#fef08a"/>
      <polygon points="250,30 80,290 350,290" fill="rgba(254,240,138,0.20)"/>
      <!-- Dentist Instrument Delivery Tray -->
      <line x1="380" y1="170" x2="380" y2="280" stroke="#64748b" stroke-width="8"/>
      <rect x="330" y="155" width="120" height="20" rx="6" fill="#cbd5e1" ${SK}/>
      <path d="M345,150 L375,135 M395,150 L425,135" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
    </g>`,
    // Wall-mounted illuminated dental X-ray radiograph
    dentalXray: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <rect x="0" y="0" width="540" height="300" rx="22" fill="#0f172a" stroke="#0ea5e9" stroke-width="6"/>
      <rect x="15" y="15" width="510" height="270" rx="16" fill="#1e293b"/>
      <text x="270" y="48" text-anchor="middle" font-size="22" font-weight="900" fill="#38bdf8" font-family="Cairo">أشعة رقمية ثلاثية الأبعاد: تحديد السن 🔍</text>
      <!-- Stylized Dental Arch Curve -->
      <path d="M70,160 Q270,90 470,160" fill="none" stroke="#475569" stroke-width="16" stroke-linecap="round"/>
      <path d="M70,160 Q270,90 470,160" fill="none" stroke="#e2e8f0" stroke-width="4" stroke-dasharray="16,12" stroke-linecap="round"/>
      <!-- Target Highlight on Tooth #46 -->
      <circle cx="380" cy="145" r="34" fill="#ef4444" opacity="0.35"/>
      <circle cx="380" cy="145" r="20" fill="#ef4444" stroke="#ffffff" stroke-width="3"/>
      <text x="380" y="153" text-anchor="middle" font-size="18" font-weight="900" fill="#ffffff">⚡</text>
      <rect x="250" y="195" width="250" height="42" rx="10" fill="#7f1d1d" stroke="#ef4444" stroke-width="2"/>
      <text x="375" y="223" text-anchor="middle" font-size="18" font-weight="900" fill="#fca5a5" font-family="Cairo">الضرس السفلي #46 (ألم حاد)</text>
      <rect x="40" y="225" width="180" height="42" rx="10" fill="#059669"/>
      <text x="130" y="252" text-anchor="middle" font-size="18" font-weight="900" fill="#ffffff" font-family="Cairo">جاهز للعلاج فوراً ✓</text>
    </g>`,
    // Agonizing phone call friction card
    phoneCallAgony: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <rect x="0" y="0" width="580" height="340" rx="24" fill="#ffffff" stroke="#e11d48" stroke-width="7"/>
      <rect x="0" y="0" width="580" height="55" rx="20" fill="#ffe4e6"/>
      <text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#e11d48" font-family="Cairo">❌ مكالمة صوتية مستحيلة مع وجع الأسنان</text>
      <g transform="translate(30, 75)">
        <rect x="0" y="0" width="220" height="55" rx="14" fill="#f1f5f9" stroke="#1f2328" stroke-width="2"/>
        <text x="110" y="36" text-anchor="middle" font-size="20" font-weight="900" fill="#1f2328" font-family="Cairo">📞 اتصال بالعيادة...</text>
      </g>
      <g transform="translate(270, 75)">
        <rect x="0" y="0" width="280" height="55" rx="14" fill="#fef2f2" stroke="#ef4444" stroke-width="3"/>
        <text x="140" y="36" text-anchor="middle" font-size="20" font-weight="900" fill="#dc2626" font-family="Cairo">آآآخ.. ما قادر أتكلم! 😣</text>
      </g>
      <g transform="translate(30, 150)">
        <rect x="0" y="0" width="520" height="60" rx="14" fill="#f8fafc" stroke="#64748b" stroke-width="2"/>
        <text x="260" y="38" text-anchor="middle" font-size="19" font-weight="800" fill="#334155" font-family="Cairo">الاستقبال: «أي ضرس يوجعك؟ وشو نوع الألم؟» ❓</text>
      </g>
      <g transform="translate(30, 230)">
        <rect x="0" y="0" width="520" height="85" rx="16" fill="#fee2e2" stroke="#ef4444" stroke-width="3"/>
        <text x="260" y="36" text-anchor="middle" font-size="22" font-weight="900" fill="#991b1b" font-family="Cairo">وصف الوجع بالصوت يعذب المريض ويضيع الوقت!</text>
        <text x="260" y="68" text-anchor="middle" font-size="18" font-weight="900" fill="#7f1d1d" font-family="Cairo">المريض يحتاج حجز فوري وسريع بدون مكالمات ⏱️</text>
      </g>
    </g>`,
    // Smart Dental Triage & Booking UI (Sudegy Dental)
    smartDentalTriageApp: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <rect x="0" y="0" width="600" height="360" rx="26" fill="#ffffff" stroke="#0d9488" stroke-width="7"/>
      <rect x="0" y="0" width="600" height="60" rx="22" fill="#0d9488"/>
      <text x="310" y="42" text-anchor="middle" font-size="26" font-weight="900" fill="#ffffff" font-family="Cairo">⚡ نظام فرز وحجز الأسنان الذكي (Sudegy Dental)</text>
      <!-- Step 1 -->
      <g transform="translate(25, 80)">
        <rect x="0" y="0" width="170" height="190" rx="16" fill="#f0fdfa" stroke="#0d9488" stroke-width="3"/>
        <text x="85" y="45" text-anchor="middle" font-size="36">🦷</text>
        <text x="85" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#0f766e" font-family="Cairo">1. حدد السن</text>
        <text x="85" y="130" text-anchor="middle" font-size="16" font-weight="900" fill="#0f172a" font-family="Cairo">فم تفاعلي 3D</text>
        <text x="85" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#047857" font-family="Cairo">بلمسة واحدة ✓</text>
      </g>
      <text x="208" y="185" font-size="28" font-weight="900" fill="#0d9488">◀</text>
      <!-- Step 2 -->
      <g transform="translate(225, 80)">
        <rect x="0" y="0" width="170" height="190" rx="16" fill="#eff6ff" stroke="#2563eb" stroke-width="3"/>
        <text x="85" y="45" text-anchor="middle" font-size="36">⚡</text>
        <text x="85" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#1e3a8a" font-family="Cairo">2. اختر العرض</text>
        <text x="85" y="130" text-anchor="middle" font-size="16" font-weight="900" fill="#0f172a" font-family="Cairo">ألم نبضي حاد</text>
        <text x="85" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#1e3a8a" font-family="Cairo">بدون مكالمة 🔇</text>
      </g>
      <text x="408" y="185" font-size="28" font-weight="900" fill="#0d9488">◀</text>
      <!-- Step 3 -->
      <g transform="translate(425, 80)">
        <rect x="0" y="0" width="150" height="190" rx="16" fill="#fefce8" stroke="#ca8a04" stroke-width="3"/>
        <text x="75" y="45" text-anchor="middle" font-size="36">📅</text>
        <text x="75" y="90" text-anchor="middle" font-size="20" font-weight="900" fill="#854d0e" font-family="Cairo">3. حجز مؤكد</text>
        <text x="75" y="130" text-anchor="middle" font-size="16" font-weight="900" fill="#0f172a" font-family="Cairo">موعد فوري</text>
        <text x="75" y="160" text-anchor="middle" font-size="16" font-weight="900" fill="#854d0e" font-family="Cairo">خلال 30 ثانية ⏱️</text>
      </g>
      <rect x="25" y="285" width="550" height="55" rx="14" fill="#0d9488"/>
      <text x="300" y="320" text-anchor="middle" font-size="22" font-weight="900" fill="#ffffff" font-family="Cairo">🚀 حجز كامل ودقيق بلمسات بسيطة دون نطق كلمة واحدة</text>
    </g>`,
    // Doctor Clinic Dossier Card
    doctorClinicDossier: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <rect x="0" y="0" width="600" height="350" rx="26" fill="#ffffff" stroke="#25d366" stroke-width="7"/>
      <rect x="0" y="0" width="600" height="55" rx="22" fill="#e8f8f0"/>
      <text x="300" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#064e3b" font-family="Cairo">📲 ملخص الحالة السريرية وصل للدكتور (WhatsApp)</text>
      <circle cx="70" cy="115" r="38" fill="#25d366" stroke="#1f2328" stroke-width="3"/>
      <text x="70" y="128" text-anchor="middle" font-size="36">🦷</text>
      <text x="130" y="105" font-size="24" font-weight="900" fill="#1f2328" font-family="Cairo">المريض: أحمد (حالة طارئة ألم حاد) ⭐</text>
      <text x="130" y="138" font-size="20" font-weight="900" fill="#064e3b" font-family="Cairo">السن المصاب: الضرس السفلي الأيمن #46</text>
      <line x1="25" y1="165" x2="575" y2="165" stroke="#e5e7eb" stroke-width="3"/>
      <rect x="30" y="185" width="260" height="60" rx="12" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
      <text x="160" y="222" text-anchor="middle" font-size="18" font-weight="900" fill="#14532d" font-family="Cairo">الأعراض: نبض حاد ليلي مستمر ⚡</text>
      <rect x="310" y="185" width="260" height="60" rx="12" fill="#eff6ff" stroke="#2563eb" stroke-width="2"/>
      <text x="440" y="222" text-anchor="middle" font-size="18" font-weight="900" fill="#1e3a8a" font-family="Cairo">الموعد: محجوز تلقائياً 10:30 ص ✓</text>
      <rect x="30" y="260" width="540" height="65" rx="14" fill="#075e54"/>
      <text x="300" y="300" text-anchor="middle" font-size="22" font-weight="900" fill="#ffffff" font-family="Cairo">🩺 الدكتور فاهم سنك وألمك قبل أن تجلس على الكرسي!</text>
    </g>`,
    // Happy Tooth Sparkle Card
    happyToothSparkle: (id) => `<g id="${id}" data-layout-allow-overflow="true" data-layout-allow-overlap="true">
      <rect x="0" y="0" width="580" height="340" rx="26" fill="#ffffff" stroke="#0d9488" stroke-width="7"/>
      <rect x="0" y="0" width="580" height="55" rx="22" fill="#f0fdfa"/>
      <text x="290" y="38" text-anchor="middle" font-size="24" font-weight="900" fill="#115e59" font-family="Cairo">✨ ابتسامة صحية وراحة تامة بدون عذاب ✨</text>
      <!-- Big Molar Tooth Shape -->
      <g transform="translate(290, 160)">
        <path d="M-60,-50 C-75,-20 -60,20 -45,60 C-35,75 -20,60 -15,45 C-10,60 0,75 10,60 C25,20 40,-20 25,-50 C15,-65 -15,-65 -20,-50 C-25,-65 -50,-65 -60,-50 Z" fill="#f8fafc" stroke="#1f2328" stroke-width="5"/>
        <!-- Cute Smiling Face on Tooth -->
        <circle cx="-35" cy="-20" r="6" fill="#1f2328"/>
        <circle cx="0" cy="-20" r="6" fill="#1f2328"/>
        <path d="M-30,-5 Q-17,10 -5,-5" fill="none" stroke="#1f2328" stroke-width="4" stroke-linecap="round"/>
        <circle cx="-42" cy="-10" r="8" fill="#fca5a5" opacity="0.6"/>
        <circle cx="8" cy="-10" r="8" fill="#fca5a5" opacity="0.6"/>
        <!-- Star Sparkles around tooth -->
        <path d="M-75,-40 L-68,-42 L-75,-44 L-73,-35 Z" fill="#38bdf8"/>
        <path d="M45,-40 L52,-42 L45,-44 L47,-35 Z" fill="#f59e0b"/>
      </g>
      <rect x="40" y="255" width="500" height="60" rx="14" fill="#0d9488"/>
      <text x="290" y="293" text-anchor="middle" font-size="22" font-weight="900" fill="#ffffff" font-family="Cairo">🦷 الحل الذكي الذي يريح مريضك ويزيد حجوزات عيادتك</text>
    </g>`,
  };

  // ---------------- actions (all add tweens to the timeline) ----------------
  // transform origin of a rig part: art v2 parts carry data-pivot="x y" in character coordinates; v1 parts use the fallback
  function org(sel, fb) {
    const el = document.querySelector(sel); const pv = el && el.getAttribute("data-pivot"); if (!pv) return fb;
    const [x, y] = pv.split(/[ ,]+/).map(Number); let b; try { b = el.getBBox(); } catch (e) { return fb; }
    return `${(x - b.x).toFixed(1)}px ${(y - b.y).toFixed(1)}px`;
  }
  const isV2 = (p) => !!document.querySelector(p + "-idle");
  const mouthO = (p) => (isV2(p) ? "50% 30%" : "50% 50%");
  const A = {
    walk(tl, p, t, dur, step = 0.26) { const n = Math.max(1, Math.round(dur / step)); tl.fromTo(p + "-fl", { rotation: -16 }, { rotation: 16, duration: step, ease: "sine.inOut", yoyo: true, repeat: n - 1, transformOrigin: org(p + "-fl", "50% 0%"), immediateRender: false }, t); tl.fromTo(p + "-fr", { rotation: 16 }, { rotation: -16, duration: step, ease: "sine.inOut", yoyo: true, repeat: n - 1, transformOrigin: org(p + "-fr", "50% 0%"), immediateRender: false }, t); tl.fromTo(p + "-body", { y: 0 }, { y: -8, duration: step / 2, ease: "sine.inOut", yoyo: true, repeat: n * 2 - 1, immediateRender: false }, t); tl.set([p + "-fl", p + "-fr"], { rotation: 0 }, t + dur); },
    enter(tl, p, t, from = "left", dist = 520, dur = 0.6) { tl.fromTo(p, { x: from === "left" ? -dist : dist }, { x: 0, duration: dur, ease: "power2.out" }, t); A.walk(tl, p, t, dur, 0.2); },
    exit(tl, p, t, to = "right", dist = 900, dur = 1.0) { tl.to(p, { x: to === "left" ? -dist : dist, duration: dur, ease: "power1.in" }, t); A.walk(tl, p, t, dur, 0.24); },
    talk(tl, p, t, dur = 0.6) {
      if (!isV2(p)) { tl.fromTo(p + "-m", { scaleY: 1 }, { scaleY: 3, duration: 0.11, ease: "none", yoyo: true, repeat: Math.max(1, Math.round(dur / 0.11)) | 1, transformOrigin: "50% 50%", immediateRender: false }, t); return; }
      // v2: jaw bounce with uneven openings, so it reads as speech and not as a metronome
      const amp = [2.6, 1.5, 3.0, 1.9, 2.4, 1.3, 2.8, 1.7]; const n = Math.max(2, Math.round(dur / 0.1));
      for (let i = 0; i < n; i++) tl.to(p + "-m", { scaleY: i === n - 1 ? 1 : amp[i % amp.length], duration: 0.09, ease: "sine.inOut", transformOrigin: "50% 30%" }, t + i * 0.1);
    },
    blink(tl, p, t) {
      if (isV2(p) && document.querySelector(p + "-lids path")) { tl.set(p + "-lids", { opacity: 1 }, t); tl.fromTo(p + "-lids", { scaleY: 0.12 }, { scaleY: 1, duration: 0.06, yoyo: true, repeat: 1, ease: "none", transformOrigin: "50% 0%", immediateRender: false }, t); tl.set(p + "-lids", { opacity: 0 }, t + 0.13); return; }
      tl.fromTo(p + "-eyes", { scaleY: 1 }, { scaleY: 0.1, duration: 0.07, yoyo: true, repeat: 1, transformOrigin: "50% 50%", immediateRender: false }, t);
    },
    nod(tl, p, t) { tl.fromTo(p + "-head", { rotation: 0 }, { rotation: 7, duration: 0.18, yoyo: true, repeat: 1, transformOrigin: org(p + "-head", "50% 100%"), immediateRender: false }, t); },
    shake(tl, p, t, dur = 1.2) { const o = org(p + "-head", "50% 100%"); tl.fromTo(p + "-head", { rotation: -8 }, { rotation: 8, duration: 0.2, yoyo: true, repeat: Math.max(1, Math.round(dur / 0.2)), ease: "sine.inOut", transformOrigin: o, immediateRender: false }, t); tl.to(p + "-head", { rotation: 0, duration: 0.15, transformOrigin: o }, t + dur + 0.05); },
    tilt(tl, p, t, deg = 6) { tl.to(p + "-head", { rotation: deg, duration: 0.3, transformOrigin: org(p + "-head", "50% 100%") }, t); },
    arm(tl, p, side, t, deg, dur = 0.3) { tl.to(`${p}-a${side}`, { rotation: deg, duration: dur, ease: "back.out(1.7)", transformOrigin: org(`${p}-a${side}`, "50% 0%") }, t); },
    point(tl, p, t, side = "r", hold = 1.2) { A.arm(tl, p, side, t, side === "r" ? -110 : 110); A.arm(tl, p, side, t + hold, 0, 0.3); },
    wave(tl, p, t, dur = 1.4, side = "r") { A.arm(tl, p, side, t, side === "r" ? -140 : 140); tl.to(`${p}-a${side}`, { rotation: side === "r" ? -118 : 118, duration: 0.22, yoyo: true, repeat: Math.max(1, Math.round(dur / 0.22)), ease: "sine.inOut", transformOrigin: org(`${p}-a${side}`, "50% 0%") }, t + 0.3); },
    phoneUp(tl, p, t, side = "r") { A.arm(tl, p, side, t, side === "r" ? -150 : 150, 0.35); },
    shrug(tl, p, t) { [["l", -22], ["r", 22]].forEach(([s, d]) => tl.fromTo(`${p}-a${s}`, { rotation: 0 }, { rotation: d, duration: 0.25, yoyo: true, repeat: 1, transformOrigin: org(`${p}-a${s}`, "50% 0%"), immediateRender: false }, t)); },
    cheer(tl, p, t) {
      // a bent arm (hand on cheek, thumbs up) only lifts a little: a full turn would swing the forearm across the face
      const bent = (s) => { const el = document.querySelector(`${p}-a${s}`); return !!(el && el.getAttribute("data-bent")); };
      tl.fromTo(p, { y: 0 }, { y: -60, duration: 0.22, yoyo: true, repeat: 3, ease: "power2.out", immediateRender: false }, t);
      tl.to(p + "-al", { rotation: bent("l") ? 20 : 150, duration: 0.25, transformOrigin: org(p + "-al", "50% 0%") }, t);
      tl.to(p + "-ar", { rotation: bent("r") ? -20 : -150, duration: 0.25, transformOrigin: org(p + "-ar", "50% 0%") }, t); A.smile(tl, p, t);
    },
    // v2 brows move one by one: sad lifts the inner ends, angry pulls them down
    sad(tl, p, t) { tl.to(p + "-head", { rotation: 8, y: 10, duration: 0.5, transformOrigin: org(p + "-head", "50% 100%") }, t); if (document.querySelector(p + "-browl")) { tl.to(p + "-browl", { rotation: -14, y: -4, duration: 0.3, transformOrigin: "0% 50%" }, t); tl.to(p + "-browr", { rotation: 14, y: -4, duration: 0.3, transformOrigin: "100% 50%" }, t); } else tl.to(p + "-brows", { opacity: 1, rotation: 8, duration: 0.3, transformOrigin: "50% 50%" }, t); },
    angry(tl, p, t) { if (document.querySelector(p + "-browl")) { tl.to(p + "-browl", { rotation: 16, y: 4, duration: 0.2, transformOrigin: "0% 50%" }, t); tl.to(p + "-browr", { rotation: -16, y: 4, duration: 0.2, transformOrigin: "100% 50%" }, t); } else tl.to(p + "-brows", { opacity: 1, rotation: -10, duration: 0.2, transformOrigin: "50% 50%" }, t); tl.fromTo(p, { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, immediateRender: false }, t); },
    smile(tl, p, t) { tl.to(p + "-m", { scaleX: 1.6, scaleY: 0.6, duration: 0.25, transformOrigin: mouthO(p) }, t); },
    surprise(tl, p, t) { tl.to(p + "-eyes", { scaleY: 1.35, duration: 0.15, transformOrigin: "50% 50%" }, t); tl.to(p + "-m", { scaleX: 0.8, scaleY: 3.2, duration: 0.15, transformOrigin: mouthO(p) }, t); },
    neutral(tl, p, t) { tl.to([p + "-eyes", p + "-m"], { scaleX: 1, scaleY: 1, duration: 0.2 }, t); tl.to(p + "-brows", { opacity: (i, el) => +(el.getAttribute("data-rest") || 0), rotation: 0, duration: 0.2 }, t); if (document.querySelector(p + "-browl")) tl.to([p + "-browl", p + "-browr"], { rotation: 0, y: 0, duration: 0.2 }, t); tl.to(p + "-head", { rotation: 0, y: 0, duration: 0.25, transformOrigin: org(p + "-head", "50% 100%") }, t); },
    // v2 idle life for the whole scene: breathing, head drift, cloth sway (lags the head), blinks every 2.4-4 s
    idle(tl, p, t0, t1, seed = 1) {
      if (!isV2(p)) return; const D = Math.max(0.6, t1 - t0), rep = (per) => Math.max(1, Math.ceil(D / per));
      tl.fromTo(p + "-idle", { scaleY: 1 }, { scaleY: 1.012, duration: 1.6, ease: "sine.inOut", yoyo: true, repeat: rep(1.6), transformOrigin: "50% 100%", immediateRender: false }, t0);
      const ph = seed % 2 ? 1 : -1;
      tl.fromTo(p + "-hi", { rotation: -1.4 * ph }, { rotation: 1.4 * ph, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: rep(2.3), transformOrigin: org(p + "-hi", "50% 100%"), immediateRender: false }, t0);
      if (document.querySelector(p + "-gh")) tl.fromTo(p + "-gh", { rotation: 1.6 * ph }, { rotation: -1.6 * ph, duration: 2.3, ease: "sine.inOut", yoyo: true, repeat: rep(2.3), transformOrigin: org(p + "-gh", "50% 0%"), immediateRender: false }, t0 + 0.35);
      [["alS", 1.8], ["arS", -1.8]].forEach(([s, d]) => tl.fromTo(`${p}-${s}`, { rotation: 0 }, { rotation: d, duration: 2.6, ease: "sine.inOut", yoyo: true, repeat: rep(2.6), transformOrigin: org(`${p}-${s}`, "50% 0%"), immediateRender: false }, t0));
      if (document.querySelector(p + "-lids path")) { let t = t0 + 0.5 + (seed % 5) * 0.31, k = seed * 7919; while (t < t1 - 0.25) { A.blink(tl, p, t); k = (k * 9301 + 49297) % 233280; t += 2.4 + (k / 233280) * 1.6; } }
    },
    // ---- meme reactions (2026-11-12) ----
    // face: swap in an exaggerated full-face reaction (shock cry rage smug dead wow love nervous) with a head pop; back to
    // the resting face after `hold` seconds (hold 0 = stay until the scene ends). v1 characters fall back to the old beats.
    face(tl, p, t, kind, hold = 1.4) {
      const alt = `${p}-fx-${kind}`;
      if (!document.querySelector(alt)) { const fb = { shock: "surprise", nervous: "surprise", rage: "angry", cry: "sad", wow: "smile", love: "smile", smug: "smile", dead: "neutral" }[kind]; if (fb && A[fb]) A[fb](tl, p, t); return; }
      const all = Array.from(document.querySelectorAll(`[id^="${p.slice(1)}-fx-"]`)).map((e) => "#" + e.id);
      tl.set(all, { opacity: 0 }, t); tl.set(p + "-fx0", { opacity: 0 }, t); tl.set(alt, { opacity: 1 }, t);
      tl.fromTo(p + "-hi", { scale: 1.16 }, { scale: 1, duration: 0.3, ease: "back.out(3)", immediateRender: false }, t);
      if (kind === "rage" || kind === "cry" || kind === "nervous") tl.fromTo(p, { x: 0 }, { x: kind === "rage" ? 9 : 5, duration: 0.05, yoyo: true, repeat: kind === "rage" ? 11 : 7, immediateRender: false }, t + 0.05);
      if (kind === "shock") tl.fromTo(p, { y: 0 }, { y: -34, duration: 0.14, yoyo: true, repeat: 1, ease: "power2.out", immediateRender: false }, t);
      if (hold > 0) { tl.set(alt, { opacity: 0 }, t + hold); tl.set(p + "-fx0", { opacity: 1 }, t + hold); }
    },
    // emote: a comic symbol over the head (the element is created by scenes.cjs): pop in, wobble, float, fade out
    emote(tl, sel, t, hold = 1.2) {
      gsap.set(sel, { svgOrigin: "0 0" });   // set at identity: an origin first set on a scaled element bakes in an offset (GSAP smoothOrigin)
      tl.fromTo(sel, { opacity: 0, scale: 0.2, y: 24, rotation: -14 }, { opacity: 1, scale: 1, y: 0, rotation: 0, duration: 0.28, ease: "back.out(2.6)" }, t);
      tl.to(sel, { rotation: 9, duration: 0.16, yoyo: true, repeat: Math.max(1, Math.round((hold - 0.3) / 0.16)), ease: "sine.inOut" }, t + 0.28);
      tl.to(sel, { opacity: 0, y: -26, duration: 0.22, ease: "power2.in" }, t + hold);
    },
    // zoomTo: camera punch-in on a face (fx, fy in frame pixels); the face is pulled toward the frame centre while it grows
    zoomTo(tl, sel, t, fx, fy, s = 1.5, hold = 1.2) {
      const o = `${fx}px ${fy}px`, tx = (540 - fx) * 0.6, ty = (900 - fy) * 0.6;
      tl.to(sel, { scale: s, x: tx, y: ty, duration: 0.2, ease: "power3.out", transformOrigin: o, force3D: false }, t);
      if (hold > 0) tl.to(sel, { scale: 1, x: 0, y: 0, duration: 0.32, ease: "power2.inOut", transformOrigin: o, force3D: false }, t + hold);
    },
    // impact: manga focus lines around a point (element created by scenes.cjs): slam in, flicker, fade
    impact(tl, sel, t, dur = 0.7) {
      gsap.set(sel, { svgOrigin: "0 0" });
      tl.fromTo(sel, { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: 0.12, ease: "power4.out" }, t);
      tl.to(sel, { scale: 1.04, duration: 0.07, yoyo: true, repeat: Math.max(1, Math.round((dur - 0.3) / 0.07)), ease: "none" }, t + 0.12);
      tl.to(sel, { opacity: 0, duration: 0.18, ease: "power2.in" }, t + dur);
    },
    // lip-sync to the narration: one mouth opening per syllable-length slice of every spoken word (real whisper word times),
    // closed between words, plus a small head dip on every third word for emphasis
    lipsync(tl, p, words) {
      if (!document.querySelector(p + "-m") || !words || !words.length) return;
      const o = mouthO(p), amp = [2.6, 1.7, 3.0, 2.1, 2.5, 1.5, 2.8, 1.9]; let k = 0;
      words.forEach(([a, b], wi) => {
        const d = Math.max(0.1, b - a), n = Math.max(1, Math.round(d / 0.17)), h = d / n / 2;
        for (let i = 0; i < n; i++) {
          const t = a + (d * i) / n;
          tl.to(p + "-m", { scaleY: amp[k++ % amp.length], duration: Math.min(0.08, h), ease: "sine.out", transformOrigin: o }, t);
          tl.to(p + "-m", { scaleY: 1.15, duration: Math.min(0.08, h), ease: "sine.in", transformOrigin: o }, t + h);
        }
        tl.to(p + "-m", { scaleY: 1, duration: 0.06, transformOrigin: o }, b);
        if (wi % 3 === 0 && isV2(p)) tl.fromTo(p + "-head", { y: 0 }, { y: 3, duration: 0.12, yoyo: true, repeat: 1, ease: "sine.inOut", immediateRender: false }, a);
      });
    },
    pop(tl, sel, t) { tl.fromTo(sel, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.32, ease: "back.out(2.2)" }, t); },
    hide(tl, sel, t) { tl.to(sel, { opacity: 0, scale: 0.9, duration: 0.2, ease: "power2.in" }, t); },
    drop(tl, sel, t, dist = 500) { tl.fromTo(sel, { opacity: 0, y: -dist }, { opacity: 1, y: 0, duration: 0.45, ease: "bounce.out" }, t); },
    dropMany(tl, prefix, n, t, gap = 0.14) { for (let i = 0; i < n; i++) A.drop(tl, `${prefix}${i}`, t + i * gap); },
    slideIn(tl, sel, t, dx = 200) { tl.fromTo(sel, { opacity: 0, x: dx }, { opacity: 1, x: 0, duration: 0.35, ease: "back.out(1.8)" }, t); },
    flyAway(tl, sel, t, dx = 900) { tl.to(sel, { x: dx, opacity: 0, duration: 0.4, ease: "power2.in" }, t); },
    money(tl, sels, t) { sels.forEach((s, i) => tl.fromTo(s, { opacity: 1, x: 0, y: 0, rotation: 0 }, { x: 260, y: -220 - i * 40, rotation: 40 + i * 20, opacity: 0, duration: 0.9, ease: "power1.out" }, t + i * 0.3)); },
    drain(tl, sel, t, dur = 1.6) { tl.fromTo(sel, { scaleY: 1, fill: "#2f8a57" }, { scaleY: 0.08, fill: "#c0392b", duration: dur, ease: "power1.in", transformOrigin: "50% 100%" }, t); },
    fill(tl, sel, t, dur = 1.2) { tl.fromTo(sel, { scaleY: 0.08, fill: "#c0392b" }, { scaleY: 1, fill: "#2f8a57", duration: dur, ease: "power2.out", transformOrigin: "50% 100%" }, t); },
    spin(tl, sel, t, dur, turns = 3, origin = "0 0") { tl.fromTo(sel, { rotation: 0, svgOrigin: origin }, { rotation: 360 * turns, svgOrigin: origin, duration: dur, ease: "power1.inOut" }, t); },
    trip(tl, id, t, darkSel) { tl.to(`#${id}-spark`, { opacity: 1, duration: 0.05 }, t); tl.to(`#${id}-spark`, { opacity: 0, duration: 0.08, repeat: 3, yoyo: true }, t + 0.05); tl.to(`#${id}-led`, { fill: "#c0392b", duration: 0.05 }, t); tl.to(`#${id}-screen`, { fill: "#3b4652", duration: 0.05 }, t); if (darkSel) tl.fromTo(darkSel, { opacity: 0 }, { opacity: 1, duration: 0.15 }, t + 0.05); },
    acOn(tl, id, t) { tl.fromTo(`#${id}-air path`, { opacity: 0, y: -10 }, { opacity: 1, y: 10, duration: 0.4, stagger: 0.08, repeat: 2, yoyo: true, ease: "sine.inOut" }, t); tl.set(`#${id}-air`, { opacity: 1 }, t); },
    acOff(tl, id, t) { tl.to(`#${id}-air`, { opacity: 0, duration: 0.1 }, t); tl.to(`#${id}-led`, { fill: "#c0392b", duration: 0.05 }, t); },
    lightsOn(tl, sels, t) { tl.to(sels, { fill: "#f3c64f", duration: 0.3 }, t); },
    shakeScreen(tl, sel, t) { tl.fromTo(sel, { x: 0 }, { x: 10, duration: 0.05, repeat: 5, yoyo: true, immediateRender: false }, t); },
    flash(tl, sel, t) { tl.fromTo(sel, { opacity: 0 }, { opacity: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, t); },
    push(tl, sel, t, dur, to = 1.06) { tl.fromTo(sel, { scale: 1 }, { scale: to, duration: dur, ease: "none", transformOrigin: "50% 60%" }, t); },
    stamp(tl, sel, t) { tl.fromTo(sel, { opacity: 0, scale: 2.4, rotation: -30 }, { opacity: 1, scale: 1, rotation: -14, duration: 0.3, ease: "power4.in" }, t); },
    bob(tl, sel, t, dur) { tl.fromTo(sel, { y: 0 }, { y: -14, duration: 0.8, yoyo: true, repeat: Math.max(1, Math.round(dur / 0.8)), ease: "sine.inOut" }, t); },
  };

  // fill every [data-char] / [data-prop] placeholder with its SVG
  function hydrate(root = document) {
    root.querySelectorAll("[data-char]").forEach((g) => { const o = JSON.parse(g.dataset.opts || "{}"); const v1 = o.art === 1 || window.SF_ART === 1; const f = (!v1 && CHAR2[g.dataset.char]) || CHAR[g.dataset.char]; if (f) g.innerHTML = f(g.dataset.cid || g.id, o); });
    // Set every rig origin now, at rest. GSAP keeps an element where it is when its origin changes (smoothOrigin), so an
    // origin first set by a tween that starts rotated or scaled would bake a permanent offset into that part.
    if (window.gsap) root.querySelectorAll("[data-char]").forEach((g) => {
      g.querySelectorAll("[data-pivot]").forEach((el) => { if (el.id) gsap.set(el, { transformOrigin: org("#" + el.id, "50% 50%") }); });
      const p = "#" + (g.dataset.cid || g.id); if (!isV2(p)) return;
      [["-lids", "50% 0%"], ["-m", "50% 30%"], ["-eyes", "50% 50%"], ["-browl", "0% 50%"], ["-browr", "100% 50%"]].forEach(([part, o]) => { if (document.querySelector(p + part)) gsap.set(p + part, { transformOrigin: o }); });
    });
    root.querySelectorAll("[data-prop]").forEach((g) => { const o = JSON.parse(g.dataset.opts || "{}"); const v1 = o.art === 1 || window.SF_ART === 1; const f2 = !v1 && PROP2[g.dataset.prop]; const f = f2 || PROP[g.dataset.prop]; if (f) { g.innerHTML = f(g.dataset.pid || g.id, o); if (!v1 && !f2) soften(g); } });
  }
  // karaoke: split sentences into word spans; optional keyword underline
  function karaoke(tl, id, wt, opt = {}) {
    const el = document.getElementById(id); if (!el) return;
    const words = el.textContent.trim().split(/\s+/); el.textContent = "";
    const key = opt.key == null ? -1 : (opt.key < 0 ? words.length + opt.key : opt.key);
    words.forEach((w, i) => { const s = document.createElement("span"); s.className = "kw"; s.id = id + "-w" + i; s.textContent = w; if (i === key) { const u = document.createElement("i"); u.className = "uw"; u.id = id + "-u"; u.innerHTML = `<svg viewBox="0 0 100 20" preserveAspectRatio="none"><path d="M3 14 Q50 2 97 12" fill="none" stroke="${opt.underline || "#c08a1e"}" stroke-width="7" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`; s.appendChild(u); } el.appendChild(s); if (i < words.length - 1) el.appendChild(document.createTextNode(" ")); });
    (wt || []).forEach(([a, b], i) => {
      const w = "#" + id + "-w" + i; if (i >= words.length) return;
      tl.fromTo(w, { color: opt.dim }, { color: opt.hi, duration: 0.1, ease: "none" }, a);
      tl.fromTo(w, { scale: 1 }, { scale: 1.1, duration: 0.14, ease: "power2.out", yoyo: true, repeat: 1, transformOrigin: "50% 60%" }, a);
      tl.to(w, { color: opt.fin, duration: 0.25, ease: "none" }, Math.max(a + 0.12, b));
      if (i === key) tl.to("#" + id + "-u", { scaleX: 1, duration: 0.45, ease: "power2.out" }, a + 0.05);
    });
  }
  // match cut: the anchor of the outgoing scene and the anchor of the incoming scene sit on the same spot and size at the cut,
  // so the cut reads as one continuous motion (phone ringing at night -> same phone showing the booking).
  // Measured here by seeking the finished timeline, so walks, camera moves and pops are taken into account.
  // The bigger anchor's scene carries the zoom: "in" = the incoming scene starts zoomed onto the old spot and relaxes,
  // "out" = the outgoing scene pushes in so its anchor lands on the new one. Scale never drops below 1 and the frame
  // always stays covered; when that makes a perfect match impossible the remaining error (px) is reported.
  function matchCut(tl, o) {
    const W = 1080, H = 1920, root = document.getElementById("root");
    const box = (sel, t) => {
      tl.seek(t, false); for (const f of window.FRAME_HOOKS || []) f();
      const e = document.querySelector(sel); if (!e) return null;
      const r = e.getBoundingClientRect(), R = root.getBoundingClientRect(), k = W / R.width;
      if (!r.width || !r.height) return null;
      return { cx: (r.left + r.width / 2 - R.left) * k, cy: (r.top + r.height / 2 - R.top) * k, w: r.width * k, h: r.height * k };
    };
    const rep = { at: o.at, from: o.from, to: o.to };
    (window.__matchcuts = window.__matchcuts || []).push(rep);
    const A = box(o.from, o.at - 0.04), B = box(o.to, o.at + 0.02);
    if (!A || !B) { rep.error = `anchor not found or empty: ${!A ? o.from : o.to}`; console.error("matchcut", rep.error); return; }
    const fit = (P, Q) => {   // transform for Q's scene so that Q lands on P
      const max = o.maxScale || 2.4;
      let s = Math.max(1, Math.sqrt((P.w * P.h) / (Q.w * Q.h)));
      if (Q.cx > 0) s = Math.max(s, P.cx / Q.cx); if (Q.cx < W) s = Math.max(s, (W - P.cx) / (W - Q.cx));
      if (Q.cy > 0) s = Math.max(s, P.cy / Q.cy); if (Q.cy < H) s = Math.max(s, (H - P.cy) / (H - Q.cy));
      s = Math.min(s, max);
      const cl = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
      const x = cl(P.cx - s * Q.cx, W * (1 - s), 0), y = cl(P.cy - s * Q.cy, H * (1 - s), 0);
      return { s: +s.toFixed(3), x: Math.round(x), y: Math.round(y), err: Math.round(Math.hypot(x + s * Q.cx - P.cx, y + s * Q.cy - P.cy)) };
    };
    const mode = o.mode && o.mode !== "auto" ? o.mode : (A.w * A.h >= B.w * B.h ? "in" : "out");
    const dur = o.dur == null ? 0.7 : o.dur, hold = o.hold == null ? 0.12 : o.hold;
    if (mode === "in") {
      const f = fit(A, B); Object.assign(rep, { mode, ...f });
      tl.set(o.inScene, { x: f.x, y: f.y, scale: f.s, transformOrigin: "0 0" }, o.at);
      tl.to(o.inScene, { x: 0, y: 0, scale: 1, duration: dur, ease: "power2.inOut" }, o.at + hold);
    } else {
      const f = fit(B, A); Object.assign(rep, { mode, ...f });
      // origin in its own set: GSAP ignores transformOrigin in fromTo's from-vars; the push ends one frame before the cut
      const t0 = Math.max(0, o.at - 1 / 30 - dur);
      tl.set(o.outScene, { transformOrigin: "0 0" }, t0);
      tl.fromTo(o.outScene, { x: 0, y: 0, scale: 1 }, { x: f.x, y: f.y, scale: f.s, duration: Math.min(dur, o.at - 1 / 30 - t0), ease: "power2.in", immediateRender: false }, t0);
    }
    if (rep.err > 40) console.warn("matchcut", `anchors ${o.from} -> ${o.to} miss by ${rep.err}px (frame must stay covered); move one anchor closer`);
    tl.seek(0, false);
  }
  window.SF = { CHAR, PROP, A, hydrate, karaoke, matchCut };
})();
