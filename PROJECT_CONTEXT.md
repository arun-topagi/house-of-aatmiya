# The House of Aatmiya: Project Context Prompt

> Paste this at the start of a new chat, or `@`-mention this file, so the agent picks up the full project context.

---

You are working on **The House of Aatmiya** (tagline: *"Crafted Like Family"*), a fullstack monorepo at `C:\Users\Wissen\work\house-of-aatmiya`. It is a small family-run D2C store that sells **adult women's pure cotton dresses, kurtas and stoles**, **gift hampers**, and **fresh, batch-made kids' snacks** (ragi drink mix, A2 ghee cookies, chikki, makhana). Orders are confirmed personally over a WhatsApp call, and payment is a **UPI advance**. There is **no Cash on Delivery**.

The sister project **Raitha-Bandhu** at `C:\Users\Wissen\work\Raitha-Bandhu` (same `backend` / `client-app` / `admin-app` layout) is the **reference implementation**. When asked to do something "like Raitha-Bandhu", read the matching file there first and mirror its pattern.

## Monorepo Layout
| Folder | Stack | Port |
|---|---|---|
| `db/` | Liquibase changelogs (`changelog/changelog.xml`), PostgreSQL, `.env.dev` | — |
| `backend/` | NestJS 10 + Prisma 5 (PostgreSQL), JWT auth, `class-validator` DTOs, global `TransformInterceptor` (`{ data, message }` wrapper) | 3001 |
| `client-app/` | Next.js 15 (App Router) + React 19 + Redux Toolkit / RTK Query + Axios + Tailwind | 3000 |
| `admin-app/` | Next.js 15 + React 19 + Redux Toolkit + Axios + Tailwind | 3002 |

Run the dev servers with `npm run start:dev` (backend) and `npm run dev` (apps). Typecheck with:
```powershell
node backend\node_modules\typescript\bin\tsc -p backend\tsconfig.build.json --noEmit
node client-app\node_modules\typescript\bin\tsc -p client-app\tsconfig.json --noEmit
node admin-app\node_modules\typescript\bin\tsc -p admin-app\tsconfig.json --noEmit
```

## Backend Modules (`backend/src/modules`)
- **user-auth**: WhatsApp OTP login (Meta Cloud API, with a dev-mode OTP log fallback). Endpoints: `send-otp`, `verify-otp`, `refresh` (the refresh token never expires; the access token lasts 30 days), `GET/PUT profile`, `PUT address`, `confirm-address-mobile`. Guards are in `guards/user-jwt.guard.ts`: `UserJwtGuard` and `OptionalUserJwtGuard`, which set `req.user = { userId, phone, type }`.
- **orders**: every endpoint uses `@UseGuards(UserJwtGuard)`: `POST /orders`, `GET /orders` (my orders; `/orders/my` is an alias), `GET /orders/:id` (scoped to the user). Creating an order upserts the user's default address, computes shipping (FREE for society residents or orders ≥ ₹1500, otherwise ₹90), generates order numbers as `HOA-<n>`, and returns a `whatsappConciergeUrl`.
- **products**: public catalog API.
- **admin-auth**: email/password login → `{ accessToken, admin }`. Guards: `JwtAuthGuard` + `AdminGuard`.
- **admin-orders**: `GET /admin/orders`, `/metrics`, `/kitchen-prep`, `PATCH /:id/status` (status, advance paid, admin notes). Builds the UPI deep link and the WhatsApp UPI payment request URL.
- **admin-products**: CRUD: `POST/PUT /admin/products`, `PATCH /:id/toggle`, `PATCH /:id/featured`.
- Every admin controller **must** use `@UseGuards(JwtAuthGuard, AdminGuard)`.

Order status flow: `PENDING_CALL → CONFIRMED_AWAITING_UPI → PAID_IN_PREP → READY_FOR_DISPATCH → COMPLETED` (or `CANCELLED`). Advance rule: **100%** for food/hampers or made-to-batch items, **50%** for clothing. Delivery types: `SOCIETY_HAND_DELIVERY`, `COURIER_DELIVERY`.

## Client App Features (`client-app/src`)
- **3-mode storefront**: `ALL` (`/`), `DRESS_AND_GIFTS` (`/boutique`), `FOODS_ONLY` (`/foods`). The default mode and the mode switcher are controlled from the admin app.
- Pages: home, products catalog with filter sidebar, product detail, checkout, `/orders`, `/profile`, `/confirm-address` (mobile GPS confirmation).
- **4-stage checkout**: Review Bag → WhatsApp OTP → GPS & Address (browser geolocation + Nominatim reverse geocoding) → Place Order and open the WhatsApp concierge. The OTP and Address steps are skipped automatically once the user is logged in and has a saved address.
- Auth state lives in `store/slices/userAuthSlice.ts` (`isHydrated`, `isAuthenticated`, tokens, user, address; actions `setUserCredentials`, `syncUserProfile`, `updateSavedAddress`, `logoutUser`). It persists to the localStorage keys `aatmiya_user_auth_v1`, `aatmiya_user_token` and `aatmiya_user_refresh_token`. `StoreProvider` hydrates this state, wires `HttpFactory.onSessionExpired` to log out, and loads `GET /user-auth/profile` on startup.
- Folder conventions: `app/` (routes) → `features/<area>/*View.tsx` → `components/` → `elements/` (Badge, Button, Icon, Select). Icons use Material Symbols.

## Admin App Features (`admin-app/src`)
- Admin login form. Auth lives in `store/adminSlice.ts` (localStorage key `aatmiya_admin_auth_v1`). Display names that match personal names are replaced with "Aatmiya Admin".
- Sidebar tabs (`AdminTab`): **Orders & Concierge**, **Kitchen Batch Prep**, **Products & Margins**, **3-Mode Storefront**.
- **Orders** and **Products** use the Raitha-Bandhu **Toolbar + Table + Pagination + right slide-over Flyout** pattern (`OrdersToolbar/OrdersTable/OrderFlyout`, `ProductsToolbar/ProductsTable/ProductFlyout`). Products are created and edited **only in the Flyout**.
- Theme: Raitha-Bandhu admin look, with **Geist Sans / Geist Mono** fonts, emerald `#166534` / `#004c22`, and surface `#f8f9ff`.

## Shared Service Layer (both apps)
- `src/utils/httpFactory.ts`: Axios wrapper class. It attaches the Bearer token, refreshes once on a 401 (queueing other requests meanwhile), formats error messages, and provides `unwrap()` for the `{ data }` wrapper.
- Service classes `extend HttpFactory` (client: `CatalogService`, `UserAuthService`, `OrderService`; admin: `AuthService`, `AdminOrderService`, `AdminProductService`). RTK Query APIs use `services/axiosBaseQuery.ts`.

## Rules & Constraints
1. **No personal names** (Arun, Snehal, Saharsha, Sreeja) anywhere in the UI or generated messages. Use "The House of Aatmiya" or "Aatmiya Admin".
2. **Removed features**: do not reintroduce the admin **WhatsApp Center** tab, the **25-Day Reorder Radar** (frontend or backend), the **Storefront mode** section in the client footer, or the hero-section category buttons (All / Dresses / Food).
3. The feature highlight strips ("100% Pure", "Adult S–XL", "Zero Maida") must be **mode-specific**, not shared between Dresses & Gifts and Pure Foods.
4. Product detail page: show the price to the left of **Add to Bag**, with no label text above the price.
5. Every protected API must use a guard: `UserJwtGuard` for customer APIs, `JwtAuthGuard + AdminGuard` for admin APIs. Never send fake or local tokens.
6. Keep the Raitha-Bandhu patterns (HttpFactory services, Table + Flyout, theme and fonts). Preserve existing comments.
7. Before saying a task is done, run `tsc --noEmit` for every touched package.

## Testing
- There are **no unit tests** in this project. The broken `backend/test/unit/**` folder was removed on purpose. Do not add unit tests unless explicitly asked.
