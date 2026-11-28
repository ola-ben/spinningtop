# Delivery pricing (own prices, no courier API)

Status: **Prepped, not built**. Build only after the user says "go".
Source: `docs/Spinning_Top_Pricing_Spec_Supabase.pdf`. Read this md instead of the PDF.

**Correction from the user (2026-11-28):** shop deliveries have **no per-outlet pricing**. Ignore the PDF's outlet part, including the `outlets` and `delivery_prices` tables. **One price per area.**

## Rules kept from the spec
- The price depends on the **area** only.
- The area comes from browser GPS (`navigator.geolocation`, HTTPS only) by picking the **nearest area centre point**.
- The **area dropdown is always shown**, to override GPS or as the fallback when it's denied.
- If the nearest area is more than **15 km** away, show "outside our coverage".
- The server recalculates the price at order submit. Never trust a price from the browser.
- The owner edits areas and prices (Admin → Delivery).

## What already exists (don't rebuild)
- `supabase/delivery.sql` → `delivery_zones` (area, price, active, sort_order), with RLS. The orders table has `delivery_area` and `delivery_fee`.
- `place_order(... p_delivery_zone)` in `orders.sql` takes the fee from the table inside the database, which already meets "server recalculates".
- `src/lib/delivery.ts`, `DeliveryScreen.tsx` (admin) and `CheckoutView.tsx` (area dropdown).
- Keep the browser → Supabase + RLS approach. The PDF's PHP files (`sb.php`, `nearest.php`, `price.php`, `areas.php`) aren't needed.

## Build plan (on "go")
1. **SQL:** add `latitude` and `longitude` (nullable) to `delivery_zones`. This is the only database change, and `place_order` stays as it is.
2. **Checkout (delivery):** add a "Use my location" button. Work out the nearest zone client-side with haversine, over zones that have coordinates.
   - Within 15 km: select that zone in the dropdown.
   - Otherwise: show "outside our coverage".
   - Denied or failed: tell the customer to pick from the list.
   - The dropdown stays editable.
3. **Admin → Delivery:** add lat/lng fields per area, with a "Google Maps → right-click → copy" hint. An area without coordinates still shows in the dropdown but is skipped by GPS.
4. Lint and build. Don't zip.

## Needed from the client
- Each area with its **centre point (lat, lng)** and a price.
- Confirm the 15 km limit.
