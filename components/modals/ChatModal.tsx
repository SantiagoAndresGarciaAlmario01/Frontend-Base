"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChatMessage,
  getStoredMessages,
  getStoredReservations,
  Reservation,
  saveMessages,
  saveReservations,
  UserProfile,
} from "@/lib/ollacercana-store";
import { MessageSquare, Clock, Lock, CheckCircle2, X, Send } from "lucide-react";

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string | null;
  currentUser: UserProfile;
  onOpenRatingModal?: (reservationId: string, cookId: string) => void;
}

export default function ChatModal({
  isOpen,
  onClose,
  reservationId,
  currentUser,
  onOpenRatingModal,
}: ChatModalProps) {
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [timeLeftStr, setTimeLeftStr] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load reservation & chat history
  useEffect(() => {
    if (!reservationId || !isOpen) return;
    const reservations = getStoredReservations();
    const found = reservations.find((r) => r.id === reservationId);
    if (found) {
      setReservation(found);
      const history = getStoredMessages(found.id);
      if (history.length === 0) {
        // Initial automatic welcome message from cook
        const initialMsgs: ChatMessage[] = [
          {
            id: `msg-init-${Date.now()}`,
            reservationId: found.id,
            sender: found.cookName,
            text: `¡Hola ${found.buyerName}! Gracias por tu reserva de ${found.portions} porción(es) de ${found.dishName}. Tu pedido estará listo para las ${found.pickupTime}.`,
            timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
          },
        ];
        saveMessages(found.id, initialMsgs);
        setMessages(initialMsgs);
        localStorage.setItem(`ollacercana_chat_read_${found.id}_${currentUser.email}`, initialMsgs[initialMsgs.length - 1].id);
      } else {
        setMessages(history);
        const viewerName = currentUser.name || currentUser.commercialName || currentUser.email;
        const lastIncoming = [...history].reverse().find((message) => message.sender !== viewerName && message.sender !== currentUser.commercialName && message.sender !== currentUser.email && message.sender !== "Sistema OllaCercana");
        if (lastIncoming) localStorage.setItem(`ollacercana_chat_read_${found.id}_${currentUser.email}`, history[history.length - 1].id);
      }
    }
  }, [reservationId, isOpen, currentUser.commercialName, currentUser.email, currentUser.name]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Countdown timer for 10-min confirmation (HU-12)
  useEffect(() => {
    if (!reservation || reservation.status !== "PENDIENTE") return;

    const updateTimer = () => {
      const now = new Date().getTime();
      const expiry = new Date(reservation.expiresAt).getTime();
      const diff = expiry - now;
      if (diff <= 0) {
        setTimeLeftStr("Expirado");
        // Auto expire if 10 mins passed
        const reservations = getStoredReservations();
        const updated = reservations.map((r) =>
          r.id === reservation.id ? { ...r, status: "EXPIRADA" as const } : r
        );
        saveReservations(updated);
        setReservation((prev) => (prev ? { ...prev, status: "EXPIRADA" } : null));
      } else {
        const mins = Math.floor(diff / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeftStr(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [reservation]);

  if (!isOpen || !reservation) return null;

  const isReadOnly =
    reservation.status === "COMPLETADA" ||
    reservation.status === "RECHAZADA" ||
    reservation.status === "EXPIRADA";

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text || text.trim().length === 0 || isReadOnly) return;

    const senderName = currentUser.name || currentUser.commercialName || currentUser.email || "Usuario";

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      reservationId: reservation.id,
      sender: senderName,
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [...messages, newMsg];
    setMessages(updated);
    saveMessages(reservation.id, updated);
    if (!textToSend) setInputMessage("");
  };

  const handleConfirmDelivery = () => {
    const reservations = getStoredReservations();
    const updated = reservations.map((r) => {
      if (r.id === reservation.id) {
        return {
          ...r,
          status: "COMPLETADA" as const,
          buyerConfirmedDelivery: true,
          cookConfirmedDelivery: true,
        };
      }
      return r;
    });
    saveReservations(updated);
    setReservation((prev) => (prev ? { ...prev, status: "COMPLETADA" } : null));

    // System message in chat
    const sysMsg: ChatMessage = {
      id: `msg-sys-${Date.now()}`,
      reservationId: reservation.id,
      sender: "Sistema OllaCercana",
      text: "Entrega confirmada y completada con éxito. ¡Gracias por apoyar la cocina vecinal!",
      timestamp: new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" }),
    };
    const updatedMsgs = [...messages, sysMsg];
    setMessages(updatedMsgs);
    saveMessages(reservation.id, updatedMsgs);
    window.setTimeout(onClose, 1200);

    // Open rating modal for buyer (HU-15)
    if (onOpenRatingModal) {
      setTimeout(() => {
        onOpenRatingModal(reservation.id, reservation.cookId);
      }, 800);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#162119] border border-amber-600/30 text-amber-100 rounded-2xl w-full max-w-lg h-[620px] max-h-[calc(100vh-2rem)] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="bg-[#101712] p-4 border-b border-amber-800/40 flex items-center justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-[#F0822D]" />
            </div>
            <div className="min-w-0">
              <h3 className="font-playfair text-base font-bold text-amber-200">
                Chat de Reserva #{reservation.id.slice(-4)}
              </h3>
              <p className="break-words text-xs text-amber-300/80">
                {reservation.dishName} ({reservation.portions} porción/es) — ${reservation.totalPrice.toLocaleString("es-CO")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-amber-300 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Reservation Status Bar */}
        <div className="bg-[#1C2C20] px-4 py-2.5 border-b border-amber-900/40 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                reservation.status === "PENDIENTE"
                  ? "bg-amber-400 animate-pulse"
                  : reservation.status === "COMPLETADA"
                  ? "bg-emerald-400"
                  : "bg-red-400"
              }`}
            />
            <span className="font-semibold text-amber-100">Estado: {reservation.status === "PENDIENTE" ? "Esperando confirmación" : reservation.status === "CONFIRMADO" ? "Pedido confirmado" : reservation.status === "COMPLETADA" ? "Pedido recibido · chat cerrado" : reservation.status === "RECHAZADA" ? "Solicitud rechazada" : "Solicitud expirada"}</span>
          </div>

          {reservation.status === "PENDIENTE" && timeLeftStr && (
            <span className="text-[11px] bg-amber-950/80 border border-amber-600/50 text-amber-200 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Tiempo: {timeLeftStr}</span>
            </span>
          )}

          {reservation.status === "CONFIRMADO" && (
            <button
              onClick={handleConfirmDelivery}
              className="bg-[#62B869] hover:bg-[#4E9A54] text-white px-3 py-1 rounded-lg text-xs font-semibold shadow transition-all flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Marcar como recibido y cerrar chat</span>
            </button>
          )}
          {reservation.status === "PENDIENTE" && <span className="text-[11px] text-amber-200">La cocinera debe confirmar antes de preparar el pedido.</span>}
        </div>

        {/* Chat Messages */}
        <div className="min-h-0 flex-1 p-4 overflow-y-auto space-y-3 bg-[#121A14]">
          {messages.map((msg) => {
            const isMe = msg.sender === (currentUser.name || currentUser.commercialName || currentUser.email);
            const isSys = msg.sender === "Sistema OllaCercana";

            if (isSys) {
              return (
                <div key={msg.id} className="text-center my-2">
                  <span className="inline-block bg-emerald-950/80 border border-emerald-600/40 text-emerald-200 text-xs px-3 py-1 rounded-full">
                    {msg.text}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div className="text-[10px] text-amber-400/60 mb-0.5 px-1 font-semibold">
                  {msg.sender} • {msg.timestamp}
                </div>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                    isMe
                      ? "bg-gradient-to-r from-[#F0822D] to-[#E06F1A] text-white rounded-tr-none shadow-md font-medium"
                      : "bg-[#1B291F] border border-amber-800/40 text-amber-100 rounded-tl-none shadow-md"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Read-Only Banner (HU-23) */}
        {isReadOnly ? (
          <div className="p-3 bg-amber-950/90 border-t border-amber-800/50 text-amber-200 text-xs text-center font-medium flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Esta conversación ha finalizado y se encuentra en modo solo lectura. (HU-23)</span>
          </div>
        ) : (
          <div className="p-3 bg-[#101712] border-t border-amber-800/40 space-y-2">
            {/* Quick replies */}
            <div className="flex gap-2 overflow-x-auto pb-1 text-[11px] scrollbar-none">
              {["Ya salí a entregar", "Estoy en la portería", "Confirmo pago recibido", "¡Muchas gracias!"].map((quick) => (
                <button
                  key={quick}
                  onClick={() => handleSendMessage(quick)}
                  className="bg-[#1C2C20] hover:bg-[#253A2A] text-amber-200 border border-amber-700/40 px-2.5 py-1 rounded-full whitespace-nowrap transition-all font-medium"
                >
                  {quick}
                </button>
              ))}
            </div>

            {/* Input area */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Escribe un mensaje..."
                className="flex-1 bg-[#1A261D] border border-amber-700/50 rounded-xl px-3.5 py-2 text-xs text-white placeholder-amber-500/40 focus:outline-none focus:border-[#F0822D]"
              />
              <button
                type="submit"
                className="bg-[#F0822D] hover:bg-[#E06F1A] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow flex items-center gap-1"
              >
                <span>Enviar</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
