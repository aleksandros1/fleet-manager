'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

// --- Το Αυθεντικό Λογότυπο ---
const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img 
    src="/logo.PNG" 
    alt="Auto Lazaridis" 
    className={className} 
    style={{ objectFit: 'contain' }} 
  />
);

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
  availability: string[]; 
};

type Booking = {
  id: number;
  vehicle_id: number;
  vehicle_model: string;
  check_in: string;
  check_out: string;
  total_price: number;
  status: string;
  created_at: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  id_photo_url?: string;
  license_photo_url?: string;
};

export default function CommandCenter() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active' | 'draft' | 'bookings'>('dashboard'); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDates, setEditDates] = useState({ check_in: '', check_out: '', total_price: 0 });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleBookings, setVehicleBookings] = useState<Booking[]>([]);
  const [manualDates, setManualDates] = useState({ start: '', end: '' });
  
  const [adminCalDate, setAdminCalDate] = useState(new Date());

  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [selectedBookingMonth, setSelectedBookingMonth] = useState<string>('all');

  useEffect(() => {
    async function initializeData() {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchBookings()]);
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
    if (data) setBookings(data as Booking[]);
  }

  const openCalendarModal = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setAdminCalDate(new Date()); 
    setManualDates({ start: '', end: '' });
    setIsCalendarModalOpen(true);
    const { data } = await supabase.from('bookings').select('*').eq('vehicle_id', vehicle.id).order('check_in', { ascending: true });
    if (data) setVehicleBookings(data as Booking[]);
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualDates.start || !manualDates.end || !selectedVehicle) return;
    setIsUploading(true);
    const { data, error } = await supabase.from('bookings').insert([{
      vehicle_id: selectedVehicle.id,
      vehicle_model: selectedVehicle.model,
      check_in: manualDates.start,
      check_out: manualDates.end,
      status: 'Χειροκίνητη Δέσμευση',
      total_price: 0
    }]).select();

    if (!error && data) {
      setVehicleBookings([...vehicleBookings, data[0] as Booking]);
      setBookings([data[0] as Booking, ...bookings]); 
      setManualDates({ start: '', end: '' });
    }
    setIsUploading(false);
  };

  const deleteBooking = async (id: number) => {
    if (!window.confirm('Αμετάκλητη διαγραφή κράτησης. Είστε σίγουροι;')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) {
      setVehicleBookings(vehicleBookings.filter(b => b.id !== id));
      setBookings(bookings.filter(b => b.id !== id));
      setEditingBooking(null);
    }
  };

  const openEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setEditDates({ check_in: booking.check_in, check_out: booking.check_out, total_price: booking.total_price });
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBooking) return;
    setIsUploading(true);
    
    const { error } = await supabase
      .from('bookings')
      .update({ 
        check_in: editDates.check_in, 
        check_out: editDates.check_out,
        total_price: Number(editDates.total_price)
      })
      .eq('id', editingBooking.id);

    if (!error) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? { ...b, check_in: editDates.check_in, check_out: editDates.check_out, total_price: Number(editDates.total_price) } : b));
      setEditingBooking(null);
    } else {
      alert(`Σφάλμα ενημέρωσης: ${error.message}`);
    }
    setIsUploading(false);
  };

  const initialVehicleState = { brand: '', model: '', hp: '', transmission: 'Χειροκίνητο', category: 'Compact / Hatchback', price: '', existingPhotoUrl: '', availability: ['Ενοικίαση'] };
  const [newVehicle, setNewVehicle] = useState(initialVehicleState);
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);

  const uniqueVehicles = vehicles.filter((v, index, self) =>
    index === self.findIndex((t) => t.brand === v.brand && t.model === v.model)
  );

  const presetCategories = Array.from(new Set(uniqueVehicles.map(v => v.category)));

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setNewVehicle(initialVehicleState);
      setVehiclePhoto(null);
      return;
    }
    const preset = vehicles.find(v => v.id.toString() === val);
    if (preset) {
      setNewVehicle({
        brand: preset.brand,
        model: preset.model,
        hp: preset.hp,
        transmission: preset.transmission,
        category: preset.category,
        price: preset.price.toString(),
        existingPhotoUrl: preset.photos && preset.photos.length > 0 ? preset.photos[0] : '',
        availability: preset.availability || ['Ενοικίαση']
      });
      setVehiclePhoto(null);
    }
  };

  const handleAvailabilityChange = (type: string, isChecked: boolean) => {
    if (isChecked) {
      setNewVehicle(prev => ({ ...prev, availability: [...prev.availability, type] }));
    } else {
      setNewVehicle(prev => ({ ...prev, availability: prev.availability.filter(a => a !== type) }));
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.brand || !newVehicle.model) {
      alert("Μάρκα και Μοντέλο είναι υποχρεωτικά.");
      return;
    }
    if (newVehicle.availability.length === 0) {
      alert("Πρέπει να επιλέξετε τουλάχιστον έναν τύπο διαθεσιμότητας.");
      return;
    }
    
    setIsUploading(true);
    let finalPhotoUrl = newVehicle.existingPhotoUrl;
    
    if (vehiclePhoto) {
      const fileExt = vehiclePhoto.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage.from('vehicles').upload(fileName, vehiclePhoto);
      if (uploadError) {
        alert(`Σφάλμα κατά το ανέβασμα της εικόνας: ${uploadError.message}`);
        setIsUploading(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage.from('vehicles').getPublicUrl(fileName);
      finalPhotoUrl = publicUrlData.publicUrl;
    }

    if (!finalPhotoUrl) {
      alert("Απαιτείται φωτογραφία.");
      setIsUploading(false);
      return;
    }

    const randomPlate = `TBA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const { data, error } = await supabase.from('vehicles').insert([{
        plate: randomPlate, 
        brand: newVehicle.brand,
        model: newVehicle.model, 
        cc: 'N/A', 
        hp: newVehicle.hp, 
        transmission: newVehicle.transmission,
        category: newVehicle.category,
        price: Number(newVehicle.price), 
        is_active: false, 
        agency_name: 'AUTO ΛΑΖΑΡΙΔΗΣ', 
        photos: [finalPhotoUrl],
        availability: newVehicle.availability
      }]).select();

    if (!error && data) {
      setVehicles([data[0], ...vehicles]);
      setNewVehicle(initialVehicleState);
      setVehiclePhoto(null);
      setIsUploadModalOpen(false);
      setActiveTab('draft');
    } else if (error) {
       alert(`Σφάλμα βάσης δεδομένων: ${error.message}`);
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

  const activeCount = vehicles.filter(v => v.is_active).length;
  const draftCount = vehicles.filter(v => !v.is_active).length;
  const totalRevenue = bookings.filter(b => b.total_price > 0).reduce((a, c) => a + c.total_price, 0);

  // ΑΠΛΟΠΟΙΗΜΕΝΟ ΣΥΣΤΗΜΑ ΚΑΤΑΣΤΑΣΕΩΝ
  const getSimpleStatus = (status: string) => {
    if (status === 'Χειροκίνητη Δέσμευση') {
      return { label: 'ΕΣΩΤΕΡΙΚΟ BLOCK', style: 'text-blue-400 border-blue-500/30 bg-blue-500/10' };
    }
    return { label: 'ΕΝΕΡΓΗ ΚΡΑΤΗΣΗ', style: 'text-red-500 border-red-500/30 bg-[#D90000]/10 shadow-[0_0_10px_rgba(217,0,0,0.15)]' };
  };

  const getBookingMonths = () => {
    const months = new Set<string>();
    bookings.forEach(b => {
      if (b.check_in) {
        const monthStr = b.check_in.substring(0, 7); 
        months.add(monthStr);
      }
    });
    return Array.from(months).sort().reverse();
  };

  const formatMonthLabel = (yyyy_mm: string) => {
    const [year, month] = yyyy_mm.split('-');
    const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
    return `${monthNames[parseInt(month) - 1]} ${year}`;
  };

  const availableMonths = getBookingMonths();
  const displayedBookings = bookings.filter(b => {
    if (selectedBookingMonth === 'all') return true;
    return b.check_in && b.check_in.startsWith(selectedBookingMonth);
  });

  // ΟΡΙΖΟΝΤΙΟ ΚΥΛΙΟΜΕΝΟ ΗΜΕΡΟΛΟΓΙΟ ΓΙΑ ΚΙΝΗΤΑ
  const AdminDateVisualizer = () => {
    const year = adminCalDate.getFullYear();
    const month = adminCalDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const months = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
    const daysShort = ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"]; 

    const daysElements = [];
    for (let day = 1; day <= daysInMonth; day++) {
       const d = new Date(year, month, day);
       const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
       const booking = vehicleBookings.find(b => dateStr >= b.check_in && dateStr <= b.check_out);

       let boxClass = "flex-shrink-0 w-[4.5rem] h-[5.5rem] flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer snap-center ";
       
       if (manualDates.start === dateStr || manualDates.end === dateStr) {
           boxClass += "bg-white/20 border-white text-white shadow-lg scale-105";
       } else if (manualDates.start && manualDates.end && dateStr > manualDates.start && dateStr < manualDates.end) {
           boxClass += "bg-white/10 border-white/30 text-white";
       } else if (booking) {
           if (booking.status === 'Χειροκίνητη Δέσμευση') {
               boxClass += "bg-blue-600/20 border-blue-500/40 text-blue-400 opacity-80 cursor-not-allowed";
           } else {
               boxClass += "bg-[#D90000]/20 border-red-500/40 text-red-400 opacity-80 cursor-not-allowed";
           }
       } else {
           boxClass += "bg-black border-white/10 text-gray-500 hover:bg-white/10 hover:text-white hover:border-white/30";
       }

       daysElements.push(
         <div 
           key={dateStr} 
           className={boxClass} 
           onClick={() => {
             if (!booking) {
               if (!manualDates.start || (manualDates.start && manualDates.end)) {
                 setManualDates({ start: dateStr, end: '' });
               } else if (dateStr > manualDates.start) {
                 setManualDates({ ...manualDates, end: dateStr });
               } else {
                 setManualDates({ start: dateStr, end: '' });
               }
             }
           }}
         >
           <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{daysShort[d.getDay()]}</span>
           <span className="text-xl font-bold">{day}</span>
         </div>
       );
    }

    return (
      <div className="bg-[#111] py-5 px-1 md:px-6 md:p-6 rounded-3xl border border-white/5 mb-6 shadow-inner">
         <div className="flex justify-between items-center mb-6 px-4 md:px-0">
           <button type="button" onClick={() => setAdminCalDate(new Date(year, month - 1, 1))} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">&lt;</button>
           <span className="text-sm font-bold text-white uppercase tracking-widest">{months[month]} {year}</span>
           <button type="button" onClick={() => setAdminCalDate(new Date(year, month + 1, 1))} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors">&gt;</button>
         </div>
         
         <div className="flex overflow-x-auto gap-3 hide-scrollbar snap-x snap-mandatory px-4 md:px-0 pb-2">
            {daysElements}
         </div>

         <div className="mt-5 flex flex-wrap gap-4 text-[9px] uppercase tracking-widest text-gray-500 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-black border border-white/10 rounded"></div> Ελευθερο</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#D90000]/20 border border-red-500/40 rounded"></div> Κρατηση Πελατη</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-600/20 border border-blue-500/40 rounded"></div> Εσωτερικο Block</div>
         </div>
      </div>
    )
  };

  const renderVehicleGrid = (isActiveFilter: boolean) => {
    const filtered = vehicles.filter(v => v.is_active === isActiveFilter);
    if (filtered.length === 0) return <div className="text-gray-500 text-sm py-10 uppercase tracking-widest">Αδειο Μητρωο.</div>;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {filtered.map((v) => (
          <div key={v.id} className="group bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-red-600/50 transition-all flex flex-col shadow-2xl relative">
            <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 w-full pr-16 pointer-events-none">
              <div className="bg-[#D90000]/20 border border-red-600/30 px-2 py-1 rounded text-[9px] font-bold text-red-500 tracking-wider uppercase shadow-lg">{v.category}</div>
              {v.availability && v.availability.map(a => (
                <div key={a} className="bg-white/10 border border-white/20 px-2 py-1 rounded text-[9px] font-bold text-white tracking-wider uppercase shadow-lg backdrop-blur-md">{a}</div>
              ))}
            </div>
            
            <div 
              onClick={() => openCalendarModal(v)}
              className="h-40 md:h-44 bg-[#050505] relative border-b border-white/5 flex items-center justify-center overflow-hidden cursor-pointer group/img"
            >
               {v.photos && v.photos.length > 0 ? (
                 /* eslint-disable-next-line @next/next/no-img-element */
                 <img src={v.photos[0]} alt={v.model} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-40 group-hover/img:scale-105 transition-all duration-500" />
               ) : <svg className="w-16 h-16 text-white/5 group-hover/img:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
               
               <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                  <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#D90000] border border-red-500/50 px-5 py-2.5 rounded-full shadow-[0_0_15px_rgba(217,0,0,0.5)]">Ημερολογιο</span>
               </div>
            </div>

            <div className="p-4 md:p-5 flex-1 flex flex-col bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1">{v.brand}</div>
                  <h3 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">{v.model}</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                    <span className="text-[9px] md:text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.hp} HP</span>
                    <span className="text-[9px] md:text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.transmission}</span>
                  </div>
                </div>
              </div>
              <div className="mt-auto pt-3 md:pt-4 border-t border-white/10 flex justify-between items-center">
                <div className="text-lg md:text-xl font-bold text-white">€{v.price}<span className="text-[8px] md:text-[9px] text-gray-500 ml-1">/ΗΜ</span></div>
                <div className="flex items-center gap-3 md:gap-4">
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" checked={v.is_active} onChange={() => toggleStatus(v.id, v.is_active)} />
                      <div className={`block w-9 md:w-10 h-5 md:h-6 rounded-full transition-colors ${v.is_active ? 'bg-red-600' : 'bg-gray-800'}`}></div>
                      <div className={`absolute left-1 top-1 bg-white w-3 md:w-4 h-3 md:h-4 rounded-full transition-transform ${v.is_active ? 'transform translate-x-4' : ''}`}></div>
                    </div>
                  </label>
                  <button onClick={() => deleteVehicle(v.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-red-600/30 flex overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-5">
        <AutoLazaridisLogo className="h-8 w-auto" />
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        ></div>
      )}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-64 bg-[#0A0A0A] md:bg-[#0A0A0A]/80 md:backdrop-blur-2xl border-r border-white/5 flex flex-col fixed h-full z-50 shadow-2xl transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between md:justify-center items-center">
          <AutoLazaridisLogo className="h-10 md:h-14 w-auto" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 flex-1 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Διαχειριση</div>
          
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Επισκοπηση</button>
          
          <button onClick={() => { setActiveTab('active'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <span>Ενεργος Στολος</span>
            <span className="bg-black/50 border border-white/10 text-gray-300 px-2 py-0.5 rounded text-[9px]">{activeCount}</span>
          </button>
          
          <button onClick={() => { setActiveTab('draft'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'draft' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            <span>Σε Αναμονη</span>
            {draftCount > 0 && <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[9px]">{draftCount}</span>}
          </button>
          
          <button onClick={() => { setActiveTab('bookings'); fetchBookings(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'bookings' ? 'bg-[#D90000] text-white shadow-[0_0_20px_rgba(220,38,38,0.3)]' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>
            Κρατησεις
          </button>
        </div>
        <div className="p-6 border-t border-white/5">
           <button onClick={() => { setIsUploadModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-3 md:py-4 bg-white/5 border border-white/10 hover:border-red-600/50 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all shadow-lg">+ Νεο Οχημα</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-5 md:p-10 pt-24 md:pt-10 relative w-full max-w-[100vw]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 pb-4 border-b border-white/5 gap-4">
          <h2 className="text-xl md:text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">
            {activeTab === 'dashboard' && 'Επισκοπηση Επιχειρησης'}
            {activeTab === 'active' && 'Ενεργος Στολος'}
            {activeTab === 'draft' && 'Οχηματα Αναμονης'}
            {activeTab === 'bookings' && 'Διαχειριση Κρατησεων'}
          </h2>
          <div className="flex items-center gap-4 hidden md:flex">
            <div className="w-10 h-10 rounded-full bg-black border border-white/10 flex items-center justify-center shadow-inner"><span className="text-xs font-bold text-gray-400">AL</span></div>
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-600 uppercase tracking-widest text-sm font-bold animate-pulse">Ανάκτηση δεδομένων...</div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <div className="space-y-6 md:space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl">
                  {/* Κάρτα 1 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-white/10 flex flex-col justify-between h-36 md:h-40 shadow-2xl relative overflow-hidden group hover:border-white/20 transition-all">
                    <span className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ενεργος Στολος</span>
                    <div className="text-5xl md:text-6xl font-bold text-white tracking-tighter">{activeCount} <span className="text-base md:text-lg text-gray-600 font-medium tracking-normal">/ {vehicles.length}</span></div>
                  </div>
                  {/* Κάρτα 2 */}
                  <div className="bg-[#0A0A0A]/80 backdrop-blur-xl p-6 md:p-8 rounded-[1.5rem] md:rounded-3xl border border-white/10 flex flex-col justify-between h-36 md:h-40 shadow-2xl relative overflow-hidden group hover:border-green-500/30 transition-all">
                    <span className="text-[9px] md:text-[10px] font-bold text-green-500 uppercase tracking-widest relative z-10">Συνολικα Εσοδα</span>
                    <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white relative z-10 tracking-tighter">€{totalRevenue.toLocaleString('el-GR')}</div>
                    <div className="absolute inset-0 bg-gradient-to-tr from-green-500/5 to-transparent"></div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'active' && renderVehicleGrid(true)}
            {activeTab === 'draft' && renderVehicleGrid(false)}

            {/* --- BOOKINGS SECTION ΜΕ ΚΑΡΤΕΣ & ΜΗΝΕΣ --- */}
            {activeTab === 'bookings' && (
              <div className="space-y-6">
                
                {/* Μπάρα Φιλτραρίσματος Μηνών */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 px-1">
                  <button 
                    onClick={() => setSelectedBookingMonth('all')}
                    className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${selectedBookingMonth === 'all' ? 'bg-[#D90000] text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                  >
                    Γενικη Προβολη
                  </button>
                  {availableMonths.map(monthStr => (
                    <button 
                      key={monthStr}
                      onClick={() => setSelectedBookingMonth(monthStr)}
                      className={`flex-shrink-0 px-5 py-2.5 rounded-full text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${selectedBookingMonth === monthStr ? 'bg-[#D90000] text-white shadow-lg' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                    >
                      {formatMonthLabel(monthStr)}
                    </button>
                  ))}
                </div>

                {/* Grid Κρατήσεων */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {displayedBookings.length === 0 ? (
                    <div className="text-gray-500 text-sm py-10 uppercase tracking-widest col-span-full">ΔΕΝ ΥΠΑΡΧΟΥΝ ΚΡΑΤΗΣΕΙΣ ΓΙΑ ΑΥΤΗ ΤΗΝ ΕΠΙΛΟΓΗ.</div>
                  ) : (
                    displayedBookings.map(b => {
                      const simpleStatus = getSimpleStatus(b.status);
                      
                      return (
                        <div key={b.id} className="bg-[#0A0A0A] border border-white/10 rounded-[1.5rem] p-5 flex flex-col shadow-lg relative transition-colors hover:border-white/20 gap-4">
                          
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="text-[10px] font-mono text-gray-500 mb-1">#{String(b.id).padStart(4, '0')}</div>
                              <div className="text-sm font-bold text-white uppercase tracking-wider">{b.vehicle_model}</div>
                            </div>
                            <button onClick={() => openEditBooking(b)} className="px-3 py-2 bg-white/5 border border-white/10 hover:bg-[#D90000] hover:border-red-500 text-gray-300 hover:text-white rounded-lg text-[9px] font-bold uppercase tracking-widest transition-all shadow-sm">
                              Επεξεργασια
                            </button>
                          </div>
                          
                          <div className="flex justify-between items-center border-b border-white/5 pb-4">
                             <span className={`px-2.5 py-1.5 text-[8px] md:text-[9px] font-bold uppercase tracking-wider border rounded-lg whitespace-nowrap ${simpleStatus.style}`}>
                               {simpleStatus.label}
                             </span>
                             {b.total_price > 0 && <div className="text-sm md:text-base font-bold text-white tracking-tight">€{b.total_price}</div>}
                          </div>
                          
                          <div className="bg-[#111] border border-white/5 rounded-xl p-3 flex items-center justify-center">
                            <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                              {b.check_in} <span className="text-gray-600 mx-2">→</span> {b.check_out}
                            </span>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL ΕΠΕΞΕΡΓΑΣΙΑΣ ΚΡΑΤΗΣΗΣ --- */}
      {editingBooking && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xs md:text-sm font-bold text-white tracking-widest uppercase">Στοιχεια & Επεξεργασια</h3>
              <button onClick={() => setEditingBooking(null)} disabled={isUploading} className="text-gray-500 hover:text-white transition-colors p-2 -mr-2">✕</button>
            </div>
            
            <div className="overflow-y-auto hide-scrollbar p-5 md:p-8">
              
              {/* ΕΝΟΤΗΤΑ 1: ΠΛΗΡΟΦΟΡΙΕΣ ΠΕΛΑΤΗ & ΕΓΓΡΑΦΑ ΣΕ ΠΡΩΤΟ ΠΛΑΝΟ */}
              <div className="bg-[#111] p-5 rounded-2xl border border-white/5 mb-6">
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Οχημα: #{String(editingBooking.id).padStart(4, '0')}</div>
                 <div className="text-base font-bold text-white mb-5">{editingBooking.vehicle_model}</div>
                 
                 {editingBooking.customer_name ? (
                   <div className="pt-5 border-t border-white/5">
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Πελατης</div>
                     <div className="text-sm font-bold text-white mb-1">{editingBooking.customer_name}</div>
                     <div className="text-[11px] text-gray-400 mb-5">{editingBooking.customer_phone} &bull; {editingBooking.customer_email}</div>
                     
                     <div className="flex gap-2 w-full">
                       {editingBooking.id_photo_url && (
                         <a href={editingBooking.id_photo_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors">
                           ΤΑΥΤΟΤΗΤΑ
                         </a>
                       )}
                       {editingBooking.license_photo_url && (
                         <a href={editingBooking.license_photo_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors">
                           ΔΙΠΛΩΜΑ
                         </a>
                       )}
                       {!editingBooking.id_photo_url && !editingBooking.license_photo_url && (
                         <div className="w-full text-center text-gray-600 text-[10px] uppercase tracking-widest border border-white/5 rounded-xl py-3">ΚΑΝΕΝΑ ΕΓΓΡΑΦΟ</div>
                       )}
                     </div>
                   </div>
                 ) : (
                    <div className="pt-5 border-t border-white/5 text-[10px] italic text-gray-600 uppercase tracking-widest">ΕΣΩΤΕΡΙΚΟ BLOCK ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ</div>
                 )}
              </div>

              {/* ΕΝΟΤΗΤΑ 2: ΦΟΡΜΑ ΕΠΕΞΕΡΓΑΣΙΑΣ ΗΜΕΡΟΜΗΝΙΩΝ */}
              <form onSubmit={handleUpdateBooking} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Απο (Check-in)</label>
                    <input type="date" required value={editDates.check_in} onChange={(e) => setEditDates({...editDates, check_in: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Εως (Check-out)</label>
                    <input type="date" required value={editDates.check_out} onChange={(e) => setEditDates({...editDates, check_out: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Συνολικο Εσοδο (€)</label>
                  <input type="number" required value={editDates.total_price} onChange={(e) => setEditDates({...editDates, total_price: Number(e.target.value)})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 font-bold disabled:opacity-50" />
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button type="button" onClick={() => deleteBooking(editingBooking.id)} disabled={isUploading} className="w-full sm:flex-1 py-3.5 md:py-4 bg-transparent border border-red-900 hover:bg-red-900/20 text-red-500 rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50">
                    ΔΙΑΓΡΑΦΗ ΚΡΑΤΗΣΗΣ
                  </button>
                  <button type="submit" disabled={isUploading} className="w-full sm:flex-1 py-3.5 md:py-4 bg-[#D90000] hover:bg-red-600 text-white rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] disabled:opacity-50">
                    {isUploading ? 'ΑΠΟΘΗΚΕΥΣΗ...' : 'ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ΗΜΕΡΟΛΟΓΙΟΥ & ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ ΜΕ VISUAL CALENDAR --- */}
      {isCalendarModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <div>
                <h3 className="text-xs md:text-sm font-bold text-white tracking-widest uppercase">Διαθεσιμοτητα Οχηματος</h3>
                <p className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mt-1">{selectedVehicle.brand} {selectedVehicle.model}</p>
              </div>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-gray-500 hover:text-white transition-colors p-2 -mr-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 md:p-8 space-y-6 md:space-y-8">
              
              <AdminDateVisualizer />

              <div className="bg-[#111] p-5 md:p-6 rounded-2xl border border-white/5">
                <h4 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Εσωτερικο Block (Μη διαθεσιμο)</h4>
                <form onSubmit={handleManualBlock} className="flex flex-col sm:flex-row items-end gap-3 md:gap-4">
                  <div className="w-full sm:flex-1">
                    <label className="block text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2">Απο</label>
                    <input type="date" required value={manualDates.start} onChange={e => setManualDates({...manualDates, start: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 md:py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600" />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest mb-1.5 md:mb-2">Εως</label>
                    <input type="date" required value={manualDates.end} onChange={e => setManualDates({...manualDates, end: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2 md:py-2.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600" />
                  </div>
                  <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-6 py-3 sm:py-2.5 bg-[#D90000] hover:bg-red-600 text-white rounded-xl text-[9px] md:text-[10px] font-bold tracking-widest uppercase transition-all sm:h-[42px] mt-2 sm:mt-0">
                    ΠΡΟΣΘΗΚΗ
                  </button>
                </form>
              </div>

              <div>
                <h4 className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ενεργες Κρατησεις Οχηματος</h4>
                <div className="space-y-2">
                  {vehicleBookings.length === 0 ? (
                    <div className="text-center text-gray-600 text-[9px] md:text-[10px] uppercase tracking-widest py-4">Το όχημα είναι ελεύθερο.</div>
                  ) : (
                    vehicleBookings.map(b => (
                      <div key={b.id} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 bg-black/40 border border-white/5 p-4 rounded-xl">
                        <div>
                          <div className="text-[10px] md:text-xs font-bold text-white tracking-widest mb-1">{b.check_in} <span className="text-gray-500 mx-1 md:mx-2">→</span> {b.check_out}</div>
                          <div className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest">
                            {b.status === 'Χειροκίνητη Δέσμευση' ? 'Εσωτερικό Block' : `Κράτηση Πελάτη: ${b.customer_name || 'Αναμονή'}`}
                          </div>
                        </div>
                        <button onClick={() => deleteBooking(b.id)} className="w-full sm:w-auto text-center text-[9px] md:text-[10px] text-red-500 hover:text-red-400 border border-red-500/30 hover:bg-red-500/10 px-3 py-2 sm:py-1.5 rounded-lg transition-all uppercase font-bold">
                          Διαγραφη
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ΝΕΑ ΜΙΝΙΜΑΛ ΦΟΡΜΑ ΠΡΟΣΘΗΚΗΣ ΟΧΗΜΑΤΟΣ */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,1)] flex flex-col max-h-[90vh]">
            <div className="px-5 md:px-8 py-4 md:py-6 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xs md:text-sm font-bold text-white tracking-widest uppercase">Νεο Οχημα</h3>
              <button onClick={() => setIsUploadModalOpen(false)} disabled={isUploading} className="text-gray-500 hover:text-white transition-colors p-2 -mr-2">✕</button>
            </div>
            
            <div className="overflow-y-auto hide-scrollbar p-5 md:p-8">
              <form onSubmit={handleAddVehicle} className="space-y-5 md:space-y-6">
                
                {uniqueVehicles.length > 0 && (
                  <div className="bg-[#D90000]/10 border border-[#D90000]/20 p-4 md:p-5 rounded-xl mb-4 md:mb-6">
                    <label className="block text-[9px] md:text-[10px] font-bold text-[#D90000] uppercase tracking-widest mb-2">Γρηγορη Εισαγωγη (Απο Υπαρχοντα)</label>
                    <select onChange={handlePresetChange} disabled={isUploading} className="w-full bg-black border border-[#D90000]/30 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                      <option value="">-- Δημιουργία από την αρχή --</option>
                      {presetCategories.map(cat => (
                        <optgroup key={cat} label={cat.toUpperCase()} className="text-gray-500 font-bold bg-[#111]">
                          {uniqueVehicles.filter(v => v.category === cat).map(v => (
                            <option key={v.id} value={v.id} className="text-white font-normal">{v.brand} {v.model}</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μαρκα</label>
                    <input type="text" required placeholder="π.χ. Suzuki" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μοντελο</label>
                    <input type="text" required placeholder="π.χ. Swift" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κατηγορια</label>
                    <select required value={newVehicle.category} onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                      <option value="Compact / Hatchback">Compact / Hatchback</option>
                      <option value="Sedan">Sedan</option>
                      <option value="SUV / 4x4">SUV / 4x4</option>
                      <option value="Premium">Premium</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Αλογα (HP)</label>
                    <input type="number" required placeholder="π.χ. 90" value={newVehicle.hp} onChange={(e) => setNewVehicle({...newVehicle, hp: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κιβωτιο</label>
                    <select required value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 disabled:opacity-50 appearance-none font-bold">
                      <option value="Χειροκίνητο">Χειροκίνητο</option>
                      <option value="Αυτόματο">Αυτόματο</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τιμη (€)</label>
                    <input type="number" required placeholder="π.χ. 45" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-red-600 font-bold disabled:opacity-50" />
                  </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Διαθεσιμοτητα <span className="text-gray-700">(Πολλαπλη Επιλογη)</span></label>
                  <div className="flex flex-wrap gap-4 md:gap-6">
                    {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-xs md:text-sm text-white cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input 
                            type="checkbox" 
                            checked={newVehicle.availability.includes(type)}
                            onChange={(e) => handleAvailabilityChange(type, e.target.checked)}
                            disabled={isUploading}
                            className="peer sr-only" 
                          />
                          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-white/20 rounded bg-black peer-checked:bg-[#D90000] peer-checked:border-[#D90000] transition-all group-hover:border-white/50"></div>
                          <svg className="absolute w-3 h-3 text-white opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                        </div>
                        <span className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold text-gray-300 group-hover:text-white transition-colors">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Φωτογραφια Οχηματος</label>
                  
                  {newVehicle.existingPhotoUrl && !vehiclePhoto && (
                    <div className="mb-3 text-[9px] md:text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Φωτογραφια Προτυπου
                    </div>
                  )}
                  
                  <input 
                    type="file" 
                    accept="image/*" 
                    required={!newVehicle.existingPhotoUrl} 
                    onChange={(e) => setVehiclePhoto(e.target.files?.[0] || null)} 
                    disabled={isUploading} 
                    className="w-full text-xs md:text-sm text-white file:mr-3 file:py-1.5 file:px-3 md:file:mr-4 md:file:py-2 md:file:px-4 file:rounded-full file:border-0 file:text-[9px] md:file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-[#D90000]/10 file:text-[#D90000] hover:file:bg-[#D90000]/20 transition-all cursor-pointer" 
                  />
                  {newVehicle.existingPhotoUrl && (
                    <p className="text-[8px] md:text-[9px] text-gray-600 mt-2">Αν επιλέξετε νέο αρχείο, θα αντικαταστήσει την υπάρχουσα φωτογραφία του προτύπου.</p>
                  )}
                </div>

                <div className="pt-6 border-t border-white/5">
                  <button type="submit" disabled={isUploading} className="w-full py-3.5 md:py-4 bg-[#D90000] hover:bg-red-600 text-white rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(220,38,38,0.2)] hover:shadow-[0_10px_40px_rgba(220,38,38,0.4)] disabled:opacity-50">
                    {isUploading ? 'ΚΑΤΑΧΩΡΗΣΗ...' : 'ΚΑΤΑΧΩΡΗΣΗ ΣΤΟ ΜΗΤΡΩΟ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}