"use server";

import { updateTag } from "next/cache";
import { SHOP_SETTINGS_TAG, saveShopSettings } from "@/lib/shop-settings";

/* ⚠ The admin has no login right now (removed while the backend is being built).
   Server Actions can be called directly by anyone, so add your backend's
   session/role check at the top of every action here before going live. */

export type SwitchState = { error?: string };

/** Turn the product listing on /shop on or off. The setting stays until changed again. */
export async function setShopVisibility(_prev: SwitchState, formData: FormData): Promise<SwitchState> {
  // TODO(auth): verify the signed-in user may change store settings.
  try {
    await saveShopSettings({ showProducts: formData.get("showProducts") === "on" });
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Could not save the setting." };
  }
  updateTag(SHOP_SETTINGS_TAG);
  return {};
}
