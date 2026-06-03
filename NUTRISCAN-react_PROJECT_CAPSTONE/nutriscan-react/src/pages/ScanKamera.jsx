import React, { useState } from 'react';

const OCR_API_URL = "http://localhost:5000/api/ocr";

export default function ScanKamera({ productName, setProductName, handleAnalysis, videoRef, setShowPrivacyModal, fileInputRef, setOcrData }) {

    const [isLoading, setIsLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);

    const productDataset = [
        "Teh Kemasan Manis",
        "Susu Kotak Cokelat UHT",
        "Kopi Botol Instan",
        "Keripik Kentang Original",
        "Biskuit Gandum Cokelat"
    ];

    const [filteredSuggestions, setFilteredSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isCustomProduct, setIsCustomProduct] = useState(false);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setProductName(value);
        if (value.trim().length > 0) {
            const filtered = productDataset.filter(p => p.toLowerCase().includes(value.toLowerCase()));
            setFilteredSuggestions(filtered);
            setShowSuggestions(true);
            setIsCustomProduct(!productDataset.some(p => p.toLowerCase() === value.toLowerCase().trim()));
        } else {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            setIsCustomProduct(false);
        }
    };

    const selectSuggestion = (name) => {
        setProductName(name);
        setFilteredSuggestions([]);
        setShowSuggestions(false);
        setIsCustomProduct(false);
    };

    // Process image with OCR API
    const processImageWithOCR = async (file) => {
        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch(OCR_API_URL, {
                method: "POST",
                body: formData
            });

            const result = await response.json();
            console.log("[OCR] Raw response:", result);

            if (result.success && result.data) {
                // ✅ Kasus 1: Sukses — data nutrisi berhasil diekstrak
                setOcrResult(result.data);
                setOcrData(result.data); // Kirim ke App.jsx agar handleAnalysis bisa pakai nilai real
                alert("✅ OCR berhasil! Hasil telah diekstrak dari gambar label nutrisi.");
                console.log("OCR Result:", result.data);
            } else if (result.success && result.warning) {
                // ⚠️ Kasus 2: Model berhasil crop, tapi Gemini gagal baca teks
                console.warn("[OCR] Gemini warning:", result.warning);
                alert(`⚠️ Gambar berhasil dipindai, namun teks nutrisi gagal dibaca AI:\n${result.warning}\n\nCoba foto ulang dengan pencahayaan lebih baik.`);
            } else {
                // ❌ Kasus 3: Error dari Flask
                alert(`❌ OCR gagal: ${result.error || "Server tidak mengembalikan data yang valid"}`);
            }
        } catch (error) {
            console.error("OCR Error:", error);
            alert(`❌ Gagal menghubungi server OCR: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            alert(`📤 Mengirim gambar "${file.name}" ke sistem OCR...`);
            processImageWithOCR(file);
        }
    };

    const handleCameraCapture = async () => {
        if (videoRef.current) {
            const canvas = document.createElement("canvas");
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(videoRef.current, 0, 0);
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], "camera-capture.jpg", { type: "image/jpeg" });
                    alert("📸 Foto berhasil diambil! Mengirim ke sistem OCR...");
                    processImageWithOCR(file);
                }
            }, "image/jpeg");
        }
    };

    return (
        <main className="container mx-auto max-w-5xl my-8 p-4 grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 animate-fade-in text-left">

            {/* FORM KIRI */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between relative">
                <div>
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-2">Yuk, Pindai Label Nutrisimu!</h2>
                    <p className="text-slate-400 text-xs leading-relaxed">Gunakan kamera atau unggah berkas tabel nilai gizi produk kemasan untuk memetakan konsumsi harian Anda.</p>

                    <div className="my-5 bg-slate-50/80 p-4 rounded-xl border border-slate-100">
                        <p className="text-[11px] font-black text-slate-500 uppercase tracking-wider mb-3">📋 Cara Penggunaan:</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[['📤','1. Upload Label'],['✍️','2. Input Produk'],['📊','3. Lihat Hasil']].map(([icon, label], i) => (
                                <div key={i} className="bg-white border border-slate-100 p-2.5 rounded-xl text-center flex flex-col items-center justify-center shadow-2xs">
                                    <span className="text-xl mb-1">{icon}</span>
                                    <p className="text-[10px] font-bold text-slate-700">{label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 relative">
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex justify-between flex-wrap gap-1">
                            <span>Nama Produk Kemasan:</span>
                            <span className="text-[10px] font-normal text-slate-400 self-center">{ocrResult ? "✅ OCR Success" : "Ready"}</span>
                        </label>
                        <input
                            type="text"
                            value={productName}
                            onChange={handleInputChange}
                            placeholder="Ketik nama produk di sini (Misal: Teh Kemasan...)"
                            className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-slate-50/30 font-medium transition"
                        />
                        {showSuggestions && filteredSuggestions.length > 0 && (
                            <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-40 overflow-y-auto animate-slide-down">
                                <div className="p-2 text-[10px] font-bold text-slate-400 bg-slate-50">Dataset Lokal Tersedia (Simulasi):</div>
                                {filteredSuggestions.map((item, i) => (
                                    <div key={i} onClick={() => selectSuggestion(item)} className="p-3 text-xs text-slate-700 hover:bg-emerald-50 cursor-pointer border-b border-slate-50 font-medium transition-colors">
                                        🔍 {item}
                                    </div>
                                ))}
                            </div>
                        )}
                        {isCustomProduct && (
                            <div className="mt-2 bg-amber-50/70 border border-amber-200/50 p-2.5 rounded-xl text-[11px] text-amber-800 leading-relaxed animate-fade-in">
                                ℹ️ Produk baru terdeteksi. Silakan unggah atau foto tabel nilai gizi di sebelah kanan agar diekstraksi oleh sistem mesin AI OCR kelompok kami!
                            </div>
                        )}
                    </div>

                    {ocrResult && (
                        <div className="mt-4 bg-emerald-50 border border-emerald-200 p-3 rounded-xl text-xs text-emerald-900">
                            <p className="font-bold mb-2">✅ Data OCR Terbaru:</p>
                            <pre className="text-[10px] overflow-auto max-h-40">{JSON.stringify(ocrResult, null, 2)}</pre>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleAnalysis}
                    disabled={isLoading}
                    className={`btn-lift w-full font-bold py-3.5 px-4 rounded-xl shadow-md text-sm mt-4 transition ${
                        isLoading 
                            ? "bg-slate-400 cursor-not-allowed" 
                            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100 cursor-pointer"
                    }`}
                >
                    {isLoading ? "⏳ Memproses OCR..." : "Analisis Kandungan Nutrisi 🔍"}
                </button>
            </section>

            {/* KAMERA KANAN */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
                <h3 className="text-sm font-bold mb-3 text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span> Layar Pemindai & Unggah Berkas
                </h3>

                <div className="w-full aspect-video bg-slate-900 rounded-2xl overflow-hidden relative mb-4 shadow-inner border border-slate-800">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90"></video>
                    <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none opacity-40 animate-pulse"></div>
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div className="flex gap-3 mb-3 w-full max-w-xs">
                    <button
                        onClick={handleCameraCapture}
                        disabled={isLoading}
                        className={`btn-press w-1/2 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition text-center ${
                            isLoading 
                                ? "bg-slate-400 cursor-not-allowed" 
                                : "bg-emerald-600 hover:bg-emerald-700 cursor-pointer"
                        }`}
                    >
                        📸 {isLoading ? "Loading..." : "Ambil Foto"}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="btn-press w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-center disabled:bg-slate-200 disabled:cursor-not-allowed"
                    >
                        📁 Pilih dari Galeri
                    </button>
                </div>
                <p className="text-gray-400 text-[10px] text-center">🔒 Data privasi Anda aman & diproses oleh AI OCR lokal.</p>
            </section>
        </main>
    );
}
