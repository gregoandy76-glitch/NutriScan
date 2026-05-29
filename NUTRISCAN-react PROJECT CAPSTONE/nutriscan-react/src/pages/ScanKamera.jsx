import React, { useState } from 'react';

export default function ScanKamera({ productName, setProductName, handleAnalysis, videoRef, setShowPrivacyModal, fileInputRef }) {

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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            alert(`Berkas "${e.target.files[0].name}" berhasil dimasukkan ke sistem penelaah privasi lokal!`);
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
                            <span className="text-[10px] font-normal text-slate-400 self-center">Front-End Simulation Mode</span>
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
                </div>

                <button
                    onClick={handleAnalysis}
                    className="btn-lift w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-emerald-100 cursor-pointer text-sm mt-4"
                >
                    Analisis Kandungan Nutrisi 🔍
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
                        onClick={() => alert("Simulasi: Foto kemasan berhasil di-capture!")}
                        className="btn-press w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-center"
                    >
                        📸 Ambil Foto
                    </button>
                    <button
                        onClick={() => setShowPrivacyModal(true)}
                        className="btn-press w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 px-4 rounded-xl transition cursor-pointer text-center"
                    >
                        📁 Pilih dari Galeri
                    </button>
                </div>
                <p className="text-gray-400 text-[10px] text-center">🔒 Data privasi Anda aman mematuhi aturan perlindungan media lokal.</p>
            </section>
        </main>
    );
}
