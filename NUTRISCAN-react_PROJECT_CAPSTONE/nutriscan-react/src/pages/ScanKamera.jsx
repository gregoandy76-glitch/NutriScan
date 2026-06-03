import React, { useState, useCallback } from 'react';

const OCR_API_URL = "http://localhost:5000/api/ocr";

// ===== KOMPONEN TOAST NOTIFICATION =====
function Toast({ toasts, removeToast }) {
    const iconMap  = { success: '✅', warning: '⚠️', error: '❌', info: '📡' };
    const colorMap = {
        success: 'bg-emerald-600 border-emerald-500',
        warning: 'bg-amber-500  border-amber-400',
        error:   'bg-rose-600   border-rose-500',
        info:    'bg-slate-700  border-slate-600',
    };
    return (
        <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
            {toasts.map(t => (
                <div
                    key={t.id}
                    className={`flex items-start gap-3 text-white text-xs font-medium px-4 py-3 rounded-2xl shadow-xl border pointer-events-auto max-w-xs animate-fade-in ${colorMap[t.type]}`}
                    style={{ minWidth: '240px' }}
                >
                    <span className="text-base shrink-0 mt-0.5">{iconMap[t.type]}</span>
                    <div className="flex-1 leading-relaxed">{t.message}</div>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="shrink-0 opacity-60 hover:opacity-100 text-white font-bold text-sm leading-none cursor-pointer ml-1"
                    >✕</button>
                </div>
            ))}
        </div>
    );
}

export default function ScanKamera({ productName, setProductName, handleAnalysis, videoRef, setShowPrivacyModal, fileInputRef, setOcrData }) {

    const [isLoading, setIsLoading] = useState(false);
    const [ocrResult, setOcrResult] = useState(null);
    const [croppedImage, setCroppedImage] = useState(null);
    const [toasts, setToasts]       = useState([]);

    // Helper: tampilkan toast dan auto-dismiss setelah 4 detik
    const showToast = useCallback((message, type = 'info') => {
        const id = Date.now() + Math.random();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

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
                setOcrData(result.data);
                if (result.cropped_image) setCroppedImage(result.cropped_image);
                showToast("Data nutrisi berhasil diekstrak dari label gambar!", 'success');
                console.log("OCR Result:", result.data);
            } else if (result.success && result.warning) {
                // ⚠️ Kasus 2: Model berhasil crop, tapi Gemini gagal baca teks
                console.warn("[OCR] Gemini warning:", result.warning);
                if (result.cropped_image) setCroppedImage(result.cropped_image);
                showToast("Gambar terpindai, namun teks gagal dibaca AI. Coba foto ulang dengan pencahayaan lebih baik.", 'warning');
            } else {
                // ❌ Kasus 3: Error dari Flask
                showToast(`OCR gagal: ${result.error || "Server tidak mengembalikan data yang valid"}`, 'error');
            }
        } catch (error) {
            console.error("OCR Error:", error);
            showToast(`Gagal menghubungi server OCR: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            showToast(`Mengirim "${file.name}" ke sistem OCR...`, 'info');
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
                    showToast("Foto diambil! Mengirim ke sistem OCR...", 'info');
                    processImageWithOCR(file);
                }
            }, "image/jpeg");
        }
    };

    return (
        <>
        {/* TOAST CONTAINER */}
        <Toast toasts={toasts} removeToast={removeToast} />

        <main className="container mx-auto max-w-5xl my-8 px-4 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-14 animate-fade-in text-left">

            {/* FORM KIRI */}
            <section className="flex flex-col justify-start relative pt-4">
                <div className="mb-8">
                    <h2 className="text-3xl sm:text-4xl font-black text-[#0f8c5b] mb-4 leading-tight">Yuk, Pindai Label <br/> Nutrisimu!</h2>
                    <p className="text-slate-500 text-sm leading-relaxed max-w-sm">Gunakan kamera atau unggah berkas tabel nilai gizi produk kemasan untuk memetakan konsumsi harian Anda.</p>
                </div>

                <div className="mb-10 bg-white p-6 rounded-2xl border border-slate-200 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                    <div className="grid grid-cols-3 divide-x divide-slate-100">
                        <div className="flex flex-col items-center text-center px-2 group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4ef] flex items-center justify-center text-[#0f8c5b] mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-sm">📄</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">1. Upload<br/>Label</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4ef] flex items-center justify-center text-[#0f8c5b] mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-sm">⌨️</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">2. Input<br/>Produk</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4ef] flex items-center justify-center text-[#0f8c5b] mb-3 group-hover:scale-110 transition-transform">
                                <span className="text-sm">📊</span>
                            </div>
                            <span className="text-xs font-bold text-slate-800">3. Lihat Hasil</span>
                        </div>
                    </div>
                </div>

                <div className="mb-4 relative">
                    <label className="block text-sm font-bold text-slate-800 mb-3 flex justify-between flex-wrap gap-1">
                        <span>Nama Produk Kemasan</span>
                        {ocrResult && <span className="text-[10px] font-bold text-[#0f8c5b] bg-[#e6f4ef] px-2 py-0.5 rounded-full self-center">✅ OCR Success</span>}
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
                            <p className="font-bold mb-2">✅ Data Terdeteksi:</p>
                            <table className="w-full text-left bg-white border border-emerald-100 rounded-lg overflow-hidden">
                                <thead>
                                    <tr className="bg-emerald-100 text-emerald-800 text-[10px] uppercase">
                                        <th className="p-2 border-b border-emerald-50">Nutrisi</th>
                                        <th className="p-2 border-b border-emerald-50">Jumlah</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b border-emerald-50"><td className="p-2">Sajian per Kemasan</td><td className="p-2 font-bold">{ocrResult.sajian_per_kemasan || '-'}</td></tr>
                                    <tr className="border-b border-emerald-50"><td className="p-2">Kalori Total</td><td className="p-2 font-bold">{ocrResult.kandungan_per_sajian?.kalori || '-'} kkal</td></tr>
                                    <tr className="border-b border-emerald-50"><td className="p-2 text-rose-700">Garam / Natrium</td><td className="p-2 font-bold text-rose-700">{ocrResult.kandungan_per_sajian?.garam_mg || '0'} mg</td></tr>
                                    <tr className="border-b border-emerald-50"><td className="p-2 text-amber-600">Gula</td><td className="p-2 font-bold text-amber-600">{ocrResult.kandungan_per_sajian?.gula_g || '0'} g</td></tr>
                                    <tr className="border-b border-emerald-50"><td className="p-2">Protein</td><td className="p-2 font-bold">{ocrResult.kandungan_per_sajian?.protein_g || '0'} g</td></tr>
                                    <tr className="border-b border-emerald-50"><td className="p-2">Karbohidrat</td><td className="p-2 font-bold">{ocrResult.kandungan_per_sajian?.karbohidrat_g || '0'} g</td></tr>
                                    <tr><td className="p-2">Lemak Total</td><td className="p-2 font-bold">{ocrResult.kandungan_per_sajian?.lemak_g || '0'} g</td></tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                <button
                    onClick={handleAnalysis}
                    disabled={isLoading}
                    className={`btn-lift w-full font-bold py-4 px-4 rounded-2xl shadow-[0_8px_30px_rgb(15,140,91,0.2)] text-sm mt-4 transition flex items-center justify-center gap-2 ${
                        isLoading
                            ? "bg-slate-400 cursor-not-allowed text-white"
                            : "bg-[#0f8c5b] hover:bg-[#0b6a45] text-white cursor-pointer"
                    }`}
                >
                    {isLoading ? "⏳ Memproses OCR..." : <>Analisis Kandungan Nutrisi 🔍</>}
                </button>
            </section>

            {/* KAMERA KANAN */}
            <section className="bg-[#f8fafc] p-6 sm:p-8 rounded-[2rem] border border-slate-200 flex flex-col items-center justify-start h-full">
                <div className="w-full text-left mb-6 flex items-center gap-3">
                    <span className="w-2 h-2 bg-[#0f8c5b] rounded-full"></span>
                    <h3 className="text-sm font-bold text-slate-800">
                        Layar Pemindai &amp; Unggah Berkas
                    </h3>
                </div>

                <div className="w-full aspect-video bg-[#2a303c] rounded-2xl overflow-hidden relative mb-8 shadow-inner">
                    {croppedImage ? (
                        <img src={croppedImage} alt="Cropped Nutrition Facts" className="w-full h-full object-contain bg-black" />
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90"></video>
                            <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none opacity-40 animate-pulse"></div>
                        </>
                    )}
                </div>

                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />

                <div className="flex gap-4 mb-4 w-full">
                    <button
                        onClick={handleCameraCapture}
                        disabled={isLoading}
                        className={`btn-press w-1/2 text-white text-sm font-bold py-3.5 px-4 rounded-xl transition text-center flex items-center justify-center gap-2 ${
                            isLoading
                                ? "bg-slate-400 cursor-not-allowed"
                                : "bg-[#0f8c5b] hover:bg-[#0b6a45] cursor-pointer"
                        }`}
                    >
                        <span>📸</span> {isLoading ? "Loading..." : "Ambil Foto"}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="btn-press w-1/2 bg-white border-2 border-[#0f8c5b] text-[#0f8c5b] hover:bg-[#f1fcf8] text-sm font-bold py-3.5 px-4 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-2 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                        <span>🖼️</span> Pilih dari Galeri
                    </button>
                </div>
                <p className="text-slate-500 text-[11px] text-center mt-2 flex items-center justify-center gap-1.5"><span>🔒</span> Data privasi Anda aman &amp; diproses oleh AI OCR lokal.</p>
            </section>
        </main>
        </>
    );
}
