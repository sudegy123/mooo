# Free background music for the factory: Google Lyria RealTime (experimental) through the free Gemini API key.
# Collects the stream until the target length, writes a WAV and exits without waiting for the websocket close
# (the close is what hangs in the upstream recipe).
# Usage: python music.py --output bed.wav --duration 45 --prompt "..." [--bpm 104 --brightness .7 --density .45 --scale MAJOR]
import argparse, asyncio, os, sys, time, wave
from google import genai
from google.genai import types

SR, CH, SW = 48000, 2, 2
ap = argparse.ArgumentParser()
ap.add_argument("--output", required=True); ap.add_argument("--duration", type=float, required=True)
ap.add_argument("--prompt", required=True); ap.add_argument("--negative", default="vocals, singing, speech, harsh distortion")
ap.add_argument("--bpm", type=int, default=104); ap.add_argument("--brightness", type=float, default=0.65)
ap.add_argument("--density", type=float, default=0.45); ap.add_argument("--scale", default="")
a = ap.parse_args()
target = int(a.duration * SR * CH * SW)
buf = bytearray()
CM = None

async def main():
    c = genai.Client(api_key=os.environ["GEMINI_API_KEY"], http_options={"api_version": "v1alpha"})
    global CM
    CM = c.aio.live.music.connect(model="models/lyria-realtime-exp")   # keep a reference: if it is garbage-collected the socket closes (code 1000)
    s = await asyncio.wait_for(CM.__aenter__(), 30)
    await s.set_weighted_prompts(prompts=[types.WeightedPrompt(text=a.prompt, weight=1.0)])   # negative weights make the server close the stream
    cfg = {"bpm": a.bpm}   # brightness/density/temperature make the free endpoint close the stream (tested 2026-10-22)
    if a.scale and getattr(types.Scale, a.scale, None): cfg["scale"] = getattr(types.Scale, a.scale)
    await s.set_music_generation_config(config=types.LiveMusicGenerationConfig(**cfg))
    await s.play()
    if os.environ.get("MUSIC_DEBUG"): print("play sent", file=sys.stderr, flush=True)
    async def rx():
        async for m in s.receive():
            sc = m.server_content
            if sc and sc.audio_chunks:
                for ch in sc.audio_chunks: buf.extend(ch.data)
                if len(buf) >= target: return
            elif os.environ.get("MUSIC_DEBUG"):
                print("non-audio message:", str(m)[:300], file=sys.stderr, flush=True)
    try:
        await asyncio.wait_for(rx(), a.duration * 1.5 + 20)
    except Exception as e:
        print("stream stopped:", type(e).__name__, str(e)[:400], file=sys.stderr)

t0 = time.time()
try:
    asyncio.run(asyncio.wait_for(main(), a.duration * 1.5 + 60))
except Exception as e:
    print("music generation error:", type(e).__name__, str(e)[:300], file=sys.stderr)
audio = bytes(buf[:target])
if len(audio) < SR * CH * SW * 3:
    print("FAILED: not enough audio", len(audio), file=sys.stderr); sys.stdout.flush(); os._exit(2)
with wave.open(a.output, "wb") as w:
    w.setnchannels(CH); w.setsampwidth(SW); w.setframerate(SR); w.writeframes(audio)
print(f"music {a.output} {len(audio) / (SR * CH * SW):.1f}s in {time.time() - t0:.0f}s", flush=True)
os._exit(0)
