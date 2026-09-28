"use client";

import React, { useEffect, useState } from "react";
import { BookOpen, MapPin, Phone } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (scrollHeight > 0) {
        const progress = Math.max(0, Math.min(1, scrollY / scrollHeight));
        setScrollProgress(progress);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Title lockup fade out (0% to ~45% scroll)
  const titleOpacity = Math.max(0, Math.min(1, 1 - scrollProgress * 2.2));
  const titleScale = 1 + scrollProgress * 0.08;

  // Glass pill buttons fade in ONLY at final kitchen table scene (~82% to 100% scroll)
  const buttonsOpacity = scrollProgress < 0.82 
    ? 0 
    : Math.max(0, Math.min(1, (scrollProgress - 0.82) * 5.5));

  return (
    <section className="relative h-full w-full bg-transparent text-white flex flex-col items-center justify-between overflow-hidden select-none font-sans min-h-screen">
      
      {/* ========================================================================= */}
      {/* 1. STARTING TITLE LOCKUP (0% SCROLL - FADES OUT ON SCROLL) */}
      {/* ========================================================================= */}
      <div 
        className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center text-center pointer-events-none transition-opacity duration-75 ease-out my-auto"
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          visibility: titleOpacity === 0 ? "hidden" : "visible",
        }}
      >
        <BrandLogo size="xl" showTagline={true} taglineColor="text-white drop-shadow-md" />
      </div>

      {/* ========================================================================= */}
      {/* 2. INTERACTIVE GLASS PILL BADGES POSITIONED DIRECTLY OVER TABLE OBJECTS */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 z-30 w-full h-full pointer-events-auto transition-all duration-300 ease-out"
        style={{
          opacity: buttonsOpacity,
          visibility: buttonsOpacity === 0 ? "hidden" : "visible",
        }}
      >
        <div className="relative w-full h-full max-w-6xl mx-auto">
          
          {/* =================================================================== */}
          {/* BADGE 1: LIBRETÓN (OVER NOTEBOOK ON LEFT) */}
          {/* =================================================================== */}
          <a
            href="/menu"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute left-[8%] sm:left-[15%] lg:left-[20%] top-[45%] sm:top-[48%] lg:top-[50%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 z-30"
          >
            {/* Dark Glassmorphic Pill */}
            <div className="glass-pill-dark px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/25 shadow-[0_10px_25px_rgba(0,0,0,0.8)] group-hover:border-orange-400/80 group-hover:bg-stone-900/95 transition-all">
              <BookOpen className="w-4 h-4 text-orange-400 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-white tracking-wide font-['Outfit']">Libretón</span>
                <span className="text-[10px] text-stone-300 font-light">(Clic para abrir)</span>
              </div>
            </div>

            {/* Bouncing Hand Cursor */}
            <div className="mt-1.5 animate-hand-bounce text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <svg className="w-5 h-5 fill-white stroke-black stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v-1.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V14l-2.2-2.2a2 2 0 0 0-2.8 2.8L9 21.5C10.5 23 12.5 24 14.5 24H17a5 5 0 0 0 5-5v-6a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
          </a>

          {/* =================================================================== */}
          {/* BADGE 2: MAPA DE PROXIMIDAD (OVER MAP IN CENTER) */}
          {/* =================================================================== */}
          <a
            href="/cocineras-cercanas"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute left-1/2 -translate-x-1/2 top-[38%] sm:top-[40%] lg:top-[42%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 z-30"
          >
            {/* Dark Glassmorphic Pill */}
            <div className="glass-pill-dark px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/25 shadow-[0_10px_25px_rgba(0,0,0,0.8)] group-hover:border-lime-400/80 group-hover:bg-stone-900/95 transition-all">
              <MapPin className="w-4 h-4 text-lime-400 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-white tracking-wide font-['Outfit']">Mapa de Proximidad</span>
                <span className="text-[10px] text-stone-300 font-light">(Clic para abrir)</span>
              </div>
            </div>

            {/* Bouncing Hand Cursor */}
            <div className="mt-1.5 animate-hand-bounce text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <svg className="w-5 h-5 fill-white stroke-black stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v-1.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V14l-2.2-2.2a2 2 0 0 0-2.8 2.8L9 21.5C10.5 23 12.5 24 14.5 24H17a5 5 0 0 0 5-5v-6a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
          </a>

          {/* =================================================================== */}
          {/* BADGE 3: TELÉFONO DE VERIFICACIÓN (OVER PHONE ON RIGHT) */}
          {/* =================================================================== */}
          <a
            href="/cuenta"
            target="_blank"
            rel="noopener noreferrer"
            className="group absolute right-[8%] sm:right-[15%] lg:right-[18%] top-[48%] sm:top-[50%] lg:top-[52%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 z-30"
          >
            {/* Dark Glassmorphic Pill */}
            <div className="glass-pill-dark px-4 py-2.5 rounded-full flex items-center gap-3 border border-white/25 shadow-[0_10px_25px_rgba(0,0,0,0.8)] group-hover:border-amber-400/80 group-hover:bg-stone-900/95 transition-all">
              <Phone className="w-4 h-4 text-amber-400 shrink-0" />
              <div className="flex flex-col text-left leading-tight">
                <span className="text-xs font-bold text-white tracking-wide font-['Outfit']">Teléfono de Verificación</span>
                <span className="text-[10px] text-stone-300 font-light">(Clic para abrir)</span>
              </div>
            </div>

            {/* Bouncing Hand Cursor */}
            <div className="mt-1.5 animate-hand-bounce text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
              <svg className="w-5 h-5 fill-white stroke-black stroke-[1.5]" viewBox="0 0 24 24">
                <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v-1.5a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2V14l-2.2-2.2a2 2 0 0 0-2.8 2.8L9 21.5C10.5 23 12.5 24 14.5 24H17a5 5 0 0 0 5-5v-6a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
          </a>

        </div>
      </div>

    </section>
  );
}
