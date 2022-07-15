import knex from "knex";
import dotenv from "dotenv";

function getConnectionString() {
  dotenv.config();
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

function getConnection() {
  const connectionString = getConnectionString();
  if (connectionString?.includes("postgres")) {
    return knex({
      client: "pg",
      connection: connectionString,
      searchPath: ["public", "information_schema"],
      pool: { min: 0, max: 7 },
    });
  }
  if (connectionString?.includes("mysql")) {
    return knex({
      client: "mysql",
      connection: connectionString,
    });
  }

  throw new Error("Unsupported connection string.");
}

export const db = getConnection();

// export const db = knex({
//   client: "pg",
//   connection: {
//     connectionString: getConnectionString(),
//   },
//   searchPath: ["public", "information_schema"],
//   pool: { min: 0, max: 7 },
// });
