import { readdir, readFile, access } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { spawnSync } from "node:child_process";

async function walk(directory) {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) result.push(...(await walk(path)));
    else result.push(path);
  }
  return result;
}

let count = 0;
for (const file of [...(await walk("src")), ...(await walk("scripts"))]) {
  if (!/\.m?js$/.test(file)) continue;
  const result = spawnSync(process.execPath, ["--check", file], {
    encoding: "utf8",
  });
  if (result.status !== 0) throw new Error(result.stderr);
  const text = await readFile(file, "utf8");
  for (const match of text.matchAll(
    /(?:from\s+|import\s*\()(['"])(\.[^'"]+)\1/g,
  ))
    await access(resolve(dirname(file), match[2]));
  for (const match of text.matchAll(
    /new URL\((['"])(\.\.[^'"]+)\1, import\.meta\.url\)/g,
  ))
    await access(resolve(dirname(file), match[2]));
  count++;
}
console.log(
  `Checked syntax, module imports, and local assets in ${count} source files.`,
);
