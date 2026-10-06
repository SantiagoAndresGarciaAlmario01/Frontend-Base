"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import { ArrowLeft, Bell, Check, Moon, Sun, Type, Sparkles, Accessibility, RotateCcw } from "lucide-react";
import { getBrowserNotificationsEnabled, setBrowserNotificationsEnabled } from "@/lib/ollacercana-store";

type Appearance = "light" | "dark";
type TextSize = "standard" | "large";

const KEYS = {
  appearance: "ollacercana_menu_theme",
  transition: "ollacercana_page_transition",
  reducedMotion: "ollacercana_reduce_motion",
  textSize: "ollacercana_text_size",
} as const;

function applyPreferences(appearance: Appearance, reducedMotion: boolean, textSize: TextSize) {
  document.documentElement.dataset.appearance = appearance;
  document.documentElement.dataset.reduceMotion = String(reducedMotion);
  document.documentElement.dataset.textSize = textSize;
  localStorage.setItem(KEYS.appearance, appearance);
  localStorage.setItem(KEYS.reducedMotion, String(reducedMotion));
  localStorage.setItem(KEYS.textSize, textSize);
}

export default function SettingsPage() {
  const [appearance, setAppearance] = useState<Appearance>("light");
  const [transitionEnabled, setTransitionEnabled] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [textSize, setTextSize] = useState<TextSize>("standard");
  const [browserAlerts, setBrowserAlerts] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | "unsupported">("default");
  const [notificationMessage, setNotificationMessage] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedAppearance = localStorage.getItem(KEYS.appearance);
    const savedTransition = localStorage.getItem(KEYS.transition);
    const savedReducedMotion = localStorage.getItem(KEYS.reducedMotion);
    const savedTextSize = localStorage.getItem(KEYS.textSize);
    const nextAppearance: Appearance = savedAppearance === "dark" ? "dark" : "light";
    const nextReducedMotion = savedReducedMotion === "true";
    const nextTextSize: TextSize = savedTextSize === "large" ? "large" : "standard";
    setAppearance(nextAppearance);
    setTransitionEnabled(savedTransition !== "false");
    setReducedMotion(nextReducedMotion);
    setTextSize(nextTextSize);
    setBrowserAlerts(getBrowserNotificationsEnabled());
    setNotificationPermission("Notification" in window ? Notification.permission : "unsupported");
    applyPreferences(nextAppearance, nextReducedMotion, nextTextSize);
    setReady(true);
  }, []);

  const updateAppearance = (value: Appearance) => {
    setAppearance(value);
    applyPreferences(value, reducedMotion, textSize);
  };

  const updateReducedMotion = (value: boolean) => {
    setReducedMotion(value);
    applyPreferences(appearance, value, textSize);
  };

  const updateTextSize = (value: TextSize) => {
    setTextSize(value);
    applyPreferences(appearance, reducedMotion, value);
  };

  const updateTransition = (value: boolean) => {
    setTransitionEnabled(value);
    localStorage.setItem(KEYS.transition, String(value));
  };

  const resetPreferences = () => {
    setAppearance("light");
    setTransitionEnabled(true);
    setReducedMotion(false);
    setTextSize("standard");
    localStorage.setItem(KEYS.transition, "true");
    setBrowserAlerts(false);
    setBrowserNotificationsEnabled(false);
    setNotificationMessage("");
    applyPreferences("light", false, "standard");
  };

  const enableBrowserAlerts = async () => {
    if (!("Notification" in window)) {
      setNotificationPermission("unsupported");
      setNotificationMessage("Este navegador no permite avisos del sistema. Seguirás viendo las novedades en Avisos.");
      return;
    }
    const permission = Notification.permission === "default" ? await Notification.requestPermission() : Notification.permission;
    setNotificationPermission(permission);
    const enabled = permission === "granted";
    setBrowserAlerts(enabled);
    setBrowserNotificationsEnabled(enabled);
    setNotificationMessage(enabled ? "Listo: recibirás avisos del navegador mientras OllaCercana esté abierta." : permission === "denied" ? "El permiso está bloqueado en el navegador. Puedes cambiarlo desde los permisos del sitio." : "No activaste los avisos; seguirás recibiendo novedades dentro de la página.");
  };

  const toggleBrowserAlerts = (enabled: boolean) => {
    if (!enabled) {
      setBrowserAlerts(false);
      setBrowserNotificationsEnabled(false);
      setNotificationMessage("Los avisos del navegador están desactivados; la bandeja de Avisos sigue disponible.");
      return;
    }
    void enableBrowserAlerts();
  };

  const toggleClass = (checked: boolean) => `relative h-7 w-12 rounded-full transition-colors ${checked ? "bg-[#526f42]" : "bg-[#a8967d]"}`;

  return (
    <main data-theme-page className="relative min-h-screen overflow-hidden bg-[#17130f] px-4 py-6 font-['Outfit',sans-serif] text-[#f4efe6] sm:px-6 sm:py-10">
      <AnimatedKitchenBackground />
      <div className="relative z-10 mx-auto w-full max-w-3xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/menu" className="inline-flex items-center gap-2 rounded-full border border-[#b99770]/70 bg-[#fff7e9]/90 px-4 py-2 text-sm font-semibold text-[#493323] shadow transition hover:bg-white">
            <ArrowLeft className="h-4 w-4" /> Volver al Libretón
          </Link>
          <Link href="/" aria-label="Inicio"><BrandLogo size="sm" /></Link>
        </header>

        <section className="overflow-hidden rounded-[2rem] border-2 border-[#9b774f] bg-[#efe0c2] text-[#2b2117] shadow-[0_20px_60px_rgba(0,0,0,.4)]">
          <div className="border-b border-[#bda078] bg-[#e8d1a3] px-6 py-6 sm:px-9">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#80694d]">Tu espacio, a tu manera</p>
            <h1 className="mt-1 font-['Caveat',cursive] text-4xl font-bold text-[#493323] sm:text-5xl">Ajustes</h1>
            <p className="mt-1 max-w-xl text-sm text-[#5b4a38]">Personaliza la apariencia y la forma en que navegas por OllaCercana. Tus preferencias se guardan en este dispositivo.</p>
          </div>

          <div className="space-y-7 p-5 sm:p-9">
            <section aria-labelledby="appearance-title">
              <div className="mb-3 flex items-center gap-2">
                {appearance === "light" ? <Sun className="h-5 w-5 text-[#a84029]" /> : <Moon className="h-5 w-5 text-[#526f42]" />}
                <h2 id="appearance-title" className="font-bold text-[#493323]">Apariencia</h2>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {(["light", "dark"] as const).map((value) => {
                  const active = appearance === value;
                  return <button key={value} type="button" onClick={() => updateAppearance(value)} aria-pressed={active} className={`flex min-h-20 items-center justify-between rounded-2xl border-2 px-4 py-3 text-left transition ${active ? "border-[#526f42] bg-[#dce4ce]" : "border-[#c4a77d] bg-[#f7eddb] hover:border-[#80694d]"}`}>
                    <span className="flex items-center gap-3">{value === "light" ? <Sun className="h-5 w-5 text-[#a84029]" /> : <Moon className="h-5 w-5 text-[#526f42]" />}<span><strong className="block text-sm text-[#2b2117]">{value === "light" ? "Modo claro" : "Modo oscuro"}</strong><span className="text-xs text-[#6a5037]">{value === "light" ? "Papel y tonos cálidos" : "Fondo más tenue en el Libretón"}</span></span></span>
                    {active && <Check className="h-5 w-5 text-[#38502d]" />}
                  </button>;
                })}
              </div>
            </section>

            <section aria-labelledby="motion-title" className="space-y-3">
              <h2 id="motion-title" className="flex items-center gap-2 font-bold text-[#493323]"><Sparkles className="h-5 w-5 text-[#a84029]" /> Movimiento</h2>
              <PreferenceToggle title="Transición de pasar la página" description="Muestra la animación de la abuelita al entrar al Libretón y otras secciones." checked={transitionEnabled} onChange={updateTransition} toggleClass={toggleClass} />
              <PreferenceToggle title="Reducir animaciones" description="Reduce movimientos decorativos y transiciones para una navegación más tranquila." checked={reducedMotion} onChange={updateReducedMotion} toggleClass={toggleClass} />
            </section>

            <section aria-labelledby="accessibility-title">
              <h2 id="accessibility-title" className="mb-3 flex items-center gap-2 font-bold text-[#493323]"><Accessibility className="h-5 w-5 text-[#a84029]" /> Lectura</h2>
              <div className="rounded-2xl border border-[#c4a77d] bg-[#f7eddb] p-4">
                <div className="mb-3 flex items-center gap-2"><Type className="h-4 w-4 text-[#80694d]" /><p className="text-sm font-semibold text-[#493323]">Tamaño del texto</p></div>
                <div className="grid grid-cols-2 gap-2">
                  {(["standard", "large"] as const).map((value) => <button key={value} type="button" onClick={() => updateTextSize(value)} aria-pressed={textSize === value} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${textSize === value ? "border-[#526f42] bg-[#dce4ce] text-[#304522]" : "border-[#c4a77d] bg-[#fffaf1] text-[#594735] hover:bg-white"}`}>{value === "standard" ? "Estándar" : "Grande"}</button>)}
                </div>
              </div>
            </section>

            <section aria-labelledby="notifications-title" className="space-y-3">
              <h2 id="notifications-title" className="flex items-center gap-2 font-bold text-[#493323]"><Bell className="h-5 w-5 text-[#a84029]" /> Notificaciones</h2>
              <PreferenceToggle title="Avisos del navegador" description="Muestra una notificación del sistema cuando la app genere una novedad. Requiere permiso del navegador y funciona mientras OllaCercana está abierta." checked={browserAlerts} onChange={toggleBrowserAlerts} toggleClass={toggleClass} />
              <div className="rounded-xl border border-[#c4a77d] bg-[#fffaf1] p-3 text-xs text-[#6a5037]">
                <p>Permiso actual: <strong>{notificationPermission === "granted" ? "permitido" : notificationPermission === "denied" ? "bloqueado" : notificationPermission === "unsupported" ? "no compatible" : "sin solicitar"}</strong></p>
                {notificationMessage && <p role="status" className="mt-1">{notificationMessage}</p>}
                {notificationPermission === "denied" && <p className="mt-1">Abre los permisos del sitio en tu navegador para volver a permitirlos.</p>}
              </div>
            </section>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-[#c4a77d] pt-5">
              <button type="button" onClick={resetPreferences} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-[#6a5037] transition hover:bg-[#e8d1a3] hover:text-[#2b2117]"><RotateCcw className="h-4 w-4" /> Restaurar preferencias</button>
              <p role="status" className="text-xs text-[#52663d]">{ready ? "Preferencias guardadas automáticamente" : "Cargando preferencias…"}</p>
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}

function PreferenceToggle({ title, description, checked, onChange, toggleClass }: { title: string; description: string; checked: boolean; onChange: (value: boolean) => void; toggleClass: (checked: boolean) => string }) {
  return <div className="flex items-center justify-between gap-4 rounded-2xl border border-[#c4a77d] bg-[#f7eddb] p-4">
    <div><h3 className="text-sm font-semibold text-[#2b2117]">{title}</h3><p className="mt-0.5 text-xs leading-relaxed text-[#6a5037]">{description}</p></div>
    <button type="button" role="switch" aria-checked={checked} aria-label={title} onClick={() => onChange(!checked)} className={`${toggleClass(checked)} shrink-0`}><span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`} /></button>
  </div>;
}
