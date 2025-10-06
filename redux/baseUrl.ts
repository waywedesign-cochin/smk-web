// If NEXT_PUBLIC_BASE_URL is not set in production, use empty string
export const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001");
