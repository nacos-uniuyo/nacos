import { v2 as cloudinary } from "cloudinary";
import { env } from "@/env";

/**
 * Server-side Cloudinary configuration. The API secret stays here: the browser
 * never sees it, and never uploads with the secret either. It asks
 * /api/cloudinary/signature for a short-lived signature and posts the file
 * straight to Cloudinary.
 */
cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
  secure: true,
});

export const uploadFolder = "nacos/uploads";

export type UploadSignature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/**
 * Signs exactly the parameters the client sends. Adding a parameter to the
 * upload without adding it here invalidates the signature, which is the point:
 * the server decides what is allowed.
 */
export function createUploadSignature(): UploadSignature {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = uploadFolder;
  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    env.CLOUDINARY_API_SECRET,
  );

  return {
    cloudName: env.CLOUDINARY_CLOUD_NAME,
    apiKey: env.CLOUDINARY_API_KEY,
    timestamp,
    folder,
    signature,
  };
}
