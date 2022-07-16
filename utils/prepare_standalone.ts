import fse, { existsSync } from "fs-extra";
import path from "node:path";
import planetsheetPackageJson from "../package.json";
import esbuild from "esbuild";

async function main() {
  const cliFile = path.resolve("./cli/cli.ts");
  const nextStandaloneDir = path.resolve(".next/standalone");
  const nextStaticDir = path.resolve(".next/static");
  const distDir = path.resolve("./psheet/dist");
  const psheetPackageJson = path.resolve("./psheet/package.json");

  if (!existsSync(nextStandaloneDir)) {
    throw new Error(
      'Next.js standalone directory not found. You must run the `next build` step first with `output: "standalone"` enabled in next.config.js.'
    );
  }

  fse.rmSync(distDir, { recursive: true, force: true });

  const filterFunc: fse.CopyFilterSync = (src, dest) => {
    if (src.endsWith(".env")) {
      return false;
    }
    return true;
  };
  fse.copySync(nextStandaloneDir, distDir, { filter: filterFunc });
  // By default, the standalone server does not copy the public or .next/static folders
  // https://nextjs.org/docs/advanced-features/output-file-tracing
  fse.copySync(nextStaticDir, path.resolve(distDir, "public"));
  fse.copySync(nextStaticDir, path.resolve(distDir, ".next/static"));

  await esbuild.build({
    entryPoints: [cliFile],
    outfile: path.resolve(distDir, "cli.js"),
    bundle: true,
    external: ["./node_modules/*"],
    platform: "node",
    target: "node12",
    format: "cjs",
  });
  console.log("Successfully built cli.js");

  const planetsheetVersion = planetsheetPackageJson.version;
  // Update psheet package.json with the current version
  const psheetPackageJsonContent = fse.readJsonSync(psheetPackageJson);
  psheetPackageJsonContent.version = planetsheetVersion;

  fse.writeJsonSync(psheetPackageJson, psheetPackageJsonContent, { spaces: 2 });

  console.log("Done!");
}
main();
