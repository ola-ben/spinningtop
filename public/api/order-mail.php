<?php
// Spinning Top: order status emails (Phase 5).
// Supabase calls this when an order is placed or its status changes.
// Settings (SMTP password, shared secret) live OUTSIDE public_html in
// /home/<cpanel-user>/order-mail-config.php, never in the site files.

header('Content-Type: application/json');

function done($code, $msg) {
  http_response_code($code);
  echo json_encode(['ok' => $code === 200, 'message' => $msg]);
  exit;
}

$configFile = dirname(__DIR__, 2) . '/order-mail-config.php';
if (!is_file($configFile)) done(500, 'Config missing');
$config = require $configFile;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') done(405, 'POST only');
$given = $_SERVER['HTTP_X_ORDER_MAIL_SECRET'] ?? '';
if (!hash_equals((string) $config['secret'], (string) $given)) done(403, 'Forbidden');

$o = json_decode(file_get_contents('php://input'), true);
if (!is_array($o) || empty($o['id']) || empty($o['status'])) done(400, 'Bad payload');
$to = filter_var($o['email'] ?? '', FILTER_VALIDATE_EMAIL);
if (!$to) done(400, 'No valid email');

$site = 'https://www.spinningtop.ng';
$h = function ($s) { return htmlspecialchars((string) $s, ENT_QUOTES, 'UTF-8'); };
$naira = function ($n) { return '&#8358;' . number_format((int) $n); };
$name = trim(explode(' ', trim($o['customer_name'] ?? ''))[0] ?? '');
$hello = $name !== '' ? 'Hi ' . $h($name) . ',' : 'Hello,';
$id = $h($o['id']);

// ── Service bookings (Phase E) ─────────────────────────────────────────────
if (($o['type'] ?? '') === 'booking') {
  $logi = ['pickup_delivery' => 'Pickup & delivery', 'drop_off' => 'Drop-off at our location', 'either' => 'Either is fine'];
  $logistics = $logi[$o['logistics'] ?? ''] ?? '';
  if (($o['logistics'] ?? '') === 'drop_off' && trim($o['outlet'] ?? '') !== '') $logistics = 'Drop-off at ' . trim($o['outlet']);
  $services = array_map('strval', (array) ($o['services'] ?? []));
  $servicesHtml = '<ul style="margin:0;padding-left:18px;">' .
    implode('', array_map(function ($s) use ($h) { return '<li style="margin:2px 0;">' . $h($s) . '</li>'; }, $services)) . '</ul>';

  $bMessages = [
    'New' => ["We've received your booking request $id",
      "Thanks for choosing Spinning Top. We've received your booking request <b>$id</b>. Our team will contact you shortly by phone or WhatsApp to confirm the details and give you a quote."],
    'Contacted' => ["We're on your booking $id",
      "We've reached out about your booking <b>$id</b>. If you missed our call or message, just reply to us on WhatsApp or call us."],
    'Quoted' => ["Your quote for booking $id",
      "We've prepared a quote for your booking <b>$id</b>. See the details below, and let us know on WhatsApp or by phone if you'd like to go ahead."],
    'Scheduled' => ["Your booking $id is scheduled",
      "Your booking <b>$id</b> has been scheduled. See the details below."],
    'In progress' => ["We're working on your booking $id",
      "Good news: work on your booking <b>$id</b> has started."],
    'Completed' => ["Your booking $id is complete",
      "Your booking <b>$id</b> has been completed. Thank you for choosing Spinning Top. We hope you're happy with the result!"],
    'Cancelled' => ["Your booking $id has been cancelled",
      "Your booking <b>$id</b> has been cancelled. If you didn't expect this or have any questions, just reply to our team on WhatsApp or call us."],
  ];
  if (!isset($bMessages[$o['status']])) done(200, 'No email for this status');
  [$bSubject, $bIntro] = $bMessages[$o['status']];

  $note = trim($o['note'] ?? '');
  $bNote = in_array($note, ['Booking request sent from the website', ''], true) ? '' :
    '<p style="margin:0 0 16px;padding:12px 14px;background:#f6f4ef;border-radius:8px;font-size:14px;color:#333;"><b>Note from us:</b> ' . nl2br($h($note)) . '</p>';

  $row = function ($k, $v) {
    return '<tr><td style="padding:6px 12px 6px 0;font-size:14px;color:#777;white-space:nowrap;vertical-align:top;">' . $k .
      '</td><td style="padding:6px 0;font-size:14px;color:#111;">' . $v . '</td></tr>';
  };
  $summary = '<table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;border-top:1px solid #eee;">' .
    $row('Services', $servicesHtml) .
    $row('Pickup / drop-off', $h($logistics)) .
    $row('Area', $h($o['area'] ?? '')) . '</table>';

  $customerHtml = mail_shell($site, $h($bSubject), 'Booking status: <b style="color:#111;">' . $h($o['status']) . '</b>',
    '<p style="margin:0 0 12px;font-size:15px;color:#333;">' . $hello . '</p>' .
    '<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#333;">' . $bIntro . '</p>' . $bNote . $summary,
    [[$site . '/services/', 'View our services', '#111']], true);
  $customerText = strip_tags($bIntro) . ($note && $bNote ? "\n\nNote from us: $note" : '') . "\n\nServices: " . implode(', ', $services) . "\n\nSpinning Top";

  try {
    smtp_send($config, $to, html_entity_decode($bSubject), $customerHtml, html_entity_decode($customerText));
  } catch (Exception $e) {
    error_log('order-mail booking: ' . $e->getMessage());
    done(502, 'Send failed');
  }

  // New booking alert to the business.
  if ($o['status'] === 'New' && !empty($config['admin_email'])) {
    $digits = preg_replace('/\D/', '', $o['phone'] ?? '');
    if (strpos($digits, '0') === 0) $digits = '234' . substr($digits, 1);
    $custNote = trim($o['customer_note'] ?? '');
    $photos = (int) ($o['photo_count'] ?? 0);
    $details = '<table cellpadding="0" cellspacing="0" style="margin:0 0 20px;width:100%;">' .
      $row('Customer', $h($o['customer_name'] ?: '—')) .
      $row('Phone', $h($o['phone'] ?: '—')) .
      $row('Email', $h($o['email'])) .
      $row('Area', $h($o['area'] ?? '')) .
      $row('Services', $servicesHtml) .
      $row('Pickup / drop-off', $h($logistics)) .
      ($custNote !== '' ? $row('Customer note', nl2br($h($custNote))) : '') .
      $row('Photos', $photos ? "$photos attached (view in admin)" : 'None') . '</table>';
    $buttons = [[$site . '/admin/orders/?view=bookings', 'Open in admin', '#111']];
    if ($digits !== '') $buttons[] = ['https://wa.me/' . $digits, 'WhatsApp customer', '#25D366'];
    $aHtml = mail_shell($site, 'New booking request ' . $id, 'Sent from the booking form. Contact the customer to confirm and quote.', $details, $buttons, false);
    $aText = "New booking request {$o['id']}\nCustomer: {$o['customer_name']}\nPhone: {$o['phone']}\nEmail: {$o['email']}\nArea: {$o['area']}\n" .
      'Services: ' . implode(', ', $services) . "\n\nOpen in admin: $site/admin/orders/?view=bookings";
    foreach (array_filter(array_map('trim', explode(',', $config['admin_email']))) as $admin) {
      if (!filter_var($admin, FILTER_VALIDATE_EMAIL)) continue;
      try { smtp_send($config, $admin, 'New booking request ' . $o['id'], $aHtml, $aText); }
      catch (Exception $e) { error_log('order-mail booking admin: ' . $e->getMessage()); }
    }
  }
  done(200, 'Sent');
}
// ── Product orders ─────────────────────────────────────────────────────────

$pickup = ($o['fulfilment'] ?? '') === 'pickup';
$where = $pickup
  ? 'our ' . $h($o['outlet'] ?: 'Spinning Top') . ' outlet'
  : $h($o['delivery_address'] ?: 'your address');

$messages = [
  'Received' => ["We've received your order $id",
    "Thanks for shopping with Spinning Top. We've received your order <b>$id</b> and will confirm it shortly."],
  'Processing' => ["Your order $id is being prepared",
    "Good news: we've confirmed your order <b>$id</b> and our team is preparing it now."],
  'Ready for pickup' => ["Your order $id is ready for pickup",
    "Your order <b>$id</b> is ready. You can collect it at $where. Please bring your order number."],
  'Out for delivery' => ["Your order $id is on its way",
    "Your order <b>$id</b> is out for delivery to $where. Please keep your phone close; our rider may call you."],
  'Delivered' => ["Your order $id has been delivered",
    "Your order <b>$id</b> has been completed. Thank you for choosing Spinning Top. We hope you enjoy it!"],
  'Cancelled' => ["Your order $id has been cancelled",
    "Your order <b>$id</b> has been cancelled. If you didn't expect this or have any questions, just reply to our team on WhatsApp or call us."],
];
if (!isset($messages[$o['status']])) done(200, 'No email for this status');
[$subject, $intro] = $messages[$o['status']];

$note = trim($o['note'] ?? '');
$skipNotes = ['Order placed on the website', 'Status changed', ''];
$noteHtml = in_array($note, $skipNotes, true) ? '' :
  '<p style="margin:0 0 16px;padding:12px 14px;background:#f6f4ef;border-radius:8px;font-size:14px;color:#333;"><b>Note from us:</b> ' . $h($note) . '</p>';

$rows = '';
foreach (($o['items'] ?? []) as $it) {
  $label = $h($it['name']) . (!empty($it['size']) ? ' <span style="color:#777;">(' . $h($it['size']) . ')</span>' : '');
  $rows .= '<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;">' . $label .
    ' &times; ' . (int) $it['qty'] . '</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;white-space:nowrap;">' .
    $naira($it['unit_price'] * $it['qty']) . '</td></tr>';
}
// Delivery (Holt, by area) — the fee was set by the database at checkout.
$deliveryFee = (int) ($o['delivery_fee'] ?? 0);
$deliveryArea = trim($o['delivery_area'] ?? '');
$courier = ['holt' => 'Holt', 'kwik' => 'Kwik'][$o['delivery_courier'] ?? ''] ?? '';
$orderTotal = (int) ($o['subtotal'] ?? 0) + $deliveryFee;
if (($o['fulfilment'] ?? '') === 'delivery' && $deliveryArea !== '') {
  $rows .= '<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;">Delivery' .
    ($courier !== '' ? ' &middot; ' . $h($courier) : '') . ' &middot; ' . $h($deliveryArea) .
    '</td><td align="right" style="padding:8px 0;border-bottom:1px solid #eee;font-size:14px;color:#222;white-space:nowrap;">' .
    $naira($deliveryFee) . '</td></tr>';
}
$rows .= '<tr><td style="padding:10px 0;font-size:15px;font-weight:bold;">Total</td><td align="right" style="padding:10px 0;font-size:15px;font-weight:bold;">' .
  $naira($orderTotal) . '</td></tr>';

$track = $site . '/account/orders/';
$html = <<<HTML
<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;"><tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">
<tr><td align="center" style="padding:28px 24px 12px;"><img src="$site/spinning-top-logo.jpg" width="150" alt="Spinning Top" style="display:block;border:0;width:150px;height:auto;"></td></tr>
<tr><td style="padding:8px 28px 4px;">
<h1 style="margin:0 0 6px;font-size:20px;color:#111;">{$h($subject)}</h1>
<p style="margin:0 0 16px;font-size:13px;color:#777;">Order status: <b style="color:#111;">{$h($o['status'])}</b></p>
<p style="margin:0 0 12px;font-size:15px;color:#333;">$hello</p>
<p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#333;">$intro</p>
$noteHtml
<table width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 20px;">$rows</table>
<p style="margin:0 0 24px;" align="center"><a href="$track" style="display:inline-block;background:#111;color:#ffffff;text-decoration:none;padding:12px 26px;border-radius:999px;font-size:14px;font-weight:bold;">Track your order</a></p>
</td></tr>
<tr><td style="padding:16px 28px 26px;border-top:1px solid #eee;font-size:12px;line-height:1.5;color:#888;" align="center">
Spinning Top &middot; <a href="$site" style="color:#888;">spinningtop.ng</a><br>This is an automatic message, please don't reply to this email.
</td></tr></table></td></tr></table></body></html>
HTML;

$text = strip_tags(str_replace(['<br>', '</p>', '</tr>'], ["\n", "\n\n", "\n"], $intro)) . "\n\nTrack your order: $track\n\nSpinning Top";

try {
  smtp_send($config, $to, html_entity_decode($subject), $html, html_entity_decode($text));
} catch (Exception $e) {
  error_log('order-mail: ' . $e->getMessage());
  done(502, 'Send failed');
}

// New order alert to the business (only when the order is first placed).
if ($o['status'] === 'Received' && !empty($config['admin_email'])) {
  $digits = preg_replace('/\D/', '', $o['phone'] ?? '');
  if (strpos($digits, '0') === 0) $digits = '234' . substr($digits, 1);
  $wa = $digits !== '' ? 'https://wa.me/' . $digits : '';
  $custNote = trim($o['customer_note'] ?? '');
  $line = function ($k, $v) use ($h) {
    return '<tr><td style="padding:4px 12px 4px 0;font-size:14px;color:#777;white-space:nowrap;vertical-align:top;">' . $k .
      '</td><td style="padding:4px 0;font-size:14px;color:#111;">' . $v . '</td></tr>';
  };
  $details = $line('Customer', $h($o['customer_name'] ?: '—')) .
    $line('Phone', $h($o['phone'] ?: '—')) .
    $line('Email', $h($o['email'])) .
    $line($pickup ? 'Pickup at' : 'Deliver to', $pickup ? $h($o['outlet'] ?: '—') : $h($o['delivery_address'] ?: '—') . ($deliveryArea !== '' ? ' (' . $h($deliveryArea) . ')' : '')) .
    (!$pickup && $deliveryArea !== '' ? $line('Delivery by', $h($courier ?: 'Holt') . ' &middot; ' . $naira($deliveryFee)) : '') .
    $line('Payment', ($o['payment_status'] ?? '') === 'paid' ? 'Paid online' : 'Awaiting online payment') .
    ($custNote !== '' ? $line('Customer note', $h($custNote)) : '');
  $btn = function ($href, $label, $bg) {
    return '<a href="' . $href . '" style="display:inline-block;margin:4px;background:' . $bg .
      ';color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:bold;">' . $label . '</a>';
  };
  $buttons = $btn($site . '/admin/orders/', 'Open in admin', '#111') . ($wa ? $btn($wa, 'WhatsApp customer', '#25D366') : '');
  $aSubject = 'New order ' . $o['id'] . ' - ' . html_entity_decode($naira($orderTotal));
  $aHtml = '<!doctype html><html><body style="margin:0;padding:24px 12px;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">' .
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;"><tr><td style="padding:26px 28px;">' .
    '<h1 style="margin:0 0 4px;font-size:20px;color:#111;">New order ' . $id . '</h1>' .
    '<p style="margin:0 0 16px;font-size:13px;color:#777;">Placed on the website. Confirm it in the admin.</p>' .
    '<table cellpadding="0" cellspacing="0" style="margin:0 0 16px;">' . $details . '</table>' .
    '<table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;">' . $rows . '</table>' .
    '<p align="center" style="margin:0;">' . $buttons . '</p>' .
    '</td></tr></table></body></html>';
  $aText = "New order {$o['id']}\nCustomer: {$o['customer_name']}\nPhone: {$o['phone']}\nEmail: {$o['email']}\n\n" .
    "Open in admin: $site/admin/orders/" . ($wa ? "\nWhatsApp: $wa" : '');
  foreach (array_filter(array_map('trim', explode(',', $config['admin_email']))) as $admin) {
    if (!filter_var($admin, FILTER_VALIDATE_EMAIL)) continue;
    try { smtp_send($config, $admin, $aSubject, $aHtml, $aText); }
    catch (Exception $e) { error_log('order-mail admin: ' . $e->getMessage()); }
  }
}
done(200, 'Sent');

// Branded email layout used by booking emails.
function mail_shell($site, $title, $subline, $inner, $buttons, $withLogo) {
  $btns = '';
  foreach ($buttons as [$href, $label, $bg]) {
    $btns .= '<a href="' . $href . '" style="display:inline-block;margin:4px;background:' . $bg .
      ';color:#ffffff;text-decoration:none;padding:12px 24px;border-radius:999px;font-size:14px;font-weight:bold;">' . $label . '</a>';
  }
  $logo = $withLogo
    ? '<tr><td align="center" style="padding:28px 24px 12px;"><img src="' . $site . '/spinning-top-logo.jpg" width="150" alt="Spinning Top" style="display:block;border:0;width:150px;height:auto;"></td></tr>'
    : '';
  $footer = $withLogo
    ? '<tr><td style="padding:16px 28px 26px;border-top:1px solid #eee;font-size:12px;line-height:1.5;color:#888;" align="center">Spinning Top &middot; <a href="' . $site . '" style="color:#888;">spinningtop.ng</a><br>This is an automatic message, please don\'t reply to this email.</td></tr>'
    : '';
  return '<!doctype html><html><body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,Helvetica,sans-serif;">' .
    '<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:24px 12px;"><tr><td align="center">' .
    '<table width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;">' . $logo .
    '<tr><td style="padding:' . ($withLogo ? '8px' : '26px') . ' 28px 8px;">' .
    '<h1 style="margin:0 0 6px;font-size:20px;color:#111;">' . $title . '</h1>' .
    '<p style="margin:0 0 16px;font-size:13px;color:#777;">' . $subline . '</p>' . $inner .
    '<p align="center" style="margin:0 0 20px;">' . $btns . '</p></td></tr>' . $footer .
    '</table></td></tr></table></body></html>';
}

// Minimal SMTP client (SSL on port 465, AUTH LOGIN).
function smtp_send($c, $to, $subject, $html, $text) {
  $fp = @stream_socket_client('ssl://' . $c['smtp_host'] . ':' . $c['smtp_port'], $errno, $errstr, 20);
  if (!$fp) throw new Exception("Connect: $errstr");
  stream_set_timeout($fp, 20);
  $read = function () use ($fp) {
    $data = '';
    while (($line = fgets($fp, 515)) !== false) { $data .= $line; if (isset($line[3]) && $line[3] === ' ') break; }
    return $data;
  };
  $cmd = function ($line, $expect) use ($fp, $read) {
    if ($line !== null) fwrite($fp, $line . "\r\n");
    $res = $read();
    if ((int) substr($res, 0, 3) !== $expect) throw new Exception('SMTP: ' . trim($res));
  };
  $cmd(null, 220);
  $cmd('EHLO spinningtop.ng', 250);
  $cmd('AUTH LOGIN', 334);
  $cmd(base64_encode($c['smtp_user']), 334);
  $cmd(base64_encode($c['smtp_pass']), 235);
  $cmd('MAIL FROM:<' . $c['from_email'] . '>', 250);
  $cmd('RCPT TO:<' . $to . '>', 250);
  $cmd('DATA', 354);

  $b = 'b' . bin2hex(random_bytes(12));
  $enc = function ($s) { return '=?UTF-8?B?' . base64_encode($s) . '?='; };
  $msg = 'From: ' . $enc($c['from_name']) . ' <' . $c['from_email'] . ">\r\n" .
    "To: <$to>\r\n" .
    'Subject: ' . $enc($subject) . "\r\n" .
    'Date: ' . date('r') . "\r\n" .
    'Message-ID: <' . bin2hex(random_bytes(10)) . "@spinningtop.ng>\r\n" .
    "MIME-Version: 1.0\r\n" .
    "Content-Type: multipart/alternative; boundary=\"$b\"\r\n\r\n" .
    "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" .
    chunk_split(base64_encode($text)) .
    "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" .
    chunk_split(base64_encode($html)) .
    "--$b--\r\n";
  $cmd($msg . "\r\n.", 250);
  fwrite($fp, "QUIT\r\n");
  fclose($fp);
}
