import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';

const FLASK_API = "http://localhost:5000";

export default function Dashboard({ currentProduct, totalGulaHariIni, totalGaramHariIni, scanHistory, setPage, userName }) {

    const produkTerakhir = scanHistory.length > 0 ? scanHistory[0] : null;
    const gulaProdukIni  = produkTerakhir ? parseInt(produkTerakhir.gula)  : 0;
    const garamProdukIni = produkTerakhir ? parseInt(produkTerakhir.garam) : 0;

    // === STATE MODAL PERINGATAN KESEHATAN ===
    const [showWarningModal, setShowWarningModal] = useState(false);
    const [warningMessage, setWarningMessage]     = useState('');
    const [warningQuote, setWarningQuote]         = useState('');
    const [isLoadingMsg, setIsLoadingMsg]         = useState(false);
    const [warningTriggers, setWarningTriggers]   = useState([]);

    // Cek threshold saat Dashboard pertama kali mount
    useEffect(() => {
        const garamBahaya = totalGaramHariIni > 2000;
        const gulaBahaya  = totalGulaHariIni  > 50;

        if (!garamBahaya && !gulaBahaya) return; // Semua aman, tidak perlu popup

        const triggers = [];
        if (garamBahaya) triggers.push(`🧂 Natrium ${totalGaramHariIni}mg (batas 2000mg)`);
        if (gulaBahaya)  triggers.push(`🍬 Gula ${totalGulaHariIni}g (batas 50g)`);
        setWarningTriggers(triggers);
        setShowWarningModal(true);
        setIsLoadingMsg(true);

        // Minta Gemini generate kata mutiara (pesan utama sudah fixed di Flask)
        fetch(`${FLASK_API}/api/health-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                total_garam: totalGaramHariIni,
                total_gula:  totalGulaHariIni,
                user_name:   userName || 'Kamu'
            })
        })
        .then(r => r.json())
        .then(data => {
            setWarningMessage(data.message || 'Batas konsumsi harianmu telah terlampaui.');
            setWarningQuote(data.quote || 'Jaga tubuhmu, jaga masa depanmu.');
        })
        .catch(() => {
            setWarningMessage(`Hai ${userName || 'Kamu'}, hari ini konsumsimu melewati ketentuan Kemenkes RI.`);
            setWarningQuote('Jaga tubuhmu, jaga masa depanmu.');
        })
        .finally(() => setIsLoadingMsg(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const jumlahSdtGula  = Math.max(1, Math.round(gulaProdukIni / 4));
    const jumlahSdtGaram = (garamProdukIni / 2000).toFixed(1);
    const jumlahIkonGaram = Math.max(1, Math.round(garamProdukIni / 2000));

    const renderSpoons = (count, prefix) => (
        <div key={prefix} className="flex items-center justify-center gap-2 text-base">
            <span className="text-2xl">🥄</span>
            <span className="text-slate-500 font-bold text-sm">&times; {count}</span>
        </div>
    );

    // === DATA GRAFIK 7 HARI TERAKHIR ===
    const HARI_SINGKAT = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i)); // dari 6 hari lalu s/d hari ini
        return d;
    });

    const last7Labels = last7Days.map(d => {
        const namaHari = HARI_SINGKAT[d.getDay()];
        const tgl = d.getDate();
        return `${namaHari} ${tgl}`;
    });

    const last7GulaData = last7Days.map(d => {
        const dateStr = d.toLocaleDateString('id-ID');
        return scanHistory
            .filter(item => item.date === dateStr)
            .reduce((sum, item) => sum + (parseInt(item.gula) || 0), 0);
    });

    const last7GaramData = last7Days.map(d => {
        const dateStr = d.toLocaleDateString('id-ID');
        return scanHistory
            .filter(item => item.date === dateStr)
            .reduce((sum, item) => sum + (parseInt(item.garam) || 0), 0);
    });

    const sugarChartData = {
        labels: last7Labels,
        datasets: [{
            data: last7GulaData,
            backgroundColor: last7GulaData.map(v => v > 50 ? '#f43f5e' : '#f59e0b'),
            borderRadius: 6,
            barThickness: 28
        }]
    };
    const saltChartData = {
        labels: last7Labels,
        datasets: [{
            data: last7GaramData,
            backgroundColor: last7GaramData.map(v => v > 2000 ? '#f43f5e' : '#3b82f6'),
            borderRadius: 6,
            barThickness: 28
        }]
    };
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
            x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#64748b' } }
        }
    };

    return (
        <>
        <main className="container mx-auto max-w-4xl my-8 p-4 animate-fade-in text-left">

            {/* HEADLINE */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="text-left w-full">
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full uppercase">Hasil Analisis Pemindaian</span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mt-2">
                        {produkTerakhir ? produkTerakhir.name : 'Produk Pilihan'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Status batas ambang preventif dihitung berdasarkan standar baku klinis dari WHO dan BPOM RI.</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-100 px-5 py-3 rounded-xl text-left sm:text-right shrink-0 w-full sm:w-auto">
                    <p className="text-xs font-bold text-emerald-800">❤️ Pesan untuk Kamu:</p>
                    <p className="text-[11px] text-emerald-700 italic mt-0.5">"Langkah kecil berharga untuk investasi tubuh masa depan."</p>
                </div>
            </div>

            {/* KARTU KEMBAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6 mb-6">

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-amber-400 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base flex justify-between items-center flex-wrap gap-2">
                            🍬 Kandungan Gula Produk
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${gulaProdukIni > 50 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                {gulaProdukIni > 50 ? '🚨 TINGGI' : '✅ NORMAL'}
                            </span>
                        </h3>
                        <div className="my-6 text-center bg-amber-50/50 py-3 rounded-xl">
                            <span className="text-4xl font-black text-amber-600">{gulaProdukIni}</span>
                            <span className="text-sm block font-bold text-slate-500">Gram (g)</span>
                        </div>
                    </div>
                    <div className="text-xs bg-white border border-slate-100 p-4 rounded-xl shadow-xs text-slate-600">
                        <div className="font-bold text-slate-700 mb-1 flex justify-between">
                            <span>🥄 Takaran Sendok Teh:</span>
                            <span className="text-amber-600 font-extrabold">{jumlahSdtGula} sdt</span>
                        </div>
                        <div className="flex items-center justify-center my-3 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                            {renderSpoons(jumlahSdtGula, 'sugar')}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">Nilai kandungan murni dalam 1 kemasan produk ini.</p>
                    </div>
                </div>

                <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 border-t-4 border-rose-500 flex flex-col justify-between hover:shadow-md transition-shadow duration-300">
                    <div>
                        <h3 className="font-bold text-slate-800 text-base flex justify-between items-center flex-wrap gap-2">
                            🧂 Kandungan Garam
                            <span className={`text-xs px-2 py-0.5 rounded font-bold ${garamProdukIni > 600 ? 'bg-rose-600 text-white' : 'bg-emerald-100 text-emerald-800'}`}>
                                {garamProdukIni > 600 ? '🚨 TINGGI' : '✅ NORMAL'}
                            </span>
                        </h3>
                        <div className="my-6 text-center bg-rose-50/50 py-3 rounded-xl">
                            <span className="text-4xl font-black text-rose-600">{garamProdukIni}</span>
                            <span className="text-sm block font-bold text-slate-500">Miligram (mg)</span>
                        </div>
                    </div>
                    <div className="text-xs bg-white border border-slate-100 p-4 rounded-xl shadow-xs text-slate-600">
                        <div className="font-bold text-slate-700 mb-1 flex justify-between">
                            <span>🧂 Takaran Sendok Teh:</span>
                            <span className="text-rose-600 font-extrabold">{jumlahSdtGaram} sdt</span>
                        </div>
                        <div className="flex items-center justify-center my-3 bg-slate-50 p-3 rounded-lg border border-dashed border-slate-200">
                            {renderSpoons(jumlahIkonGaram, 'salt')}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">Nilai kandungan murni dalam 1 kemasan produk ini.</p>
                    </div>
                </div>
            </div>

            {/* GRAFIK */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">📈 Grafik Konsumsi 7 Hari Terakhir</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Akumulasi konsumsi per hari — bar merah berarti melebihi batas WHO. Data otomatis diperbarui setiap hari.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="h-52 flex flex-col items-center">
                        <div className="w-full h-full"><Bar data={sugarChartData} options={chartOptions} /></div>
                        <p className="text-[10px] text-amber-600 mt-3 bg-amber-50 px-2 py-1 rounded border border-amber-100 w-full text-center">Total Gula Hari Ini: <strong>{totalGulaHariIni}g</strong> / Batas WHO: 50g</p>
                    </div>
                    <div className="h-52 flex flex-col items-center">
                        <div className="w-full h-full"><Bar data={saltChartData} options={chartOptions} /></div>
                        <p className="text-[10px] text-rose-600 mt-3 bg-rose-50 px-2 py-1 rounded border border-rose-100 w-full text-center">Total Natrium Hari Ini: <strong>{totalGaramHariIni}mg</strong> / Batas WHO: 2000mg</p>
                    </div>
                </div>
            </section>

            {/* TABEL RIWAYAT */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-900 text-sm mb-4">📊 Riwayat Log Nilai Gizi Produk</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse min-w-[400px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold">
                                <th className="p-3">Nama Produk</th>
                                <th className="p-3">Waktu</th>
                                <th className="p-3">Gula</th>
                                <th className="p-3">Natrium</th>
                            </tr>
                        </thead>
                        <tbody>
                            {scanHistory.length === 0 ? (
                                <tr><td colSpan="4" className="p-4 text-center text-slate-400 italic">Belum ada riwayat produk yang di-scan hari ini.</td></tr>
                            ) : (
                                scanHistory.map((item, index) => (
                                    <tr key={index} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors duration-150">
                                        <td className="p-3 font-semibold text-slate-800">{item.name}</td>
                                        <td className="p-3 text-slate-500">{item.date}</td>
                                        <td className="p-3 text-amber-600 font-medium">{item.gula}</td>
                                        <td className="p-3 text-rose-600 font-medium">{item.garam}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </section>

        </main>

        {/* ===== MODAL PERINGATAN KESEHATAN ===== */}
        {showWarningModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">

                    {/* Header merah bergradasi */}
                    <div className="bg-gradient-to-br from-rose-500 to-rose-700 px-6 pt-8 pb-6 text-center relative">
                        <div className="text-5xl mb-3 animate-bounce">⚠️</div>
                        <h2 className="text-white text-xl font-black tracking-tight">Sinyal Bahaya Konsumsi!</h2>
                        <p className="text-rose-100 text-xs mt-1">Batas harian WHO telah terlampaui hari ini</p>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">

                        {/* Badge-badge pemicu */}
                        <div className="flex flex-wrap gap-2 mb-4 justify-center">
                            {warningTriggers.map((t, i) => (
                                <span key={i} className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1.5 rounded-full">
                                    {t}
                                </span>
                            ))}
                        </div>

                        {/* Pesan dari Flask (fixed format) + Quote dari Gemini */}
                        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 min-h-[100px] flex flex-col items-center justify-center mb-5 gap-3">
                            {isLoadingMsg ? (
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-6 h-6 border-2 border-rose-400 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-xs text-slate-400">Membuat pesan dari AI...</p>
                                </div>
                            ) : (
                                <>
                                    {/* Pesan utama — format fixed */}
                                    <p className="text-sm text-slate-800 text-center leading-relaxed font-semibold">
                                        {warningMessage}
                                    </p>
                                    {/* Kata mutiara dari Gemini */}
                                    {warningQuote && (
                                        <p className="text-xs text-rose-500 italic text-center font-medium border-t border-slate-200 pt-3 w-full">
                                            &ldquo;{warningQuote}&rdquo;
                                        </p>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Tombol OK */}
                        <button
                            onClick={() => setShowWarningModal(false)}
                            className="w-full bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-bold py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-rose-200 active:scale-95 cursor-pointer"
                        >
                            Saya Mengerti — Tutup
                        </button>

                        <p className="text-center text-[10px] text-slate-400 mt-3">
                            Pesan dihasilkan oleh AI NutriScan berdasarkan standar WHO & BPOM RI
                        </p>
                    </div>
                </div>
            </div>
        )}

        </>
    );
}
