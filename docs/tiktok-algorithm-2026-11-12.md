# TikTok distribution: how it works and what the factory does about it

Research date: 2026-11-12. Written for anyone (person or agent) who makes or posts Sudegy videos.
Each claim is marked by source strength: **Official** (TikTok's own pages), **Engineering** (ByteDance or leaked internal material), **Data** (independent studies), **Unverified** (repeated by blogs, no primary source).

## 1. What TikTok officially says

- **Official, Newsroom (June 2020):** recommendations use (a) user interactions, (b) video information such as "captions, sounds, and hashtags", and (c) device and account settings such as language, country and device type. These settings "receive lower weight in the recommendation system relative to other data points".
- **Official, same page:** "A strong indicator of interest, such as whether a user finishes watching a longer video from beginning to end, would receive greater weight than a weak indicator."
- **Official, same page:** "neither follower count nor whether the account has had previous high-performing videos are direct factors in the recommendation system." Each video is judged on its own.
- **Official, same page:** the feed "generally won't show two videos in a row made with the same sound or by the same creator", and "We also don't recommend duplicated content, content you've already seen before, or any content that's considered spam."
- **Official, Transparency Center (undated):** personalisation factors include "Your region", "The language your device is set to", the device's operating system, recently watched videos and follow relationships. Video signals include "The time the video was posted", "The length of the video" and "The hashtags associated with the video". Only videos that pass moderation enter the pool.
- **Official, Community Guidelines (released 2026-08-25, effective 2026-09-24):**
  - Content is not eligible for the For You feed (FYF) "if it includes unoriginal or reused material without anything new".
  - AI content: "we require creators to label AI-generated or significantly edited content that shows realistic-looking scenes or people. Unlabeled content may be removed, restricted, or labeled by our team."
  - Fake engagement: inflated likes and followers are removed.
  - "If a video isn't getting many views, it also doesn't necessarily mean it broke a rule."
  - Accounts that post a lot of FYF-ineligible content can become ineligible as a whole. This comes from a secondary summary; confirm it on TikTok's page before relying on it.
- **Official, Newsroom (2025-07-30):** **Content Check Lite** in TikTok Studio on desktop checks, before posting, whether a video is likely to be FYF-ineligible.
- **Official, as reported by TechCrunch and MacRumors (November 2025):** viewers can turn down AI-generated content in Settings > Content Preferences > Manage Topics. TikTok adds invisible watermarks to content made with its own AI tools and to uploads with C2PA credentials.
- **Official, TikTok for Business "Creative best practices" (last updated June 2025):** this page is written for ads, but it is TikTok's most detailed creative guidance.
  - "Introduce your content proposition in the first 3 seconds".
  - "Prioritize your hook in the first 6 seconds".
  - 9:16 vertical, at least 720p, inside the UI safe zone.
  - Use sound or music, and captions or text overlays. The page suggests 5-10 words per second for text. The owner found fast text unreadable, so the factory keeps rule 5c for key lines and uses fewer words instead.
  - Use transitions, stickers and graphics to hold attention.
  - "go for a DIY or not overly polished style".
  - "featuring people such as creators, employees, or customers".
  - End with a clear call to action, lean into trends, and test 3-5 creatives.

## 2. Engineering sources

- **Engineering, "TikTok Algo 101":** an internal document reported by the New York Times in December 2021. TikTok confirmed it is authentic.
  - The system optimises for "retention" (users coming back) and "time spent".
  - Each video's score combines predicted like, comment, playtime and play. The formula is quoted secondhand.
- **Engineering, Monolith:** a ByteDance paper (RecSys 2022, arXiv 2209.07663).
  - The recommender trains online on fresh interactions and syncs to serving in near real time.
  - It is not a description of TikTok's exact production system.
  - Implication: the first viewers' behaviour feeds back into the model quickly.

## 3. Independent data

- **Data, Buffer (October 2025, 11.4M posts, 150K+ accounts):** compared with one post a week, views per post rise by
  - +17% at 2-5 posts a week,
  - +29% at 6-10 a week,
  - +34% at 11 or more a week.

  But **median views per post stay around 500** at every frequency. The gains are at the top: the 90th percentile went from 3,722 to 14,401. Posting more buys more chances at a hit; it does not lift the typical post.
- **Data, 2026 benchmarks (Socialinsider, Dash Social):** engagement by views is about 3.4-4.2%.

## 4. Repeated everywhere but unverified (do not build on these)

None of these appear on TikTok's own pages. Measure with our own numbers instead.

- A fixed first test pool of 200-500 viewers.
- "Follower-first" testing since late 2025.
- Completion thresholds (50% or 70%).
- "A share is worth 5 likes".
- A formal "duplicate content penalty" or "shadowban" for reposts.

## 5. Working model (our synthesis of the above)

1. A post passes moderation and eligibility checks.
2. TikTok shows it to a first group of people whose interests match. Region and device language are factors, but with lower weight.
3. TikTok watches what they do: swipe away or stay in the first seconds, watch time, finishing, rewatching, sharing, saving, commenting, following, visiting the profile, or tapping "not interested".
4. If the video does better than comparable videos, it goes to a larger group, and the loop repeats. If not, distribution stops. Every video starts from zero, whatever the account size.
5. Search is a second door. Captions, on-screen text, speech and hashtags are matched to what people type.

## 6. Our own numbers (@sudegy.clients, TikTok Studio, 28 days to 2026-11-10)

- **Views per post:** about 350-440 on day one, then distribution stops. That is close to Buffer's median of about 500, so the account is not penalised. No post has passed the first round.
- **Retention:** TikTok reports "most viewers stopped at **0:01**" on factory posts and 0:02 on the others. Average watch time is 2.7-6.5 s, and only 1.1-2.3% watch to the end.
- **Best factory post, sudegy-smart-funnel:** a moving Gulf 2D character and a chat panel from frame 0. It got 6.52 s average watch, 3 new followers and 1 share.
- **Weakest factory post, sudegy-before-after:** a dark slide with dim karaoke text. It got 4.37 s average watch and 0 new followers.
- **Search works for explainers:** the CRM post was found through "انظمة crm", "شرح crm", "ازاي اعمل crm" and "crm system شنو".
- **Audience:**
  - The luxury post's viewers were 56% Egypt and 14% Tunisia; the Gulf was about 6%.
  - The account overall is 70% male; 25-34-year-olds are 43.5%.
  - Since content in Arabic is matched to Arabic-language viewers, Gulf-specific signals have to come from the content itself. This is an inference, not stated by TikTok.

## 7. Rules for the factory and for posting

**Opening (this decides everything for us now)**
- Frame 0 is a finished, moving picture: a face, a person, the real product screen, or the problem scene. Never a dark slide, a logo or dim text.
- The hook is 6 words or fewer and is spoken from 0.0 s. The pain or result is heard within the first 1.5 s. On-screen text is at full brightness from frame 0.
- Something changes every 1-2 s in the first 6 s: a cut, a zoom or a card.

**Body**
- The TikTok cut is 15-25 s. Long versions are for WhatsApp and sales only.
- One idea per video. End with one call to action that matches the hook, for example "comment the word X".
- Give a reason to send or save the video: a checklist, a common mistake, or something the viewer can check for themselves. No invented numbers (AGENTS.md rule 2).

**Native look**
- Prefer real people (the owner on camera), real screen recordings and real footage. 2D characters are fine.
- Realistic AI people or scenes must carry TikTok's AI-generated label when posted.

**Search**
- Write the caption in Arabic and include the exact phrases people search for.
- Say the same phrase and show it on screen in the first 3 s.
- Use 3-5 relevant hashtags.
- Spell the brand "Sudegy | سوديجي" in the bio and on the end card, because people searched for "Sudgi".

**Audience**
- Gulf targets: Gulf dialect, places, currency and characters in the first seconds.
- Sudan targets: Sudanese dialect.
- Paid promotion targeted by location only with the owner's approval.

**Posting**
- Keep about one post a day.
- Do not post near-identical variants, such as the same video with three hooks. TikTok "doesn't recommend duplicated content". Test hooks on different topics instead.
- Run Content Check Lite in TikTok Studio on desktop before posting.
- Reply to comments within the first hour, with a video reply for good questions.

**Measure each video after 48 h**
- Check "most viewers stopped at", average watch time, completion %, shares, saves, new followers and profile views.
- Proposed goal for the next test video: "stopped at" 0:03 or later, and 8 s or more average watch on a video of about 20 s.

## Sources
- TikTok Newsroom, How TikTok recommends videos #ForYou (2020): https://newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you
- TikTok Transparency Center, recommendation system: https://www.tiktok.com/transparency/en/recommendation-system
- TikTok Community Guidelines, For You feed standards (2026): https://www.tiktok.com/community-guidelines/en/fyf-standards
- TikTok Community Guidelines, Integrity and authenticity (2026): https://www.tiktok.com/community-guidelines/en/integrity-authenticity
- TikTok for Business, Creative best practices (June 2025): https://ads.tiktok.com/help/article/creative-best-practices
- TikTok Newsroom, new creator tools including Content Check Lite (2025-07-30): https://newsroom.tiktok.com/new-tools-for-creators
- TechCrunch, AI-generated content control (2025-11-18): https://techcrunch.com/2025/11/18/tiktok-now-lets-you-choose-how-much-ai-generated-content-you-want-to-see/
- Buffer, posting frequency study (11M+ posts): https://buffer.com/resources/how-often-should-you-post-on-tiktok/
- Gizmodo on the "TikTok Algo 101" document (2021): https://gizmodo.com/leaked-tiktok-doc-reveals-its-obvious-secret-to-an-addi-1848166901
- ByteDance, Monolith paper: https://arxiv.org/pdf/2209.07663v2.pdf
- Socialinsider 2026 TikTok benchmarks: https://www.socialinsider.io/tiktok-statistics/
- Hootsuite, how the TikTok algorithm works in 2026 (third-party summary): https://blog.hootsuite.com/tiktok-algorithm/
