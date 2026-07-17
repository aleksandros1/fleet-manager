'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// --- Το Ψηφιακό Λογότυπο (SVG Component) ---
const AutoLazaridisLogo = ({ className = "h-10 w-auto" }) => (
  <svg viewBox="0 0 400 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 65 Q 120 65 180 25 T 320 50 Q 350 60 380 65" stroke="url(#silverGrad)" strokeWidth="4" strokeLinecap="round"/>
    <path d="M30 65 L 50 55 L 55 65 Z" fill="#D90000" />
    <path d="M360 60 L 390 65 L 375 55 Z" fill="#D90000" />
    <text x="200" y="75" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="900" fill="#D90000" textAnchor="middle" letterSpacing="4">AUTO</text>
    <text x="200" y="110" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="url(#silverGrad)" textAnchor="middle" letterSpacing="10">ΛΑΖΑΡΙΔΗΣ</text>
    <defs>
      <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#9CA3AF" />
        <stop offset="50%" stopColor="#FFFFFF" />
        <stop offset="100%" stopColor="#9CA3AF" />
      </linearGradient>
    </defs>
  </svg>
);

const CATEGORY_STOCK_PHOTOS: Record<string, string> = {
  'Compact / Hatchback': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'Sedan': 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80',           
  'SUV / 4x4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',       
  'Premium': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'         
};

type Vehicle = {
  id: number;
  plate: string;
  brand: string;
  model: string;
  cc: string;
  hp: string;
  transmission: string;
  price: number;
  is_active: boolean; 
  agency_name: string;
  category: string;
  photos: string[]; 
};

type Booking = {
  id: number;
  vehicle_model: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  created_at: string;
};

type VehicleLog = {
  id: number;
  vehicle_id: number;
  log_type: string;
  description: string;
  cost: number;
  status: string;
  created_at: string;
  vehicles?: { model: string; plate: string };
};

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active' | 'draft' | 'bookings' | 'logs'>('dashboard'); 
  
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [logs, setLogs] = useState<VehicleLog[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    async function initializeData() {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchBookings(), fetchLogs()]);
      setLoading(false); 
    }
    initializeData();
  }, []);

  async function fetchVehicles() {
    const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false });
    if (data) setVehicles(data);
  }

  async function fetchBookings() {
    const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false });
    if (data) setBookings(data);
  }

  async function fetchLogs() {
    const { data } = await supabase.from('vehicle_logs').select('*, vehicles(model, plate)').order('created_at', { ascending: false });
    if (data) setLogs(data as VehicleLog[]);
  }

  const advanceBookingStatus = async (id: number, currentStatus: string) => {
    let nextStatus = '';
    if (currentStatus === 'Νέα Κράτηση') nextStatus = 'Έγκριση (Αναμονή Κεφαλαίου)';
    else if (currentStatus === 'Έγκριση (Αναμονή Κεφαλαίου)') nextStatus = 'Escrow (Δεσμευμένο Κεφάλαιο)';
    else if (currentStatus === 'Escrow (Δεσμευμένο Κεφάλαιο)') nextStatus = 'Ολοκληρώθηκε (Πληρωμή Μάντρας)';
    else return;

    const { error } = await supabase.from('bookings').update({ status: nextStatus }).eq('id', id);
    if (!error) setBookings(bookings.map(b => b.id === id ? { ...b, status: nextStatus } : b));
  };

  const getActionButton = (booking: Booking) => {
    switch(booking.status) {
      case 'Νέα Κράτηση': return <button onClick={() => advanceBookingStatus(booking.id, booking.status)} className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors">ΕΛΕΓΧΟΣ & ΕΓΚΡΙΣΗ</button>;
      case 'Έγκριση (Αναμονή Κεφαλαίου)': return <button onClick={() => advanceBookingStatus(booking.id, booking.status)} className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors">ΔΕΣΜΕΥΣΗ ΠΟΣΟΥ</button>;
      case 'Escrow (Δεσμευμένο Κεφάλαιο)': return <button onClick={() => advanceBookingStatus(booking.id, booking.status)} className="px-4 py-2 bg-[#D90000] hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.4)]">ΛΗΞΗ & ΠΛΗΡΩΜΗ</button>;
      case 'Ολοκληρώθηκε (Πληρωμή Μάντρας)': return <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">ΕΞΟΦΛΗΘΗΚΕ</span>;
      default: return null;
    }
  };

  // --- Φόρμα Οχημάτων: Υπερ-βελτιστοποιημένη, Χωρίς Upload Φωτογραφίας, Χωρίς Υποχρεωτική Πινακίδα ---
  const [newVehicle, setNewVehicle] = useState({ plate: '', brand: '', model: '', cc: '', hp: '', transmission: 'Χειροκίνητο', category: 'Compact / Hatchback', price: '' });

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.brand || !newVehicle.model) return;
    setIsUploading(true);
    
    // Αυτόματη ανάθεση φωτογραφίας βάσει κατηγορίας
    const assignedPhoto = CATEGORY_STOCK_PHOTOS[newVehicle.category] || CATEGORY_STOCK_PHOTOS['Compact / Hatchback'];

    const { data, error } = await supabase.from('vehicles').insert([{
        plate: newVehicle.plate ? newVehicle.plate.toUpperCase() : 'ΕΚΚΡΕΜΕΙ', 
        brand: newVehicle.brand,
        model: newVehicle.model, 
        cc: newVehicle.cc, 
        hp: newVehicle.hp, 
        transmission: newVehicle.transmission,
        category: newVehicle.category,
        price: Number(newVehicle.price), 
        is_active: false, 
        agency_name: 'AUTO ΛΑΖΑΡΙΔΗΣ', 
        photos: [assignedPhoto] // Αποθηκεύεται ακαριαία, μηδενικό bandwidth
      }]).select();

    if (!error && data) {
      setVehicles([data[0], ...vehicles]);
      setNewVehicle({ plate: '', brand: '', model: '', cc: '', hp: '', transmission: 'Χειροκίνητο', category: 'Compact / Hatchback', price: '' });
      setIsUploadModalOpen(false);
      setActiveTab('draft');
    } else if (error) {
      alert(`Σφάλμα: ${error.message}`);
    }
    setIsUploading(false);
  };

  const toggleStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('vehicles').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) setVehicles(vehicles.map(v => v.id === id ? { ...v, is_active: !currentStatus } : v));
  };

  const deleteVehicle = async (id: number) => {
    if (!window.confirm('Αμετάκλητη διαγραφή οχήματος. Είστε σίγουροι;')) return;
    const { error } = await supabase.from('vehicles').delete().eq('id', id);
    if (!error) setVehicles(vehicles.filter(v => v.id !== id));
  };

  // --- Μηχανισμοί Μητρώου (Logs) ---
  const [newLog, setNewLog] = useState({ vehicle_id: '', log_type: 'Ζημιά', description: '', cost: '0' });

  const handleAddLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLog.vehicle_id || !newLog.description) return;
    setIsUploading(true);
    const { data, error } = await supabase.from('vehicle_logs').insert([{
      vehicle_id: Number(newLog.vehicle_id), log_type: newLog.log_type, description: newLog.description, cost: Number(newLog.cost)
    }]).select('*, vehicles(model, plate)');

    if (!error && data) {
      setLogs([data[0] as VehicleLog, ...logs]);
      setNewLog({ vehicle_id: '', log_type: 'Ζημιά', description: '', cost: '0' });
      setIsLogModalOpen(false);
    }
    setIsUploading(false);
  };

  const resolveLog = async (id: number) => {
    const { error } = await supabase.from('vehicle_logs').update({ status: 'Ολοκληρώθηκε' }).eq('id', id);
    if (!error) setLogs(logs.map(l => l.id === id ? { ...l, status: 'Ολοκληρώθηκε' } : l));
  };

  // --- UI & Stats ---
  const activeCount = vehicles.filter(v => v.is_active).length;
  const draftCount = vehicles.filter(v => !v.is_active).length;
  const totalEscrow = bookings.filter(b => b.status === 'Escrow (Δεσμευμένο Κεφάλαιο)').reduce((a, c) => a + c.total_price, 0);
  const totalRevenue = bookings.filter(b => b.status === 'Ολοκληρώθηκε (Πληρωμή Μάντρας)').reduce((a, c) => a + c.total_price, 0);
  const totalMaintenance = logs.reduce((a, c) => a + Number(c.cost), 0);

  const getStatusStyle = (status: string) => {
    switch(status) {
      case 'Νέα Κράτηση': case 'Εκκρεμεί': return 'bg-orange-500/10 text-orange-500 border-orange-500/30';
      case 'Έγκριση (Αναμονή Κεφαλαίου)': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'Escrow (Δεσμευμένο Κεφάλαιο)': case 'Ζημιά': return 'bg-[#D90000]/10 text-red-500 border-red-600/30 shadow-[0_0_15px_rgba(220,38,38,0.1)]';
      case 'Ολοκληρώθηκε (Πληρωμή Μάντρας)': case 'Ολοκληρώθηκε': return 'bg-green-500/10 text-green-500 border-green-500/30';
      case 'Συντήρηση': return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'Έγγραφα': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
    }
  };

  const renderVehicleGrid = (isActiveFilter: boolean) => {
    const filtered = vehicles.filter(v => v.is_active === isActiveFilter);
    if (filtered.length === 0) return <div className="text-gray-500 text-sm py-10 uppercase tracking-widest">Αδειο Μητρωο.</div>;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filtered.map((v) => (
          <div key={v.id} className="group bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all flex flex-col shadow-2xl relative">
            <div className="absolute top-3 right-3 z-10 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-1 rounded text-[10px] font-bold text-gray-300 tracking-wider shadow-lg">{v.plate}</div>
            <div className="absolute top-3 left-3 z-10 bg-[#D90000]/20 border border-red-600/30 px-2 py-1 rounded text-[9px] font-bold text-red-500 tracking-wider uppercase shadow-lg">{v.category}</div>
            
            <div className="h-44 bg-[#050505] relative border-b border-white/5 flex items-center justify-center overflow-hidden">
               {v.photos && v.photos.length > 0 ? (
                 /* eslint-disable-next-line @next/next/no-img-element */
                 <img src={v.photos[0]} alt={v.model} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700" />
               ) : <svg className="w-16 h-16 text-white/5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
            </div>
            <div className="p-5 flex-1 flex flex-col bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{v.brand}</div>
                  <h3 className="text-lg font-bold text-white tracking-tight leading-tight">{v.model}</h3>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.hp} HP</span>
                    <span className="text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.cc} CC</span>
                    <span className="text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.transmission}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-xl font-bold text-white">€{v.price}<span className="text-[9px] text-gray-500 ml-1">/ΗΜ</span></div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={v.is_active} onChange={() => toggleStatus(v.id, v.is_active)} />
                      <div className={`block w-10 h-6 rounded-full transition-colors ${v.is_active ? 'bg-red-600' : 'bg-gray-800'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${v.is_active ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                  <button onClick={() => deleteVehicle(v.id)} className="text-gray-500 hover:text-red-500 transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-red-600/30 flex">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-[#0A0A0A]/80 backdrop-blur-2xl border-r border-white/5 flex flex-col fixed h-full z-40 shadow-2xl">
        <div className="p-6 border-b border-white/5 flex justify-center"><AutoLazaridisLogo className="h-10 w-auto" /></div>
        <div className="p-6 flex-1 space-y-2">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Διαχειριση</div>
          
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Επισκοπηση</button>
          
          <button onClick={() => setActiveTab('active')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <span>Ενεργος Στολος</span>
            <span className="bg-black/50 border border-white/10 text-gray-300 px-2 py-0.5 rounded text-[9px]">{activeCount}</span>
          </button>
          
          <button onClick={() => setActiveTab('draft')} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'draft' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <span>Σε Αναμονη</span>
            {draftCount > 0 && <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[9px]">{draftCount}</span>}
          </button>
          
          <button onClick={() => { setActiveTab('bookings'); fetchBookings(); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'bookings' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Συμβολαια & Escrow</button>
          
          <button onClick={() => { setActiveTab('logs'); fetchLogs(); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'logs' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <span>Μητρωο & Ζημιες</span>
            {logs.filter(l => l.status === 'Εκκρεμεί').length > 0 && <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[9px] shadow-[0_0_10px_rgba(220,38,38,0.5)]">{logs.filter(l => l.status === 'Εκκρεμεί').length}</span>}
          </button>
        </div>
        <div className="p-6 border-t border-white/5">
           <button onClick={() => setIsUploadModalOpen(true)} className="w-full py-3 bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all shadow-lg">+ Νεο Οχημα</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="ml-64 flex-1 p-10 relative">
        <div className="flex justify-between items-center mb-10 pb-4 border-b border-white/5">
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">
            {activeTab === 'dashboard' && 'Επισκοπηση Επιχειρησης'}
            {activeTab === 'active' && 'Διαχειριση Ενεργου Στολου'}
            {activeTab === 'draft' && 'Οχηματα Εκτος Λειτουργιας'}
            {activeTab === 'bookings' && 'Ροη Κεφαλαιων & Συμβολαια'}
            {activeTab === 'logs' && 'Μητρωο Συντηρησης & Ζημιων'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner"><span className="text-xs font-bold text-gray-400">AL</span></div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-600 uppercase tracking-widest text-sm font-bold animate-pulse">Ανάκτηση δεδομένων...</div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Κάρτα 1 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-36 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ενεργος Στολος</span>
                    <div className="text-5xl font-bold text-white tracking-tighter">{activeCount} <span className="text-sm text-gray-600 font-medium tracking-normal">/ {vehicles.length}</span></div>
                  </div>
                  {/* Κάρτα 2 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-36 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest relative z-10">Καθαρα Εσοδα (Ολοκληρωμενα)</span>
                    <div className="text-4xl font-bold text-white relative z-10 tracking-tighter">€{totalRevenue.toLocaleString('el-GR')}</div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
                  </div>
                  {/* Κάρτα 3 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-36 shadow-2xl relative overflow-hidden group hover:border-yellow-500/30 transition-all">
                    <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest relative z-10">Σε Escrow (Δεσμευμενα)</span>
                    <div className="text-4xl font-bold text-white relative z-10 tracking-tighter">€{totalEscrow.toLocaleString('el-GR')}</div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-yellow-500/5 to-transparent"></div>
                  </div>
                  {/* Κάρτα 4 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 rounded-3xl border border-white/10 flex flex-col justify-between h-36 shadow-2xl relative overflow-hidden group hover:border-red-600/30 transition-all">
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest relative z-10">Κοστος Ζημιων / Συντηρησης</span>
                    <div className="text-4xl font-bold text-white relative z-10 tracking-tighter">€{totalMaintenance.toLocaleString('el-GR')}</div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#D90000]/10 to-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'active' && renderVehicleGrid(true)}
            {activeTab === 'draft' && renderVehicleGrid(false)}

            {activeTab === 'bookings' && (
              <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-black/50">
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Συμβολαιο</th>
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Οχημα</th>
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ημερομηνιες</th>
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ταμειο</th>
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Κατασταση</th>
                      <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Ενεργεια</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map(b => (
                      <tr key={b.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                        <td className="p-6"><div className="text-sm font-bold text-white tracking-wider">#{String(b.id).padStart(4, '0')}</div></td>
                        <td className="p-6 text-sm font-bold text-gray-200">{b.vehicle_model}</td>
                        <td className="p-6"><div className="text-[11px] font-bold text-gray-400 bg-black px-3 py-2 rounded-lg border border-white/10 inline-flex shadow-inner">{b.check_in} → {b.check_out}</div></td>
                        <td className="p-6"><div className="text-lg font-bold text-white tracking-tight">€{b.total_price}</div></td>
                        <td className="p-6"><span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-lg shadow-sm ${getStatusStyle(b.status)}`}>{b.status}</span></td>
                        <td className="p-6 text-right">{getActionButton(b)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'logs' && (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <button onClick={() => setIsLogModalOpen(true)} className="px-6 py-3 bg-[#D90000] hover:bg-red-600 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl shadow-[0_0_20px_rgba(220,38,38,0.3)] transition-all">
                    + ΝΕΑ ΑΝΑΦΟΡΑ
                  </button>
                </div>
                <div className="bg-[#0A0A0A]/80 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 bg-black/50">
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ημερομηνια</th>
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Οχημα</th>
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Κατηγορια</th>
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Περιγραφη</th>
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Κοστος</th>
                        <th className="p-6 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Ενεργεια</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.length === 0 ? (
                        <tr><td colSpan={6} className="p-10 text-center text-gray-500 text-xs font-bold uppercase tracking-widest">Κανενα αρχειο.</td></tr>
                      ) : (
                        logs.map(log => (
                          <tr key={log.id} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                            <td className="p-6 text-xs text-gray-400 font-mono">{new Date(log.created_at).toLocaleDateString('el-GR')}</td>
                            <td className="p-6">
                              <div className="text-sm font-bold text-gray-200">{log.vehicles?.model || 'Άγνωστο'}</div>
                              <div className="text-[10px] text-gray-600 font-mono font-bold">{log.vehicles?.plate}</div>
                            </td>
                            <td className="p-6"><span className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider border rounded-lg shadow-sm ${getStatusStyle(log.log_type)}`}>{log.log_type}</span></td>
                            <td className="p-6 text-sm text-gray-300 max-w-xs truncate">{log.description}</td>
                            <td className="p-6 text-base font-bold text-white tracking-tight">€{log.cost}</td>
                            <td className="p-6 text-right">
                              {log.status === 'Εκκρεμεί' ? (
                                <button onClick={() => resolveLog(log.id)} className="px-4 py-2 border border-white/20 hover:border-green-500 hover:text-green-500 text-gray-300 text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-sm bg-white/5 hover:bg-green-500/10">ΕΠΙΛΥΣΗ</button>
                              ) : (
                                <span className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">ΟΛΟΚΛΗΡΩΘΗΚΕ</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ΝΕΑ ΜΙΝΙΜΑΛ ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ ΟΧΗΜΑΤΟΣ (ΧΩΡΙΣ ΦΩΤΟΓΡΑΦΙΕΣ, ΧΩΡΙΣ ΥΠΟΧΡΕΩΤΙΚΗ ΠΙΝΑΚΙΔΑ) */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Καταχωρηση Νεου Οχηματος</h3>
              <button onClick={() => setIsUploadModalOpen(false)} disabled={isUploading} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <form onSubmit={handleAddVehicle} className="p-8 space-y-6">
              
              <div className="grid grid-cols-2 gap-6">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κατηγορια (Οριζει την Φωτογραφια)</label>
                  <select required value={newVehicle.category} onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                    <option value="Compact / Hatchback">Compact / Hatchback</option>
                    <option value="Sedan">Sedan</option>
                    <option value="SUV / 4x4">SUV / 4x4</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Πινακιδα <span className="text-gray-700">(Προαιρετικο)</span></label>
                  <input type="text" placeholder="Π.Χ. KNK-1234" value={newVehicle.plate} onChange={(e) => setNewVehicle({...newVehicle, plate: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 uppercase font-mono font-bold disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μαρκα</label>
                  <input type="text" required placeholder="π.χ. Suzuki" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μοντελο</label>
                  <input type="text" required placeholder="π.χ. Swift" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κιβωτιο</label>
                  <select required value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                    <option value="Χειροκίνητο">Χειροκίνητο</option>
                    <option value="Αυτόματο">Αυτόματο</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τιμη (€/ΗΜ)</label>
                  <input type="number" required placeholder="π.χ. 45" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 font-bold disabled:opacity-50" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κυβικα (CC)</label>
                  <input type="number" required placeholder="π.χ. 1200" value={newVehicle.cc} onChange={(e) => setNewVehicle({...newVehicle, cc: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Αλογα (HP)</label>
                  <input type="number" required placeholder="π.χ. 90" value={newVehicle.hp} onChange={(e) => setNewVehicle({...newVehicle, hp: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                </div>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button type="submit" disabled={isUploading} className="w-full py-4 bg-[#D90000] hover:bg-red-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:shadow-[0_10px_40px_rgba(220,38,38,0.4)] disabled:opacity-50">
                  {isUploading ? 'ΚΑΤΑΧΩΡΗΣΗ...' : 'ΚΑΤΑΧΩΡΗΣΗ ΣΤΟ ΜΗΤΡΩΟ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Αναφοράς Ζημιάς / Μητρώου */}
      {isLogModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-50 p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col">
            <div className="px-8 py-6 border-b border-white/5 flex justify-between items-center bg-black/20">
              <h3 className="text-sm font-bold text-white tracking-widest uppercase">Καταγραφη Συμβαντος</h3>
              <button onClick={() => setIsLogModalOpen(false)} disabled={isUploading} className="text-gray-500 hover:text-white transition-colors">✕</button>
            </div>
            <form onSubmit={handleAddLog} className="p-8 space-y-8">
              
              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Οχημα</label>
                <select required value={newLog.vehicle_id} onChange={(e) => setNewLog({...newLog, vehicle_id: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                  <option value="">-- Επιλέξτε Όχημα --</option>
                  {vehicles.map(v => <option key={v.id} value={v.id}>{v.plate} - {v.model}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τυπος</label>
                  <select value={newLog.log_type} onChange={(e) => setNewLog({...newLog, log_type: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                    <option value="Ζημιά">Ζημιά / Ατύχημα</option>
                    <option value="Συντήρηση">Συντήρηση / Service</option>
                    <option value="Έγγραφα">Έγγραφα (ΚΤΕΟ/Ασφάλεια)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κοστος (€)</label>
                  <input type="number" required value={newLog.cost} onChange={(e) => setNewLog({...newLog, cost: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 font-bold disabled:opacity-50" />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Σημειωσεις</label>
                <textarea rows={3} required placeholder="Τι συνέβη;" value={newLog.description} onChange={(e) => setNewLog({...newLog, description: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-red-600 resize-none disabled:opacity-50"></textarea>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button type="submit" disabled={isUploading} className="w-full py-4 bg-[#D90000] hover:bg-red-600 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] disabled:opacity-50">
                  {isUploading ? 'ΚΑΤΑΓΡΑΦΗ...' : 'ΚΑΤΑΧΩΡΗΣΗ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}