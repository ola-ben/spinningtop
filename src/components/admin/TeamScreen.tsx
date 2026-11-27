"use client";

import { useEffect, useState } from "react";
import type { Permission } from "@/lib/admin-auth";
import {
  NEEDS_VIEW,
  OWNER,
  PERMISSION_GROUPS,
  cancelInvite,
  deleteRole,
  inviteMember,
  removeMember,
  saveRole,
  updateMember,
  useTeam,
  type TeamRole,
} from "@/lib/admin-team";
import Busy from "@/components/Busy";
import { toast } from "./Toast";
import { Badge, Card, Field, PageHeader, btn, inputClass, table } from "./ui";

/* /admin/team — the Owner creates roles (ticks what each may do), adds workers
   by email and changes or removes their access. Owner only. */

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString("en-NG", { day: "2-digit", month: "short", year: "numeric" }) : "—";

const ALL_PERMISSIONS = PERMISSION_GROUPS.flatMap((g) => g.items.map((i) => i.key));

type Notice = { ok: boolean; text: string } | null;

function NoticeLine({ notice }: { notice: Notice }) {
  if (!notice) return null;
  return (
    <p
      role={notice.ok ? "status" : "alert"}
      className={`rounded-xl px-3.5 py-2.5 text-sm ${notice.ok ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}
    >
      {notice.text}
    </p>
  );
}

export default function TeamScreen() {
  const { roles, members, invites, loading, error, reload } = useTeam();
  const [editing, setEditing] = useState<TeamRole | "new" | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const [busyKey, setBusyKey] = useState("");

  async function run(key: string, action: () => Promise<string | null>, success: string) {
    setBusyKey(key);
    setNotice(null);
    const err = await action();
    await reload();
    setBusyKey("");
    setNotice(null);
    toast(err ?? success, !err);
    return !err;
  }

  const roleOptions = (
    <>
      {roles.map((r) => (
        <option key={r.id} value={r.id}>
          {r.name}
        </option>
      ))}
      <option value={OWNER}>Owner (full access)</option>
    </>
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader title="Team & roles" description="Create roles, choose what each role can do, and give your workers access." />

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
          {error}
        </p>
      )}
      <NoticeLine notice={notice} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team members + pending invites */}
        <Card title="Team members" className="lg:col-span-2" flush>
          <div className={table.wrap}>
            <table className={table.table}>
              <thead>
                <tr>
                  <th className={table.th}>Name</th>
                  <th className={table.th}>Role</th>
                  <th className={table.th}>Last sign-in</th>
                  <th className={`${table.th} text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={4} className="px-5 py-12 text-center text-sm text-ink/50">
                      Loading team…
                    </td>
                  </tr>
                )}
                {members.map((m) => (
                  <tr key={m.userId} className={table.row}>
                    <td className={table.td}>
                      <p className="font-semibold">
                        {m.name || m.email.split("@")[0]}
                        {m.isMe && <span className="ml-1.5 text-xs font-normal text-ink/45">(you)</span>}
                      </p>
                      <p className="text-xs text-ink/50">{m.email}</p>
                    </td>
                    <td className={table.td}>
                      {m.isMe ? (
                        <Badge tone={m.isOwner ? "violet" : "blue"}>{m.role}</Badge>
                      ) : (
                        <select
                          aria-label={`Role for ${m.email}`}
                          value={m.isOwner ? OWNER : (m.roleId ?? "")}
                          disabled={busyKey === `m:${m.userId}`}
                          onChange={(e) => void run(`m:${m.userId}`, () => updateMember(m.userId, e.target.value), `${m.email} updated.`)}
                          className={`${inputClass} w-auto cursor-pointer py-1.5`}
                        >
                          {roleOptions}
                        </select>
                      )}
                    </td>
                    <td className={`${table.td} tabular-nums text-ink/60`}>{formatDate(m.lastSignIn)}</td>
                    <td className={`${table.td} text-right`}>
                      {!m.isMe && (
                        <button
                          type="button"
                          disabled={busyKey === `r:${m.userId}`}
                          onClick={() => {
                            if (!confirm(`Remove ${m.email} from the team? They lose admin access immediately.`)) return;
                            void run(`r:${m.userId}`, () => removeMember(m.userId), `${m.email} removed from the team.`);
                          }}
                          className={`${btn.ghost} text-red-600 hover:bg-red-50 disabled:opacity-60`}
                        >
                          {busyKey === `r:${m.userId}` ? <Busy text="Removing" /> : "Remove"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {invites.map((i) => (
                  <tr key={i.email} className={table.row}>
                    <td className={table.td}>
                      <p className="font-semibold">{i.email}</p>
                      <p className="text-xs text-ink/50">Added {formatDate(i.invitedAt)}</p>
                    </td>
                    <td className={table.td}>
                      <span className="flex items-center gap-2">
                        <Badge tone={i.isOwner ? "violet" : "blue"}>{i.role}</Badge>
                        <Badge tone="amber">Not signed in yet</Badge>
                      </span>
                    </td>
                    <td className={`${table.td} text-ink/40`}>—</td>
                    <td className={`${table.td} text-right`}>
                      <button
                        type="button"
                        disabled={busyKey === `i:${i.email}`}
                        onClick={() => void run(`i:${i.email}`, () => cancelInvite(i.email), `Access for ${i.email} cancelled.`)}
                        className={`${btn.ghost} text-red-600 hover:bg-red-50 disabled:opacity-60`}
                      >
                        {busyKey === `i:${i.email}` ? <Busy text="Cancelling" /> : "Cancel"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <div className="flex flex-col gap-6">
          {/* Add worker */}
          <Card title="Add worker">
            <form
              className="grid gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const data = new FormData(form);
                const email = String(data.get("email") ?? "").trim();
                const ok = await run(
                  "invite",
                  () => inviteMember(email, String(data.get("role") ?? "")),
                  `${email} added. Ask them to open /admin/login and choose "First time or forgot password?" to set their password.`,
                );
                if (ok) form.reset();
              }}
            >
              <Field label="Email">
                <input name="email" type="email" required placeholder="Worker's email address" className={inputClass} />
              </Field>
              <Field label="Role">
                <select name="role" required className={`${inputClass} cursor-pointer`} defaultValue="">
                  <option value="" disabled>
                    {roles.length ? "Choose a role" : "Create a role first"}
                  </option>
                  {roleOptions}
                </select>
              </Field>
              <button type="submit" disabled={busyKey === "invite"} className={`${btn.primary} disabled:opacity-60`}>
                {busyKey === "invite" ? <Busy text="Adding" /> : "Add worker"}
              </button>
              <p className="text-xs leading-relaxed text-ink/55">
                They get access the first time they sign in at <strong>/admin/login</strong> → &quot;First time or forgot password?&quot;, using a
                code sent to this email.
              </p>
            </form>
          </Card>

          {/* Roles */}
          <Card
            title="Roles"
            actions={
              <button type="button" onClick={() => setEditing("new")} className={btn.ghost}>
                + New role
              </button>
            }
          >
            <ul className="flex flex-col divide-y divide-ink/[0.06]">
              <li className="py-3 first:pt-0">
                <p className="text-sm font-semibold">Owner</p>
                <p className="text-xs leading-relaxed text-ink/55">Everything, including Team &amp; roles. Built in.</p>
              </li>
              {roles.map((r) => (
                <li key={r.id} className="flex items-start justify-between gap-3 py-3 last:pb-0">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold">{r.name}</p>
                    <p className="text-xs leading-relaxed text-ink/55">
                      {r.permissions.length} of {ALL_PERMISSIONS.length} permissions · {r.members} {r.members === 1 ? "person" : "people"}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <button type="button" onClick={() => setEditing(r)} className={btn.ghost}>
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={busyKey === `d:${r.id}`}
                      onClick={() => {
                        if (!confirm(`Delete the role "${r.name}"?`)) return;
                        void run(`d:${r.id}`, () => deleteRole(r.id), `Role "${r.name}" deleted.`);
                      }}
                      className={`${btn.ghost} text-red-600 hover:bg-red-50 disabled:opacity-60`}
                    >
                      {busyKey === `d:${r.id}` ? <Busy text="Deleting" /> : "Delete"}
                    </button>
                  </div>
                </li>
              ))}
              {!loading && roles.length === 0 && (
                <li className="py-3 text-sm text-ink/55 last:pb-0">No roles yet. Create one, e.g. &quot;Front desk&quot;, then add workers.</li>
              )}
            </ul>
          </Card>
        </div>
      </div>

      {editing && (
        <RoleEditor
          role={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={async (name) => {
            setEditing(null);
            await reload();
            toast(`Role "${name}" saved. Everyone with this role gets the change straight away.`);
          }}
        />
      )}
    </div>
  );
}

/** Pop-up to create or edit a role: a name and the permission checklist. */
function RoleEditor({ role, onClose, onSaved }: { role: TeamRole | null; onClose: () => void; onSaved: (name: string) => Promise<void> }) {
  const [name, setName] = useState(role?.name ?? "");
  const [perms, setPerms] = useState<Set<Permission>>(() => new Set(role?.permissions ?? []));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.documentElement.style.overflow = "";
      document.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  function toggle(key: Permission, on: boolean) {
    const next = new Set(perms);
    if (on) {
      next.add(key);
      const view = NEEDS_VIEW[key];
      if (view) next.add(view); // editing something includes seeing it
    } else {
      next.delete(key);
      for (const [k, view] of Object.entries(NEEDS_VIEW)) if (view === key) next.delete(k as Permission);
    }
    setPerms(next);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <button type="button" tabIndex={-1} aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
      <form
        role="dialog"
        aria-modal="true"
        aria-label={role ? `Edit role ${role.name}` : "New role"}
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          const err = await saveRole(role?.id ?? null, name.trim(), [...perms]);
          setBusy(false);
          if (err) setError(err);
          else await onSaved(name.trim());
        }}
        className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-paper shadow-2xl"
      >
        <div className="border-b border-ink/10 px-5 py-4">
          <p className="font-display text-lg font-semibold">{role ? "Edit role" : "New role"}</p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <Field label="Role name">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={40}
              placeholder="e.g. Front desk"
              className={inputClass}
            />
          </Field>

          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium">What this role can do</p>
              <div className="flex gap-1">
                <button type="button" onClick={() => setPerms(new Set(ALL_PERMISSIONS))} className={btn.ghost}>
                  Tick all
                </button>
                <button type="button" onClick={() => setPerms(new Set())} className={btn.ghost}>
                  Clear
                </button>
              </div>
            </div>
            <ul className="mt-2 divide-y divide-ink/[0.06] rounded-xl border border-ink/10">
              {PERMISSION_GROUPS.map((g) => (
                <li key={g.label} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-start sm:gap-4">
                  <p className="w-36 shrink-0 text-sm font-semibold">{g.label}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {g.items.map((i) => (
                      <label key={i.key} className="flex cursor-pointer items-center gap-2 text-sm text-ink/80">
                        <input
                          type="checkbox"
                          checked={perms.has(i.key)}
                          onChange={(e) => toggle(i.key, e.target.checked)}
                          className="h-4 w-4 accent-[var(--color-brand)]"
                        />
                        {i.label}
                      </label>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink/50">
              Team &amp; roles is for Owners only. Every worker can open the dashboard and their own profile.
            </p>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 border-t border-ink/10 px-5 py-4">
          <button type="button" onClick={onClose} className={`${btn.secondary} flex-1`}>
            Cancel
          </button>
          <button type="submit" disabled={busy} className={`${btn.primary} flex-1 disabled:opacity-60`}>
            {busy ? <Busy text="Saving" /> : "Save role"}
          </button>
        </div>
      </form>
    </div>
  );
}
