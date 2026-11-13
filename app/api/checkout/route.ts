import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export const runtime = 'edge';

const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Επαληθευμένες τιμές ασφαλείας για τα ενσωματωμένα οχήματα του Car.gr
const VERIFIED_FALLBACK_PRICES: Record<string, number> = {
  'cargr-53822894': 35,
  'cargr-43716665': 35,
  'cargr-43716683': 35,
  'cargr-53823038': 35,
  'cargr-46202214': 30,
  'cargr-53897059': 40,
  'cargr-53942614': 65,
  'cargr-49428783': 100,
  'cargr-49428804': 100,
  'cargr-49428761': 80,
  'cargr-44965625': 300,
  'cargr-56648613': 47000,
  'cargr-57315982': 34000,
  'cargr-54414075': 26000,
  'cargr-56165640': 24000,
  'cargr-54445159': 19500,
  'cargr-56225272': 16500,
  'cargr-56165620': 14900,
  'cargr-57362326': 14500,
  'cargr-50238205': 13000,
  'cargr-54421509': 12000,
  'cargr-55492723': 11000,
  'cargr-52724523': 10500,
  'cargr-56062491': 10000,
  'cargr-50802055': 10000,
  'cargr-55979391': 9200,
  'cargr-52724383': 9000,
  'cargr-55703840': 8500,
  'cargr-52240849': 8000,
};

function sanitizeDbPrice(raw: number, title: string): number {
  const upper = (title || '').toUpperCase();
  const isLuxury = /PORSCHE|MERCEDES|AMG|BMW|AUDI|HUMMER|MACAN|CAYENNE|L200|LAND ROVER|RANGE ROVER/.test(upper);
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

export async function POST(req: Request) {
  try {
    const rawKey = process.env.STRIPE_SECRET_KEY || '';
    const stripeKey = rawKey.trim();

    if (!stripeKey) {
      throw new Error('Λείπει το STRIPE_SECRET_KEY.');
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20' as any,
    });

    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut } = body;

    const modelText = String(model || 'Ενοικίαση Οχήματος');
    const isDeposit = modelText.includes('Deposit 30%');
    const isLeasing = modelText.includes('[Leasing]');
    const isSale = modelText.includes('[Αγορά]');
    const isRental = !isLeasing && !isSale;

    // 1. Υπολογισμός ημερών αποκλειστικά στον Server (ώστε να μην μπορεί κάποιος να στείλει αρνητικές ή 0 ημέρες)
    let serverDays = 1;
    if (isRental && checkIn && checkOut) {
      const startMs = new Date(checkIn).getTime();
      const endMs = new Date(checkOut).getTime();
      if (!isNaN(startMs) && !isNaN(endMs) && endMs > startMs) {
        const diff = Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24));
        serverDays = Math.min(Math.max(diff, 1), 365);
      }
    }

    // 2. Ανάκτηση της πραγματικής τιμής του οχήματος από τη Supabase (Server-Side Verification)
    let verifiedUnitPrice: number | null = null;

    if (typeof vehicleId === 'number' || /^\d+$/.test(String(vehicleId))) {
      const { data: dbVehicle } = await supabase
        .from('vehicles')
        .select('price, brand, model')
        .eq('id', Number(vehicleId))
        .single();

      if (dbVehicle && Number(dbVehicle.price) > 0) {
        verifiedUnitPrice = sanitizeDbPrice(
          Number(dbVehicle.price),
          `${dbVehicle.brand || ''} ${dbVehicle.model || ''}`
        );
      }
    } else if (typeof vehicleId === 'string' && VERIFIED_FALLBACK_PRICES[vehicleId]) {
      verifiedUnitPrice = VERIFIED_FALLBACK_PRICES[vehicleId];
    }

    // 3. Υπολογισμός τελικού ποσού χρέωσης στον Server
    let finalAmountEur = Number(price) || 0;

    if (verifiedUnitPrice !== null && verifiedUnitPrice > 0) {
      let baseTotal = verifiedUnitPrice;
      if (isRental) {
        baseTotal = verifiedUnitPrice * serverDays;
      } else if (isLeasing) {
        baseTotal = verifiedUnitPrice > 2500 ? Math.max(180, Math.round((verifiedUnitPrice * 0.85) / 48)) : verifiedUnitPrice;
      }
      finalAmountEur = isDeposit ? Math.round(baseTotal * 0.3) : baseTotal;
    }

    // 4. Αυστηρή δικλείδα ασφαλείας: Απαγορεύεται οποιαδήποτε πληρωμή κάτω από 9€
    if (!finalAmountEur || isNaN(finalAmountEur) || finalAmountEur < 9) {
      return NextResponse.json(
        { error: 'Μη έγκυρο ποσό πληρωμής. Η συναλλαγή απορρίφθηκε για λόγους ασφαλείας.' },
        { status: 400 }
      );
    }

    // 5. Ασφαλής εύρεση Origin URL (Whitelist μόνο το autolazaridis.gr, το vercel.app σου και το localhost)
    let originUrl = 'https://autolazaridis.gr';
    try {
      const reqUrl = new URL(req.url);
      if (
        reqUrl.hostname === 'localhost' ||
        reqUrl.hostname === '127.0.0.1' ||
        reqUrl.hostname.endsWith('.vercel.app') ||
        reqUrl.hostname.includes('autolazaridis')
      ) {
        originUrl = `${reqUrl.protocol}//${reqUrl.host}`;
      }
    } catch {
      // Χρήση default originUrl
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: modelText.slice(0, 120),
              description:
                checkIn && checkOut
                  ? `Ημερομηνίες: ${checkIn} έως ${checkOut}`
                  : 'Κράτηση Οχήματος - Auto Lazaridis',
            },
            unit_amount: Math.round(finalAmountEur * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${originUrl}/?payment=success`,
      cancel_url: `${originUrl}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Stripe Error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}