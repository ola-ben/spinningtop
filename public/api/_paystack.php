<?php
// Spinning Top: shared Paystack helpers for paystack.php and paystack-webhook.php.
// Not a page — opening it directly does nothing.
// The Paystack SECRET key lives OUTSIDE public_html in
// /home/<cpanel-user>/order-mail-config.php as 'paystack_secret_key'.

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) { http_response_code(404); exit; }

// Public values (also built into the website) — safe to keep here.
const ST_SUPABASE_URL = 'https://xdgafesqkaffewysgmeh.supabase.co';
const ST_SUPABASE_KEY = 'sb_publishable_l5cAiB7qUZWhekF4x5ccSQ_ppP1ZlsL';
const ST_ALLOWED_ORIGINS = ['https://www.spinningtop.ng', 'https://spinningtop.ng', 'http://localhost:3000'];

function st_out($code, $data) {
  http_response_code($code);
  header('Content-Type: application/json');
  echo json_encode($data);
  exit;
}

function st_config() {
  static $config = null;
  if ($config === null) {
    $file = dirname(__DIR__, 2) . '/order-mail-config.php';
    if (!is_file($file)) st_out(500, ['ok' => false, 'message' => 'Payment settings are missing on the server.']);
    $config = require $file;
    if (empty($config['paystack_secret_key']) || empty($config['secret'])) {
      st_out(500, ['ok' => false, 'message' => 'Payment settings are missing on the server.']);
    }
  }
  return $config;
}

/** Lets the website (and localhost while testing) call these endpoints. */
function st_cors() {
  $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
  if (in_array($origin, ST_ALLOWED_ORIGINS, true)) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Vary: Origin');
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
  }
}

/** JSON request; returns [httpCode, decodedBody|null]. */
function st_http($method, $url, $headers, $body = null) {
  $ch = curl_init($url);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $method,
    CURLOPT_HTTPHEADER     => $headers,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_TIMEOUT        => 30,
  ]);
  if ($body !== null) curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
  $raw = curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  if ($raw === false) error_log('paystack http: ' . curl_error($ch));
  curl_close($ch);
  return [$code, $raw === false ? null : json_decode($raw, true)];
}

/** Calls a Supabase database function (payments.sql) with the shared secret. */
function st_rpc($fn, $args) {
  $args['p_secret'] = st_config()['secret'];
  [$code, $data] = st_http('POST', ST_SUPABASE_URL . '/rest/v1/rpc/' . $fn, [
    'Content-Type: application/json',
    'apikey: ' . ST_SUPABASE_KEY,
  ], $args);
  if ($code >= 300) {
    error_log('paystack rpc ' . $fn . ' failed: ' . $code . ' ' . json_encode($data));
    st_out(502, ['ok' => false, 'message' => 'Could not reach the order system. Please try again.']);
  }
  return $data;
}

function st_paystack($method, $path, $body = null) {
  return st_http($method, 'https://api.paystack.co' . $path, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . st_config()['paystack_secret_key'],
  ], $body);
}

/**
 * Asks Paystack whether a payment succeeded and, if so, marks the order paid.
 * Returns ['paid' => bool, 'order_id' => ..., 'message' => ...].
 */
function st_confirm_reference($reference) {
  if (!preg_match('/^ST-\d{1,10}-\d{9,12}-[a-f0-9]{6}$/', (string) $reference)) {
    return ['paid' => false, 'message' => 'Unknown payment reference.'];
  }
  [$code, $res] = st_paystack('GET', '/transaction/verify/' . rawurlencode($reference));
  if ($code !== 200 || empty($res['status']) || empty($res['data'])) {
    return ['paid' => false, 'message' => 'We could not check this payment yet. Please refresh in a minute.'];
  }
  $t = $res['data'];
  if (($t['status'] ?? '') !== 'success') {
    return ['paid' => false, 'message' => 'The payment was not completed.'];
  }
  if (($t['currency'] ?? '') !== 'NGN') return ['paid' => false, 'message' => 'Unexpected currency.'];
  $orderId = $t['metadata']['order_id'] ?? '';
  if (!preg_match('/^ST-\d{1,10}$/', (string) $orderId)) {
    preg_match('/^(ST-\d{1,10})-/', $reference, $m);
    $orderId = $m[1] ?? '';
  }
  $result = st_rpc('payment_confirm', [
    'p_order_id'    => $orderId,
    'p_reference'   => $reference,
    'p_amount_kobo' => (int) ($t['amount'] ?? 0),
  ]);
  if (empty($result['ok'])) {
    error_log('paystack confirm ' . $orderId . ': ' . json_encode($result));
    return ['paid' => false, 'order_id' => $orderId, 'message' => 'Payment received but it does not match the order. Our team will contact you.'];
  }
  return ['paid' => true, 'order_id' => $orderId, 'status' => $result['status'] ?? '', 'message' => 'Payment confirmed.'];
}
