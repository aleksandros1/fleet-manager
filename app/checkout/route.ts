import { NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(req: Request) {
  try {
    // Η αρχικοποίηση μεταφέρθηκε μέσα για να μην καταρρέει το σύστημα αν λείπει το κλειδί.
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ 
        error: "Το κλειδί STRIPE_SECRET_KEY δεν βρέθηκε. Πρέπει να κλείσετε το τερματικό και να ξανατρέξετε 'npm run dev'." 
      }, { status: 500 });
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2023-10-16' as any,
    });

    const body = await req.json();
    const { vehicleId, model, price, checkIn, checkOut, days } = body;
    
    // Ασφαλής ανάκτηση του URL. Αν λείπει, επιστρέφει στο localhost.
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Auto Lazaridis | ${model}`,
              description: `Κράτηση: ${checkIn} έως ${checkOut} (${days} Ημέρες)`,
            },
            unit_amount: Math.round(price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${siteUrl}/?payment=success`,
      cancel_url: `${siteUrl}/?payment=cancelled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error("Stripe Backend Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}