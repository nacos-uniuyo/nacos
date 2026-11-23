import type { RichTextDoc, RichTextNode } from "@/db/json";
import { uploadImage } from "@/lib/cloudinary-client";

export const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

export function validateImageFile(file: File): ImageValidationResult {
  if (!file.type.startsWith("image/")) {
    return { valid: false, error: "Please select a valid image file." };
  }
  if (file.size > MAX_IMAGE_FILE_SIZE) {
    return { valid: false, error: "Image file exceeds the 10MB maximum size limit." };
  }
  return { valid: true };
}

export interface LocalImagePreview {
  blobUrl: string;
  alt: string;
  node: RichTextNode;
}

/**
 * Creates an instantaneous 0ms local preview node for TipTap AST.
 * This mirrors the Modools pattern of inserting immediate local feedback
 * while background network streaming takes place.
 */
export function createLocalImagePreview(file: File, caption?: string): LocalImagePreview {
  const blobUrl = URL.createObjectURL(file);
  const alt = file.name.replace(/\.[^/.]+$/, "");
  const node: RichTextNode = {
    type: "image",
    attrs: {
      src: blobUrl,
      alt,
      title: caption || alt,
    },
  };

  return { blobUrl, alt, node };
}

/**
 * Recursively replaces a temporary local blob URL with the permanent public CDN URL
 * across the TipTap RichTextDoc AST.
 */
export function swapImageUrlInDoc(doc: RichTextDoc, fromUrl: string, toUrl: string): RichTextDoc {
  function traverse(node: RichTextNode): RichTextNode {
    if (node.type === "image" && node.attrs.src === fromUrl) {
      return {
        ...node,
        attrs: {
          ...node.attrs,
          src: toUrl,
        },
      };
    }

    if ("content" in node && Array.isArray(node.content)) {
      return {
        ...node,
        content: node.content.map(traverse),
      };
    }

    return node;
  }

  return {
    ...doc,
    content: doc.content.map(traverse),
  };
}

/**
 * Recursively removes an image node from the AST if an upload failed.
 */
export function removeImageFromDoc(doc: RichTextDoc, blobUrl: string): RichTextDoc {
  function filterNodes(nodes: RichTextNode[]): RichTextNode[] {
    return nodes
      .filter((n) => !(n.type === "image" && n.attrs.src === blobUrl))
      .map((n) => {
        if ("content" in n && Array.isArray(n.content)) {
          return { ...n, content: filterNodes(n.content) };
        }
        return n;
      });
  }

  return {
    ...doc,
    content: filterNodes(doc.content),
  };
}

/**
 * Uploads an image file to the media backend and swaps the local preview URL
 * inside the document AST. Revokes the local object URL upon completion or failure.
 */
export async function uploadAndSwapImageInDoc({
  file,
  blobUrl,
  doc,
}: {
  file: File;
  blobUrl: string;
  doc: RichTextDoc;
}): Promise<RichTextDoc> {
  try {
    const uploaded = await uploadImage(file);
    return swapImageUrlInDoc(doc, blobUrl, uploaded.secure_url);
  } finally {
    URL.revokeObjectURL(blobUrl);
  }
}
