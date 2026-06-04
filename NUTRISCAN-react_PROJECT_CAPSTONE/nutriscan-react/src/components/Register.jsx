import React, { useState, useRef } from 'react';
import MathCaptcha from './MathCaptcha';

export default function Register({ setAuthModal, onLoginSuccess }) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [captchaValid, setCaptchaValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const captchaRef = useRef(null);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        if (!captchaValid) return;
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`${apiBaseUrl}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.message); return; }

            // Registrasi berhasil — tampilkan pesan sukses dan arahkan ke login
            setSuccessMsg('Akun berhasil dibuat! Silakan masuk menggunakan akun Anda.');
            setForm({ name: '', email: '', password: '' });
            setTimeout(() => setAuthModal('login'), 2000);
        } catch {
            setError('Tidak dapat terhubung ke server. Pastikan backend berjalan.');
        } finally {
            setLoading(false);
            captchaRef.current?.reset();
            setCaptchaValid(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white p-6 rounded-2xl max-w-sm w-full shadow-2xl border border-slate-100 text-left relative animate-scale-in">

                <button onClick={() => setAuthModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                </button>

                <div className="mb-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4.5 h-4.5 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900">Daftar Akun Baru</h3>
                        <p className="text-slate-400 text-[11px] mt-0.5">Gabung bersama NutriScan untuk memulai hidup sehat.</p>
                    </div>
                </div>

                {successMsg && (
                    <div className="mb-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs px-3 py-2 rounded-xl animate-fade-in flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        {successMsg}
                    </div>
                )}

                {error && (
                    <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl animate-fade-in flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Nama Lengkap</label>
                        <input name="name" type="text" value={form.name} onChange={handleChange} placeholder="Kharina Aisyah" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Alamat Email</label>
                        <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@domain.com" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" required />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1">Kata Sandi</label>
                        <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-emerald-500" required />
                    </div>

                    <MathCaptcha ref={captchaRef} onValidChange={setCaptchaValid} />

                    <button
                        type="submit"
                        disabled={!captchaValid || loading}
                        className={`btn-lift w-full font-bold py-2.5 rounded-xl text-sm shadow-xs transition-all ${
                            captchaValid && !loading
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {loading ? (
                            <><svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Memproses...</>
                        ) : 'Daftar Akun Baru'}
                    </button>
                </form>

                <div className="text-center mt-4 pt-4 border-t border-slate-100">
                    <p className="text-xs text-slate-500">
                        Sudah terdaftar?
                        <button onClick={() => setAuthModal('login')} className="text-emerald-600 font-bold ml-1 hover:underline cursor-pointer">Masuk di sini</button>
                    </p>
                </div>
            </div>
        </div>
    );
}
