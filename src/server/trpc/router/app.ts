import { router } from "../trpc";
import { authRouter } from "./auth";
import { dbRouter } from "./db";
import { exampleRouter } from "./example";

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  db: dbRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
