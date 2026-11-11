/* Build the site and package it for cPanel ("Setup Node.js App").

   Usage:  npm run package:cpanel
   Output: spinningtop-cpanel.zip  (upload this to cPanel and extract)

   The site is built here so the server doesn't have to (shared hosting
   often runs out of memory during builds). On the server, "Run NPM Install"
   then fetches the Linux versions of the dependencies. */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.spinningtop.ng";
const root = process.cwd();
const out = path.join(root, "deploy", "cpanel");
const zip = path.join(root, "spinningtop-cpanel.zip");

const step = (msg) => console.log(`\n▸ ${msg}`);

step(`Building for ${SITE_URL}`);
execSync("npx next build", {
  stdio: "inherit",
  env: { ...process.env, NEXT_PUBLIC_SITE_URL: SITE_URL, NODE_ENV: "production" },
});

step("Collecting files");
rmSync(path.join(root, "deploy"), { recursive: true, force: true });
mkdirSync(out, { recursive: true });

// Built site — without the dev server's files and the local build cache.
cpSync(path.join(root, ".next"), path.join(out, ".next"), {
  recursive: true,
  filter: (src) => {
    const rel = path.relative(path.join(root, ".next"), src).split(path.sep);
    return !["cache", "dev", "standalone"].includes(rel[0]);
  },
});

for (const item of ["public", "data", "package.json", "package-lock.json", "next.config.ts", "server.js"]) {
  const from = path.join(root, item);
  if (existsSync(from)) cpSync(from, path.join(out, item), { recursive: true });
}

writeFileSync(
  path.join(out, "README-CPANEL.txt"),
  `SPINNING TOP — cPanel setup
============================
Built for: ${SITE_URL}

1. In cPanel open "Setup Node.js App" → Create Application
     Node.js version ........ 20.9 or newer (22 recommended)
     Application mode ....... Production
     Application root ....... spinningtop   (folder you extract this zip into)
     Application URL ........ www.spinningtop.ng
     Application startup file server.js
   Click Create, then STOP the app.

2. File Manager → open the application root folder → Upload spinningtop-cpanel.zip
   → Extract here. (Don't upload a node_modules folder — cPanel makes its own.)

3. Back in "Setup Node.js App" → your app → "Run NPM Install".

4. Environment variables (same page) — add if used:
     KV_REST_API_URL / KV_REST_API_TOKEN   only if you move settings to Upstash
   (Not needed on cPanel: the shop on/off switch saves to data/shop-settings.json.)

5. Click "Restart". Visit https://www.spinningtop.ng

Updating later: run "npm run package:cpanel" again on your computer, upload the
new zip, extract over the old files (replace), then Restart the app.

⚠ /admin has no login yet — add your backend's sign-in before announcing the site.
`,
);

step("Zipping");
rmSync(zip, { force: true });
if (process.platform === "win32") {
  // Windows' own bsdtar (not Git Bash's GNU tar) can write zip files; -a picks zip from the extension.
  const tar = path.join(process.env.SystemRoot || "C:\\Windows", "System32", "tar.exe");
  execSync(`"${tar}" -a -c -f "${zip}" .`, { stdio: "inherit", cwd: out });
} else {
  execSync(`zip -qr "${zip}" .`, { stdio: "inherit", cwd: out });
}

console.log(`\n✔ Ready: ${path.relative(root, zip)}  (folder: deploy/cpanel)`);
