import React, { useMemo } from 'react';
import { LineChart, Calendar, PiggyBank, Plus } from 'lucide-react';
import { Card, getSmartCategory } from '../ui.jsx';

export default function HomeScreen({ onAddBill, balance, bills, loading, onEditBill, onLinkBank, isBankLinked, pushEnabled }) {
  const stats = useMemo(() => {
    const totalSpent = bills.reduce((acc, b) => acc + Number(b.amount), 0);
    const upcomingList = bills.filter(b => b.status === "Próxima" || b.status === "Vencida");
    const now = new Date();
    const paidThisMonth = bills.filter(b => {
      if (b.status !== 'Pagada') return false;
      const d = new Date(b.date);
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
    });
    const paidThisMonthTotal = paidThisMonth.reduce((acc, b) => acc + Number(b.amount), 0);
    // previous month paid total
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const paidPrevMonth = bills.filter(b => {
      if (b.status !== 'Pagada') return false;
      const d = new Date(b.date);
      return d.getFullYear() === prevMonthDate.getFullYear() && d.getMonth() === prevMonthDate.getMonth();
    });
    const paidPrevMonthTotal = paidPrevMonth.reduce((acc, b) => acc + Number(b.amount), 0);
    const diffPercent = paidPrevMonthTotal === 0 ? (paidThisMonthTotal === 0 ? 0 : 100) : ((paidThisMonthTotal - paidPrevMonthTotal) / paidPrevMonthTotal) * 100;
    // upcoming for current and next month
    const startOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfNext = new Date(now.getFullYear(), now.getMonth() + 2, 0); // last day of next month
    const upcomingMonth = upcomingList.filter(b => {
      const d = new Date(b.date);
      return d.getTime() >= startOfCurrent.getTime() && d.getTime() <= endOfNext.getTime();
    }).sort((a,b) => new Date(a.date) - new Date(b.date));

    return { totalSpent, upcomingMonth, paidThisMonth, paidThisMonthTotal, paidPrevMonthTotal, diffPercent };
  }, [bills]);

  return (
    <div className="space-y-6 pb-24 animate-fadeIn">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="!bg-slate-800 border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Gastos del Mes</p>
              <h3 className="text-3xl font-bold text-amber-400">${(stats.paidThisMonthTotal ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</h3>
              <p className={`text-xs mt-2 ${stats.diffPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{stats.diffPercent >= 0 ? '+' : ''}{stats.diffPercent.toFixed(1)}% desde el mes pasado</p>
            </div>
            <div className="p-3 bg-amber-400 rounded-xl text-slate-900 shadow-md"><LineChart size={18} /></div>
          </div>
        </Card>
        <Card className="!bg-slate-800 border-slate-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-3">Próximos Vencimientos</p>
              <h3 className="text-3xl font-bold text-amber-400">{(stats.upcomingMonth?.length) || 0}</h3>
              <p className="text-xs text-slate-500 mt-2">Este y siguiente</p>
            </div>
            <div className="p-3 bg-amber-500/20 rounded-xl text-amber-400"><Calendar size={24} /></div>
          </div>
        </Card>
      </div>

      <div>
        <div className="flex justify-between items-center mb-4 px-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Próximos Vencimientos</h2>
        </div>

        {/* Próximos vencimientos list */}
        {(!stats.upcomingMonth || stats.upcomingMonth.length === 0) ? (
          <div className="text-center py-8 text-slate-400 bg-slate-800/30 rounded-2xl border border-slate-700/30">
            <h3 className="font-bold text-slate-100">Estás al día</h3>
            <p className="text-xs mt-1">No hay vencimientos próximos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.upcomingMonth.map((bill) => {
              const smartData = bill.smartCategory || getSmartCategory(bill.title);
              const statusColors = {
                'Vencida': 'bg-red-500/10 text-red-400 border-red-500/20',
                'Próxima': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                'Pagada': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                'Pendiente': 'bg-blue-500/10 text-blue-400 border-blue-500/20'
              };
              const statusText = {
                'Vencida': 'VENCIDA',
                'Próxima': 'PRÓXIMA',
                'Pagada': 'PAGADA',
                'Pendiente': 'PENDIENTE'
              };
              return (
                <Card key={bill.id} className="flex items-center justify-between !p-4 !rounded-2xl hover:bg-slate-800 transition-colors active:scale-[0.98] cursor-pointer border-transparent hover:border-slate-700" onClick={() => onEditBill(bill)}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">{smartData.icon}</div>
                    <div className="flex flex-col">
                      <h3 className="font-bold text-slate-100 text-base">{bill.title}</h3>
                      <p className="text-xs text-slate-500">{smartData.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-white text-lg">${Number(bill.amount).toFixed(2)}</p>
                      <p className="text-xs text-slate-500">Vence: {bill.date}</p>
                      {(() => {
                        try {
                          const today = new Date();
                          const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
                          const due = new Date(bill.date);
                          const d0 = new Date(due.getFullYear(), due.getMonth(), due.getDate()).getTime();
                          const diffDays = Math.ceil((d0 - t0) / (1000 * 60 * 60 * 24));
                          if (diffDays === 0) return <div className="text-xs text-amber-400 font-semibold">Hoy</div>;
                          if (diffDays > 0) return <div className="text-xs text-slate-400">En {diffDays}d</div>;
                          return <div className="text-xs text-red-400">Vencida {Math.abs(diffDays)}d</div>;
                        } catch (e) {
                          return null;
                        }
                      })()}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${statusColors[bill.status] || statusColors['Próxima']}`}>
                      {statusText[bill.status] || bill.status}
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        {/* Gastos del mes (pagados) */}
        <div className="mt-6">
          <h2 className="text-xl font-bold text-white tracking-tight mb-3">Gastos del mes</h2>
          {stats.paidThisMonth && stats.paidThisMonth.length > 0 ? (
            <div className="space-y-3">
              {stats.paidThisMonth.map((bill) => {
                const smartData = bill.smartCategory || getSmartCategory(bill.title);
                return (
                  <Card key={`paid-${bill.id}`} className="flex items-center justify-between !p-4 !rounded-2xl hover:bg-slate-800 transition-colors cursor-default">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-2xl">{smartData.icon}</div>
                      <div className="flex flex-col">
                        <h3 className="font-bold text-slate-100 text-base">{bill.title}</h3>
                        <p className="text-xs text-slate-500">{smartData.name} • {bill.date}</p>
                      </div>
                    </div>
                    <div className="text-right"><p className="font-bold text-white text-lg">-${Number(bill.amount).toFixed(2)}</p></div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 border border-dashed border-slate-700 rounded-2xl bg-slate-800/20"><p className="text-slate-500 text-sm">No registraste pagos este mes</p></div>
          )}
        </div>
      </div>
    </div>
  );
}
