export const baseURL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000/";

export const key: string = process.env.NEXT_PUBLIC_SECRET_KEY || "";
export const projectName: string = process.env.NEXT_PUBLIC_PROJECT_NAME || "WePlayChat";

export const apiKey: string = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
export const authDomain: string = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
export const projectId: string = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
export const storageBucket: string = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "";
export const messagingSenderId: string = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
export const appId: string = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";
export const measurementId: string = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "";