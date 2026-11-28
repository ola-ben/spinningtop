"use client";

import { useCallback, useEffect, useState } from "react";
import type { Permission } from "./admin-auth";
import { db, supabaseReady } from "./supabase";

/* Team & roles for the Owner (supabase/team-roles.sql). */

/** The checklist on the role editor, grouped by admin area. */
export const PERMISSION_GROUPS: { label: string; items: { key: Permission; label: string }[] }[] = [
  {
    label: "Orders & bookings",
    items: [
      { key: "orders.view", label: "View" },
      { key: "orders.update", label: "Update status & notes" },
      { key: "orders.cancel", label: "Cancel" },
      { key: "orders.payment", label: "Mark paid" },
    ],
  },
  { label: "Customers", items: [{ key: "customers.view", label: "View" }] },
  {
    label: "Products",
    items: [
      { key: "products.view", label: "View" },
      { key: "products.edit", label: "Add & edit" },
      { key: "products.delete", label: "Delete" },
    ],
  },
  {
    label: "Services",
    items: [
      { key: "services.view", label: "View" },
      { key: "services.edit", label: "Add & edit" },
      { key: "services.delete", label: "Delete" },
    ],
  },
  { label: "Reviews", items: [{ key: "reviews.view", label: "View, publish & hide" }] },
  { label: "Academy", items: [{ key: "academy.view", label: "View" }] },
  { label: "Delivery", items: [{ key: "delivery.manage", label: "Manage areas & prices" }] },
  { label: "Dashboard", items: [{ key: "dashboard.sales", label: "See sales totals" }] },
  { label: "Settings", items: [{ key: "settings.manage", label: "Shop on/off & settings" }] },
];

/** Ticking one of these also ticks the "View" it depends on (and unticking View clears them). */
export const NEEDS_VIEW: Partial<Record<Permission, Permission>> = {
  "orders.update": "orders.view",
  "orders.cancel": "orders.view",
  "orders.payment": "orders.view",
  "products.edit": "products.view",
  "products.delete": "products.view",
  "services.edit": "services.view",
  "services.delete": "services.view",
};

export type TeamRole = { id: string; name: string; permissions: Permission[]; members: number };
export type TeamMember = {
  userId: string;
  email: string;
  name: string;
  isOwner: boolean;
  roleId: string | null;
  role: string;
  addedAt: string;
  lastSignIn: string | null;
  isMe: boolean;
};
export type TeamInvite = { email: string; isOwner: boolean; roleId: string | null; role: string; invitedAt: string };

type Raw = {
  roles: { id: string; name: string; permissions: Permission[]; members: number }[];
  members: {
    user_id: string;
    email: string;
    name: string;
    is_owner: boolean;
    role_id: string | null;
    role: string | null;
    added_at: string;
    last_sign_in_at: string | null;
    is_me: boolean;
  }[];
  invites: { email: string; is_owner: boolean; role_id: string | null; role: string | null; invited_at: string }[];
};

const friendly = (m: string) =>
  /admin_team|admin_save_role|does not exist|schema cache/i.test(m) ? "Run supabase/team-roles.sql in Supabase first." : m;

type Team = { roles: TeamRole[]; members: TeamMember[]; invites: TeamInvite[]; error: string; loading: boolean };

async function fetchTeam(): Promise<Team> {
  const { data, error } = await db().rpc("admin_team");
  if (error) return { roles: [], members: [], invites: [], error: friendly(error.message), loading: false };
  const r = data as Raw;
  return {
    roles: r.roles,
    members: r.members.map((m) => ({
      userId: m.user_id,
      email: m.email,
      name: m.name,
      isOwner: m.is_owner,
      roleId: m.role_id,
      role: m.role ?? "",
      addedAt: m.added_at,
      lastSignIn: m.last_sign_in_at,
      isMe: m.is_me,
    })),
    invites: r.invites.map((i) => ({ email: i.email, isOwner: i.is_owner, roleId: i.role_id, role: i.role ?? "", invitedAt: i.invited_at })),
    error: "",
    loading: false,
  };
}

export function useTeam() {
  const [team, setTeam] = useState<Team>({ roles: [], members: [], invites: [], error: "", loading: true });

  const reload = useCallback(async () => {
    if (supabaseReady()) setTeam(await fetchTeam());
  }, []);

  useEffect(() => {
    // Load from Supabase on open; the lists fill in when it answers.
    if (!supabaseReady()) return;
    let active = true;
    void fetchTeam().then((t) => {
      if (active) setTeam(t);
    });
    return () => {
      active = false;
    };
  }, []);

  return { ...team, reload };
}

/** Runs a team RPC; returns an error message or null. */
async function call(fn: string, args: Record<string, unknown>): Promise<string | null> {
  const { error } = await db().rpc(fn, args);
  return error ? friendly(error.message) : null;
}

/** Role id "owner" in the pickers = Owner (full access). */
export const OWNER = "owner";

export const saveRole = (id: string | null, name: string, permissions: Permission[]) =>
  call("admin_save_role", { p_id: id, p_name: name, p_permissions: permissions });
export const deleteRole = (id: string) => call("admin_delete_role", { p_id: id });
export const inviteMember = (email: string, roleId: string) =>
  call("admin_invite_member", { p_email: email, p_role_id: roleId === OWNER ? null : roleId, p_owner: roleId === OWNER });
export const cancelInvite = (email: string) => call("admin_cancel_invite", { p_email: email });
export const updateMember = (userId: string, roleId: string) =>
  call("admin_update_member", { p_user_id: userId, p_role_id: roleId === OWNER ? null : roleId, p_owner: roleId === OWNER });
export const removeMember = (userId: string) => call("admin_remove_member", { p_user_id: userId });
