'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Απευθείας σύνδεση Supabase ---
const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CSS & Τυπογραφία (Βελτιστοποιημένα για iPhone) ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:opsz,wght@5..1200,300;5..1200,400;5..1200,600&display=swap');
    
    body { 
      background-color: #030303; 
      color: #FFFFFF; 
      font-family: 'Inter', sans-serif; 
      -webkit-font-smoothing: antialiased; 
      -webkit-tap-highlight-color: transparent;
    }
    .font-serif-premium { font-family: 'Playfair Display', serif; }
    
    ::-webkit-scrollbar { display: none; } /* Απόκρυψη scrollbar για καθαρό native iOS look */
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-intro-title { animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .animate-intro-subtitle { opacity: 0; animation: fadeIn 1.5s ease-out 1.2s forwards; }
    
    /* Safespace padding για iPhone Home Bar */
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 2rem); }
  `}</style>
);

// --- Το Αυθεντικό Ψηφιακό Λογότυπο ---
const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  <svg viewBox="0 0 400 120" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 65 Q 120 65 180 25 T 320 50 Q 350 60 380 65" stroke="url(#silverGrad)" strokeWidth="4" strokeLinecap="round"/>
    <path d="M30 65 L 50 55 L 55 65 Z" fill="#D90000" />
    <path d="M360 60 L 390 65 L 375 55 Z" fill="#D90000" />
    <text x="200" y="75" fontFamily="Arial, sans-serif" fontSize="30" fontWeight="900" fill="#D90000" textAnchor="middle" letterSpacing="4">AUTO</text>
    <text x="200" y="110" fontFamily="Arial, sans-serif" fontSize="28" fontWeight="900" fill="url(#silverGrad)" textAnchor="middle" letterSpacing="10">ΛΑΖΑΡΙΔΗΣ</text>
    <defs>
      <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor="#9CA3AF" /><stop offset="50%" stopColor="#FFFFFF" /><stop offset="100%" stopColor="#9CA3AF" />
      </linearGradient>
    </defs>
  </svg>
);

const CATEGORY_STOCK_PHOTOS: Record<string, string> = {
  'Premium': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80',
  'SUV / 4x4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2000&q=80',       
  'Sedan': 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=2000&q=80',           
  'Compact / Hatchback': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2000&q=80'
};

type Vehicle = { id: number; plate: string; model: string; cc: string; hp: string; price: number; is_active: boolean; category: string; photos: string[]; };

export default function PremiumFleetApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  
  const [introVisible, setIntroVisible] = useState(true);
  const [introRendered, setIntroRendered] = useState(true);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null; }>({ start: null, end: null });
  const [calendarDate, setCalendarDate] = useState(new Date());

  // Fast Check-In State
  const [idUploaded, setIdUploaded] = useState(false);
  const [licenseUploaded, setLicenseUploaded] = useState(false);

  useEffect(() => {
    const fadeOutTimer = setTimeout(() => setIntroVisible(false), 3500);
    const unmountTimer = setTimeout(() => setIntroRendered(false), 4500);
    async function fetchVehicles() {
      const { data } = await supabase.from('vehicles').select('*').eq('is_active', true).order('price', { ascending: false });
      if (data) setVehicles(data);
      setLoading(false);
    }
    fetchVehicles();
    return () => { clearTimeout(fadeOutTimer); clearTimeout(unmountTimer); };
  }, []);

  useEffect(() => {
    if (!selectedVehicle) {
      setCalendarDate(new Date());
      setIdUploaded(false);
      setLicenseUploaded(false);
    }
  }, [selectedVehicle]);

  const getCalculatedDays = () => {
    if (!selectedRange.start || !selectedRange.end) return 1;
    const start = new Date(selectedRange.start);
    const end = new Date(selectedRange.end);
    const diffDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)); 
    return diffDays <= 0 ? 1 : diffDays;
  };

  const calculateTotal = () => {
    if (!selectedVehicle) return 0;
    return getCalculatedDays() * selectedVehicle.price;
  };

  const handleBooking = async () => {
    if (!selectedVehicle || !selectedRange.start || !selectedRange.end) return;
    setIsSubmitting(true);
    
    // Εδώ στο μέλλον θα προσθέσετε τη λογική για το ανέβασμα των αρχείων στο Supabase Storage.
    // Προς το παρόν, αποθηκεύουμε την κατάσταση στην κράτηση (Fast Check-in: Yes/No).
    
    const { error } = await supabase.from('bookings').insert([{ 
      vehicle_id: selectedVehicle.id, vehicle_model: selectedVehicle.model, 
      check_in: selectedRange.start, check_out: selectedRange.end, 
      total_price: calculateTotal(), status: (idUploaded && licenseUploaded) ? 'Νέα Κράτηση (Fast Track)' : 'Νέα Κράτηση' 
    }]);
    setIsSubmitting(false);
    
    if (error) {
      alert(`Σφάλμα: ${error.message}`);
    } else {
      alert('Το αίτημά σας καταχωρήθηκε επιτυχώς. Σας ευχαριστούμε για την προτίμηση.');
      setSelectedVehicle(null);
      setSelectedRange({ start: null, end: null });
    }
  };

  const categories = ['All', 'Premium', 'SUV / 4x4', 'Sedan', 'Compact / Hatchback'];
  const displayedVehicles = activeCategory === 'All' ? vehicles : vehicles.filter(v => v.category === activeCategory);

  const DateRangePicker = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = calendarDate.getFullYear(); 
    const month = calendarDate.getMonth(); 
    const monthNames = ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay() || 7; 
    
    const calendarDays = [];
    for (let i = 1; i < firstDayIndex; i++) calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDateObj = new Date(year, month, day);
        const isPast = currentDateObj < today;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let dayClass = "h-10 flex items-center justify-center text-sm transition-all duration-300 rounded-full ";

        if (isPast) dayClass += " text-gray-700 cursor-not-allowed";
        else if (selectedRange.start === dateStr || selectedRange.end === dateStr) dayClass += " bg-[#D90000] text-white font-bold shadow-[0_4px_10px_rgba(217,0,0,0.4)] scale-110";
        else if (selectedRange.start && selectedRange.end && dateStr > selectedRange.start && dateStr < selectedRange.end) dayClass += " bg-[#D90000]/15 text-[#D90000]";
        else dayClass += " text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer";

        calendarDays.push(<div key={dateStr} onClick={() => {
            if (isPast) return;
            if (!selectedRange.start || (selectedRange.start && selectedRange.end)) setSelectedRange({ start: dateStr, end: null });
            else if (dateStr < selectedRange.start) setSelectedRange({ start: dateStr, end: null });
            else setSelectedRange({ start: selectedRange.start, end: dateStr });
        }} className={dayClass}>{day}</div>);
    }

    return (
        <div className="w-full bg-[#111111] p-5 md:p-6 rounded-[2rem] border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#D90000] text-gray-400 hover:text-white transition-colors">&lt;</button>
            <span className="text-sm font-medium text-white">{monthNames[month]} {year}</span>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#D90000] text-gray-400 hover:text-white transition-colors">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-500 uppercase tracking-widest mb-3">
            <div>Δευ</div><div>Τρι</div><div>Τετ</div><div>Πεμ</div><div>Παρ</div><div>Σαβ</div><div>Κυρ</div>
          </div>
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#D90000]/40 relative">
      <GlobalStyles />

      {/* --- CINEMATIC INTRO --- */}
      {introRendered && (
        <div className={`fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-1000 ${introVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <h1 className="text-4xl md:text-6xl font-serif-premium tracking-widest text-white animate-intro-title">
            AUTO <span className="text-[#D90000]">LAZARIDIS</span>
          </h1>
          <p className="absolute bottom-16 text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-500 animate-intro-subtitle">
            Not everyone drives the same.
          </p>
        </div>
      )}

      {/* HEADER */}
      <header className="fixed top-0 w-full z-40 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 px-5 md:px-12 py-4 flex justify-between items-center transition-all">
        <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
        <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 hidden md:block">Η Ποιοτητα Δεν Ειναι Διαπραγματευσιμη</div>
      </header>

      {/* HERO SECTION */}
      <section className="relative w-full h-[65vh] flex flex-col justify-center items-center text-center px-5 md:px-12 mt-16 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lazaris.jpg" alt="Showroom" className="absolute inset-0 w-full h-full object-cover opacity-15 grayscale mix-blend-luminosity" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303] via-transparent to-[#030303]"></div>
        
        <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <div className="text-gray-500 text-[10px] uppercase tracking-[0.4em] mb-4 md:mb-6">The Private Fleet</div>
          <h1 className="text-4xl md:text-6xl font-serif-premium font-light leading-tight mb-4 md:mb-6 px-2">
            Ανακαλύψτε Την Απόλυτη <br/>
            <span className="italic text-gray-400">Οδηγική Εμπειρία.</span>
          </h1>
          <p className="text-[11px] md:text-sm text-gray-500 max-w-xl mx-auto font-light leading-relaxed tracking-wide px-4">
            Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα. Καθαρή διαφάνεια, αδιαπραγμάτευτη ποιότητα.
          </p>
        </div>
      </section>

      {/* CATEGORY FILTER */}
      <div className="sticky top-[72px] md:top-[84px] z-30 bg-[#030303]/95 backdrop-blur-xl border-y border-white/5 px-5 md:px-12 py-4 flex justify-start md:justify-center gap-3 overflow-x-auto hide-scrollbar shadow-lg">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 ${activeCategory === cat ? 'bg-[#D90000] text-white shadow-[0_4px_15px_rgba(217,0,0,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* FLEET DISPLAY */}
      <main className="px-5 md:px-12 py-16 md:py-20 max-w-[1400px] mx-auto pb-safe">
        {loading ? (
          <div className="text-center py-32 text-gray-500 text-[10px] md:text-sm uppercase tracking-widest animate-pulse">Ενημέρωση Στόλου...</div>
        ) : (
          <div className="flex flex-col gap-10 md:gap-12">
            {displayedVehicles.map(v => (
              <div key={v.id} className="group flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
                
                {/* Image Section */}
                <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CATEGORY_STOCK_PHOTOS[v.category || 'Premium']} alt={v.model} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A] opacity-0 md:opacity-100"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-100 md:opacity-0"></div>
                </div>
                
                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center relative z-10">
                  <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#D90000]/10 text-[#D90000] text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-fit mb-4 md:mb-6 border border-[#D90000]/20">
                    {v.category}
                  </div>
                  
                  <h2 className="text-3xl md:text-5xl font-serif-premium font-light mb-4 md:mb-6 leading-tight">{v.model}</h2>
                  
                  <div className="flex gap-6 md:gap-8 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-white/5">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">Ισχυς</div>
                      <div className="text-lg md:text-xl font-medium">{v.hp} <span className="text-[10px] md:text-xs text-gray-400 font-light">HP</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">Κινητηρας</div>
                      <div className="text-lg md:text-xl font-medium">{v.cc} <span className="text-[10px] md:text-xs text-gray-400 font-light">CC</span></div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">Κοστος</div>
                      <div className="text-2xl md:text-4xl font-light">€{v.price}<span className="text-xs md:text-sm text-gray-500 ml-2">/ ημέρα</span></div>
                    </div>
                    
                    <button 
                      onClick={() => setSelectedVehicle(v)}
                      className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D90000] hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(217,0,0,0.3)]"
                    >
                      Επιλογη
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer className="bg-[#050505] border-t border-white/5 px-6 md:px-12 py-16 md:py-20 pb-safe mt-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <AutoLazaridisLogo className="h-8 md:h-10 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-right text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500">
            <span>7ο χλμ. Δράμας - Καβάλας</span>
            <span>Τηλ: 6948 766884</span>
          </div>
        </div>
      </footer>

      {/* --- BOOKING MODAL (Βελτιστοποιημένο για iPhone) --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity">
          <div className="w-full md:w-[480px] h-full bg-[#0A0A0A] md:border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-500 rounded-t-[2rem] md:rounded-t-none md:rounded-l-[3rem] overflow-hidden mt-12 md:mt-0">
            
            <div className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl z-10 absolute top-0 w-full">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">Κρατηση Οχηματος</h3>
              <button onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#D90000] transition-colors text-white text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pt-20 md:pt-24 pb-8 px-5 md:px-8 space-y-8 hide-scrollbar">
              
              <div className="w-full aspect-video rounded-[1.5rem] md:rounded-[2rem] overflow-hidden relative border border-white/5">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={CATEGORY_STOCK_PHOTOS[selectedVehicle.category || 'Premium']} alt={selectedVehicle.model} className="w-full h-full object-cover grayscale-[10%]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-5 md:left-6">
                   <h2 className="text-xl md:text-2xl font-serif-premium text-white">{selectedVehicle.model}</h2>
                 </div>
              </div>

              <DateRangePicker />

              {/* FAST CHECK-IN MODULE */}
              <div className="bg-[#111] border border-white/5 p-5 md:p-6 rounded-[2rem]">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-[9px] text-[#D90000] uppercase tracking-[0.2em] font-bold mb-1">Fast Track Check-In</h4>
                    <p className="text-[10px] md:text-xs text-gray-500">Ανεβάστε τα έγγραφά σας τώρα για άμεση παραλαβή.</p>
                  </div>
                  <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-[#D90000]/10 text-[#D90000] flex items-center justify-center text-xs">⚡</div>
                </div>
                <div className="flex gap-3 md:gap-4">
                  <button onClick={() => setIdUploaded(!idUploaded)} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${idUploaded ? 'border-[#D90000] bg-[#D90000]/10 text-[#D90000]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                    {idUploaded ? '✓ Ταυτοτητα' : '+ Ταυτοτητα'}
                  </button>
                  <button onClick={() => setLicenseUploaded(!licenseUploaded)} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${licenseUploaded ? 'border-[#D90000] bg-[#D90000]/10 text-[#D90000]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                    {licenseUploaded ? '✓ Διπλωμα' : '+ Διπλωμα'}
                  </button>
                </div>
              </div>

              {selectedRange.start && selectedRange.end && (
                <div className="bg-[#111111] p-6 md:p-8 rounded-[2rem] border border-white/5 flex justify-between items-center">
                  <div>
                    <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">Συνολο</div>
                    <div className="text-gray-400 text-[10px] md:text-xs font-medium">{getCalculatedDays()} Ημέρες</div>
                  </div>
                  <div className="text-3xl md:text-4xl font-serif-premium text-white">€{calculateTotal()}</div>
                </div>
              )}
            </div>

            <div className="p-5 md:p-8 border-t border-white/5 bg-[#050505] pb-safe">
              <button 
                onClick={handleBooking} 
                disabled={!selectedRange.start || !selectedRange.end || isSubmitting} 
                className={`w-full py-4 md:py-5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all duration-300 ${(!selectedRange.start || !selectedRange.end || isSubmitting) ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#D90000] text-white hover:bg-red-700 shadow-[0_10px_20px_rgba(217,0,0,0.3)]'}`}
              >
                {isSubmitting ? 'Επεξεργασια...' : 'Επιβεβαιωση Κρατησης'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}