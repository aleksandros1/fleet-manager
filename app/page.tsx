'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// --- Supabase ---
const supabaseUrl = 'https://xbricpdkqhclyfoowxeq.supabase.co';
const supabaseAnonKey = 'sb_publishable_7-DEyJJSNd0Dd9pOf7Xt7w_s7p2ZaEi';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- CSS (Noise, Typography, Fullscreen) ---
const GlobalStyles = () => (
  <style jsx global>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;700&display=swap');
    
    body { background-color: #060606; color: #FFFFFF; font-family: 'Space Grotesk', sans-serif; overflow-x: hidden; cursor: none; }
    ::selection { background: #FFFFFF; color: #000000; }
    ::-webkit-scrollbar { display: none; }
    
    .noise-overlay {
      position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      pointer-events: none; z-index: 9999; opacity: 0.04;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
    }

    .clip-text { clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
    
    .hide-cursor { cursor: none !important; }
    a, button, input { cursor: none !important; }
  `}</style>
);

const CATEGORY_STOCK_PHOTOS: Record<string, string> = {
  'Premium': 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2000&q=80',
  'SUV / 4x4': 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=2000&q=80',       
  'Sedan': 'https://images.unsplash.com/photo-1617469767053-d3b523a0b982?auto=format&fit=crop&w=2000&q=80',           
  'Compact / Hatchback': 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=2000&q=80'
};

type Vehicle = { id: number; plate: string; model: string; cc: string; hp: string; price: number; is_active: boolean; category: string; photos: string[]; };

// --- Custom Cinematic Cursor ---
const CinematicCursor = ({ cursorText }: { cursorText: string }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  return (
    <motion.div 
      className="fixed top-0 left-0 w-4 h-4 bg-white rounded-full mix-blend-difference pointer-events-none z-[10000] flex items-center justify-center whitespace-nowrap text-black font-bold text-[8px] tracking-[0.2em]"
      animate={{ 
        x: mousePosition.x - (cursorText ? 40 : 8), 
        y: mousePosition.y - (cursorText ? 40 : 8),
        width: cursorText ? 80 : 16,
        height: cursorText ? 80 : 16,
        backgroundColor: cursorText ? '#FFFFFF' : '#FFFFFF'
      }}
      transition={{ type: 'spring', stiffness: 500, damping: 28, mass: 2 }}
    >
      {cursorText}
    </motion.div>
  );
};

export default function AwwwardsExperience() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [introFinished, setIntroFinished] = useState(false);
  const [cursorState, setCursorState] = useState('');
  
  // Cockpit Booking State
  const [bookingVehicle, setBookingVehicle] = useState<Vehicle | null>(null);
  const [bookingStep, setBookingStep] = useState(0); // 0: closed, 1: dates, 2: confirmed

  const { scrollYProgress } = useScroll();

  useEffect(() => {
    async function fetchVehicles() {
      const { data } = await supabase.from('vehicles').select('*').eq('is_active', true);
      if (data) setVehicles(data);
      setLoading(false);
    }
    fetchVehicles();

    // Intro Sequence Timer
    setTimeout(() => setIntroFinished(true), 3500);
  }, []);

  // --- INTRO SEQUENCE (CINEMATIC LAUNCH) ---
  if (!introFinished) {
    return (
      <div className="w-screen h-screen bg-[#060606] flex items-center justify-center overflow-hidden">
        <GlobalStyles />
        <div className="noise-overlay"></div>
        <div className="clip-text">
          <motion.h1 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, ease: [0.76, 0, 0.24, 1] }}
            className="text-[10vw] font-bold tracking-tighter leading-none text-white text-center"
          >
            AUTO LAZARIDIS
          </motion.h1>
        </div>
        <div className="clip-text absolute bottom-20">
          <motion.p 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1, ease: [0.76, 0, 0.24, 1] }}
            className="text-xs uppercase tracking-[0.5em] text-gray-500"
          >
            Not everyone drives the same.
          </motion.p>
        </div>
      </div>
    );
  }

  // --- COCKPIT BOOKING OVERLAY ---
  if (bookingVehicle) {
    return (
      <div className="fixed inset-0 bg-[#060606] z-[9000] flex text-white overflow-hidden animate-in fade-in duration-700">
        <GlobalStyles />
        <CinematicCursor cursorText={cursorState} />
        
        {/* Left Side - The Machine */}
        <div className="w-1/2 h-full relative" onMouseEnter={() => setCursorState('CLOSE')} onMouseLeave={() => setCursorState('')} onClick={() => setBookingVehicle(null)}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={CATEGORY_STOCK_PHOTOS[bookingVehicle.category || 'Premium']} alt="Car" className="w-full h-full object-cover grayscale-[30%] opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#060606]"></div>
          <div className="absolute bottom-20 left-20">
            <h2 className="text-7xl font-bold tracking-tighter uppercase mb-4">{bookingVehicle.model}</h2>
            <div className="flex gap-10 opacity-50 text-sm font-bold tracking-[0.2em] uppercase">
              <span>{bookingVehicle.hp} HP</span>
              <span>{bookingVehicle.cc} CC</span>
            </div>
          </div>
        </div>

        {/* Right Side - The Cockpit Console */}
        <div className="w-1/2 h-full p-20 flex flex-col justify-center relative">
          <AnimatePresence mode="wait">
            {bookingStep === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-16">
                <div>
                  <h3 className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4">Pick Up & Drop Off</h3>
                  <div className="grid grid-cols-2 gap-8">
                    <input type="date" className="bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-white transition-colors" />
                    <input type="date" className="bg-transparent border-b border-white/20 pb-4 text-xl focus:outline-none focus:border-white transition-colors" />
                  </div>
                </div>
                
                <div>
                   <h3 className="text-xs uppercase tracking-[0.4em] text-gray-500 mb-4">Insurance</h3>
                   <div className="flex gap-4">
                     <button className="flex-1 border border-white/20 py-4 text-xs tracking-widest uppercase hover:bg-white hover:text-black transition-all">Basic</button>
                     <button className="flex-1 border border-[#D90000] text-[#D90000] py-4 text-xs tracking-widest uppercase hover:bg-[#D90000] hover:text-white transition-all">Premium</button>
                   </div>
                </div>

                <div className="pt-10 border-t border-white/10 flex justify-between items-end">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-500 mb-2">Total Estimate</div>
                    <div className="text-6xl font-bold tracking-tighter">€{bookingVehicle.price}<span className="text-xl text-gray-500">/day</span></div>
                  </div>
                  <button 
                    onMouseEnter={() => setCursorState('PRESS')} onMouseLeave={() => setCursorState('')}
                    onClick={() => setBookingStep(1)}
                    className="bg-white text-black px-12 py-5 rounded-full text-xs font-bold uppercase tracking-[0.2em] hover:scale-105 transition-transform"
                  >
                    Confirm
                  </button>
                </div>
              </motion.div>
            )}

            {bookingStep === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center justify-center text-center space-y-8 h-full">
                <div className="w-24 h-24 border border-white/20 rounded-full flex items-center justify-center overflow-hidden relative">
                  <motion.div initial={{ height: 0 }} animate={{ height: '100%' }} transition={{ duration: 1 }} className="absolute bottom-0 w-full bg-white"></motion.div>
                </div>
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter mb-4">REQUEST SENT.</h2>
                  <p className="text-sm uppercase tracking-[0.2em] text-gray-500">We will contact you within minutes.<br/>Welcome to Lazaridis.</p>
                </div>
                <button onClick={() => { setBookingVehicle(null); setBookingStep(0); }} className="mt-10 border-b border-white pb-1 text-xs uppercase tracking-[0.2em] hover:text-gray-500 transition-colors">Return to Fleet</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- MAIN EXPERIENCE ---
  return (
    <div className="bg-[#060606] min-h-screen text-white">
      <GlobalStyles />
      <div className="noise-overlay"></div>
      <CinematicCursor cursorText={cursorState} />

      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 px-10 py-10 flex justify-between items-center mix-blend-difference pointer-events-none">
        <div className="text-xs font-bold tracking-[0.4em] uppercase">Auto Lazaridis</div>
        <div className="text-[9px] uppercase tracking-[0.4em] text-gray-500">Scroll to explore</div>
      </header>

      {/* FULLSCREEN FLEET SHOWCASE */}
      <main className="relative">
        {loading ? (
          <div className="h-screen w-full flex items-center justify-center text-xs uppercase tracking-[0.5em] text-gray-600 animate-pulse">Loading Engine...</div>
        ) : (
          vehicles.map((v, i) => (
            <motion.section 
              key={v.id} 
              className="h-screen w-full sticky top-0 flex flex-col justify-center items-center overflow-hidden"
              style={{ zIndex: i }}
            >
              {/* Cinematic Background */}
              <div className="absolute inset-0 w-full h-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={CATEGORY_STOCK_PHOTOS[v.category || 'Premium']} 
                  alt={v.model} 
                  className="w-full h-full object-cover grayscale-[40%] opacity-40 transition-transform duration-[10s] hover:scale-110 hover:grayscale-0 hover:opacity-70"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#060606] via-transparent to-[#060606]/50"></div>
                <div className="absolute inset-0 bg-[#060606]/20 backdrop-blur-[2px]"></div>
              </div>

              {/* Massive Kinetic Typography */}
              <div className="relative z-10 w-full flex flex-col items-center justify-center pointer-events-none">
                <div className="text-[10px] text-[#D90000] uppercase tracking-[0.5em] mb-8 font-bold">{v.category}</div>
                
                <h2 className="text-[12vw] font-bold uppercase tracking-tighter leading-[0.8] text-center mix-blend-overlay text-white opacity-90 drop-shadow-2xl">
                  {v.model.split(' ')[0]}
                </h2>
                {v.model.split(' ')[1] && (
                  <h2 className="text-[12vw] font-bold uppercase tracking-tighter leading-[0.8] text-center text-transparent" style={{ WebkitTextStroke: '2px rgba(255,255,255,0.2)' }}>
                    {v.model.substring(v.model.indexOf(' ') + 1)}
                  </h2>
                )}
              </div>

              {/* Specs & Booking CTA */}
              <div className="absolute bottom-16 w-full px-16 flex justify-between items-end z-20">
                <div className="flex flex-col gap-1">
                  <div className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Starting from</div>
                  <div className="text-4xl font-bold tracking-tighter">€{v.price}<span className="text-sm font-normal text-gray-500 tracking-[0.2em] ml-2 uppercase">/ day</span></div>
                </div>

                <div 
                  onMouseEnter={() => setCursorState('BOOK')} 
                  onMouseLeave={() => setCursorState('')}
                  onClick={() => setBookingVehicle(v)}
                  className="w-24 h-24 rounded-full border border-white/20 flex items-center justify-center hover:bg-white hover:text-black transition-colors duration-500 backdrop-blur-md cursor-pointer group"
                >
                  <span className="text-[9px] font-bold uppercase tracking-[0.2em] group-hover:scale-110 transition-transform">Reserve</span>
                </div>
              </div>
            </motion.section>
          ))
        )}
      </main>

    </div>
  );
}