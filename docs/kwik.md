# Kwik Delivery — integration notes

Status: **Not started** — checkout shows Kwik as "coming soon". Waiting for Kwik account + API details.
Source: `apikwik.apib` (Kwik API Blueprint).

## API summary
- Staging host: `https://staging-api-test.kwik.delivery/` (ask Kwik for the live host).
- JSON responses: `{ message, status, data }`. Codes: 100 PARAMETER_MISSING, 101 INVALID_KEY, 200 OK, 201 SHOW_ERROR_MESSAGE, 404 ERROR_IN_EXECUTION.
- Every call carries `domain_name` (client panel domain) + `access_token` (+ `vendor_id`).
- **No webhooks** — status must be polled.

| Call | Use |
|---|---|
| `POST /vendor_login` | `domain_name`, `email`, `password`, `api_login: 1` → access_token, vendor_id, user_id, form_id |
| `GET /getVehicle?access_token&is_vendor&size` | Vehicle ids (pick the bike) |
| `POST /send_payment_for_task` | Step 1 price: pickups[] + deliveries[] (address, name, phone, email, latitude, longitude), vehicle_id, payment_method, has_pickup 1, has_delivery 1, layout_type 0, is_multiple_tasks 1, form_id, user_id, custom_field_template → per_task_cost, total_service_charge, insurance_amount, total_no_of_tasks, etc. |
| `POST /get_bill_breakdown` | Step 2 final estimate using step-1 values (+ SURGE_PRICING, SURGE_TYPE) |
| `POST /v2/create_task_via_vendor` | Book (pickup + delivery). Pass step-1/2 values (amount = per_task_cost, total_service_charge, surge_cost…), `payment_method: 524288` = End-of-Month Billing (wallet used first if funded), `auto_assignment: 1`, `timezone: -60` (Lagos, UTC+1), `is_task_otp_required` 0/1 |
| `POST /cancel_vendor_task` | `job_id` (comma list ok), `job_status: 9` |
| `GET /view_task_by_relationship_id?access_token&unique_order_id` | Job details |
| `GET /getJobStatus?unique_order_id&customer_id` | Poll status |
| `GET /get_order_history_with_pagination` | History list |

Payment method codes in pricing: 8 cash on pickup, 32 card, 262144 cash on delivery, 131072 Paga; create uses 524288 (EOMB).

## Job statuses (`job_status`)
0 UPCOMING (assigned) · 1 STARTED · 2 ENDED (delivered) · 3 FAILED · 4 ARRIVED · 6 UNASSIGNED · 7 ACCEPTED · 8 DECLINE · 9 CANCEL · 10 DELETED

## Build plan (when details arrive)
1. Config: `kwik_domain`, `kwik_email`, `kwik_password`, `kwik_base_url` (+ vendor_id/user_id/form_id from login). Cache the access token.
2. Zones + outlets need lat/lng (same as Holt).
3. Checkout: PHP `api/kwik.php?action=estimate` (send_payment_for_task → get_bill_breakdown) → show fee.
4. After Paystack payment → create task, save job id / unique_order_id on the order.
5. Poll every 10–15 min (cron) with getJobStatus → update order, email customer.
6. Admin cancel → cancel_vendor_task.

## Needed from Kwik
Ibadan coverage confirmed (main risk — Kwik is Lagos-first); corporate account with End-of-Month Billing or wallet; domain_name, API email/password, vendor_id, user_id, form_id; custom field template names; team_id (if used); bike vehicle id; staging access, then live host.

## Holt vs Kwik
Holt: webhooks (instant updates), one-step estimate → preferred. Kwik: polling (updates delayed), two-step pricing. Both can be offered at checkout.
