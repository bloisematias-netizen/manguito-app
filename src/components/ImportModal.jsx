import React, { useRef } from 'react';
import { X } from 'lucide-react';

export default function ImportModal({ open, onClose, onFileChosen }) {
  const inputRef = useRef(null);
  if (!open) return null;

  const handleStart = (mode) => {
    if (!inputRef.current) return;
    inputRef.current.dataset.mode = mode;
    inputRef.current.click();
  };

  const handleChange = (e) => {
    const file = e.target.files && e.target.files[0];
    const mode = e.target.dataset.mode || 'merge';
    e.target.value = null;
    if (!file) return;
    if (onFileChosen) onFileChosen(file, mode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#1e293b] w-full max-w-sm rounded-[1.25rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp">
        <div className="flex justify-between items-center mb-4"><h3 className="text-xl font-bold text-white">Importar datos</h3><button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={18} /></button></div>
        <p className="text-sm text-slate-400 mb-4">Selecciona cómo quieres aplicar los datos del archivo:</p>
        <div className="space-y-3">
          <button onClick={() => handleStart('merge')} className="w-full py-3 bg-amber-500 text-slate-900 font-medium rounded-xl">Fusionar (combinar)</button>
          <button onClick={() => handleStart('replace')} className="w-full py-3 bg-red-500/10 text-red-400 font-medium rounded-xl border border-red-500/30">Reemplazar (sobrescribir)</button>
          <button onClick={onClose} className="w-full py-3 bg-slate-800/40 text-slate-200 font-medium rounded-xl">Cancelar</button>
        </div>
        <input ref={inputRef} type="file" accept="application/json" onChange={handleChange} style={{ display: 'none' }} />
      </div>
    </div>
  );
}
