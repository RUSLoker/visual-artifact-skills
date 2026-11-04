import { createServer } from "node:http";
import { readFile, readdir, mkdir, rename, writeFile, realpath, rm, stat } from "node:fs/promises";
import { resolve, join, dirname, relative, isAbsolute, sep } from "node:path";
import { randomUUID } from "node:crypto";
import { parseArgs } from "node:util";

const packageRoot = resolve(import.meta.dirname, "../../..");
const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const revisionPattern = /^\d{13}-[a-f0-9]{8}$/;
const policy = "default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline'; img-src data:; font-src data:; connect-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'";

class InputError extends Error {}

function escapeHtml(text) {
  return text.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function validSlug(value) {
  return typeof value === "string" && value.length <= 80 && slugPattern.test(value);
}

async function storePath() {
  const configured = process.env.ARTIFACTS_DIR;
  if (!configured || !isAbsolute(configured)) throw new InputError("ARTIFACTS_DIR must be an absolute path outside the package.");
  await mkdir(configured, { recursive: true });
  const store = await realpath(configured);
  const root = await realpath(packageRoot);
  const fromPackage = relative(root, store);
  if (fromPackage === "" || (fromPackage !== ".." && !fromPackage.startsWith(`..${sep}`) && !isAbsolute(fromPackage))) {
    throw new InputError("The artifact store must be outside the package.");
  }
  for (let directory = store; ; directory = dirname(directory)) {
    try {
      await stat(join(directory, ".git"));
      throw new InputError("The artifact store must be outside Git working trees.");
    } catch (error) {
      if (!(error instanceof Error && error.code === "ENOENT")) throw error;
    }
    if (dirname(directory) === directory) break;
  }
  return store;
}

async function containedFile(store, path) {
  const actual = await realpath(path);
  const fromStore = relative(store, actual);
  if (fromStore.startsWith("..") || isAbsolute(fromStore)) throw new InputError("Path leaves the artifact store.");
  return actual;
}

async function entries(store) {
  const records = [];
  for (const slug of await readdir(store, { withFileTypes: true })) {
    if (!slug.isDirectory() || !validSlug(slug.name)) continue;
    for (const revision of await readdir(join(store, slug.name), { withFileTypes: true })) {
      if (!revision.isDirectory() || !revisionPattern.test(revision.name)) continue;
      const file = await containedFile(store, join(store, slug.name, revision.name, "meta.json"));
      const record = JSON.parse(await readFile(file, "utf8"));
      if (typeof record.title !== "string" || typeof record.createdAt !== "string") {
        throw new InputError("Invalid artifact metadata.");
      }
      records.push({ slug: slug.name, revision: revision.name, title: record.title, createdAt: record.createdAt });
    }
  }
  return records.sort((a, b) => b.revision.localeCompare(a.revision));
}

async function publish(input, slug, title) {
  if (!input || !validSlug(slug) || !title?.trim()) {
    throw new InputError("publish INPUT.html --slug lowercase-id --title TITLE");
  }
  const base = new URL(process.env.ARTIFACTS_BASE_URL ?? "");
  if (!["http:", "https:"].includes(base.protocol) || base.username || base.password || base.search || base.hash || base.pathname !== "/") {
    throw new InputError("ARTIFACTS_BASE_URL must be an http(s) origin without credentials, path or query.");
  }
  const html = await readFile(input);
  const store = await storePath();
  const parent = join(store, slug);
  await mkdir(parent, { recursive: true });
  await containedFile(store, parent);
  const revision = `${Date.now()}-${randomUUID().slice(0, 8)}`;
  const staging = join(parent, `.staging-${randomUUID()}`);
  await mkdir(staging);
  try {
    await writeFile(join(staging, "index.html"), html, { flag: "wx" });
    await writeFile(join(staging, "meta.json"), JSON.stringify({ title: title.trim(), createdAt: new Date().toISOString() }), { flag: "wx" });
    await rename(staging, join(parent, revision));
  } finally {
    await rm(staging, { recursive: true, force: true });
  }
  console.log(JSON.stringify({
    latest: new URL(`/a/${slug}/`, base).href,
    revision: new URL(`/a/${slug}/${revision}/`, base).href,
  }));
}

function catalogue(records) {
  const groups = Map.groupBy(records, record => record.slug);
  const items = [...groups].map(([slug, versions]) => {
    const latest = versions[0];
    const history = versions.map(item =>
      `<li><a href="/a/${slug}/${item.revision}/"><time>${escapeHtml(item.createdAt)}</time></a></li>`).join("");
    return `<li><h2><a href="/a/${slug}/">${escapeHtml(latest.title)}</a></h2><details><summary>Versions (${versions.length})</summary><ol>${history}</ol></details></li>`;
  }).join("");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light dark"><title>Artifacts</title><style>
    :root{color-scheme:light dark;font:18px/1.6 system-ui,sans-serif}
    body{max-width:60rem;margin:auto;padding:clamp(1rem,4vw,3rem);overflow-wrap:anywhere}
    h1{font-size:2rem;line-height:1.2}h2{font-size:1.25rem;line-height:1.4}
    body>ul{list-style:none;padding:0}body>ul>li{margin-block:2rem}
    a,summary{display:inline-block;padding-block:.5rem}a:focus-visible,summary:focus-visible{outline:3px solid;outline-offset:3px}
    details ol{padding-left:1.5rem}time{font-variant-numeric:tabular-nums}
    </style></head><body><h1>Artifacts</h1>${records.length ? `<ul>${items}</ul>` : "<p>No artifacts published yet.</p>"}</body></html>`;
}

async function serve() {
  const store = await storePath();
  const port = Number(process.env.PORT ?? "29004");
  if (!Number.isInteger(port) || port < 0 || port > 65535) throw new InputError("PORT must be an integer between 0 and 65535.");
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Security-Policy", policy);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Cache-Control", "no-store");
    if (!["GET", "HEAD"].includes(req.method)) {
      res.writeHead(405, { Allow: "GET, HEAD" }).end();
      return;
    }
    try {
      const pathname = req.url.split("?")[0];
      if (pathname === "/") {
        const html = catalogue(await entries(store));
        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
        return;
      }
      const match = /^\/a\/([^/]+)\/(?:([^/]+)\/)?$/.exec(pathname);
      if (!match || !validSlug(match[1]) || (match[2] && !revisionPattern.test(match[2]))) {
        res.writeHead(404).end();
        return;
      }
      const [, slug, revision] = match;
      if (!revision) {
        const latest = (await entries(store)).find(item => item.slug === slug);
        if (!latest) { res.writeHead(404).end(); return; }
        res.writeHead(302, { Location: `/a/${slug}/${latest.revision}/` }).end();
        return;
      }
      const file = await containedFile(store, join(store, slug, revision, "index.html"));
      const html = await readFile(file);
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" }).end(html);
    } catch (error) {
      if (error instanceof InputError || (error instanceof Error && error.code === "ENOENT")) {
        res.writeHead(404).end();
        return;
      }
      console.error("Artifact request failed:", error instanceof Error ? error.name : "unknown error");
      res.writeHead(500).end();
    }
  });
  server.listen(port, process.env.HOST ?? "127.0.0.1", () => {
    console.log(JSON.stringify({ listening: server.address() }));
  });
  process.once("SIGTERM", () => server.close());
  process.once("SIGINT", () => server.close());
}

const { positionals, values } = parseArgs({
  allowPositionals: true,
  options: { slug: { type: "string" }, title: { type: "string" } },
});
try {
  switch (positionals[0]) {
    case "publish": await publish(positionals[1], values.slug, values.title); break;
    case "serve": await serve(); break;
    default: throw new InputError("Use publish INPUT.html --slug ID --title TITLE, or serve.");
  }
} catch (error) {
  if (!(error instanceof Error)) throw error;
  console.error(`${error.name}: ${error.message}`);
  process.exitCode = 1;
}
