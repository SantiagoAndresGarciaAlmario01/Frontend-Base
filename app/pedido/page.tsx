"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Banknote, CheckCircle2, Clock3, KeyRound, Minus, Plus, ShieldAlert, ShoppingBag, Trash2, Upload } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import AnimatedKitchenBackground from "@/components/AnimatedKitchenBackground";
import { addNotification, getStoredDishes, getStoredReservations, Reservation, saveDishes, saveReservations, UserProfile } from "@/lib/ollacercana-store";

interface CartLine {
  id: number;
  name: string;
  cook: string;
  price: number;
  image: string;
  quantity: number;
  dishId?: string;
}

const CART_KEY = "ollacercana_menu_cart";

function compressImage(file: File): Promise<string> {
  return createImageBitmap(file).then((bitmap) => {
    const scale = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const result = canvas.toDataURL("image/jpeg", 0.62);
    if (Math.ceil((result.length * 3) / 4) > 350 * 1024) throw new Error("La imagen sigue siendo pesada. Adjunta una captura más pequeña.");
    return result;
  });
}

export default function PedidoPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<Reservation["preferredPaymentMethod"]>("Nequi");
  const [receipt, setReceipt] = useState("");
  const [receiptName, setReceiptName] = useState("");
  const [pickupTime, setPickupTime] = useState("Lo antes posible (15-20 min)");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const storedUser = localStorage.getItem("ollacercana_user");
        const parsed = storedUser ? JSON.parse(storedUser) as UserProfile : null;
        if (!parsed?.isLoggedIn || parsed.role !== "comprador") {
          router.replace("/cuenta");
          return;
        }
        setUser(parsed);
        const saved = localStorage.getItem(CART_KEY);
        const parsedCart = saved ? JSON.parse(saved) as CartLine[] : [];
        setLines(Array.isArray(parsedCart) ? parsedCart.filter((item) => item && item.quantity > 0) : []);
      } catch {
        setError("No pudimos leer tu pedido guardado. Vuelve al Libretón y agrega tus platos otra vez.");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [router]);

  const subtotal = useMemo(() => lines.reduce((sum, item) => sum + item.price * item.quantity, 0), [lines]);
  const groupedLines = useMemo(() => lines.reduce<Record<string, CartLine[]>>((groups, item) => {
    (groups[item.cook] ||= []).push(item);
    return groups;
  }, {}), [lines]);

  const saveCart = (next: CartLine[]) => {
    setLines(next);
    localStorage.setItem(CART_KEY, JSON.stringify(next));
  };

  const updateQuantity = (id: number, delta: number) => {
    const next = lines.map((item) => item.id === id ? { ...item, quantity: item.quantity + delta } : item).filter((item) => item.quantity > 0);
    saveCart(next);
  };

  const handleReceipt = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setError("");
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      setError("Adjunta una imagen o un archivo PDF.");
      event.target.value = "";
      return;
    }
    if (file.type === "application/pdf") {
      if (file.size > 350 * 1024) {
        setError("El PDF debe pesar menos de 350 KB.");
        event.target.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setReceipt(reader.result);
          setReceiptName(file.name);
        }
      };
      reader.onerror = () => setError("No se pudo leer el comprobante. Intenta de nuevo.");
      reader.readAsDataURL(file);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setError("La imagen original debe pesar menos de 8 MB.");
      event.target.value = "";
      return;
    }
    try {
      setReceipt(await compressImage(file));
      setReceiptName(file.name);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo procesar la imagen.");
      event.target.value = "";
    }
  };

  const submitOrder = () => {
    if (!user || !lines.length || busy) return;
    setError("");
    if (!user.phoneVerified) {
      setError("Verifica tu número de celular desde tu perfil antes de enviar la solicitud.");
      return;
    }
    if (paymentMethod !== "Efectivo" && !receipt) {
      setError("Adjunta el comprobante de pago para enviar la solicitud a las cocineras.");
      return;
    }

    const storedDishes = getStoredDishes();
    const dishMatches = lines.map((line) => ({
      line,
      dish: storedDishes.find((dish) => dish.id === line.dishId || (dish.name === line.name && dish.cook === line.cook)),
    }));
    const unavailable = dishMatches.find(({ line, dish }) => !dish || dish.status !== "DISPONIBLE" || dish.availablePortions < line.quantity);
    if (unavailable) {
      setError(`Revisa la disponibilidad de “${unavailable.line.name}”. Puede que ya no queden suficientes porciones.`);
      return;
    }

    const now = new Date();
    const requests: Reservation[] = dishMatches.map(({ line, dish }) => ({
      id: `res-${now.getTime()}-${line.id}`,
      dishId: dish!.id,
      dishName: dish!.name,
      dishImage: dish!.image,
      cookId: dish!.cookId,
      cookName: dish!.cook,
      buyerName: user.name || user.email,
      buyerEmail: user.email,
      portions: line.quantity,
      pricePerPortion: dish!.price,
      totalPrice: dish!.price * line.quantity,
      preferredPaymentMethod: paymentMethod,
      paymentReceipt: receipt || undefined,
      paymentReceiptName: receiptName || undefined,
      pickupTime,
      status: "PENDIENTE",
      createdAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + 10 * 60 * 1000).toISOString(),
    }));

    setBusy(true);
    try {
      saveReservations([...requests, ...getStoredReservations()]);
      saveDishes(storedDishes.map((dish) => {
        const reserved = requests.filter((request) => request.dishId === dish.id).reduce((sum, request) => sum + request.portions, 0);
        const available = Math.max(0, dish.availablePortions - reserved);
        return reserved ? { ...dish, availablePortions: available, reservedPortions: dish.reservedPortions + reserved, status: available ? "DISPONIBLE" : "AGOTADO" } : dish;
      }));
      requests.forEach((request) => {
        try {
          addNotification("Solicitud enviada", `Tu solicitud de ${request.dishName} se envió a ${request.cookName}.`, user.email);
        } catch {
          // La reserva ya está guardada; un fallo del aviso no debe duplicar el pedido.
        }
      });
      localStorage.setItem(CART_KEY, "[]");
      setLines([]);
      setSuccess(true);
    } catch {
      setError("No se pudieron guardar las solicitudes. El almacenamiento del navegador puede estar lleno; prueba con un comprobante más liviano.");
      setBusy(false);
    }
  };

  return (
    <main data-theme-page className="relative min-h-screen overflow-x-hidden bg-[#20170f] font-['Outfit',sans-serif] text-[#2b2117]">
      <AnimatedKitchenBackground />
      <header className="relative z-10 border-b border-[#d9c19a] bg-[#f2e4c9]/95 px-4 py-3 shadow-md sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/menu" aria-label="Volver al Libretón"><BrandLogo size="sm" /></Link>
          <span className="hidden text-sm font-semibold text-[#674a31] sm:block">Tu compra vecinal</span>
          <Link href="/menu" className="inline-flex items-center gap-2 rounded-full border border-[#ad8a5e] px-3 py-2 text-sm font-semibold text-[#573c27] hover:bg-[#e8d1a3]"><ArrowLeft className="h-4 w-4"/> Volver</Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-7 sm:px-8 sm:py-10">
        {success ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-[#bda078] bg-[#f4e8cf] p-7 text-center shadow-2xl sm:p-10">
            <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-700" />
            <h1 className="font-['Caveat',cursive] text-4xl font-bold">¡Solicitud enviada!</h1>
            <p className="mt-2 text-sm text-[#6a5037]">Cada cocinera recibió la solicitud de sus platos. Te avisaremos cuando respondan.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/cuenta/reservas" className="rounded-full bg-[#526f42] px-6 py-3 text-sm font-bold text-white">Ver mis pedidos</Link>
              <Link href="/menu" className="rounded-full border border-[#ad8a5e] px-6 py-3 text-sm font-bold text-[#573c27]">Volver al Libretón</Link>
            </div>
          </section>
        ) : (
          <>
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-[#f5c879]">Antes de que empiece el hervor</p>
              <h1 className="mt-1 font-['Caveat',cursive] text-4xl font-extrabold text-[#fff1d5] sm:text-5xl">Revisa tu pedido</h1>
              <p className="mt-1 text-sm text-[#f4e8cf]/80">Confirma los platos, cantidades y forma de pago antes de enviar las solicitudes.</p>
            </div>

            {!user ? <div className="rounded-2xl bg-[#f4e8cf] p-6 text-sm">Cargando tu cuenta…</div> : lines.length === 0 ? (
              <section className="rounded-3xl border border-[#bda078] bg-[#f4e8cf] p-8 text-center shadow-xl">
                <ShoppingBag className="mx-auto h-10 w-10 text-[#a84029]" />
                <h2 className="mt-3 font-['Caveat',cursive] text-3xl font-bold">Tu canasta está vacía</h2>
                <p className="mt-1 text-sm text-[#6a5037]">Vuelve al Libretón y añade los platos que quieras pedir.</p>
                <Link href="/menu" className="mt-5 inline-flex rounded-full bg-[#bd4828] px-6 py-3 text-sm font-bold text-white">Explorar platos</Link>
              </section>
            ) : (
              <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
                <div className="space-y-4">
                  {Object.entries(groupedLines).map(([cook, items]) => (
                    <section key={cook} className="overflow-hidden rounded-3xl border border-[#bda078] bg-[#f4e8cf] shadow-xl">
                      <div className="border-b border-dashed border-[#bda078] bg-[#ead7b3] px-5 py-4">
                        <p className="text-[10px] font-bold uppercase tracking-[.15em] text-[#8e5030]">Una solicitud para esta cocina</p>
                        <h2 className="font-['Caveat',cursive] text-2xl font-bold">Cocina de {cook}</h2>
                      </div>
                      <div className="divide-y divide-dashed divide-[#c9b38f] px-4 sm:px-5">
                        {items.map((item) => (
                          <article key={item.id} className="flex gap-3 py-4 sm:gap-4">
                            <Image src={item.image} alt="" width={96} height={96} className="h-20 w-20 shrink-0 rounded-2xl border border-[#bda078] object-cover sm:h-24 sm:w-24" />
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-bold text-[#30251b]">{item.name}</h3>
                              <p className="text-xs text-[#796448]">{item.cook} · porción ${item.price.toLocaleString("es-CO")}</p>
                              <p className="mt-1 font-bold text-[#a84029]">${(item.price * item.quantity).toLocaleString("es-CO")}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <button onClick={() => updateQuantity(item.id, -1)} aria-label={`Quitar una porción de ${item.name}`} className="rounded-full border border-[#ae9066] bg-white/70 p-1.5"><Minus className="h-3.5 w-3.5"/></button>
                                <span className="min-w-5 text-center text-sm font-bold">{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} aria-label={`Agregar una porción de ${item.name}`} className="rounded-full border border-[#ae9066] bg-white/70 p-1.5"><Plus className="h-3.5 w-3.5"/></button>
                                <button onClick={() => saveCart(lines.filter((line) => line.id !== item.id))} className="ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-[#8c3927] hover:bg-red-100"><Trash2 className="h-3.5 w-3.5"/> Quitar</button>
                              </div>
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  ))}

                  <section className="space-y-4 rounded-3xl border border-[#bda078] bg-[#f4e8cf] p-5 shadow-xl">
                    <div>
                      <h2 className="font-['Caveat',cursive] text-2xl font-bold">¿Cómo acordarán el pago?</h2>
                      <p className="text-xs text-[#796448]">El pago se acuerda directamente con cada cocinera; OllaCercana no lo procesa.</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {(["Nequi", "Llaves", "Efectivo"] as const).map((method) => <button key={method} onClick={() => { setPaymentMethod(method); if (method === "Efectivo") { setReceipt(""); setReceiptName(""); } setError(""); }} aria-pressed={paymentMethod === method} className={`rounded-xl border px-2 py-3 text-sm font-bold ${paymentMethod === method ? "border-[#d66a25] bg-[#ec7928] text-white" : "border-[#c9b38f] bg-white/70 text-[#493323]"}`}>
                        <span className="inline-flex items-center gap-1.5">{method === "Llaves" ? <KeyRound className="h-4 w-4"/> : method === "Efectivo" ? <Banknote className="h-4 w-4"/> : <span className="rounded bg-[#e6007e] px-1.5 text-white">n</span>}{method}</span>{method === "Llaves" && <span className="block text-[9px] opacity-75">Bre-B</span>}
                      </button>)}
                    </div>
                    {paymentMethod !== "Efectivo" && <div className="rounded-2xl border border-dashed border-[#c4a77d] bg-[#fff9ed] p-3">
                      <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#c4a77d] bg-white px-3 py-3 text-sm font-bold text-[#493323] hover:bg-[#f7eddb]"><Upload className="h-4 w-4 text-[#a84029]"/><span className="min-w-0 flex-1 truncate">{receiptName || "Adjuntar comprobante"}</span>{receipt && <CheckCircle2 className="h-4 w-4 text-emerald-700"/>}<input className="sr-only" type="file" accept="image/*,application/pdf" onChange={handleReceipt}/></label>
                      <p className="mt-2 text-xs text-[#6b563b]">La cocinera revisará el comprobante junto con la solicitud.</p>
                    </div>}
                    <label className="block text-sm font-bold">Hora estimada de recogida<select value={pickupTime} onChange={(event) => setPickupTime(event.target.value)} className="mt-2 w-full rounded-xl border border-[#c9b38f] bg-white px-3 py-3 text-sm font-medium"><option>Lo antes posible (15-20 min)</option><option>12:30 PM</option><option>1:00 PM</option><option>1:30 PM</option><option>2:00 PM</option><option>Acordar por chat</option></select></label>
                  </section>
                </div>

                <aside className="space-y-4 lg:sticky lg:top-5">
                  <section className="rounded-3xl border border-[#bda078] bg-[#f4e8cf] p-5 shadow-xl">
                    <h2 className="flex items-center gap-2 font-['Caveat',cursive] text-2xl font-bold"><ShoppingBag className="h-5 w-5 text-[#a84029]"/> Resumen del pedido</h2>
                    <div className="mt-4 space-y-2 border-y border-dashed border-[#bda078] py-4 text-sm">
                      {lines.map((item) => <div key={item.id} className="flex justify-between gap-3"><span className="min-w-0 truncate">{item.quantity} × {item.name}</span><strong>${(item.quantity * item.price).toLocaleString("es-CO")}</strong></div>)}
                    </div>
                    <div className="flex justify-between py-4 text-lg font-extrabold text-[#9b3f22]"><span>Total estimado</span><span>${subtotal.toLocaleString("es-CO")}</span></div>
                    <div className="mb-4 flex gap-2 rounded-xl bg-amber-100 p-3 text-xs leading-relaxed text-amber-950"><ShieldAlert className="h-4 w-4 shrink-0"/><span>OllaCercana no procesa pagos. El comprobante solo ayuda a la cocinera a revisar tu solicitud.</span></div>
                    {error && <p role="alert" className="mb-3 rounded-xl border border-red-300 bg-red-50 p-3 text-xs font-semibold text-red-800">{error}</p>}
                    <button disabled={busy} onClick={submitOrder} className="w-full rounded-full bg-gradient-to-r from-[#e66c21] to-[#c8492a] px-4 py-4 text-sm font-extrabold text-white shadow-lg hover:brightness-110 disabled:opacity-60">{busy ? "Enviando…" : `Enviar ${Object.keys(groupedLines).length} solicitud${Object.keys(groupedLines).length === 1 ? "" : "es"}`}</button>
                    <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#796448]"><Clock3 className="h-3.5 w-3.5"/> Las cocineras deben confirmar cada solicitud.</p>
                  </section>
                  <Link href="/menu" className="block text-center text-sm font-bold text-[#fff1d5] underline decoration-white/40 underline-offset-4">Seguir explorando platos</Link>
                </aside>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
