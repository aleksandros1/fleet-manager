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
  `}</style>
);

const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img 
    src="/brand-logo.png" 
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

const TRANSLATIONS = {
  el: {
    introSubtitle: "Not everyone drives the same.",
    heroTitle1: "Ανακαλύψτε Την Απόλυτη",
    heroTitle2: "Οδηγική Εμπειρία.",
    heroSub: "Η πιο αυστηρά επιλεγμένη συλλογή οχημάτων στη Βόρεια Ελλάδα. Καθαρή διαφάνεια, αδιαπραγμάτευτη ποιότητα.",
    all: "Ολα",
    updating: "Ενημέρωση Στόλου...",
    power: "Ισχυς",
    engine: "Κινητηρας",
    transmission: "Κιβωτιο",
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
    bookingTitle: "Κρατηση Οχηματος",
    fastTrackSub: "Φωτογραφίστε ή ανεβάστε τα έγγραφά σας (JPG, PNG, PDF).",
    personalInfoTitle: "Στοιχεια Πελατη",
    namePlaceholder: "Ονοματεπώνυμο",
    phonePlaceholder: "Τηλέφωνο Επικοινωνίας",
    emailPlaceholder: "Email",
    fillRequired: "Παρακαλώ συμπληρώστε το Ονοματεπώνυμο, το Τηλέφωνο και το Email σας για να προχωρήσετε.",
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
    datesOverlap: "Οι ημερομηνίες που επιλέξατε συμπίπτουν με υπάρχουσα κράτηση. Παρακαλώ επιλέξτε άλλες ημερομηνίες.",
    invalidFileType: "Μη αποδεκτός τύπος αρχείου. Επιτρέπονται μόνο εικόνες (JPG, PNG, WEBP) και έγγραφα PDF.",
    fileTooLarge: "Το αρχείο είναι πολύ μεγάλο. Μέγιστο επιτρεπόμενο μέγεθος: 10MB.",
    months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    daysShort: ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"],
    menuHome: "ΑΡΧΙΚΗ",
    menuFleet: "Ο ΣΤΟΛΟΣ",
    menuLocation: "ΤΟΠΟΘΕΣΙΑ",
    menuContact: "ΕΠΙΚΟΙΝΩΝΙΑ",
    back: "ΕΠΙΣΤΡΟΦΗ"
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
    bookingTitle: "Vehicle Booking",
    fastTrackSub: "Photograph or upload your documents (JPG, PNG, PDF).",
    personalInfoTitle: "Customer Details",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    emailPlaceholder: "Email Address",
    fillRequired: "Please fill in your Full Name, Phone, and Email to proceed.",
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
    datesOverlap: "Selected dates overlap with an existing booking. Please select different dates.",
    invalidFileType: "Invalid file format. Only images (JPG, PNG, WEBP) and PDF files are allowed.",
    fileTooLarge: "File is too large. Maximum allowed size: 10MB.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    menuHome: "HOME",
    menuFleet: "THE FLEET",
    menuLocation: "LOCATION",
    menuContact: "CONTACT",
    back: "BACK"
  }
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
  transmission?: string; 
  availability?: string[];
};

type ExistingBooking = {
  check_in: string;
  check_out: string;
};

export default function PremiumFleetApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeAvailability, setActiveAvailability] = useState<string>('Ενοικίαση');
  
  const categories = ['All', 'Premium', 'SUV / 4x4', 'Sedan', 'Compact / Hatchback'];
  
  const [introVisible, setIntroVisible] = useState(true);
  const [introRendered, setIntroRendered] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false); 

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [existingBookings, setExistingBookings] = useState<ExistingBooking[]>([]);
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
    
    async function fetchVehicles() {
      const { data } = await supabase.from('vehicles').select('*').eq('is_active', true).order('price', { ascending: false });
      if (data) setVehicles(data);
      setLoading(false);
    }
    fetchVehicles();
    return () => { clearTimeout(fadeOutTimer); clearTimeout(unmountTimer); };
  }, []);

  useEffect(() => {
    if (selectedVehicle) {
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
      setCalendarDate(new Date());
      setCustomerInfo({ name: '', phone: '', email: '' });
      setIdFile(null);
      setLicenseFile(null);
      setPaymentMode('full');
      setExistingBookings([]);
      setSelectedRange({ start: null, end: null });
    }
  }, [selectedVehicle]);

  const toggleLanguage = () => {
    const newLang = lang === 'el' ? 'en' : 'el';
    setLang(newLang);
    localStorage.setItem('autolaz_lang', newLang);
  };

  const scrollToSection = (id: string) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const validateAndSetFile = (file: File | null, setFileState: (f: File | null) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!file) return;
    
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; 

    if (!allowedMimeTypes.includes(file.type)) {
      alert(t.invalidFileType);
      if (inputRef.current) inputRef.current.value = '';
      setFileState(null);
      return;
    }

    if (file.size > maxSizeBytes) {
      alert(t.fileTooLarge);
      if (inputRef.current) inputRef.current.value = '';
      setFileState(null);
      return;
    }

    setFileState(file);
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
    
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.email.trim()) {
      alert(t.fillRequired);
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: conflictCheck } = await supabase
        .from('bookings')
        .select('id')
        .eq('vehicle_id', selectedVehicle.id)
        .lte('check_in', selectedRange.end)
        .gte('check_out', selectedRange.start)
        .not('status', 'ilike', '%cancelled%')
        .not('status', 'ilike', '%ακυρώ%');

      if (conflictCheck && conflictCheck.length > 0) {
        throw new Error(t.datesOverlap);
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

      const totalCost = calculateTotal();
      const depositAmount = Math.round(totalCost * 0.3);
      const amountToPay = paymentMode === 'full' ? totalCost : depositAmount;
      const totalDays = getCalculatedDays();

      const paymentStatus = paymentMode === 'full' ? '100% Εξόφληση' : '30% Προκαταβολή';
      const fastTrackStatus = (uploadedIdUrl && uploadedLicenseUrl) ? ' (Fast Track Attached)' : '';

      const { error: supabaseError } = await supabase.from('bookings').insert([{ 
        vehicle_id: selectedVehicle.id, 
        vehicle_model: selectedVehicle.model, 
        check_in: selectedRange.start, 
        check_out: selectedRange.end, 
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

  const displayedVehicles = vehicles.filter(v => {
    const matchCategory = activeCategory === 'All' || v.category === activeCategory;
    const matchAvailability = v.availability ? v.availability.includes(activeAvailability) : activeAvailability === 'Ενοικίαση';
    return matchCategory && matchAvailability;
  });

  const DateRangePicker = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = calendarDate.getFullYear(); 
    const month = calendarDate.getMonth(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay() || 7; 
    
    const isDateBooked = (dateStr: string) => {
      return existingBookings.some(b => dateStr >= b.check_in && dateStr <= b.check_out);
    };

    const isRangeOverlapping = (startStr: string, endStr: string) => {
      return existingBookings.some(b => startStr <= b.check_out && endStr >= b.check_in);
    };

    const calendarDays = [];
    for (let i = 1; i < firstDayIndex; i++) calendarDays.push(<div key={`empty-${i}`} className="h-10"></div>);

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDateObj = new Date(year, month, day);
        const isPast = currentDateObj < today;
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const isBooked = isDateBooked(dateStr);
        
        let dayClass = "h-10 flex items-center justify-center text-sm transition-all duration-300 rounded-full ";

        if (isPast || isBooked) {
          dayClass += " text-gray-700 bg-gray-900/40 line-through cursor-not-allowed";
        } else if (selectedRange.start === dateStr || selectedRange.end === dateStr) {
          dayClass += " bg-[#D90000] text-white font-bold shadow-[0_4px_10px_rgba(217,0,0,0.4)] scale-110";
        } else if (selectedRange.start && selectedRange.end && dateStr > selectedRange.start && dateStr < selectedRange.end) {
          dayClass += " bg-[#D90000]/15 text-[#D90000]";
        } else {
          dayClass += " text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer";
        }

        calendarDays.push(
          <div 
            key={dateStr} 
            onClick={() => {
              if (isPast || isBooked) return;
              
              if (!selectedRange.start || (selectedRange.start && selectedRange.end)) {
                setSelectedRange({ start: dateStr, end: null });
              } else if (dateStr < selectedRange.start) {
                setSelectedRange({ start: dateStr, end: null });
              } else {
                if (isRangeOverlapping(selectedRange.start, dateStr)) {
                  alert(t.datesOverlap);
                  return;
                }
                setSelectedRange({ start: selectedRange.start, end: dateStr });
              }
            }} 
            className={dayClass}
          >
            {day}
          </div>
        );
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

      {/* FULL SCREEN MOBILE MENU */}
      <div className={`fixed inset-0 z-[200] bg-[#050505] flex flex-col transition-all duration-500 ${isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div className="px-5 md:px-12 py-4 flex justify-between items-center border-b border-white/5">
          <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white hover:text-[#D90000] transition-colors">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="flex-1 flex flex-col items-center justify-center gap-10">
          <button onClick={() => scrollToSection('home')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#D90000] transition-colors uppercase">{t.menuHome}</button>
          <button onClick={() => scrollToSection('fleet')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#D90000] transition-colors uppercase">{t.menuFleet}</button>
          <button onClick={() => scrollToSection('contact')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#D90000] transition-colors uppercase">{t.menuLocation}</button>
          <button onClick={() => scrollToSection('contact')} className="text-2xl md:text-4xl font-serif-premium tracking-widest text-white hover:text-[#D90000] transition-colors uppercase">{t.menuContact}</button>
        </div>

        <div className="pb-12 flex justify-center items-center gap-8">
          <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 1.76-6.98 6.237-.058 1.281-.072 1.688-.072 4.947s.014 3.666.072 4.947c.2 4.482 2.617 6.036 6.98 6.237 1.28.058 1.688.072 4.947.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-1.76 6.979-6.237.059-1.281.073-1.689.073-4.947s-.014-3.666-.073-4.947c-.197-4.478-2.62-6.037-6.979-6.237-1.28-.058-1.688-.072-4.948-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4s1.791-4 4-4 4 1.79 4 4-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
          </a>
          <a href="tel:+306948766884" className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
          </a>
        </div>
      </div>

      <header className="fixed top-0 w-full z-40 bg-[#070707]/95 backdrop-blur-2xl border-b border-white/5 px-5 md:px-12 py-4 flex justify-between items-center transition-all shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <AutoLazaridisLogo className="h-10 md:h-12 w-auto" />
        
        <div className="flex items-center gap-6">
          <button 
            onClick={toggleLanguage}
            className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-3 py-2 rounded-lg transition-colors border border-white/10"
          >
            <span className={lang === 'en' ? 'text-white' : 'text-gray-600'}>EN</span>
            <span className="text-gray-600">/</span>
            <span className={lang === 'el' ? 'text-white' : 'text-gray-600'}>GR</span>
          </button>
          
          <button onClick={() => setIsMenuOpen(true)} className="p-2 text-white hover:text-[#D90000] transition-colors focus:outline-none">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      <section id="home" className="relative w-full h-[65vh] flex flex-col justify-center items-center text-center px-5 md:px-12 mt-16 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none scale-150 md:scale-125">
          <div className="absolute w-[80vw] h-[80vw] max-w-[800px] max-h-[800px] bg-[#8B0000] blur-[180px] opacity-15 rounded-full mix-blend-screen"></div>
          <AutoLazaridisLogo className="w-full max-w-5xl h-auto opacity-[0.25] relative z-10" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/90 via-[#030303]/60 to-[#030303]"></div>
        <div className="relative z-10 max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 w-full px-2">
          <h1 className="text-4xl md:text-6xl font-serif-premium font-light leading-tight mb-4 md:mb-6 px-2 drop-shadow-2xl">
            {t.heroTitle1} <br/>
            <span className="italic text-gray-300">{t.heroTitle2}</span>
          </h1>
          <p className="text-[11px] md:text-sm text-gray-400 max-w-xl mx-auto font-light leading-relaxed tracking-wide px-4 drop-shadow-md mb-8">
            {t.heroSub}
          </p>
          
          <div className="flex flex-nowrap justify-start md:justify-center gap-2 md:gap-3 overflow-x-auto hide-scrollbar w-full pb-2 px-1">
            {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => (
              <button 
                key={type}
                onClick={() => setActiveAvailability(type)}
                className={`flex-shrink-0 whitespace-nowrap px-6 md:px-8 py-3.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-md ${activeAvailability === type ? 'bg-[#D90000] text-white shadow-[0_4px_20px_rgba(217,0,0,0.5)] scale-105 border border-red-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10'}`}
              >
                {type === 'Ενοικίαση' ? t.rentals : type === 'Leasing' ? t.leasing : t.forSale}
              </button>
            ))}
          </div>

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

      <main id="fleet" className="px-5 md:px-12 py-16 md:py-20 max-w-[1400px] mx-auto pb-safe">
        {loading ? (
          <div className="text-center py-32 text-gray-500 text-[10px] md:text-sm uppercase tracking-widest animate-pulse">{t.updating}</div>
        ) : (
          <div className="flex flex-col gap-10 md:gap-12">
            {displayedVehicles.map(v => (
              <div key={v.id} className="group flex flex-col md:flex-row bg-[#0A0A0A] border border-white/5 rounded-[2rem] md:rounded-[2.5rem] overflow-hidden hover:border-white/10 transition-all duration-500 shadow-2xl">
                <div className="w-full md:w-1/2 aspect-[4/3] md:aspect-auto relative overflow-hidden bg-[#111]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.photos && v.photos.length > 0 ? v.photos[0] : '/brand-logo.png'} alt={v.model} className={`absolute inset-0 w-full h-full object-cover grayscale-[20%] group-hover:scale-105 transition-transform duration-[1.5s] ease-out opacity-90 group-hover:opacity-100 ${!v.photos || v.photos.length === 0 ? 'object-contain p-10 opacity-30' : ''}`} />
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0A0A0A] opacity-0 md:opacity-100"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] to-transparent opacity-100 md:opacity-0"></div>
                </div>
                <div className="w-full md:w-1/2 p-6 md:p-16 flex flex-col justify-center relative z-10">
                  <div className="inline-block px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-[#D90000]/10 text-[#D90000] text-[8px] md:text-[9px] font-bold uppercase tracking-widest w-fit mb-4 md:mb-6 border border-[#D90000]/20">{v.category}</div>
                  <h2 className="text-3xl md:text-5xl font-serif-premium font-light mb-4 md:mb-6 leading-tight">{v.model}</h2>
                  
                  <div className="flex gap-4 md:gap-8 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-white/5">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.engine}</div>
                      <div className="text-sm md:text-xl font-medium">{v.cc} <span className="text-[10px] md:text-xs text-gray-400 font-light">CC</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.power}</div>
                      <div className="text-sm md:text-xl font-medium">{v.hp} <span className="text-[10px] md:text-xs text-gray-400 font-light">HP</span></div>
                    </div>
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.transmission}</div>
                      <div className="text-sm md:text-xl font-medium">
                        {v.transmission?.toLowerCase().includes('man') || v.transmission?.toLowerCase().includes('χειρ') ? t.manual : t.auto}
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
                    <div>
                      <div className="text-[9px] md:text-[10px] text-gray-500 uppercase tracking-widest mb-1">{t.cost}</div>
                      <div className="text-2xl md:text-4xl font-light">
                        €{v.price}
                        {activeAvailability === 'Ενοικίαση' && <span className="text-xs md:text-sm text-gray-500 ml-2">{t.perDay}</span>}
                        {activeAvailability === 'Leasing' && <span className="text-xs md:text-sm text-gray-500 ml-2">{t.perMonth}</span>}
                      </div>
                    </div>
                    <button onClick={() => setSelectedVehicle(v)} className="w-full md:w-auto px-8 md:px-10 py-4 md:py-5 bg-white text-black rounded-full text-[10px] font-bold uppercase tracking-[0.2em] hover:bg-[#D90000] hover:text-white transition-all duration-300 shadow-lg hover:shadow-[0_10px_20px_rgba(217,0,0,0.3)]">
                      {activeAvailability === 'Πώληση' ? t.buyNow : t.select}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <footer id="contact" className="bg-[#050505] border-t border-white/5 px-6 md:px-12 py-16 md:py-20 pb-safe mt-4">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row justify-between items-center gap-8 md:gap-10">
          <AutoLazaridisLogo className="h-8 md:h-10 w-auto opacity-50 grayscale hover:grayscale-0 transition-all" />
          <div className="flex flex-col md:flex-row gap-4 md:gap-8 text-center md:text-right text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500">
            <span>{t.address}</span>
            <a href="tel:+306948766884" className="hover:text-white transition-colors">{t.tel}</a>
          </div>
        </div>
      </footer>

      {/* --- BOOKING MODAL (ΜΕ ΚΟΥΜΠΙ ΕΠΙΣΤΡΟΦΗΣ) --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[250] flex justify-end transition-opacity">
          {/* Κλικάρισμα στο φόντο για κλείσιμο */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }}></div>
          
          <div className="relative w-full md:w-[550px] h-[100dvh] bg-[#0A0A0A] md:border-l border-white/10 shadow-2xl flex flex-col animate-in slide-in-from-bottom md:slide-in-from-right duration-500 md:rounded-l-[3rem] overflow-hidden">
            
            {/* Header / Κουμπί Επιστροφής */}
            <div className="px-5 md:px-8 py-5 border-b border-white/5 flex justify-between items-center bg-[#050505] z-20 shrink-0">
              <button 
                onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }} 
                className="flex items-center gap-3 text-white hover:text-[#D90000] transition-colors group"
              >
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 group-hover:bg-[#D90000]/20 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest">{t.back}</span>
              </button>
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{t.bookingTitle}</h3>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto pb-safe px-5 md:px-8 pt-6 space-y-8 hide-scrollbar">
              
              <div className="w-full aspect-video rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative border border-white/5">
                 {/* eslint-disable-next-line @next/next/no-img-element */}
                 <img src={selectedVehicle.photos && selectedVehicle.photos.length > 0 ? selectedVehicle.photos[0] : '/brand-logo.png'} alt={selectedVehicle.model} className={`w-full h-full object-cover grayscale-[10%] ${!selectedVehicle.photos || selectedVehicle.photos.length === 0 ? 'object-contain p-10 opacity-30' : ''}`} />
                 <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                 <div className="absolute bottom-4 left-5 md:left-6">
                   <h2 className="text-xl md:text-2xl font-serif-premium text-white">{selectedVehicle.model}</h2>
                 </div>
              </div>

              <DateRangePicker />

              {/* Προσωπικά Στοιχεία Form */}
              <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2.5rem]">
                <div className="mb-5">
                  <h4 className="text-[10px] text-[#D90000] uppercase tracking-[0.2em] font-bold mb-1">{t.personalInfoTitle}</h4>
                </div>
                <div className="space-y-4">
                  <input 
                    type="text" 
                    required
                    placeholder={t.namePlaceholder} 
                    value={customerInfo.name} 
                    onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D90000] transition-colors"
                  />
                  <input 
                    type="tel" 
                    required
                    placeholder={t.phonePlaceholder} 
                    value={customerInfo.phone} 
                    onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D90000] transition-colors"
                  />
                  <input 
                    type="email" 
                    required
                    placeholder={t.emailPlaceholder} 
                    value={customerInfo.email} 
                    onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} 
                    className="w-full bg-black border border-white/10 rounded-xl px-4 py-4 text-sm text-white focus:outline-none focus:border-[#D90000] transition-colors"
                  />
                </div>
              </div>

              <div className="bg-[#111] border border-white/5 p-6 md:p-8 rounded-[2.5rem]">
                <div className="mb-5">
                  <h4 className="text-[10px] text-[#D90000] uppercase tracking-[0.2em] font-bold mb-1">Fast Track Check-In</h4>
                  <p className="text-[10px] md:text-xs text-gray-500">{t.fastTrackSub}</p>
                </div>
                
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,application/pdf" 
                  className="hidden" 
                  ref={idInputRef} 
                  onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setIdFile, idInputRef)} 
                />
                <input 
                  type="file" 
                  accept="image/jpeg,image/png,image/webp,application/pdf" 
                  className="hidden" 
                  ref={licenseInputRef} 
                  onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setLicenseFile, licenseInputRef)} 
                />

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
                <div className="relative bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 md:p-8 overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] mt-8">
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