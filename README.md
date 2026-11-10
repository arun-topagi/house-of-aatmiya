# The House of Aatmiya — Crafted Like Family

Full-stack monorepo platform for **The House of Aatmiya**, a boutique pure cotton clothing, clean-label kids' snacks, and artisanal gifting brand founded by **Arun & Snehal** (inspired by **Saharsha & Sreeja**).

---

## 🏗️ Module Structure

This repository is structured as a monorepo following the exact modular architecture of `Raitha-Bandhu`:

* **`/client-app`** (Port `3000`): Next.js 16 (App Router) luxury storefront featuring:
  * **3 Storefront Modes**:
    1. **Mode 1 (`/` — All Categories)**: Complete House of Aatmiya showcase.
    2. **Mode 2 (`/boutique` — Dresses & Gifts Focus)**: Editorial lookbook for Adult Women's Pure Cotton Dresses, Kurtas, Stoles & Gift Hampers.
    3. **Mode 3 (`/foods` — Pure Foods Focus)**: Clean-label pantry storefront for Kids' Snacks (Ages 3+, No Maida, No Refined Sugar, Pure Ghee) with fresh batch scheduling.
  * **4-Stage Verified Checkout**:
    * Stage 1: Cart Review
    * Stage 2: **WhatsApp OTP Login** (verifies genuine customer phone number)
    * Stage 3: **GPS Location Capture + Mobile Address Confirmation** (`/confirm-address`)
    * Stage 4: WhatsApp Concierge Order Placement (`#HOA-XXXX`)
* **`/admin-app`** (Port `3002`): Next.js 16 (App Router) mobile-first Admin Dashboard for Snehal & Arun:
  * **Storefront Mode Control**: Switch default landing mode (`ALL`, `DRESS_AND_GIFTS`, `FOODS_ONLY`) in 1 tap.
  * **Order Concierge Board**: Shows OTP-verified phone badge, Google Maps GPS Pin, 1-tap Call, and 1-tap WhatsApp UPI Advance request link (`upi://pay`).
  * **Kitchen Prep Aggregator**: Sums all `PAID_IN_PREP` kids' snack items into exact gram/kg batch totals.
  * **Product & Margin CMS**: Manages products, variants, stock, and live Cost-to-Selling Price markup ratios (`2.2x–2.5x`).
  * **25-Day Reorder Radar**: 1-tap WhatsApp check-in for repeat snack orders.
* **`/backend`** (Port `3001`): Central NestJS 10 REST API with Prisma Client, JWT authentication, WhatsApp OTP integration, global `TransformInterceptor`, and unit test mirroring (`test/unit/`).
* **`/db`**: Standalone PostgreSQL schema migration & seeding module using Liquibase (`changelog/changelog.xml`) and `pg` seed scripts (`scripts/seed.js` and `scripts/seed-products.js`).

---

## 🚀 Quick Start

### 1. Database Migration & Seeding (`/db`)
```bash
cd db
npm install
npm run update
npm run seed
npm run seed:products
```

### 2. Backend API (`/backend`)
```bash
cd backend
npm install
npm run build
npm run test:orphans
npm test
npm run start:dev
```

### 3. Client Storefront (`/client-app`)
```bash
cd client-app
npm install
npm run dev
```

### 4. Admin Dashboard (`/admin-app`)
```bash
cd admin-app
npm install
npm run dev
```
