import React, { useState, useRef } from 'react';
import MathCaptcha from './MathCaptcha';

export default function Register({ setAuthModal, onLoginSuccess }) {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [captchaValid, setCaptchaValid] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
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

            localStorage.setItem('nutriscan_token', data.token);
            onLoginSuccess(data.user);
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

                <button onClick={() => setAuthModal(null)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-sm cursor-pointer">✕</button>

                <div className="mb-4">
                    <h3 className="text-lg font-black text-slate-900">📝 Daftar Akun Baru</h3>
                    <p className="text-slate-400 text-[11px] mt-0.5">Gabung bersama NutriScan untuk memulai hidup sehat.</p>
                </div>

                {error && (
                    <div className="mb-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs px-3 py-2 rounded-xl animate-fade-in">
                        ⚠️ {error}
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
                        {loading ? '⏳ Memproses...' : 'Daftar Akun Baru'}
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
