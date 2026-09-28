"use client";

import React, { useEffect, useRef, useState } from "react";

interface ScrollCanvasBackgroundProps {
  scrollContainerRef: React.RefObject<HTMLElement | null>;
  totalFrames?: number;
}

export default function ScrollCanvasBackground({
  scrollContainerRef,
  totalFrames = 296,
}: ScrollCanvasBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(totalFrames).fill(null));
  const loadedFlagsRef = useRef<boolean[]>(new Array(totalFrames).fill(false));
  
  const currentFrameRef = useRef<number>(1);
  const targetFrameRef = useRef<number>(1);
  const animFrameIdRef = useRef<number | null>(null);
  const [initialFrameLoaded, setInitialFrameLoaded] = useState(false);

  // Formatter for frame paths: /frames/frame_001.png through /frames/frame_296.png
  const getFramePath = (index: number) => {
    const padded = String(index).padStart(3, "0");
    return `/frames/frame_${padded}.png`;
  };

  // Preload frames progressively
  useEffect(() => {
    let isCancelled = false;

    // Load Frame 1 first for immediate render
    const img1 = new Image();
    img1.src = getFramePath(1);
    img1.onload = () => {
      if (isCancelled) return;
      imagesRef.current[0] = img1;
      loadedFlagsRef.current[0] = true;
      setInitialFrameLoaded(true);
    };

    // Load remaining frames in small batches
    const loadRemainingFrames = async () => {
      // Prioritize keyframes (every 4th frame), then fill in remaining
      const keyframeIndices: number[] = [];
      const remainingIndices: number[] = [];

      for (let i = 2; i <= totalFrames; i++) {
        if (i % 4 === 0) {
          keyframeIndices.push(i);
        } else {
          remainingIndices.push(i);
        }
      }

      const loadIndices = [...keyframeIndices, ...remainingIndices];

      for (const idx of loadIndices) {
        if (isCancelled) break;
        
        await new Promise<void>((resolve) => {
          const img = new Image();
          img.src = getFramePath(idx);
          img.onload = () => {
            if (!isCancelled) {
              imagesRef.current[idx - 1] = img;
              loadedFlagsRef.current[idx - 1] = true;
            }
            resolve();
          };
          img.onerror = () => {
            resolve(); // Continue on error
          };
        });
      }
    };

    loadRemainingFrames();

    return () => {
      isCancelled = true;
    };
  }, [totalFrames]);

  // Find the closest loaded image if target frame is still loading
  const getClosestLoadedImage = (targetIndex: number): HTMLImageElement | null => {
    const idx = Math.min(totalFrames, Math.max(1, targetIndex)) - 1;
    if (loadedFlagsRef.current[idx] && imagesRef.current[idx]) {
      return imagesRef.current[idx];
    }

    // Search outwards for nearest loaded frame
    for (let offset = 1; offset < totalFrames; offset++) {
      const prev = idx - offset;
      if (prev >= 0 && loadedFlagsRef.current[prev] && imagesRef.current[prev]) {
        return imagesRef.current[prev];
      }
      const next = idx + offset;
      if (next < totalFrames && loadedFlagsRef.current[next] && imagesRef.current[next]) {
        return imagesRef.current[next];
      }
    }

    return imagesRef.current[0] || null;
  };

  // Draw current frame on canvas with retina scaling & aspect-ratio cover fill
  const drawFrame = (frameNum: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = getClosestLoadedImage(Math.round(frameNum));
    if (!img) return;

    const dpr = window.devicePixelRatio || 1;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Support Retina/DPR
    if (canvas.width !== viewportWidth * dpr || canvas.height !== viewportHeight * dpr) {
      canvas.width = viewportWidth * dpr;
      canvas.height = viewportHeight * dpr;
    }

    ctx.save();
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, viewportWidth, viewportHeight);

    // Calculate aspect-ratio cover fill (no distortion, no letterboxing)
    const imgRatio = img.naturalWidth / img.naturalHeight;
    const screenRatio = viewportWidth / viewportHeight;

    let drawW: number, drawH: number, drawX: number, drawY: number;

    if (screenRatio > imgRatio) {
      drawW = viewportWidth;
      drawH = viewportWidth / imgRatio;
      drawX = 0;
      drawY = (viewportHeight - drawH) / 2;
    } else {
      drawH = viewportHeight;
      drawW = viewportHeight * imgRatio;
      drawX = (viewportWidth - drawW) / 2;
      drawY = 0;
    }

    ctx.drawImage(img, drawX, drawY, drawW, drawH);
    ctx.restore();
  };

  // Scroll listener & persistent animation loop
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateTargetFrame = () => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const rect = container.getBoundingClientRect();
      const scrollableHeight = rect.height - window.innerHeight;

      if (scrollableHeight <= 0) {
        targetFrameRef.current = 1;
        return;
      }

      // Map scroll progress directly: 0% -> frame 1, 100% -> frame 296
      const progress = Math.max(0, Math.min(1, -rect.top / scrollableHeight));
      targetFrameRef.current = 1 + progress * (totalFrames - 1);
    };

    // RAF Animation Loop with smooth lerp interpolation
    const loop = () => {
      updateTargetFrame();

      if (prefersReducedMotion) {
        currentFrameRef.current = targetFrameRef.current;
      } else {
        const diff = targetFrameRef.current - currentFrameRef.current;
        if (Math.abs(diff) > 0.001) {
          // Smooth lerp easing towards target scroll frame
          currentFrameRef.current += diff * 0.14;
        } else {
          currentFrameRef.current = targetFrameRef.current;
        }
      }

      drawFrame(currentFrameRef.current);
      animFrameIdRef.current = requestAnimationFrame(loop);
    };

    const handleScroll = () => {
      updateTargetFrame();
    };

    const handleResize = () => {
      updateTargetFrame();
      drawFrame(currentFrameRef.current);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    // Start persistent animation loop
    animFrameIdRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [scrollContainerRef, totalFrames, initialFrameLoaded]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0 object-cover"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}
