import type { AppRouter } from "@/backend/router";
import { createReactQueryHooks } from "@trpc/react";

export function getBaseUrl() {
  if (process.browser) return ""; // Browser should use current path
  // if (typeof window !== "undefined") return ""; // Browser should use current path
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url

  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
}

export const trpc = createReactQueryHooks<AppRouter>();
