import Link from "next/link";
import { ArrowLeft, CookingPot, LockKeyhole, ShieldAlert } from "lucide-react";

export default function CuentaStatusPage({ type }: { type: "expired" | "denied" }) {
  const expired = type === "expired";
  return <main data-theme-page className="relative grid min-h-screen place-items-center overflow-hidden bg-[#24180f] px-4 py-10 text-[#2b2117]">
    <div aria-hidden="true" className="absolute inset-0 bg-[url('/images/libreton_bg_tiles_ref.png')] bg-cover bg-center opacity-35" />
    <section className="relative w-full max-w-lg rounded-[2rem] border-2 border-[#a88960] bg-[#f4e8cf]/95 p-7 text-center shadow-2xl sm:p-10">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-[#b89a6f] bg-[#e8d7b5] text-[#a84029]">{expired ? <CookingPot className="h-8 w-8" /> : <ShieldAlert className="h-8 w-8" />}</div>
      <p className="mt-5 text-xs font-bold uppercase tracking-[.18em] text-[#80694d]">OllaCercana · acceso a tu cuenta</p>
      <h1 className="mt-2 font-['Caveat',cursive] text-4xl font-bold">{expired ? "La sesión se enfrió" : "Esta puerta no es para tu rol"}</h1>
      <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-[#5b4a38]">{expired ? "Vuelve a iniciar sesión para continuar con tus pedidos y conversaciones." : "Tu cuenta no tiene permiso para entrar a esta sección. Te llevaremos al espacio que corresponde a tu perfil."}</p>
      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link href="/cuenta" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#a84029] px-5 font-bold text-white hover:bg-[#8e3929]"><LockKeyhole className="h-4 w-4" /> {expired ? "Iniciar sesión" : "Cambiar de cuenta"}</Link>
        <Link href="/menu" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#9b774f] bg-white/60 px-5 font-bold text-[#493323] hover:bg-white"><ArrowLeft className="h-4 w-4" /> Volver al menú</Link>
      </div>
    </section>
  </main>;
}
