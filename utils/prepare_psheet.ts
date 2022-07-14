import fse, { existsSync } from "fs-extra";
import path from "node:path";

const nextAppDir = path.resolve(".next");
const targetAppDir = path.resolve("./cli/.next");

if (!existsSync(nextAppDir)) {
  throw new Error(
    "Next.js app directory not found. You must run the `next build` step first."
  );
}

fse.copySync(nextAppDir, targetAppDir);

const cliDir = path.resolve("./cli");
const psheetDir = path.resolve("./psheet/cli");

fse.copySync(cliDir, psheetDir);

const planetsheetVersion = require("../package.json").version;
const psheetPackageJson = path.resolve("./psheet/package.json");
const psheetPackageJsonContent = fse.readJsonSync(psheetPackageJson);
psheetPackageJsonContent.version = planetsheetVersion;
fse.writeJsonSync(psheetPackageJson, psheetPackageJsonContent, { spaces: 2 });

console.log("Done!");
