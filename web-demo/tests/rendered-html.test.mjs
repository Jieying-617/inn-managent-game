import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("renders real floor and object state instead of a fixed scene image", async () => {
  const [page, css] = await Promise.all([
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/globals.css", root), "utf8"),
  ]);

  assert.doesNotMatch(page, /shanghai-villa-build-mode|className="villa-art"/);
  assert.match(page, /useState<Set<string>>/);
  assert.match(page, /floorTiles/);
  assert.match(page, /objects/);
  assert.match(page, /floor-oak/);
  assert.match(page, /bed-sprite/);
  assert.match(page, /plant-sprite/);
  assert.match(css, /\.room-grid\s*\{[^}]*display:grid/);
  assert.match(css, /\.room-cell\s*\{[^}]*aspect-ratio:1/);
  assert.doesNotMatch(css, /\.room-cell\s*\{[^}]*rotate\(/);
});
