"use client";

import React, { useState, useEffect } from "react";
import { getStoredReviews, Review } from "@/lib/ollacercana-store";
import { Award, Star, X } from "lucide-react";

interface ReputationModalProps {
  isOpen: boolean;
  onClose: () => void;
  cookName: string;
  cookAvatar?: string;
  cookId?: string;
}

export default function ReputationModal({
  isOpen,
  onClose,
  cookName,
  cookAvatar = "/images/dona_rosa_mascot.jpg",
  cookId,
}: ReputationModalProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [starFilter, setStarFilter] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const allReviews = getStoredReviews();
    if (cookId) {
      setReviews(allReviews.filter((r) => r.cookId === cookId));
    } else {
      setReviews(allReviews);
    }
  }, [isOpen, cookId]);

  if (!isOpen) return null;

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
      : "5.0";
  const numericAvg = parseFloat(avgRating);
  const isCocineraDestacada = numericAvg >= 4.8 && totalReviews >= 3;

  const filteredReviews = starFilter
    ? reviews.filter((r) => r.rating === starFilter)
    : reviews;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#18231B] border border-amber-600/30 text-amber-100 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cook Header */}
        <div className="flex items-center gap-4 mb-6 border-b border-amber-800/40 pb-4">
          <img
            src={cookAvatar}
            alt={cookName}
            className="w-16 h-16 rounded-full object-cover border-2 border-[#F0822D] shadow-md"
          />
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-playfair text-xl font-bold text-amber-100">{cookName}</h3>
              {isCocineraDestacada && (
                <span className="bg-gradient-to-r from-amber-500 to-amber-700 text-black text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow border border-amber-300 flex items-center gap-1">
                  <Award className="w-3 h-3 text-black" />
                  <span>Cocinera Destacada</span>
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-amber-400 font-bold text-lg flex items-center gap-1">
                <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
                {avgRating}
              </span>
              <span className="text-xs text-amber-300/80">({totalReviews} opiniones verificadas)</span>
            </div>
          </div>
        </div>

        {/* Rating Breakdown & Filter */}
        <div className="mb-4">
          <label className="block text-xs font-semibold text-amber-300 mb-2">
            Filtrar opiniones por calificación (HU-22)
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStarFilter(null)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                starFilter === null
                  ? "bg-[#F0822D] text-white shadow"
                  : "bg-[#101712] border border-amber-800/40 text-amber-300 hover:border-amber-600"
              }`}
            >
              Todas ({totalReviews})
            </button>
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviews.filter((r) => r.rating === stars).length;
              return (
                <button
                  key={stars}
                  onClick={() => setStarFilter(stars)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                    starFilter === stars
                      ? "bg-[#F0822D] text-white shadow"
                      : "bg-[#101712] border border-amber-800/40 text-amber-300 hover:border-amber-600"
                  }`}
                >
                  {stars} ★ ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Review List */}
        <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
          {filteredReviews.length === 0 ? (
            <p className="text-xs text-amber-400/60 italic text-center py-6">
              No hay opiniones registradas para esta estrella.
            </p>
          ) : (
            filteredReviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-[#101712] border border-amber-900/40 rounded-xl p-3.5 space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-200">{rev.buyerName}</span>
                  <span className="text-[10px] text-amber-400/60">{rev.createdAt}</span>
                </div>
                <div className="text-amber-400 text-xs tracking-wider">
                  {"★".repeat(rev.rating)}
                  <span className="text-amber-700">{"★".repeat(5 - rev.rating)}</span>
                </div>
                <p className="text-xs text-amber-100/90 italic leading-relaxed">
                  "{rev.comment}"
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-amber-200 text-xs font-semibold rounded-xl transition-all"
          >
            Cerrar Reputación
          </button>
        </div>
      </div>
    </div>
  );
}
