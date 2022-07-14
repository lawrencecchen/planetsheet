import fse, { existsSync } from "fs-extra";
import path from "node:path";
import planetsheetPackageJson from "../package.json";

const psheetDeps = ["next", "dotenv", "minimist"];

const nextAppDir = path.resolve(".next");
const targetAppDir = path.resolve("./cli/.next");

if (!existsSync(nextAppDir)) {
  throw new Error(
    "Next.js app directory not found. You must run the `next build` step first."
  );
}

fse.copySync(nextAppDir, targetAppDir);

const cliDir = path.resolve("./cli");
const distDir = path.resolve("./psheet/dist");

fse.copySync(cliDir, distDir);

const planetsheetVersion = planetsheetPackageJson.version;
const psheetPackageJson = path.resolve("./psheet/package.json");

// Update psheet package.json with the current version
const psheetPackageJsonContent = fse.readJsonSync(psheetPackageJson);
psheetPackageJsonContent.version = planetsheetVersion;

// Write required dependencies to psheet package.json
for (const dep of psheetDeps) {
  const depVersion = planetsheetPackageJson.dependencies[dep];
  psheetPackageJsonContent.dependencies[dep] = depVersion;
}

fse.writeJsonSync(psheetPackageJson, psheetPackageJsonContent, { spaces: 2 });

console.log("Done!");
