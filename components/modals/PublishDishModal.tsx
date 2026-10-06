"use client";

import React, { useState } from "react";
import { DishItem, getStoredDishes, saveDishes, UserProfile } from "@/lib/ollacercana-store";
import { UtensilsCrossed, X, Upload } from "lucide-react";

interface PublishDishModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile;
  onDishPublished: () => void;
  onRequestPhoneVerification: () => void;
}

const IMAGE_PRESETS = [
  { label: "Ajiaco", url: "/images/menu_ajiaco.jpg" },
  { label: "Cazuela/Bandeja", url: "/images/menu_cazuela.jpg" },
  { label: "Pollo Guisado", url: "/images/dish_pollo_chalk.jpg" },
  { label: "Plato Gourmet", url: "/images/hero_plate_gourmet.jpg" },
  { label: "Sancocho / Sopa", url: "/images/olla_dish_1.jpg" },
  { label: "Postre Casero", url: "/images/menu_postre.jpg" },
];

export default function PublishDishModal({
  isOpen,
  onClose,
  currentUser,
  onDishPublished,
  onRequestPhoneVerification,
}: PublishDishModalProps) {
  const [name, setName] = useState("");
  const [category, setCategory] = useState<"Almuerzos" | "Sopas" | "Vegetariano" | "Postres">("Almuerzos");
  const [dietaryTags, setDietaryTags] = useState<string[]>([]);
  const [price, setPrice] = useState<number | "">(18000);
  const [portions, setPortions] = useState<number | "">(5);
  const [description, setDescription] = useState("");
  const [selectedImage, setSelectedImage] = useState(IMAGE_PRESETS[0].url);
  const [residentialComplex, setResidentialComplex] = useState(currentUser.residentialComplex || "Conjunto San Luis");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (dietaryTags.includes(tag)) {
      setDietaryTags(dietaryTags.filter((t) => t !== tag));
    } else {
      setDietaryTags([...dietaryTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // HU-03 Check: Phone verification
    if (!currentUser.phoneVerified) {
      setError("Debes verificar tu número de teléfono antes de publicar un plato.");
      onRequestPhoneVerification();
      return;
    }

    // Validation checks (HU-04)
    if (!name || name.trim().length === 0) {
      setError("El nombre del plato es obligatorio.");
      return;
    }
    if (name.length > 50) {
      setError("El nombre del plato no puede exceder 50 caracteres.");
      return;
    }
    if (!description || description.trim().length === 0) {
      setError("La descripción es obligatoria.");
      return;
    }
    if (description.length > 200) {
      setError("La descripción no puede exceder 200 caracteres.");
      return;
    }
    const numPrice = Number(price);
    if (isNaN(numPrice) || numPrice <= 0) {
      setError("El precio debe ser un valor numérico mayor a $0 COP.");
      return;
    }
    if (numPrice > 50000) {
      setError("El precio por porción no puede exceder $50.000 COP.");
      return;
    }
    const numPortions = Number(portions);
    if (isNaN(numPortions) || numPortions < 1 || numPortions > 20) {
      setError("El número de porciones disponibles debe estar entre 1 y 20.");
      return;
    }

    // Check max 3 active publications rule (HU-04)
    const existingDishes = getStoredDishes();
    const activeCookDishes = existingDishes.filter(
      (d) => (d.cookId === currentUser.email || d.cook === (currentUser.commercialName || currentUser.name)) && d.status === "DISPONIBLE"
    );

    if (activeCookDishes.length >= 3) {
      setError("Ha alcanzado el límite máximo de 3 publicaciones activas simultáneas.");
      return;
    }

    // Create dish item
    const cookDisplayName = currentUser.commercialName || currentUser.name || "Doña Rosa";
    const newDish: DishItem = {
      id: `dish-${Date.now()}`,
      name: name.trim(),
      category,
      dietaryTags: dietaryTags as any,
      badge: "Recién publicado",
      price: numPrice,
      formattedPrice: `$${numPrice.toLocaleString("es-CO")}`,
      image: selectedImage,
      cook: cookDisplayName,
      cookId: currentUser.email || cookDisplayName.toLowerCase().replace(/\s+/g, "-"),
      cookAvatar: "/images/dona_rosa_mascot.jpg",
      rating: "5,0",
      reviews: 1,
      distance: "A 300 m",
      distanceMeters: 300,
      residentialComplex: residentialComplex || "Conjunto Cercano",
      totalPortions: numPortions,
      availablePortions: numPortions,
      reservedPortions: 0,
      status: "DISPONIBLE",
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    saveDishes([newDish, ...existingDishes]);
    setSuccess("¡Plato publicado exitosamente con porciones asignadas!");
    setTimeout(() => {
      onDishPublished();
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto animate-fadeIn">
      <div role="dialog" aria-modal="true" aria-labelledby="publish-dish-title" className="bg-[#18231B] border border-amber-600/30 text-amber-100 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative my-8">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar publicación de plato"
          className="absolute top-4 right-4 text-amber-300 hover:text-white p-1 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-[#62B869]/20 border border-[#62B869]/40 flex items-center justify-center">
            <UtensilsCrossed className="w-5 h-5 text-[#62B869]" />
          </div>
          <div>
            <h3 id="publish-dish-title" className="font-playfair text-xl font-bold text-amber-200">
              Publicar un plato casero
            </h3>
            <p className="text-xs text-amber-300/80">Ofrece tus porciones frescas a tus vecinos</p>
          </div>
        </div>

        {error && (
          <div role="alert" className="mb-4 p-3 bg-red-900/50 border border-red-500/50 text-red-200 text-xs rounded-xl">
            {error}
          </div>
        )}

        {success && (
          <div role="status" className="mb-4 p-3 bg-emerald-900/50 border border-emerald-500/50 text-emerald-200 text-xs rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="publish-dish-name" className="block text-xs font-semibold text-amber-300 mb-1">
              Nombre del Plato (Máx 50 caracteres) *
            </label>
            <input
              id="publish-dish-name"
              type="text"
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Ajiaco Santafereño con alcaparras"
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3.5 py-2 text-sm text-white placeholder-amber-500/30 focus:outline-none focus:border-[#F0822D]"
              required
            />
            <span className="text-[10px] text-amber-400/60 float-right mt-0.5">
              {name.length}/50
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="publish-dish-category" className="block text-xs font-semibold text-amber-300 mb-1">Categoría *</label>
              <select
                id="publish-dish-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3 py-2 text-sm text-amber-100 focus:outline-none focus:border-[#F0822D]"
              >
                <option value="Almuerzos">Almuerzos</option>
                <option value="Sopas">Sopas</option>
                <option value="Vegetariano">Vegetariano</option>
                <option value="Postres">Postres</option>
              </select>
            </div>
            <div>
              <label htmlFor="publish-dish-portions" className="block text-xs font-semibold text-amber-300 mb-1">
                Porciones (1 a 20) *
              </label>
              <input
                id="publish-dish-portions"
                type="number"
                min={1}
                max={20}
                value={portions}
                onChange={(e) => setPortions(e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F0822D]"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="publish-dish-price" className="block text-xs font-semibold text-amber-300 mb-1">
              Precio por porción ($ COP) *
            </label>
            <input
              id="publish-dish-price"
              type="number"
              min={1000}
              step={500}
              value={price}
              onChange={(e) => setPrice(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:border-[#F0822D]"
              required
            />
          </div>

          <div>
            <label htmlFor="publish-dish-description" className="block text-xs font-semibold text-amber-300 mb-1">
              Opciones de alimentación
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {["Vegetariano", "Sin Gluten", "Sin Lactosa", "Vegano"].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  aria-pressed={dietaryTags.includes(tag)}
                  className={`px-3 py-1 text-xs rounded-full border transition-all ${
                    dietaryTags.includes(tag)
                      ? "bg-[#62B869] border-[#62B869] text-white font-medium"
                      : "bg-[#101712] border-amber-700/40 text-amber-300 hover:border-amber-500"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-amber-200/80">Estas etiquetas describen el plato; no garantizan que esté libre de trazas. Indica los ingredientes y pide a tus clientes que confirmen alergias contigo.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1">
              Descripción del plato (Máx 200 caracteres) *
            </label>
            <textarea
              id="publish-dish-description"
              maxLength={200}
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe los ingredientes, guarniciones y sazón casera..."
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl p-3 text-xs text-white placeholder-amber-500/30 focus:outline-none focus:border-[#F0822D]"
              required
            />
            <span className="text-[10px] text-amber-400/60 float-right mt-0.5">
              {description.length}/200
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-amber-300 mb-1.5">
              Fotografía del Plato (Adjuntar foto real)
            </label>
            
            <div className="mb-3">
              <label className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-amber-600/50 bg-[#101712] hover:border-[#F0822D] text-amber-200 text-xs font-semibold cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-[#F0822D]" />
                <span>Subir imagen desde mi dispositivo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setSelectedImage(evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>

            <p className="text-[11px] text-amber-400/60 mb-2 font-mono">O selecciona una plantilla de imagen previa:</p>

            <div className="grid grid-cols-3 gap-2">
              {IMAGE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.url}
                  onClick={() => setSelectedImage(preset.url)}
                  className={`relative rounded-xl overflow-hidden border-2 h-16 text-left p-1 transition-all ${
                    selectedImage === preset.url
                      ? "border-[#F0822D] ring-2 ring-[#F0822D]/50 scale-105"
                      : "border-amber-900/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={preset.url} alt={preset.label} className="w-full h-full object-cover rounded-lg" />
                  <span className="absolute bottom-1 left-1 right-1 bg-black/70 text-[9px] text-amber-200 px-1 rounded truncate">
                    {preset.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="publish-dish-sector" className="block text-xs font-semibold text-amber-300 mb-1">
              Conjunto Residencial / Sector
            </label>
            <input
              id="publish-dish-sector"
              type="text"
              value={residentialComplex}
              onChange={(e) => setResidentialComplex(e.target.value)}
              className="w-full bg-[#101712] border border-amber-700/50 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#F0822D]"
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
              className="flex-1 py-2.5 bg-gradient-to-r from-[#F0822D] to-[#E06F1A] text-white font-semibold text-sm rounded-xl shadow-lg hover:brightness-110 transition-all"
            >
              Publicar Plato
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
