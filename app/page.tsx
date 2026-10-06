"use client";

import React, { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import ScrollCanvasBackground from "@/components/ScrollCanvasBackground";
import Link from "next/link";
import { ChefHat, HeartHandshake, House, MapPin, MessageCircle, UtensilsCrossed } from "lucide-react";

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <main data-theme-page className="w-full bg-[#14110f] text-white selection:bg-orange-500/30 selection:text-orange-200">
      {/* Tall Scroll Container (h-[400vh]) for smooth scroll-driven frame animation (296 frames) */}
      <div id="kitchen-scroll" ref={containerRef} className="relative min-h-[400vh] w-full">
        
        {/* Full-screen sticky canvas pinned behind the hero UI */}
        <ScrollCanvasBackground scrollContainerRef={containerRef} totalFrames={150} />

        {/* Sticky Viewport Container containing the Hero UI */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10 flex flex-col justify-between">
          <HeroSection />
        </div>

      </div>

      {/* --- VINTAGE / SCRAPBOOK SECTION --- */}
      {/* Torn paper top edge transition */}
      <div className="relative z-20 w-full h-12 bg-[#d8cca6]" style={{ clipPath: 'polygon(0% 100%, 5% 0%, 10% 80%, 15% 10%, 20% 90%, 25% 20%, 30% 100%, 35% 10%, 40% 90%, 45% 0%, 50% 80%, 55% 10%, 60% 100%, 65% 20%, 70% 90%, 75% 0%, 80% 100%, 85% 10%, 90% 90%, 95% 0%, 100% 100%)', marginTop: '-1px' }}></div>

      <section className="relative z-20 bg-[#d8cca6] text-[#2b2117] px-4 py-8 sm:px-8 sm:py-16 overflow-hidden">
        {/* Giant background watermark */}
        <div className="absolute top-1/4 right-0 opacity-[0.07] pointer-events-none scale-150 -translate-y-1/4 translate-x-1/4">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5" className="w-[800px] h-[800px] text-[#4a3b2c]"><circle cx="12" cy="12" r="10"/><path d="m16.24 7.76-1.804 5.411a2 2 0 0 1-1.265 1.265L7.76 16.24l1.804-5.411a2 2 0 0 1 1.265-1.265z"/></svg>
        </div>

        <div className="mx-auto max-w-6xl relative z-10">
          
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
            
            {/* Left Column */}
            <div className="w-full lg:w-[55%] space-y-12 mt-4">
              
              {/* Introduction / About Us */}
              <div>
                <h2 className="text-3xl sm:text-4xl font-normal mb-6 font-['Courier_New',monospace] text-[#4a3b2c] tracking-tight">
                  Descubre la comida — Casera.
                </h2>
                <p className="text-lg leading-relaxed mb-10 font-['Courier_New',monospace] font-bold text-[#4a3b2c]">
                  Finalmente, puedes ofrecerle a tu paladar el sabor de hogar. No te costará mucho. <br/> Podemos guiarte. Llámanos, estamos cocinando.
                </p>

                {/* Torn Paper Card: How it works & What to expect */}
                <div className="relative p-8 sm:p-10 bg-[#dfcc99] shadow-[0_15px_25px_rgba(43,33,23,0.3)] rotate-[-1deg] border border-[#c4a974] max-w-2xl mx-auto lg:mx-0"
                     style={{ clipPath: 'polygon(1% 1%, 99% 0%, 100% 98%, 0% 100%, 2% 50%)' }}>
                  
                  {/* Tape */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-28 h-8 bg-[#e8deba]/90 -rotate-2 shadow-sm border border-[#d6c7a1]"></div>
                  
                  <h3 className="text-2xl font-['Courier_New',monospace] font-bold border-b border-[#c4a974] border-dashed pb-2 mb-6 text-[#524131]">
                    OllaCercana (Comida de Barrio)
                  </h3>
                  
                  <ol className="space-y-6 font-['Courier_New',monospace] text-sm text-[#4a3b2c] font-bold leading-relaxed">
                    <li>1. <span className="underline decoration-[#c4a974] decoration-2">Explora el menú:</span> especialmente útil para quienes extrañan el sabor de la comida casera de abuela.</li>
                    <li>2. <span className="underline decoration-[#c4a974] decoration-2">Reserva y comunícate:</span> habla directo con las cocineras de tu barrio y acuerda la entrega fácilmente.</li>
                    <li>3. <span className="underline decoration-[#c4a974] decoration-2">Disfruta:</span> una experiencia gastronómica que se siente auténtica, sin esfuerzo y encantadora.</li>
                    <li>4. <span className="underline decoration-[#c4a974] decoration-2">Sabor casero y comunidad:</span> la calidez se encuentra con tu mesa.</li>
                  </ol>
                </div>
              </div>
              
              <div className="text-center mt-12">
                <h3 className="font-['Courier_New',monospace] text-xl font-bold mb-4 text-[#352a1f]">¿Aún no estás seguro si esto es para ti?</h3>
                <Link href="/ayuda" className="font-['Courier_New',monospace] font-bold text-xl text-[#63513d] hover:text-[#b24b2c] hover:underline uppercase tracking-widest flex items-center justify-center gap-2 transition-colors">
                  ¿CÓMO HAGO UN PEDIDO? <span className="text-sm border border-[#63513d] rounded-full w-5 h-5 flex items-center justify-center">?</span>
                </Link>
              </div>

            </div>

            {/* Right Column */}
            <div className="w-full lg:w-[45%] space-y-10 lg:pl-10 relative">
              
              {/* Report Header */}
              <div className="text-center border-b border-[#b39e76] pb-6 relative">
                <h2 className="font-['Caveat',cursive] text-7xl text-[#634931] mb-2 font-bold opacity-90">OllaCercana</h2>
                <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 bg-[#d8cca6] px-4 font-['Courier_New',monospace] tracking-[0.3em] text-sm font-bold border-t border-b border-[#b39e76] py-1 text-[#634931]">
                  REPORTE
                </div>
              </div>

              {/* Article 1: Mission */}
              <article className="pt-6">
                <div className="flex gap-4 mb-2 font-['Courier_New',monospace] text-[#4a3b2c] text-lg">
                  <span className="font-bold border-b border-[#b39e76] border-dashed">Destino:</span>
                  <span className="font-bold">Comunidad</span>
                </div>
                <div className="text-xs tracking-widest mb-4 font-['Courier_New',monospace] uppercase text-[#735e45] font-bold">FEBRERO 12, 2026</div>
                <p className="font-['Courier_New',monospace] text-sm leading-relaxed text-[#4a3b2c] text-justify font-bold opacity-80">
                  Nacimos de la sencilla pero poderosa idea de que la comida une a las personas. Nuestro objetivo es reconstruir el tejido social de los barrios, apoyando la economía local y volviendo a compartir la mesa como una gran familia. Disfrutamos la buena sazón más que muchos y creemos en la autenticidad.
                </p>
                <div className="text-right mt-2 text-xs font-['Courier_New',monospace] font-bold tracking-widest text-[#634931]">MÁS...</div>
              </article>

              {/* Article 2: Rules */}
              <article className="pt-4 border-t border-[#b39e76] border-dashed">
                <h3 className="font-['Courier_New',monospace] text-xl font-bold text-[#4a3b2c] mb-2 leading-tight">20 Reglas de Seguridad e Higiene</h3>
                <div className="text-xs tracking-widest mb-4 font-['Courier_New',monospace] uppercase text-[#735e45] font-bold">FEBRERO 2, 2026</div>
                <p className="font-['Courier_New',monospace] text-sm leading-relaxed text-[#4a3b2c] text-justify font-bold opacity-80">
                  Fomentamos normas de higiene estrictas, transparencia en alergias y entregas seguras. Todo trato debe ser respetuoso. La confianza es nuestra receta principal y requerimos que todos en la comunidad sigan estas reglas fundamentales para garantizar un ambiente seguro y agradable para todos los vecinos.
                </p>
                <div className="text-right mt-2 text-xs font-['Courier_New',monospace] font-bold tracking-widest text-[#634931]">MÁS...</div>
              </article>

            </div>
          </div>
        </div>
      </section>

      {/* Bottom Contact/Envelope Section */}
      <section className="relative z-20 bg-[#3a3528] px-4 pb-16 sm:px-8">
        {/* Torn edge transition down to dark section */}
        <div className="absolute top-0 left-0 w-full h-8 -translate-y-[90%] z-30" style={{ clipPath: 'polygon(0% 100%, 5% 20%, 10% 100%, 15% 10%, 20% 90%, 25% 0%, 30% 100%, 35% 20%, 40% 90%, 45% 10%, 50% 80%, 55% 0%, 60% 100%, 65% 10%, 70% 90%, 75% 20%, 80% 100%, 85% 0%, 90% 90%, 95% 10%, 100% 100%)', backgroundColor: '#3a3528' }}></div>
        
        <div className="mx-auto max-w-4xl pt-12">
          <p className="text-center font-['Courier_New',monospace] text-[#d8cca6] mb-8 tracking-widest text-sm opacity-80">
            Te invitamos a descubrir nuestro propósito, proceso y tu beneficio.
          </p>
          
          {/* Envelope Card */}
          <div className="bg-[#dfcc99] p-6 sm:p-8 shadow-[0_20px_40px_rgba(0,0,0,0.6)] border border-[#a38c64] rounded-sm flex flex-col md:flex-row gap-6 md:gap-10 relative">
            
            {/* Form side */}
            <div className="flex-1 space-y-4">
              <div className="flex gap-4">
                <input type="text" placeholder="Your Name" className="w-1/2 bg-[#d6c48f] border border-[#a38c64] p-3 font-['Courier_New',monospace] text-[#4a3b2c] placeholder:text-[#8a7b63] focus:outline-none focus:bg-[#e3d1a0]" />
                <input type="text" placeholder="Your Email" className="w-1/2 bg-[#d6c48f] border border-[#a38c64] p-3 font-['Courier_New',monospace] text-[#4a3b2c] placeholder:text-[#8a7b63] focus:outline-none focus:bg-[#e3d1a0]" />
              </div>
              <textarea placeholder="Your Message" rows={4} className="w-full bg-[#d6c48f] border border-[#a38c64] p-3 font-['Courier_New',monospace] text-[#4a3b2c] placeholder:text-[#8a7b63] focus:outline-none focus:bg-[#e3d1a0] resize-none"></textarea>
              <div className="text-right">
                <button className="bg-[#bda173] border-2 border-[#735e45] px-8 py-1.5 font-['Courier_New',monospace] font-bold text-[#4a3b2c] shadow-[2px_2px_0px_#4a3b2c] hover:translate-y-[2px] hover:shadow-none transition-all text-lg">
                  Send
                </button>
              </div>
            </div>

            {/* Address side */}
            <div className="w-full md:w-[40%] border-t md:border-t-0 md:border-l border-dashed border-[#a38c64] pt-6 md:pt-0 pl-0 md:pl-8 space-y-5 font-['Courier_New',monospace] text-[#4a3b2c] text-sm relative">
              {/* Stamp */}
              <div className="absolute -top-4 right-0 w-20 h-24 border-2 border-white p-1 rotate-12 bg-[#3a3528] shadow-md flex flex-col items-center justify-center text-center overflow-hidden">
                <span className="text-[8px] text-white absolute top-1 uppercase tracking-tighter">Special Delivery</span>
                <UtensilsCrossed className="w-10 h-10 text-white opacity-80 mt-2" />
                <span className="text-white text-xs font-bold absolute bottom-1 left-1">30¢</span>
              </div>

              <div>
                <strong className="text-lg font-bold text-[#634931]">Send To:</strong><br/><br/>
                <span className="font-bold">OllaCercana Inc.</span><br/>
                1009 8th Street,<br/>
                Suite 102<br/>
                P.O. Box 761<br/>
                Bogotá, COL 110111
              </div>
              
              <div className="pt-5 border-t border-[#a38c64] border-dashed">
                <strong className="text-lg font-bold text-[#634931]">Phone & Email:</strong><br/><br/>
                <span className="font-bold">1(877)OLLACERCA</span><br/>
                <span className="font-bold">1(877)589-2267</span><br/>
                <span className="opacity-80">info@ollacercana.com</span>
              </div>
            </div>
            
          </div>

          <div className="text-center mt-10 font-['Courier_New',monospace] text-xs text-[#a3977c] tracking-widest uppercase">
            Copyright 2026 OllaCercana. All rights reserved.
          </div>
        </div>
      </section>
    </main>
  );
}
