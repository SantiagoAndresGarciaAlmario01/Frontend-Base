"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import AccountNav from "@/components/AccountNav";
import ChatModal from "@/components/modals/ChatModal";
import { getStoredReservations, getStoredMessages, getStoredNotifications, saveReservations } from "@/lib/ollacercana-store";
import { MessageSquare, ChefHat, HelpCircle, Home } from "lucide-react";

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

export default function ChatsPage() {
  const router = useRouter();
  const [checkingSession, setCheckingSession] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [unreadByReservation, setUnreadByReservation] = useState<Record<string, number>>({});

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [activeChatReservationId, setActiveChatReservationId] = useState<string | null>(null);

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

    if (parsed.role !== "comprador" && parsed.role !== "cocinera") {
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

    const viewerName = parsed.name || parsed.commercialName || parsed.email;
    const calculateUnread = () => loadedRes.reduce((counts, reservation) => {
      const messages = getStoredMessages(reservation.id);
      const marker = localStorage.getItem(`ollacercana_chat_read_${reservation.id}_${parsed.email}`);
      const markerIndex = marker ? messages.findIndex((message) => message.id === marker) : -1;
      const incoming = messages.slice(markerIndex + 1).filter((message) =>
        message.sender !== viewerName && message.sender !== parsed.commercialName && message.sender !== parsed.email && message.sender !== "Sistema OllaCercana"
      );
      counts[reservation.id] = incoming.length;
      return counts;
    }, {} as Record<string, number>);
    const unreadCounts = calculateUnread();
    setUnreadByReservation(unreadCounts);
    setUnreadMessages(Object.values(unreadCounts).reduce((total, count) => total + count, 0));

    try {
      setUnreadCount(getStoredNotifications().filter((n) => (n.targetEmail === parsed.email || n.targetEmail === "usuario") && !n.read).length);
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
          <AccountNav user={user} current="chats" unreadCount={unreadCount} unreadMessageCount={unreadMessages} />

          <div className="space-y-6 text-left">
            <div className="flex flex-wrap items-center justify-between gap-3 bg-[#efe0c2] border border-[#9b774f] rounded-2xl p-4 shadow-md text-[#2b2117]">
              <div>
                <h4 className="font-['Caveat',cursive] text-2xl font-bold text-[#493323] flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-[#a84029]" />
                  <span>Conversaciones de tus pedidos</span>
                </h4>
                <p className="text-xs text-[#5b4a38]">Coordina cada reserva directamente con la cocinera, sin salir de OllaCercana.</p>
              </div>
            </div>

            {reservations.length === 0 ? (
              <div className="p-10 rounded-2xl bg-black/60 border border-white/10 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-stone-800 flex items-center justify-center mx-auto text-stone-400">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-base font-bold text-white">No tienes conversaciones activas</h5>
                  <p className="text-xs text-stone-400 max-w-sm mx-auto">
                    Al realizar una reserva en El Libretón, se abre automáticamente la sala de chat privada.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {reservations.map((res) => {
                  const msgs = getStoredMessages(res.id);
                  const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
                  const unreadForChat = unreadByReservation[res.id] ?? 0;

                  const openChat = () => {
                    if (lastMsg) localStorage.setItem(`ollacercana_chat_read_${res.id}_${user.email}`, lastMsg.id);
                    setUnreadMessages((count) => Math.max(0, count - unreadForChat));
                    setUnreadByReservation((counts) => ({ ...counts, [res.id]: 0 }));
                    setActiveChatReservationId(res.id);
                  };

                  return (
                    <div
                      key={res.id}
                      className="p-4 rounded-2xl bg-[#efe0c2] border border-[#bda078] text-[#2b2117] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg hover:border-[#c84b31]/70 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center text-[#F0822D] font-bold shrink-0 mt-0.5">
                          <ChefHat className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                          <h5 className="text-sm font-bold text-[#2b2117]">{res.dish}</h5>
                            <span className="text-xs text-[#6a5037]">Cocina de {res.cookName || "Doña Elena"}</span>
                          </div>

                          <div className="flex items-center gap-2">
                          <p className="min-w-0 text-xs text-[#5b4a38] italic line-clamp-1">
                            {lastMsg ? (
                              <span>
                                <strong>{lastMsg.sender}:</strong> "{lastMsg.text}"
                              </span>
                            ) : (
                              <span className="text-[#80694d] font-normal">Aún no hay mensajes. Entra a coordinar tu pedido.</span>
                            )}
                          </p>
                          {unreadForChat > 0 && <span className="shrink-0 rounded-full bg-[#a84029] px-2 py-0.5 text-[10px] font-bold text-white">{unreadForChat} sin leer</span>}
                          </div>
                          {res.status === "closed" && <p className="text-[10px] font-bold text-[#80694d]">Pedido recibido · conversación finalizada</p>}
                        </div>
                      </div>

                      <button
                        onClick={openChat}
                        disabled={res.status === "closed" || res.status === "rejected"}
                        className="px-4 py-2.5 rounded-xl bg-[#F0822D] hover:bg-[#d97224] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shrink-0 shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        <span>{res.status === "closed" ? "Chat finalizado" : res.status === "rejected" ? "Solicitud cerrada" : "Abrir conversación"}</span>
                      </button>
                    </div>
                  );
                })}
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

      {user && (
        <ChatModal
          isOpen={!!activeChatReservationId}
          onClose={() => {
            setActiveChatReservationId(null);
            const identity = user.email;
            const incomingTotal = reservations.reduce((total, item) => {
              const messages = getStoredMessages(item.id);
              const marker = localStorage.getItem(`ollacercana_chat_read_${item.id}_${identity}`);
              const markerIndex = marker ? messages.findIndex((message) => message.id === marker) : -1;
              return total + messages.slice(markerIndex + 1).filter((message) => message.sender !== user.name && message.sender !== user.commercialName && message.sender !== user.email && message.sender !== "Sistema OllaCercana").length;
            }, 0);
            setUnreadMessages(incomingTotal);
            setUnreadByReservation((counts) => {
              const updated = { ...counts };
              for (const item of reservations) {
                const messages = getStoredMessages(item.id);
                const marker = localStorage.getItem(`ollacercana_chat_read_${item.id}_${identity}`);
                const markerIndex = marker ? messages.findIndex((message) => message.id === marker) : -1;
                updated[item.id] = messages.slice(markerIndex + 1).filter((message) => message.sender !== user.name && message.sender !== user.commercialName && message.sender !== user.email && message.sender !== "Sistema OllaCercana").length;
              }
              return updated;
            });
            const sharedReservations = getStoredReservations();
            setReservations((previous) => previous.map((item) => {
              const shared = sharedReservations.find((reservation) => reservation.id === item.id);
              return shared?.status === "COMPLETADA" ? { ...item, status: "closed" } : item;
            }));
          }}
          reservationId={activeChatReservationId}
          currentUser={user}
          onOpenRatingModal={() => {}}
        />
      )}
    </main>
  );
}
