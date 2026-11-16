/* Build the site for cPanel public_html (static files — no Node.js needed).

   Usage:  npm run package:static
   Output: spinningtop-static.zip  → upload to public_html and Extract

   How it works on the host:
   - Every page is plain HTML/CSS/JS. Products, services and the shop switch
     are built in, then refreshed from Supabase in the visitor's browser.
   - /admin signs in with Supabase and saves straight to Supabase, so adding
     or editing products does NOT need a rebuild or re-upload.
   - Products/services added after this build have no page file of their own;
     .htaccess sends /shop/<id>/ and /services/<id>/ to a page that loads them.
   Rebuild and re-upload only when the site's design or code changes. */

import { execSync } from "node:child_process";
import { copyFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spinningtop.ng";
const root = process.cwd();
const outDir = path.join(root, "out");
const zip = path.join(root, "spinningtop-static.zip");

const step = (msg) => console.log(`\n▸ ${msg}`);

step(`Building static site for ${SITE_URL}`);
rmSync(outDir, { recursive: true, force: true });
execSync("npx next build", {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL, NODE_ENV: "production" },
});

/* Prefetch data: the export saves segment files in folders
   (shop/x/__next.shop/$d$id/__PAGE__.txt) but the browser requests flat names
   (shop/x/__next.shop.$d$id.__PAGE__.txt). Plain Apache can't map one to the
   other, so add a flat copy next to each folder. */
step("Adding flat copies of prefetch files");
let flatCopies = 0;
const flatten = (dir) => {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const full = path.join(dir, entry.name);
    if (entry.name.startsWith("__next.")) {
      const walk = (sub, parts) => {
        for (const e of readdirSync(sub, { withFileTypes: true })) {
          const next = [...parts, e.name];
          if (e.isDirectory()) walk(path.join(sub, e.name), next);
          else {
            copyFileSync(path.join(sub, e.name), path.join(dir, [entry.name, ...next].join(".")));
            flatCopies++;
          }
        }
      };
      walk(full, []);
    } else {
      flatten(full);
    }
  }
};
flatten(outDir);
console.log(`  ${flatCopies} files`);

step("Adding Apache settings (.htaccess)");
writeFileSync(
  path.join(outDir, ".htaccess"),
  `# Spinning Top — static site on cPanel (Apache)

DirectoryIndex index.html
ErrorDocument 404 /404.html
Options -Indexes

# Clean URLs: /services → /services/ (pages are folders with index.html)
DirectorySlash On

# Cache built assets for a year (their filenames change on every build)
<IfModule mod_headers.c>
  <FilesMatch "^_next/static/">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
</IfModule>
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpeg "access plus 30 days"
  ExpiresByType image/png "access plus 30 days"
  ExpiresByType image/svg+xml "access plus 30 days"
  ExpiresByType text/css "access plus 1 year"
  ExpiresByType application/javascript "access plus 1 year"
</IfModule>

RewriteEngine On

# Send everyone to https://www. (SSL is active — Let's Encrypt via cPanel AutoSSL)
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^ https://www.spinningtop.ng%{REQUEST_URI} [L,R=301]

# Products and services added in /admin after this build have no page file.
# Show them with the "live" page, which loads them from Supabase.
# (The address in the browser stays /shop/<id>/.)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^shop/[^/.]+/?$ /shop/_live/index.html [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^services/[^/.]+/?$ /services/_live/index.html [L]
`,
);

writeFileSync(
  path.join(outDir, "README-UPLOAD.txt"),
  `SPINNING TOP — static site for cPanel public_html
Built for ${SITE_URL}

1. cPanel → File Manager → Settings → tick "Show Hidden Files" → Save.
2. Open public_html. Delete any old default files (e.g. default.html, index.html from the host).
   Don't delete cgi-bin or .well-known.
3. Upload spinningtop-static.zip into public_html → right-click → Extract → Extract Files.
4. Check that index.html, _next, services, shop, admin and .htaccess are directly inside public_html.
5. Visit https://www.spinningtop.ng — admin at https://www.spinningtop.ng/admin/

Products, services and the shop on/off switch are managed in /admin and saved
in Supabase: changes show on the site straight away, no re-upload needed.

Re-upload only when the site's design/code changes: run "npm run package:static",
upload the new zip, Extract (overwrite).
`,
);

step("Zipping");
rmSync(zip, { force: true });
if (process.platform === "win32") {
  // Windows' own bsdtar (not Git Bash's GNU tar) can write zip files; -a picks zip from the extension.
  const tar = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");
  execSync(`"${tar}" -a -c -f "${zip}" .`, { stdio: "inherit", cwd: outDir });
} else {
  execSync(`zip -qr "${zip}" .`, { stdio: "inherit", cwd: outDir });
}

console.log(`\n✔ Ready: ${path.relative(root, zip)}  (folder: out/)`);
