// libs/runMeta.ts
import fs from 'fs';
import path from 'path';

const metaPath = path.resolve(__dirname, '../run-meta.json');

if (!fs.existsSync(metaPath)) {
  throw new Error(`run-meta.json not found. Did you forget to run globalSetup?`);
}

export const runMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
