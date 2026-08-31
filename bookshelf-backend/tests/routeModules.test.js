import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

/**
 * Every router file loads.
 */
const routesDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  'routes'
);

const routeFiles = (await readdir(routesDir))
  .filter((name) => name.endsWith('.js'))
  .sort();

describe('route modules', () => {
  it('finds the routers on disk', () => {
    assert.ok(routeFiles.length > 0, 'no route files found');
  });

  for (const file of routeFiles) {
    it(`${file} imports cleanly and default-exports a router`, async () => {
      const fullPath = path.join(routesDir, file);
      const module = await import(pathToFileURL(fullPath).href);

      assert.ok(module.default, `${file} has no default export`);
      // An Express router is a function with a .stack of layers.
      assert.equal(typeof module.default, 'function', `${file} does not export a router`);
      assert.ok(Array.isArray(module.default.stack), `${file} is not an Express router`);
    });
  }
});
