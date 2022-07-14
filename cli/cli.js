#!/usr/bin/env node

const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

console.log(`Planetsheet v${require("../package.json").version}`);
require("dotenv").config();
const cliDir = path.dirname(fs.realpathSync(__filename));

function assertConnectionString() {
  const searchEnvVars = ["DATABASE_URL", "PG_CONNECTION_STRING"];
  for (const envVar of searchEnvVars) {
    if (process.env[envVar]) {
      console.log(`Using ${envVar}`);
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

const serverDir = path.join(cliDir, "./server.js");

if (!fs.existsSync(serverDir)) {
  console.error(`Server file not found: ${serverDir}`);
  process.exit(1);
}

const port = process.env.PORT || 58337;
const serverSource = fs.readFileSync(serverDir, "utf8").replace("3000", port);

(() => {
  try {
    // Kinda hacky, but it works.
    eval(serverSource);
  } catch (e) {
    console.error(e);
  }
  console.log(`Open Planetsheet: http://localhost:${port}/app/db`);
})();

// const next = require("next");
// // Force production to make Next.js happy.
// process.env.NODE_ENV = "production";

// // const argv = require("minimist")(process.argv.slice(2));
// // // Get the directory where this script (cli.js) is located.
// // const dir = argv.dir || cliDir;

// const hostname = "localhost";
// const port = 58337;
// // when using middleware `hostname` and `port` must be provided below
// const app = next({ hostname, port, dev: false });
// const handle = app.getRequestHandler();

// app
//   .prepare()
//   .then(() => {
//     createServer(async (req, res) => {
//       try {
//         // Be sure to pass `true` as the second argument to `url.parse`.
//         // This tells it to parse the query portion of the URL.
//         const parsedUrl = parse(req.url, true);
//         const { pathname, query } = parsedUrl;

//         await handle(req, res, parsedUrl);
//       } catch (err) {
//         console.error("Error occurred handling", req.url, err);
//         res.statusCode = 500;
//         res.end("internal server error");
//       }
//     }).listen(port, (err) => {
//       if (err) throw err;
//       console.log(`> Ready on http://${hostname}:${port}`);
//     });
//   })
//   .catch((err) => console.error(err));
