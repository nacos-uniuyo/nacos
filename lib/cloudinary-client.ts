export type CloudinaryUpload = {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
};

type Signature = {
  cloudName: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
};

/**
 * Browser-side upload. The file goes straight to Cloudinary; our server only
 * signs the request. Use the returned `public_id` to delete the asset later and
 * `secure_url` to store in the matching `*_url` column.
 */
export async function uploadImage(file: File): Promise<CloudinaryUpload> {
  const response = await fetch("/api/cloudinary/signature", { method: "POST" });
  if (!response.ok) {
    throw new Error("Could not get an upload signature. Sign in and try again.");
  }

  const signature = (await response.json()) as Signature;

  const body = new FormData();
  body.append("file", file);
  body.append("api_key", signature.apiKey);
  body.append("timestamp", String(signature.timestamp));
  body.append("folder", signature.folder);
  body.append("signature", signature.signature);

  const upload = await fetch(`https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`, {
    method: "POST",
    body,
  });

  if (!upload.ok) {
    throw new Error("Cloudinary rejected the upload.");
  }

  return (await upload.json()) as CloudinaryUpload;
}
