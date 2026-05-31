import React from 'react';

export default function Beranda({ handleFeatureAccess, isLoggedIn, userName }) {
    return (
        <main className="container mx-auto max-w-5xl px-4 py-10 sm:py-12 animate-fade-in text-left">

            {isLoggedIn ? (
                <div className="mb-16">
                    <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 sm:p-8 rounded-3xl shadow-lg shadow-emerald-100 text-white relative overflow-hidden">
                        <div className="absolute right-0 bottom-0 opacity-10 text-9xl pointer-events-none translate-x-10 translate-y-10">🥗</div>
                        <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">Smart Nutrition Scanner</span>
                        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mt-3">Selamat Datang, {userName || 'User'}! 👋</h1>
                        <p className="text-emerald-50/80 text-sm mt-2 max-w-xl leading-relaxed">
                            Sistem Smart Nutrition Scanner siap membantumu menganalisis tabel nutrisi kemasan. Mari jaga kesehatan tubuh dengan melacak dan membatasi akumulasi konsumsi gula dan garam harianmu mulai sekarang!
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <button onClick={() => handleFeatureAccess('scan')} className="btn-lift bg-white text-emerald-700 font-bold px-5 py-2.5 rounded-xl text-xs shadow-sm hover:bg-emerald-50 cursor-pointer">📤 Unggah Label Baru</button>
                            <button onClick={() => handleFeatureAccess('dashboard')} className="btn-lift bg-emerald-700/40 text-white font-bold px-5 py-2.5 rounded-xl text-xs border border-white/20 hover:bg-emerald-700/60 cursor-pointer">📈 Lihat Grafik Akumulasi</button>
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
            <div className="mb-20 bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 shadow-xs">
                <div className="text-center mb-10">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">💡 Alur Analisis Unggah & Deteksi</h2>
                    <p className="text-slate-400 text-xs mt-1">Hanya butuh 3 langkah instan untuk membaca laporan tubuhmu</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
                    {[
                        { icon: '📤', title: '1. Upload / Foto Label', desc: 'Ambil gambar langsung dengan kamera atau unggah file foto nilai gizi dari penyimpanan galeri pribadi Anda.' },
                        { icon: '✍️', title: '2. Beri Label Nama', desc: 'Ketik identitas merek makanan atau minuman ringan untuk mempermudah pemetaan log riwayat.' },
                        { icon: '📊', title: '3. Evaluasi Grafik Harian', desc: 'Pantau akumulasi takaran zat pengawet secara real-time berdasarkan batas ambang anjuran preventif klinis.' },
                    ].map((step, i) => (
                        <div key={i} className="flex flex-col items-center group">
                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 text-xl font-bold rounded-2xl flex items-center justify-center shadow-inner transition-transform duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:bg-emerald-100">
                                {step.icon}
                            </div>
                            <h4 className="font-extrabold text-slate-800 text-sm mt-4 mb-1">{step.title}</h4>
                            <p className="text-slate-400 text-[11px] px-4 leading-relaxed">{step.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEKSI KAMUS */}
            <div className="mb-12">
                <div className="text-center md:text-left mb-8">
                    <h2 className="text-xl sm:text-2xl font-black text-slate-900">📚 Kamus & Batas Aman Konsumsi Harian</h2>
                    <p className="text-slate-400 text-xs mt-1">Acuan standar kesehatan resmi berbasis panduan umum dari WHO dan BPOM RI.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between border-t-4 border-amber-400 hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🍬</span>
                                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Gula & Risiko Diabetes</h3>
                                </div>
                                <span className="bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-2xs">MAKS: 50g / HARI</span>
                            </div>
                            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✔</span><span>Konsumsi berlebih memicu <strong>Resistensi Insulin</strong> penyebab Diabetes Melitus Tipe 2.</span></li>
                                <li className="flex items-start gap-2"><span className="text-amber-500 mt-0.5">✔</span><span>Sering tersembunyi di balik produk minuman botol manis dan camilan kemasan.</span></li>
                            </ul>
                        </div>
                        <div className="bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100/70 text-xs">
                            <div className="flex justify-between items-center mb-1.5 font-bold text-amber-900">
                                <span>🥄 Setara Takaran Batas Maks:</span>
                                <span className="text-[11px] text-amber-700 bg-white px-2 py-0.5 rounded-md border border-amber-100">± 12 Sendok Teh</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 text-lg mt-1 justify-center bg-white p-2 rounded-xl border border-slate-100">
                                <span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span><span>🥄</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xs flex flex-col justify-between border-t-4 border-rose-500 hover:shadow-md transition-shadow duration-300">
                        <div>
                            <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-2xl">🧂</span>
                                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base">Natrium & Risiko Hipertensi</h3>
                                </div>
                                <span className="bg-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-md shadow-2xs">MAKS: 2000mg / HARI</span>
                            </div>
                            <ul className="space-y-2.5 text-xs text-slate-600 mb-6">
                                <li className="flex items-start gap-2"><span className="text-rose-500 mt-0.5">✔</span><span>Kadar Natrium pekat mengikat cairan tubuh dan menaikkan <strong>Tekanan Darah Tinggi</strong>.</span></li>
                                <li className="flex items-start gap-2"><span className="text-rose-500 mt-0.5">✔</span><span>Banyak terkandung di makanan gurih, mi instan, serta penyedap masakan artifisial.</span></li>
                            </ul>
                        </div>
                        <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100/70 text-xs">
                            <div className="flex justify-between items-center mb-1.5 font-bold text-rose-900">
                                <span>🧂 Setara Takaran Batas Maks:</span>
                                <span className="text-[11px] text-rose-700 bg-white px-2 py-0.5 rounded-md border border-rose-100">± 1 Sendok Teh Garam</span>
                            </div>
                            <div className="flex gap-1.5 text-lg mt-1 justify-center bg-white p-2 rounded-xl border border-slate-100">
                                <span>🥄</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    );
}
