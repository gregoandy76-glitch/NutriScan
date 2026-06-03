import React from 'react';

export default function Footer() {
    return (
        <footer className="bg-[#eef3fb] py-8 w-full mt-auto">
            <div className="container mx-auto max-w-5xl px-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
                {/* Kiri */}
                <div className="font-black text-[#0f8c5b] text-base">NutriScan</div>
                
                {/* Tengah */}
                <div className="flex gap-4 sm:gap-6 text-slate-500 font-medium flex-wrap justify-center underline decoration-slate-300 underline-offset-4">
                    <a href="#" className="hover:text-slate-800 transition">Privacy Policy</a>
                    <a href="#" className="hover:text-slate-800 transition">Scientific Standards</a>
                    <a href="#" className="hover:text-slate-800 transition">Terms of Service</a>
                    <a href="#" className="hover:text-slate-800 transition">Contact</a>
                </div>

                {/* Kanan */}
                <div className="text-[#0f8c5b] font-medium text-center md:text-right">
                    © 2024 NutriScan. Clinical Clarity in Nutrition.
                </div>
            </div>
        </footer>
    );
}