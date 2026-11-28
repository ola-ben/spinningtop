# Holt Logistics — delivery integration notes

Status: **ON HOLD** — waiting for Holt's keys and answers. Nothing built yet.
Today the site uses fixed area prices (Admin → Delivery, ₦500 seeded) and staff book Holt by hand.
Source: Holt_Logistics_Business_API_Integration_Guide.pdf (v1.0, 22 Nov 2026).

## API summary
- Base URL: `https://api.holtlogistics.ng` · prefix `/api/v1/business` (sandbox host: ask Holt)
- Auth header: `X-API-Key: sk_…` (or `Authorization: Bearer …`). JSON in/out.
- Rate limit: 1,000 requests/hour per key (429 + `X-Rate-Limit-Retry-After-Seconds`).
- Envelope: `{ timestamp, success, data }`; errors `{ success:false, status, code, message, details }`.

| Call | Use |
|---|---|
| `GET /business/health` | Check key → `data.tenant_id` |
| `POST /business/shipments/estimate` | Price before booking: `originLat/Lng`, `destLat/Lng` (or `distanceKm`), `orderType`, `vehicleType` → `data.deliveryFee`, `totalFee`, `serviceable`, `serviceabilityReason` |
| `POST /business/shipments` | Book. Required: `orderType`, `senderName`, `senderAddress`, `senderContact`, + `destinations[]` (`recipientAddress`, `recipientContact`, `recipientName`, `lat`, `lng`, `instruction`). Send `idempotencyKey` = our order id, `paymentMethod`, `vehicleType`, `senderLat/Lng`. → 201 `data.id`, `orderNumber`, `trackingCode`, `status`, `deliveryFee` |
| `GET /business/shipments/{id}` | Current state |
| `GET /business/shipments?startDate&endDate&size` | Reconcile list |
| `PUT /business/shipments/{id}/cancel?reason=&reasonCode=` | Cancel before terminal |
| `GET /api/v1/tracking/{trackingCode}` | Public tracking (no key) |

- Phone formats: `+234…`, `234…`, `0…`. `scheduledPickupAt` must be future, Africa/Lagos time.
- We cannot send a fee — Holt prices it. If auto pricing is off → `PENDING_PRICING`.
- `paymentMethod`: CASH, ONLINE_PAYMENT, WALLET, BANK_TRANSFER (POS staff-only). We need the one that bills the business.

## Statuses
PENDING → ASSIGNED → PICKED_UP → IN_TRANSIT → DELIVERED.
Others: PENDING_PRICING, DELIVERY_ATTEMPT_FAILED (retry), terminal: DELIVERED, DELIVERED_TO_PARK, FAILED, CANCELLED.

## Webhooks
- One URL per key, tenant-wide events (ignore unknown ids). No redirects followed → use `https://www.spinningtop.ng/api/holt-webhook.php`.
- Headers: `X-FleetRails-Event`, `X-FleetRails-Delivery-Id` (dedupe), `X-FleetRails-Signature: sha256=<hex HMAC-SHA256(secret, raw body)>`.
- Events: order.created, order.status_changed, order.assigned, order.picked_up, order.in_transit, order.delivered, order.delivery_attempt_failed, order.failed, order.cancelled, order.payment_confirmed.
- Reply 2xx fast. Retries: 5 attempts (~1m, 5m, 15m, 1h). Never let a late event overwrite a terminal status.

## Build plan (when keys arrive)
1. Config (`/home/spinning/order-mail-config.php`): `holt_api_key`, `holt_webhook_secret`, `holt_base_url`.
2. Each delivery zone (Admin → Delivery) gets lat/lng; outlets get lat/lng.
3. Checkout: PHP `api/holt.php?action=estimate` → show real fee (fallback to zone price if Holt fails). Fee saved on the order.
4. After Paystack confirms payment → PHP books shipment (idempotencyKey = order id), saves `holt_shipment_id`, `tracking_code`, status on the order.
5. `api/holt-webhook.php`: verify HMAC, dedupe, update order delivery status, email customer.
6. Admin cancel → Holt cancel. Customer My Orders shows tracking link.
7. Sandbox test first, then live key.

## Still needed from Holt
Sandbox URL + key + webhook secret; live key + secret; webhook URL registered + test event; auto pricing ON; Ibadan coverage; payment method that bills us; shipment/package type ids (if any); AUTO/MANUAL dispatch; answers: estimate vs final price, billing, pickup times, cancel fees, failed-delivery fees, GPS vs area point, reason codes, support contact.
Support: holtlogistics85@gmail.com · portal https://app.holtlogistics.ng
