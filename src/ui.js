import React from 'react';
import { AlertCircle, RefreshCw, Landmark } from 'lucide-react';

export const SMART_CATEGORIES = [
  { keywords: ['netflix', 'spotify', 'hbo', 'disney', 'cine', 'juego', 'steam', 'playstation'], name: 'Ocio', icon: '🎬', color: '#d97706' },
  { keywords: ['uber', 'cabify', 'bus', 'tren', 'metro', 'gasolina', 'peaje', 'taxi'], name: 'Transporte', icon: '🚗', color: '#92400e' },
  { keywords: ['comida', 'burger', 'pizza', 'sushi', 'tacos', 'mcdonalds', 'starbucks', 'cafe', 'restaurante'], name: 'Comida', icon: '🍔', color: '#fbbf24' },
  { keywords: ['super', 'mercado', 'coto', 'walmart', 'carrefour', 'compra'], name: 'Supermercado', icon: '🛒', color: '#f59e0b' },
  { keywords: ['luz', 'agua', 'gas', 'internet', 'wifi', 'alquiler', 'expensas', 'movistar', 'claro'], name: 'Hogar', icon: '🏠', color: '#78350f' },
  { keywords: ['farmacia', 'medico', 'salud', 'doctor'], name: 'Salud', icon: '💊', color: '#ef4444' },
];

export const getSmartCategory = (title) => {
  const lowerTitle = (title || '').toString().toLowerCase();
  const match = SMART_CATEGORIES.find(cat => 
    cat.keywords.some(keyword => lowerTitle.includes(keyword))
  );
  return match || { name: 'General', icon: '📄', color: '#64748b' };
};

export const Card = ({ children, className = "", ...props }) => (
  <div {...props} className={`bg-slate-800/80 backdrop-blur-md rounded-2xl border border-slate-700/50 shadow-xl p-5 ${className}`}>
    {children}
  </div>
);

export const IconButton = ({ icon: Icon, onClick, className = "", active = false }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 ${
      active 
        ? 'text-amber-400 transform scale-110' 
        : 'text-slate-400 hover:text-slate-200'
    } ${className}`}>
    <div className={`p-2 rounded-xl ${active ? 'bg-amber-500/10' : 'bg-transparent'}`}>
      <Icon size={24} strokeWidth={active ? 2.5 : 2} />
    </div>
  </button>
);

export const Badge = ({ status, type = "status" }) => {
  const styles = {
    Vencida: "bg-red-500/10 text-red-400 border-red-500/20",
    Próxima: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Pagada: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Recurrente: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Banco: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Hormiga: "bg-rose-500/10 text-rose-400 border-rose-500/20"
  };

  if (type === "smart") {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles.Recurrente}`}>
        <div className="flex items-center gap-1"><RefreshCw size={10} className="animate-spin-slow" /><span>Recurrente</span></div>
      </span>
    );
  }
  if (type === "bank") {
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles.Banco}`}>
        <div className="flex items-center gap-1"><Landmark size={10} /><span>Banco</span></div>
      </span>
    );
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold border ${styles[status] || styles.Próxima}`}>
      {status}
    </span>
  );
};

export const PushNotification = ({ show, title, message, icon: Icon, onClose }) => {
  return (
    <div 
      className={`fixed top-4 left-4 right-4 z-[100] transition-all duration-500 transform ${
        show ? 'translate-y-0 opacity-100' : '-translate-y-32 opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-4 rounded-2xl shadow-2xl flex items-start gap-4 cursor-pointer ring-1 ring-white/10">
        <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400">
          <Icon size={24} />
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="font-bold text-white text-sm">Manguito</h4>
            <span className="text-[10px] text-slate-500">Ahora</span>
          </div>
          <p className="font-semibold text-slate-200 mt-1">{title}</p>
          <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
};

export const TrendLineChart = ({ data }) => {
  const height = 100;
  const width = 300;
  const maxVal = Math.max(...data.map(d => d.value), 100);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - (d.value / maxVal) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-32 relative mt-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <line x1="0" y1="0" x2={width} y2="0" stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
        <line x1="0" y1={height/2} x2={width} y2={height/2} stroke="#334155" strokeWidth="0.5" strokeDasharray="4" />
        <line x1="0" y1={height} x2={width} y2={height} stroke="#334155" strokeWidth="0.5" />
        <path d={`M0,${height} ${points} ${width},${height}`} fill="url(#gradient)" opacity="0.2" />
        <defs><linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="transparent" /></linearGradient></defs>
        <polyline fill="none" stroke="#fbbf24" strokeWidth="3" points={points} strokeLinecap="round" strokeLinejoin="round" />
        {data.map((d, i) => { const x = (i / (data.length - 1)) * width; const y = height - (d.value / maxVal) * height; return (<circle key={i} cx={x} cy={y} r="3" className="fill-slate-900 stroke-amber-400 stroke-2 hover:r-4 transition-all" />); })}
      </svg>
    </div>
  );
};
