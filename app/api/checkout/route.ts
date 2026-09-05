import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Παίρνουμε το κλειδί και "καθαρίζουμε" τυχόν κενά ή αλλαγές γραμμής με το .trim()
    const rawKey = process.env.STRIPE_SECRET_KEY || "";
    const stripeKey = rawKey.trim();
    
    if (!stripeKey) {
      throw new Error("Λείπει το STRIPE_SECRET_KEY. Πρέπει να το προσθέσετε στα Settings του Cloudflare.");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2026-06-24.dahlia' as any, 
    });

    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;

    // Δικλείδα ασφαλείας για το origin URL
    const origin = req.headers.get('origin') || 'https://autolazaridis.gr';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              // Βάζουμε ένα default όνομα σε περίπτωση που το 'model' έρθει κενό (undefined)
              name: model || 'Ενοικίαση Οχήματος',
              description: checkIn && checkOut ? `Ημερομηνίες: ${checkIn} έως ${checkOut}` : 'Μη διαθέσιμες ημερομηνίες',
            },
            unit_amount: Math.round(price * 100), 
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/?payment=success`,
      cancel_url: `${origin}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("Stripe Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}