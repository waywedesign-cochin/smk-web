// src/lib/config.ts
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://stockbackend-eight.vercel.app/" // production fallback
    : "http://localhost:3001");
