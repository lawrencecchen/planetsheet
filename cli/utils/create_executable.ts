// @ts-check
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

console.log("Done!");
