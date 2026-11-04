import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, readFile, rm, symlink, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn, execFile } from "node:child_process";
import { promisify } from "node:util";
import { once } from "node:events";
import { createInterface } from "node:readline";
import { request } from "node:http";

const execute = promisify(execFile);
const root = resolve(import.meta.dirname, "..");
const script = join(root, "skills/hosted-artifacts/scripts/artifacts.mjs");

async function fixture(t) {
  const path = await mkdtemp(join(tmpdir(), "agent-skills-test-"));
  const env = { ...process.env, ARTIFACTS_DIR: join(path, "store"), ARTIFACTS_BASE_URL: "http://example.test:29004", HOST: "127.0.0.1", PORT: "0" };
  t.after(() => rm(path, { recursive: true, force: true }));
  const input = join(path, "input.html");
  await writeFile(input, "<!doctype html><title>First</title><p>First revision</p>");
  return { path, env, input };
}

async function publish(f, extra = {}) {
  const result = await execute(process.execPath, [script, "publish", f.input, "--slug", "report", "--title", '<Report & "notes">'], { env: { ...f.env, ...extra } });
  return JSON.parse(result.stdout);
}

async function server(t, f) {
  const child = spawn(process.execPath, [script, "serve"], { env: f.env, stdio: ["ignore", "pipe", "pipe"] });
  const lines = createInterface({ input: child.stdout });
  t.after(async () => {
    lines.close();
    if (child.exitCode === null) {
      const stopped = once(child, "exit");
      child.kill("SIGTERM");
      await stopped;
    }
  });
  const ready = await Promise.race([
    once(lines, "line"),
    once(child, "exit").then(([code]) => { throw new Error(`Server exited before listening: ${code}`); }),
  ]);
  return `http://127.0.0.1:${JSON.parse(ready[0]).listening.port}`;
}

test("publishes immutable revisions and updates the live latest URL", { timeout: 10000 }, async t => {
  const f = await fixture(t);
  const first = await publish(f);
  const base = await server(t, f);
  await writeFile(f.input, "<!doctype html><title>Second</title><p>Second revision</p>");
  const second = await publish(f);

  assert.equal(await (await fetch(base + new URL(first.revision).pathname)).text(), "<!doctype html><title>First</title><p>First revision</p>");
  assert.equal(await (await fetch(base + "/a/report/")).text(), "<!doctype html><title>Second</title><p>Second revision</p>");
  assert.notEqual(first.revision, second.revision);
  assert.equal(first.latest, "http://example.test:29004/a/report/");
});

test("catalogue escapes titles and links to every published revision", { timeout: 10000 }, async t => {
  const f = await fixture(t);
  const first = await publish(f);
  const second = await publish(f);
  const base = await server(t, f);

  const html = await (await fetch(base)).text();
  assert.ok(html.includes("&lt;Report &amp; &quot;notes&quot;&gt;"));
  assert.ok(html.includes(new URL(first.revision).pathname));
  assert.ok(html.includes(new URL(second.revision).pathname));
  assert.ok(!html.includes('<Report & "notes">'));
});

test("empty store returns a readable catalogue", { timeout: 10000 }, async t => {
  const f = await fixture(t);
  const base = await server(t, f);
  const response = await fetch(base);
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "text/html; charset=utf-8");
  assert.ok((await response.text()).includes("<h1>"));
});

for (const [method, path, status] of [
  ["GET", "/.env", 404],
  ["GET", "/a/unknown/", 404],
  ["GET", "/a/report/meta.json", 404],
  ["GET", "/a/%2e%2e/", 404],
  ["POST", "/", 405],
]) {
  test(`${method} ${path} returns ${status}`, { timeout: 10000 }, async t => {
    const f = await fixture(t);
    const base = await server(t, f);
    const actual = await new Promise((done, reject) => {
      request({ hostname: "127.0.0.1", port: new URL(base).port, path, method }, response => {
        response.resume();
        done(response.statusCode);
      }).on("error", reject).end();
    });
    assert.equal(actual, status);
  });
}

test("HEAD returns headers without a body and disables network/form connections", { timeout: 10000 }, async t => {
  const f = await fixture(t);
  await publish(f);
  const base = await server(t, f);
  const response = await fetch(base, { method: "HEAD" });
  assert.equal(response.status, 200);
  assert.equal(await response.text(), "");
  assert.match(response.headers.get("content-security-policy"), /connect-src 'none'/);
  assert.match(response.headers.get("content-security-policy"), /form-action 'none'/);
});

test("a symlinked page cannot expose files outside the store", { timeout: 10000 }, async t => {
  const f = await fixture(t);
  const published = await publish(f);
  const path = new URL(published.revision).pathname;
  const page = join(f.env.ARTIFACTS_DIR, ...path.split("/").slice(2).filter(Boolean), "index.html");
  await rm(page);
  await symlink(f.input, page);
  const base = await server(t, f);
  assert.equal((await fetch(base + path)).status, 404);
});

for (const [name, config] of [
  ["package store", { ARTIFACTS_DIR: root }],
  ["relative store", { ARTIFACTS_DIR: "artifacts" }],
  ["non-HTTP URL", { ARTIFACTS_BASE_URL: "file:///tmp/" }],
]) {
  test(`publication rejects ${name}`, async t => {
    const f = await fixture(t);
    await assert.rejects(publish(f, config), error => error.code === 1);
    assert.equal(await readFile(f.input, "utf8"), "<!doctype html><title>First</title><p>First revision</p>");
  });
}

test("publication rejects storage inside another Git working tree", async t => {
  const f = await fixture(t);
  await mkdir(join(f.path, "workspace", ".git"), { recursive: true });
  await assert.rejects(publish(f, { ARTIFACTS_DIR: join(f.path, "workspace", "data") }), error => error.code === 1);
});
