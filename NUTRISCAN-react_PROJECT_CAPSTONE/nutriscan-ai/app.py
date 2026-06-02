import os
import warnings
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

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
        if error_msg:
            # Jika Gemini bermasalah, tetap kembalikan koordinat Bounding Box
            return jsonify({
                "success": True,
                "warning": f"OCR Gagal: {error_msg}",
                "bbox": bbox
            }), 200

        # Sukses — kembalikan data koordinat potong dan teks nilai gizi
        return jsonify({
            "success": True,
            "data": hasil_json,
            "bbox": bbox
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Internal Server Error: {str(e)}"}), 500


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
