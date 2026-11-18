import Link from "next/link";
import PasswordInput from "@/components/admin/PasswordInput";
import { Badge, Card, Field, PageHeader, SettingRow, Toggle, btn, inputClass } from "@/components/admin/ui";

export const metadata = { title: "My profile" };

/* Signed-in user's profile. Values are placeholders until the backend
   supplies the real user (name, email, phone, role, photo). */
const USER = { name: "Spinning Top Admin", email: "admin@spinningtop.ng", phone: "", role: "Owner" };

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

export default function ProfilePage() {
  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="My profile"
        description="Your details and sign-in settings."
        actions={
          <button type="button" className={btn.primary}>
            Save changes
          </button>
        }
      />

      {/* Summary */}
      <section className="flex flex-wrap items-center gap-5 rounded-2xl bg-paper p-5 shadow-sm sm:p-6">
        <span className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-brand font-display text-2xl font-semibold text-paper">
          {initials(USER.name)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-xl font-semibold tracking-tight">{USER.name}</p>
          <p className="mt-0.5 truncate text-sm text-ink/55">{USER.email}</p>
          <div className="mt-2">
            <Badge tone="blue">{USER.role}</Badge>
          </div>
        </div>
        <label className={`${btn.secondary} max-sm:w-full`}>
          Change photo
          <input type="file" accept="image/*" className="sr-only" />
        </label>
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <Card title="Personal details">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" className="sm:col-span-2">
                <input defaultValue={USER.name} autoComplete="name" className={inputClass} />
              </Field>
              <Field label="Email" hint="Used to sign in.">
                <input type="email" placeholder="Your email address" defaultValue={USER.email} autoComplete="email" className={inputClass} />
              </Field>
              <Field label="Phone">
                <input type="tel" defaultValue={USER.phone} placeholder="0800 000 0000" autoComplete="tel" className={inputClass} />
              </Field>
              <Field label="Role" hint="Changed by the owner in Team & roles.">
                <input value={USER.role} readOnly className={`${inputClass} cursor-not-allowed bg-[#f3f4f6] text-ink/60`} />
              </Field>
            </div>
          </Card>

          <Card title="Change password" description="Use at least 8 characters.">
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Current password" className="sm:col-span-2">
                <PasswordInput name="current" autoComplete="current-password" />
              </Field>
              <Field label="New password">
                <PasswordInput name="new" autoComplete="new-password" />
              </Field>
              <Field label="Confirm new password">
                <PasswordInput name="confirm" autoComplete="new-password" />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <button type="button" className={btn.secondary}>
                Update password
              </button>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-5">
          <Card title="Notifications">
            <div className="mt-4 flex flex-col divide-y divide-ink/[0.06]">
              <SettingRow title="New orders" description="Email me when an order comes in.">
                <Toggle label="Email me about new orders" defaultChecked />
              </SettingRow>
              <SettingRow title="Low stock" description="Email me when a product runs out.">
                <Toggle label="Email me about low stock" defaultChecked />
              </SettingRow>
            </div>
          </Card>

          <Card title="Session">
            <p className="mt-2 text-sm text-ink/55">Sign out of the admin on this device.</p>
            <Link href="/admin/login" className={`${btn.danger} mt-4 w-full`}>
              Log out
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
