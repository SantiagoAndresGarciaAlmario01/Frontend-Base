"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import PublishDishModal from "@/components/modals/PublishDishModal";
import PhoneVerificationModal from "@/components/modals/PhoneVerificationModal";
import SalesHistoryModal from "@/components/modals/SalesHistoryModal";
import {
  getStoredReservations,
  getStoredNotifications,
  getStoredDishes,
  saveDishes,
  DishItem,
} from "@/lib/ollacercana-store";
import {
  ChefHat,
  CheckCircle2,
  Clock,
  BarChart3,
  PlusCircle,
  TrendingUp,
  Plus,
  Minus,
  Ban,
  Check,
  X,
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
  expiresAt: number;
  createdTimestamp: number;
  cocineraConfirmedDelivery: boolean;
  cocineraConfirmedPayment: boolean;
  cocineraClosedAt?: number;
  compradorClosedAt?: number;
  isAutoClosed?: boolean;
  rated?: boolean;
  cookName?: string;
  pickupTime?: string;
}

function homeForRole(role: UserProfile["role"]): string {
  if (role === "cocinera") return "/cuenta/cocina";
  if (role === "admin") return "/cuenta/admin";
  return "/menu";
}

const getDefaultReservations = (): Reservation[] => [
  {
    id: "RES-101",
    dish: "Guiso Tradicional en Cazuela",
    cookName: "Doña Elena",
    quantity: 2,
    buyerName: "Carlos Rodríguez",
    buyerPhone: "3104567890",
    paymentMethod: "Nequi",
    price: "$34.000",
    status: "pending",
    expiresAt: Date.now() + 10 * 60 * 1000 - 15000,
    createdTimestamp: Date.now() - 15000,
    cocineraConfirmedDelivery: false,
    cocineraConfirmedPayment: false,
  },
  {
    id: "RES-102",
    dish: "Empanadas Artesanales",
    cookName: "Doña Rosa",
    quantity: 4,
    buyerName: "María Fernanda Gómez",
    buyerPhone: "3159876543",
    paymentMethod: "Efectivo",
    price: "$24.000",
    status: "confirmed",
    expiresAt: Date.now() + 600000,
    createdTimestamp: Date.now() - 3600000,
    cocineraConfirmedDelivery: false,
    cocineraConfirmedPayment: false,
  },
];

export default function CocinaPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [dishesList, setDishesList] = useState<DishItem[]>([]);
  const [dishAvailabilityError, setDishAvailabilityError] = useState<string | null>(null);

  const [rejectingResId, setRejectingResId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("Sin porciones disponibles");
  const [rejectComment, setRejectComment] = useState("");
  const [rejectError, setRejectError] = useState("");

  const [isPublishDishModalOpen, setIsPublishDishModalOpen] = useState(false);
  const [isSalesHistoryModalOpen, setIsSalesHistoryModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

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

    if (parsed.role !== "cocinera") {
      router.push(homeForRole(parsed.role));
      return;
    }

    setUser(parsed);

    const savedResJson = localStorage.getItem("ollacercana_reservations");
    let loadedRes: Reservation[] = [];
    if (savedResJson) {
      try {
        loadedRes = JSON.parse(savedResJson);
      } catch (e) {
        loadedRes = getDefaultReservations();
      }
    } else {
      loadedRes = getDefaultReservations();
    }

    try {
      const storeV2 = getStoredReservations();
      storeV2.forEach((sr) => {
        if (!loadedRes.some((r) => r.id === sr.id)) {
          loadedRes.unshift({
            id: sr.id,
            dish: sr.dishName,
            cookName: sr.cookName || "Doña Rosa",
            quantity: sr.portions,
            buyerName: sr.buyerName,
            buyerPhone: "3001234567",
            paymentMethod: sr.preferredPaymentMethod,
            price: `$${sr.totalPrice.toLocaleString("es-CO")}`,
            status:
              sr.status === "PENDIENTE"
                ? "pending"
                : sr.status === "CONFIRMADO"
                ? "confirmed"
                : sr.status === "RECHAZADA"
                ? "rejected"
                : "closed",
            expiresAt: new Date(sr.expiresAt).getTime(),
            createdTimestamp: new Date(sr.createdAt).getTime(),
            cocineraConfirmedDelivery: !!sr.cookConfirmedDelivery,
            cocineraConfirmedPayment: false,
            pickupTime: sr.pickupTime,
          });
        }
      });
    } catch (e) {
      console.error(e);
    }

    setReservations(loadedRes);

    try {
      setDishesList(getStoredDishes());
    } catch (e) {
      console.error(e);
    }

    try {
      setUnreadCount(getStoredNotifications().filter((n) => !n.read).length);
    } catch (e) {
      console.error(e);
    }

    setCheckingSession(false);
  }, [router]);

  // Timer Ticks (24h auto-close)
  useEffect(() => {
    const timer = setInterval(() => {
      setReservations((prev) => {
        let changed = false;
        const updated = prev.map((res) => {
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

  const getRemainingTime = (expiresAt: number) => {
    const diff = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
    const m = Math.floor(diff / 60);
    const s = diff % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const handleConfirmReservation = (resId: string) => {
    const updated = reservations.map((r) => (r.id === resId ? { ...r, status: "confirmed" as const } : r));
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
          <AccountNav user={user} current="cocina" unreadCount={unreadCount} />

          <div className="space-y-6 text-left">
            {/* ONBOARDING & ACTIVACIÓN CON CONSENTIMIENTO (GAP 6) */}
            {!user.isCocineraActive && (
              <div className="p-6 rounded-2xl bg-[#201712] border-2 border-[#F0822D]/60 space-y-4 shadow-xl">
                <h4 className="text-base font-bold text-amber-200 flex items-center gap-2">
                  <ChefHat className="w-5 h-5 text-[#F0822D]" />
                  <span>Activar Perfil de Cocinera Vecinal</span>
                </h4>
                <p className="text-xs text-stone-300 leading-relaxed">
                  Para habilitar la publicación de platos y vender tus porciones sobrantes a vecinos cercanos, debes aceptar la política de tratamiento de datos personales (Habeas Data) y términos de convivencia.
                </p>

                <label className="flex items-start gap-3 p-3 rounded-xl bg-black/40 border border-white/10 text-xs text-stone-200 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={user.dataConsentAccepted || false}
                    onChange={(e) => {
                      const updated = { ...user, dataConsentAccepted: e.target.checked };
                      setUser(updated);
                      localStorage.setItem("ollacercana_user", JSON.stringify(updated));
                    }}
                    className="accent-[#F0822D] w-4 h-4 rounded mt-0.5"
                  />
                  <span>
                    Acepto la <strong>Política de Tratamiento de Datos Personales</strong> (Habeas Data Ley 1581) y los Términos de Servicio para Cocineras de Barrio.
                  </span>
                </label>

                <button
                  onClick={() => {
                    if (!user.dataConsentAccepted) {
                      alert("Debes aceptar el tratamiento de datos para activar tu perfil de cocinera.");
                      return;
                    }
                    const updated = { ...user, isCocineraActive: true };
                    setUser(updated);
                    localStorage.setItem("ollacercana_user", JSON.stringify(updated));
                    alert("¡Perfil de cocinera activado exitosamente!");
                  }}
                  className="w-full py-3 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  Activar perfil de cocinera
                </button>
              </div>
            )}

            {/* INGRESO DEL MES & HISTORIAL RESUMIDO (GAP 7 / HU-20) */}
            <div className="p-5 rounded-2xl bg-[#141E17] border border-emerald-500/30 space-y-4 shadow-lg">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Ingreso del Mes (Referencial HU-20)</span>
                </h4>
                <button
                  onClick={() => setIsSalesHistoryModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-1.5"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  Ver Historial Completo
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Ingreso Total Mes</span>
                  <span className="text-xl font-black text-emerald-400 block">$240.000 COP</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Porciones Entregadas</span>
                  <span className="text-xl font-black text-amber-300 block">14 porciones</span>
                </div>
                <div className="p-3.5 rounded-xl bg-black/50 border border-white/10 space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold">Plato Estrella</span>
                  <span className="text-sm font-bold text-white block truncate">Ajiaco de la casa (4,9 ★)</span>
                </div>
              </div>
            </div>

            {/* ACTION BAR & MIS PLATOS PUBLICADOS (GAP 8 & GAP 9 / HU-24) */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#18231B] border border-amber-600/30 rounded-2xl p-4 shadow-md">
              <div>
                <h4 className="text-sm font-bold text-amber-200">Mis Platos Publicados y Disponibilidad (HU-24)</h4>
                <p className="text-xs text-amber-300/80">Aumenta, disminuye o marca platos como agotados en tiempo real</p>
              </div>
              <button
                onClick={() => setIsPublishDishModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F0822D] to-[#E06F1A] hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Publicar Nuevo Plato</span>
              </button>
            </div>

            {dishAvailabilityError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">{dishAvailabilityError}</div>
            )}

            {/* DISH LIST FOR AJUSTAR DISPONIBILIDAD (HU-24) */}
            <div className="space-y-3">
              {dishesList.slice(0, 4).map((d) => (
                <div
                  key={d.id}
                  className="p-4 rounded-2xl bg-black/60 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <img src={d.image} alt={d.name} className="w-12 h-12 rounded-xl object-cover border border-amber-600/40 shrink-0" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h5 className="text-sm font-bold text-white">{d.name}</h5>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            d.status === "DISPONIBLE" ? "bg-emerald-500/20 text-emerald-300" : "bg-rose-500/20 text-rose-300"
                          }`}
                        >
                          {d.status}
                        </span>
                      </div>
                      <p className="text-xs text-amber-300 font-mono">
                        {d.formattedPrice} • {d.availablePortions}/{d.totalPortions} porciones disponibles
                      </p>
                    </div>
                  </div>

                  {/* Controls: Aumentar / Disminuir / Marcar Agotado (HU-24) */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setDishAvailabilityError(null);
                        const updated = dishesList.map((item) => {
                          if (item.id === d.id) {
                            const newTotal = item.totalPortions + 1;
                            const newAvail = item.availablePortions + 1;
                            return { ...item, totalPortions: newTotal, availablePortions: newAvail, status: "DISPONIBLE" as const };
                          }
                          return item;
                        });
                        setDishesList(updated);
                        saveDishes(updated);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1"
                      title="Aumentar disponibilidad"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>+1</span>
                    </button>

                    <button
                      onClick={() => {
                        setDishAvailabilityError(null);
                        if (d.reservedPortions > 0 && d.totalPortions - 1 < d.reservedPortions) {
                          setDishAvailabilityError(
                            `Tienes ${d.reservedPortions} porciones reservadas (no se puede reducir por debajo de lo comprometido).`
                          );
                          return;
                        }
                        if (d.availablePortions <= 0) return;
                        const updated = dishesList.map((item) => {
                          if (item.id === d.id) {
                            const newAvail = Math.max(0, item.availablePortions - 1);
                            return {
                              ...item,
                              availablePortions: newAvail,
                              status: (newAvail === 0 ? "AGOTADO" : "DISPONIBLE") as any,
                            };
                          }
                          return item;
                        });
                        setDishesList(updated);
                        saveDishes(updated);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold flex items-center gap-1"
                      title="Disminuir disponibilidad"
                    >
                      <Minus className="w-3.5 h-3.5 text-rose-400" />
                      <span>-1</span>
                    </button>

                    <button
                      onClick={() => {
                        setDishAvailabilityError(null);
                        const updated = dishesList.map((item) => {
                          if (item.id === d.id) {
                            return { ...item, availablePortions: 0, status: "AGOTADO" as const };
                          }
                          return item;
                        });
                        setDishesList(updated);
                        saveDishes(updated);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-rose-950 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-1"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Agotado</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* RESERVATIONS MANAGEMENT FOR COOK */}
            <div className="flex items-center justify-between border-b border-white/10 pb-3 pt-4">
              <h4 className="text-sm font-bold text-[#F0822D] flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                <span>Gestión de Solicitudes Entrantes</span>
              </h4>
            </div>

            <div className="space-y-4">
              {reservations.map((res) => (
                <div key={res.id} className="p-5 rounded-2xl bg-black/60 border border-white/10 space-y-4 shadow-lg">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
                    <div>
                      <span className="text-xs font-mono text-[#F0822D] font-bold">{res.id}</span>
                      <h5 className="text-base font-bold text-white">{res.dish}</h5>
                    </div>

                    <div className="flex items-center gap-2">
                      {res.status === "pending" && (
                        <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-mono flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Quedan: {getRemainingTime(res.expiresAt)}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          res.status === "pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : res.status === "confirmed"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : res.status === "closed"
                            ? "bg-sky-500/20 text-sky-300"
                            : "bg-rose-500/20 text-rose-300"
                        }`}
                      >
                        {res.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-300">
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Comprador</span>
                      <span className="font-semibold text-white">{res.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Cantidad</span>
                      <span className="font-semibold text-white">{res.quantity} porciones</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Pago</span>
                      <span className="font-semibold text-amber-300">{res.paymentMethod}</span>
                    </div>
                    <div>
                      <span className="text-stone-500 block text-[10px] uppercase">Total</span>
                      <span className="font-bold text-[#F0822D]">{res.price}</span>
                    </div>
                  </div>

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
                        className="flex-1 py-2.5 rounded-xl bg-stone-900 border border-stone-700 hover:border-rose-500 text-stone-300 hover:text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        Rechazar
                      </button>
                    </div>
                  )}

                  {res.status === "confirmed" && (
                    <div className="p-4 rounded-xl bg-black/40 border border-white/10 space-y-3">
                      <h6 className="text-xs font-bold uppercase tracking-wider text-[#F0822D] flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        Cierre de Entrega (HU-23)
                      </h6>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={res.cocineraConfirmedDelivery}
                            onChange={() => handleToggleCocineraCheck(res.id, "delivery")}
                            className="accent-[#F0822D] w-4 h-4 rounded"
                          />
                          <span>Entregado</span>
                        </label>

                        <label className="flex items-center gap-2 text-xs text-stone-200 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={res.cocineraConfirmedPayment}
                            onChange={() => handleToggleCocineraCheck(res.id, "payment")}
                            className="accent-[#F0822D] w-4 h-4 rounded"
                          />
                          <span>Pagado</span>
                        </label>

                        <button
                          onClick={() => handleConfirmClosing(res.id)}
                          disabled={!res.cocineraConfirmedDelivery || !res.cocineraConfirmedPayment || !!res.cocineraClosedAt}
                          className="px-5 py-2 rounded-xl bg-[#F0822D] hover:bg-[#d97224] disabled:opacity-40 text-white font-bold text-xs transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          {res.cocineraClosedAt ? "Cierre Enviado" : "Confirmar Cierre"}
                        </button>
                      </div>

                      {res.cocineraClosedAt && !res.compradorClosedAt && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> Confirmación pendiente por el comprador.
                          </span>
                          <button
                            onClick={() => handleSimulateCompradorConfirm(res.id)}
                            className="px-2.5 py-1 rounded bg-amber-400 text-black text-[10px] font-bold"
                          >
                            Simular Cierre Comprador
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {res.status === "closed" && (
                    <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between text-xs text-sky-200">
                      <span className="flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-sky-400" />
                        Transacción completada {res.isAutoClosed ? "(Cierre automático por 24h)" : ""}
                      </span>
                      {res.rated && <span className="text-amber-300 font-mono">★ Calificado</span>}
                    </div>
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

      {rejectingResId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#1A1C1E] border border-white/20 rounded-3xl p-6 shadow-2xl space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h4 className="text-sm font-bold text-rose-400">Rechazar Solicitud {rejectingResId}</h4>
              <button onClick={() => setRejectingResId(null)} className="text-stone-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {rejectError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 text-xs">{rejectError}</div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium block">Motivo del rechazo</label>
              <select
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full bg-black/50 border border-white/20 rounded-xl px-4 py-2.5 text-xs text-white outline-none"
              >
                <option value="Sin porciones disponibles">Sin porciones disponibles</option>
                <option value="No alcancé a entregar">No alcancé a entregar</option>
                <option value="Pedido incompatible">Pedido incompatible</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs text-stone-300 font-medium block">
                Observación {rejectReason === "Otro" ? "(Obligatoria)" : "(Opcional)"}
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={3}
                placeholder="Explica brevemente al comprador..."
                className="w-full bg-black/50 border border-white/20 rounded-xl p-3 text-xs text-white outline-none resize-none"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setRejectingResId(null)}
                className="flex-1 py-2.5 rounded-xl border border-white/20 text-stone-400 text-xs font-semibold"
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

      <PublishDishModal
        isOpen={isPublishDishModalOpen}
        onClose={() => setIsPublishDishModalOpen(false)}
        currentUser={user}
        onDishPublished={() => {
          setIsPublishDishModalOpen(false);
        }}
        onRequestPhoneVerification={() => setIsPhoneModalOpen(true)}
      />

      <SalesHistoryModal isOpen={isSalesHistoryModalOpen} onClose={() => setIsSalesHistoryModalOpen(false)} currentUser={user} />

      <PhoneVerificationModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        phone={user.phone}
        onVerified={() => {
          const updated = { ...user, phoneVerified: true };
          setUser(updated);
          localStorage.setItem("ollacercana_user", JSON.stringify(updated));
        }}
      />
    </main>
  );
}
