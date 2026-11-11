import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { cacheTag } from "next/cache";

/* Shop on/off switch, controlled from /admin.

   Where it's saved:
   - Upstash Redis when its REST env vars are set (required on Vercel, whose
     file system is read-only). Connect a database in Vercel → Storage, and the
     variables are added for you.
   - Otherwise data/shop-settings.json (fine for local `npm run dev`). */

export type ShopSettings = { showProducts: boolean };

export const SHOP_SETTINGS_TAG = "shop-settings";

const KEY = "spinningtop:shop-settings";
const FILE = path.join(process.cwd(), "data", "shop-settings.json");
const DEFAULTS: ShopSettings = { showProducts: false };

/** Upstash REST credentials — Vercel may name them either way. */
function redisConfig() {
  const url = process.env.KV_REST_API_URL ?? process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN ?? process.env.UPSTASH_REDIS_REST_TOKEN;
  return url && token ? { url: url.replace(/\/$/, ""), token } : null;
}

/** True when settings can be saved permanently in this environment. */
export const settingsStorageReady = () => !!redisConfig() || !process.env.VERCEL;

const parse = (raw: string | null | undefined): ShopSettings => {
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<ShopSettings>) };
  } catch {
    return DEFAULTS;
  }
};

/** Cached read, so /shop stays fast; the admin switch expires it via updateTag. */
export async function getShopSettings(): Promise<ShopSettings> {
  "use cache";
  cacheTag(SHOP_SETTINGS_TAG);

  const redis = redisConfig();
  if (redis) {
    try {
      const res = await fetch(`${redis.url}/get/${KEY}`, {
        headers: { Authorization: `Bearer ${redis.token}` },
      });
      const data = (await res.json()) as { result?: string | null };
      return parse(data.result);
    } catch {
      return DEFAULTS;
    }
  }

  try {
    return parse(await readFile(FILE, "utf8"));
  } catch {
    return DEFAULTS;
  }
}

export async function saveShopSettings(settings: ShopSettings) {
  const value = JSON.stringify(settings);
  const redis = redisConfig();

  if (redis) {
    const res = await fetch(`${redis.url}/set/${KEY}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${redis.token}` },
      body: value,
    });
    if (!res.ok) throw new Error(`Could not save settings (Redis ${res.status})`);
    return;
  }

  if (process.env.VERCEL) {
    throw new Error("No database connected — add Upstash Redis in Vercel → Storage.");
  }
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, `${value}\n`, "utf8");
}
