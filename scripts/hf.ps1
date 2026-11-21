# Runs the project-local HyperFrames CLI with EVERYTHING redirected to G: (the C: drive is almost full) and with
# telemetry / auto-skill-install / Gemini vision off.  Usage:  powershell -File scripts\hf.ps1 render --quality draft ...
# The user's home is redirected only for this child process, so ~/.cache/hyperframes and ~/.hyperframes land on G:.
param([Parameter(ValueFromRemainingArguments = $true)][string[]]$HfArgs)
$C = 'G:\sudegy-video-studio\.cache'
foreach ($d in 'tmp', 'frames', 'npm', 'home') { New-Item -ItemType Directory -Force -Path "$C\$d" | Out-Null }
$chrome = Join-Path $env:LOCALAPPDATA 'Google\Chrome\Application\chrome.exe'   # resolved before the home override
$env:TEMP = "$C\tmp"; $env:TMP = $env:TEMP
# NOTE: do NOT redirect USERPROFILE/HOME: with it, Chrome refuses to start ("browser is already running") while the user's own Chrome is open.
# The CLI's own state under ~/.cache/hyperframes and ~/.hyperframes is only a few MB; the heavy stuff (temp, frames, npm) is on G:.
$env:npm_config_cache = "$C\npm"
$env:HYPERFRAMES_EXTRACT_CACHE_DIR = "$C\frames"
$env:HYPERFRAMES_NO_TELEMETRY = '1'; $env:DO_NOT_TRACK = '1'; $env:HYPERFRAMES_SKIP_SKILLS = '1'
# Use the system Chrome only when asked (HF_SYSTEM_CHROME=1): its "--version" probe can hang; the pinned chrome-headless-shell is the default now that C: has space.
if ($env:HF_SYSTEM_CHROME -eq "1" -and (Test-Path $chrome)) { $env:HYPERFRAMES_BROWSER_PATH = $chrome }
Remove-Item Env:GEMINI_API_KEY -ErrorAction SilentlyContinue          # snapshot would otherwise send frames to Gemini
node G:\sudegy-video-studio\node_modules\hyperframes\bin\hyperframes.mjs @HfArgs
exit $LASTEXITCODE
