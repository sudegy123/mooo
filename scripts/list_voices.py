import sys
sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import asyncio
import edge_tts

async def main():
    voices = await edge_tts.list_voices()
    for v in voices:
        if "ar-" in v["Locale"].lower():
            print(f"{v['ShortName']} | {v['Gender']} | {v['Locale']} | {v.get('FriendlyName', '')}")

if __name__ == "__main__":
    asyncio.run(main())

