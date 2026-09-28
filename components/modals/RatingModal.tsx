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
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();

    const buyerName = currentUser.name || currentUser.email || "Vecino Satisfecho";

    const newReview: Review = {
      id: `rev-${Date.now()}`,
      cookId,
      reservationId,
      buyerName,
      rating,
      comment: comment.trim() || "Excelente sazón casera.",
      createdAt: "Hoy",
    };

    const reviews = getStoredReviews();
    saveReviews([newReview, ...reviews]);

    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
      <div className="bg-[#18231B] border border-amber-600/30 text-amber-100 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
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
              Califica tu Almuerzo (HU-15)
            </h3>
            <p className="text-xs text-amber-300/80">Apoya el perfil de tu cocinera vecina</p>
          </div>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl text-center font-medium">
            ¡Gracias por valorar la comida casera de tu vecindad! Tu calificación se ha publicado.
          </div>
        ) : (
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-amber-300 mb-2 text-center">
                ¿Qué tal estuvo la sazón? (1 a 5 Estrellas)
              </label>
              <div className="flex justify-center gap-2 text-3xl cursor-pointer">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
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
                Comentario adicional (Opcional)
              </label>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Cuéntanos qué fue lo que más te gustó (porción, empaque, sabor)..."
                className="w-full bg-[#101712] border border-amber-700/50 rounded-xl p-3 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-[#F0822D]"
              />
            </div>

            <div className="pt-2 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-white/10 text-amber-200 hover:bg-white/15 rounded-xl text-xs font-medium transition-all"
              >
                Omitir
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-gradient-to-r from-[#F0822D] to-[#E06F1A] text-white font-semibold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
              >
                Publicar Calificación
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
