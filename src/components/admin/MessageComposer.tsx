"use client";

import { useState } from "react";
import { MESSAGE_TEMPLATES } from "@/lib/admin-demo";
import { Field, btn, inputClass } from "./ui";

/* Compose a message for a customer's My account → Inbox.
   Picking a template fills in the title and text ({order} / {outlet} are
   replaced from the fields). Sending is wired up with the backend. */
export default function MessageComposer() {
  const [order, setOrder] = useState("");
  const [outlet, setOutlet] = useState("Oluyole");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");

  function applyTemplate(i: number) {
    const t = MESSAGE_TEMPLATES[i];
    if (!t) return;
    setTitle(t.title);
    setBody(t.body.replaceAll("{order}", order || "{order}").replaceAll("{outlet}", outlet));
  }

  return (
    <form className="mt-4 flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
      <Field label="Customer" hint="Name, email or phone of a website account.">
        <input name="customer" placeholder="Search customer…" className={inputClass} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Order (optional)">
          <input value={order} onChange={(e) => setOrder(e.target.value)} placeholder="ST-1042" className={inputClass} />
        </Field>
        <Field label="Outlet">
          <select value={outlet} onChange={(e) => setOutlet(e.target.value)} className={inputClass}>
            <option>Oluyole</option>
            <option>Dominion University</option>
          </select>
        </Field>
      </div>
      <Field label="Template">
        <select className={inputClass} defaultValue="" onChange={(e) => applyTemplate(Number(e.target.value))}>
          <option value="" disabled>
            Choose an order update…
          </option>
          {MESSAGE_TEMPLATES.map((t, i) => (
            <option key={t.title} value={i}>
              {t.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Title">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Message title" className={inputClass} />
      </Field>
      <Field label="Message">
        <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={5} placeholder="Write a message…" className={`${inputClass} resize-none`} />
      </Field>
      <div>
        <button type="submit" disabled={!title || !body} className={`${btn.primary} disabled:cursor-not-allowed disabled:opacity-50`}>
          Send to inbox
        </button>
      </div>
    </form>
  );
}
