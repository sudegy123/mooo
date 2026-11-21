import sys
import os
import asyncio
import subprocess

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# 100% Pure Colloquial Saudi Text - Dialectal Phonetic Polish
saudi_script_male = (
    "شُوفْ مَعَاي.. "
    "عَ اليَمِينْ: عِيَادَة تِصْرِفْ آلافْ عَ الإعلانات، وتِجِيهَا زَحْمَة رَسَايِلْ: بِكَمْ الإِبْرَة؟ وبِالأَخِيرْ تِسْحَبْ ومَاتِحْجِزْ شَيْ! "
    "وعَ اليَسَارْ: عِيَادَة مْشَغّلَة نِظَامْ سُودِيجِي الذَّكِي.. المُرَاجَعَة تِفْحَصْ وَجْهِهَا وتْحَدّدْ مَتَى مُنَاسَبَتْهَا بِالجَوَّالْ بِثَوَانِي، "
    "ويُوصَلْ لِلدَّكْتُورْ تَقْرِيرْ كَامِلْ ومُرَتَّبْ عَ الوَاتْسْ قَبْلْ مَا تِطِبْ العِيَادَة، وبِكِذَا تِقْلِبْ السُّؤَالْ الفَاضِي لِحَجْزْ بَاقَة مَضْمُونْ! "
    "أَيّ العِيَادْتَيْن وِدِّكْ تِكُونْ؟ "
    "جَرّبْ دِيمُو مَجَّانِي الحِينْ بْهُوِيّة عِيَادْتِكْ وشُوفْ الفَرْقْ بِنَفْسِكْ عَلَى جَوَّالِكْ. "
    "اِكْتِبْ بَسْ كِلْمَة تَجْمِيلْ بِالخَاصْ أَوْ بِالكُومِنْتَاتْ، ونِرْسِلْ لِكْ الرَّابِطْ عَلَى طُولْ."
)

saudi_script_female = saudi_script_male

out_dir = r"G:\sudegy-video-studio\factory\work\pure_saudi_master"
os.makedirs(out_dir, exist_ok=True)

async def main():
    # Rate +25% gives ~35.5s
    male_mp3 = os.path.join(out_dir, "pure_saudi_male_raw.mp3")
    female_mp3 = os.path.join(out_dir, "pure_saudi_female_raw.mp3")
    
    print("Generating pure Saudi male voice...")
    comm_male = edge_tts.Communicate(text=saudi_script_male, voice="ar-SA-HamedNeural", rate="+25%")
    await comm_male.save(male_mp3)
    
    print("Generating pure Saudi female voice...")
    comm_female = edge_tts.Communicate(text=saudi_script_female, voice="ar-SA-ZariyahNeural", rate="+25%")
    await comm_female.save(female_mp3)
    
    print("Converting to 48kHz WAV...")
    male_wav = os.path.join(out_dir, "pure_saudi_male.wav")
    female_wav = os.path.join(out_dir, "pure_saudi_female.wav")
    subprocess.run(["ffmpeg", "-y", "-i", male_mp3, "-ar", "48000", "-ac", "2", male_wav], check=True)
    subprocess.run(["ffmpeg", "-y", "-i", female_mp3, "-ar", "48000", "-ac", "2", female_wav], check=True)
    
    # Check durations
    d_m = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", male_wav]).decode().strip()
    d_f = subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=noprint_wrappers=1:nokey=1", female_wav]).decode().strip()
    print(f"Male Duration: {d_m} s")
    print(f"Female Duration: {d_f} s")

if __name__ == "__main__":
    asyncio.run(main())

