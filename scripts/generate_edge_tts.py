# scripts/generate_edge_tts.py
import sys
import os
import asyncio

# Ensure G: vendor path is at front of sys.path
sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")

import edge_tts

async def run_tts(text: str, voice: str, output_path: str, rate: str = "+0%", pitch: str = "+0Hz"):
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    if output_path.endswith('.wav'):
        tmp_mp3 = output_path + '.tmp.mp3'
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch)
        await communicate.save(tmp_mp3)
        import subprocess
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', tmp_mp3, '-ar', '48000', '-ac', '1', output_path], check=True)
        if os.path.exists(tmp_mp3):
            os.remove(tmp_mp3)
    else:
        communicate = edge_tts.Communicate(text=text, voice=voice, rate=rate, pitch=pitch)
        await communicate.save(output_path)
    print(f"Generated TTS audio successfully: {output_path}")

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_edge_tts.py <text> <output_path> [voice] [rate]")
        sys.exit(1)
    
    text = sys.argv[1]
    output_path = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "ar-SA-HamedNeural"
    rate = sys.argv[4] if len(sys.argv) > 4 else "+5%"
    
    asyncio.run(run_tts(text, voice, output_path, rate=rate))

