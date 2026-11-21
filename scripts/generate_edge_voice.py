import sys
import os
import asyncio
import subprocess

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

async def main():
    if len(sys.argv) < 3:
        print("Usage: python generate_edge_voice.py <text> <out_wav> [voice=ar-SA-HamedNeural] [rate=+10%]")
        sys.exit(1)
    
    text = sys.argv[1]
    out_wav = sys.argv[2]
    voice = sys.argv[3] if len(sys.argv) > 3 else "ar-SA-HamedNeural"
    rate = sys.argv[4] if len(sys.argv) > 4 else "+10%"

    temp_mp3 = out_wav + ".tmp.mp3"
    comm = edge_tts.Communicate(text=text, voice=voice, rate=rate)
    await comm.save(temp_mp3)

    os.makedirs(os.path.dirname(os.path.abspath(out_wav)), exist_ok=True)
    # Convert to 48kHz stereo WAV
    cmd = ["ffmpeg", "-y", "-i", temp_mp3, "-ar", "48000", "-ac", "2", out_wav]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if os.path.exists(temp_mp3):
        os.remove(temp_mp3)
    print(f"Generated {out_wav} ({os.path.getsize(out_wav) // 1024} KB)")

if __name__ == "__main__":
    asyncio.run(main())
