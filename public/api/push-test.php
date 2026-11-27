<?php
// Spinning Top: one-off check for team notifications.
// Open https://www.spinningtop.ng/api/push-test.php?key=<the 'secret' from order-mail-config.php>
// It sends "Test from the server" to every device with notifications on and
// lists each step. Delete this file from public_html/api once it works.

header('Content-Type: text/plain; charset=utf-8');
header('Cache-Control: no-store');

$configFile = dirname(__DIR__, 2) . '/order-mail-config.php';
if (!is_file($configFile)) { http_response_code(500); exit("PROBLEM: order-mail-config.php not found\n"); }
$config = require $configFile;
if (!is_array($config) || !hash_equals((string) ($config['secret'] ?? ''), (string) ($_GET['key'] ?? ''))) { http_response_code(404); exit; }

require __DIR__ . '/_push.php';

$report = [];
push_notify_team($config, 'Test from the server', 'If you see this, booking and order notifications work.', 'https://www.spinningtop.ng/admin/', 'server-test', $report);
echo implode("\n", $report), "\n";
