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

## Recorrido pantalla a pantalla

Así se ve OllaCercana, siguiendo el camino de una persona desde que entra al sitio hasta que reserva su plato.

### 1. Portada

![Portada de OllaCercana](docs/screenshots/01-portada.png)

Pantalla de bienvenida con la fachada de una casa de barrio, el logo de la marca y el lema *"Comida casera a un paso de tu puerta"*. La indicación **"Desliza para entrar a la cocina"** invita a hacer scroll, y al hacerlo la escena avanza por una secuencia de fotogramas hasta entrar a la casa. En todas las pantallas está disponible el botón flotante **"¿Te ayudo?"**, que abre a la Abuelita, la asistente de ayuda.

### 2. La cocina interactiva

![Cocina interactiva con accesos a Cocineras, Mapa y Recetas](docs/screenshots/02-cocina-interactiva.png)

Al entrar a la cocina aparecen tres accesos sobre la escena, cada uno con su etiqueta:

- **Cocineras** (*"Sabor de barrio"*): conoce a las cocineras de la comunidad.
- **Mapa** (*"Comida cerca de ti"*): encuentra quién cocina a tu alrededor.
- **Recetas** (*"Pide tu plato hoy"*): abre el menú con los platos disponibles.

### 3. Descubre la comida casera

![Sección informativa con los pasos para pedir y el reporte de la comunidad](docs/screenshots/03-descubre-comida-casera.png)

Sección informativa con estética de papel y notas pegadas. Resume la propuesta de valor y explica en cuatro pasos cómo funciona la plataforma: explorar el menú, reservar y comunicarse con la cocinera, disfrutar y vivir el sabor casero y la comunidad. Incluye el acceso **"¿Cómo hago un pedido?"** y un **reporte de comunidad** con publicaciones como *Destino: Comunidad* y *20 Reglas de Seguridad e Higiene*.

### 4. Mapa de cocineras cercanas

![Mapa ilustrado con cocineras cercanas y filtros por distancia](docs/screenshots/04-mapa-cocineras-cercanas.png)

Vista de las cocinas activas alrededor del usuario sobre un **plano ilustrado** de la zona de muestra (Chapinero Alto, Bogotá).

- **Barra superior:** zona actual, buscador de plato, cocinera o sazón, acceso al Libretón (menú) y a "Mi cuenta".
- **Filtros por distancia:** Todas, 500 m, 1 km, 1.5 km, 2 km y *Abiertas ahora*, cada uno con su contador.
- **Mapa:** pines por cocinera con su distancia, anillos de radio y el punto "Tu ubicación". Los pines indican si la cocina está cocinando ahora o cerrada.
- **Fogones activos en tu radio:** listado de las cocineras disponibles, con acceso a **"Explorar el Libretón completo"**.

Las distancias del plano son ilustrativas. La dirección exacta de la cocinera solo se comparte al confirmar una reserva.

### 5. Menú de platos (Libretón)

Es la pantalla principal del comprador (`/menu`). Con la sesión iniciada, la barra superior muestra la zona (Bogotá, zona de muestra), el buscador de platos, los accesos a **Explorar**, **Cocinas cercanas** y **Mis pedidos**, los ajustes, el carrito y el menú del usuario.

#### 5.1 Inicio del menú

![Inicio del menú con Antojo del Día y filtros por categoría](docs/screenshots/05a-menu-inicio.png)

Abre con el mensaje *"Hoy se come rico"* y la sección **Antojo del Día**: tarjetas con los platos de cocinas cercanas disponibles en el momento, cada una con la cocinera, su calificación, la distancia y el botón **Agregar al pedido**. A un lado, el bloque **Ubica tu antojo** presenta a la Abuela OllaCercana. En la parte inferior hay filtros rápidos por categoría: Todos, Almuerzos, Sopas, Vegetariano, Postres y un panel de **Filtros** adicionales.

#### 5.2 Recetario

![Recetario con las tarjetas de cada plato y el carrito de pedido](docs/screenshots/05b-menu-recetario.png)

Cuadrícula de platos publicados por las cocineras del barrio. Cada tarjeta muestra:

- Nombre del plato, descripción corta, foto (o *"Foto pendiente"* si la cocinera aún no la sube) y la cocinera responsable.
- Sello **"Cocina limpia & manipulación verificada"**.
- **Distancia aproximada** y **conjunto residencial** de la cocinera.
- **Precio por porción** y los botones **Añadir** (al carrito) y **Reservar** (reserva directa).
- Enlace **"Ver en el recetario"** para consultar el detalle del plato.

En el costado derecho se encuentra el carrito **"Tu pedido"**, con el botón **¡A comer!** para continuar cuando ya hay platos agregados.

#### 5.3 Sello Olla Verde

![Hero con el sello Olla Verde, distintivo del conjunto](docs/screenshots/05c-menu-sello-olla-verde.png)

Bloque destacado *"El sabor de casa, más cerca"* con el acceso **Ver platos del día**. Presenta el sello **Olla Verde**, un distintivo del conjunto con vigencia de 7 días que se obtiene cuando el conjunto vende todas las porciones publicadas durante la semana.

#### 5.4 Una meta que se cocina entre todos

![Ilustración del Libretón Olla Verde y el reconocimiento comunitario](docs/screenshots/05d-menu-meta-compartida.png)

Sección que explica la idea detrás del sello como una meta compartida de la comunidad: el reconocimiento de cocina sostenible se otorga a las cocineras que venden todas sus porciones durante siete días seguidos. Incluye la llamada **"Quiero ofrecer mis platillos"** dirigida a quienes quieran empezar a cocinar para sus vecinos.

#### 5.5 De la olla a tu mesa

![Cómo funciona la plataforma en tres pasos y la insignia Vecino Fiel](docs/screenshots/05e-menu-como-funciona.png)

Cierre del menú con el resumen del proceso en tres pasos: **1. Explora el libretón**, **2. Reserva tu porción** y **3. Disfruta y comparte**, acordando la entrega directamente con la vecina. Debajo aparece la insignia **Vecino Fiel**, que se gana al completar tres entregas en un mes con la misma cocinera, junto con el acceso **"¿Cocinas para tu barrio?"** para registrarse como cocinera.

### 6. Acceso a la cuenta

![Pantalla de inicio de sesión](docs/screenshots/06-acceso.png)

Pantalla **"Entra a tu cocina"**, con la Abuelita de fondo y un formulario de acceso:

- Identificador (correo o celular) y contraseña.
- **Perfil de ingreso:** Comprador, Cocinera o Admin. Cada rol es redirigido a su propio panel.
- Opción *Recordarme*, enlace de recuperación de contraseña y acceso al registro para quienes aún no tienen cuenta.

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
├── docs/
│   └── screenshots/            # Capturas usadas en este README
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
- **Siguiente paso natural:** reemplazar `localStorage` por un backend con API y autenticación real, y habilitar la recuperación de contraseña por correo (hoy no está disponible).

---

## Equipo

<!-- Completa con los integrantes, curso y periodo académico -->
- Integrante 1 — rol
- Integrante 2 — rol

---

## Licencia

Proyecto académico. Define aquí la licencia si lo vas a publicar.
