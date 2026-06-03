import React from 'react';
import { Bar } from 'react-chartjs-2';

export default function Dashboard({ currentProduct, totalGulaHariIni, totalGaramHariIni, scanHistory, setPage }) {

    const produkTerakhir = scanHistory.length > 0 ? scanHistory[0] : null;
    const gulaProdukIni  = produkTerakhir ? parseInt(produkTerakhir.gula)  : 12;
    const garamProdukIni = produkTerakhir ? parseInt(produkTerakhir.garam) : 1500;

    const jumlahSdtGula  = Math.max(1, Math.round(gulaProdukIni / 4));
    const jumlahSdtGaram = (garamProdukIni / 2000).toFixed(1);
    const jumlahIkonGaram = Math.max(1, Math.round(garamProdukIni / 2000));

    const renderSpoons = (count, prefix) =>
        Array.from({ length: Math.min(15, count) }, (_, i) => <span key={`${prefix}-${i}`}>🥄</span>);

    const sugarChartData = {
        labels: ['Total Hari Ini'],
        datasets: [{ data: [totalGulaHariIni || gulaProdukIni], backgroundColor: (totalGulaHariIni || gulaProdukIni) > 50 ? '#f43f5e' : '#f59e0b', borderRadius: 6, barThickness: 55 }]
    };
    const saltChartData = {
        labels: ['Total Hari Ini'],
        datasets: [{ data: [totalGaramHariIni || garamProdukIni], backgroundColor: (totalGaramHariIni || garamProdukIni) > 2000 ? '#f43f5e' : '#3b82f6', borderRadius: 6, barThickness: 55 }]
    };
    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } }
    };

    return (
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
                        <div className="flex flex-wrap gap-1 justify-center my-3 text-xl bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
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
                        <div className="flex flex-wrap gap-1 justify-center my-3 text-xl bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                            {renderSpoons(jumlahIkonGaram, 'salt')}
                        </div>
                        <p className="text-[10px] text-slate-400 text-center">Nilai kandungan murni dalam 1 kemasan produk ini.</p>
                    </div>
                </div>
            </div>

            {/* GRAFIK */}
            <section className="bg-white p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 mb-6">
                <div className="mb-4">
                    <h3 className="font-bold text-slate-900 text-sm">📈 Grafik Akumulasi Konsumsi Harian (Gabungan)</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">Grafik menumpuk seluruh produk yang Anda makan hari ini dan akan kosong kembali saat berganti hari.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
                    <div className="h-48 flex flex-col items-center">
                        <div className="w-full h-full"><Bar data={sugarChartData} options={chartOptions} /></div>
                        <p className="text-[10px] text-amber-600 mt-3 bg-amber-50 px-2 py-1 rounded border border-amber-100 w-full text-center">Total Gula Hari Ini: <strong>{totalGulaHariIni}g</strong> / Batas WHO: 50g</p>
                    </div>
                    <div className="h-48 flex flex-col items-center">
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
    );
}
