"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Phone,
  ArrowLeft,
  ChefHat,
  ShoppingBag,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  KeyRound,
  Edit3,
  CreditCard,
  Building,
  Star,
  Send,
  RefreshCw,
  X,
  Check
} from "lucide-react";

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: "comprador" | "cocinera" | "admin";
  commercialName?: string;
  bio?: string;
  residentialComplex?: string;
  paymentMethods: string[];
  isLoggedIn: boolean;
}

interface Reservation {
  id: string;
  dish: string;
  quantity: number;
  buyerName: string;
  buyerPhone: string;
  paymentMethod: string;
  price: string;
  status: "pending" | "confirmed" | "rejected" | "closed";
  rejectionReason?: string;
  rejectionComment?: string;
  expiresAt: number; // timestamp
  createdTimestamp: number;
  cocineraConfirmedDelivery: boolean;
  cocineraConfirmedPayment: boolean;
  cocineraClosedAt?: number;
  compradorClosedAt?: number;
  isAutoClosed?: boolean;
  rated?: boolean;
}

export default function CuentaPage() {
  // Mode: Auth or Profile
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [activeRoleTab, setActiveRoleTab] = useState<"cocinero" | "comprador" | "admin">("cocinero");
  
  // User Session State
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Login Form State
  const [loginId, setLoginId] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [rememberSession, setRememberSession] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Register Form State
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"comprador" | "cocinera">("comprador");
  const [regTerms, setRegTerms] = useState(false);
  const [regErrors, setRegErrors] = useState<Record<string, string>>({});

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
  const [otpTimer, setOtpTimer] = useState(300); // 5 minutes (300 seconds)
  const [otpError, setOtpError] = useState("");

  // Cook Requests & Reservations State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Sin porciones disponibles");
  const [rejectComment, setRejectComment] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Rating Modal State
  const [ratingResId, setRatingResId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(5);

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
          setUser(parsed);
          setCommercialName(parsed.commercialName || "Cocina de Doña Elena");
          setBio(parsed.bio || "Especialidad en guisos tradicionales a fuego lento y repostería artesanal.");
          setResidentialComplex(parsed.residentialComplex || "Torres del Norte - Apto 302");
          setEditPhone(parsed.phone);
          setSelectedPaymentMethods(parsed.paymentMethods || ["Efectivo", "Nequi"]);
          if (parsed.role === "cocinera") setActiveRoleTab("cocinero");
          else if (parsed.role === "comprador") setActiveRoleTab("comprador");
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Initialize Mock Pending Reservations if empty
    const savedResJson = localStorage.getItem("ollacercana_reservations");
    if (savedResJson) {
      try {
        setReservations(JSON.parse(savedResJson));
      } catch (e) {
        initDefaultReservations();
      }
    } else {
      initDefaultReservations();
    }
  }, []);

  const initDefaultReservations = () => {
    const defaultRes: Reservation[] = [
      {
        id: "RES-101",
        dish: "Guiso Tradicional en Cazuela",
        quantity: 2,
        buyerName: "Carlos Rodríguez",
        buyerPhone: "3104567890",
        paymentMethod: "Nequi",
        price: "17,00 €",
        status: "pending",
        expiresAt: Date.now() + 10 * 60 * 1000 - 15000, // ~9 min 45s left
        createdTimestamp: Date.now() - 15000,
        cocineraConfirmedDelivery: false,
        cocineraConfirmedPayment: false,
      },
      {
        id: "RES-102",
        dish: "Empanadas Artesanales",
        quantity: 4,
        buyerName: "María Fernanda Gómez",
        buyerPhone: "3159876543",
        paymentMethod: "Efectivo",
        price: "12,00 €",
        status: "confirmed",
        expiresAt: Date.now() + 600000,
        createdTimestamp: Date.now() - 3600000, // 1 hour ago
        cocineraConfirmedDelivery: false,
        cocineraConfirmedPayment: false,
      }
    ];
    setReservations(defaultRes);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(defaultRes));
  };

  // Timer Ticks (1 second loop) for OTP & Countdown Timers
  useEffect(() => {
    const timer = setInterval(() => {
      // Tick OTP
      setOtpTimer((prev) => (prev > 0 ? prev - 1 : 0));

      // Force rerender for live reservation timers & 24h auto-close checks
      setReservations((prev) => {
        let changed = false;
        const updated = prev.map((res) => {
          // Auto-close check if 24h passed since confirmation and single side confirmed
          if (res.status === "confirmed" && (res.cocineraConfirmedDelivery || res.compradorClosedAt)) {
            const ageHours = (Date.now() - res.createdTimestamp) / (1000 * 3600);
            if (ageHours >= 24 && !res.isAutoClosed) {
              changed = true;
              return { ...res, status: "closed" as const, isAutoClosed: true };
            }
          }
          return res;
        });
        if (changed) {
          localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
        }
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Login Submit Handler
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (!loginId.trim() || !loginPassword.trim()) {
      setLoginError("Ingresa tu identificador y contraseña.");
      return;
    }

    if (rememberSession) {
      localStorage.setItem("ollacercana_remembered_id", loginId);
    } else {
      localStorage.removeItem("ollacercana_remembered_id");
    }

    const newUser: UserProfile = {
      name: loginId.includes("@") ? loginId.split("@")[0] : "Cocinera Elena",
      email: loginId.includes("@") ? loginId : "elena@ollacercana.com",
      phone: "3001234567",
      role: activeRoleTab === "cocinero" ? "cocinera" : activeRoleTab === "comprador" ? "comprador" : "admin",
      commercialName: "Cocina de Doña Elena",
      bio: "Especialidad en guisos tradicionales a fuego lento y repostería artesanal.",
      residentialComplex: "Torres del Norte - Apto 302",
      paymentMethods: ["Efectivo", "Nequi", "Daviplata"],
      isLoggedIn: true,
    };

    setUser(newUser);
    setCommercialName(newUser.commercialName!);
    setBio(newUser.bio!);
    setResidentialComplex(newUser.residentialComplex!);
    setEditPhone(newUser.phone);
    localStorage.setItem("ollacercana_user", JSON.stringify(newUser));
  };

  // Register Submit Handler
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!regName.trim()) {
      errors.name = "El nombre es obligatorio.";
    }

    // Email format
    if (!regEmail.trim() || !/\S+@\S+\.\S+/.test(regEmail)) {
      errors.email = "Correo electrónico inválido (ej: usuario@correo.com).";
    }

    // Phone validation: 10 digits, starts with 3
    if (!/^3\d{9}$/.test(regPhone)) {
      errors.phone = "El celular debe contener exactamente 10 dígitos y comenzar por 3.";
    }

    // Password validation: uppercase, lowercase, number
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

    // Simulate Backend Errors for duplicate email/phone testing
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

    setUser(newUser);
    setCommercialName(newUser.commercialName || "");
    setBio(newUser.bio || "");
    setResidentialComplex(newUser.residentialComplex || "");
    setEditPhone(newUser.phone);
    localStorage.setItem("ollacercana_user", JSON.stringify(newUser));
  };

  // Profile Save Handler
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Check if phone changed -> trigger OTP Verification
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

    // Verify mock code (e.g. 123456 or any 6 digits for testing)
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

  // Logout Handler
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("ollacercana_user");
  };

  // Cook Request Decision Handler (Confirm / Reject)
  const handleConfirmReservation = (resId: string) => {
    const updated = reservations.map((r) =>
      r.id === resId ? { ...r, status: "confirmed" as const } : r
    );
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
  };

  const handleOpenRejectModal = (resId: string) => {
    setRejectingResId(resId);
    setRejectReason("Sin porciones disponibles");
    setRejectComment("");
    setRejectError("");
  };

  const handleSubmitReject = () => {
    if (!rejectingResId) return;

    if (rejectReason === "Otro" && !rejectComment.trim()) {
      setRejectError("Escribe una breve observación cuando selecciones 'Otro'.");
      return;
    }

    const updated = reservations.map((r) =>
      r.id === rejectingResId
        ? {
            ...r,
            status: "rejected" as const,
            rejectionReason: rejectReason,
            rejectionComment: rejectComment,
          }
        : r
    );

    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
    setRejectingResId(null);
  };

  // Delivery Closing Flow Handlers (HU-23)
  const handleToggleCocineraCheck = (resId: string, type: "delivery" | "payment") => {
    const updated = reservations.map((r) => {
      if (r.id === resId) {
        return {
          ...r,
          cocineraConfirmedDelivery: type === "delivery" ? !r.cocineraConfirmedDelivery : r.cocineraConfirmedDelivery,
          cocineraConfirmedPayment: type === "payment" ? !r.cocineraConfirmedPayment : r.cocineraConfirmedPayment,
        };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
  };

  const handleConfirmClosing = (resId: string) => {
    const updated = reservations.map((r) => {
      if (r.id === resId) {
        // If comprador has already closed, mark fully closed. Otherwise, mark cocinera closed timestamp
        const cocineraTimestamp = Date.now();
        const fullyClosed = !!r.compradorClosedAt;
        return {
          ...r,
          cocineraClosedAt: cocineraTimestamp,
          status: fullyClosed ? ("closed" as const) : ("confirmed" as const),
        };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
  };

  // Comprador Closing Simulation for testing
  const handleSimulateCompradorConfirm = (resId: string) => {
    const updated = reservations.map((r) => {
      if (r.id === resId) {
        const compradorTimestamp = Date.now();
        const fullyClosed = !!r.cocineraClosedAt;
        return {
          ...r,
          compradorClosedAt: compradorTimestamp,
          status: fullyClosed ? ("closed" as const) : ("confirmed" as const),
        };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
  };

  // Rating Submit
  const handleRatingSubmit = () => {
    if (!ratingResId) return;
    const updated = reservations.map((r) =>
      r.id === ratingResId ? { ...r, rated: true } : r
    );
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
    setRatingResId(null);
  };

  // Format OTP timer display (05:00)
  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  // Format remaining countdown time for reservation (10 min)
  const getRemainingTime = (expiresAt: number) => {
    const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <main className="min-h-screen bg-[#14110f] text-[#fcfaf7] px-4 md:px-8 py-10 flex flex-col items-center justify-start font-sans">
      
      {/* Top Header */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8 pb-4 border-b border-stone-800">
        <Link href="/" className="flex items-center gap-2 text-xs text-stone-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Inicio</span>
        </Link>
        <span className="text-xs font-mono text-orange-400/80">OllaCercana • Gestión de Cuenta</span>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl bg-[#1c1714] border border-orange-500/30 rounded-3xl p-6 md:p-10 shadow-2xl flex flex-col gap-8">
        
        {/* ========================================================================= */}
        {/* ENTRY POINT ROLE TAB SWITCHER (Cocinero / Comprador / Admin) */}
        {/* ========================================================================= */}
        <div className="w-full flex flex-col gap-3">
          <span className="text-xs uppercase tracking-widest text-stone-400 font-light text-center">
            Punto de entrada por rol
          </span>
          <div className="w-full grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-stone-950 border border-stone-800">
            <button
              onClick={() => setActiveRoleTab("cocinero")}
              className={`py-3 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRoleTab === "cocinero"
                  ? "bg-orange-500 text-black shadow-lg"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ChefHat className="w-4 h-4" />
              <span>Cocinero</span>
            </button>

            <button
              onClick={() => setActiveRoleTab("comprador")}
              className={`py-3 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRoleTab === "comprador"
                  ? "bg-lime-500 text-black shadow-lg"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Comprador</span>
            </button>

            <button
              onClick={() => setActiveRoleTab("admin")}
              className={`py-3 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeRoleTab === "admin"
                  ? "bg-purple-600 text-white shadow-lg"
                  : "text-stone-400 hover:text-white"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* AUTHENTICATION FLOW (LOGIN / REGISTRARME TOGGLE IF NOT LOGGED IN) */}
        {/* ========================================================================= */}
        {!user ? (
          <div className="w-full flex flex-col gap-6">
            
            {/* Login / Register Toggle */}
            <div className="flex items-center justify-center gap-4 border-b border-stone-800 pb-3">
              <button
                onClick={() => setAuthMode("login")}
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                  authMode === "login"
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-stone-500 hover:text-stone-300"
                }`}
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setAuthMode("register")}
                className={`text-sm font-bold uppercase tracking-wider pb-2 border-b-2 transition-all cursor-pointer ${
                  authMode === "register"
                    ? "border-orange-500 text-orange-400"
                    : "border-transparent text-stone-500 hover:text-stone-300"
                }`}
              >
                Registrarme
              </button>
            </div>

            {/* LOGIN FORM (Reference: login-screen.tsx) */}
            {authMode === "login" && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
                {loginError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs text-stone-300 font-medium">Identificador (Correo o Celular)</label>
                  <input
                    type="text"
                    value={loginId}
                    onChange={(e) => setLoginId(e.target.value)}
                    placeholder="ej: elena@ollacercana.com o 3001234567"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs text-stone-300 font-medium">Contraseña</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-3 text-sm text-white focus:border-orange-500 outline-none transition-colors"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-stone-400">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberSession}
                      onChange={(e) => setRememberSession(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <span>Recordar sesión</span>
                  </label>
                  
                  <a href="#" onClick={(e) => { e.preventDefault(); alert("Enlace de recuperación enviado a tu identificador."); }} className="text-orange-400 hover:underline">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  Entrar a OllaCercana
                </button>
              </form>
            )}

            {/* REGISTER FORM (Reference: register-screen.tsx) */}
            {authMode === "register" && (
              <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4 max-w-md mx-auto w-full">
                
                {/* Nombre */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-stone-300 font-medium">Nombre Completo</label>
                  <input
                    type="text"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="ej: Elena Ramírez"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                  />
                  {regErrors.name && <span className="text-[11px] text-rose-400">{regErrors.name}</span>}
                </div>

                {/* Correo */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-stone-300 font-medium">Correo Electrónico</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="ej: elena@correo.com"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                  />
                  {regErrors.email && <span className="text-[11px] text-rose-400 font-mono">{regErrors.email}</span>}
                </div>

                {/* Celular (10 digits, starts with 3) */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-stone-300 font-medium">Número Celular (10 dígitos)</label>
                  <input
                    type="text"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="ej: 3001234567"
                    maxLength={10}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                  />
                  {regErrors.phone && <span className="text-[11px] text-rose-400 font-mono">{regErrors.phone}</span>}
                </div>

                {/* Contraseña */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-stone-300 font-medium">Contraseña (Mayúscula, minúscula y número)</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                  />
                  {regErrors.password && <span className="text-[11px] text-rose-400 font-mono">{regErrors.password}</span>}
                </div>

                {/* Confirmación */}
                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs text-stone-300 font-medium">Confirmar Contraseña</label>
                  <input
                    type="password"
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                  />
                  {regErrors.confirmPassword && <span className="text-[11px] text-rose-400">{regErrors.confirmPassword}</span>}
                </div>

                {/* Selector de Rol */}
                <div className="flex flex-col gap-1.5 text-left">
                  <label className="text-xs text-stone-300 font-medium">Rol Principal</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setRegRole("comprador")}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        regRole === "comprador"
                          ? "bg-lime-500/20 border-lime-500 text-lime-300"
                          : "bg-stone-950 border-stone-800 text-stone-400"
                      }`}
                    >
                      Comprador
                    </button>
                    <button
                      type="button"
                      onClick={() => setRegRole("cocinera")}
                      className={`py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        regRole === "cocinera"
                          ? "bg-orange-500/20 border-orange-500 text-orange-400"
                          : "bg-stone-950 border-stone-800 text-stone-400"
                      }`}
                    >
                      Cocinera
                    </button>
                  </div>
                </div>

                {/* Términos Checkbox */}
                <div className="flex flex-col gap-1 text-left mt-1">
                  <label className="flex items-center gap-2 text-xs text-stone-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={regTerms}
                      onChange={(e) => setRegTerms(e.target.checked)}
                      className="accent-orange-500 rounded"
                    />
                    <span>Acepto los Términos y Condiciones de OllaCercana</span>
                  </label>
                  {regErrors.terms && <span className="text-[11px] text-rose-400">{regErrors.terms}</span>}
                </div>

                <button
                  type="submit"
                  className="mt-2 w-full py-3.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-orange-500/20"
                >
                  Crear Mi Cuenta
                </button>
              </form>
            )}

          </div>
        ) : (
          /* ========================================================================= */
          /* LOGGED IN VIEWS (PERFIL FORM & ROLE-BASED DASHBOARD) */
          /* ========================================================================= */
          <div className="flex flex-col gap-8">
            
            {/* Logged-in Header Badge */}
            <div className="p-4 rounded-2xl bg-stone-950 border border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
                  {user.name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-sm font-bold text-white">{user.name}</span>
                  <span className="text-xs text-stone-400 font-mono">{user.email} • {user.role.toUpperCase()}</span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg border border-stone-800 text-stone-400 hover:text-white text-xs transition-colors cursor-pointer"
              >
                Cerrar Sesión
              </button>
            </div>

            {/* ========================================================================= */}
            {/* COCINERO ROLE DASHBOARD: REQUESTS & DELIVERY-CLOSING FLOW (HU-23) */}
            {/* ========================================================================= */}
            {activeRoleTab === "cocinero" && (
              <div className="flex flex-col gap-6 text-left">
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2 text-orange-400 font-bold text-sm">
                    <ChefHat className="w-5 h-5" />
                    <span>Gestión de Solicitudes (Vista Cocinera)</span>
                  </div>
                  <span className="text-xs text-stone-400 font-mono">
                    {reservations.filter((r) => r.status === "pending").length} pendientes
                  </span>
                </div>

                {/* Solicitudes Pendientes (cook-requests-screen.tsx) */}
                <div className="flex flex-col gap-4">
                  {reservations.length === 0 ? (
                    <p className="text-xs text-stone-500 italic">No hay solicitudes registradas.</p>
                  ) : (
                    reservations.map((res) => (
                      <div
                        key={res.id}
                        className="p-5 rounded-2xl bg-stone-950 border border-stone-800 flex flex-col gap-4 shadow-md"
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-stone-800/80 pb-3">
                          <div>
                            <span className="text-xs font-mono text-orange-400 font-semibold">{res.id}</span>
                            <h4 className="text-base font-bold text-white">{res.dish}</h4>
                          </div>

                          <div className="flex items-center gap-2">
                            {res.status === "pending" && (
                              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                Quedan: {getRemainingTime(res.expiresAt)}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              res.status === "pending" ? "bg-amber-500/20 text-amber-300" :
                              res.status === "confirmed" ? "bg-emerald-500/20 text-emerald-300" :
                              res.status === "closed" ? "bg-sky-500/20 text-sky-300" : "bg-rose-500/20 text-rose-300"
                            }`}>
                              {res.status}
                            </span>
                          </div>
                        </div>

                        {/* Order Details */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-300">
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase">Comprador</span>
                            <span className="font-medium">{res.buyerName}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase">Cantidad</span>
                            <span className="font-medium">{res.quantity} porciones</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase">Pago</span>
                            <span className="font-medium text-amber-300">{res.paymentMethod}</span>
                          </div>
                          <div>
                            <span className="text-stone-500 block text-[10px] uppercase">Total</span>
                            <span className="font-bold text-white">{res.price}</span>
                          </div>
                        </div>

                        {/* Decision Form Buttons for Pending Status */}
                        {res.status === "pending" && (
                          <div className="flex items-center gap-3 pt-2">
                            <button
                              onClick={() => handleConfirmReservation(res.id)}
                              className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <Check className="w-4 h-4" />
                              Confirmar Reserva
                            </button>
                            <button
                              onClick={() => handleOpenRejectModal(res.id)}
                              className="flex-1 py-2.5 rounded-xl bg-stone-900 hover:bg-rose-950 border border-stone-700 hover:border-rose-500 text-stone-300 hover:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                            >
                              <X className="w-4 h-4" />
                              Rechazar
                            </button>
                          </div>
                        )}

                        {/* Delivery Closing Flow for Confirmed Status (HU-23) */}
                        {res.status === "confirmed" && (
                          <div className="mt-2 p-4 rounded-xl bg-stone-900/80 border border-stone-800 flex flex-col gap-3">
                            <h5 className="text-xs font-bold uppercase tracking-wider text-orange-400 flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4" />
                              Cierre de Entrega (HU-23)
                            </h5>

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                              <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={res.cocineraConfirmedDelivery}
                                  onChange={() => handleToggleCocineraCheck(res.id, "delivery")}
                                  className="accent-orange-500 w-4 h-4 rounded"
                                />
                                <span>Entregado</span>
                              </label>

                              <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={res.cocineraConfirmedPayment}
                                  onChange={() => handleToggleCocineraCheck(res.id, "payment")}
                                  className="accent-orange-500 w-4 h-4 rounded"
                                />
                                <span>Pagado</span>
                              </label>

                              <button
                                onClick={() => handleConfirmClosing(res.id)}
                                disabled={!res.cocineraConfirmedDelivery || !res.cocineraConfirmedPayment || !!res.cocineraClosedAt}
                                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-400 disabled:opacity-40 text-black font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                              >
                                {res.cocineraClosedAt ? "Cierre Enviado" : "Confirmar Cierre"}
                              </button>
                            </div>

                            {/* Notice: Single confirmation pending notice */}
                            {(res.cocineraClosedAt || res.compradorClosedAt) && !res.cocineraClosedAt && (
                              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span>Confirmación pendiente por tu parte. (El comprador ya confirmó la entrega).</span>
                              </div>
                            )}

                            {res.cocineraClosedAt && !res.compradorClosedAt && (
                              <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                                <span className="flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5" /> Confirmación pendiente por la otra parte.
                                </span>
                                <button
                                  onClick={() => handleSimulateCompradorConfirm(res.id)}
                                  className="px-2 py-1 rounded bg-amber-400 text-black text-[10px] font-bold"
                                >
                                  Simular Confirmación Comprador
                                </button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Closed Transaction Status */}
                        {res.status === "closed" && (
                          <div className="mt-2 p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between text-xs text-sky-200">
                            <span className="flex items-center gap-2 font-semibold">
                              <CheckCircle2 className="w-4 h-4 text-sky-400" />
                              Transacción completada ✨ {res.isAutoClosed ? "(Cierre automático por 24h)" : ""}
                            </span>
                            
                            {!res.rated ? (
                              <button
                                onClick={() => setRatingResId(res.id)}
                                className="px-4 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-black font-bold text-xs transition-colors cursor-pointer"
                              >
                                Calificar
                              </button>
                            ) : (
                              <span className="text-amber-300 font-mono">★ Calificado</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* PERFIL FORM (Reference: perfil-screen.tsx) */}
            {/* ========================================================================= */}
            <form onSubmit={handleProfileSave} className="flex flex-col gap-4 text-left border-t border-stone-800 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-400" />
                  Perfil de Cocinera & Datos Comerciales
                </h3>
                {profileSuccess && (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Perfil Actualizado
                  </span>
                )}
              </div>

              {/* Nombre Comercial */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-stone-300 font-medium">Nombre Comercial de tu Cocina</label>
                <input
                  type="text"
                  value={commercialName}
                  onChange={(e) => setCommercialName(e.target.value)}
                  placeholder="ej: Cocina de Doña Elena"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                />
              </div>

              {/* Biografía / Presentación */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-stone-300 font-medium">Biografía / Presentación</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                  placeholder="Cuéntale a tus vecinos sobre tus sazones y especialidades..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none resize-none"
                />
              </div>

              {/* Conjunto Residencial */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-stone-300 font-medium flex items-center gap-1">
                  <Building className="w-3.5 h-3.5 text-orange-400" /> Conjunto Residencial / Barrio
                </label>
                <input
                  type="text"
                  value={residentialComplex}
                  onChange={(e) => setResidentialComplex(e.target.value)}
                  placeholder="ej: Torres del Norte - Apto 302"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none"
                />
              </div>

              {/* Teléfono & OTP Trigger */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs text-stone-300 font-medium flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-orange-400" /> Número de Teléfono (Modificar activa verificación OTP)
                </label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  maxLength={10}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-white focus:border-orange-500 outline-none font-mono"
                />
              </div>

              {/* Medios de Pago */}
              <div className="flex flex-col gap-2">
                <label className="text-xs text-stone-300 font-medium flex items-center gap-1">
                  <CreditCard className="w-3.5 h-3.5 text-orange-400" /> Medios de Pago Aceptados
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
                            ? "bg-orange-500/20 border-orange-500 text-orange-300"
                            : "bg-stone-950 border-stone-800 text-stone-400"
                        }`}
                      >
                        {isSelected ? "✓ " : ""}{method}
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="mt-2 py-3 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
              >
                Guardar Cambios de Perfil
              </button>
            </form>

          </div>
        )}

      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: REJECTION REASON FORM */}
      {/* ========================================================================= */}
      {rejectingResId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1c1714] border border-stone-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-left">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <h3 className="text-base font-bold text-rose-400">Rechazar Solicitud {rejectingResId}</h3>
              <button onClick={() => setRejectingResId(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {rejectError}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-stone-300 font-medium">Motivo del rechazo</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="Sin porciones disponibles">Sin porciones disponibles</option>
                <option value="No alcancé a entregar">No alcancé a entregar</option>
                <option value="Pedido incompatible">Pedido incompatible</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-stone-300 font-medium">
                Observación {rejectReason === "Otro" ? "(Obligatoria)" : "(Opcional)"}
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
                placeholder="Explica brevemente al comprador..."
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingResId(null)}
                className="flex-1 py-2.5 rounded-xl border border-stone-800 text-stone-400 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmitReject}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
              >
                Confirmar Rechazo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: OTP VERIFICATION FORM (Reference: otp-screen.tsx) */}
      {/* ========================================================================= */}
      {showOtpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#1c1714] border border-orange-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-5 text-center">
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
              <KeyRound className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-base font-bold text-white">Verificación OTP Celular</h3>
              <p className="text-xs text-stone-400 mt-1">
                Enviamos un código de 6 dígitos al número <span className="text-orange-400 font-mono">{editPhone}</span>
              </p>
            </div>

            {otpError && (
              <div className="w-full p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                {otpError}
              </div>
            )}

            {/* 6 Digit Inputs */}
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
                  className="w-10 h-12 text-center text-lg font-bold bg-stone-950 border border-stone-800 rounded-xl focus:border-orange-500 text-white outline-none"
                />
              ))}
            </div>

            {/* Timer & Reenviar */}
            <div className="flex items-center justify-between w-full text-xs text-stone-400">
              <span className="font-mono text-amber-400">Expira en: {formatTimer(otpTimer)}</span>
              <button
                type="button"
                onClick={() => {
                  setOtpTimer(300);
                  setOtpError("");
                  setOtpDigits(["", "", "", "", "", ""]);
                  alert("Nuevo código enviado al celular.");
                }}
                className="text-orange-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Reenviar código
              </button>
            </div>

            <div className="flex items-center gap-3 w-full pt-2">
              <button
                onClick={() => setShowOtpModal(false)}
                className="flex-1 py-2.5 rounded-xl border border-stone-800 text-stone-400 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleVerifyOtp}
                className="flex-1 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs"
              >
                Validar Código
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: CALIFICAR TRANSACTION */}
      {/* ========================================================================= */}
      {ratingResId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-sm w-full bg-[#1c1714] border border-sky-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center gap-4 text-center">
            <h3 className="text-base font-bold text-white">Calificar Transacción Completada</h3>
            <p className="text-xs text-stone-300">¿Cómo fue la experiencia del pedido {ratingResId}?</p>

            <div className="flex items-center gap-2 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingStars(star)}
                  className="p-1 text-amber-400 hover:scale-125 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= ratingStars ? "fill-amber-400" : "text-stone-700"}`} />
                </button>
              ))}
            </div>

            <button
              onClick={handleRatingSubmit}
              className="w-full py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-black font-bold text-xs"
            >
              Guardar Calificación
            </button>
          </div>
        </div>
      )}

    </main>
  );
}
