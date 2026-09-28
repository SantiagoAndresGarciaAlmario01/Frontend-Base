"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  ChevronDown,
  Search,
  Star,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  Clock,
  Flame,
  Footprints,
  Bike,
  Layers,
  Home,
  Utensils,
  ChevronRight,
} from "lucide-react";

// Types
interface Cook {
  id: string;
  name: string;
  avatar: string;
  rating: string;
  reviews: number;
  distanceMeters: number;
  distanceText: string;
  isOpen: boolean;
  statusNote: string;
  handwrittenBio: string;
  featuredDish: {
    name: string;
    description: string;
    price: number;
    formattedPrice: string;
    image: string;
    badge?: string;
  };
  // Coordinates relative to SVG map viewBox (0..1000 x 0..650), center is at (500, 350)
  mapCoords: {
    x: number;
    y: number;
  };
  streetAddress: string;
}

// Nearby cooks dataset
const COOKS_DATA: Cook[] = [
  {
    id: "dona-rosa",
    name: "Doña Rosa",
    avatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,9",
    reviews: 124,
    distanceMeters: 320,
    distanceText: "A 320 m",
    isOpen: true,
    statusNote: "Olla al fuego · Entrega rápida",
    handwrittenBio: "«Amasé las arepas de choclo esta mañana tempranito, con queso campesino fresco.»",
    featuredDish: {
      name: "Ajiaco Santafereño de la Casa",
      description: "Con tres tipos de papa, pollo desmechado tierno, guascas frescas, alcaparras y crema de leche.",
      price: 18000,
      formattedPrice: "$18.000",
      image: "/images/menu_ajiaco.jpg",
      badge: "El favorito del barrio ♡",
    },
    mapCoords: { x: 440, y: 260 }, // ~320m northwest (inside 500m ring)
    streetAddress: "Calle 64 # 4-22 (casa blanca con zaguán)",
  },
  {
    id: "don-carlos",
    name: "Don Carlos",
    avatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,8",
    reviews: 98,
    distanceMeters: 480,
    distanceText: "A 480 m",
    isOpen: true,
    statusNote: "Cocinando ahora · 6 raciones listas",
    handwrittenBio: "«Los frijoles cargamanto llevan 5 horas de cocción lenta en olla de barro.»",
    featuredDish: {
      name: "Cazuela Paisa Tradicional",
      description: "Frijoles de la casa con chicharrón crocante, plátano maduro en cubos, aguacate y arroz.",
      price: 22000,
      formattedPrice: "$22.000",
      image: "/images/menu_cazuela.jpg",
      badge: "¡Recién bajado del fogón!",
    },
    mapCoords: { x: 620, y: 410 }, // ~480m southeast (inside 500m ring)
    streetAddress: "Carrera 5 # 62-18",
  },
  {
    id: "dona-marta",
    name: "Doña Marta",
    avatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,8",
    reviews: 89,
    distanceMeters: 740,
    distanceText: "A 740 m",
    isOpen: true,
    statusNote: "Abierta · Almuerzo en curso",
    handwrittenBio: "«Pollo de campo con verduras que traje esta madrugada de Paloquemao.»",
    featuredDish: {
      name: "Pollo Guisado Campesino",
      description: "Pierna pernil en salsa de tomate criollo, cebolla junca y papitas criollas doradas.",
      price: 17000,
      formattedPrice: "$17.000",
      image: "/images/dish_pollo_chalk.jpg",
      badge: "Sazón de la abuela",
    },
    mapCoords: { x: 310, y: 440 }, // ~740m southwest (between 500m and 1km)
    streetAddress: "Calle 67 # 7-45",
  },
  {
    id: "dona-lucia",
    name: "Doña Lucía",
    avatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,9",
    reviews: 67,
    distanceMeters: 890,
    distanceText: "A 890 m",
    isOpen: false,
    statusNote: "Cerrada ahora · Hornea a las 4:00 PM",
    handwrittenBio: "«El secreto es la canela fresca de Ceilán, cáscara de naranja y leche pura de vaca.»",
    featuredDish: {
      name: "Arroz con Leche Cremoso & Canela",
      description: "Postre tradicional con uvas pasas maceradas y un toque dulce de panela raspada.",
      price: 6000,
      formattedPrice: "$6.000",
      image: "/images/menu_postre.jpg",
      badge: "Edición dulce de la tarde",
    },
    mapCoords: { x: 680, y: 220 }, // ~890m northeast (inside 1km ring)
    streetAddress: "Transversal 3 # 66-10",
  },
  {
    id: "don-luis",
    name: "Don Luis",
    avatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,9",
    reviews: 112,
    distanceMeters: 1120,
    distanceText: "A 1,1 km",
    isOpen: true,
    statusNote: "Cocinando ahora · Olla comunitaria",
    handwrittenBio: "«Caldito espeso con mazorca criolla tierna, plátano verde y cilantro cimarrón fresco.»",
    featuredDish: {
      name: "Sancocho Trifásico Tradicional",
      description: "Tres carnes doradas al carbón, yuca harinosa, plátano y mazorca con ají casero.",
      price: 19000,
      formattedPrice: "$19.000",
      image: "/images/olla_dish_1.jpg",
      badge: "Porción generosa",
    },
    mapCoords: { x: 790, y: 480 }, // ~1120m (beyond 1km ring)
    streetAddress: "Carrera 2 Este # 60-34",
  },
  {
    id: "maria-elena",
    name: "María Elena",
    avatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,7",
    reviews: 74,
    distanceMeters: 1350,
    distanceText: "A 1,3 km",
    isOpen: false,
    statusNote: "Cerrada por hoy · Vuelve mañana 11:30 AM",
    handwrittenBio: "«Receta 100% casera con ahogado de tomate de árbol y tajadas de plátano maduro.»",
    featuredDish: {
      name: "Cazuela de Lentejas Caseras",
      description: "Lentejas estofadas a fuego lento, arroz blanco, tajadas doradas y ensalada de aguacate.",
      price: 15000,
      formattedPrice: "$15.000",
      image: "/images/hero_plate_gourmet.jpg",
      badge: "Opción vegetariana",
    },
    mapCoords: { x: 190, y: 250 }, // ~1350m northwest (beyond 1km ring)
    streetAddress: "Calle 68 # 9-12",
  },
];

type FilterType = "todas" | "500m" | "1km" | "abiertas";

export default function CocinerasCercanasPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>("todas");
  const [selectedCook, setSelectedCook] = useState<Cook | null>(COOKS_DATA[0]);
  const [hoveredCookId, setHoveredCookId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter logic
  const filteredCooks = COOKS_DATA.filter((cook) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = cook.name.toLowerCase().includes(q);
      const matchDish = cook.featuredDish.name.toLowerCase().includes(q);
      const matchBio = cook.handwrittenBio.toLowerCase().includes(q);
      if (!matchName && !matchDish && !matchBio) return false;
    }

    // Proximity / status tab filter
    if (activeFilter === "500m") return cook.distanceMeters <= 500;
    if (activeFilter === "1km") return cook.distanceMeters <= 1000;
    if (activeFilter === "abiertas") return cook.isOpen;
    return true;
  });

  const handleSelectCook = (cook: Cook, openModal: boolean = true) => {
    setSelectedCook(cook);
    if (openModal) {
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen relative text-[#2C241E] font-['Outfit',sans-serif] selection:bg-[#F0822D] selection:text-white flex flex-col bg-[#2A1E17]">
      {/* ── SUNLIT KITCHEN BACKGROUND (Consistent with Libretón) ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Image
          src="/images/kitchen_background.jpg"
          alt="Fondo de cocina tradicional con azulejos y mesa de madera"
          fill
          priority
          className="object-cover object-center"
        />
        {/* Soft warm ambient lighting overlay for optimal contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#1C1F22]/35 via-transparent to-[#1C1F22]/45 pointer-events-none" />
      </div>

      {/* ── 1. TOP BRAND NAVIGATION BAR ── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs px-4 md:px-8 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <div className="w-8 h-8 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center p-1 transition-transform group-hover:scale-105">
              <img
                src="/brand/ollacercana-icon.svg"
                alt="OllaCercana Icon"
                className="w-full h-full object-contain"
              />
            </div>
            <span className="font-['Outfit',sans-serif] font-extrabold text-2xl tracking-tight leading-none">
              <span className="text-[#F0822D]">Olla</span>
              <span className="text-[#62B869]">Cercana</span>
            </span>
          </Link>

          {/* Location Selector Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF6F0] border border-stone-300/80 text-xs font-semibold text-stone-700 shadow-2xs">
            <div className="w-2 h-2 rounded-full bg-[#62B869] animate-pulse" />
            <MapPin className="w-3.5 h-3.5 text-[#F0822D]" />
            <span>Tu barrio: <strong>Chapinero Alto, Bogotá</strong></span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
          </div>

          {/* Quick Nav Links */}
          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-bold text-stone-700">
            <Link
              href="/menu"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-orange-50 hover:text-[#F0822D] border border-stone-200/70 transition-all"
            >
              <Utensils className="w-3.5 h-3.5 text-[#F0822D]" />
              <span>Ver Libretón</span>
            </Link>
            <Link
              href="/cuenta"
              className="flex items-center gap-1.5 hover:text-[#F0822D] transition-colors"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mi cuenta</span>
            </Link>
          </nav>
        </div>
      </header>

      {/* ── 2. OLLACERCANA CHALKBOARD BANNER STRIP (Compact Height) ── */}
      <section className="relative w-full border-b-4 border-[#3D2E24] shadow-xl overflow-hidden bg-[#1E1712]">
        {/* Fixed compact height container for the cropped chalkboard banner */}
        <div className="relative w-full h-28 sm:h-32 md:h-36">
          <Image
            src="/images/header_chalkboard_banner_adapted.jpg"
            alt="Tablero OllaCercana - Comida casera a un paso de tu puerta"
            fill
            priority
            className="object-cover object-center"
          />

          {/* Subtle bottom shadow transition to the sticky chalkboard filter bar */}
          <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#25282B]/60 to-transparent pointer-events-none" />

          {/* Vertically centered search bar with dark translucent backing */}
          <div className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-64 sm:w-72 md:w-80 max-w-[calc(100%-2rem)]">
            <div className="relative p-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-2xl">
              <Search className="w-4 h-4 text-orange-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar plato, cocinera o sazón..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-9 py-1.5 sm:py-2 rounded-full bg-black/40 focus:bg-white focus:text-stone-900 border border-white/10 text-xs text-white placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-[#F0822D] transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. CHALKBOARD FILTER TABS (Consistent with Libretón style) ── */}
      <div className="sticky top-[57px] z-30 bg-[#25282B] border-b-2 border-[#3D2E24] shadow-md px-4 md:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
          {/* Rounded Tab Bar Group */}
          <div className="flex items-center gap-1 sm:gap-2 p-1 bg-[#1A1C1E] border border-stone-700/60 rounded-full shadow-inner">
            {[
              { id: "todas" as FilterType, label: "Todas", icon: Layers, count: COOKS_DATA.length },
              { id: "500m" as FilterType, label: "A menos de 500 m", icon: Footprints, count: COOKS_DATA.filter(c => c.distanceMeters <= 500).length },
              { id: "1km" as FilterType, label: "A menos de 1 km", icon: Bike, count: COOKS_DATA.filter(c => c.distanceMeters <= 1000).length },
              { id: "abiertas" as FilterType, label: "Abiertas ahora", icon: Flame, count: COOKS_DATA.filter(c => c.isOpen).length },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveFilter(tab.id)}
                  className={`relative flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? "bg-[#2A2E33] text-white shadow-xs"
                      : "text-stone-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive
                        ? "text-[#F0822D]"
                        : tab.id === "abiertas"
                        ? "text-[#62B869]"
                        : "text-stone-400"
                    }`}
                  />
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                      isActive ? "bg-[#F0822D] text-white" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {tab.count}
                  </span>

                  {/* Active orange underline indicator */}
                  {isActive && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#F0822D] rounded-full shadow-[0_0_8px_#F0822D]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick status indicators on desktop */}
          <div className="hidden lg:flex items-center gap-4 text-xs text-stone-300 shrink-0">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#62B869] shadow-[0_0_8px_#62B869]" />
              <span className="text-[11px] font-medium text-stone-300">Cocinando ahora</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-500" />
              <span className="text-[11px] font-medium text-stone-400">Cerrada</span>
            </div>
            <div className="h-4 w-px bg-stone-700" />
            <div className="flex items-center gap-1.5 text-[11px] text-stone-400">
              <Compass className="w-3.5 h-3.5 text-[#F0822D]" />
              <span>Anillos tiza 500 m y 1 km</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. MAIN INTERACTIVE MAP & DETAILS SECTION ── */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 w-full flex-1 flex flex-col gap-8 relative z-10">
        {/* MAP CONTAINER (Framed Illustrated Canvas against Sunlit Kitchen Background) */}
        <section className="relative w-full rounded-3xl overflow-hidden bg-[#FAF6F0] border-4 border-[#4A3728] shadow-2xl">
          {/* Paper Texture Overlay */}
          <div
            className="absolute inset-0 pointer-events-none opacity-40 mix-blend-multiply"
            style={{
              backgroundImage:
                "radial-gradient(#C4B5A5 0.75px, transparent 0.75px), radial-gradient(#C4B5A5 0.75px, #FAF6F0 0.75px)",
              backgroundSize: "24px 24px",
              backgroundPosition: "0 0, 12px 12px",
            }}
          />

          {/* Top Floating Map Controls & Info Bar */}
          <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
            {/* Title / Compass pill */}
            <div className="pointer-events-auto bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-stone-300/80 shadow-md flex items-center gap-2 text-xs font-bold text-stone-800">
              <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center text-[#F0822D]">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span>Plano Ilustrado de Vecindad</span>
              <span className="text-stone-400">·</span>
              <span className="text-stone-500 font-normal hidden sm:inline">
                {filteredCooks.length} cocinas en esta vista
              </span>
            </div>

            {/* Hint Badge */}
            <div className="pointer-events-auto bg-[#1C1F22]/90 text-stone-200 px-3 py-1.5 rounded-full text-xs font-medium border border-stone-700/80 shadow-md hidden sm:flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F0822D]" />
              <span>Haz clic en un fogón para ver el plato</span>
            </div>
          </div>

          {/* ILLUSTRATED SVG MAP VIEW */}
          <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] md:aspect-[21/10] max-h-[580px] overflow-hidden select-none">
            <svg
              viewBox="0 0 1000 650"
              className="w-full h-full object-cover"
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                {/* Soft glow for active pins */}
                <filter id="glowGreen" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
                <filter id="glowOrange" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="4" result="blur" />
                  <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
              </defs>

              {/* ── GEOGRAPHICALLY COHERENT CARTOGRAPHIC MAP BACKGROUND ── */}
              <g className="streets-and-parks">
                <defs>
                  {/* Dedicated text path for the Canal del Arzobispo */}
                  <path
                    id="canalTextPath"
                    d="M 855 120 C 850 220, 860 330, 875 440 C 880 500, 875 560, 865 640"
                    fill="none"
                  />
                </defs>

                {/* 1. Base Map Ground (Warm Cartographic Block Canvas) */}
                <rect width="1000" height="650" fill="#EAE4D9" />

                {/* 2. Continuous Waterway Corridor: Linear Green Embankment (Ronda del Canal) */}
                {/* A coherent linear parkway flanking the canal along the eastern sector from edge to edge */}
                <path
                  d="M 830 -20 C 815 110, 820 220, 835 320 C 850 420, 855 520, 840 670 L 910 670 C 925 520, 920 420, 905 320 C 890 220, 885 110, 900 -20 Z"
                  fill="#CFE5BD"
                  stroke="#BCD9A5"
                  strokeWidth="1.5"
                />

                {/* Trees along the canal linear park */}
                {[
                  { cx: 835, cy: 50 },
                  { cx: 830, cy: 130 },
                  { cx: 835, cy: 260 },
                  { cx: 840, cy: 390 },
                  { cx: 845, cy: 450 },
                  { cx: 835, cy: 580 },
                  { cx: 900, cy: 40 },
                  { cx: 905, cy: 150 },
                  { cx: 900, cy: 270 },
                  { cx: 910, cy: 410 },
                  { cx: 905, cy: 530 },
                  { cx: 900, cy: 620 },
                ].map((tree, idx) => (
                  <circle
                    key={`canal-tree-${idx}`}
                    cx={tree.cx}
                    cy={tree.cy}
                    r="6"
                    fill="#A8CE8E"
                    stroke="#8DBA70"
                    strokeWidth="1"
                    opacity="0.8"
                  />
                ))}

                {/* 3. The Continuous Waterway: Canal del Arzobispo */}
                {/* Flows smoothly from top edge to bottom edge without interruptions */}
                <path
                  d="M 865 -20 C 850 110, 855 220, 870 320 C 885 420, 890 520, 875 670"
                  fill="none"
                  stroke="#70B5C6"
                  strokeWidth="20"
                  strokeLinecap="butt"
                />
                {/* Inner river flow highlight */}
                <path
                  d="M 865 -20 C 850 110, 855 220, 870 320 C 885 420, 890 520, 875 670"
                  fill="none"
                  stroke="#95D1DF"
                  strokeWidth="5"
                  strokeLinecap="round"
                  opacity="0.9"
                />

                {/* 4. Well-Defined City Parks (Strictly contained within city blocks) */}
                {/* Park A: Parque de los Hippies / Sucre (Northwest block between Calle 68 & Calle 67, Cra 9na & Cra 7ma) */}
                <rect
                  x="160"
                  y="92"
                  width="308"
                  height="86"
                  rx="6"
                  fill="#CFE5BD"
                  stroke="#BCD9A5"
                  strokeWidth="1.5"
                />
                {/* Walking path & trees inside Park A */}
                <path
                  d="M 160 135 Q 314 125, 468 135"
                  fill="none"
                  stroke="#FAF8F3"
                  strokeWidth="3"
                  strokeDasharray="4 3"
                />
                <circle cx="210" cy="115" r="7" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="270" cy="155" r="8" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="340" cy="115" r="7" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="410" cy="155" r="8" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />

                {/* Park B: Parque Vecinal Calle 60 (Southwest block between Calle 60 & Calle 58, Cra 9na & Cra 7ma) */}
                <rect
                  x="160"
                  y="502"
                  width="308"
                  height="56"
                  rx="6"
                  fill="#CFE5BD"
                  stroke="#BCD9A5"
                  strokeWidth="1.5"
                />
                <circle cx="220" cy="530" r="7" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="310" cy="530" r="8" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="400" cy="530" r="7" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />

                {/* Park C: Parque de la Merced (East block between Calle 67 & Calle 64, Cra 4ta & Cra 2da Este) */}
                <rect
                  x="652"
                  y="202"
                  width="106"
                  height="126"
                  rx="6"
                  fill="#D4E7C4"
                  stroke="#BCD9A5"
                  strokeWidth="1.5"
                />
                <ellipse cx="705" cy="265" rx="16" ry="12" fill="#E2EED7" stroke="#A8CE8E" strokeWidth="1" />
                <circle cx="680" cy="235" r="6" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />
                <circle cx="730" cy="295" r="6" fill="#A8CE8E" stroke="#8DBA70" strokeWidth="1" />

                {/* 5. Building Footprints & Parcel Subdivisions within Urban Blocks */}
                <g fill="#DFD8CB" stroke="#D3CCC0" strokeWidth="1" rx="1">
                  {/* Block (Cra 9 - Cra 7, Calle 67 - Calle 65) */}
                  <rect x="165" y="195" width="40" height="24" />
                  <rect x="215" y="195" width="45" height="24" />
                  <rect x="270" y="195" width="50" height="24" />
                  <rect x="330" y="195" width="45" height="24" />
                  <rect x="385" y="195" width="40" height="24" />
                  <rect x="435" y="195" width="30" height="24" />

                  {/* Block (Cra 9 - Cra 7, Calle 65 - Calle 64) */}
                  <rect x="165" y="285" width="45" height="26" />
                  <rect x="220" y="285" width="45" height="26" />
                  <rect x="275" y="285" width="40" height="26" />
                  <rect x="325" y="285" width="45" height="26" />
                  <rect x="380" y="285" width="40" height="26" />
                  <rect x="430" y="285" width="35" height="26" />

                  {/* Block (Cra 9 - Cra 7, Calle 64 - Calle 62) */}
                  <rect x="165" y="355" width="45" height="24" />
                  <rect x="220" y="355" width="40" height="24" />
                  <rect x="270" y="355" width="45" height="24" />
                  <rect x="325" y="355" width="45" height="24" />
                  <rect x="380" y="355" width="40" height="24" />
                  <rect x="430" y="355" width="35" height="24" />

                  {/* Block (Cra 9 - Cra 7, Calle 62 - Calle 60) */}
                  <rect x="165" y="435" width="40" height="24" />
                  <rect x="215" y="435" width="45" height="24" />
                  <rect x="270" y="435" width="40" height="24" />
                  <rect x="320" y="435" width="45" height="24" />
                  <rect x="375" y="435" width="45" height="24" />
                  <rect x="430" y="435" width="35" height="24" />

                  {/* Block (Cra 7 - Cra 4ta, Calle 69 - Calle 67) */}
                  <rect x="495" y="95" width="45" height="28" />
                  <rect x="550" y="95" width="40" height="28" />
                  <rect x="600" y="95" width="40" height="28" />
                  <rect x="495" y="135" width="40" height="26" />
                  <rect x="545" y="135" width="45" height="26" />
                  <rect x="600" y="135" width="40" height="26" />

                  {/* Block (Cra 7 - Cra 4ta, Calle 67 - Calle 64) */}
                  <rect x="495" y="200" width="45" height="28" />
                  <rect x="550" y="200" width="40" height="28" />
                  <rect x="600" y="200" width="40" height="28" />
                  <rect x="495" y="275" width="40" height="28" />
                  <rect x="545" y="275" width="45" height="28" />
                  <rect x="600" y="275" width="40" height="28" />

                  {/* Block (Cra 7 - Cra 4ta, Calle 64 - Calle 60) */}
                  <rect x="495" y="355" width="45" height="28" />
                  <rect x="550" y="355" width="40" height="28" />
                  <rect x="600" y="355" width="40" height="28" />
                  <rect x="495" y="430" width="40" height="28" />
                  <rect x="545" y="430" width="45" height="28" />
                  <rect x="600" y="430" width="40" height="28" />

                  {/* Block (Cra 7 - Cra 4ta, Calle 60 - Calle 58) */}
                  <rect x="495" y="505" width="45" height="24" />
                  <rect x="550" y="505" width="40" height="24" />
                  <rect x="600" y="505" width="40" height="24" />

                  {/* East Blocks (Cra 4ta - Cra 2da Este, Calle 69 - Calle 67) */}
                  <rect x="655" y="95" width="45" height="28" />
                  <rect x="710" y="95" width="45" height="28" />

                  {/* East Blocks (Cra 4ta - Cra 2da Este, Calle 64 - Calle 60) */}
                  <rect x="655" y="355" width="45" height="28" />
                  <rect x="710" y="355" width="45" height="28" />
                  <rect x="655" y="430" width="45" height="28" />
                  <rect x="710" y="430" width="45" height="28" />

                  {/* Far East Blocks (Beyond Canal: Cra 1ra Este) */}
                  <rect x="925" y="95" width="55" height="28" />
                  <rect x="925" y="200" width="55" height="30" />
                  <rect x="925" y="275" width="55" height="30" />
                  <rect x="925" y="355" width="55" height="30" />
                  <rect x="925" y="430" width="55" height="30" />
                  <rect x="925" y="505" width="55" height="28" />

                  {/* Far West Blocks (West of Cra 9na) */}
                  <rect x="35" y="95" width="55" height="28" />
                  <rect x="35" y="195" width="55" height="26" />
                  <rect x="35" y="285" width="55" height="26" />
                  <rect x="35" y="355" width="55" height="26" />
                  <rect x="35" y="435" width="55" height="26" />
                  <rect x="35" y="505" width="55" height="26" />
                </g>

                {/* 6. Coherent, Fully-Connected Road Network */}
                {/* Street Casings (Soft grey outlines) */}
                <g fill="none" stroke="#D5CEC0" strokeLinecap="round" strokeLinejoin="round">
                  {/* Horizontal Calles */}
                  <line x1="-20" y1="80" x2="1020" y2="80" strokeWidth="18" />
                  <line x1="-20" y1="180" x2="1020" y2="180" strokeWidth="24" /> {/* Calle 67 */}
                  <line x1="-20" y1="260" x2="1020" y2="260" strokeWidth="18" />
                  <line x1="-20" y1="340" x2="1020" y2="340" strokeWidth="26" /> {/* Calle 64 */}
                  <line x1="-20" y1="415" x2="1020" y2="415" strokeWidth="18" />
                  <line x1="-20" y1="490" x2="1020" y2="490" strokeWidth="24" /> {/* Calle 60 */}
                  <line x1="-20" y1="565" x2="1020" y2="565" strokeWidth="18" />

                  {/* Vertical Carreras */}
                  <line x1="140" y1="-20" x2="140" y2="670" strokeWidth="20" /> {/* Cra 9na */}
                  <line x1="480" y1="-20" x2="480" y2="670" strokeWidth="30" /> {/* Cra 7ma (Arterial) */}
                  <line x1="640" y1="-20" x2="640" y2="670" strokeWidth="20" /> {/* Cra 4ta */}
                  <line x1="770" y1="-20" x2="770" y2="670" strokeWidth="20" /> {/* Cra 2da Este */}
                  <line x1="915" y1="-20" x2="915" y2="670" strokeWidth="20" /> {/* Cra 1ra Este */}

                  {/* Diagonal Avenue (Transversal / Diagonal 62) */}
                  <path d="M -20 590 L 1020 200" strokeWidth="28" />
                </g>

                {/* Street Fills (Pure clean white cores) */}
                <g fill="none" stroke="#FFFFFF" strokeLinecap="round" strokeLinejoin="round">
                  {/* Horizontal Calles */}
                  <line x1="-20" y1="80" x2="1020" y2="80" strokeWidth="14" />
                  <line x1="-20" y1="180" x2="1020" y2="180" strokeWidth="18" /> {/* Calle 67 */}
                  <line x1="-20" y1="260" x2="1020" y2="260" strokeWidth="14" />
                  <line x1="-20" y1="340" x2="1020" y2="340" strokeWidth="20" /> {/* Calle 64 */}
                  <line x1="-20" y1="415" x2="1020" y2="415" strokeWidth="14" />
                  <line x1="-20" y1="490" x2="1020" y2="490" strokeWidth="18" /> {/* Calle 60 */}
                  <line x1="-20" y1="565" x2="1020" y2="565" strokeWidth="14" />

                  {/* Vertical Carreras */}
                  <line x1="140" y1="-20" x2="140" y2="670" strokeWidth="14" /> {/* Cra 9na */}
                  <line x1="480" y1="-20" x2="480" y2="670" strokeWidth="24" /> {/* Cra 7ma */}
                  <line x1="640" y1="-20" x2="640" y2="670" strokeWidth="14" /> {/* Cra 4ta */}
                  <line x1="770" y1="-20" x2="770" y2="670" strokeWidth="14" /> {/* Cra 2da Este */}
                  <line x1="915" y1="-20" x2="915" y2="670" strokeWidth="14" /> {/* Cra 1ra Este */}

                  {/* Diagonal Avenue */}
                  <path d="M -20 590 L 1020 200" strokeWidth="22" />
                </g>

                {/* Carrera 7ma Center Lane Marking */}
                <line
                  x1="480"
                  y1="-20"
                  x2="480"
                  y2="670"
                  stroke="#E2DCD0"
                  strokeWidth="1.5"
                  strokeDasharray="6 6"
                />

                {/* 7. Bridge Crossings over Canal del Arzobispo */}
                {/* Where Calle 67, Calle 64, Calle 60 and Diagonal cross the canal, bridges span the water */}
                {[
                  { y: 80, h: 14, x: 865 },
                  { y: 180, h: 18, x: 855 },
                  { y: 260, h: 14, x: 860 },
                  { y: 340, h: 20, x: 872 },
                  { y: 415, h: 14, x: 885 },
                  { y: 490, h: 18, x: 885 },
                  { y: 565, h: 14, x: 875 },
                ].map((b, idx) => (
                  <g key={`bridge-${idx}`}>
                    {/* Bridge Pavement */}
                    <rect
                      x={b.x - 18}
                      y={b.y - b.h / 2}
                      width="36"
                      height={b.h}
                      fill="#FFFFFF"
                      stroke="#C8C0B2"
                      strokeWidth="1"
                    />
                    {/* Bridge Parapet Rails */}
                    <line
                      x1={b.x - 18}
                      y1={b.y - b.h / 2}
                      x2={b.x + 18}
                      y2={b.y - b.h / 2}
                      stroke="#8C7F70"
                      strokeWidth="2"
                    />
                    <line
                      x1={b.x - 18}
                      y1={b.y + b.h / 2}
                      x2={b.x + 18}
                      y2={b.y + b.h / 2}
                      stroke="#8C7F70"
                      strokeWidth="2"
                    />
                  </g>
                ))}

                {/* Diagonal Avenue Bridge */}
                <g>
                  <rect
                    x="845"
                    y="255"
                    width="40"
                    height="22"
                    fill="#FFFFFF"
                    stroke="#C8C0B2"
                    strokeWidth="1"
                    transform="rotate(-20.5 865 266)"
                  />
                  <line
                    x1="845"
                    y1="255"
                    x2="885"
                    y2="255"
                    stroke="#8C7F70"
                    strokeWidth="2.5"
                    transform="rotate(-20.5 865 266)"
                  />
                  <line
                    x1="845"
                    y1="277"
                    x2="885"
                    y2="277"
                    stroke="#8C7F70"
                    strokeWidth="2.5"
                    transform="rotate(-20.5 865 266)"
                  />
                </g>

                {/* 8. Geographic Street & Waterway Labels */}
                {/* Canal del Arzobispo Running Along its Course */}
                <text
                  fill="#448A9C"
                  fontSize="10"
                  fontWeight="700"
                  fontFamily="Outfit, sans-serif"
                  letterSpacing="2.5"
                  opacity="0.9"
                  paintOrder="stroke"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                >
                  <textPath href="#canalTextPath" startOffset="38%" textAnchor="middle">
                    CANAL DEL ARZOBISPO 〰
                  </textPath>
                </text>

                {/* Street Name Labels with protective clean halos */}
                <g
                  fill="#756A5C"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="Outfit, sans-serif"
                  letterSpacing="0.4"
                  paintOrder="stroke"
                  stroke="#FFFFFF"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <text x="495" y="45">
                    CARRERA 7ma (Eje principal)
                  </text>
                  <text x="655" y="55">
                    CARRERA 4ta
                  </text>
                  <text x="785" y="55">
                    CARRERA 2da ESTE
                  </text>
                  <text x="50" y="174">
                    CALLE 67 (Camino al parque)
                  </text>
                  <text x="50" y="334">
                    CALLE 64 (La esquina del pan caliente)
                  </text>
                  <text x="50" y="484">
                    CALLE 60
                  </text>
                </g>
              </g>

              {/* ── CONCENTRIC PROXIMITY RINGS (500m & 1000m around user) ── */}
              {/* Center of User Location is fixed at (500, 350) */}
              <g className="proximity-rings">
                {/* 500m Soft Distance Ring (~170px radius) */}
                <circle
                  cx="500"
                  cy="350"
                  r="170"
                  fill="#F0822D"
                  fillOpacity="0.04"
                  stroke="#F0822D"
                  strokeWidth="2"
                  strokeDasharray="6 6"
                  className="transition-all"
                />
                {/* 500m Distance Chalk Tag */}
                <g transform="translate(500, 175)">
                  <rect
                    x="-42"
                    y="-11"
                    width="84"
                    height="20"
                    rx="10"
                    fill="#FFF7ED"
                    stroke="#F0822D"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#C84B31"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                  >
                    Radio 500 m
                  </text>
                </g>

                {/* 1 km Soft Distance Ring (~310px radius) */}
                <circle
                  cx="500"
                  cy="350"
                  r="310"
                  fill="#62B869"
                  fillOpacity="0.02"
                  stroke="#62B869"
                  strokeWidth="2"
                  strokeDasharray="8 8"
                  className="transition-all"
                />
                {/* 1km Distance Chalk Tag */}
                <g transform="translate(500, 34)">
                  <rect
                    x="-40"
                    y="-11"
                    width="80"
                    height="20"
                    rx="10"
                    fill="#F0FDF4"
                    stroke="#62B869"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="3"
                    textAnchor="middle"
                    fill="#2B7A38"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                  >
                    Radio 1 km
                  </text>
                </g>
              </g>

              {/* ── USER POSITION MARKER (Tu ubicación) ── */}
              <g transform="translate(500, 350)" className="user-location-marker z-20">
                {/* Radar ping animation waves */}
                <circle cx="0" cy="0" r="28" fill="#F0822D" fillOpacity="0.15">
                  <animate
                    attributeName="r"
                    values="14;34;14"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="fill-opacity"
                    values="0.25;0;0.25"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>

                {/* User Pin Core */}
                <circle cx="0" cy="0" r="14" fill="#F0822D" stroke="#FFFFFF" strokeWidth="3" />
                <circle cx="0" cy="0" r="5" fill="#FFFFFF" />

                {/* User Location Label Banner */}
                <g transform="translate(0, 30)">
                  <rect
                    x="-48"
                    y="-10"
                    width="96"
                    height="22"
                    rx="11"
                    fill="#1A1C1E"
                    stroke="#F0822D"
                    strokeWidth="1.5"
                  />
                  <text
                    x="0"
                    y="4"
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="Outfit, sans-serif"
                  >
                    📍 Tu ubicación
                  </text>
                </g>
              </g>

              {/* ── COOK PINS: STEAMING POT MARKERS ── */}
              {COOKS_DATA.map((cook) => {
                const isFilteredIn = filteredCooks.some((c) => c.id === cook.id);
                const isSelected = selectedCook?.id === cook.id;
                const isHovered = hoveredCookId === cook.id;
                const { x, y } = cook.mapCoords;

                if (!isFilteredIn) {
                  return (
                    <g
                      key={`pin-${cook.id}`}
                      transform={`translate(${x}, ${y})`}
                      className="opacity-20 pointer-events-none transition-all duration-300"
                    >
                      <circle cx="0" cy="0" r="12" fill="#D1D5DB" />
                    </g>
                  );
                }

                return (
                  <g
                    key={`pin-${cook.id}`}
                    transform={`translate(${x}, ${y})`}
                    className="cursor-pointer group transition-transform duration-200"
                    onClick={() => handleSelectCook(cook, true)}
                    onMouseEnter={() => setHoveredCookId(cook.id)}
                    onMouseLeave={() => setHoveredCookId(null)}
                    style={{
                      transformOrigin: `${x}px ${y}px`,
                      filter: isSelected ? "url(#glowOrange)" : "none",
                    }}
                  >
                    {/* Pulse wave around pin if cook is open */}
                    {cook.isOpen && (
                      <circle cx="0" cy="-6" r="22" fill="#62B869" fillOpacity="0.2">
                        <animate
                          attributeName="r"
                          values="16;30;16"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="fill-opacity"
                          values="0.3;0;0.3"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    )}

                    {/* Shadow underneath the pot */}
                    <ellipse cx="0" cy="18" rx="16" ry="6" fill="#4A3728" fillOpacity="0.2" />

                    {/* Pin Backdrop Container */}
                    <rect
                      x="-22"
                      y="-30"
                      width="44"
                      height="44"
                      rx="22"
                      fill={isSelected ? "#FFF7ED" : "#FFFFFF"}
                      stroke={isSelected ? "#F0822D" : cook.isOpen ? "#62B869" : "#9CA3AF"}
                      strokeWidth={isSelected ? "3.5" : "2"}
                      className="transition-colors shadow-lg"
                    />

                    {/* ── STEAMING POT ILLUSTRATED ICON ── */}
                    <g transform="translate(-16, -24) scale(0.5)">
                      {/* Pot Body */}
                      <path
                        d="M16 28h32v20a8 8 0 0 1-8 8H24a8 8 0 0 1-8-8V28z"
                        fill={cook.isOpen ? "#F0822D" : "#9CA3AF"}
                        stroke="#2C241E"
                        strokeWidth="2.5"
                      />
                      {/* Pot Rim */}
                      <path d="M12 28h40" stroke="#2C241E" strokeWidth="3" strokeLinecap="round" />
                      {/* Pot Handles */}
                      <path d="M8 32h8M48 32h8" stroke="#2C241E" strokeWidth="2.5" strokeLinecap="round" />

                      {/* Animated Steam Lines (active only if open) */}
                      {cook.isOpen ? (
                        <g>
                          <path
                            d="M24 20c2-3 0-6 2-9"
                            stroke="#E09F3E"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                          >
                            <animate
                              attributeName="d"
                              values="M24 20c2-3 0-6 2-9; M24 18c0-3 2-6 0-9; M24 20c2-3 0-6 2-9"
                              dur="1.8s"
                              repeatCount="indefinite"
                            />
                          </path>
                          <path
                            d="M32 20c-1-3 1-6 -1-9"
                            stroke="#E09F3E"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                          >
                            <animate
                              attributeName="d"
                              values="M32 20c-1-3 1-6 -1-9; M32 18c1-3 -1-6 1-9; M32 20c-1-3 1-6 -1-9"
                              dur="1.5s"
                              repeatCount="indefinite"
                            />
                          </path>
                          <path
                            d="M40 20c2-3 0-6 2-9"
                            stroke="#E09F3E"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                          >
                            <animate
                              attributeName="d"
                              values="M40 20c2-3 0-6 2-9; M40 18c0-3 2-6 0-9; M40 20c2-3 0-6 2-9"
                              dur="2s"
                              repeatCount="indefinite"
                            />
                          </path>
                        </g>
                      ) : (
                        <path d="M28 20l8 -8" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
                      )}
                    </g>

                    {/* Status Dot on Pin: Green (cooking now) or Gray (closed) */}
                    <circle
                      cx="14"
                      cy="-20"
                      r="5.5"
                      fill={cook.isOpen ? "#62B869" : "#6B7280"}
                      stroke="#FFFFFF"
                      strokeWidth="2"
                    />

                    {/* Cook Name Banner Tag */}
                    <g
                      transform="translate(0, 24)"
                      className={`transition-all duration-200 ${
                        isSelected || isHovered ? "opacity-100 scale-105" : "opacity-90"
                      }`}
                    >
                      <rect
                        x="-48"
                        y="-7"
                        width="96"
                        height="18"
                        rx="9"
                        fill={isSelected ? "#F0822D" : "#1E2022"}
                        stroke="#FFFFFF"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="5"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9.5"
                        fontWeight="bold"
                        fontFamily="Outfit, sans-serif"
                      >
                        {cook.name} ({cook.distanceText})
                      </text>
                    </g>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Bottom Interactive Legend / Status Helper inside Map */}
          <div className="bg-[#FAF4EB] border-t-2 border-[#E5DECF] px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-stone-700">
              <span className="font-semibold">Centro:</span>
              <span className="inline-flex items-center gap-1 text-stone-600 bg-stone-200/60 px-2 py-0.5 rounded-full font-medium text-[11px]">
                📍 Tu ubicación actual
              </span>
              <span className="text-stone-400">|</span>
              <span className="text-stone-600">
                Pines organizados por distancia real aproximada
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setActiveFilter("todas");
                  setSelectedCook(COOKS_DATA[0]);
                }}
                className="text-[11px] font-bold text-[#F0822D] hover:underline"
              >
                Restablecer vista
              </button>
            </div>
          </div>
        </section>

        {/* ── 5. COOK LIST & PROMINENT FEATURED TICKET CARD ── */}
        <section className="space-y-6">
          <div className="bg-[#FAF7F2]/95 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-stone-300/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-[#2C241E] flex items-center gap-2">
                <span>Fogones activos en tu radio</span>
                <span className="text-sm font-sans font-bold px-2.5 py-0.5 rounded-full bg-orange-100 text-[#F0822D] border border-orange-200">
                  {filteredCooks.length} disponibles
                </span>
              </h2>
              <p className="text-xs text-stone-600 font-normal mt-0.5">
                Selecciona una cocinera para abrir su ficha completa o pedir desde su Libretón.
              </p>
            </div>

            <Link
              href="/menu"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#F0822D] hover:text-orange-700 transition-colors group bg-white/90 px-4 py-2.5 rounded-full border border-orange-200 shadow-2xs shrink-0"
            >
              <span>Explorar el Libretón completo</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCooks.map((cook) => {
              const isSelected = selectedCook?.id === cook.id;

              return (
                <div
                  key={cook.id}
                  onClick={() => handleSelectCook(cook, true)}
                  className={`cursor-pointer rounded-3xl border transition-all duration-200 overflow-hidden flex flex-col justify-between group shadow-sm hover:shadow-xl ${
                    isSelected
                      ? "ring-2 ring-[#F0822D] border-[#F0822D] bg-white scale-[1.01]"
                      : "border-stone-300/90 bg-white hover:border-[#F0822D]/60"
                  }`}
                >
                  {/* Chalkboard Upper Card Header */}
                  <div className="relative bg-[#1A1C1E] border-b-4 border-[#3D2E24] p-4 text-white flex flex-col justify-between min-h-[160px] overflow-hidden">
                    {/* Hanging rope loop doodles */}
                    <div className="absolute top-1 left-4 w-2 h-2 rounded-full bg-stone-500 border border-stone-800" />
                    <div className="absolute top-1 right-4 w-2 h-2 rounded-full bg-stone-500 border border-stone-800" />

                    {/* Top Row: Distance & Live Badge */}
                    <div className="flex items-center justify-between gap-2 z-10">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[11px] font-semibold text-stone-200 border border-white/15">
                        <MapPin className="w-3 h-3 text-[#F0822D]" />
                        {cook.distanceText}
                      </span>

                      {cook.isOpen ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#62B869]/20 text-[#62B869] text-[11px] font-bold border border-[#62B869]/40">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#62B869] animate-ping" />
                          Cocinando ahora
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stone-800 text-stone-400 text-[11px] font-medium border border-stone-700">
                          Cerrada hoy
                        </span>
                      )}
                    </div>

                    {/* Dish Name & Price */}
                    <div className="my-2 z-10">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#F0822D]">
                        Plato estrella de hoy:
                      </span>
                      <h3 className="font-['Playfair_Display',serif] text-xl font-bold leading-snug group-hover:text-[#F0822D] transition-colors">
                        {cook.featuredDish.name}
                      </h3>
                      <div className="text-lg font-extrabold text-[#62B869] font-mono mt-0.5">
                        {cook.featuredDish.formattedPrice}
                      </div>
                    </div>

                    {/* Dish Preview Thumbnail */}
                    <div className="flex items-center justify-between text-xs text-stone-400 border-t border-stone-800/80 pt-2">
                      <span className="flex items-center gap-1 text-amber-300 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {cook.rating}{" "}
                        <span className="text-stone-400 font-normal">({cook.reviews})</span>
                      </span>
                      <span className="text-[11px] text-stone-300 group-hover:text-white transition-colors flex items-center gap-1">
                        Ver ficha <ChevronRight className="w-3 h-3 text-[#F0822D]" />
                      </span>
                    </div>
                  </div>

                  {/* Lower Card Section: Cook Profile & Handwritten Note */}
                  <div className="p-4 bg-[#FAF7F2] flex-1 flex flex-col justify-between gap-3">
                    {/* Cook Info */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full overflow-hidden relative border-2 border-[#E5DECF] shrink-0 shadow-xs">
                        <Image
                          src={cook.avatar}
                          alt={cook.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-stone-900 leading-tight">
                          {cook.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">
                          {cook.streetAddress}
                        </div>
                      </div>
                    </div>

                    {/* Handwritten Bio Note */}
                    <p className="font-['Caveat',cursive] text-lg sm:text-xl text-stone-700 leading-snug bg-white/70 p-2.5 rounded-xl border border-stone-200/80 italic shadow-2xs">
                      {cook.handwrittenBio}
                    </p>

                    {/* Action button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectCook(cook, true);
                      }}
                      className="w-full py-2.5 px-4 rounded-full bg-stone-900 hover:bg-[#F0822D] text-white font-bold text-xs tracking-wide transition-all shadow-xs flex items-center justify-center gap-2 group-hover:bg-[#F0822D]"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ver plato y pedir en Libretón</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredCooks.length === 0 && (
            <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-stone-300 p-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-orange-100 text-[#F0822D] flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="font-['Playfair_Display',serif] text-2xl font-bold text-stone-800">
                No encontramos fogones con ese filtro
              </h3>
              <p className="text-sm text-stone-500 max-w-md mx-auto">
                Prueba ampliando el radio a 1 km o seleccionando &ldquo;Todas las cocineras&rdquo; para ver la vecindad entera.
              </p>
              <button
                onClick={() => {
                  setActiveFilter("todas");
                  setSearchQuery("");
                }}
                className="px-6 py-2.5 rounded-full bg-[#F0822D] text-white text-xs font-bold shadow-md hover:bg-orange-600 transition-all"
              >
                Ver todas las cocineras
              </button>
            </div>
          )}
        </section>
      </main>

      {/* ── 6. DETAIL MODAL / POPUP (CHALKBOARD TICKET LOOK) ── */}
      {isModalOpen && selectedCook && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-xl bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-[#3D2E24] my-8 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all shadow-md"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5" />
            </button>

            {/* UPPER CHALKBOARD TICKET HEADER */}
            <div className="relative bg-[#1A1C1E] border-b-4 border-[#3D2E24] p-6 text-white overflow-hidden">
              {/* Hanging Rope loops */}
              <div className="absolute top-2 left-8 w-3 h-3 rounded-full bg-stone-400 border border-stone-700" />
              <div className="absolute top-2 right-16 w-3 h-3 rounded-full bg-stone-400 border border-stone-700" />

              {/* Status & Distance header */}
              <div className="flex items-center gap-2 mb-3">
                {selectedCook.isOpen ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#62B869]/20 text-[#62B869] text-xs font-bold border border-[#62B869]/40">
                    <span className="w-2 h-2 rounded-full bg-[#62B869] animate-ping" />
                    Cocinando ahora
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-stone-800 text-stone-300 text-xs font-medium border border-stone-700">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedCook.statusNote}
                  </span>
                )}

                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-stone-200 text-xs font-semibold">
                  <MapPin className="w-3 h-3 text-[#F0822D]" />
                  {selectedCook.distanceText} de tu casa
                </span>
              </div>

              {/* Dish Title */}
              <h2 className="font-['Playfair_Display',serif] text-2xl sm:text-3xl font-bold text-stone-100 pr-8">
                {selectedCook.featuredDish.name}
              </h2>

              {/* Price and Badge */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-800">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-extrabold text-[#62B869] font-mono">
                    {selectedCook.featuredDish.formattedPrice}
                  </span>
                  <span className="text-xs text-stone-400">por porción completa</span>
                </div>

                {selectedCook.featuredDish.badge && (
                  <span className="px-3 py-1 rounded-full bg-orange-500/20 text-[#F0822D] border border-[#F0822D]/40 text-xs font-bold font-['Caveat',cursive] text-base">
                    {selectedCook.featuredDish.badge}
                  </span>
                )}
              </div>
            </div>

            {/* DISH PHOTO & COOK BIO SECTION */}
            <div className="p-6 bg-[#FAF7F2] space-y-5">
              {/* Photo of Featured Dish */}
              <div className="relative w-full h-52 sm:h-64 rounded-2xl overflow-hidden border-2 border-[#E5DECF] shadow-inner">
                <Image
                  src={selectedCook.featuredDish.image}
                  alt={selectedCook.featuredDish.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white text-xs px-3 py-1 rounded-full flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#F0822D]" />
                  <span>Foto real del plato de hoy</span>
                </div>
              </div>

              {/* Dish Description */}
              <p className="text-sm text-stone-700 leading-relaxed">
                {selectedCook.featuredDish.description}
              </p>

              {/* Cook Profile Box */}
              <div className="bg-white rounded-2xl p-4 border border-stone-300/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-[#F0822D] shadow-xs">
                      <Image
                        src={selectedCook.avatar}
                        alt={selectedCook.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 text-base leading-tight">
                        {selectedCook.name}
                      </h4>
                      <p className="text-xs text-stone-500">{selectedCook.streetAddress}</p>
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-1 text-xs font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full text-amber-800">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{selectedCook.rating}</span>
                    <span className="text-amber-600 font-normal">({selectedCook.reviews})</span>
                  </div>
                </div>

                {/* Handwritten Cook's Personal Note */}
                <div className="bg-[#FFFDF9] border-l-4 border-[#F0822D] p-3 rounded-r-xl">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#F0822D] block mb-0.5">
                    Nota de la cocinera:
                  </span>
                  <p className="font-['Caveat',cursive] text-xl text-stone-800 leading-snug">
                    {selectedCook.handwrittenBio}
                  </p>
                </div>
              </div>

              {/* ACTIONS: Link to Libretón / Menu */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <Link
                  href="/menu"
                  className="flex-1 py-3.5 px-6 rounded-full bg-[#F0822D] hover:bg-orange-600 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 text-center"
                >
                  <span>Ver su Libretón y pedir →</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="py-3.5 px-6 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-sm transition-all"
                >
                  Seguir explorando
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── 7. FOOTER ── */}
      <footer className="mt-auto bg-[#1C1F22] border-t-4 border-[#3D2E24] text-stone-400 text-xs py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-['Outfit',sans-serif] font-extrabold text-xl tracking-tight text-white">
              <span className="text-[#F0822D]">Olla</span>
              <span className="text-[#62B869]">Cercana</span>
            </span>
            <span className="text-stone-500">·</span>
            <span>Comida casera de vecinas cerca de ti</span>
          </div>

          <div className="flex items-center gap-4 text-stone-300">
            <Link href="/" className="hover:text-white transition-colors">
              Inicio
            </Link>
            <Link href="/menu" className="hover:text-white transition-colors">
              Libretón de Menú
            </Link>
            <Link href="/cuenta" className="hover:text-white transition-colors">
              Mi Cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
