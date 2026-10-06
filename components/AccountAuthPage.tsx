"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import { AlertCircle, Upload, HelpCircle, Home, CookingPot, Utensils } from "lucide-react";

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

export default function CuentaPage({ initialAuthMode = "login" }: { initialAuthMode?: "login" | "register" }) {
  const router = useRouter();

  // Mode: Auth
  const authMode = initialAuthMode;
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
      setLoginError("El usuario no existe. Puedes crear una cuenta para unirte a la cocina del barrio.");
      return;
    }

    // Escenario 2 (HU-02): Credenciales inválidas
    if (loginPassword === "erronea" || loginPassword === "123") {
      setLoginError("La contraseña no coincide.");
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
      paymentMethods: ["Efectivo", "Nequi", "Llaves"],
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
      <main data-theme-page className="relative min-h-screen w-full bg-[#14110f] flex items-center justify-center">
        <p className="text-stone-400 text-sm font-semibold">Cargando...</p>
      </main>
    );
  }

  const showVisme = false;

  if (showVisme) {
    return (
      <main className="w-full min-h-screen bg-black overflow-hidden flex items-center justify-center">
        <div 
          className="visme_d" 
          data-title="Expert Blog Subscription" 
          data-url="vm8gexwz-expert-blog-subscription?fullPage=true" 
          data-domain="forms" 
          data-full-page="true" 
          data-min-height="100vh" 
          data-form-id="202381"
        ></div>
        <Script src="https://static-bundles.visme.co/forms/vismeforms-embed.js" strategy="lazyOnload" />
      </main>
    );
  }

  return (
    <main data-theme-page className="relative min-h-screen w-full bg-black text-[#f4efe6] font-['Outfit',sans-serif] overflow-hidden flex items-center justify-end selection:bg-[#F0822D] selection:text-white">
      
      {/* ── VIDEO DE FONDO MÁGICO ── */}
      <div className="absolute inset-0 w-full h-full z-0">
        <video 
          autoPlay 
          muted 
          playsInline 
          className="w-full h-full object-cover object-center"
          src="/videos/inicio.mp4"
        />
        {/* Filtro de color naranja OllaCercana para teñir el humo mágico */}
        <div className="absolute inset-0 bg-[#F0822D]/30 mix-blend-color pointer-events-none"></div>
        
        {/* Un degradado oscuro sutil a la derecha para asegurar que el texto se lea */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/40 to-black/90 pointer-events-none"></div>
      </div>

      {/* ── BOTONERA SUPERIOR DERECHA (Simulando Visme UI pero con color OllaCercana) ── */}
      <div className="absolute top-6 right-6 flex gap-2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-3 shadow-lg hover:scale-105 transition-transform cursor-pointer border border-[#F0822D]/30">
          <div className="w-3 h-3 bg-[#F0822D] rounded-full animate-pulse"></div>
          <div className="w-5 h-4 border-2 border-white rounded-sm"></div>
          <div className="w-3 h-5 border-2 border-white rounded-sm"></div>
        </div>
      </div>

      {/* ── CONTENEDOR PRINCIPAL (Solo formulario, alineado a la derecha pero con ajuste fino para encajar en el humo) ── */}
      <div className="relative w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-end z-10 px-8 lg:pr-12 xl:pr-20 py-12 min-h-screen">
        
        {/* ── FORMULARIO PRINCIPAL ── */}
        <div className="w-full md:w-1/2 lg:w-[450px] relative z-10 backdrop-blur-md bg-black/50 p-8 rounded-2xl border border-[#F0822D]/30 shadow-[0_0_50px_rgba(240,130,45,0.15)] animate-in fade-in slide-in-from-right-8 duration-1000">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-extrabold text-white mb-6">
              {authMode === "login" ? "Entra a tu cocina" : "Crea tu cuenta"}
            </h1>
            <p className="text-white font-bold text-lg">
              {authMode === "login" ? "Qué bueno verte" : "Bienvenido a la mesa"}
            </p>
            <p className="text-stone-300">
              {authMode === "login" ? "La abuelita te guarda un puesto." : "Únete a la cocina de tu barrio."}
            </p>
          </div>

          {authMode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {loginError && (
                <div className="p-3 rounded bg-rose-500 text-white text-sm text-center">
                  {loginError}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-white">
                  IDENTIFICADOR (CORREO O CELULAR) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="Ej:Usuario@ollacercana.com"
                    className="w-full bg-white rounded-md pl-11 pr-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-white">
                  CONTRASEÑA *
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="******"
                    className="w-full bg-white rounded-md px-4 py-3 text-center tracking-widest text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                  />
                </div>
              </div>

              {/* Roles (Integrado al estilo) */}
              <div className="space-y-2 pt-2 pb-2">
                <label className="text-xs uppercase font-bold tracking-wider text-white text-center block">
                  PERFIL DE INGRESO
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLoginRole("comprador")}
                    className={`py-2 px-2 rounded-md font-bold text-xs transition-all ${
                      loginRole === "comprador" ? "bg-white text-black" : "bg-transparent border border-white text-white hover:bg-white/10"
                    }`}
                  >
                    Comprador
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole("cocinera")}
                    className={`py-2 px-2 rounded-md font-bold text-xs transition-all ${
                      loginRole === "cocinera" ? "bg-white text-black" : "bg-transparent border border-white text-white hover:bg-white/10"
                    }`}
                  >
                    Cocinera
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginRole("admin")}
                    className={`py-2 px-2 rounded-md font-bold text-xs transition-all ${
                      loginRole === "admin" ? "bg-white text-black" : "bg-transparent border border-white text-white hover:bg-white/10"
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs text-stone-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberSession}
                    onChange={(e) => setRememberSession(e.target.checked)}
                    className="w-4 h-4 rounded text-[#FFB347] focus:ring-[#FFB347]"
                  />
                  <span>Recordarme</span>
                </label>
                <Link href="/ayuda#recuperacion" className="hover:text-white transition-colors">
                  ¿Olvidó su contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#FFB347] hover:bg-[#FFA322] text-black font-extrabold text-sm uppercase py-4 rounded-md transition-colors"
              >
                INICIAR SESIÓN
              </button>
            </form>
          )}

          {authMode === "register" && (
             <form onSubmit={handleRegisterSubmit} className="space-y-4">
              
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-xs uppercase font-bold tracking-wider text-white">Nombre</label>
                 <input
                   type="text"
                   value={regName}
                   onChange={(e) => setRegName(e.target.value)}
                   placeholder="Ej: Elena Ramírez"
                   className="w-full bg-white rounded-md px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs uppercase font-bold tracking-wider text-white">Celular</label>
                 <input
                   type="text"
                   value={regPhone}
                   onChange={(e) => setRegPhone(e.target.value)}
                   placeholder="Ej: 3001234567"
                   maxLength={10}
                   className="w-full bg-white rounded-md px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                 />
               </div>
             </div>
 
             <div className="space-y-1.5">
               <label className="text-xs uppercase font-bold tracking-wider text-white">Correo Electrónico *</label>
               <input
                 type="email"
                 value={regEmail}
                 onChange={(e) => setRegEmail(e.target.value)}
                 placeholder="Ej: usuario@ollacercana.com"
                 className="w-full bg-white rounded-md px-4 py-3 text-black font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
               />
             </div>
 
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-1.5">
                 <label className="text-xs uppercase font-bold tracking-wider text-white">Contraseña *</label>
                 <input
                   type="password"
                   value={regPassword}
                   onChange={(e) => setRegPassword(e.target.value)}
                   placeholder="******"
                   className="w-full bg-white rounded-md px-4 py-3 text-black font-medium placeholder-gray-400 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                 />
               </div>
               <div className="space-y-1.5">
                 <label className="text-xs uppercase font-bold tracking-wider text-white">Confirmar *</label>
                 <input
                   type="password"
                   value={regConfirmPassword}
                   onChange={(e) => setRegConfirmPassword(e.target.value)}
                   placeholder="******"
                   className="w-full bg-white rounded-md px-4 py-3 text-black font-medium placeholder-gray-400 text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FFB347]"
                 />
               </div>
             </div>
 
             <div className="space-y-2 pt-2 pb-2">
               <label className="text-xs uppercase font-bold tracking-wider text-white text-center block">ROL EN OLLACERCANA</label>
               <div className="grid grid-cols-2 gap-2">
                 <button
                   type="button"
                   onClick={() => setRegRole("comprador")}
                   className={`py-3 px-3 rounded-md text-sm font-bold transition-all ${
                     regRole === "comprador"
                       ? "bg-white text-black"
                       : "bg-transparent border border-white text-white hover:bg-white/10"
                   }`}
                 >
                   Comensal
                 </button>
                 <button
                   type="button"
                   onClick={() => setRegRole("cocinera")}
                   className={`py-3 px-3 rounded-md text-sm font-bold transition-all ${
                     regRole === "cocinera"
                       ? "bg-white text-black"
                       : "bg-transparent border border-white text-white hover:bg-white/10"
                   }`}
                 >
                   Cocinera
                 </button>
               </div>
             </div>
 
             <button
               type="submit"
               className="w-full bg-[#FFB347] hover:bg-[#FFA322] text-black font-extrabold text-sm uppercase py-4 rounded-md transition-colors mt-4"
             >
               CREAR MI CUENTA
             </button>
           </form>
          )}

          <div className="text-center pt-8">
            <p className="text-sm text-stone-400">
              {authMode === "login" ? "¿No tienes cuenta? " : "¿Ya tienes cuenta? "}
              <Link 
                href={authMode === "login" ? "/cuenta/registro" : "/cuenta"} 
                className="text-white hover:underline font-bold"
              >
                {authMode === "login" ? "Regístrate" : "Inicia sesión"}
              </Link>
            </p>
            <div className="mt-4">
              <Link href="/" className="text-xs text-stone-500 hover:text-white">Volver al inicio</Link>
            </div>
          </div>
          
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
          100% { transform: translateY(0px); }
        }
        @keyframes breathe {
          0% { transform: scale(1); }
          50% { transform: scale(1.02); }
          100% { transform: scale(1); }
        }
      `}} />
    </main>
  );
}
