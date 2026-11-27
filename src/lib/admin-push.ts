"use client";

import { db, supabaseReady } from "./supabase";

/* Team push notifications (supabase/push.sql + public/sw.js + api/_push.php).
   Each device opts in with "Enable notifications" in the admin; new bookings
   and paid orders then ping it, even when the website is closed. */

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export type PushState =
  | "unsupported" // this browser can't do web push
  | "ios-home-screen" // iPhone/iPad: only works after "Add to Home Screen"
  | "blocked" // the person said "Block" — must be changed in browser settings
  | "off"
  | "on";

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

function keyBytes(base64url: string) {
  const b64 = base64url.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (base64url.length % 4)) % 4);
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

async function registration() {
  return navigator.serviceWorker.register("/sw.js", { scope: "/" });
}

/** Is this device set up for notifications? */
export async function getPushState(): Promise<PushState> {
  if (typeof window === "undefined") return "unsupported";
  const supported = "serviceWorker" in navigator && "PushManager" in window && "Notification" in window && !!VAPID_PUBLIC_KEY;
  if (!supported) return isIOS() && !isStandalone() ? "ios-home-screen" : "unsupported";
  if (Notification.permission === "denied") return "blocked";
  const reg = await navigator.serviceWorker.getRegistration("/");
  const sub = reg ? await reg.pushManager.getSubscription() : null;
  return sub && Notification.permission === "granted" ? "on" : "off";
}

/** Asks permission and saves this device. Returns an error message, or null. */
export async function enablePush(): Promise<string | null> {
  if (!supabaseReady()) return "Not connected to Supabase.";
  const state = await getPushState();
  if (state === "unsupported") return "This browser can't show notifications. Try Chrome on Android or a computer.";
  if (state === "ios-home-screen") return "On iPhone, first tap Share → Add to Home Screen, then open the admin from that icon.";
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return "Notifications were not allowed. You can allow them in your browser's site settings.";
  try {
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const sub =
      (await reg.pushManager.getSubscription()) ??
      (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyBytes(VAPID_PUBLIC_KEY) }));
    const json = sub.toJSON();
    const { error } = await db().rpc("push_subscribe", {
      p_endpoint: sub.endpoint,
      p_p256dh: json.keys?.p256dh ?? "",
      p_auth: json.keys?.auth ?? "",
      p_user_agent: navigator.userAgent.slice(0, 300),
    });
    if (error) {
      await sub.unsubscribe().catch(() => {});
      return /push_subscribe|does not exist|schema cache/i.test(error.message) ? "Run supabase/push.sql in Supabase first." : error.message;
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Could not turn on notifications.";
  }
}

/** Stops notifications on this device. */
export async function disablePush(): Promise<string | null> {
  try {
    const reg = await navigator.serviceWorker.getRegistration("/");
    const sub = reg ? await reg.pushManager.getSubscription() : null;
    if (sub) {
      await db().rpc("push_unsubscribe", { p_endpoint: sub.endpoint });
      await sub.unsubscribe();
    }
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : "Could not turn off notifications.";
  }
}

/** Short two-tone chime for new bookings/orders while the admin is open. */
export function playChime() {
  try {
    const AudioCtx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    [880, 1318.5].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      const start = now + i * 0.16;
      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(0.25, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.4);
    });
    setTimeout(() => void ctx.close(), 1200);
  } catch {
    /* sound blocked until the page is clicked — fine */
  }
}
