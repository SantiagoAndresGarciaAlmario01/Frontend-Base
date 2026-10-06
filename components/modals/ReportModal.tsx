"use client";

import React, { useState } from "react";
import { CommunityReport, getStoredReports, saveReports, UserProfile } from "@/lib/ollacercana-store";
import { AlertOctagon, ImagePlus, X } from "lucide-react";

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
      evidenceImage: evidenceUrl || undefined,
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
          aria-label="Cerrar formulario de reporte"
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
              Reportar {targetType === "publicacion" ? "publicación" : "perfil"}
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
            <label htmlFor="report-reason" className="block text-xs font-semibold text-amber-300 mb-1">
              Motivo del reporte *
            </label>
            <select
              id="report-reason"
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
            <label htmlFor="report-explanation" className="block text-xs font-semibold text-amber-300 mb-1">
              Explicación detallada *
            </label>
            <textarea
              id="report-explanation"
              rows={4}
              maxLength={1000}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Describe lo sucedido o la infracción observada..."
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl p-3 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label htmlFor="report-evidence" className="mb-1 flex items-center gap-1 text-xs font-semibold text-amber-300">
              <ImagePlus className="h-3.5 w-3.5" /> Evidencia (opcional)
            </label>
            <input
              id="report-evidence"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (!file) return;
                if (!file.type.startsWith("image/")) {
                  setError("Adjunta una imagen como evidencia.");
                  event.target.value = "";
                  return;
                }
                if (file.size > 900_000) {
                  setError("La imagen debe pesar menos de 900 KB para guardarse en esta maqueta.");
                  event.target.value = "";
                  return;
                }
                const reader = new FileReader();
                reader.onload = () => {
                  if (typeof reader.result === "string") {
                    setEvidenceUrl(reader.result);
                    setError("");
                  }
                };
                reader.onerror = () => setError("No se pudo leer la imagen. Intenta con otro archivo.");
                reader.readAsDataURL(file);
              }}
              aria-describedby="report-evidence-hint"
              className="w-full rounded-xl border border-amber-700/50 bg-[#101712] px-3 py-2 text-xs text-white file:mr-3 file:rounded-lg file:border-0 file:bg-[#e8d1a3] file:px-3 file:py-1.5 file:font-semibold file:text-[#493323] focus:outline-none focus:border-red-500"
            />
            <p id="report-evidence-hint" className="mt-1 text-[11px] text-amber-200/70">Adjunta una foto real (máximo 900 KB). La evidencia es opcional y no se reemplaza con imágenes de muestra.</p>
            {evidenceUrl && <div className="mt-2 flex items-center gap-2 text-[11px] text-emerald-200"><img src={evidenceUrl} alt="Vista previa de la evidencia adjunta" className="h-12 w-12 rounded-lg border border-emerald-700 object-cover" /> Imagen lista para adjuntar</div>}
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
