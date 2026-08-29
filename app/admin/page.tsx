'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '../../lib/supabase';

// --- Το Αυθεντικό Λογότυπο ---
const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img src="/brand-logo.png" alt="Auto Lazaridis" className={className} style={{ objectFit: 'contain' }} />
);

// --- ΠΡΑΓΜΑΤΙΚΗ ΠΥΛΗ ΑΣΦΑΛΕΙΑΣ (SUPABASE AUTH) ---
function AuthGate({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingAuth(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setError('Λανθασμένο Email ή Κωδικός.');
    }
  };

  if (loadingAuth) return <div className="min-h-screen bg-[#030303]"></div>;

  if (!session) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center p-5 selection:bg-[#8B0000]/40">
        <div className="w-full max-w-sm bg-[#0A0A0A] border border-white/10 p-8 rounded-[2rem] shadow-2xl flex flex-col items-center">
          <AutoLazaridisLogo className="h-16 w-auto mb-8 opacity-80" />
          <h1 className="text-white text-xs font-bold uppercase tracking-[0.3em] mb-8 text-center">Συστημα Διαχειρισης</h1>
          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <input 
                type="email" 
                placeholder="Email Διαχειριστή" 
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className={`w-full bg-[#111] border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-sm text-center text-white focus:outline-none focus:border-[#8B0000] tracking-widest transition-colors`}
                autoFocus
                required
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="Κωδικός Πρόσβασης" 
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className={`w-full bg-[#111] border ${error ? 'border-red-500' : 'border-white/10'} rounded-xl px-4 py-4 text-sm text-center text-white focus:outline-none focus:border-[#8B0000] tracking-widest font-mono transition-colors`}
                required
              />
            </div>
            {error && <p className="text-red-500 text-[9px] uppercase tracking-widest text-center font-bold">{error}</p>}
            <button type="submit" className="w-full py-4 bg-[#8B0000] hover:bg-[#6A0000] text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all shadow-[0_10px_30px_rgba(139,0,0,0.3)] mt-2">
              Εισοδος στο Μητρωο
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

// --- ΤΥΠΟΙ ΔΕΔΟΜΕΝΩΝ ---
type Vehicle = {
  id: number; plate: string; brand: string; model: string; cc: string; hp: string; transmission: string; price: number; is_active: boolean; agency_name: string; category: string; photos: string[]; availability: string[]; 
};

type Booking = {
  id: number; vehicle_id: number | null; vehicle_model: string; check_in: string; check_out: string; total_price: number; status: string; created_at: string; customer_name?: string; customer_email?: string; customer_phone?: string; id_photo_url?: string; license_photo_url?: string;
};

type Note = {
  id: number; created_at: string; tag: string; content: string; amount: number | null;
};

type DbCategory = {
  id: number; name: string; is_active: boolean;
};

// Helpers Ημερολογίου
const shortDays = ["ΚΥΡ", "ΔΕΥ", "ΤΡΙ", "ΤΕΤ", "ΠΕΜ", "ΠΑΡ", "ΣΑΒ"];
const shortMonths = ["ΙΑΝ", "ΦΕΒ", "ΜΑΡ", "ΑΠΡ", "ΜΑΙ", "ΙΟΥΝ", "ΙΟΥΛ", "ΑΥΓ", "ΣΕΠ", "ΟΚΤ", "ΝΟΕ", "ΔΕΚ"];
const longMonths = ["ΙΑΝΟΥΑΡΙΟΣ", "ΦΕΒΡΟΥΑΡΙΟΣ", "ΜΑΡΤΙΟΣ", "ΑΠΡΙΛΙΟΣ", "ΜΑΙΟΣ", "ΙΟΥΝΙΟΣ", "ΙΟΥΛΙΟΣ", "ΑΥΓΟΥΣΤΟΣ", "ΣΕΠΤΕΜΒΡΙΟΣ", "ΟΚΤΩΒΡΙΟΣ", "ΝΟΕΜΒΡΙΟΣ", "ΔΕΚΕΜΒΡΙΟΣ"];

const getFormattedDateString = (d: Date) => {
  const year = d.getFullYear(); const month = String(d.getMonth() + 1).padStart(2, '0'); const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'active' | 'draft' | 'bookings' | 'notes' | 'categories'>('dashboard'); 
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isManualBookingModalOpen, setIsManualBookingModalOpen] = useState(false);
  
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [editDates, setEditDates] = useState({ check_in: '', check_out: '', total_price: 0 });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [dbCategories, setDbCategories] = useState<DbCategory[]>([]);
  
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleBookings, setVehicleBookings] = useState<Booking[]>([]);
  const [manualDates, setManualDates] = useState({ start: '', end: '' });
  
  const [adminCalDate, setAdminCalDate] = useState(new Date());
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  const [manualBookingData, setManualBookingData] = useState({ vehicle_model: '', customer_name: '', customer_phone: '', check_in: '', check_out: '', total_price: '' });
  const [noteInput, setNoteInput] = useState({ tag: '', content: '', amount: '' });
  const [newCategoryName, setNewCategoryName] = useState('');

  const [currentMonthView, setCurrentMonthView] = useState<Date>(new Date());
  const [selectedDailyDate, setSelectedDailyDate] = useState<Date>(new Date());
  
  const calendarDaysArray = useMemo(() => {
    const year = currentMonthView.getFullYear(); const month = currentMonthView.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = [];
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  }, [currentMonthView]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      setTimeout(() => {
        const activeEl = document.getElementById('calendar-active-day');
        if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }, 100);
    }
  }, [activeTab, selectedDailyDate, currentMonthView]);

  useEffect(() => {
    async function initializeData() {
      setLoading(true);
      await Promise.all([fetchVehicles(), fetchBookings(), fetchNotes(), fetchCategories()]);
      setLoading(false); 
    }
    initializeData();
  }, []);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  async function fetchVehicles() { const { data } = await supabase.from('vehicles').select('*').order('created_at', { ascending: false }); if (data) setVehicles(data); }
  async function fetchBookings() { const { data } = await supabase.from('bookings').select('*').order('created_at', { ascending: false }); if (data) setBookings(data as Booking[]); }
  async function fetchNotes() { const { data } = await supabase.from('notes').select('*').order('created_at', { ascending: false }); if (data) setNotes(data as Note[]); }
  async function fetchCategories() { const { data } = await supabase.from('categories').select('*').order('name', { ascending: true }); if (data) setDbCategories(data as DbCategory[]); }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault(); if (!newCategoryName.trim()) return;
    setIsUploading(true);
    const { data, error } = await supabase.from('categories').insert([{ name: newCategoryName.trim(), is_active: true }]).select();
    if (!error && data) { setDbCategories([...dbCategories, data[0] as DbCategory].sort((a,b) => a.name.localeCompare(b.name))); setNewCategoryName(''); } else if (error) { alert(`Σφάλμα: ${error.message}`); }
    setIsUploading(false);
  };

  const handleToggleCategoryStatus = async (id: number, currentStatus: boolean) => {
    const { error } = await supabase.from('categories').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) setDbCategories(dbCategories.map(c => c.id === id ? { ...c, is_active: !currentStatus } : c));
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    if (!window.confirm(`Προσοχή: Διαγραφή της κατηγορίας "${name}"; Τα αυτοκίνητα που ανήκουν σε αυτήν δεν θα διαγραφούν, αλλά θα πρέπει να τους ορίσετε νέα κατηγορία.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (!error) setDbCategories(dbCategories.filter(c => c.id !== id)); else alert(`Σφάλμα: ${error.message}`);
  };

  const openCalendarModal = async (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle); setAdminCalDate(new Date()); setManualDates({ start: '', end: '' }); setIsCalendarModalOpen(true);
    const { data } = await supabase.from('bookings').select('*').eq('vehicle_id', vehicle.id).order('check_in', { ascending: true });
    if (data) setVehicleBookings(data as Booking[]);
  };

  const handleManualBlock = async (e: React.FormEvent) => {
    e.preventDefault(); if (!manualDates.start || !manualDates.end || !selectedVehicle) return;
    setIsUploading(true);
    const { data, error } = await supabase.from('bookings').insert([{ vehicle_id: selectedVehicle.id, vehicle_model: selectedVehicle.model, check_in: manualDates.start, check_out: manualDates.end, status: 'Χειροκίνητη Δέσμευση', total_price: 0 }]).select();
    if (!error && data) { setVehicleBookings([...vehicleBookings, data[0] as Booking]); setBookings([data[0] as Booking, ...bookings]); setManualDates({ start: '', end: '' }); }
    setIsUploading(false);
  };

  const handleCreateManualBooking = async (e: React.FormEvent) => {
    e.preventDefault(); setIsUploading(true);
    const finalCheckIn = manualBookingData.check_in || new Date().toISOString().split('T')[0];
    const finalCheckOut = manualBookingData.check_out || new Date().toISOString().split('T')[0];
    const { data, error } = await supabase.from('bookings').insert([{ vehicle_id: null, vehicle_model: manualBookingData.vehicle_model || 'Γενική Δέσμευση', check_in: finalCheckIn, check_out: finalCheckOut, total_price: Number(manualBookingData.total_price) || 0, status: 'Χειροκίνητη Κράτηση', customer_name: manualBookingData.customer_name || 'Χωρίς Όνομα', customer_phone: manualBookingData.customer_phone || '-' }]).select();
    if (!error && data) { setBookings([data[0] as Booking, ...bookings]); setIsManualBookingModalOpen(false); setManualBookingData({ vehicle_model: '', customer_name: '', customer_phone: '', check_in: '', check_out: '', total_price: '' }); } else { alert(`Σφάλμα: ${error?.message}`); }
    setIsUploading(false);
  };

  const deleteBooking = async (id: number) => {
    if (!window.confirm('Αμετάκλητη διαγραφή κράτησης. Είστε σίγουροι;')) return;
    const { error } = await supabase.from('bookings').delete().eq('id', id);
    if (!error) { setVehicleBookings(vehicleBookings.filter(b => b.id !== id)); setBookings(bookings.filter(b => b.id !== id)); setEditingBooking(null); }
  };

  const openEditBooking = (booking: Booking) => {
    setEditingBooking(booking); setEditDates({ check_in: booking.check_in, check_out: booking.check_out, total_price: booking.total_price });
  };

  const handleUpdateBooking = async (e: React.FormEvent) => {
    e.preventDefault(); if (!editingBooking) return;
    setIsUploading(true);
    const { error } = await supabase.from('bookings').update({ check_in: editDates.check_in, check_out: editDates.check_out, total_price: Number(editDates.total_price) }).eq('id', editingBooking.id);
    if (!error) {
      setBookings(bookings.map(b => b.id === editingBooking.id ? { ...b, check_in: editDates.check_in, check_out: editDates.check_out, total_price: Number(editDates.total_price) } : b));
      setVehicleBookings(vehicleBookings.map(b => b.id === editingBooking.id ? { ...b, check_in: editDates.check_in, check_out: editDates.check_out, total_price: Number(editDates.total_price) } : b));
      setEditingBooking(null);
    } else { alert(`Σφάλμα ενημέρωσης: ${error.message}`); }
    setIsUploading(false);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault(); if (!noteInput.content.trim()) return;
    setIsUploading(true);
    const { data, error } = await supabase.from('notes').insert([{ tag: noteInput.tag.trim() || 'Γενικά', content: noteInput.content.trim(), amount: noteInput.amount ? Number(noteInput.amount) : null }]).select();
    if (!error && data) { setNotes([data[0] as Note, ...notes]); setNoteInput({ tag: '', content: '', amount: '' }); } else { alert(`Σφάλμα: ${error?.message}`); }
    setIsUploading(false);
  };

  const deleteNote = async (id: number) => {
    if (!window.confirm('Διαγραφή εγγραφής;')) return;
    const { error } = await supabase.from('notes').delete().eq('id', id);
    if (!error) setNotes(notes.filter(n => n.id !== id));
  };

  const initialVehicleState = { brand: '', model: '', hp: '', transmission: 'Χειροκίνητο', category: '', price: '', existingPhotoUrl: '', availability: ['Ενοικίαση'] };
  const [newVehicle, setNewVehicle] = useState(initialVehicleState);
  const [vehiclePhoto, setVehiclePhoto] = useState<File | null>(null);

  const uniqueVehicles = vehicles.filter((v, index, self) =>
    index === self.findIndex((t) => t.brand === v.brand && t.model === v.model)
  );
  const allUniqueCategories: string[] = Array.from(new Set(vehicles.map(v => v.category)));

  const handlePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (!val) {
      setNewVehicle(initialVehicleState); setVehiclePhoto(null); return;
    }
    const preset = vehicles.find(v => v.id.toString() === val);
    if (preset) {
      setNewVehicle({
        brand: preset.brand, model: preset.model, hp: preset.hp, transmission: preset.transmission, category: preset.category, price: preset.price.toString(), existingPhotoUrl: preset.photos && preset.photos.length > 0 ? preset.photos[0] : '', availability: preset.availability && preset.availability.length > 0 ? [preset.availability[0]] : ['Ενοικίαση']
      });
      setVehiclePhoto(null);
    }
  };

  const handleAvailabilityChange = (type: string) => { setNewVehicle(prev => ({ ...prev, availability: [type] })); };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.brand || !newVehicle.model) { alert("Μάρκα και Μοντέλο είναι υποχρεωτικά."); return; }
    if (!newVehicle.category) { alert("Η Κατηγορία είναι υποχρεωτική."); return; }
    if (newVehicle.availability.length === 0) { alert("Πρέπει να επιλέξετε τουλάχιστον έναν τύπο διαθεσιμότητας."); return; }
    
    setIsUploading(true);
    let finalPhotoUrl = newVehicle.existingPhotoUrl;
    
    if (vehiclePhoto) {
      const fileExt = vehiclePhoto.name.split('.').pop(); const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('vehicles').upload(fileName, vehiclePhoto);
      if (uploadError) { alert(`Σφάλμα κατά το ανέβασμα της εικόνας: ${uploadError.message}`); setIsUploading(false); return; }
      const { data: publicUrlData } = supabase.storage.from('vehicles').getPublicUrl(fileName);
      finalPhotoUrl = publicUrlData.publicUrl;
    }
    if (!finalPhotoUrl) { alert("Απαιτείται φωτογραφία."); setIsUploading(false); return; }

    const randomPlate = `TBA-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const { data, error } = await supabase.from('vehicles').insert([{
        plate: randomPlate, brand: newVehicle.brand, model: newVehicle.model, cc: 'N/A', hp: newVehicle.hp, transmission: newVehicle.transmission, category: newVehicle.category, price: Number(newVehicle.price), is_active: false, agency_name: 'AUTO ΛΑΖΑΡΙΔΗΣ', photos: [finalPhotoUrl], availability: newVehicle.availability
      }]).select();

    if (!error && data) {
      setVehicles([data[0], ...vehicles]); setNewVehicle(initialVehicleState); setVehiclePhoto(null); setIsUploadModalOpen(false); setActiveTab('draft');
    } else if (error) { alert(`Σφάλμα βάσης δεδομένων: ${error.message}`); }
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

  // --- ΝΕΑ ΜΑΖΙΚΗ ΔΙΑΓΡΑΦΗ ΟΧΗΜΑΤΩΝ ΣΕ ΑΝΑΜΟΝΗ ---
  const handleDeleteAllDrafts = async () => {
    const inactiveVehicles = vehicles.filter(v => !v.is_active);
    if (inactiveVehicles.length === 0) return;
    
    if (!window.confirm(`Είστε σίγουροι ότι θέλετε να διαγράψετε μαζικά και τα ${inactiveVehicles.length} οχήματα σε αναμονή; Η ενέργεια είναι μη αναστρέψιμη.`)) return;
    
    setIsUploading(true);
    const { error } = await supabase.from('vehicles').delete().eq('is_active', false);
    
    if (!error) {
      setVehicles(vehicles.filter(v => v.is_active));
    } else {
      alert(`Σφάλμα κατά τη διαγραφή: ${error.message}`);
    }
    setIsUploading(false);
  };

  const activeCount = vehicles.filter(v => v.is_active).length;
  const draftCount = vehicles.filter(v => !v.is_active).length;
  const totalRevenue = bookings.filter(b => b.total_price > 0).reduce((a, c) => a + c.total_price, 0);

  const groupedNotes = notes.reduce((acc, note) => {
    const d = new Date(note.created_at); const dateStr = d.toLocaleDateString('el-GR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    if (!acc[dateStr]) acc[dateStr] = []; acc[dateStr].push(note); return acc;
  }, {} as Record<string, Note[]>);

  // --- ΚΡΑΤΗΣΕΙΣ LOGIC ---
  const activeDateStr = getFormattedDateString(selectedDailyDate);
  const dailyBookings = bookings.filter(b => activeDateStr >= b.check_in && activeDateStr <= b.check_out);
  const recentBookings = bookings.slice(0, 5); 

  const renderBookingCard = (b: Booking) => (
    <div 
      key={`booking-${b.id}`} 
      onClick={() => openEditBooking(b)} 
      className="bg-[#0A0A0A] border border-white/5 rounded-2xl p-4 flex gap-4 items-center group cursor-pointer hover:bg-white/[0.02] hover:border-white/20 transition-all shadow-lg"
    >
      <div className="w-12 flex flex-col items-center justify-center shrink-0">
         <span className="text-[10px] font-mono text-gray-500 mb-2">#{String(b.id).padStart(4, '0')}</span>
         <div className={`w-2.5 h-2.5 rounded-full ${b.status === 'Χειροκίνητη Δέσμευση' ? 'bg-blue-500 shadow-[0_0_8px_#3b82f6]' : 'bg-[#8B0000] shadow-[0_0_8px_#8B0000]'}`}></div>
      </div>
      <div className="w-px h-12 bg-white/10 shrink-0 hidden md:block"></div>
      <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
        <div className="text-sm font-bold text-white uppercase tracking-wider truncate mb-1">{b.vehicle_model}</div>
        <div className="text-[10px] text-gray-400 truncate flex flex-wrap gap-2 items-center">
          <span className="font-bold text-gray-300">{b.customer_name || 'ΕΣΩΤΕΡΙΚΟ BLOCK'}</span>
          <span className="text-gray-600 hidden md:inline">|</span>
          <span className="font-mono text-[#8B0000]">{b.check_in.slice(5).replace('-','/')} → {b.check_out.slice(5).replace('-','/')}</span>
        </div>
      </div>
      <div className="flex flex-row items-center justify-end gap-3 shrink-0">
        {b.total_price > 0 && <span className="text-sm font-bold text-white font-mono mr-2">€{b.total_price}</span>}
        <button 
          onClick={(e) => { e.stopPropagation(); openEditBooking(b); }} 
          className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#8B0000] text-gray-400 hover:text-white rounded-xl transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
        </button>
      </div>
    </div>
  );

  const AdminDateVisualizer = () => {
    const year = adminCalDate.getFullYear(); const month = adminCalDate.getMonth(); const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysShortLocal = ["Κυρ", "Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ"]; 
    const daysElements = [];
    for (let day = 1; day <= daysInMonth; day++) {
       const d = new Date(year, month, day); const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
       const booking = vehicleBookings.find(b => dateStr >= b.check_in && dateStr <= b.check_out);

       let boxClass = "flex-shrink-0 w-[4.5rem] h-[5.5rem] flex flex-col items-center justify-center rounded-2xl border transition-all cursor-pointer snap-center ";
       
       if (manualDates.start === dateStr || manualDates.end === dateStr) boxClass += "bg-white/20 border-white text-white shadow-lg scale-105";
       else if (manualDates.start && manualDates.end && dateStr > manualDates.start && dateStr < manualDates.end) boxClass += "bg-white/10 border-white/30 text-white";
       else if (booking) {
           if (booking.status === 'Χειροκίνητη Δέσμευση') boxClass += "bg-blue-600/20 border-blue-500/40 text-blue-400 opacity-80 cursor-pointer hover:bg-blue-600/30";
           else boxClass += "bg-[#8B0000]/20 border-red-500/40 text-red-400 opacity-80 cursor-pointer hover:bg-[#8B0000]/30";
       } else boxClass += "bg-black border-white/10 text-gray-500 hover:bg-white/10 hover:text-white hover:border-white/30";

       daysElements.push(
         <div 
           key={dateStr} className={boxClass} 
           onClick={() => {
             if (!booking) {
               if (!manualDates.start || (manualDates.start && manualDates.end)) setManualDates({ start: dateStr, end: '' });
               else if (dateStr > manualDates.start) setManualDates({ ...manualDates, end: dateStr });
               else setManualDates({ start: dateStr, end: '' });
             } else {
               openEditBooking(booking);
             }
           }}
         >
           <span className="text-[10px] uppercase font-bold tracking-widest mb-1">{daysShortLocal[d.getDay()]}</span>
           <span className="text-xl font-bold">{day}</span>
         </div>
       );
    }

    return (
      <div className="bg-[#111] py-5 px-1 md:px-6 md:p-6 rounded-3xl border border-white/5 mb-6 shadow-inner">
         <div className="flex justify-between items-center mb-6 px-4 md:px-0">
           <button type="button" onClick={() => setAdminCalDate(new Date(year, month - 1, 1))} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
           <span className="text-sm font-bold text-white uppercase tracking-widest">{longMonths[month]} {year}</span>
           <button type="button" onClick={() => setAdminCalDate(new Date(year, month + 1, 1))} className="w-10 h-10 flex items-center justify-center bg-white/5 rounded-full text-gray-400 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
         </div>
         <div className="flex overflow-x-auto gap-3 hide-scrollbar snap-x snap-mandatory px-4 md:px-0 pb-2">{daysElements}</div>
         <div className="mt-5 flex flex-wrap gap-4 text-[9px] uppercase tracking-widest text-gray-500 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-black border border-white/10 rounded"></div> Ελευθερο</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#8B0000]/20 border border-red-500/40 rounded"></div> Κρατηση Πελατη (Κλικ για προβολη)</div>
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
        {filtered.map((v) => {
          const avail = v.availability?.[0] || 'Ενοικίαση';
          const priceSuffix = avail === 'Ενοικίαση' ? '/ΗΜ' : avail === 'Leasing' ? '/ΜΗΝΑ' : '';

          return (
            <div key={v.id} className="group bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden hover:border-[#8B0000]/50 transition-all flex flex-col shadow-2xl relative">
              <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1 w-full pr-16 pointer-events-none">
                <div className="bg-[#8B0000]/20 border border-[#8B0000]/30 px-2 py-1 rounded text-[9px] font-bold text-red-500 tracking-wider uppercase shadow-lg">{v.category}</div>
                {v.availability && v.availability.map(a => (
                  <div key={a} className="bg-white/10 border border-white/20 px-2 py-1 rounded text-[9px] font-bold text-white tracking-wider uppercase shadow-lg backdrop-blur-md">{a}</div>
                ))}
              </div>
              
              <div onClick={() => openCalendarModal(v)} className="h-40 md:h-44 bg-[#050505] relative border-b border-white/5 flex items-center justify-center overflow-hidden cursor-pointer group/img">
                {v.photos && v.photos.length > 0 ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={v.photos[0]} alt={v.model} className="w-full h-full object-cover opacity-80 group-hover/img:opacity-40 group-hover/img:scale-105 transition-all duration-500" />
                ) : <svg className="w-16 h-16 text-white/5 group-hover/img:opacity-40 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center z-20">
                    <span className="text-white text-[10px] font-bold uppercase tracking-widest bg-[#8B0000] border border-red-500/50 px-5 py-2.5 rounded-full">Ημερολογιο</span>
                </div>
              </div>

              <div className="p-4 md:p-5 flex-1 flex flex-col bg-gradient-to-b from-[#0A0A0A] to-[#050505]">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-full">
                    <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest font-bold mb-1 flex justify-between items-center">
                      <span>{v.brand}</span>
                      <span className="font-mono text-gray-600 bg-white/5 px-2 py-0.5 rounded border border-white/5">#{String(v.id).padStart(4, '0')}</span>
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-white tracking-tight leading-tight">{v.model}</h3>
                    <div className="flex flex-wrap gap-1.5 md:gap-2 mt-2 md:mt-3">
                      <span className="text-[9px] md:text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.hp} HP</span>
                      <span className="text-[9px] md:text-[10px] text-gray-300 font-mono bg-white/5 border border-white/10 px-2 py-1 rounded shadow-inner">{v.transmission}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-auto pt-3 md:pt-4 border-t border-white/10 flex justify-between items-center">
                  <div className="text-lg md:text-xl font-bold text-white">€{v.price}<span className="text-[8px] md:text-[9px] text-gray-500 ml-1">{priceSuffix}</span></div>
                  <div className="flex items-center gap-3 md:gap-4">
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" checked={v.is_active} onChange={() => toggleStatus(v.id, v.is_active)} />
                        <div className={`block w-9 md:w-10 h-5 md:h-6 rounded-full transition-colors ${v.is_active ? 'bg-[#8B0000]' : 'bg-gray-800'}`}></div>
                        <div className={`absolute left-1 top-1 bg-white w-3 md:w-4 h-3 md:h-4 rounded-full transition-transform ${v.is_active ? 'transform translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                    <button onClick={() => deleteVehicle(v.id)} className="text-gray-500 hover:text-red-500 transition-colors p-1"><svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-[#8B0000]/30 flex overflow-x-hidden">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#0A0A0A]/95 backdrop-blur-xl border-b border-white/5 z-40 flex items-center justify-between px-5">
        <AutoLazaridisLogo className="h-8 w-auto" />
        <button onClick={() => setIsMobileMenuOpen(true)} className="text-white p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
      </div>

      {/* BACKDROP FOR MOBILE SIDEBAR */}
      {isMobileMenuOpen && <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)}></div>}

      {/* SIDEBAR NAVIGATION */}
      <aside className={`w-64 bg-[#0A0A0A] md:bg-[#0A0A0A]/80 md:backdrop-blur-2xl border-r border-white/5 flex flex-col fixed h-full z-50 transition-transform duration-300 ease-in-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="p-6 border-b border-white/5 flex justify-between md:justify-center items-center">
          <AutoLazaridisLogo className="h-10 md:h-14 w-auto" />
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-white">✕</button>
        </div>
        <div className="p-6 flex-1 space-y-2 overflow-y-auto hide-scrollbar">
          <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-4">Διαχειριση</div>
          <button onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dashboard' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Επισκοπηση</button>
          <button onClick={() => { setActiveTab('active'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'active' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><span>Ενεργος Στολος</span><span className="bg-black/50 border border-white/10 text-gray-300 px-2 py-0.5 rounded text-[9px]">{activeCount}</span></button>
          <button onClick={() => { setActiveTab('draft'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'draft' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><span>Σε Αναμονη</span>{draftCount > 0 && <span className="bg-white/10 text-white px-2 py-0.5 rounded text-[9px]">{draftCount}</span>}</button>
          <button onClick={() => { setActiveTab('categories'); fetchCategories(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'categories' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}><span>Κατηγοριες Στολου</span><span className="bg-black/50 border border-white/10 text-gray-500 px-2 py-0.5 rounded text-[9px]">{dbCategories.length}</span></button>
          <button onClick={() => { setActiveTab('bookings'); fetchBookings(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'bookings' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>Κρατησεις</button>
          <div className="pt-4 mt-4 border-t border-white/5"><button onClick={() => { setActiveTab('notes'); fetchNotes(); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'notes' ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'}`}>Αρχειο</button></div>
        </div>
        <div className="p-6 border-t border-white/5 flex flex-col gap-3">
           <button onClick={() => { setIsUploadModalOpen(true); setIsMobileMenuOpen(false); }} className="w-full py-3 md:py-4 bg-white/5 border border-white/10 hover:border-[#8B0000]/50 hover:bg-white/10 text-white rounded-xl text-xs font-bold tracking-wide uppercase transition-all">+ Νεο Οχημα</button>
           <button onClick={handleLogout} className="w-full py-3 bg-transparent hover:bg-red-900/20 text-gray-500 hover:text-red-500 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">Αποσυνδεση</button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 md:ml-64 p-5 md:p-10 pt-24 md:pt-10 relative w-full max-w-[100vw]">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 pb-4 border-b border-white/5 gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl md:text-2xl font-bold tracking-widest text-white uppercase drop-shadow-md">
              {activeTab === 'dashboard' && 'Επισκοπηση Επιχειρησης'}
              {activeTab === 'active' && 'Ενεργος Στολος'}
              {activeTab === 'draft' && 'Οχηματα Αναμονης'}
              {activeTab === 'categories' && 'Διαχειριση Κατηγοριων'}
              {activeTab === 'bookings' && 'Κρατησεις & Ημερολογιο'}
              {activeTab === 'notes' && 'Αρχειο Καταγραφων'}
            </h2>
            
            {/* --- ΚΟΥΜΠΙ ΜΑΖΙΚΗΣ ΔΙΑΓΡΑΦΗΣ (ΜΟΝΟ ΣΤΗΝ ΑΝΑΜΟΝΗ) --- */}
            {activeTab === 'draft' && draftCount > 0 && (
              <button 
                onClick={handleDeleteAllDrafts} 
                disabled={isUploading}
                className="px-3 md:px-4 py-2 bg-red-900/50 hover:bg-red-600 text-white text-[9px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg border border-red-500/50 whitespace-nowrap ml-2 disabled:opacity-50"
              >
                ΔΙΑΓΡΑΦΗ ΟΛΩΝ
              </button>
            )}

            {/* --- ΚΟΥΜΠΙ ΝΕΑΣ ΚΡΑΤΗΣΗΣ (ΕΚΤΟΣ ΣΤΟΛΟΥ) --- */}
            {activeTab === 'bookings' && (
              <button onClick={() => setIsManualBookingModalOpen(true)} className="px-3 md:px-4 py-2 bg-[#8B0000] hover:bg-[#6A0000] text-white text-[8px] md:text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-lg border border-red-900/50 whitespace-nowrap ml-2">
                + ΕΚΤΟΣ ΣΤΟΛΟΥ
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center text-gray-600 uppercase tracking-widest text-sm font-bold animate-pulse">Ανάκτηση δεδομένων...</div>
        ) : (
          <div className="animate-in fade-in duration-500">
            {activeTab === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 max-w-4xl">
                <div className="bg-[#0A0A0A]/80 border border-white/10 p-6 rounded-3xl">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Ενεργος Στολος</span>
                  <div className="text-5xl font-bold text-white mt-2">{activeCount}</div>
                </div>
                <div className="bg-[#0A0A0A]/80 border border-white/10 p-6 rounded-3xl">
                  <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Συνολικα Εσοδα</span>
                  <div className="text-5xl font-bold text-white mt-2">€{totalRevenue.toLocaleString('el-GR')}</div>
                </div>
              </div>
            )}

            {activeTab === 'active' && renderVehicleGrid(true)}
            {activeTab === 'draft' && renderVehicleGrid(false)}

            {/* --- ΝΕΟ ΠΑΝΕΛ: ΔΙΑΧΕΙΡΙΣΗ ΚΑΤΗΓΟΡΙΩΝ --- */}
            {activeTab === 'categories' && (
              <div className="max-w-xl space-y-6">
                <form onSubmit={handleAddCategory} className="flex gap-2 bg-[#0A0A0A] p-4 rounded-2xl border border-white/10 shadow-lg">
                  <input type="text" required placeholder="Όνομα Νέας Κατηγορίας (π.χ. ATV, Cabrio)" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} disabled={isUploading} className="flex-1 bg-black border border-white/5 rounded-xl px-4 py-3 text-xs md:text-sm text-white focus:outline-none focus:border-[#8B0000]" />
                  <button type="submit" disabled={isUploading} className="px-5 py-3 bg-[#8B0000] hover:bg-[#6A0000] text-white font-bold rounded-xl text-[10px] tracking-widest uppercase transition-colors">ΠΡΟΣΘΗΚΗ</button>
                </form>
                <div className="bg-[#0A0A0A] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
                  <div className="p-4 border-b border-white/5 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Υπαρχουσες Κατηγοριες (Φαινονται στη Βιτρίνα)</div>
                  <div className="divide-y divide-white/5">
                    {dbCategories.map(c => (
                      <div key={c.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                        <span className="text-white font-bold text-xs md:text-sm uppercase tracking-wider">{c.name}</span>
                        <div className="flex items-center gap-4">
                           <label className="flex items-center cursor-pointer">
                             <div className="relative">
                               <input type="checkbox" className="sr-only" checked={c.is_active} onChange={() => handleToggleCategoryStatus(c.id, c.is_active)} />
                               <div className={`block w-9 h-5 rounded-full transition-colors ${c.is_active ? 'bg-[#8B0000]' : 'bg-gray-800'}`}></div>
                               <div className={`absolute left-1 top-1 bg-white w-3 h-3 rounded-full transition-transform ${c.is_active ? 'transform translate-x-4' : ''}`}></div>
                             </div>
                           </label>
                           <button onClick={() => handleDeleteCategory(c.id, c.name)} className="text-gray-500 hover:text-red-500 transition-colors p-1">✕</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* --- ΗΜΕΡΗΣΙΟ ΠΡΟΓΡΑΜΜΑ & ΝΕΕΣ ΚΡΑΤΗΣΕΙΣ --- */}
            {activeTab === 'bookings' && (
              <div className="max-w-4xl space-y-10">
                
                {/* SECTION: ΠΡΟΣΦΑΤΕΣ ΚΡΑΤΗΣΕΙΣ */}
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e] animate-pulse"></span>
                    Νεες Αφιξεις (Τελευταιες 5)
                  </h3>
                  <div className="space-y-3">
                    {recentBookings.length === 0 ? (
                      <div className="text-center text-gray-500 text-[10px] uppercase tracking-widest py-8 font-bold border border-white/5 rounded-2xl bg-[#0A0A0A]">Καμια Κρατηση ακομα.</div>
                    ) : (
                      recentBookings.map(renderBookingCard)
                    )}
                  </div>
                </div>

                {/* SECTION: ΗΜΕΡΗΣΙΟ ΠΡΟΓΡΑΜΜΑ */}
                <div>
                  <div className="flex justify-between items-center mb-6 px-2">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#8B0000] shadow-[0_0_8px_#8B0000]"></span>
                      Ημερησιο Προγραμμα
                    </h3>
                    
                    <div className="flex items-center gap-2 bg-[#0A0A0A] p-1 rounded-full border border-white/10">
                      <button onClick={() => { const prev = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() - 1, 1); setCurrentMonthView(prev); setSelectedDailyDate(prev); }} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
                      <span className="text-[10px] font-bold tracking-widest uppercase text-white min-w-[100px] text-center">{longMonths[currentMonthView.getMonth()]} {currentMonthView.getFullYear()}</span>
                      <button onClick={() => { const next = new Date(currentMonthView.getFullYear(), currentMonthView.getMonth() + 1, 1); setCurrentMonthView(next); setSelectedDailyDate(next); }} className="w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:bg-white/10 hover:text-white transition-colors"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 overflow-x-auto hide-scrollbar snap-x snap-mandatory px-2 pb-4">
                    {calendarDaysArray.map((d) => {
                      const dStr = getFormattedDateString(d); const isSelected = dStr === activeDateStr;
                      return (
                        <div key={dStr} id={isSelected ? 'calendar-active-day' : undefined} onClick={() => setSelectedDailyDate(d)} className={`snap-center flex-shrink-0 w-[4.5rem] h-[5.5rem] flex flex-col items-center justify-center rounded-2xl cursor-pointer transition-all duration-300 ${isSelected ? 'bg-[#8B0000] text-white shadow-lg scale-105' : 'bg-[#111] border border-white/5 text-gray-500 hover:bg-white/10 hover:text-white'}`}>
                          <span className={`text-[10px] uppercase font-bold tracking-widest mb-1 ${isSelected ? 'text-white/80' : ''}`}>{shortDays[d.getDay()]}</span>
                          <span className="text-2xl font-light mb-1">{d.getDate()}</span>
                          <span className={`text-[9px] uppercase tracking-widest ${isSelected ? 'text-white/80' : ''}`}>{shortMonths[d.getMonth()]}</span>
                        </div>
                      )
                    })}
                  </div>

                  <div className="space-y-3 pt-2">
                    {dailyBookings.length === 0 ? (
                      <div className="text-center text-gray-500 text-[10px] uppercase tracking-widest py-12 font-bold bg-[#0A0A0A] border border-white/5 rounded-2xl">Καμια ενεργη κρατηση για την επιλεγμενη ημερομηνια.</div>
                    ) : (
                      dailyBookings.map(renderBookingCard)
                    )}
                  </div>
                </div>

              </div>
            )}

            {/* --- ΕΝΟΤΗΤΑ ΑΡΧΕΙΟΥ --- */}
            {activeTab === 'notes' && (
              <div className="max-w-4xl">
                <form onSubmit={handleAddNote} className="flex flex-col sm:flex-row gap-3 bg-[#0A0A0A] p-4 rounded-[1.5rem] border border-white/10 mb-10 items-end">
                  <div className="w-full sm:w-1/4">
                    <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Ετικέτα</label>
                    <input type="text" placeholder="π.χ. Έξοδα" value={noteInput.tag} onChange={e => setNoteInput({...noteInput, tag: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Περιγραφή *</label>
                    <input type="text" required placeholder="Γράψτε τη σημείωση..." value={noteInput.content} onChange={e => setNoteInput({...noteInput, content: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                  <div className="w-full sm:w-1/4">
                    <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1">Ποσό €</label>
                    <input type="number" placeholder="π.χ. -50" value={noteInput.amount} onChange={e => setNoteInput({...noteInput, amount: e.target.value})} className="w-full bg-black border border-white/5 rounded-xl px-4 py-3.5 text-xs text-white focus:outline-none focus:border-[#8B0000] font-mono" />
                  </div>
                  <button type="submit" className="px-6 py-3.5 h-[46px] bg-[#8B0000] hover:bg-[#6A0000] text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all">ΚΑΤΑΓΡΑΦΗ</button>
                </form>
                <div className="space-y-8">
                  {Object.entries(groupedNotes).map(([date, dayNotes]) => (
                    <div key={date}>
                      <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 pl-2 border-l-2 border-[#8B0000]">{date}</div>
                      <div className="space-y-2">
                        {dayNotes.map(note => (
                          <div key={note.id} className="bg-[#0A0A0A] p-4 rounded-xl border border-white/5 flex justify-between items-center group">
                            <div className="flex gap-4 items-center flex-1">
                              {note.tag && <span className="text-[#8B0000] font-bold text-[10px] uppercase tracking-widest bg-[#8B0000]/10 px-2 py-1 rounded">{note.tag}</span>}
                              <span className="text-gray-300 text-xs md:text-sm">{note.content}</span>
                            </div>
                            <div className="flex items-center gap-4">
                              {note.amount !== null && <span className={`font-mono font-bold text-sm ${note.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>{note.amount > 0 ? '+' : ''}{note.amount}€</span>}
                              <button onClick={() => deleteNote(note.id)} className="text-gray-600 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100">✕</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* --- MODAL ΧΕΙΡΟΚΙΝΗΤΗΣ ΚΡΑΤΗΣΗΣ --- */}
      {isManualBookingModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[300] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Νεα Κρατηση (Εκτος Στολου)</h3>
              <button onClick={() => setIsManualBookingModalOpen(false)} className="text-gray-500 hover:text-white p-2">✕</button>
            </div>
            <div className="overflow-y-auto hide-scrollbar p-5 md:p-8">
              <form onSubmit={handleCreateManualBooking} className="space-y-4">
                 <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μοντελο Οχηματος / Περιγραφη</label>
                    <input type="text" placeholder="Fiat Panda" value={manualBookingData.vehicle_model} onChange={(e) => setManualBookingData({...manualBookingData, vehicle_model: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Ονομα Πελατη</label>
                      <input type="text" placeholder="Προαιρετικό" value={manualBookingData.customer_name} onChange={(e) => setManualBookingData({...manualBookingData, customer_name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τηλεφωνο</label>
                      <input type="text" placeholder="Προαιρετικό" value={manualBookingData.customer_phone} onChange={(e) => setManualBookingData({...manualBookingData, customer_phone: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Check-in</label>
                      <input type="date" value={manualBookingData.check_in} onChange={(e) => setManualBookingData({...manualBookingData, check_in: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Check-out</label>
                      <input type="date" value={manualBookingData.check_out} onChange={(e) => setManualBookingData({...manualBookingData, check_out: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                    </div>
                 </div>
                 <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τελικο Εσοδο (€)</label>
                    <input type="number" placeholder="0" value={manualBookingData.total_price} onChange={(e) => setManualBookingData({...manualBookingData, total_price: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs font-bold text-white focus:outline-none focus:border-[#8B0000]" />
                 </div>
                 <button type="submit" className="w-full py-3.5 bg-[#8B0000] text-white rounded-xl text-[10px] font-bold tracking-widest uppercase mt-4">ΚΑΤΑΧΩΡΗΣΗ</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ΠΡΟΣΘΗΚΗΣ ΟΧΗΜΑΤΟΣ --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[100] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Νεο Οχημα</h3>
              <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-white p-2">✕</button>
            </div>
            
            <div className="overflow-y-auto hide-scrollbar p-5 md:p-8">
              <form onSubmit={handleAddVehicle} className="space-y-5">
                
                {/* --- ΓΡΗΓΟΡΗ ΕΙΣΑΓΩΓΗ ΠΡΟΤΥΠΟΥ (PRESETS) --- */}
                {uniqueVehicles.length > 0 && (
                  <div className="bg-[#8B0000]/10 border border-[#8B0000]/20 p-4 md:p-5 rounded-xl mb-4 md:mb-6">
                    <label className="block text-[9px] md:text-[10px] font-bold text-[#8B0000] uppercase tracking-widest mb-2">Γρηγορη Εισαγωγη (Απο Υπαρχοντα)</label>
                    <select onChange={handlePresetChange} disabled={isUploading} className="w-full bg-black border border-[#8B0000]/30 rounded-xl px-3 md:px-4 py-3 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#8B0000] disabled:opacity-50 appearance-none font-bold">
                      <option value="">-- Δημιουργία από την αρχή --</option>
                      {allUniqueCategories.map((cat: string) => (
                        <optgroup key={cat} label={cat.toUpperCase()} className="text-gray-500 font-bold bg-[#111]">
                          {uniqueVehicles.filter(v => v.category === cat).map(v => (
                            <option key={v.id} value={v.id} className="text-white font-normal">
                              ID: #{String(v.id).padStart(4, '0')} - {v.brand} {v.model}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μαρκα</label>
                    <input type="text" required placeholder="Suzuki" value={newVehicle.brand} onChange={(e) => setNewVehicle({...newVehicle, brand: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Μοντελο</label>
                    <input type="text" required placeholder="Swift" value={newVehicle.model} onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κατηγορια</label>
                    <select required value={newVehicle.category} onChange={(e) => setNewVehicle({...newVehicle, category: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000] font-bold appearance-none">
                      <option value="">-- Επιλογή Κατηγορίας --</option>
                      {dbCategories.filter(c => c.is_active).map(c => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Αλογα (HP)</label>
                    <input type="number" required placeholder="90" value={newVehicle.hp} onChange={(e) => setNewVehicle({...newVehicle, hp: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Κιβωτιο</label>
                    <select required value={newVehicle.transmission} onChange={(e) => setNewVehicle({...newVehicle, transmission: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000] font-bold">
                      <option value="Χειροκίνητο">Χειροκίνητο</option>
                      <option value="Αυτόματο">Αυτόματο</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-2">Τιμη (€)</label>
                    <input type="number" required placeholder="45" value={newVehicle.price} onChange={(e) => setNewVehicle({...newVehicle, price: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 text-xs text-white focus:outline-none focus:border-[#8B0000] font-bold" />
                  </div>
                </div>

                <div className="bg-[#111] border border-white/5 p-4 rounded-xl">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">Διαθεσιμοτητα</label>
                  <div className="flex gap-6">
                    {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => (
                      <label key={type} className="flex items-center gap-2 text-xs text-white cursor-pointer group">
                        <input type="radio" name="availability" checked={newVehicle.availability.includes(type)} onChange={() => handleAvailabilityChange(type)} className="peer sr-only" />
                        <div className="w-4 h-4 border-2 border-white/20 rounded-full bg-black peer-checked:border-[#8B0000] flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-[#8B0000] opacity-0 peer-checked:opacity-100"></div>
                        </div>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-gray-300 group-hover:text-white">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 border border-white/5 p-4 rounded-xl">
                  <label className="block text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-3">Φωτογραφια Οχηματος</label>
                  
                  {newVehicle.existingPhotoUrl && !vehiclePhoto && (
                    <div className="mb-3 text-[9px] md:text-[10px] text-green-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      Φωτογραφια Προτυπου Επιλεγμενη
                    </div>
                  )}

                  <input 
                    type="file" 
                    accept="image/*" 
                    required={!newVehicle.existingPhotoUrl} 
                    onChange={(e) => setVehiclePhoto(e.target.files?.[0] || null)} 
                    disabled={isUploading}
                    className="w-full text-xs text-white file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:tracking-widest file:bg-[#8B0000]/20 file:text-[#8B0000] hover:file:bg-[#8B0000]/40 transition-all cursor-pointer" 
                  />
                  {newVehicle.existingPhotoUrl && (
                    <p className="text-[8px] md:text-[9px] text-gray-600 mt-2">Αν επιλέξετε νέο αρχείο, θα αντικαταστήσει την υπάρχουσα φωτογραφία του προτύπου.</p>
                  )}
                </div>

                <button type="submit" disabled={isUploading} className="w-full py-4 bg-[#8B0000] hover:bg-[#6A0000] text-white rounded-xl text-xs font-bold tracking-widest uppercase mt-4 transition-all">
                  {isUploading ? 'ΚΑΤΑΧΩΡΗΣΗ...' : 'ΚΑΤΑΧΩΡΗΣΗ ΣΤΟ ΜΗΤΡΩΟ'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ΕΠΕΞΕΡΓΑΣΙΑΣ / ΠΡΟΒΟΛΗΣ ΚΡΑΤΗΣΗΣ (Z-INDEX 500) --- */}
      {editingBooking && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[500] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh] shadow-[0_0_50px_rgba(0,0,0,1)]">
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <h3 className="text-xs font-bold text-white tracking-widest uppercase">Λεπτομερειες Κρατησης</h3>
              <button onClick={() => setEditingBooking(null)} disabled={isUploading} className="text-gray-500 hover:text-white p-2 transition-colors">✕</button>
            </div>
            
            <div className="overflow-y-auto hide-scrollbar p-5 md:p-8">
              
              <div className="bg-[#111] p-5 rounded-2xl border border-white/5 mb-6">
                 <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Οχημα: #{String(editingBooking.id).padStart(4, '0')}</div>
                 <div className="text-base font-bold text-white mb-5">{editingBooking.vehicle_model}</div>
                 
                 {editingBooking.customer_name ? (
                   <div className="pt-5 border-t border-white/5">
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">Στοιχεια Πελατη</div>
                     
                     <div className="bg-black/30 border border-white/5 rounded-xl p-4 mb-5 space-y-4">
                       <div>
                         <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Ονοματεπωνυμο</div>
                         <div className="text-sm font-bold text-white">{editingBooking.customer_name}</div>
                       </div>
                       <div className="grid grid-cols-2 gap-4">
                         <div>
                           <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Τηλεφωνο</div>
                           <div className="text-xs text-gray-300 font-mono bg-white/5 px-2 py-1 rounded inline-block">{editingBooking.customer_phone || '-'}</div>
                         </div>
                         <div>
                           <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Email</div>
                           <div className="text-xs text-gray-300 bg-white/5 px-2 py-1 rounded inline-block truncate max-w-full">{editingBooking.customer_email || '-'}</div>
                         </div>
                       </div>
                       <div>
                           <div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Ημ/νια Αιτηματος</div>
                           <div className="text-xs text-gray-400 font-mono">{new Date(editingBooking.created_at).toLocaleString('el-GR')}</div>
                       </div>
                     </div>
                     
                     <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Εγγραφα (Fast Track)</div>
                     <div className="flex gap-2 w-full">
                       {editingBooking.id_photo_url && (
                         <a href={editingBooking.id_photo_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors shadow-lg">
                           ΤΑΥΤΟΤΗΤΑ
                         </a>
                       )}
                       {editingBooking.license_photo_url && (
                         <a href={editingBooking.license_photo_url} target="_blank" rel="noreferrer" className="flex-1 text-center bg-white/10 text-white border border-white/20 hover:bg-white/20 px-3 py-3 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-colors shadow-lg">
                           ΔΙΠΛΩΜΑ
                         </a>
                       )}
                       {!editingBooking.id_photo_url && !editingBooking.license_photo_url && (
                         <div className="w-full text-center text-gray-600 text-[10px] uppercase tracking-widest border border-white/5 rounded-xl py-3 bg-black/20">ΚΑΝΕΝΑ ΕΓΓΡΑΦΟ</div>
                       )}
                     </div>
                   </div>
                 ) : (
                    <div className="pt-5 border-t border-white/5 text-[10px] italic text-gray-600 uppercase tracking-widest">ΕΣΩΤΕΡΙΚΟ BLOCK ΔΙΑΘΕΣΙΜΟΤΗΤΑΣ</div>
                 )}
              </div>

              <form onSubmit={handleUpdateBooking} className="space-y-5 md:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Απο (Check-in)</label>
                    <input type="date" required value={editDates.check_in} onChange={(e) => setEditDates({...editDates, check_in: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#8B0000] disabled:opacity-50" />
                  </div>
                  <div>
                    <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Εως (Check-out)</label>
                    <input type="date" required value={editDates.check_out} onChange={(e) => setEditDates({...editDates, check_out: e.target.value})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#8B0000] disabled:opacity-50" />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Συνολικο Εσοδο (€)</label>
                  <input type="number" required value={editDates.total_price} onChange={(e) => setEditDates({...editDates, total_price: Number(e.target.value)})} disabled={isUploading} className="w-full bg-[#050505] border border-white/10 rounded-xl px-3 py-3 md:px-4 md:py-3.5 text-xs md:text-sm text-white focus:outline-none focus:border-[#8B0000] font-bold disabled:opacity-50" />
                </div>

                <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button type="button" onClick={() => deleteBooking(editingBooking.id)} disabled={isUploading} className="w-full sm:flex-1 py-3.5 md:py-4 bg-transparent border border-red-900 hover:bg-red-900/20 text-red-500 rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50">
                    ΔΙΑΓΡΑΦΗ ΚΡΑΤΗΣΗΣ
                  </button>
                  <button type="submit" disabled={isUploading} className="w-full sm:flex-1 py-3.5 md:py-4 bg-[#8B0000] hover:bg-[#6A0000] text-white rounded-xl text-[10px] md:text-xs font-bold tracking-widest uppercase transition-all disabled:opacity-50">
                    {isUploading ? 'ΑΠΟΘΗΚΕΥΣΗ...' : 'ΑΠΟΘΗΚΕΥΣΗ ΑΛΛΑΓΩΝ'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL ΗΜΕΡΟΛΟΓΙΟΥ (Z-INDEX 150) --- */}
      {isCalendarModalOpen && selectedVehicle && (
        <div className="fixed inset-0 bg-[#050505]/95 backdrop-blur-2xl flex items-center justify-center z-[150] p-4">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-black/20 shrink-0">
              <div>
                <h3 className="text-xs font-bold text-white tracking-widest uppercase">Διαθεσιμοτητα Οχηματος</h3>
                <p className="text-[9px] text-gray-500 uppercase tracking-widest mt-1">{selectedVehicle.brand} {selectedVehicle.model}</p>
              </div>
              <button onClick={() => setIsCalendarModalOpen(false)} className="text-gray-500 hover:text-white p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto hide-scrollbar p-5 md:p-8 space-y-6 md:space-y-8">
              
              <AdminDateVisualizer />

              <div className="bg-[#111] p-5 md:p-6 rounded-2xl border border-white/5">
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Εσωτερικο Block (Μη διαθεσιμο)</h4>
                <form onSubmit={handleManualBlock} className="flex flex-col sm:flex-row items-end gap-3 md:gap-4">
                  <div className="w-full sm:flex-1">
                    <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1.5">Απο</label>
                    <input type="date" required value={manualDates.start} onChange={e => setManualDates({...manualDates, start: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                  <div className="w-full sm:flex-1">
                    <label className="block text-[8px] text-gray-500 uppercase tracking-widest mb-1.5">Εως</label>
                    <input type="date" required value={manualDates.end} onChange={e => setManualDates({...manualDates, end: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B0000]" />
                  </div>
                  <button type="submit" disabled={isUploading} className="w-full sm:w-auto px-6 py-2.5 bg-[#8B0000] hover:bg-[#6A0000] text-white rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all mt-2 sm:mt-0">
                    ΠΡΟΣΘΗΚΗ
                  </button>
                </form>
              </div>

              <div>
                <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Ενεργες Κρατησεις Οχηματος</h4>
                <div className="space-y-2">
                  {vehicleBookings.length === 0 ? (
                    <div className="text-center text-gray-600 text-[9px] uppercase tracking-widest py-4">Το όχημα είναι ελεύθερο.</div>
                  ) : (
                    vehicleBookings.map(renderBookingCard)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function ProtectedCommandCenter() {
  return <AuthGate><AdminDashboard /></AuthGate>;
}