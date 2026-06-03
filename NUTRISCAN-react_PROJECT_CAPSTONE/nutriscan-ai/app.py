import os
import warnings
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import base64
import cv2

# Suppress TF warnings — harus di-set SEBELUM import TF
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"] = "0"
warnings.filterwarnings("ignore")
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("absl").setLevel(logging.ERROR)

# Import fungsi-fungsi modular dari folder core
from core.model_loader import load_mobile_model
from core.image_processing import process_image_bytes, predict_and_crop
from core.ocr_gemini import get_gemini_client, extract_nutrition_info

# Muat variabel dari file .env
load_dotenv()

app = Flask(__name__)
# Izinkan CORS untuk akses local dari React frontend
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# =========================
# LOAD MODEL (.keras format)
# =========================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "Nutrition_Detector_MobileNet_Final100.keras"
)

# Load sistem AI dan OCR saat start server
mobilenet_model = load_mobile_model(MODEL_PATH)
gemini_client = get_gemini_client()

# =========================
# HEALTH CHECK
# =========================

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "NutriScan OCR API running",
        "model_loaded": mobilenet_model is not None,
        "gemini_configured": gemini_client is not None,
        "model_file": os.path.basename(MODEL_PATH),
        "endpoints": {
            "ocr":    "/api/ocr (POST - multipart/form-data, field: image)",
            "health": "/ (GET)"
        }
    }), 200

# =========================
# API OCR
# =========================

@app.route("/api/ocr", methods=["POST"])
def process_nutrition_label():
    """
    Terima gambar label gizi, deteksi bounding box dengan MobileNet,
    crop area label, lalu ekstrak data nutrisi dengan Gemini.
    Returns: JSON dengan informasi gizi dari gambar.
    """

    if mobilenet_model is None:
        return jsonify({"success": False, "error": "Model Keras MobileNet gagal/belum dimuat backend"}), 500

    if "image" not in request.files:
        return jsonify({"success": False, "error": "Tidak ada file gambar yang dikirimkan"}), 400

    file = request.files["image"]
    if file.filename == "":
        return jsonify({"success": False, "error": "Nama file gambar kosong"}), 400

    try:
        # 1. Baca data byte gambar ke memori RAM
        image_rgb = process_image_bytes(file.read())
        if image_rgb is None:
            return jsonify({"success": False, "error": "Format gambar rusak atau gagal dibaca"}), 400

        # 2. Lokalisasi letak tabel gizi & potong gambar menggunakan MobileNet
        cropped_np, bbox = predict_and_crop(image_rgb, mobilenet_model)
        if cropped_np.size == 0:
            return jsonify({"success": False, "error": "Hasil pemotongan kosong. Bounding box di luar batas."}), 400

        # 3. Kirim hasil potongan gambar ke Gemini untuk ekstraksi teks OCR
        hasil_json, error_msg = extract_nutrition_info(gemini_client, cropped_np)

        # 4. Ubah gambar potongan (Numpy BGR/RGB) menjadi Base64 untuk ditampilkan di Frontend
        try:
            # Pastikan konversi ke BGR sebelum encode ke JPG jika image_rgb dari process_image_bytes adalah RGB
            # Jika cropped_np formatnya RGB:
            cropped_bgr = cv2.cvtColor(cropped_np, cv2.COLOR_RGB2BGR)
            _, buffer = cv2.imencode('.jpg', cropped_bgr)
            cropped_b64 = "data:image/jpeg;base64," + base64.b64encode(buffer).decode('utf-8')
        except Exception as e:
            print(f"[OCR] Warning: Gagal mengkonversi gambar cropped ke base64: {e}")
            cropped_b64 = None

        if error_msg:
            # Jika Gemini bermasalah, tetap kembalikan koordinat Bounding Box dan gambar
            print(f"[OCR] Gemini warning: {error_msg}")
            return jsonify({
                "success": True,
                "warning": f"OCR Gagal: {error_msg}",
                "bbox": bbox,
                "cropped_image": cropped_b64
            }), 200

        # Sukses — kembalikan data koordinat potong, teks nilai gizi, dan gambar
        print(f"[OCR] Sukses! Data: {hasil_json}")
        return jsonify({
            "success": True,
            "data": hasil_json,
            "bbox": bbox,
            "cropped_image": cropped_b64
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Internal Server Error: {str(e)}"}), 500


# =========================
# API HEALTH MESSAGE (Gemini)
# =========================

@app.route("/api/health-message", methods=["POST"])
def generate_health_message():
    """
    Format pesan tetap (fixed), Gemini hanya generate kata mutiara < 7 kata.
    Response: { message: str, quote: str }
    """
    data        = request.get_json() or {}
    total_garam = data.get("total_garam", 0)
    total_gula  = data.get("total_gula",  0)
    user_name   = data.get("user_name",   "Kamu")
    batas_garam = 2000  # mg — Kemenkes RI
    batas_gula  = 50    # g  — Kemenkes RI

    # Bangun daftar nutrisi yang melebihi batas
    pelanggaran = []
    if total_garam > batas_garam:
        pelanggaran.append(f"natrium sebesar {total_garam}mg")
    if total_gula > batas_gula:
        pelanggaran.append(f"gula sebesar {total_gula}g")

    if not pelanggaran:
        return jsonify({"success": True, "message": "Konsumsi harianmu masih aman.", "quote": "Sehat itu pilihan terbaik!"}), 200

    # Format pesan utama — FIXED (bukan AI)
    if len(pelanggaran) == 1:
        nutrisi_str = pelanggaran[0]
    else:
        nutrisi_str = " dan ".join(pelanggaran)

    pesan_utama = (
        f"Hai {user_name}, hari ini kamu sudah mengonsumsi {nutrisi_str} "
        f"melewati ketentuan Kemenkes RI."
    )

    # Gemini hanya generate kata mutiara < 7 kata
    fallback_quote = "Jaga tubuhmu, jaga masa depanmu."
    try:
        if gemini_client is None:
            raise ValueError("Gemini tidak tersedia")

        prompt = (
            "Buat 1 kata-kata mutiara motivasi kesehatan dalam Bahasa Indonesia. "
            "Syarat: kurang dari 7 kata, tidak menggunakan tanda petik, "
            "tidak ada tanda baca berlebihan, langsung tulis kata-katanya saja."
        )
        response = gemini_client.models.generate_content(
            model="gemini-2.5-flash",
            contents=[prompt]
        )
        quote = response.text.strip().strip('"').strip("'")
        # Pastikan tidak lebih dari 7 kata
        if len(quote.split()) > 7:
            quote = " ".join(quote.split()[:7])
    except Exception as e:
        print(f"[health-message] Gemini error: {e}")
        quote = fallback_quote

    return jsonify({"success": True, "message": pesan_utama, "quote": quote}), 200



# =========================
# MAIN
# =========================

if __name__ == "__main__":
    print("\n" + "="*50)
    print("NutriScan OCR API Starting")
    print("="*50)
    print(f"[INFO] Model  : {os.path.basename(MODEL_PATH)}")
    print(f"[INFO] Loaded : {mobilenet_model is not None}")
    print(f"[INFO] Gemini : {gemini_client is not None}")
    print("[INFO] CORS   : http://localhost:5173, http://localhost:3000")
    print("="*50)
    print("[INFO] Test di Postman: POST http://localhost:5000/api/ocr")
    print("[INFO] Body: form-data | Key: image | Type: File")
    print("="*50 + "\n")

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=False,        # matikan debug agar output tidak berantakan
        use_reloader=False,
        threaded=True       # threading untuk handle concurrent request
    )
