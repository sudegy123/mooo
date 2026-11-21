# Probe Lyria RealTime step by step with timeouts. Usage: python lyria_probe.py (GEMINI_API_KEY in env)
import asyncio, os, sys, time
from google import genai
from google.genai import types
async def main():
    c = genai.Client(api_key=os.environ["GEMINI_API_KEY"], http_options={"api_version": "v1alpha"})
    t0 = time.time()
    cm = c.aio.live.music.connect(model="models/lyria-realtime-exp")
    s = await asyncio.wait_for(cm.__aenter__(), 25); print("connected", round(time.time() - t0, 1), flush=True)
    await asyncio.wait_for(s.set_weighted_prompts(prompts=[types.WeightedPrompt(text="warm acoustic pop", weight=1.0)]), 15); print("prompts set", flush=True)
    await asyncio.wait_for(s.set_music_generation_config(config=types.LiveMusicGenerationConfig(bpm=100)), 15); print("config set", flush=True)
    await asyncio.wait_for(s.play(), 15); print("play sent", flush=True)
    n = 0
    async def rx():
        nonlocal n
        async for m in s.receive():
            sc = m.server_content
            if sc and sc.audio_chunks:
                n += sum(len(ch.data) for ch in sc.audio_chunks)
                if n > 200000: return
            else:
                print("msg", str(m)[:200], flush=True)
    try:
        await asyncio.wait_for(rx(), 25)
    except Exception as e:
        print("rx stop:", type(e).__name__, str(e)[:300], flush=True)
    print("bytes", n, flush=True)
try:
    asyncio.run(main())
except Exception as e:
    print("FAILED:", type(e).__name__, str(e)[:500], flush=True)
