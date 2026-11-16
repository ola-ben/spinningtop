import { readFile } from "node:fs/promises";
import path from "node:path";
import { cacheTag } from "next/cache";
import { db, supabaseReady } from "./supabase";

/* Shop on/off switch, controlled from /admin (saved in Supabase table
   site_settings, key "shop" — see supabase/admin-access.sql).

   This is the BUILD-TIME read, so pages are built showing the right version.
   In the browser, ShopGate re-checks Supabase, so flipping the switch in
   /admin takes effect without rebuilding.

   Without Supabase, data/shop-settings.json is used. */

export type ShopSettings = { showProducts: boolean };

export const SHOP_SETTINGS_TAG = "shop-settings";

const FILE = path.join(process.cwd(), "data", "shop-settings.json");
const DEFAULTS: ShopSettings = { showProducts: false };

export async function getShopSettings(): Promise<ShopSettings> {
  "use cache";
  cacheTag(SHOP_SETTINGS_TAG);

  if (supabaseReady()) {
    const { data, error } = await db().from("site_settings").select("value").eq("key", "shop").maybeSingle();
    if (!error && data) return { ...DEFAULTS, ...(data.value as Partial<ShopSettings>) };
  }

  try {
    return { ...DEFAULTS, ...(JSON.parse(await readFile(FILE, "utf8")) as Partial<ShopSettings>) };
  } catch {
    return DEFAULTS;
  }
}
