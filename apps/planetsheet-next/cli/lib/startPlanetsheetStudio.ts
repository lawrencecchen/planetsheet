import path from "node:path";
import fs from "node:fs";
import dotenv from "dotenv";
import {
  getConnectionString,
  getConnectionWithHeuristics,
} from "@/backend/utils/db";

dotenv.config();
export function startPlanetsheetStudio() {
  const cliDir = path.dirname(fs.realpathSync(__filename));

  function assertConnectionString() {
    const searchEnvVars = ["DATABASE_URL", "PG_CONNECTION_STRING"];
    for (const envVar of searchEnvVars) {
      if (process.env[envVar]) {
        console.log(`Using environment variable: ${envVar}`);
        return process.env[envVar];
      }
    }
    console.error(
      `No connection string found. Please set one of the following environment variables: ${searchEnvVars.join(
        ", "
      )}`
    );
    process.exit(1);
  }

  assertConnectionString();

  function startServer() {
    const serverDir = path.join(cliDir, "./server.js");

    if (!fs.existsSync(serverDir)) {
      console.error(`Server file not found: ${serverDir}`);
      process.exit(1);
    }

    const port = process.env.PORT || String(58337);
    const serverSource = fs
      .readFileSync(serverDir, "utf8")
      .replace("3000", port);
    try {
      // Kinda hacky, but it works.
      const runServer = new Function(
        "__dirname",
        "require",
        `(() => {\n${serverSource}\n})()`
      );

      runServer(__dirname, require);
    } catch (e) {
      console.error(e);
    }
    console.log(`Open Planetsheet: http://localhost:${port}/app/db`);
  }

  const connectionString = getConnectionString();
  if (!connectionString) {
    console.error("No connection string found.");
    process.exit(1);
  }

  try {
    getConnectionWithHeuristics(connectionString).then((connection) => {
      globalThis.__planetsheetConnection = connection;
      startServer();
    });
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
