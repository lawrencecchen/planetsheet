import type { Knex } from "knex";

declare global {
  var __planetsheetConnection: Knex<any, unknown[]> | null;
}
