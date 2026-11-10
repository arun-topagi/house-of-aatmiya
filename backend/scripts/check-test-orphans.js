#!/usr/bin/env node
/**
 * Fails if:
 *  - a spec in test/unit/ has no matching source file in src/ (orphan), or
 *  - a *.spec.ts file exists under src/ (tests must live in test/unit/).
 *
 * Mapping: test/unit/<path>/<name>.spec.ts  ->  src/<path>/<name>.ts
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const srcDir = path.join(root, 'src');
const unitDir = path.join(root, 'test', 'unit');

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.name.endsWith('.spec.ts')) out.push(full);
  }
  return out;
}

const rel = (p) => path.relative(root, p).split(path.sep).join('/');

const orphans = walk(unitDir).filter((spec) => {
  const source = path
    .join(srcDir, path.relative(unitDir, spec))
    .replace(/\.spec\.ts$/, '.ts');
  return !fs.existsSync(source);
});
const misplaced = walk(srcDir);

if (orphans.length) {
  console.error('Orphan specs (no matching src file):');
  orphans.forEach((f) => console.error(`  - ${rel(f)}`));
}
if (misplaced.length) {
  console.error('Specs found under src/ (move them to test/unit/):');
  misplaced.forEach((f) => console.error(`  - ${rel(f)}`));
}
if (orphans.length || misplaced.length) process.exit(1);

console.log('OK: every spec in test/unit/ maps to a file in src/.');
