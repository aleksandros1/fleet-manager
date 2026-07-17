'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

// --- Το Ψηφιακό Λογότυπο (SVG Component) ---
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
  'Compact / Hatchback': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  'Sedan': 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=800&q=80',           
  'SUV / 4x4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',       
  'Premium': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=800&q=80'         
};

type Vehicle = {
  id: number;
  plate: string;
  model: string;
  cc: string;
  hp: string;
  price: number;
  is_active: boolean;
  category: string;
  photos: string[];
};

export default function MarketplaceApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null; }>({ start: null, end: null });

  useEffect(() => {
    async function fetchVehicles() {
      try {
        const { data, error } = await supabase.from('vehicles').select('*').eq('is_active', true).order('created_at', { ascending: false });
        if (error) throw error;
        setVehicles(data || []);
      } catch (error) {
        console.error('Σφάλμα φόρτωσης στόλου:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehicles();
  }, []);

  const calculateTotal = () => {
    if (!selectedRange.start || !selectedRange.end || !selectedVehicle) return selectedVehicle?.price || 0;
    const start = new Date(selectedRange.start);
    const end = new Date(selectedRange.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    return (diffDays === 0 ? 1 : diffDays) * selectedVehicle.price;
  };

  const totalDays = () => {
    if (!selectedRange.start || !selectedRange.end) return 1;
    const start = new Date(selectedRange.start);
    const end = new Date(selectedRange.end);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return days === 0 ? 1 : days;
  };

  const handleBooking = async () => {
    if (!selectedVehicle || !selectedRange.start || !selectedRange.end) return;
    setIsSubmitting(true);
    const { error } = await supabase.from('bookings').insert([{
        vehicle_id: selectedVehicle.id, vehicle_model: selectedVehicle.model,
        check_in: selectedRange.start, check_out: selectedRange.end, total_price: calculateTotal(), status: 'Νέα Κράτηση'
      }]);
    setIsSubmitting(false);
    if (error) alert(`Σφάλμα κράτησης: ${error.message}`);
    else {
      alert('Η κράτηση καταχωρήθηκε επιτυχώς! Ένας εκπρόσωπός μας θα επικοινωνήσει μαζί σας.');
      setSelectedVehicle(null);
      setSelectedCategory(null);
      setSelectedRange({ start: null, end: null });
    }
  };

  const getVehiclePhoto = (vehicle: Vehicle) => {
    const cat = vehicle.category || 'Compact / Hatchback';
    return CATEGORY_STOCK_PHOTOS[cat] || CATEGORY_STOCK_PHOTOS['Compact / Hatchback'];
  };

  // --- CUSTOM PREMIUM CALENDAR COMPONENT ---
  const DateRangePicker = ({ selectedRange, onRangeChange }: { selectedRange: { start: string | null; end: string | null; }; onRangeChange: (range: { start: string | null; end: string | null; }) => void; }) => {
    const year = 2026;
    const month = 6; 
    const monthName = "ΙΟΥΛΙΟΣ 2026";

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay(); 
    const calendarDays = [];

    for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
        calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        
        let dayClass = "h-10 flex items-center justify-center text-xs font-bold rounded-full cursor-pointer transition-colors";

        if (selectedRange.start === dateStr || selectedRange.end === dateStr) {
            dayClass += " bg-[#D90000] text-white shadow-[0_4px_10px_rgba(220,38,38,0.3)]";
        } else if (selectedRange.start && selectedRange.end && dateStr > selectedRange.start && dateStr < selectedRange.end) {
            dayClass += " bg-[#D90000]/10 text-[#D90000]";
        } else {
            dayClass += " text-gray-300 hover:bg-white/5";
        }

        const handleDateClick = () => {
            if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
                onRangeChange({ start: dateStr, end: null });
            } else if (dateStr < selectedRange.start) {
                onRangeChange({ start: dateStr, end: null });
            } else {
                onRangeChange({ start: selectedRange.start, end: dateStr });
            }
        };

        calendarDays.push(<div key={dateStr} onClick={handleDateClick} className={`${dayClass}`}>{day}</div>);
    }

    return (
        <div className="space-y-6 pt-4 border-t border-white/10">
          <h2 className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.3em] text-center">Διαρκεια Ενοικιασης (2 Κλικ)</h2>
          <div className="bg-black/50 border border-white/5 rounded-xl p-6 shadow-inner max-w-sm mx-auto">
            <div className="text-center text-xs font-bold text-white uppercase tracking-widest mb-6 font-serif">{monthName}</div>
            <div className="grid grid-cols-7 gap-1 text-center text-[8px] text-gray-600 font-bold uppercase tracking-widest mb-4">
              <div>Δευ</div><div>Τρι</div><div>Τετ</div><div>Πεμ</div><div>Παρ</div><div>Σαβ</div><div>Κυρ</div>
            </div>
            <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
          </div>
        </div>
    );
  };

  // ΟΘΟΝΗ 3: CHECKOUT
  if (selectedVehicle) {
    return (
      <div className="min-h-screen bg-[#030303] text-white font-sans relative overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-5 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5">
          <button onClick={() => setSelectedVehicle(null)} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <AutoLazaridisLogo className="h-6 w-auto" />
          <div className="w-6 h-6"></div>
        </header>

        <main className="px-6 py-10 pb-48 max-w-3xl mx-auto space-y-10 relative z-10">
          <section className="text-center space-y-2">
            <div className="text-[9px] font-bold text-[#D90000] tracking-[0.3em] uppercase">Premium Rental</div>
            <h1 className="text-3xl md:text-5xl font-serif tracking-wide">{selectedVehicle.model}</h1>
            <p className="text-xs md:text-sm text-gray-500 font-light italic">ή αντίστοιχο όχημα κατηγορίας {selectedVehicle.category}</p>
          </section>
          
          <section className="max-w-2xl mx-auto">
            <div className="relative w-full h-64 md:h-96 bg-[#0A0A0A] rounded-sm overflow-hidden shadow-2xl border border-white/10">
               {/* eslint-disable-next-line @next/next/no-img-element */}
               <img src={getVehiclePhoto(selectedVehicle)} alt={selectedVehicle.model} className="w-full h-full object-cover grayscale-[20%]" />
               <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent"></div>
               <div className="absolute bottom-6 md:bottom-10 w-full flex justify-center gap-10">
                 <div className="text-center"><div className="text-2xl md:text-3xl font-serif">{selectedVehicle.hp}</div><div className="text-[8px] md:text-[10px] text-gray-400 tracking-widest uppercase">Horsepower</div></div>
                 <div className="w-px h-10 bg-white/20"></div>
                 <div className="text-center"><div className="text-2xl md:text-3xl font-serif">{selectedVehicle.cc}</div><div className="text-[8px] md:text-[10px] text-gray-400 tracking-widest uppercase">Engine (CC)</div></div>
               </div>
            </div>
          </section>

          <DateRangePicker selectedRange={selectedRange} onRangeChange={setSelectedRange} />
        </main>

        <div className="fixed bottom-0 left-0 right-0 bg-[#030303]/95 backdrop-blur-2xl border-t border-white/5 p-6 z-50">
           <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
             <div className="flex flex-col">
               <span className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">Συνολο ({totalDays()} Ημερες)</span>
               <span className="text-2xl md:text-3xl font-serif text-white">€{calculateTotal()}</span>
             </div>
             <button onClick={handleBooking} disabled={!selectedRange.start || !selectedRange.end || isSubmitting} className={`flex-1 max-w-xs py-4 md:py-5 text-[10px] font-bold tracking-[0.2em] uppercase rounded-sm transition-all ${(!selectedRange.start || !selectedRange.end || isSubmitting) ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#D90000] text-white hover:bg-red-700 shadow-[0_4px_15px_rgba(220,38,38,0.25)] hover:shadow-[0_4px_25px_rgba(220,38,38,0.45)]'}`}>
               {isSubmitting ? 'ΕΠΕΞΕΡΓΑΣΙΑ...' : 'ΟΛΟΚΛΗΡΩΣΗ'}
             </button>
           </div>
        </div>
      </div>
    );
  }

  // ΟΘΟΝΗ 2: ΛΙΣΤΑ ΟΧΗΜΑΤΩΝ
  if (selectedCategory) {
    const categoryVehicles = vehicles.filter(v => (v.category || 'Compact / Hatchback') === selectedCategory);

    return (
      <div className="min-h-screen bg-[#030303] text-white font-sans relative overflow-x-hidden">
        <header className="sticky top-0 z-50 flex items-center px-6 py-5 bg-[#030303]/90 backdrop-blur-xl border-b border-white/5 shadow-md">
          <button onClick={() => setSelectedCategory(null)} className="p-2 -ml-2 mr-4 rounded-full hover:bg-white/10 transition-colors">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <div className="flex-1 text-center pr-8">
            <h2 className="text-xs font-bold tracking-[0.2em] uppercase text-white">{selectedCategory}</h2>
          </div>
        </header>

        <main className="p-6 max-w-5xl mx-auto mt-4">
          {categoryVehicles.length === 0 ? (
            <div className="text-center py-20 text-gray-600 font-serif italic">Δεν υπάρχουν διαθέσιμα οχήματα.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {categoryVehicles.map((v) => (
                <div key={v.id} onClick={() => setSelectedVehicle(v)} className="group cursor-pointer">
                  <div className="h-64 md:h-80 bg-[#0A0A0A] relative overflow-hidden rounded-sm mb-4 border border-white/10 shadow-xl">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={getVehiclePhoto(v)} alt={v.model} className="w-full h-full object-cover grayscale-[30%] group-hover:scale-105 transition-transform duration-1000 ease-out opacity-90 group-hover:opacity-100" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-transparent to-transparent"></div>
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                       <div>
                         <h3 className="text-2xl md:text-3xl font-serif text-white drop-shadow-md">{v.model}</h3>
                         <div className="text-[9px] md:text-[10px] text-gray-400 tracking-widest uppercase mt-2">Αντιπροσωπευτικο Οχημα</div>
                       </div>
                       <div className="text-right">
                         <div className="text-2xl md:text-3xl font-serif text-[#D90000] drop-shadow-md">€{v.price}</div>
                         <div className="text-[8px] md:text-[9px] text-gray-500 uppercase tracking-widest mt-2">Ανα Ημερα</div>
                       </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-4 py-4 border-t border-white/10 bg-black/30 rounded-b-sm group-hover:bg-white/5 transition-colors">
                     <span className="text-[10px] md:text-xs text-white tracking-[0.2em] uppercase font-bold">Επιλογη</span>
                     <svg className="w-5 h-5 text-[#D90000] transform group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ΟΘΟΝΗ 1: LANDING PAGE
  const availableCategories = [
    { id: 'Premium', title: 'Premium', subtitle: 'ΑΠΟΛΥΤΗ ΠΟΛΥΤΕΛΕΙΑ', image: CATEGORY_STOCK_PHOTOS['Premium'] },
    { id: 'SUV / 4x4', title: 'SUV / 4x4', subtitle: 'ΕΚΤΟΣ ΟΡΙΩΝ', image: CATEGORY_STOCK_PHOTOS['SUV / 4x4'] },
    { id: 'Sedan', title: 'Sedan', subtitle: 'ΑΝΕΣΗ & ΧΩΡΟΙ', image: CATEGORY_STOCK_PHOTOS['Sedan'] },
    { id: 'Compact / Hatchback', title: 'Compact', subtitle: 'ΙΔΑΝΙΚΑ ΓΙΑ ΤΗΝ ΠΟΛΗ', image: CATEGORY_STOCK_PHOTOS['Compact / Hatchback'] }
  ];

  return (
    <div className="min-h-screen bg-[#030303] text-white font-sans relative overflow-x-hidden">
      
      {/* LUXURY HERO SECTION */}
      <section className="relative h-[65vh] md:h-[75vh] w-full flex flex-col items-center justify-center overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/lazaris.jpg" alt="Auto Lazaridis Showroom" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale brightness-50" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/60 via-transparent to-[#030303]"></div>
        
        <div className="relative z-10 text-center px-6 flex flex-col items-center mt-10 animate-in fade-in slide-in-from-top-10 duration-1000">
          <AutoLazaridisLogo className="h-16 md:h-24 w-auto mb-8 md:mb-12 opacity-90 shadow-2xl" />
          <h1 className="text-3xl md:text-6xl font-serif text-white tracking-wide leading-tight mb-4 drop-shadow-2xl">
            Η Ποιότητα Δεν Είναι <br/><span className="text-[#D90000] italic">Διαπραγματεύσιμη.</span>
          </h1>
          <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.3em] max-w-lg mx-auto mt-6 leading-relaxed">
            Premium ενοικιασεις, αποκλειστικα οχηματα και μια εμπειρια φτιαγμενη για τον συγχρονο οδηγο.
          </p>
        </div>
      </section>

      {/* CATEGORIES SECTION (NOW GRID ON DESKTOP) */}
      <main className="px-6 py-12 max-w-5xl mx-auto relative z-20 -mt-10 animate-in fade-in duration-1000 delay-300">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.4em] mb-4">The Collection</h2>
          <div className="w-12 h-px bg-[#D90000] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 pb-16">
          {loading ? (
            <div className="col-span-1 md:col-span-2 text-center py-20 text-gray-600 font-serif italic">Φόρτωση Συλλογής...</div>
          ) : (
            availableCategories.map(cat => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className="group relative w-full h-64 md:h-80 overflow-hidden block text-left border border-white/5 rounded-sm shadow-2xl bg-[#0A0A0A]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cat.image} alt={cat.title} className="absolute inset-0 w-full h-full object-cover grayscale-[40%] group-hover:scale-105 group-hover:grayscale-0 transition-all duration-1000 ease-out opacity-60 group-hover:opacity-90" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-colors duration-700"></div>
                
                <div className="absolute inset-0 flex flex-col justify-end p-8">
                  <div className="w-0 group-hover:w-8 h-px bg-[#D90000] mb-4 transition-all duration-500 ease-out"></div>
                  <h3 className="text-2xl md:text-3xl font-serif text-white tracking-widest uppercase mb-2 drop-shadow-md">{cat.title}</h3>
                  <p className="text-[9px] text-gray-300 font-bold tracking-[0.3em]">{cat.subtitle}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </main>

      {/* PREMIUM FOOTER */}
      <footer className="bg-[#050505] border-t border-white/5 pt-16 pb-12 px-6">
        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div>
            <AutoLazaridisLogo className="h-10 w-auto mx-auto mb-4 opacity-50" />
            <p className="text-[9px] md:text-[10px] text-gray-500 tracking-[0.2em] uppercase">Crafting Confidence on the road.</p>
          </div>
          
          <div className="space-y-6 border-t border-white/5 pt-10">
            <h4 className="text-[11px] font-bold text-white tracking-[0.3em] uppercase">Επικοινωνια</h4>
            
            <div className="flex flex-col items-center gap-3 text-xs md:text-sm text-gray-400 font-light">
              <span className="flex items-center gap-3">
                <svg className="w-4 h-4 text-[#D90000]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                7ο χλμ. Δράμας - Καβάλας
              </span>
              <span className="flex items-center gap-3 mt-2">
                <svg className="w-4 h-4 text-[#D90000]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                6948 766884 &nbsp;|&nbsp; 25210 26912
              </span>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}