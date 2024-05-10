import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileKey(url: string) {
  const parts = url.split('/f/');
  if (parts.length < 2) return null; // If the URL format is incorrect

  const fileKey = parts[1] // Extracting the file key
  return fileKey;
}