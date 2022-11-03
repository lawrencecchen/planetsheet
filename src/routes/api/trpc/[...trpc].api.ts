import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { RequestContext } from "rakkasjs";
import { createContext } from "~/server/trpc/context";
import { appRouter } from "~/server/trpc/router/app";

const trpcHandler = (context: RequestContext) => {
	// console.log(req);
	return fetchRequestHandler({
		router: appRouter,
		createContext,
		onError: import.meta.env.DEV
			? ({ path, error }) => {
					console.error(`❌ tRPC failed on ${path}: ${error}`);
			  }
			: undefined,
		req: context.request,
		endpoint: "/api/trpc",
	});
};

export const get = trpcHandler;
export const post = trpcHandler;
