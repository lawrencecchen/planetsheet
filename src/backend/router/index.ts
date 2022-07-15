import { TableDataInputValidator } from "@/validators/TableDataInput";
import * as trpc from "@trpc/server";
import { inferProcedureOutput } from "@trpc/server";
import { groupBy } from "lodash-es";
import superjson from "superjson";
import { z } from "zod";
import { db } from "../utils/db";

const ColumnValidator = z.object({
  table_schema: z.string(),
  table_name: z.string(),
  column_name: z.string(),
  column_default: z.string().nullish(),
  data_type: z.string(),
  is_nullable: z.string(),
  ordinal_position: z.number(),
});
const ColumnsValidator = z.array(ColumnValidator);

function asIdentity<T extends string>(str: T) {
  return db.ref(str).as(str);
}

async function getColumns(input: { table_schema: string; table_name: string }) {
  // type InformationSchemaColumns = z.infer<typeof ColumnValidator>;
  const unsafe_columns = await db("information_schema.columns")
    .select(
      [
        "table_schema",
        "table_name",
        "column_name",
        "column_default",
        "data_type",
        "is_nullable",
        "ordinal_position",
      ].map(asIdentity)
    )
    .where({
      table_schema: input.table_schema,
      table_name: input.table_name,
    });

  const result_1 = ColumnsValidator.safeParse(unsafe_columns);
  if (result_1.success) {
    return result_1.data;
  }
  const result_2 = ColumnsValidator.safeParse(unsafe_columns);
  if (result_2.success) {
    return result_2.data;
  }

  throw new Error("Invalid columns");
}

// function

export const appRouter = trpc
  .router()
  .transformer(superjson)
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
        const tables = await db<InformatonSchemaTables>(
          "information_schema.tables"
        )
          .select([asIdentity("table_name"), asIdentity("table_schema")])
          .where({ table_schema: input.schema })
          .groupBy("table_schema")
          // .orderByRaw(
          //   `(case when table_schema = 'public' then 1 else 2 end), table_schema asc nulls last`
          // );
          .orderBy("table_schema");
        return groupBy(tables, "table_schema");
      }
      const tables = await db<InformatonSchemaTables>(
        "information_schema.tables"
      )
        .select([asIdentity("table_name"), asIdentity("table_schema")])
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
      return getColumns({
        table_schema: input.table_schema,
        table_name: input.table_name,
      });
    },
  })
  .query("tableData", {
    input: TableDataInputValidator,
    async resolve({ input }) {
      let baseQuery = db(input.table_schema + "." + input.table_name)
        .select()
        .limit(input.limit)
        .offset(input.offset);
      if (input.orderBy) {
        baseQuery = baseQuery.orderBy(input.orderBy);
      }
      return baseQuery;
    },
  })
  .mutation("editCell", {
    input: z.object({
      table_name: z.string().min(1),
      table_schema: z.string().min(1),
      identifier_column: z.string().min(1),
      identifier_value: z.string().min(1),
      column: z.string().min(1),
      value: z
        .union([
          z.string(),
          z.number(),
          z.boolean(),
          z.array(z.string()),
          z.object({}),
        ])
        .nullish(),
    }),
    async resolve({ input }) {
      return db(input.table_schema + "." + input.table_name)
        .where(input.identifier_column, "=", input.identifier_value)
        .update({
          [input.column]: input.value,
        });
    },
  })
  .mutation("addRows", {
    input: z.object({
      table_name: z.string().min(1),
      table_schema: z.string().min(1),
      rows: z.array(z.unknown()),
    }),
    async resolve({ input }) {
      const columns = await getColumns({
        table_name: input.table_name,
        table_schema: input.table_schema,
      });
      const formattedRows = input.rows.map((row: any) => {
        const formattedRow = {} as Record<string, any>;
        for (const column of columns) {
          const value = row[column.column_name];
          if (column.column_default === value) {
            // delete formattedRow[column.column_name];
            continue;
          }
          if (column.is_nullable === "YES" && value.length === 0) {
            continue;
          }
          formattedRow[column.column_name] = value;
        }
        return formattedRow;
      });
      console.log(formattedRows);
      return db(input.table_schema + "." + input.table_name).insert(
        formattedRows
      );
    },
  });

export type AppRouter = typeof appRouter;
export type inferQueryResponse<
  TRouteKey extends keyof AppRouter["_def"]["queries"]
> = inferProcedureOutput<AppRouter["_def"]["queries"][TRouteKey]>;
