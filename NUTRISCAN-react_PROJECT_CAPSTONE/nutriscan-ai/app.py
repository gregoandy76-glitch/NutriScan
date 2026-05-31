import os
import json
import re
import cv2
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.layers import Dense
import google.generativeai as genai
from PIL import Image
from dotenv import load_dotenv
import warnings

# Suppress warnings
warnings.filterwarnings("ignore")
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://localhost:3000"])

# =========================
# KONFIGURASI GEMINI
# =========================

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

if not GOOGLE_API_KEY:
    print("⚠️  WARNING: GOOGLE_API_KEY tidak ditemukan di .env")
else:
    print(f"✅ GOOGLE_API_KEY ditemukan")
    genai.configure(api_key=GOOGLE_API_KEY)

gemini_model = None
if GOOGLE_API_KEY:
    try:
        gemini_model = genai.GenerativeModel("gemini-2.5-flash")
        print("✅ Gemini model dikonfigurasi")
    except Exception as e:
        print(f"⚠️  Gemini config error: {e}")

# =========================
# CUSTOM LAYER
# =========================

class SafeDense(Dense):
    @classmethod
    def from_config(cls, config):
        config.pop("quantization_config", None)
        return super().from_config(config)

# =========================
# LOAD MODEL MOBILENET
# =========================

MODEL_PATH = os.path.join(
    os.path.dirname(__file__),
    "Nutrition_Detector_MobileNet_Final87.h5"
)

mobilenet_model = None

if os.path.exists(MODEL_PATH):
    try:
        print(f"📦 Loading model dari: {MODEL_PATH}")
        mobilenet_model = tf.keras.models.load_model(
            MODEL_PATH,
            custom_objects={"Dense": SafeDense},
            compile=False,
            safe_mode=False
        )
        print("✅ Model MobileNet berhasil dimuat")
    except Exception as e:
        print(f"❌ Gagal memuat model: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"❌ Model file tidak ditemukan: {MODEL_PATH}")

# =========================
# HEALTH CHECK
# =========================

@app.route("/", methods=["GET"])
def health_check():
    status = {
        "status": "🚀 NutriScan OCR API running",
        "model_loaded": mobilenet_model is not None,
        "gemini_configured": gemini_model is not None,
        "endpoints": {
            "ocr": "/api/ocr (POST)",
            "health": "/ (GET)"
        }
    }
    return jsonify(status), 200

# =========================
# API OCR
# =========================

@app.route("/api/ocr", methods=["POST"])
def process_nutrition_label():
    """
    Process nutrition label from image
    Returns: JSON dengan informasi gizi dari gambar
    """
    
    try:
        if mobilenet_model is None:
            return jsonify({
                "success": False,
                "error": "Model MobileNet belum dimuat"
            }), 500

        if "image" not in request.files:
            return jsonify({
                "success": False,
                "error": "Tidak ada file gambar"
            }), 400

        file = request.files["image"]

        if file.filename == "":
            return jsonify({
                "success": False,
                "error": "File kosong"
            }), 400

        temp_path = "temp_image.jpg"

        # Save uploaded file
        file.save(temp_path)

        # Read image
        image = cv2.imread(temp_path)
        if image is None:
            return jsonify({
                "success": False,
                "error": "Gagal membaca gambar"
            }), 400

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        h, w, _ = image_rgb.shape

        # Preprocess
        input_image = cv2.resize(image_rgb, (416, 416))
        input_image = input_image.astype(np.float32) / 255.0
        input_image = np.expand_dims(input_image, axis=0)

        # Predict bounding box
        prediction = mobilenet_model.predict(input_image, verbose=0)
        xmin, ymin, xmax, ymax = prediction[0]

        xmin = int(xmin * w)
        xmax = int(xmax * w)
        ymin = int(ymin * h)
        ymax = int(ymax * h)

        # Ensure correct order
        xmin, xmax = sorted([xmin, xmax])
        ymin, ymax = sorted([ymin, ymax])

        # Add padding
        padding = 30
        xmin = max(0, xmin - padding)
        ymin = max(0, ymin - padding)
        xmax = min(w, xmax + padding)
        ymax = min(h, ymax + padding)

        # Crop image
        cropped = image_rgb[ymin:ymax, xmin:xmax]

        if cropped.size == 0:
            return jsonify({
                "success": False,
                "error": "Crop kosong. Bounding box tidak valid."
            }), 400

        cropped_pil = Image.fromarray(cropped)

        # Extract nutrition info with Gemini
        if gemini_model is None:
            # Fallback: hanya return bounding box tanpa OCR
            return jsonify({
                "success": True,
                "warning": "Gemini tidak tersedia, OCR dilewati",
                "bbox": {
                    "xmin": xmin,
                    "ymin": ymin,
                    "xmax": xmax,
                    "ymax": ymax
                }
            }), 200

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

        response = gemini_model.generate_content([prompt, cropped_pil])
        response_text = response.text.strip()

        # Clean response
        response_text = response_text.replace("```json", "")
        response_text = response_text.replace("```", "")
        response_text = response_text.strip()

        # Extract JSON
        match = re.search(r"\{.*\}", response_text, re.DOTALL)
        if not match:
            return jsonify({
                "success": False,
                "error": "Gemini tidak mengembalikan JSON valid",
                "raw_response": response_text
            }), 400

        json_text = match.group()
        hasil_json = json.loads(json_text)

        return jsonify({
            "success": True,
            "data": hasil_json,
            "bbox": {
                "xmin": xmin,
                "ymin": ymin,
                "xmax": xmax,
                "ymax": ymax
            }
        }), 200

    except json.JSONDecodeError as e:
        return jsonify({
            "success": False,
            "error": "JSON parsing gagal",
            "detail": str(e)
        }), 400

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

# =========================
# MAIN
# =========================

if __name__ == "__main__":
    try:
        print("\n" + "="*50)
        print("🚀 NutriScan OCR API Starting")
        print("="*50)
        print(f"📂 Model Path: {MODEL_PATH}")
        print(f"✅ Model Loaded: {mobilenet_model is not None}")
        print(f"✅ Gemini Ready: {gemini_model is not None}")
        print("🌐 CORS enabled for: http://localhost:5173, http://localhost:3000")
        print("="*50 + "\n")
        
        print("⏳ Starting Flask server...")
        app.run(
            host="0.0.0.0",
            port=5000,
            debug=True,
            use_reloader=False
        )
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
        import traceback
        traceback.print_exc()