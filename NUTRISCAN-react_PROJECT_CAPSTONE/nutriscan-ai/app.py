import os
import warnings
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

# Import fungsi-fungsi modular yang telah kita buat di folder core
from core.model_loader import load_mobile_model
from core.image_processing import process_image_bytes, predict_and_crop
from core.ocr_gemini import get_gemini_client, extract_nutrition_info

# Sembunyikan log warning TensorFlow yang mengganggu terminal
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Muat variabel dari file .env
load_dotenv()

app = Flask(__name__)
# Izinkan CORS untuk akses local pembangunan dari React frontend
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# Tentukan path model .h5 di dalam folder models
MODEL_PATH = os.path.join(
    os.path.dirname(__file__), 
    "models", 
    "Model_Deteksi.h5"
)

# Load sistem AI dan OCR saat start server
mobilenet_model = load_mobile_model(MODEL_PATH)
gemini_client = get_gemini_client()

@app.route("/", methods=["GET"])
def health_check():
    return jsonify({
        "status": "🚀 NutriScan OCR API Modular is Running",
        "model_loaded": mobilenet_model is not None,
        "gemini_configured": gemini_client is not None
    }), 200

@app.route("/api/ocr", methods=["POST"])
def process_nutrition_label():
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

        # 2. Lokalisasi letak tabel gizi & Potong gambar menggunakan MobileNet
        cropped_np, bbox = predict_and_crop(image_rgb, mobilenet_model)
        if cropped_np.size == 0:
            return jsonify({"success": False, "error": "Hasil pemotongan kosong. Bounding box di luar batas."}), 400

        # 3. Kirim hasil potongan gambar ke Gemini untuk ekstraksi teks OCR
        hasil_json, error_msg = extract_nutrition_info(gemini_client, cropped_np)
        if error_msg:
            # Jika Gemini bermasalah, tetap kembalikan koordinat Bounding Box agar frontend tidak error
            return jsonify({
                "success": True, 
                "warning": f"OCR Gagal: {error_msg}", 
                "bbox": bbox
            }), 200

        # Sukses mengembalikan data koordinat potong dan teks nilai gizi
        return jsonify({
            "success": True,
            "data": hasil_json,
            "bbox": bbox
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": f"Internal Server Error: {str(e)}"}), 500


if __name__ == "__main__":
    print("\n" + "="*50)
    print("🚀 NutriScan Modular Backend Server Starting")
    print("="*50)
    print("🌐 Endpoint ready on: http://localhost:5000/api/ocr")
    print("="*50 + "\n")
    
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)