'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// --- Απευθείας σύνδεση Supabase ---
const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CSS & Τυπογραφία ---
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
    
    ::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-intro-title { animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .animate-intro-subtitle { opacity: 0; animation: fadeIn 1.5s ease-out 1.2s forwards; }
    
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 2rem); }
  `}</style>
);

// --- Το Αυθεντικό Λογότυπο από αρχείο PNG ---
const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img 
    src="/logo.png" 
    alt="Auto Lazaridis" 
    className={className} 
    style={{ objectFit: 'contain' }} 
  />
);

const CATEGORY_STOCK_PHOTOS: Record<string, string> = {
  'Premium': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80',
  'SUV / 4x4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2000&q=80',       
  'Sedan': 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=2000&q=80',           
  'Compact / Hatchback': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2000&q=80'
};

// --- ΛΕΞΙΚΟ (DICTIONARY) ---
const TRANSLATIONS = {
  el: {
    tagline: "Η Ποιοτητα Δεν Ειναι Διαπραγματευσιμη",
    introSubtitle: "Not everyone drives the same.",
    heroTitle1: "Ανακαλύψτε Την Απόλυτη",
    heroTitle2: "Οδηγική Εμπειρία.",
    heroSub: "Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα. Καθαρή διαφάνεια, αδιαπραγμάτευτη ποιότητα.",
    all: "Ολα",
    updating: "Ενημέρωση Στόλου...",
    power: "Ισχυς",
    engine: "Κινητηρας",
    cost: "Κοστος",
    perDay: "/ ημέρα",
    select: "Επιλογη",
    address: "7ο χλμ. Δράμας - Καβάλας",
    tel: "Τηλ: 6948 766884",
    bookingTitle: "Κρατηση Οχηματος",
    fastTrackSub: "Φωτογραφίστε ή ανεβάστε τα έγγραφά σας.",
    idCard: "+ Ταυτοτητα",
    license: "+ Διπλωμα",
    total: "Συνολο",
    days: "Ημέρες",
    paymentOption: "Επιλογη Πληρωμης",
    fullPayment: "Εξοφληση",
    deposit: "Προκαταβολη 30%",
    remaining: "ΥΠΟΛΟΙΠΟ:",
    processing: "Επεξεργασια...",
    securePayment: "ΑΣΦΑΛΗΣ ΠΛΗΡΩΜΗ",
    alertSuccess: "Η πληρωμή ολοκληρώθηκε με επιτυχία. Το όχημα έχει δεσμευτεί.",
    alertCancel: "Η διαδικασία πληρωμής ακυρώθηκε.",
    months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    daysShort: ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"]
  },
  en: {
    tagline: "Quality Is Non-Negotiable",
    introSubtitle: "Not everyone drives the same.",
    heroTitle1: "Discover The Ultimate",
    heroTitle2: "Driving Experience.",
    heroSub: "The most strictly selected vehicle collection in Northern Greece. Pure transparency, non-negotiable quality.",
    all: "All",
    updating: "Updating Fleet...",
    power: "Power",
    engine: "Engine",
    cost: "Cost",
    perDay: "/ day",
    select: "Select",
    address: "7th km Drama - Kavala",
    tel: "Tel: +30 6948 766884",
    bookingTitle: "Vehicle Booking",
    fastTrackSub: "Photograph or upload your documents.",
    idCard: "+ ID Card",
    license: "+ License",
    total: "Total",
    days: "Days",
    paymentOption: "Payment Option",
    fullPayment: "Full Payment",
    deposit: "30% Deposit",
    remaining: "REMAINING:",
    processing: "Processing...",
    securePayment: "SECURE PAYMENT",
    alertSuccess: "Payment completed successfully. The vehicle has been reserved.",
    alertCancel: "The payment process was cancelled.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  }
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

  const [paymentMode, setPaymentMode] = useState<'full' | 'deposit'>('full');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  // --- LANGUAGE STATE ---
  const [lang, setLang] = useState<'el' | 'en'>('el');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    // Ανάκτηση γλώσσας από τη μνήμη του browser (αν υπάρχει)
    const savedLang = localStorage.getItem('autolaz_lang') as 'el' | 'en';
    if (savedLang) setLang(savedLang);

    const urlParams = new URLSearchParams(window.location.search);
    const activeLang = savedLang || 'el';
    
    if (urlParams.get('payment') === 'success') {
      alert(TRANSLATIONS[activeLang].alertSuccess);
      window.history.replaceState(null, '', window.location.pathname);
    } else if (urlParams.get('payment') === 'cancelled') {
      alert(TRANSLATIONS[activeLang].alertCancel);
      window.history.replaceState(null, '', window.location.pathname);
    }

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
      setIdFile(null);
      setLicenseFile(null);
      setPaymentMode('full');
    }
  }, [selectedVehicle]);

  const toggleLanguage = () => {
    const newLang = lang === 'el' ? 'en' : 'el';
    setLang(newLang);
    localStorage.setItem('autolaz_lang', newLang);
  };

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

  const handleBookingToStripe = async () => {
    if (!selectedVehicle || !selectedRange.start || !selectedRange.end) return;
    setIsSubmitting(true);
    
    try {
      const totalCost = calculateTotal();
      const depositAmount = Math.round(totalCost * 0.3);
      const amountToPay = paymentMode === 'full' ? totalCost : depositAmount;
      const totalDays = getCalculatedDays();

      const paymentStatus = paymentMode === 'full' ? '100% Εξόφληση' : '30% Προκαταβολή';
      const fastTrackStatus = (idFile && licenseFile) ? ' (Fast Track)' : '';

      const { error: supabaseError } = await supabase.from('bookings').insert([{ 
        vehicle_id: selectedVehicle.id, 
        vehicle_model: selectedVehicle.model, 
        check_in: selectedRange.start, 
        check_out: selectedRange.end, 
        total_price: totalCost, 
        status: `Εκκρεμεί Πληρωμή: ${paymentStatus}${fastTrackStatus}`,
      }]);

      if (supabaseError) throw new Error(supabaseError.message);

      const stripeDescriptionModifier = paymentMode === 'deposit' ? ' (Deposit 30%)' : ' (Full Payment)';

      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vehicleId: selectedVehicle.id,
          model: selectedVehicle.model + stripeDescriptionModifier,
          price: amountToPay,
          checkIn: selectedRange.start,
          checkOut: selectedRange.end,
          days: totalDays
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        throw new Error("System API failure.");
      }

      if (!response.ok) throw new Error(data.error || 'Stripe initialization failed.');
      if (data.url) window.location.href = data.url;
      else throw new Error('No payment URL returned.');

    } catch (err: any) {
      alert(`Error: ${err.message}`);
      setIsSubmitting(false);
    }
  };

  const categories = ['All', 'Premium', 'SUV / 4x4', 'Sedan', 'Compact / Hatchback'];
  const displayedVehicles = activeCategory === 'All' ? vehicles : vehicles.filter(v => v.category === activeCategory);

  const DateRangePicker = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = calendarDate.getFullYear(); 
    const month = calendarDate.getMonth(); 
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
            <span className="text-sm font-medium text-white">{t.months[month]} {year}</span>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#D90000] text-gray-400 hover:text-white transition-colors">&gt;</button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-500 uppercase tracking-widest mb-3">
            {t.daysShort.map((dayName, idx) => <div key={idx}>{dayName}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#D90000]/40 relative">
      <GlobalStyles />

      {introRendered && (
        <div className={`fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-1000 ${introVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <AutoLazaridisLogo className="h-20 md:h-32 w-auto animate-intro-title" />
          <p className="absolute bottom-16 text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-500 animate-intro-subtitle">
            {t.introSubtitle}
          </p>
        </div>
      )}

      {/* HEADER WITH LANGUAGE TOGGLE */}
      <header className="fixed top-0 w-full z-40 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 px-5 md:px-12 py-4 flex justify-between items-center transition-all">
        <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
        <div className="flex items-center gap-6">
          <div className="text-[10px] md:text-xs uppercase tracking-[0.3em] text-gray-400 hidden md:block">{t.tagline}</div>
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-white/10"
          >
            <span className={lang === 'en' ? 'text-white' : 'text-gray-600'}>EN</span>
            <span className="text-gray-600">/</span>
            <span className={lang === 'el' ? 'text-white' : 'text-gray-600'}>GR</span>
          </button>
        </div>
      </header>

      <section className="relative w-full h-[65vh] flex flex-col justify-center items-center text-center px-5 md:px-12 mt-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-15 md:opacity-[0.12] pointer-events-none scale-150 md:scale-125">
          <AutoLazaridisLogo className="w-full max-w-5xl h-auto" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/90 via-[#030303]/60 to-[#030303]"></div>
        <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          <h1 className="text-4xl md:text-6xl font-serif-premium font-light leading-tight mb-4 md:mb-6 px-2 drop-shadow-2xl">
            {t.heroTitle1} <br/>
            <span className="italic text-gray-300">{t.heroTitle2}</span>
          </h1>
          <p className="text-[11px] md:text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed tracking-wide px-4 drop-shadow-md">
            {t.heroSub}
          </p>
        </div>
      </section>

      <div className="sticky top-[72px] md:top-[84px] z-30 bg-[#030303]/95 backdrop-blur-xl border-y border-white/5 px-5 md:px-12 py-4 flex justify-start md:justify-center gap-3 overflow-x-auto hide-scrollbar shadow-lg">
        {categories.map(cat => (
          <button 
            key={cat} 
            onClick={() => setActiveCategory(cat)}
            className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full transition-all duration-300 ${activeCategory === cat ? 'bg-[#D90000] text-white shadow-[0_4px_15px_rgba(217,0,0,0.4)]' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
          >
            {cat === 'All' ? t.all : cat}
          </button>
        ))}
      </div>

      <main className="px-5 md:px-12 py-16 md:py-20 max-w-[1400px] mx-auto pb-safe">
        {loading ? (
          <div className="text-center py-32 text-gray-500 text-[10px] md:text-sm uppercase tracking-widest animate-pulse">{t.updating}</div>
        ) : (
          <div className="flex flex-col gap-10 md:gap-12">
            {displayedVehicles.map(v => (
              <div key={v.id} className="group flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
                <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={CATEGORY_STOCK_PHOTOS[v.category || 'Premium']} alt={v.model} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90 group-hover:opacity-100" />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A] opacity-0 md:opacity-100"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-100 md:opacity-0"></div>
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center relative z-10">
                  <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#D90000]/10 text-[#D90000] text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-fit mb-4 md:mb-6 border border-[#D90000]/20">{v.category}</div>
                  <h2 className="text-3xl md:text-5xl font-serif-premium font-light mb-4 md:mb-6 leading-tight">{v.model}</h2>
                  <div className="flex gap-6 md:gap-8 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-white/5">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.power}</div>
                      <div className="text-lg md:text-xl font-medium">{v.hp} <span className="text-[10px] md:text-xs text-gray-400 font-light">HP</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.engine}</div>
                      <div className="text-lg md:text-xl font-medium">{v.cc} <span className="text-[10px] md:text-xs text-gray-400 font-light">CC</span></div>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.cost}</div>
                      <div className="text-2xl md:text-4xl font-light">€{v.price}<span className="text-xs md:text-sm text-gray-500 ml-2">{t.perDay}</span></div>
                    </div>
                    <button onClick={() => setSelectedVehicle(v)} className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D90000] hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(217,0,0,0.3)]">
                      {t.select}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-[#050505] border-t border-white/5 px-6 md:px-12 py-16 md:py-20 pb-safe mt-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <AutoLazaridisLogo className="h-8 md:h-10 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-right text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500">
            <span>{t.address}</span>
            <span>{t.tel}</span>
          </div>
        </div>
      </footer>

      {/* --- BOOKING MODAL --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-md transition-opacity">
          <div className="w-full md:w-[550px] h-[100dvh] bg-[#0A0A0A] md:border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-500 md:rounded-l-[3rem] overflow-hidden mt-12 md:mt-0">
            
            <div className="px-6 md:px-10 py-6 md:py-8 border-b border-white/5 flex justify-between items-center bg-[#050505]/80 backdrop-blur-xl z-10 absolute top-0 w-full">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-white">{t.bookingTitle}</h3>
              <button onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#D90000] transition-colors text-white text-xs">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto pt-20 md:pt-24 pb-8 px-5 md:px-8 space-y-8 hide-scrollbar">
              
              <div className="w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative border border-white/5">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={CATEGORY_STOCK_PHOTOS[selectedVehicle.category || 'Premium']} alt={selectedVehicle.model} className="w-full h-full object-cover grayscale-[10%]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-5 md:left-6">
                   <h2 className="text-xl md:text-2xl font-serif-premium text-white">{selectedVehicle.model}</h2>
                 </div>
              </div>

              <DateRangePicker />

              <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2.5rem]">
                <div className="mb-5">
                  <h4 className="text-[10px] text-[#D90000] uppercase tracking-[0.2em] font-bold mb-1">Fast Track Check-In</h4>
                  <p className="text-[10px] md:text-xs text-gray-500">{t.fastTrackSub}</p>
                </div>
                
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={idInputRef} onChange={(e) => setIdFile(e.target.files?.[0] || null)} />
                <input type="file" accept="image/*" capture="environment" className="hidden" ref={licenseInputRef} onChange={(e) => setLicenseFile(e.target.files?.[0] || null)} />

                <div className="flex gap-3 md:gap-4">
                  <button onClick={() => idInputRef.current?.click()} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${idFile ? 'border-[#D90000] bg-[#D90000]/10 text-[#D90000]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                    {idFile ? '✓ ' + idFile.name.substring(0, 8) + '...' : t.idCard}
                  </button>
                  <button onClick={() => licenseInputRef.current?.click()} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${licenseFile ? 'border-[#D90000] bg-[#D90000]/10 text-[#D90000]' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}>
                    {licenseFile ? '✓ ' + licenseFile.name.substring(0, 8) + '...' : t.license}
                  </button>
                </div>
              </div>

              {selectedRange.start && selectedRange.end && (
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)]">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-6 font-bold">{t.paymentOption}</h3>
                    
                    <div className="flex gap-3 md:gap-4 mb-8">
                      <div 
                        onClick={() => setPaymentMode('full')} 
                        className={`flex-1 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMode === 'full' ? 'bg-[#D90000]/10 border-[#D90000]' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
                      >
                        <div className={`text-[9px] uppercase tracking-widest mb-2 transition-colors ${paymentMode === 'full' ? 'text-[#D90000]' : 'text-gray-500'}`}>
                          {t.fullPayment}
                        </div>
                        <div className="text-xl md:text-2xl font-light text-white">€{calculateTotal()}</div>
                      </div>

                      <div 
                        onClick={() => setPaymentMode('deposit')} 
                        className={`flex-1 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMode === 'deposit' ? 'bg-[#D90000]/10 border-[#D90000]' : 'border-white/10 hover:border-white/30 bg-black/20'}`}
                      >
                        <div className={`text-[9px] uppercase tracking-widest mb-2 transition-colors ${paymentMode === 'deposit' ? 'text-[#D90000]' : 'text-gray-500'}`}>
                          {t.deposit}
                        </div>
                        <div className="text-xl md:text-2xl font-light text-white">€{Math.round(calculateTotal() * 0.3)}</div>
                        <div className="text-[8px] text-gray-500 mt-2 tracking-widest">
                          {t.remaining} €{calculateTotal() - Math.round(calculateTotal() * 0.3)}
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={handleBookingToStripe} 
                      disabled={isSubmitting} 
                      className={`w-full py-5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 ${isSubmitting ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#D90000] text-white hover:bg-red-700 shadow-[0_10px_20px_rgba(217,0,0,0.3)]'}`}
                    >
                      {isSubmitting ? t.processing : `${t.securePayment} (€${paymentMode === 'full' ? calculateTotal() : Math.round(calculateTotal() * 0.3)})`}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}  

    </div>
  );
}