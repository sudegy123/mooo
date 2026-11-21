# Viral playbook: what gets watched, how the Chinese do it, and how to sell without pitching

Research date: 2026-11-12. Companion to `docs/tiktok-algorithm-2026-11-12.md` (how distribution works). This file answers four owner questions: which visual style gets views, which hooks work, what Douyin creators do differently, and how a video sells indirectly. Written for anyone (person or agent) who plans or builds Sudegy videos.

How to read the evidence:
- **Official** = the platform's own statement.
- **Data** = a counted dataset. Every dataset here comes from a tool vendor, so sample and method are stated and the numbers are directional.
- **Practice** = what practitioners teach; no measurement behind it.
- No source can promise that a video will spread. These findings raise the odds; our own TikTok numbers decide (section 7).

## 1. Which look gets views

| Finding | Source and sample | What it means for us |
|---|---|---|
| "Stick & Meme Explainer" videos got **2.4x** the median TikTok views of narrated AI stories (views index 212 vs 88). "Story Slides" came second (164). | Data: Faceless.so benchmark, 4,604 TikTok posts from 442 teams, Aug-Sep 2026; 127 posts in the winning format; mostly new accounts. | Simple characters, meme-like exaggerated reactions and a clear explanation beat polished narrated stories. Our 2D stage is the right base; it needs stronger reactions. |
| The same tutorial reached a 156K median **faceless** against 52K with one person on camera. POV (107K) and screen recordings (91K) beat selfie video (48K). | Data: Revid, 176,367 TikToks that already had 1,000+ likes, Oct 2025-Oct 2026 (survivor sample). | Faceless explainers are not a handicap. Screen recordings of the real product are a strong format (`phone` scenes). |
| Videos with **few spoken words** (under 40 characters) had a 123K median; videos talking from start to finish had 68K. | Data: Revid, same sample. | Let the picture carry the story. Keep sentences at the short end of their range. |
| **56%** of viral videos contain no speech at all (66% on TikTok). The median viral TikTok has 5 cuts. | Data: ViralVideoSearch, 1,328 viral videos, Apr-Sep 2026, labels from an AI classifier. | A music-and-text version with no narrator is worth building (not built yet). |
| Video **length barely changed views** (best band under 30 s: index 110; worst: 88). Another dataset found the opposite (90 s+ best). | Data: Faceless.so; ContentLabs (3,997 videos, averages, skewed by hits). | Length is not the lever. Keep 15-25 s until our own data says otherwise. |
| An on-screen hook title made **no measurable difference** (index 98 with, 99 without). | Data: Faceless.so. | Text alone does not hook. The first frame's picture does. |
| Evening posts had the highest median views (+35% over the next best time). | Data: Faceless.so, channel local time. | Matches the earlier advice to post in the evening. |

China (Practice and reported numbers):
- "沙雕动画" (silly meme-face animation) grew out of meme faces drawn on simple bodies and took off by telling serial stories from web novels. Its engine is story plus exaggerated reactions, not drawing quality.
- Character accounts with a fixed persona build huge followings: 一禅小和尚 passed 47 million followers by 2021 with emotional shorts (reported by 人人都是产品经理).
- In 2026 animal-character AI short dramas such as 《小猫小喵的打工生活》 passed 140 million views; viewers relate to the "office worker" persona (36Kr).

**Style decision for the factory:** recurring characters with a persona, a tiny story, exaggerated meme reactions, few words, and the real product screen as proof.

## 2. Hooks

| Finding | Source |
|---|---|
| The best hook type shows the **product or outcome first** (6,037 average views, about 2x the weakest type). | Data: OpusClip, 34,635 clips, Jan-Mar 2026 |
| **53%** of viral videos open on a **visual hook** where the first frame does the work. A bold claim opens 28%, a curiosity gap 14%, a direct question only 2%. | Data: ViralVideoSearch |
| "Hot take" and "investigator" openings averaged about 140K views; story openings ("let me tell you about...") averaged 7K. "Proof drop" hooks (a checklist, a chart, a receipt) earned the most saves. | Data: ContentLabs |
| Fear (something to lose), empathy and outrage lead on views. Empathy leads on shares. Trust leads on saves. Aspiration and hope are the weakest. | Data: ContentLabs (averages) |
| Openers that underperform: "let me tell you about the time...", "hi everyone, today...", "okay so...", "have you ever wondered...". | Data: OpusClip |
| Videos with an **implied** call to action averaged 139K views; a direct ask averaged 72K. 69% of viral videos ask for nothing; when they ask, "comment below" is the most common. | Data: ContentLabs; ViralVideoSearch |
| Chinese hook families: curiosity, fear or pain point, belonging or identity, urgency, self-improvement. Formula example: deny common sense, then name the consequence ("千万不要...除非你想..."). | Practice: 人人都是产品经理 (120 viral Douyin openings, 2024) |

The ten patterns the factory uses are in `factory/hooks.json`. The weak openers above are rejected by the copy gate.

**Honesty limits (AGENTS.md rule 2):**
- "Specific number" hooks may only count things the video itself shows ("three mistakes"), never invented results.
- "Expert" hooks may only use credentials listed in the client's facts.

## 3. How Douyin works and what its creators do

- **Official (Douyin, 2025):** the platform published its algorithm principles on 95152.douyin.com and at an open day.
  - The system "已几乎不依赖对内容和用户打标签" (hardly relies on tagging content or users).
  - A neural network predicts each viewer's actions (finish, like, comment, share, save, follow, come back) and ranks by predicted value. The simplified formula is probability of each action x the value of that action.
  - Completion alone "难以满足需求" (is not enough), so save and "save + return visit" are targets too.
  - Uploads pass machine and human review, then get base traffic.
- **Practice:** creators design for the "黄金3秒" (golden three seconds) and for completion rate. Scripts are written as a three-column table: picture, voice, sound effect. One teaching rubric scores a script 40 points for the hook, 30 for pace (no filler), 30 for an ending that invites comments.
- **Practice:** "灵感不可复制，但套路可以" (inspiration cannot be copied, patterns can). Creators reuse proven structures with new topics.
- **Practice (B2B):** chasing broad entertainment traffic gives "有播放、无询盘" (views without enquiries). Business accounts show capability instead (process, quality checks, the owner as chief problem solver) and treat video as the entry to a funnel.

## 4. Selling without pitching (种草, "planting grass")

- **Official (Ocean Engine with Roland Berger, 2022):** the O-5A model tracks people from aware (A1) and interested (A2) to **A3 "种草"** (seeded), then purchase (A4) and repeat (A5).
  - A3 covers people who actively show interest: they search, ask or save.
  - Seeded people are the core metric before purchase.
  - Efficient seeding = right people x right touchpoint x right content.
- **Practice:** "与其自卖自夸，不如告诉用户别人的为什么不好": instead of praising yourself, show viewers how to judge the options (the "避坑", avoid-the-trap, genre).
- **Data:** promotional videos averaged 26K views against 124K+ for commentary and educational hybrids (ContentLabs). Trust-led content is saved the most.

**Our seeding signals (the A3 of this account):** comments with the keyword, saves, profile views, and searches for the brand name. People already searched "Sudgi" on TikTok.

**The twelve indirect angles** used by `factory/tools/idea_engine.cjs`: avoid-the-trap guide, relatable daily skit, hot take, behind the scenes, checklist to save, cost of doing nothing, real objection answered, series episode, five-second self-test, fair comparison, free template shown on screen, and outcome showcase. In every angle the product appears once, late, as the natural end of the story. It is never the subject of the hook.

## 5. What was built from this (2026-11-12)

- `factory/hooks.json`: ten hook patterns with evidence, the emotions table, and the weak openers that the copy gate rejects. The brain writes each hook to a named pattern; alternatives must use different patterns.
- Meme reactions for art v2: exaggerated faces (`face` beat: shock, cry, rage, smug, dead, money, love), comic emotes over the head (`emote` beat), a camera punch-in on a face (`zoomTo`) and manga impact lines (`impact`).
- `factory/cast.json`: recurring fictional characters with a persona, for series.
- `factory/tools/idea_engine.cjs`: indirect-selling ideas from the brain's real offers and verticals, optionally seeded with real prospect objections.
- (planned, not built yet) a pace check that measures visual changes in the first seconds.
- `factory/tools/perf.cjs`: logs each video's TikTok numbers with its features and reports which patterns hold viewers on this account.

## 6. Not built yet

- A no-narrator version (music, on-screen text, sound effects). Two datasets favour it.
- Testing "implied CTA" against the comment-keyword CTA on our own account.

## 7. The loop that decides

Research gives starting bets. After each post, log the numbers with `node factory/tools/perf.cjs add ...`. After ten or more logged videos, `perf.cjs report` shows which hook patterns and openers held viewers on this account, and the copy step reads that result. Bets that lose on our account are dropped, whatever the studies say.

## Sources
- Faceless.so, The Faceless Shorts Benchmark 2026: https://faceless.so/research/faceless-shorts-benchmark
- Revid, Short Form Video Trends 2026 (176,367 TikToks): https://www.revid.ai/blog/short-form-video-trends
- ViralVideoSearch, What 1,328 viral short videos have in common: https://viralvideosearch.com/data
- The Content Labs, 3,997-video study: https://thecontentlabs.app/blog/what-goes-viral-in-2026-data-study
- OpusClip, The 5 TikTok hook types (34,635 clips): https://www.opus.pro/blog/tiktok-hooks-that-go-viral-2026
- 澎湃新闻, 抖音首度披露算法机制 (2025-04): https://www.thepaper.cn/newsDetail_forward_30665269
- 人人都是产品经理, 120 条爆款短视频"黄金三秒" (2024): https://www.woshipm.com/copy/6012657.html
- 人人都是产品经理, 黄金3秒拆解师 (scoring rubric): https://www.woshipm.com/ai/6319065.html
- Roland Berger, 巨量引擎 O-5A 人群资产经营方法论 (2022): https://www.rolandberger.com/zh/Insights/Publications/巨量引擎O-5A人群资产经营方法论.html
- 人人都是产品经理, 种草内容与对比类选题: https://www.woshipm.com/operate/4604033.html
- 36Kr, AI short dramas on Douyin (2026): https://eu.36kr.com/en/p/3384407387963140
- 人人都是产品经理, 一禅小和尚 case: https://www.woshipm.com/marketing/4385756.html
- B2B Douyin white paper (vendor, unverified figures): https://gitcode.csdn.net/6a29147d10ee7a33f27a49fc.html
