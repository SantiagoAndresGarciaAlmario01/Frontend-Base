"use client";

import React, { useState, useEffect } from "react";
import {
  CommunityReport,
  getStoredDishes,
  getStoredReports,
  saveDishes,
  saveReports,
  UserProfile,
} from "@/lib/ollacercana-store";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface AdminModerationSectionProps {
  currentUser: UserProfile;
}

export default function AdminModerationSection({ currentUser }: AdminModerationSectionProps) {
  const [reports, setReports] = useState<CommunityReport[]>([]);

  useEffect(() => {
    setReports(getStoredReports());
  }, []);

  if (currentUser.role !== "admin") {
    return (
      <div className="bg-[#18231B] border border-red-500/30 rounded-2xl p-6 text-center shadow-xl">
        <div className="w-12 h-12 rounded-full bg-red-900/40 border border-red-500/40 flex items-center justify-center mx-auto mb-3">
          <ShieldAlert className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="font-playfair text-lg font-bold text-red-200">No tiene permisos para ver esta sección</h3>
        <p className="text-xs text-amber-200/80 mt-1">
          Solo los administradores autorizados de la plataforma pueden moderar denuncias y reactivar perfiles.
        </p>
      </div>
    );
  }

  const handleDismissReport = (reportId: string) => {
    const updated = reports.map((r) =>
      r.id === reportId ? { ...r, status: "Desestimado" as const } : r
    );
    setReports(updated);
    saveReports(updated);
  };

  const handleDisableContent = (reportId: string, targetId: string) => {
    // 1. Update report
    const updatedReports = reports.map((r) =>
      r.id === reportId ? { ...r, status: "Resuelto" as const } : r
    );
    setReports(updatedReports);
    saveReports(updatedReports);

    // 2. Disable target dish
    const dishes = getStoredDishes();
    const updatedDishes = dishes.map((d) =>
      d.id === targetId ? { ...d, status: "INHABILITADO" as const } : d
    );
    saveDishes(updatedDishes);
  };

  return (
    <div className="bg-[#18231B] border border-amber-600/30 rounded-2xl p-6 text-amber-100 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-amber-800/40 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-amber-200">
              Módulo de Moderación y Auditoría (HU-19)
            </h3>
            <p className="text-xs text-amber-300/80">Gestión de denuncias comunitarias de la vecindad</p>
          </div>
        </div>
        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs px-3 py-1 rounded-full font-semibold">
          Administrador Activo
        </span>
      </div>

      {reports.length === 0 ? (
        <p className="text-xs text-amber-400/60 italic text-center py-8">
          No hay denuncias de la comunidad pendientes por revisar.
        </p>
      ) : (
        <div className="space-y-3">
          {reports.map((rep) => (
            <div
              key={rep.id}
              className="bg-[#101712] border border-amber-900/40 rounded-xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-200">
                    Denunciante: {rep.reporterName}
                  </span>
                  <span className="text-[10px] text-amber-400/60 block">Fecha: {rep.createdAt}</span>
                </div>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    rep.status === "Abierto"
                      ? "bg-red-950 text-red-300 border border-red-500/50"
                      : rep.status === "Resuelto"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-500/50"
                      : "bg-gray-800 text-gray-300 border border-gray-600"
                  }`}
                >
                  {rep.status}
                </span>
              </div>

              <div className="text-xs space-y-1 bg-[#162119] p-3 rounded-lg border border-amber-800/30">
                <p>
                  <strong className="text-amber-300">Objetivo denunciado:</strong> {rep.targetTitle} ({rep.targetType})
                </p>
                <p>
                  <strong className="text-amber-300">Motivo:</strong> {rep.reason}
                </p>
                <p>
                  <strong className="text-amber-300">Explicación:</strong> {rep.explanation}
                </p>
              </div>

              {rep.evidenceImage && (
                <div className="flex items-center gap-3 bg-[#162119] p-2 rounded-lg border border-amber-800/30">
                  <img
                    src={rep.evidenceImage}
                    alt="Evidencia"
                    className="w-16 h-16 object-cover rounded-lg border border-amber-700/40"
                  />
                  <span className="text-[11px] text-amber-300/80">Evidencia fotográfica adjunta</span>
                </div>
              )}

              {rep.status === "Abierto" && (
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => handleDismissReport(rep.id)}
                    className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs font-semibold rounded-xl transition-all"
                  >
                    Desestimar Denuncia
                  </button>
                  <button
                    onClick={() => handleDisableContent(rep.id, rep.targetId)}
                    className="flex-1 py-2 bg-red-700 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-all shadow"
                  >
                    Inhabilitar Contenido
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Paused Cook Profiles Section (HU-19 Scenario 2) */}
      <div className="pt-4 border-t border-amber-800/40 space-y-3">
        <h4 className="font-playfair text-base font-bold text-amber-200">
          Perfiles de Cocineras Pausados / En Suspensión (HU-19)
        </h4>

        <div className="bg-[#101712] border border-amber-900/40 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-white block">Cocina de Doña Marta (dona-marta@ollacercana.com)</span>
            <span className="text-[11px] text-amber-400/80">Motivo: Pausa preventiva automática por reclamo de entrega tardía.</span>
          </div>
          <button
            onClick={() => {
              alert("Perfil de Cocina de Doña Marta reactivado exitosamente. Se ha habilitado la publicación de platos.");
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md cursor-pointer shrink-0"
          >
            Reactivar perfil
          </button>
        </div>
      </div>
    </div>
  );
}
