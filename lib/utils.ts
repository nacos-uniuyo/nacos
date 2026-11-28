import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** True only for http and https links, so a submitted `javascript:` URL never becomes an href. */
export function isHttpUrl(value: string | null | undefined): value is string {
  return Boolean(value && (value.startsWith("https://") || value.startsWith("http://")));
}
