<p align="center">
  <img src="public/brand/ollacercana-icon.svg" alt="Logo de OllaCercana" width="140" />
</p>

<h1 align="center">OllaCercana</h1>

<p align="center"><strong>Comida casera de vecinas, cerca de ti.</strong></p>

OllaCercana es una plataforma web comunitaria donde las **cocineras** de un conjunto residencial publican los platos caseros del día y sus **vecinos compradores** los encuentran, reservan porciones y coordinan la recogida directamente con ellas.

> **Estado del proyecto:** este repositorio es el **frontend** de la plataforma, construido como prototipo funcional. No hay backend ni base de datos: todos los datos (platos, reservas, reseñas, chats, avisos) se guardan en el `localStorage` del navegador. Los pagos **no se procesan**: comprador y cocinera acuerdan el pago al momento de la entrega.

---

## Funcionalidades

El alcance parte de las historias de usuario HU-01 a HU-24 definidas en Jira (épica `EPIC-01: OllaCercana`, exportada en `public/Jira.csv`).

**Para compradores**
- Registro e inicio de sesión con selección de rol.
- Catálogo de platos disponibles con filtros por **categoría** (Almuerzos, Sopas, Vegetariano, Postres), **etiquetas dietéticas** (Vegetariano, Sin Gluten, Sin Lactosa, Vegano) y **distancia**.
- Mapa ilustrado de cocineras cercanas (la dirección exacta de la cocinera se mantiene oculta).
- Carrito y flujo de reserva de porciones, con métodos de pago visibles (Efectivo, Nequi, Daviplata, Llaves) y carga opcional de comprobante.
- Seguimiento de reservas, chat con la cocinera, avisos de estado, calificación del intercambio y reporte de publicaciones o usuarios.

**Para cocineras**
- Perfil de cocina con nombre comercial, biografía, conjunto residencial y foto.
- Publicación de platos con porciones y precio por porción.
- Aceptar o rechazar reservas, confirmar pago y entrega, y pausar la cocina.
- Historial de ventas, ingresos referenciales y reputación.

**Para administradoras**
- Panel de moderación para gestionar y resolver reportes de la comunidad.

**Extras**
- Retos comunitarios e insignias de fidelidad (p. ej. *Vecino Fiel*, *Cocinera Destacada*).
- Sincronización de porciones disponibles y reservas que **expiran a los 10 minutos** si no se responden.
- **Abuelita**, asistente de ayuda flotante disponible en todas las pantallas.
- Transiciones animadas, fondos en canvas y diseño oscuro con identidad de marca propia.

---

## Stack tecnológico

| Capa | Tecnología |
| --- | --- |
| Framework | [Next.js](https://nextjs.org) 16 (App Router) |
| UI | React 19 + [Tailwind CSS](https://tailwindcss.com) 4 |
| Lenguaje | TypeScript 5 |
| Animación | [Framer Motion](https://www.framer.com/motion/) |
| Iconos | [Lucide React](https://lucide.dev) |
| Utilidades | html2canvas |
| Tipografía | Geist y Geist Mono (`next/font`) |
| Calidad | ESLint 9 + `eslint-config-next` |
| Persistencia | `localStorage` (sin backend) |

---

## Puesta en marcha

### Requisitos
- **Node.js 20 o superior** y **npm**.

### Instalación y ejecución

```bash
# 1. Clona el repositorio e ingresa a la carpeta
git clone <URL-DEL-REPOSITORIO>
cd Frontend-Base

# 2. Instala las dependencias
npm install

# 3. Levanta el servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

### Scripts disponibles

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Compila la aplicación para producción |
| `npm run start` | Sirve la build de producción |
| `npm run lint` | Ejecuta ESLint sobre el proyecto |

---

## Rutas principales

| Ruta | Descripción |
| --- | --- |
| `/` | Página de inicio |
| `/menu` | Catálogo de platos y filtros |
| `/cocineras-cercanas` | Mapa de cocineras cercanas |
| `/pedido` | Carrito y confirmación de la reserva |
| `/ayuda` | Centro de ayuda |
| `/cuenta` | Inicio de sesión |
| `/cuenta/registro` | Registro de compradores y cocineras |
| `/cuenta/perfil` | Perfil del usuario |
| `/cuenta/reservas` | Reservas del usuario |
| `/cuenta/chats` | Conversaciones por reserva |
| `/cuenta/avisos` | Notificaciones |
| `/cuenta/ajustes` | Preferencias de la cuenta |
| `/cuenta/cocina` | Gestión de cocina y platos (cocinera) |
| `/cuenta/admin` | Moderación (administradora) |
| `/cuenta/acceso-denegado` · `/cuenta/sesion-expirada` | Pantallas de estado de sesión |

---

## Roles y flujo de una reserva

Hay tres roles: **comprador**, **cocinera** y **admin**. Cada uno entra por su propio acceso en `/cuenta` y es redirigido a su panel.

Una reserva sigue este ciclo de estados:

```
PENDIENTE ──► CONFIRMADO ──► COMPLETADA
    │
    ├──► RECHAZADA   (la cocinera no la acepta)
    └──► EXPIRADA    (sin respuesta en 10 minutos)
```

Un plato, por su parte, puede estar `DISPONIBLE`, `AGOTADO`, `EXPIRADO` o `INHABILITADO`.

---

## Estructura del proyecto

```
.
├── app/                        # Rutas (Next.js App Router)
│   ├── page.tsx                # Inicio
│   ├── menu/                   # Catálogo
│   ├── cocineras-cercanas/     # Mapa de cocineras
│   ├── pedido/                 # Carrito y reserva
│   ├── ayuda/                  # Centro de ayuda
│   ├── cuenta/                 # Autenticación y paneles por rol
│   ├── layout.tsx              # Layout raíz (fuentes, transición, chat de ayuda)
│   └── globals.css             # Estilos globales y tema
├── components/
│   ├── modals/                 # Chat, reserva, publicación, reseñas, reportes, etc.
│   ├── AccountAuthPage.tsx     # Login y registro
│   ├── AccountNav.tsx          # Navegación del área de cuenta
│   ├── AbuelitaHelpChat.tsx    # Asistente de ayuda flotante
│   ├── HeroSection.tsx         # Portada
│   └── ...                     # Logo, fondos animados, transiciones
├── lib/
│   └── ollacercana-store.ts    # Modelos de datos y capa de persistencia
├── public/
│   ├── brand/                  # Iconos de marca
│   ├── images/                 # Mascotas e ilustraciones
│   ├── videos/                 # Videos de inicio y transición
│   ├── frames/ · frames-login/ # Secuencias de fotogramas para fondos en scroll
│   ├── ManualDeIdentidad.html  # Manual de identidad visual
│   └── Jira.csv                # Exportación del backlog (HU-01 a HU-24)
├── backups/                    # Copias de seguridad de pantallas anteriores
└── scratch/                    # Material de trabajo (manual, parseo del backlog)
```

---

## Persistencia de datos

La capa de datos vive en [`lib/ollacercana-store.ts`](lib/ollacercana-store.ts), que define los modelos (`UserProfile`, `DishItem`, `Reservation`, `Review`, `CommunityReport`, `ChatMessage`, `AppNotification`) y las funciones de lectura/escritura. Se usan estas claves de `localStorage`:

| Clave | Contenido |
| --- | --- |
| `ollacercana_dishes_v2` | Platos publicados (se siembran con datos de ejemplo) |
| `ollacercana_reservations_v2` | Reservas |
| `ollacercana_reviews_v2` | Reseñas |
| `ollacercana_reports_v2` | Reportes de la comunidad |
| `ollacercana_chat_<reservationId>` | Mensajes de cada reserva |
| `ollacercana_menu_cart` | Carrito de compra |

Para **reiniciar los datos de demostración**, borra el `localStorage` del sitio desde las herramientas de desarrollo del navegador.

> Como los datos viven en el navegador, cada navegador (o ventana de incógnito) tiene su propio estado independiente.

---

## Identidad visual

El manual de marca está en [`public/ManualDeIdentidad.html`](public/ManualDeIdentidad.html). La interfaz usa un tema oscuro con acentos cálidos tipo cocina casera (ámbar y terracota), y como mascota a la **Abuelita** de OllaCercana.

---

## Notas para quien continúe el proyecto

- **Peso del repositorio:** las carpetas `public/frames` y `public/frames-login` superan los 200 MB en total. Conviene comprimirlas, moverlas a un CDN o usar Git LFS si el repositorio crece.
- **Carpetas de apoyo:** `backups/` y `scratch/` no hacen parte de la aplicación; pueden excluirse del repositorio si ya no se necesitan.
- **Nombre del paquete:** en `package.json` el nombre sigue siendo `paguina`; conviene renombrarlo a `ollacercana`.
- **Next.js 16:** esta versión tiene cambios respecto a versiones anteriores. Revisa la documentación incluida en `node_modules/next/dist/docs/` antes de modificar convenciones del framework (ver `AGENTS.md`).

---

## Equipo

- KEVIN ANDREY ANGEL ACEVEDO
- JULIAN FELIPE MORALES ZAMBRANO
- DANIEL CAMILO MOSQUERA MARTINEZ
- SANTIAGO ANDRES GARCIA ALMARIO
- JUAN MANUEL GARZON VIRACACHA

---
