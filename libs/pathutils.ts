// libs/pathUtils.ts
import fs from 'fs';
import path from 'path';

const meta = JSON.parse(fs.readFileSync(path.join(__dirname, '../run-meta.json'), 'utf8'));

export const screenshotsDir = path.join(meta.baseDir, 'screenshots');
export const downloadsDir = path.join(meta.baseDir, 'downloads');
// add more as needed
