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
      scroll-behavior: smooth;
    }
    .font-serif-premium { font-family: 'Playfair Display', serif; }
    
    ::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .animate-intro-title { animation: fadeInUp 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
    .animate-intro-subtitle { opacity: 0; animation: fadeIn 1.5s ease-out 1.2s forwards; }
    
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 2rem); }

    .sticky-category-bar {
      position: -webkit-sticky;
      position: sticky;
      top: 73px; 
      z-index: 30;
    }
    @media (min-width: 768px) {
      .sticky-category-bar {
        top: 81px; 
      }
    }
  `}</style>
);

const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img src="/brand-logo.png" alt="Auto Lazaridis" className={className} style={{ objectFit: 'contain' }} />
);

const TRANSLATIONS = {
  el: {
    introSubtitle: "Not everyone drives the same.",
    heroTitle1: "Ανακαλύψτε Την Απόλυτη",
    heroTitle2: "Οδηγική Εμπειρία.",
    heroSub: "Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα. Καθαρή διαφάνεια, αδιαπραγμάτευτη ποιότητα.",
    all: "Ολα",
    updating: "Ενημέρωση Στόλου...",
    power: "Ισχυς",
    engine: "Κυβικα",
    transmission: "Κιβωτιο",
    fuel: "Καυσιμο",
    mileage: "Χιλιομετρα",
    auto: "Αυτοματο",
    manual: "Χειροκινητο",
    cost: "Κοστος",
    perDay: "/ ημέρα",
    perMonth: "/ μήνα",
    select: "Επιλογη",
    buyNow: "Αγορα",
    rentals: "Ενοικιαζομενα",
    leasing: "Leasing",
    forSale: "Προς Πωληση",
    address: "7ο χλμ. Δράμας - Καβάλας",
    tel: "Τηλ: 6948 766884",
    bookingTitle: "Αιτημα Ενδιαφεροντος",
    fastTrackSub: "Φωτογραφίστε ή ανεβάστε τα έγγραφά σας (JPG, PNG, PDF).",
    personalInfoTitle: "Στοιχεια Πελατη",
    namePlaceholder: "Ονοματεπώνυμο",
    phonePlaceholder: "Τηλέφωνο Επικοινωνίας",
    emailPlaceholder: "Email",
    fillRequired: "Παρακαλώ συμπληρώστε το Ονοματεπώνυμο, το Τηλέφωνο και το Email σας.",
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
    alertSuccess: "Η πληρωμή ολοκληρώθηκε με επιτυχία. Η αίτησή σας καταχωρήθηκε.",
    alertCancel: "Η διαδικασία ακυρώθηκε.",
    datesOverlap: "Οι ημερομηνίες που επιλέξατε συμπίπτουν με υπάρχουσα κράτηση.",
    invalidFileType: "Μη αποδεκτός τύπος αρχείου. Επιτρέπονται μόνο εικόνες και έγγραφα PDF.",
    fileTooLarge: "Το αρχείο είναι πολύ μεγάλο. Μέγιστο μέγεθος: 10MB.",
    months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    daysShort: ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"],
    menuHome: "ΑΡΧΙΚΗ",
    menuFleet: "Ο ΣΤΟΛΟΣ",
    menuLocation: "ΤΟΠΟΘΕΣΙΑ",
    menuContact: "ΕΠΙΚΟΙΝΩΝΙΑ",
    back: "ΕΠΙΣΤΡΟΦΗ",
    rentPaymentInfo: "ΠΛΗΡΩΜΗ ΕΝΟΙΚΙΑΣΗΣ",
    leasePaymentInfo: "ΠΛΗΡΩΜΗ LEASING (1ΟΣ ΜΗΝΑΣ)",
    buyPaymentInfo: "ΑΓΟΡΑ ΟΧΗΜΑΤΟΣ",
    daysSelected: "ΗΜΕΡΕΣ"
  },
  en: {
    introSubtitle: "Not everyone drives the same.",
    heroTitle1: "Discover The Ultimate",
    heroTitle2: "Driving Experience.",
    heroSub: "The most strictly selected vehicle collection in Northern Greece. Pure transparency, non-negotiable quality.",
    all: "All",
    updating: "Updating Fleet...",
    power: "Power",
    engine: "Engine",
    transmission: "Gearbox",
    fuel: "Fuel",
    mileage: "Mileage",
    auto: "Auto",
    manual: "Manual",
    cost: "Cost",
    perDay: "/ day",
    perMonth: "/ month",
    select: "Select",
    buyNow: "Purchase",
    rentals: "Rentals",
    leasing: "Leasing",
    forSale: "For Sale",
    address: "7th km Drama - Kavala",
    tel: "Tel: +30 6948 766884",
    bookingTitle: "Vehicle Request",
    fastTrackSub: "Photograph or upload your documents (JPG, PNG, PDF).",
    personalInfoTitle: "Customer Details",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    emailPlaceholder: "Email Address",
    fillRequired: "Please fill in your Full Name, Phone, and Email.",
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
    alertSuccess: "Payment completed successfully. Your request has been recorded.",
    alertCancel: "The process was cancelled.",
    datesOverlap: "Selected dates overlap with an existing booking.",
    invalidFileType: "Invalid file format. Only images and PDF files are allowed.",
    fileTooLarge: "File is too large. Maximum allowed size: 10MB.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    menuHome: "HOME",
    menuFleet: "THE FLEET",
    menuLocation: "LOCATION",
    menuContact: "CONTACT",
    back: "BACK",
    rentPaymentInfo: "RENTAL PAYMENT",
    leasePaymentInfo: "LEASING PAYMENT (1ST MONTH)",
    buyPaymentInfo: "VEHICLE PURCHASE",
    daysSelected: "DAYS"
  }
};

type Vehicle = { 
  id: number; plate: string; model: string; price: number; is_active: boolean; category: string; photos: string[]; availability?: string[];
  cc?: string; hp?: string; transmission?: string; fuel?: string; mileage?: string;
};

type DbCategory = { id: number; name: string; is_active: boolean; };

export default function PremiumFleetApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeAvailability, setActiveAvailability] = useState<string>('Ενοικίαση');
  
  const [introVisible, setIntroVisible] = useState(true);
  const [introRendered, setIntroRendered] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [existingBookings, setExistingBookings] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedRange, setSelectedRange] = useState<{ start: string | null; end: string | null; }>({ start: null, end: null });
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [paymentMode, setPaymentMode] = useState<'full' | 'deposit'>('full');
  const [customerInfo, setCustomerInfo] = useState({ name: '', phone: '', email: '' });

  const [idFile, setIdFile] = useState<File | null>(null);
  const [licenseFile, setLicenseFile] = useState<File | null>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<'el' | 'en'>('el');
  const t = TRANSLATIONS[lang];

  useEffect(() => {
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
    
    async function initializeApp() {
      const [resVehicles, resCategories] = await Promise.all([
        supabase.from('vehicles').select('*').eq('is_active', true).order('price', { ascending: false }),
        supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true })
      ]);
      if (resVehicles.data) setVehicles(resVehicles.data);
      if (resCategories.data) setCategories(resCategories.data as DbCategory[]);
      setLoading(false);
    }
    initializeApp();
    return () => { clearTimeout(fadeOutTimer); clearTimeout(unmountTimer); };
  }, []);

  useEffect(() => {
    if (selectedVehicle && activeAvailability === 'Ενοικίαση') {
      const currentVehicleId = selectedVehicle.id; 
      async function fetchBookings() {
        const { data } = await supabase
          .from('bookings')
          .select('check_in, check_out')
          .eq('vehicle_id', currentVehicleId)
          .not('status', 'ilike', '%cancelled%')
          .not('status', 'ilike', '%ακυρώ%');
        if (data) setExistingBookings(data);
      }
      fetchBookings();
    } else {
      setSelectedRange({ start: null, end: null });
    }
  }, [selectedVehicle, activeAvailability]);

  const toggleLanguage = () => { const n = lang === 'el' ? 'en' : 'el'; setLang(n); localStorage.setItem('autolaz_lang', n); };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false); const element = document.getElementById(id);
    if (element) {
      const headerOffset = 135; const elementPosition = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementPosition + window.pageYOffset - headerOffset, behavior: "smooth" });
    }
  };

  const handleAvailabilityClick = (type: string) => { setActiveAvailability(type); setTimeout(() => scrollToSection('fleet'), 100); };

  const validateAndSetFile = (file: File | null, setFileState: (f: File | null) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) { alert(t.invalidFileType); if (inputRef.current) inputRef.current.value = ''; return; }
    if (file.size > 10 * 1024 * 1024) { alert(t.fileTooLarge); if (inputRef.current) inputRef.current.value = ''; return; }
    setFileState(file);
  };

  const getCalculatedDays = () => {
    if (!selectedRange.start || !selectedRange.end) return 1;
    const diffDays = Math.ceil((new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 1 : diffDays;
  };

  const calculateTotal = () => { if (!selectedVehicle) return 0; return activeAvailability === 'Ενοικίαση' ? getCalculatedDays() * selectedVehicle.price : selectedVehicle.price; };

  const handleBookingToStripe = async () => {
    if (!selectedVehicle || (activeAvailability === 'Ενοικίαση' && (!selectedRange.start || !selectedRange.end))) return;
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.email.trim()) { alert(t.fillRequired); return; }
    setIsSubmitting(true);
    try {
      const checkInDate = selectedRange.start || new Date().toISOString().split('T')[0];
      const checkOutDate = selectedRange.end || new Date().toISOString().split('T')[0];
      const totalCost = calculateTotal(); const amountToPay = paymentMode === 'full' ? totalCost : Math.round(totalCost * 0.3);

      if (activeAvailability === 'Ενοικίαση') {
        const { data: conflictCheck } = await supabase
          .from('bookings')
          .select('id')
          .eq('vehicle_id', selectedVehicle.id)
          .lte('check_in', checkOutDate)
          .gte('check_out', checkInDate)
          .not('status', 'ilike', '%cancelled%')
          .not('status', 'ilike', '%ακυρώ%');

        if (conflictCheck && conflictCheck.length > 0) {
          throw new Error(t.datesOverlap);
        }
      }

      let uploadedIdUrl = null;
      let uploadedLicenseUrl = null;

      if (idFile) {
        const fileExt = idFile.name.split('.').pop();
        const fileName = `id_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, idFile);
        if (uploadError) throw new Error("Σφάλμα κατά το ανέβασμα της Ταυτότητας.");
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        uploadedIdUrl = publicUrlData.publicUrl;
      }

      if (licenseFile) {
        const fileExt = licenseFile.name.split('.').pop();
        const fileName = `license_${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, licenseFile);
        if (uploadError) throw new Error("Σφάλμα κατά το ανέβασμα του Διπλώματος.");
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        uploadedLicenseUrl = publicUrlData.publicUrl;
      }

      const paymentStatus = paymentMode === 'full' ? '100% Εξόφληση' : '30% Προκαταβολή';
      const fastTrackStatus = (uploadedIdUrl && uploadedLicenseUrl) ? ' (Fast Track Attached)' : '';
      const bookingTypeLabel = activeAvailability === 'Πώληση' ? 'Αγορά' : activeAvailability === 'Leasing' ? 'Leasing' : 'Ενοικίαση';

      const { error: supabaseError } = await supabase.from('bookings').insert([{ 
        vehicle_id: selectedVehicle.id, 
        vehicle_model: `${selectedVehicle.model} [${bookingTypeLabel}]`, 
        check_in: checkInDate, 
        check_out: checkOutDate, 
        total_price: totalCost, 
        status: `Εκκρεμεί Πληρωμή: ${paymentStatus}${fastTrackStatus}`, 
        customer_name: customerInfo.name.trim(), 
        customer_phone: customerInfo.phone.trim(), 
        customer_email: customerInfo.email.trim(),
        id_photo_url: uploadedIdUrl,
        license_photo_url: uploadedLicenseUrl
      }]);
      if (supabaseError) throw new Error(supabaseError.message);

      const stripeDescriptionModifier = paymentMode === 'deposit' ? ' (Deposit 30%)' : ' (Full Payment)';

      const response = await fetch('/api/checkout', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vehicleId: selectedVehicle.id, model: `${selectedVehicle.model} [${bookingTypeLabel}] ${stripeDescriptionModifier}`, price: amountToPay, checkIn: checkInDate, checkOut: checkOutDate, days: activeAvailability === 'Ενοικίαση' ? getCalculatedDays() : 1 }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url; else throw new Error('Payment token generation failed.');
    } catch (err: any) { alert(`Error: ${err.message}`); setIsSubmitting(false); }
  };

  const finalUiCategories = ['All', ...categories.map(c => c.name)];

  const displayedVehicles = vehicles.filter(v => {
    const matchCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchAvailability = v.availability ? v.availability.includes(activeAvailability) : activeAvailability === 'Ενοικίαση';
    return matchCategory && matchAvailability;
  });

  const showPaymentSection = activeAvailability === 'Ενοικίαση' ? (selectedRange.start && selectedRange.end) : true;

  const DateRangePicker = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDayIndex = new Date(year, month, 1).getDay() || 7; 
    const calendarDays = [];
    for (let i = 1; i < firstDayIndex; i++) calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isBooked = existingBookings.some(b => dateStr >= b.check_in && dateStr <= b.check_out);
        let dayClass = "h-10 flex items-center justify-center text-sm transition-all duration-300 rounded-full ";
        if (new Date(year, month, day) < today || isBooked) dayClass += " text-gray-700 bg-gray-900/40 line-through cursor-not-allowed";
        else if (selectedRange.start === dateStr || selectedRange.end === dateStr) dayClass += " bg-[#8B0000] text-white font-bold";
        else if (selectedRange.start && selectedRange.end && dateStr > selectedRange.start && dateStr < selectedRange.end) dayClass += " bg-[#8B0000]/15 text-[#8B0000]";
        else dayClass += " text-gray-300 hover:bg-[#8B0000]/20 hover:text-white cursor-pointer";

        calendarDays.push(
          <div key={dateStr} className={dayClass} onClick={() => {
              if (new Date(year, month, day) < today || isBooked) return;
              if (!selectedRange.start || (selectedRange.start && selectedRange.end)) setSelectedRange({ start: dateStr, end: null });
              else if (dateStr < selectedRange.start) setSelectedRange({ start: dateStr, end: null });
              else setSelectedRange({ start: selectedRange.start, end: dateStr });
          }}>{day}</div>
        );
    }
    return (
        <div className="w-full bg-[#111111] p-5 md:p-6 rounded-[2rem] border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#8B0000] text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <span className="text-sm font-medium text-white">{t.months[month]} {year}</span>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#8B0000] text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] text-gray-500 uppercase tracking-widest mb-3">{t.daysShort.map((dayName, idx) => <div key={idx}>{dayName}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
        </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#030303] text-white selection:bg-[#8B0000]/40 relative">
      <GlobalStyles />
      {introRendered && (
        <div className={`fixed inset-0 z-[100] bg-[#030303] flex flex-col items-center justify-center transition-opacity duration-1000 ${introVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <AutoLazaridisLogo className="h-20 md:h-32 w-auto animate-intro-title" />
          <p className="absolute bottom-16 text-[10px] md:text-xs uppercase tracking-[0.4em] text-gray-500 animate-intro-subtitle">{t.introSubtitle}</p>
        </div>
      )}

      <header className="fixed top-0 w-full z-40 bg-black border-b border-[#8B0000]/20 px-5 md:px-12 py-4 flex justify-between items-center">
        <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
        <div className="flex items-center gap-6">
          <button onClick={toggleLanguage} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-[#111] px-3 py-2 rounded-lg border border-white/10">
            <span className={lang === 'en' ? 'text-white' : 'text-gray-600'}>EN</span><span className="text-[#8B0000]">/</span><span className={lang === 'el' ? 'text-white' : 'text-gray-600'}>GR</span>
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white hover:text-[#8B0000] focus:outline-none"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg></button>
        </div>
      </header>

      <section id="home" className="relative w-full h-[50vh] flex flex-col justify-center items-center text-center px-5 mt-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150"><AutoLazaridisLogo className="w-full max-w-5xl h-auto opacity-[0.25]" /></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/90 via-[#030303]/60 to-[#030303]"></div>
        <div className="relative z-10 max-w-4xl w-full px-2 mt-4">
          <h1 className="text-4xl md:text-6xl font-serif-premium font-light leading-tight mb-4">{t.heroTitle1} <br/><span className="italic text-gray-300">{t.heroTitle2}</span></h1>
          <p className="text-[11px] md:text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed tracking-wide mb-8">{t.heroSub}</p>
          <div className="w-full max-w-[320px] md:max-w-md mx-auto bg-[#111]/80 backdrop-blur-md p-1.5 rounded-full border border-white/10 grid grid-cols-3 gap-1 shadow-2xl">
            {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => (
              <button key={type} onClick={() => handleAvailabilityClick(type)} className={`w-full py-3 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-wider transition-all ${activeAvailability === type ? 'bg-[#8B0000] text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}>{type === 'Ενοικίαση' ? t.rentals : type === 'Leasing' ? t.leasing : t.forSale}</button>
            ))}
          </div>
        </div>
      </section>

      <div className="sticky-category-bar bg-[#030303]/95 backdrop-blur-xl px-5 md:px-12 py-3 flex justify-start md:justify-center gap-2 overflow-x-auto hide-scrollbar border-b border-[#8B0000]/10">
        {finalUiCategories.map(cat => (
          <button key={cat} onClick={() => { setActiveCategory(cat); scrollToSection('fleet'); }} className={`flex-shrink-0 text-[10px] md:text-xs font-bold uppercase tracking-widest px-5 py-3 rounded-full transition-all ${activeCategory === cat ? 'bg-[#8B0000] text-white' : 'bg-[#111] text-gray-400 hover:text-white border border-white/5'}`}>{cat === 'All' ? t.all : cat}</button>
        ))}
      </div>

      <main id="fleet" className="px-5 md:px-12 py-16 max-w-[1400px] mx-auto pb-safe min-h-[40vh]">
        {loading ? (
          <div className="text-center py-32 text-[#8B0000] text-[10px] uppercase tracking-widest animate-pulse">{t.updating}</div>
        ) : displayedVehicles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-70">
            <svg className="w-12 h-12 text-[#8B0000]/50 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            <div className="text-gray-400 text-[10px] uppercase tracking-widest font-bold">ΔΕΝ ΒΡΕΘΗΚΑΝ ΟΧΗΜΑΤΑ ΓΙΑ ΑΥΤΗ ΤΗΝ ΕΠΙΛΟΓΗ.</div>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {displayedVehicles.map(v => (
              <div key={v.id} className="group flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 rounded-[2rem] overflow-hidden hover:border-[#8B0000]/40 transition-all duration-500 shadow-lg">
                <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-[#111]">
                  <img src={v.photos?.[0] || '/brand-logo.png'} alt={v.model} className="absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-[1.5s]" />
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center relative z-10">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <div className="px-4 py-1.5 rounded-full bg-[#8B0000]/10 text-[#8B0000] text-[8px] font-bold uppercase tracking-widest border border-[#8B0000]/20">
                      {v.category}
                    </div>
                    <div className="text-[10px] text-gray-500 font-mono font-bold tracking-widest uppercase bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                      ID: #{String(v.id).padStart(4, '0')}
                    </div>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-serif-premium font-light mb-6 text-white">{v.model}</h2>
                  
                  {/* ΔΥΝΑΜΙΚΑ ΧΑΡΑΚΤΗΡΙΣΤΙΚΑ: Εμφανίζονται ΜΟΝΟ όσα έχουν συμπληρωθεί */}
                  <div className="flex flex-wrap gap-6 md:gap-8 mb-10 pb-10 border-b border-white/5">
                    {v.cc && <div><div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.engine}</div><div className="text-sm md:text-xl font-medium text-white">{v.cc} <span className="text-[10px] text-gray-300 font-light">CC</span></div></div>}
                    {v.hp && <div><div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.power}</div><div className="text-sm md:text-xl font-medium text-white">{v.hp} <span className="text-[10px] text-gray-300 font-light">HP</span></div></div>}
                    {v.transmission && <div><div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.transmission}</div><div className="text-sm md:text-xl font-medium text-white">{v.transmission?.toLowerCase().includes('man') ? t.manual : (v.transmission?.toLowerCase().includes('aut') ? t.auto : v.transmission)}</div></div>}
                    {v.fuel && <div><div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.fuel}</div><div className="text-sm md:text-xl font-medium text-white">{v.fuel}</div></div>}
                    {v.mileage && <div><div className="text-[9px] text-gray-400 uppercase tracking-widest mb-1">{t.mileage}</div><div className="text-sm md:text-xl font-medium text-white">{v.mileage} <span className="text-[10px] text-gray-300 font-light">KM</span></div></div>}
                  </div>

                  <div className="flex justify-between items-center gap-8 mt-auto">
                    <div><div className="text-[9px] text-gray-500 uppercase tracking-widest mb-1">{t.cost}</div><div className="text-2xl md:text-4xl font-light text-white">€{v.price}</div></div>
                    <button onClick={() => setSelectedVehicle(v)} className="px-8 py-4 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-[#8B0000] hover:text-white transition-all shadow-md">{activeAvailability === 'Πώληση' ? t.buyNow : t.select}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <div className={`fixed inset-0 z-[200] bg-[#050505] flex flex-col transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="px-5 md:px-12 py-4 flex justify-between items-center border-b border-white/5">
          <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white hover:text-[#8B0000] transition-colors"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <button onClick={() => scrollToSection('home')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#8B0000] transition-colors uppercase">{t.menuHome}</button>
          <button onClick={() => scrollToSection('fleet')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#8B0000] transition-colors uppercase">{t.menuFleet}</button>
          <button onClick={() => scrollToSection('contact')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#8B0000] transition-colors uppercase">{t.menuLocation}</button>
          <button onClick={() => scrollToSection('contact')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#8B0000] transition-colors uppercase">{t.menuContact}</button>
        </div>
        <div className="pb-12 flex justify-center items-center gap-8">
          <a href="#" className="text-gray-400 hover:text-[#8B0000] transition-colors"><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.76-6.98 6.237-.058 1.281-.072 1.688-.072 4.947s.014 3.666.072 4.947c.2 4.482 2.617 6.036 6.98 6.237 1.28.058 1.688.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.76 6.979-6.237.059-1.281.073-1.689.073-4.947s-.014-3.666-.073-4.947c-.197-4.478-2.62-6.037-6.979-6.237-1.28-.058-1.688-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg></a>
          <a href="tel:+306948766884" className="text-gray-400 hover:text-[#8B0000] transition-colors"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg></a>
        </div>
      </div>

      <footer id="contact" className="bg-[#050505] border-t border-[#8B0000]/20 pt-16 md:pt-20 pb-safe mt-4">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-10 md:gap-16 mb-16">
          <div className="w-full md:w-1/3 flex flex-col justify-start items-start md:items-start text-left gap-6 md:gap-8">
            <AutoLazaridisLogo className="h-10 md:h-12 w-auto opacity-70" />
            <div className="flex flex-col gap-4 text-[10px] md:text-xs uppercase tracking-widest text-gray-400">
              <div><div className="text-[#8B0000] mb-1">Τοποθεσια</div><span className="text-white">{t.address}</span></div>
              <div><div className="text-[#8B0000] mb-1">Τηλεφωνο</div><a href="tel:+306948766884" className="text-white hover:text-[#8B0000] transition-colors">{t.tel}</a></div>
            </div>
          </div>
          <div className="w-full md:w-2/3 h-64 md:h-80 rounded-2xl overflow-hidden border border-white/10 grayscale-[50%] hover:grayscale-0 transition-all duration-500 hover:border-[#8B0000]/30 shadow-lg hover:shadow-[0_0_15px_rgba(139,0,0,0.2)]">
            <iframe src="https://maps.google.com/maps?q=41.1145067,24.2068323&hl=el&z=16&output=embed" width="100%" height="100%" style={{ border: 0 }} allowFullScreen={true} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        </div>
        <div className="border-t border-white/5 py-6 text-center text-[9px] text-gray-700 uppercase tracking-widest">
          © {new Date().getFullYear()} AUTO ΛΑΖΑΡΙΔΗΣ. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* --- BOOKING MODAL --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[250] flex justify-end transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }}></div>
          
          <div className="relative w-full md:w-[550px] h-[100dvh] bg-[#0A0A0A] md:border-l border-[#8B0000]/20 flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-500 md:rounded-l-[3rem] overflow-hidden shadow-[-20px_0_50px_rgba(139,0,0,0.1)]">
            <div className="px-5 md:px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#050505] z-20 shrink-0">
              <button onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }} className="flex items-center gap-3 text-white hover:text-[#8B0000] transition-colors group">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-[#111] border border-white/10 group-hover:border-[#8B0000]/50 group-hover:bg-[#8B0000]/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.back}</span>
              </button>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-[#8B0000]">{t.bookingTitle}</h3>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe px-5 md:px-8 pt-6 space-y-8 hide-scrollbar">
              
              <div className="w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative border border-[#8B0000]/20 shadow-lg">
                 <div className="absolute top-4 right-4 md:top-5 md:right-5 bg-black/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 text-white font-mono text-[10px] font-bold tracking-widest z-10 shadow-lg">
                   ID: #{String(selectedVehicle.id).padStart(4, '0')}
                 </div>
                 <img src={selectedVehicle.photos?.[0] || '/brand-logo.png'} alt={selectedVehicle.model} className="w-full h-full object-cover grayscale-[10%]" />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
                 <div className="absolute bottom-4 left-5 md:left-6"><h2 className="text-xl md:text-2xl font-serif-premium text-white">{selectedVehicle.model}</h2></div>
              </div>

              {activeAvailability === 'Ενοικίαση' && <DateRangePicker />}

              <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2.5rem] hover:border-[#8B0000]/30 transition-colors">
                <div className="mb-5"><h4 className="text-[10px] text-[#8B0000] uppercase tracking-[0.2em] font-bold mb-1">{t.personalInfoTitle}</h4></div>
                <div className="space-y-4">
                  <input type="text" required placeholder={t.namePlaceholder} value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#8B0000] focus:shadow-[0_0_10px_rgba(139,0,0,0.2)] transition-all" />
                  <input type="tel" required placeholder={t.phonePlaceholder} value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#8B0000] focus:shadow-[0_0_10px_rgba(139,0,0,0.2)] transition-all" />
                  <input type="email" required placeholder={t.emailPlaceholder} value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#8B0000] focus:shadow-[0_0_10px_rgba(139,0,0,0.2)] transition-all" />
                </div>
              </div>

              <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2.5rem] hover:border-[#8B0000]/30 transition-colors">
                <div className="mb-5"><h4 className="text-[10px] text-[#8B0000] uppercase tracking-[0.2em] font-bold mb-1">Fast Track Check-In</h4><p className="text-[10px] md:text-xs text-gray-500">{t.fastTrackSub}</p></div>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" ref={idInputRef} onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setIdFile, idInputRef)} />
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" ref={licenseInputRef} onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setLicenseFile, licenseInputRef)} />
                <div className="flex gap-3 md:gap-4">
                  <button onClick={() => idInputRef.current?.click()} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${idFile ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] shadow-[0_0_15px_rgba(139,0,0,0.2)]' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:border-[#8B0000]/50'}`}>{idFile ? '✓ ' + idFile.name.substring(0, 8) + '...' : t.idCard}</button>
                  <button onClick={() => licenseInputRef.current?.click()} className={`flex-1 py-3 md:py-4 rounded-xl text-[9px] uppercase tracking-widest border transition-all ${licenseFile ? 'border-[#8B0000] bg-[#8B0000]/10 text-[#8B0000] shadow-[0_0_15px_rgba(139,0,0,0.2)]' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:border-[#8B0000]/50'}`}>{licenseFile ? '✓ ' + licenseFile.name.substring(0, 8) + '...' : t.license}</button>
                </div>
              </div>

              {showPaymentSection && (
                <div className="relative bg-[#111] border border-[#8B0000]/30 rounded-[2.5rem] p-6 md:p-8 overflow-hidden mt-8 shadow-[0_0_30px_rgba(139,0,0,0.1)]">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#8B0000]/5 to-transparent pointer-events-none" />
                  <div className="relative z-10">
                    <h3 className="text-[10px] uppercase tracking-[0.3em] text-[#8B0000] mb-6 font-bold">{activeAvailability === 'Ενοικίαση' ? `${t.rentPaymentInfo} (${getCalculatedDays()} ${t.daysSelected || 'ΗΜΕΡΕΣ'})` : activeAvailability === 'Leasing' ? t.leasePaymentInfo : t.buyPaymentInfo}</h3>
                    <div className="flex gap-3 md:gap-4 mb-8">
                      <div onClick={() => setPaymentMode('full')} className={`flex-1 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMode === 'full' ? 'bg-[#8B0000]/10 border-[#8B0000] shadow-[0_0_15px_rgba(139,0,0,0.2)]' : 'border-white/10 hover:border-[#8B0000]/50 bg-black/20'}`}><div className={`text-[9px] uppercase tracking-widest mb-2 transition-colors ${paymentMode === 'full' ? 'text-[#8B0000]' : 'text-gray-500'}`}>{t.fullPayment}</div><div className="text-xl md:text-2xl font-light text-white">€{calculateTotal()}</div></div>
                      <div onClick={() => setPaymentMode('deposit')} className={`flex-1 p-4 md:p-5 rounded-2xl border cursor-pointer transition-all duration-300 ${paymentMode === 'deposit' ? 'bg-[#8B0000]/10 border-[#8B0000] shadow-[0_0_15px_rgba(139,0,0,0.2)]' : 'border-white/10 hover:border-[#8B0000]/50 bg-black/20'}`}><div className={`text-[9px] uppercase tracking-widest mb-2 transition-colors ${paymentMode === 'deposit' ? 'text-[#8B0000]' : 'text-gray-500'}`}>{t.deposit}</div><div className="text-xl md:text-2xl font-light text-white">€{Math.round(calculateTotal() * 0.3)}</div><div className="text-[8px] text-gray-500 mt-2 tracking-widest">{t.remaining} €{calculateTotal() - Math.round(calculateTotal() * 0.3)}</div></div>
                    </div>
                    <button onClick={handleBookingToStripe} disabled={isSubmitting} className={`w-full py-5 rounded-full text-[10px] font-bold tracking-[0.2em] uppercase transition-all duration-300 shadow-[0_0_20px_rgba(139,0,0,0.3)] ${isSubmitting ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-[#8B0000] text-white hover:bg-[#6A0000] hover:scale-[1.02]'}`}>{isSubmitting ? t.processing : `${t.securePayment} (€${paymentMode === 'full' ? calculateTotal() : Math.round(calculateTotal() * 0.3)})`}</button>
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