# E-Commerce Inventory Stock Manager

React + TypeScript inventory dashboard for warehouse managers. It uses Supabase Auth, Supabase PostgreSQL, row-level security, Tailwind CSS, React Router, `react-hook-form`, and `zod`.

## Features

- Manager sign up and login with Supabase Auth.
- Protected `/dashboard` route that redirects logged-out users to `/login`.
- Role checking for `warehouse_manager` and `admin` profiles.
- Auth header with profile badge, store name, dark mode toggle, and sign out.
- Store-scoped product list from Supabase PostgreSQL.
- Debounced search by product name or SKU.
- Stock status filtering: In Stock, Low Stock, Out of Stock.
- Memoized stock health progress: `In-stock products / Total products`.
- Add products, increase/decrease quantity, and mark products as reordered.
- Toasts for auth/database errors and successful actions.
- Skeleton loaders during session and inventory checks.
- Compound component inventory cards: `InventoryCard.Header`, `InventoryCard.Body`, `InventoryCard.Actions`.

## Tech Stack

- React.js with TypeScript, not Next.js.
- Vite for local development and builds.
- Tailwind CSS for styling.
- Supabase Auth and PostgreSQL.
- React Context API for auth, theme, and toast state.
- Custom hooks for debouncing and inventory data.
- `react-hook-form` + `zod` for login, sign up, product addition, and stock adjustment inputs.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a Supabase project.

3. In Supabase SQL Editor, run:

```sql
-- paste and execute supabase/schema.sql
```

4. Copy environment variables:

```bash
cp .env.example .env
```

5. Fill in `.env`:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

6. Start the app:

```bash
npm run dev
```

## Supabase Notes

The schema creates:

- `profiles`: authenticated user profile, role, and store ownership.
- `products`: store-scoped inventory items.
- `inventory_logs`: audit trail for stock changes and reorder events.

RLS is enabled on all three tables. Product and log policies only allow managers/admins to access rows belonging to their own `store_id`.

For easiest local testing, disable email confirmation in Supabase Auth settings. If email confirmation stays enabled, users may need to verify their email before the session is active.

## Key Logic

`src/providers/AuthProvider.tsx` handles session checks, login, sign up, profile creation, sign out, and profile loading.

`src/routes/ProtectedRoute.tsx` blocks logged-out users and validates manager/admin roles before rendering the dashboard.

`src/hooks/useInventory.ts` fetches store products, applies memoized filtering, calculates stock health with `useMemo`, and writes stock actions plus inventory logs.

`src/hooks/useDebounce.ts` delays search updates so filtering remains fast while the manager types.

`src/components/InventoryCard.tsx` implements the required compound component pattern.

## Build

```bash
npm run build
```
