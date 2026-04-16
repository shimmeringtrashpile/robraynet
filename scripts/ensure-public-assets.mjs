import { cpSync, existsSync, mkdirSync, readdirSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = join(root, "public");

function copyDirIfPresent(relFrom, relTo) {
  const src = join(root, relFrom);
  const dest = join(publicDir, relTo);
  if (!existsSync(src)) return;
  mkdirSync(join(dest, ".."), { recursive: true });
  cpSync(src, dest, { recursive: true });
}

mkdirSync(publicDir, { recursive: true });

copyDirIfPresent("images", "images");

const cssNames = readdirSync(root).filter((f) => f.startsWith("styles") && f.endsWith(".css"));
for (const name of cssNames) {
  copyFileSync(join(root, name), join(publicDir, name));
}

for (const name of ["include-footer.js"]) {
  const p = join(root, name);
  if (existsSync(p)) copyFileSync(p, join(publicDir, name));
}
