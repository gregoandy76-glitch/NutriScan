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

export default function App() {
  const [page, setPage] = useState('beranda');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authModal, setAuthModal] = useState(null); // 'login' | 'register' | null

  const [productName, setProductName] = useState('');
  const [currentProduct, setCurrentProduct] = useState('Memuat nama produk...');
  const [scanHistory, setScanHistory] = useState([]);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-login dari token tersimpan
  useEffect(() => {
    const token = localStorage.getItem('nutriscan_token');
    if (!token) return;
    fetch('http://localhost:5000/api/user/profile', {
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
      alert("Masukkan nama produk terlebih dahulu!");
      return;
    }
    setCurrentProduct(productName);

    const updatedHistory = [
      { name: productName, date: new Date().toLocaleDateString('id-ID'), gula: '12g', garam: '1500mg' },
      ...scanHistory
    ];

    setScanHistory(updatedHistory);
    const userUniqueKey = `scanHistory_${userEmail}`;
    localStorage.setItem(userUniqueKey, JSON.stringify(updatedHistory));

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
    alert("Anda telah keluar. Riwayat sesi Anda telah diamankan.");
  };

  const hariIni = new Date().toLocaleDateString('id-ID');
  const totalGulaHariIni = scanHistory
    .filter(item => item.date === hariIni)
    .reduce((sum, item) => sum + parseInt(item.gula), 0);

  const totalGaramHariIni = scanHistory
    .filter(item => item.date === hariIni)
    .reduce((sum, item) => sum + parseInt(item.garam), 0);

  return (
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
          <ScanKamera productName={productName} setProductName={setProductName} handleAnalysis={handleAnalysis} videoRef={videoRef} setShowPrivacyModal={setShowPrivacyModal} fileInputRef={fileInputRef} />
        )}

        {page === 'dashboard' && isLoggedIn && (
          <Dashboard currentProduct={currentProduct} totalGulaHariIni={totalGulaHariIni} totalGaramHariIni={totalGaramHariIni} scanHistory={scanHistory} setPage={setPage} />
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
            <div className="text-3xl mb-3">🛡️</div>
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
  );
}