import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { SignInButton } from "./sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google to manage NACOS UNIUYO portal content.",
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <section className="bg-[var(--paper)]">
      <div className="mx-auto flex min-h-[calc(100svh-74px)] max-w-[1312px] items-center justify-center px-[clamp(20px,5vw,64px)] py-[clamp(56px,10vw,112px)]">
        <div className="w-full max-w-[440px]">
          <h1 className="serif text-[clamp(2.2rem,5vw,3rem)] leading-[1.05] text-[var(--ink)]">
            Sign in to NACOS
          </h1>
          <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--muted)]">
            Use the Google account you want attached to your NACOS profile. We only read your name and email address.
          </p>

          <div className="mt-8 space-y-6">
            <div className="space-y-4">
              <SignInButton />
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                By continuing you agree to be contacted about NACOS activities. Your Google password never
                reaches this site.
              </p>
            </div>
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
