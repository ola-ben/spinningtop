<?php
// Upload this file to your cPanel HOME folder (the folder ABOVE public_html),
// e.g. /home/<cpanel-user>/order-mail-config.php, then fill in smtp_pass.
// Never put this file inside public_html.
return [
  'secret'     => '1583453f919db1fc3138a32c130e9b344c10548891b894f3', // must match supabase/order-emails.sql
  'smtp_host'  => 'mail.spinningtop.ng',
  'smtp_port'  => 465,
  'smtp_user'  => 'noreply@spinningtop.ng',
  'smtp_pass'  => 'PASTE_NOREPLY_MAILBOX_PASSWORD_HERE',
  'from_email' => 'noreply@spinningtop.ng',
  'from_name'  => 'Spinning Top',
  'admin_email' => 'admin@spinningtop.ng', // new-order alerts; add more with commas
  'vapid_private_key' => 'PASTE_HERE', // team push notifications (private key; the public one is in the site)
  'paystack_secret_key' => 'sk_test_PASTE_HERE', // Paystack → Settings → API Keys (sk_live_… when going live)
];
