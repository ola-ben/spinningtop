"use server";

import { updateTag } from "next/cache";
import { endAdminSession, isAdmin, passwordMatches, startAdminSession } from "@/lib/admin-auth";
import { SHOP_SETTINGS_TAG, saveShopSettings } from "@/lib/shop-settings";

export type LoginState = { error?: string };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const attempt = String(formData.get("password") ?? "");
  if (!passwordMatches(attempt)) return { error: "That password isn't right." };
  await startAdminSession();
  return {};
}

export async function logout() {
  await endAdminSession();
}

/** Turn the product listing on /shop on or off. */
export async function setShopVisibility(formData: FormData) {
  // Server Actions can be called directly, so always re-check the session.
  if (!(await isAdmin())) throw new Error("Unauthorised");
  await saveShopSettings({ showProducts: formData.get("showProducts") === "on" });
  updateTag(SHOP_SETTINGS_TAG);
}
