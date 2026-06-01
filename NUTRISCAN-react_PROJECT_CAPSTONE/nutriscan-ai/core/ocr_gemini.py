import os
import re
import json
from google import genai
from PIL import Image

def get_gemini_client():
    """Inisialisasi Client Google GenAI menggunakan API Key terbaru"""
    GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
    if not GOOGLE_API_KEY:
        print("⚠️  WARNING: GOOGLE_API_KEY tidak ditemukan di file .env")
        return None
    try:
        client = genai.Client(api_key=GOOGLE_API_KEY)
        print("✅ Gemini Client berhasil dikonfigurasi")
        return client
    except Exception as e:
        print(f"⚠️  Gemini config error: {e}")
        return None

def extract_nutrition_info(gemini_client, cropped_image_np):
    """Mengirim potongan gambar ke Gemini untuk ekstraksi nilai gizi format JSON"""
    if gemini_client is None:
        return None, "Gemini Client tidak siap atau belum dikonfigurasi"

    # Ubah array numpy OpenCV menjadi objek PIL Image untuk Gemini
    cropped_pil = Image.fromarray(cropped_image_np)

    prompt = """
    Ekstrak informasi nilai gizi dari gambar ini dengan akurat.
    Kembalikan HANYA JSON valid tanpa markdown dan tanpa penjelasan.

    Format:
    {
        "sajian_per_kemasan": float atau null,
        "kandungan_per_sajian": {
            "kalori": float atau null,
            "protein_g": float atau null,
            "karbohidrat_g": float atau null,
            "lemak_g": float atau null,
            "gula_g": float atau null,
            "garam_mg": float atau null
        }
    }
    Jika suatu nilai tidak ditemukan, gunakan null.
    """

    try:
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt, cropped_pil]
        )
        
        response_text = response.text.strip()
        # Bersihkan pembungkus markdown ```json jika Gemini tidak sengaja menyertakannya
        response_text = response_text.replace("```json", "").replace("```", "").strip()

        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not match:
            return None, "Gemini tidak mengembalikan struktur JSON yang valid"

        hasil_json = json.loads(match.group())
        return hasil_json, None

    except json.JSONDecodeError:
        return None, "Gagal mengubah respons teks menjadi JSON objek"
    except Exception as e:
        return None, f"Gagal saat berkomunikasi dengan Gemini API: {str(e)}"