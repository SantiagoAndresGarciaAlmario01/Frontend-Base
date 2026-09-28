"use client";

import React, { useState, useEffect } from "react";
import { getStoredDishes, getStoredReservations, Reservation, UserProfile } from "@/lib/ollacercana-store";
import { BarChart3, X } from "lucide-react";

interface SalesHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
}

export default function SalesHistoryModal({ isOpen, onClose, currentUser }: SalesHistoryModalProps) {
  const [cookReservations, setCookReservations] = useState<Reservation[]>([]);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [portionsSold, setPortionsSold] = useState(0);
  const [activePublications, setActivePublications] = useState(0);

  useEffect(() => {
    if (!isOpen) return;

    const allReservations = getStoredReservations();
    const cookName = currentUser.commercialName || currentUser.name || "Doña Rosa";
    const filtered = allReservations.filter(
      (r) => r.cookId === currentUser.email || r.cookName === cookName
    );
    setCookReservations(filtered);

    // Calculate metrics
    const completed = filtered.filter((r) => r.status === "COMPLETADA");
    const earnings = completed.reduce((acc, r) => acc + r.totalPrice, 0);
    const portions = completed.reduce((acc, r) => acc + r.portions, 0);
    setTotalEarnings(earnings);
    setPortionsSold(portions);

    const dishes = getStoredDishes();
    const active = dishes.filter(
      (d) => (d.cookId === currentUser.email || d.cook === cookName) && d.status === "DISPONIBLE"
    );
    setActivePublications(active.length);
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#18231B] border border-amber-600/30 text-amber-100 rounded-2xl p-6 max-w-xl w-full shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 border-b border-amber-800/40 pb-4">
          <div className="w-10 h-10 rounded-full bg-[#62B869]/20 border border-[#62B869]/40 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-[#62B869]" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-amber-200">
              Historial de Ventas y Métricas (HU-20)
            </h3>
            <p className="text-xs text-amber-300/80">Panel de desempeño para cocineras de la vecindad</p>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-[#101712] border border-amber-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] text-amber-400 font-semibold block uppercase">Ventas Totales</span>
            <span className="text-lg font-bold text-emerald-400">${totalEarnings.toLocaleString("es-CO")}</span>
          </div>

          <div className="bg-[#101712] border border-amber-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] text-amber-400 font-semibold block uppercase">Porciones Entregadas</span>
            <span className="text-lg font-bold text-amber-200">{portionsSold} u.</span>
          </div>

          <div className="bg-[#101712] border border-amber-900/40 rounded-xl p-3 text-center">
            <span className="text-[10px] text-amber-400 font-semibold block uppercase">Publicaciones Activas</span>
            <span className="text-lg font-bold text-amber-200">{activePublications} / 3</span>
          </div>
        </div>

        {/* Sales History List */}
        <h4 className="text-xs font-semibold text-amber-300 mb-2">Pedidos Recibidos</h4>
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {cookReservations.length === 0 ? (
            <p className="text-xs text-amber-400/60 italic text-center py-6">
              Aún no has registrado pedidos o reservas de porciones.
            </p>
          ) : (
            cookReservations.map((res) => (
              <div
                key={res.id}
                className="bg-[#101712] border border-amber-900/40 rounded-xl p-3 flex items-center justify-between text-xs"
              >
                <div>
                  <h5 className="font-semibold text-amber-100">{res.dishName}</h5>
                  <p className="text-[11px] text-amber-300/80">
                    Comprador: <strong className="text-amber-200">{res.buyerName}</strong> ({res.portions} porciones)
                  </p>
                  <span className="text-[10px] text-amber-500/70">Medio: {res.preferredPaymentMethod}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">${res.totalPrice.toLocaleString("es-CO")}</span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold inline-block mt-0.5 ${
                      res.status === "COMPLETADA"
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-500/40"
                        : res.status === "PENDIENTE"
                        ? "bg-amber-950 text-amber-300 border border-amber-500/40"
                        : "bg-red-950 text-red-300 border border-red-500/40"
                    }`}
                  >
                    {res.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-white/10 hover:bg-white/15 text-amber-200 text-xs font-semibold rounded-xl transition-all"
          >
            Cerrar Historial
          </button>
        </div>
      </div>
    </div>
  );
}
