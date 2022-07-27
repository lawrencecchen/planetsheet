import z from "zod";

export const OrderByValidator = z
  .array(
    z.union([
      z.string(),
      z.object({
        column: z.string(),
        order: z.enum(["asc", "desc"]).optional(),
        nulls: z.enum(["first", "last"]).optional(),
      }),
    ])
  )
  .nullish();

export const TableDataInputValidator = z.object({
  table_name: z.string().min(1),
  table_schema: z.string().min(1),
  limit: z.number().default(300),
  offset: z.number().default(0),
  orderBy: OrderByValidator,
});
