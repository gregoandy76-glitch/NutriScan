# 🍔 NutriScan OCR API - Setup & Panduan Jalankan

## 📋 Daftar Isi
1. [Backend OCR (Flask + TensorFlow)](#backend-ocr)
2. [Frontend React](#frontend-react)  
3. [Backend API (Node.js)](#backend-api)
4. [Cara Jalankan Semua](#cara-jalankan-semua)

---

## 🔧 Backend OCR
**Lokasi:** `nutriscan-ai/`

### Setup
```bash
cd nutriscan-ai

# Install dependencies
pip install -r requirements.txt

# atau manual:
pip install flask flask-cors tensorflow pillow opencv-python numpy google-generativeai python-dotenv
```

### Konfigurasi `.env`
File `.env` sudah ada dengan `GOOGLE_API_KEY`. Pastikan key valid:
```
GOOGLE_API_KEY=AIzaSyCH3AqxbI1JBTGLsU2sP_RMp8FuUKzxVog
```

### Jalankan Server
```bash
python app.py
```

**Output yang diharapkan:**
```
==================================================
🚀 NutriScan OCR API Starting
==================================================
📂 Model Path: ...Nutrition_Detector_MobileNet_Final87.h5
✅ Model Loaded: True
✅ Gemini Ready: True
🌐 CORS enabled for: http://localhost:5173, http://localhost:3000
==================================================

 * Running on http://0.0.0.0:5000
```

### API Endpoints

#### 1. Health Check
- **URL:** `GET http://localhost:5000/`
- **Response:**
```json
{
  "status": "🚀 NutriScan OCR API running",
  "model_loaded": true,
  "gemini_configured": true,
  "endpoints": {
    "ocr": "/api/ocr (POST)",
    "health": "/ (GET)"
  }
}
```

#### 2. OCR Endpoint
- **URL:** `POST http://localhost:5000/api/ocr`
- **Body:** Form-data dengan `image` field
- **Success Response (200):**
```json
{
  "success": true,
  "data": {
    "sajian_per_kemasan": 8,
    "kandungan_per_sajian": {
      "kalori": 120,
      "protein_g": 2.5,
      "karbohidrat_g": 28,
      "lemak_g": 0.5,
      "gula_g": 26,
      "garam_mg": 15
    }
  },
  "bbox": {
    "xmin": 50,
    "ymin": 60,
    "xmax": 350,
    "ymax": 420
  }
}
```

---

## ⚛️ Frontend React
**Lokasi:** `nutriscan-react/`

### Setup
```bash
cd nutriscan-react

# Install dependencies
npm install
```

### Jalankan Development Server
```bash
npm run dev
```

**Output yang diharapkan:**
```
  VITE v8.0.0  ready in 246 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

### Features:
- 📸 Ambil foto dari kamera
- 📁 Upload gambar dari galeri
- 🔍 OCR automatic dengan MobileNet + Gemini
- 📊 Display hasil nutrisi

**Note:** ScanKamera.jsx sudah terintegrasi dengan OCR API di `http://localhost:5000/api/ocr`

---

## 🛠️ Backend API (Node.js)
**Lokasi:** `nutriscan-backend/`

### Setup
```bash
cd nutriscan-backend

# Install dependencies
npm install
```

### Konfigurasi `.env`
Buat file `.env`:
```env
PORT=5001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nutriscan
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
```

### Database Setup
```bash
# Buat database PostgreSQL
psql -U postgres -c "CREATE DATABASE nutriscan;"

# Import schema
psql -U postgres -d nutriscan -f database.sql
```

### Jalankan Server
```bash
# Development
npm run dev

# Production
npm start
```

**Output yang diharapkan:**
```
✅ Terhubung ke PostgreSQL
🚀 Server berjalan di http://localhost:5001
```

---

## 🎯 Cara Jalankan SEMUA (Complete Setup)

### Terminal 1: OCR API (Flask)
```bash
cd "d:\Codingan\Project Capstone\NutriScan\NUTRISCAN-react_PROJECT_CAPSTONE\nutriscan-ai"
python app.py
# Tunggu sampai: "Running on http://0.0.0.0:5000"
```

### Terminal 2: Frontend React
```bash
cd "d:\Codingan\Project Capstone\NutriScan\NUTRISCAN-react_PROJECT_CAPSTONE\nutriscan-react"
npm run dev
# Buka: http://localhost:5173
```

### Terminal 3 (Optional): Backend Node.js
```bash
cd "d:\Codingan\Project Capstone\NutriScan\NUTRISCAN-react_PROJECT_CAPSTONE\nutriscan-backend"
npm run dev
# Akan jalan di: http://localhost:5001 (atau sesuai .env)
```

---

## 🔗 Flow Integrasi

```
User (React UI)
    ↓
1. Upload/ambil foto label nutrisi
    ↓
2. POST to http://localhost:5000/api/ocr
    ↓
3. Flask:
   - Detect label dengan MobileNet
   - Extract text dengan Gemini AI
   - Return JSON dengan nutrition data
    ↓
4. React display hasil di halaman
    ↓
5. (Optional) Simpan ke PostgreSQL via Node backend
```

---

## 📱 Testing dengan Postman/cURL

### Test OCR Endpoint
```bash
curl -X POST http://localhost:5000/api/ocr \
  -F "image=@path/to/nutrition_label.jpg"
```

### Test Health Check
```bash
curl http://localhost:5000/
```

---

## 🐛 Troubleshooting

### Error: "GOOGLE_API_KEY belum di-set"
- Pastikan file `.env` ada di `nutriscan-ai/`
- Restart terminal jika baru di-set via `$env:VAR=value`

### Error: "Model file tidak ditemukan"
- Pastikan `Nutrition_Detector_MobileNet_Final87.h5` ada di folder `nutriscan-ai/`
- Check path: `ls -la` di PowerShell untuk lihat file

### Error: "Cannot connect to http://localhost:5000"
- Pastikan Flask server running di Terminal 1
- Check port 5000 tidak digunakan aplikasi lain: `netstat -ano | findstr :5000`

### React tidak bisa akses OCR API
- CORS sudah di-enable di `app.py` untuk `localhost:5173` dan `localhost:3000`
- Cek browser console untuk error details

### TensorFlow Loading Lama
- Normal! First time load TensorFlow + model besar bisa 20-30 detik
- Selanjutnya lebih cepat (cached)

---

## 📦 Files Overview

```
nutriscan-ai/
├── app.py                          # Flask OCR API
├── requirements.txt                # Python dependencies
├── .env                            # Environment variables
└── Nutrition_Detector_MobileNet_Final87.h5  # Model

nutriscan-react/
├── src/
│   ├── pages/
│   │   ├── ScanKamera.jsx          # ✅ OCR Integration
│   │   ├── Dashboard.jsx
│   │   └── Beranda.jsx
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js

nutriscan-backend/
├── server.js                       # Express API
├── db.js                           # PostgreSQL connection
├── routes/
│   ├── auth.js
│   ├── user.js
│   └── scan.js
├── middleware/
│   └── auth.js
├── database.sql                    # DB schema
├── package.json
└── .env                            # DB credentials
```

---

## ✅ Checklist Sebelum Production

- [ ] Test OCR dengan berbagai jenis label
- [ ] Optimize model loading (caching)
- [ ] Setup proper error logging
- [ ] Configure CORS untuk domain production
- [ ] Setup database dengan production credentials
- [ ] Add input validation di semua endpoints
- [ ] Add rate limiting untuk OCR API
- [ ] Setup SSL/HTTPS
- [ ] Deploy ke server cloud (AWS/GCP/Heroku)

---

## 📞 Support

Untuk issue atau pertanyaan, check:
1. Terminal output untuk error messages
2. Browser console (F12) untuk frontend errors
3. Python logs di Flask terminal

Happy scanning! 🚀
