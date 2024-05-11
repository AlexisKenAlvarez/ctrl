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

export function toMilitaryTime(time: string) {
  const value = time.split(" ")

  if (value[1] === "AM") {
    return parseInt(value[0]!)
  } else {
    return parseInt(value[0]!) + 12
  }
}

export function isLabOpen(openTime: number, closeTime: number) {
  const now = new Date();
  const currentTime = now.getHours();

  if (currentTime >= openTime && currentTime < closeTime) {
    return true
  }
}