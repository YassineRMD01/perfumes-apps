export type Lang = 'en' | 'fr' | 'es' | 'ar';
export type Translated = Record<Lang, string>;

export type Gender = 'Women' | 'Men' | 'Unisex';
export type Concentration = 'Parfum' | 'EDP' | 'EDT' | 'Cologne';

export const MAX_PHOTOS = 5;
export const GENDERS: Gender[] = ['Women', 'Men', 'Unisex'];
export const CONCENTRATIONS: Concentration[] = ['Parfum', 'EDP', 'EDT', 'Cologne'];

/** Perfume house, managed by the admin. */
export interface Brand {
  id: number;
  name: string;
  country: string;
  description: string;
  /** Optional logo reference (URL or "idb:" upload). */
  logo: string | null;
  createdAt: string;
}

/** Product category (e.g. olfactory family), managed by the admin, named in every language. */
export interface Category {
  id: string;
  name: Translated;
  description: Translated;
  /** Accent color used for the category tile. */
  color: string;
  createdAt: string;
}

export interface Perfume {
  id: number;
  name: string;
  brandId: number;
  categoryId: string;
  description: string;
  /** Price in the store base currency (USD). */
  price: number;
  oldPrice?: number | null;
  stock: number;
  volumeMl: number;
  gender: Gender;
  concentration: Concentration;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  /** Bottle tint used by the generated SVG bottle when there is no photo */
  color: string;
  /** Up to MAX_PHOTOS references (URL or "idb:<id>"), the first one is the cover. */
  images: string[];
  rating: number;
  reviews: number;
  featured: boolean;
  createdAt: string;
}

export type PerfumeInput = Omit<Perfume, 'id' | 'createdAt' | 'rating' | 'reviews'>;

export type Role = 'admin' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  createdAt: string;
}

export interface CartItem {
  productId: number;
  qty: number;
}

export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
export const ORDER_STATUSES: OrderStatus[] = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export type PaymentMethod = 'Card' | 'Cash on delivery';

export interface OrderItem {
  productId: number;
  name: string;
  brand: string;
  color: string;
  /** Unit price in USD at the time of the order */
  price: number;
  qty: number;
}

export interface ShippingInfo {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  zip: string;
  country: string;
}

export interface Order {
  id: string;
  userId: number;
  customerName: string;
  email: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  status: OrderStatus;
  payment: PaymentMethod;
  shippingInfo: ShippingInfo;
  createdAt: string;
}

export const STATUS_SEVERITY: Record<OrderStatus, 'warn' | 'info' | 'contrast' | 'success' | 'danger'> = {
  Pending: 'warn',
  Processing: 'info',
  Shipped: 'contrast',
  Delivered: 'success',
  Cancelled: 'danger',
};

export const severityOf = (status: string) => STATUS_SEVERITY[status as OrderStatus] ?? 'secondary';

// ---- Store settings (managed by the admin, apply to every visitor) ----

export type CurrencyCode = 'USD' | 'EUR' | 'MAD' | 'AED';
export const CURRENCIES: CurrencyCode[] = ['USD', 'EUR', 'MAD', 'AED'];
export const BASE_CURRENCY: CurrencyCode = 'USD';

export interface StoreSettings {
  storeName: string;
  /** Custom logo reference; null uses the built-in Lumora mark. */
  logo: string | null;
  /** Accent color (hex) — the whole UI palette is derived from it. */
  accent: string;
  defaultCurrency: CurrencyCode;
  /** 1 USD = rate × currency */
  rates: Record<CurrencyCode, number>;
  /** In USD */
  freeShippingThreshold: number;
}

export const ACCENT_PRESETS = [
  { key: 'rose', color: '#cf7d78' },
  { key: 'lilac', color: '#9b7fc8' },
  { key: 'sage', color: '#6f9a7d' },
  { key: 'champagne', color: '#c39a5a' },
  { key: 'ocean', color: '#5b8db8' },
  { key: 'plum', color: '#a35b84' },
] as const;

export const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Lumora',
  logo: null,
  accent: '#cf7d78',
  defaultCurrency: 'USD',
  rates: { USD: 1, EUR: 0.92, MAD: 9.95, AED: 3.67 },
  freeShippingThreshold: 150,
};
