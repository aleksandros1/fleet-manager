import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // 1. ΜΕΤΑΦΟΡΑ: Αρχικοποιούμε το Stripe ΜΕΣΑ στη συνάρτηση.
    // Στο Cloudflare, πρέπει να το καλούμε τη στιγμή που τρέχει το request, 
    // αλλιώς το process.env.STRIPE_SECRET_KEY βγαίνει κενό και χτυπάει σφάλμα "pattern mismatch".
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    
    if (!stripeKey) {
      throw new Error("Λείπει το STRIPE_SECRET_KEY. Πρέπει να το προσθέσετε στα Settings του Cloudflare.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia' as any, // Χρήση πρόσφατης έκδοσης
    });

    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;

    // 2. ΔΙΟΡΘΩΣΗ URL: Αν δεν βρει το origin, πάει απευθείας στο live domain σας, όχι στο localhost!
    const origin = req.headers.get('origin') || 'https://autolazaridis.gr';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: model,
              description: checkIn && checkOut ? `Ημερομηνίες: ${checkIn} έως ${checkOut}` : 'Μη διαθέσιμες ημερομηνίες',
            },
            // Το Stripe παίρνει τα ποσά σε λεπτά (cents), άρα 1€ = 100 λεπτά
            unit_amount: Math.round(price * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Στέλνουμε πίσω τις σωστές διευθύνσεις
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}