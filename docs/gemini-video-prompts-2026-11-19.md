# Making Sudegy ads with Gemini video (2026-11-19)

## Two ways to generate
| Route | Cost | Limits | Arabic speech |
|---|---|---|---|
| Gemini app (owner's Pro subscription), paste the prompt | included in the plan | about 3 clips per 5 h reported; 4-10 s; 16:9 or 9:16 | works: our own clip `gemini_generated_video_324c875b` speaks Gulf Arabic |
| API from this machine (`gemini-omni-1.2-flash` / `1.1-flash`, visible to our key) | about $0.10 per second of 720p per Soku (not verified), each edit bills again, no free tier per Soku | up to 10 s per clip, extend to 40 s; 360p-4k per Google's skill | not documented ("English only for now" per Soku) |
The key in AGENTS.md is on the free tier, so API video needs the owner's OK and billing. Default route: the app.

## Prompt rules that matter (from Google's Omni skill + guides)
1. **Write like a director, not keywords.** Order: subject and look → action → setting → camera and framing → lighting → style → audio → what must not appear. Google: precise camera and framing directions work better than long world descriptions.
2. **One continuous shot.** Omni cuts between several shots by default. Write "One single continuous shot, no scene cuts" when you need one take (needed for face tracking effects and match cuts).
3. **Speech in quotes, short.** One sentence that fits the clip (about 7-12 Arabic words for 8 s). Long scripts get cut off; the model does not speed them up.
4. **Name the audio and exclude music.** "Sound: phone ringing, quiet clinic. No music." We add our own music and loudness later.
5. **Say what must not appear.** "No on-screen text, no captions, no logos, no subtitles". We add Arabic text ourselves, so it is spelled right.
6. **9:16 in the prompt** and keep the face in the upper third, with space above the head for behind-the-head effects.
7. **Timing in plain words or timecodes**: `[0-3s] ... [3-8s] ...`.
8. **Fix with edits, not re-rolls** ("Change the lighting to evening. Keep everything else the same.") Each edit is a new generation (costs again on the API).
9. **Explore in stills first** (cheaper), then animate the chosen still as `<FIRST_FRAME>`.

## Technique: a matched pair for a match cut
Generate clip A (the pain) and clip B (the result) with the SAME first sentence: identical person, desk, "Locked-off camera on a tripod at eye level, medium close-up, face centred in the upper third", "exactly the same framing and camera position". Then join them with a hard cut on the face (the match-cut method of `scratch/mc_gemini/build.cjs`, same maths as the factory's `SF.matchCut`).
Better still for consistency: generate clip A, take its last frame as `<FIRST_FRAME>` of clip B.

## Sudegy rules that still apply
- Spoken lines come from the brain: `node scripts/brain_gemini_video.cjs <vertical> briefs/gemini-video/<name>.json` writes both lines and both prompts (gate: hook 3-6 words, no digits, no guarantee or diagnosis words).
- Realistic AI people = TikTok's AI-generated label when posting. Every output also carries Google's SynthID watermark.
- No real clinic names, logos or faces; no invented numbers on screen.

## After generation (our skills)
1. Match cut A → B on her face.
2. `/effects` on the joined clip (`node factory/tools/effects.cjs`): e.g. `spotlight` with an Arabic word on the hook, `apple-toggles` / `todo` for what the system does. Check `--still` frames first.
3. Captions, music bed, -14 LUFS (factory finish step or the video-editing skill).

## Sources
- Google's Gemini Omni Flash skill (installed plugin `gemini-skills:gemini-omni-flash-api`), and Google AI on X: https://x.com/GoogleAI/status/2059381218660270435
- Soku, Omni Flash for ad creative (vendor): https://soku.ai/blog/gemini-omni-flash-ad-creative
- Atlabs prompting guide (vendor): https://www.atlabs.ai/blog/ultimate-gemini-omni-flash-prompting-guide-2026
- AI Blew My Mind tutorial (public part only): https://aiblewmymind.substack.com/p/gemini-omni-video-tutorial
- UGC prompt structure: https://ugcvids.ai/blog/how-to-write-veo-3-1-prompts-for-product-ads , https://movby.ai/blog/how-to-make-tiktok-reels-with-veo-3-1-9-16-prompt-templates
