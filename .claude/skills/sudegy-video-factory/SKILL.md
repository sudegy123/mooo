---
name: sudegy-video-factory
description: Produce viral short videos (ads, explainers, skits) for Sudegy and its clients with the factory in G:\sudegy-video-studio\factory — job file in, checked videos out (9:16 + 1:1 + 16:9, SRT, thumbnail, post copy, QA report). Use for any request to make, change or batch videos for Sudegy, Andoria, Dr. Mazin or a new client.
---

# Sudegy video factory

One command turns a job file into delivered, checked videos:

```
node factory/run.cjs factory/jobs/<job>.json                 # full run (copy → voice → reels → compose → check → render → finish → QA → deliver)
node factory/run.cjs factory/jobs/<job>.json --copy-only     # write/inspect the script first
node factory/run.cjs factory/jobs/<job>.json --no-render --preview   # composition + snapshot contact sheet, no render
node factory/run.cjs factory/jobs/<job>.json --variants 3    # A/B: one video per alternative hook
```
Delivery lands in `READY_TO_SEND/<client>/<job>/` with `report.md` and `post.txt`. A variant is delivered only if QA passes (`--deliver-anyway` overrides).

## Non-negotiable rules (from the owner)
- Free tools only: Gemini (free key), Antigravity CLI images, HyperFrames, three.js, Lyria music via the free key. Never spend Higgsfield credits or any paid API without asking.
- Voice: one continuous Gemini TTS take in Modern Standard Arabic (`Kore`); short dialect phrases are allowed only as on-screen tags.
- Copy is written by the Sudegy brain (`copy.cjs`), gated (no digits, prices, discounts, guarantees, result/medical claims, client banned words), then proofread by a second Gemini pass. Read the script before rendering; fix overclaims by hand and record them in `script.json` → `human_edits`.
- No on-screen demo label (the owner removed «عرض تجريبي/توضيحي…» from every video on 2026-10-22; client kits keep `label: ""`; a job may set `label` only if the owner asks). Honesty stays: never invent numbers, testimonials, usernames or results; never show before/after for skincare; never draw a real person (e.g. Dr. Mazin) as a character without permission — use a stamp/seal instead.
- Readability: each sentence stays on screen ≥ 0.35 s/word + 0.7 s (the voice step picks the fastest tempo that passes).
- Run everything on G: through `scripts/hf.ps1`; 1 render worker (8 GB RAM). Close other apps during long renders.

## TikTok rules (binding since 2026-11-12; AGENTS.md section 8, evidence in `docs/tiktok-algorithm-2026-11-12.md`)
Measured on @sudegy.clients: every post stalled at about 350-440 views because most viewers left at **0:01**. Dark `title` openers did worst (sudegy-before-after: 4.4 s average watch, 0 followers). A `stage` opener with a Gulf character acting from frame 0 did best (sudegy-smart-funnel: 6.5 s, 3 followers).
- **Scene 0 = moving picture.** Use `stage` (character acting from 0 s, props popping), `phone` (real screen) or `media`. Never `title`: `run.cjs` stops before any API call or render unless `--allow-title-opener`, and QA fails it. `title` scenes are fine later in the video.
- **Hook ≤ 6 words**, with the pain or result in its first words, spoken from the first frame. `formats.json` sets every hook to 3-6 words, and the copy gate has no tolerance on the hook.
- **TikTok cut 15-25 s.** Long formats (28-48 s) are for WhatsApp and sales; QA warns above 26 s.
- **Post caption** starts with the plain search phrase people type; 3-5 hashtags.
- **AI label.** Realistic AI people or scenes need TikTok's AI-generated label at upload.
- **`--variants`** is for the owner to pick ONE; never post two variants of the same video to the same account (TikTok does not recommend duplicated content).
- After posting, read the per-video retention in TikTok Studio after 48 h and log it next to the job.

## Viral formats (`factory/formats.json`)
`pov-skit` (موقف يومي «لما…»), `myth-fact` (خرافة ولا حقيقة؟), `five-sec-quiz` (تحدي ٥ ثواني), `three-mistakes` (٣ أخطاء), `pain-demo` (ألم ثم حل), `reply-comment` (رد على تعليق), `satisfying-reveal` (مشهد مُرضٍ), `series-episode` (حلقة من سلسلة).
Viral mechanics to keep in every job: hook visible on frame 0 (no fade from black, no logo intro); the payoff of the hook arrives in the first 1–2 s; a visual change every 2–3 s; one CTA only (prefer «اكتب كلمة … في التعليقات» — someone must reply to the comments); end with a word or image from the opening so the video loops; sound-off first (captions carry the meaning).

## Scene types (job `scenes[]`, each scene `say`s one or more script roles)
- `stage` — 2D flat characters + props + beats (the skit engine). Characters: `woman`, `man_sd` (جلابية وعمة), `man_gulf` (ثوب وغترة), `doctor_m`, `doctor_f`, `seller`. Props: `ac`, `inverter`, `lamp`, `battery`, `house`, `counter`, `panelBox`, `panel`, `sun`, `clock`, `mirror`, `desk`, `jarShelf`, `jars`, `jarPile`, `phoneHand`. Elements (`els`): `bubble`, `think`, `tag` (`good`/`gold`/`ink`), `qm`, `mark` (`ok`), `note`, `stamp`, `big`, `img`. Beats: `enter exit walkTo flip talk blink nod shake tilt point wave arm phoneUp shrug cheer sad angry smile surprise neutral pop show hide slideIn flyAway stamp drop dropMany money drain fill spin trip dark light acOn acOff panelsOn lightsOn shakeScreen flash bob`. `at`: seconds from scene start, `"40%"`, `"end-1.2"`, or `"w3"` (word 3 of the scene's sentence).
- `phone` — real app recording inside a phone; consecutive phone scenes with the same `group` share one phone; `segs` are `[from, to, weight]` using event labels from the client's recording (`"calc+0.3"`, `"end"`, `"stop"`); `clip` uses a client video; `scan: true` adds a scan line; `side` adds a character; `pill` is the step caption.
- `title` (giant kinetic words — pattern interrupt), `quiz` (options + tap + comment pill), `media` (official photo/video with ken burns), `cta` (brand, comment pill, url, optional waving character and product), `liquid` (WebGL liquid gold forming the brand), `microscope` (photo dive into a living cell field), `jar3d` (three.js product teardown with labels).

## Video effects on real footage (`/effects`, installed 2026-11-19)
- Vendored skill `.claude/skills/effects` (Vibha Ramprakash, claude-video-effects @ 60840ac, MIT, code reviewed): 51 talking-head effects (match-cut, spotlight, todo, apple-toggles, orbit, glass-widgets...). Local CPU only (YuNet face tracking, MediaPipe cut-out); Python env in its `.venv` on G:. Made for a real person on camera (owner footage, real recordings, realistic AI clips); 2D stage characters are not detected as faces.
- Factory: `node factory/tools/effects.cjs <in.mp4> <fx> [out.mp4] --start 3 --end 6 --text "..." [--opt k=v] [--still 4.5]` (always check `--still` frames first); `--list` shows all. In a job, `"effects": [{ "fx", "start", "end", "text", ... }]` runs on the render before music/loudness.
- Arabic: our own `scripts/fx_private.py` (loaded by fx.py's hook, not vendored code) shapes Arabic and draws it with Segoe UI Bold; match-cut uses Arabic filler words when its word is Arabic. Do not use `words.py` (it pip-installs faster-whisper and downloads a model); use our whisper.cpp timings.
- Speed measured: about 7 s of wall time per second of 1080p video.

## Transitions between scenes (`transition` on the incoming scene, added 2026-11-19)
- `wipe` (default): gold wipe + whoosh + small punch-in. `cut`: hard cut, nothing else.
- `matchcut`: hard cut where one thing keeps its spot and size, so the cut reads as one motion (unanswered phone at night → the same phone showing the booking in the clinic; small clock → big clock).
  `"transition": "matchcut", "match": { "from": "<id in previous scene>", "to": "<id in this scene>" }`. Optional: `mode` (`auto` | `in` | `out`), `dur` 0.7, `hold` 0.12, `maxScale` 2.4, `sfx` (file or `false`; default a soft whoosh).
  - An anchor is a character, prop or el id of that scene (`#<sceneId>_<id>`), or a raw `"#selector"` for other scene types. Both sides must be non-phone scenes; an unknown id stops the compose step.
  - `auto`: if the old anchor is bigger, the new scene starts zoomed onto it and relaxes (`in`); if smaller, the old scene pushes in so its anchor lands on the new one (`out`). Scale never goes below 1, so no empty edge ever shows. When that makes a perfect match impossible, the page logs the miss in px (`window.__matchcuts`).
  - Best results: anchors in similar positions, and present (not popping in or entering) at the cut.
  - Check: `node factory/tools/matchcut_lab.cjs [--render]` measures every cut and writes before|after frames to `out/lab/matchcut_<n>.jpg`. Measured 2026-11-19: phone 1 px miss (`in`), clock 21 px (`out`, coverage-limited), the same in the real render.

## Art v2: the default look since 2026-11-12 (`factory/runtime/stage.js` CHAR2, `factory/lib/scenes.cjs` backdrop)
- **Characters** (same type names and beats as before): shaded flat style with soft gradients, sleeves and hands, eyes with highlights, visible brows, beard and shemagh pattern (`man_gulf`), imma (`man_sd`), hijab (`woman`, `doctor_f`), contact shadow and a soft drop shadow.
- **Idle life** runs automatically in every `stage` scene: breathing, blinks every 2.4-4 s, head drift, ghutra/hijab sway, slight arm sway. `talk` is now an uneven jaw bounce. `sad`/`angry` move each brow. Arms turn on the shoulder and the head on the neck (`data-pivot`).
- **Size:** v2 characters default to `scale` 1.2, so faces read on a phone. Set `scale` per character for close-ups (1.4-1.6) and **never put a card, bubble or tag over a face**: put it on the other side or above the head.
- **Backdrops** (`bg`): `room` (window light, curtains, plant), `clinic` (blinds, tooth poster, cabinet, tiled floor), `office` (window on a Gulf skyline), `shop` (shelves of products), `dark` / `luxury` (spotlight and floor glow), `light` (soft colour blobs). The caption band (y 200-480) stays plain. The backdrop pushes slower than the stage, which gives parallax.
- **Opt out:** `backdrop: false` on a scene; `opts: { art: 1 }` on one character; `"art": 1` on the job brings back the old characters and flat backgrounds.
- **Lab:** `node factory/tools/art_lab.cjs [--render]` shows every character on every backdrop through the real compose code. No voice or API calls; it writes `out/lab/art_v2_sheet.jpg` (and `art_v2.mp4`). Run it after any change to the art.
- **Measured:** render speed is unchanged, about 9 s of wall time per second of video at draft quality.
- **Props v2:** these are redrawn with the same size, origin and sub-ids, so `trip`, `drain`, `fill`, `spin`, `acOn` and `dropMany` still work:
  - `desk`, `counter`, `laptop`, `phoneHand`, `clock`, `inverter`, `battery`, `ac`, `lamp`, `siren`, `panelBox`, `jars`, `jarShelf`, `jarPile`.
  - Every other prop (the job-specific UI cards, `dentalChair`...) is softened automatically: thin outlines tinted by their own fill instead of 6 px ink.
- **Lip-sync to the narration:** put `speaks: true` on a character (or `speaker: "<id>"` on the scene). Its mouth then opens on every narrated word of that scene, using the real whisper word times: one opening per syllable-length slice, closed between words, and a small head dip every third word. Use it for the character whose lines the voice reads; `talk` is still available for a short manual flap.
- **Faces stay visible (enforced):** after composing, `factory/tools/face_check.cjs` plays the composition in headless Chrome. It measures every card, bubble, tag, caption and front prop against each character's eyes and mouth.
  - Covering ≥ 35% of a face for ≥ 0.3 s stops the run **before rendering** and names the element and time.
  - Fix the layout, or mark an intended overlap with `faceOk: true` on that element or prop. `--allow-face-cover` overrides the check only when the owner asks.
  - The result also appears in the QA table. Run it by hand with `node factory/tools/face_check.cjs compositions/<dir>`.
  - Measured on the old `sudegy-dental-clinic-skit`: 5 severe covers (bubbles over the doctor and patients, up to 60%).

## Viral kit (2026-11-12, evidence in `docs/viral-playbook-2026-11-12.md`)

**Hooks**
- `factory/hooks.json` holds 10 measured hook patterns. The brain names one per hook (`job.hookPattern` forces one), and the alternatives must use different patterns.
- The gate rejects weak openers ("هل تساءلت", greetings, "اليوم سنتحدث").
- Every hook gets a heuristic score in the log and in `report.md`. The score is directional only.
- `job.emotion` and `job.seed` steer the emotional register and how the product appears (indirect selling).

**Meme reactions** (stick & meme explainers got 2.4x the views of narrated stories)
- `face` beat: `{do:"face", who, as:"shock|cry|rage|smug|dead|wow|love|nervous", hold}`. `hold: 0` keeps the face until the scene ends.
- `emote` beat: `{do:"emote", who, kind:"sweat|anger|question|exclaim|idea|heart|zzz|sparkle|coins|dizzy", pos:"left|right"}`.
- `zoomTo` beat: `{do:"zoomTo", who, scale:1.5, hold}`, a camera punch-in on the face.
- `impact` beat: `{do:"impact", who}`, manga focus lines.

**Recurring cast** (`factory/cast.json`)
- Use `{cast:"bu_saad"}` on a character. The cast is أبو سعد, د. سارة, عم عثمان, نورة (the Sudegy guide) and حمد.
- They are fictional: never present them as real customers.

**Idea engine**
- Run `node factory/tools/idea_engine.cjs --vertical dental [--objection "..."]`.
- It writes indirect-selling ideas to `ideas/` from the brain's real offers: 12 angles, the product shown late, an implicit CTA, and a success signal.

**Learning loop**
- After 48 h, log each posted video: `node factory/tools/perf.cjs add <job> --variant 1 --views --avg --stopped --full --comments --saves --followers`.
- `perf.cjs report` writes `factory/perf/learned.json` from 10 videos on, and the copy and idea steps then prefer what held viewers on this account.

## Style catalog (adapted from lemo-opuscar references, read-only, Arabic-first)
- **Caption-first** (sound-off): huge captions are the main actor, one keyword highlighted; use `title` scenes and the default karaoke captions.
- **Game show / judgement**: rounds with a judgement stamp («خرافة!» / «حقيقة»); use `title` + `stage` with `stamp` for `myth-fact`.
- **Microgame**: 3-second challenges that speed up; use `quiz` scenes in a row for `five-sec-quiz`.
- **Hologram scan**: scan line + labels over a face or a load chart; use `phone` with `scan`, or `microscope` labels.
- **Isometric diorama**: system explainers (house → panels → battery → inverter) — not built yet; build as a new scene type when needed.
- **Teardown**: `jar3d`; for other products build the lathe profile from photos.
- **Living screencast**: `phone` scenes + a side character that reacts (nod/point) to what the app does.

## Karaoke timing (free, local)
After the voice take, `lib/align.cjs` runs whisper.cpp (`tools/whisper/bin/Release/whisper-cli.exe`, model `tools/whisper/models/ggml-small.bin`, Arabic) and aligns the recognised words to the script words, so every highlighted word lands on its real spoken time. If fewer than 55 % of words match it falls back to the letter-weighted estimate (`--no-align` skips it).

## Music (free)
`factory/music/*.wav` beds made with `factory/tools/music.py` (Lyria RealTime via the free Gemini key; BPM-only config; keep a reference to the connect() context or the socket closes). The finish step ducks music under the voice. Platform-trending sounds can also be added inside TikTok/Instagram at upload time.

## Performance notes (measured 2026-10-22 on the Latitude 5580)
Render ≈ 9–12 s of wall time per second of video at 1080×1920. The render browser is pinned to the NVIDIA 930MX but CPU capture is the bottleneck; `--experimental-fast-capture` was slower here and is disabled by blur/blend/WebGL anyway; 2 workers gained ~8 % at higher RAM risk. Use `--no-render --preview` to iterate, then one final render.
