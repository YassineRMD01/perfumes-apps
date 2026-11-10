# Essence — Perfume Shop (Angular 22)

A front-end web app for selling perfumes, with a **client storefront** and an **admin back office**.

**Stack:** Angular 22 (standalone, signals, zoneless, new control flow) · Tailwind CSS 4 · PrimeNG 21 (MIT, Aura theme, amber preset) · Font Awesome (`@fortawesome/angular-fontawesome`)

## Getting started

```bash
npm install
npm start          # http://localhost:4200
npm run build      # production build in dist/
```

### Demo accounts

| Role   | Email                | Password    |
| ------ | -------------------- | ----------- |
| Admin  | admin@essence.shop   | admin123    |
| Client | client@essence.shop  | client123   |

The sign-in page also has one-click demo buttons.

### About the PrimeNG version

The app uses **PrimeNG 21.1.x**, the last MIT-licensed release. PrimeNG 22+ moved to the commercial PrimeUI License and
shows a license banner unless a key is configured. PrimeNG 21 officially declares Angular 21 as its peer, so
`package.json` has an npm `overrides` block that lets it run on Angular 22. The build and the main user flows were
tested on that combination. Remove the `overrides` block if you downgrade to Angular 21.

## Features

### Client storefront
- **Home**: hero, perks, featured carousel, shop by scent family, new arrivals, newsletter
- **Shop**: search (name, brand, notes), filters (gender, family, brand, price range, in stock), sorting, pagination, mobile filter drawer
- **Product page**: notes pyramid (top, heart, base), stock status, quantity, add to cart, wishlist, related products
- **Cart**: quantity editing, progress bar toward free shipping, order summary
- **Checkout** (sign-in required): reactive form with validation, card or cash-on-delivery payment
- **My orders**: order history with details; pending orders can be cancelled
- **Wishlist**, **Sign in / Register**, 404 page

### Admin back office (`/admin`, admin role only)
- **Dashboard**: revenue, orders, average order value and customer KPIs, 6-month revenue chart, orders by status, recent orders, top sellers, low stock alerts
- **Products**: sortable, searchable, paginated table; create/edit dialog with live bottle preview; delete with confirmation
- **Orders**: filter by status and search; inline status changes (cancelling restocks the items); order detail dialog
- **Customers**: order count, total spent, segment (New, Returning, VIP)
- **Reset demo data**

## Architecture

```
src/app/
  core/       models, seed data, signal-based services (auth, products, cart, wishlist, orders), route guards
  shared/     icon registry, SVG bottle component, product card
  layouts/    shop layout (header/footer) and admin layout (sidebar)
  pages/shop  storefront pages
  pages/admin back-office pages
```

Data is mocked and kept in `localStorage` through signals, so the app runs with no backend. To use a real API,
replace the service internals with `HttpClient` calls; the components only use the services' signals and methods.
All routes are lazy-loaded. `authGuard`, `adminGuard` and `guestGuard` protect the matching pages.
