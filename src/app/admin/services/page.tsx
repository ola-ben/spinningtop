import ServiceIcon from "@/components/ServiceIcon";
import { Badge, Field, PageHeader, SettingRow, Toggle, btn, inputClass } from "@/components/admin/ui";
import { SERVICES } from "@/lib/admin-demo";

export const metadata = { title: "Services" };

export default function ServicesPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Services"
        description="Care services shown on the website. Turn off anything not currently offered."
        actions={
          <>
            <button type="button" className={btn.secondary}>
              + Add service
            </button>
            <button type="button" className={btn.primary}>
              Save changes
            </button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {SERVICES.map((s) => (
          <section key={s.id} className="flex flex-col rounded-2xl border border-ink/10 bg-paper p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink/[0.05] text-ink">
                <ServiceIcon name={s.icon} className="h-5 w-5" />
              </span>
              <Badge tone={s.available ? "green" : "grey"}>{s.available ? "Available" : "Paused"}</Badge>
            </div>
            <h2 className="mt-4 font-display text-base font-semibold">{s.name}</h2>

            <div className="mt-4 grid gap-4">
              <Field label="Starting price (₦)" hint="Leave empty for “quote only”.">
                <input
                  type="number"
                  min={0}
                  defaultValue={s.fromPrice ?? undefined}
                  placeholder="Quote only"
                  className={inputClass}
                />
              </Field>
              <div className="divide-y divide-ink/10">
                <SettingRow title="Taking bookings">
                  <Toggle label={`${s.name} available`} defaultChecked={s.available} />
                </SettingRow>
                <SettingRow title="Show on website">
                  <Toggle label={`${s.name} visible`} defaultChecked={s.visible} />
                </SettingRow>
              </div>
            </div>

            <button type="button" className={`${btn.ghost} mt-4 self-start`}>
              Edit details →
            </button>
          </section>
        ))}
      </div>
    </div>
  );
}
