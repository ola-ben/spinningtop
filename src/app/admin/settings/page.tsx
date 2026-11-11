import { ShopSwitch } from "../AdminForms";
import { Card, Field, PageHeader, SettingRow, Toggle, btn, inputClass } from "@/components/admin/ui";
import { LINK_HUB, PHONE_DISPLAY, SITE_DESCRIPTION, SITE_NAME, SOCIALS, WHATSAPP_NUMBER } from "@/lib/site";
import { getShopSettings, settingsStorageReady } from "@/lib/shop-settings";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const { showProducts } = await getShopSettings();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Store, business details, social links and search appearance."
        actions={
          <button type="button" className={btn.primary}>
            Save changes
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Card title="Business details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Business name" className="sm:col-span-2">
                <input defaultValue={SITE_NAME} className={inputClass} />
              </Field>
              <Field label="Phone">
                <input defaultValue={PHONE_DISPLAY} className={inputClass} />
              </Field>
              <Field label="WhatsApp number" hint="International format, no +.">
                <input defaultValue={WHATSAPP_NUMBER} className={inputClass} />
              </Field>
              <Field label="Email">
                <input type="email" placeholder="hello@spinningtop.ng" className={inputClass} />
              </Field>
              <Field label="Link hub">
                <input defaultValue={LINK_HUB} className={inputClass} />
              </Field>
            </div>
          </Card>

          <Card title="Social links">
            <div className="grid gap-4 sm:grid-cols-2">
              {SOCIALS.map((s) => (
                <Field key={s.id} label={s.label}>
                  <input defaultValue={s.href} className={inputClass} />
                </Field>
              ))}
            </div>
          </Card>

          <Card title="Search & sharing (SEO)">
            <div className="grid gap-4">
              <Field label="Site title">
                <input defaultValue={SITE_NAME} className={inputClass} />
              </Field>
              <Field label="Description" hint="About 150 characters. Shown in Google results.">
                <textarea rows={3} defaultValue={SITE_DESCRIPTION} className={inputClass} />
              </Field>
              <Field label="Website address">
                <input placeholder="https://spinningtop.ng" className={inputClass} />
              </Field>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-6">
          <Card title="Store">
            <div className="divide-y divide-ink/10">
              <SettingRow title="Online shop" description="Show products on /shop. Off shows “Coming soon”. (Live)">
                <ShopSwitch on={showProducts} />
              </SettingRow>
              <SettingRow title="Cart orders via WhatsApp" description="Customers send their cart as a WhatsApp message.">
                <Toggle label="Cart orders via WhatsApp" defaultChecked />
              </SettingRow>
              <SettingRow title="Online payment" description="Paystack / Flutterwave — Phase 2 (Brand Book p.15).">
                <Toggle label="Online payment" />
              </SettingRow>
              <SettingRow title="Wishlist">
                <Toggle label="Wishlist" defaultChecked />
              </SettingRow>
            </div>
            {!settingsStorageReady() && (
              <p className="mt-4 rounded-xl bg-amber-50 p-3 text-xs text-amber-800">
                The shop switch can&rsquo;t be saved yet — connect a database (Upstash Redis on Vercel).
              </p>
            )}
          </Card>

          <Card title="Notifications">
            <div className="divide-y divide-ink/10">
              <SettingRow title="New order">
                <Toggle label="Notify on new order" defaultChecked />
              </SettingRow>
              <SettingRow title="Low stock">
                <Toggle label="Notify on low stock" defaultChecked />
              </SettingRow>
            </div>
          </Card>

          <Card title="Danger zone">
            <p className="text-xs text-ink/55">Put the whole website into maintenance mode.</p>
            <button type="button" className={`${btn.danger} mt-3 w-full`}>
              Enable maintenance mode
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
