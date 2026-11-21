# Sudegy Video Studio — Rules for every agent working here

Goal: short (9:16, ~15s) outcome-first demo videos for Sudegy's services, built in code over real product screen recordings, critiqued by a separate pass, fixed, re-rendered, and tested as multiple hook variants.

These rules extend `C:\Users\Admin\sudegy-sales\AGENTS.md`. If the two ever disagree, the stricter one wins.

## 1. Outcome-first (what the video shows)
- The video shows the RESULT the client gets (e.g. evening bookings captured for a dental clinic, a 3-point clinical summary on the doctor's phone, direct orders without aggregator cuts). Never the website, the code, or a tech feature on its own.
- Verticals and offers come from `sudegy_brain.js` (`OFFERS`, `VERTICALS`), not from memory.
- First frame (0–2s) is the hook: a concrete pain or result in plain words, not a logo.

## 2. Truthfulness
- On-screen demo labels («عرض تجريبي…», «Synthetic Pitch», «بيانات توضيحية») are NOT used: the owner removed them from every video on 2026-10-22. Truthfulness is kept by the rules below (no invented numbers, testimonials, results or real faces); app screens may show the example inputs used in the recording.
- No fabricated testimonials, reviews, ratings, patient/customer faces or quotes. Testimonial videos only with real, permitted testimonials.
- Any number shown on screen (bookings, revenue, minutes saved) is either real and sourced, or labelled "illustrative / توضيحي". Never present invented numbers as results.
- No claims of guaranteed virality or guaranteed results, in the video or in the message that carries it.
- Do not use a real person's face/voice/brand without permission. Real clinic logos only if the clinic is the recipient of that specific pitch.

## 3. Copy goes through the brain
- All on-screen text, voice-over scripts and the WhatsApp/Instagram message that accompanies a video are generated through `C:\Users\Admin\sudegy-sales\sudegy_brain.js` (via `gemini.js askJSON`), not hand-written templates.
- Accompanying first messages: under 60 words, no long self-introduction (rule 5 of the sales AGENTS.md). Keep the brain's quality gate (`checkFirstMessage`) in the loop.
- Do not edit `sudegy_brain.js` or any file in `sudegy-sales` from this project without the user asking. Add video-specific prompts here and import the brain.

## 4. Pipeline (always in this order)
1. `briefs/<slug>.md` — vertical, outcome, hook variants, label status, source screens.
2. Build composition in `compositions/<slug>/` (HTML → MP4, HyperFrames first choice).
3. Render to `out/<slug>/v1_<hook>.mp4`.
4. Critique pass by a different step than the builder: extract frames with ffmpeg, check legibility, contrast, frozen frames, loudness, Arabic RTL shaping, safe zones for 9:16. Write findings to `critique/<slug>/v1.md`.
5. Fix, re-render as v2. Maximum 3 critique rounds, then ask the user.
6. Deliver 3 hook variants; the user chooses what to send.

## 5. Technical constraints (this machine)
- Windows 10, GeForce 930MX (2 GB), 7.8 GB RAM. No local video-generation models. Everything is code-rendered over real screen recordings or static brand assets.
- Node, npm, ffmpeg, git, Python are installed. `gh` and `yt-dlp` are not.
- Preferred: self-host assets locally; do not hotlink third-party URLs.
- Do NOT use the Higgsfield MCP tools for this user.

## 5b. Disk and environment (user instruction, 2026-10-17: use G: for everything)
- The C: drive is almost full. All work, temp files, caches, outputs and installs stay on G:. Never delete the user's own files on C: (e.g. npm-cache); only remove what this session created.
- Run HyperFrames only through `scripts/hf.ps1` (G:-redirected temp/caches, telemetry off, skill auto-install off, `GEMINI_API_KEY` removed so `snapshot` cannot send frames to Gemini). Always `--workers 1` (about 0.9 GB RAM free).
- Do not use `hyperframes usage`, `feedback`, `cloud render`, `publish`, or `snapshot --describe` unless the user asks.
- Image generation (Nano Banana) is allowed by the user; the current key is on the free tier where the image models have limit 0.

## 5c. Readability (user feedback 2026-10-17: "too fast to read")
- Every on-screen text must stay FULLY visible at least 0.35 s per word + 0.7 s. Check with `node scripts/reading_audit.mjs <composition_dir> <rows.json>` before delivering. Dense proof cards may be scan-only, but the key lines inside them must pass.
- Video length is secondary to readability: the first 15 s version was cut to be readable and became 23.6 s.
- A second model may act as independent critic (`scripts/gemini_critic.mjs`); its duration estimates are rough, so verify every claim against frames or the timeline before acting.

## 5d. Voice
- Narration is ONE continuous take written through the brain (`scripts/brain_narration.cjs`), never separate lines with gaps. The picture follows the voice (`scripts/make_narrated.cjs`). Measure gaps with ffmpeg silencedetect; the critic model's gap timestamps are unreliable.
- Gemini through the user's Pro subscription = Antigravity CLI (`%LOCALAPPDATA%agyinagy.exe -p`): text and images only, no TTS, no video. Use narrow image prompts (generate only, no shell commands); never widen its permissions or use --dangerously-skip-permissions.

## 6. Third-party skills and code
- Third-party skills/repos run code on this machine. Read the code BEFORE installing or running anything.
- Clone untrusted repos only into `vendor-review/<name>/` (shallow), read them there, and never run their scripts or `npm install` from inside that folder. Install only after the user approves the review.
- Licence check before adoption: HyperFrames Apache-2.0, motion-video-kit MIT, claude-remotion-skill MIT, watch-video-skill MIT, ad-video-skills MIT, OpenMontage AGPLv3 (avoid if offered as a service).
- Star counts and licences in `docs/research-2026-10-17.md` were read from GitHub pages and not independently verified; recheck the LICENSE file in the repo.

## 7. Language
- Videos and messages for Gulf prospects: Arabic (Saudi-friendly) unless the brain says otherwise. Formal proposals/decks remain 100% English per the sales rules.
- Arabic text must render RTL and connected; verify in extracted frames before delivery.

## 8. TikTok distribution (owner request 2026-11-12; evidence and sources in `docs/tiktok-algorithm-2026-11-12.md`)
- TikTok judges every video on its own, by how the first viewers react; follower count is not a direct factor (TikTok, official). On @sudegy.clients every post got about 350-440 views on day one and then stopped, because most viewers left at 0:01-0:02.
- Frame 0 is a moving picture: a person or character acting, the real product screen, or the problem scene. Never a `title` text slide, dark slide, logo or dim text as the first scene. `factory/run.cjs` refuses a `title` first scene unless the owner asks (`--allow-title-opener`), and QA fails it.
- Hook: 6 words or fewer, spoken from the first frame, naming the pain or the result in its first words. On-screen text at full brightness from frame 0. `formats.json` and the copy gate enforce the word limit.
- Something changes every 1-2 s in the first 6 s. The TikTok cut is 15-25 s; longer versions are for WhatsApp and sales (QA warns above 26 s).
- Native look beats ad look (TikTok's own creative guidance): real people (the owner on camera), real screen recordings, real footage; 2D characters are fine. Realistic AI-generated people or scenes must be posted with TikTok's AI-generated label.
- Search: the post caption is Arabic and starts with the phrase people type in TikTok search; the same phrase is spoken and shown on screen in the first 3 s; 3-5 relevant hashtags; brand written "Sudegy | سوديجي".
- Of the 3 hook variants (section 4, step 6), post only one per account. TikTok does not recommend duplicated content; test hooks on different topics instead.
- 2D art (owner request 2026-11-12): art v2 characters, props and backdrops are the default (details in the sudegy-video-factory skill). Faces must stay visible: `factory/tools/face_check.cjs` runs automatically and stops a render when a card or bubble covers a face. Check any art change with `node factory/tools/art_lab.cjs`.
- Before posting: Content Check Lite (TikTok Studio, desktop). After 48 h, record "most viewers stopped at", average watch time, completion %, shares, saves and new followers, and compare with the baseline in the research file.
