import knex from "knex";

function getConnectionString() {
  const searchEnvVars = ["DATABASE_URL", "PG_CONNECTION_STRING"];
  for (const envVar of searchEnvVars) {
    if (process.env[envVar]) {
      // console.log(`Using ${envVar}`);
      return process.env[envVar];
    }
  }
  throw new Error(
    `No connection string found. Please set one of the following environment variables: ${searchEnvVars.join(
      ", "
    )}`
  );
}

export const pg = knex({
  client: "pg",
  connection: {
    connectionString: getConnectionString(),
    // ssl: { rejectUnauthorized: false },
  },
  searchPath: ["public", "information_schema"],
  pool: { min: 0, max: 7 },
});
