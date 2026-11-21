#!/usr/bin/env bash
# Runs scripts/critique.sh on every variant in a folder and builds one side-by-side sheet of the same moments across variants.
# Usage: scripts/critique_batch.sh <videos_dir> <critique_out_dir>
set -euo pipefail
vd="${1:?videos dir}"; od="${2:?critique dir}"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$od"
vids=("$vd"/*.mp4)
for v in "${vids[@]}"; do
  n="$(basename "$v" .mp4)"
  bash "$here/critique.sh" "$v" "$od/$n" 1080x1920 16 > "$od/$n.report.txt" 2>&1 || true
  # key moments for the human/visual critic
  for t in 0.0 1.0 2.6 6.0 9.6 12.4 14.4; do ffmpeg -loglevel error -y -ss "$t" -i "$v" -vf scale=360:-1 -frames:v 1 "$od/$n/m_$t.jpg"; done
done
# one row per variant (7 moments), rows stacked
rows=()
for v in "${vids[@]}"; do
  n="$(basename "$v" .mp4)"; ins=""; k=0
  for t in 0.0 1.0 2.6 6.0 9.6 12.4 14.4; do ins="$ins -i $od/$n/m_$t.jpg"; k=$((k+1)); done
  ffmpeg -loglevel error -y $ins -filter_complex "hstack=inputs=$k" -frames:v 1 "$od/row_$n.jpg"
  rows+=("$od/row_$n.jpg")
done
ins=""; for r in "${rows[@]}"; do ins="$ins -i $r"; done
ffmpeg -loglevel error -y $ins -filter_complex "vstack=inputs=${#rows[@]}" -frames:v 1 "$od/variants_compare.jpg"
echo "done: $od/variants_compare.jpg"
grep -h "Near-frozen\|Duration\|Resolution" "$od"/*.report.txt | head -12
