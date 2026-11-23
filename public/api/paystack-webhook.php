<?php
// Spinning Top: Paystack webhook (back-up confirmation).
// Paste this URL in Paystack → Settings → API Keys & Webhooks → Webhook URL:
//   https://www.spinningtop.ng/api/paystack-webhook.php
// Paystack signs every call with the secret key (HMAC-SHA512 of the raw body);
// unsigned or wrongly signed calls are rejected. The payment is then checked
// again with Paystack before the order is marked paid.

require __DIR__ . '/_paystack.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') st_out(405, ['ok' => false]);

$raw = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_PAYSTACK_SIGNATURE'] ?? '';
$expected = hash_hmac('sha512', $raw, st_config()['paystack_secret_key']);
if ($signature === '' || !hash_equals($expected, $signature)) st_out(401, ['ok' => false]);

$event = json_decode($raw, true);
if (($event['event'] ?? '') === 'charge.success') {
  $result = st_confirm_reference((string) ($event['data']['reference'] ?? ''));
  if (empty($result['paid'])) error_log('paystack webhook: ' . json_encode($result));
}
st_out(200, ['ok' => true]);
