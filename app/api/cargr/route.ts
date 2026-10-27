import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

// Revalidate cache ανά 24 ώρες (86.400 δευτερόλεπτα)
export const revalidate = 86400;

export interface CarGrVehicle {
  id: string;
  name: string;
  category: 'COMPACT / HATCHBACK' | 'PREMIUM' | 'SEDAN' | 'SUV / 4X4';
  type: 'sale' | 'leasing' | 'rent';
  availability: string[];
  year: string;
  cc: string;
  hp: string;
  transmission: string;
  fuel: string;
  price: number;
  price_per_day?: number;
  price_per_month?: number;
  image: string;
  link: string;
  verified: boolean;
}

const VERIFIED_CARGR_FLEET: CarGrVehicle[] = [
  // --- ΕΝΟΙΚΙΑΖΟΜΕΝΑ ---
  {
    id: 'cargr-53822894',
    name: 'Citroen C3',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2018',
    cc: '1400',
    hp: '105',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 35,
    price_per_day: 35,
    image: 'https://static.car.gr/52724383_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/53822894/',
    verified: true
  },
  {
    id: 'cargr-43716665',
    name: 'Ford Fiesta',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '1500',
    hp: '90',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 35,
    price_per_day: 35,
    image: 'https://static.car.gr/55703840_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/43716665/',
    verified: true
  },
  {
    id: 'cargr-43716683',
    name: 'Renault Clio',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '1500',
    hp: '90',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 35,
    price_per_day: 35,
    image: 'https://static.car.gr/54185664_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/43716683/',
    verified: true
  },
  {
    id: 'cargr-53823038',
    name: 'Opel Corsa',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2016',
    cc: '1300',
    hp: '95',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 35,
    price_per_day: 35,
    image: 'https://static.car.gr/338939864_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/53823038/',
    verified: true
  },
  {
    id: 'cargr-46202214',
    name: 'Volkswagen Polo 1.4 TDI',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '1400',
    hp: '90',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 30,
    price_per_day: 30,
    image: 'https://static.car.gr/56411096_2_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/46202214/',
    verified: true
  },
  {
    id: 'cargr-53897059',
    name: 'Fiat 500L Multijet',
    category: 'COMPACT / HATCHBACK',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2016',
    cc: '1300',
    hp: '95',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 40,
    price_per_day: 40,
    image: 'https://static.car.gr/49428138_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/53897059/',
    verified: true
  },
  {
    id: 'cargr-53942614',
    name: 'BMW X3',
    category: 'SUV / 4X4',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2015',
    cc: '2000',
    hp: '184',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 65,
    price_per_day: 65,
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?q=80&w=1000&auto=format&fit=crop',
    link: 'https://auto-lazaridis.car.gr/rentals/view/53942614/',
    verified: true
  },
  {
    id: 'cargr-49428783',
    name: 'Citroen Jumper 9-Θέσιο Van',
    category: 'SUV / 4X4',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '2000',
    hp: '130',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 100,
    price_per_day: 100,
    image: 'https://static.car.gr/49428783_0_n.jpeg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/49428783/',
    verified: true
  },
  {
    id: 'cargr-49428804',
    name: 'Fiat Ducato 9-Θέσιο Van',
    category: 'SUV / 4X4',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '2000',
    hp: '130',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 100,
    price_per_day: 100,
    image: 'https://static.car.gr/49428804_0_n.jpeg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/49428804/',
    verified: true
  },
  {
    id: 'cargr-49428761',
    name: 'Renault Trafic 9-Θέσιο Van',
    category: 'SUV / 4X4',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2017',
    cc: '1600',
    hp: '125',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 80,
    price_per_day: 80,
    image: 'https://static.car.gr/49428761_0_n.jpeg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/49428761/',
    verified: true
  },
  {
    id: 'cargr-44965625',
    name: 'Hummer H2 VIP',
    category: 'PREMIUM',
    type: 'rent',
    availability: ['Ενοικίαση'],
    year: '2008',
    cc: '6000',
    hp: '325',
    transmission: 'Αυτόματο',
    fuel: 'Βενζίνη',
    price: 300,
    price_per_day: 300,
    image: 'https://static.car.gr/44965625_0_n.jpeg',
    link: 'https://auto-lazaridis.car.gr/rentals/view/44965625/',
    verified: true
  },

  // --- ΠΩΛΗΣΕΙΣ & LEASING ---
  {
    id: 'cargr-56648613',
    name: 'Porsche Macan',
    category: 'PREMIUM',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2017',
    cc: '3000',
    hp: '258',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 47000,
    price_per_month: 790,
    image: 'https://static.car.gr/56648613_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/56648613/',
    verified: true
  },
  {
    id: 'cargr-57315982',
    name: 'Mercedes-Benz CLA 45 AMG',
    category: 'PREMIUM',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '2000',
    hp: '380',
    transmission: 'Αυτόματο',
    fuel: 'Βενζίνη',
    price: 34000,
    price_per_month: 590,
    image: 'https://static.car.gr/57315982_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/57315982/',
    verified: true
  },
  {
    id: 'cargr-54414075',
    name: 'Mercedes-Benz C 300',
    category: 'SEDAN',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2020',
    cc: '2000',
    hp: '320',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 26000,
    price_per_month: 460,
    image: 'https://static.car.gr/54414075_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/54414075/',
    verified: true
  },
  {
    id: 'cargr-56165640',
    name: 'Mitsubishi L200 4x4',
    category: 'SUV / 4X4',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2018',
    cc: '2400',
    hp: '180',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 24000,
    price_per_month: 420,
    image: 'https://static.car.gr/56165640_3_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/56165640/',
    verified: true
  },
  {
    id: 'cargr-54445159',
    name: 'Volkswagen Golf GTD',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '2000',
    hp: '185',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 19500,
    price_per_month: 345,
    image: 'https://static.car.gr/54445159_2_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/54445159/',
    verified: true
  },
  {
    id: 'cargr-56225272',
    name: 'Volkswagen Golf',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2015',
    cc: '2000',
    hp: '185',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 16500,
    price_per_month: 295,
    image: 'https://static.car.gr/56225272_1q_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/56225272/',
    verified: true
  },
  {
    id: 'cargr-56165620',
    name: 'Kia Ceed GT-Line',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2019',
    cc: '1600',
    hp: '135',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 14900,
    price_per_month: 265,
    image: 'https://static.car.gr/56165620_p_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/56165620/',
    verified: true
  },
  {
    id: 'cargr-57362326',
    name: 'Renault Kadjar',
    category: 'SUV / 4X4',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '1500',
    hp: '110',
    transmission: 'Αυτόματο',
    fuel: 'Diesel',
    price: 14500,
    price_per_month: 260,
    image: 'https://static.car.gr/57362326_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/57362326/',
    verified: true
  },
  {
    id: 'cargr-50238205',
    name: 'BMW 216 Gran Coupé',
    category: 'SEDAN',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '1500',
    hp: '116',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 13000,
    price_per_month: 240,
    image: 'https://static.car.gr/50238205_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/50238205/',
    verified: true
  },
  {
    id: 'cargr-54421509',
    name: 'Dacia Duster 4x4',
    category: 'SUV / 4X4',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2017',
    cc: '1500',
    hp: '110',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 12000,
    price_per_month: 220,
    image: 'https://static.car.gr/54421509_2_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/54421509/',
    verified: true
  },
  {
    id: 'cargr-55492723',
    name: 'Renault Captur',
    category: 'SUV / 4X4',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '1500',
    hp: '110',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 11000,
    price_per_month: 205,
    image: 'https://static.car.gr/55492723_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/55492723/',
    verified: true
  },
  {
    id: 'cargr-52724523',
    name: 'Dacia Duster',
    category: 'SUV / 4X4',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2018',
    cc: '1500',
    hp: '110',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 10500,
    price_per_month: 195,
    image: 'https://static.car.gr/52724523_1_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/52724523/',
    verified: true
  },
  {
    id: 'cargr-56062491',
    name: 'Hyundai i10',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2021',
    cc: '1000',
    hp: '67',
    transmission: 'Αυτόματο',
    fuel: 'Βενζίνη',
    price: 10000,
    price_per_month: 190,
    image: 'https://static.car.gr/56062491_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/56062491/',
    verified: true
  },
  {
    id: 'cargr-50802055',
    name: 'Peugeot 308',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '1200',
    hp: '130',
    transmission: 'Χειροκίνητο',
    fuel: 'Βενζίνη',
    price: 10000,
    price_per_month: 190,
    image: 'https://static.car.gr/50802055_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/50802055/',
    verified: true
  },
  {
    id: 'cargr-55979391',
    name: 'Hyundai i20',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2016',
    cc: '1250',
    hp: '84',
    transmission: 'Χειροκίνητο',
    fuel: 'Βενζίνη',
    price: 9200,
    price_per_month: 185,
    image: 'https://static.car.gr/55979391_1_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/55979391/',
    verified: true
  },
  {
    id: 'cargr-52724383',
    name: 'Citroen C3',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση', 'Leasing'],
    year: '2018',
    cc: '1560',
    hp: '75',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 9000,
    price_per_month: 180,
    image: 'https://static.car.gr/52724383_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/52724383/',
    verified: true
  },
  {
    id: 'cargr-55703840',
    name: 'Ford Fiesta',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση'],
    year: '2017',
    cc: '1500',
    hp: '90',
    transmission: 'Χειροκίνητο',
    fuel: 'Diesel',
    price: 8500,
    image: 'https://static.car.gr/55703840_0_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/55703840/',
    verified: true
  },
  {
    id: 'cargr-52240849',
    name: 'Dacia Sandero',
    category: 'COMPACT / HATCHBACK',
    type: 'sale',
    availability: ['Πώληση'],
    year: '2018',
    cc: '1000',
    hp: '75',
    transmission: 'Χειροκίνητο',
    fuel: 'Βενζίνη',
    price: 8000,
    image: 'https://static.car.gr/52240849_1_n.jpg',
    link: 'https://auto-lazaridis.car.gr/cars/view/52240849/',
    verified: true
  }
];

function detectCategory(title: string, price: number): CarGrVehicle['category'] {
  const t = title.toUpperCase();
  if (
    t.includes('SUV') ||
    t.includes('4X4') ||
    t.includes('DUSTER') ||
    t.includes('L200') ||
    t.includes('MACAN') ||
    t.includes('CAYENNE') ||
    t.includes('Q3') ||
    t.includes('Q5') ||
    t.includes('QASHQAI') ||
    t.includes('CACTUS') ||
    t.includes('KADJAR') ||
    t.includes('TUCSON') ||
    t.includes('SPORTAGE') ||
    t.includes('TIGUAN') ||
    t.includes('GLA') ||
    t.includes('GLC') ||
    t.includes('X1') ||
    t.includes('X3') ||
    t.includes('X5') ||
    t.includes('VITARA') ||
    t.includes('PUMA') ||
    t.includes('CAPTUR') ||
    t.includes('2008') ||
    t.includes('3008') ||
    t.includes('500X') ||
    t.includes('KONA') ||
    t.includes('MOKKA') ||
    t.includes('CROSS') ||
    t.includes('JEEP')
  ) {
    return 'SUV / 4X4';
  }
  if (price >= 22000 || t.includes('MERCEDES') || t.includes('BMW') || t.includes('AUDI') || t.includes('AMG') || t.includes('PORSCHE') || t.includes('HUMMER')) {
    return 'PREMIUM';
  }
  if (t.includes('SEDAN') || t.includes('C 300') || t.includes('C 200') || t.includes('C 180') || t.includes('A4') || t.includes('OCTAVIA') || t.includes('PASSAT')) {
    return 'SEDAN';
  }
  return 'COMPACT / HATCHBACK';
}

// --- ΤΡΙΠΛΟΣ ΕΛΕΓΧΟΣ ΦΩΤΟΓΡΑΦΙΑΣ (PHOTO GUARD) ---
function verifyCarGrImageUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  let url = rawUrl.trim();
  if (url.startsWith('//')) url = 'https:' + url;
  if (url.startsWith('/')) url = 'https://auto-lazaridis.car.gr' + url;

  const lower = url.toLowerCase();
  // 1. Απορρίπτουμε data URIs, κενά εικονίδια, SVG placeholders και τα generic "popular-models" του Car.gr
  if (
    lower.startsWith('data:') ||
    lower.includes('popular-models') ||
    lower.includes('placeholder') ||
    lower.includes('no-image') ||
    lower.includes('no_image') ||
    lower.includes('default') ||
    lower.includes('avatar') ||
    lower.includes('logo') ||
    lower.endsWith('.svg') ||
    lower.endsWith('.gif')
  ) {
    return null;
  }

  // 2. Επιτρέπουμε μόνο πραγματικές φωτογραφίες από το static.car.gr ή έγκυρα https image links
  const isValidDomain = lower.includes('static.car.gr') || lower.includes('static-cz.car.gr') || lower.includes('unsplash.com');
  const hasValidExt = /\.(jpg|jpeg|png|webp)(\?.*)?$/i.test(lower);

  if (!isValidDomain || !hasValidExt) {
    return null;
  }

  return url;
}

// --- ΤΡΙΠΛΟΣ ΕΛΕΓΧΟΣ ΤΙΜΗΣ (PRICE GUARD) ---
function tripleCheckPrice(
  fullCardText: string,
  title: string,
  mode: 'sale' | 'rent',
  existingVerifiedPrice?: number
): number | null {
  // Έλεγχος 1: Καθαρισμός από χρονολογίες (1990-2029), χιλιόμετρα, κυβικά και ίππους ΠΡΙΝ την εξαγωγή τιμής
  const sanitizedText = fullCardText
    .replace(/\b(199\d|20[0-2]\d)\b/g, ' ')
    .replace(/\d[\d\.\,]*\s*(χλμ|km|cc|κ\.εκ|bhp|hp|ίπποι|ps)\b/gi, ' ');

  if (mode === 'rent') {
    const rentMatch = sanitizedText.match(/\b(\d{2,3})\s*€/);
    if (!rentMatch) return existingVerifiedPrice || null;
    const val = parseInt(rentMatch[1], 10);
    // Έλεγχος 2: Λογικά όρια ημερήσιας ενοικίασης (15€ έως 450€/ημέρα)
    if (val >= 15 && val <= 450) return val;
    return existingVerifiedPrice || null;
  }

  // Έλεγχος 2 για Πωλήσεις: Απαιτούμε αυστηρά τελεία χιλιάδων (π.χ. 8.500 € ή 26.000 €) ώστε να μην πιάσει τυχαίο νούμερο
  const saleMatches = Array.from(sanitizedText.matchAll(/\b(\d{1,2}\.\d{3})\s*€/g));
  if (saleMatches.length === 0) {
    return existingVerifiedPrice || null;
  }

  // Παίρνουμε την τελευταία έγκυρη τιμή με € στην κάρτα (στο Car.gr η τιμή βρίσκεται μετά τον τίτλο)
  const rawPriceStr = saleMatches[saleMatches.length - 1][1];
  let parsedPrice = parseInt(rawPriceStr.replace(/\./g, ''), 10);

  const upperTitle = title.toUpperCase();
  const isLuxury = /PORSCHE|MERCEDES|AMG|BMW|AUDI|HUMMER|MACAN|CAYENNE|L200|LAND ROVER|RANGE ROVER/.test(upperTitle);

  // Έλεγχος 3: Αν παρόλα αυτά κόλλησε μπροστά ψηφίο σε μη-luxury αμάξι (π.χ. 95.500€ αντί 9.500€), το κόβουμε
  if (!isLuxury && parsedPrice > 35000) {
    const stripped = parseInt(String(parsedPrice).slice(1), 10);
    if (stripped >= 3000 && stripped <= 32000) {
      parsedPrice = stripped;
    } else {
      return existingVerifiedPrice || null;
    }
  }

  // Τελικό όριο ασφαλείας πώλησης (1.500€ έως 95.000€)
  if (parsedPrice < 1500 || parsedPrice > 95000) {
    return existingVerifiedPrice || null;
  }

  return parsedPrice;
}

async function fetchHtml(url: string, forceFresh: boolean): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'el-GR,el;q=0.9,en-US;q=0.8,en;q=0.7',
      },
      ...(forceFresh ? { cache: 'no-store' as const } : { next: { revalidate: 86400 } }),
    });
    if (!response.ok) return '';
    const buffer = await response.arrayBuffer();
    return new TextDecoder('utf-8').decode(buffer);
  } catch {
    return '';
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const forceFresh = searchParams.get('fresh') === '1';

    const vehicleMap = new Map<string, CarGrVehicle>();

    // 1. Φορτώνουμε την επαληθευμένη βάση
    for (const item of VERIFIED_CARGR_FLEET) {
      vehicleMap.set(item.id, { ...item });
    }

    // 2. Τραβάμε τις σελίδες του Car.gr
    const [rentalHtml1, rentalHtml2, saleHtml1, saleHtml2, saleHtml3] = await Promise.all([
      fetchHtml('https://auto-lazaridis.car.gr/rentals/', forceFresh),
      fetchHtml('https://auto-lazaridis.car.gr/rentals/?pg=2', forceFresh),
      fetchHtml('https://auto-lazaridis.car.gr/cars/?pg=1', forceFresh),
      fetchHtml('https://auto-lazaridis.car.gr/cars/?pg=2', forceFresh),
      fetchHtml('https://auto-lazaridis.car.gr/cars/?pg=3', forceFresh),
    ]);

    let liveParsedCount = 0;

    const parseLiveHtml = (html: string, mode: 'sale' | 'rent') => {
      if (!html) return;
      const dom = cheerio.load(html);

      dom('a, div, li, article').each((_, element) => {
        const el = dom(element);

        // ΕΛΕΓΧΟΣ 1: Αυστηρή απομόνωση κάρτας (δεν επιτρέπουμε container που έχει πάνω από 1 αγγελία μέσα του)
        const viewLinks = el.find('a[href*="/view/"]');
        const selfHref = el.is('a') ? el.attr('href') || '' : '';
        const uniqueViewIds = new Set<string>();

        if (selfHref.includes('/view/')) {
          const m = selfHref.match(/\/view\/(\d+)/);
          if (m) uniqueViewIds.add(m[1]);
        }
        viewLinks.each((__, aEl) => {
          const h = dom(aEl).attr('href') || '';
          const m = h.match(/\/view\/(\d+)/);
          if (m) uniqueViewIds.add(m[1]);
        });

        // Αν το στοιχείο περιέχει 0 ή πάνω από 1 διαφορετικά IDs αγγελιών, το απορρίπτουμε αμέσως!
        if (uniqueViewIds.size !== 1) return;

        const viewId = Array.from(uniqueViewIds)[0];
        const uniqueKey = 'cargr-' + viewId;

        const imgEl = el.find('img').first();
        if (!imgEl.length) return;

        let link = selfHref.includes('/view/')
          ? selfHref
          : viewLinks.first().attr('href') || '';
        if (!link.startsWith('http')) {
          const prefix = link.startsWith('/') ? '' : '/';
          link = 'https://auto-lazaridis.car.gr' + prefix + link;
        }

        const text = el.text().replace(/\s+/g, ' ').trim();
        const headingEl = el.find('h1, h2, h3, h4, [class*="title"], [class*="name"], strong').first();
        const rawTitle = headingEl.text().trim() || imgEl.attr('alt')?.trim() || '';
        if (!rawTitle || rawTitle.length < 3) return;

        const existingSeed = vehicleMap.get(uniqueKey);

        // ΕΛΕΓΧΟΣ 2: Τριπλός έλεγχος τιμής
        const verifiedPrice = tripleCheckPrice(text, rawTitle, mode, existingSeed?.price);
        if (!verifiedPrice) return;

        // ΕΛΕΓΧΟΣ 3: Τριπλός έλεγχος φωτογραφίας
        const rawImg = imgEl.attr('src') || imgEl.attr('data-src') || imgEl.attr('srcset')?.split(' ')[0] || '';
        const verifiedImage = verifyCarGrImageUrl(rawImg) || existingSeed?.image || null;

        // Αν πρόκειται για νέα αγγελία που δεν έχει έγκυρη φωτογραφία, δεν την περνάμε
        if (!verifiedImage) return;

        const yearMatch = rawTitle.match(/\b(199\d|20[0-2]\d)\b/) || text.match(/\b(199\d|20[0-2]\d)\b/);
        const year = yearMatch ? yearMatch[1] : (existingSeed?.year || '2019');

        const cleanName = rawTitle
          .replace(/\b(199\d|20[0-2]\d)\b/g, '')
          .replace(/€.*/, '')
          .replace(/-\s*AUTO\s*ΛΑΖΑΡΙΔΗΣ/gi, '')
          .replace(/AUTO\s*ΛΑΖΑΡΙΔΗΣ/gi, '')
          .replace(/COMING\s*SOON/gi, '')
          .replace(/\s+/g, ' ')
          .trim();

        if (!cleanName || cleanName.length < 2) return;

        const ccMatch = text.match(/(\d\.\d{3}|\d{3,4})\s*cc/i);
        const cleanCc = ccMatch ? ccMatch[1].replace(/\./g, '') : (existingSeed?.cc || '1500');

        const hpMatch = text.match(/(\d{2,3})\s*(bhp|hp|ίπποι|ps)/i);
        const cleanHp = hpMatch ? String(hpMatch[1]) : (existingSeed?.hp || '110');

        const isAutomatic = /αυτ[οό]ματο|automatic|auto|dct|dsg|tronic/i.test(text);
        let fuel = existingSeed?.fuel || 'Diesel';
        if (/βενζ[ιί]νη|petrol|tsi|tfsi/i.test(text)) fuel = 'Βενζίνη';
        else if (/πετρ[εέ]λαιο|diesel|tdi|cdi|dci|hdi|multijet/i.test(text)) fuel = 'Diesel';
        else if (/υβριδικ[οό]|hybrid|plug-in/i.test(text)) fuel = 'Hybrid';

        const isRent = mode === 'rent';
        const availList: string[] = isRent ? ['Ενοικίαση'] : ['Πώληση'];
        if (!isRent && parseInt(year, 10) >= 2016 && verifiedPrice >= 9000) {
          availList.push('Leasing');
        }

        const monthlyLease = Math.max(180, Math.round((verifiedPrice * 0.85) / 48));

        vehicleMap.set(uniqueKey, {
          id: uniqueKey,
          name: existingSeed?.name || cleanName,
          category: detectCategory(cleanName, verifiedPrice),
          type: isRent ? 'rent' : 'sale',
          availability: availList,
          year,
          cc: cleanCc === '000' ? '1000' : cleanCc,
          hp: cleanHp,
          transmission: isAutomatic ? 'Αυτόματο' : (existingSeed?.transmission || 'Χειροκίνητο'),
          fuel,
          price: verifiedPrice,
          price_per_day: isRent ? verifiedPrice : undefined,
          price_per_month: availList.includes('Leasing') ? monthlyLease : undefined,
          image: verifiedImage,
          link,
          verified: true,
        });

        liveParsedCount++;
      });
    };

    parseLiveHtml(rentalHtml1, 'rent');
    parseLiveHtml(rentalHtml2, 'rent');
    parseLiveHtml(saleHtml1, 'sale');
    parseLiveHtml(saleHtml2, 'sale');
    parseLiveHtml(saleHtml3, 'sale');

    const vehicles = Array.from(vehicleMap.values());

    return new NextResponse(
      JSON.stringify({
        success: true,
        syncIntervalHours: 24,
        liveFetched: liveParsedCount > 0,
        count: vehicles.length,
        vehicles,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  } catch {
    return new NextResponse(
      JSON.stringify({
        success: true,
        syncIntervalHours: 24,
        liveFetched: false,
        count: VERIFIED_CARGR_FLEET.length,
        vehicles: VERIFIED_CARGR_FLEET,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      }
    );
  }
}