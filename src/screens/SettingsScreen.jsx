import React from 'react';
import { BellRing, Landmark, Moon, Shield, ChevronRight, LogOut } from 'lucide-react';
import { Card } from '../ui.jsx';

export default function SettingsScreen({ showToast, onLogout, isBankLinked, pushEnabled, onTogglePush, onBackup, onTriggerImport, onDeleteAll }) {
  const SettingItem = ({ icon: Icon, title, type = "toggle", subtitle = null, active = false, onClick }) => (
    <div className="flex items-center justify-between p-4 hover:bg-slate-700/20 transition-colors cursor-pointer active:bg-slate-700/40" onClick={type === "toggle" ? onClick : undefined}>
      <div className="flex items-center gap-4"><div className="p-2 bg-slate-700/50 rounded-lg text-slate-300 relative"><Icon size={18} />{active && <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800"></div>}</div><div><span className="text-slate-200 font-medium block">{title}</span>{subtitle && <span className="text-xs text-slate-500">{subtitle}</span>}</div></div>
      {type === "toggle" ? (
        <div className={`w-12 h-7 rounded-full relative cursor-pointer shadow-inner transition-colors ${active ? 'bg-amber-500' : 'bg-slate-700'}`}>
          <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md transition-all ${active ? 'right-1' : 'left-1'}`}></div>
        </div>
      ) : (<ChevronRight size={18} className="text-slate-500" />)}
    </div>
  );

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <h2 className="text-2xl font-bold text-white px-2">Configuración</h2>
       
      {/* Sección Push Notifications */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <SettingItem 
          icon={BellRing} 
          title="Notificaciones Push" 
          subtitle={pushEnabled ? "Alertas inteligentes activas" : "Desactivado"} 
          active={pushEnabled} 
          onClick={onTogglePush}
        />
        {pushEnabled && (
          <div className="bg-slate-800/30 p-3 mx-4 mb-3 rounded-xl border border-dashed border-slate-600/50 text-xs text-slate-400">
             Manguito analizará tus gastos en segundo plano y te enviará alertas de vencimientos y desvíos de presupuesto.
          </div>
        )}
      </div>

      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <SettingItem icon={Landmark} title="Cuenta Bancaria" type="link" subtitle={isBankLinked ? "Banco Santander •••• 4281" : "No vinculado"} active={isBankLinked} /><div className="h-px bg-slate-700/50 mx-4"></div>
        <SettingItem icon={Moon} title="Modo Oscuro" active={true} /><div className="h-px bg-slate-700/50 mx-4"></div>
        <SettingItem icon={Shield} title="2FA Activado" active={true} />
      </div>
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm space-y-3 px-4 py-4">
        <button onClick={onBackup} className="w-full py-3 bg-slate-900/40 text-slate-200 font-medium rounded-xl border border-slate-700/40 hover:bg-slate-900/60 transition-colors">Respaldar datos (Exportar)</button>
        <button onClick={onTriggerImport} className="w-full py-3 bg-slate-900/40 text-slate-200 font-medium rounded-xl border border-slate-700/40 hover:bg-slate-900/60 transition-colors">Importar datos (Fusionar)</button>
        <button onClick={onDeleteAll} className="w-full py-3 bg-red-500/10 text-red-400 font-bold rounded-xl border border-red-500/30 hover:bg-red-500/20 transition-colors">Eliminar todos los datos</button>
      </div>
      <button onClick={onLogout} className="w-full py-4 text-red-400 font-bold text-sm bg-red-500/10 hover:bg-red-500/20 rounded-2xl transition-colors flex items-center justify-center gap-2"><LogOut size={16} />Cerrar Sesión Segura</button>
    </div>
  );
}
