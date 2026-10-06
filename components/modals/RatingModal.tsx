"use client";

import React, { useState } from "react";
import { getStoredReviews, Review, saveReviews, UserProfile } from "@/lib/ollacercana-store";
import { Star, X } from "lucide-react";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId: string;
  cookId: string;
  currentUser: UserProfile;
}

export default function RatingModal({
  isOpen,
  onClose,
  reservationId,
  cookId,
  currentUser,
}: RatingModalProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();

    if (rating < 1) {
      setError("Debe seleccionar al menos una estrella");
      return;
    }
    if (!comment.trim()) {
      setError("Por favor escribir un comentario");
      return;
    }

    const buyerName = currentUser.name || currentUser.email || "Vecino Satisfecho";

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      cookId,
      reservationId,
      buyerName,
      rating,
      comment: comment.trim(),
      createdAt: "Hoy",
      status: "Pendiente",
    };

    const reviews = getStoredReviews();
    if (!reviews.some((review) => review.reservationId === reservationId)) {
      saveReviews([newReview, ...reviews]);
    }
    const legacyReservations = localStorage.getItem("ollacercana_reservations");
    if (legacyReservations) {
      try {
        const parsed = JSON.parse(legacyReservations) as Array<{ id: string; rated?: boolean }>;
        localStorage.setItem("ollacercana_reservations", JSON.stringify(parsed.map((item) => item.id === reservationId ? { ...item, rated: true } : item)));
      } catch {
        // Conservar la reseña aunque el formato del historial anterior no se pueda leer.
      }
    }

    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#18231B] border border-amber-600/30 text-amber-100 rounded-2xl p-5 sm:p-6 max-h-[calc(100vh-2rem)] overflow-y-auto max-w-md w-full shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center">
            <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-amber-200">
              Califica tu pedido (HU-15)
            </h3>
            <p className="text-xs text-amber-300/80">Apoya el perfil de tu cocinera vecina</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl text-center font-medium">
            Tu reseña se publicará al cumplirse la ventana
          </div>
        ) : (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-2 text-center">
                ¿Qué tal estuvo la sazón? (1 a 5 estrellas)
              </label>
              <div className="flex justify-center gap-2 text-3xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => { setRating(star); setError(""); }}
                    aria-label={`${star} ${star === 1 ? "estrella" : "estrellas"}`}
                    aria-pressed={star === rating}
                    className={`transition-transform hover:scale-125 ${
                      star <= rating ? "text-amber-400" : "text-gray-600"
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-1">
                Comentario <span className="text-amber-200">(obligatorio)</span>
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => { setComment(e.target.value); if (e.target.value.trim()) setError(""); }}
                required
                maxLength={400}
                placeholder="Cuéntanos qué fue lo que más te gustó (porción, empaque, sabor)..."
                className="w-full bg-[#101712] border border-amber-700/50 rounded-xl p-3 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-[#F0822D]"
              />
            </div>

            {error && <p role="alert" className="text-center text-xs font-semibold text-rose-300">{error}</p>}

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white/10 text-amber-200 hover:bg-white/15 rounded-xl text-xs font-medium transition-all"
              >
                Ahora no
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-[#F0822D] to-[#E06F1A] text-white font-semibold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
              >
                Enviar reseña
              </button>
            </div>
          </form>
        )}
        {submitted && <button onClick={onClose} className="mt-4 w-full rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-amber-100 hover:bg-white/15">Cerrar</button>}
      </div>
    </div>
  );
}
