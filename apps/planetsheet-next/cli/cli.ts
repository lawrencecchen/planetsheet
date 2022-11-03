#!/usr/bin/env node

import { getConnectionString } from "@/backend/utils/db";
import { exec, spawn } from "node:child_process";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import planetsheetPackageJson from "../package.json";
import { startPlanetsheetStudio } from "./lib/startPlanetsheetStudio";

yargs(hideBin(process.argv))
  .command(
    "$0",
    "Launch Planetsheet studio",
    () => {},
    () => {
      console.log(`Planetsheet v${planetsheetPackageJson.version}`);
      startPlanetsheetStudio();
    }
  )
  .command(
    "psql",
    "Launch `psql` using your .env DATABASE_URL.",
    () => {},
    (argv) => {
      const connectionString = getConnectionString();
      console.log(connectionString);
      const child = spawn(`psql "${connectionString}"`, [], {
        cwd: process.cwd(),
        detached: true,
        stdio: "inherit",
        // detached: true,
        // stdio: ["ignore", 1, 2],
      });
      child.unref();
      // exec(`psql ${connectionString}`, {});
      // console.info("psql", argv);
    }
  )
  .demandCommand(1)
  .parse();
