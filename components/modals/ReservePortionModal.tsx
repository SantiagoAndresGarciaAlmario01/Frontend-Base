"use client";

import React, { useState } from "react";
import {
  DishItem,
  getStoredDishes,
  getStoredReservations,
  Reservation,
  saveDishes,
  saveReservations,
  UserProfile,
} from "@/lib/ollacercana-store";
import { MapPin, Star, X, Flame, Sparkles, Clock, CreditCard, Plus, Minus, AlertTriangle } from "lucide-react";

interface ReservePortionModalProps {
  isOpen: boolean;
  onClose: () => void;
  dish: DishItem | null;
  currentUser: UserProfile;
  onReservationCreated: (reservationId: string) => void;
  onRequestPhoneVerification: () => void;
}

export default function ReservePortionModal({
  isOpen,
  onClose,
  dish,
  currentUser,
  onReservationCreated,
  onRequestPhoneVerification,
}: ReservePortionModalProps) {
  const [portions, setPortions] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Nequi" | "Daviplata">("Nequi");
  const [pickupTime, setPickupTime] = useState("Lo antes posible (15-20 min)");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen || !dish) return null;

  const maxAvailable = dish.availablePortions;
  const totalPrice = dish.price * portions;
  const formattedTotal = `$${totalPrice.toLocaleString("es-CO")}`;

  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // HU-03 phone verification check
    if (!currentUser.phoneVerified) {
      setError("Debes verificar tu número de celular antes de realizar una reserva.");
      onRequestPhoneVerification();
      return;
    }

    if (dish.status !== "DISPONIBLE" || maxAvailable <= 0) {
      setError("Este plato ya no tiene porciones disponibles.");
      return;
    }

    if (portions > maxAvailable) {
      setError(`Solo hay ${maxAvailable} porción(es) disponible(s).`);
      return;
    }

    // 1. Create reservation item (HU-11)
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000).toISOString(); // 10 min countdown (HU-12)

    const buyerDisplayName = currentUser.name || currentUser.email || "Vecino Comprador";

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      dishId: dish.id,
      dishName: dish.name,
      dishImage: dish.image,
      cookId: dish.cookId,
      cookName: dish.cook,
      buyerName: buyerDisplayName,
      buyerEmail: currentUser.email,
      portions,
      pricePerPortion: dish.price,
      totalPrice,
      preferredPaymentMethod: paymentMethod,
      pickupTime,
      status: "PENDIENTE",
      createdAt: now.toISOString(),
      expiresAt,
    };

    const currentReservations = getStoredReservations();
    saveReservations([newReservation, ...currentReservations]);

    // 2. Decrement available portions of dish (HU-05)
    const currentDishes = getStoredDishes();
    const updatedDishes = currentDishes.map((d) => {
      if (d.id === dish.id) {
        const newAvailable = Math.max(0, d.availablePortions - portions);
        return {
          ...d,
          availablePortions: newAvailable,
          reservedPortions: d.reservedPortions + portions,
          status: (newAvailable === 0 ? "AGOTADO" : "DISPONIBLE") as any,
        };
      }
      return d;
    });
    saveDishes(updatedDishes);

    setSuccess("¡Reserva confirmada con éxito! Se ha abierto la sala de chat con la cocinera.");
    setTimeout(() => {
      onReservationCreated(newReservation.id);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#181A1C] border border-stone-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden relative my-4 text-stone-900">
        
        {/* ── 1. DARK CHALKBOARD TOP HEADER (EXACT MATCH TO REFERENCE) ── */}
        <div className="bg-[#1A1C1E] p-6 sm:p-7 text-white relative border-b border-stone-800/80">
          {/* Top Pills Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Cocinando ahora
              </span>
              <span className="px-3 py-1 rounded-full bg-stone-800/80 border border-stone-700/60 text-stone-300 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F0822D]" />
                <span>{dish.distance || "A 320 m de tu casa"}</span>
              </span>
            </div>

            {/* Circular Close Button */}
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-black/60 hover:bg-black text-stone-300 hover:text-white flex items-center justify-center transition-colors shadow-md shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dish Title */}
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight mb-3">
            {dish.name}
          </h2>

          {/* Price & Badge Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#62B869] tracking-tight">
                {dish.formattedPrice}
              </span>
              <span className="text-xs text-stone-400 font-medium">por porción completa</span>
            </div>

            {dish.badge && (
              <span className="px-3.5 py-1 rounded-full border border-[#F0822D]/60 bg-[#F0822D]/10 text-[#F0822D] font-serif text-xs font-bold shadow-xs">
                {dish.badge}
              </span>
            )}
          </div>
        </div>

        {/* ── 2. LIGHT CREAM / OFF-WHITE CARD BODY ── */}
        <div className="bg-[#FAF6F0] p-6 sm:p-7 space-y-5 max-h-[72vh] overflow-y-auto">
          
          {/* Dish Photo Card with Badge */}
          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-lg border border-stone-300/70">
            <img
              src={dish.image}
              alt={dish.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-amber-200 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Foto real del plato de hoy</span>
            </div>
          </div>

          {/* Dish Description */}
          <p className="text-stone-700 text-sm leading-relaxed font-medium">
            {dish.description}
          </p>

          {/* Cook Profile Card */}
          <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={dish.cookAvatar || "/images/dona_rosa_mascot.jpg"}
                  alt={dish.cook}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/images/dona_rosa_mascot.jpg";
                  }}
                  className="w-12 h-12 rounded-full object-cover border-2 border-orange-200 shadow-xs"
                />
                <div>
                  <h4 className="font-bold text-stone-900 text-base leading-tight">{dish.cook}</h4>
                  <p className="text-xs text-stone-500 font-medium pt-0.5">
                    {dish.residentialComplex || "Calle 64 # 4-22 (casa blanca con zaguán)"}
                  </p>
                </div>
              </div>

              {/* Cook Rating Pill */}
              <div className="px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-700 font-bold text-xs flex items-center gap-1 shrink-0 shadow-2xs">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{dish.rating || "4,9"} ({dish.reviews || 124})</span>
              </div>
            </div>

            {/* Orange Vertical Bar: "NOTA DE LA COCINERA" */}
            <div className="bg-amber-500/5 border-l-4 border-[#F0822D] rounded-r-xl p-3 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#F0822D] block">
                NOTA DE LA COCINERA:
              </span>
              <p className="font-serif italic text-stone-700 text-xs sm:text-sm leading-relaxed">
                «Amasé las arepas de choclo esta mañana tempranito, con queso campesino fresco.»
              </p>
            </div>
          </div>

          {/* Error and Success Alerts */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 text-red-800 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs rounded-xl font-bold">
              {success}
            </div>
          )}

          {/* ── 3. RESERVATION SPECIFICATIONS FORM (JIRA REQUIREMENTS) ── */}
          <form onSubmit={handleConfirmReservation} className="space-y-4 pt-1">
            
            {/* Portion Counter */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-stone-800 block">Cantidad de porciones</label>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {dish.availablePortions} porciones disponibles hoy
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPortions((p) => Math.max(1, p - 1))}
                  className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-lg font-extrabold text-stone-900 w-6 text-center">{portions}</span>
                <button
                  type="button"
                  onClick={() => setPortions((p) => Math.min(maxAvailable, p + 1))}
                  className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center transition-colors shadow-2xs"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Payment Method Options */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-2">
              <label className="text-xs font-bold text-stone-800 block">
                Medio de pago preferido (acordar con cocinera)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Nequi", "Daviplata", "Efectivo"] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`py-2 px-2 text-xs rounded-xl border text-center font-bold transition-all ${
                      paymentMethod === method
                        ? "bg-[#F0822D] border-[#F0822D] text-white shadow-md"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Estimated Pickup Time */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 shadow-sm space-y-1.5">
              <label className="text-xs font-bold text-stone-800 block">
                Hora estimada de recogida
              </label>
              <select
                value={pickupTime}
                onChange={(e) => setPickupTime(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-semibold text-stone-800 focus:outline-none focus:border-[#F0822D]"
              >
                <option value="Lo antes posible (15-20 min)">Lo antes posible (15-20 min)</option>
                <option value="12:30 PM">12:30 PM</option>
                <option value="1:00 PM">1:00 PM</option>
                <option value="1:30 PM">1:30 PM</option>
                <option value="2:00 PM">2:00 PM</option>
                <option value="Acordar por chat">Acordar por chat</option>
              </select>
            </div>

            {/* MANDATORY RN-02 / HU-14 DISCLAIMER */}
            <div className="p-4 bg-amber-50 border border-amber-300/80 rounded-2xl text-amber-900 text-xs leading-relaxed space-y-1 shadow-2xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-900 font-bold mb-0.5">
                    Aviso Importante de Pago (RN-02 / HU-14):
                  </strong>
                  OllaCercana no procesa dinero directamente. El pago total de{" "}
                  <strong className="text-amber-950 font-black">{formattedTotal}</strong> se coordinará directamente
                  entre tú y <strong className="text-amber-950 font-black">{dish.cook}</strong> al momento de entregar tus porciones (vía {paymentMethod} o efectivo).
                </div>
              </div>
            </div>

            {/* Action Buttons (Matching Screenshot) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#F0822D] to-[#E06F1A] hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Confirmar Reserva y Pedir ({formattedTotal}) →</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-3.5 px-6 rounded-full bg-stone-200/90 hover:bg-stone-300 text-stone-700 font-bold text-sm transition-all cursor-pointer text-center"
              >
                Seguir explorando
              </button>
            </div>

          </form>

        </div>

      </div>
    </div>
  );
}
