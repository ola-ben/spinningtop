# Spinning Top — Build Roadmap

Plan for finishing the site on **cPanel (no Node.js) + Supabase**.
Each phase stands on its own: finish, test, upload, then start the next.

Times are estimates: **Claude** = build + test time, **You** = your setup steps.

| Phase | What | Claude | You | Status |
|---|---|---|---|---|
| 0 | Products, services, admin, shop switch | — | — | ✅ Done |
| 1 | Customer accounts | 1–1½ h | ~10 min | ✅ Done (6-digit email code sign-in) |
| 2 | Automatic account emails | ~30 min | 15–20 min | ✅ Done (from noreply@spinningtop.ng) |
| 3 | Orders + order tracking | 1½–2 h | ~10 min | 🟡 Built — run `supabase/orders.sql`, then test |
| 4 | Paystack payments | 1–1½ h | ~20 min | ⬜ |
| 5 | Order emails & notifications | 30–60 min | ~10 min | ⬜ |
| 6 | Remaining admin screens | 1½–2 h | ~5 min | ⬜ |
| 7 | Launch checklist | ~30 min | ~30 min | ⬜ |

**Total remaining:** about 6½–9 hours of build time, about 1½–2 hours of your time.

---

## Phase 0 — Products, services & admin ✅ Done

- Products, services, photos and the shop on/off switch stored in Supabase.
- `/admin` with Supabase sign-in (`admin@spinningtop.ng`); only admins can change things.
- Static site for cPanel; changes in `/admin` show immediately, no re-upload.
- Details: see `SITE-GUIDE.md`.

---

## Phase 1 — Customer accounts

**Claude builds**
- Sign up and sign in with a **6-digit code emailed to the customer** (no passwords), log out (Supabase Auth — same system as admin).
- `profiles` table: name, phone, default delivery address, newsletter choice (one address per customer for now).
- Rules: each customer sees and edits **only their own** data. Customers are never admins.
- Connect the existing `/account` pages (My Account, Addresses, Account management,
  Close account, Newsletter) to real data instead of demo data.
- Orders / Pending reviews / Vouchers pages stay as they are until Phases 3 and 6.
- New SQL file: `supabase/customers.sql`.

**You do**
- Run `supabase/customers.sql` in the SQL Editor.
- Supabase → Authentication → Sign In / Providers: make sure **"Allow new users to sign up"** is **on**.
- Do one real test sign-up (Claude can't create accounts on the live project).

**Done when**
- A new customer can sign up, log in, edit their profile and addresses, and log out.
- A customer can't see another customer's data, and can't reach `/admin`.

---

## Phase 2 — Automatic account emails

Supabase sends these automatically once set up:
- **Account code** (new customers, 6 digits)
- **Sign-in code** (every sign-in, 6 digits — Supabase's "Magic link" template)
- **Email address changed**
- **Reset password** (admin only)

**Claude builds**
- Branded email templates (Spinning Top logo, colours, wording) to paste into Supabase.
- Pages the email links land on (confirm done, set new password).

**You do**
1. cPanel → **Email Accounts** → create `noreply@spinningtop.ng` (note the password).
2. cPanel → that account → **Connect Devices** → note the **SMTP server** and **port** (usually 465).
3. Supabase → **Authentication → Emails → SMTP Settings** → enable custom SMTP:
   host, port, username `noreply@spinningtop.ng`, password, sender name "Spinning Top".
4. Supabase → **Authentication → Emails → Templates** → paste the templates Claude gives you.
5. Supabase → **Authentication → URL Configuration** → Site URL `https://www.spinningtop.ng`.

> Why SMTP: Supabase's built-in email sends only a few emails per hour — fine for testing,
> not for real customers. cPanel email is free and has no such low limit.

**Done when**
- Signing up sends a branded confirmation email from `noreply@spinningtop.ng`.
- "Forgot password" sends a working reset link.

---

## Phase 3 — Orders + order tracking

**Claude builds**
- Tables: `orders`, `order_items`, `order_status_history` (Received → Processing →
  Ready for pickup → Delivered / Cancelled).
- Checkout from the cart creates an order (logged-in customers; guests optional).
- `/account/orders`: customer's own orders with status timeline.
- Admin **Orders** screen wired to real orders: view, change status (adds to history).
- Stock: optional automatic "out of stock" when quantity reaches zero.
- WhatsApp ordering stays as a fallback.
- New SQL file: `supabase/orders.sql`.

**You do**
- Run `supabase/orders.sql`.
- Place one test order and move it through the statuses in `/admin`.

**Done when**
- A customer places an order, sees it in their account, and sees status changes made in `/admin`.

---

## Phase 4 — Paystack payments

**Claude builds**
- Paystack popup at checkout (uses the **public** key only, in the browser).
- **Supabase Edge Function** `verify-payment`: checks the payment with Paystack using the
  **secret** key, then marks the order **Paid**. The browser alone can never mark an order paid.
- Edge Function `paystack-webhook`: catches payments confirmed later (closed tab, bank delay).
- Admin sees payment status and Paystack reference on each order.

**You do**
1. Paystack dashboard → **Settings → API Keys** → copy **public** and **secret** keys
   (start with test keys `pk_test_` / `sk_test_`).
2. Give Claude the **public** key only (it's safe in the site).
3. Supabase → **Edge Functions → Secrets** → add `PAYSTACK_SECRET_KEY` yourself
   (never paste the secret key in chat or code).
4. Paystack → **Settings → API Keys & Webhooks** → webhook URL (Claude gives you the exact URL).
5. After testing, switch to live keys.

**Done when**
- A test card payment marks the order Paid; a failed/cancelled payment does not.

---

## Phase 5 — Order emails & notifications (customer status emails BUILT)

**Claude builds** (Supabase Edge Function + your cPanel SMTP from Phase 2)
- To the customer: **Order received**, **Payment confirmed**, **Ready for pickup / Out for
  delivery**, **Delivered**, **Cancelled**.
- To the business: **New order** alert (email; WhatsApp link in the email).
- Sent automatically when an order's status changes.
- Built: `supabase/order-emails.sql` (trigger) + `public/api/order-mail.php` (sender) +
  `supabase/order-mail-config.php` (goes in cPanel home folder, holds the mailbox password).
  Still to do: payment-confirmed email (Phase 4) and the business "new order" alert.

**You do**
- Add the SMTP details as Edge Function secrets (same as Phase 2).
- Place a test order and confirm each email arrives.

**Done when**
- Every status change sends the right email to the customer, and new orders notify the business.

---

## Phase 6 — Remaining admin screens

**Claude builds** (replace demo data with real Supabase data)
- ~~**Customers** — list, search~~ ✅ done early (`/admin/customers`, sidebar badge for new sign-ups). Still to add: a customer's orders (after Phase 3).
- **Reviews** — customers review delivered products; admin publishes/hides.
- **Vouchers** — create codes, apply at checkout.
- **Dashboard** — real sales, orders and customer numbers.
- **Products list** — working search, filters, **Export CSV**.
- **Team** — add/remove admins from the screen (instead of SQL).
- Academy / Messages — scope to agree before starting.

**You do**
- Run the SQL file(s) Claude provides; quick click-through test.

---

## Phase 7 — Launch checklist

- [ ] Paystack switched to **live** keys; one real low-value payment tested.
- [ ] Strong admin password; only the right people in `admins`.
- [ ] Supabase **Authentication → URL Configuration** set to the live domain.
- [ ] Test products/orders/customers deleted.
- [ ] Privacy Policy & Terms updated for accounts, payments and emails.
- [ ] Shop switched **on**; `/shop` pages set to appear in Google (currently hidden while in preview).
- [ ] Supabase data exported once as a backup (free plan has no daily backups).
- [ ] Final `npm run package:static` → upload → extract → click through every page on a phone.

---

## How to start each phase

Tell Claude: **"start phase N"** and point it at this file and `SITE-GUIDE.md`.
After each phase: test → `npm run package:static` → upload → tick the Status column above.
