import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSlideshow } from "@/components/AuthSlideshow";
import { auth } from "@/lib/auth";
import { SignInButton } from "./sign-in";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google to manage NACOS UNIUYO portal content.",
  robots: { index: false, follow: false },
};

/**
 * A standalone auth screen. It sits outside the (public) route group on purpose,
 * so it gets neither the site header nor the footer: the whole viewport is the
 * sign-in surface, and the way back to the site is the pill on the image panel.
 */
export default async function LoginPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session) {
    redirect("/dashboard");
  }

  return (
    <main id="main" className="min-h-svh bg-[var(--deep)] p-3 sm:p-4 lg:p-5">
      <div className="grid min-h-[calc(100svh-24px)] gap-4 sm:min-h-[calc(100svh-32px)] lg:min-h-[calc(100svh-40px)] lg:grid-cols-2 lg:gap-5">
        <AuthSlideshow />

        <div className="flex items-center justify-center px-2 py-12 sm:px-8 lg:px-12">
          <div className="w-full max-w-[420px]">
            <h1 className="serif m-0 text-[clamp(2.1rem,4.4vw,2.9rem)] leading-[1.05] text-white">
              Sign in to NACOS
            </h1>
            <p className="mt-4 text-[0.95rem] leading-relaxed text-[var(--mint-2)]">
              Use the Google account you want attached to your NACOS profile. We only read your name and
              email address.
            </p>

            <div className="mt-9 space-y-4">
              <SignInButton />
              <p className="text-xs leading-relaxed text-[var(--mint)]">
                By continuing you agree to be contacted about NACOS activities. Your Google password never
                reaches this site.
              </p>
            </div>

            <p className="mt-9 text-sm text-[var(--mint)]">
              Not a member yet?{" "}
              <Link
                href="/#about"
                className="font-medium text-[var(--gold)] underline-offset-4 hover:underline"
              >
                Read what NACOS does
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
