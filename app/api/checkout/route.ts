
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Αρχικοποίηση της Stripe με το Secret Key από το περιβάλλον
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');
    ; 

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;

    // Δημιουργία του Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      
      // Ζητάμε από τη Stripe να συλλέξει υποχρεωτικά το τηλέφωνο του πελάτη
      phone_number_collection: {
        enabled: true,
      },
      
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Κράτηση Οχήματος: ${model}`,
              description: `Διάρκεια: ${days} Ημέρες | Από: ${checkIn} Έως: ${checkOut}`,
            },
            unit_amount: Math.round(price * 100), // Η Stripe υπολογίζει σε cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      // Αν επιτύχει η πληρωμή
      success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?payment=success`,
      // Αν ακυρωθεί η πληρωμή
      cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}