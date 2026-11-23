<?php
// Spinning Top: start and check Paystack payments.
//   POST {"action":"init","order_id":"ST-1001","return_url":"https://www.spinningtop.ng/account/orders/?placed=ST-1001"}
//     → {"authorization_url": "..."}  (send the customer there to pay)
//   POST {"action":"verify","reference":"ST-1001-..."}
//     → {"paid": true|false, "message": "..."}
// The amount always comes from the database (payments.sql), never from the browser.

require __DIR__ . '/_paystack.php';

st_cors();
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') st_out(405, ['ok' => false, 'message' => 'POST only']);

$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) st_out(400, ['ok' => false, 'message' => 'Bad request']);
$action = $in['action'] ?? '';

if ($action === 'init') {
  $orderId = (string) ($in['order_id'] ?? '');
  if (!preg_match('/^ST-\d{1,10}$/', $orderId)) st_out(400, ['ok' => false, 'message' => 'Unknown order.']);

  // Only send customers back to our own site.
  $returnUrl = (string) ($in['return_url'] ?? '');
  $parts = parse_url($returnUrl);
  $origin = isset($parts['scheme'], $parts['host'])
    ? $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '')
    : '';
  if (!in_array($origin, ST_ALLOWED_ORIGINS, true)) $returnUrl = 'https://www.spinningtop.ng/account/orders/?placed=' . rawurlencode($orderId);

  $o = st_rpc('payment_order_details', ['p_order_id' => $orderId]);
  if (!$o) st_out(404, ['ok' => false, 'message' => 'Order not found.']);
  if (($o['payment_status'] ?? '') === 'paid') st_out(200, ['ok' => true, 'paid' => true]);
  if (($o['status'] ?? '') === 'Cancelled') st_out(409, ['ok' => false, 'message' => 'This order was cancelled. Please place a new order.']);
  $email = filter_var($o['email'] ?? '', FILTER_VALIDATE_EMAIL);
  $total = (int) ($o['total'] ?? 0);
  if (!$email || $total <= 0) st_out(400, ['ok' => false, 'message' => 'This order cannot be paid online. Please contact us.']);

  $reference = $orderId . '-' . time() . '-' . bin2hex(random_bytes(3));
  [$code, $res] = st_paystack('POST', '/transaction/initialize', [
    'email'        => $email,
    'amount'       => $total * 100, // kobo
    'currency'     => 'NGN',
    'reference'    => $reference,
    'callback_url' => $returnUrl,
    'channels'     => ['card', 'bank_transfer', 'ussd', 'bank'],
    'metadata'     => [
      'order_id'      => $orderId,
      'cancel_action' => $returnUrl,
      'custom_fields' => [
        ['display_name' => 'Order', 'variable_name' => 'order_id', 'value' => $orderId],
        ['display_name' => 'Customer', 'variable_name' => 'customer_name', 'value' => (string) ($o['customer_name'] ?? '')],
      ],
    ],
  ]);
  if ($code !== 200 || empty($res['status']) || empty($res['data']['authorization_url'])) {
    error_log('paystack init ' . $orderId . ': ' . $code . ' ' . json_encode($res));
    st_out(502, ['ok' => false, 'message' => 'We could not open the payment page. Please try again.']);
  }
  st_out(200, ['ok' => true, 'authorization_url' => $res['data']['authorization_url'], 'reference' => $reference]);
}

if ($action === 'verify') {
  $result = st_confirm_reference((string) ($in['reference'] ?? ''));
  st_out(200, ['ok' => true] + $result);
}

st_out(400, ['ok' => false, 'message' => 'Unknown action']);
