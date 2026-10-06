import Link from "next/link";
import { ArrowLeft, BookOpen, ChefHat, CircleHelp, KeyRound, ShoppingBasket } from "lucide-react";

const helpSections = [
  {
    id: "cuenta",
    icon: ChefHat,
    title: "Tu cuenta",
    text: "Desde Mi Cuenta puedes elegir si entras como compradora, cocinera o administradora. Al registrarte como cocinera podrás publicar platos y atender reservas.",
  },
  {
    id: "reservas",
    icon: ShoppingBasket,
    title: "Pedidos y reservas",
    text: "Al confirmar una reserva, esta queda pendiente para que la cocinera la acepte. Puedes consultar su estado, conversar por el chat y revisar la hora acordada en Mis reservas.",
  },
  {
    id: "pagos",
    icon: BookOpen,
    title: "Pagos y recogida",
    text: "OllaCercana no procesa pagos. El comprador y la cocinera acuerdan el pago directamente al recoger la comida, según el método indicado en la reserva.",
  },
  {
    id: "recuperacion",
    icon: KeyRound,
    title: "¿Olvidaste tu contraseña?",
    text: "La recuperación automática por correo todavía no está habilitada. Esta versión guarda los datos de demostración en este navegador y no envía correos de recuperación.",
  },
];

export default function HelpPage() {
  return (
    <main data-theme-page className="min-h-screen bg-[#f3ecdf] px-4 py-10 text-[#30251c] sm:px-6">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dbc8ae] bg-[#fffaf1] px-4 py-2 text-sm font-semibold text-[#684329] shadow-sm transition hover:border-[#ba7136] hover:text-[#9c4e1f]"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a OllaCercana
        </Link>

        <header className="mb-7 rounded-3xl border border-[#dfc9a9] bg-[#fffaf1] p-6 shadow-lg shadow-[#5b3a1a]/10 sm:p-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f3dfc2] text-[#a75221]">
            <CircleHelp className="h-6 w-6" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a75221]">OllaCercana</p>
          <h1 className="mt-1 font-serif text-3xl font-bold sm:text-4xl">Ayuda de la casa</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[#655447]">
            Respuestas rápidas para pedir comida casera, reservar porciones y cuidar tu cuenta.
          </p>
        </header>

        <div className="space-y-4">
          {helpSections.map(({ id, icon: Icon, title, text }) => (
            <section
              id={id}
              key={id}
              className="scroll-mt-6 rounded-2xl border border-[#e2d2bd] bg-[#fffaf1] p-5 shadow-sm sm:p-6"
            >
              <h2 className="flex items-center gap-2 font-serif text-xl font-bold">
                <Icon className="h-5 w-5 text-[#b45b25]" />
                {title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-[#655447]">{text}</p>
            </section>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <Link
            href="/cuenta"
            className="rounded-full bg-[#b45b25] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#98471c]"
          >
            Iniciar sesión
          </Link>
          <Link href="/cuenta/registro" className="rounded-full border border-[#cbb59a] bg-[#fffaf1] px-5 py-3 text-sm font-bold text-[#684329] transition hover:border-[#b45b25]">Crear cuenta</Link>
          <Link
            href="/menu"
            className="rounded-full border border-[#cbb59a] bg-[#fffaf1] px-5 py-3 text-sm font-bold text-[#684329] transition hover:border-[#b45b25]"
          >
            Ver el libretón
          </Link>
        </div>
      </div>
    </main>
  );
}
