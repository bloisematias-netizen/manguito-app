import React from 'react';
import { Target, PiggyBank, Calendar, AlertTriangle, Plus, Edit2, Trash2 } from 'lucide-react';
import { Card } from '../ui.jsx';

export default function BudgetsScreen({ bills, goals, budgets, onAddGoal, onEditBudgetLimit, onAddBudget, onEditBudgetName, onDeleteBudget }) {
  const calculateSpent = (categoryName) => bills.filter(b => (b.smartCategory?.name === categoryName || b.category === categoryName)).reduce((acc, curr) => acc + Number(curr.amount), 0);
  return (
    <div className="space-y-8 pb-24 animate-fadeIn">
      <div className="px-2"><h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">Presupuestos<Target size={20} className="text-amber-400" /></h2><p className="text-slate-400 text-sm">Metas de ahorro y límites de gasto</p></div>
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2"><h3 className="text-lg font-bold text-white">Metas de Ahorro</h3><button onClick={onAddGoal} className="text-xs font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300">+ Nueva Meta</button></div>
        <div className="grid grid-cols-1 gap-4">
          {goals.map((goal) => {
            const progress = (goal.current / goal.target) * 100;
            const remaining = goal.target - goal.current;
            const monthsLeft = Math.ceil(remaining / 200); 
            return (
              <Card key={goal.id} className="relative overflow-hidden !bg-slate-800">
                <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl text-white shadow-lg"><PiggyBank size={24} /></div><div><h4 className="font-bold text-white text-lg">{goal.title}</h4><p className="text-xs text-slate-400 flex items-center gap-1"><Calendar size={10} />Meta: {monthsLeft} meses aprox.</p></div></div><div className="text-right"><p className="text-xs text-slate-400 uppercase font-bold">Progreso</p><p className="text-2xl font-black text-emerald-400">{progress.toFixed(0)}%</p></div></div>
                <div className="w-full h-4 bg-slate-900 rounded-full overflow-hidden mb-2 border border-slate-700"><div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000 relative" style={{ width: `${progress}%` }}><div className="absolute inset-0 bg-white/20 animate-pulse"></div></div></div>
                <div className="flex justify-between text-xs font-medium"><span className="text-slate-400">${goal.current.toLocaleString()} ahorrados</span><span className="text-slate-200">Meta: ${goal.target.toLocaleString()}</span></div>
              </Card>
            );
          })}
          {goals.length === 0 && <div className="text-center py-8 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20"><p className="text-slate-500 text-sm">No tienes metas de ahorro activas</p></div>}
        </div>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2"><h3 className="text-lg font-bold text-white">Límites Mensuales</h3><button onClick={onAddBudget} className="text-xs font-bold text-amber-400 uppercase tracking-wider hover:text-amber-300 flex items-center gap-1"><Plus size={14} /> Nueva</button></div>
        <div className="space-y-3">
          {budgets.map((budget, idx) => {
            const spent = calculateSpent(budget.category);
            const percentage = Math.min((spent / budget.limit) * 100, 100);
            let barColor = "bg-emerald-500"; let textColor = "text-emerald-400";
            if (percentage > 75) { barColor = "bg-amber-500"; textColor = "text-amber-400"; }
            if (percentage > 90) { barColor = "bg-red-500"; textColor = "text-red-400"; }
            return (
              <div key={idx} className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl group hover:bg-slate-800/60 transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-bold text-slate-200">{budget.category}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEditBudgetName(budget); }} className="p-1.5 bg-slate-700/50 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-all" title="Editar nombre"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); onDeleteBudget(budget.category); }} className="p-1.5 bg-slate-700/50 hover:bg-red-500/30 text-red-400 rounded-lg transition-all" title="Eliminar"><Trash2 size={14} /></button>
                  </div>
                </div>
                {percentage > 90 && (<div className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 rounded text-red-400 text-[10px] font-bold border border-red-500/20 mb-2 w-fit"><AlertTriangle size={10} />DESVÍO</div>)}
                <div className="flex items-end justify-between mb-2 cursor-pointer" onClick={() => onEditBudgetLimit(budget)}><span className={`text-xl font-bold ${textColor}`}>${spent.toFixed(0)}</span><span className="text-xs text-slate-500 font-medium hover:text-slate-300">de ${budget.limit} (tap para editar)</span></div>
                <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden"><div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${percentage}%` }}></div></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
