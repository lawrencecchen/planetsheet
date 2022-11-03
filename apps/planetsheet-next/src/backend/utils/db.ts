import dotenv from "dotenv";
import knex from "knex";
import invariant from "tiny-invariant";

export function getConnectionString() {
  dotenv.config();
  const searchEnvVars = ["DATABASE_URL", "PG_CONNECTION_STRING"];
  for (const envVar of searchEnvVars) {
    if (process.env[envVar]) {
      return process.env[envVar];
    }
  }
  throw new Error(
    `No connection string found. Please set one of the following environment variables: ${searchEnvVars.join(
      ", "
    )}`
  );
}

export function getConnection(connectionString: string) {
  if (globalThis.__planetsheetConnection) {
    return globalThis.__planetsheetConnection;
  }
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

function connectionStringSSLHeuristic(connectionString: string) {
  const url = new URL(connectionString);
  if (connectionString?.includes("postgres")) {
    url.searchParams.set("sslmode", "require");
    return url.toString();
  }

  if (connectionString?.includes("mysql")) {
    url.searchParams.set("ssl", "true");
    return url.toString();
  }
  return connectionString;
}

const connectionStringHeuristics: Array<(connectionString: string) => string> =
  [
    (connectionString) => connectionString,
    (connectionString) => connectionStringSSLHeuristic(connectionString),
  ];

export async function getConnectionWithHeuristics(
  connectionString: string,
  iTry = 0,
  iMax = connectionStringHeuristics.length
): Promise<ReturnType<typeof getConnection>> {
  if (iTry === iMax) {
    throw new Error("Could not connect to database.");
  }
  const _connectionString = connectionStringHeuristics[iTry](connectionString);
  const _connection = getConnection(_connectionString);
  try {
    await _connection.raw("select 1+1 as result");
    return _connection;
  } catch (e) {
    _connection.destroy();
    return getConnectionWithHeuristics(connectionString, iTry + 1, iMax);
  }
}

export async function testConnection(connectionString: string) {
  let success = false;
  try {
    const connection = getConnection(connectionString);
    const result = await connection.raw("SELECT 1");
    connection.destroy();
    if (result.length === 0) {
      success = false;
    } else {
      success = true;
    }
  } catch (e) {
    console.error(e);
    success = false;
  }
  return success;
}

const connectionString = getConnectionString();

invariant(connectionString, "No connection string found.");

export const db = getConnection(connectionString);
