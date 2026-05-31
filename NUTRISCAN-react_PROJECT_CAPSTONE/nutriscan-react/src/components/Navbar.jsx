import React, { useState } from 'react';

export default function Navbar({ page, setPage, isLoggedIn, setIsLoggedIn, userName, setAuthModal, handleFeatureAccess }) {
    const [menuOpen, setMenuOpen] = useState(false);

    const navBtn = (label, target, handler) => (
        <button
            onClick={() => { handler ? handler(target) : setPage(target); setMenuOpen(false); }}
            className={`btn-press px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 cursor-pointer ${page === target ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}
        >
            {label}
        </button>
    );

    return (
        <nav className="bg-white/80 backdrop-blur-lg shadow-xs sticky top-0 z-50 border-b border-slate-100/80 px-4 sm:px-6 py-4 w-full">
            <div className="container mx-auto max-w-5xl flex justify-between items-center">

                <div onClick={() => setPage('beranda')} className="flex items-center gap-2.5 cursor-pointer group">
                    <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center text-xl shadow-md shadow-emerald-200 group-hover:rotate-12 transition-transform duration-300">🥗</div>
                    <span className="text-xl font-black tracking-tight text-slate-900">Nutri<span className="text-emerald-600">Scan</span></span>
                </div>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/50">
                    {navBtn('Beranda', 'beranda', null)}
                    {navBtn('Upload & Pindai', 'scan', handleFeatureAccess)}
                    {navBtn('Dashboard', 'dashboard', handleFeatureAccess)}
                </div>

                <div className="flex items-center gap-3">
                    {isLoggedIn ? (
                        <div className="hidden md:flex items-center gap-3 bg-white border border-slate-200/80 py-1.5 px-3.5 rounded-full shadow-xs">
                            <div className="w-6 h-6 bg-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                                {userName ? userName.charAt(0).toUpperCase() : 'K'}
                            </div>
                            <span className="text-xs font-bold text-slate-700">Hi, {userName || 'Kharina'}</span>
                            <div className="w-px h-4 bg-slate-200"></div>
                            <button onClick={() => setIsLoggedIn(false)} className="btn-press text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors">Keluar</button>
                        </div>
                    ) : (
                        <div className="hidden md:flex items-center gap-2">
                            <button onClick={() => setAuthModal('login')} className="btn-press text-xs font-bold text-slate-600 hover:text-emerald-600 px-3 py-2 cursor-pointer transition-colors">Masuk</button>
                            <button onClick={() => setAuthModal('register')} className="btn-lift bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm shadow-emerald-200 cursor-pointer">Daftar Akun</button>
                        </div>
                    )}

                    {/* Hamburger */}
                    <button
                        onClick={() => setMenuOpen(o => !o)}
                        className="md:hidden btn-press flex flex-col gap-1.5 p-2 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                        aria-label="Menu"
                    >
                        <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`}></span>
                        <span className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {menuOpen && (
                <div className="md:hidden animate-slide-down border-t border-slate-100 mt-3 pt-3 px-2 pb-2 space-y-1">
                    {navBtn('Beranda', 'beranda', null)}
                    {navBtn('Upload & Pindai', 'scan', handleFeatureAccess)}
                    {navBtn('Dashboard', 'dashboard', handleFeatureAccess)}
                    <div className="pt-2 border-t border-slate-100 mt-2">
                        {isLoggedIn ? (
                            <div className="flex items-center justify-between px-2 py-1">
                                <span className="text-xs font-bold text-slate-700">Hi, {userName || 'Kharina'}</span>
                                <button onClick={() => { setIsLoggedIn(false); setMenuOpen(false); }} className="btn-press text-xs font-bold text-rose-500 hover:text-rose-700 cursor-pointer transition-colors">Keluar</button>
                            </div>
                        ) : (
                            <div className="flex gap-2 px-1">
                                <button onClick={() => { setAuthModal('login'); setMenuOpen(false); }} className="btn-press flex-1 text-xs font-bold text-slate-600 border border-slate-200 py-2 rounded-xl hover:bg-slate-50 transition cursor-pointer">Masuk</button>
                                <button onClick={() => { setAuthModal('register'); setMenuOpen(false); }} className="btn-lift flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 rounded-xl cursor-pointer">Daftar Akun</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}
