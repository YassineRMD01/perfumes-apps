import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';

// Route titles are translation keys, resolved by I18nTitleStrategy
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'title.dashboard', loadComponent: () => import('./pages/admin/dashboard').then((m) => m.Dashboard) },
      { path: 'products', title: 'title.adminProducts', loadComponent: () => import('./pages/admin/products').then((m) => m.AdminProducts) },
      { path: 'orders', title: 'title.adminOrders', loadComponent: () => import('./pages/admin/orders').then((m) => m.AdminOrders) },
      { path: 'customers', title: 'title.adminCustomers', loadComponent: () => import('./pages/admin/customers').then((m) => m.AdminCustomers) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/shop-layout').then((m) => m.ShopLayout),
    children: [
      { path: '', title: 'title.home', loadComponent: () => import('./pages/shop/home').then((m) => m.Home) },
      { path: 'shop', title: 'title.shop', loadComponent: () => import('./pages/shop/catalog').then((m) => m.Catalog) },
      { path: 'product/:id', title: 'title.product', loadComponent: () => import('./pages/shop/product-detail').then((m) => m.ProductDetail) },
      { path: 'cart', title: 'title.cart', loadComponent: () => import('./pages/shop/cart').then((m) => m.Cart) },
      { path: 'wishlist', title: 'title.wishlist', loadComponent: () => import('./pages/shop/wishlist').then((m) => m.Wishlist) },
      { path: 'checkout', title: 'title.checkout', canActivate: [authGuard], loadComponent: () => import('./pages/shop/checkout').then((m) => m.Checkout) },
      { path: 'orders', title: 'title.orders', canActivate: [authGuard], loadComponent: () => import('./pages/shop/orders').then((m) => m.MyOrders) },
      { path: 'login', title: 'title.login', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/login').then((m) => m.Login) },
      { path: 'register', title: 'title.register', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/register').then((m) => m.Register) },
      { path: '**', title: 'title.notFound', loadComponent: () => import('./pages/shop/not-found').then((m) => m.NotFound) },
    ],
  },
];
