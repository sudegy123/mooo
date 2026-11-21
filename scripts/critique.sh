#!/usr/bin/env bash
# Objective critique pass for a rendered ad video. Runs only ffmpeg/ffprobe; nothing is installed or sent anywhere.
# Idea and thresholds adapted from motion-video-kit (MIT) "quality-bar.md" and the Gauntlet loop.
#
# Usage: scripts/critique.sh <video.mp4> <outdir> [expect=1080x1920] [max_seconds=16]
# Output: <outdir>/report.md, contact.jpg (1 frame/sec), f_*.jpg (key frames to LOOK at)
#
# This measures; it does not judge. The visual/business judgement is a separate pass by a
# critic that did not build the video (see AGENTS.md rule 4, critique/README.md).
set -euo pipefail

f="${1:?video path}"; out="${2:?output dir}"; want="${3:-1080x1920}"; maxs="${4:-16}"
mkdir -p "$out"
rep="$out/report.md"

meta=$(ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,codec_name,pix_fmt -show_entries format=duration \
  -of default=noprint_wrappers=1 "$f")
w=$(echo "$meta" | sed -n 's/^width=//p'); h=$(echo "$meta" | sed -n 's/^height=//p')
fr=$(echo "$meta" | sed -n 's/^r_frame_rate=//p'); dur=$(echo "$meta" | sed -n 's/^duration=//p')
codec=$(echo "$meta" | sed -n 's/^codec_name=//p'); pix=$(echo "$meta" | sed -n 's/^pix_fmt=//p')
has_audio=$(ffprobe -v error -select_streams a -show_entries stream=codec_type -of csv=p=0 "$f" | head -1 || true)
fps=$(awk -v r="$fr" 'BEGIN{split(r,a,"/"); printf "%.2f", (a[2]>0?a[1]/a[2]:a[1])}')

pf() { if [ "$1" = "1" ]; then echo "PASS"; else echo "FAIL"; fi; }
ok_res=0; [ "${w}x${h}" = "$want" ] && ok_res=1
ok_dur=$(awk -v d="$dur" -v m="$maxs" 'BEGIN{print (d<=m)?1:0}')
ok_pix=0; [ "$pix" = "yuv420p" ] && ok_pix=1   # needed for playback on phones / WhatsApp / IG

# --- frozen time: frame-to-frame luma difference at 10 fps (motion-video-kit method) ---
frozen=$(ffmpeg -hide_banner -i "$f" -vf "fps=10,scale=320:-1,format=gray,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG" -an -f null - 2>&1 \
  | grep -o "YAVG=[0-9.]*" | awk -F= -v th=0.35 '{t=NR/10; if($2<th){n++; if(!s)s=t; e=t} else if(s){printf "%.1f-%.1fs ", s, e; s=0}} END{if(s)printf "%.1f-%.1fs ", s, e; printf "|%d", n}' || true)
frozen_ranges="${frozen%|*}"; frozen_n="${frozen##*|}"; frozen_n="${frozen_n:-0}"
frozen_s=$(awk -v n="$frozen_n" 'BEGIN{printf "%.1f", n/10}')

# --- loudness (only if there is audio) ---
loud="no audio track"
if [ -n "$has_audio" ]; then
  loud=$(ffmpeg -hide_banner -i "$f" -af ebur128=peak=true -f null - 2>&1 | grep -E "^ +(I|LRA|Peak):" | tr -s ' ' | tr '\n' ' ' || true)
fi

# --- images for the human/visual critic ---
rows=$(awk -v d="$dur" 'BEGIN{r=int((d+5)/6); if(r<1)r=1; print r}')
ffmpeg -loglevel error -y -i "$f" -vf "fps=1,scale=270:-1,tile=6x${rows}" -frames:v 1 "$out/contact.jpg"
ffmpeg -loglevel error -y -ss 0.0 -i "$f" -frames:v 1 "$out/f_0.0s_hook_first_frame.jpg"
ffmpeg -loglevel error -y -ss 1.5 -i "$f" -frames:v 1 "$out/f_1.5s_hook_landed.jpg"
last=$(awk -v d="$dur" 'BEGIN{printf "%.2f", (d>0.6?d-0.5:0)}')
ffmpeg -loglevel error -y -ss "$last" -i "$f" -frames:v 1 "$out/f_end_cta.jpg"

{
  echo "# Critique (measured) — $(basename "$f")"
  echo
  echo "| Check | Value | Target | Result |"
  echo "|---|---|---|---|"
  echo "| Resolution | ${w}x${h} | $want | $(pf $ok_res) |"
  echo "| Duration | ${dur}s | <= ${maxs}s | $(pf "$ok_dur") |"
  echo "| Pixel format | $pix ($codec) | yuv420p | $(pf $ok_pix) |"
  echo "| Frame rate | ${fps} fps | 30 (or 60) | info |"
  echo "| Near-frozen time | ${frozen_s}s ${frozen_ranges:+[$frozen_ranges]} | <= ~1s per 30s, no hold > 0.6s except final CTA | review |"
  echo "| Loudness | $loud | about -14 LUFS, true peak <= -1 dBFS | review |"
  echo
  echo "## Still to judge by a critic who did NOT build this (look at the images)"
  echo "- f_0.0s_hook_first_frame.jpg: is frame 0 a finished composition with the hook readable?"
  echo "- f_1.5s_hook_landed.jpg: is the hook trigger landed before 2s?"
  echo "- contact.jpg (1 frame/sec): any empty frames, text colliding with text, text outside 9:16 safe zones (top ~14%, bottom ~20-35%, sides ~6%)?"
  echo "- f_end_cta.jpg: is the CTA readable at phone size, and does it pay off the hook?"
  echo "- Is the [نموذج مقترح استباقي / Synthetic Pitch] label visible for the whole video (if the demo is not a real client)?"
  echo "- Arabic text: connected letters, right-to-left order, no broken shaping."
  echo "- Every number on screen is real+sourced or marked illustrative / توضيحي."
} > "$rep"

cat "$rep"
