import React, { useState, useEffect, useMemo, useRef } from 'react';
import ImportModal from './components/ImportModal';
import { Card, IconButton, Badge, PushNotification, TrendLineChart, getSmartCategory } from './ui.jsx';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import AnalysisScreen from './screens/AnalysisScreen';
import BudgetsScreen from './screens/BudgetsScreen';
import SettingsScreen from './screens/SettingsScreen';
import { 
  Home, 
  PieChart, 
  Settings, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Bell, 
  X, 
  Check, 
  ChevronRight, 
  Moon,
  Shield,
  LogOut,
  User,
  RefreshCw,
  Sparkles,     
  Copy,         
  Target,       
  AlertTriangle, 
  PiggyBank,    
  Calendar,
  Cloud,        
  Wifi,          
  WifiOff,       
  Landmark,      
  Link as LinkIcon,
  Lock as LockIcon, // <--- AQUÍ ESTABA EL ERROR: Lo renombramos
  BarChart3,    
  LineChart,    
  AlertCircle,  
  BellRing
} from 'lucide-react';

// --- Firebase Imports ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp, 
  enableIndexedDbPersistence
} from 'firebase/firestore';

// --- Firebase Initialization (MODO DEMO) ---
const firebaseConfig = {
  apiKey: "demo-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "12345",
  appId: "1:12345:web:demo"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'manguito-local';

try {
  enableIndexedDbPersistence(db).catch((err) => {
    console.log("Persistencia local no disponible (normal en modo dev)");
  });
} catch (e) {}

// --- Lógica de IA / Autocategorización ---
const SMART_CATEGORIES = [
  { keywords: ['netflix', 'spotify', 'hbo', 'disney', 'cine', 'juego', 'steam', 'playstation'], name: 'Ocio', icon: '🎬', color: '#d97706' }, 
  { keywords: ['uber', 'cabify', 'bus', 'tren', 'metro', 'gasolina', 'peaje', 'taxi'], name: 'Transporte', icon: '🚗', color: '#92400e' }, 
  { keywords: ['comida', 'burger', 'pizza', 'sushi', 'tacos', 'mcdonalds', 'starbucks', 'cafe', 'restaurante'], name: 'Comida', icon: '🍔', color: '#fbbf24' }, 
  { keywords: ['super', 'mercado', 'coto', 'walmart', 'carrefour', 'compra'], name: 'Supermercado', icon: '🛒', color: '#f59e0b' }, 
  { keywords: ['luz', 'agua', 'gas', 'internet', 'wifi', 'alquiler', 'expensas', 'movistar', 'claro'], name: 'Hogar', icon: '🏠', color: '#78350f' }, 
  { keywords: ['farmacia', 'medico', 'salud', 'doctor'], name: 'Salud', icon: '💊', color: '#ef4444' }, 
];

// moved getSmartCategory and SMART_CATEGORIES to src/ui.js

// UI helpers moved to src/ui.js

// screens moved to src/screens/

// --- App Principal ---

export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('home');
  const [showModal, setShowModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false); 
  const [toast, setToast] = useState({ show: false, message: '' });
  const [balance, setBalance] = useState(5000.00); 
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isBankLinked, setIsBankLinked] = useState(false);
  const [modalInitialData, setModalInitialData] = useState(null);
  const [bills, setBills] = useState([]);
  const [goals, setGoals] = useState([]);
  const [budgets, setBudgets] = useState([
    { category: 'Comida', limit: 400 },
    { category: 'Ocio', limit: 200 },
    { category: 'Transporte', limit: 150 },
    { category: 'Supermercado', limit: 600 },
  ]);

  // Push Notifications State
  const [pushEnabled, setPushEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pushEnabled')) ?? false; } catch(e) { return false; }
  });
  const [activePush, setActivePush] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [formData, setFormData] = useState({ title: '', amount: '', date: '' });
  const importModeRef = useRef('merge');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showEditBudgetModal, setShowEditBudgetModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [showAddBudgetModal, setShowAddBudgetModal] = useState(false);
  const [showEditBudgetNameModal, setShowEditBudgetNameModal] = useState(false);

  useEffect(() => {
    const handleOnline = () => { setIsOnline(true); showToast("Conexión restablecida ☁️"); };
    const handleOffline = () => { setIsOnline(false); showToast("Modo Offline activado 📡"); };
    window.addEventListener('online', handleOnline); window.addEventListener('offline', handleOffline);
    return () => { window.removeEventListener('online', handleOnline); window.removeEventListener('offline', handleOffline); };
  }, []);

  useEffect(() => {
    try { localStorage.setItem('pushEnabled', JSON.stringify(pushEnabled)); } catch(e) { /* ignore */ }
  }, [pushEnabled]);

  useEffect(() => {
    // Simular autenticación exitosa para Demo
    setTimeout(() => {
        setUser({ uid: "demo-user", email: "usuario@demo.com" });
    }, 1000);
  }, []);

  // --- Lógica Inteligente de Notificaciones ---

  // --- Settings / Backup & Import Handlers ---
  const handleBackup = () => {
    try {
      const data = { bills, goals, budgets, balance };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `manguito-backup-${new Date().toISOString().slice(0,10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      showToast('Respaldo descargado ✅');
    } catch (e) { showToast('Error al crear respaldo'); }
  };

  const handleTriggerImport = () => {
    setShowImportModal(true);
  };

  const handleImportFileFromComponent = (file, mode = 'merge') => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed) throw new Error('Archivo inválido');
        const m = mode || 'merge';
        if (m === 'replace') {
          const newBills = Array.isArray(parsed.bills) ? parsed.bills.map(b => ({ ...b, id: b.id ?? Math.random().toString(36).slice(2,9) })) : [];
          setBills(newBills.sort((a,b) => new Date(a.date) - new Date(b.date)));
          setGoals(Array.isArray(parsed.goals) ? parsed.goals.map(g => ({ ...g, id: g.id ?? Math.random().toString(36).slice(2,9) })) : []);
          setBudgets(Array.isArray(parsed.budgets) ? parsed.budgets : []);
          if (typeof parsed.balance === 'number') setBalance(parsed.balance);
          showToast('Importación completada: datos reemplazados ✅');
        } else {
          if (Array.isArray(parsed.bills)) {
            setBills((prev) => {
              const existingById = Object.fromEntries(prev.map(b => [b.id, b]));
              parsed.bills.forEach(nb => { if (!nb.id) nb.id = Math.random().toString(36).slice(2,9); existingById[nb.id] = { ...existingById[nb.id], ...nb }; });
              return Object.values(existingById).sort((a,b) => new Date(a.date) - new Date(b.date));
            });
          }
          if (Array.isArray(parsed.goals)) setGoals((prev) => {
            const existing = Object.fromEntries(prev.map(g => [g.id, g]));
            parsed.goals.forEach(g => { if (!g.id) g.id = Math.random().toString(36).slice(2,9); existing[g.id] = { ...existing[g.id], ...g }; });
            return Object.values(existing);
          });
          if (Array.isArray(parsed.budgets)) setBudgets(parsed.budgets);
          if (typeof parsed.balance === 'number') setBalance(parsed.balance);
          showToast('Importación finalizada. Datos fusionados ✅');
        }
      } catch (err) {
        console.error(err);
        showToast('Error al leer el archivo de importación');
      }
    };
    reader.readAsText(file);
  };

  const handleDeleteAllData = () => {
    if (!confirm('¿Eliminar todos los datos de Manguito? Esta acción no se puede deshacer.')) return;
    setBills([]); setGoals([]); setBudgets([]); setBalance(0);
    showToast('Datos eliminados 🗑️');
  };

  const handleEditBudgetLimit = (budget) => {
    setEditingBudget({ ...budget });
    setShowEditBudgetModal(true);
  };

  const handleSaveBudgetLimit = (newLimit) => {
    if (!editingBudget || !newLimit || newLimit <= 0) {
      showToast('Límite inválido');
      return;
    }
    setBudgets(budgets.map(b => b.category === editingBudget.category ? { ...b, limit: Number(newLimit) } : b));
    setShowEditBudgetModal(false);
    setEditingBudget(null);
    showToast('Límite actualizado ✅');
  };

  const handleAddBudgetCategory = (categoryName, limit) => {
    if (!categoryName || !limit || limit <= 0) {
      showToast('Datos inválidos');
      return;
    }
    // Verificar si la categoría ya existe
    if (budgets.some(b => b.category.toLowerCase() === categoryName.toLowerCase())) {
      showToast('Esta categoría ya existe');
      return;
    }
    setBudgets([...budgets, { category: categoryName, limit: Number(limit) }]);
    setShowAddBudgetModal(false);
    showToast(`Presupuesto "${categoryName}" agregado ✅`);
  };

  const handleEditBudgetName = (budget) => {
    setEditingBudget(budget);
    setShowEditBudgetNameModal(true);
  };

  const handleSaveEditBudgetName = (newName) => {
    if (!editingBudget || !newName || newName.trim() === '') {
      showToast('Nombre inválido');
      return;
    }
    // Verificar que no exista otra categoría con ese nombre
    if (budgets.some(b => b.category.toLowerCase() === newName.toLowerCase() && b.category !== editingBudget.category)) {
      showToast('Esta categoría ya existe');
      return;
    }
    setBudgets(budgets.map(b => b.category === editingBudget.category ? { ...b, category: newName } : b));
    setShowEditBudgetNameModal(false);
    setEditingBudget(null);
    showToast(`Presupuesto renombrado a "${newName}" ✅`);
  };

  const handleDeleteBudget = (categoryName) => {
    if (!confirm(`¿Eliminar el presupuesto de "${categoryName}"? Los gastos se conservarán.`)) return;
    setBudgets(budgets.filter(b => b.category !== categoryName));
    showToast(`Presupuesto "${categoryName}" eliminado 🗑️`);
  };
  useEffect(() => {
    if (!user || !pushEnabled || bills.length === 0) return;

    // Simular un trigger aleatorio o basado en lógica real después de un tiempo
    const timeout = setTimeout(() => {
      // 1. Check de vencimientos próximos
      const dueSoon = bills.filter(b => b.status === "Próxima").length;
      if (dueSoon > 2 && Math.random() > 0.5) {
        triggerPush({
          title: "Vencimientos Pendientes",
          message: `Tienes ${dueSoon} facturas que vencen pronto. Revisa tu flujo de caja.`,
          icon: Calendar
        });
        return;
      }

      // 2. Check de Presupuesto (Simulado con Comida)
      const foodSpent = bills.filter(b => b.category === "Comida").reduce((acc, b) => acc + b.amount, 0);
      if (foodSpent > 300) { // Supongamos límite de 400
        triggerPush({
          title: "Alerta de Presupuesto 🍔",
          message: "Has consumido el 75% de tu presupuesto de Comida. ¡Cuidado el fin de semana!",
          icon: AlertTriangle
        });
      }

    }, 5000); // 5 segundos después de cargar para demo

    return () => clearTimeout(timeout);
  }, [user, pushEnabled, bills]);

  const triggerPush = (notification) => {
    setActivePush(notification);
    // Auto ocultar después de 6s
    setTimeout(() => setActivePush(null), 6000);
  };

  const handleTogglePush = () => {
    const newState = !pushEnabled;
    setPushEnabled(newState);
    if (newState) {
      showToast("Notificaciones inteligentes activadas 🔔");
      // Demo immediate push
      setTimeout(() => triggerPush({
        title: "Manguito Configurado",
        message: "Te avisaremos cuando detectemos gastos inusuales o vencimientos.",
        icon: BellRing
      }), 1500);
    } else {
      showToast("Notificaciones desactivadas");
    }
  };

  useEffect(() => {
    if (!user) { setBills([]); setGoals([]); return; }
    
    // MODO DEMO: No conectamos a Firestore real para evitar crash sin credenciales
    // Usamos datos locales simulados
    const demoBills = [
        { id: 1, title: 'Netflix', amount: 15.99, date: '2023-10-05', smartCategory: { name: 'Ocio', icon: '🎬', color: '#d97706' }, category: 'Ocio', status: 'Pagada' },
        { id: 2, title: 'Supermercado Coto', amount: 120.50, date: '2023-10-12', smartCategory: { name: 'Supermercado', icon: '🛒', color: '#f59e0b' }, category: 'Supermercado', status: 'Pagada' }
    ];
    setBills(demoBills);

  }, [user]);

  const showToast = (msg) => { setToast({ show: true, message: msg }); setTimeout(() => setToast({ show: false, message: '' }), 3000); };
  const handleLogin = async () => { 
      // Login simulado
      setUser({ uid: "demo-user", email: "usuario@demo.com" });
  };
  const handleLogout = async () => { setUser(null); showToast("Sesión cerrada correctamente"); };
  const handleEditBill = (bill) => { 
    setSelectedBill(bill);
    setFormData({ title: bill.title, amount: bill.amount.toString(), date: bill.date }); 
    setShowModal(true); 
    showToast("Editando movimiento"); 
  };
  const handleMarkAsPaid = (bill) => {
    setBills(prev => prev.map(b => 
      b.id === bill.id ? { ...b, status: 'Pagada' } : b
    ));
    setSelectedBill(null);
    setShowModal(false);
    showToast("Marcado como pagado ✓");
  };
  const handleDeleteBill = (billId) => {
    setBills(prev => prev.filter(b => b.id !== billId));
    setShowModal(false);
    setModalInitialData(null);
    setSelectedBill(null);
    showToast("Movimiento eliminado ✓");
  };
  const handleLinkBank = async () => {
    setShowBankModal(false); showToast("Conectando con el banco...");
    setTimeout(async () => {
      if (!user) return;
      const mockTransactions = [
        { title: "Starbucks", amount: 12.50, date: new Date().toISOString().split('T')[0], source: 'bank' },
        { title: "Spotify Premium", amount: 9.99, date: new Date().toISOString().split('T')[0], source: 'bank' },
        { title: "Sueldo", amount: -2500, date: new Date().toISOString().split('T')[0], source: 'bank' }
      ];
      // Simulación de agregar al estado local
      const newBills = mockTransactions.map((t, i) => ({
          id: `bank-${i}`,
          title: t.title,
          amount: t.title === "Sueldo" ? 0 : t.amount,
          date: t.date,
          smartCategory: getSmartCategory(t.title),
          category: getSmartCategory(t.title).name,
          status: "Pagada",
          source: 'bank'
      }));
      setBills(prev => [...prev, ...newBills]);
      setIsBankLinked(true); showToast("¡Banco vinculado! 3 movimientos importados.");
    }, 2000);
  };
  const handleAddBill = async (e) => {
    e.preventDefault(); 
    showToast('Guardando...');

    const title = formData.title;
    const amount = parseFloat(formData.amount);
    const date = formData.date;

    if (!title || isNaN(amount) || !date) {
      showToast('Completa todos los campos correctamente');
      return;
    }

    const smartCategory = getSmartCategory(title);
    
    if (selectedBill) {
      // Actualizar movimiento existente
      setBills(prev => prev.map(b => 
        b.id === selectedBill.id 
          ? { ...b, title, amount, date, smartCategory, category: smartCategory.name }
          : b
      ));
      setShowModal(false); setModalInitialData(null); setSelectedBill(null); setFormData({ title: '', amount: '', date: '' }); showToast(`Movimiento actualizado ✓`);
    } else {
      // Crear nuevo movimiento
      const todayStr = new Date().toISOString().split('T')[0];
      const status = date === todayStr ? 'Pagada' : 'Próxima';
      const newBill = { id: Date.now(), title, amount, date, smartCategory, category: smartCategory.name, status };
      setBills(prev => [newBill, ...prev]);
      setShowModal(false); setModalInitialData(null); setFormData({ title: '', amount: '', date: '' });
      showToast(status === 'Pagada' ? `Registrado y marcado como pagado ✓` : `Categorizado como: ${smartCategory.name}`);
    }
  };
  const handleAddGoal = async (e) => {
    e.preventDefault(); if (!user) return; const form = e.target;
    const title = form.elements[0].value; const target = parseFloat(form.elements[1].value); const current = parseFloat(form.elements[2].value);
    const newGoal = { id: Date.now(), title, target, current };
    
    setGoals(prev => [newGoal, ...prev]);
    setShowGoalModal(false); showToast("Meta creada con éxito 🐷");
  };
  const openNewBillModal = () => { 
    setModalInitialData(null); 
    setSelectedBill(null); 
    setFormData({ title: '', amount: '', date: new Date().toISOString().split('T')[0] }); 
    setShowModal(true); 
  };

  const renderScreen = () => {
    switch(activeTab) {
      case 'home': return <HomeScreen onAddBill={openNewBillModal} balance={balance} bills={bills} loading={!isOnline} onEditBill={handleEditBill} onLinkBank={() => setShowBankModal(true)} isBankLinked={isBankLinked} pushEnabled={pushEnabled} />;
      case 'analysis': return <AnalysisScreen bills={bills} />;
      case 'budgets': return <BudgetsScreen bills={bills} goals={goals} budgets={budgets} onAddGoal={() => setShowGoalModal(true)} onEditBudgetLimit={handleEditBudgetLimit} onAddBudget={() => setShowAddBudgetModal(true)} onEditBudgetName={handleEditBudgetName} onDeleteBudget={handleDeleteBudget} />;
      case 'settings': return <SettingsScreen showToast={showToast} onLogout={handleLogout} isBankLinked={isBankLinked} pushEnabled={pushEnabled} onTogglePush={handleTogglePush} onBackup={handleBackup} onTriggerImport={handleTriggerImport} onDeleteAll={handleDeleteAllData} />;
      default: return <HomeScreen />;
    }
  };

  if (!user) return <LoginScreen onLogin={handleLogin} />;

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans selection:bg-amber-500/30 relative overflow-hidden">
      
      {/* Push Notification Overlay */}
      <PushNotification 
        show={!!activePush} 
        title={activePush?.title} 
        message={activePush?.message} 
        icon={activePush?.icon || BellRing} 
        onClose={() => setActivePush(null)} 
      />

      <header className="sticky top-0 z-40 bg-[#0f172a]/80 backdrop-blur-xl border-b border-slate-800/60 px-6 py-4 flex justify-between items-center transition-all">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-slate-900 font-black shadow-lg shadow-amber-500/20 transform hover:scale-105 transition-transform">M</div><span className="font-bold text-2xl tracking-tighter text-white">Manguito<span className="text-amber-400">.</span></span></div>
        <div className="flex items-center gap-3">
           <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-xs font-bold transition-all ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>{isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}<span className="hidden sm:inline">{isOnline ? 'ONLINE' : 'OFFLINE'}</span></div>
           <button className="relative p-2.5 bg-slate-800/50 rounded-xl text-slate-400 hover:text-white transition-colors border border-slate-700/50">
             <Bell size={20} />
             {pushEnabled && <span className="absolute top-2 right-2.5 w-2 h-2 bg-amber-500 rounded-full border border-slate-900 animate-pulse"></span>}
           </button>
        </div>
      </header>
      <main className="p-4 pt-6 max-w-md mx-auto w-full md:max-w-2xl lg:max-w-4xl">{renderScreen()}</main>
      
      {activeTab === 'home' && (<button onClick={openNewBillModal} className="fixed bottom-28 right-6 w-16 h-16 bg-gradient-to-tr from-amber-400 to-yellow-500 rounded-[20px] shadow-2xl shadow-amber-500/40 flex items-center justify-center text-slate-900 z-40 transition-all active:scale-90 hover:scale-105 hover:-translate-y-1 group"><Plus size={32} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" /></button>)}

      <nav className="fixed bottom-0 left-0 right-0 bg-[#0f172a]/95 backdrop-blur-xl border-t border-slate-800 pb-safe pt-2 px-6 z-50">
        <div className="flex justify-between items-center max-w-md mx-auto h-[72px]">
          <IconButton icon={Home} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <IconButton icon={BarChart3} active={activeTab === 'analysis'} onClick={() => setActiveTab('analysis')} />
          <IconButton icon={Target} active={activeTab === 'budgets'} onClick={() => setActiveTab('budgets')} />
          <IconButton icon={Settings} active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </div>
      </nav>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-white tracking-tight">{selectedBill ? 'Editar Movimiento' : 'Nuevo Movimiento'}</h3><button onClick={() => { setShowModal(false); setSelectedBill(null); setFormData({ title: '', amount: '', date: '' }); }} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
            <form onSubmit={handleAddBill} className="space-y-5">
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Concepto</label><input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="Ej. Netflix, Uber..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" required autoFocus /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Monto</label><div className="relative"><span className="absolute left-4 top-4 text-slate-500">$</span><input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} step="0.01" placeholder="0.00" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-8 pr-4 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono" required /></div></div>
                <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Fecha</label><input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all text-sm" required /></div>
              </div>
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"><Sparkles size={16} className="text-amber-400" /><p className="text-xs text-slate-400">{selectedBill ? 'Actualiza los datos del movimiento.' : 'La categoría se asignará automáticamente.'}</p></div>
              <button type="submit" className="w-full py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:bg-amber-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"><Check size={20} />{selectedBill ? 'Guardar Cambios' : 'Guardar Movimiento'}</button>
              {selectedBill && (
                <div className="flex gap-2 mt-3">
                  {selectedBill.status !== 'Pagada' && (
                    <button type="button" onClick={() => handleMarkAsPaid(selectedBill)} className="flex-1 py-3 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl hover:bg-emerald-500/30 transition-all border border-emerald-500/30 text-sm">
                      Marcar Pagado
                    </button>
                  )}
                  <button type="button" onClick={() => handleDeleteBill(selectedBill.id)} className="flex-1 py-3 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-all border border-red-500/30 text-sm">
                    Eliminar
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            <div className="text-center mb-6"><div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 mx-auto mb-4"><Landmark size={32} /></div><h3 className="text-2xl font-bold text-white tracking-tight">Conectar Banco</h3><p className="text-slate-400 text-sm mt-1">Selecciona tu entidad para importar movimientos</p></div>
            <div className="space-y-3 mb-6">
              <button onClick={handleLinkBank} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between group transition-all"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-red-600 flex items-center justify-center text-white font-bold text-xs">S</div><span className="font-semibold text-slate-200">Santander</span></div><LinkIcon size={16} className="text-slate-500 group-hover:text-white" /></button>
              <button onClick={handleLinkBank} className="w-full p-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl flex items-center justify-between group transition-all"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">B</div><span className="font-semibold text-slate-200">BBVA</span></div><LinkIcon size={16} className="text-slate-500 group-hover:text-white" /></button>
            </div>
            <button onClick={() => setShowBankModal(false)} className="w-full py-3 text-slate-400 font-medium text-sm hover:text-white transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      {showGoalModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-white tracking-tight">Nueva Meta</h3><button onClick={() => setShowGoalModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
            <form onSubmit={handleAddGoal} className="space-y-5">
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Nombre de la Meta</label><input type="text" placeholder="Ej. Viaje a Japón" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" required autoFocus /></div>
              <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Objetivo ($)</label><input type="number" placeholder="2000" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono" required /></div><div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Ahorro Inicial</label><input type="number" defaultValue="0" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-4 py-4 text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all font-mono" required /></div></div>
              <button type="submit" className="w-full py-4 bg-emerald-500 text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:bg-emerald-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"><PiggyBank size={20} /> Crear Meta</button>
            </form>
          </div>
        </div>
      )}

      <ImportModal open={showImportModal} onClose={() => setShowImportModal(false)} onFileChosen={handleImportFileFromComponent} />

      {showAddBudgetModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-white tracking-tight">Nuevo Presupuesto</h3><button onClick={() => setShowAddBudgetModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleAddBudgetCategory(e.target.category.value, e.target.limit.value); }} className="space-y-5">
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Categoría</label><input type="text" name="category" placeholder="Ej. Fútbol, Gym, Ropa..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all" required autoFocus /></div>
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Límite Mensual ($)</label><div className="relative"><span className="absolute left-4 top-4 text-slate-500">$</span><input type="number" name="limit" step="1" min="1" placeholder="150" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-8 pr-4 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-lg" required /></div></div>
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"><AlertTriangle size={16} className="text-amber-400" /><p className="text-xs text-slate-400">Define el máximo que deseas gastar en esta categoría cada mes.</p></div>
              <button type="submit" className="w-full py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:bg-amber-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"><Plus size={20} />Agregar Presupuesto</button>
            </form>
          </div>
        </div>
      )}

      {showEditBudgetNameModal && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-white tracking-tight">Editar Presupuesto</h3><button onClick={() => setShowEditBudgetNameModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveEditBudgetName(e.target.newName.value); }} className="space-y-5">
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Nombre de la Categoría</label><input type="text" name="newName" defaultValue={editingBudget.category} placeholder="Ej. Fútbol..." className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all" required autoFocus /></div>
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"><AlertTriangle size={16} className="text-blue-400" /><p className="text-xs text-slate-400">Cambia el nombre de esta categoría de presupuesto.</p></div>
              <button type="submit" className="w-full py-4 bg-blue-500 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 hover:bg-blue-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"><Check size={20} />Guardar Nombre</button>
            </form>
          </div>
        </div>
      )}

      {showEditBudgetModal && editingBudget && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1e293b] w-full max-w-sm rounded-[2rem] border border-slate-700/50 p-6 shadow-2xl animate-slideUp ring-1 ring-white/10">
            <div className="flex justify-between items-center mb-8"><h3 className="text-2xl font-bold text-white tracking-tight">Ajustar Límite</h3><button onClick={() => setShowEditBudgetModal(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20} /></button></div>
            <form onSubmit={(e) => { e.preventDefault(); handleSaveBudgetLimit(e.target.limit.value); }} className="space-y-5">
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Categoría</label><div className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium">{editingBudget.category}</div></div>
              <div className="space-y-2"><label className="text-xs text-slate-400 font-bold ml-1 uppercase tracking-wider">Límite Mensual ($)</label><div className="relative"><span className="absolute left-4 top-4 text-slate-500">$</span><input type="number" name="limit" defaultValue={editingBudget.limit} step="1" min="1" placeholder="300" className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl pl-8 pr-4 py-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all font-mono text-lg" required autoFocus /></div></div>
              <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl border border-slate-700/30"><AlertTriangle size={16} className="text-amber-400" /><p className="text-xs text-slate-400">Define el máximo que deseas gastar en esta categoría cada mes.</p></div>
              <button type="submit" className="w-full py-4 bg-amber-500 text-slate-900 font-bold text-lg rounded-2xl shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 hover:bg-amber-400 transition-all active:scale-[0.98] mt-4 flex items-center justify-center gap-2"><Check size={20} />Guardar Límite</button>
            </form>
          </div>
        </div>
      )}

      <div className={`fixed top-24 left-1/2 transform -translate-x-1/2 bg-slate-800/90 backdrop-blur-md border border-slate-700 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 transition-all duration-300 z-[60] ${toast.show ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-4 opacity-0 scale-95 pointer-events-none'}`}><div className="bg-emerald-500 rounded-full p-1 text-slate-900"><Check size={14} strokeWidth={3} /></div><span className="font-medium text-sm">{toast.message}</span></div>
      <style>{`@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } } @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } } .animate-fadeIn { animation: fadeIn 0.4s ease-out; } .animate-slideUp { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); } .pb-safe { padding-bottom: env(safe-area-inset-bottom); } .animate-spin-slow { animation: spin 3s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}