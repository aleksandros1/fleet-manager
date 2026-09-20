import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const rawKey = process.env.STRIPE_SECRET_KEY || "";
    const stripeKey = rawKey.trim();
    
    if (!stripeKey) {
      throw new Error("Λείπει το STRIPE_SECRET_KEY.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2024-06-20' as any, 
    });

    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;

    // ΠΙΟ ΑΣΦΑΛΗΣ ΜΕΘΟΔΟΣ ΕΥΡΕΣΗΣ URL ΓΙΑ STRIPE:
    let originUrl = 'https://autolazaridis.gr'; // Το default αν όλα τα άλλα αποτύχουν
    
    try {
        const reqUrl = new URL(req.url);
        // Αν το request έρχεται από localhost, κράτα το localhost, αλλιώς βάλε το domain σου
        if (reqUrl.hostname === 'localhost' || reqUrl.hostname === '127.0.0.1') {
             originUrl = `${reqUrl.protocol}//${reqUrl.host}`;
        }
    } catch (e) {
        console.log("URL Parse error, using default origin");
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: model || 'Ενοικίαση Οχήματος',
              description: checkIn && checkOut ? `Ημερομηνίες: ${checkIn} έως ${checkOut}` : 'Μη διαθέσιμες ημερομηνίες',
            },
            unit_amount: Math.round(price * 100), 
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
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}