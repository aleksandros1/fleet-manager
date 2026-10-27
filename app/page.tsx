'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createClient } from '@supabase/supabase-js';
import SignatureCanvas from 'react-signature-canvas'; 

// --- Σύνδεση Supabase ---
const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CSS & Τυπογραφία ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
    body { 
      background-color: #050505; 
      color: #FFFFFF; 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
      -webkit-font-smoothing: antialiased; 
      -webkit-tap-highlight-color: transparent;
      scroll-behavior: smooth;
    }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #050505; }
    ::-webkit-scrollbar-thumb { background: #262626; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #404040; }
    .hide-scrollbar::-webkit-scrollbar { display: none; }
    .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    
    .animate-intro-title { animation: fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
    .animate-intro-subtitle { opacity: 0; animation: fadeIn 0.9s ease-out 0.25s forwards; }
    
    .pb-safe { padding-bottom: env(safe-area-inset-bottom, 2rem); }
  `}</style>
);

const AutoLazaridisLogo = ({ className = "h-14 w-auto" }) => (
  /* eslint-disable-next-line @next/next/no-img-element */
  <img 
    src="/brand-logo.png" 
    alt="Auto Lazaridis" 
    className={className} 
    style={{ 
      objectFit: 'contain',
      filter: 'invert(1) hue-rotate(180deg) saturate(3) contrast(1.2)' 
    }} 
  />
);

type SortOptionKey =
  | 'last_modified'
  | 'price_asc'
  | 'price_desc'
  | 'registration'
  | 'popular'
  | 'year_desc'
  | 'year_asc'
  | 'brand_model';

const TRANSLATIONS = {
  el: {
    introSubtitle: "AUTO LAZARIDIS • DRAMA",
    heroKicker: "ΕΙΣΑΓΩΓΕΣ & ΕΜΠΟΡΙΑ ΑΥΤΟΚΙΝΗΤΩΝ",
    heroTitle1: "Το επόμενο σου αυτοκίνητο",
    heroTitle2: "σε περιμένει.",
    heroSub: "Ποιοτικά μεταχειρισμένα και καινούργια αυτοκίνητα, με εγγύηση, διαφάνεια και άμεση εξυπηρέτηση.",
    btnSeeCars: "ΔΕΙΤΕ ΤΑ ΑΥΤΟΚΙΝΗΤΑ",
    btnRentals: "ΕΝΟΙΚΙΑΣΕΙΣ",
    trust1Title: "ΔΕΚΤΟΣ ΚΑΘΕ ΕΛΕΓΧΟΣ",
    trust1Sub: "Μηχανικός έλεγχος στο κατάστημά μας",
    trust2Title: "6 ΜΗΝΕΣ ΕΓΓΥΗΣΗ",
    trust2Sub: "Σε μηχανικά μέρη",
    trust3Title: "ΑΝΤΑΛΛΑΓΕΣ",
    trust3Sub: "Αγοράζουμε το παλιό σας όχημα",
    trust4Title: "ΤΡΑΠΕΖΙΚΗ ΣΥΝΑΛΛΑΓΗ",
    trust4Sub: "Με ασφάλεια και διαφάνεια",
    trust5Title: "ΔΟΚΙΜΑΣΤΙΚΗ ΟΔΗΓΗΣΗ",
    trust5Sub: "Επιλέξτε με σιγουριά",
    rentalBannerKicker: "ΥΠΗΡΕΣΙΕΣ ΜΙΣΘΩΣΗΣ",
    rentalBannerTitle: "Ενοικιάσεις Αυτοκινήτων & Βαν",
    rentalBannerDesc: "Για κάθε ανάγκη και κάθε διαδρομή. Ενοικιάσεις Ι.Χ. και επαγγελματικών 9-θέσιων βαν στον νομό Δράμας – Καβάλας και σε όλη την Ελλάδα.",
    rentalBannerBtn: "ΔΕΙΤΕ ΔΙΑΘΕΣΙΜΑ ΟΧΗΜΑΤΑ",
    fleetKicker: "ΚΑΤΑΛΟΓΟΣ ΟΧΗΜΑΤΩΝ",
    fleetTitleSales: "Αυτοκίνητα Προς Πώληση",
    fleetTitleRentals: "Στόλος Ενοικιάσεων",
    fleetTitleLeasing: "Επιλογές Leasing",
    all: "ΟΛΑ",
    updating: "Φόρτωση Στόλου...",
    power: "ΙΣΧΥΣ",
    engine: "ΚΥΒΙΣΜΟΣ",
    transmission: "ΚΙΒΩΤΙΟ",
    fuel: "ΚΑΥΣΙΜΟ",
    auto: "Αυτόματο",
    manual: "Χειροκίνητο",
    cost: "ΤΙΜΗ",
    perDay: "/ ημέρα",
    perMonth: "/ μήνα",
    select: "ΚΡΑΤΗΣΗ",
    callBtn: "ΚΛΗΣΗ",
    rentals: "ΕΝΟΙΚΙΑΖΟΜΕΝΑ",
    leasing: "LEASING",
    forSale: "ΠΡΟΣ ΠΩΛΗΣΗ",
    address: "7ο χλμ. Δράμας - Καβάλας, Δράμα",
    tel: "6948 766884",
    telLandline: "25210 26912",
    bookingTitle: "ΚΡΑΤΗΣΗ ΟΧΗΜΑΤΟΣ",
    fastTrackSub: "Ανεβάστε προαιρετικά τα έγγραφά σας για άμεση παραλαβή (JPG, PNG, PDF).",
    personalInfoTitle: "ΣΤΟΙΧΕΙΑ ΠΕΛΑΤΗ",
    namePlaceholder: "Ονοματεπώνυμο",
    phonePlaceholder: "Τηλέφωνο Επικοινωνίας",
    emailPlaceholder: "Διεύθυνση Email",
    fillRequired: "Παρακαλώ συμπληρώστε το Ονοματεπώνυμο, το Τηλέφωνο και το Email σας.",
    idCard: "ΤΑΥΤΟΤΗΤΑ / ΔΙΑΒΑΤΗΡΙΟ",
    license: "ΔΙΠΛΩΜΑ ΟΔΗΓΗΣΗΣ",
    fullPayment: "ΕΞΟΦΛΗΣΗ 100%",
    deposit: "ΠΡΟΚΑΤΑΒΟΛΗ 30%",
    remaining: "ΥΠΟΛΟΙΠΟ ΚΑΤΑ ΤΗΝ ΠΑΡΑΛΑΒΗ:",
    processing: "ΕΠΕΞΕΡΓΑΣΙΑ...",
    securePayment: "ΟΛΟΚΛΗΡΩΣΗ ΚΡΑΤΗΣΗΣ",
    alertCancel: "Η διαδικασία ακυρώθηκε.",
    datesOverlap: "Οι ημερομηνίες που επιλέξατε συμπίπτουν με υπάρχουσα κράτηση.",
    invalidFileType: "Μη αποδεκτός τύπος αρχείου. Επιτρέπονται μόνο εικόνες και PDF.",
    fileTooLarge: "Το αρχείο υπερβαίνει τα 10MB.",
    months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
    daysShort: ["Δευ", "Τρι", "Τετ", "Πεμ", "Παρ", "Σαβ", "Κυρ"],
    menuFleet: "ΑΥΤΟΚΙΝΗΤΑ",
    menuLocation: "ΤΟΠΟΘΕΣΙΑ",
    menuDetails: "ΣΤΟΙΧΕΙΑ",
    back: "ΠΙΣΩ",
    rentPaymentInfo: "ΣΥΝΟΛΟ ΕΝΟΙΚΙΑΣΗΣ",
    leasePaymentInfo: "ΠΡΟΚΑΤΑΒΟΛΗ LEASING (1ΟΣ ΜΗΝΑΣ)",
    buyPaymentInfo: "ΚΡΑΤΗΣΗ ΑΓΟΡΑΣ ΟΧΗΜΑΤΟΣ",
    daysSelected: "ΗΜΕΡΕΣ",
    brandLabel: "Μάρκα",
    brandSearchPlaceholder: "Τι μάρκα ψάχνεις;",
    popularBrands: "Δημοφιλείς μάρκες",
    allBrands: "Όλες οι μάρκες",
    clearBrands: "Καθαρισμός",
    sortOptions: {
      last_modified: "Τελευταία αλλαγή",
      price_asc: "Φθηνά πρώτα",
      price_desc: "Ακριβά πρώτα",
      registration: "Καταχώριση",
      popular: "Δημοφιλή",
      year_desc: "Καινούργια πρώτα",
      year_asc: "Παλιά πρώτα",
      brand_model: "Μάρκα / μοντέλο"
    }
  },
  en: {
    introSubtitle: "AUTO LAZARIDIS • DRAMA",
    heroKicker: "IMPORTS & CAR DEALERSHIP",
    heroTitle1: "Your next car",
    heroTitle2: "is waiting for you.",
    heroSub: "Quality used and new vehicles, with warranty, transparency, and immediate service.",
    btnSeeCars: "VIEW CARS",
    btnRentals: "RENTALS",
    trust1Title: "ANY INSPECTION WELCOME",
    trust1Sub: "Mechanical check at our premises",
    trust2Title: "6 MONTHS WARRANTY",
    trust2Sub: "On mechanical parts",
    trust3Title: "TRADE-INS",
    trust3Sub: "We buy your old vehicle",
    trust4Title: "BANK TRANSACTION",
    trust4Sub: "With safety and transparency",
    trust5Title: "TEST DRIVE",
    trust5Sub: "Choose with confidence",
    rentalBannerKicker: "RENTAL SERVICES",
    rentalBannerTitle: "Car & Van Rentals",
    rentalBannerDesc: "For every need and every route. Passenger car and 9-seater commercial van rentals in Drama – Kavala and all over Greece.",
    rentalBannerBtn: "VIEW AVAILABLE VEHICLES",
    fleetKicker: "VEHICLE INVENTORY",
    fleetTitleSales: "Vehicles For Sale",
    fleetTitleRentals: "Rental Fleet",
    fleetTitleLeasing: "Leasing Options",
    all: "ALL",
    updating: "Loading Fleet...",
    power: "POWER",
    engine: "ENGINE",
    transmission: "GEARBOX",
    fuel: "FUEL",
    auto: "Auto",
    manual: "Manual",
    cost: "PRICE",
    perDay: "/ day",
    perMonth: "/ month",
    select: "BOOK NOW",
    callBtn: "CALL",
    rentals: "RENTALS",
    leasing: "LEASING",
    forSale: "FOR SALE",
    address: "7th km Drama - Kavala, Drama",
    tel: "+30 6948 766884",
    telLandline: "+30 25210 26912",
    bookingTitle: "VEHICLE RESERVATION",
    fastTrackSub: "Optionally upload your documents for fast-track pickup (JPG, PNG, PDF).",
    personalInfoTitle: "CUSTOMER DETAILS",
    namePlaceholder: "Full Name",
    phonePlaceholder: "Phone Number",
    emailPlaceholder: "Email Address",
    fillRequired: "Please fill in your Full Name, Phone, and Email.",
    idCard: "ID CARD / PASSPORT",
    license: "DRIVING LICENSE",
    fullPayment: "100% FULL PAYMENT",
    deposit: "30% DEPOSIT",
    remaining: "BALANCE AT PICKUP:",
    processing: "PROCESSING...",
    securePayment: "COMPLETE BOOKING",
    alertCancel: "The process was cancelled.",
    datesOverlap: "Selected dates overlap with an existing booking.",
    invalidFileType: "Invalid file format. Only images and PDF files are allowed.",
    fileTooLarge: "File exceeds 10MB.",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    daysShort: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    menuFleet: "CARS",
    menuLocation: "LOCATION",
    menuDetails: "CONTACT",
    back: "BACK",
    rentPaymentInfo: "RENTAL TOTAL",
    leasePaymentInfo: "LEASING PAYMENT (1ST MONTH)",
    buyPaymentInfo: "VEHICLE PURCHASE RESERVATION",
    daysSelected: "DAYS",
    brandLabel: "Make",
    brandSearchPlaceholder: "Search make...",
    popularBrands: "Popular makes",
    allBrands: "All makes",
    clearBrands: "Clear",
    sortOptions: {
      last_modified: "Last modified",
      price_asc: "Price: Low to High",
      price_desc: "Price: High to Low",
      registration: "Date listed",
      popular: "Popular",
      year_desc: "Newest first",
      year_asc: "Oldest first",
      brand_model: "Make / Model"
    }
  }
};

type Vehicle = { 
  id: number | string; 
  plate: string; 
  brand: string; 
  model: string; 
  price: number; 
  is_active: boolean; 
  category: string; 
  photos: string[]; 
  availability?: string[];
  cc?: string; 
  hp?: string; 
  transmission?: string; 
  fuel?: string; 
  mileage?: string;
  year?: string;
  cargr_link?: string;
  price_per_day?: number; 
  price_per_month?: number;
  created_at?: string;
};

type DbCategory = { id: number; name: string; is_active: boolean; };

const BUILTIN_CARGR_VEHICLES: Vehicle[] = [
  { id: 'cargr-53822894', plate: '2018', brand: 'Citroen', model: 'C3', price: 35, price_per_day: 35, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/52724383_0_n.jpg'], availability: ['Ενοικίαση'], cc: '1400', hp: '105', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2018', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/53822894/' },
  { id: 'cargr-43716665', plate: '2017', brand: 'Ford', model: 'Fiesta', price: 35, price_per_day: 35, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/55703840_0_n.jpg'], availability: ['Ενοικίαση'], cc: '1500', hp: '90', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/43716665/' },
  { id: 'cargr-43716683', plate: '2017', brand: 'Renault', model: 'Clio', price: 35, price_per_day: 35, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/54185664_0_n.jpg'], availability: ['Ενοικίαση'], cc: '1500', hp: '90', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/43716683/' },
  { id: 'cargr-53823038', plate: '2016', brand: 'Opel', model: 'Corsa', price: 35, price_per_day: 35, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/338939864_0_n.jpg'], availability: ['Ενοικίαση'], cc: '1300', hp: '95', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/53823038/' },
  { id: 'cargr-46202214', plate: '2017', brand: 'Volkswagen', model: 'Polo 1.4 TDI', price: 30, price_per_day: 30, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/56411096_2_n.jpg'], availability: ['Ενοικίαση'], cc: '1400', hp: '90', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/46202214/' },
  { id: 'cargr-53897059', plate: '2016', brand: 'Fiat', model: '500L Multijet', price: 40, price_per_day: 40, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/49428138_0_n.jpg'], availability: ['Ενοικίαση'], cc: '1300', hp: '95', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/53897059/' },
  { id: 'cargr-53942614', plate: '2015', brand: 'BMW', model: 'X3', price: 65, price_per_day: 65, is_active: true, category: 'SUV / 4X4', photos: ['https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop'], availability: ['Ενοικίαση'], cc: '2000', hp: '184', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2015', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/53942614/' },
  { id: 'cargr-49428783', plate: '2017', brand: 'Citroen', model: 'Jumper 9-Θέσιο Van', price: 100, price_per_day: 100, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/49428783_0_n.jpeg'], availability: ['Ενοικίαση'], cc: '2000', hp: '130', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/49428783/' },
  { id: 'cargr-49428804', plate: '2017', brand: 'Fiat', model: 'Ducato 9-Θέσιο Van', price: 100, price_per_day: 100, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/49428804_0_n.jpeg'], availability: ['Ενοικίαση'], cc: '2000', hp: '130', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/49428804/' },
  { id: 'cargr-49428761', plate: '2017', brand: 'Renault', model: 'Trafic 9-Θέσιο Van', price: 80, price_per_day: 80, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/49428761_0_n.jpeg'], availability: ['Ενοικίαση'], cc: '1600', hp: '125', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/49428761/' },
  { id: 'cargr-44965625', plate: '2008', brand: 'Hummer', model: 'H2 VIP', price: 300, price_per_day: 300, is_active: true, category: 'PREMIUM', photos: ['https://static.car.gr/44965625_0_n.jpeg'], availability: ['Ενοικίαση'], cc: '6000', hp: '325', transmission: 'Αυτόματο', fuel: 'Βενζίνη', year: '2008', cargr_link: 'https://auto-lazaridis.car.gr/rentals/view/44965625/' },
  { id: 'cargr-56648613', plate: '2017', brand: 'Porsche', model: 'Macan', price: 47000, price_per_month: 790, is_active: true, category: 'PREMIUM', photos: ['https://static.car.gr/56648613_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '3000', hp: '258', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/56648613/' },
  { id: 'cargr-57315982', plate: '2016', brand: 'Mercedes-Benz', model: 'CLA 45 AMG', price: 34000, price_per_month: 590, is_active: true, category: 'PREMIUM', photos: ['https://static.car.gr/57315982_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '2000', hp: '380', transmission: 'Αυτόματο', fuel: 'Βενζίνη', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/57315982/' },
  { id: 'cargr-54414075', plate: '2020', brand: 'Mercedes-Benz', model: 'C 300', price: 26000, price_per_month: 460, is_active: true, category: 'SEDAN', photos: ['https://static.car.gr/54414075_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '2000', hp: '320', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2020', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/54414075/' },
  { id: 'cargr-56165640', plate: '2018', brand: 'Mitsubishi', model: 'L200 4x4', price: 24000, price_per_month: 420, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/56165640_3_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '2400', hp: '180', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2018', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/56165640/' },
  { id: 'cargr-54445159', plate: '2016', brand: 'Volkswagen', model: 'Golf GTD', price: 19500, price_per_month: 345, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/54445159_2_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '2000', hp: '185', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/54445159/' },
  { id: 'cargr-56225272', plate: '2015', brand: 'Volkswagen', model: 'Golf', price: 16500, price_per_month: 295, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/56225272_1q_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '2000', hp: '185', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2015', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/56225272/' },
  { id: 'cargr-56165620', plate: '2019', brand: 'Kia', model: 'Ceed GT-Line', price: 14900, price_per_month: 265, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/56165620_p_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1600', hp: '135', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2019', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/56165620/' },
  { id: 'cargr-57362326', plate: '2016', brand: 'Renault', model: 'Kadjar', price: 14500, price_per_month: 260, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/57362326_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1500', hp: '110', transmission: 'Αυτόματο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/57362326/' },
  { id: 'cargr-50238205', plate: '2016', brand: 'BMW', model: '216 Gran Coupé', price: 13000, price_per_month: 240, is_active: true, category: 'SEDAN', photos: ['https://static.car.gr/50238205_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1500', hp: '116', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/50238205/' },
  { id: 'cargr-54421509', plate: '2017', brand: 'Dacia', model: 'Duster 4x4', price: 12000, price_per_month: 220, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/54421509_2_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1500', hp: '110', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/54421509/' },
  { id: 'cargr-55492723', plate: '2016', brand: 'Renault', model: 'Captur', price: 11000, price_per_month: 205, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/55492723_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1500', hp: '110', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/55492723/' },
  { id: 'cargr-52724523', plate: '2018', brand: 'Dacia', model: 'Duster', price: 10500, price_per_month: 195, is_active: true, category: 'SUV / 4X4', photos: ['https://static.car.gr/52724523_1_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1500', hp: '110', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2018', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/52724523/' },
  { id: 'cargr-56062491', plate: '2021', brand: 'Hyundai', model: 'i10', price: 10000, price_per_month: 190, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/56062491_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1000', hp: '67', transmission: 'Αυτόματο', fuel: 'Βενζίνη', year: '2021', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/56062491/' },
  { id: 'cargr-50802055', plate: '2016', brand: 'Peugeot', model: '308', price: 10000, price_per_month: 190, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/50802055_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1200', hp: '130', transmission: 'Χειροκίνητο', fuel: 'Βενζίνη', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/50802055/' },
  { id: 'cargr-55979391', plate: '2016', brand: 'Hyundai', model: 'i20', price: 9200, price_per_month: 185, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/55979391_1_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1250', hp: '84', transmission: 'Χειροκίνητο', fuel: 'Βενζίνη', year: '2016', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/55979391/' },
  { id: 'cargr-52724383', plate: '2018', brand: 'Citroen', model: 'C3 Diesel', price: 9000, price_per_month: 180, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/52724383_0_n.jpg'], availability: ['Πώληση', 'Leasing'], cc: '1560', hp: '75', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2018', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/52724383/' },
  { id: 'cargr-55703840', plate: '2017', brand: 'Ford', model: 'Fiesta Econetic', price: 8500, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/55703840_0_n.jpg'], availability: ['Πώληση'], cc: '1500', hp: '90', transmission: 'Χειροκίνητο', fuel: 'Diesel', year: '2017', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/55703840/' },
  { id: 'cargr-52240849', plate: '2018', brand: 'Dacia', model: 'Sandero', price: 8000, is_active: true, category: 'COMPACT / HATCHBACK', photos: ['https://static.car.gr/52240849_1_n.jpg'], availability: ['Πώληση'], cc: '1000', hp: '75', transmission: 'Χειροκίνητο', fuel: 'Βενζίνη', year: '2018', cargr_link: 'https://auto-lazaridis.car.gr/cars/view/52240849/' }
];

function normalizeText(val?: string): string {
  if (!val) return '';
  return val
    .toUpperCase()
    .replace(/Α/g, 'A')
    .replace(/Β/g, 'B')
    .replace(/Ε/g, 'E')
    .replace(/Ζ/g, 'Z')
    .replace(/Η/g, 'H')
    .replace(/Ι/g, 'I')
    .replace(/Κ/g, 'K')
    .replace(/Μ/g, 'M')
    .replace(/Ν/g, 'N')
    .replace(/Ο/g, 'O')
    .replace(/Ρ/g, 'P')
    .replace(/Τ/g, 'T')
    .replace(/Υ/g, 'Y')
    .replace(/Χ/g, 'X')
    .replace(/\s+/g, ' ')
    .trim();
}

// Εξάγει καθαρά τη Μάρκα από οποιοδήποτε όχημα στη βάση (ακόμα κι αν η μάρκα είναι γραμμένη μέσα στο model)
function extractVehicleBrand(v: Vehicle): string {
  const rawBrand = (v.brand || '').trim();
  const rawModel = (v.model || '').trim();
  const combined = (rawBrand + ' ' + rawModel).trim();
  if (!combined) return 'Άλλο';

  const multiWordBrands = ['Mercedes-Benz', 'Alfa Romeo', 'Land Rover', 'Range Rover', 'Aston Martin'];
  for (const mb of multiWordBrands) {
    if (combined.toLowerCase().startsWith(mb.toLowerCase())) return mb;
  }
  if (combined.toLowerCase().startsWith('mercedes')) return 'Mercedes-Benz';
  if (combined.toLowerCase().startsWith('vw ') || combined.toLowerCase() === 'vw') return 'Volkswagen';

  const firstToken = (rawBrand || rawModel.split(' ')[0] || '').trim();
  const upper = firstToken.toUpperCase();
  if (upper === 'BMW' || upper === 'MINI' || upper === 'FIAT' || upper === 'KIA' || upper === 'SEAT') {
    return upper;
  }
  return firstToken.charAt(0).toUpperCase() + firstToken.slice(1).toLowerCase();
}

// Σύντομο Monogram/Badge για το πλέγμα "Δημοφιλείς μάρκες"
function getBrandMonogram(brand: string): string {
  const u = brand.toUpperCase();
  if (u.includes('MERCEDES')) return 'MB';
  if (u.includes('VOLKSWAGEN')) return 'VW';
  if (u === 'BMW') return 'BMW';
  if (u === 'AUDI') return 'AUDI';
  if (u === 'FIAT') return 'FIAT';
  if (u === 'FORD') return 'FORD';
  if (u === 'OPEL') return 'OPEL';
  if (u === 'MINI') return 'MINI';
  if (u === 'KIA') return 'KIA';
  return u.slice(0, 4);
}

function sanitizeVehiclePrice(v: Vehicle): number {
  const raw = Number(v.price) || 0;
  const fullName = ((v.brand || '') + ' ' + (v.model || '')).toUpperCase();
  const isLuxury = /PORSCHE|MERCEDES|AMG|BMW|AUDI|HUMMER|MACAN|CAYENNE|L200|LAND ROVER|RANGE ROVER/.test(fullName);

  if (raw > 100000) {
    const stripped = parseInt(String(raw).slice(1), 10);
    if (stripped >= 3000) return stripped;
  }
  if (!isLuxury && raw > 35000) {
    const stripped = parseInt(String(raw).slice(1), 10);
    if (stripped >= 3500 && stripped <= 32000) return stripped;
  }
  return raw;
}

function extractVehicleYear(v: Vehicle): number {
  if (v.year && /^(199\d|20[0-2]\d)$/.test(String(v.year).trim())) {
    return parseInt(String(v.year).trim(), 10);
  }
  if (v.plate && /^(199\d|20[0-2]\d)$/.test(String(v.plate).trim())) {
    return parseInt(String(v.plate).trim(), 10);
  }
  const textMatch = ((v.brand || '') + ' ' + (v.model || '')).match(/\b(199\d|20[0-2]\d)\b/);
  if (textMatch) return parseInt(textMatch[1], 10);
  const seedMatch = BUILTIN_CARGR_VEHICLES.find(
    s =>
      String(s.id) === String(v.id) ||
      (v.plate && String(s.id).toUpperCase() === String(v.plate).toUpperCase()) ||
      (v.photos?.[0] && s.photos?.[0] === v.photos[0])
  );
  if (seedMatch?.year) return parseInt(seedMatch.year, 10);
  return 2018;
}

export default function PremiumFleetApp() {
  const [vehicles, setVehicles] = useState<Vehicle[]>(BUILTIN_CARGR_VEHICLES);
  const [categories, setCategories] = useState<DbCategory[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeAvailability, setActiveAvailability] = useState<string>('Πώληση');
  const [showFleet, setShowFleet] = useState(true);

  // --- ΚΑΤΑΣΤΑΣΗ ΕΠΙΛΟΓΗΣ & ΑΝΑΖΗΤΗΣΗΣ ΜΑΡΚΑΣ (ΔΥΝΑΜΙΚΑ ΑΠΟ ΤΗ ΒΑΣΗ) ---
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearchQuery, setBrandSearchQuery] = useState<string>('');
  const [isBrandDropdownOpen, setIsBrandDropdownOpen] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);

  // --- ΚΑΤΑΣΤΑΣΗ ΤΑΞΙΝΟΜΗΣΗΣ (SORTING FEATURE) ---
  const [sortBy, setSortBy] = useState<SortOptionKey>('price_desc');
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const sortDropdownRef = useRef<HTMLDivElement>(null);
  
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

  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const sigCanvas = useRef<any>(null);
  const [signatureSaved, setSignatureSaved] = useState(false);
  const [bookingCode, setBookingCode] = useState("");
  const [showDetailsBanner, setShowDetailsBanner] = useState(false);

  // Κλείσιμο των Dropdowns (Μάρκας & Ταξινόμησης) όταν κάνεις κλικ έξω
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setIsSortDropdownOpen(false);
      }
      if (brandDropdownRef.current && !brandDropdownRef.current.contains(e.target as Node)) {
        setIsBrandDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedLang = localStorage.getItem('autolaz_lang') as 'el' | 'en';
    if (savedLang) setLang(savedLang);

    const urlParams = new URLSearchParams(window.location.search);
    const activeLang = savedLang || 'el';
    
    if (urlParams.get('payment') === 'success') {
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setBookingCode('ALX-' + String(randomNum));
      setShowSignatureModal(true);
      window.history.replaceState(null, '', window.location.pathname);
    } else if (urlParams.get('payment') === 'cancelled') {
      alert(TRANSLATIONS[activeLang].alertCancel);
      window.history.replaceState(null, '', window.location.pathname);
    }

    const fadeOutTimer = setTimeout(() => setIntroVisible(false), 1800);
    const unmountTimer = setTimeout(() => setIntroRendered(false), 2500);
    
    async function initializeApp() {
      try {
        const [resVehicles, resCategories] = await Promise.all([
          supabase.from('vehicles').select('*').eq('is_active', true).order('price', { ascending: false }),
          supabase.from('categories').select('*').eq('is_active', true).order('name', { ascending: true })
        ]);

        const dbVehicles: Vehicle[] = ((resVehicles.data as Vehicle[]) || []).map(v => {
          const cleanPrice = sanitizeVehiclePrice(v);
          const fullNameUpper = ((v.brand || '') + ' ' + (v.model || '')).toUpperCase();
          let fixedCat = v.category;
          if (/QASHQAI|CACTUS|DUSTER|CAPTUR|KADJAR|X3|MACAN|L200/.test(fullNameUpper) && fixedCat === 'PREMIUM' && cleanPrice < 20000) {
            fixedCat = 'SUV / 4X4';
          }
          return { ...v, price: cleanPrice, category: fixedCat };
        });

        if (dbVehicles.length > 0) {
          setVehicles(dbVehicles);
        }
        if (resCategories.data) setCategories(resCategories.data as DbCategory[]);
      } catch (err) {
        console.error('Initialization error:', err);
      } finally {
        setLoading(false);
      }
    }
    initializeApp();
    return () => { clearTimeout(fadeOutTimer); clearTimeout(unmountTimer); };
  }, []);

  useEffect(() => {
    if (selectedVehicle && activeAvailability === 'Ενοικίαση' && typeof selectedVehicle.id === 'number') {
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
    setIsMenuOpen(false); 
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 90; 
      const elementPosition = element.getBoundingClientRect().top;
      window.scrollTo({ top: elementPosition + window.pageYOffset - headerOffset, behavior: "smooth" });
    }
  };

  const handleAvailabilityClick = (type: string) => { 
    setActiveAvailability(type); 
    setShowFleet(true);
    setTimeout(() => scrollToSection('fleet'), 100); 
  };

  const toggleBrandSelection = (brandName: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandName) ? prev.filter(b => b !== brandName) : [...prev, brandName]
    );
  };

  const validateAndSetFile = (file: File | null, setFileState: (f: File | null) => void, inputRef: React.RefObject<HTMLInputElement | null>) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(file.type)) { alert(t.invalidFileType); if (inputRef.current) inputRef.current.value = ''; return; }
    if (file.size > 10 * 1024 * 1024) { alert(t.fileTooLarge); if (inputRef.current) inputRef.current.value = ''; return; }
    setFileState(file);
  };

  const getCalculatedDays = () => {
    if (!selectedRange.start) return 1;
    if (!selectedRange.end || selectedRange.start === selectedRange.end) return 1;
    const diffDays = Math.ceil((new Date(selectedRange.end).getTime() - new Date(selectedRange.start).getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 0 ? 1 : diffDays;
  };

  const getEffectiveDisplayPrice = (v: Vehicle) => {
    const cleanBasePrice = sanitizeVehiclePrice(v);
    if (activeAvailability === 'Ενοικίαση') {
      return v.price_per_day || cleanBasePrice;
    }
    if (activeAvailability === 'Leasing') {
      return v.price_per_month || (cleanBasePrice > 2500 ? Math.max(180, Math.round((cleanBasePrice * 0.85) / 48)) : cleanBasePrice);
    }
    return cleanBasePrice;
  };

  const calculateTotal = () => { 
    if (!selectedVehicle) return 0; 
    const cleanPrice = sanitizeVehiclePrice(selectedVehicle);
    if (activeAvailability === 'Ενοικίαση') {
        const rate = selectedVehicle.price_per_day || cleanPrice;
        return getCalculatedDays() * rate;
    }
    if (activeAvailability === 'Leasing') {
        return selectedVehicle.price_per_month || Math.max(180, Math.round((cleanPrice * 0.85) / 48));
    }
    return cleanPrice; 
  };

  const handleBookingToStripe = async () => {
    if (!selectedVehicle) return;
    if (activeAvailability === 'Ενοικίαση' && !selectedRange.start) return;
    if (!customerInfo.name.trim() || !customerInfo.phone.trim() || !customerInfo.email.trim()) { alert(t.fillRequired); return; }
    
    setIsSubmitting(true);
    try {
      const todayIso = new Date().toISOString().split('T')[0];
      const checkInDate = selectedRange.start || todayIso;
      const checkOutDate = selectedRange.end || selectedRange.start || todayIso;
      const totalCost = calculateTotal(); 
      const amountToPay = paymentMode === 'full' ? totalCost : Math.round(totalCost * 0.3);

      if (activeAvailability === 'Ενοικίαση' && typeof selectedVehicle.id === 'number') {
        const { data: conflictCheck, error: conflictError } = await supabase
          .from('bookings')
          .select('id')
          .eq('vehicle_id', selectedVehicle.id)
          .lte('check_in', checkOutDate)
          .gte('check_out', checkInDate)
          .not('status', 'ilike', '%cancelled%')
          .not('status', 'ilike', '%ακυρώ%');
          
        if (conflictError) throw new Error(conflictError.message);

        if (conflictCheck && conflictCheck.length > 0) {
          throw new Error(t.datesOverlap);
        }
      }

      let uploadedIdUrl = null;
      let uploadedLicenseUrl = null;

      if (idFile) {
        const fileExt = idFile.name.split('.').pop();
        const fileName = 'id_' + String(Date.now()) + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, idFile);
        if (uploadError) throw new Error("Σφάλμα κατά το ανέβασμα της Ταυτότητας.");
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        uploadedIdUrl = publicUrlData.publicUrl;
      }

      if (licenseFile) {
        const fileExt = licenseFile.name.split('.').pop();
        const fileName = 'license_' + String(Date.now()) + '_' + Math.random().toString(36).substring(7) + '.' + fileExt;
        const { error: uploadError } = await supabase.storage.from('documents').upload(fileName, licenseFile);
        if (uploadError) throw new Error("Σφάλμα κατά το ανέβασμα του Διπλώματος.");
        const { data: publicUrlData } = supabase.storage.from('documents').getPublicUrl(fileName);
        uploadedLicenseUrl = publicUrlData.publicUrl;
      }

      const paymentStatus = paymentMode === 'full' ? '100% Εξόφληση' : '30% Προκαταβολή';
      const fastTrackStatus = (uploadedIdUrl && uploadedLicenseUrl) ? ' (Fast Track Attached)' : '';
      const bookingTypeLabel = activeAvailability === 'Πώληση' ? 'Αγορά' : activeAvailability === 'Leasing' ? 'Leasing' : 'Ενοικίαση';
      const vehicleFullName = selectedVehicle.brand ? (selectedVehicle.brand + ' ' + selectedVehicle.model) : selectedVehicle.model;

      const numericVehicleId = typeof selectedVehicle.id === 'number' ? selectedVehicle.id : null;

      const { error: supabaseError } = await supabase.from('bookings').insert([{ 
        vehicle_id: numericVehicleId, 
        vehicle_model: vehicleFullName + ' [' + bookingTypeLabel + ']', 
        check_in: checkInDate, 
        check_out: checkOutDate, 
        total_price: totalCost, 
        status: 'Εκκρεμεί Πληρωμή: ' + paymentStatus + fastTrackStatus, 
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
        body: JSON.stringify({ 
          vehicleId: selectedVehicle.id, 
          model: vehicleFullName + ' [' + bookingTypeLabel + '] ' + stripeDescriptionModifier, 
          price: amountToPay, 
          checkIn: checkInDate, 
          checkOut: checkOutDate, 
          days: activeAvailability === 'Ενοικίαση' ? getCalculatedDays() : 1 
        }),
      });
      const data = await response.json();
      if (data.url) window.location.href = data.url; else throw new Error('Payment token generation failed.');
    } catch (err: any) { alert('Error: ' + err.message); setIsSubmitting(false); }
  };

  const defaultCategories = ['COMPACT / HATCHBACK', 'PREMIUM', 'SEDAN', 'SUV / 4X4'];
  const dbCategoryNames = categories.map(c => c.name);
  const mergedCategoryNames = dbCategoryNames.length > 0 ? dbCategoryNames : defaultCategories;
  const finalUiCategories = ['All', ...mergedCategoryNames];

  const SORT_MENU_OPTIONS: { key: SortOptionKey; label: string }[] = [
    { key: 'last_modified', label: t.sortOptions.last_modified },
    { key: 'price_asc', label: t.sortOptions.price_asc },
    { key: 'price_desc', label: t.sortOptions.price_desc },
    { key: 'registration', label: t.sortOptions.registration },
    { key: 'popular', label: t.sortOptions.popular },
    { key: 'year_desc', label: t.sortOptions.year_desc },
    { key: 'year_asc', label: t.sortOptions.year_asc },
    { key: 'brand_model', label: t.sortOptions.brand_model },
  ];

  // Δυναμικός υπολογισμός όλων των μαρκών από τη βάση δεδομένων & μετρητής ανά μάρκα
  const dynamicBrandStats = useMemo(() => {
    const map = new Map<string, { name: string; totalCount: number; currentTabCount: number }>();

    for (const v of vehicles) {
      const bName = extractVehicleBrand(v);
      const hasAvailArray = Array.isArray(v.availability) && v.availability.length > 0;
      const matchesTab = hasAvailArray ? v.availability!.includes(activeAvailability) : activeAvailability === 'Ενοικίαση';
      const matchesCategory = activeCategory === 'All' || normalizeText(v.category) === normalizeText(activeCategory);

      const existing = map.get(bName) || { name: bName, totalCount: 0, currentTabCount: 0 };
      existing.totalCount += 1;
      if (matchesTab && matchesCategory) {
        existing.currentTabCount += 1;
      }
      map.set(bName, existing);
    }

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name, 'el'));
  }, [vehicles, activeAvailability, activeCategory]);

  // Οι πιο δημοφιλείς μάρκες της βάσης (έως 10 για το πάνω πλέγμα)
  const popularBrandsList = useMemo(() => {
    return dynamicBrandStats
      .slice()
      .sort((a, b) => b.totalCount - a.totalCount)
      .slice(0, 10);
  }, [dynamicBrandStats]);

  // Φιλτραρισμένες μάρκες με βάση το search input "Τι μάρκα ψάχνεις;"
  const filteredBrandList = useMemo(() => {
    const q = brandSearchQuery.trim().toLowerCase();
    if (!q) return dynamicBrandStats;
    return dynamicBrandStats.filter(b => b.name.toLowerCase().includes(q));
  }, [dynamicBrandStats, brandSearchQuery]);

  // Φιλτράρισμα & Ταξινόμηση Στόλου
  const displayedVehicles = vehicles
    .filter(v => {
      const matchCategory = activeCategory === 'All' || normalizeText(v.category) === normalizeText(activeCategory);
      const hasAvailArray = Array.isArray(v.availability) && v.availability.length > 0;
      const matchAvailability = hasAvailArray ? v.availability!.includes(activeAvailability) : activeAvailability === 'Ενοικίαση';
      const vBrand = extractVehicleBrand(v);
      const matchBrand = selectedBrands.length === 0 || selectedBrands.includes(vBrand);
      return matchCategory && matchAvailability && matchBrand;
    })
    .slice()
    .sort((a, b) => {
      const priceA = getEffectiveDisplayPrice(a);
      const priceB = getEffectiveDisplayPrice(b);
      const nameA = ((a.brand || '') + ' ' + (a.model || '')).trim().toLowerCase();
      const nameB = ((b.brand || '') + ' ' + (b.model || '')).trim().toLowerCase();
      const yearA = extractVehicleYear(a);
      const yearB = extractVehicleYear(b);
      const idNumA = typeof a.id === 'number' ? a.id : parseInt(String(a.id).replace(/\D/g, ''), 10) || 0;
      const idNumB = typeof b.id === 'number' ? b.id : parseInt(String(b.id).replace(/\D/g, ''), 10) || 0;

      switch (sortBy) {
        case 'price_asc':
          return priceA - priceB;
        case 'price_desc':
          return priceB - priceA;
        case 'year_desc':
          return yearB - yearA || priceB - priceA;
        case 'year_asc':
          return yearA - yearB || priceA - priceB;
        case 'brand_model':
          return nameA.localeCompare(nameB, 'el');
        case 'registration':
          return idNumB - idNumA;
        case 'popular': {
          const isPremA = a.category === 'PREMIUM' || a.category === 'SUV / 4X4' ? 1 : 0;
          const isPremB = b.category === 'PREMIUM' || b.category === 'SUV / 4X4' ? 1 : 0;
          return isPremB - isPremA || priceB - priceA;
        }
        case 'last_modified':
        default: {
          if (a.created_at && b.created_at) {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          }
          return idNumB - idNumA;
        }
      }
    });

  const showPaymentSection = activeAvailability === 'Ενοικίαση' ? !!selectedRange.start : true;

  const DateRangePicker = () => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const year = calendarDate.getFullYear(); const month = calendarDate.getMonth(); 
    const daysInMonth = new Date(year, month + 1, 0).getDate(); const firstDayIndex = new Date(year, month, 1).getDay() || 7; 
    const calendarDays = [];
    for (let i = 1; i < firstDayIndex; i++) calendarDays.push(<div key={'empty-' + String(i)} className="h-10"></div>);
    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = String(year) + '-' + String(month + 1).padStart(2, '0') + '-' + String(day).padStart(2, '0');
        const isBooked = existingBookings.some(b => dateStr >= b.check_in && dateStr <= b.check_out);
        let dayClass = "h-10 flex items-center justify-center text-xs font-medium transition-all duration-200 rounded-full ";
        if (new Date(year, month, day) < today || isBooked) dayClass += " text-gray-700 bg-white/[0.02] line-through cursor-not-allowed";
        else if (selectedRange.start === dateStr || selectedRange.end === dateStr) dayClass += " bg-[#8B0000] text-white font-bold";
        else if (selectedRange.start && selectedRange.end && dateStr > selectedRange.start && dateStr < selectedRange.end) dayClass += " bg-[#8B0000]/25 text-white";
        else dayClass += " text-gray-300 hover:bg-white/10 hover:text-white cursor-pointer";

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
        <div className="w-full bg-[#0D0D0D] p-5 rounded-2xl border border-white/10">
          <div className="flex justify-between items-center mb-5">
            <button onClick={() => setCalendarDate(new Date(year, month - 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#8B0000] text-gray-300 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
            <span className="text-xs font-bold uppercase tracking-widest text-white">{t.months[month]} {year}</span>
            <button onClick={() => setCalendarDate(new Date(year, month + 1, 1))} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-[#8B0000] text-gray-300 hover:text-white transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{t.daysShort.map((dayName, idx) => <div key={idx}>{dayName}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">{calendarDays}</div>
        </div>
    );
  };

  const clearSignature = () => {
    if (sigCanvas.current) {
      sigCanvas.current.clear();
      setSignatureSaved(false);
    }
  };

  const saveSignature = async () => {
    if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
      setSignatureSaved(true);
      alert("Η ψηφιακή σας υπογραφή καταχωρήθηκε επιτυχώς! Το συμβόλαιο είναι έτοιμο.");
      setTimeout(() => setShowSignatureModal(false), 1500);
    } else {
      alert("Παρακαλώ υπογράψτε μέσα στο πλαίσιο πριν συνεχίσετε.");
    }
  };

  const introOverlayClass = 'fixed inset-0 z-[100] bg-[#050505] flex flex-col items-center justify-center transition-opacity duration-700 ' + (introVisible ? 'opacity-100' : 'opacity-0 pointer-events-none');
  const detailsModalWrapClass = 'fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-6 transition-all duration-300 ' + (showDetailsBanner ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none');
  const detailsModalCardClass = 'relative bg-[#0B0B0B] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl w-full max-w-2xl transform transition-all duration-300 flex flex-col gap-6 ' + (showDetailsBanner ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4');
  const mobileMenuClass = 'fixed inset-0 z-[200] bg-[#050505] flex flex-col transition-all duration-300 ' + (isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none');

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-[#8B0000]/40 relative">
      <GlobalStyles />
      {introRendered && (
        <div className={introOverlayClass}>
          <AutoLazaridisLogo className="h-20 md:h-28 w-auto animate-intro-title" />
          <p className="absolute bottom-14 text-[10px] font-bold uppercase tracking-[0.35em] text-gray-500 animate-intro-subtitle">{t.introSubtitle}</p>
        </div>
      )}

      {/* --- FLOATING ROUNDED NAVBAR --- */}
      <header className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-[1400px] z-50 bg-[#050505]/80 backdrop-blur-xl border border-white/10 rounded-full px-5 md:px-8 py-3 flex justify-between items-center transition-all duration-300">
        <div className="flex-shrink-0 cursor-pointer" onClick={() => scrollToSection('home')}>
          <AutoLazaridisLogo className="h-7 md:h-9 w-auto opacity-95 hover:opacity-100 transition-opacity" />
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          <button onClick={() => { handleAvailabilityClick('Πώληση'); }} className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors cursor-pointer">
            {t.menuFleet}
          </button>
          <button onClick={() => { handleAvailabilityClick('Ενοικίαση'); }} className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors cursor-pointer">
            {t.btnRentals}
          </button>
          <button onClick={() => scrollToSection('contact')} className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors cursor-pointer">
            {t.menuLocation}
          </button>
          <button onClick={() => setShowDetailsBanner(true)} className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors cursor-pointer">
            {t.menuDetails}
          </button>
          <a href="https://auto-lazaridis.car.gr/cars/" target="_blank" rel="noopener noreferrer" className="text-[11px] font-bold uppercase tracking-widest text-gray-300 hover:text-white transition-colors flex items-center gap-1.5">
            CAR.GR
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </nav>

        <div className="flex items-center gap-4">
          <button onClick={toggleLanguage} className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest bg-white/5 hover:bg-white/10 px-4 py-1.5 rounded-full border border-white/10 transition-colors cursor-pointer">
            <span className={lang === 'en' ? 'text-white' : 'text-gray-500'}>EN</span><span className="text-gray-600">/</span><span className={lang === 'el' ? 'text-white' : 'text-gray-500'}>GR</span>
          </button>
          <button onClick={() => setIsMenuOpen(true)} className="lg:hidden p-2 text-white focus:outline-none transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
        </div>
      </header>

      {/* --- DETAILS MODAL --- */}
      <div className={detailsModalWrapClass}>
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowDetailsBanner(false)}></div>
        
        <div className={detailsModalCardClass}>
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-xs uppercase font-bold tracking-widest text-white">Στοιχεια Επικοινωνιας</span>
            <button 
              onClick={() => setShowDetailsBanner(false)} 
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors text-sm"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Τηλεφωνικο Κεντρο</span>
              </div>
              <div className="space-y-2">
                <a href="tel:+306948766884" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors py-1">
                  <span className="text-base font-bold tracking-wider">6948 766884</span>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">ΚΙΝ</span>
                </a>
                <a href="tel:+302521026912" className="flex items-center justify-between text-white hover:text-gray-300 transition-colors py-1">
                  <span className="text-base font-bold tracking-wider">25210 26912</span>
                  <span className="text-[9px] uppercase tracking-widest text-gray-400 font-bold bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">ΣΤΑΘ</span>
                </a>
              </div>
            </div>

            <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                </div>
                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Ηλεκτρονικο Ταχυδρομειο</span>
              </div>
              <div>
                <a href="mailto:autolazaridisgr@gmail.com" className="text-sm md:text-base font-bold text-white hover:text-gray-300 transition-colors break-all block">
                  autolazaridisgr@gmail.com
                </a>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest mt-2 block font-semibold">{t.address}</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              onClick={() => setShowDetailsBanner(false)} 
              className="w-full sm:w-auto px-8 py-3 bg-white/10 hover:bg-white text-white hover:text-black rounded-full text-[11px] uppercase font-bold tracking-widest transition-all cursor-pointer"
            >
              Κλεισιμο
            </button>
          </div>
        </div>
      </div>

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative w-full min-h-[88vh] flex flex-col justify-center overflow-hidden pt-28 pb-16">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/85 to-[#050505]/30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505]/60"></div>

        <div className="relative z-10 max-w-[1400px] w-full mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-start lg:items-end justify-between gap-10">
          
          <div className="max-w-2xl text-left">
            <div className="mb-3 animate-intro-title">
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400">
                {t.heroKicker}
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-[1.08] tracking-tight text-white mb-5 animate-intro-title">
              {t.heroTitle1} <br />
              {t.heroTitle2}
            </h1>

            <p className="text-sm md:text-base text-gray-300 max-w-lg font-normal leading-relaxed mb-8 animate-intro-subtitle">
              {t.heroSub}
            </p>

            <div className="flex flex-wrap items-center gap-3.5 mb-8 animate-intro-subtitle">
              <button
                onClick={() => handleAvailabilityClick('Πώληση')}
                className="px-8 py-4 bg-[#8B0000] hover:bg-white text-white hover:text-black rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-3 cursor-pointer"
              >
                <span>{t.btnSeeCars}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>

              <button
                onClick={() => handleAvailabilityClick('Ενοικίαση')}
                className="px-8 py-4 bg-white/[0.06] hover:bg-white/15 border border-white/20 text-white rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2.5 cursor-pointer"
              >
                <span>{t.btnRentals}</span>
              </button>
            </div>

            <div className="animate-intro-subtitle pt-1">
              <img 
                src="/lazar.png" 
                alt="Auto Lazaridis Signature" 
                className="w-36 md:w-44 opacity-80 object-contain"
              />
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-col items-start lg:items-end animate-intro-subtitle">
            <div className="w-full sm:w-[400px] bg-[#0C0C0C]/90 backdrop-blur-md p-1.5 rounded-full border border-white/10 grid grid-cols-3 gap-1">
              {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => {
                const isSelected = activeAvailability === type;
                return (
                  <button
                    key={type}
                    onClick={() => handleAvailabilityClick(type)}
                    className={'w-full py-3 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ' + (isSelected ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:text-white')}
                  >
                    {type === 'Ενοικίαση' ? t.rentals : type === 'Leasing' ? t.leasing : t.forSale}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* --- 5ΑΔΑ ΕΓΓΥΗΣΕΩΝ (TRUST BAR) --- */}
      <section className="relative z-20 bg-[#080808] border-y border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            
            <div className="flex items-center gap-3.5 py-3 sm:py-1 px-4 justify-start lg:justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">{t.trust1Title}</div>
                <div className="text-[11px] text-gray-400">{t.trust1Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-3 sm:py-1 px-4 justify-start lg:justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">{t.trust2Title}</div>
                <div className="text-[11px] text-gray-400">{t.trust2Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-3 sm:py-1 px-4 justify-start lg:justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">{t.trust3Title}</div>
                <div className="text-[11px] text-gray-400">{t.trust3Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-3 sm:py-1 px-4 justify-start lg:justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">{t.trust4Title}</div>
                <div className="text-[11px] text-gray-400">{t.trust4Sub}</div>
              </div>
            </div>

            <div className="flex items-center gap-3.5 py-3 sm:py-1 px-4 justify-start lg:justify-center">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-wider text-white">{t.trust5Title}</div>
                <div className="text-[11px] text-gray-400">{t.trust5Sub}</div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- ΚΑΤΑΛΟΓΟΣ ΟΧΗΜΑΤΩΝ --- */}
      {showFleet && (
        <section id="fleet" className="max-w-[1400px] mx-auto px-5 md:px-12 pt-14 pb-20">
          
          <div className="flex flex-col gap-6 mb-10 pb-6 border-b border-white/10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 block mb-2">
                  {t.fleetKicker}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  {activeAvailability === 'Πώληση'
                    ? t.fleetTitleSales
                    : activeAvailability === 'Ενοικίαση'
                    ? t.fleetTitleRentals
                    : t.fleetTitleLeasing}
                  <span className="ml-3 text-sm font-semibold text-gray-500 align-middle">
                    ({displayedVehicles.length})
                  </span>
                </h2>
              </div>

              <div className="flex items-center bg-[#0C0C0C] p-1.5 rounded-full border border-white/10 self-start md:self-auto">
                {['Ενοικίαση', 'Leasing', 'Πώληση'].map(type => {
                  const active = activeAvailability === type;
                  return (
                    <button
                      key={type}
                      onClick={() => setActiveAvailability(type)}
                      className={'px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ' + (active ? 'bg-[#8B0000] text-white' : 'text-gray-400 hover:text-white')}
                    >
                      {type === 'Ενοικίαση' ? t.rentals : type === 'Leasing' ? t.leasing : t.forSale}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Μπάρα Κατηγοριών (Αριστερά) + Φίλτρο Μάρκας & Ταξινόμησης (Δεξιά) */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar">
                {finalUiCategories.map(cat => {
                  const isSelected = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={'flex-shrink-0 text-[11px] font-bold uppercase tracking-wider px-5 py-2.5 rounded-full border transition-all cursor-pointer ' + (isSelected ? 'bg-white text-black border-white' : 'bg-[#0C0C0C] text-gray-400 border-white/10 hover:border-white/25 hover:text-white')}
                    >
                      {cat === 'All' ? t.all : cat}
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto shrink-0 z-30">
                
                {/* --- 1. DROPDOWN ΕΠΙΛΟΓΗΣ & ΑΝΑΖΗΤΗΣΗΣ ΜΑΡΚΑΣ (ΔΥΝΑΜΙΚΟ ΑΠΟ SUPABASE) --- */}
                <div ref={brandDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsBrandDropdownOpen(prev => !prev);
                      setIsSortDropdownOpen(false);
                    }}
                    className={'flex items-center justify-between gap-3 border px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-w-[170px] ' + (selectedBrands.length > 0 ? 'bg-white text-black border-white' : 'bg-[#0C0C0C] hover:bg-[#141414] border-white/15 hover:border-white/30 text-white')}
                  >
                    <span className="truncate max-w-[160px]">
                      {selectedBrands.length === 0
                        ? t.brandLabel
                        : selectedBrands.length === 1
                        ? selectedBrands[0]
                        : `${t.brandLabel} (${selectedBrands.length})`}
                    </span>
                    <svg className={'w-3.5 h-3.5 transition-transform duration-200 ' + (selectedBrands.length > 0 ? 'text-black ' : 'text-gray-400 ') + (isBrandDropdownOpen ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isBrandDropdownOpen && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-[310px] sm:w-[340px] bg-[#0F0F0F] border border-white/15 rounded-3xl shadow-2xl overflow-hidden p-4 z-50">
                      
                      {/* Αναζήτηση: "Τι μάρκα ψάχνεις;" */}
                      <div className="relative mb-4">
                        <svg className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input
                          type="text"
                          value={brandSearchQuery}
                          onChange={(e) => setBrandSearchQuery(e.target.value)}
                          placeholder={t.brandSearchPlaceholder}
                          className="w-full bg-[#181818] border border-white/10 rounded-full pl-10 pr-8 py-2.5 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-white/30 transition-all"
                        />
                        {brandSearchQuery && (
                          <button
                            type="button"
                            onClick={() => setBrandSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="max-h-[340px] overflow-y-auto pr-1 space-y-4">
                        {/* Δημοφιλείς μάρκες (Grid) */}
                        {!brandSearchQuery.trim() && popularBrandsList.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2.5">
                              <span className="text-[11px] font-bold text-gray-300">{t.popularBrands}</span>
                              {selectedBrands.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedBrands([])}
                                  className="text-[10px] font-bold text-gray-400 hover:text-white underline cursor-pointer"
                                >
                                  {t.clearBrands}
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-5 gap-1.5">
                              {popularBrandsList.map((b) => {
                                const isChecked = selectedBrands.includes(b.name);
                                return (
                                  <button
                                    key={b.name}
                                    type="button"
                                    title={b.name}
                                    onClick={() => toggleBrandSelection(b.name)}
                                    className={'h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all cursor-pointer ' + (isChecked ? 'bg-white text-black border-white font-extrabold' : 'bg-[#161616] border-white/10 text-gray-200 hover:border-white/30 hover:bg-white/5')}
                                  >
                                    <span className="text-[9px] font-extrabold tracking-tighter uppercase truncate w-full text-center">
                                      {getBrandMonogram(b.name)}
                                    </span>
                                    <span className={'text-[7px] truncate w-full text-center ' + (isChecked ? 'text-black/70 font-bold' : 'text-gray-500')}>
                                      {b.name}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Όλες οι μάρκες (Αλφαβητική Λίστα με Μετρητή & Checkbox) */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[11px] font-bold text-gray-300">{t.allBrands}</span>
                            {brandSearchQuery.trim() && selectedBrands.length > 0 && (
                              <button
                                type="button"
                                onClick={() => setSelectedBrands([])}
                                className="text-[10px] font-bold text-gray-400 hover:text-white underline cursor-pointer"
                              >
                                {t.clearBrands}
                              </button>
                            )}
                          </div>

                          {filteredBrandList.length === 0 ? (
                            <div className="text-center py-6 text-xs text-gray-500">
                              Δεν βρέθηκε μάρκα &ldquo;{brandSearchQuery}&rdquo;
                            </div>
                          ) : (
                            <div className="divide-y divide-white/5">
                              {filteredBrandList.map((b) => {
                                const isChecked = selectedBrands.includes(b.name);
                                return (
                                  <button
                                    key={b.name}
                                    type="button"
                                    onClick={() => toggleBrandSelection(b.name)}
                                    className="w-full py-2.5 px-2 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
                                  >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                      <span className="w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[8px] font-bold text-gray-300 shrink-0">
                                        {getBrandMonogram(b.name).slice(0, 2)}
                                      </span>
                                      <span className={'text-xs truncate ' + (isChecked ? 'font-bold text-white' : 'font-medium text-gray-200')}>
                                        {b.name}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2.5 shrink-0">
                                      <span className="text-[11px] text-gray-400 font-mono">
                                        {b.currentTabCount}
                                      </span>
                                      <div className={'w-4 h-4 rounded border flex items-center justify-center transition-colors ' + (isChecked ? 'bg-white border-white text-black' : 'border-white/25 bg-transparent')}>
                                        {isChecked && (
                                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                          </svg>
                                        )}
                                      </div>
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* --- 2. DROPDOWN ΤΑΞΙΝΟΜΗΣΗΣ --- */}
                <div ref={sortDropdownRef} className="relative">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSortDropdownOpen(prev => !prev);
                      setIsBrandDropdownOpen(false);
                    }}
                    className="flex items-center justify-between gap-3 bg-[#0C0C0C] hover:bg-[#141414] border border-white/15 hover:border-white/30 text-white px-5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer min-w-[210px]"
                  >
                    <span className="flex items-center gap-2">
                      <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                      </svg>
                      <span>{t.sortOptions[sortBy]}</span>
                    </span>
                    <svg className={'w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ' + (isSortDropdownOpen ? 'rotate-180' : '')} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {isSortDropdownOpen && (
                    <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-60 bg-[#0F0F0F] border border-white/15 rounded-2xl shadow-2xl overflow-hidden py-1.5 z-50">
                      {SORT_MENU_OPTIONS.map((opt) => {
                        const active = sortBy === opt.key;
                        return (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => {
                              setSortBy(opt.key);
                              setIsSortDropdownOpen(false);
                            }}
                            className={'w-full text-left px-4 py-2.5 text-xs font-medium transition-colors flex items-center justify-between cursor-pointer ' + (active ? 'bg-white/10 text-white font-bold' : 'text-gray-300 hover:bg-white/5 hover:text-white')}
                          >
                            <span>{opt.label}</span>
                            {active && (
                              <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* Εμφάνιση ενεργών pills αν ο χρήστης έχει επιλέξει μάρκες */}
            {selectedBrands.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {selectedBrands.map(b => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => toggleBrandSelection(b)}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-xs font-semibold text-white transition-all cursor-pointer"
                  >
                    <span>{b}</span>
                    <span className="text-gray-400 text-[10px]">✕</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedBrands([])}
                  className="text-[11px] font-bold text-gray-400 hover:text-white underline ml-1 cursor-pointer"
                >
                  {t.clearBrands}
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="text-center py-28 text-gray-400 text-xs font-bold uppercase tracking-widest animate-pulse">{t.updating}</div>
          ) : displayedVehicles.length === 0 ? (
            <div className="bg-[#0B0B0B] border border-white/10 rounded-3xl py-20 px-6 text-center max-w-xl mx-auto">
              <div className="text-gray-300 text-xs uppercase tracking-widest font-bold mb-5">Δεν βρέθηκαν οχήματα με αυτά τα κριτήρια.</div>
              <button
                onClick={() => {
                  setActiveCategory('All');
                  setSelectedBrands([]);
                }}
                className="px-7 py-3 bg-[#8B0000] text-white rounded-full text-[11px] font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-all cursor-pointer"
              >
                ΕΠΑΝΑΦΟΡΑ ΦΙΛΤΡΩΝ
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedVehicles.map(v => {
                const displayPrice = getEffectiveDisplayPrice(v);
                let priceLabel = "";
                if (activeAvailability === 'Ενοικίαση') {
                  priceLabel = t.perDay;
                } else if (activeAvailability === 'Leasing') {
                  priceLabel = t.perMonth;
                }
                
                const fullName = v.brand ? (v.brand + ' ' + v.model) : v.model;
                const badgeRight = v.year ? v.year : (typeof v.id === 'number' ? ('#' + String(v.id).padStart(4, '0')) : 'CAR.GR');

                const rawPhoto = v.photos?.[0] || '/brand-logo.png';
                const safePhoto = rawPhoto.includes('53942614_0_n.jpeg')
                  ? 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop'
                  : rawPhoto;

                const gearboxText = v.transmission?.toLowerCase().includes('man')
                  ? t.manual
                  : v.transmission?.toLowerCase().includes('aut')
                  ? t.auto
                  : (v.transmission || '-');

                return (
                  <div
                    key={v.id}
                    className="group flex flex-col bg-[#0B0B0B] border border-white/10 rounded-3xl overflow-hidden hover:border-white/30 transition-all duration-300"
                  >
                    <div className="w-full aspect-[16/10] relative overflow-hidden bg-[#121212]">
                      <img 
                        src={safePhoto} 
                        alt={fullName} 
                        onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/brand-logo.png'; }}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0B] via-transparent to-black/30 opacity-80"></div>
                      
                      <div className="absolute top-3.5 left-3.5">
                        <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider border border-white/15">
                          {v.category}
                        </span>
                      </div>
                      <div className="absolute top-3.5 right-3.5">
                        <span className="text-[10px] text-gray-200 font-mono font-bold tracking-wider bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/15">
                          {badgeRight}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-5 md:p-6 flex flex-col flex-1 justify-between bg-[#0B0B0B]">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-3">
                          <h3 className="text-lg md:text-xl font-extrabold text-white tracking-tight truncate">
                            {fullName}
                          </h3>
                        </div>
                        
                        <div className="grid grid-cols-4 divide-x divide-white/10 bg-[#121212] border border-white/5 rounded-2xl py-2.5 px-1 mb-6 text-center">
                          <div className="px-1">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t.engine}</div>
                            <div className="text-xs font-bold text-white truncate">{v.cc ? `${v.cc} cc` : '-'}</div>
                          </div>
                          <div className="px-1">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t.power}</div>
                            <div className="text-xs font-bold text-white truncate">{v.hp ? `${v.hp} HP` : '-'}</div>
                          </div>
                          <div className="px-1">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t.transmission}</div>
                            <div className="text-xs font-bold text-white truncate">{gearboxText}</div>
                          </div>
                          <div className="px-1">
                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-0.5">{t.fuel}</div>
                            <div className="text-xs font-bold text-white truncate">{v.fuel || '-'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <div>
                          <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-0.5">{t.cost}</div>
                          <div className="text-2xl font-extrabold text-white flex items-baseline gap-1">
                            €{displayPrice.toLocaleString('el-GR')}
                            {priceLabel && <span className="text-xs font-medium text-gray-400">{priceLabel}</span>}
                          </div>
                        </div>
                        
                        {activeAvailability === 'Πώληση' ? (
                          <div className="flex items-center gap-2">
                            {v.cargr_link && (
                              <a
                                href={v.cargr_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2.5 bg-white/5 hover:bg-white/15 border border-white/15 text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                              >
                                CAR.GR
                              </a>
                            )}
                            <a
                              href="tel:+306948766884"
                              className="px-5 py-2.5 bg-white hover:bg-[#8B0000] text-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                              {t.callBtn}
                            </a>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedVehicle(v)}
                            className="px-6 py-2.5 bg-white hover:bg-[#8B0000] text-black hover:text-white rounded-full text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                          >
                            {t.select}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* --- ΕΝΟΤΗΤΑ ΕΝΟΙΚΙΑΣΕΙΣ ΑΥΤΟΚΙΝΗΤΩΝ & ΒΑΝ (ΧΩΡΙΣ ΕΙΚΟΝΕΣ) --- */}
      <section id="rentals-banner" className="relative w-full overflow-hidden border-t border-white/10 py-16 bg-[#080808]">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
          
          <div className="max-w-xl">
            <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-gray-400 block mb-2">
              {t.rentalBannerKicker}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-3">
              {t.rentalBannerTitle}
            </h2>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed mb-6">
              {t.rentalBannerDesc}
            </p>
            <button
              onClick={() => handleAvailabilityClick('Ενοικίαση')}
              className="px-7 py-3.5 bg-white/5 hover:bg-white text-white hover:text-black border border-white/20 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-3 cursor-pointer"
            >
              <span>{t.rentalBannerBtn}</span>
              <span>→</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full lg:w-auto flex-1 max-w-2xl">
            {[
              { title: 'Οικονομικά & Πόλης', sub: 'Compact / Hatchback • Χαμηλή κατανάλωση', badge: 'ΑΠΟ €30 / ΗΜΕΡΑ' },
              { title: 'Οικογενειακά & SUV 4x4', sub: 'Άνεση και ασφάλεια σε κάθε ταξίδι', badge: 'ΑΠΟ €40 / ΗΜΕΡΑ' },
              { title: 'Επαγγελματικά & 9-Θέσια Van', sub: 'Μεταφορές γκρουπ, εκδρομές & επαγγελματίες', badge: 'ΑΠΟ €80 / ΗΜΕΡΑ' },
              { title: 'VIP & Ειδικές Μισθώσεις', sub: 'Πολυτελή οχήματα για γάμους & εκδηλώσεις', badge: 'ΑΜΕΣΗ ΔΙΑΘΕΣΙΜΟΤΗΤΑ' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleAvailabilityClick('Ενοικίαση')}
                className="group cursor-pointer bg-[#0D0D0D] border border-white/10 hover:border-white/30 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200"
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-gray-300 bg-white/5 border border-white/10 px-3 py-1 rounded-full">
                    {item.badge}
                  </span>
                  <span className="text-gray-500 group-hover:text-white transition-colors text-xs">→</span>
                </div>
                <div>
                  <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* --- MOBILE MENU --- */}
      <div className={mobileMenuClass}>
        <div className="px-6 py-4 flex justify-between items-center border-b border-white/10">
          <AutoLazaridisLogo className="h-9 w-auto" />
          <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white transition-colors">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-7">
          <button onClick={() => { setIsMenuOpen(false); handleAvailabilityClick('Πώληση'); }} className="text-xl font-extrabold tracking-widest text-white uppercase">{t.menuFleet}</button>
          <button onClick={() => { setIsMenuOpen(false); handleAvailabilityClick('Ενοικίαση'); }} className="text-xl font-extrabold tracking-widest text-white uppercase">{t.btnRentals}</button>
          <button onClick={() => { setIsMenuOpen(false); scrollToSection('contact'); }} className="text-xl font-extrabold tracking-widest text-white uppercase">{t.menuLocation}</button>
          <button onClick={() => { setShowDetailsBanner(true); setIsMenuOpen(false); }} className="text-xl font-extrabold tracking-widest text-white uppercase">{t.menuDetails}</button>
          <a href="https://auto-lazaridis.car.gr/cars/" target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-xl font-extrabold tracking-widest text-gray-300 uppercase flex items-center gap-2">
            CAR.GR
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
          </a>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <footer id="contact" className="bg-[#050505] border-t border-white/10 pt-16 pb-safe">
        <div className="max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col md:flex-row gap-10 md:gap-16 mb-14">
          <div className="w-full md:w-1/3 flex flex-col justify-between items-start text-left gap-6">
            <div>
              <AutoLazaridisLogo className="h-11 w-auto mb-6" />
              <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
                {t.heroSub}
              </p>
            </div>
            <div className="space-y-4 text-xs w-full pt-4 border-t border-white/10">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">ΕΔΡΑ / ΕΚΘΕΣΗ</div>
                <span className="text-white font-semibold">{t.address}</span>
              </div>
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">ΤΗΛΕΦΩΝΑ ΕΠΙΚΟΙΝΩΝΙΑΣ</div>
                <div className="flex flex-col sm:flex-row gap-3 text-white font-bold">
                  <a href="tel:+306948766884" className="hover:text-gray-300 transition-colors">{t.tel}</a>
                  <span className="hidden sm:inline text-gray-600">•</span>
                  <a href="tel:+302521026912" className="hover:text-gray-300 transition-colors">{t.telLandline}</a>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full md:w-2/3 h-64 md:h-80 rounded-3xl overflow-hidden bg-[#0B0B0B] border border-white/10">
            <iframe 
              src="https://maps.google.com/maps?q=41.1145067,24.2068323&hl=el&z=16&output=embed" 
              width="100%" 
              height="100%" 
              style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade" 
            />
          </div>
        </div>
        <div className="border-t border-white/10 py-6 text-center text-[10px] text-gray-500 font-semibold uppercase tracking-widest">
          © {new Date().getFullYear()} AUTO ΛΑΖΑΡΙΔΗΣ. ALL RIGHTS RESERVED.
        </div>
      </footer>

      {/* --- BOOKING DRAWER MODAL --- */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-[250] flex justify-end transition-opacity">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }}></div>
          <div className="relative w-full md:w-[520px] h-[100dvh] bg-[#080808] md:border-l border-white/10 flex flex-col overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-[#050505] z-20 shrink-0">
              <button onClick={() => { setSelectedVehicle(null); setSelectedRange({start: null, end: null}); }} className="flex items-center gap-2.5 text-white hover:text-gray-300 transition-colors cursor-pointer">
                <div className="w-8 h-8 flex items-center justify-center rounded-full bg-white/5 border border-white/10">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider">{t.back}</span>
              </button>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">{t.bookingTitle}</span>
            </div>

            <div className="flex-1 overflow-y-auto pb-safe px-6 pt-6 space-y-6 hide-scrollbar">
              <div className="w-full aspect-[16/9] rounded-2xl overflow-hidden relative border border-white/10">
                <img src={selectedVehicle.photos?.[0] || '/brand-logo.png'} alt={selectedVehicle.model} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                <div className="absolute bottom-3.5 left-4 right-4 flex justify-between items-end">
                  <h2 className="text-xl font-extrabold text-white">{selectedVehicle.brand ? (selectedVehicle.brand + ' ' + selectedVehicle.model) : selectedVehicle.model}</h2>
                  <span className="text-xs font-mono font-bold text-gray-300 bg-black/70 px-3 py-1 rounded-full border border-white/10">
                    {selectedVehicle.year || 'AUTO LAZARIDIS'}
                  </span>
                </div>
              </div>

              {activeAvailability === 'Ενοικίαση' && <DateRangePicker />}

              <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl">
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-4">{t.personalInfoTitle}</h4>
                <div className="space-y-3">
                  <input type="text" required placeholder={t.namePlaceholder} value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-full px-5 py-3.5 text-xs text-white focus:outline-none focus:border-white/40 transition-all" />
                  <input type="tel" required placeholder={t.phonePlaceholder} value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-full px-5 py-3.5 text-xs text-white focus:outline-none focus:border-white/40 transition-all" />
                  <input type="email" required placeholder={t.emailPlaceholder} value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-[#050505] border border-white/10 rounded-full px-5 py-3.5 text-xs text-white focus:outline-none focus:border-white/40 transition-all" />
                </div>
              </div>

              <div className="bg-[#0D0D0D] border border-white/10 p-5 rounded-2xl">
                <h4 className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">FAST TRACK CHECK-IN</h4>
                <p className="text-[11px] text-gray-400 mb-4">{t.fastTrackSub}</p>
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" ref={idInputRef} onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setIdFile, idInputRef)} />
                <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" className="hidden" ref={licenseInputRef} onChange={(e) => validateAndSetFile(e.target.files?.[0] || null, setLicenseFile, licenseInputRef)} />
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => idInputRef.current?.click()} className={'py-3 px-4 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ' + (idFile ? 'border-white bg-white text-black' : 'border-white/10 bg-[#050505] text-gray-300 hover:border-white/30')}>{idFile ? ('✓ ' + idFile.name.substring(0, 10) + '...') : t.idCard}</button>
                  <button onClick={() => licenseInputRef.current?.click()} className={'py-3 px-4 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ' + (licenseFile ? 'border-white bg-white text-black' : 'border-white/10 bg-[#050505] text-gray-300 hover:border-white/30')}>{licenseFile ? ('✓ ' + licenseFile.name.substring(0, 10) + '...') : t.license}</button>
                </div>
              </div>

              {showPaymentSection && (
                <div className="bg-[#0D0D0D] border border-white/15 rounded-2xl p-5">
                  <h3 className="text-[10px] uppercase tracking-widest text-gray-400 mb-4 font-bold">
                    {activeAvailability === 'Ενοικίαση' ? (t.rentPaymentInfo + ' (' + String(getCalculatedDays()) + ' ' + t.daysSelected + ')') : activeAvailability === 'Leasing' ? t.leasePaymentInfo : t.buyPaymentInfo}
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <div onClick={() => setPaymentMode('full')} className={'p-4 rounded-2xl border cursor-pointer transition-all ' + (paymentMode === 'full' ? 'bg-white/10 border-white' : 'border-white/10 bg-[#050505] hover:border-white/25')}>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t.fullPayment}</div>
                      <div className="text-xl font-extrabold text-white">€{calculateTotal().toLocaleString('el-GR')}</div>
                    </div>
                    <div onClick={() => setPaymentMode('deposit')} className={'p-4 rounded-2xl border cursor-pointer transition-all ' + (paymentMode === 'deposit' ? 'bg-white/10 border-white' : 'border-white/10 bg-[#050505] hover:border-white/25')}>
                      <div className="text-[9px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t.deposit}</div>
                      <div className="text-xl font-extrabold text-white">€{Math.round(calculateTotal() * 0.3).toLocaleString('el-GR')}</div>
                      <div className="text-[9px] text-gray-500 mt-1">{t.remaining} €{(calculateTotal() - Math.round(calculateTotal() * 0.3)).toLocaleString('el-GR')}</div>
                    </div>
                  </div>
                  <button
                    onClick={handleBookingToStripe}
                    disabled={isSubmitting}
                    className={'w-full py-4 rounded-full text-xs font-bold tracking-wider uppercase transition-all cursor-pointer ' + (isSubmitting ? 'bg-white/10 text-gray-500 cursor-not-allowed' : 'bg-[#8B0000] text-white hover:bg-white hover:text-black')}
                  >
                    {isSubmitting ? t.processing : (t.securePayment + ' • €' + (paymentMode === 'full' ? calculateTotal() : Math.round(calculateTotal() * 0.3)).toLocaleString('el-GR'))}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}  

      {/* --- DIGITAL SIGNATURE MODAL --- */}
      {showSignatureModal && (
        <div className="fixed inset-0 z-[300] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-10">
          <div className="w-full max-w-4xl bg-[#0B0B0B] rounded-3xl overflow-hidden border border-white/15 shadow-2xl flex flex-col">
            <div className="bg-[#050505] p-5 border-b border-white/10 flex justify-between items-center">
              <AutoLazaridisLogo className="h-8 w-auto" />
              <div className="text-right">
                <span className="text-[9px] uppercase tracking-widest text-gray-500 block">ΚΩΔΙΚΟΣ ΜΙΣΘΩΤΗΡΙΟΥ</span>
                <span className="text-sm text-white font-mono font-bold">{bookingCode}</span>
              </div>
            </div>
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
              <div className="w-full md:w-1/2 p-6 md:p-8 border-b md:border-b-0 md:border-r border-white/10">
                <h2 className="text-lg font-extrabold text-white mb-4">Ιδιωτικό Συμφωνητικό Ενοικίασης</h2>
                <div className="text-xs text-gray-400 space-y-4 leading-relaxed">
                  <p><strong className="text-white">1. ΑΝΤΙΚΕΙΜΕΝΟ ΜΙΣΘΩΣΗΣ:</strong> Η εταιρεία «Auto Lazaridis» εκμισθώνει στον πελάτη το αναγραφόμενο στην κράτηση όχημα.</p>
                  <p><strong className="text-white">2. ΠΑΡΑΔΟΣΗ ΚΑΙ ΠΑΡΑΛΑΒΗ:</strong> Ο Μισθωτής παρέλαβε το όχημα σε άριστη κατάσταση και υποχρεούται να το επιστρέψει στην ίδια κατάσταση.</p>
                  <p><strong className="text-white">3. ΧΡΗΣΗ ΟΧΗΜΑΤΟΣ:</strong> Το όχημα απαγορεύεται να χρησιμοποιηθεί σε αγώνες ταχύτητας ή από πρόσωπο υπό την επήρεια αλκοόλ.</p>
                </div>
              </div>
              <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-[#050505]">
                <div className="mb-3 flex justify-between items-center">
                  <h3 className="text-xs uppercase tracking-wider text-white font-bold">Ψηφιακη Υπογραφη</h3>
                  <button onClick={clearSignature} className="text-[10px] text-gray-400 hover:text-white uppercase font-bold">Καθαρισμος</button>
                </div>
                <div className="flex-1 w-full bg-[#111] rounded-2xl border border-white/15 overflow-hidden relative cursor-crosshair min-h-[220px]">
                  <SignatureCanvas ref={sigCanvas} penColor="#ffffff" canvasProps={{ className: "w-full h-full absolute inset-0" }} backgroundColor="transparent" />
                </div>
                <button onClick={saveSignature} className="mt-5 w-full py-4 bg-[#8B0000] hover:bg-white text-white hover:text-black rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer">
                  ΥΠΟΓΡΑΦΗ & ΟΛΟΚΛΗΡΩΣΗ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}