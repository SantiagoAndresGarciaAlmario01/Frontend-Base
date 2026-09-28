"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import { getStoredNotifications, saveNotifications, AppNotification } from "@/lib/ollacercana-store";
import { Bell, HelpCircle, Home } from "lucide-react";

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

export default function AvisosPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

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

    // Avisos está disponible para los tres roles.
    setUser(parsed);

    try {
      setNotifications(getStoredNotifications());
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

  const unreadCount = notifications.filter((n) => !n.read).length;

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
          <AccountNav user={user} current="avisos" unreadCount={unreadCount} />

          <div className="space-y-6 text-left">
            <div className="flex items-center justify-between bg-[#131D24] border border-sky-500/30 rounded-2xl p-4 shadow-md">
              <div>
                <h4 className="text-sm font-bold text-sky-200 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sky-400" />
                  <span>Notificaciones y Avisos de Reservas (HU-17)</span>
                </h4>
                <p className="text-xs text-stone-300">Historial persistente de alertas sobre cambios de estado y mensajes entrantes.</p>
              </div>
              <button
                onClick={() => {
                  const updated = notifications.map((n) => ({ ...n, read: true }));
                  setNotifications(updated);
                  saveNotifications(updated);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-stone-900 border border-white/20 text-stone-300 text-xs font-semibold hover:text-white"
              >
                Marcar todas como leídas
              </button>
            </div>

            <div className="space-y-3">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow transition-all ${
                    notif.read ? "bg-black/40 border-white/10 text-stone-400" : "bg-sky-950/40 border-sky-500/40 text-white"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-300">{notif.title}</span>
                      <span className="text-[10px] text-stone-500 font-mono">{notif.timestamp}</span>
                    </div>
                    <p className="text-xs">{notif.message}</p>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => {
                        const updated = notifications.map((n) => (n.id === notif.id ? { ...n, read: true } : n));
                        setNotifications(updated);
                        saveNotifications(updated);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/40 text-[10px] font-bold"
                    >
                      Leído
                    </button>
                  )}
                </div>
              ))}
            </div>
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
