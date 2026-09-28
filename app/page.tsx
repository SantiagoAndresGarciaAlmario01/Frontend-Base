"use client";

import React, { useRef } from "react";
import HeroSection from "@/components/HeroSection";
import ScrollCanvasBackground from "@/components/ScrollCanvasBackground";

export default function Home() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  return (
    <main className="w-full bg-[#14110f] text-white selection:bg-orange-500/30 selection:text-orange-200">
      {/* Tall Scroll Container (h-[400vh]) for smooth scroll-driven frame animation (296 frames) */}
      <div ref={containerRef} className="relative min-h-[400vh] w-full">
        
        {/* Full-screen sticky canvas pinned behind the hero UI */}
        <ScrollCanvasBackground scrollContainerRef={containerRef} totalFrames={296} />

        {/* Sticky Viewport Container containing the Hero UI */}
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden z-10 flex flex-col justify-between">
          <HeroSection />
        </div>

      </div>
    </main>
  );
}
