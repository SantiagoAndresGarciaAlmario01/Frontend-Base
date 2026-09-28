"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import { AlertCircle, Upload, UserPlus, HelpCircle, Home } from "lucide-react";

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

// A dónde va cada rol después de iniciar sesión (o si ya tenía sesión activa).
function homeForRole(role: UserProfile["role"]): string {
  if (role === "cocinera") return "/cuenta/cocina";
  if (role === "admin") return "/cuenta/admin";
  return "/menu";
}

export default function CuentaPage() {
  const router = useRouter();

  // Mode: Auth
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [checkingSession, setCheckingSession] = useState(true);

  // Login Form State
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [loginRole, setLoginRole] = useState<"comprador" | "cocinera" | "admin">("comprador");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"comprador" | "cocinera">("comprador");
  const [regKitchenPhoto, setRegKitchenPhoto] = useState("");
  const [regTerms, setRegTerms] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

  // Load Session & Remembered Identifier on Mount
  useEffect(() => {
    const remembered = localStorage.getItem("ollacercana_remembered_id");
    if (remembered) {
      setLoginId(remembered);
      setRememberSession(true);
    }

    const savedUserJson = localStorage.getItem("ollacercana_user");
    if (savedUserJson) {
      try {
        const parsed: UserProfile = JSON.parse(savedUserJson);
        if (parsed.isLoggedIn) {
          router.push(homeForRole(parsed.role));
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    setCheckingSession(false);
  }, [router]);

  // Login Submit Handler (Fulfilling HU-02 Acceptance Criteria)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("Ingresa tu identificador y contraseña.");
      return;
    }

    // El identificador debe ser un correo válido o un celular de 10 dígitos (empieza por 3)
    const isValidEmailFormat = /^\S+@\S+\.\S+$/.test(loginId.trim());
    const isValidPhoneFormat = /^3\d{9}$/.test(loginId.trim());
    if (!isValidEmailFormat && !isValidPhoneFormat) {
      setLoginError("Ingresa un correo válido (ej: usuario@ollacercana.com) o un celular de 10 dígitos que empiece por 3.");
      return;
    }

    // Escenario 3 (HU-02): Usuario inexistente
    if (
      loginId.toLowerCase().includes("inexistente") ||
      loginId === "3000000000" ||
      loginId.toLowerCase() === "noexiste@correo.com"
    ) {
      setLoginError("El usuario no existe. Te sugerimos registrarte en la pestaña superior.");
      return;
    }

    // Escenario 2 (HU-02): Credenciales inválidas
    if (loginPassword === "erronea" || loginPassword === "123") {
      setLoginError("Credenciales inválidas");
      return;
    }

    // La contraseña debe cumplir la misma regla de formato que en el registro
    const pwdFormatRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!pwdFormatRegex.test(loginPassword)) {
      setLoginError("La contraseña debe incluir al menos una mayúscula, una minúscula y un número.");
      return;
    }

    // Escenario 1 (HU-02): Camino feliz
    if (rememberSession) {
      localStorage.setItem("ollacercana_remembered_id", loginId);
    } else {
      localStorage.removeItem("ollacercana_remembered_id");
    }

    const newUser: UserProfile = {
      name: loginId.includes("@") ? loginId.split("@")[0] : "Cocinera Elena",
      email: loginId.includes("@") ? loginId : "elena@ollacercana.com",
      phone: "3001234567",
      phoneVerified: true,
      role: loginRole,
      commercialName: "Cocina de Doña Elena",
      bio: "Especialidad en guisos tradicionales a fuego lento y repostería artesanal.",
      residentialComplex: "Torres del Norte - Apto 302",
      paymentMethods: ["Efectivo", "Nequi", "Daviplata"],
      isLoggedIn: true,
      isCocineraActive: true,
      dataConsentAccepted: true,
    };

    localStorage.setItem("ollacercana_user", JSON.stringify(newUser));
    router.push(homeForRole(newUser.role));
  };

  // Register Submit Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!regName.trim()) {
      errors.name = "El nombre es obligatorio.";
    }

    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) {
      errors.email = "Correo electrónico inválido (ej: usuario@correo.com).";
    }

    if (!/^3\d{9}$/.test(regPhone)) {
      errors.phone = "El celular debe contener exactamente 10 dígitos y comenzar por 3.";
    }

    const pwdRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!pwdRegex.test(regPassword)) {
      errors.password = "La contraseña debe incluir al menos una mayúscula, una minúscula y un número.";
    }

    if (regPassword !== regConfirmPassword) {
      errors.confirmPassword = "Las contraseñas no coinciden.";
    }

    if (!regTerms) {
      errors.terms = "Debes aceptar los términos y condiciones.";
    }

    if (regEmail.toLowerCase() === "duplicado@correo.com") {
      errors.email = "El correo ya se encuentra registrado (409 Conflict).";
    }
    if (regPhone === "3000000000") {
      errors.phone = "El número celular ya está registrado (409 Conflict).";
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      return;
    }

    setRegErrors({});
    const newUser: UserProfile = {
      name: regName,
      email: regEmail,
      phone: regPhone,
      role: regRole,
      commercialName: regRole === "cocinera" ? `Cocina de ${regName}` : undefined,
      bio: "Cocinera de barrio apasionada por la comida real.",
      residentialComplex: "Conjunto Residencial El Rosal",
      paymentMethods: ["Efectivo", "Nequi"],
      isLoggedIn: true,
    };

    localStorage.setItem("ollacercana_user", JSON.stringify(newUser));
    router.push(homeForRole(newUser.role));
  };

  if (checkingSession) {
    return (
      <main className="relative min-h-screen w-full bg-[#14110f] flex items-center justify-center">
        <p className="text-stone-400 text-sm font-semibold">Cargando...</p>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full bg-[#14110f] text-[#f4efe6] font-['Outfit',sans-serif] overflow-x-hidden flex flex-col justify-between selection:bg-[#F0822D] selection:text-white">
      {/* ── 150-FRAME ANIMATED CANVAS BACKGROUND (CONTINUOUS LOOP AT ~25FPS) ── */}
      <AnimatedKitchenBackground />

      {/* ── TOP HEADER / BRAND TITLE (UPPER CENTER) ── */}
      <header className="relative z-10 w-full pt-10 pb-6 px-6 flex flex-col items-center justify-center text-center">
        <Link href="/" className="cursor-pointer group transition-transform hover:scale-105">
          <BrandLogo size="lg" showTagline={true} taglineColor="text-stone-200 drop-shadow-md" />
        </Link>
      </header>

      {/* ── MAIN CONTENT CONTAINER (CENTERED FORM PANEL) ── */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-md mx-auto bg-black/25 backdrop-blur-xl border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/90 space-y-6">
          {/* Login / Register Toggle Header */}
          <div className="flex items-center justify-around border-b border-white/10 pb-3">
            <button
              onClick={() => setAuthMode("login")}
              className={`text-sm font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer ${
                authMode === "login"
                  ? "border-[#F0822D] text-[#F0822D]"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              onClick={() => setAuthMode("register")}
              className={`text-sm font-bold uppercase tracking-wider pb-1.5 border-b-2 transition-all cursor-pointer ${
                authMode === "register"
                  ? "border-[#F0822D] text-[#F0822D]"
                  : "border-transparent text-stone-400 hover:text-stone-200"
              }`}
            >
              Registrarme
            </button>
          </div>

          {/* LOGIN FORM */}
          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2 backdrop-blur-md">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase font-bold tracking-wider text-stone-300">
                  Identificador (Correo o Celular)
                </label>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="ej: usuario@ollacercana.com"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#F0822D] focus:ring-1 focus:ring-[#F0822D] outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase font-bold tracking-wider text-stone-300">
                  Ingresar como
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole("comprador")}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      loginRole === "comprador"
                        ? "bg-[#62B869]/20 border-[#62B869] text-[#62B869]"
                        : "bg-black/40 border-white/20 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Comprador
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole("cocinera")}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      loginRole === "cocinera"
                        ? "bg-[#F0822D]/20 border-[#F0822D] text-[#F0822D]"
                        : "bg-black/40 border-white/20 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Cocinera
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole("admin")}
                    className={`py-2 px-2 rounded-xl border text-[11px] font-bold transition-all cursor-pointer ${
                      loginRole === "admin"
                        ? "bg-purple-500/20 border-purple-500 text-purple-300"
                        : "bg-black/40 border-white/20 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs uppercase font-bold tracking-wider text-stone-300">
                  Contraseña
                </label>
                <input
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-stone-500 focus:border-[#F0822D] focus:ring-1 focus:ring-[#F0822D] outline-none transition-all"
                />
                <div className="text-right pt-0.5">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      alert("Enlace de recuperación enviado a tu identificador.");
                    }}
                    className="text-xs text-[#F0822D] hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 text-xs text-stone-300">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 accent-[#F0822D] rounded border-white/30"
                  />
                  <span>Recordar sesión</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full mt-3 py-3.5 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg shadow-orange-950/50 active:scale-[0.98]"
              >
                Iniciar Sesión
              </button>
            </form>
          )}

          {/* REGISTER FORM */}
          {authMode === "register" && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-left">
              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="ej: Elena Ramírez"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#F0822D] outline-none"
                />
                {regErrors.name && <span className="text-[11px] text-rose-400">{regErrors.name}</span>}
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="ej: elena@correo.com"
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#F0822D] outline-none"
                />
                {regErrors.email && <span className="text-[11px] text-rose-400 font-mono">{regErrors.email}</span>}
              </div>

              <div>
                <label className="text-[11px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Celular (10 dígitos)</label>
                <input
                  type="text"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="ej: 3001234567"
                  maxLength={10}
                  className="w-full bg-black/50 border border-white/20 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-stone-500 focus:border-[#F0822D] outline-none"
                />
                {regErrors.phone && <span className="text-[11px] text-rose-400 font-mono">{regErrors.phone}</span>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Contraseña</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#F0822D] outline-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Confirmar</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black/50 border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:border-[#F0822D] outline-none"
                  />
                </div>
              </div>
              {regErrors.password && <span className="text-[11px] text-rose-400 font-mono block">{regErrors.password}</span>}
              {regErrors.confirmPassword && <span className="text-[11px] text-rose-400 block">{regErrors.confirmPassword}</span>}

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-stone-300 block mb-1">Rol en OllaCercana</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole("comprador")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      regRole === "comprador"
                        ? "bg-[#62B869]/20 border-[#62B869] text-[#62B869]"
                        : "bg-black/40 border-white/20 text-stone-400"
                    }`}
                  >
                    Comprador
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole("cocinera")}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      regRole === "cocinera"
                        ? "bg-[#F0822D]/20 border-[#F0822D] text-[#F0822D]"
                        : "bg-black/40 border-white/20 text-stone-400"
                    }`}
                  >
                    Cocinera
                  </button>
                </div>
              </div>

              {regRole === "cocinera" && (
                <div>
                  <label className="text-[10px] uppercase font-bold tracking-wider text-amber-300 block mb-1 flex items-center gap-1">
                    <Upload className="w-3 h-3 text-[#F0822D]" /> Foto de Perfil / Cocina
                  </label>
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-white/30 bg-black/40 text-stone-300 text-xs font-semibold cursor-pointer hover:border-[#F0822D] transition-all">
                    <span>{regKitchenPhoto ? "Foto de cocina adjuntada ✓" : "Adjuntar foto de perfil o cocina"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (evt) => {
                            if (evt.target?.result) {
                              setRegKitchenPhoto(evt.target.result as string);
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              <div className="pt-1">
                <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={regTerms}
                    onChange={(e) => setRegTerms(e.target.checked)}
                    className="accent-[#F0822D] rounded"
                  />
                  <span>Acepto Términos y Condiciones</span>
                </label>
                {regErrors.terms && <span className="text-[11px] text-rose-400 block">{regErrors.terms}</span>}
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-lg"
              >
                Crear Mi Cuenta
              </button>
            </form>
          )}
        </div>
      </div>

      {/* ── CORNER MENU (BOTTOM-RIGHT CORNER MATCHING REFERENCE LAYOUT) ── */}
      <footer className="relative z-10 w-full px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-stone-400 hover:text-white transition-colors"
        >
          <Home className="w-4 h-4 text-[#F0822D]" />
          <span>Volver a OllaCercana</span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-6 text-xs font-bold tracking-widest uppercase text-stone-300">
          <button
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="hover:text-white flex items-center gap-2 transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-[#F0822D]" />
            <span>{authMode === "login" ? "Crear cuenta" : "Iniciar sesión"}</span>
          </button>

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
