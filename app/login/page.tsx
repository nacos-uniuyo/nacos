import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { SignInButton, SignOutButton } from "./sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google to manage NACOS UNIUYO portal content.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  return (
    <section className="bg-[var(--paper)]">
      <div className="mx-auto grid min-h-[calc(100svh-74px)] max-w-[1312px] items-stretch lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative isolate hidden overflow-hidden bg-[var(--forest)] px-[clamp(32px,6vw,88px)] py-[clamp(56px,9vw,120px)] lg:flex lg:flex-col lg:justify-between">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.16]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--mint) 1px, transparent 1px), linear-gradient(to bottom, var(--mint) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
            }}
          />
          <p className="caps relative text-[0.72rem] tracking-[0.28em] text-[var(--gold)]">
            Member access
          </p>
          <div className="relative max-w-[30ch]">
            <h1 className="serif text-[clamp(2.9rem,5.4vw,4.6rem)] leading-[0.98] text-[var(--paper)]">
              One account. <span className="it text-[var(--gold)]">Everything NACOS.</span>
            </h1>
            <p className="mt-7 max-w-[38ch] text-[0.98rem] leading-relaxed text-[var(--mint-2)]">
              Students, staff and alumni use the same NACOS account. Your role decides what you can edit, and the
              public site stays readable without one.
            </p>
          </div>
          <p className="relative text-xs tracking-wide text-[var(--mint)]/70">
            Faculty of Computing · University of Uyo
          </p>
        </div>

        <div className="flex items-center justify-center px-[clamp(20px,5vw,64px)] py-[clamp(56px,10vw,112px)]">
          <div className="w-full max-w-[440px]">
            <p className="caps text-[0.7rem] tracking-[0.26em] text-[var(--green)] lg:hidden">Member access</p>
            <h2 className="serif mt-2 text-[clamp(2rem,6vw,2.9rem)] leading-[1.02] text-[var(--ink)] lg:mt-0">
              {session ? "You are signed in." : "Sign in with your Google account."}
            </h2>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--muted)]">
              {session
                ? "Everything tied to your role is available from here. Signing out only ends this browser session."
                : "Use the Google account you want attached to your NACOS profile. We only read your name and email address."}
            </p>

            <Card className="mt-8 border-[var(--rule)] bg-white/80 shadow-[0_1px_0_rgba(6,42,20,0.04),0_24px_60px_-40px_rgba(6,42,20,0.35)]">
              <CardContent className="space-y-6 p-6 sm:p-8">
                {session ? (
                  <>
                    <div>
                      <p className="caps text-[0.68rem] tracking-[0.22em] text-[var(--muted)]">Signed in as</p>
                      <p className="mt-1 text-base font-medium text-[var(--ink)]">{session.user.name}</p>
                      <p className="text-sm text-[var(--muted)]">{session.user.email}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                      <SignOutButton />
                      <Link href="/" className="text-sm font-medium text-[var(--green)] underline-offset-4 hover:underline">
                        Back to the portal
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <SignInButton />
                    <p className="text-xs leading-relaxed text-[var(--muted)]">
                      By continuing you agree to be contacted about NACOS activities. Your Google password never
                      reaches this site.
                    </p>
                  </>
                )}
              </CardContent>
            </Card>

            <p className="mt-6 text-sm text-[var(--muted)]">
              Not a member yet?{" "}
              <Link href="/#about" className="font-medium text-[var(--green)] underline-offset-4 hover:underline">
                Read what NACOS does
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
