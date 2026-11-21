# Estimate tempo and the first beat of a music bed (onset envelope + autocorrelation), so cuts can land on beats.
# Usage: python -I scripts/beat_grid.py <file.wav>   → prints JSON {bpm, beat, first}
import sys, json, subprocess
import numpy as np
f = sys.argv[1]
sr = 22050
raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(sr), '-f', 's16le', '-'], capture_output=True).stdout
x = np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768.0
hop, win = 512, 1024
n = 1 + (len(x) - win) // hop
frames = np.lib.stride_tricks.as_strided(x, shape=(n, win), strides=(x.strides[0] * hop, x.strides[0]))
spec = np.abs(np.fft.rfft(frames * np.hanning(win), axis=1))
flux = np.maximum(0, np.diff(np.log1p(spec), axis=0)).sum(axis=1)
flux = (flux - flux.mean()) / (flux.std() + 1e-9)
fps = sr / hop
best = None
for bpm in np.arange(70, 160, 0.5):
    lag = 60.0 / bpm * fps
    lags = [int(round(lag * k)) for k in (1, 2, 4)]
    s = sum(np.dot(flux[:-L], flux[L:]) / (len(flux) - L) for L in lags if L < len(flux))
    if best is None or s > best[0]: best = (s, bpm)
bpm = float(best[1]); period = 60.0 / bpm * fps
# phase: offset that maximises the flux on the beat grid
phases = np.arange(0, period, 0.5)
score = [flux[np.round(np.arange(p, len(flux) - 1, period)).astype(int)].sum() for p in phases]
first = float(phases[int(np.argmax(score))] / fps)
print(json.dumps({'bpm': round(bpm, 2), 'beat': round(60.0 / bpm, 4), 'first': round(first, 3), 'dur': round(len(x) / sr, 2)}))
