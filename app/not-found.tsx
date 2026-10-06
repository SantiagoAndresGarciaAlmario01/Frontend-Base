import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BookOpen, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main data-theme-page className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#24180f] px-4 py-10 text-[#f6ecda]">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 bg-[radial-gradient(ellipse_at_50%_25%,#79502f_0%,#3b281b_48%,#1b140f_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[.12] [background-image:url('/images/libreton_bg_tiles_ref.png')] bg-cover bg-center mix-blend-soft-light"
      />
      <div aria-hidden="true" className="absolute -left-24 top-10 -z-10 h-72 w-72 rounded-full bg-[#d88a43]/10 blur-3xl" />
      <div aria-hidden="true" className="absolute -bottom-28 -right-16 -z-10 h-96 w-96 rounded-full bg-[#5e8a54]/10 blur-3xl" />

      <section className="relative grid w-full max-w-4xl overflow-hidden rounded-[2rem] border border-[#d9b783]/35 bg-[#2d2017]/90 shadow-[0_30px_100px_rgba(0,0,0,.55)] backdrop-blur-sm md:grid-cols-[1fr_1.1fr]">
        <div className="relative flex min-h-[300px] items-end justify-center overflow-hidden border-b border-[#d9b783]/20 bg-gradient-to-b from-[#755031]/40 to-transparent px-8 pt-8 md:min-h-[520px] md:items-center md:border-b-0 md:border-r">
          <div aria-hidden="true" className="absolute left-8 top-8 h-24 w-24 rounded-full border border-[#e7c99d]/20" />
          <div aria-hidden="true" className="absolute bottom-10 right-8 h-40 w-40 rounded-full border border-[#e7c99d]/10" />
          <div className="relative h-[260px] w-[250px] sm:h-[320px] sm:w-[310px] md:h-[390px] md:w-[370px]">
            <Image
              src="/images/abuelita_3d_mascot.jpg"
              alt="La abuelita de OllaCercana te ayuda a volver a la cocina"
              fill
              sizes="(max-width: 768px) 310px, 370px"
              className="object-contain drop-shadow-[0_22px_26px_rgba(0,0,0,.45)]"
              priority
            />
          </div>
          <span className="absolute left-1/2 top-6 -translate-x-1/2 rounded-full border border-[#e7c99d]/25 bg-[#24180f]/55 px-4 py-1.5 text-[10px] font-semibold uppercase tracking-[.2em] text-[#f2d4a5] md:top-8">
            Un rinconcito perdido
          </span>
        </div>

        <div className="flex flex-col justify-center px-7 py-9 sm:px-10 sm:py-12 md:px-12">
          <p className="font-mono text-xs font-semibold uppercase tracking-[.24em] text-[#e39a53]">OllaCercana · 404</p>
          <h1 className="mt-3 font-['Caveat',cursive] text-6xl font-bold leading-[.95] text-[#f1d4a5] sm:text-7xl">¡Ay, qué pena!</h1>
          <p className="mt-5 max-w-md text-base leading-relaxed text-[#f6ecda]/80 sm:text-lg">
            Esta página se nos perdió entre las recetas. La abuelita ya está buscando el camino de vuelta a la cocina.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#e8752b] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#a7441d]/25 transition hover:-translate-y-0.5 hover:bg-[#f18436]">
              <Home aria-hidden="true" className="h-4 w-4" /> Volver al inicio
            </Link>
            <Link href="/menu" className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#e7c99d]/35 bg-[#fff4df]/5 px-5 py-3 text-sm font-semibold text-[#f6ecda] transition hover:bg-[#fff4df]/10">
              <BookOpen aria-hidden="true" className="h-4 w-4" /> Ver el libretón
            </Link>
          </div>

          <Link href="/cocineras-cercanas" className="mt-6 inline-flex w-fit items-center gap-2 text-xs font-medium text-[#e6c69b]/70 transition hover:text-[#f6ecda]">
            <Search aria-hidden="true" className="h-3.5 w-3.5" /> Explorar cocinas cercanas
          </Link>
          <div className="mt-8 border-t border-dashed border-[#e7c99d]/25 pt-5">
            <Link href="/" className="inline-flex items-center gap-2 text-xs text-[#e6c69b]/55 transition hover:text-[#f6ecda]">
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" /> De vuelta a casa, con cariño
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
