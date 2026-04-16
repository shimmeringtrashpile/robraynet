/**
 * One-time (or repeat) migration: read legacy root + blog HTML files,
 * write src/page-html/* (rewritten body) and matching src/pages/*.astro shells.
 *
 * Usage: node scripts/generate-from-html.mjs [--delete-source]
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  unlinkSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const deleteSource = process.argv.includes("--delete-source");

const SKIP_ROOT_HTML = new Set(["footer.html"]);

/** @returns {string[]} */
function discoverHtmlFiles() {
  const out = [];
  for (const name of readdirSync(root)) {
    if (name.endsWith(".html") && !SKIP_ROOT_HTML.has(name)) out.push(name);
  }
  const blog = join(root, "blog", "index.html");
  if (existsSync(blog)) out.push("blog/index.html");
  return out.sort();
}

/**
 * @param {string} head
 * @returns {string[]}
 */
function extractStylesheets(head) {
  const hrefs = [];
  const re = /<link[^>]+rel=["']stylesheet["'][^>]*>/gi;
  let m;
  while ((m = re.exec(head))) {
    const tag = m[0];
    const hm = tag.match(/href\s*=\s*(["'])([^"']*)\1/i);
    if (!hm) continue;
    let href = hm[2].trim();
    if (href.startsWith("http://") || href.startsWith("https://")) continue;
    href = href.replace(/^\.\//, "").replace(/^\.\.\//, "");
    href = href.split("?")[0].trim();
    if (!href.endsWith(".css")) continue;
    const base = href.split("/").pop();
    hrefs.push(`/${base}`);
  }
  return [...new Set(hrefs)];
}

/**
 * @param {string} html
 */
function extractTitle(html) {
  const m = html.match(/<title>([\s\S]*?)<\/title>/i);
  return m ? m[1].trim() : "Rob Ray";
}

/**
 * @param {string} html
 */
function extractHead(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : "";
}

/**
 * @param {string} html
 */
function extractBody(html) {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return m ? m[1].trim() : "";
}

/**
 * @param {string} body
 * @param {string} fileRel e.g. radio.html or blog/index.html
 */
function rewriteBody(body, fileRel) {
  const isBlog = fileRel.startsWith("blog/");

  /** @param {string} rawRef */
  function mapHref(rawRef) {
    const trimmed = rawRef.trim();
    const hashIdx = trimmed.indexOf("#");
    const hash = hashIdx >= 0 ? trimmed.slice(hashIdx) : "";
    let pathPart = hashIdx >= 0 ? trimmed.slice(0, hashIdx) : trimmed;
    if (!pathPart) return hash || trimmed;
    if (
      pathPart.startsWith("http://") ||
      pathPart.startsWith("https://") ||
      pathPart.startsWith("mailto:") ||
      pathPart.startsWith("javascript:") ||
      pathPart.startsWith("//")
    ) {
      return trimmed;
    }
    if (pathPart.startsWith("/")) return trimmed;
    if (pathPart.startsWith("../")) pathPart = pathPart.slice(3);
    if (pathPart.startsWith("./")) pathPart = pathPart.slice(2);
    if (!/\.html$/i.test(pathPart)) return trimmed;
    const noHtml = pathPart.replace(/\.html$/i, "");
    if (noHtml === "index" || pathPart.toLowerCase() === "index.html") {
      return `/${hash}`;
    }
    return `/${noHtml}/${hash}`;
  }

  /** @param {string} rawRef */
  function mapSrc(rawRef) {
    const ref = rawRef.trim();
    if (ref.startsWith("http://") || ref.startsWith("https://") || ref.startsWith("data:") || ref.startsWith("//")) {
      return rawRef;
    }
    if (ref.startsWith("/")) return rawRef;
    if (ref.startsWith("../images/")) return `/images/${ref.slice(11)}`;
    if (ref.startsWith("images/")) return `/images/${ref.slice(7)}`;
    if (isBlog && ref.startsWith("images/")) return `/images/${ref.slice(7)}`;
    return rawRef;
  }

  let out = body.replace(/\bhref\s*=\s*(["'])([^"']*)\1/gi, (_, q, ref) => `href=${q}${mapHref(ref)}${q}`);
  out = out.replace(/\bsrc\s*=\s*(["'])([^"']*)\1/gi, (_, q, ref) => `src=${q}${mapSrc(ref)}${q}`);
  return out;
}

/**
 * @param {string} fileRel
 */
function astroRelFromSrcPages(fileRel) {
  if (fileRel === "index.html") return "index.astro";
  const parts = fileRel.split("/");
  if (parts.length === 1) return fileRel.replace(/\.html$/, ".astro");
  const last = parts[parts.length - 1].replace(/\.html$/, ".astro");
  return [...parts.slice(0, -1), last].join("/");
}

/**
 * @param {string} fileRel
 */
function fragmentImportSpecifier(fileRel) {
  const astroRel = astroRelFromSrcPages(fileRel);
  const depth = astroRel.split("/").length;
  const prefix = "../".repeat(depth);
  return `${prefix}page-html/${fileRel}?raw`;
}

/**
 * @param {string} fileRel
 */
function runOne(fileRel) {
  const abs = join(root, fileRel);
  const rawHtml = readFileSync(abs, "utf8");
  const head = extractHead(rawHtml);
  const title = extractTitle(rawHtml);
  let styles = extractStylesheets(head);
  if (styles.length === 0) styles = ["/styles.css"];

  const body = rewriteBody(extractBody(rawHtml), fileRel);

  const fragPath = join(root, "src", "page-html", fileRel);
  mkdirSync(dirname(fragPath), { recursive: true });
  writeFileSync(fragPath, body, "utf8");

  const astroRel = astroRelFromSrcPages(fileRel);
  const astroPath = join(root, "src", "pages", astroRel);
  mkdirSync(dirname(astroPath), { recursive: true });

  const imp = fragmentImportSpecifier(fileRel);
  const stylesLiteral = `[${styles.map((s) => JSON.stringify(s)).join(", ")}]`;

  const layoutDepth = astroRel.split("/").length;
  const layoutPrefix = "../".repeat(layoutDepth);
  const layoutImport = `${layoutPrefix}layouts/BaseLayout.astro`;

  const content = `---
import BaseLayout from "${layoutImport}";
import body from "${imp}";

const title = ${JSON.stringify(title)};
const stylesheets = ${stylesLiteral};
---

<BaseLayout title={title} stylesheets={stylesheets}>
  <Fragment set:html={body} />
</BaseLayout>
`;

  writeFileSync(astroPath, content, "utf8");
  console.log("wrote", relative(root, astroPath), "<-", fileRel);
}

function main() {
  const files = discoverHtmlFiles();
  if (files.length === 0) {
    console.error("No legacy HTML files found at repo root.");
    process.exit(1);
  }

  const pageHtmlRoot = join(root, "src", "page-html");
  if (existsSync(pageHtmlRoot)) {
    rmSync(pageHtmlRoot, { recursive: true });
  }
  const pagesRoot = join(root, "src", "pages");
  if (existsSync(pagesRoot)) {
    rmSync(pagesRoot, { recursive: true });
  }
  mkdirSync(join(root, "src", "layouts"), { recursive: true });

  for (const f of files) {
    runOne(f);
  }

  if (deleteSource) {
    for (const f of files) {
      unlinkSync(join(root, f));
      console.log("removed", f);
    }
  }

  console.log(`Done. ${files.length} pages.`);
}

main();
