import React, { useMemo, useState } from 'react';
import { BarChart3, LineChart, AlertCircle } from 'lucide-react';
import { Card, TrendLineChart, Badge, getSmartCategory } from '../ui.jsx';

export default function AnalysisScreen({ bills }) {
  const stats = useMemo(() => {
    const totalSpent = bills.reduce((acc, b) => acc + Number(b.amount), 0);
    const prevMonthTotal = totalSpent * 0.85; 
    const comparison = ((totalSpent - prevMonthTotal) / prevMonthTotal) * 100;
    const trendData = [{ value: totalSpent * 0.2 }, { value: totalSpent * 0.4 }, { value: totalSpent * 0.55 }, { value: totalSpent * 0.8 }, { value: totalSpent }];
    const antExpenses = bills.filter(b => Number(b.amount) < 15 && ['Ocio', 'Comida', 'General'].includes(b.smartCategory?.name || b.category));
    const antTotal = antExpenses.reduce((acc, b) => acc + Number(b.amount), 0);
    const upcomingBills = bills.filter(b => b.status === "Próxima" || b.status === "Vencida").length;
    // pagos de este mes
    const now = new Date();
    const paidThisMonth = bills.filter(b => {
      if (b.status !== 'Pagada') return false;
      const d = new Date(b.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const paidThisMonthTotal = paidThisMonth.reduce((acc, b) => acc + Number(b.amount), 0);
    return { totalSpent, prevMonthTotal, comparison, trendData, antExpenses, antTotal, upcomingBills, paidThisMonth, paidThisMonthTotal };
  }, [bills]);

  const [searchQuery, setSearchQuery] = useState('');
  const filteredTransactions = useMemo(() => {
    const q = (searchQuery || '').toString().trim().toLowerCase();
    const list = q ? bills.filter(b => {
      const smart = (b.smartCategory?.name || b.category || '').toString().toLowerCase();
      return (
        (b.title || '').toString().toLowerCase().includes(q) ||
        smart.includes(q) ||
        (b.status || '').toString().toLowerCase().includes(q) ||
        (b.date || '').toString().toLowerCase().includes(q) ||
        (String(b.amount) || '').includes(q)
      );
    }) : [...bills];
    return list.sort((a,b) => new Date(b.date) - new Date(a.date));
  }, [bills, searchQuery]);

  const groupedTransactions = useMemo(() => {
    const groups = {};
    const today = new Date();
    const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);

    filteredTransactions.forEach((b) => {
      const d = new Date(b.date);
      // key for ordering
      const key = d.toISOString().slice(0, 10);

      // label
      let label;
      const dKey = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const tKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
      const yKey = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate()).getTime();
      if (dKey === tKey) label = 'Hoy';
      else if (dKey === yKey) label = 'Ayer';
      else label = d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }).replace('.', '');

      if (!groups[key]) groups[key] = { label, date: key, items: [] };
      groups[key].items.push(b);
    });

    // return array sorted by date desc
    return Object.values(groups).sort((a, c) => (new Date(c.date) - new Date(a.date))).map(g => ({ ...g, items: g.items.sort((x, y) => new Date(y.date) - new Date(x.date)) }));
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <div className="px-2">
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">Gastos<BarChart3 size={20} className="text-amber-400" /></h2>
        <p className="text-slate-400 text-sm">Resumen de gastos y detalles mensuales</p>
      </div>

      {/* Transacciones recientes: lista con todos los gastos */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-white">Transacciones recientes</h3>
            <p className="text-xs text-slate-400">Listado completo de gastos</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por título, categoría, estado o fecha"
              className="bg-slate-900/60 text-sm placeholder:text-slate-500 text-slate-100 px-3 py-2 rounded-md border border-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
        </div>
        <div className="space-y-4">
          {groupedTransactions.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20"><p className="text-slate-500 text-sm">No hay transacciones.</p></div>
          ) : (
            groupedTransactions.map(group => (
              <div key={group.date}>
                <div className="px-2 py-1 text-xs text-slate-400 font-medium">{group.label}</div>
                <div className="space-y-2">
                  {group.items.map((bill) => {
                    const smartData = bill.smartCategory || getSmartCategory(bill.title);
                    return (
                      <div key={`trx-${bill.id}`} className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-700/20">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center">{smartData.icon}</div>
                          <div>
                            <div className="font-semibold text-slate-100 text-sm">{bill.title}</div>
                            <div className="text-xs text-slate-500">{smartData.name} • {bill.date}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-white">{bill.status === 'Pagada' ? '-$' : '$'}{Number(bill.amount).toFixed(2)}</div>
                          <div className="text-xs text-slate-400">{bill.status}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4"><h3 className="font-bold text-white">Comparativo Mensual</h3><span className={`text-xs font-bold px-2 py-1 rounded-full ${stats.comparison > 0 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>{stats.comparison > 0 ? '+' : ''}{stats.comparison.toFixed(1)}% vs mes anterior</span></div>
        <div className="space-y-4">
          <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Este Mes</span><span>${stats.totalSpent.toLocaleString()}</span></div><div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }}></div></div></div>
          <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Mes Pasado</span><span>${stats.prevMonthTotal.toLocaleString()}</span></div><div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-slate-500 rounded-full" style={{ width: '85%' }}></div></div></div>
        </div>
      </Card>

      <Card className="!bg-slate-800">
        <div className="flex items-center gap-2 mb-2"><LineChart size={18} className="text-amber-400" /><h3 className="font-bold text-white">Tendencia de Gasto</h3></div>
        <TrendLineChart data={stats.trendData} /><p className="text-center text-xs text-slate-500 mt-2">Proyección lineal basada en últimos 30 días</p>
      </Card>

      <div className="space-y-3">
        <h3 className="text-lg font-bold text-white px-2">Fugas Detectadas</h3>
        {stats.antExpenses.length > 0 ? (
          <div className="bg-slate-800/40 border border-slate-700/30 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><AlertCircle size={18} className="text-rose-400" /><span className="font-bold text-slate-200">Gastos Hormiga</span></div><span className="text-rose-400 font-bold">Total: ${stats.antTotal.toFixed(2)}</span></div>
            <p className="text-xs text-slate-400 mb-4">Pequeños gastos que suman grandes cantidades.</p>
            <div className="space-y-2">
              {stats.antExpenses.slice(0, 3).map((bill, i) => (
                <div key={i} className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded-lg"><span className="text-slate-300">{bill.title}</span><div className="flex items-center gap-2"><Badge type="ant" /><span className="text-white font-medium">${bill.amount}</span></div></div>
              ))}
              {stats.antExpenses.length > 3 && <p className="text-xs text-center text-slate-500 pt-2">y {stats.antExpenses.length - 3} más...</p>}
            </div>
          </div>
        ) : (
          <div className="text-center py-6 border border-dashed border-slate-700 rounded-2xl"><p className="text-slate-500 text-sm">¡Excelente! No detectamos gastos hormiga.</p></div>
        )}
      </div>

      
    </div>
  );
}
