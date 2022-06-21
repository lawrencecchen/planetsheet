import * as trpc from "@trpc/server";
import { z } from "zod";
import { pg } from "../utils/pg";
import { groupBy } from "lodash";
import { inferProcedureOutput } from "@trpc/server";

export const appRouter = trpc
  .router()
  .query("getUser", {
    input: (val: unknown) => {
      if (typeof val === "string") return val;
      throw new Error(`Invalid input: ${typeof val}`);
    },
    async resolve(req) {
      req.input; // string
      return { id: req.input, name: "Bilbo" };
    },
  })
  .query("information_schema.tables", {
    input: z.object({ schema: z.string().nullish() }).nullish(),
    async resolve({ input }) {
      type InformatonSchemaTables = {
        table_name: string;
        table_schema: string;
      };
      if (input?.schema) {
        const tables = await pg<InformatonSchemaTables>(
          "information_schema.tables"
        )
          .select(["table_schema", "table_name"])
          .where({ table_schema: input.schema })
          .groupBy("table_schema")
          // .orderByRaw(
          //   `(case when table_schema = 'public' then 1 else 2 end), table_schema asc nulls last`
          // );
          .orderBy("table_schema");
        return groupBy(tables, "table_schema");
      }
      const tables = await pg<InformatonSchemaTables>(
        "information_schema.tables"
      )
        .select(["table_schema", "table_name"])
        .orderBy(["table_schema", "table_name"]);
      return groupBy(tables, "table_schema");
    },
  })
  .query("information_schema.columns", {
    input: z.object({
      table_name: z.string().min(1),
      table_schema: z.string().min(1),
    }),
    async resolve({ input }) {
      type InformationSchemaColumns = {
        table_schema: string;
        table_name: string;
        column_name: string;
        data_type: string;
        is_nullable: string;
        ordinal_position: string;
      };
      return pg<InformationSchemaColumns>("information_schema.columns")
        .select([
          "table_schema",
          "table_name",
          "column_name",
          "data_type",
          "is_nullable",
          "ordinal_position",
        ])
        .where({
          table_schema: input.table_schema,
          table_name: input.table_name,
        });
    },
  })
  .query("tableData", {
    input: z.object({
      table_name: z.string().min(1),
      table_schema: z.string().min(1),
      limit: z.number().default(300),
      offset: z.number().default(0),
    }),
    async resolve({ input }) {
      return pg(input.table_name)
        .select()
        .limit(input.limit)
        .offset(input.offset);
    },
  })
  .mutation("createUser", {
    // validate input with Zod
    input: z.object({ name: z.string().min(5) }),
    async resolve(req) {
      // use your ORM of choice
      // return await UserModel.create({
      //   data: req.input,
      // });
      return {};
    },
  });

export type AppRouter = typeof appRouter;
export type inferQueryResponse<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;
