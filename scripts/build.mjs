import { cp, mkdir, rm } from "node:fs/promises";
import { resolve } from "node:path";

const output = resolve("dist");
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const path of ["index.html", ".nojekyll", "src", "assets", "vendor"]) {
  await cp(resolve(path), resolve(output, path), { recursive: true });
}
console.log(`Static site built: ${output}`);
