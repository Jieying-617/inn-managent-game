import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("uses a clear square foundation grid with a visible next action", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.match(page, /className="build-grid"/);
  assert.match(page, /className={`build-cell/);
  assert.match(page, /第 1 步：点地板/);
  assert.match(page, /第 2 步：点绿色格子/);
  assert.match(page, /点这里铺设/);
  assert.match(css, /\.build-grid\s*\{[^}]*display:grid/);
  assert.match(css, /\.build-cell\s*\{[^}]*aspect-ratio:1/);
  assert.doesNotMatch(css, /\.build-cell\s*\{[^}]*rotate\(45deg\)/);
});
