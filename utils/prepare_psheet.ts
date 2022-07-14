import fse, { existsSync } from "fs-extra";
import path from "node:path";
import planetsheetPackageJson from "../package.json";

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
const planetsheetNextVersion = planetsheetPackageJson.dependencies["next"];

const psheetPackageJson = path.resolve("./psheet/package.json");
const psheetPackageJsonContent = fse.readJsonSync(psheetPackageJson);
psheetPackageJsonContent.version = planetsheetVersion;
psheetPackageJsonContent.dependencies["next"] = planetsheetNextVersion;
fse.writeJsonSync(psheetPackageJson, psheetPackageJsonContent, { spaces: 2 });

console.log("Done!");
