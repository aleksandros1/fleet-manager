import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
 apiVersion: '2026-06-24.dahlia',// Χρήση πρόσφατης έκδοσης
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;

    // Εδώ βρίσκουμε αυτόματα το URL του site (είτε είναι localhost είτε το live domain)
    const origin = req.headers.get('origin') || 'http://localhost:3000';

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