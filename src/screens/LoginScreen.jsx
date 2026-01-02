import React, { useState } from 'react';
import { User, Lock as LockIcon, Shield, RefreshCw } from 'lucide-react';
import { Card } from '../ui.jsx';

export default function LoginScreen({ onLogin }) {
  const [loading, setLoading] = useState(false);
  const handleLogin = (e) => { e.preventDefault(); setLoading(true); setTimeout(() => onLogin(), 800); };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] p-6 animate-fadeIn">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8"><div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 font-black text-4xl shadow-2xl shadow-amber-500/20 transform rotate-3">M</div></div>
        <Card className="!bg-[#1e293b]/90 border-slate-700/50">
          <div className="text-center mb-8"><h2 className="text-2xl font-bold text-white">Bienvenido</h2><p className="text-slate-400 text-sm mt-1">Ingresa a tu bóveda financiera</p></div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1"><label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Email</label><div className="relative"><User className="absolute left-4 top-3.5 text-slate-500" size={18} /><input type="email" defaultValue="usuario@demo.com" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" /></div></div>
            <div className="space-y-1"><label className="text-xs text-slate-500 font-bold uppercase tracking-wider ml-1">Contraseña</label><div className="relative"><LockIcon className="absolute left-4 top-3.5 text-slate-500" size={18} /><input type="password" defaultValue="password123" className="w-full bg-slate-900/50 border border-slate-700 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" /></div></div>
            <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-amber-400 to-yellow-600 text-slate-900 font-bold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-95 mt-6 flex justify-center items-center gap-2">{loading ? <><RefreshCw className="animate-spin" size={20} /><span>Autenticando...</span></> : 'Iniciar Sesión Segura'}</button>
          </form>
          <div className="mt-6 text-center"><p className="text-xs text-slate-500 flex items-center justify-center gap-1"><Shield size={12} className="text-emerald-500" />Conexión encriptada SSL/TLS</p></div>
        </Card>
      </div>
    </div>
  );
}
