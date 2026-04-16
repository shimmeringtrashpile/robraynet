/**
 * After static build, emit root-level `*.html` stubs so old flat URLs
 * (e.g. /radio.html) resolve when mirroring `dist/` to R2.
 * Each stub meta-refreshes to the trailing-slash route (e.g. /radio/).
 */
import { readdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const site = (
  process.env.SITE ||
  process.env.PUBLIC_SITE_URL ||
  "https://robray.net"
).replace(/\/$/, "");

if (!existsSync(dist)) {
  console.warn("write-legacy-html-redirects: dist/ missing, skip");
  process.exit(0);
}

const entries = readdirSync(dist, { withFileTypes: true });
for (const ent of entries) {
  if (!ent.isDirectory()) continue;
  if (ent.name.startsWith("_")) continue;
  const inner = join(dist, ent.name, "index.html");
  if (!existsSync(inner)) continue;
  const slug = ent.name;
  const targetPath = `/${slug}/`;
  const targetUrl = `${site}${targetPath}`;
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Moved</title>
  <meta http-equiv="refresh" content="0;url=${targetPath}" />
  <link rel="canonical" href="${targetUrl}" />
</head>
<body>
  <p>This page has moved to <a href="${targetPath}">${targetPath}</a>.</p>
</body>
</html>
`;
  writeFileSync(join(dist, `${slug}.html`), html, "utf8");
}

console.log("Legacy *.html redirect stubs written next to each /slug/ folder.");
