"use client";

import { useEffect } from "react";

export default function UserPreferencesInitializer() {
  useEffect(() => {
    const appearance = localStorage.getItem("ollacercana_menu_theme");
    const reduceMotion = localStorage.getItem("ollacercana_reduce_motion");
    const textSize = localStorage.getItem("ollacercana_text_size");
    document.documentElement.dataset.appearance = appearance === "dark" ? "dark" : "light";
    document.documentElement.dataset.reduceMotion = String(reduceMotion === "true");
    document.documentElement.dataset.textSize = textSize === "large" ? "large" : "standard";
  }, []);

  return null;
}
