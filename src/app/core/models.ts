export type Lang = 'en' | 'fr' | 'es' | 'ar';
export type Translated = Record<Lang, string>;

export type Gender = 'Women' | 'Men' | 'Unisex';
export type Concentration = 'Parfum' | 'EDP' | 'EDT' | 'Cologne';

export type ProductKind = 'perfume' | 'cosmetic';
export type SkinType = 'All' | 'Dry' | 'Oily' | 'Combination' | 'Sensitive';
/** Shape drawn when a product has no photo */
export type Packaging = 'bottle' | 'jar' | 'tube' | 'dropper' | 'lipstick' | 'compact';
export type SizeUnit = 'ml' | 'g';

export const PRODUCT_KINDS: ProductKind[] = ['perfume', 'cosmetic'];
export const SKIN_TYPES: SkinType[] = ['All', 'Dry', 'Oily', 'Combination', 'Sensitive'];
export const PACKAGINGS: Packaging[] = ['bottle', 'jar', 'tube', 'dropper', 'lipstick', 'compact'];

export type Longevity = 'Light' | 'Moderate' | 'Long' | 'VeryLong';
export type Season = 'Spring' | 'Summer' | 'Autumn' | 'Winter';
export type TimeOfDay = 'Day' | 'Night' | 'Both';

export const MAX_PHOTOS = 5;
/** Ordered from shortest to longest; hours shown in the UI come from the translations. */
export const LONGEVITIES: Longevity[] = ['Light', 'Moderate', 'Long', 'VeryLong'];
export const SEASONS: Season[] = ['Spring', 'Summer', 'Autumn', 'Winter'];
export const TIMES_OF_DAY: TimeOfDay[] = ['Day', 'Night', 'Both'];
export const GENDERS: Gender[] = ['Women', 'Men', 'Unisex'];
export const CONCENTRATIONS: Concentration[] = ['Parfum', 'EDP', 'EDT', 'Cologne'];

/** Product house, managed by the admin. */
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
  /** Perfume categories (olfactory families) or cosmetic categories (skincare, makeup…) */
  kind: ProductKind;
  name: Translated;
  description: Translated;
  /** Accent color used for the category tile. */
  color: string;
  createdAt: string;
}

export interface Product {
  id: number;
  kind: ProductKind;
  name: string;
  brandId: number;
  categoryId: string;
  description: string;
  /** Price in the store base currency (USD). */
  price: number;
  oldPrice?: number | null;
  stock: number;
  /** Size, in `unit` (ml or g) */
  volumeMl: number;
  unit: SizeUnit;
  gender: Gender;
  concentration: Concentration;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  // ---- Perfume details (ignored for cosmetics) ----
  /** How long the scent lasts on skin */
  longevity: Longevity;
  /** Seasons it is best worn in */
  seasons: Season[];
  /** Best for day, night or both */
  timeOfDay: TimeOfDay;
  // ---- Cosmetic details (ignored for perfumes) ----
  /** Suitable skin types; empty = not applicable (e.g. hair care) */
  skinTypes: SkinType[];
  ingredients: string[];
  howToUse: string;
  packaging: Packaging;
  /** Tint used by the generated SVG packaging when there is no photo */
  color: string;
  /** Up to MAX_PHOTOS references (URL or "idb:<id>"), the first one is the cover. */
  images: string[];
  rating: number;
  reviews: number;
  featured: boolean;
  createdAt: string;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'rating' | 'reviews'>;

export type Role = 'admin' | 'client';

export interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: Role;
  phone?: string;
  /** Saved shipping address, pre-filled at checkout */
  address?: ShippingInfo;
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
  /** Coupon discount in USD (0 / absent when none) */
  discount?: number;
  couponCode?: string;
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

// ---- Reviews ----

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  /** 1–5 */
  rating: number;
  comment: string;
  createdAt: string;
}

// ---- Coupons ----

export type CouponType = 'percent' | 'fixed';

export interface Coupon {
  code: string;
  type: CouponType;
  /** Percentage (1–100) or USD amount */
  value: number;
  /** Minimum subtotal in USD */
  minSubtotal: number;
  active: boolean;
  /** ISO date (inclusive), or null for no expiry */
  expiresAt: string | null;
  uses: number;
  createdAt: string;
}

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
  { key: 'gold', color: '#c5a04e' },
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
  accent: '#c5a04e',
  defaultCurrency: 'USD',
  rates: { USD: 1, EUR: 0.92, MAD: 9.95, AED: 3.67 },
  freeShippingThreshold: 150,
};
