"use client";

import React, { useState } from "react";
import { CommunityReport, getStoredReports, saveReports, UserProfile } from "@/lib/ollacercana-store";
import { AlertOctagon, X } from "lucide-react";

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTitle: string;
  targetId: string;
  targetType: "publicacion" | "usuario";
  currentUser: UserProfile;
}

const REPORT_REASONS = [
  "Precios abusivos",
  "Higiene / Calidad",
  "Comportamiento inapropiado",
  "Información falsa",
];

export default function ReportModal({
  isOpen,
  onClose,
  targetTitle,
  targetId,
  targetType,
  currentUser,
}: ReportModalProps) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [explanation, setExplanation] = useState("");
  const [evidenceUrl, setEvidenceUrl] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!reason) {
      setError("Debes seleccionar el motivo principal del reporte.");
      return;
    }

    if (!explanation || explanation.trim().length < 10) {
      setError("Por favor detalla la explicación del motivo (mínimo 10 caracteres).");
      return;
    }

    const reporterName = currentUser.name || currentUser.email || "Vecino Anónimo";

    const newReport: CommunityReport = {
      id: `rep-${Date.now()}`,
      reporterName,
      targetId,
      targetType,
      targetTitle,
      reason,
      explanation: explanation.trim(),
      evidenceImage: evidenceUrl || "/images/menu_ajiaco.jpg",
      status: "Abierto",
      createdAt: new Date().toLocaleDateString("es-CO"),
    };

    const currentReports = getStoredReports();
    saveReports([newReport, ...currentReports]);

    setSuccess("Reporte enviado a moderación. Gracias por cuidar nuestra comunidad (HU-18).");
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-[#18231B] border border-red-600/40 text-amber-100 rounded-2xl p-6 max-w-md w-full shadow-2xl relative my-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-900/40 border border-red-500/40 flex items-center justify-center">
            <AlertOctagon className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="font-playfair text-xl font-bold text-red-200">
              Reportar {targetType === "publicacion" ? "Publicación" : "Usuario"} (HU-18)
            </h3>
            <p className="text-xs text-amber-300/80">Objetivo: {targetTitle}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/60 border border-red-500/50 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-emerald-900/60 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmitReport} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Motivo del reporte *
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
            >
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Explicación detallada *
            </label>
            <textarea
              rows={3}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe lo sucedido o la infracción observada..."
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl p-3 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Foto de Evidencia (Opcional - Adjuntar URL o Captura)
            </label>
            <input
              type="text"
              value={evidenceUrl}
              onChange={(e) => setEvidenceUrl(e.target.value)}
              placeholder="URL de foto o imagen de evidencia"
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3 py-2 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white/10 text-amber-200 hover:bg-white/15 rounded-xl text-xs font-medium transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-semibold text-xs rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              Enviar Reporte
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
