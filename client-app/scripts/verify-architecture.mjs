import fs from 'fs';
import path from 'path';

const requiredDirs = [
  'src/app',
  'src/components',
  'src/features',
  'src/services',
  'src/store',
];

for (const dir of requiredDirs) {
  if (!fs.existsSync(path.resolve(process.cwd(), dir))) {
    console.error(`Missing required architecture directory: ${dir}`);
    process.exit(1);
  }
}

console.log('OK: client-app modular architecture verified.');
