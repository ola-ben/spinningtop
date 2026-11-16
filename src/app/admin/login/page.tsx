import Image from "next/image";
import Link from "next/link";
import LoginForm from "./LoginForm";

export const metadata = { title: "Sign in" };

/* Admin sign-in. AdminShell renders this route without the sidebar/top bar. */
export default function LoginPage() {
  return (
    <div className="grid min-h-screen bg-[#f3f4f6] lg:grid-cols-2">
      {/* Form */}
      <div className="flex flex-col px-5 py-6 sm:px-10">
        <Link href="/" className="inline-flex h-12 w-fit items-center rounded-2xl bg-paper px-3 shadow-sm">
          <Image src="/spinning-top-logo.jpg" alt="Spinning Top" width={1168} height={424} className="h-9 w-auto" priority />
        </Link>

        <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
          <div className="rounded-2xl bg-paper p-6 shadow-sm sm:p-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-ink/55">Sign in to manage your store.</p>
            <div className="mt-7">
              <LoginForm />
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-ink/50">
            Need access? Ask the business owner to invite you from Team &amp; roles.
          </p>
        </div>

        <p className="text-xs text-ink/40">© Spinning Top Drycleaners &amp; Launderers</p>
      </div>

      {/* Brand panel (desktop) */}
      <div className="relative hidden overflow-hidden bg-brand p-3 lg:block">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1px)] [background-size:22px_22px]"
        />
        <div aria-hidden="true" className="absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full border border-paper/20" />
        <div aria-hidden="true" className="absolute -bottom-40 -left-24 h-[34rem] w-[34rem] rounded-full border border-paper/15" />
        <div className="relative flex h-full flex-col justify-end p-12 text-paper">
          <p className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Orders, products and services — in one place.
          </p>
          <p className="mt-4 max-w-md text-paper/75">The Spinning Top admin panel.</p>
        </div>
      </div>
    </div>
  );
}
