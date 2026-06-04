import React from 'react';

export default function Beranda({ handleFeatureAccess, isLoggedIn, userName }) {
    return (
        <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-12 animate-fade-in text-left">

            {isLoggedIn ? (
                <div className="mb-10 mt-2 sm:mb-20 sm:mt-4">
                    <div className="bg-[#0f8c5b] p-4 sm:p-8 md:p-12 rounded-2xl sm:rounded-[2rem] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-8 shadow-xl">

                        {/* Kolom Kiri: Teks */}
                        <div className="md:w-3/5 z-10 w-full flex flex-col items-start text-left md:items-start md:text-left">
                            <span className="bg-white/20 backdrop-blur-md px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-wider border border-white/20 inline-block mb-2">
                                Smart Nutrition Scanner
                            </span>
                            <h1 className="text-lg sm:text-3xl md:text-4xl lg:text-5xl font-black tracking-tight mt-2 mb-2 sm:mt-4 sm:mb-4">
                                Selamat Datang, {userName || 'User'}!
                            </h1>
                            {/* Deskripsi — hanya tampil di sm ke atas */}
                            <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed mb-5 sm:mb-8 max-w-lg font-medium opacity-90 hidden sm:block">
                                Sistem Smart Nutrition Scanner siap membantumu menganalisis tabel nutrisi kemasan. Mari jaga kesehatan tubuh dengan melacak dan membatasi akumulasi konsumsi gula dan garam harianmu mulai sekarang!
                            </p>
                            {/* Deskripsi singkat — hanya di mobile */}
                            <p className="text-emerald-50 text-[11px] leading-relaxed mb-4 font-medium opacity-90 sm:hidden">
                                Pindai &amp; lacak konsumsi gula dan garam kemasanmu mulai sekarang.
                            </p>
                            {/* Tombol: baris di mobile, baris di desktop */}
                            <div className="flex flex-row gap-2 sm:gap-4 w-full">
                                <button onClick={() => handleFeatureAccess('scan')} className="btn-lift flex-1 sm:flex-none sm:w-auto bg-white text-emerald-800 font-bold px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-xs shadow-md hover:bg-emerald-50 cursor-pointer flex justify-center items-center gap-1.5 sm:gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
                                    <span className="sm:hidden">Unggah</span>
                                    <span className="hidden sm:inline">Unggah Label Baru</span>
                                </button>
                                <button onClick={() => handleFeatureAccess('dashboard')} className="btn-lift flex-1 sm:flex-none sm:w-auto bg-[#0d754b] text-white font-bold px-3 sm:px-6 py-2.5 sm:py-3.5 rounded-xl text-xs hover:bg-[#0b633f] cursor-pointer transition flex justify-center items-center gap-1.5 sm:gap-2 border border-[#12a169]">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                                    <span className="sm:hidden">Grafik</span>
                                    <span className="hidden sm:inline">Lihat Grafik Akumulasi</span>
                                </button>
                            </div>
                        </div>

                        {/* Kolom Kanan: Gambar — disembunyikan di mobile */}
                        <div className="hidden sm:flex md:w-2/5 justify-center md:justify-end z-10 relative w-full mt-4 md:mt-0">
                            <img
                                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=600&auto=format&fit=crop"
                                alt="Ilustrasi Makanan Sehat dan Sayuran"
                                className="w-full max-w-[240px] sm:max-w-[280px] md:max-w-[320px] rotate-0 md:rotate-[3deg] hover:rotate-0 transition-transform duration-500 rounded-3xl shadow-xl border-4 border-white/20"
                            />
                            <div className="absolute inset-0 bg-emerald-400/20 blur-[80px] rounded-full -z-10 scale-150"></div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 items-center text-left mb-20">
                    <div>
                        <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-4">
                            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Smart Nutrition Scanner
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                            Kenali Kandungan <br />
                            <span className="text-emerald-600">Gula & Garam</span> <br />
                            di Setiap Produk Kemasan
                        </h1>
                        <p className="text-slate-500 mt-6 text-sm leading-relaxed max-w-md">
                            Jangan biarkan zat tersembunyi merusak kesehatan tubuhmu. Pindai atau unggah tabel nilai gizi kemasan secara instan guna mencegah ancaman Diabetes dan Hipertensi sejak dini.
                        </p>
                        <div className="mt-8">
                            <button
                                onClick={() => handleFeatureAccess('scan')}
                                className="btn-lift bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-8 rounded-2xl shadow-lg shadow-emerald-200 text-sm cursor-pointer"
                            >
                                Mulai Sekarang 🚀
                            </button>
                        </div>
                    </div>
                    <div className="relative flex justify-center">
                        <img src="https://images.unsplash.com/photo-1498837167922-ddd27525d352?q=80&w=600&auto=format&fit=crop" alt="Makanan Sehat" className="rounded-3xl shadow-xl border-4 border-white object-cover aspect-4/3 w-full max-w-md" />
                    </div>
                </div>
            )}

            {/* SEKSI ALUR KERJA */}
            <div className="mb-24">
                <div className="text-center mb-8 sm:mb-12">
                    <h2 className="text-lg sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2 sm:gap-3">
                        <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f8c5b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        </span>
                        Alur Analisis Unggah &amp; Deteksi
                    </h2>
                    <p className="text-slate-500 text-[11px] sm:text-sm mt-2 sm:mt-3 px-4">Hanya butuh 3 langkah instan untuk membaca laporan tubuhmu</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                {[
                        { icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                        ), title: '1. Upload / Foto Label', desc: 'Ambil gambar langsung dengan kamera atau unggah file foto nilai gizi dari penyimpanan galeri pribadi Anda.' },
                        { icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        ), title: '2. Beri Label Nama', desc: 'Ketik identitas merek makanan atau minuman ringan untuk mempermudah pemetaan log riwayat.' },
                        { icon: (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 sm:w-7 sm:h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                        ), title: '3. Evaluasi Grafik Harian', desc: 'Pantau akumulasi takaran zat pengawet secara real-time berdasarkan batas ambang anjuran preventif klinis.' },
                    ].map((step, i) => (
                        <div key={i} className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-row sm:flex-col items-start sm:items-center text-left sm:text-center hover:-translate-y-1 transition-transform duration-300 gap-4 sm:gap-0">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 bg-[#e6f4ef] text-[#0f8c5b] rounded-full flex items-center justify-center sm:mb-6">
                                {step.icon}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm sm:text-base mb-1 sm:mb-3">{step.title}</h4>
                                <p className="text-slate-500 text-[11px] sm:text-xs leading-relaxed">{step.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEKSI KAMUS */}
            <div className="mb-12">
                <div className="text-center md:text-left mb-6 sm:mb-10 border-t border-slate-200 pt-10 sm:pt-16 mt-4 sm:mt-6">
                    <h2 className="text-lg sm:text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2 sm:gap-3">
                        <span className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 sm:w-5 sm:h-5 text-[#0f8c5b]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                        </span>
                        Batas Aman Konsumsi Harian
                    </h2>
                    <p className="text-slate-500 text-[11px] sm:text-sm mt-1.5 sm:mt-2 px-4 md:px-0">Acuan standar kesehatan resmi berbasis panduan umum dari Kemenkes.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {/* KARTU GULA */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="mb-6 border-b border-slate-100 pb-5">
                                <h3 className="font-black text-slate-800 text-xl mb-2">Gula &amp; Risiko Diabetes</h3>
                                <span className="bg-[#0f8c5b] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs inline-block">MAKS: 50g / HARI</span>
                            </div>
                            <ul className="space-y-4 text-sm text-slate-600 mb-8 leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#0f8c5b] mt-0.5 bg-[#e6f4ef] rounded-full p-1 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <span>Konsumsi gula berlebih secara rutin memicu <strong className="text-slate-800">Resistensi Insulin</strong> — penyebab utama Diabetes Melitus Tipe 2.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#0f8c5b] mt-0.5 bg-[#e6f4ef] rounded-full p-1 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <span>Gula tersembunyi banyak ditemukan pada minuman kemasan, teh botol, dan camilan manis siap saji.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#f4f7fb] p-5 rounded-2xl border border-blue-50/50">
                            <div className="flex justify-between items-center mb-3 text-slate-600 text-sm">
                                <span className="font-medium">Setara Takaran Batas Maks:</span>
                                <span className="text-xs font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">± 10 Sendok Teh</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-xs mt-1">
                                <span className="text-2xl">🥄</span>
                                <span className="text-slate-800 font-bold text-base">&times; 10</span>
                            </div>
                        </div>
                    </div>

                    {/* KARTU NATRIUM */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="mb-6 border-b border-slate-100 pb-5">
                                <h3 className="font-black text-slate-800 text-xl mb-2">Natrium &amp; Risiko Hipertensi</h3>
                                <span className="bg-[#d13b3b] text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-xs inline-block">MAKS: 2000mg / HARI</span>
                            </div>
                            <ul className="space-y-4 text-sm text-slate-600 mb-8 leading-relaxed">
                                <li className="flex items-start gap-3">
                                    <span className="text-[#0f8c5b] mt-0.5 bg-[#e6f4ef] rounded-full p-1 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <span>Kadar natrium berlebih mengikat cairan tubuh dan secara langsung memicu kenaikan <strong className="text-slate-800">Tekanan Darah Tinggi</strong>.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-[#0f8c5b] mt-0.5 bg-[#e6f4ef] rounded-full p-1 shrink-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                                    </span>
                                    <span>Banyak tersembunyi di makanan gurih, mi instan, snack asin, dan penyedap masakan artifisial.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#fff9f9] p-5 rounded-2xl border border-rose-50/50">
                            <div className="flex justify-between items-center mb-3 text-slate-600 text-sm">
                                <span className="font-medium">Setara Takaran Batas Maks:</span>
                                <span className="text-xs font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">± 0.4 Sendok Teh Garam</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-xs mt-1">
                                <span className="text-2xl">🥄</span>
                                <span className="text-slate-800 font-bold text-base">&times; 0.4</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
