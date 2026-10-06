"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin, ChefHat, UtensilsCrossed, ChevronDown, Sparkles, CircleHelp } from "lucide-react";
import BrandLogo from "./BrandLogo";

export default function HeroSection() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const kitchenHeight = document.getElementById("kitchen-scroll")?.getBoundingClientRect().height ?? document.documentElement.scrollHeight;
      const scrollHeight = kitchenHeight - window.innerHeight;
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

  // Quick fallback bar visible when title is visible or during middle scroll
  const quickBarOpacity = scrollProgress > 0.85 ? 0.2 : 1;

  const handleScrollDownClick = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth"
    });
  };

  return (
    <section className="relative h-full w-full bg-transparent text-white flex flex-col items-center justify-between overflow-hidden select-none font-sans min-h-screen">
      
      {/* ========================================================================= */}
      {/* 1. STARTING TITLE LOCKUP (0% SCROLL - FADES OUT ON SCROLL) */}
      {/* ========================================================================= */}
      <div 
        className="relative z-20 w-full max-w-5xl mx-auto px-4 sm:px-8 md:px-12 flex flex-col items-center justify-center text-center pointer-events-none transition-opacity duration-75 ease-out my-auto pt-8"
        style={{
          opacity: titleOpacity,
          transform: `scale(${titleScale})`,
          visibility: titleOpacity === 0 ? "hidden" : "visible",
        }}
      >
        <BrandLogo size="xl" showTagline={true} taglineColor="text-amber-100 drop-shadow-md" />
      </div>

      {/* ========================================================================= */}
      {/* 2. SCROLL GUIDANCE & QUICK ACCESS BAR (FOR ELDERLY / NON-TECH USERS) */}
      {/* ========================================================================= */}
      <div 
        className="relative z-40 w-full max-w-4xl mx-auto px-4 pb-6 flex flex-col items-center gap-3 transition-opacity duration-300 pointer-events-auto"
        style={{ opacity: quickBarOpacity }}
      >
        {/* Scroll Hint (Desliza hacia abajo) */}
        {scrollProgress < 0.3 && (
          <button 
            onClick={handleScrollDownClick}
            className="group flex flex-col items-center gap-1.5 cursor-pointer text-amber-200/90 hover:text-white transition-all transform hover:scale-105"
            aria-label="Deslizar hacia la cocina"
          >
            <span className="font-['Caveat',cursive] text-lg sm:text-xl font-bold tracking-wide flex items-center gap-1.5 bg-[#1C1A17]/90 px-3.5 py-1 rounded-full border border-amber-500/30 shadow-md">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              Desliza para entrar a la cocina
            </span>
            <ChevronDown className="w-6 h-6 text-amber-400 animate-bounce" />
          </button>
        )}


      </div>

      {/* ========================================================================= */}
      {/* 3. INTERACTIVE CHALKBOARD PILL BADGES OVER EXACT CANVAS OBJECTS */}
      {/* ========================================================================= */}
      <div 
        className="absolute inset-0 z-30 w-full h-full pointer-events-auto transition-all duration-300 ease-out"
        style={{
          opacity: buttonsOpacity,
          visibility: buttonsOpacity === 0 ? "hidden" : "visible",
        }}
      >
        <div className="relative w-full h-full inset-0">
          
          {/* =================================================================== */}
          {/* BADGE 1: MAPA (VERDE - EN EL MARCO SUPERIOR DERECHO DE LA VENTANA) */}
          {/* =================================================================== */}
          <Link
            href="/cocineras-cercanas"
            className="group absolute right-[5%] sm:right-[7%] lg:right-[9%] top-[14%] sm:top-[16%] lg:top-[18%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 z-30"
          >
            {/* Pulsing ring indicator */}
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-lime-500/40 blur-sm animate-pulse group-hover:bg-lime-400/60" />
              <div className="relative bg-[#1C1A17]/95 border-2 border-lime-500/80 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.85)] group-hover:border-lime-300 group-hover:bg-[#2A2620]">
                <MapPin className="w-5 h-5 text-lime-400 shrink-0 animate-bounce" />
                <div className="flex flex-col text-left leading-none">
                  <span className="font-['Caveat',cursive] text-xl font-bold text-lime-200 tracking-wide">Mapa</span>
                  <span className="text-[10px] font-sans text-lime-300/90 font-bold uppercase tracking-wider">¡Comida cerca de ti!</span>
                </div>
              </div>
            </div>
            {/* Hand Pointer */}
            <div className="mt-1.5 flex items-center gap-1 bg-black/90 px-2.5 py-0.5 rounded-full border border-lime-500/50 shadow-md">
              <span className="text-[10px] font-bold text-lime-300 font-sans">Toca para ver el mapa</span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* BADGE 2: COCINERAS (AMARILLO - SOBRE EL GABINETE SUPERIOR DERECHO) */}
          {/* =================================================================== */}
          <Link
            href="/cocineras-cercanas"
            className="group absolute left-[47%] sm:left-[50%] lg:left-[52%] top-[20%] sm:top-[22%] lg:top-[24%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 z-30"
          >
            {/* Pulsing ring indicator */}
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-amber-500/40 blur-sm animate-pulse group-hover:bg-amber-400/60" />
              <div className="relative bg-[#1C1A17]/95 border-2 border-amber-500/80 px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.85)] group-hover:border-amber-300 group-hover:bg-[#2A2620]">
                <ChefHat className="w-5 h-5 text-amber-400 shrink-0 animate-bounce" />
                <div className="flex flex-col text-left leading-none">
                  <span className="font-['Caveat',cursive] text-xl font-bold text-amber-200 tracking-wide">Cocineras</span>
                  <span className="text-[10px] font-sans text-amber-300/90 font-bold uppercase tracking-wider">¡Sabor de barrio!</span>
                </div>
              </div>
            </div>
            {/* Hand Pointer */}
            <div className="mt-1.5 flex items-center gap-1 bg-black/90 px-2.5 py-0.5 rounded-full border border-amber-500/50 shadow-md">
              <span className="text-[10px] font-bold text-amber-300 font-sans">Toca para conocerlas</span>
            </div>
          </Link>

          {/* =================================================================== */}
          {/* BADGE 3: RECETAS (NARANJA - SOBRE LA PLANCHA DE AREPAS EN LA MESA) */}
          {/* =================================================================== */}
          <Link
            href="/menu"
            className="group absolute left-[45%] sm:left-[49%] lg:left-[51%] top-[74%] sm:top-[76%] lg:top-[78%] -translate-y-1/2 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-110 z-30"
          >
            {/* Pulsing ring indicator */}
            <div className="relative">
              <span className="absolute -inset-1 rounded-full bg-[#F0822D]/50 blur-sm animate-pulse group-hover:bg-[#F0822D]/80" />
              <div className="relative bg-[#1C1A17]/95 border-2 border-[#F0822D] px-4 py-2 rounded-full flex items-center gap-2.5 shadow-[0_8px_25px_rgba(0,0,0,0.85)] group-hover:border-orange-300 group-hover:bg-[#2A2620]">
                <UtensilsCrossed className="w-5 h-5 text-[#F0822D] shrink-0 animate-bounce" />
                <div className="flex flex-col text-left leading-none">
                  <span className="font-['Caveat',cursive] text-xl font-bold text-orange-200 tracking-wide">Recetas</span>
                  <span className="text-[10px] font-sans text-orange-300/90 font-bold uppercase tracking-wider">¡Pide tu plato hoy!</span>
                </div>
              </div>
            </div>
            {/* Hand Pointer */}
            <div className="mt-1.5 flex items-center gap-1 bg-black/90 px-2.5 py-0.5 rounded-full border border-[#F0822D]/50 shadow-md">
              <span className="text-[10px] font-bold text-orange-300 font-sans">Toca para ver el menú</span>
            </div>
          </Link>

        </div>
      </div>

    </section>
  );
}
