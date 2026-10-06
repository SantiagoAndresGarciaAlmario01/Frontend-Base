"use client";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, MessageCircle, Send, X } from "lucide-react";

type ActionIntent = "add" | "reserve";
type ActionRequest = { intent: ActionIntent; dish: string };
type Message = {
  id: number;
  from: "user" | "abuela";
  text: string;
  href?: string;
  action?: ActionRequest;
};

const FAQS: { keywords: string[]; answer: string; href?: string }[] = [
  { keywords: ["hola", "buenas", "buenos dias", "buenas tardes", "buenas noches", "que puedes hacer"], answer: "¡Hola, mi cielo! Soy la abuelita de OllaCercana. Te ayudo a encontrar platos, hacer una reserva, entender los pagos o entrar a tu cuenta. Cuéntame qué necesitas.", href: "/ayuda" },
  { keywords: ["hacer pedido", "pedir comida", "como pido", "como hago un pedido", "reservar", "reserva", "comprar"], answer: "Para pedir, entra al Libretón, elige un plato y toca «Reservar». Necesitas iniciar sesión; después envías la solicitud y la cocinera te confirma. También puedes pedirme que abra la reserva de un plato por su nombre.", href: "/menu" },
  { keywords: ["anadir", "agregar", "carrito", "canasta"], answer: "Puedo ayudarte a añadir un plato a tu pedido. Dime «añade [nombre del plato]» y te pediré confirmación antes de hacerlo. Para añadir o reservar debes haber iniciado sesión.", href: "/menu" },
  { keywords: ["pago", "pagar", "nequi", "llaves", "efectivo", "comprobante", "transferencia", "dinero"], answer: "OllaCercana no procesa pagos ni guarda tu dinero. El pago se acuerda directamente con la cocinera. Si usan transferencia, puedes adjuntar el comprobante en la reserva para que ella lo revise.", href: "/ayuda#pagos" },
  { keywords: ["envio", "domicilio", "entrega", "recoger", "recogida", "direccion", "donde recojo"], answer: "La entrega o recogida se coordina con la cocinera por el chat de la reserva. Revisa la distancia y la hora estimada del plato; acuerden el punto antes de salir.", href: "/cuenta/reservas" },
  { keywords: ["estado pedido", "seguimiento", "confirmada", "pendiente", "preparacion", "recibido", "cerrar chat"], answer: "En «Mis pedidos» verás el avance: solicitud, confirmación de la cocinera, preparación y entrega, y recibido. Cuando tengas el plato, márcalo como recibido; así se cierra la conversación del pedido.", href: "/cuenta/reservas" },
  { keywords: ["cancelar", "cancelacion", "anular", "cambiar pedido"], answer: "En esta versión no hay un botón automático para cancelar. Abre el chat de esa reserva y avísale pronto a la cocinera para que puedan ponerse de acuerdo.", href: "/cuenta/chats" },
  { keywords: ["cocinera no responde", "no me contesta", "no responde", "tarda en confirmar"], answer: "Mira primero el estado de la reserva y escríbele con amabilidad desde el chat. Si todavía no confirma, evita hacer otro pago: OllaCercana no procesa pagos ni puede confirmar en su nombre.", href: "/cuenta/chats" },
  { keywords: ["reembolso", "devolucion", "me cobraron", "cobro"], answer: "OllaCercana no cobra ni procesa pagos, por eso no puede hacer reembolsos desde la página. Si ya acordaste un pago, comunícate con la cocinera desde el chat de la reserva.", href: "/cuenta/chats" },
  { keywords: ["chat", "hablar", "mensaje", "conversacion", "cocinera"], answer: "Los chats se abren desde una reserva y sirven para coordinar la preparación, el pago acordado y la entrega. Cuando marques el pedido como recibido, el chat se cierra.", href: "/cuenta/chats" },
  { keywords: ["registrar", "registro", "crear cuenta", "inscribirme"], answer: "Puedes crear una cuenta desde «Registrarme». Completa tus datos y escoge el rol que corresponde. Para publicar comida, regístrate como cocinera.", href: "/cuenta/registro" },
  { keywords: ["iniciar sesion", "entrar", "login", "contrasena", "clave", "no puedo entrar"], answer: "Entra desde «Iniciar sesión» con el correo o celular y la contraseña de tu cuenta. Esta versión de demostración guarda la sesión en este navegador; no envía correos para recuperar contraseñas.", href: "/cuenta" },
  { keywords: ["olvide", "recuperar contrasena", "restablecer clave"], answer: "La recuperación automática de contraseña todavía no está habilitada en esta versión. Si es una cuenta de demostración, puedes crear otra desde este navegador.", href: "/cuenta/registro" },
  { keywords: ["publicar plato", "vender", "soy cocinera", "cocinar", "mis platos"], answer: "¡Qué rico que quieras compartir tu sazón! Regístrate o inicia sesión con el rol de cocinera. Desde «Modo Cocinera» puedes activar tu perfil y publicar platos.", href: "/cuenta/registro" },
  { keywords: ["aceptar datos", "activar cocinera", "perfil cocinera", "consentimiento"], answer: "Para activar el perfil de cocinera debes aceptar la política de tratamiento de datos y los términos de convivencia. Luego podrás publicar y administrar porciones.", href: "/cuenta/cocina" },
  { keywords: ["calificar", "resena", "opinion", "estrellas"], answer: "Cuando el pedido se complete podrás calificar la experiencia desde «Mis pedidos». Las calificaciones ayudan a los vecinos a conocer las cocinas.", href: "/cuenta/reservas" },
  { keywords: ["reportar", "denunciar", "plato sospechoso", "problema con una publicacion"], answer: "Puedes reportar una publicación desde sus opciones en el Libretón. La administración revisa los reportes; no publiques información privada en el reporte.", href: "/menu" },
  { keywords: ["agotado", "sin porciones", "disponibilidad", "no hay platos"], answer: "La disponibilidad la actualiza cada cocinera. Prueba quitar filtros o escribirle desde una reserva si ya tienes una; el chat no puede crear porciones que no estén publicadas.", href: "/menu" },
  { keywords: ["mapa", "cercanas", "cocinas cerca", "distancia", "barrio", "ubicacion"], answer: "En «Cocinas cercanas» puedes explorar el mapa, buscar por nombre o plato y filtrar por distancia o por cocinas abiertas.", href: "/cocineras-cercanas" },
  { keywords: ["buscar plato", "menu", "libreton", "platos", "antojo", "comida"], answer: "En el Libretón puedes buscar por nombre de plato o cocinera, filtrar por categoría y revisar las porciones disponibles. Si tienes uno en mente, dime su nombre y te ayudo a encontrarlo.", href: "/menu" },
  { keywords: ["alergia", "alergico", "gluten", "lactosa", "ingredientes", "vegetariano", "vegano"], answer: "Puedes usar las etiquetas como orientación, pero confirma ingredientes y posibles trazas directamente con la cocinera antes de reservar. Las recetas pueden variar entre cocinas.", href: "/menu" },
  { keywords: ["ajustes", "modo oscuro", "modo claro", "letra", "tamano texto", "animacion", "transicion"], answer: "En Ajustes puedes elegir el tema claro u oscuro, el tamaño del texto y si quieres la transición de la abuelita o menos movimiento.", href: "/cuenta/ajustes" },
  { keywords: ["aviso", "notificacion", "campana"], answer: "Tus avisos sobre reservas y conversaciones están en «Avisos». Desde allí puedes marcar las novedades como leídas.", href: "/cuenta/avisos" },
  { keywords: ["perfil", "mis datos", "celular", "telefono", "medio de pago"], answer: "En tu perfil puedes revisar tus datos y métodos de pago. Los cambios se guardan en este navegador en la versión de demostración.", href: "/cuenta/perfil" },
  { keywords: ["administrador", "admin", "denuncia", "reporte", "moderacion"], answer: "La sección de administración solo está disponible para cuentas con rol administrador. Allí se revisan los reportes de la comunidad.", href: "/cuenta/admin" },
  { keywords: ["datos", "privacidad", "seguridad", "informacion personal"], answer: "Esta versión es una demostración y guarda parte de la información en el almacenamiento local del navegador. No compartas datos sensibles en el chat; revisa los permisos antes de usarla con información real.", href: "/ayuda" },
  { keywords: ["error", "no funciona", "problema", "pantalla", "cargando", "bug"], answer: "Ay, revisemos. Prueba actualizar la página y confirma que hayas iniciado sesión si quieres reservar. Si el problema continúa, dime en qué pantalla ocurre y qué estabas intentando hacer.", href: "/ayuda" },
  { keywords: ["ollaverde", "olla verde", "sello", "distintivo", "meta"], answer: "Olla Verde es el reconocimiento comunitario del conjunto para las cocineras que cumplen la meta compartida durante siete días. Si buscas una función concreta del sello, cuéntame cuál.", href: "/menu#olla-verde" },
];

const DISH_ALIASES: { name: string; aliases: string[] }[] = [
  { name: "Ajiaco de la casa", aliases: ["ajiaco"] },
  { name: "Bandeja casera", aliases: ["bandeja", "bandeja paisa"] },
  { name: "Pollo guisado", aliases: ["pollo guisado", "pollo guisado campesino", "pollo"] },
  { name: "Lentejas con arroz", aliases: ["lentejas", "lentejas con arroz"] },
  { name: "Sancocho de pollo", aliases: ["sancocho"] },
  { name: "Arroz con leche", aliases: ["arroz con leche"] },
  { name: "Arepas con queso", aliases: ["arepas", "arepa con queso"] },
  { name: "Empanadas de carne", aliases: ["empanadas", "empanada"] },
];

const QUICK_QUESTIONS = ["¿Cómo hago un pedido?", "¿Cómo se paga?", "¿Cómo me registro?"];

function normalize(value: string) {
  return value.toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[¿?¡!.,;:]/g, "").trim();
}

function getFaqReply(message: string) {
  const normalized = normalize(message);
  let best: (typeof FAQS)[number] | undefined;
  let bestScore = 0;
  for (const faq of FAQS) {
    const score = faq.keywords.reduce((total, keyword) => total + (normalized.includes(normalize(keyword)) ? normalize(keyword).split(" ").length : 0), 0);
    if (score > bestScore) { best = faq; bestScore = score; }
  }
  return best ?? {
    answer: "No quiero inventarte una respuesta, mi cielo. Puedo orientarte con pedidos, pagos, cuenta, cocinas cercanas, chats y ajustes. ¿Qué parte necesitas resolver?",
    href: "/ayuda",
  };
}

function getActionRequest(message: string): ActionRequest | null | "missing-dish" {
  const normalized = normalize(message);
  const addIntent = /\b(anade|agrega|agregar|anadir|pon|mete)\b/.test(normalized) || normalized.includes("al carrito") || normalized.includes("a la canasta");
  const reserveIntent = /\b(pide|pedir|reserva|reservar|compra|comprar|ordenar)\b/.test(normalized);
  if (!addIntent && !reserveIntent) return null;
  const dish = DISH_ALIASES.find(({ aliases }) => aliases.some((alias) => normalized.includes(normalize(alias))));
  return dish ? { intent: addIntent ? "add" : "reserve", dish: dish.name } : "missing-dish";
}

export default function AbuelitaHelpChat() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [pendingAction, setPendingAction] = useState<ActionRequest | null>(null);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, from: "abuela", text: "¡Hola, mi cielo! Soy la abuelita de OllaCercana. Pregúntame lo que quieras o dime qué tarea necesitas hacer." },
  ]);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  useEffect(() => {
    const onResult = (event: Event) => {
      const { intent, dish, success, reason } = (event as CustomEvent<{ intent: ActionIntent; dish: string; success: boolean; reason?: string }>).detail;
      const actionText = intent === "add" ? "añadir" : "reservar";
      const text = success
        ? intent === "add" ? `¡Listo! Añadí ${dish} a tu pedido. Puedes revisar la canasta en el Libretón.` : `Ya abrí la reserva de ${dish}. Revisa los detalles antes de enviarla.`
        : reason === "login" ? `Para ${actionText} ${dish}, primero inicia sesión. La página te mostrará cómo continuar.`
        : reason === "unavailable" ? `Ese plato, ${dish}, aparece agotado por ahora. Puedes mirar otros platos disponibles o escribirle a la cocinera desde una reserva.`
        : `No encontré «${dish}» entre los platos disponibles. Abre el Libretón y revisa el nombre.`;
      appendMessage({ from: "abuela", text, href: reason === "login" ? "/cuenta" : "/menu" });
    };
    window.addEventListener("ollacercana:assistant-result", onResult);
    return () => window.removeEventListener("ollacercana:assistant-result", onResult);
    // appendMessage is stable enough here: this listener only receives explicit menu actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const appendMessage = (message: Omit<Message, "id">) => {
    setMessages((current) => [...current, { ...message, id: Date.now() + Math.random() }]);
  };

  const sendMessage = (value: string) => {
    const text = value.trim();
    if (!text) return;
    appendMessage({ from: "user", text });
    setInput("");
    const action = getActionRequest(text);
    if (action === "missing-dish") {
      appendMessage({ from: "abuela", text: "Claro que te ayudo, mi cielo. Dime el nombre del plato, por ejemplo: «añade un ajiaco al carrito» o «quiero reservar pollo guisado».", href: "/menu" });
    } else if (action) {
      setPendingAction(action);
      appendMessage({ from: "abuela", text: `Puedo ${action.intent === "add" ? "añadir al carrito" : "abrir la reserva de" } ${action.dish}. ¿Quieres que lo haga?`, action });
    } else {
      const reply = getFaqReply(text);
      appendMessage({ from: "abuela", text: reply.answer, href: reply.href });
    }
  };

  const confirmAction = () => {
    if (!pendingAction) return;
    const action = pendingAction;
    setPendingAction(null);
    setMessages((current) => current.map((message) => message.action === action ? { ...message, action: undefined } : message));
    if (pathname === "/menu") {
      window.dispatchEvent(new CustomEvent("ollacercana:assistant-request", { detail: action }));
      return;
    }
    router.push(`/menu?ayudaAccion=${action.intent}&plato=${encodeURIComponent(action.dish)}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    sendMessage(input);
  };

  return (
    <div data-theme-page className="fixed bottom-4 right-4 z-[45] font-['Outfit',sans-serif]">
      {open && <section aria-label="Chat de ayuda de la abuelita" className="mb-3 flex h-[min(74vh,620px)] w-[min(92vw,390px)] flex-col overflow-hidden rounded-[1.5rem] border-2 border-[#8b6844] bg-[#f4e7ce] text-[#35251a] shadow-[0_20px_70px_rgba(0,0,0,.5)]">
        <header className="flex items-center gap-3 border-b border-[#bda078] bg-[#e8d1a3] px-4 py-3">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full border-2 border-[#af7448] bg-[#fff7e9]"><Image src="/images/dona_rosa_mascot.jpg" alt="Abuelita de OllaCercana" fill sizes="44px" className="object-cover" /></div>
          <div className="min-w-0 flex-1"><p className="font-['Caveat',cursive] text-xl font-bold leading-tight text-[#493323]">La abuelita te ayuda</p><p className="text-[11px] text-[#6a5037]">Pedidos, cuenta y dudas de la página</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Cerrar chat" className="rounded-full p-2 text-[#493323] transition hover:bg-[#d8bc8e]"><X className="h-4 w-4" /></button>
        </header>

        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-[radial-gradient(ellipse_at_top,#fff6e6,transparent_70%)] p-3.5" aria-live="polite">
          {messages.map((message) => <div key={message.id} className={`flex ${message.from === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-sm ${message.from === "user" ? "rounded-br-md bg-[#526f42] text-white" : "rounded-bl-md border border-[#c7aa7f] bg-[#fffaf1] text-[#493323]"}`}>
              <p>{message.text}</p>
              {message.action && <div className="mt-2 flex gap-2 border-t border-[#d8c5a7] pt-2"><button type="button" onClick={confirmAction} className="rounded-full bg-[#c84b31] px-3 py-1.5 text-xs font-bold text-white transition hover:bg-[#a83e29]">Sí, ayúdame</button><button type="button" onClick={() => { setPendingAction(null); setMessages((current) => current.map((item) => item.action === message.action ? { ...item, action: undefined, text: "De acuerdo, no hago cambios. Aquí sigo si necesitas algo." } : item)); }} className="rounded-full border border-[#a78d6a] px-3 py-1.5 text-xs font-semibold text-[#594735]">Ahora no</button></div>}
              {message.href && <Link href={message.href} className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#9b3f22] underline underline-offset-2">Abrir esta sección <ArrowRight className="h-3 w-3" /></Link>}
            </div>
          </div>)}
          {messages.length === 1 && <div className="flex flex-wrap gap-2">{QUICK_QUESTIONS.map((question) => <button key={question} type="button" onClick={() => sendMessage(question)} className="rounded-full border border-[#bda078] bg-[#fffaf1] px-3 py-1.5 text-xs font-semibold text-[#594735] transition hover:bg-white">{question}</button>)}</div>}
        </div>

        <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-[#bda078] bg-[#ead9ba] p-3">
          <label htmlFor="abuela-chat-message" className="sr-only">Escribe tu pregunta</label>
          <input id="abuela-chat-message" value={input} onChange={(event) => setInput(event.target.value)} placeholder="Escríbeme, mi cielo..." className="min-w-0 flex-1 rounded-full border border-[#bda078] bg-[#fffaf1] px-4 py-2.5 text-sm text-[#35251a] placeholder:text-[#80694d] outline-none focus:ring-2 focus:ring-[#526f42]" />
          <button type="submit" aria-label="Enviar mensaje" disabled={!input.trim()} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#c84b31] text-white transition hover:bg-[#a83e29] disabled:cursor-not-allowed disabled:opacity-50"><Send className="h-4 w-4" /></button>
        </form>
        <p className="bg-[#ead9ba] px-4 pb-2 text-[10px] leading-relaxed text-[#80694d]">Soy una ayuda automática de esta demostración; verifica siempre el pago y la entrega con la cocinera.</p>
      </section>}

      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Cerrar ayuda" : "Abrir ayuda de la abuelita"} className="ml-auto flex h-14 items-center gap-2 rounded-full border-2 border-[#e1bc76] bg-[#c84b31] px-4 text-white shadow-[0_8px_30px_rgba(0,0,0,.35)] transition hover:-translate-y-0.5 hover:bg-[#a83e29] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white">
        {open ? <X className="h-5 w-5" /> : <><div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/70 bg-[#fff7e9]"><Image src="/images/dona_rosa_mascot.jpg" alt="" fill sizes="36px" className="object-cover" /></div><span className="font-['Caveat',cursive] text-xl font-bold">¿Te ayudo?</span><MessageCircle className="h-4 w-4" /></>}
      </button>
    </div>
  );
}
