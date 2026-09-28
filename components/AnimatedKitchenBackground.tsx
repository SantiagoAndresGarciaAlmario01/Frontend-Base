"use client";

import { useEffect, useRef } from "react";

// Fondo animado (150 frames) compartido por todas las páginas de /cuenta.
// Extraído del componente original de /cuenta para reutilizarse sin duplicar
// la lógica de animación en cada página nueva. Visualmente es idéntico al
// que ya existía.
export default function AnimatedKitchenBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const frameIndexRef = useRef(0);

  useEffect(() => {
    const totalFrames = 150;
    const images: HTMLImageElement[] = [];
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const pad = (n: number) => String(n).padStart(3, "0");

    // Load Frame 1 immediately
    const frame1 = new Image();
    frame1.src = `/frames-login/frame_001.png`;
    images[0] = frame1;

    frame1.onload = () => {
      drawCanvasFrame(frame1);
    };

    // Preload remaining frames 2..150
    for (let i = 1; i < totalFrames; i++) {
      const img = new Image();
      img.src = `/frames-login/frame_${pad(i + 1)}.png`;
      images[i] = img;
    }
    imagesRef.current = images;

    const drawCanvasFrame = (img: HTMLImageElement) => {
      if (!canvasRef.current || !img || !img.complete || img.naturalWidth === 0) return;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displayWidth = window.innerWidth;
      const displayHeight = window.innerHeight;

      if (canvas.width !== displayWidth * dpr || canvas.height !== displayHeight * dpr) {
        canvas.width = displayWidth * dpr;
        canvas.height = displayHeight * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, displayWidth, displayHeight);

      // Aspect Ratio Cover Math
      const imgWidth = img.naturalWidth || img.width || 1920;
      const imgHeight = img.naturalHeight || img.height || 1080;
      const imgRatio = imgWidth / imgHeight;
      const screenRatio = displayWidth / displayHeight;

      let drawW = displayWidth;
      let drawH = displayHeight;
      let offsetX = 0;
      let offsetY = 0;

      if (screenRatio > imgRatio) {
        drawH = displayWidth / imgRatio;
        offsetY = (displayHeight - drawH) / 2;
      } else {
        drawW = displayHeight * imgRatio;
        offsetX = (displayWidth - drawW) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
      ctx.restore();
    };

    let animationFrameId: number;
    let lastTime = performance.now();
    const fps = 25; // ~25 FPS animation rate
    const frameInterval = 1000 / fps;

    const renderLoop = (now: number) => {
      if (!prefersReducedMotion) {
        const elapsed = now - lastTime;
        if (elapsed >= frameInterval) {
          lastTime = now - (elapsed % frameInterval);

          frameIndexRef.current = (frameIndexRef.current + 1) % totalFrames;
          const currentImg = imagesRef.current[frameIndexRef.current];

          if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
            drawCanvasFrame(currentImg);
          } else {
            // Fallback to frame 1 if not fully loaded yet
            const firstImg = imagesRef.current[0];
            if (firstImg && firstImg.complete) drawCanvasFrame(firstImg);
          }
        }
        animationFrameId = requestAnimationFrame(renderLoop);
      } else {
        // Reduced motion: static frame 1
        const firstImg = imagesRef.current[0];
        if (firstImg && firstImg.complete) drawCanvasFrame(firstImg);
      }
    };

    if (!prefersReducedMotion) {
      animationFrameId = requestAnimationFrame(renderLoop);
    }

    const handleResize = () => {
      const curImg = imagesRef.current[frameIndexRef.current] || imagesRef.current[0];
      if (curImg && curImg.complete) drawCanvasFrame(curImg);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none filter brightness-125"
      />

      {/* Lighter Overlay Gradients so Video Stays Visible */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#14110f]/60 via-[#14110f]/25 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-radial from-transparent via-[#14110f]/20 to-[#14110f]/40 pointer-events-none" />

      {/* Subtle Orange & Green Brand Ambient Glow Accents */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 rounded-full bg-[#F0822D]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-[30rem] h-[30rem] rounded-full bg-[#62B869]/15 blur-[140px] pointer-events-none" />
    </div>
  );
}
