import React, { useState, useEffect, useRef } from 'react';

// Import Komponen Global
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Register from './components/Register';

// Import Komponen Halaman
import Beranda from './pages/Beranda';
import ScanKamera from './pages/ScanKamera';
import Dashboard from './pages/Dashboard';

// ===== SVG ICON MAP UNTUK TOAST =====
const AppToastIcons = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
    error:   <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>,
    info:    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

// ===== KOMPONEN TOAST NOTIFICATION LOKAL =====
function AppToast({ toasts, removeToast }) {
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
                    <span className="shrink-0 mt-0.5">{AppToastIcons[t.type]}</span>
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

export default function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
  const [page, setPage] = useState('beranda');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null

  const [productName, setProductName] = useState('');
  const [currentProduct, setCurrentProduct] = useState('Memuat nama produk...');
  const [scanHistory, setScanHistory] = useState([]);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [ocrData, setOcrData] = useState(null); // Data nutrisi real dari Gemini OCR

  const [toasts, setToasts] = useState([]);
  const showToast = (message, type = 'info') => {
      const id = Date.now() + Math.random();
      setToasts(prev => [...prev, { id, message, type }]);
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };
  const removeToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-login dari token tersimpan
  useEffect(() => {
    const token = localStorage.getItem('nutriscan_token');
    if (!token) return;
    fetch(`${apiBaseUrl}/api/user/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        setIsLoggedIn(true);
        setUserName(data.user.name);
        setUserEmail(data.user.email);
      })
      .catch(() => localStorage.removeItem('nutriscan_token'));
  }, []);

  // Efek memuat data riwayat unik berbasis email user yang aktif
  useEffect(() => {
    if (isLoggedIn && userEmail) {
      const userUniqueKey = `scanHistory_${userEmail}`;
      const savedHistory = JSON.parse(localStorage.getItem(userUniqueKey)) || [];
      setScanHistory(savedHistory);
    } else {
      setScanHistory([]);
    }
  }, [isLoggedIn, userEmail]);

  // Efek menyalakan/mematikan kamera otomatis
  useEffect(() => {
    if (page === 'scan' && isLoggedIn) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        })
        .catch((err) => console.error("Kamera tidak tersedia:", err));
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  }, [page, isLoggedIn]);

  // Fungsi pengunci fitur jika belum masuk akun
  const handleFeatureAccess = (targetPage) => {
    if (!isLoggedIn) {
      setAuthModal('register');
      return;
    }
    setPage(targetPage);
  };

  const handleAnalysis = () => {
    if (!productName) {
      showToast("Masukkan nama produk terlebih dahulu!", 'warning');
      return;
    }
    setCurrentProduct(productName);

    // Gunakan data OCR real dari Gemini jika tersedia, fallback ke 0 jika belum scan
    const kandunganPerSajian = ocrData?.kandungan_per_sajian;
    const gulaRaw  = kandunganPerSajian?.gula_g  ?? null;
    const garamRaw = kandunganPerSajian?.garam_mg ?? null;

    const gulaStr  = gulaRaw  !== null ? `${gulaRaw}g`   : '0g';
    const garamStr = garamRaw !== null ? `${garamRaw}mg` : '0mg';

    const updatedHistory = [
      { name: productName, date: new Date().toLocaleDateString('id-ID'), gula: gulaStr, garam: garamStr },
      ...scanHistory
    ];

    setScanHistory(updatedHistory);
    const userUniqueKey = `scanHistory_${userEmail}`;
    localStorage.setItem(userUniqueKey, JSON.stringify(updatedHistory));

    setOcrData(null); // Reset OCR setelah analisis
    setPage('dashboard');
    setProductName('');
  };

  const handleLoginSuccess = (user) => {
    setIsLoggedIn(true);
    setUserName(user.name);
    setUserEmail(user.email);
    setAuthModal(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('nutriscan_token');
    setIsLoggedIn(false);
    setPage('beranda');
    setScanHistory([]);
    setUserName('');
    setUserEmail('');
    showToast("Anda telah keluar. Riwayat sesi Anda telah diamankan.", 'success');
  };

  const hariIni = new Date().toLocaleDateString('id-ID');
  const totalGulaHariIni = scanHistory
    .filter(item => item.date === hariIni)
    .reduce((sum, item) => sum + parseInt(item.gula), 0);

  const totalGaramHariIni = scanHistory
    .filter(item => item.date === hariIni)
    .reduce((sum, item) => sum + parseInt(item.garam), 0);

  return (
    <>
    <AppToast toasts={toasts} removeToast={removeToast} />
    <div className="bg-slate-50 text-slate-800 font-sans min-h-screen antialiased flex flex-col justify-between">
      <div>
        <Navbar
          page={page}
          setPage={setPage}
          isLoggedIn={isLoggedIn}
          setIsLoggedIn={handleLogout}
          userName={userName}
          setAuthModal={setAuthModal}
          handleFeatureAccess={handleFeatureAccess}
        />

        {page === 'beranda' && (
          <Beranda setPage={setPage} handleFeatureAccess={handleFeatureAccess} isLoggedIn={isLoggedIn} userName={userName} />
        )}

        {page === 'scan' && isLoggedIn && (
          <ScanKamera productName={productName} setProductName={setProductName} handleAnalysis={handleAnalysis} videoRef={videoRef} setShowPrivacyModal={setShowPrivacyModal} fileInputRef={fileInputRef} setOcrData={setOcrData} />
        )}

        {page === 'dashboard' && isLoggedIn && (
          <Dashboard currentProduct={currentProduct} totalGulaHariIni={totalGulaHariIni} totalGaramHariIni={totalGaramHariIni} scanHistory={scanHistory} setPage={setPage} userName={userName} />
        )}
      </div>

      {authModal === 'login' && (
        <Login setAuthModal={setAuthModal} onLoginSuccess={handleLoginSuccess} />
      )}
      {authModal === 'register' && (
        <Register setAuthModal={setAuthModal} onLoginSuccess={handleLoginSuccess} />
      )}

      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-2xl max-w-sm w-full text-center shadow-xl border border-slate-100 animate-scale-in">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <h4 className="text-base font-bold text-slate-900 mb-2">Deklarasi Izin Akses Galeri</h4>
            <p className="text-slate-500 text-xs leading-relaxed mb-6">
              Sesuai standar perlindungan data kesehatan privasi, sistem NutriScan hanya akan memproses berkas gambar tabel nilai gizi yang Anda pilih secara sadar untuk dianalisis dan tidak merekam data media lainnya.
            </p>
            <div className="flex space-x-3">
              <button onClick={() => setShowPrivacyModal(false)} className="btn-press w-1/2 bg-slate-100 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition cursor-pointer">Batalkan</button>
              <button
                onClick={() => {
                  setShowPrivacyModal(false);
                  if (fileInputRef.current) fileInputRef.current.click();
                }}
                className="btn-lift w-1/2 bg-emerald-600 text-white py-2.5 rounded-xl text-xs font-bold hover:bg-emerald-700 cursor-pointer"
              >
                Izinkan & Buka
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
    </>
  );
}