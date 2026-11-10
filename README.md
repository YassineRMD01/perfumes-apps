# Lumora — Perfume Shop (Angular 22)

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
| Admin  | admin@lumora.shop   | admin123    |
| Client | client@lumora.shop  | client123   |

The sign-in page also has one-click demo buttons.

### About the PrimeNG version

The app uses **PrimeNG 21.1.x**, the last MIT-licensed release. PrimeNG 22+ moved to the commercial PrimeUI License and
shows a license banner unless a key is configured. PrimeNG 21 officially declares Angular 21 as its peer, so
`package.json` has an npm `overrides` block that lets it run on Angular 22. The build and the main user flows were
tested on that combination. Remove the `overrides` block if you downgrade to Angular 21.

## Brand & design

**Lumora** (from *lumière*, light) is a fictional "maison de parfum". Its logo is an arch-shaped perfume bottle with a
drop, drawn as an SVG in `shared/logo/` and as `public/favicon.svg`. The default design is light: warm ivory
backgrounds, rose accent, Cormorant Garamond headings and Jost body text (Cairo for Arabic).

- **Light / dark mode**: a toggle in the header for everyone (admin, clients, visitors), saved per visitor.
  Colors are CSS tokens in `src/styles.css` (`bg-page`, `bg-surface`, `text-ink`, `text-muted`, `border-line`,
  `brand-*`…) that switch with the `.app-dark` class, along with PrimeNG's dark mode.
- **Store branding (admin → Settings)**: store name, logo upload and accent color (6 presets or any custom color).
  The full 50–950 palette is generated from the accent and applied to PrimeNG and to the Tailwind `brand-*` tokens, so
  the whole storefront and back office update right away for every visitor. A live preview shows the change before
  saving.

## Currencies

Visitors pick USD, EUR, MAD or AED in the header (or the mobile menu). Prices are stored in USD and converted with
the exchange rates the admin sets in Settings, which also holds the default currency for new visitors and the
free-shipping threshold.

## Brands & categories

Both are managed in the back office and used everywhere in the storefront (filters, product pages, home page sections):

- **Brands**: name, country, description and optional logo. Perfumes pick their brand from this list.
- **Categories**: name and short description in English, French, Spanish and Arabic, plus a tile color.
  Missing translations fall back to English.
- A brand or category that still has perfumes cannot be deleted; the admin is asked to move the perfumes first.

## Languages

The whole UI is available in **English, French, Spanish and Arabic**. Switch with the globe menu in the header (or in the
mobile drawer). The choice is remembered; on a first visit the browser language is used.

- Arabic switches the page to **right-to-left** (`<html dir="rtl">`), uses the Cairo font, and the layout uses logical
  Tailwind utilities (`ms-*`, `pe-*`, `start-*`, `text-end`, `rtl:` variants) so it mirrors correctly.
- Prices and dates are formatted per locale with `Intl`. Page titles and PrimeNG's built-in texts are translated too.
- Translations live in `src/app/core/i18n/{en,fr,es,ar}.ts`. `en.ts` defines the keys. The other files are typed against
  it, and so are the `| t` calls in templates, so a missing translation or a typo in a key fails the build.
- Product content (names, descriptions, notes) is shown as entered by the admin.

```html
{{ 'nav.home' | t }}                       <!-- translate a key -->
{{ 'shop.count' | t: { n: 12 } }}          <!-- with parameters -->
{{ p.family | tv: 'family' }}              <!-- translate an enum value -->
{{ p.price | money }} · {{ d | ldate }}    <!-- locale-aware amount and date -->
```

## Product photos

Admins can attach **up to 5 photos per perfume** in the product dialog:

- Upload by clicking or by drag and drop (JPG/PNG/WEBP, 10 MB max each), or paste an image URL
- Reorder photos, pick the cover (the first photo), remove photos
- Uploads are resized to 1200 px max and compressed to WebP in the browser, then stored in **IndexedDB**
  (localStorage is too small for images). Photos you remove, or upload and then cancel, are deleted from storage.
- The storefront shows the cover on product cards (the 2nd photo appears on hover), and a gallery with thumbnails,
  arrows and keyboard navigation on the product page. Perfumes without photos keep the generated SVG bottle.

To use a real backend, replace `ImageStore.add()` with an upload request that returns the image URL.

## Features

### Client storefront
- **Home**: hero, perks, featured carousel, shop by scent family, new arrivals, newsletter
- **Shop**: search (name, brand, notes), filters (gender, family, brand, price range, in stock), sorting, pagination, mobile filter drawer
- **Product page**: photo gallery, notes pyramid (top, heart, base), stock status, quantity, add to cart, wishlist, related products
- **Cart**: quantity editing, progress bar toward free shipping, order summary
- **Checkout** (sign-in required): reactive form with validation, card or cash-on-delivery payment
- **My orders**: order history with details; pending orders can be cancelled
- **Wishlist**, **Sign in / Register**, 404 page

### Admin back office (`/admin`, admin role only)
- **Dashboard**: revenue, orders, average order value and customer KPIs, 6-month revenue chart, orders by status, recent orders, top sellers, low stock alerts
- **Products**: sortable, searchable, paginated table; create/edit dialog with photo manager (up to 5 photos) and live preview; delete with confirmation
- **Orders**: filter by status and search; inline status changes (cancelling restocks the items); order detail dialog
- **Customers**: order count, total spent, segment (New, Returning, VIP)
- **Brands** and **Categories**: create, edit, delete
- **Settings**: store name, logo, accent color, currencies and exchange rates, free shipping
- **Reset demo data**

## Architecture

```
src/app/
  core/          models, seed data, signal services (auth, products, catalog = brands & categories, cart,
                 wishlist, orders, images, settings, currency, theme), route guards, color palette helper
  core/i18n/     translation service, dictionaries (en/fr/es/ar), pipes, translated page titles
  shared/        logo, bottle/photo, product card, photo manager, language/currency switchers, theme toggle
  layouts/       shop layout and admin layout
  pages/shop/    storefront pages
  pages/admin/   back-office pages
```

Every component lives in its own folder with three files: `name.ts` (logic), `name.html` (template) and
`name.css` (styles), e.g. `shared/product-card/product-card.{ts,html,css}`.

Data is mocked and kept in `localStorage` through signals, so the app runs with no backend. To use a real API,
replace the service internals with `HttpClient` calls; the components only use the services' signals and methods.
All routes are lazy-loaded. `authGuard`, `adminGuard` and `guestGuard` protect the matching pages.
