import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const requiredDirs = [
  'src/app',
  'src/elements',
  'src/components',
  'src/features',
  'src/services',
  'src/store',
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(path.resolve(rootDir, dir))) {
    console.error(`Missing required architecture directory: ${dir}`);
    process.exit(1);
  }
}

console.log('OK: client-app modular architecture verified.');
