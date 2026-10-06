"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";

// Transición "pasar la página del libretón" — se dispara SOLO al navegar
// hacia /menu (El Libretón), /cocineras-cercanas (Mapas) o /cuenta (Iniciar
// sesión). Es literalmente el video que Santiago generó (la abuela trae la
// carpeta "Libretón" y la cambia por la siguiente): se reproduce a pantalla
// completa tapando todo, la navegación real (router.push) ya ocurrió por
// debajo desde el primer instante, y al terminar el clip se desvanece
// revelando la página de verdad. No toca redirecciones de sesión/logout.

const TARGET_ROUTES = new Set(["/menu", "/cocineras-cercanas", "/cuenta"]);
const OVERLAY_ID = "libreton-page-turn-overlay";
const VIDEO_SRC = "/videos/libreton_transicion.mp4";
const FADE_OUT_MS = 380;

type Phase = "idle" | "playing" | "exiting";

export default function LibretonTransition({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("idle");
  const busyRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pendingHref = useRef<string | null>(null);

  const finish = useCallback(() => {
    setPhase("exiting");
    window.setTimeout(() => {
      pendingHref.current = null;
      busyRef.current = false;
      setPhase("idle");
    }, FADE_OUT_MS);
  }, []);

  const run = useCallback(
    (href: string) => {
      busyRef.current = true;
      pendingHref.current = href;
      router.push(href);
      setPhase("playing");
    },
    [router]
  );

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (busyRef.current) return;
      if (
        window.localStorage.getItem("ollacercana_page_transition") === "false" ||
        window.localStorage.getItem("ollacercana_reduce_motion") === "true"
      ) return;
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const el = e.target as HTMLElement | null;
      const anchor = el?.closest("a");
      if (!anchor) return;
      if (anchor.target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin) return;
      if (!TARGET_ROUTES.has(url.pathname)) return;
      if (url.pathname === window.location.pathname) return;

      e.preventDefault();
      run(url.pathname + url.search);
    }
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [run]);

  useEffect(() => {
    if (phase !== "playing") return;
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    const playPromise = v.play();
    if (playPromise) playPromise.catch(() => {});
  }, [phase]);

  const active = phase !== "idle";

  return (
    <>
      {children}

      {/* video precargado en silencio para que el primer disparo no tenga que
          esperar la descarga */}
      <video src={VIDEO_SRC} preload="auto" muted playsInline style={{ display: "none" }} />

      {active && (
        <div
          id={OVERLAY_ID}
          aria-hidden="true"
          className="fixed inset-0 z-[999] pointer-events-auto bg-[#EFE0C2]"
          style={{ opacity: phase === "exiting" ? 0 : 1, transition: `opacity ${FADE_OUT_MS}ms ease` }}
        >
          <video
            ref={videoRef}
            src={VIDEO_SRC}
            muted
            playsInline
            autoPlay
            onEnded={finish}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </>
  );
}
