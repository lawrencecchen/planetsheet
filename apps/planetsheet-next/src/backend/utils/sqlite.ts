import knex from "knex";

export const sqlite = knex({
  client: "better-sqlite3",
  connection: {
    filename: "sqlite.db",
  },
});
