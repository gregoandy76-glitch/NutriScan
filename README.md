[README.md](https://github.com/user-attachments/files/28632874/README.md)
# Smart Nutrition Scanner

Smart Nutrition Scanner merupakan sistem berbasis web terintegrasi yang dirancang untuk memindai label informasi nilai gizi yang berfokus pada gula dan garam (natrium) pada produk makanan dan minuman. Aplikasi ini bertujuan membantu pengguna memonitor serta mengontrol asupan gula dan garam harian guna mendukung gaya hidup yang lebih sehat.

---

## Fitur Utama & Struktur Proyek
Proyek ini terdiri dari dua komponen utama yang saling melengkapi:
1. **Web Application (React):** Aplikasi utama platform *Smart Nutrition Scanner* untuk berinteraksi langsung dengan pengguna.
2. **Data Science & Dashboard (Streamlit & Python):** Subsistem analisis data dan visualisasi pola kandungan gula dan natrium produk.

---

## Bagian 1: Petunjuk Setup Web Application (React)
Bagian ini menjelaskan cara menjalankan aplikasi web utama yang berada di dalam folder `NUTRISCAN-react_PROJECT_CAPSTONE`.

### Prasyarat (Prerequisites)
Pastikan perangkat Anda sudah terinstal:
* [Node.js](https://nodejs.org/) (Versi LTS direkomendasikan)
* Package Manager (`npm` bawaan Node.js)

### Langkah-langkah Menjalankan Web
1. Buka terminal atau command prompt, lalu masuk ke direktori web proyek:
```bash
   cd NUTRISCAN-react_PROJECT_CAPSTONE
2. Instal semua dependensi modul node yang diperlukan:
   npm install
3. Jalankan server lokal untuk mode pengembangan (development mode):
   npm start
4. Buka browser Anda dan akses aplikasi melalui URL: http://localhost:3000


## Bagian 2: Petunjuk Setup Data Science & Dashboard (Streamlit)
Bagian ini digunakan untuk menjalankan pengujian analisis data secara lokal serta meluncurkan dashboard interaktif Streamlit (app.py).

Prasyarat (Prerequisites)
* Python (Versi stabil direkomendasikan: 3.10 atau 3.11)
* Package Manager (pip)

### Langkah-langkah Menjalankan Dashboard Python
1. Pastikan terminal Anda berada pada direktori root (utama) proyek NutriScan.
2. (Opsional namun sangat disarankan) Buat dan aktifkan Virtual Environment:
	# Membuat venv
   	python -m venv venv
   
  	 # Mengaktifkan venv (Windows)
   	.\venv\Scripts\activate
   
   	# Mengaktifkan venv (Mac/Linux)
  	 source venv/bin/activate
3. Instal seluruh pustaka data science pendukung yang terdaftar di requirements.txt:
	pip install -r requirements.txt
4. Jalankan aplikasi web dashboard Streamlit:
	streamlit run app.py
5. Aplikasi analisis data gizi akan otomatis terbuka di browser Anda pada alamat: http://localhost:8501


## Bagian 3: Model Machine Learning (MobileNet)
Proyek ini memanfaatkan arsitektur MobileNet yang telah dioptimalkan agar ringan, efisien, dan memiliki waktu inferensi yang cepat saat dijalankan pada sistem scan berbasis web.
* Tautan Mengunduh Model ML: [https://drive.google.com/drive/folders/1k2mawI4kz3lNY7B8Ehb-uP_z0CiiNf0m?hl=ID]
* Akses berbagi tautan Google Drive di atas telah diatur secara terbuka guna memastikan akun tim evaluator capstone@student.devacademy.id dapat melihat, memuat (load), serta mengunduh file model cerdas ini secara langsung demi kelancaran proses penilaian.


