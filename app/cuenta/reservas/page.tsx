"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import ChatModal from "@/components/modals/ChatModal";
import { getStoredReservations, getStoredNotifications, getStoredReviews, saveReviews, saveReservations, Review } from "@/lib/ollacercana-store";
import {
  Clock,
  CheckCircle2,
  Star,
  PlusCircle,
  RotateCcw,
  MessageSquare,
  ShoppingBag,
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
  paymentReceipt?: string;
  paymentReceiptName?: string;
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

export default function ReservasPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const [compradorSubTab, setCompradorSubTab] = useState<"activas" | "historial">("activas");
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeChatReservationId, setActiveChatReservationId] = useState<string | null>(null);
  const [ratingResId, setRatingResId] = useState<string | null>(null);
  const [ratingStars, setRatingStars] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [ratingError, setRatingError] = useState("");
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

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

    if (parsed.role !== "comprador") {
      router.replace("/cuenta/acceso-denegado");
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
            paymentReceipt: sr.paymentReceipt,
            paymentReceiptName: sr.paymentReceiptName,
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

    // Sembrar las reservas de demostración en el store real (ollacercana_reservations_v2)
    // para que el chat (que solo lee de ese store) las pueda encontrar y abrir.
    try {
      const storeNow = getStoredReservations();
      const demoSeeds = [
        {
          id: "RES-101",
          dishId: "RES-101",
          dishName: "Guiso Tradicional en Cazuela",
          dishImage: "",
          cookId: "dona-elena",
          cookName: "Doña Elena",
          buyerName: "Carlos Rodríguez",
          buyerEmail: "carlos.rodriguez@ollacercana.com",
          portions: 2,
          pricePerPortion: 17000,
          totalPrice: 34000,
          preferredPaymentMethod: "Nequi" as const,
          pickupTime: "15-20 min",
          status: "PENDIENTE" as const,
          createdAt: new Date(Date.now() - 15000).toISOString(),
          expiresAt: new Date(Date.now() + 10 * 60 * 1000 - 15000).toISOString(),
        },
        {
          id: "RES-102",
          dishId: "RES-102",
          dishName: "Empanadas Artesanales",
          dishImage: "",
          cookId: "dona-rosa",
          cookName: "Doña Rosa",
          buyerName: "María Fernanda Gómez",
          buyerEmail: "maria.fernanda.gomez@ollacercana.com",
          portions: 4,
          pricePerPortion: 6000,
          totalPrice: 24000,
          preferredPaymentMethod: "Efectivo" as const,
          pickupTime: "15-20 min",
          status: "CONFIRMADO" as const,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          expiresAt: new Date(Date.now() + 600000).toISOString(),
        },
      ];
      const missingSeeds = demoSeeds.filter((d) => !storeNow.some((r) => r.id === d.id));
      if (missingSeeds.length > 0) {
        saveReservations([...storeNow, ...missingSeeds]);
      }
    } catch (e) {
      console.error(e);
    }

    setReservations(loadedRes);

    try {
      setUnreadCount(getStoredNotifications().filter((n) => (n.targetEmail === parsed.email || n.targetEmail === "usuario") && !n.read).length);
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

  const handleSimulateCompradorConfirm = (resId: string) => {
    const updated = reservations.map((r) => {
      if (r.id === resId) {
        const compradorTimestamp = Date.now();
        return {
          ...r,
          compradorClosedAt: compradorTimestamp,
          status: "closed" as const,
        };
      }
      return r;
    });
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
    saveReservations(getStoredReservations().map((reservation) => reservation.id === resId ? {
      ...reservation,
      status: "COMPLETADA",
      buyerConfirmedDelivery: true,
    } : reservation));
    setRatingStars(0);
    setRatingComment("");
    setRatingError("");
    setRatingSubmitted(false);
    setRatingResId(resId);
  };

  const handleRatingSubmit = () => {
    if (!ratingResId) return;
    if (ratingStars < 1) {
      setRatingError("Debe seleccionar al menos una estrella");
      return;
    }
    if (!ratingComment.trim()) {
      setRatingError("Por favor escribir un comentario");
      return;
    }
    const reservation = getStoredReservations().find((item) => item.id === ratingResId);
    const reviews = getStoredReviews();
    if (reservation && !reviews.some((review) => review.reservationId === reservation.id)) {
      const review: Review = {
        id: `review-${Date.now()}`,
        cookId: reservation.cookId,
        reservationId: reservation.id,
        buyerName: user?.name || "Vecino",
        rating: ratingStars,
        comment: ratingComment.trim(),
        createdAt: new Date().toLocaleDateString("es-CO"),
        status: "Pendiente",
      };
      saveReviews([review, ...reviews]);
    }
    const updated = reservations.map((r) => (r.id === ratingResId ? { ...r, rated: true } : r));
    setReservations(updated);
    localStorage.setItem("ollacercana_reservations", JSON.stringify(updated));
    setRatingSubmitted(true);
    setRatingError("");
  };

  if (checkingSession || !user) {
    return (
      <main data-theme-page className="relative min-h-screen w-full bg-[#14110f] flex items-center justify-center">
        <p className="text-stone-400 text-sm font-semibold">Cargando...</p>
      </main>
    );
  }

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
          <AccountNav user={user} current="reservas" unreadCount={unreadCount} />

          <div className="space-y-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#131F18] border border-emerald-600/30 rounded-2xl p-4 shadow-md">
              <div>
                <h4 className="font-['Caveat',cursive] text-2xl font-bold text-[#F4C430] flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                  <span>Mis Reservas y Pedidos Realizados</span>
                </h4>
                <p className="text-xs text-stone-300">
                  Gestiona tus reservas activas en tiempo real o revisa tu historial para volver a pedir tus platos favoritos.
                </p>
              </div>
              <Link
                href="/menu"
                className="px-4 py-2 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Hacer Nuevo Pedido</span>
              </Link>
            </div>

            {/* Sub-tabs: Reservas Activas vs Historial de Reservas */}
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <button
                onClick={() => setCompradorSubTab("activas")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  compradorSubTab === "activas"
                    ? "bg-[#62B869] text-white shadow"
                    : "bg-black/40 border border-white/10 text-stone-400 hover:text-white"
                }`}
              >
                Reservas Activas ({reservations.filter((r) => r.status === "pending" || r.status === "confirmed").length})
              </button>
              <button
                onClick={() => setCompradorSubTab("historial")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  compradorSubTab === "historial"
                    ? "bg-amber-600 text-white shadow"
                    : "bg-black/40 border border-white/10 text-stone-400 hover:text-white"
                }`}
              >
                Historial y Volver a Pedir ({reservations.filter((r) => r.status === "closed" || r.status === "rejected").length})
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="p-10 rounded-2xl bg-black/60 border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-bold text-white">No tienes reservas registradas</h5>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Explora El Libretón de platos caseros preparados hoy por tus vecinas.
                  </p>
                </div>
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs transition-all shadow-lg"
                >
                  <span>Ir a El Libretón</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {reservations
                  .filter((res) =>
                    compradorSubTab === "activas"
                      ? res.status === "pending" || res.status === "confirmed"
                      : res.status === "closed" || res.status === "rejected"
                  )
                  .map((res) => (
                    <div
                      key={res.id}
                      className="p-5 rounded-2xl bg-[#efe0c2] border border-[#bda078] text-[#2b2117] space-y-4 shadow-lg hover:border-[#c84b31]/70 transition-all"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-dashed border-[#ae9066] pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#F0822D] font-bold">{res.id}</span>
                            <span className="text-xs text-[#80694d]">
                              · Cocina de <strong className="text-[#52663d]">{res.cookName || "Doña Elena"}</strong>
                            </span>
                          </div>
                          <h5 className="text-base font-bold text-[#2b2117] mt-0.5">{res.dish}</h5>
                        </div>

                        <div className="flex items-center gap-2">
                          {res.status === "pending" && (
                            <span className="px-3 py-1 rounded-full bg-[#fff0cf] border border-[#d6a248] text-[#70430c] text-xs font-mono flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              Quedan: {getRemainingTime(res.expiresAt)}
                            </span>
                          )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                              res.status === "pending"
                                ? "bg-[#fff0cf] text-[#70430c] border border-[#d6a248]"
                                : res.status === "confirmed"
                                ? "bg-[#e4efd8] text-[#304522] border border-[#82996b]"
                                : res.status === "closed"
                                ? "bg-[#e3e8eb] text-[#394b55] border border-[#82919a]"
                                : "bg-[#f5ded7] text-[#763725] border border-[#ad6c59]"
                            }`}
                          >
                            {res.status === "pending"
                              ? "En Espera"
                              : res.status === "confirmed"
                              ? "Confirmado"
                              : res.status === "closed"
                              ? "Completado"
                              : "Rechazado"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-[#6a5037]">
                        <div>
                          <span className="text-[#80694d] block text-[10px] uppercase">Cantidad</span>
                          <span className="font-semibold text-[#2b2117]">{res.quantity} porción(es)</span>
                        </div>
                        <div>
                          <span className="text-[#80694d] block text-[10px] uppercase">Medio de Pago</span>
                          <span className="font-semibold text-[#70430c]">{res.paymentMethod}</span>
                        </div>
                        <div>
                          <span className="text-[#80694d] block text-[10px] uppercase">Recogida Est.</span>
                          <span className="font-semibold text-[#2b2117]">{res.pickupTime || "15-20 min"}</span>
                        </div>
                        <div>
                          <span className="text-[#80694d] block text-[10px] uppercase">Total</span>
                          <span className="font-bold text-[#9b3f22]">{res.price}</span>
                        </div>
                      </div>

                      <div aria-label="Proceso del pedido" className="rounded-xl border border-[#c4a77d] bg-[#f7eddb] p-3">
                        <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-[#80694d]">Así avanza tu pedido</p>
                        <ol className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                          {[res.paymentReceipt ? "Comprobante enviado" : "Solicitud enviada", "Cocinera confirma", "Preparación y entrega", "Recibido"].map((step, index) => {
                            const activeStep = res.status === "closed" ? 3 : res.status === "confirmed" ? (res.cocineraConfirmedDelivery ? 2 : 1) : 0;
                            const done = index <= activeStep;
                            const current = !done && ((res.status === "pending" && index === 1) || (res.status === "confirmed" && index === activeStep + 1));
                            return <li key={step} className={`flex items-center gap-1.5 text-[10px] leading-tight ${done ? "text-[#304522]" : current ? "text-[#70430c]" : "text-[#594735]"}`}><span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[9px] font-bold ${done ? "border-[#708b59] bg-[#e4efd8] text-[#304522]" : current ? "border-[#d6a248] bg-[#fff0cf] text-[#70430c]" : "border-[#9b8567] bg-[#f5e9d2] text-[#594735]"}`}>{done ? "✓" : index + 1}</span>{step}</li>;
                          })}
                        </ol>
                        {res.paymentReceipt && <a href={res.paymentReceipt} target="_blank" rel="noreferrer" className="mt-2 inline-block text-[11px] font-bold text-[#304522] underline underline-offset-2">Comprobante adjunto: {res.paymentReceiptName || "ver archivo"}</a>}
                      </div>

                      {res.status === "rejected" && (
                        <div className="p-3 rounded-xl bg-[#f5ded7] border border-[#ad6c59] text-[#763725] text-xs">
                          <strong>Motivo de rechazo:</strong> {res.rejectionReason || "Sin porciones disponibles"}
                          {res.rejectionComment && <p className="text-[11px] text-[#763725] italic mt-1">"{res.rejectionComment}"</p>}
                        </div>
                      )}

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                        <button
                          onClick={() => setActiveChatReservationId(res.id)}
                          disabled={res.status === "closed"}
                          className="px-4 py-2 rounded-xl bg-stone-900 border border-white/15 hover:border-[#F0822D] text-stone-200 hover:text-white text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <MessageSquare className="w-4 h-4 text-[#F0822D]" />
                          <span>{res.status === "closed" ? "Chat finalizado" : "Chat con cocinera"}</span>
                        </button>

                        {compradorSubTab === "historial" && (
                          <Link
                            href="/menu"
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F0822D] to-[#E06F1A] hover:brightness-110 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Volver a Pedir</span>
                          </Link>
                        )}

                        {res.status === "confirmed" && !res.compradorClosedAt && (
                          <button
                            onClick={() => handleSimulateCompradorConfirm(res.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Marcar pedido recibido y cerrar chat</span>
                          </button>
                        )}
                      </div>

                      {res.status === "confirmed" && res.compradorClosedAt && !res.cocineraClosedAt && (
                        <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Confirmación pendiente por la cocinera.</span>
                        </div>
                      )}

                      {res.status === "closed" && (
                        <div className="p-3 rounded-xl bg-sky-950/60 border border-sky-500/40 flex items-center justify-between text-xs text-sky-200">
                          <span className="flex items-center gap-2 font-semibold">
                            <CheckCircle2 className="w-4 h-4 text-sky-400" />
                            Transacción completada {res.isAutoClosed ? "(Cierre automático por 24h)" : ""}
                          </span>

                          {!res.rated ? (
                            <button
                              onClick={() => { setRatingStars(0); setRatingComment(""); setRatingError(""); setRatingSubmitted(false); setRatingResId(res.id); }}
                              className="px-4 py-1.5 rounded-lg bg-sky-400 hover:bg-sky-300 text-black font-bold text-xs transition-colors cursor-pointer"
                            >
                              Calificar
                            </button>
                          ) : (
                            <span className="text-amber-300 font-mono">★ Reseña enviada · pendiente de publicación</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
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

      {ratingResId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="rating-title" className="max-w-md w-full bg-[#f4e8cf] border-2 border-[#b89a6f] text-[#30251b] rounded-3xl p-6 shadow-2xl space-y-4">
            <h4 id="rating-title" className="font-['Caveat',cursive] text-3xl font-bold">Cuéntanos cómo te fue</h4>
            <p className="text-sm text-[#6a5037]">Tu opinión ayuda a que el barrio elija con confianza. Pedido {ratingResId}.</p>

            {ratingSubmitted ? (
              <div role="status" className="space-y-4">
                <p className="rounded-xl border border-emerald-700/30 bg-emerald-100 p-4 text-center text-sm font-semibold text-emerald-900">Tu reseña se publicará al cumplirse la ventana</p>
                <button onClick={() => setRatingResId(null)} className="w-full rounded-xl bg-[#526f42] py-3 text-sm font-bold text-white">Cerrar</button>
              </div>
            ) : <>
            <div className="flex items-center justify-center gap-2 my-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => { setRatingStars(star); setRatingError(""); }}
                  aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
                  aria-pressed={star === ratingStars}
                  className="p-1 text-amber-500 hover:scale-110 transition-transform"
                >
                  <Star className={`w-7 h-7 ${star <= ratingStars ? "fill-amber-400" : "text-stone-700"}`} />
                </button>
              ))}
            </div>

            <label htmlFor="review-comment" className="block text-left text-sm font-semibold">Comentario <span className="font-normal text-[#80694d]">(obligatorio)</span></label>
            <textarea id="review-comment" rows={3} maxLength={400} value={ratingComment} onChange={(event) => { setRatingComment(event.target.value); if (event.target.value.trim()) setRatingError(""); }} placeholder="¿Qué te gustó del sabor, la porción o la atención?" required className="w-full resize-y rounded-xl border border-[#b89a6f] bg-white/75 p-3 text-sm text-[#30251b] placeholder:text-[#9b8668] focus:outline-none focus:ring-2 focus:ring-[#526f42]" />
            {ratingError && <p role="alert" className="text-sm font-semibold text-red-700">{ratingError}</p>}

            <div className="flex gap-3">
              <button onClick={() => setRatingResId(null)} className="flex-1 rounded-xl border border-[#8f795b] py-3 text-sm font-semibold text-[#57452f]">Ahora no</button>
              <button onClick={handleRatingSubmit} className="flex-1 rounded-xl bg-[#526f42] py-3 text-sm font-bold text-white hover:bg-[#415a35]">Enviar reseña</button>
            </div>
            </>}
          </div>
        </div>
      )}

      {user && (
        <ChatModal
          isOpen={!!activeChatReservationId}
          onClose={() => setActiveChatReservationId(null)}
          reservationId={activeChatReservationId}
          currentUser={user}
          onOpenRatingModal={(resId) => setRatingResId(resId)}
        />
      )}
    </main>
  );
}
