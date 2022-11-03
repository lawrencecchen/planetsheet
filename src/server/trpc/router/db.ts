import { z } from "zod";
import { db } from "~/server/db/client";
import { router, publicProcedure, protectedProcedure } from "../trpc";

export const dbRouter = router({
	tables: publicProcedure.query(({ ctx }) => {
		return db.introspection.getTables();
	}),
	table: publicProcedure
		.input(
			z.object({
				tableName: z.string(),
			})
		)
		.query(({ ctx, input }) => {
			return db
				.selectFrom(input.tableName as any)
				.selectAll()
				.execute();
		}),
});
