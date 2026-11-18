# Spinning Top — Site Guide

How the site works, how to update it, and what to do when something goes wrong.

---

## 1. How it works (in one minute)

- **Hosting:** cPanel `public_html`. **No Node.js.** The site is plain HTML/CSS/JS files.
- **Data:** Products, services, photos and the shop on/off switch live in **Supabase**
  (project `xdgafesqkaffewysgmeh`).
- **Live updates:** Pages are built with the products as they were at build time, then
  refresh from Supabase in the visitor's browser. **Changes made in `/admin` show
  immediately — no re-upload needed.**
- **Admin:** `https://www.spinningtop.ng/admin/` — sign in with a Supabase account that
  is in the `admins` table (currently `admin@spinningtop.ng`).
- **Security:** Supabase's Row Level Security decides who can change what. Visitors and
  customer accounts can only *read* published items. Only admins can add, edit, delete or
  upload photos.

---

## 2. Daily use (no code)

| I want to… | Do this |
|---|---|
| Add a product | `/admin/` → **Products** → **+ Add product** → fill in → **Publish** |
| Edit a product | **Products** → **Edit** on the row |
| Mark out of stock | **Products** → flip the **In stock** switch |
| Hide a product (keep it) | Edit → **Save as draft (hide)** |
| Delete a product | **Products** → **Delete** (also deletes its photo) |
| Add / edit / hide a service | `/admin/` → **Services** (same buttons) |
| See / update orders | `/admin/` → **Orders** → click an order → change **Status**, tick **Payment received**, add a note → **Save changes**. The customer sees the new status in their account. |
| Turn the shop on/off | **Dashboard** or **Settings** → shop switch. Off = "Coming soon" on `/shop` |

**Photos:** JPG, PNG or WebP. Big photos are shrunk automatically before upload.

**Web address:** set once when the item is created (e.g. `/shop/liquid-detergent-2l`)
and can't be changed later, so shared links keep working.

**Testing on your computer:** `npm run dev` → `http://localhost:3000/admin/`.
Local admin saves to the **real** Supabase, so test items show on the live site too.
Name them "Test …" and delete them after.

---

## 3. When to re-upload the site

Only when the **design or code** changes (not for product/service changes).

1. On your computer, in the project folder: `npm run package:static`
2. Output: **`spinningtop-static.zip`** (in the project folder, next to `package.json`).
3. cPanel → **File Manager** → **Settings** → tick **Show Hidden Files** → Save.
4. Open `public_html` → **Upload** the zip.
5. Right-click the zip → **Extract** → path `/public_html` → replace existing files.
6. **Reload** and check the folders show today's date and an `admin` folder exists.
7. Delete `spinningtop-static.zip` from `public_html`.

### In `public_html` — never delete these
| Item | Why |
|---|---|
| `.well-known` | SSL certificate checks |
| `cgi-bin` | Host system folder |
| `.user.ini`, `php.ini` | Host PHP settings |

Everything else in `public_html` is the website and gets replaced on each extract.

The `.htaccess` forces `https://www.spinningtop.ng`, so cPanel **AutoSSL** must stay active.

---

## 4. Supabase setup (already done — for reference / a new project)

Run these in Supabase → **SQL Editor** → **+ New query** → paste → **Run**, in order:

| File | What it does |
|---|---|
| `supabase/schema.sql` | Creates `products`, `services`, the `catalogue` photo bucket, read rules, permissions |
| `supabase/seed.sql` | Loads the starting 8 products and 7 services (safe to run twice) |
| `supabase/grants.sql` | Table permissions (only needed if schema.sql was run before grants were added) |
| `supabase/admin-access.sql` | `admins` table, admin-only write rules, photo-upload rules, `site_settings` (shop switch) |
| `supabase/customers.sql` | Customer `profiles` (name, phone, address, newsletter), auto-profile on sign-up, "close my account" |
| `supabase/orders.sql` | Orders, order items, status history; `place_order` (prices taken from the database), customer cancel, admin status/payment changes |
| `supabase/customers-admin.sql` | Copies each customer's email into their profile; admin customer list (`/admin/customers`) |

All show **"Success. No rows returned"** when they work.

### Add another admin
1. Supabase → **Authentication** → **Users** → **Add user** (email + password).
2. SQL Editor → run (change the email):
   ```sql
   insert into public.admins (user_id, email)
   select id, email from auth.users where email = 'new.person@example.com'
   on conflict (user_id) do nothing;
   ```

### Remove an admin
```sql
delete from public.admins where email = 'person@example.com';
```

### Change an admin's password
Supabase → **Authentication** → **Users** → click the user → **Send password recovery**
(or reset it there).

### Recommended Supabase settings
- **Authentication → Sign In / Providers:** if customers don't need accounts yet, turn
  off "Allow new users to sign up". (Safe either way — non-admins can't edit anything.)
- **Backups:** free plan has no daily backups. Export data now and then
  (Table Editor → table → Export to CSV).
- **Free projects pause after ~1 week with no activity.** Visits to the live site
  normally keep it awake. If paused: Supabase dashboard → **Restore project**.

---

## 5. Keys and `.env.local`

`.env.local` (in the project folder, never uploaded, ignored by git) needs only:

```
NEXT_PUBLIC_SUPABASE_URL=https://xdgafesqkaffewysgmeh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

- The **publishable key** is built into the site files — that's normal and safe.
- The **secret key** (`sb_secret_…`) must **never** be in this project's code or the zip.
  The site doesn't use it. You can delete the `SUPABASE_SECRET_KEY` and `ADMIN_PASSWORD`
  lines from `.env.local` (left over from the old Node.js version).
- If a secret key is ever exposed: Supabase → **Project Settings** → **API Keys** →
  revoke it and create a new one.

---

## 6. Troubleshooting

| Problem | Fix |
|---|---|
| Admin says **"This account isn't an admin"** | Run the "Add another admin" SQL above with that email |
| Admin says **"Wrong email or password"** | Reset the password in Supabase → Authentication → Users |
| Save says **"Not allowed — sign in again…"** | Log out and sign in again; check the account is in `admins` |
| **"permission denied for table …"** | Run `supabase/grants.sql` (and `admin-access.sql`) again |
| New product shows **"isn't available"** | It's saved as a draft → Edit → **Publish** |
| Site shows old design after upload | Zip wasn't extracted, or extracted into a subfolder. Files must sit directly in `public_html` |
| `/shop/new-item/` gives a 404 page | `.htaccess` missing/old — enable **Show Hidden Files** and re-extract the zip |
| Whole site down / products missing | Supabase project paused → dashboard → **Restore project** |
| Photo upload fails | Use JPG/PNG/WebP; bucket `catalogue` must exist (from `schema.sql`) |

---

## 7. Where things are in the code

| Area | Files |
|---|---|
| Supabase connection | `src/lib/supabase.ts` |
| Build-time product/service reads | `src/lib/catalogue.ts` |
| Live reads in the browser | `src/lib/live-catalogue.ts` |
| Customer sign-in (6-digit email code), sign-up, profile | `src/lib/user-store.ts`, `src/components/account/LoginView.tsx`, `AccountPages.tsx` |
| Checkout, My orders, admin Orders | `src/components/shop/CheckoutView.tsx`, `src/lib/order-data.ts`, `src/lib/admin-orders.ts`, `src/components/admin/OrdersBoard.tsx` |
| Admin sign-in | `src/lib/admin-auth.ts`, `src/components/admin/AdminGuard.tsx`, `src/app/admin/login/` |
| Admin saving / photo upload | `src/lib/admin-catalogue.ts` |
| Admin screens & forms | `src/components/admin/CatalogueScreens.tsx`, `CatalogueForms.tsx` |
| Pages for items added after a build | `src/components/shop/LiveItemPages.tsx` (`/shop/_live/`, `/services/_live/`) |
| Shop on/off | `src/lib/shop-settings.ts`, `src/components/shop/ShopGate.tsx` |
| Build + zip + `.htaccess` | `scripts/package-static.mjs` |
| Database setup | `supabase/*.sql` |
| Account email templates + SMTP steps | `supabase/email-templates/` (see its README.md) |

---

## 8. Not done yet (Phase 2)

These work on this hosting, with secret-key tasks running in **Supabase Edge Functions**
(not cPanel):

- **Customer accounts + order tracking** — `orders` + status-history tables, customers see
  only their own orders.
- **Paystack checkout** — popup in the browser (public key); payment **verified** in an
  Edge Function (secret key) before an order is marked Paid. Never mark orders paid from
  the browser alone.
- **Order notifications** (email / WhatsApp) — Edge Function.
- Admin **Orders, Customers, Reviews, Vouchers** screens — currently demo screens; wire to
  Supabase.
- Admin product list **search/filters** and **Export CSV** — buttons exist, not wired yet.
