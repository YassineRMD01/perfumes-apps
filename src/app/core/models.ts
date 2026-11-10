export type Gender = 'Women' | 'Men' | 'Unisex';
export type Family = 'Floral' | 'Woody' | 'Oriental' | 'Fresh' | 'Citrus' | 'Gourmand';
export type Concentration = 'Parfum' | 'EDP' | 'EDT' | 'Cologne';

export const MAX_PHOTOS = 5;

export const GENDERS: Gender[] = ['Women', 'Men', 'Unisex'];
export const FAMILIES: Family[] = ['Floral', 'Woody', 'Oriental', 'Fresh', 'Citrus', 'Gourmand'];
export const CONCENTRATIONS: Concentration[] = ['Parfum', 'EDP', 'EDT', 'Cologne'];

export interface Perfume {
  id: number;
  name: string;
  brand: string;
  description: string;
  price: number;
  oldPrice?: number | null;
  stock: number;
  volumeMl: number;
  gender: Gender;
  family: Family;
  concentration: Concentration;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  /** Bottle tint used by the generated SVG bottle */
  color: string;
  /**
   * Up to MAX_PHOTOS photo references, first one is the cover.
   * Either an http(s) URL or an "idb:<id>" reference to an uploaded photo stored in IndexedDB.
   * When empty, the UI falls back to a generated SVG bottle.
   */
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
