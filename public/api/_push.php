<?php
// Spinning Top: Web Push notifications for the team (used by order-mail.php).
// Not a page — opening it directly does nothing.
// The PRIVATE key lives OUTSIDE public_html in order-mail-config.php as
// 'vapid_private_key'. Without it, pushes are simply skipped (emails still go).
// Standards: RFC 8291 (message encryption, aes128gcm) + RFC 8292 (VAPID).

if (basename($_SERVER['SCRIPT_FILENAME'] ?? '') === basename(__FILE__)) { http_response_code(404); exit; }

// Public values — also built into the website.
const PUSH_SUPABASE_URL = 'https://xdgafesqkaffewysgmeh.supabase.co';
const PUSH_SUPABASE_KEY = 'sb_publishable_l5cAiB7qUZWhekF4x5ccSQ_ppP1ZlsL';
const PUSH_VAPID_PUBLIC = 'BOMp0mlSc78TsHvpeTivAL0zg2vBQkWVn-D24BtwVRL4rQk4DuiF-iU5mWKqS9x8J34KRPlshTrLDfOsnd4P8mM';
const PUSH_CONTACT = 'mailto:admin@spinningtop.ng';

function push_b64u_enc($bin) { return rtrim(strtr(base64_encode($bin), '+/', '-_'), '='); }
function push_b64u_dec($txt) {
  $txt = strtr((string) $txt, '-_', '+/');
  return base64_decode($txt . str_repeat('=', (4 - strlen($txt) % 4) % 4));
}
function push_pem($der, $label) {
  return "-----BEGIN $label-----\n" . chunk_split(base64_encode($der), 64, "\n") . "-----END $label-----\n";
}

/** P-256 private key (raw d + raw public point) → PEM for openssl. */
function push_private_pem($d, $publicPoint) {
  $der = "\x30\x77\x02\x01\x01\x04\x20" . str_pad($d, 32, "\0", STR_PAD_LEFT)
       . "\xa0\x0a\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07"
       . "\xa1\x44\x03\x42\x00" . $publicPoint;
  return push_pem($der, 'EC PRIVATE KEY');
}
/** P-256 public point (65 bytes, 0x04|x|y) → PEM. */
function push_public_pem($publicPoint) {
  $der = "\x30\x59\x30\x13\x06\x07\x2a\x86\x48\xce\x3d\x02\x01\x06\x08\x2a\x86\x48\xce\x3d\x03\x01\x07\x03\x42\x00" . $publicPoint;
  return push_pem($der, 'PUBLIC KEY');
}
/** openssl's DER ECDSA signature → raw r|s (64 bytes) for a JWT. */
function push_der_to_raw($der) {
  $pos = 2; // SEQUENCE header (short form)
  $out = '';
  for ($i = 0; $i < 2; $i++) {
    $len = ord($der[$pos + 1]);
    $int = substr($der, $pos + 2, $len);
    $int = ltrim($int, "\0");
    $out .= str_pad($int, 32, "\0", STR_PAD_LEFT);
    $pos += 2 + $len;
  }
  return $out;
}

/** Signed VAPID header for one push service (e.g. https://fcm.googleapis.com). */
function push_vapid_header($config, $audience) {
  $header = push_b64u_enc(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
  $claims = push_b64u_enc(json_encode(['aud' => $audience, 'exp' => time() + 12 * 3600, 'sub' => PUSH_CONTACT]));
  $pem = push_private_pem(push_b64u_dec($config['vapid_private_key']), push_b64u_dec(PUSH_VAPID_PUBLIC));
  if (!openssl_sign("$header.$claims", $sig, $pem, OPENSSL_ALGO_SHA256)) return null;
  return 'vapid t=' . "$header.$claims." . push_b64u_enc(push_der_to_raw($sig)) . ', k=' . PUSH_VAPID_PUBLIC;
}

/** Encrypts the message for one browser (aes128gcm). Returns the request body or null. */
function push_encrypt($plaintext, $p256dhB64, $authB64) {
  $uaPublic = push_b64u_dec($p256dhB64);
  $authSecret = push_b64u_dec($authB64);
  if (strlen($uaPublic) !== 65 || strlen($authSecret) < 16) return null;

  $local = openssl_pkey_new(['private_key_type' => OPENSSL_KEYTYPE_EC, 'curve_name' => 'prime256v1']);
  if (!$local) return null;
  $ec = openssl_pkey_get_details($local)['ec'];
  $asPublic = "\x04" . str_pad($ec['x'], 32, "\0", STR_PAD_LEFT) . str_pad($ec['y'], 32, "\0", STR_PAD_LEFT);
  $shared = openssl_pkey_derive(openssl_pkey_get_public(push_public_pem($uaPublic)), $local, 32);
  if ($shared === false) return null;

  $ikm = hash_hkdf('sha256', $shared, 32, "WebPush: info\0" . $uaPublic . $asPublic, $authSecret);
  $salt = random_bytes(16);
  $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $salt);
  $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $salt);
  $cipher = openssl_encrypt($plaintext . "\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);
  if ($cipher === false) return null;
  return $salt . pack('N', 4096) . chr(65) . $asPublic . $cipher . $tag;
}

function push_rpc($fn, $args) {
  $ch = curl_init(PUSH_SUPABASE_URL . '/rest/v1/rpc/' . $fn);
  curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 15,
    CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'apikey: ' . PUSH_SUPABASE_KEY],
    CURLOPT_POSTFIELDS => json_encode($args),
  ]);
  $raw = curl_exec($ch);
  $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return $code < 300 ? json_decode((string) $raw, true) : null;
}

/**
 * Sends a notification to every team device allowed to see orders & bookings.
 * $url is the admin page to open when it's tapped. Never throws.
 * Every problem is written to error_log (lines start with "push:"); with
 * $report set, the steps are also collected there (used by push-test.php).
 */
function push_notify_team($config, $title, $body, $url, $tag, &$report = null) {
  $say = function ($msg, $isError = true) use (&$report) {
    if (is_array($report)) $report[] = ($isError ? 'PROBLEM: ' : 'ok: ') . $msg;
    if ($isError) error_log('push: ' . $msg);
  };
  try {
    if (empty($config['vapid_private_key'])) { $say("'vapid_private_key' is missing from order-mail-config.php"); return; }
    if (strlen(push_b64u_dec($config['vapid_private_key'])) !== 32) { $say("'vapid_private_key' in order-mail-config.php looks wrong (not a 43-character key)"); return; }
    $say('vapid_private_key found', false);
    if (!function_exists('openssl_pkey_derive') || !function_exists('hash_hkdf')) { $say('PHP ' . PHP_VERSION . ' is too old — choose PHP 7.4 or newer in cPanel → Select PHP Version'); return; }
    $say('PHP ' . PHP_VERSION . ' with OpenSSL ' . OPENSSL_VERSION_TEXT, false);
    $targets = push_rpc('push_targets', ['p_secret' => $config['secret']]);
    if (!is_array($targets)) { $say('could not read the device list from Supabase (is push.sql run? does the secret match?)'); return; }
    if (!$targets) { $say('no devices have notifications turned on'); return; }
    $say(count($targets) . ' device(s) to notify', false);
    $payload = json_encode(['title' => $title, 'body' => $body, 'url' => $url, 'tag' => $tag]);
    $headers = [];
    foreach ($targets as $t) {
      $endpoint = (string) ($t['endpoint'] ?? '');
      $p = parse_url($endpoint);
      if (empty($p['scheme']) || empty($p['host'])) continue;
      $audience = $p['scheme'] . '://' . $p['host'];
      if (!isset($headers[$audience])) {
        $headers[$audience] = push_vapid_header($config, $audience);
        if (!$headers[$audience]) { $say('could not sign with the vapid key: ' . (openssl_error_string() ?: 'unknown openssl error')); continue; }
      }
      if (!$headers[$audience]) continue;
      $bodyBytes = push_encrypt($payload, $t['p256dh'] ?? '', $t['auth'] ?? '');
      if ($bodyBytes === null) { $say('could not encrypt the message: ' . (openssl_error_string() ?: 'unknown openssl error')); continue; }
      $ch = curl_init($endpoint);
      curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true, CURLOPT_POST => true, CURLOPT_TIMEOUT => 10,
        CURLOPT_HTTPHEADER => [
          'Authorization: ' . $headers[$audience],
          'Content-Encoding: aes128gcm',
          'Content-Type: application/octet-stream',
          'TTL: 86400',
          'Urgency: high',
        ],
        CURLOPT_POSTFIELDS => $bodyBytes,
      ]);
      $answer = (string) curl_exec($ch);
      $code = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
      $curlErr = curl_error($ch);
      curl_close($ch);
      // 404/410 = the device turned notifications off or the browser was reset.
      if ($code === 404 || $code === 410) { push_rpc('push_forget', ['p_secret' => $config['secret'], 'p_endpoint' => $endpoint]); $say($p['host'] . ' says this device is gone — removed it', false); }
      elseif ($code >= 200 && $code < 300) $say($p['host'] . ' accepted the notification (' . $code . ')', false);
      else $say($p['host'] . ' answered ' . $code . ' ' . substr($curlErr ?: $answer, 0, 200));
    }
  } catch (Throwable $e) {
    $say($e->getMessage());
  }
}
