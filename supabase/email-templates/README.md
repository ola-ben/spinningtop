# Account emails from your own domain (Phase 2)

Customers sign in with a **6-digit code** emailed to them (no passwords).
Supabase sends the code emails (and email-change emails). These steps make
them come **from `noreply@spinningtop.ng`** (your cPanel mail) with Spinning Top
branding, instead of Supabase's default sender (which only allows a few emails
per hour and often lands in spam).

## Step 1 — Create the mailbox in cPanel
1. cPanel → **Email Accounts** → **+ Create**.
2. Username: `noreply` · Domain: `spinningtop.ng` · set a strong password (save it).
3. Click **Create**.

## Step 2 — Get the SMTP details
cPanel → **Email Accounts** → next to `noreply@spinningtop.ng` click **Connect Devices**.
Under **Secure SSL/TLS Settings (Recommended)** note:
- **Outgoing Server** (e.g. `mail.spinningtop.ng`)
- **SMTP Port** (usually **465**)

## Step 3 — Make your domain trusted (avoids spam folder)
cPanel → **Email Deliverability** → find `spinningtop.ng`.
- If **DKIM** or **SPF** shows a problem → click **Repair** (or **Manage** → install the suggested records).
- Both should show **Valid** (green). Can take a few minutes to an hour.

## Step 4 — Connect Supabase to your mailbox
Supabase → **Authentication** → **Emails** → **SMTP Settings** → turn on **Enable custom SMTP**:

| Field | Value |
|---|---|
| Sender email | `noreply@spinningtop.ng` |
| Sender name | `Spinning Top` |
| Host | the Outgoing Server from step 2 (e.g. `mail.spinningtop.ng`) |
| Port | `465` |
| Username | `noreply@spinningtop.ng` |
| Password | the mailbox password from step 1 |
| Minimum interval between emails | leave the default |

Click **Save**.

Then **Authentication** → **Rate Limits** → raise **"Rate limit for sending emails"**
(e.g. to 30 per hour) — the low default only applies to Supabase's own sender.

## Step 5 — Set the code to 6 digits, valid for 10 minutes
Supabase → **Authentication** → **Sign In / Providers** → **Email**:
- **Email OTP Length:** `6`
- **Email OTP Expiration:** `600` seconds (10 minutes — matches the wording in the emails)
- **Confirm email:** on

Click **Save**.

## Step 6 — Paste the branded templates
Supabase → **Authentication** → **Emails** → **Templates**. For each template below:
open it, replace the **Subject**, switch the body to the **Source** view, delete what's
there, paste the whole HTML file, **Save**.

| Supabase template | Subject | File to paste | Used for |
|---|---|---|---|
| Confirm signup | Your Spinning Top account code | `confirm-signup.html` | Code for **new** customers |
| Magic link | Your Spinning Top sign-in code | `magic-link.html` | Code for **every sign-in** |
| Change email address | Confirm your new email address | `change-email.html` | If an email address is changed |
| Reset password | Reset your Spinning Top password | `reset-password.html` | Admin password resets only |

> Supabase calls the sign-in email "Magic link" — this template shows the 6-digit
> code, not a link. Both code templates **must** keep `{{ .Token }}` (that's the code).

(To copy a file: open it in VS Code → Ctrl+A → Ctrl+C.)

The logo in the emails loads from `https://www.spinningtop.ng/spinning-top-logo.jpg`
(the Site URL set in Authentication → URL Configuration), so it shows once the site is live.

## Step 7 — Test
1. `http://localhost:3000/login/` → **Create account** → name + an email you can open
   (Gmail is a good test — it shows spam/DKIM problems clearly) → **Email me a code**.
2. The email should come from **Spinning Top &lt;noreply@spinningtop.ng&gt;** showing a 6-digit code.
3. Type the code → you land signed in on `/account/`.
4. Sign out → **Sign in** → same email → new code → signed in again.

## If it doesn't work
| Problem | Fix |
|---|---|
| No email arrives | Supabase → **Logs** → **Auth** shows the SMTP error. Usually wrong host/port/password. Try port `587` if `465` fails. |
| "Error sending confirmation email" on sign-up | Same as above — SMTP details wrong, or the mailbox password changed. |
| Email lands in spam | Step 3 (DKIM/SPF must be Valid). Mark it "Not spam" once in Gmail. |
| Logo missing | Site not uploaded yet, or Site URL not `https://www.spinningtop.ng`. |
| Email shows a link instead of a code | The template wasn't replaced — paste `magic-link.html` / `confirm-signup.html` again |
| "That code is wrong or has expired" | Use the newest email; codes expire after 10 minutes and work once |
| Link opens the wrong site | Authentication → URL Configuration: Site URL + Redirect URLs (see SITE-GUIDE.md). |
