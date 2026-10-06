"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import AdminModerationSection from "@/components/modals/AdminModerationSection";
import { getStoredNotifications } from "@/lib/ollacercana-store";
import { HelpCircle, Home } from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  phoneVerified?: boolean;
  role: "comprador" | "cocinera" | "admin";
  commercialName?: string;
  bio?: string;
  residentialComplex?: string;
  paymentMethods: string[];
  isLoggedIn: boolean;
  avatar?: string;
  kitchenPhoto?: string;
  isCocineraActive?: boolean;
  dataConsentAccepted?: boolean;
  isPaused?: boolean;
}

function homeForRole(role: UserProfile["role"]): string {
  if (role === "cocinera") return "/cuenta/cocina";
  if (role === "admin") return "/cuenta/admin";
  return "/menu";
}

export default function AdminPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const savedUserJson = localStorage.getItem("ollacercana_user");
    if (!savedUserJson) {
      router.push("/cuenta");
      return;
    }
    let parsed: UserProfile;
    try {
      parsed = JSON.parse(savedUserJson);
      if (!parsed.isLoggedIn) {
        router.push("/cuenta");
        return;
      }
    } catch (e) {
      console.error(e);
      router.push("/cuenta");
      return;
    }

    if (parsed.role !== "admin") {
      router.push(homeForRole(parsed.role));
      return;
    }

    setUser(parsed);

    try {
      setUnreadCount(getStoredNotifications().filter((n) => !n.read).length);
    } catch (e) {
      console.error(e);
    }

    setCheckingSession(false);
  }, [router]);

  if (checkingSession || !user) {
    return (
      <main className="relative min-h-screen w-full bg-[#14110f] flex items-center justify-center">
        <p className="text-stone-400 text-sm font-semibold">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#14110f] text-[#f4efe6] font-['Outfit',sans-serif] overflow-x-hidden flex flex-col justify-between selection:bg-[#F0822D] selection:text-white">
      <AnimatedKitchenBackground />

      <header className="relative z-10 w-full pt-10 pb-6 px-6 flex flex-col items-center justify-center text-center">
        <Link href="/" className="cursor-pointer group transition-transform hover:scale-105">
          <BrandLogo size="lg" showTagline={true} taglineColor="text-stone-200 drop-shadow-md" />
        </Link>
      </header>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-black/75 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-8 my-6">
          <AccountNav user={user} current="admin" unreadCount={unreadCount} />

          <div className="space-y-4 text-left">
            <AdminModerationSection currentUser={{ ...user, role: user.role }} />
          </div>
        </div>
      </div>

      <footer className="relative z-10 w-full px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4 text-[#F0822D]" />
          <span>Volver a OllaCercana</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-6 text-xs font-bold tracking-widest uppercase text-stone-300">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Centro de Ayuda OllaCercana: Soporte para cocineras y compradores vecinales.");
            }}
            className="hover:text-white flex items-center gap-2 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Ayuda</span>
          </a>

          <span className="text-[11px] text-stone-500 font-mono tracking-normal">v2.4</span>
        </div>
      </footer>
    </main>
  );
}
