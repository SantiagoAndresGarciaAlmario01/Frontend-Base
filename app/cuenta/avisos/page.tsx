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
      router.replace("/cuenta/sesion-expirada");
      return;
    }
    let parsed: UserProfile;
    try {
      parsed = JSON.parse(savedUserJson);
      if (!parsed.isLoggedIn) {
        router.replace("/cuenta/sesion-expirada");
        return;
      }
    } catch (e) {
      console.error(e);
      router.replace("/cuenta/sesion-expirada");
      return;
    }

    // Avisos está disponible para los tres roles.
    setUser(parsed);

    try {
      setNotifications(getStoredNotifications().filter((notification) => notification.targetEmail === parsed.email || notification.targetEmail === "usuario"));
    } catch (e) {
      console.error(e);
    }

    setCheckingSession(false);
  }, [router]);

  if (checkingSession || !user) {
    return (
      <main data-theme-page className="relative min-h-screen w-full bg-[#14110f] flex items-center justify-center">
        <p className="text-stone-400 text-sm font-semibold">Cargando...</p>
      </main>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <main data-theme-page className="relative min-h-screen w-full bg-[#14110f] text-[#f4efe6] font-['Outfit',sans-serif] overflow-x-hidden flex flex-col justify-between selection:bg-[#F0822D] selection:text-white">
      <AnimatedKitchenBackground />

      <header className="relative z-10 w-full pt-10 pb-6 px-6 flex flex-col items-center justify-center text-center">
        <Link href="/" className="cursor-pointer group transition-transform hover:scale-105">
          <BrandLogo size="lg" showTagline={true} taglineColor="text-stone-200 drop-shadow-md" />
        </Link>
      </header>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-4xl bg-black/75 backdrop-blur-xl border-2 border-[#8B5E34]/50 rounded-3xl p-6 sm:p-10 shadow-2xl shadow-black/60 space-y-8 my-6">
          <AccountNav user={user} current="avisos" unreadCount={unreadCount} />

          <div className="space-y-6 text-left">
              <div className="flex flex-col items-start justify-between gap-3 bg-[#efe0c2] border border-[#9b774f] rounded-2xl p-4 text-[#2b2117] shadow-md sm:flex-row sm:items-center">
              <div className="min-w-0">
                <h4 className="font-['Caveat',cursive] text-2xl font-bold text-[#493323] flex items-start gap-2">
                  <Bell className="mt-1 h-5 w-5 shrink-0 text-[#a84029]" />
                  <span>Avisos de tu cocina vecinal</span>
                </h4>
                <p className="text-xs text-[#5b4a38]">Novedades sobre tus reservas y conversaciones.</p>
              </div>
              <button
                onClick={() => {
                  const updated = notifications.map((n) => ({ ...n, read: true }));
                  setNotifications(updated);
                  saveNotifications(updated);
                }}
                className="self-stretch px-3.5 py-2 sm:self-auto rounded-xl bg-[#493323] border border-[#80694d] text-[#fff5df] text-xs font-semibold hover:bg-[#6d4931]"
              >
                Marcar todas como leídas
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 && <div className="menu-paper rounded-2xl border border-[#bda078] bg-[#f5e9d2] p-8 text-center text-[#6a5037]"><Bell className="mx-auto h-8 w-8 text-[#80694d]" /><p className="mt-2 font-['Caveat',cursive] text-2xl font-bold text-[#493323]">Todo tranquilo por aquí</p><p className="mt-1 text-sm">Cuando haya novedades de tus pedidos o chats, aparecerán en este espacio.</p></div>}
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border flex items-start justify-between gap-3 shadow transition-all ${
                    notif.read ? "bg-[#f5e9d2] border-[#bda078] text-[#6a5037]" : "bg-[#dce4ce] border-[#75865a] text-[#2b2117]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-xs font-bold text-[#493323]">{notif.title}</span>
                      <span className="text-[10px] text-[#80694d]">{notif.timestamp}</span>
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
                      className="px-2.5 py-1 rounded-lg bg-[#526f42] text-white border border-[#526f42] text-[10px] font-bold"
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
          <Link
            href="/ayuda"
            className="hover:text-white flex items-center gap-2 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-stone-400" />
            <span>Ayuda</span>
          </Link>

          <span className="text-[11px] text-stone-500 font-mono tracking-normal">v2.4</span>
        </div>
      </footer>
    </main>
  );
}
