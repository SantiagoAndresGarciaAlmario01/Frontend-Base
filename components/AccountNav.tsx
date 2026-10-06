"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCheck, ShoppingBag, MessageSquare, ChefHat, Bell, ShieldCheck, UtensilsCrossed, Settings } from "lucide-react";

// Barra de navegación compartida por las páginas de /cuenta (perfil, reservas,
// chats, avisos, cocina, admin). Sustituye a las antiguas pestañas internas:
// ahora cada sección es su propia página, y esta barra solo muestra los
// accesos que le corresponden al rol de la persona logueada.
// Navegación compartida con una paleta de papel y tinta del Libretón.

type NavKey = "perfil" | "reservas" | "chats" | "avisos" | "cocina" | "admin";

interface AccountNavUser {
  name: string;
  email: string;
  role: "comprador" | "cocinera" | "admin";
}

interface AccountNavProps {
  user: AccountNavUser;
  current: NavKey;
  unreadCount?: number;
  unreadMessageCount?: number;
}

interface NavItem {
  key: NavKey;
  href: string;
  label: string;
  icon: ReactNode;
  activeClass: string;
}

export default function AccountNav({ user, current, unreadCount = 0, unreadMessageCount = 0 }: AccountNavProps) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("ollacercana_user");
    router.push("/cuenta");
  };

  const items: NavItem[] = [
    {
      key: "perfil",
      href: "/cuenta/perfil",
      label: "Perfil",
      icon: <UserCheck className="w-4 h-4" />,
      activeClass: "bg-[#c84b31] text-white shadow-md",
    },
  ];

  if (user.role === "comprador") {
    items.push(
      {
        key: "reservas",
        href: "/cuenta/reservas",
        label: "Mis Pedidos",
        icon: <ShoppingBag className="w-4 h-4" />,
        activeClass: "bg-[#526f42] text-white shadow-md",
      },
      {
        key: "chats",
        href: "/cuenta/chats",
        label: "Mensajes",
        icon: <MessageSquare className="w-4 h-4" />,
        activeClass: "bg-[#c84b31] text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-[#80694d] text-white shadow-md",
      }
    );
  } else if (user.role === "cocinera") {
    items.push(
      {
        key: "cocina",
        href: "/cuenta/cocina",
        label: "Modo Cocinera",
        icon: <ChefHat className="w-4 h-4" />,
        activeClass: "bg-[#526f42] text-white shadow-md",
      },
      {
        key: "chats",
        href: "/cuenta/chats",
        label: "Mensajes",
        icon: <MessageSquare className="w-4 h-4" />,
        activeClass: "bg-[#c84b31] text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-[#80694d] text-white shadow-md",
      }
    );
  } else if (user.role === "admin") {
    items.push(
      {
        key: "admin",
        href: "/cuenta/admin",
        label: "Admin",
        icon: <ShieldCheck className="w-4 h-4" />,
        activeClass: "bg-[#526f42] text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-[#80694d] text-white shadow-md",
      }
    );
  }

  const gridColsClass = items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";

  return (
    <>
      <div className="p-3 sm:p-4 rounded-2xl bg-[#efe0c2] border-2 border-[#9b774f] flex flex-wrap items-center justify-between gap-3 shadow-[0_6px_16px_rgba(46,27,13,.2)]">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-full bg-[#f3ddc2] border border-[#c88359]/60 flex items-center justify-center text-[#a84029] font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="min-w-0 text-left">
            <h3 className="break-words font-['Caveat',cursive] text-xl font-bold text-[#2b2117] leading-tight">{user.name}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              <p className="break-all text-xs text-[#6a5037] font-mono">{user.email}</p>
              <span className="px-2 py-0.5 rounded-full border border-dashed border-[#75865a] bg-[#dce4ce] text-[#52663d] font-['Caveat',cursive] text-sm font-semibold">
                {user.role.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
        <Link href="/menu" className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#75865a]/60 bg-[#dce4ce] px-3 py-2 text-xs font-bold text-[#42542e] transition hover:bg-[#cdd9b9]">
          <UtensilsCrossed className="h-3.5 w-3.5" /><span>Ver platos</span>
        </Link>
        <Link href="/cuenta/ajustes" className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-[#9b774f] bg-[#f5e9d2] px-3 py-2 text-xs font-bold text-[#493323] transition hover:bg-white" aria-label="Abrir ajustes">
          <Settings className="h-3.5 w-3.5" /><span>Ajustes</span>
        </Link>
        <button
          onClick={handleLogout}
          className="shrink-0 px-3 sm:px-4 py-2 rounded-xl bg-[#493323] hover:bg-[#6d4931] border border-[#9b774f] text-[#fff5df] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
        </div>
      </div>

      <div className={`grid grid-cols-2 ${gridColsClass} gap-2 p-1.5 rounded-2xl bg-[#e8d1a3] border-2 border-[#9b774f] shadow-[0_5px_14px_rgba(46,27,13,.16)]`}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              current === item.key ? item.activeClass : "text-[#6a5037] hover:bg-[#f5e9d2] hover:text-[#2b2117]"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.key === "avisos" && unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
            {item.key === "chats" && unreadMessageCount > 0 && (
              <span aria-label={`${unreadMessageCount} mensajes sin leer`} className="min-w-5 rounded-full bg-[#a84029] px-1.5 py-0.5 text-[10px] leading-none text-white">
                {unreadMessageCount > 9 ? "9+" : unreadMessageCount}
              </span>
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
