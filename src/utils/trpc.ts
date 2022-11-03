import { httpBatchLink, loggerLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import { type inferRouterDef } from "@trpc/server";
import superjson from "superjson";
import { AppRouter } from "~/server/trpc/router/app";

const getBaseUrl = () => {
	if (typeof window !== "undefined") return ""; // browser should use relative url
	if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
	return `http://localhost:${process.env.PORT ?? 5173}`; // dev SSR should use localhost
};

export const trpc = createTRPCReact<AppRouter>();
export const trpcClient = trpc.createClient({
	transformer: superjson,
	links: [
		loggerLink({
			enabled: (opts) =>
				process.env.NODE_ENV === "development" ||
				(opts.direction === "down" && opts.result instanceof Error),
		}),
		httpBatchLink({
			url: `${getBaseUrl()}/api/trpc`,
		}),
	],
});

/**
 * Inference helpers
 * @example type HelloOutput = RouterTypes['example']['hello']['output']
 **/
export type RouterTypes = inferRouterDef<AppRouter>;
