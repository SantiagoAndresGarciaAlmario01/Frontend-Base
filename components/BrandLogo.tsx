"use client";

import React from "react";

interface BrandLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  showTagline?: boolean;
  className?: string;
  taglineColor?: string;
}

export default function BrandLogo({
  size = "md",
  showTagline = true,
  className = "",
  taglineColor = "text-[#62B869]",
}: BrandLogoProps) {
  // Sizing definitions for icon, wordmark, and tagline
  const wordmarkSizes = {
    sm: "text-xl sm:text-2xl",
    md: "text-3xl sm:text-4xl",
    lg: "text-4xl sm:text-5xl md:text-6xl",
    xl: "text-5xl sm:text-7xl md:text-8xl lg:text-9xl",
  };

  const taglineSizes = {
    sm: "text-[10px] sm:text-xs gap-1.5 mt-0.5",
    md: "text-xs sm:text-sm gap-2 mt-1",
    lg: "text-xs sm:text-base gap-2.5 mt-1.5",
    xl: "text-sm sm:text-xl lg:text-2xl gap-3 mt-2 md:mt-3",
  };

  const dashSizes = {
    sm: "w-3 h-[2px]",
    md: "w-4 h-[2.5px]",
    lg: "w-5 sm:w-6 h-[3px]",
    xl: "w-6 sm:w-10 h-[3px] md:h-[4px]",
  };

  return (
    <div className={`flex flex-col items-center justify-center text-center select-none ${className}`}>
      {/* Icon-as-O + wordmark lockup */}
      <div className={`inline-flex items-center leading-none font-['Outfit',sans-serif] font-extrabold tracking-tight ${wordmarkSizes[size]}`}>
        <img
          src="/brand/ollacercana-icon.svg"
          alt="OllaCercana Icon"
          className="inline-block object-contain shrink-0 align-middle h-[1.15em] -mr-[0.03em] drop-shadow-sm"
        />
        <span className="text-[#F0822D]">lla</span>
        <span className="text-[#62B869]">Cercana</span>
      </div>

      {/* Tagline centered with green dashes on both sides */}
      {showTagline && (
        <div className={`flex items-center justify-center ${taglineSizes[size]} font-sans font-medium`}>
          <span className={`${dashSizes[size]} bg-[#62B869] rounded-full inline-block shrink-0`} />
          <span className={`tracking-wide font-semibold ${taglineColor}`}>
            Comida casera a un paso de tu puerta
          </span>
          <span className={`${dashSizes[size]} bg-[#62B869] rounded-full inline-block shrink-0`} />
        </div>
      )}
    </div>
  );
}
