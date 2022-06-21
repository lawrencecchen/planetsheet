import knex from "knex";

export const pg = knex({
  client: "pg",
  connection: {
    connectionString: process.env.PG_CONNECTION_STRING,
    // ssl: { rejectUnauthorized: false },
  },
  searchPath: ["public", "information_schema"],
  pool: { min: 0, max: 7 },
});
