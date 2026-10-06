"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import {
  Phone,
  UserCheck,
  CheckCircle2,
  KeyRound,
  CreditCard,
  Building,
  RefreshCw,
  HelpCircle,
  Home,
} from "lucide-react";

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

export default function PerfilPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Profile Form State
  const [commercialName, setCommercialName] = useState("");
  const [bio, setBio] = useState("");
  const [residentialComplex, setResidentialComplex] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [selectedPaymentMethods, setSelectedPaymentMethods] = useState<string[]>(["Efectivo", "Nequi"]);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // OTP Verification Modal State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes
  const [otpError, setOtpError] = useState("");

  useEffect(() => {
    const savedUserJson = localStorage.getItem("ollacercana_user");
    if (!savedUserJson) {
      router.push("/cuenta");
      return;
    }
    try {
      const parsed: UserProfile = JSON.parse(savedUserJson);
      if (!parsed.isLoggedIn) {
        router.push("/cuenta");
        return;
      }
      setUser(parsed);
      setCommercialName(parsed.commercialName || "Cocina de Doña Elena");
      setBio(parsed.bio || "Especialidad en guisos tradicionales a fuego lento y repostería artesanal.");
      setResidentialComplex(parsed.residentialComplex || "Torres del Norte - Apto 302");
      setEditPhone(parsed.phone);
      setSelectedPaymentMethods(parsed.paymentMethods || ["Efectivo", "Nequi"]);
      setCheckingSession(false);
    } catch (e) {
      console.error(e);
      router.push("/cuenta");
    }
  }, [router]);

  // OTP timer tick
  useEffect(() => {
    if (!showOtpModal) return;
    const timer = setInterval(() => {
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [showOtpModal]);

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Profile Save Handler
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (editPhone !== user.phone && /^3\d{9}$/.test(editPhone)) {
      setShowOtpModal(true);
      setOtpTimer(300);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError("");
      return;
    }

    const updated: UserProfile = {
      ...user,
      commercialName,
      bio,
      residentialComplex,
      phone: editPhone,
      paymentMethods: selectedPaymentMethods,
    };
    setUser(updated);
    localStorage.setItem("ollacercana_user", JSON.stringify(updated));
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

  // OTP Verification Submit
  const handleVerifyOtp = () => {
    const code = otpDigits.join("");
    if (code.length !== 6) {
      setOtpError("Ingresa el código completo de 6 dígitos.");
      return;
    }

    if (code === "000000") {
      setOtpError("Código incorrecto o expirado.");
      return;
    }

    if (!user) return;

    const updated: UserProfile = {
      ...user,
      phone: editPhone,
      commercialName,
      bio,
      residentialComplex,
      paymentMethods: selectedPaymentMethods,
    };
    setUser(updated);
    localStorage.setItem("ollacercana_user", JSON.stringify(updated));
    setShowOtpModal(false);
    setProfileSuccess(true);
    setTimeout(() => setProfileSuccess(false), 3000);
  };

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
          <AccountNav user={user} current="perfil" />

          <form onSubmit={handleProfileSave} className="space-y-4 text-left border-t border-white/10 pt-6">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#F0822D]" />
                Perfil & Datos Comerciales
              </h4>
              {profileSuccess && (
                <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Perfil Actualizado
                </span>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Nombre Comercial</label>
              <input
                type="text"
                value={commercialName}
                onChange={(e) => setCommercialName(e.target.value)}
                placeholder="ej: Cocina de Doña Elena"
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#F0822D] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300">Presentación / Biografía</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#F0822D] outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-[#F0822D]" /> Conjunto Residencial / Barrio
              </label>
              <input
                type="text"
                value={residentialComplex}
                onChange={(e) => setResidentialComplex(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#F0822D] outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-[#F0822D]" /> Teléfono (Modificar activa OTP)
              </label>
              <input
                type="text"
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                maxLength={10}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:border-[#F0822D] outline-none font-mono"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-stone-300 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#F0822D]" /> Medios de Pago
              </label>
              <div className="flex flex-wrap gap-3">
                {["Efectivo", "Nequi", "Daviplata"].map((method) => {
                  const isSelected = selectedPaymentMethods.includes(method);
                  return (
                    <button
                      type="button"
                      key={method}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedPaymentMethods(selectedPaymentMethods.filter((m) => m !== method));
                        } else {
                          setSelectedPaymentMethods([...selectedPaymentMethods, method]);
                        }
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#F0822D]/20 border-[#F0822D] text-[#F0822D]"
                          : "bg-black/40 border-white/20 text-stone-400"
                      }`}
                    >
                      {isSelected ? "✓ " : ""}
                      {method}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg"
            >
              Guardar Perfil
            </button>
          </form>
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

      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#1A1C1E] border border-[#F0822D]/40 rounded-3xl p-6 shadow-2xl text-center space-y-5">
            <div className="w-12 h-12 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center text-[#F0822D] mx-auto">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-base font-bold text-white">Verificación OTP Celular</h4>
              <p className="text-xs text-stone-400 mt-1">
                Código de 6 dígitos enviado al <span className="text-[#F0822D] font-mono">{editPhone}</span>
              </p>
            </div>

            {otpError && (
              <div className="w-full p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">
                {otpError}
              </div>
            )}

            <div className="flex items-center justify-center gap-2">
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const val = e.target.value;
                    const updated = [...otpDigits];
                    updated[idx] = val;
                    setOtpDigits(updated);
                    if (val && idx < 5) {
                      const nextInput = document.getElementById(`otp-input-${idx + 1}`);
                      nextInput?.focus();
                    }
                  }}
                  className="w-10 h-12 text-center text-lg font-bold bg-black/60 border border-white/20 rounded-xl focus:border-[#F0822D] text-white outline-none"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-stone-400">
              <span className="font-mono text-amber-400">Expira en: {formatTimer(otpTimer)}</span>
              <button
                type="button"
                onClick={() => {
                  setOtpTimer(300);
                  setOtpError("");
                  setOtpDigits(["", "", "", "", "", ""]);
                  alert("Nuevo código enviado.");
                }}
                className="text-[#F0822D] hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reenviar
              </button>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-stone-400 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs"
              >
                Validar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
