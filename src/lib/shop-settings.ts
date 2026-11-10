import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { cacheTag } from "next/cache";

/* Shop on/off switch, controlled from /admin.
   Stored in data/shop-settings.json. This works when the site runs on a normal
   Node server (npm run start). On serverless hosting such as Vercel the file
   system is read-only, so move this to a database or KV store before deploying. */

export type ShopSettings = { showProducts: boolean };

export const SHOP_SETTINGS_TAG = "shop-settings";

const FILE = path.join(process.cwd(), "data", "shop-settings.json");
const DEFAULTS: ShopSettings = { showProducts: false };

/** Cached read, so /shop stays fast; the admin switch expires it via updateTag. */
export async function getShopSettings(): Promise<ShopSettings> {
  "use cache";
  cacheTag(SHOP_SETTINGS_TAG);
  try {
    const parsed = JSON.parse(await readFile(FILE, "utf8")) as Partial<ShopSettings>;
    return { ...DEFAULTS, ...parsed };
  } catch {
    return DEFAULTS;
  }
}

export async function saveShopSettings(settings: ShopSettings) {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, `${JSON.stringify(settings, null, 2)}\n`, "utf8");
}
