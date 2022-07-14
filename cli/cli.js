#!/usr/bin/env node

console.log(`Planetsheet v${require("../package.json").version}`);

// const argv = require("minimist")(process.argv.slice(2));
// const dir = argv.dir || "dist";
const dir = "dist";

const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const hostname = "localhost";
const port = 58337;
// when using middleware `hostname` and `port` must be provided below
const app = next({ hostname, port, dir });
const handle = app.getRequestHandler();

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

app
  .prepare()
  .then(() => {
    createServer(async (req, res) => {
      try {
        // Be sure to pass `true` as the second argument to `url.parse`.
        // This tells it to parse the query portion of the URL.
        const parsedUrl = parse(req.url, true);
        const { pathname, query } = parsedUrl;

        await handle(req, res, parsedUrl);
      } catch (err) {
        console.error("Error occurred handling", req.url, err);
        res.statusCode = 500;
        res.end("internal server error");
      }
    }).listen(port, (err) => {
      if (err) throw err;
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((err) => console.error(err));
