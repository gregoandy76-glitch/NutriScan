import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';

function generateQuestion() {
    const a = Math.floor(Math.random() * 9) + 1;
    const b = Math.floor(Math.random() * 9) + 1;
    const ops = ['+', '-', '×'];
    const op = ops[Math.floor(Math.random() * ops.length)];
    let answer;
    if (op === '+') answer = a + b;
    else if (op === '-') answer = Math.abs(a - b);
    else answer = a * b;
    const displayA = op === '-' ? Math.max(a, b) : a;
    const displayB = op === '-' ? Math.min(a, b) : b;
    return { question: `${displayA} ${op} ${displayB}`, answer };
}

const MathCaptcha = forwardRef(function MathCaptcha({ onValidChange }, ref) {
    const [{ question, answer }, setQA] = useState(generateQuestion);
    const [input, setInput] = useState('');
    const [status, setStatus] = useState(null); // null | 'ok' | 'err'

    const refresh = () => {
        setQA(generateQuestion());
        setInput('');
        setStatus(null);
        onValidChange(false);
    };

    useImperativeHandle(ref, () => ({ reset: refresh }));

    const handleChange = (e) => {
        const val = e.target.value;
        setInput(val);
        if (val === '') { setStatus(null); onValidChange(false); return; }
        const correct = parseInt(val) === answer;
        setStatus(correct ? 'ok' : 'err');
        onValidChange(correct);
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center gap-3">
            <div className="flex-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Verifikasi CAPTCHA</p>
                <div className="flex items-center gap-2">
                    <span className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg font-black text-slate-800 text-sm tracking-widest select-none">
                        {question} = ?
                    </span>
                    <input
                        type="number"
                        value={input}
                        onChange={handleChange}
                        placeholder="Jawab"
                        className={`w-20 p-1.5 border rounded-lg text-sm text-center font-bold focus:outline-none transition-colors ${
                            status === 'ok'  ? 'border-emerald-400 bg-emerald-50 text-emerald-700' :
                            status === 'err' ? 'border-rose-400 bg-rose-50 text-rose-700' :
                            'border-slate-200 bg-white'
                        }`}
                    />
                    {status === 'ok'  && <span className="text-emerald-500 text-base">✓</span>}
                    {status === 'err' && <span className="text-rose-500 text-base">✗</span>}
                </div>
            </div>
            <button type="button" onClick={refresh} title="Ganti soal" className="btn-press text-slate-400 hover:text-emerald-600 text-lg transition-colors cursor-pointer">
                🔄
            </button>
        </div>
    );
});

export default MathCaptcha;
