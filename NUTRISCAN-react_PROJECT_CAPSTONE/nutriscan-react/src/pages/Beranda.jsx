import React from 'react';

export default function Beranda({ handleFeatureAccess, isLoggedIn, userName }) {
    return (
        <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-12 animate-fade-in text-left">

            {isLoggedIn ? (
                <div className="mb-20 mt-4">
                    <div className="bg-[#0f8c5b] p-6 sm:p-12 rounded-[2rem] text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                        
                        {/* Kolom Kiri: Teks */}
                        <div className="md:w-3/5 z-10 w-full">
                            <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border border-white/20">
                                Smart Nutrition Scanner
                            </span>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight mt-6 mb-4">
                                Selamat Datang, {userName || 'User'}! <span className="inline-block">👋</span>
                            </h1>
                            <p className="text-emerald-50 text-sm leading-relaxed mb-8 max-w-lg font-medium opacity-90">
                                Sistem Smart Nutrition Scanner siap membantumu menganalisis tabel nutrisi kemasan. Mari jaga kesehatan tubuh dengan melacak dan membatasi akumulasi konsumsi gula dan garam harianmu mulai sekarang!
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full">
                                <button onClick={() => handleFeatureAccess('scan')} className="btn-lift w-full sm:w-auto bg-white text-emerald-800 font-bold px-6 py-3.5 rounded-xl text-xs shadow-md hover:bg-emerald-50 cursor-pointer flex justify-center items-center gap-2">
                                    <span className="text-sm">📤</span> Unggah Label Baru
                                </button>
                                <button onClick={() => handleFeatureAccess('dashboard')} className="btn-lift w-full sm:w-auto bg-[#0d754b] text-white font-bold px-6 py-3.5 rounded-xl text-xs hover:bg-[#0b633f] cursor-pointer transition flex justify-center items-center gap-2 border border-[#12a169]">
                                    <span className="text-sm">📈</span> Lihat Grafik Akumulasi
                                </button>
                            </div>
                        </div>

                        {/* Kolom Kanan: Gambar Ilustrasi */}
                        <div className="md:w-2/5 flex justify-center md:justify-end z-10 relative w-full">
                            <img 
                                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop" 
                                alt="Dashboard Tablet Ilustrasi" 
                                className="w-full max-w-[320px] rounded-2xl shadow-2xl rotate-[-2deg] hover:rotate-0 transition-transform duration-500 border-[6px] border-black/80"
                            />
                            {/* Dekorasi Glow */}
                            <div className="absolute inset-0 bg-emerald-400/20 blur-[80px] rounded-full -z-10 scale-150"></div>
                        </div>

                        {/* Background Decoration Murni */}
                        <div className="absolute right-0 top-0 opacity-[0.03] text-[20rem] pointer-events-none translate-x-1/4 -translate-y-1/4 leading-none">
                            🍽️
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
                <div className="text-center mb-12">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center gap-2">
                        <span className="text-[#0f8c5b]">💡</span> Alur Analisis Unggah & Deteksi
                    </h2>
                    <p className="text-slate-500 text-sm mt-3">Hanya butuh 3 langkah instan untuk membaca laporan tubuhmu</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10">
                    {[
                        { icon: '🖼️', title: '1. Upload / Foto Label', desc: 'Ambil gambar langsung dengan kamera atau unggah file foto nilai gizi dari penyimpanan galeri pribadi Anda.' },
                        { icon: '✏️', title: '2. Beri Label Nama', desc: 'Ketik identitas merek makanan atau minuman ringan untuk mempermudah pemetaan log riwayat.' },
                        { icon: '📊', title: '3. Evaluasi Grafik Harian', desc: 'Pantau akumulasi takaran zat pengawet secara real-time berdasarkan batas ambang anjuran preventif klinis.' },
                    ].map((step, i) => (
                        <div key={i} className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300">
                            <div className="w-16 h-16 bg-[#e6f4ef] text-[#0f8c5b] text-2xl rounded-full flex items-center justify-center mb-6">
                                {step.icon}
                            </div>
                            <h4 className="font-bold text-slate-800 text-base mb-3">{step.title}</h4>
                            <p className="text-slate-500 text-xs leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEKSI KAMUS */}
            <div className="mb-12">
                <div className="text-center md:text-left mb-10 border-t border-slate-200 pt-16 mt-6">
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-2">
                        <span className="text-[#0f8c5b]">📚</span> Batas Aman Konsumsi Harian
                    </h2>
                    <p className="text-slate-500 text-sm mt-2">Acuan standar kesehatan resmi berbasis panduan umum dari WHO dan BPOM RI.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                    {/* KARTU GULA */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-2 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2 text-[#0f8c5b]">
                                    <span className="text-xl">🍬</span>
                                    <h3 className="font-bold text-slate-800 text-base">Gula & Risiko Diabetes</h3>
                                </div>
                                <span className="bg-[#0f8c5b] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs">MAKS: 50g / HARI</span>
                            </div>
                            <ul className="space-y-3.5 text-xs text-slate-500 mb-8 leading-relaxed">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#0f8c5b] text-[10px] mt-1 bg-[#e6f4ef] rounded-full p-0.5">✔</span>
                                    <span>Konsumsi berlebih memicu <strong>Resistensi Insulin</strong> penyebab Diabetes Melitus Tipe 2.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#0f8c5b] text-[10px] mt-1 bg-[#e6f4ef] rounded-full p-0.5">✔</span>
                                    <span>Sering tersembunyi di balik produk minuman botol manis dan camilan kemasan.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#f4f7fb] p-5 rounded-2xl border border-blue-50/50 text-xs">
                            <div className="flex justify-between items-center mb-3 text-slate-600">
                                <span>Setara Takaran Batas Maks:</span>
                                <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2.5 py-1 rounded-md">± 12 Sendok Teh</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-xs mt-1">
                                <span className="text-2xl">🥄</span>
                                <span className="text-slate-800 font-bold text-base">&times; 12</span>
                            </div>
                        </div>
                    </div>

                    {/* KARTU NATRIUM */}
                    <div className="bg-white border border-slate-100 rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-6 flex-wrap gap-2 border-b border-slate-100 pb-4">
                                <div className="flex items-center gap-2 text-[#d13b3b]">
                                    <span className="text-xl">🧂</span>
                                    <h3 className="font-bold text-slate-800 text-base">Natrium & Risiko Hipertensi</h3>
                                </div>
                                <span className="bg-[#d13b3b] text-white text-[10px] font-bold px-3 py-1.5 rounded-full shadow-xs">MAKS: 2000mg / HARI</span>
                            </div>
                            <ul className="space-y-3.5 text-xs text-slate-500 mb-8 leading-relaxed">
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#0f8c5b] text-[10px] mt-1 bg-[#e6f4ef] rounded-full p-0.5">✔</span>
                                    <span>Kadar Natrium pekat mengikat cairan tubuh dan menaikkan <strong>Tekanan Darah Tinggi</strong>.</span>
                                </li>
                                <li className="flex items-start gap-2.5">
                                    <span className="text-[#0f8c5b] text-[10px] mt-1 bg-[#e6f4ef] rounded-full p-0.5">✔</span>
                                    <span>Banyak terkandung di makanan gurih, mi instan, serta penyedap masakan artifisial.</span>
                                </li>
                            </ul>
                        </div>
                        <div className="bg-[#fff9f9] p-5 rounded-2xl border border-rose-50/50 text-xs">
                            <div className="flex justify-between items-center mb-3 text-slate-600">
                                <span>Setara Takaran Batas Maks:</span>
                                <span className="text-[10px] font-bold text-rose-500 bg-rose-50 px-2.5 py-1 rounded-md">± 1 Sendok Teh Garam</span>
                            </div>
                            <div className="flex items-center justify-center gap-2 bg-white p-4 rounded-xl border border-slate-100 shadow-xs mt-1">
                                <span className="text-2xl">🥄</span>
                                <span className="text-slate-800 font-bold text-base">&times; 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
