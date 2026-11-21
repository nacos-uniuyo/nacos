export type UploadResult = {
  secureUrl: string;
  publicId: string;
};

/**
 * Uploads a client-selected image directly to Cloudinary using a secure
 * server-generated signature from /api/cloudinary/signature.
 */
export async function uploadImageToCloudinary(file: File): Promise<UploadResult> {
  const sigRes = await fetch("/api/cloudinary/signature", { method: "POST" });
  if (!sigRes.ok) {
    const err = await sigRes.json().catch(() => ({}));
    throw new Error(err.error || "Failed to obtain upload authorization.");
  }

  const { cloudName, apiKey, timestamp, folder, signature } = await sigRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", folder);
  formData.append("signature", signature);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });

  if (!uploadRes.ok) {
    const errData = await uploadRes.json().catch(() => ({}));
    throw new Error(errData.error?.message || "Cloudinary image upload failed.");
  }

  const result = await uploadRes.json();
  return {
    secureUrl: result.secure_url,
    publicId: result.public_id,
  };
}
