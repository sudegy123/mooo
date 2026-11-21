import sys
import os
import asyncio

sys.path.insert(0, r"G:\sudegy-video-studio\vendor\python")
import edge_tts

# Saudi White Dialect (اللهجة السعودية البيضاء الإعلانية)
saudi_dialect_text = (
    "على اليمين: عيادة تدفع آلاف على الإعلانات وتجيها رسايل تسأل: بكم الإبرة؟ وتنتهي بدون حجز! "
    "وعلى اليسار: عيادة مفعّلة نظام سوديجي الذكي.. المراجعة تفحص وجهها وتحدد مناسبتها بثواني، "
    "وتوصل بياناتها بتقرير مرتب للدكتور عالواتساب قبل لا تجي العيادة، محولة السائلين لباقات مؤكدة! "
    "أي العيادتين ودك تكون؟ خذ ديمو تجريبي مجاني بهوية عيادتك عشان تجربه الحين على جوالك. "
    "اكتب كلمة تجميل بالخاص أو الكومنتات ونرسل لك الرابط فوراً."
)

work_dir = r"G:\sudegy-video-studio\factory\work\saudi_dialect"
os.makedirs(work_dir, exist_ok=True)

async def generate():
    # 1. Male Saudi (Hamed)
    comm_m = edge_tts.Communicate(text=saudi_dialect_text, voice="ar-SA-HamedNeural", rate="+24%")
    await comm_m.save(os.path.join(work_dir, "saudi_male_norm.mp3"))
    print("Generated Hamed (Male Saudi)")

    # 2. Female Saudi (Zariyah)
    comm_f = edge_tts.Communicate(text=saudi_dialect_text, voice="ar-SA-ZariyahNeural", rate="+24%")
    await comm_f.save(os.path.join(work_dir, "saudi_female_norm.mp3"))
    print("Generated Zariyah (Female Saudi)")

if __name__ == "__main__":
    asyncio.run(generate())

