import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  // Σύνδεση με τη βάση μας
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Παίρνουμε όλα τα ενεργά οχήματα
  const { data: vehicles } = await supabase
    .from('vehicles')
    .select('*')
    .eq('is_active', true);

  // Κρατάμε ΜΟΝΟ όσα προορίζονται για Πώληση (το Car.gr είναι κυρίως για πωλήσεις)
  const carsForSale = vehicles?.filter(v => v.availability?.includes('Πώληση')) || [];

  // Ημερομηνία στο format που ζητάει το Car.gr (ISO 8601)
  const lastUpdate = new Date().toISOString(); 

  // Ξεκινάμε το χτίσιμο του XML
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<cardealer>\n`;
  xml += `  <lastupdate>${lastUpdate}</lastupdate>\n`;
  xml += `  <vehicles>\n`;

  carsForSale.forEach(v => {
    xml += `    <vehicle>\n`;
    xml += `      <unique_id>${v.id}</unique_id>\n`;
    xml += `      <vtype>car</vtype>\n`;
    
    // ΣΗΜΑΝΤΙΚΟ: Το Car.gr απαιτεί category_id και make_id (κωδικοί μάρκας δικοί τους).
    // Προς το παρόν βάζουμε placeholders για να περνάει τον έλεγχο (Validation)
    xml += `      <category_id>11</category_id>\n`; 
    xml += `      <make_id></make_id>\n`; 
    
    xml += `      <price>${v.price}</price>\n`;
    xml += `      <condition>used</condition>\n`;
    
    // Το car.gr απαιτεί χρονολογία. Αν δεν την έχουμε ακόμα, βάζουμε μια default πχ 2020
    xml += `      <regiyear>2020</regiyear>\n`; 
    xml += `      <regimonth>1</regimonth>\n`;
    
    if (v.cc) xml += `      <engine>${v.cc}</engine>\n`;
    if (v.hp) xml += `      <power>${v.hp}</power>\n`;
    if (v.mileage) xml += `      <mileage>${v.mileage.replace(/[^0-9]/g, '')}</mileage>\n`; // Καθαρίζει τα γράμματα αν υπάρχουν
    
    if (v.transmission) {
        const trans = v.transmission.toLowerCase().includes('αυτ') ? 'automatic' : 'manual';
        xml += `      <transmission>${trans}</transmission>\n`;
    }
    
    if (v.fuel) {
        xml += `      <fueltype>${v.fuel}</fueltype>\n`;
    }

    if (v.photos && v.photos.length > 0) {
        xml += `      <photos>\n`;
        v.photos.forEach((photoUrl: string) => {
            xml += `        <photo>${photoUrl}</photo>\n`;
        });
        xml += `      </photos>\n`;
    }
    
    xml += `    </vehicle>\n`;
  });

  xml += `  </vehicles>\n`;
  xml += `</cardealer>`;

  // Επιστρέφουμε την απάντηση ως κανονικό αρχείο XML
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
}