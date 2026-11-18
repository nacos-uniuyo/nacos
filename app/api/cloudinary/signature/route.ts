import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { createUploadSignature } from "@/lib/cloudinary";

/**
 * Only signed-in members can upload media. The response contains a timestamp,
 * the parameters and their signature, never the API secret.
 */
export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session) {
    return Response.json({ error: "Sign in to upload files." }, { status: 401 });
  }

  return Response.json(createUploadSignature(), {
    headers: { "cache-control": "no-store" },
  });
}
