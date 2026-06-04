import React, { useState, useCallback } from 'react';

const OCR_API_URL = "http://localhost:5000/api/ocr";

// SVG icon helper untuk Toast
const ToastIcons = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    error:   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    info:    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

// ===== KOMPONEN TOAST NOTIFICATION =====
function Toast({ toasts, removeToast }) {
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
                    <span className="shrink-0 mt-0.5">{ToastIcons[t.type]}</span>
                    <div className="flex-1 leading-relaxed">{t.message}</div>
                    <button
                        onClick={() => removeToast(t.id)}
                        className="shrink-0 opacity-60 hover:opacity-100 text-white leading-none cursor-pointer ml-1"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    </button>
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
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                            </div>
                            <span className="text-xs font-bold text-slate-800">1. Upload<br/>Label</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4ef] flex items-center justify-center text-[#0f8c5b] mb-3 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M8 12h.01M12 12h.01M16 12h.01M7 16h10"/></svg>
                            </div>
                            <span className="text-xs font-bold text-slate-800">2. Input<br/>Produk</span>
                        </div>
                        <div className="flex flex-col items-center text-center px-2 group cursor-default">
                            <div className="w-10 h-10 rounded-full bg-[#e6f4ef] flex items-center justify-center text-[#0f8c5b] mb-3 group-hover:scale-110 transition-transform">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
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
                    {isLoading ? (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                            Memproses OCR...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            Analisis Kandungan Nutrisi
                        </>
                    )}
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

                <div className="w-full aspect-video bg-[#2a303c] rounded-2xl overflow-hidden relative mb-4 shadow-inner">
                    {croppedImage ? (
                        <>
                            <img src={croppedImage} alt="Cropped Nutrition Facts" className="w-full h-full object-contain bg-black" />
                            {/* Tombol Retake / Hapus Gambar */}
                            <button
                                onClick={() => { setCroppedImage(null); setOcrResult(null); setOcrData(null); }}
                                className="absolute top-3 right-3 bg-rose-600/90 hover:bg-rose-700 text-white rounded-xl px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-lg backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
                                title="Hapus gambar dan ulangi"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                                Ulangi
                            </button>
                        </>
                    ) : (
                        <>
                            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover opacity-90"></video>
                            <div className="absolute inset-8 border-2 border-dashed border-emerald-400 rounded-xl pointer-events-none opacity-40 animate-pulse"></div>
                            {/* Label petunjuk */}
                            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/50 text-white text-[10px] px-3 py-1 rounded-full backdrop-blur-sm pointer-events-none">
                                Arahkan kamera ke label nutrisi
                            </div>
                        </>
                    )}
                </div>
                {/* Info status gambar */}
                {croppedImage && (
                    <div className="w-full mb-4 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 flex items-start sm:items-center gap-2.5 text-xs text-emerald-700 font-medium">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0 mt-0.5 sm:mt-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span className="leading-snug">Gambar berhasil dipindai. Klik <strong>Ulangi</strong> untuk mengganti foto.</span>
                    </div>
                )}

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
                        {isLoading ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        )}
                        {isLoading ? "Memproses..." : "Ambil Foto"}
                    </button>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading}
                        className="btn-press w-1/2 bg-white border-2 border-[#0f8c5b] text-[#0f8c5b] hover:bg-[#f1fcf8] text-sm font-bold py-3.5 px-4 rounded-xl transition cursor-pointer text-center flex items-center justify-center gap-2 disabled:border-slate-300 disabled:text-slate-400 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        Pilih dari Galeri
                    </button>
                </div>
                <p className="text-slate-500 text-[11px] text-center mt-2 flex items-center justify-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                    Data privasi Anda aman &amp; diproses oleh AI OCR lokal.
                </p>
            </section>
        </main>
        </>
    );
}
