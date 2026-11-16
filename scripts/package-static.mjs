/* Build a STATIC version of the site for cPanel public_html (no Node.js needed).

   Usage:  npm run package:static
   Output: spinningtop-static.zip  → upload to public_html and Extract

   What's different from the Node.js version:
   - /admin is left out (it needs a server to save settings)
   - the shop on/off state is fixed at build time (data/shop-settings.json)
   - photos are served at original size (no server-side optimisation)
   Everything else — pages, shop, services, cart, wishlist, search,
   WhatsApp ordering — runs in the visitor's browser. */

import { execSync } from "node:child_process";
import { copyFileSync, cpSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spinningtop.ng";
const root = process.cwd();
const outDir = path.join(root, "out");
const zip = path.join(root, "spinningtop-static.zip");
/* The build runs on a COPY of the project (in .static-build/), so the real
   src/ is never changed — it works even while `npm run dev` is running.
   In the copy, parts that need a server are removed:
   - /admin (saves settings through a server)
   - robots.ts / sitemap.ts (written as plain files below instead) */
const work = path.join(root, ".static-build");
const SERVER_ONLY = ["src/app/admin", "src/app/robots.ts", "src/app/sitemap.ts"];
// Not copied: generated output, caches, git, and the heavy node_modules (shared via a link).
const SKIP = new Set([".git", ".next", ".static-build", "deploy", "node_modules", "out", "spinningtop-static.zip", "spinningtop-cpanel.zip"]);

const step = (msg) => console.log(`\n▸ ${msg}`);

const shop = JSON.parse(readFileSync(path.join(root, "data", "shop-settings.json"), "utf8"));
step(`Building static site for ${SITE_URL} (shop ${shop.showProducts ? "ON" : "OFF — Coming soon"})`);

rmSync(work, { recursive: true, force: true });
mkdirSync(work);
for (const entry of readdirSync(root)) {
  if (SKIP.has(entry)) continue;
  cpSync(path.join(root, entry), path.join(work, entry), { recursive: true });
}
// node_modules is shared, not copied (a junction needs no admin rights on Windows).
symlinkSync(path.join(root, "node_modules"), path.join(work, "node_modules"), "junction");
for (const rel of SERVER_ONLY) rmSync(path.join(work, rel), { recursive: true, force: true });

try {
  execSync("npx next build", {
    cwd: work,
    stdio: "inherit",
    env: { ...process.env, STATIC_EXPORT: "1", NEXT_PUBLIC_SITE_URL: SITE_URL, NODE_ENV: "production" },
  });
  rmSync(outDir, { recursive: true, force: true });
  renameSync(path.join(work, "out"), outDir);
} finally {
  rmSync(work, { recursive: true, force: true });
}

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

step("Writing robots.txt and sitemap.xml");
writeFileSync(
  path.join(outDir, "robots.txt"),
  `User-Agent: *
Allow: /
Disallow: /admin

Sitemap: ${SITE_URL}/sitemap.xml
`,
);
// Same pages as src/app/sitemap.ts: home, services and each service page.
const serviceIds = [
  ...readFileSync(path.join(root, "src", "lib", "services-data.ts"), "utf8").matchAll(/^\s+id: "([a-z-]+)",/gm),
].map((m) => m[1]);
const urls = [
  [SITE_URL, "1"],
  [`${SITE_URL}/services`, "0.9"],
  ...serviceIds.map((id) => [`${SITE_URL}/services/${id}`, "0.8"]),
];
const urlTags = urls
  .map(([loc, pr]) => `  <url><loc>${loc}</loc><changefreq>monthly</changefreq><priority>${pr}</priority></url>`)
  .join("\n");
writeFileSync(
  path.join(outDir, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlTags}\n</urlset>\n`,
);

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

# Send everyone to https://www. (SSL is active — Let's Encrypt via cPanel AutoSSL)
RewriteEngine On
RewriteCond %{HTTPS} off [OR]
RewriteCond %{HTTP_HOST} !^www\\. [NC]
RewriteRule ^ https://www.spinningtop.ng%{REQUEST_URI} [L,R=301]
`,
);

writeFileSync(
  path.join(outDir, "README-UPLOAD.txt"),
  `SPINNING TOP — static site for cPanel public_html
Built for ${SITE_URL} · shop ${shop.showProducts ? "ON" : "OFF"}

1. cPanel → File Manager → Settings → tick "Show Hidden Files" → Save.
2. Open public_html. Delete any old default files (e.g. default.html, index.html from the host).
   Don't delete cgi-bin or .well-known.
3. Upload spinningtop-static.zip into public_html → right-click → Extract → Extract Files.
4. Check that index.html, _next, services, shop and .htaccess are directly inside public_html.
5. Visit https://www.spinningtop.ng (or http:// until SSL is active).

Updating: run "npm run package:static", upload the new zip, Extract (overwrite).
To switch the shop on/off: change it in /admin on your computer (npm run dev), then rebuild.
`,
);

step("Zipping");
rmSync(zip, { force: true });
if (process.platform === "win32") {
  const tar = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");
  execSync(`"${tar}" -a -c -f "${zip}" .`, { stdio: "inherit", cwd: outDir });
} else {
  execSync(`zip -qr "${zip}" .`, { stdio: "inherit", cwd: outDir });
}

console.log(`\n✔ Ready: ${path.relative(root, zip)}  (folder: out/)`);
