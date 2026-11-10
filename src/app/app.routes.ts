import { Routes } from '@angular/router';
import { adminGuard, authGuard, guestGuard } from './core/guards';

// Route titles are translation keys, resolved by I18nTitleStrategy
export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./layouts/admin-layout/admin-layout').then((m) => m.AdminLayout),
    children: [
      { path: '', title: 'title.dashboard', loadComponent: () => import('./pages/admin/dashboard/dashboard').then((m) => m.Dashboard) },
      { path: 'products', title: 'title.adminProducts', loadComponent: () => import('./pages/admin/products/products').then((m) => m.AdminProducts) },
      { path: 'orders', title: 'title.adminOrders', loadComponent: () => import('./pages/admin/orders/orders').then((m) => m.AdminOrders) },
      { path: 'customers', title: 'title.adminCustomers', loadComponent: () => import('./pages/admin/customers/customers').then((m) => m.AdminCustomers) },
      { path: 'reviews', title: 'title.adminReviews', loadComponent: () => import('./pages/admin/reviews/reviews').then((m) => m.AdminReviews) },
      { path: 'coupons', title: 'title.adminCoupons', loadComponent: () => import('./pages/admin/coupons/coupons').then((m) => m.AdminCoupons) },
      { path: 'brands', title: 'title.adminBrands', loadComponent: () => import('./pages/admin/brands/brands').then((m) => m.AdminBrands) },
      { path: 'categories', title: 'title.adminCategories', loadComponent: () => import('./pages/admin/categories/categories').then((m) => m.AdminCategories) },
      { path: 'settings', title: 'title.adminSettings', loadComponent: () => import('./pages/admin/settings/settings').then((m) => m.AdminSettings) },
    ],
  },
  {
    path: '',
    loadComponent: () => import('./layouts/shop-layout/shop-layout').then((m) => m.ShopLayout),
    children: [
      { path: '', title: 'title.home', loadComponent: () => import('./pages/shop/home/home').then((m) => m.Home) },
      { path: 'shop', title: 'title.shop', loadComponent: () => import('./pages/shop/catalog/catalog').then((m) => m.Catalog) },
      { path: 'product/:id', title: 'title.product', loadComponent: () => import('./pages/shop/product-detail/product-detail').then((m) => m.ProductDetail) },
      { path: 'cart', title: 'title.cart', loadComponent: () => import('./pages/shop/cart/cart').then((m) => m.Cart) },
      { path: 'wishlist', title: 'title.wishlist', loadComponent: () => import('./pages/shop/wishlist/wishlist').then((m) => m.Wishlist) },
      { path: 'checkout', title: 'title.checkout', canActivate: [authGuard], loadComponent: () => import('./pages/shop/checkout/checkout').then((m) => m.Checkout) },
      { path: 'account', title: 'title.account', canActivate: [authGuard], loadComponent: () => import('./pages/shop/account/account').then((m) => m.Account) },
      { path: 'orders', title: 'title.orders', canActivate: [authGuard], loadComponent: () => import('./pages/shop/orders/orders').then((m) => m.MyOrders) },
      { path: 'login', title: 'title.login', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/login/login').then((m) => m.Login) },
      { path: 'register', title: 'title.register', canActivate: [guestGuard], loadComponent: () => import('./pages/shop/register/register').then((m) => m.Register) },
      { path: '**', title: 'title.notFound', loadComponent: () => import('./pages/shop/not-found/not-found').then((m) => m.NotFound) },
    ],
  },
];
