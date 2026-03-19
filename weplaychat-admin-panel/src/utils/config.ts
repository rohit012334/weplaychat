export const baseURL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/";

/** Build full URL for a storage file (image/doc/video). Normalizes paths so /app/.../storage/xxx or storage/xxx becomes /storage/xxx. */
export function getStorageUrl(path: string | null | undefined): string {
  if (!path || typeof path !== "string") return "";
  const p = path.replace(/\\/g, "/").trim();
  if (p.startsWith("http")) return p;
  const afterStorage = p.split(/\/storage\//i).pop() || "";
  const filename = (afterStorage || p).replace(/^.*\//, "");
  const segment = filename ? `/storage/${filename}` : "";
  const base = (baseURL || "").replace(/\/+$/, "");
  return segment ? (base ? `${base}${segment}` : segment) : "";
}

// NOTE: anything used in the browser must be NEXT_PUBLIC_* (it will be exposed to users).
// This project currently requires a shared `key` header for API access; moving it to env
// avoids hardcoding but does NOT make it private.
export const key: string = process.env.NEXT_PUBLIC_SECRET_KEY || "";

export const projectName: string = process.env.NEXT_PUBLIC_PROJECT_NAME || "WePlayChat";

// Firebase Web (client) config
export const apiKey: string = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
export const authDomain: string = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
export const projectId: string = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
export const storageBucket: string = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
export const messagingSenderId: string = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
export const appId: string = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";
export const measurementId: string = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "";