import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'Dashboard · Essence Admin', loadComponent: () => import('./pages/admin/dashboard').then((m) => m.Dashboard) },
      { path: 'products', title: 'Products · Essence Admin', loadComponent: () => import('./pages/admin/products').then((m) => m.AdminProducts) },
      { path: 'orders', title: 'Orders · Essence Admin', loadComponent: () => import('./pages/admin/orders').then((m) => m.AdminOrders) },
      { path: 'customers', title: 'Customers · Essence Admin', loadComponent: () => import('./pages/admin/customers').then((m) => m.AdminCustomers) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/shop-layout').then((m) => m.ShopLayout),
    children: [
      { path: '', title: 'Essence — Parfumerie', loadComponent: () => import('./pages/shop/home').then((m) => m.Home) },
      { path: 'shop', title: 'Shop · Essence', loadComponent: () => import('./pages/shop/catalog').then((m) => m.Catalog) },
      { path: 'product/:id', title: 'Perfume · Essence', loadComponent: () => import('./pages/shop/product-detail').then((m) => m.ProductDetail) },
      { path: 'cart', title: 'Cart · Essence', loadComponent: () => import('./pages/shop/cart').then((m) => m.Cart) },
      { path: 'wishlist', title: 'Wishlist · Essence', loadComponent: () => import('./pages/shop/wishlist').then((m) => m.Wishlist) },
      { path: 'checkout', title: 'Checkout · Essence', canActivate: [authGuard], loadComponent: () => import('./pages/shop/checkout').then((m) => m.Checkout) },
      { path: 'orders', title: 'My orders · Essence', canActivate: [authGuard], loadComponent: () => import('./pages/shop/orders').then((m) => m.MyOrders) },
      { path: 'login', title: 'Sign in · Essence', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/login').then((m) => m.Login) },
      { path: 'register', title: 'Create account · Essence', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/register').then((m) => m.Register) },
      { path: '**', title: 'Not found · Essence', loadComponent: () => import('./pages/shop/not-found').then((m) => m.NotFound) },
    ],
  },
];
