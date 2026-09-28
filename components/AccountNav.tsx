"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UserCheck, ShoppingBag, MessageSquare, ChefHat, Bell, ShieldCheck } from "lucide-react";

// Barra de navegación compartida por las páginas de /cuenta (perfil, reservas,
// chats, avisos, cocina, admin). Sustituye a las antiguas pestañas internas:
// ahora cada sección es su propia página, y esta barra solo muestra los
// accesos que le corresponden al rol de la persona logueada.
// Mismos estilos/íconos que la barra de pestañas original, para no cambiar
// la estética.

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
}

interface NavItem {
  key: NavKey;
  href: string;
  label: string;
  icon: ReactNode;
  activeClass: string;
}

export default function AccountNav({ user, current, unreadCount = 0 }: AccountNavProps) {
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
      activeClass: "bg-stone-500 text-white shadow-md",
    },
  ];

  if (user.role === "comprador") {
    items.push(
      {
        key: "reservas",
        href: "/cuenta/reservas",
        label: "Mis Pedidos",
        icon: <ShoppingBag className="w-4 h-4" />,
        activeClass: "bg-[#62B869] text-white shadow-md",
      },
      {
        key: "chats",
        href: "/cuenta/chats",
        label: "Mis Chats",
        icon: <MessageSquare className="w-4 h-4" />,
        activeClass: "bg-[#F0822D] text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-sky-600 text-white shadow-md",
      }
    );
  } else if (user.role === "cocinera") {
    items.push(
      {
        key: "cocina",
        href: "/cuenta/cocina",
        label: "Modo Cocinera",
        icon: <ChefHat className="w-4 h-4" />,
        activeClass: "bg-amber-600 text-white shadow-md",
      },
      {
        key: "chats",
        href: "/cuenta/chats",
        label: "Mis Chats",
        icon: <MessageSquare className="w-4 h-4" />,
        activeClass: "bg-[#F0822D] text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-sky-600 text-white shadow-md",
      }
    );
  } else if (user.role === "admin") {
    items.push(
      {
        key: "admin",
        href: "/cuenta/admin",
        label: "Admin",
        icon: <ShieldCheck className="w-4 h-4" />,
        activeClass: "bg-purple-600 text-white shadow-md",
      },
      {
        key: "avisos",
        href: "/cuenta/avisos",
        label: "Avisos",
        icon: <Bell className="w-4 h-4" />,
        activeClass: "bg-sky-600 text-white shadow-md",
      }
    );
  }

  const gridColsClass = items.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-4";

  return (
    <>
      <div className="p-4 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F0822D]/20 border border-[#F0822D]/40 flex items-center justify-center text-[#F0822D] font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-left">
            <h3 className="text-sm font-bold text-white">{user.name}</h3>
            <p className="text-xs text-stone-400 font-mono">
              {user.email} • {user.role.toUpperCase()}
            </p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 border border-white/10 text-stone-300 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      <div className={`grid grid-cols-2 ${gridColsClass} gap-2 p-1.5 rounded-2xl bg-black/60 border border-white/10`}>
        {items.map((item) => (
          <Link
            key={item.key}
            href={item.href}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer relative ${
              current === item.key ? item.activeClass : "text-stone-400 hover:text-white"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.key === "avisos" && unreadCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </Link>
        ))}
      </div>
    </>
  );
}
