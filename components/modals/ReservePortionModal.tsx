"use client";

import React, { useState } from "react";
import {
  DishItem,
  getStoredDishes,
  getStoredReservations,
  addNotification,
  Reservation,
  saveDishes,
  saveReservations,
  UserProfile,
} from "@/lib/ollacercana-store";
import { MapPin, Star, X, Flame, Sparkles, Clock, CreditCard, Plus, Minus, AlertTriangle, Upload, CheckCircle2, KeyRound, Banknote } from "lucide-react";

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
  const [paymentMethod, setPaymentMethod] = useState<"Efectivo" | "Nequi" | "Llaves">("Nequi");
  const [paymentReceipt, setPaymentReceipt] = useState("");
  const [paymentReceiptName, setPaymentReceiptName] = useState("");
  const [pickupTime, setPickupTime] = useState("Lo antes posible (15-20 min)");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleClose = () => {
    setPortions(1);
    setPaymentMethod("Nequi");
    setPaymentReceipt("");
    setPaymentReceiptName("");
    setPickupTime("Lo antes posible (15-20 min)");
    setError("");
    setSuccess("");
    setSubmitting(false);
    onClose();
  };

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

    if (paymentMethod !== "Efectivo" && !paymentReceipt) {
      setError("Adjunta el comprobante de pago para enviar la solicitud a la cocinera.");
      return;
    }

    setSubmitting(true);

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
      paymentReceipt: paymentReceipt || undefined,
      paymentReceiptName: paymentReceiptName || undefined,
      pickupTime,
      status: "PENDIENTE",
      createdAt: now.toISOString(),
      expiresAt,
    };

    const currentReservations = getStoredReservations();
    try {
      saveReservations([newReservation, ...currentReservations]);
    } catch {
      setError("No se pudo guardar la solicitud. El comprobante ocupa demasiado espacio; adjunta una imagen más liviana o un PDF más pequeño.");
      setSubmitting(false);
      return;
    }
    addNotification(
      "Solicitud enviada",
      `Tu solicitud de ${dish.name} se envió a ${dish.cook}. Te avisaremos cuando responda.`,
      currentUser.email,
    );

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

    setSuccess(paymentMethod === "Efectivo"
      ? "Solicitud enviada. La cocinera debe confirmar la reserva; el pago se acuerda al recoger."
      : "Comprobante adjunto. La solicitud fue enviada a la cocinera para que pueda confirmar la reserva.");
    setTimeout(() => {
      onReservationCreated(newReservation.id);
      handleClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="reserve-dish-title" className="bg-[#e8d1a3] border-[5px] border-[#8d5b37] rounded-3xl max-w-xl w-full max-h-[calc(100dvh-1.5rem)] shadow-2xl overflow-y-auto overscroll-contain relative text-stone-900">
        <div aria-hidden="true" className="absolute z-20 top-0 left-1/2 -translate-x-1/2 -rotate-2 w-28 h-8 bg-[#d6b776]/90 border-x border-[#b99655]/70 shadow-[0_2px_4px_rgba(0,0,0,0.2)]" />
        
        {/* ── 1. RECIPE NOTE HEADER ── */}
        <div className="bg-[#e8d1a3] p-4 pt-7 sm:p-6 sm:pt-8 text-[#493323] relative border-b border-dashed border-[#927148] shadow-[inset_0_0_30px_rgba(139,94,48,0.16)]" style={{ backgroundImage: "radial-gradient(ellipse at 15% 10%, rgba(255,255,235,.48), transparent 35%), radial-gradient(ellipse at 95% 88%, rgba(135,82,35,.18), transparent 38%), repeating-linear-gradient(4deg, rgba(117,77,41,.035) 0px, rgba(117,77,41,.035) 1px, transparent 2px, transparent 5px)" }}>
          {/* Top Pills Row */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Cocinando ahora
              </span>
              <span className="px-3 py-1 rounded-full bg-[#f3dfb9] border border-[#dfc79c] text-stone-700 text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F0822D]" />
                <span>{dish.distance || "A 320 m de tu casa"}</span>
              </span>
            </div>

            {/* Circular Close Button */}
            <button
              type="button"
              onClick={handleClose}
              aria-label="Cerrar reserva"
              className="w-8 h-8 rounded-full bg-[#a84c2f] hover:bg-[#873820] text-white flex items-center justify-center transition-colors shadow-md shrink-0"
              title="Cerrar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Dish Title */}
          <span className="font-['Caveat',cursive] text-sm font-bold text-[#a84c2f]">Receta de la vecina · apuntada en el libretón</span>
          <h2 id="reserve-dish-title" className="font-['Caveat',cursive] text-3xl sm:text-4xl font-bold text-[#493323] tracking-tight leading-tight mb-3 mt-1">
            {dish.name}
          </h2>

          {/* Price & Badge Row */}
          <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
            <div className="flex items-baseline gap-2">
              <span className="font-['Caveat',cursive] text-3xl font-bold text-[#a84c2f] tracking-tight">
                {dish.formattedPrice}
              </span>
              <span className="text-xs text-stone-600 font-medium">por porción completa</span>
            </div>

            {dish.badge && (
              <span className="px-3.5 py-1 rounded-full border border-[#bd7540] bg-[#e9c995]/40 text-[#8d4e2c] font-['Caveat',cursive] text-sm font-bold shadow-xs">
                {dish.badge}
              </span>
            )}
          </div>
        </div>

        {/* ── 2. LIGHT CREAM / OFF-WHITE CARD BODY ── */}
        <div className="bg-[#FAF6F0] p-4 sm:p-6 space-y-4 sm:space-y-5">
          
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
                ¿Cómo acordarás el pago?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["Nequi", "Llaves", "Efectivo"] as const).map((method) => (
                  <button
                    type="button"
                    key={method}
                    onClick={() => {
                      if (paymentMethod !== method) {
                        setPaymentReceipt("");
                        setPaymentReceiptName("");
                        setError("");
                      }
                      setPaymentMethod(method);
                    }}
                    className={`py-2 px-2 text-xs rounded-xl border text-center font-bold transition-all ${
                      paymentMethod === method
                        ? "bg-[#F0822D] border-[#F0822D] text-white shadow-md"
                        : "bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100"
                    }`}
                  >
                    <span className="flex items-center justify-center gap-1.5"><span className={`flex h-5 w-5 items-center justify-center rounded-md text-[10px] font-black ${method === "Nequi" ? "bg-[#e6007e] text-white" : method === "Llaves" ? "bg-[#526f42] text-white" : "bg-[#80694d] text-white"}`}>{method === "Nequi" ? "n" : method === "Llaves" ? <KeyRound className="h-3 w-3" /> : <Banknote className="h-3 w-3" />}</span><span>{method === "Nequi" ? "nequi" : method}</span></span>
                    {method === "Llaves" && <span className="mt-0.5 block text-[9px] uppercase tracking-wider opacity-75">Bre-B</span>}
                  </button>
                ))}
              </div>
              {paymentMethod !== "Efectivo" && (
                <div className="rounded-xl border border-dashed border-[#c4a77d] bg-[#fff9ed] p-3 text-[#493323]">
                  <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-[#c4a77d] bg-white px-3 py-2.5 text-xs font-bold text-[#493323] transition hover:bg-[#f7eddb]">
                    {paymentReceipt ? <CheckCircle2 className="h-4 w-4 text-emerald-700" /> : <Upload className="h-4 w-4 text-[#a84029]" />}
                    <span className="min-w-0 flex-1 truncate">{paymentReceiptName || "Adjuntar comprobante de pago"}</span>
                    <input type="file" accept="image/*,application/pdf" className="sr-only" onChange={async (event) => {
                      const file = event.target.files?.[0];
                      if (!file) return;
                      const supportedImage = file.type.startsWith("image/");
                      const supportedPdf = file.type === "application/pdf";
                      if (!supportedImage && !supportedPdf) {
                        setError("Adjunta una imagen o un archivo PDF.");
                        event.target.value = "";
                        return;
                      }
                      const maxFileSize = supportedPdf ? 350 * 1024 : 8 * 1024 * 1024;
                      if (file.size > maxFileSize) {
                        setError(supportedPdf ? "El PDF debe pesar menos de 350 KB." : "La imagen original debe pesar menos de 8 MB.");
                        event.target.value = "";
                        return;
                      }
                      if (file.type.startsWith("image/")) {
                        try {
                          const bitmap = await createImageBitmap(file);
                          const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
                          const canvas = document.createElement("canvas");
                          canvas.width = Math.max(1, Math.round(bitmap.width * scale));
                          canvas.height = Math.max(1, Math.round(bitmap.height * scale));
                          canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
                          bitmap.close();
                          const compressedImage = canvas.toDataURL("image/jpeg", 0.62);
                          const compressedBytes = Math.ceil((compressedImage.length * 3) / 4);
                          if (compressedBytes > 350 * 1024) {
                            setError("La imagen sigue siendo pesada después de comprimirla. Adjunta una captura más pequeña.");
                            event.target.value = "";
                            return;
                          }
                          setPaymentReceipt(compressedImage);
                          setPaymentReceiptName(file.name);
                          setError("");
                          return;
                        } catch {
                          setError("No pude leer esa imagen. Prueba con otra captura.");
                          return;
                        }
                      }
                      const reader = new FileReader();
                      reader.onload = () => {
                        if (typeof reader.result === "string") {
                          const pdfBytes = Math.ceil((reader.result.length * 3) / 4);
                          if (pdfBytes > 480 * 1024) {
                            setError("El PDF es demasiado pesado para adjuntarlo. Usa un archivo de menos de 350 KB.");
                            event.target.value = "";
                            return;
                          }
                          setPaymentReceipt(reader.result);
                          setPaymentReceiptName(file.name);
                          setError("");
                        }
                      };
                      reader.readAsDataURL(file);
                    }} />
                  </label>
                  <p className="mt-2 text-[11px] leading-snug text-[#6b563b]">Adjunta la imagen o PDF para que la cocinera pueda revisar el comprobante con tu solicitud.</p>
                </div>
              )}
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
                    OllaCercana no procesa pagos:
                  </strong>
                  El total de <strong className="text-amber-950 font-black">{formattedTotal}</strong> se coordinará directamente{" "}
                  {paymentMethod === "Efectivo" ? <>entre tú y <strong className="text-amber-950 font-black">{dish.cook}</strong> al recoger las porciones.</> : <>por {paymentMethod} fuera de OllaCercana. El comprobante acompaña la solicitud para que <strong className="text-amber-950 font-black">{dish.cook}</strong> lo revise y confirme la reserva.</>}
                </div>
              </div>
            </div>

            {/* Action Buttons (Matching Screenshot) */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 px-6 rounded-full bg-gradient-to-r from-[#F0822D] to-[#E06F1A] hover:brightness-110 text-white font-bold text-sm transition-all shadow-lg active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-wait disabled:opacity-70"
              >
                <span>{submitting ? "Enviando solicitud…" : paymentMethod === "Efectivo" ? "Enviar solicitud" : "Enviar comprobante y solicitud"} {!submitting && `(${formattedTotal}) →`}</span>
              </button>

              <button
                type="button"
                onClick={handleClose}
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
