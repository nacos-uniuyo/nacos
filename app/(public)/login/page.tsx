import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <div className="mx-auto flex min-h-[calc(100svh-74px)] max-w-[1312px] items-center justify-center px-[clamp(20px,5vw,64px)] py-[clamp(56px,10vw,112px)]">
        <div className="w-full max-w-[440px]">
          <h1 className="serif text-[clamp(2.2rem,5vw,3rem)] leading-[1.05] text-[var(--ink)]">
            {session ? "You are signed in." : "Sign in to NACOS"}
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            {session
              ? "Everything tied to your role is available from here. Signing out only ends this browser session."
              : "Use the Google account you want attached to your NACOS profile. We only read your name and email address."}
          </p>

          <div className="mt-8 space-y-6">
            {session ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name}
                      width={44}
                      height={44}
                      className="size-11 rounded-full object-cover border border-[var(--rule)]"
                    />
                  ) : (
                    <div className="flex size-11 items-center justify-center rounded-full bg-[var(--forest)] text-sm font-semibold text-[var(--gold)]">
                      {session.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="caps text-[0.68rem] tracking-[0.22em] text-[var(--muted)]">Signed in as</p>
                    <p className="mt-0.5 text-base font-medium text-[var(--ink)]">{session.user.name}</p>
                    <p className="text-sm text-[var(--muted)]">{session.user.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button asChild size="sm">
                    <Link href="/dashboard">Go to Dashboard</Link>
                  </Button>
                  <SignOutButton />
                  <Link href="/" className="text-sm font-medium text-[var(--muted)] underline-offset-4 hover:underline">
                    Back to homepage
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <SignInButton />
                <p className="text-xs leading-relaxed text-[var(--muted)]">
                  By continuing you agree to be contacted about NACOS activities. Your Google password never
                  reaches this site.
                </p>
              </div>
            )}
          </div>

          <p className="mt-8 text-sm text-[var(--muted)]">
            Not a member yet?{" "}
            <Link href="/#about" className="font-medium text-[var(--green)] underline-offset-4 hover:underline">
              Read what NACOS does
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
