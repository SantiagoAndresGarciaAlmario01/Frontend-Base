"use client";

import React, { useEffect, useState } from "react";
import {
  CommunityReport,
  getStoredDishes,
  getStoredReports,
  saveDishes,
  saveReports,
  UserProfile,
} from "@/lib/ollacercana-store";
import { ArrowLeft, CheckCircle2, ExternalLink, ShieldAlert, ShieldCheck, Store, XCircle } from "lucide-react";

interface AdminModerationSectionProps { currentUser: UserProfile }
interface PausedCook { name: string; email: string; reason: string; paused: boolean }
const DEMO_PAUSED_COOK: PausedCook = {
  name: "Cocina de Doña Marta", email: "dona-marta@ollacercana.com",
  reason: "Pausa preventiva mientras se revisa un reclamo de entrega tardía.", paused: true,
};
const PAUSED_KEY = "ollacercana_paused_cooks_v1";

export default function AdminModerationSection({ currentUser }: AdminModerationSectionProps) {
  const [reports, setReports] = useState<CommunityReport[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [pausedCooks, setPausedCooks] = useState<PausedCook[]>([]);
  const [decision, setDecision] = useState<"resolver" | "desestimar" | null>(null);

  useEffect(() => {
    setReports(getStoredReports());
    try {
      const saved = localStorage.getItem(PAUSED_KEY);
      setPausedCooks(saved ? JSON.parse(saved) : [DEMO_PAUSED_COOK]);
    } catch { setPausedCooks([DEMO_PAUSED_COOK]); }
  }, []);

  if (currentUser.role !== "admin") return (
    <div className="rounded-2xl border border-red-400/50 bg-[#fff1e8] p-6 text-center text-[#642b20] shadow-xl">
      <ShieldAlert className="mx-auto mb-3 h-8 w-8 text-red-700" />
      <h3 className="text-lg font-bold">No tienes permiso para ver esta sección</h3>
      <p className="mt-1 text-sm">Solo el equipo administrador puede revisar reportes y perfiles pausados.</p>
    </div>
  );

  const selectedReport = reports.find((report) => report.id === selectedId) ?? null;
  const openReports = reports.filter((report) => report.status === "Abierto");
  const updateReport = (report: CommunityReport, status: "Resuelto" | "Desestimado") => {
    const updated = reports.map((item) => item.id === report.id ? { ...item, status } : item);
    setReports(updated); saveReports(updated); setDecision(null); setSelectedId(null);
    if (status === "Resuelto" && report.targetType === "publicacion") {
      saveDishes(getStoredDishes().map((dish) => dish.id === report.targetId ? { ...dish, status: "INHABILITADO" } : dish));
    }
  };
  const reactivate = (cook: PausedCook) => {
    const updated = pausedCooks.map((item) => item.email === cook.email ? { ...item, paused: false } : item);
    setPausedCooks(updated); localStorage.setItem(PAUSED_KEY, JSON.stringify(updated));
    try {
      const savedUser = localStorage.getItem("ollacercana_user");
      if (savedUser) {
        const profile = JSON.parse(savedUser) as UserProfile;
        if (profile.email === cook.email) localStorage.setItem("ollacercana_user", JSON.stringify({ ...profile, isPaused: false, isCocineraActive: true }));
      }
    } catch { /* Si el perfil no está almacenado en este navegador, queda actualizado el registro de moderación. */ }
  };

  return <section className="space-y-6 rounded-2xl border border-[#b89a6f] bg-[#f4e8cf] p-4 text-[#30251b] shadow-xl sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#cdb58d] pb-4">
      <div className="flex items-center gap-3"><span className="grid h-11 w-11 place-items-center rounded-full bg-[#e7d5af] text-[#526f42]"><ShieldCheck className="h-5 w-5" /></span><div><h2 className="font-['Caveat',cursive] text-3xl font-bold">Cuidado de la comunidad</h2><p className="text-sm text-[#67533d]">Revisa reportes y acompaña a las cocinas del barrio.</p></div></div>
      <span className="rounded-full border border-[#c84b31]/30 bg-white/60 px-3 py-1 text-sm font-semibold text-[#8e3929]">{openReports.length} pendiente{openReports.length === 1 ? "" : "s"}</span>
    </header>

    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,.8fr)]">
      <section className="space-y-3" aria-labelledby="report-queue-title">
        <div className="flex items-center justify-between"><h3 id="report-queue-title" className="text-lg font-bold">Bandeja de reportes</h3><span className="text-xs text-[#715d45]">{reports.length} total</span></div>
        {reports.length === 0 ? <div className="rounded-xl border border-dashed border-[#b89a6f] bg-white/40 p-6 text-sm text-[#715d45]">No hay reportes todavía. Cuando alguien envíe uno, aparecerá aquí para revisión.</div> : reports.map((report) => (
          <button key={report.id} onClick={() => { setSelectedId(report.id); setDecision(null); }} className={`w-full rounded-xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md ${selectedId === report.id ? "border-[#a84029] bg-white/80" : "border-[#cdb58d] bg-white/55"}`}>
            <span className="flex items-start justify-between gap-3"><span className="min-w-0"><span className="block truncate font-bold">{report.targetTitle}</span><span className="mt-1 block text-xs text-[#715d45]">{report.reason} · {report.reporterName}</span></span><span className={`shrink-0 rounded-full px-2 py-1 text-[11px] font-bold ${report.status === "Abierto" ? "bg-[#f8d9c9] text-[#8e3929]" : report.status === "Resuelto" ? "bg-[#dce8cf] text-[#3f6034]" : "bg-[#e8dfd1] text-[#625340]"}`}>{report.status}</span></span>
          </button>
        ))}
      </section>

      <section className="min-h-56 rounded-xl border border-[#cdb58d] bg-[#fffaf0] p-4" aria-live="polite">
        {selectedReport ? <>
          <button onClick={() => { setSelectedId(null); setDecision(null); }} className="mb-3 inline-flex items-center gap-1 text-xs font-semibold text-[#8e3929] lg:hidden"><ArrowLeft className="h-4 w-4" /> Volver a la bandeja</button>
          <div className="flex items-start justify-between gap-2"><div><p className="text-xs font-semibold uppercase tracking-wide text-[#8b7356]">Detalle del reporte</p><h3 className="mt-1 text-lg font-bold">{selectedReport.targetTitle}</h3></div><span className="rounded-full bg-[#efe0c2] px-2.5 py-1 text-xs font-bold">{selectedReport.targetType === "publicacion" ? "Publicación" : "Perfil"}</span></div>
          <dl className="mt-4 space-y-3 text-sm"><div><dt className="font-semibold text-[#745d43]">Motivo</dt><dd>{selectedReport.reason}</dd></div><div><dt className="font-semibold text-[#745d43]">Descripción</dt><dd className="whitespace-pre-wrap">{selectedReport.explanation || "No se añadió una descripción."}</dd></div><div><dt className="font-semibold text-[#745d43]">Reportado por</dt><dd>{selectedReport.reporterName} · {selectedReport.createdAt}</dd></div></dl>
          {selectedReport.evidenceImage && <a href={selectedReport.evidenceImage} target="_blank" rel="noreferrer" className="mt-4 flex items-center gap-1 text-sm font-semibold text-[#8e3929]">Ver evidencia <ExternalLink className="h-4 w-4" /></a>}
          {selectedReport.status === "Abierto" && !decision && <div className="mt-5 grid grid-cols-2 gap-2"><button onClick={() => setDecision("desestimar")} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-[#9b774f] px-3 text-sm font-bold hover:bg-[#efe0c2]"><XCircle className="h-4 w-4" /> Desestimar</button><button onClick={() => setDecision("resolver")} className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg bg-[#526f42] px-3 text-sm font-bold text-white hover:bg-[#415a35]"><CheckCircle2 className="h-4 w-4" /> Tomar decisión</button></div>}
          {decision && <div className="mt-5 rounded-lg border border-[#cdb58d] bg-[#f4e8cf] p-3"><p className="text-sm font-bold">{decision === "resolver" ? "¿Confirmas la infracción?" : "¿Desestimas este reporte?"}</p><p className="mt-1 text-xs text-[#715d45]">{decision === "resolver" ? "El reporte quedará resuelto y, si es una publicación, el plato se inhabilitará en este navegador." : "Se conservará el contenido y el reporte quedará como desestimado."}</p><div className="mt-3 flex gap-2"><button onClick={() => setDecision(null)} className="flex-1 rounded-lg border border-[#9b774f] px-3 py-2 text-sm font-bold">Volver</button><button onClick={() => updateReport(selectedReport, decision === "resolver" ? "Resuelto" : "Desestimado")} className="flex-1 rounded-lg bg-[#a84029] px-3 py-2 text-sm font-bold text-white">Confirmar</button></div></div>}
        </> : <div className="grid h-full min-h-48 place-content-center text-center"><ShieldAlert className="mx-auto h-8 w-8 text-[#9b774f]" /><h3 className="mt-2 font-bold">Selecciona un reporte</h3><p className="mt-1 max-w-xs text-sm text-[#715d45]">Aquí verás la evidencia y podrás decidir qué hacer.</p></div>}
      </section>
    </div>

    <section className="space-y-3 border-t border-[#cdb58d] pt-5">
      <div className="flex items-center gap-2"><Store className="h-5 w-5 text-[#526f42]" /><h3 className="text-lg font-bold">Perfiles pausados</h3></div>
      {pausedCooks.filter((cook) => cook.paused).length === 0 ? <p className="rounded-xl bg-white/50 p-4 text-sm text-[#715d45]">No hay perfiles pausados por reactivar.</p> : pausedCooks.filter((cook) => cook.paused).map((cook) => <article key={cook.email} className="flex flex-col justify-between gap-3 rounded-xl border border-[#cdb58d] bg-white/60 p-4 sm:flex-row sm:items-center"><div><h4 className="font-bold">{cook.name}</h4><p className="text-xs text-[#715d45]">{cook.email}</p><p className="mt-1 text-sm text-[#715d45]">{cook.reason}</p></div><button onClick={() => reactivate(cook)} className="min-h-10 shrink-0 rounded-lg bg-[#526f42] px-4 py-2 text-sm font-bold text-white hover:bg-[#415a35]">Reactivar perfil</button></article>)}
      <p className="text-xs text-[#80694d]">Las decisiones de esta maqueta se guardan localmente en este navegador, hasta conectar la API.</p>
    </section>
  </section>;
}
