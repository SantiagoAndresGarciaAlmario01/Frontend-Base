"use client";

// OllaCercana Central State Store & Persistence Layer
// Fulfills all Jira HU acceptance criteria (HU-01 to HU-24)

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  phoneVerified?: boolean;
  role: "comprador" | "cocinera" | "admin";
  commercialName?: string;
  bio?: string;
  residentialComplex?: string;
  paymentMethods?: string[];
  badges?: string[]; // e.g. "Vecino Fiel", "Conjunto Olla Verde", "Cocinera Destacada"
  isLoggedIn?: boolean;
  avatar?: string;
  kitchenPhoto?: string;
  isCocineraActive?: boolean;
  dataConsentAccepted?: boolean;
  isPaused?: boolean;
}

export interface DishItem {
  id: string;
  name: string;
  category: "Almuerzos" | "Sopas" | "Vegetariano" | "Postres";
  dietaryTags?: ("Vegetariano" | "Sin Gluten" | "Sin Lactosa" | "Vegano")[];
  badge?: string | null;
  price: number;
  formattedPrice: string;
  image: string;
  cook: string;
  cookId: string;
  cookAvatar: string;
  rating: string;
  reviews: number;
  distance: string;
  distanceMeters: number;
  residentialComplex: string;
  totalPortions: number;
  availablePortions: number;
  reservedPortions: number;
  status: "DISPONIBLE" | "AGOTADO" | "EXPIRADO" | "INHABILITADO";
  description: string;
  createdAt: string;
}

export interface Reservation {
  id: string;
  dishId: string;
  dishName: string;
  dishImage: string;
  cookId: string;
  cookName: string;
  buyerName: string;
  buyerEmail: string;
  portions: number;
  pricePerPortion: number;
  totalPrice: number;
  preferredPaymentMethod: "Efectivo" | "Nequi" | "Daviplata" | "Llaves";
  paymentReceipt?: string;
  paymentReceiptName?: string;
  pickupTime: string;
  status: "PENDIENTE" | "CONFIRMADO" | "RECHAZADA" | "EXPIRADA" | "COMPLETADA";
  buyerConfirmedDelivery?: boolean;
  cookConfirmedDelivery?: boolean;
  cookConfirmedPayment?: boolean;
  hasOpenReport?: boolean;
  createdAt: string; // ISO string
  expiresAt: string; // ISO string (10 min after creation)
}

export interface Review {
  id: string;
  cookId: string;
  reservationId: string;
  buyerName: string;
  rating: number; // 1..5
  comment: string;
  createdAt: string;
  status?: "Pendiente" | "Publicada";
}

export interface ChatMessage {
  id: string;
  reservationId: string;
  sender: string; // name or email
  text: string;
  timestamp: string;
}

export interface CommunityReport {
  id: string;
  reporterName: string;
  targetId: string; // dishId or cookId
  targetType: "publicacion" | "usuario";
  targetTitle: string;
  reason: string;
  explanation: string;
  evidenceImage?: string;
  status: "Abierto" | "Resuelto" | "Desestimado";
  createdAt: string;
}

export interface AppNotification {
  id: string;
  targetEmail: string;
  title: string;
  message: string;
  read: boolean;
  timestamp: string;
}

// Default initial dataset
const INITIAL_DISHES: DishItem[] = [
  {
    id: "dish-1",
    name: "Ajiaco de la casa",
    category: "Sopas",
    dietaryTags: [],
    badge: "El favorito del barrio",
    price: 18000,
    formattedPrice: "$18.000",
    image: "/images/menu_ajiaco.jpg",
    cook: "Doña Rosa",
    cookId: "dona-rosa",
    cookAvatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,9",
    reviews: 120,
    distance: "A 350 m",
    distanceMeters: 350,
    residentialComplex: "Conjunto San Luis",
    totalPortions: 6,
    availablePortions: 5,
    reservedPortions: 1,
    status: "DISPONIBLE",
    description: "Con tres tipos de papa, pollo desmechado tierno, guascas frescas y alcaparras.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dish-2",
    name: "Bandeja casera",
    category: "Almuerzos",
    dietaryTags: [],
    badge: "Quedan 5 porciones",
    price: 22000,
    formattedPrice: "$22.000",
    image: "/images/menu_cazuela.jpg",
    cook: "Don Carlos",
    cookId: "don-carlos",
    cookAvatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,8",
    reviews: 95,
    distance: "A 600 m",
    distanceMeters: 600,
    residentialComplex: "Torres de Chapinero",
    totalPortions: 5,
    availablePortions: 5,
    reservedPortions: 0,
    status: "DISPONIBLE",
    description: "Frijoles de la casa con chicharrón crocante, plátano maduro en cubos y aguacate.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dish-3",
    name: "Pollo guisado",
    category: "Almuerzos",
    dietaryTags: ["Sin Gluten"],
    badge: null,
    price: 17000,
    formattedPrice: "$17.000",
    image: "/images/dish_pollo_chalk.jpg",
    cook: "Doña Marta",
    cookId: "dona-marta",
    cookAvatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,8",
    reviews: 87,
    distance: "A 800 m",
    distanceMeters: 800,
    residentialComplex: "Conjunto El Rosal",
    totalPortions: 4,
    availablePortions: 4,
    reservedPortions: 0,
    status: "DISPONIBLE",
    description: "Pierna pernil en salsa de tomate criollo, cebolla junca y papitas criollas doradas.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dish-4",
    name: "Lentejas con arroz",
    category: "Vegetariano",
    dietaryTags: ["Vegetariano", "Vegano"],
    badge: null,
    price: 15000,
    formattedPrice: "$15.000",
    image: "/images/hero_plate_gourmet.jpg",
    cook: "María Elena",
    cookId: "maria-elena",
    cookAvatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,7",
    reviews: 73,
    distance: "A 1,2 km",
    distanceMeters: 1200,
    residentialComplex: "Altos del Salitre",
    totalPortions: 3,
    availablePortions: 1,
    reservedPortions: 2,
    status: "DISPONIBLE",
    description: "Lentejas estofadas a fuego lento, arroz blanco, tajadas doradas y ensalada de aguacate.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dish-5",
    name: "Sancocho de pollo",
    category: "Sopas",
    dietaryTags: ["Sin Lactosa"],
    badge: "Recién preparado",
    price: 19000,
    formattedPrice: "$19.000",
    image: "/images/olla_dish_1.jpg",
    cook: "Don Luis",
    cookId: "don-luis",
    cookAvatar: "/images/dona_rosa_mascot.jpg",
    rating: "4,9",
    reviews: 101,
    distance: "A 1,1 km",
    distanceMeters: 1100,
    residentialComplex: "Residencias Colina",
    totalPortions: 4,
    availablePortions: 4,
    reservedPortions: 0,
    status: "DISPONIBLE",
    description: "Tres carnes doradas al carbón, yuca harinosa, plátano y mazorca con ají casero.",
    createdAt: new Date().toISOString(),
  },
  {
    id: "dish-6",
    name: "Arroz con leche",
    category: "Postres",
    dietaryTags: ["Vegetariano"],
    badge: null,
    price: 6000,
    formattedPrice: "$6.000",
    image: "/images/menu_postre.jpg",
    cook: "Doña Lucía",
    cookId: "dona-lucia",
    cookAvatar: "/images/abuelita_3d_mascot.jpg",
    rating: "4,8",
    reviews: 64,
    distance: "A 900 m",
    distanceMeters: 900,
    residentialComplex: "Bosques de Granada",
    totalPortions: 5,
    availablePortions: 5,
    reservedPortions: 0,
    status: "DISPONIBLE",
    description: "Postre tradicional con uvas pasas maceradas y un toque dulce de panela raspada.",
    createdAt: new Date().toISOString(),
  },
];

const INITIAL_REVIEWS: Review[] = [
  {
    id: "rev-1",
    cookId: "dona-rosa",
    reservationId: "res-init-1",
    buyerName: "Carlos M.",
    rating: 5,
    comment: "¡El ajiaco estaba espectacular! Sabe exactamente como el de mi abuela. Llegó super caliente a la portería.",
    createdAt: "Ayer 1:30 PM",
  },
  {
    id: "rev-2",
    cookId: "dona-rosa",
    reservationId: "res-init-2",
    buyerName: "Andrea P.",
    rating: 5,
    comment: "Excelente atención y porciones abundantes. Las alcaparras y la crema de leche Venían empacadas por separado impecable.",
    createdAt: "Hace 2 días",
  },
  {
    id: "rev-3",
    cookId: "dona-rosa",
    reservationId: "res-init-3",
    buyerName: "Felipe T.",
    rating: 4,
    comment: "Muy buena sazón casera. 100% recomendado para los almuerzos del trabajo.",
    createdAt: "Hace 3 días",
  },
];

// Helper functions for persistent LocalStorage management
export const getStoredDishes = (): DishItem[] => {
  if (typeof window === "undefined") return INITIAL_DISHES;
  const stored = localStorage.getItem("ollacercana_dishes_v2");
  if (!stored) {
    localStorage.setItem("ollacercana_dishes_v2", JSON.stringify(INITIAL_DISHES));
    return INITIAL_DISHES;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_DISHES;
  }
};

export const saveDishes = (dishes: DishItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ollacercana_dishes_v2", JSON.stringify(dishes));
};

export const getStoredReservations = (): Reservation[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ollacercana_reservations_v2");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveReservations = (reservations: Reservation[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ollacercana_reservations_v2", JSON.stringify(reservations));
};

export const getStoredReviews = (): Review[] => {
  if (typeof window === "undefined") return INITIAL_REVIEWS;
  const stored = localStorage.getItem("ollacercana_reviews_v2");
  if (!stored) {
    localStorage.setItem("ollacercana_reviews_v2", JSON.stringify(INITIAL_REVIEWS));
    return INITIAL_REVIEWS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_REVIEWS;
  }
};

export const saveReviews = (reviews: Review[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ollacercana_reviews_v2", JSON.stringify(reviews));
};

export const getStoredReports = (): CommunityReport[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem("ollacercana_reports_v2");
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveReports = (reports: CommunityReport[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ollacercana_reports_v2", JSON.stringify(reports));
};

export const getStoredMessages = (reservationId: string): ChatMessage[] => {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(`ollacercana_chat_${reservationId}`);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
};

export const saveMessages = (reservationId: string, msgs: ChatMessage[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(`ollacercana_chat_${reservationId}`, JSON.stringify(msgs));
};

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    targetEmail: "comprador@ollacercana.com",
    title: "Reserva Confirmada",
    message: "¡Tu pedido de Guiso Tradicional en Cazuela ha sido confirmado por Doña Elena!",
    read: false,
    timestamp: "Hace 15 min",
  },
  {
    id: "notif-[#2]",
    targetEmail: "comprador@ollacercana.com",
    title: "Recordatorio de Recogida",
    message: "Faltan 15 minutos para la hora acordada de recogida en la portería.",
    read: false,
    timestamp: "Hace 1 hora",
  },
];

export const getStoredNotifications = (): AppNotification[] => {
  if (typeof window === "undefined") return INITIAL_NOTIFICATIONS;
  const stored = localStorage.getItem("ollacercana_notifications_v2");
  if (!stored) {
    localStorage.setItem("ollacercana_notifications_v2", JSON.stringify(INITIAL_NOTIFICATIONS));
    return INITIAL_NOTIFICATIONS;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return INITIAL_NOTIFICATIONS;
  }
};

export const saveNotifications = (notifs: AppNotification[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("ollacercana_notifications_v2", JSON.stringify(notifs));
};

const BROWSER_NOTIFICATIONS_KEY = "ollacercana_browser_notifications_v1";

export const getBrowserNotificationsEnabled = (): boolean => {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(BROWSER_NOTIFICATIONS_KEY) === "true";
};

export const setBrowserNotificationsEnabled = (enabled: boolean) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(BROWSER_NOTIFICATIONS_KEY, String(enabled));
};

export const addNotification = (title: string, message: string, targetEmail: string = "usuario") => {
  const current = getStoredNotifications();
  const newNotif: AppNotification = {
    id: `notif-${Date.now()}`,
    targetEmail,
    title,
    message,
    read: false,
    timestamp: "Ahora mismo",
  };
  saveNotifications([newNotif, ...current]);

  if (getBrowserNotificationsEnabled() && "Notification" in window && Notification.permission === "granted") {
    try {
      new Notification(title, { body: message, icon: "/brand/ollacercana-icon.svg", tag: newNotif.id });
    } catch (error) {
      console.warn("No fue posible mostrar el aviso del navegador.", error);
    }
  }
};
