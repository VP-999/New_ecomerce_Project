# TrendHive - Setup Guide (Windows/Mac/Linux)

Follow these steps to run this project on another computer.

---

## 1) Requirements
- Node.js 18+ (recommended LTS)
- Git (optional)
- A Supabase project (free tier is fine)

Check Node version:
```bash
node -v
```

---

## 2) Get the source code
Option A: Copy this folder to the new computer.

Option B: Clone from your repo:
```bash
git clone <your-repo-url>
cd <project-folder>
```

---

## 3) Install dependencies
```bash
npm install
```

If you use pnpm or yarn:
```bash
pnpm install
# or
yarn install
```

---

## 4) Supabase setup
Create or open a Supabase project: `https://app.supabase.com`

### 4.1) Create tables & policies
Open Supabase → SQL Editor, run the following scripts (paste contents from files):

1. Create core tables and policies (products, orders, order_items):
- File: `scripts/01_create_tables.sql`

2. Create users table with password hashing columns:
- File: `scripts/03_create_users.sql`

Make sure all statements run successfully.

### 4.2) Storage (for product images)
1. Go to Storage → Create Bucket:
   - Bucket name: `products`
   - Public bucket: Enabled
2. Add policies (public read/insert/update/delete) if needed. See `SUPABASE_STORAGE_SETUP.md` for ready-to-use SQL.

### 4.3) Get API keys
In Supabase → Project Settings → API:
- Copy `Project URL` (example: `https://xxxxx.supabase.co`)
- Copy `anon public` key

> This project accesses Supabase via PostgREST endpoints and reads them from code (the URL/key are already embedded for demo). To use your own project, update constants in `src/services/supabaseService.ts`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

You can either set real environment variables or directly replace the fallback values.

---

## 5) Run the app (development)
```bash
npm run dev
```
- Default: http://localhost:3000

If the port is busy, change in `vite.config.ts` (server.port).

---

## 6) Demo credentials
- Admin: `admin@trendhive.com` / `password`
- User: `user@example.com` / `password`

You can also register a new user. Passwords for new users are stored hashed (client-side hashing + Supabase users table).

---

## 7) Features checklist to verify
- Products page: filter/sort by category, price range, rating
- Product detail: wishlist, reviews submission, recommendations
- Search (header): modal search with sorting
- Cart: add/remove/update quantities; promo code `SAVE10` (10% off); COD checkout
- Orders: created in Supabase (`orders` + `order_items`), order ID shown on confirmation
- Admin dashboard (login as admin): view products & orders, add/edit/delete products
- User dashboard: profile summary, order history, sign-out

---

## 8) Image upload
- Use “Upload to Server” in product form → uploads to Supabase Storage `products` bucket.
- Ensure public access policies exist (see `SUPABASE_STORAGE_SETUP.md`).

---

## 9) Common issues
- Port in use: change `server.port` in `vite.config.ts`.
- Images not uploading: verify `products` bucket exists and is public; check policies.
- Orders not visible in admin: ensure you ran `01_create_tables.sql`; check Console logs.
- Users not persisting: ensure `03_create_users.sql` ran; verify rows in Supabase `users` table.

---

## 10) Build for production (optional)
```bash
npm run build
npm run preview
```
- Serves optimized build locally.

---

## 11) Export this guide as PDF
- Open this file (`docs/SETUP_GUIDE.md`) in your editor or a markdown viewer.
- Print → “Save as PDF”.

---

## 12) File map (important files)
- `src/App.tsx` – main app, routing/views
- `src/components/*` – UI components & pages
- `src/contexts/*` – Auth, Cart, Wishlist
- `src/services/*` – Supabase data access, reviews, orders
- `src/lib/crypto.ts` – client-side hashing for passwords
- `scripts/01_create_tables.sql` – core DB schema
- `scripts/03_create_users.sql` – users table schema (hash)
- `SUPABASE_STORAGE_SETUP.md` – storage bucket & policy instructions

---

You’re ready to go. If you want fully Supabase-only auth (no mock users), let me know and I’ll remove the demo accounts and migrate Forgot Password to token-based reset.
